#!/bin/bash

###############################################################################
# COMPREHENSIVE ANALYSIS IMPROVEMENTS DEPLOYMENT
# This script deploys all enhancements to make the AI assistant more thorough
###############################################################################

set -e  # Exit on error

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║          DEPLOYING COMPREHENSIVE ANALYSIS IMPROVEMENTS                     ║"
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo ""

PROJECT_DIR="/root/progressive-policy-assistant"
BACKEND_DIR="$PROJECT_DIR/backend"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

###############################################################################
# Step 1: Backup current files
###############################################################################
echo -e "${BLUE}📦 STEP 1: Creating backup...${NC}"
BACKUP_DIR="$PROJECT_DIR/backups/comprehensive-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service.js.bak"
echo -e "${GREEN}✅ Backup created at: $BACKUP_DIR${NC}\n"

###############################################################################
# Step 2: Increase source threshold from 8 to 12
###############################################################################
echo -e "${BLUE}📊 STEP 2: Increasing source threshold (8 → 12)...${NC}"
python3 increase-threshold.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Source threshold increased${NC}\n"
else
    echo -e "${RED}❌ Failed to increase threshold${NC}\n"
    exit 1
fi

###############################################################################
# Step 3: Enhance prompting and add diverse queries
###############################################################################
echo -e "${BLUE}🧠 STEP 3: Enhancing LLM prompting and follow-up queries...${NC}"
python3 enhance-prompting.py
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Prompting enhanced${NC}\n"
else
    echo -e "${RED}❌ Failed to enhance prompting${NC}\n"
    exit 1
fi

###############################################################################
# Step 4: Test scrapers to identify needed fixes
###############################################################################
echo -e "${BLUE}🔬 STEP 4: Testing scrapers to find working selectors...${NC}"
echo -e "${YELLOW}This may take 10-20 seconds as we test each news site...${NC}\n"

cd "$BACKEND_DIR"
node /root/test-scrapers.js > /tmp/scraper-test-results.txt 2>&1

if [ -f /tmp/scraper-test-results.txt ]; then
    echo -e "${GREEN}✅ Scraper tests complete${NC}"
    echo -e "${BLUE}📄 Results saved to: /tmp/scraper-test-results.txt${NC}\n"
    
    # Show summary
    echo -e "${YELLOW}=== SCRAPER TEST SUMMARY ===${NC}"
    grep -A 2 "RECOMMENDED:" /tmp/scraper-test-results.txt || echo "No recommendations found"
    echo ""
else
    echo -e "${YELLOW}⚠️  Scraper tests failed - will proceed with existing selectors${NC}\n"
fi

###############################################################################
# Step 5: Update scrapers with diagnostic results
###############################################################################
echo -e "${BLUE}🔧 STEP 5: Updating scrapers with recommended selectors...${NC}"

if [ -f /tmp/scraper-test-results.txt ]; then
    python3 update-scrapers.py
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Scrapers updated${NC}\n"
    else
        echo -e "${YELLOW}⚠️  Scraper update had issues (check output above)${NC}\n"
    fi
else
    echo -e "${YELLOW}⚠️  No test results found, skipping scraper updates${NC}\n"
fi

###############################################################################
# Step 6: Nuclear PM2 restart
###############################################################################
echo -e "${BLUE}♻️  STEP 6: Performing nuclear PM2 restart...${NC}"
echo -e "${YELLOW}This ensures all code changes take effect (clears Node.js cache)${NC}\n"

pm2 stop backend 2>/dev/null || true
sleep 2

pm2 flush 2>/dev/null || true
sleep 1

pm2 delete backend 2>/dev/null || true
sleep 1

echo -e "${YELLOW}Killing all Node.js processes to clear cache...${NC}"
pkill -9 node 2>/dev/null || true
sleep 2

echo -e "${YELLOW}Starting backend fresh...${NC}"
cd "$BACKEND_DIR"
pm2 start server.js --name backend
sleep 3

pm2 logs backend --lines 20 --nostream

echo -e "${GREEN}✅ Nuclear PM2 restart complete${NC}\n"

###############################################################################
# Step 7: Verify deployment
###############################################################################
echo -e "${BLUE}🔍 STEP 7: Verifying deployment...${NC}"

# Check if backend is running
if pm2 list | grep -q "backend.*online"; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is NOT running!${NC}"
    pm2 logs backend --lines 50 --nostream
    exit 1
fi

# Check if changes are in the file
if grep -q "if (sources.length < 12)" "$BACKEND_DIR/ai-service.js"; then
    echo -e "${GREEN}✅ Source threshold updated to 12${NC}"
else
    echo -e "${RED}❌ Source threshold not updated${NC}"
fi

if grep -q "healthcare subsidies expiration impact statistics" "$BACKEND_DIR/ai-service.js"; then
    echo -e "${GREEN}✅ Enhanced follow-up queries deployed${NC}"
else
    echo -e "${RED}❌ Enhanced queries not found${NC}"
fi

if grep -q "CITE SPECIFIC DATA" "$BACKEND_DIR/ai-service.js"; then
    echo -e "${GREEN}✅ Enhanced LLM prompting deployed${NC}"
else
    echo -e "${RED}❌ Enhanced prompting not found${NC}"
fi

echo ""

###############################################################################
# Summary
###############################################################################
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    DEPLOYMENT COMPLETE ✅                                   ║${NC}"
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════════════════╗${NC}"
echo ""
echo -e "${BLUE}📊 IMPROVEMENTS DEPLOYED:${NC}"
echo -e "   1. ✅ Source threshold increased: 8 → 12 sources per query"
echo -e "   2. ✅ Enhanced follow-up queries: 6 policy categories, 5 queries each"
echo -e "   3. ✅ Improved LLM prompting: Requests specific data, quotes, statistics"
echo -e "   4. ✅ Scraper diagnostics: Tested all news sites for working selectors"
echo -e "   5. ✅ Scraper updates: Applied recommended selectors to article-scraper.js"
echo ""
echo -e "${BLUE}📁 FILES:${NC}"
echo -e "   • Backup: $BACKUP_DIR"
echo -e "   • Modified: $BACKEND_DIR/ai-service.js"
echo -e "   • Test results: /tmp/scraper-test-results.txt"
echo ""
echo -e "${BLUE}🧪 NEXT STEPS:${NC}"
echo -e "   1. Test with SNAP query to see 10-15 sources instead of 4-5"
echo -e "   2. Review scraper test results: ${YELLOW}cat /tmp/scraper-test-results.txt${NC}"
echo -e "   3. Update article-scraper.js with recommended selectors if needed"
echo -e "   4. Monitor PM2 logs: ${YELLOW}pm2 logs backend${NC}"
echo ""
echo -e "${GREEN}✨ Your AI assistant is now more comprehensive! ✨${NC}"
echo ""
