# URGENT FIXES - V36.5.1

**Date**: October 28, 2025  
**Issues Identified**:
1. Welcome modal taking 20 seconds to load
2. Backend API returning fallback messages only (not connecting to Groq)

---

## ISSUE #1: Welcome Modal Slow Load (20 seconds)

### Root Cause
**Multiple conflicting initialization scripts running simultaneously:**

1. **Custom welcome modal** in `index.html` (lines 3704-3918)
   - Checks localStorage: `workforceDemocracyWelcomeSeen`
   - 500ms delay

2. **OLD unified-onboarding.js file still exists** (but script tag removed)
   - File still in project: `js/unified-onboarding.js`
   - Checks localStorage: `wdp_unified_onboarding_seen`
   - 1000ms delay
   - **May be cached in browser!**

3. **Personalization.js** calling initialization functions
   - Looking for functions that don't exist
   - Causing delays while waiting for timeouts

### Why 20 Seconds?
- Multiple setTimeout() calls stacking
- Functions trying to call each other
- Browser waiting for deferred scripts
- Race conditions between initialization scripts

### Solution

**Option A: Quick Fix (Recommended)**
Clear browser cache completely and reload:
```
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Or clear all site data in browser settings
3. Reload page
```

**Option B: Code Fix (Permanent)**
Delete the old unified-onboarding.js file from project:

```bash
# On your Mac
cd ~/Documents/workforce-democracy-v36.5.0
rm js/unified-onboarding.js
```

Then re-upload to Netlify.

---

## ISSUE #2: Backend API Not Connecting (Only Fallback Messages)

### Root Cause Found

**CORS (Cross-Origin Resource Sharing) Issue**

Your backend is configured to ONLY accept requests from:
```javascript
origin: process.env.FRONTEND_URL || 'https://workforcedemocracyproject.org'
```

But your actual Netlify URL is:
```
https://workforcedemocracyproject.netlify.app
```

**Backend is rejecting frontend requests due to origin mismatch!**

---

### How to Fix (Two Options)

#### Option 1: Update Backend .env File (Recommended)

**On your VPS**, update the `.env` file:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
vi .env
```

Change this line:
```
FRONTEND_URL=https://workforcedemocracyproject.netlify.app
```

To this (allow both):
```
FRONTEND_URL=*
```

Or keep it specific but add both URLs - we need to update server.js for this.

Save and restart:
```bash
pm2 restart workforce-backend
```

#### Option 2: Update server.js CORS Configuration (Better)

**On your VPS**:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
vi server.js
```

Find this section (around line 24):
```javascript
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://workforcedemocracyproject.org',
    credentials: true
}));
```

Replace with:
```javascript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://workforcedemocracyproject.netlify.app',
            'https://workforcedemocracyproject.org',
            'http://localhost:3000', // for local testing
            'http://localhost:5500'  // for local testing
        ];
        
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn('⚠️ Blocked request from origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
```

Save and restart:
```bash
pm2 restart workforce-backend
pm2 logs workforce-backend
```

---

## ISSUE #3: Browser Console Errors (Check These)

Open browser console (F12) and look for:

### Expected Errors:
```
Access to fetch at 'http://185.193.126.13/api/chat/query' from origin 
'https://workforcedemocracyproject.netlify.app' has been blocked by CORS policy
```

This confirms the CORS issue.

### How to Check:
1. Open your Netlify site
2. Press F12 (open console)
3. Try asking a chat question
4. Look for red errors about "CORS" or "blocked"

---

## QUICK FIX COMMANDS (Copy-Paste)

### Step 1: SSH to VPS
```bash
ssh root@185.193.126.13
```

### Step 2: Quick CORS Fix (Allow All Origins Temporarily)
```bash
cd /var/www/workforce-democracy/backend

# Backup current .env
cp .env .env.backup

# Update FRONTEND_URL to allow all origins
sed -i 's|FRONTEND_URL=.*|FRONTEND_URL=*|' .env

# Restart server
pm2 restart workforce-backend

# Check logs
pm2 logs workforce-backend --lines 20
```

