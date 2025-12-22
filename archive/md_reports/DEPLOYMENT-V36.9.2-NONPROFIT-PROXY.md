# Deployment Guide: V36.9.2 - Nonprofit API Proxy

## 🎯 Purpose
Fix the CORS issue preventing nonprofit data from loading in the Community Services widget.

## 🔍 Problem Summary
**Issue**: When users click service categories (Legal Aid, Housing, etc.), no organizations load.

**Root Cause**: Frontend JavaScript was calling ProPublica API directly from browser, which is blocked by CORS policy:
```
Access to fetch at 'https://projects.propublica.org/nonprofits/api/v2/search.json?q=...' 
from origin 'https://www.genspark.ai' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Solution**: Route requests through backend proxy (same pattern as chat assistant, which works).

---

## 📋 Deployment Steps

### STEP 1: Deploy Backend Changes (VPS)

SSH into VPS:
```bash
ssh root@workforcedemocracyproject.org
```

Navigate to backend directory:
```bash
cd /var/www/workforce-backend
```

**Option A: Edit server.js Manually**

Open the file:
```bash
nano server.js
```

Find the section with other route handlers (around line 100-150, BEFORE any catch-all routes).

Add the following code:

```javascript
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
```

Save and exit (Ctrl+X, Y, Enter).

**Option B: Use sed to insert code automatically**

```bash
# This will add the nonprofit proxy routes after line 100
# (Adjust line number based on actual server.js structure)
sed -i '100 r BACKEND-NONPROFIT-PROXY.js' server.js
```

**Restart the backend:**
```bash
/opt/nodejs/bin/pm2 restart workforce-backend
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

Verify the server restarted successfully and look for any errors.

---

### STEP 2: Test Backend API (Before Frontend Deployment)

Test the new endpoints from command line:

```bash
# Test nonprofit search
curl "https://workforcedemocracyproject.org/api/nonprofits/search?q=legal+aid"

# Expected response:
# {"success":true,"data":[...array of organizations...],"total":123,"query":"legal aid"}

# Test EIN lookup (example EIN)
curl "https://workforcedemocracyproject.org/api/nonprofits/131635294"

# Expected response:
# {"success":true,"data":{...organization details...}}
```

If you get `{"success":true,...}` responses, the backend is working! 🎉

---

### STEP 3: Deploy Frontend Changes (GenSpark → Netlify)

Frontend changes have already been made in the GenSpark workspace:

1. ✅ **Updated** `js/community-services.js` to use backend proxy
2. ✅ **Updated** `index.html` to load new version (`v=20250201-V36.9.2-PROXY`)

**To deploy:**

1. Go to **Publish tab** in GenSpark workspace
2. Click **Deploy** button
3. Wait for Netlify deployment to complete
4. Verify the deployment URL

---

### STEP 4: Test the Complete Flow

1. **Open the live website** (after frontend deployment)
2. **Click on "Community Services" tab** (should be selected by default)
3. **Click on a category** (e.g., "Legal Aid" ⚖️)
4. **Watch for organizations to load**

**Expected behavior:**
- Loading spinner appears
- Organizations load with names, cities, states
- Console logs show: `🔍 Searching via backend proxy: legal aid`
- Console logs show: `✅ Found 6 organizations`

**If it doesn't work:**
- Open browser DevTools (F12)
- Check Console tab for errors
- Check Network tab for failed requests to `/api/nonprofits/search`
- Verify backend is running: `curl https://workforcedemocracyproject.org/api/nonprofits/search?q=test`

---

## 📊 Architecture Comparison

### ❌ Before (Broken - CORS blocked):
```
Browser → https://projects.propublica.org/nonprofits/api/v2/search.json
          ❌ BLOCKED: No 'Access-Control-Allow-Origin' header
```

### ✅ After (Working - Backend proxy):
```
Browser → https://workforcedemocracyproject.org/api/nonprofits/search
          ↓
Backend (VPS) → https://projects.propublica.org/nonprofits/api/v2/search.json
                ↓
Backend → Browser (JSON response)
          ✅ SUCCESS: CORS headers added by our backend
```

---

## 🔧 Troubleshooting

### Backend not starting after restart?

Check PM2 logs:
```bash
/opt/nodejs/bin/pm2 logs workforce-backend --lines 100
```

Look for syntax errors or missing dependencies.

### "axios is not defined" error?

Verify axios is installed:
```bash
cd /var/www/workforce-backend
npm list axios
```

If not installed:
```bash
npm install axios
/opt/nodejs/bin/pm2 restart workforce-backend
```

### Frontend still calling old API?

Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R).

Check the version number in the script tag matches `v=20250201-V36.9.2-PROXY`.

### API returning errors?

Check if ProPublica API is down:
```bash
curl "https://projects.propublica.org/nonprofits/api/v2/search.json?q=test"
```

If this returns an error, the issue is with ProPublica's API, not our proxy.

---

## 📝 Files Changed

### Frontend (GenSpark Workspace):
- ✅ `js/community-services.js` - Updated API calls to use backend proxy
- ✅ `index.html` - Updated script version to force cache refresh

### Backend (VPS - Manual deployment required):
- 🔄 `/var/www/workforce-backend/server.js` - Add nonprofit proxy endpoints (STEP 1)

---

## ✅ Verification Checklist

- [ ] Backend deployed and restarted
- [ ] Backend API responds to test curl requests
- [ ] Frontend deployed to Netlify
- [ ] Community Services widget visible on homepage
- [ ] Clicking "Legal Aid" loads organizations
- [ ] Organizations display with proper formatting
- [ ] No CORS errors in browser console
- [ ] All 6 service categories work (Legal Aid, Housing, Healthcare, Food, Workers' Rights, Mental Health)

---

## 🎉 Success Criteria

When everything works correctly, users should be able to:

1. Click on any service category (Legal Aid, Housing, etc.)
2. See a loading spinner briefly
3. See 6 organizations load with:
   - Organization name
   - City and state
   - Icon/emoji for category
4. No CORS errors in console
5. Smooth user experience

---

## 📚 Related Documentation

- **VPS Access Guide**: `/root/VPS-ACCESS-AND-PROJECT-STRUCTURE.md`
- **Backend Proxy Code**: `BACKEND-NONPROFIT-PROXY.js` (in GenSpark workspace)
- **ProPublica API Docs**: https://projects.propublica.org/nonprofits/api

---

**Version**: V36.9.2  
**Date**: 2025-02-01  
**Author**: AI Assistant  
**Status**: Ready for deployment
