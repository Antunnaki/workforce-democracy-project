#!/bin/bash
################################################################################
# ONE-PASTE NONPROFIT API PROXY DEPLOYMENT
# Version: V36.9.2
# Purpose: Deploy nonprofit proxy endpoints to VPS backend in ONE command
# Usage: Copy this ENTIRE file and paste into your VPS terminal
################################################################################

set -e  # Exit on any error

echo "=================================="
echo "🚀 Deploying Nonprofit API Proxy"
echo "=================================="

# Navigate to backend directory
cd /var/www/workforce-backend || { echo "❌ Backend directory not found"; exit 1; }

echo "📁 Current directory: $(pwd)"

# Backup existing server.js
echo "💾 Backing up current server.js..."
cp server.js "server.js.backup.$(date +%Y%m%d_%H%M%S)"

# Check if axios is installed
echo "📦 Checking axios dependency..."
if ! grep -q '"axios"' package.json 2>/dev/null; then
    echo "📦 Installing axios..."
    npm install axios
else
    echo "✅ axios already installed"
fi

# Add axios require if not present
echo "🔧 Adding axios require..."
if ! grep -q "const axios = require('axios')" server.js; then
    # Find the line with the last require statement and add axios after it
    sed -i "/const.*require(/a const axios = require('axios');" server.js
    echo "✅ Added axios require"
else
    echo "✅ axios require already exists"
fi

# Check if nonprofit endpoints already exist
if grep -q "app.get('/api/nonprofits/search'" server.js; then
    echo "⚠️  Nonprofit endpoints already exist - removing old version..."
    # Remove old nonprofit proxy section
    sed -i '/\/\/ ====.*ProPublica Nonprofit API Proxy/,/^app\.get.*api\/nonprofits.*$/d' server.js
fi

# Find insertion point (before app.listen or module.exports)
echo "📍 Finding insertion point..."

# Create the nonprofit proxy code block
cat > /tmp/nonprofit-proxy-code.txt << 'PROXYCODE'

// ============================================================================
// ProPublica Nonprofit API Proxy (V36.9.2)
// ============================================================================

app.get('/api/nonprofits/search', async (req, res) => {
    try {
        const query = req.query.q;
        
        if (!query || query.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Search query must be at least 2 characters'
            });
        }

        console.log(`🔍 Nonprofit search: "${query}"`);

        const propublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(propublicaUrl, {
            headers: {
                'User-Agent': 'Workforce-Democracy-Project/1.0'
            },
            timeout: 10000
        });

        console.log(`✅ Found ${response.data.organizations?.length || 0} organizations for "${query}"`);

        res.json({
            success: true,
            data: response.data.organizations || [],
            total: response.data.total_results || 0,
            query: query
        });

    } catch (error) {
        console.error('❌ Nonprofit search error:', error.message);
        
        res.status(500).json({
            success: false,
            error: 'Failed to search nonprofits',
            message: error.message
        });
    }
});

app.get('/api/nonprofits/:ein', async (req, res) => {
    try {
        const ein = req.params.ein;
        
        if (!ein || !/^\d+$/.test(ein)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid EIN format'
            });
        }

        console.log(`🔍 Nonprofit details: EIN ${ein}`);

        const propublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;
        
        const response = await axios.get(propublicaUrl, {
            headers: {
                'User-Agent': 'Workforce-Democracy-Project/1.0'
            },
            timeout: 10000
        });

        console.log(`✅ Retrieved details for ${response.data.organization?.name || 'organization'}`);

        res.json({
            success: true,
            data: response.data.organization || {}
        });

    } catch (error) {
        console.error('❌ Nonprofit details error:', error.message);
        
        res.status(500).json({
            success: false,
            error: 'Failed to get nonprofit details',
            message: error.message
        });
    }
});

PROXYCODE

# Insert before app.listen or module.exports
if grep -q "app.listen" server.js; then
    echo "📝 Inserting before app.listen..."
    sed -i '/app\.listen/r /tmp/nonprofit-proxy-code.txt' server.js
elif grep -q "module.exports" server.js; then
    echo "📝 Inserting before module.exports..."
    sed -i '/module\.exports/r /tmp/nonprofit-proxy-code.txt' server.js
else
    echo "📝 Appending to end of file..."
    cat /tmp/nonprofit-proxy-code.txt >> server.js
fi

# Clean up temp file
rm /tmp/nonprofit-proxy-code.txt

echo "✅ Code inserted successfully"

# Restart PM2
echo "🔄 Restarting backend with PM2..."
/opt/nodejs/bin/pm2 restart workforce-backend

# Wait for restart
echo "⏳ Waiting for backend to restart..."
sleep 3

# Test the endpoints
echo ""
echo "=================================="
echo "🧪 Testing Nonprofit API Endpoints"
echo "=================================="

echo ""
echo "Test 1: Search endpoint..."
SEARCH_RESULT=$(curl -s "http://localhost:3001/api/nonprofits/search?q=legal")
if echo "$SEARCH_RESULT" | grep -q '"success":true'; then
    echo "✅ Search endpoint working!"
    echo "   Found organizations: $(echo "$SEARCH_RESULT" | grep -o '"total":[0-9]*' | cut -d: -f2)"
else
    echo "❌ Search endpoint failed"
    echo "   Response: $SEARCH_RESULT"
fi

echo ""
echo "Test 2: Health check..."
if curl -s -f "http://localhost:3001/api/nonprofits/search?q=test" > /dev/null; then
    echo "✅ Endpoint is accessible"
else
    echo "❌ Endpoint not accessible"
fi

echo ""
echo "=================================="
echo "📊 Deployment Summary"
echo "=================================="
echo "✅ Backend code deployed"
echo "✅ PM2 restarted"
echo "✅ Endpoints tested"
echo ""
echo "Endpoints deployed:"
echo "  - GET /api/nonprofits/search?q=QUERY"
echo "  - GET /api/nonprofits/:ein"
echo ""
echo "Check PM2 logs:"
echo "  /opt/nodejs/bin/pm2 logs workforce-backend --lines 50"
echo ""
echo "=================================="
echo "🎉 DEPLOYMENT COMPLETE!"
echo "=================================="
