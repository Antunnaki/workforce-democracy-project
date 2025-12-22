#!/bin/bash

#############################################################################
# URGENT FIX: No Sources Returned for Constitutional Questions
# 
# Problem: "amendment", "repeal", etc. not triggering source search
# Root Cause: needsCurrentInfo() regex doesn't include constitutional terms
# Solution: Added amendment/constitution/repeal/rights to regex
#
# Files Changed:
# - backend/ai-service.js (Line 342 - added constitutional terms to regex)
#
# Usage:
#   1. SCP upload ai-service.js to VPS
#   2. SSH into VPS
#   3. cd /var/www/workforce-democracy/backend
#   4. bash ~/🚨-URGENT-SOURCES-FIX-v37.4.0.sh
#############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "   🚨 URGENT FIX: Sources Not Returned for Constitutional Questions"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify directory
echo -e "${YELLOW}📂 Step 1: Verifying directory...${NC}"
if [ ! -f "server.js" ] || [ ! -f "ai-service.js" ]; then
    echo -e "${RED}❌ ERROR: Not in backend directory!${NC}"
    echo "Please run: cd /var/www/workforce-democracy/backend"
    exit 1
fi
echo -e "${GREEN}✅ Correct directory confirmed${NC}"
echo ""

# Step 2: Backup
echo -e "${YELLOW}💾 Step 2: Creating backup...${NC}"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp ai-service.js "ai-service-BACKUP-${TIMESTAMP}.js"
echo -e "${GREEN}✅ Backup created: ai-service-BACKUP-${TIMESTAMP}.js${NC}"
echo ""

# Step 3: Set permissions
echo -e "${YELLOW}🔐 Step 3: Setting permissions...${NC}"
chown www-data:www-data ai-service.js
chmod 644 ai-service.js
echo -e "${GREEN}✅ Permissions set (www-data:www-data)${NC}"
echo ""

# Step 4: Restart PM2
echo -e "${YELLOW}🔄 Step 4: Restarting PM2...${NC}"
pm2 delete backend 2>/dev/null || true
sleep 2
pm2 start server.js --name backend
sleep 3
echo -e "${GREEN}✅ PM2 backend restarted${NC}"
echo ""

# Step 5: Check status
echo -e "${YELLOW}📊 Step 5: PM2 Status${NC}"
pm2 status
echo ""

# Step 6: Show logs
echo -e "${YELLOW}📝 Step 6: Recent Logs${NC}"
pm2 logs backend --lines 20 --nostream
echo ""

echo "═══════════════════════════════════════════════════════════════════"
echo -e "${GREEN}   🎉 URGENT FIX DEPLOYED!${NC}"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "What was fixed:"
echo "  ✅ Added 'amendment' to source search trigger words"
echo "  ✅ Added 'constitution', 'repeal', 'rights' to regex"
echo "  ✅ Constitutional questions will now trigger source search"
echo ""
echo "Next: Test with Universal Chat"
echo "  1. Ask: 'What would happen if the 19th amendment was repealed?'"
echo "  2. Backend logs should show: '🌍 Using global RSS/API sources'"
echo "  3. Response should have citations [1] and [2]"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
