# 🚀 BILLS API DEPLOYMENT GUIDE - v37.12.5

**Created**: November 20, 2025  
**Version**: WDP-v37.12.5-BILLS-API  
**Your Path**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.12.5-BILLS-API/`

---

## ✅ WHAT WAS BUILT

### **NEW BILLS API** (Real Government Data - No More Sample Data!)

**Backend Changes**:
1. ✅ `backend/routes/bills-routes.js` - NEW Bills API with real government data
2. ✅ `backend/server.js` - Updated to register Bills routes

**Frontend Changes**:
3. ✅ `js/bills-section.js` - Updated to call new Bills API

**How It Works**:
- ✅ User enters ZIP code in "My Representatives" tab
- ✅ ZIP saves to PersonalizationSystem
- ✅ Bills section automatically loads bills for that ZIP
- ✅ **Real federal bills** from Congress.gov API
- ✅ **Real state bills** from OpenStates API
- ✅ Category filtering (Education, Healthcare, Environment, etc.)
- ✅ Government level filtering (Federal, State, Local)

**API Endpoints Created**:
- `GET /api/bills/location?zip={zipCode}` - Get bills for ZIP code
- `GET /api/bills/health` - Health check endpoint

---

## 📋 DEPLOYMENT ORDER

### **STEP 1: Backend Deployment** (~5 minutes)
Deploy backend files to VPS first to enable the new API.

### **STEP 2: Test on GenSparkSpace** (~10 minutes)
Test all functionality on https://sxcrlfyt.gensparkspace.com before deploying to production.

### **STEP 3: Frontend Deployment** (~10 minutes)
Deploy frontend to Netlify production after testing confirms everything works.

**Total Time**: 20-30 minutes

---

## 🎯 STEP 1: BACKEND DEPLOYMENT (VPS)

### **Files to Upload**:

From your Mac Terminal, run these commands:

```bash
# Change to your project directory
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.12.5-BILLS-API"

# Upload NEW Bills API routes file
scp backend/routes/bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/

# Upload updated server.js (with Bills routes registered)
scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### **Restart Backend**:

```bash
# SSH into VPS
ssh root@185.193.126.13

# Restart PM2 (backend process)
/opt/nodejs/bin/pm2 restart backend

# Check logs for success
/opt/nodejs/bin/pm2 logs backend --lines 30
```

### **✅ SUCCESS INDICATORS**:

You should see in the logs:
```
✅ Personalization API loaded (Fire button support enabled)
✅ Civic Platform API loaded (v37.11.11)
✅ Bills API loaded (v37.12.5-BILLS-API)
Backend API running on port 3001
```

### **🧪 Test Backend Endpoint**:

```bash
# Test Bills API health check
curl https://api.workforcedemocracyproject.org/api/bills/health

# Expected response:
# {"success":true,"status":"ok","apis":{...},"version":"37.12.5-BILLS-API"}

# Test Bills API with ZIP code (example: 10001 - NYC)
curl "https://api.workforcedemocracyproject.org/api/bills/location?zip=10001"

# Expected: JSON response with real bills from Congress.gov + OpenStates
```

---

## 🎯 STEP 2: TEST ON GENSPARK SPACE

### **Deployment to GenSpark**:

1. ✅ In your GenSpark workspace, click **"Publish Website"** button
2. ✅ GenSpark auto-deploys to: https://sxcrlfyt.gensparkspace.com
3. ✅ Wait ~30 seconds for deployment to complete

### **Critical Tests**:

#### **Test 1: Backend Connection**
- ✅ Open console (F12 → Console tab)
- ✅ Look for: `✅ Backend connection: HEALTHY`
- ✅ Look for: `📊 Backend status: {"status":"healthy"}`

#### **Test 2: Enter ZIP Code**
- ✅ Go to **Civic Engagement** → **My Reps** tab
- ✅ Enter your ZIP code (e.g., `12061` or any 5-digit ZIP)
- ✅ Verify representatives load
- ✅ **CRITICAL**: Your ZIP code is now saved to PersonalizationSystem

