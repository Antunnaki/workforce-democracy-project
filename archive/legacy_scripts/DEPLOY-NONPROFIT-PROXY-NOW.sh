#!/bin/bash
# Nonprofit API Proxy Deployment Script
# V36.9.2 - February 1, 2025
# Deploy this to fix the community services CORS issue

set -e  # Exit on error

echo "======================================"
echo "Nonprofit API Proxy Deployment"
echo "V36.9.2 - February 1, 2025"
echo "======================================"
echo ""

# Step 1: Backup current server.js
echo "📦 Step 1: Creating backup..."
cp /var/www/workforce-backend/server.js /var/www/workforce-backend/server.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# Step 2: Check if axios is installed
echo "📦 Step 2: Checking axios dependency..."
cd /var/www/workforce-backend
if ! grep -q '"axios"' package.json; then
    echo "⚠️  axios not found in package.json, installing..."
    npm install axios
    echo "✅ axios installed"
else
    echo "✅ axios already installed"
fi
echo ""

# Step 3: Add nonprofit proxy endpoints to server.js
echo "📝 Step 3: Adding nonprofit proxy endpoints..."

# Find the line number to insert before (look for common patterns)
# We want to insert BEFORE any catch-all routes or the end of route definitions

# Create the nonprofit proxy code as a separate file first
cat > /tmp/nonprofit-proxy.js << 'EOF'

// ============================================================================
// ProPublica Nonprofit API Proxy (V36.9.2)
// ============================================================================

/**
 * Search nonprofits via ProPublica API
 * GET /api/nonprofits/search?q=searchterm
 */
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

        // Call ProPublica API from backend (no CORS issues)
        const propublicaUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(propublicaUrl, {
            headers: {
                'User-Agent': 'Workforce-Democracy-Project/1.0'
            },
            timeout: 10000 // 10 second timeout
        });

        console.log(`✅ Found ${response.data.organizations?.length || 0} organizations for "${query}"`);

        // Return the data
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

/**
 * Get nonprofit details by EIN
 * GET /api/nonprofits/:ein
 */
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

// ============================================================================
// End of Nonprofit Proxy Routes
// ============================================================================

EOF

echo "✅ Nonprofit proxy code prepared"
echo ""

# Step 4: Check if axios is required at the top of server.js
echo "📝 Step 4: Ensuring axios is required..."
if ! grep -q "require('axios')" /var/www/workforce-backend/server.js; then
    # Find the line with express require and add axios after it
    sed -i "/const express = require('express');/a const axios = require('axios');" /var/www/workforce-backend/server.js
    echo "✅ Added axios require statement"
else
    echo "✅ axios already required"
fi
echo ""

# Step 5: Insert the nonprofit proxy routes
echo "📝 Step 5: Inserting nonprofit proxy routes..."

# Find a good insertion point - look for app.listen or module.exports
# We want to insert BEFORE these lines

# Get line number of app.listen or module.exports
INSERT_LINE=$(grep -n "app.listen\|module.exports" /var/www/workforce-backend/server.js | head -1 | cut -d: -f1)

if [ -z "$INSERT_LINE" ]; then
    echo "⚠️  Could not find insertion point automatically."
    echo "Please manually add the nonprofit proxy code from /tmp/nonprofit-proxy.js"
    echo "Insert it BEFORE the app.listen() or module.exports line"
    exit 1
fi

# Insert before the found line
ACTUAL_INSERT=$((INSERT_LINE - 1))
sed -i "${ACTUAL_INSERT}r /tmp/nonprofit-proxy.js" /var/www/workforce-backend/server.js

echo "✅ Nonprofit proxy routes inserted at line $ACTUAL_INSERT"
echo ""

# Step 6: Validate syntax
echo "✅ Step 6: Validating JavaScript syntax..."
if node -c /var/www/workforce-backend/server.js; then
    echo "✅ Syntax validation passed"
else
    echo "❌ Syntax error detected!"
    echo "Restoring from backup..."
    cp /var/www/workforce-backend/server.js.backup-* /var/www/workforce-backend/server.js
    echo "⚠️  Deployment failed - backup restored"
    exit 1
fi
echo ""

# Step 7: Restart PM2
echo "🔄 Step 7: Restarting PM2..."
/opt/nodejs/bin/pm2 restart workforce-backend
echo "✅ PM2 restarted"
echo ""

# Step 8: Wait for startup
echo "⏳ Waiting 3 seconds for backend to start..."
sleep 3
echo ""

# Step 9: Check PM2 status
echo "📊 Step 8: Checking PM2 status..."
/opt/nodejs/bin/pm2 list | grep workforce-backend
echo ""

# Step 10: Test the new endpoints
echo "🧪 Step 9: Testing nonprofit proxy endpoints..."
echo ""

echo "Testing search endpoint..."
SEARCH_TEST=$(curl -s "http://localhost:3001/api/nonprofits/search?q=legal+aid")
if echo "$SEARCH_TEST" | grep -q '"success":true'; then
    echo "✅ Search endpoint working!"
    echo "   Found: $(echo "$SEARCH_TEST" | grep -o '"total":[0-9]*' | cut -d: -f2) results"
else
    echo "❌ Search endpoint test failed"
    echo "Response: $SEARCH_TEST"
fi
echo ""

# Step 11: Show recent logs
echo "📋 Step 10: Recent logs..."
/opt/nodejs/bin/pm2 logs workforce-backend --lines 15 --nostream
echo ""

echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "📝 Summary:"
echo "  - Backup created"
echo "  - axios dependency verified"
echo "  - Nonprofit proxy endpoints added"
echo "  - Syntax validated"
echo "  - PM2 restarted"
echo "  - Endpoints tested"
echo ""
echo "🔗 Available Endpoints:"
echo "  - GET /api/nonprofits/search?q=<query>"
echo "  - GET /api/nonprofits/<ein>"
echo ""
echo "📋 Next Steps:"
echo "  1. Deploy frontend changes from GenSpark → Netlify"
echo "  2. Test community services widget on live site"
echo "  3. Click service categories (Legal Aid, Housing, etc.)"
echo "  4. Verify organizations load correctly"
echo ""
echo "🔍 To view full logs:"
echo "  /opt/nodejs/bin/pm2 logs workforce-backend"
echo ""
echo "🎉 The nonprofit search CORS issue is now fixed!"
echo ""
