#!/bin/bash
################################################################################
# SIMPLE FIX - Move Nonprofit Endpoints Before app.listen
################################################################################

cd /var/www/workforce-backend

echo "🔧 Step 1: Backup current state..."
cp server.js server.js.before-fix

echo "🔧 Step 2: Remove duplicate axios requires..."
# Keep only the first axios require, remove others
sed -i '4,8{/const axios = require/d}' server.js

echo "🔧 Step 3: Remove nonprofit endpoints from after app.listen..."
# Find and remove the nonprofit proxy section that's after app.listen
sed -i '/^\/\/ ====.*ProPublica Nonprofit API Proxy/,/^});$/d' server.js

echo "🔧 Step 4: Insert nonprofit endpoints BEFORE app.listen..."
# Create the nonprofit code
cat > /tmp/nonprofit-endpoints.txt << 'ENDPOINTS'

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

ENDPOINTS

# Insert before app.listen
sed -i '/^app\.listen(port,/e cat /tmp/nonprofit-endpoints.txt' server.js

echo "✅ Step 5: Verify changes..."
echo ""
echo "Axios require count (should be 1):"
grep -c "const axios" server.js

echo ""
echo "Nonprofit endpoint line:"
grep -n "app.get('/api/nonprofits/search'" server.js

echo ""
echo "app.listen line:"
grep -n "app.listen" server.js

echo ""
echo "🔄 Step 6: Restart PM2..."
/opt/nodejs/bin/pm2 restart workforce-backend

sleep 3

echo ""
echo "🧪 Step 7: Test endpoint..."
TEST_RESULT=$(curl -s "http://localhost:3001/api/nonprofits/search?q=legal")

if echo "$TEST_RESULT" | grep -q '"success":true'; then
    echo "✅ SUCCESS! Endpoint is working!"
    echo ""
    echo "Response preview:"
    echo "$TEST_RESULT" | head -c 500
    echo "..."
else
    echo "❌ Endpoint still not working"
    echo "Response:"
    echo "$TEST_RESULT"
fi

echo ""
echo "=================================="
echo "Check PM2 logs for details:"
echo "/opt/nodejs/bin/pm2 logs workforce-backend --lines 20"
echo "=================================="
