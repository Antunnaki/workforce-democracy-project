#!/bin/bash
################################################################################
# NUCLEAR FIX - Clean slate approach
# This will work regardless of current server.js state
################################################################################

cd /var/www/workforce-backend

echo "🔧 Step 1: Find the most recent backup..."
LATEST_BACKUP=$(ls -t server.js.backup.* 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ No backup found! Creating one now..."
    cp server.js server.js.emergency-backup
    LATEST_BACKUP="server.js.emergency-backup"
fi

echo "Using backup: $LATEST_BACKUP"

echo ""
echo "🔧 Step 2: Restore from clean backup..."
cp "$LATEST_BACKUP" server.js

echo ""
echo "🔧 Step 3: Add axios require at top (if not present)..."
if ! grep -q "const axios = require('axios')" server.js; then
    # Add after the first few requires
    sed -i "3i const axios = require('axios');" server.js
    echo "✅ Added axios require"
else
    echo "✅ axios require already present"
fi

echo ""
echo "🔧 Step 4: Find where to insert nonprofit endpoints..."
# Find the line number of app.listen
LISTEN_LINE=$(grep -n "^app.listen" server.js | head -1 | cut -d: -f1)

if [ -z "$LISTEN_LINE" ]; then
    echo "❌ Could not find app.listen!"
    exit 1
fi

echo "Found app.listen at line: $LISTEN_LINE"
INSERT_LINE=$((LISTEN_LINE - 1))

echo ""
echo "🔧 Step 5: Create nonprofit endpoints code..."
cat > /tmp/nonprofit-code.txt << 'NONPROFIT'

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

NONPROFIT

echo ""
echo "🔧 Step 6: Insert nonprofit code at line $INSERT_LINE..."
# Use sed to insert the file content at the specific line
sed -i "${INSERT_LINE}r /tmp/nonprofit-code.txt" server.js

echo ""
echo "✅ Step 7: Verify the fix..."
echo ""
echo "Checking structure:"
echo "  - axios require line:"
grep -n "const axios = require('axios')" server.js | head -1

echo "  - nonprofit search endpoint line:"
grep -n "app.get('/api/nonprofits/search'" server.js | head -1

echo "  - app.listen line:"
grep -n "app.listen" server.js | head -1

# Verify order is correct
AXIOS_LINE=$(grep -n "const axios" server.js | head -1 | cut -d: -f1)
NONPROFIT_LINE=$(grep -n "app.get('/api/nonprofits/search'" server.js | head -1 | cut -d: -f1)
LISTEN_LINE_NEW=$(grep -n "app.listen" server.js | head -1 | cut -d: -f1)

echo ""
if [ "$NONPROFIT_LINE" -lt "$LISTEN_LINE_NEW" ]; then
    echo "✅ Order is correct: nonprofit endpoint ($NONPROFIT_LINE) is BEFORE app.listen ($LISTEN_LINE_NEW)"
else
    echo "❌ Order is WRONG: nonprofit endpoint ($NONPROFIT_LINE) is AFTER app.listen ($LISTEN_LINE_NEW)"
    echo "Manual intervention needed!"
    exit 1
fi

echo ""
echo "🔄 Step 8: Restart PM2..."
/opt/nodejs/bin/pm2 restart workforce-backend

echo ""
echo "⏳ Waiting for restart..."
sleep 4

echo ""
echo "🧪 Step 9: Test the endpoint..."
echo ""
TEST_RESULT=$(curl -s "http://localhost:3001/api/nonprofits/search?q=legal")

if echo "$TEST_RESULT" | grep -q '"success":true'; then
    echo "✅✅✅ SUCCESS! The endpoint is working! ✅✅✅"
    echo ""
    echo "Sample response:"
    echo "$TEST_RESULT" | python3 -m json.tool 2>/dev/null | head -30 || echo "$TEST_RESULT" | head -30
else
    echo "❌ Still not working. Response:"
    echo "$TEST_RESULT"
    echo ""
    echo "Checking PM2 logs for errors..."
    /opt/nodejs/bin/pm2 logs workforce-backend --lines 10 --nostream
fi

echo ""
echo "=================================="
echo "Done! Check logs with:"
echo "/opt/nodejs/bin/pm2 logs workforce-backend"
echo "=================================="
