# 🚨 CRITICAL: PM2 BACKEND PROCESS OFFLINE

**Status**: ❌ **BACKEND NOT RUNNING**  
**Discovered**: January 11, 2025  
**Impact**: ALL backend API endpoints are offline (Representatives, Bills, Court Cases, etc.)  
**Priority**: **CRITICAL - BLOCKS ALL FUNCTIONALITY**

---

## 📋 What Happened

While attempting to deploy the OpenStates API fix (v37.9.2), we discovered the PM2 backend process **does not exist** on your VPS server.

**Error Message:**
```
[PM2][ERROR] Process or Namespace backend not found
```

**What This Means:**
- The backend is NOT running at all
- All API calls from frontend will fail
- Representatives lookup is completely offline
- Bills API is offline
- Court Cases API is offline

---

## 🔍 Diagnostic Results

**What We Attempted:**
```bash
pm2 restart backend
```

**What We Got:**
```
[PM2][ERROR] Process or Namespace backend not found
```

**Root Cause:**
The PM2 process named "backend" was never started or was deleted. This is **not a restart issue** - the process doesn't exist.

---

## ✅ Solution: Start the Backend Process

### Option 1: Run Diagnostic Script (Recommended)

I've created a comprehensive diagnostic script that will:
1. Check PM2 status
2. Verify backend files exist
3. Check Node.js version
4. Verify .env configuration
5. Start the PM2 process
6. Save PM2 configuration
7. Show logs for verification

**Steps:**
1. Download the script from chat: `🔍-DIAGNOSE-AND-START-BACKEND.sh`
2. Save to your SH-Files folder: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files`
3. Upload to VPS using your upload script
4. Run on VPS:
   ```bash
   chmod +x 🔍-DIAGNOSE-AND-START-BACKEND.sh
   ./🔍-DIAGNOSE-AND-START-BACKEND.sh
   ```

### Option 2: Manual Commands (If You Prefer)

**Step-by-step manual approach:**

```bash
# 1. SSH into your VPS
ssh root@185.193.126.13

# 2. Check current PM2 status (should show no processes or empty)
pm2 list

# 3. Verify backend directory exists
ls -la /var/www/workforce-democracy/backend/

# 4. Verify server.js exists
ls -la /var/www/workforce-democracy/backend/server.js

# 5. Navigate to backend directory
cd /var/www/workforce-democracy/backend/

# 6. Start the backend process (CRITICAL: use "start" not "restart")
pm2 start server.js --name backend

# 7. Save PM2 configuration (so it persists)
pm2 save

# 8. Setup auto-restart on server reboot
pm2 startup

# 9. Verify it's running
pm2 list

# 10. Check logs for errors
pm2 logs backend --lines 30

# 11. Test the API endpoint
curl http://185.193.126.13:3001/health
```

---

## 🔍 Expected Results After Starting

**PM2 List Should Show:**
```
┌─────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name       │ namespace   │ status  │ cpu     │ memory   │
├─────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ backend    │ default     │ online  │ 0%      │ 45.0mb   │
└─────┴────────────┴─────────────┴─────────┴─────────┴──────────┘
```

**Logs Should Show:**
```
🚀 Workforce Democracy Backend Server
✅ Backend server running on http://185.193.126.13:3001
📡 CORS enabled for: https://workforcedemocracyproject.org
✅ Congress.gov API configured
✅ OpenStates API configured
✅ Google Civic API configured
```

**Health Check Should Return:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-11T...",
  "uptime": 123,
  "apis": {
    "congress": "configured",
    "openstates": "configured",
    "civic": "configured"
  }
}
```

---

## 🚨 What This Blocks

Until the backend is running, the following features are **completely offline**:

### ❌ Offline Features:
- **Representatives Lookup** - Frontend cannot fetch representative data
- **Bills Search** - Cannot search or display congressional bills
- **Supreme Court Cases** - Cannot fetch court case data
- **ZIP Code Lookup** - Cannot convert ZIP to congressional district
- **OpenStates API** - Cannot fetch state legislators

