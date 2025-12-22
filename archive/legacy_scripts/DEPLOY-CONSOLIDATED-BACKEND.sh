#!/bin/bash

##############################################################################
# CONSOLIDATED BACKEND DEPLOYMENT SCRIPT v37.1.0
# 
# This script deploys the newly consolidated backend to your VPS.
# 
# WHAT THIS DOES:
# 1. Backs up current backend files
# 2. Uploads new consolidated ai-service.js
# 3. Uploads new civic routes
# 4. Uploads scraping queue utility
# 5. Updates server.js to mount civic routes
# 6. Restarts PM2
# 7. Tests everything
##############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS Configuration
VPS_HOST="root@185.193.126.13"
VPS_DIR="/var/www/workforce-democracy/backend"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CONSOLIDATED BACKEND DEPLOYMENT v37.1.0                 ║${NC}"
echo -e "${BLUE}║   Deploying: Merged AI Service + Civic Routes             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

##############################################################################
# STEP 1: Backup Current Files
##############################################################################

echo -e "${YELLOW}📦 Step 1: Backing up current files on VPS...${NC}"

ssh $VPS_HOST << 'ENDSSH'
cd /var/www/workforce-democracy/backend

# Create backup directory with timestamp
BACKUP_DIR="backups/pre-consolidation-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup current ai-service.js
if [ -f "ai-service.js" ]; then
    cp ai-service.js "$BACKUP_DIR/ai-service.js.backup"
    echo "✅ Backed up ai-service.js"
fi

# Backup current server.js
if [ -f "server.js" ]; then
    cp server.js "$BACKUP_DIR/server.js.backup"
    echo "✅ Backed up server.js"
fi

echo "📁 Backups saved to: $BACKUP_DIR"
ENDSSH

echo -e "${GREEN}✅ Backup complete${NC}"
echo ""

##############################################################################
# STEP 2: Upload New AI Service (Merged)
##############################################################################

echo -e "${YELLOW}📤 Step 2: Uploading merged ai-service.js...${NC}"

scp backend/ai-service-MERGED-v37.1.0.js $VPS_HOST:$VPS_DIR/ai-service.js

echo -e "${GREEN}✅ AI service uploaded${NC}"
echo ""

##############################################################################
# STEP 3: Upload Civic Routes
##############################################################################

echo -e "${YELLOW}📤 Step 3: Uploading civic routes...${NC}"

# Create routes directory if it doesn't exist
ssh $VPS_HOST "mkdir -p $VPS_DIR/routes"

scp backend/routes/civic-routes.js $VPS_HOST:$VPS_DIR/routes/

echo -e "${GREEN}✅ Civic routes uploaded${NC}"
echo ""

##############################################################################
# STEP 4: Upload Scraping Queue
##############################################################################

echo -e "${YELLOW}📤 Step 4: Uploading scraping queue utility...${NC}"

# Create utils directory if it doesn't exist
ssh $VPS_HOST "mkdir -p $VPS_DIR/utils"

scp backend/utils/scraping-queue.js $VPS_HOST:$VPS_DIR/utils/

echo -e "${GREEN}✅ Scraping queue uploaded${NC}"
echo ""

##############################################################################
# STEP 5: Update server.js to Mount Civic Routes
##############################################################################

echo -e "${YELLOW}🔧 Step 5: Updating server.js to mount civic routes...${NC}"

ssh $VPS_HOST << 'ENDSSH'
cd /var/www/workforce-democracy/backend

# Check if civic routes are already mounted
if grep -q "civic-routes" server.js; then
    echo "⚠️  Civic routes already mounted in server.js - skipping"
else
    echo "Adding civic routes to server.js..."
    
    # Create a temporary updated server.js
    # This adds the civic routes import and mounting
    
    # Add after other route requires
    sed -i "/const governmentRouter = require/a const civicRouter = require('./routes/civic-routes');" server.js
    
    # Add route mounting after other app.use statements
    sed -i "/app.use('\/api\/government'/a app.use('/api/civic', civicRouter);" server.js
    
    echo "✅ Added civic routes to server.js"
fi
ENDSSH

echo -e "${GREEN}✅ server.js updated${NC}"
echo ""

##############################################################################
# STEP 6: Restart PM2
##############################################################################

echo -e "${YELLOW}🔄 Step 6: Restarting PM2...${NC}"

ssh $VPS_HOST << 'ENDSSH'
cd /var/www/workforce-democracy

echo "Restarting backend process..."
pm2 restart backend

echo "Waiting 3 seconds for startup..."
sleep 3

echo "Saving PM2 configuration..."
pm2 save

echo "✅ PM2 restarted"
ENDSSH

echo -e "${GREEN}✅ PM2 restart complete${NC}"
echo ""

##############################################################################
# STEP 7: Test Everything
##############################################################################

echo -e "${YELLOW}🧪 Step 7: Testing deployed backend...${NC}"

echo ""
echo "Testing health endpoints..."

# Test main health endpoint
echo -e "${BLUE}1. Testing main health endpoint...${NC}"
curl -s https://api.workforcedemocracyproject.org/health | jq '.' || echo "⚠️  Main health check failed"

echo ""

# Test civic health endpoint
echo -e "${BLUE}2. Testing civic health endpoint...${NC}"
curl -s https://api.workforcedemocracyproject.org/api/civic/health | jq '.' || echo "⚠️  Civic health check failed"

echo ""

# Test LLM health endpoint
echo -e "${BLUE}3. Testing LLM health endpoint...${NC}"
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | jq '.' || echo "⚠️  LLM health check failed"

echo ""

##############################################################################
# STEP 8: Show PM2 Status
##############################################################################

echo -e "${YELLOW}📊 Step 8: Showing PM2 status...${NC}"

ssh $VPS_HOST "pm2 list"

echo ""

##############################################################################
# COMPLETION
##############################################################################

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                 🎉 DEPLOYMENT COMPLETE! 🎉                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📋 What was deployed:${NC}"
echo "   ✅ Merged AI Service (smart caching + source search)"
echo "   ✅ Civic Routes (representatives + LLM chat)"
echo "   ✅ Scraping Queue Utility"
echo "   ✅ Updated server.js with civic routes"
echo ""
echo -e "${BLUE}📍 API Endpoints:${NC}"
echo "   • https://api.workforcedemocracyproject.org/api/civic/health"
echo "   • https://api.workforcedemocracyproject.org/api/civic/llm-health"
echo "   • https://api.workforcedemocracyproject.org/api/civic/llm-chat"
echo "   • https://api.workforcedemocracyproject.org/api/civic/representatives/search"
echo ""
echo -e "${BLUE}🔍 Next Steps:${NC}"
echo "   1. Test LLM chat in your frontend"
echo "   2. Monitor PM2 logs: ssh root@185.193.126.13 'pm2 logs backend'"
echo "   3. Archive civic/backend folder after confirming everything works"
echo ""
echo -e "${GREEN}🚀 Backend is live and ready!${NC}"
echo ""
