#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT v37.8.4 - Fix Community Support Feature
# ═══════════════════════════════════════════════════════════════════════════════
#
# PROBLEM: Community support "find local resources" feature shows error:
#          "Unable to reach community services database"
#
# ROOT CAUSE: Missing /api/nonprofits/search endpoint in backend/server.js
#
# SOLUTION: Add nonprofit proxy endpoints to backend server
#
# ═══════════════════════════════════════════════════════════════════════════════

cd /var/www/workforce-democracy/backend

# Backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
cp server.js "server.js.backup-$TIMESTAMP"
echo "✅ Backup created: server.js.backup-$TIMESTAMP"

echo ""
echo "🔧 Adding nonprofit API endpoints to server.js..."

# Create Node.js script to add the endpoints
cat > /tmp/add-nonprofit-endpoints.js << 'EOF_SCRIPT'
const fs = require('fs');

// Read current server.js
const content = fs.readFileSync('server.js', 'utf8');

// Check if nonprofit endpoints already exist
if (content.includes('/api/nonprofits/search')) {
    console.log('ℹ️  Nonprofit endpoints already exist in server.js');
    process.exit(0);
}

// Find the line where we should add the require statement
// Look for the other require statements near the top
const requirePattern = /const governmentAPIs = require\('\.\/government-apis'\);/;
const requireMatch = content.match(requirePattern);

if (!requireMatch) {
    console.error('❌ Could not find governmentAPIs require statement');
    process.exit(1);
}

// Add nonprofit-proxy require after governmentAPIs
const requireInsert = `const governmentAPIs = require('./government-apis');
const { searchNonprofits, getNonprofitDetails } = require('./nonprofit-proxy');`;

let updatedContent = content.replace(requirePattern, requireInsert);

// Find where to insert the nonprofit endpoints
// Look for the end of other API endpoints (before the START SERVER section)
const serverStartPattern = /\/\/ =+\n\/\/ START SERVER\n\/\/ =+/;

// Nonprofit endpoints to add
const nonprofitEndpoints = `
// =============================================================================
// NONPROFIT ORGANIZATION ENDPOINTS (Community Services)
// =============================================================================

/**
 * Search nonprofit organizations
 * GET /api/nonprofits/search?q=legal+aid&state=NY&city=New+York
 */
app.get('/api/nonprofits/search', async (req, res) => {
    try {
        const { q, state, city } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Search query (q) is required',
                example: '/api/nonprofits/search?q=legal+aid&state=NY'
            });
        }
        
        console.log(\`🔍 Nonprofit search: "\${q}" (state: \${state || 'any'}, city: \${city || 'any'})\`);
        
        const filters = {};
        if (state) filters.state = state;
        if (city) filters.city = city;
        
        const results = await searchNonprofits(q, filters);
        
        res.json({
            success: true,
            data: results,
            total: results.length,
            query: q,
            filters: filters
        });
        
    } catch (error) {
        console.error('❌ Nonprofit search error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to search nonprofits',
            details: 'Temporarily unavailable. Please try again later.'
        });
    }
});

/**
 * Get nonprofit organization details
 * GET /api/nonprofits/:ein
 */
app.get('/api/nonprofits/:ein', async (req, res) => {
    try {
        const { ein } = req.params;
        
        if (!ein || !/^\\d{9}$/.test(ein)) {
            return res.status(400).json({
                success: false,
                error: 'Valid 9-digit EIN is required'
            });
        }
        
        console.log(\`🔍 Fetching nonprofit details: \${ein}\`);
        
        const details = await getNonprofitDetails(ein);
        
        res.json({
            success: true,
            data: details
        });
        
    } catch (error) {
        console.error('❌ Nonprofit details error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to fetch nonprofit details'
        });
    }
});

`;

// Insert nonprofit endpoints before SERVER START section
updatedContent = updatedContent.replace(
    serverStartPattern,
    nonprofitEndpoints + '// =============================================================================\n// START SERVER\n// ============================================================================='
);

// Write updated content
fs.writeFileSync('server.js', updatedContent, 'utf8');
console.log('✅ Successfully added nonprofit API endpoints to server.js');
EOF_SCRIPT

# Run the script
node /tmp/add-nonprofit-endpoints.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to add endpoints"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION"
echo "═══════════════════════════════════════════════════════════════════════════════"

echo ""
echo "✅ Checking for nonprofit endpoints:"
if grep -q "/api/nonprofits/search" server.js; then
    echo "   ✅ /api/nonprofits/search endpoint found"
else
    echo "   ❌ /api/nonprofits/search NOT FOUND"
    exit 1
fi

if grep -q "require('./nonprofit-proxy')" server.js; then
    echo "   ✅ nonprofit-proxy require statement found"
else
    echo "   ❌ nonprofit-proxy require NOT FOUND"
    exit 1
fi

echo ""
echo "✅ Syntax check:"
node -c server.js && echo "   ✅ No syntax errors" || { echo "   ❌ SYNTAX ERROR"; exit 1; }

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🔄 PM2 RESTART"
echo "═══════════════════════════════════════════════════════════════════════════════"

pm2 restart backend

echo ""
echo "✅ Waiting for backend to stabilize..."
sleep 3

pm2 status backend

echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT v37.8.4 COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 What changed:"
echo "   ✅ Added /api/nonprofits/search endpoint"
echo "   ✅ Added /api/nonprofits/:ein endpoint"
echo "   ✅ Added nonprofit-proxy require statement"
echo ""
echo "🧪 Test the community support feature:"
echo "   1. Go to homepage"
echo "   2. Scroll to 'Find Community Support' section"
echo "   3. Enter a ZIP code (e.g., 10001)"
echo "   4. Click 'Search My State' or select a category"
echo ""
echo "📊 Expected behavior:"
echo "   • Should show local nonprofit organizations"
echo "   • Should display organization names, locations, and details"
echo "   • No more 'Unable to reach community services database' error"
echo ""
echo "📋 API endpoints now available:"
echo "   • GET /api/nonprofits/search?q=food&state=NY"
echo "   • GET /api/nonprofits/:ein"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
