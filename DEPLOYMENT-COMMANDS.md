# 🚀 EXACT DEPLOYMENT COMMANDS FOR VPS

**Current Status**: You're logged in as `root@Workforce-Backend:~#`

---

## STEP 1: CREATE nonprofit-proxy.js

```bash
cd /var/www/workforce-democracy/backend
nano nonprofit-proxy.js
```

**Paste this ENTIRE code** (162 lines):

```javascript
const fetch = require('node-fetch');

// ============================================================================
// PROPUBLICA NONPROFIT EXPLORER API PROXY
// ============================================================================
// Purpose: Backend proxy for ProPublica Nonprofit Explorer API
// Why: Avoids CORS issues when calling from frontend
// Features: 15-minute caching, error handling, rate limiting protection
// ============================================================================

// In-memory cache with TTL
const nonprofitCache = new Map();
const CACHE_TTL = 900000; // 15 minutes in milliseconds

/**
 * Search nonprofits using ProPublica API
 * @param {string} query - Search term (e.g., "food bank", "legal aid")
 * @param {object} filters - Optional filters (state, city)
 * @returns {Promise<Array>} Array of nonprofit organizations
 */
async function searchNonprofits(query, filters = {}) {
    const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
    
    // Check cache first
    if (nonprofitCache.has(cacheKey)) {
        const cached = nonprofitCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('📦 Cache hit for query:', query);
            return cached.data;
        }
        // Cache expired, remove it
        nonprofitCache.delete(cacheKey);
    }
    
    try {
        // Build ProPublica API URL
        let apiUrl = `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${encodeURIComponent(query)}`;
        
        // Add filters if provided
        if (filters.state) {
            apiUrl += `&state[id]=${filters.state}`;
        }
        if (filters.city) {
            apiUrl += `&city=${encodeURIComponent(filters.city)}`;
        }
        
        console.log('🔍 Fetching from ProPublica:', query);
        
        // Make API request
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Workforce Democracy Project (Community Services)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`ProPublica API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const organizations = data.organizations || [];
        
        // Cache the results
        nonprofitCache.set(cacheKey, {
            data: organizations,
            timestamp: Date.now()
        });
        
        console.log(`✅ Found ${organizations.length} organizations for: ${query}`);
        return organizations;
        
    } catch (error) {
        console.error('❌ ProPublica search error:', error.message);
        throw error;
    }
}

/**
 * Get detailed information about a specific nonprofit
 * @param {string} ein - Employer Identification Number
 * @returns {Promise<Object>} Detailed nonprofit information
 */
async function getNonprofitDetails(ein) {
    const cacheKey = `details_${ein}`;
    
    // Check cache first
    if (nonprofitCache.has(cacheKey)) {
        const cached = nonprofitCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
            console.log('📦 Cache hit for EIN:', ein);
            return cached.data;
        }
        nonprofitCache.delete(cacheKey);
    }
    
    try {
        const apiUrl = `https://projects.propublica.org/nonprofits/api/v2/organizations/${ein}.json`;
        
        console.log('🔍 Fetching details for EIN:', ein);
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Workforce Democracy Project (Community Services)',
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`ProPublica API returned ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Cache the results
        nonprofitCache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        console.log('✅ Retrieved details for EIN:', ein);
        return data;
        
    } catch (error) {
        console.error('❌ ProPublica details error:', error.message);
        throw error;
    }
}

/**
 * Clean expired cache entries
 * Runs periodically to prevent memory leaks
 */
function cleanCache() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, value] of nonprofitCache.entries()) {
        if (now - value.timestamp >= CACHE_TTL) {
            nonprofitCache.delete(key);
            cleaned++;
        }
    }
    
    if (cleaned > 0) {
        console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
    }
}

// Clean cache every 30 minutes
setInterval(cleanCache, 1800000);

module.exports = {
    searchNonprofits,
    getNonprofitDetails,
    cleanCache
};
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

---

## STEP 2: UPDATE server.js

```bash
nano server.js
```

### 2A. Add require statement at the TOP (around line 10-20, after other requires):

```javascript
const { searchNonprofits, getNonprofitDetails } = require('./nonprofit-proxy');
```

### 2B. Add these 3 endpoints AFTER line 600 (after the `/api/backend/query` endpoint):

```javascript
// ============================================================================
// PROPUBLICA NONPROFIT API ENDPOINTS
// ============================================================================

// Search nonprofits
app.get('/api/nonprofits/search', async (req, res) => {
    const { q, state, city } = req.query;
    
    if (!q) {
        return res.status(400).json({
            success: false,
            error: 'Search query (q) is required'
        });
    }
    
    try {
        const organizations = await searchNonprofits(q, { state, city });
        
        res.json({
            success: true,
            data: organizations,
            total: organizations.length,
            query: q,
            filters: { state, city }
        });
    } catch (error) {
        console.error('Nonprofit search error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to search nonprofits at this time'
        });
    }
});

// Get nonprofit details by EIN
app.get('/api/nonprofits/:ein', async (req, res) => {
    const { ein } = req.params;
    
    try {
        const details = await getNonprofitDetails(ein);
        
        res.json({
            success: true,
            data: details
        });
    } catch (error) {
        console.error('Nonprofit details error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to retrieve nonprofit details'
        });
    }
});

