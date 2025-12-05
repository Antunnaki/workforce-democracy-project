#!/bin/bash

# Civic Platform v37.0.0 - Backend Deployment Script
# This script updates the backend API to support ZIP code searches

echo "🏛️ Civic Platform v37.0.0 - Backend Deployment"
echo "==============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Navigating to backend directory...${NC}"
cd /var/www/workforce-democracy/backend || exit 1

echo -e "${BLUE}Step 2: Backing up current civic-api.js...${NC}"
cp civic/backend/civic-api.js civic/backend/civic-api.js.backup.$(date +%Y%m%d-%H%M%S)

echo -e "${GREEN}✅ Backup created${NC}"
echo ""

echo -e "${YELLOW}Step 3: Update civic-api.js manually${NC}"
echo "Open the file with: nano civic/backend/civic-api.js"
echo ""
echo "Find the /representatives/search endpoint (around line 42)"
echo "Add 'zip' parameter support as shown in CIVIC-PLATFORM-FIX-COMPLETE.md"
echo ""
read -p "Press Enter after you've updated the file..."

echo ""
echo -e "${BLUE}Step 4: Restarting PM2...${NC}"
pm2 restart workforce-democracy-backend

echo ""
echo -e "${BLUE}Step 5: Checking PM2 status...${NC}"
pm2 status workforce-democracy-backend

echo ""
echo -e "${BLUE}Step 6: Viewing recent logs...${NC}"
pm2 logs workforce-democracy-backend --lines 30 --nostream

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo -e "${BLUE}Test the endpoint:${NC}"
echo "curl 'https://workforcedemocracyproject.org/api/civic/representatives/search?zip=12061'"
echo ""
echo -e "${YELLOW}Expected: JSON response with 3 mock representatives${NC}"
