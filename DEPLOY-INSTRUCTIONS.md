# 🚀 ONE-PASTE DEPLOYMENT INSTRUCTIONS

## What This Does

Deploys the nonprofit API proxy endpoints to your VPS backend so that community services can load organization data.

## Current Status

- ✅ **Frontend code ready** - `js/community-services.js` updated to use backend proxy
- ⏳ **Backend deployment needed** - Proxy endpoints need to be added to server.js

---

## 🎯 DEPLOYMENT STEPS (30 seconds)

### Step 1: SSH into your VPS

```bash
ssh root@workforcedemocracyproject.org
```

### Step 2: Copy & Paste the Entire Script

Open the file **`DEPLOY-ONE-PASTE.sh`** in this workspace, then:

1. **Select ALL** (from line 1 to the very last line)
2. **Copy** (Ctrl+C / Cmd+C)
3. **Paste** into your VPS terminal (Ctrl+Shift+V)
4. Press **Enter**

### Step 3: Watch the Magic Happen ✨

The script will automatically:
- ✅ Navigate to `/var/www/workforce-backend`
- ✅ Backup your current `server.js`
- ✅ Check/install axios dependency
- ✅ Add axios require statement
- ✅ Insert the nonprofit proxy endpoints
- ✅ Restart PM2
- ✅ Test the new endpoints
- ✅ Show you the results

---

## 📊 What You'll See

```
==================================
🚀 Deploying Nonprofit API Proxy
==================================
📁 Current directory: /var/www/workforce-backend
💾 Backing up current server.js...
✅ axios already installed
✅ Added axios require
📍 Finding insertion point...
📝 Inserting before app.listen...
✅ Code inserted successfully
🔄 Restarting backend with PM2...
⏳ Waiting for backend to restart...

==================================
🧪 Testing Nonprofit API Endpoints
==================================

Test 1: Search endpoint...
✅ Search endpoint working!
   Found organizations: 147

Test 2: Health check...
✅ Endpoint is accessible

==================================
📊 Deployment Summary
==================================
✅ Backend code deployed
✅ PM2 restarted
✅ Endpoints tested

Endpoints deployed:
  - GET /api/nonprofits/search?q=QUERY
  - GET /api/nonprofits/:ein

Check PM2 logs:
  /opt/nodejs/bin/pm2 logs workforce-backend --lines 50

==================================
🎉 DEPLOYMENT COMPLETE!
==================================
```

---

## 🔍 After Deployment

### Test Backend Directly (from VPS terminal)

```bash
curl "http://localhost:3001/api/nonprofits/search?q=legal"
```

Should return JSON with `"success":true` and organization data.

### Deploy Frontend to Netlify

1. Go to GenSpark **Publish tab**
2. Click **Publish** to push to Netlify
3. Wait for deployment (~30 seconds)

### Test End-to-End

1. Visit https://workforcedemocracyproject.org
2. Scroll to "Community Services & Resources"
3. Click any service category:
   - 🏛️ Legal Aid & Civil Rights
   - 🏠 Housing & Tenant Rights
   - 🏥 Healthcare Access
   - 🍎 Food Banks & Nutrition
   - 🤝 Workers' Rights Organizations
   - 🧠 Mental Health Services
4. Organizations should load successfully!

---

## 🆘 Troubleshooting

### If organizations still don't load:

**Check backend logs:**
```bash
/opt/nodejs/bin/pm2 logs workforce-backend --lines 50
```

Look for:
- ✅ `🔍 Nonprofit search: "legal"` (backend receiving requests)
- ✅ `✅ Found 147 organizations` (ProPublica API responding)
- ❌ Any error messages

**Verify endpoints are accessible:**
```bash
curl "http://localhost:3001/api/nonprofits/search?q=test"
```

**Check PM2 status:**
```bash
/opt/nodejs/bin/pm2 status
```

Should show `workforce-backend` as `online`.

---

## 📝 Technical Details

### New Endpoints

**1. Search Nonprofits**
```
GET /api/nonprofits/search?q=QUERY
Response: {success: true, data: [...], total: 147, query: "legal"}
```

**2. Get Nonprofit Details**
```
GET /api/nonprofits/:ein
Response: {success: true, data: {...}}
```

### What Changed

**Frontend** (`js/community-services.js`):
```javascript
// OLD (Direct call - CORS blocked):
const url = 'https://projects.propublica.org/nonprofits/api/v2/search.json?q=legal';

// NEW (Backend proxy - works):
const url = 'https://workforcedemocracyproject.org/api/nonprofits/search?q=legal';
```

**Backend** (`/var/www/workforce-backend/server.js`):
```javascript
// NEW: Proxy endpoints that fetch from ProPublica server-side
app.get('/api/nonprofits/search', async (req, res) => {
    const response = await axios.get(
        `https://projects.propublica.org/nonprofits/api/v2/search.json?q=${req.query.q}`
    );
    res.json({success: true, data: response.data.organizations});
});
```

---

## ✅ Success Criteria

After deployment, you should see:

- ✅ Backend logs show successful API calls
- ✅ Frontend loads organizations when clicking service categories
- ✅ No CORS errors in browser console
- ✅ Clean, professional organization cards display
- ✅ Users can browse 1.8M+ nonprofits by category

---

**Questions?** Check PM2 logs first, then review `BACKEND-NONPROFIT-PROXY.js` for the complete proxy code.
