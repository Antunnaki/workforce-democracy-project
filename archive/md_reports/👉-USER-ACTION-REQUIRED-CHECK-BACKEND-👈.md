# 👉 USER ACTION REQUIRED - CHECK BACKEND 👈

## 🎉 GOOD NEWS: Frontend is Fixed!

**What I Just Fixed:**
1. ✅ Auto-loads your saved ZIP (80204) from Dashboard
2. ✅ Automatically searches for representatives when you open My Reps tab  
3. ✅ No more need to enter ZIP twice!
4. ✅ Better error messages explaining what went wrong

**The Problem:** Your backend API is returning 0 representatives even though the API call itself is successful (200 OK).

---

## ⚠️ THE ISSUE

Your console logs show:
```
📡 Calling: https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=80204
✅ Data: Object
📊 Received 0 representatives: Array (0)  ← THIS IS THE PROBLEM
```

This means:
- ✅ Frontend → Backend communication WORKS
- ✅ No 404 error (we fixed that!)
- ❌ Backend is returning **empty results**

---

## 🔍 WHAT YOU NEED TO DO (2 Minutes)

### **Step 1: SSH into your VPS**
```bash
ssh your-vps-username@your-vps-ip
```

### **Step 2: Check Backend Logs**
```bash
pm2 logs workforce-backend --lines 50
```

**What to Look For:**
- Lines containing `80204` (your ZIP code)
- Lines containing `ERROR` or `❌`
- Lines about API keys (`CONGRESS_API_KEY` or `OPENSTATES_API_KEY`)
- Lines about "ZIP lookup failed"

**Copy and paste the output here** (especially any error lines).

### **Step 3: Check If API Keys Are Loaded**
```bash
pm2 env workforce-backend | grep API_KEY
```

**Expected Output:**
```
CONGRESS_API_KEY=ktubRS8VFW27wabUkaV0nEFXArDI8BYpsn3xOKlr
OPENSTATES_API_KEY=7234b76b-44f7-4c91-a892-aab3ecba94fd
```

**If you see empty or different values**, that's the problem!

---

## 🚨 MOST LIKELY CAUSES

### **Cause #1: API Keys Not Loaded After Restart**
**Symptoms:** Backend restarted but didn't reload .env file  
**Fix:**
```bash
pm2 restart workforce-backend --update-env
pm2 save
```

### **Cause #2: API Keys Expired**
**Symptoms:** Congress.gov or OpenStates rejecting your API keys  
**Fix:** Get new keys from:
- Congress.gov: https://api.congress.gov/sign-up/
- OpenStates: https://openstates.org/accounts/profile/

### **Cause #3: Old Backend Code Running**
**Symptoms:** The 3-tier ZIP lookup we deployed isn't active  
**Fix:**
```bash
pm2 stop workforce-backend
pm2 delete workforce-backend
pm2 flush
pm2 kill
cd /path/to/your/backend
NODE_ENV=production pm2 start server.js --name workforce-backend
pm2 save
```

---

## 🧪 QUICK TEST (To Verify Backend Works)

After fixing, run this from your VPS:
```bash
curl "http://localhost:3001/api/civic/representatives/search?zip=80204"
```

**Expected Result:**
```json
{
  "success": true,
  "representatives": [
    {
      "name": "John W. Hickenlooper",
      "title": "U.S. Senator",
      "party": "Democratic"
    },
    {
      "name": "Michael F. Bennet",
      "title": "U.S. Senator",
      "party": "Democratic"
    }
  ]
}
```

If you see this ^ then it's working! If not, paste the error message here.

---

## 📋 SUMMARY

**What Works:**
- ✅ Frontend HTTP method fixed (POST → GET)
- ✅ Frontend auto-loads ZIP from Dashboard
- ✅ Frontend auto-searches on My Reps tab
- ✅ API communication working (200 OK responses)

**What Needs Investigation:**
- ❌ Backend returning 0 representatives
- ❌ Likely: API keys not loaded or expired
- ❌ Possibly: Backend code reverted to old version

**What You Need To Do:**
1. Check backend logs (`pm2 logs workforce-backend --lines 50`)
2. Check API keys loaded (`pm2 env workforce-backend | grep API_KEY`)
3. Paste output here so I can diagnose

**Time Required:** 2 minutes

---

## 💬 RESPONSE TEMPLATE

Please copy this and fill in:

```
Backend Logs (pm2 logs):
[paste relevant lines here, especially errors]

API Keys Check (pm2 env):
[paste CONGRESS_API_KEY and OPENSTATES_API_KEY lines]

Curl Test Result:
[paste the JSON response or error]

Other observations:
[anything unusual you noticed]
```

---

**Status:** ⏳ Waiting for your backend diagnostics  
**Priority:** 🔴 HIGH (we're so close to having this working!)

Once you provide the backend logs, I can tell you exactly what needs to be fixed! 🎯

