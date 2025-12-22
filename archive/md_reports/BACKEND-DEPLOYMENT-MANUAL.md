# 🚀 Backend Deployment Manual - V36.10.0 Phase 1
## Civic Representative Finder - Step-by-Step Backend Deployment

**Version:** V36.10.0 Phase 1  
**Date:** November 1, 2025  
**Deployment Type:** Backend API Endpoint Addition  
**Risk Level:** Low (new feature, non-breaking)

---

## 📋 Overview

This manual provides **two deployment methods** for adding the Civic Representatives endpoint to your VPS backend:

1. **🤖 Automated Deployment** (Recommended) - Using the deployment script
2. **✋ Manual Deployment** - Step-by-step instructions

---

## 🎯 What You're Deploying

**New Endpoint:** `POST /api/civic/representatives`

**Features:**
- Accepts ZIP code (required) and optional full address
- Returns 2 senators + 1 house representative (mock data in Phase 1)
- Fast response time (< 100ms)
- Error handling and logging
- Ready for Phase 2 Congress.gov API integration

**Files Modified:**
- `/var/www/workforce-backend/server.js` (endpoint added)

**Files NOT Modified:**
- Database schema (no changes needed)
- Environment variables (no new keys needed in Phase 1)
- Nginx configuration (no changes needed)
- PM2 configuration (no changes needed)

---

## 🤖 METHOD 1: Automated Deployment (Recommended)

### Step 1: Copy Deployment Script to VPS

**From your local machine:**

```bash
# Copy the deployment script to your VPS
scp BACKEND-DEPLOYMENT-V36.10.0.sh root@185.193.126.13:/root/
```

### Step 2: SSH to VPS

```bash
ssh root@185.193.126.13
# or
ssh workforce-backend
```

### Step 3: Run Deployment Script

```bash
# Navigate to home directory
cd /root/

# Make script executable
chmod +x BACKEND-DEPLOYMENT-V36.10.0.sh

# Run the deployment script
./BACKEND-DEPLOYMENT-V36.10.0.sh
```

**Expected Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  V36.10.0 BACKEND DEPLOYMENT - CIVIC REPRESENTATIVE FINDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[1/7] Pre-flight checks...
✓ All pre-flight checks passed

[2/7] Backing up current server.js...
✓ Backup created: server.js.backup-v36.9.15-20251101-123456

[3/7] Checking for existing endpoint...
✓ Ready to proceed

[4/7] Adding civic representatives endpoint to server.js...
  Adding endpoint code...
  ✓ Endpoint code inserted
✓ Endpoint added successfully

[5/7] Validating JavaScript syntax...
✓ Syntax validation passed

[6/7] Restarting backend with PM2...
✓ Backend restarted successfully

[7/7] Verifying deployment...
  Checking PM2 process status...
✓ Endpoint is responding correctly

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ DEPLOYMENT COMPLETE - V36.10.0 PHASE 1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 4: Verify Deployment

The script automatically verifies the deployment. If successful, **skip to "Testing" section below**.

If the script encounters errors, check the logs:

```bash
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

---

## ✋ METHOD 2: Manual Deployment

### Step 1: SSH to VPS

```bash
ssh root@185.193.126.13
# or
ssh workforce-backend
```

### Step 2: Navigate to Backend Directory

```bash
cd /var/www/workforce-backend
```

### Step 3: Backup Current server.js

```bash
cp server.js server.js.backup-v36.9.15-$(date +%Y%m%d-%H%M%S)
ls -lh server.js*
```

**Expected Output:**
```
-rw-r--r-- 1 root root  45K Nov  1 12:00 server.js
-rw-r--r-- 1 root root  45K Nov  1 12:00 server.js.backup-v36.9.15-20251101-120045
```

### Step 4: Open server.js in Editor

```bash
nano server.js
```

### Step 5: Find Insertion Point

Scroll to find the **last API endpoint** in the file, or find the line with `app.listen()`.

You want to insert the new endpoint **BEFORE** the `app.listen()` line.

### Step 6: Insert Endpoint Code

Copy and paste this code at the insertion point:

```javascript
/**
 * ============================================================================
 * CIVIC REPRESENTATIVES LOOKUP - V36.10.0 PHASE 1
 * ============================================================================
 */

