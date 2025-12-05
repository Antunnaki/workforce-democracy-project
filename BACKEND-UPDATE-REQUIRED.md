# 🚨 BACKEND UPDATE REQUIRED

## The New Problem

Your browser console shows:
```
Fetch API cannot load http://185.193.126.13/api/bills/location 
due to access control checks.
```

This is a **CORS error** - your backend is rejecting the request because the frontend domain isn't in the allowed origins list.

---

## What's Happening

The backend `server.js` only allows:
- ✅ `https://workforcedemocracyproject.netlify.app`
- ✅ `https://workforcedemocracyproject.org`

But you're accessing from a different domain (probably the custom domain without netlify.app).

---

## Quick Fix - Update Backend CORS

### Step 1: Download Updated Backend File

Download from GenSpark:
- **`backend/server.js`** (21,648 bytes) - **UPDATED CORS**

### Step 2: Upload to VPS

**On your VPS terminal**:

```bash
# 1. Navigate to backend directory
cd /var/www/workforce-backend

# 2. Backup old file
cp server.js server.js.backup

# 3. Upload new server.js (use SCP, SFTP, or paste content)
# If using nano editor:
nano server.js
# (Paste the new content, press Ctrl+X, Y, Enter)

# 4. Restart backend
pm2 restart workforce-backend

# 5. Check logs
pm2 logs workforce-backend --lines 20
```

---

## What I Changed in Backend

**Added more allowed origins**:
```javascript
const allowedOrigins = [
    'https://workforcedemocracyproject.netlify.app',
    'https://workforcedemocracyproject.org',
    'http://workforcedemocracyproject.org',  // NEW
    'https://www.workforcedemocracyproject.org',  // NEW
    'http://www.workforcedemocracyproject.org',  // NEW
    // ...localhost entries...
];
```

---

## Alternative: Tell Me Your Exact Domain

Look at your browser address bar. What URL do you see?

Example formats:
- `https://workforcedemocracyproject.netlify.app`
- `https://workforcedemocracyproject.org`
- `https://main--workforcedemocracyproject.netlify.app`
- Something else?

**Tell me the exact URL** and I'll add it to the CORS whitelist.

---

## Temporary Fix (For Testing Only)

If you want to test RIGHT NOW without waiting, you can temporarily allow ALL origins:

**⚠️ WARNING: INSECURE - Only for testing!**

```javascript
// Replace the CORS config with this (TEMPORARILY):
app.use(cors({
    origin: '*',  // Allow all origins (INSECURE!)
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

This will work immediately but is **not secure for production**. Use only to verify everything else works, then add your specific domain to the whitelist.

---

## Check Backend Logs

On your VPS, check what origin is being blocked:

```bash
pm2 logs workforce-backend --lines 50
```

Look for lines like:
```
⚠️ Blocked request from unauthorized origin: https://your-actual-domain.com
```

That's the domain you need to add to `allowedOrigins`.

---

## After Backend Update

1. **Restart backend**: `pm2 restart workforce-backend`
2. **Clear browser cache**: Cmd+Shift+Delete
3. **Hard refresh**: Cmd+Shift+R
4. **Test again**

The CORS errors should disappear.

---

## Summary

**Root cause**: Frontend domain not in backend CORS whitelist

**Solution**: 
1. Update `backend/server.js` with more allowed origins
2. Upload to VPS
3. Restart PM2
4. Test

**Time**: 5 minutes

---

## Need Help?

Tell me:
1. What URL is in your browser address bar?
2. What do the VPS logs show? (`pm2 logs workforce-backend`)

I'll create the exact fix for your domain.