// AI-powered recommendations (optional - uses existing analyzeWithAI function)
app.post('/api/nonprofits/recommend', async (req, res) => {
    const { organizations, preferences } = req.body;
    
    if (!organizations || !Array.isArray(organizations)) {
        return res.status(400).json({
            success: false,
            error: 'Organizations array is required'
        });
    }
    
    try {
        const prompt = `Analyze these ${organizations.length} nonprofit organizations and rank them based on:
- Relevance to user needs: ${preferences?.category || 'general community support'}
- Financial health (revenue, assets)
- Service area coverage
- Mission alignment

Organizations data:
${JSON.stringify(organizations.slice(0, 10), null, 2)}

Return a JSON array of the top 5 recommended organizations with explanations.`;

        const aiResponse = await analyzeWithAI(prompt);
        
        res.json({
            success: true,
            recommendations: aiResponse
        });
    } catch (error) {
        console.error('AI recommendation error:', error);
        res.status(500).json({
            success: false,
            error: 'Unable to generate recommendations'
        });
    }
});
```

**Save**: Press `Ctrl+X`, then `Y`, then `Enter`

---

## STEP 3: RESTART BACKEND

```bash
pm2 restart backend
pm2 logs backend --lines 20
```

**Expected output**: Should show "Server running on port 3001" with no errors

---

## STEP 4: TEST THE FIX

### Test 1: Direct API call
```bash
curl "http://localhost:3001/api/nonprofits/search?q=food"
```

**Expected**: JSON response with food banks/pantries

### Test 2: From frontend
1. Open: https://workforcedemocracyproject.org/community-services.html
2. Click on any category (Food Assistance, Legal Aid, etc.)
3. Should see list of organizations instead of error message

---

## 🔍 TROUBLESHOOTING

### If you see "Cannot find module 'node-fetch'":
```bash
cd /var/www/workforce-democracy/backend
npm install node-fetch
pm2 restart backend
```

### If port 3001 conflicts:
```bash
pm2 logs backend
# Check for port errors
netstat -tulpn | grep 3001
```

### If organizations don't load:
```bash
# Check nginx proxy
cat /etc/nginx/sites-available/workforce-democracy
# Should have proxy_pass to http://localhost:3001
sudo nginx -t
sudo systemctl reload nginx
```

### Check live logs:
```bash
pm2 logs backend --lines 50
```

---

## 📊 VERIFICATION CHECKLIST

- [ ] `nonprofit-proxy.js` created in `/var/www/workforce-democracy/backend/`
- [ ] `server.js` updated with require statement
- [ ] `server.js` updated with 3 new endpoints
- [ ] PM2 restarted successfully
- [ ] `curl` test returns JSON data
- [ ] Frontend categories load organizations
- [ ] No errors in `pm2 logs backend`

---

## 📁 FILE LOCATIONS

- **Frontend**: `/var/www/workforce-democracy/js/community-services.js` (no changes needed)
- **Backend Proxy**: `/var/www/workforce-democracy/backend/nonprofit-proxy.js` (NEW)
- **Backend Server**: `/var/www/workforce-democracy/backend/server.js` (MODIFIED)
- **Nginx Config**: `/etc/nginx/sites-available/workforce-democracy`

---

## 🎯 WHAT THIS FIXES

**Before**: Clicking categories → Error message
**After**: Clicking categories → List of real nonprofit organizations from ProPublica database

**Categories that will work**:
- Legal Aid
- Housing Assistance  
- Healthcare Services
- Food Assistance
- Employment Services
- Mental Health Support

---

## 💡 VPS INFORMATION (from your project docs)

- **IP Address**: 185.193.126.13
- **Hostname**: Workforce-Backend
- **Current User**: root (you're already logged in!)
- **Project Path**: /var/www/workforce-democracy
- **Backend Port**: 3001
- **Process Manager**: PM2
- **Web Server**: Nginx (proxies to backend)

---

## 🚫 YOU DON'T NEED

- ❌ `scp` command (you're already on the VPS)
- ❌ SSH credentials (you're already authenticated)
- ❌ Password (you're already root)
- ❌ File transfer tools (use `nano` directly)

---

## ⚡ QUICK DEPLOYMENT (Copy-Paste)

```bash
# Navigate to backend
cd /var/www/workforce-democracy/backend

# Create nonprofit-proxy.js
nano nonprofit-proxy.js
# [Paste the 162-line code from above]
# Save: Ctrl+X, Y, Enter

# Update server.js
nano server.js
# [Add require at top]
# [Add 3 endpoints after line 600]
# Save: Ctrl+X, Y, Enter

# Restart backend
pm2 restart backend

# Test
curl "http://localhost:3001/api/nonprofits/search?q=food"

# Done! 🎉
```

---

## 📞 NEXT STEPS AFTER DEPLOYMENT

1. Test all 6 community support categories on frontend
2. Verify organizations load correctly
3. Check AI personalization works (should rank results by relevance)
4. Monitor `pm2 logs backend` for any errors
5. Test with different search terms (legal, housing, healthcare, etc.)

---

**Need help?** Just paste the error message and I'll troubleshoot immediately.