/**
 * POST /api/civic/representatives
 * Lookup federal, state, and local representatives by ZIP code or full address
 * 
 * Phase 1: Returns mock data for testing
 * Phase 2: Will integrate with Congress.gov API for real data
 */
app.post('/api/civic/representatives', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { user_id, location } = req.body;
        
        // Validate ZIP code is provided
        if (!location || !location.zipCode) {
            return res.status(400).json({
                success: false,
                error: 'ZIP code is required'
            });
        }
        
        console.log(`[Civic API] 🔍 Looking up representatives for ZIP: ${location.zipCode}`);
        
        // Phase 1: Return mock data
        // TODO Phase 2: Replace with real Congress.gov API integration
        const representatives = getMockRepresentatives(location.zipCode);
        
        const responseTime = Date.now() - startTime;
        
        console.log(`[Civic API] ✅ Found ${representatives.length} representatives (${responseTime}ms)`);
        
        res.json({
            success: true,
            representatives: representatives,
            location_used: {
                zipCode: location.zipCode,
                city: location.city || null,
                state: location.state || null
            },
            data_sources: ['mock_data'],
            cached: false,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error('[Civic API] ❌ Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to lookup representatives'
        });
    }
});

/**
 * Mock representatives data for Phase 1 testing
 * Returns 2 senators + 1 house representative per state
 */
function getMockRepresentatives(zipCode) {
    // Determine state from ZIP code first digit (simplified mapping)
    const zipPrefix = zipCode.charAt(0);
    let state = 'CA';
    
    const zipToState = {
        '0': 'CT', '1': 'NY', '2': 'DC', '3': 'FL', '4': 'GA',
        '5': 'IA', '6': 'IL', '7': 'OH', '8': 'AZ', '9': 'CA'
    };
    
    if (zipToState[zipPrefix]) {
        state = zipToState[zipPrefix];
    }
    
    return [
        {
            id: `rep_senate_${state}_1`,
            name: `Senator ${state} (Senior)`,
            title: 'U.S. Senator',
            office: 'United States Senate',
            level: 'federal',
            party: 'D',
            district: `${state} (At-large)`,
            photo_url: null,
            phone: '(202) 224-0000',
            email: `senior.senator@${state.toLowerCase()}.senate.gov`,
            website: `https://www.senate.gov`,
            term_start: '2019-01-03',
            term_end: '2025-01-03'
        },
        {
            id: `rep_senate_${state}_2`,
            name: `Senator ${state} (Junior)`,
            title: 'U.S. Senator',
            office: 'United States Senate',
            level: 'federal',
            party: 'R',
            district: `${state} (At-large)`,
            photo_url: null,
            phone: '(202) 224-0001',
            email: `junior.senator@${state.toLowerCase()}.senate.gov`,
            website: `https://www.senate.gov`,
            term_start: '2021-01-20',
            term_end: '2027-01-03'
        },
        {
            id: `rep_house_${state}_01`,
            name: `Representative ${state} District 1`,
            title: 'U.S. Representative',
            office: 'U.S. House of Representatives',
            level: 'federal',
            party: 'D',
            district: `${state}'s 1st District`,
            photo_url: null,
            phone: '(202) 225-0000',
            email: `rep.district1@${state.toLowerCase()}.house.gov`,
            website: `https://www.house.gov`,
            term_start: '2021-01-03',
            term_end: '2025-01-03'
        }
    ];
}
```

### Step 7: Save and Exit

**In nano:**
1. Press `Ctrl + X`
2. Press `Y` to confirm save
3. Press `Enter` to confirm filename

### Step 8: Validate Syntax

```bash
/opt/nodejs/bin/node -c server.js
```

**Expected Output:** (silence = success)

If you see errors, reopen the file and check for typos, missing brackets, etc.

### Step 9: Restart Backend

```bash
/opt/nodejs/bin/pm2 restart workforce-backend
```

**Expected Output:**
```
[PM2] Applying action restartProcessId on app [workforce-backend](ids: [ 0 ])
[PM2] [workforce-backend](0) ✓
```

### Step 10: Check Logs

```bash
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

