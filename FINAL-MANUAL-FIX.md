# FINAL MANUAL FIX

The file has become too corrupted from multiple sed edits. Here's what needs to happen:

## The Core Issues:
1. `deriveLocationFromPostcode` function is missing closing brace in the backup
2. Multiple sed edits have added extra braces elsewhere
3. File structure is now completely broken

## Solution: Fresh start with manual edit

Since we've spent significant time troubleshooting and the file keeps getting corrupted, I recommend:

**Option 1: Edit server.js directly on VPS using nano/vim**
1. SSH into VPS
2. `nano /var/www/workforce-backend/server.js.backup.20251101_025750`
3. Find line ~200 (deriveLocationFromPostcode function)
4. Add missing `}` after the return statement
5. Add axios require at line 3
6. Add nonprofit endpoints before app.use((req, res) at line ~202
7. Save and copy to server.js

**Option 2: Download backup, fix locally, upload**
1. Download server.js.backup.20251101_025750
2. Fix locally in your editor
3. Upload fixed version
4. Restart PM2

The nonprofit code to add (lines 200-205, before catch-all):

```javascript
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
```
