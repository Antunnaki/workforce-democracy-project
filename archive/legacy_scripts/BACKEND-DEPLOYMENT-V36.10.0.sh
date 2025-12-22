#!/bin/bash

################################################################################
# BACKEND DEPLOYMENT SCRIPT - V36.10.0 PHASE 1
# Civic Representative Finder - Backend Endpoint Deployment
# 
# This script deploys the /api/civic/representatives endpoint to your VPS
# Location: /var/www/workforce-backend/server.js
# 
# Usage: 
#   1. Copy this script to your VPS
#   2. Make executable: chmod +x BACKEND-DEPLOYMENT-V36.10.0.sh
#   3. Run: ./BACKEND-DEPLOYMENT-V36.10.0.sh
#
# Author: AI Assistant
# Date: November 1, 2025
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="/var/www/workforce-backend"
SERVER_FILE="server.js"
PM2_PATH="/opt/nodejs/bin/pm2"
NODE_PATH="/opt/nodejs/bin/node"
BACKUP_SUFFIX="backup-v36.9.15-$(date +%Y%m%d-%H%M%S)"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  V36.10.0 BACKEND DEPLOYMENT - CIVIC REPRESENTATIVE FINDER${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

################################################################################
# STEP 1: Pre-flight Checks
################################################################################

echo -e "${YELLOW}[1/7] Pre-flight checks...${NC}"

# Check if running on VPS
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}✗ Backend directory not found: $BACKEND_DIR${NC}"
    echo -e "${RED}  Are you running this on the correct VPS?${NC}"
    exit 1
fi

# Check if server.js exists
if [ ! -f "$BACKEND_DIR/$SERVER_FILE" ]; then
    echo -e "${RED}✗ server.js not found in $BACKEND_DIR${NC}"
    exit 1
fi

# Check if PM2 exists
if [ ! -f "$PM2_PATH" ]; then
    echo -e "${RED}✗ PM2 not found at $PM2_PATH${NC}"
    exit 1
fi

# Check if Node.js exists
if [ ! -f "$NODE_PATH" ]; then
    echo -e "${RED}✗ Node.js not found at $NODE_PATH${NC}"
    exit 1
fi

echo -e "${GREEN}✓ All pre-flight checks passed${NC}"
echo ""

################################################################################
# STEP 2: Backup Current server.js
################################################################################

echo -e "${YELLOW}[2/7] Backing up current server.js...${NC}"

cd "$BACKEND_DIR"
cp "$SERVER_FILE" "${SERVER_FILE}.${BACKUP_SUFFIX}"

if [ -f "${SERVER_FILE}.${BACKUP_SUFFIX}" ]; then
    echo -e "${GREEN}✓ Backup created: ${SERVER_FILE}.${BACKUP_SUFFIX}${NC}"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

echo ""

################################################################################
# STEP 3: Check if endpoint already exists
################################################################################

echo -e "${YELLOW}[3/7] Checking for existing endpoint...${NC}"

if grep -q "POST /api/civic/representatives" "$SERVER_FILE"; then
    echo -e "${YELLOW}⚠ Endpoint already exists in server.js${NC}"
    echo -e "${YELLOW}  This might be a re-deployment.${NC}"
    read -p "Continue and replace existing endpoint? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment cancelled by user${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Ready to proceed${NC}"
echo ""

################################################################################
# STEP 4: Add endpoint code to server.js
################################################################################

echo -e "${YELLOW}[4/7] Adding civic representatives endpoint to server.js...${NC}"

# Create temporary file with the new endpoint code
cat > /tmp/civic-endpoint.js << 'ENDPOINT_CODE'

/**
 * ============================================================================
 * CIVIC REPRESENTATIVES LOOKUP - V36.10.0 PHASE 1
 * ============================================================================
 */