**Look for:**
- ✅ No error messages
- ✅ Server listening on port 3001
- ✅ No syntax errors

---

## ✅ Testing After Deployment

### Test 1: Backend API Test (On VPS)

```bash
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_123",
    "location": {
      "zipCode": "90210"
    }
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "representatives": [
    {
      "id": "rep_senate_CA_1",
      "name": "Senator CA (Senior)",
      "title": "U.S. Senator",
      "office": "United States Senate",
      "level": "federal",
      "party": "D",
      "district": "CA (At-large)",
      "photo_url": null,
      "phone": "(202) 224-0000",
      "email": "senior.senator@ca.senate.gov",
      "website": "https://www.senate.gov",
      "term_start": "2019-01-03",
      "term_end": "2025-01-03"
    },
    {
      "id": "rep_senate_CA_2",
      "name": "Senator CA (Junior)",
      "title": "U.S. Senator",
      "office": "United States Senate",
      "level": "federal",
      "party": "R",
      "district": "CA (At-large)",
      "photo_url": null,
      "phone": "(202) 224-0001",
      "email": "junior.senator@ca.senate.gov",
      "website": "https://www.senate.gov",
      "term_start": "2021-01-20",
      "term_end": "2027-01-03"
    },
    {
      "id": "rep_house_CA_01",
      "name": "Representative CA District 1",
      "title": "U.S. Representative",
      "office": "U.S. House of Representatives",
      "level": "federal",
      "party": "D",
      "district": "CA's 1st District",
      "photo_url": null,
      "phone": "(202) 225-0000",
      "email": "rep.district1@ca.house.gov",
      "website": "https://www.house.gov",
      "term_start": "2021-01-03",
      "term_end": "2025-01-03"
    }
  ],
  "location_used": {
    "zipCode": "90210",
    "city": null,
    "state": null
  },
  "data_sources": ["mock_data"],
  "cached": false,
  "timestamp": 1730505600000
}
```

✅ **If you see this response, backend is working!**

### Test 2: Test Different ZIP Codes

```bash
# Test New York (starts with 1)
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "location": {"zipCode": "10001"}}'

# Test Florida (starts with 3)
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "location": {"zipCode": "33101"}}'

# Test Illinois (starts with 6)
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "location": {"zipCode": "60601"}}'
```

Each should return representatives with different state codes (NY, FL, IL).

### Test 3: Test Error Handling

```bash
# Test missing ZIP code (should return 400 error)
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "location": {}}'
```

**Expected Response:**
```json
{
  "success": false,
  "error": "ZIP code is required"
}
```

### Test 4: Frontend Test (Browser)

1. **Open:** https://workforcedemocracyproject.org
2. **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
3. **Navigate to:** Civic Engagement section
4. **Click:** "My Reps" tab
5. **Enter ZIP:** `90210`
6. **Click:** "Find Reps" button

**Expected Result:**
- Loading spinner appears
- After 1-2 seconds, 3 representative cards display
- Each card shows: name, title, party, contact info
- Location bar minimizes at top
- No console errors (press `F12` to check)

### Test 5: Check Backend Logs

```bash
/opt/nodejs/bin/pm2 logs workforce-backend --lines 20
```

**Look for:**
```
[Civic API] 🔍 Looking up representatives for ZIP: 90210
[Civic API] ✅ Found 3 representatives (45ms)
```

---

## 🐛 Troubleshooting

### Issue: 404 Error When Testing

**Symptom:**
```
404 Not Found
```

**Cause:** Endpoint wasn't added correctly or server didn't restart.

**Fix:**
```bash
# Check if endpoint exists in server.js
grep -n "civic/representatives" /var/www/workforce-backend/server.js

# If nothing found, repeat Step 6 (add endpoint code)
# If found, restart backend again
/opt/nodejs/bin/pm2 restart workforce-backend
```

### Issue: 500 Internal Server Error

**Symptom:**
```json
{
  "success": false,
  "error": "Failed to lookup representatives"
}
```

**Cause:** Syntax error in server.js or missing function.

