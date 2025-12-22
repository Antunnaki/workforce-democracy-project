# 🚨 QUICK FIX - Nonprofit Endpoints Not Working

## What Happened

The deployment script ran successfully but the endpoints return "Cannot GET" error. This means the code wasn't inserted in the right location in server.js.

---

## 🔍 STEP 1: Diagnose the Issue

Copy and paste this into your VPS terminal:

```bash
cd /var/www/workforce-backend

echo "=== Checking axios require ==="
grep -n "const axios" server.js | head -3

echo ""
echo "=== Checking nonprofit endpoints ==="
grep -n "app.get('/api/nonprofits" server.js | head -5

echo ""
echo "=== Checking app.listen location ==="
grep -n "app.listen" server.js | head -3

echo ""
echo "=== Last 40 lines of server.js ==="
tail -40 server.js
```

**Copy the output and I'll tell you exactly what to do next!**

---

## 🩹 LIKELY QUICK FIX

If the endpoints are in the file but after `app.listen`, run this:

```bash
cd /var/www/workforce-backend

# Restore from backup
cp server.js.backup.* server.js.working-copy 2>/dev/null || true

# Create a clean fix script
cat > /tmp/fix-endpoints.js << 'ENDFIX'

const axios = require('axios');

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

ENDFIX

echo "Fix code saved to /tmp/fix-endpoints.js"
echo "Please share the diagnostic output first!"
```

---

## ⚠️ IMPORTANT

**Before we proceed with manual fixes, please run the diagnostic commands above and share the output.**

This will help me give you the EXACT commands to fix it without breaking anything.
