#!/bin/bash

#################################################
# ⚡ AUTOMATED DEEP RESEARCH FIX DEPLOYMENT ⚡
# For: Workforce Democracy Project V37.18.4
# From: Your Mac → VPS (185.193.126.13)
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
│   ⚡ DEEP RESEARCH FIX DEPLOYMENT v37.18.4 ⚡              │
│                                                             │
│   Uploads fix scripts from Mac → VPS → Auto-executes      │
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
  "DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh"
  "FIX-DEEP-RESEARCH-CALL-v37.18.4.js"
  "DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh"
)

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
ssh "${VPS_USER}@${VPS_HOST}" "cd ${VPS_PATH} && chmod +x *.sh"
echo -e "${GREEN}   ✅ Scripts are now executable${NC}"

echo ""
echo -e "${YELLOW}⚙️  Step 4: Executing deployment script on VPS...${NC}"
echo -e "${BLUE}   🚀 Running: ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh${NC}"
echo ""

# Execute deployment script and show output
ssh -t "${VPS_USER}@${VPS_HOST}" "cd ${VPS_PATH} && ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh"

echo ""
echo -e "${GREEN}"
cat << "EOF"
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   ✅ DEPLOYMENT COMPLETE!                                  │
│                                                             │
│   Deep Research fix has been:                              │
│   - Uploaded to VPS Version B                              │
│   - Applied to deep-research.js                            │
│   - Backend restarted                                      │
│   - Test query submitted                                   │
│                                                             │
│   Next Step:                                               │
│   Check the output above for the test job ID               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
EOF
echo -e "${NC}"

echo ""
echo -e "${YELLOW}📋 What just happened:${NC}"
echo -e "   1. ✅ Uploaded 3 fix files to VPS"
echo -e "   2. ✅ Made scripts executable"
echo -e "   3. ✅ Ran deployment script"
echo -e "   4. ✅ Applied Deep Research fix"
echo -e "   5. ✅ Restarted workforce-backend-b.service"
echo -e "   6. ✅ Submitted test query"
echo ""
echo -e "${BLUE}🔍 To check results:${NC}"
echo -e "   ssh ${VPS_USER}@${VPS_HOST}"
echo -e "   tail -f /var/log/workforce-backend-b.log | grep -i 'deep\\|congress'"
echo ""
echo -e "${GREEN}✨ All done! Deep Research fix is live on Version B (port 3002)${NC}"
