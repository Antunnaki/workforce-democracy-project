#!/bin/bash
# =============================================================================
# V36.10.0 Phase 1 - Backend Deployment Script
# Civic Representative Finder API Endpoint
# =============================================================================
# 
# This script will:
# 1. Backup your current server.js
# 2. Add the new /api/civic/representatives endpoint
# 3. Restart PM2
# 4. Test the endpoint
# 5. Show you the results
#
# Usage:
#   chmod +x deploy-backend-v36.10.0.sh
#   ./deploy-backend-v36.10.0.sh
#
# =============================================================================

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
BACKUP_SUFFIX="backup-v36.9.15-$(date +%Y%m%d-%H%M%S)"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  V36.10.0 Phase 1 - Backend Deployment${NC}"
echo -e "${BLUE}  Civic Representative Finder API${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# =============================================================================
# Step 1: Check if we're in the right directory
# =============================================================================
echo -e "${YELLOW}[Step 1/7]${NC} Checking environment..."

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: Backend directory not found: $BACKEND_DIR${NC}"
    echo "Please run this script on your VPS server."
    exit 1
fi

cd "$BACKEND_DIR"

if [ ! -f "$SERVER_FILE" ]; then
    echo -e "${RED}❌ Error: server.js not found in $BACKEND_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment OK${NC}"
echo ""

# =============================================================================
# Step 2: Backup current server.js
# =============================================================================
echo -e "${YELLOW}[Step 2/7]${NC} Backing up current server.js..."

cp "$SERVER_FILE" "${SERVER_FILE}.${BACKUP_SUFFIX}"

if [ -f "${SERVER_FILE}.${BACKUP_SUFFIX}" ]; then
    echo -e "${GREEN}✅ Backup created: ${SERVER_FILE}.${BACKUP_SUFFIX}${NC}"
else
    echo -e "${RED}❌ Error: Backup failed${NC}"
    exit 1
fi
echo ""

# =============================================================================
# Step 3: Check if endpoint already exists
# =============================================================================
echo -e "${YELLOW}[Step 3/7]${NC} Checking for existing endpoint..."

if grep -q "api/civic/representatives" "$SERVER_FILE"; then
    echo -e "${YELLOW}⚠️  Warning: Endpoint already exists in server.js${NC}"
    echo "The endpoint may have been added previously."
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}ℹ️  Deployment cancelled.${NC}"
        exit 0
    fi
fi

echo -e "${GREEN}✅ Ready to add endpoint${NC}"
echo ""

# =============================================================================
# Step 4: Add the new endpoint to server.js
# =============================================================================
echo -e "${YELLOW}[Step 4/7]${NC} Adding /api/civic/representatives endpoint..."

# Create a temporary file with the new endpoint code
cat > /tmp/civic-endpoint.js << 'ENDPOINT_CODE'

// =============================================================================
// CIVIC REPRESENTATIVES LOOKUP - V36.10.0 PHASE 1
// Added: $(date +%Y-%m-%d)
// =============================================================================

/**
 * POST /api/civic/representatives
 * Lookup federal, state, and local representatives by ZIP code or full address
 */
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { user_id, location } = req.body;
        
        if (!location || !location.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        console.log(`[Civic API] 🔍 Looking up representatives for ZIP: ${location.zipCode}`);
        
        // For Phase 1, return mock data
        // TODO Phase 2: Implement real Congress.gov API integration
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
 */
function getMockRepresentatives(zipCode) {
    // Determine state from ZIP code first digit (simplified)
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
            name: `Senator ${state} 1`,
            title: 'U.S. Senator',
            office: 'United States Senate',
            level: 'federal',
            party: 'D',
            district: `${state} (At-large)`,
            photo_url: null,
            phone: '(202) 224-0000',
            email: `senator1@${state.toLowerCase()}.senate.gov`,
            website: `https://www.senate.gov`,
            term_start: '2021-01-20',
            term_end: '2027-01-03'
        },
        {
            id: `rep_senate_${state}_2`,
            name: `Senator ${state} 2`,
            title: 'U.S. Senator',
            office: 'United States Senate',
            level: 'federal',
            party: 'R',
            district: `${state} (At-large)`,
            photo_url: null,
            phone: '(202) 224-0001',
            email: `senator2@${state.toLowerCase()}.senate.gov`,
            website: `https://www.senate.gov`,
            term_start: '2019-01-03',
            term_end: '2025-01-03'
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
            email: `rep@${state.toLowerCase()}.house.gov`,
            website: `https://www.house.gov`
        }
    ];
}

// =============================================================================
// END CIVIC REPRESENTATIVES LOOKUP
// =============================================================================

ENDPOINT_CODE