**Fix:**
```bash
# Check syntax
/opt/nodejs/bin/node -c /var/www/workforce-backend/server.js

# Check logs for detailed error
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

### Issue: PM2 Won't Restart

**Symptom:**
```
[PM2] Process workforce-backend not found
```

**Cause:** PM2 lost track of the process.

**Fix:**
```bash
# List all PM2 processes
/opt/nodejs/bin/pm2 list

# If workforce-backend not listed, start it manually
cd /var/www/workforce-backend
/opt/nodejs/bin/pm2 start server.js --name workforce-backend
```

### Issue: Frontend Shows "API Error"

**Symptom:** Browser console shows:
```
[RepFinder] ❌ API error: Network error
```

**Cause:** Backend isn't responding or CORS issue.

**Fix:**
```bash
# 1. Verify backend is running
/opt/nodejs/bin/pm2 status

# 2. Test backend directly from VPS
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "location": {"zipCode": "90210"}}'

# 3. Check CORS headers are enabled in server.js
grep -A 5 "app.use(cors" /var/www/workforce-backend/server.js
```

### Issue: Representatives Not Displaying in Frontend

**Symptom:** Frontend shows loading spinner forever.

**Cause:** Frontend code not updated yet, or cache issue.

**Fix:**
1. **Hard refresh browser:** `Ctrl+Shift+R`
2. **Clear browser cache:** `F12` > Application > Clear storage
3. **Check browser console** for JavaScript errors
4. **Verify frontend files deployed** to Netlify

---

## 🔄 Rollback Instructions

If something goes wrong and you need to revert:

### Step 1: Restore Backup

```bash
cd /var/www/workforce-backend
cp server.js.backup-v36.9.15-[TIMESTAMP] server.js
```

(Replace `[TIMESTAMP]` with the actual timestamp from your backup file)

### Step 2: Restart Backend

```bash
/opt/nodejs/bin/pm2 restart workforce-backend
```

### Step 3: Verify Rollback

```bash
# Endpoint should return 404
curl -X POST http://localhost:3001/api/civic/representatives \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test", "location": {"zipCode": "90210"}}'
```

---

## 📊 Success Checklist

Before marking deployment complete, verify:

- ✅ Backend endpoint responds to POST requests
- ✅ Returns 3 representatives (2 senators + 1 house rep)
- ✅ Different ZIP codes return different states
- ✅ Error handling works (missing ZIP returns 400)
- ✅ PM2 process is running and healthy
- ✅ Logs show successful lookups
- ✅ Frontend displays representatives correctly
- ✅ No console errors in browser
- ✅ Mobile responsive (test on phone)
- ✅ Location data encrypted in localStorage

---

## 📝 Deployment Notes

**Phase 1 Limitations (By Design):**
- Mock data only (generic representative names)
- Simplified ZIP → State mapping (by first digit)
- Only federal representatives (no state/local yet)
- No caching yet (will add in Phase 2)
- No real Congress.gov API calls (will add in Phase 2)

**These are intentional** for Phase 1 testing. Phase 2 will add:
- Real Congress.gov API integration
- Proper ZIP → Congressional District mapping
- Representative photos from theunitedstates.io
- 7-day PostgreSQL caching
- Google Civic API for state/local reps
- Voting record integration

---

## 🎯 Next Steps

After successful deployment:

1. ✅ Test with multiple ZIP codes
2. ✅ Verify mobile responsiveness
3. ✅ Monitor logs for any errors
4. ✅ Share with test users for feedback
5. ⏳ Plan Phase 2: Congress.gov API integration

---

## 📞 Support

**Deployment Questions:**
- Check logs: `/opt/nodejs/bin/pm2 logs workforce-backend`
- Check status: `/opt/nodejs/bin/pm2 status`
- Review this manual for troubleshooting steps

**Emergency Rollback:**
- Use backup file created in Step 3
- Restart PM2 process
- Verify with curl test

---

**Document Version:** 1.0  
**Created:** November 1, 2025  
**Last Updated:** November 1, 2025  
**Author:** AI Assistant  
**Deployment Time:** ~10-15 minutes (manual) or ~5 minutes (automated)

🚀 **Good luck with your deployment!**