### ✅ Still Working (Frontend Only):
- **Dashboard** - Basic UI loads
- **Navigation** - Site navigation works
- **CSS/JS** - Frontend styling and scripts load
- **Static Content** - Non-API content displays

---

## 🔧 After Backend is Running

Once you've started the backend and verified it's online, we need to:

### 1. Deploy OpenStates Fix (v37.9.2)
The backend code in the **chat environment** has the OpenStates API fix, but it's **not yet deployed to your VPS**.

**What Was Fixed:**
- Updated OpenStates API jurisdiction format from `"CO"` to `"ocd-jurisdiction/country:us/state:co/government"`
- This fixes the 404 errors for state legislators

**Deployment Required:**
I'll need to create a deployment script to update `/var/www/workforce-democracy/backend/us-representatives.js` on your VPS.

### 2. Test Representatives Lookup
After deployment:
```bash
# Test with ZIP 80204 (Colorado)
curl "http://185.193.126.13:3001/api/civic/representatives/search?zip=80204"
```

**Expected Result:**
- Federal senators (2 results)
- State legislators (multiple results)
- All with photos, contact info, websites

### 3. Deploy Frontend Updates
The frontend files also have fixes:
- `js/rep-finder-simple.js` - Auto-load ZIP feature
- `js/config.js` - Correct API endpoints
- `js/civic-representative-finder.js` - GET method fix

These need to be deployed to Netlify.

---

## 📝 Common Mistakes to Avoid

### ❌ Don't Do This:
```bash
pm2 restart backend  # ❌ Won't work - process doesn't exist
```

### ✅ Do This:
```bash
pm2 start server.js --name backend  # ✅ Starts the process
```

### ❌ Wrong Process Name:
```bash
pm2 start server.js --name workforce-backend  # ❌ Wrong name
```

### ✅ Correct Process Name:
```bash
pm2 start server.js --name backend  # ✅ Matches all our documentation
```

### ❌ Wrong Directory:
```bash
cd /root/
pm2 start server.js --name backend  # ❌ Can't find server.js
```

### ✅ Correct Directory:
```bash
cd /var/www/workforce-democracy/backend/
pm2 start server.js --name backend  # ✅ Correct location
```

---

## 🎯 Next Steps (In Order)

### **STEP 1: START BACKEND** ⬅️ **YOU ARE HERE**
Run the diagnostic script or manual commands above to start the PM2 backend process.

### **STEP 2: VERIFY BACKEND IS HEALTHY**
Check `pm2 list` shows "online" status and test the health endpoint.

### **STEP 3: DEPLOY OPENSTATES FIX**
I'll create a deployment script to update `us-representatives.js` with the OpenStates API fix.

### **STEP 4: TEST REPRESENTATIVES LOOKUP**
Test with ZIP 80204 to verify we get both federal and state legislators.

### **STEP 5: DEPLOY FRONTEND UPDATES**
Deploy the frontend fixes to Netlify (auto-load ZIP feature).

### **STEP 6: VERIFY END-TO-END**
Test the complete flow from frontend to backend to external APIs.

---

## 📚 Documentation Updated

I've updated the following files to document this critical discovery:

1. **PROJECT_MASTER_GUIDE.md**
   - Updated version to v37.9.2
   - Added PM2 Process Not Found troubleshooting section
   - Changed project status to reflect backend offline

2. **🔍-DIAGNOSE-AND-START-BACKEND.sh** (New File)
   - Comprehensive diagnostic and startup script
   - Checks all prerequisites
   - Starts PM2 process with proper configuration

3. **🚨-CRITICAL-PM2-BACKEND-OFFLINE.md** (This File)
   - Complete documentation of the issue
   - Step-by-step solutions
   - Expected results
   - Next steps

---

## ❓ Questions?

If you encounter any errors during the startup process, please share:
1. The exact error message
2. Output of `pm2 list`
3. Output of `pm2 logs backend --lines 30`
4. Output of `ls -la /var/www/workforce-democracy/backend/server.js`

This will help me diagnose any issues with starting the backend.

---

**Remember**: This is a **CRITICAL** issue that blocks all backend functionality. Once we get the backend running, we can proceed with deploying the OpenStates fix and testing the representatives lookup!