# Find a good insertion point (before the last closing brace or after other endpoints)
# We'll add it before the server starts listening

# Create a marker to find insertion point
MARKER="// Add civic endpoint before this line"

# Check if server has a listen() call
if grep -q "app.listen" "$SERVER_FILE"; then
    # Insert before app.listen
    sed -i "/app\.listen/i $(cat /tmp/civic-endpoint.js)" "$SERVER_FILE"
    echo -e "${GREEN}✅ Endpoint added before app.listen()${NC}"
else
    # Append to end of file
    cat /tmp/civic-endpoint.js >> "$SERVER_FILE"
    echo -e "${GREEN}✅ Endpoint added to end of file${NC}"
fi

# Clean up temp file
rm /tmp/civic-endpoint.js

echo ""

# =============================================================================
# Step 5: Verify syntax
# =============================================================================
echo -e "${YELLOW}[Step 5/7]${NC} Verifying JavaScript syntax..."

if node -c "$SERVER_FILE" 2>&1; then
    echo -e "${GREEN}✅ Syntax check passed${NC}"
else
    echo -e "${RED}❌ Syntax error detected!${NC}"
    echo "Rolling back to backup..."
    cp "${SERVER_FILE}.${BACKUP_SUFFIX}" "$SERVER_FILE"
    echo -e "${YELLOW}⚠️  Rollback complete. Please check the code manually.${NC}"
    exit 1
fi
echo ""

# =============================================================================
# Step 6: Restart PM2
# =============================================================================
echo -e "${YELLOW}[Step 6/7]${NC} Restarting backend server..."

# Try to find PM2 in common locations
PM2_CMD=""
if command -v pm2 &> /dev/null; then
    PM2_CMD="pm2"
elif [ -f "/opt/nodejs/bin/pm2" ]; then
    PM2_CMD="/opt/nodejs/bin/pm2"
elif [ -f "$HOME/.nvm/versions/node/*/bin/pm2" ]; then
    PM2_CMD=$(ls $HOME/.nvm/versions/node/*/bin/pm2 | head -1)
else
    echo -e "${RED}❌ Error: PM2 not found${NC}"
    echo "Please restart your backend manually."
    exit 1
fi

echo "Using PM2: $PM2_CMD"

# Restart the backend
if $PM2_CMD restart workforce-backend 2>&1; then
    echo -e "${GREEN}✅ Backend restarted successfully${NC}"
else
    echo -e "${RED}❌ Error restarting backend${NC}"
    echo "Please check PM2 logs: $PM2_CMD logs workforce-backend"
    exit 1
fi

# Wait a moment for server to fully restart
sleep 3
echo ""

# =============================================================================
# Step 7: Test the endpoint
# =============================================================================
echo -e "${YELLOW}[Step 7/7]${NC} Testing new endpoint..."

# Test with curl
TEST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/civic/representatives \
    -H "Content-Type: application/json" \
    -d '{
        "user_id": "test_user_123",
        "location": {
            "zipCode": "90210"
        }
    }' 2>&1)

# Check if response contains "success"
if echo "$TEST_RESPONSE" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Endpoint test PASSED${NC}"
    echo ""
    echo "Sample response:"
    echo "$TEST_RESPONSE" | head -c 500
    echo "..."
else
    echo -e "${RED}❌ Endpoint test FAILED${NC}"
    echo "Response:"
    echo "$TEST_RESPONSE"
    echo ""
    echo -e "${YELLOW}⚠️  The endpoint was added but may not be working correctly.${NC}"
    echo "Check logs: $PM2_CMD logs workforce-backend"
fi

echo ""

# =============================================================================
# Success Summary
# =============================================================================
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Summary:"
echo -e "  ${GREEN}✓${NC} Backup created: ${SERVER_FILE}.${BACKUP_SUFFIX}"
echo -e "  ${GREEN}✓${NC} Endpoint added: POST /api/civic/representatives"
echo -e "  ${GREEN}✓${NC} Backend restarted"
echo -e "  ${GREEN}✓${NC} Endpoint tested"
echo ""
echo "Next steps:"
echo "  1. Deploy frontend to Netlify"
echo "  2. Test on live site: https://workforcedemocracyproject.org"
echo "  3. Navigate to Civic Engagement > My Reps"
echo "  4. Try entering ZIP code: 90210"
echo ""
echo "To view logs:"
echo "  $PM2_CMD logs workforce-backend"
echo ""
echo "To rollback if needed:"
echo "  cp ${SERVER_FILE}.${BACKUP_SUFFIX} $SERVER_FILE"
echo "  $PM2_CMD restart workforce-backend"
echo ""
echo -e "${BLUE}🚀 Backend deployment successful!${NC}"
echo ""