#### **Test 3: Bills Section Auto-Load**
- ✅ Switch to **Vote on Bills** tab
- ✅ Bills should automatically load for your ZIP
- ✅ You should see **REAL BILLS** (not sample data)
- ✅ Console should show:
  ```
  [Bills API v37.12.5] Fetching bills for ZIP: 12061
  ✅ [Bills API] Loaded XX real bills from Congress.gov + OpenStates
  ```

#### **Test 4: No 404 Errors**
- ✅ Console should NOT show any 404 errors
- ✅ If you see "Unable to reach bills database" → Backend not deployed correctly

#### **Test 5: Category Filtering**
- ✅ Click category tabs (Education, Healthcare, Environment, etc.)
- ✅ Bills should filter by category
- ✅ Federal/State/Local filter should work

---

## 🎯 STEP 3: DEPLOY TO NETLIFY PRODUCTION

### **Download from GenSpark**:

1. ✅ In GenSpark workspace, download the entire project folder
2. ✅ Save to: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.12.5-BILLS-API/`
3. ✅ This folder now contains all updated frontend files

### **Deploy to Netlify**:

1. ✅ Open https://app.netlify.com/ in your browser
2. ✅ Drag the entire `WDP-v37.12.5-BILLS-API` folder into Netlify
3. ✅ Wait for Netlify to say "Published" (~3-6 minutes)
4. ✅ Your production site is now live: https://workforcedemocracyproject.org

### **Test Production Site**:

1. ✅ Go to https://workforcedemocracyproject.org
2. ✅ Open Console (F12)
3. ✅ Log in with your real account (or create one if you haven't)
4. ✅ Go to **Civic Engagement** → **My Reps**
5. ✅ Enter your ZIP code
6. ✅ Switch to **Vote on Bills**
7. ✅ Verify real bills load (not sample data)

---

## 🔍 TROUBLESHOOTING

### **Problem: Bills show "Get Started" even after ZIP entered**

**Solution**:
1. Make sure you entered ZIP in "My Reps" tab FIRST
2. Refresh the page (F5)
3. Go to Bills tab
4. If still not working, run in console:
   ```javascript
   console.log('ZIP:', localStorage.getItem('wdp_user_data'));
   ```

### **Problem: 404 Error on `/api/bills/location`**

**Solution**:
1. Backend not deployed correctly
2. Re-run STEP 1 backend deployment
3. Make sure PM2 restart was successful

### **Problem: Bills API returns empty array**

**Possible Causes**:
1. ❌ CONGRESS_API_KEY not set on VPS
2. ❌ OPENSTATES_API_KEY not set on VPS
3. ❌ APIs are down (check backend logs)

**Fix**: SSH into VPS and check:
```bash
ssh root@185.193.126.13
cat /var/www/workforce-democracy/backend/.env | grep API_KEY
```

---

## 📊 API KEYS REQUIRED

The Bills API needs these environment variables on the VPS:

```bash
# Required for federal bills
CONGRESS_API_KEY=your_congress_api_key

# Required for state bills
OPENSTATES_API_KEY=your_openstates_api_key

# Optional (improves ZIP→district mapping)
GOOGLE_CIVIC_API_KEY=your_google_civic_api_key
```

**If you don't have these API keys**, the Bills API will return empty results. All these APIs are **FREE** from official government sources.

---

## ✅ COMPLETE DEPLOYMENT SUMMARY

### **What You Did**:
1. ✅ Uploaded 2 backend files to VPS
2. ✅ Restarted PM2 backend process
3. ✅ Tested backend health endpoint
4. ✅ Published to GenSparkSpace for testing
5. ✅ Verified Bills API loads real government data
6. ✅ Deployed frontend to Netlify production

### **What Changed**:
- ✅ Bills section now fetches **REAL BILLS** from Congress.gov + OpenStates
- ✅ No more sample data (unless backend is unavailable)
- ✅ ZIP code from "My Reps" auto-populates Bills section
- ✅ Category and level filtering work with real data

### **Next Steps** (Optional):
- ⏳ Set up API keys on VPS for federal/state bills
- ⏳ Add bill caching to PostgreSQL for faster loading
- ⏳ Add "My Votes" tracking with personalization

---

**🎉 Congratulations! Your Bills API is now live with real government data!**

Report any issues with:
1. Console error messages
2. Screenshots of what you see
3. Which ZIP code you tested with
