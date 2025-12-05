#!/bin/bash

#################################################
# ⚡ AUTOMATED CIVIC-LLM FIX DEPLOYMENT ⚡
# For: Workforce Democracy Project V37.18.5
# From: Your Mac → VPS (185.193.126.13)
# 
# CRITICAL BUG FIX:
# civic-llm-async.js calls aiService.generateResponse()
# but that function doesn't exist!
# Should call: aiService.analyzeWithAI()
#################################################

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
cat << "EOF"
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ⚡ CIVIC-LLM FIX DEPLOYMENT v37.18.5 ⚡                  │
│                                                             │
│   CRITICAL BUG FIX:                                        │
│   aiService.generateResponse() → analyzeWithAI()          │
│                                                             │
│   Uploads fix scripts from Mac → VPS → Auto-executes     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

# Configuration
VPS_USER="root"
VPS_HOST="185.193.126.13"
VPS_PATH="/var/www/workforce-democracy/version-b/backend"
LOCAL_DIR="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"

# Files to upload
FILES=(
  "DIAGNOSE-CIVIC-LLM-v37.18.5.sh"
  "FIX-CIVIC-LLM-ASYNC-v37.18.5.js"
  "DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh"
)

echo -e "${RED}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🐛 BUG DETECTED:                                        ║
║                                                           ║
║   civic-llm-async.js is calling:                         ║
║   ❌ aiService.generateResponse()                        ║
║                                                           ║
║   But this function DOESN'T EXIST in ai-service.js!      ║
║                                                           ║
║   Correct function:                                       ║
║   ✅ aiService.analyzeWithAI()                           ║
║                                                           ║
║   This explains:                                          ║
║   - No sources returned to frontend                       ║
║   - "I searched but didn't find..." fallback message     ║
║   - Missing citations in AI responses                     ║
║   - No Congress.gov bills showing up                      ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}⚙️  Step 1: Verifying local files exist...${NC}"
cd "$LOCAL_DIR"

for file in "${FILES[@]}"; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}❌ ERROR: Missing file: $file${NC}"
    echo -e "${RED}   Please download from chat first!${NC}"
    exit 1
  else
    echo -e "${GREEN}   ✅ Found: $file${NC}"
  fi
done

echo ""
echo -e "${YELLOW}⚙️  Step 2: Uploading files to VPS Version B...${NC}"
for file in "${FILES[@]}"; do
  echo -e "${BLUE}   📤 Uploading: $file${NC}"
  scp "$file" "${VPS_USER}@${VPS_HOST}:${VPS_PATH}/"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Uploaded successfully${NC}"
  else
    echo -e "${RED}   ❌ Upload failed${NC}"
    exit 1
  fi
done

echo ""
echo -e "${YELLOW}⚙️  Step 3: Making scripts executable on VPS...${NC}"
ssh "${VPS_USER}@${VPS_HOST}" "cd ${VPS_PATH} && chmod +x DIAGNOSE-CIVIC-LLM-v37.18.5.sh DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh"
echo -e "${GREEN}   ✅ Scripts are now executable${NC}"

echo ""
echo -e "${YELLOW}⚙️  Step 4: Executing deployment script on VPS...${NC}"
echo -e "${BLUE}   🚀 Running: ./DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh${NC}"
echo ""

# Execute deployment script and show output
ssh -t "${VPS_USER}@${VPS_HOST}" "cd ${VPS_PATH} && ./DEPLOY-CIVIC-LLM-FIX-v37.18.5.sh"

echo ""
echo -e "${GREEN}"
cat << "EOF"
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ✅ DEPLOYMENT COMPLETE!                                  │
│                                                             │
│   civic-llm-async.js fix has been:                        │
│   - Uploaded to VPS Version B                              │
│   - Applied (generateResponse → analyzeWithAI)            │
│   - Backend restarted                                      │
│   - Test query submitted                                   │
│                                                             │
│   Next Step:                                               │
│   Check output above for test results with sources        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}📋 What just happened:${NC}"
echo -e "   1. ✅ Uploaded 3 fix files to VPS"
echo -e "   2. ✅ Made scripts executable"
echo -e "   3. ✅ Ran deployment script"
echo -e "   4. ✅ Fixed civic-llm-async.js function call"
echo -e "   5. ✅ Restarted workforce-backend-b.service"
echo -e "   6. ✅ Submitted test query (Chuck Schumer healthcare)"
echo ""
echo -e "${BLUE}🎯 Expected Results:${NC}"
echo -e "   - Sources should appear in test response"
echo -e "   - Congress.gov bills should be found"
echo -e "   - Citations should be numbered [1], [2], etc."
echo -e "   - No more 'I searched but didn't find...' message"
echo ""
echo -e "${BLUE}🔍 To verify on frontend:${NC}"
echo -e "   1. Go to: https://sxcrlfyt.gensparkspace.com"
echo -e "   2. Enter ZIP: 12061"
echo -e "   3. Ask: 'How has Chuck Schumer voted on healthcare?'"
echo -e "   4. Look for sources and citations in response"
echo ""
echo -e "${BLUE}📊 Monitor backend logs:${NC}"
echo -e "   ssh ${VPS_USER}@${VPS_HOST}"
echo -e "   tail -f /var/log/workforce-backend-b.log | grep -i 'sources\\|citation\\|congress'"
echo ""
echo -e "${GREEN}✨ civic-llm-async.js fix is live on Version B (port 3002)!${NC}"
echo ""
echo -e "${YELLOW}🚀 When ready for production:${NC}"
echo -e "   cd /var/www/workforce-democracy/deployment-scripts"
echo -e "   ./sync-b-to-a.sh"