### Step 3: Test from Netlify
Go to your site and try a chat message. Should work now!

---

## BETTER FIX: Update server.js (After Quick Fix Works)

Once you confirm the quick fix works, implement the proper multi-origin support:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# Download the updated server.js from GenSpark
# Or manually edit as shown in Option 2 above

# After updating
pm2 restart workforce-backend
```

---

## TESTING AFTER FIXES

### Test 1: Backend Health Check
```bash
curl -H "Origin: https://workforcedemocracyproject.netlify.app" \
     http://185.193.126.13/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Test 2: Backend Query Test
```bash
curl -X POST http://185.193.126.13/api/chat/query \
  -H "Content-Type: application/json" \
  -H "Origin: https://workforcedemocracyproject.netlify.app" \
  -d '{
    "chat_type": "supreme_court",
    "user_id": "test",
    "query": "What is Roe v Wade?"
  }'
```

Should return actual response, not fallback!

### Test 3: Frontend Test
1. Open https://workforcedemocracyproject.netlify.app
2. Open console (F12)
3. Type in Supreme Court chat: "What is Roe v Wade?"
4. Check console for:
   - ✅ No CORS errors
   - ✅ Backend API response received
   - ✅ Response shows source (cache/database/AI)

---

## WHY GROQ ISN'T BEING CALLED

The backend API has 3 steps:

1. **Check cache** → No entries yet (first-time queries)
2. **Check database** → Query not matching (needs tuning)
3. **Call Groq API** → **This is failing silently!**

### Possible Reasons:

1. **Groq API Key Invalid**
   - Check .env file on VPS
   - Verify key is correct: `[REDACTED_GROQ_API_KEY]`

2. **Groq API Not Installed**
   - Check if groq-sdk is in package.json
   - May need to install manually

3. **Groq API Endpoint Wrong**
   - Check server.js Groq integration code

### Check Groq Integration:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# Check if groq is installed
npm list groq-sdk

# If not installed:
npm install groq-sdk

# Restart
pm2 restart workforce-backend
```

---

## SUMMARY OF FIXES

### Fix #1: Welcome Modal (User Side)
**Action**: Hard refresh browser (Cmd+Shift+R)  
**Time**: 5 seconds  
**Impact**: Modal loads instantly

### Fix #2: CORS Issue (VPS Side)
**Action**: Update FRONTEND_URL in .env to `*`  
**Time**: 2 minutes  
**Impact**: Backend accepts requests from Netlify

### Fix #3: Groq Integration (VPS Side - After CORS Fixed)
**Action**: Check Groq API key and install groq-sdk  
**Time**: 5 minutes  
**Impact**: Real AI responses instead of fallback

---

## IMMEDIATE NEXT STEPS

1. **Clear browser cache** (Cmd+Shift+R)
2. **SSH to VPS** and run quick CORS fix commands above
3. **Test chat** - should work immediately
4. **Check Groq integration** if still getting fallback
5. **Report back** with console errors if any

---

## MONITORING

After fixes, monitor:
```bash
ssh root@185.193.126.13
pm2 logs workforce-backend

# Look for:
# ✅ "✅ Connected to PostgreSQL database"
# ✅ "🚀 Workforce Democracy API Server running on port 3001"
# ✅ Query logs showing source (cache/database/ai)
# ❌ No CORS errors
# ❌ No Groq API errors
```

---

## PREVENTION

To avoid future issues:

1. **Always test locally before deploying**
2. **Configure CORS to accept multiple origins from start**
3. **Remove old/unused JavaScript files**
4. **Use cache busting** for critical JS files
5. **Monitor PM2 logs** after each deployment

---

**Status**: Fixes identified and documented  
**Priority**: 🔴 High - Blocking core functionality  
**ETA**: 10 minutes to implement and test
