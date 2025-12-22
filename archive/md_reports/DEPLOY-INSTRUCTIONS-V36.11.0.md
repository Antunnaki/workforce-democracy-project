# 🚀 Deployment Instructions - US Representatives V36.11.0

**Date:** November 1, 2025  
**What:** Replace mock data with real Congress.gov + OpenStates APIs  
**Estimated time:** 10 minutes

---

## 📋 **Pre-Deployment Checklist**

✅ Congress.gov API key added to `.env`  
✅ OpenStates API key added to `.env`  
✅ Backend server currently running  
✅ SSH access to VPS ready

---

## 🚀 **Deployment Steps**

### **Step 1: Upload us-representatives.js to VPS**

```bash
# SSH into VPS
ssh root@185.193.126.13

# Create the new module file
cat > /var/www/workforce-democracy/backend/us-representatives.js << 'ENDOFFILE'
[PASTE ENTIRE us-representatives.js CONTENT HERE]
ENDOFFILE
```

**Note:** I'll provide you the exact file content to paste in the next message.

---

### **Step 2: Backup Current server.js**

```bash
# Create backup
cp /var/www/workforce-democracy/backend/server.js \
   /var/www/workforce-democracy/backend/server.js.backup-$(date +%Y%m%d-%H%M%S)

# Verify backup created
ls -lht /var/www/workforce-democracy/backend/*.backup* | head -1
```

---

### **Step 3: Update server.js**

**Add the require statement at the top of server.js (after other requires):**

```bash
# Find the line with "const Groq = require('groq-sdk');" and add after it
sed -i "/const Groq = require('groq-sdk');/a const usReps = require('./us-representatives');" \
    /var/www/workforce-democracy/backend/server.js
```

**Replace the getMockRepresentatives function:**

```bash
# Remove the mock function (it's no longer needed)
# We'll replace the entire endpoint instead
```

**Replace the POST /api/civic/representatives endpoint:**

```bash
# This is complex, so we'll use a temporary file
cat > /tmp/new_endpoint.txt << 'ENDPOINT'
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { user_id, location } = req.body;
        
        if (!location || !location.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        const zipCode = location.zipCode;
        console.log(`[Civic API] Looking up representatives for ZIP: ${zipCode}`);
        
        // ✨ Use real Congress.gov + OpenStates APIs
        const result = await usReps.getRepresentativesByZip(zipCode);
        
        const responseTime = Date.now() - startTime;
        console.log(`[Civic API] Found ${result.representatives?.length || 0} representatives (${responseTime}ms)`);
        
        // Return result
        res.json({
            success: result.success,
            representatives: result.representatives || [],
            location_used: result.location_used,
            counts: result.counts,
            data_sources: result.data_sources,
            cached: result.cached || false,
            timestamp: result.timestamp
        });
        
    } catch (error) {
        console.error(`[Civic API] Error:`, error.message);
        
        res.status(500).json({
            success: false,
            error: 'Failed to fetch representatives',
            message: error.message,
            representatives: [],
            timestamp: Date.now()
        });
    }
});
ENDPOINT
```

---

### **Step 4: Manual Edit (Safest Approach)**

Since sed replacements for large blocks can be tricky, here's the **manual approach**:

```bash
# Open server.js in nano
nano /var/www/workforce-democracy/backend/server.js
```

**Find these sections and make changes:**

1. **At the top (around line 5-10), add:**
   ```javascript
   const usReps = require('./us-representatives');
   ```

2. **Find the POST /api/civic/representatives endpoint (around line 450-500)**
   - Delete the entire `app.post('/api/civic/representatives', ...)` block
   - Replace with the new code from `/tmp/new_endpoint.txt`

3. **Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 5: Validate Syntax**

```bash
# Check for syntax errors
node -c /var/www/workforce-democracy/backend/server.js

# If no output, syntax is good!
# If errors, fix them before proceeding
```

---

### **Step 6: Restart Backend**

```bash
# Restart PM2
/opt/nodejs/bin/pm2 restart workforce-backend

# Check status
/opt/nodejs/bin/pm2 list

# Watch logs for any errors
/opt/nodejs/bin/pm2 logs workforce-backend --lines 30
```

---

### **Step 7: Test the New Endpoint**

```bash
# Test with ZIP 90210 (Beverly Hills, CA)
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"location":{"zipCode":"90210"}}'
```

**Expected response:**
```json
{
  "success": true,
  "representatives": [
    {
      "name": "Alex Padilla",
      "title": "U.S. Senator",
      "party": "Democrat",
      ...
    },
    ...
  ],
  "counts": {
    "federal": 3,
    "state": 5,
    "total": 8
  },
  "data_sources": ["congress.gov", "openstates.org", "fcc.gov"]
}
```

---

### **Step 8: Test from Frontend**

1. Go to: https://sxcrlfyt.gensparkspace.com/
2. Click **"My Reps"** tab
3. Enter ZIP: **90210**
4. Click **"Find Reps"**

**You should now see REAL representatives!**

---

## 🐛 **Troubleshooting**

### **If you see errors in PM2 logs:**

```bash
# Check error logs
/opt/nodejs/bin/pm2 logs workforce-backend --err --lines 50

# Common issues:
# 1. Module not found: Check file path
# 2. API key missing: Check .env file
# 3. Syntax error: Run node -c on the file
```

### **If API returns errors:**

```bash
# Check if API keys are loaded
/opt/nodejs/bin/pm2 logs workforce-backend | grep "API key"

# Test Congress.gov directly
curl "https://api.congress.gov/v3/member?api_key=YOUR_KEY&format=json&limit=1"

# Test OpenStates directly
curl -X POST https://v3.openstates.org/graphql \
  -H "X-API-Key: YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"{ people(first: 1) { edges { node { name } } } }"}'
```

### **If you need to rollback:**

```bash
# Find latest backup
ls -lht /var/www/workforce-democracy/backend/*.backup* | head -1

# Restore it
cp /var/www/workforce-democracy/backend/server.js.backup-TIMESTAMP \
   /var/www/workforce-democracy/backend/server.js

# Restart
/opt/nodejs/bin/pm2 restart workforce-backend
```

---

## ✅ **Success Criteria**

- [ ] us-representatives.js file deployed
- [ ] server.js updated with new endpoint
- [ ] No syntax errors
- [ ] PM2 restarted successfully
- [ ] Backend responding to requests
- [ ] Real representative data returned (not mock data)
- [ ] Frontend displays real names and info

---

## 📊 **What Changed**

**Before:**
```javascript
// Mock data function
function getMockRepresentatives(zipCode) {
    return [
        { name: "Senator CA 1", ... },
        { name: "Senator CA 2", ... },
        { name: "Representative CA District 1", ... }
    ];
}
```

**After:**
```javascript
// Real APIs
const result = await usReps.getRepresentativesByZip(zipCode);
// Returns data from:
// - Congress.gov (Senators + House Reps)
// - OpenStates.org (State Legislators)
// - FCC.gov (ZIP → District mapping)
```

---

## 📝 **Next Steps After Successful Deployment**

1. Monitor logs for first 24 hours
2. Test with multiple ZIP codes
3. Check API rate limits (should be fine)
4. Implement Phase 2: Australia integration
5. Add caching layer (if needed)

---

**Ready to deploy? Start with Step 1!** 🚀