/**
 * POST /api/civic/representatives
 * Lookup federal, state, and local representatives by ZIP code or full address
 * 
 * Phase 1: Returns mock data for testing
 * Phase 2: Will integrate with Congress.gov API for real data
 */
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { user_id, location } = req.body;
        
        // Validate ZIP code is provided
        if (!location || !location.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        console.log(`[Civic API] 🔍 Looking up representatives for ZIP: ${location.zipCode}`);
        
        // Phase 1: Return mock data
        // TODO Phase 2: Replace with real Congress.gov API integration
        const representatives = getMockRepresentatives(location.zipCode);
        
        const responseTime = Date.now() - startTime;
        
        console.log(`[Civic API] ✅ Found ${representatives.length} representatives (${responseTime}ms)`);
        
        res.json({
            success: true,
            representatives: representatives,
            location_used: {
                zipCode: location.zipCode,
                city: location.city || null,
                state: location.state || null
            },
            data_sources: ['mock_data'],
            cached: false,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('[Civic API] ❌ Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to lookup representatives'
        });
    }
});

/**
 * Mock representatives data for Phase 1 testing
 * Returns 2 senators + 1 house representative per state
 */
function getMockRepresentatives(zipCode) {
    // Determine state from ZIP code first digit (simplified mapping)
    const zipPrefix = zipCode.charAt(0);
    let state = 'CA';
    
    const zipToState = {
        '0': 'CT', '1': 'NY', '2': 'DC', '3': 'FL', '4': 'GA',
        '5': 'IA', '6': 'IL', '7': 'OH', '8': 'AZ', '9': 'CA'
    };
    
    if (zipToState[zipPrefix]) {
        state = zipToState[zipPrefix];
    }
    
    return [
        {
            id: `rep_senate_${state}_1`,
            name: `Senator ${state} (Senior)`,
            title: 'U.S. Senator',
            office: 'United States Senate',
            level: 'federal',
            party: 'D',
            district: `${state} (At-large)`,
            photo_url: null,
            phone: '(202) 224-0000',
            email: `senior.senator@${state.toLowerCase()}.senate.gov`,
            website: `https://www.senate.gov`,
            term_start: '2019-01-03',
            term_end: '2025-01-03'
        },
        {
            id: `rep_senate_${state}_2`,
            name: `Senator ${state} (Junior)`,
            title: 'U.S. Senator',
            office: 'United States Senate',
            level: 'federal',
            party: 'R',
            district: `${state} (At-large)`,
            photo_url: null,
            phone: '(202) 224-0001',
            email: `junior.senator@${state.toLowerCase()}.senate.gov`,
            website: `https://www.senate.gov`,
            term_start: '2021-01-20',
            term_end: '2027-01-03'
        },
        {
            id: `rep_house_${state}_01`,
            name: `Representative ${state} District 1`,
            title: 'U.S. Representative',
            office: 'U.S. House of Representatives',
            level: 'federal',
            party: 'D',
            district: `${state}'s 1st District`,
            photo_url: null,
            phone: '(202) 225-0000',
            email: `rep.district1@${state.toLowerCase()}.house.gov`,
            website: `https://www.house.gov`,
            term_start: '2021-01-03',
            term_end: '2025-01-03'
        }
    ];
}

ENDPOINT_CODE

# Find the last endpoint in server.js and insert the new code before the closing of app setup
# We'll append it before the app.listen() or at the end of routes

echo -e "${BLUE}  Adding endpoint code...${NC}"

# Check if the endpoint already exists (from a previous deployment)
if grep -q "CIVIC REPRESENTATIVES LOOKUP - V36.10.0" "$SERVER_FILE"; then
    echo -e "${YELLOW}  Endpoint code already exists, skipping insertion...${NC}"
else
    # Find a good insertion point (before app.listen or at end of routes)
    if grep -n "app.listen" "$SERVER_FILE" > /dev/null; then
        # Insert before app.listen
        LINE_NUM=$(grep -n "app.listen" "$SERVER_FILE" | head -1 | cut -d: -f1)
        LINE_NUM=$((LINE_NUM - 1))
        
        # Insert the endpoint code
        head -n "$LINE_NUM" "$SERVER_FILE" > /tmp/server.js.new
        cat /tmp/civic-endpoint.js >> /tmp/server.js.new
        tail -n +"$((LINE_NUM + 1))" "$SERVER_FILE" >> /tmp/server.js.new
        
        mv /tmp/server.js.new "$SERVER_FILE"
        echo -e "${GREEN}  ✓ Endpoint code inserted${NC}"
    else
        # Append at end of file
        cat /tmp/civic-endpoint.js >> "$SERVER_FILE"
        echo -e "${GREEN}  ✓ Endpoint code appended${NC}"
    fi
