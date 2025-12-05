#!/bin/bash

#################################################
# 🚀 DEPLOY CIVIC-LLM FIX v37.18.5
# For: Workforce Democracy Project Version B
# Port: 3002 (Testing)
#################################################

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
│   🚀 CIVIC-LLM FIX DEPLOYMENT v37.18.5                     │
│                                                             │
│   Fixing: aiService.generateResponse() bug                 │
│   Target: Version B (Testing - Port 3002)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

BACKEND_DIR="/var/www/workforce-democracy/version-b/backend"
SERVICE_NAME="workforce-backend-b.service"

# Step 1: Verify we're in the right directory
echo -e "${YELLOW}⚙️  Step 1: Verifying directory...${NC}"
cd "$BACKEND_DIR"
echo -e "${GREEN}   ✅ Current directory: $(pwd)${NC}"
echo ""

# Step 2: Diagnose current state
echo -e "${YELLOW}⚙️  Step 2: Running diagnosis...${NC}"
./DIAGNOSE-CIVIC-LLM-v37.18.5.sh || {
  echo -e "${BLUE}   📋 Fix needed - continuing...${NC}"
}
echo ""

# Step 3: Backup current file
echo -e "${YELLOW}⚙️  Step 3: Creating backup...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="civic-llm-async.js.backup-v37.18.5-${TIMESTAMP}"
cp civic-llm-async.js "$BACKUP_FILE"
echo -e "${GREEN}   ✅ Backup created: $BACKUP_FILE${NC}"
echo ""

# Step 4: Apply the fix
echo -e "${YELLOW}⚙️  Step 4: Applying fix...${NC}"
if [ ! -f "FIX-CIVIC-LLM-ASYNC-v37.18.5.js" ]; then
  echo -e "${RED}   ❌ ERROR: FIX-CIVIC-LLM-ASYNC-v37.18.5.js not found!${NC}"
  exit 1
fi

node FIX-CIVIC-LLM-ASYNC-v37.18.5.js

if [ $? -eq 0 ]; then
  echo -e "${GREEN}   ✅ Fix applied successfully${NC}"
else
  echo -e "${RED}   ❌ Fix failed! Restoring backup...${NC}"
  cp "$BACKUP_FILE" civic-llm-async.js
  echo -e "${YELLOW}   ⚠️  Backup restored${NC}"
  exit 1
fi
echo ""

# Step 5: Verify syntax
echo -e "${YELLOW}⚙️  Step 5: Verifying JavaScript syntax...${NC}"
node -c civic-llm-async.js
if [ $? -eq 0 ]; then
  echo -e "${GREEN}   ✅ Syntax is valid${NC}"
else
  echo -e "${RED}   ❌ Syntax error detected! Restoring backup...${NC}"
  cp "$BACKUP_FILE" civic-llm-async.js
  exit 1
fi
echo ""

# Step 6: Restart backend service
echo -e "${YELLOW}⚙️  Step 6: Restarting backend service...${NC}"
sudo systemctl restart "$SERVICE_NAME"
sleep 3

# Check service status
if sudo systemctl is-active --quiet "$SERVICE_NAME"; then
  echo -e "${GREEN}   ✅ Service restarted successfully${NC}"
  echo -e "${BLUE}   📊 Service status:${NC}"
  sudo systemctl status "$SERVICE_NAME" --no-pager -l | head -15
else
  echo -e "${RED}   ❌ Service failed to start! Restoring backup...${NC}"
  cp "$BACKUP_FILE" civic-llm-async.js
  sudo systemctl restart "$SERVICE_NAME"
  exit 1
fi
echo ""

# Step 7: Submit test query
echo -e "${YELLOW}⚙️  Step 7: Testing with real query...${NC}"
echo -e "${BLUE}   📝 Query: 'How has Chuck Schumer voted on healthcare?'${NC}"
echo -e "${BLUE}   📍 ZIP: 12061${NC}"
echo ""

TEST_RESPONSE=$(curl -s -X POST http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How has Chuck Schumer voted on healthcare?",
    "context": {
      "chatType": "representatives",
      "hasRepContext": true,
      "zipCode": "12061",
      "representatives": []
    }
  }')

if [ $? -eq 0 ]; then
  echo -e "${GREEN}   ✅ Test query submitted${NC}"
  echo ""
  echo -e "${BLUE}   📋 Response:${NC}"
  echo "$TEST_RESPONSE" | jq '.'
  
  # Extract job ID
  JOB_ID=$(echo "$TEST_RESPONSE" | jq -r '.jobId')
  if [ "$JOB_ID" != "null" ] && [ -n "$JOB_ID" ]; then
    echo ""
    echo -e "${BLUE}   🔍 Job ID: $JOB_ID${NC}"
    echo ""
    echo -e "${YELLOW}   ⏳ Waiting 10 seconds for processing...${NC}"
    sleep 10
    
    # Check result
    RESULT=$(curl -s "http://localhost:3002/api/civic/llm-chat/result/$JOB_ID")
    echo ""
    echo -e "${BLUE}   📊 Result:${NC}"
    echo "$RESULT" | jq '.'
    
    # Check if sources are present
    SOURCE_COUNT=$(echo "$RESULT" | jq '.result.sources | length' 2>/dev/null || echo "0")
    
    if [ "$SOURCE_COUNT" -gt 0 ]; then
      echo ""
      echo -e "${GREEN}   ✅ SUCCESS! Found $SOURCE_COUNT sources${NC}"
      echo ""
      echo -e "${BLUE}   📰 Sources:${NC}"
      echo "$RESULT" | jq -r '.result.sources[] | "   - \(.title) (Score: \(.relevanceScore))"' | head -5
    else
      echo ""
      echo -e "${YELLOW}   ⚠️  No sources found in result${NC}"
      echo -e "${YELLOW}   This may indicate the fix needs more time or investigation${NC}"
    fi
  fi
else
  echo -e "${RED}   ❌ Test query failed${NC}"
fi
echo ""

# Final summary
echo -e "${GREEN}"
cat << "EOF"
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ✅ DEPLOYMENT COMPLETE!                                  │
│                                                             │
│   Changes Applied:                                         │
│   - aiService.generateResponse() → analyzeWithAI()        │
│   - Backend restarted (Version B - Port 3002)             │
│   - Test query submitted                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "   1. Test on frontend: https://sxcrlfyt.gensparkspace.com"
echo -e "   2. Search for representative (ZIP: 12061)"
echo -e "   3. Ask: 'How has Chuck Schumer voted on healthcare?'"
echo -e "   4. Verify sources and citations appear"
echo -e "   5. If confirmed working, deploy to Production:"
echo -e "      cd /var/www/workforce-democracy/deployment-scripts"
echo -e "      ./sync-b-to-a.sh"
echo ""
echo -e "${BLUE}🔍 Monitor logs:${NC}"
echo -e "   tail -f /var/log/workforce-backend-b.log | grep -i 'sources\\|citation'"
echo ""
echo -e "${GREEN}✨ civic-llm-async.js fix is live on Version B!${NC}"
