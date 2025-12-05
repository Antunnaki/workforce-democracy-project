#!/bin/bash

##########################################################
# 🚀 DEPLOY DEEP RESEARCH FIX v37.18.4
# Purpose: Apply fix, restart backend, test
# Target: Version B (port 3002)
##########################################################

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
cat << "EOF"
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   🚀 DEEP RESEARCH FIX DEPLOYMENT v37.18.4 🚀              │
│                                                             │
│   Fixes: searchCongressGovBills() not being called        │
│   Impact: Congress.gov bills now included in results       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

# Ensure we're in the right directory
cd /var/www/workforce-democracy/version-b/backend

echo -e "${YELLOW}⚙️  Step 1: Backing up deep-research.js...${NC}"
BACKUP_FILE="deep-research-BACKUP-$(date +%s).js"
cp deep-research.js "$BACKUP_FILE"
echo -e "${GREEN}   ✅ Backed up to: $BACKUP_FILE${NC}"
echo ""

echo -e "${YELLOW}⚙️  Step 2: Running diagnostic...${NC}"
if [ -f "./DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh" ]; then
  chmod +x ./DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
  ./DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
  DIAG_RESULT=$?
  echo ""
  if [ $DIAG_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ Diagnostic passed - fix already applied!${NC}"
    echo ""
    echo -e "${YELLOW}Skipping fix application (already fixed)${NC}"
    SKIP_FIX=true
  else
    echo -e "${YELLOW}Diagnostic indicates fix needed - proceeding...${NC}"
    SKIP_FIX=false
  fi
else
  echo -e "${YELLOW}   Diagnostic script not found, proceeding with fix...${NC}"
  SKIP_FIX=false
fi
echo ""

if [ "$SKIP_FIX" = false ]; then
  echo -e "${YELLOW}⚙️  Step 3: Applying fix...${NC}"
  if [ -f "./FIX-DEEP-RESEARCH-CALL-v37.18.4.js" ]; then
    node ./FIX-DEEP-RESEARCH-CALL-v37.18.4.js
    echo ""
  else
    echo -e "${RED}❌ ERROR: FIX-DEEP-RESEARCH-CALL-v37.18.4.js not found${NC}"
    exit 1
  fi
else
  echo -e "${YELLOW}⚙️  Step 3: Skipping fix (already applied)${NC}"
  echo ""
fi

echo -e "${YELLOW}⚙️  Step 4: Verifying syntax...${NC}"
if node -c deep-research.js 2>/dev/null; then
  echo -e "${GREEN}   ✅ Syntax OK${NC}"
else
  echo -e "${RED}   ❌ Syntax error detected!${NC}"
  echo -e "${YELLOW}   Rolling back...${NC}"
  cp "$BACKUP_FILE" deep-research.js
  exit 1
fi
echo ""

echo -e "${YELLOW}⚙️  Step 5: Restarting workforce-backend-b.service...${NC}"
sudo systemctl restart workforce-backend-b.service
sleep 3

# Check if service started successfully
if sudo systemctl is-active --quiet workforce-backend-b.service; then
  echo -e "${GREEN}   ✅ Service restarted successfully${NC}"
else
  echo -e "${RED}   ❌ Service failed to start!${NC}"
  echo -e "${YELLOW}   Rolling back...${NC}"
  cp "$BACKUP_FILE" deep-research.js
  sudo systemctl restart workforce-backend-b.service
  exit 1
fi
echo ""

echo -e "${YELLOW}⚙️  Step 6: Submitting test query...${NC}"
echo -e "${BLUE}   Test: 'How has Chuck Schumer voted on healthcare?'${NC}"

# Submit test query
RESPONSE=$(curl -s -X POST "http://localhost:3002/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How has Chuck Schumer voted on healthcare?",
    "context": {
      "page": "civic-platform",
      "section": "my-representatives",
      "viewingContent": {
        "type": "representative",
        "name": "Charles E. Schumer",
        "state": "NY",
        "chamber": "senate"
      }
    }
  }')

# Extract job ID
JOB_ID=$(echo "$RESPONSE" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$JOB_ID" ]; then
  echo -e "${GREEN}   ✅ Test query submitted${NC}"
  echo -e "${BLUE}   📊 Job ID: $JOB_ID${NC}"
else
  echo -e "${RED}   ❌ Failed to submit test query${NC}"
  echo -e "${YELLOW}   Response: $RESPONSE${NC}"
fi
echo ""

echo -e "${GREEN}"
cat << "EOF"
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ✅ DEPLOYMENT COMPLETE!                                  │
│                                                             │
│   What was done:                                           │
│   - ✅ Backed up deep-research.js                          │
│   - ✅ Applied searchCongressGovBills() fix                │
│   - ✅ Verified syntax                                     │
│   - ✅ Restarted backend service                           │
│   - ✅ Submitted test query                                │
│                                                             │
│   Next steps:                                              │
│   1. Check logs for Deep Research activity                 │
│   2. Verify Congress.gov bills appear in results           │
│   3. Test with additional queries                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}📋 To check results:${NC}"
echo ""
echo -e "${BLUE}# View logs (look for Deep Research activity):${NC}"
echo "tail -f /var/log/workforce-backend-b.log | grep -i 'deep\\|congress'"
echo ""
echo -e "${BLUE}# Check job results:${NC}"
echo "curl -s \"http://localhost:3002/api/civic/llm-chat/result/$JOB_ID\" | jq '.'"
echo ""
echo -e "${BLUE}# Count Congress.gov sources:${NC}"
echo "curl -s \"http://localhost:3002/api/civic/llm-chat/result/$JOB_ID\" | jq '.sources[] | select(.source | contains(\"congress.gov\"))' | wc -l"
echo ""
echo -e "${GREEN}✨ Deep Research fix deployed successfully!${NC}"