fi

# Cleanup temp file
rm -f /tmp/civic-endpoint.js

echo -e "${GREEN}✓ Endpoint added successfully${NC}"
echo ""

################################################################################
# STEP 5: Validate syntax
################################################################################

echo -e "${YELLOW}[5/7] Validating JavaScript syntax...${NC}"

$NODE_PATH -c "$SERVER_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Syntax validation passed${NC}"
else
    echo -e "${RED}✗ Syntax error detected!${NC}"
    echo -e "${RED}  Rolling back to backup...${NC}"
    cp "${SERVER_FILE}.${BACKUP_SUFFIX}" "$SERVER_FILE"
    exit 1
fi

echo ""

################################################################################
# STEP 6: Restart backend with PM2
################################################################################

echo -e "${YELLOW}[6/7] Restarting backend with PM2...${NC}"

$PM2_PATH restart workforce-backend

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend restarted successfully${NC}"
else
    echo -e "${RED}✗ Failed to restart backend!${NC}"
    echo -e "${RED}  Rolling back to backup...${NC}"
    cp "${SERVER_FILE}.${BACKUP_SUFFIX}" "$SERVER_FILE"
    $PM2_PATH restart workforce-backend
    exit 1
fi

echo ""
sleep 2

################################################################################
# STEP 7: Verify deployment
################################################################################

echo -e "${YELLOW}[7/7] Verifying deployment...${NC}"

# Check PM2 status
echo -e "${BLUE}  Checking PM2 process status...${NC}"
$PM2_PATH list | grep workforce-backend

# Check recent logs
echo -e "${BLUE}  Checking recent logs...${NC}"
$PM2_PATH logs workforce-backend --lines 10 --nostream

echo ""

# Test the endpoint
echo -e "${BLUE}  Testing endpoint with curl...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_deployment_user",
    "location": {
      "zipCode": "90210"
    }
  }')

# Check if response contains "success": true
if echo "$RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ Endpoint is responding correctly${NC}"
    echo ""
    echo -e "${GREEN}Sample response:${NC}"
    echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
else
    echo -e "${RED}✗ Endpoint test failed!${NC}"
    echo -e "${RED}Response: $RESPONSE${NC}"
    echo ""
    echo -e "${YELLOW}Check logs with: $PM2_PATH logs workforce-backend${NC}"
    exit 1
fi

echo ""

################################################################################
# DEPLOYMENT COMPLETE
################################################################################

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  ✓ DEPLOYMENT COMPLETE - V36.10.0 PHASE 1${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo -e "  ${GREEN}✓${NC} Endpoint: POST /api/civic/representatives"
echo -e "  ${GREEN}✓${NC} Backup: ${SERVER_FILE}.${BACKUP_SUFFIX}"
echo -e "  ${GREEN}✓${NC} Backend: Restarted successfully"
echo -e "  ${GREEN}✓${NC} Status: Endpoint is responding"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Test from frontend: https://workforcedemocracyproject.org"
echo "  2. Navigate to: Civic Engagement > My Reps"
echo "  3. Enter a ZIP code and verify representatives display"
echo "  4. Check browser console for any errors"
echo ""
echo -e "${BLUE}Monitoring:${NC}"
echo "  • View logs: $PM2_PATH logs workforce-backend"
echo "  • Check status: $PM2_PATH status"
echo "  • Restart if needed: $PM2_PATH restart workforce-backend"
echo ""
echo -e "${BLUE}Rollback (if needed):${NC}"
echo "  cp ${SERVER_FILE}.${BACKUP_SUFFIX} $SERVER_FILE"
echo "  $PM2_PATH restart workforce-backend"
echo ""
echo -e "${GREEN}🚀 Ready for Phase 2: Congress.gov API integration!${NC}"
echo ""
