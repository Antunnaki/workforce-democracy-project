# 🔄 Backend Deployment Sync Guide

**Problem Identified**: Your VPS server has an **OLD version** of `server.js` that doesn't have the V36.11.9 fixes.

**Root Cause**: Project files (in this workspace) are NOT automatically synced to your VPS server at `/var/www/workforce-democracy/backend`.

---

## 📊 Version Comparison

### Version on VPS (OLD - CRASHING):
```javascript
// Simple CORS - NO wildcard support
if (!origin || allowedOrigins.indexOf(origin) !== -1) {
    return callback(null, true);
}
return callback(new Error('CORS policy violation'), false);  // ❌ CRASHES!
```

### Version in Project (NEW - FIXED):
```javascript
// V36.11.9: Wildcard support + no crash
const isAllowedDomain = origin && (
    origin.includes('.netlify.app') ||
    origin.includes('.gensparkspace.com') ||
    origin.includes('workforcedemocracyproject.org')
);

if (!origin || allowedOrigins.indexOf(origin) !== -1 || isAllowedDomain) {
    return callback(null, true);
}
callback(null, false);  // ✅ No error thrown!
```

---

## 🚀 Deployment Options

### Option 1: Copy Updated server.js to VPS (RECOMMENDED)

The updated `backend/server.js` file in this project has all the V36.11.9 fixes. You need to copy it to your VPS.

**Steps:**

1. **Download the file from this project:**
   - Look in the file tree on the left
   - Find `backend/server.js`
   - Right-click → Download

2. **Upload to VPS using SCP:**
   ```bash
   scp server.js root@185.193.126.13:/var/www/workforce-democracy/backend/server.js
   ```

3. **Restart backend:**
   ```bash
   ssh root@185.193.126.13
   cd /var/www/workforce-democracy/backend
   pm2 restart workforce-backend
   pm2 logs workforce-backend
   ```

---

### Option 2: Manual Edit on VPS (TEDIOUS)

If you can't copy files, manually edit the VPS file:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
nano server.js
```

**Find this section (around line 25-35):**
```javascript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            'https://workforcedemocracyproject.netlify.app',
            'https://workforcedemocracyproject.org',
            'http://localhost:3000',
            'http://localhost:5500',
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy violation'), false);
    },
    credentials: true
}));
```

**Replace with:**
```javascript
app.use(cors({
    origin: function(origin, callback) {
        // List of allowed origins
        const allowedOrigins = [
            'https://workforcedemocracyproject.netlify.app',
            'https://workforcedemocracyproject.org',
            'https://www.workforcedemocracyproject.org',
            'https://sxcrlfyt.gensparkspace.com',  // V36.11.9: GenSpark deployment
            'http://localhost:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500',
            'http://127.0.0.1:3000'
        ];
        
        // V36.11.9: Allow ANY Netlify, GenSpark, or project domain URL
        const isAllowedDomain = origin && (
            origin.includes('.netlify.app') ||
            origin.includes('.gensparkspace.com') ||
            origin.includes('workforcedemocracyproject.org')
        );
        
        // Allow requests with no origin (mobile apps, Postman, curl, etc.)
        if (!origin) {
            console.log('✅ Request with no origin - allowing');
            return callback(null, true);
        }
        
        // Check if origin is in allowed list OR is an allowed domain
        if (allowedOrigins.indexOf(origin) !== -1 || isAllowedDomain) {
            console.log('✅ Allowed origin:', origin);
            callback(null, true);
        } else {
            // Log blocked origin for debugging
            console.warn('⚠️ Blocked request from unauthorized origin:', origin);
            console.warn('💡 Add this origin to allowedOrigins array in server.js');
            // V36.11.9: Don't throw error - just reject the origin
            callback(null, false);
        }
    },
    credentials: true
}));
```

Save (`Ctrl+X`, `Y`, `Enter`) and restart:
```bash
pm2 restart workforce-backend
```

---

### Option 3: Use Git (BEST LONG-TERM)

If your VPS backend is a Git repository:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
git pull origin main
pm2 restart workforce-backend
```

---

## ✅ Verification After Deployment

After copying the file and restarting:

```bash
pm2 status
```

Should show:
- ✅ `restarts: 0` (not 129)
- ✅ Status: `online`

```bash
pm2 logs workforce-backend --lines 20
```

Should show:
- ✅ `✅ Backend server running on port 3001`
- ✅ `✅ Groq API configured: true`
- ❌ NO "Server error: Error: CORS policy violation"

---

## 📝 Going Forward

To prevent this issue in the future:

1. **Always edit files in THIS project workspace** (not directly on VPS)
2. **Copy updated files to VPS** after making changes here
3. **Use Git** to sync changes (recommended for production)

---

## 🆘 Need Help?

If you can't copy the file, I can:
1. Show you the EXACT file content line-by-line to copy/paste
2. Create a downloadable deployment package
3. Help set up Git sync for automatic deployment

---

**The fix is ready in the project files - it just needs to be deployed to your VPS!** 🚀
