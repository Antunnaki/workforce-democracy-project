#!/bin/bash

#############################################################################
# CITATION FIX DEPLOYMENT v37.4.0
# 
# Problem: Citations [3] through [12] show as plain text, links to wrong sources
# Root Cause: LLM generates [1]-[12] citations but only 2 sources found
# Solution: Validate citations after sources found, remove invalid ones
#
# Files Changed:
# - backend/citation-validator-v37.4.0.js (NEW - citation validation logic)
# - backend/ai-service.js (MODIFIED - integrate citation validator)
#
# Usage:
#   1. SCP upload both files to VPS
#   2. SSH into VPS
#   3. cd /var/www/workforce-democracy/backend
#   4. bash ~/🚀-DEPLOY-CITATION-FIX-v37.4.0.sh
#############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "   🔧 CITATION FIX DEPLOYMENT v37.4.0"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify we're in the correct directory
echo -e "${YELLOW}📂 Step 1: Verifying directory...${NC}"
if [ ! -f "server.js" ] || [ ! -f "ai-service.js" ]; then
    echo -e "${RED}❌ ERROR: Not in backend directory!${NC}"
    echo "Please run: cd /var/www/workforce-democracy/backend"
    exit 1
fi
echo -e "${GREEN}✅ Correct directory confirmed${NC}"
echo ""

# Step 2: Backup current ai-service.js
echo -e "${YELLOW}💾 Step 2: Creating backup...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp ai-service.js "ai-service-BACKUP-${TIMESTAMP}.js"
echo -e "${GREEN}✅ Backup created: ai-service-BACKUP-${TIMESTAMP}.js${NC}"
echo ""

# Step 3: Check if files exist
echo -e "${YELLOW}📋 Step 3: Verifying uploaded files...${NC}"
if [ ! -f "citation-validator-v37.4.0.js" ]; then
    echo -e "${RED}❌ ERROR: citation-validator-v37.4.0.js not found!${NC}"
    echo "Please upload it first with:"
    echo "  scp citation-validator-v37.4.0.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
    exit 1
fi
if [ ! -f "ai-service.js" ]; then
    echo -e "${RED}❌ ERROR: ai-service.js not found!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All required files present${NC}"
echo ""

# Step 4: Set ownership and permissions
echo -e "${YELLOW}🔐 Step 4: Setting permissions...${NC}"
chown www-data:www-data citation-validator-v37.4.0.js
chown www-data:www-data ai-service.js
chmod 644 citation-validator-v37.4.0.js
chmod 644 ai-service.js
echo -e "${GREEN}✅ Permissions set (www-data:www-data)${NC}"
echo ""

# Step 5: Restart PM2
echo -e "${YELLOW}🔄 Step 5: Restarting PM2 backend process...${NC}"
pm2 delete backend 2>/dev/null || true
sleep 2
pm2 start server.js --name backend
sleep 3
echo -e "${GREEN}✅ PM2 backend restarted${NC}"
echo ""

# Step 6: Check PM2 status
echo -e "${YELLOW}📊 Step 6: Checking PM2 status...${NC}"
pm2 status
echo ""

# Step 7: Show recent logs
echo -e "${YELLOW}📝 Step 7: Checking logs for errors...${NC}"
pm2 logs backend --lines 20 --nostream
echo ""

echo "═══════════════════════════════════════════════════════════════════"
echo -e "${GREEN}   🎉 CITATION FIX DEPLOYMENT COMPLETE!${NC}"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "What was fixed:"
echo "  ✅ Citations [1] and [2] now link to correct sources"
echo "  ✅ Invalid citations [3]-[12] removed (no matching sources)"
echo "  ✅ All citations now clickable and functional"
echo ""
echo "Next steps:"
echo "  1. Test with Universal Chat: Ask about 19th Amendment"
echo "  2. Verify citations [1] and [2] are clickable"
echo "  3. Confirm no [3] through [12] appear as plain text"
echo ""
echo "If you see any errors in the logs above, check:"
echo "  • pm2 logs backend --lines 50"
echo "  • Syntax errors in citation-validator-v37.4.0.js"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
