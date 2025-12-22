#!/bin/bash

##################################################################
# WORKFORCE DEMOCRACY PROJECT
# Enhanced AI Service Deployment v37.1.0
#
# WHAT THIS DEPLOYS:
# - Enhanced temporal detection (time-of-day, local gov queries)
# - Smart multi-tier caching (7-day news, 90-day finance)
# - Improved source search (NEWS_SOURCES configuration)
# - Latest Llama 3.3-70b-versatile model
# - Dynamic date injection (calculated on every request)
#
# RUN FROM: Local project directory
# TARGET: VPS at 185.193.126.13
##################################################################

set -e  # Exit on error

echo "🚀 Deploying Enhanced AI Service v37.1.0"
echo "========================================="
echo ""

# Configuration
VPS_IP="185.193.126.13"
VPS_USER="root"
BACKEND_DIR="/var/www/workforce-democracy/backend"
LOCAL_BACKEND="./backend"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Backup current ai-service.js on VPS
echo -e "${YELLOW}📦 Step 1: Backing up current ai-service.js on VPS...${NC}"
ssh ${VPS_USER}@${VPS_IP} "cd ${BACKEND_DIR} && cp ai-service.js ai-service-BACKUP-\$(date +%Y%m%d-%H%M%S).js"
echo -e "${GREEN}✅ Backup created${NC}"
echo ""

# Step 2: Upload enhanced ai-service.js
echo -e "${YELLOW}📤 Step 2: Uploading enhanced ai-service.js...${NC}"
scp ${LOCAL_BACKEND}/ai-service.js ${VPS_USER}@${VPS_IP}:${BACKEND_DIR}/ai-service.js
echo -e "${GREEN}✅ Enhanced AI service uploaded${NC}"
echo ""

# Step 3: Restart PM2
echo -e "${YELLOW}🔄 Step 3: Restarting PM2...${NC}"
ssh ${VPS_USER}@${VPS_IP} "cd ${BACKEND_DIR} && pm2 restart workforce-democracy-backend"
echo -e "${GREEN}✅ PM2 restarted${NC}"
echo ""

# Step 4: Verify deployment
echo -e "${YELLOW}🔍 Step 4: Verifying deployment...${NC}"
echo ""
echo "Checking PM2 status:"
ssh ${VPS_USER}@${VPS_IP} "pm2 status workforce-democracy-backend"
echo ""
echo "Checking for errors in PM2 logs:"
ssh ${VPS_USER}@${VPS_IP} "pm2 logs workforce-democracy-backend --lines 10 --nostream"
echo ""

# Step 5: Test endpoints
echo -e "${YELLOW}🧪 Step 5: Testing endpoints...${NC}"
echo ""
echo "Testing health check:"
curl -s https://api.workforcedemocracyproject.org/api/civic/health | jq '.'
echo ""
echo "Testing LLM health:"
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | jq '.'
echo ""

echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${YELLOW}📝 What's New in v37.1.0:${NC}"
echo "  ✨ Enhanced temporal detection (time-of-day, local gov)"
echo "  💾 Smart caching (7d news, 90d finance)"
echo "  🔍 Improved source search"
echo "  🤖 Latest Llama 3.3-70b-versatile"
echo "  📅 Dynamic date injection"
echo ""
echo -e "${YELLOW}🧪 Test Queries:${NC}"
echo "  1. 'What's happening with NYC mayoral race tonight?'"
echo "  2. 'Trump vs Biden campaign spending 2020-2024'"
echo "  3. 'Manhattan city council election results'"
echo ""
echo -e "${YELLOW}📊 Monitor Logs:${NC}"
echo "  ssh ${VPS_USER}@${VPS_IP}"
echo "  pm2 logs workforce-democracy-backend"
echo ""
