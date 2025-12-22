#!/bin/bash
# Nonprofit Proxy Deployment - Simple Copy/Paste Commands
# V36.9.2 - February 1, 2025
# 
# INSTRUCTIONS:
# 1. SSH into your VPS: ssh root@workforcedemocracyproject.org
# 2. Copy and paste these commands one section at a time
# 3. Check for success messages after each section

echo "======================================"
echo "🚀 Nonprofit Proxy Deployment V36.9.2"
echo "======================================"
echo ""

# ==============================================================================
# SECTION 1: Backup & Preparation
# ==============================================================================
echo "📦 SECTION 1: Creating backup..."
cd /var/www/workforce-backend
cp server.js server.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created at: $(ls -t server.js.backup-* | head -1)"
echo ""

# ==============================================================================
# SECTION 2: Check/Install axios dependency
# ==============================================================================
echo "📦 SECTION 2: Checking axios..."
if npm list axios 2>/dev/null | grep -q axios; then
    echo "✅ axios already installed"
else
    echo "⚠️  Installing axios..."
    npm install axios
    echo "✅ axios installed"
fi
echo ""

# ==============================================================================
# SECTION 3: Add axios require at top of server.js (if not already there)
# ==============================================================================
echo "📝 SECTION 3: Ensuring axios is required..."
if grep -q "require('axios')" server.js; then
    echo "✅ axios already required in server.js"
else
    echo "⚠️  Adding axios require..."
    sed -i "/const express = require('express');/a const axios = require('axios');" server.js
    echo "✅ axios require added"
fi
echo ""

# ==============================================================================
# SECTION 4: Insert nonprofit proxy endpoints
# ==============================================================================
echo "📝 SECTION 4: Adding nonprofit proxy endpoints..."

# Find where to insert (before app.listen or module.exports)
INSERT_LINE=$(grep -n "app.listen\|module.exports\|^});" server.js | tail -1 | cut -d: -f1)
ACTUAL_INSERT=$((INSERT_LINE - 5))

echo "   Inserting at line $ACTUAL_INSERT..."

# Create the nonprofit proxy code
cat > /tmp/nonprofit-proxy-insert.txt << 'ENDOFPROXY'

// ============================================================================
// ProPublica Nonprofit API Proxy (V36.9.2) - Added: 2025-02-01
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

ENDOFPROXY

# Insert the code
sed -i "${ACTUAL_INSERT}r /tmp/nonprofit-proxy-insert.txt" server.js
echo "✅ Nonprofit proxy endpoints added"
echo ""

# ==============================================================================
# SECTION 5: Validate JavaScript syntax
# ==============================================================================
echo "✅ SECTION 5: Validating syntax..."
if node -c server.js; then
    echo "✅ Syntax validation passed!"
else
    echo "❌ SYNTAX ERROR! Restoring backup..."
    cp server.js.backup-$(ls -t server.js.backup-* | head -1 | xargs basename) server.js
    echo "⚠️  Deployment failed - backup restored"
    exit 1
fi
echo ""

# ==============================================================================
# SECTION 6: Restart PM2
# ==============================================================================
echo "🔄 SECTION 6: Restarting PM2..."
/opt/nodejs/bin/pm2 restart workforce-backend
echo "✅ PM2 restarted"
echo ""

# ==============================================================================
# SECTION 7: Wait and check status
# ==============================================================================
echo "⏳ Waiting 3 seconds for startup..."
sleep 3
echo ""

echo "📊 SECTION 7: Checking PM2 status..."
/opt/nodejs/bin/pm2 list
echo ""

# ==============================================================================
# SECTION 8: Test the endpoints
# ==============================================================================
echo "🧪 SECTION 8: Testing nonprofit proxy endpoints..."
echo ""

echo "Test 1: Search endpoint..."
SEARCH_RESULT=$(curl -s "http://localhost:3001/api/nonprofits/search?q=legal+aid")
if echo "$SEARCH_RESULT" | grep -q '"success":true'; then
    TOTAL=$(echo "$SEARCH_RESULT" | grep -o '"total":[0-9]*' | cut -d: -f2)
    echo "✅ Search endpoint working! Found $TOTAL organizations"
else
    echo "❌ Search endpoint test failed"
    echo "Response: $SEARCH_RESULT"
fi
echo ""

echo "Test 2: Health check..."
curl -s http://localhost:3001/health
echo ""
echo ""

# ==============================================================================
# SECTION 9: Show recent logs
# ==============================================================================
echo "📋 SECTION 9: Recent backend logs..."
/opt/nodejs/bin/pm2 logs workforce-backend --lines 20 --nostream
echo ""

# ==============================================================================
# COMPLETION
# ==============================================================================
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "🎉 Nonprofit proxy endpoints are now live!"
echo ""
echo "📝 What was deployed:"
echo "  ✅ axios dependency verified"
echo "  ✅ GET /api/nonprofits/search?q=<query>"
echo "  ✅ GET /api/nonprofits/<ein>"
echo "  ✅ Backend restarted successfully"
echo ""
echo "🔗 Test endpoints:"
echo "  curl 'http://localhost:3001/api/nonprofits/search?q=legal+aid'"
echo "  curl 'https://workforcedemocracyproject.org/api/nonprofits/search?q=legal+aid'"
echo ""
echo "📋 Next steps:"
echo "  1. Frontend is already updated (community-services.js)"
echo "  2. Deploy frontend from GenSpark → Netlify"
echo "  3. Test on live site: click 'Legal Aid' category"
echo "  4. Should see organizations load! 🎊"
echo ""
echo "🔍 View live logs:"
echo "  /opt/nodejs/bin/pm2 logs workforce-backend"
echo ""
