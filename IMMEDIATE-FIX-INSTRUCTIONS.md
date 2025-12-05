# ⚡ IMMEDIATE FIX - Backend Server (129 Restarts)

**Problem**: Your VPS has OLD backend code. This workspace has NEW fixed code.

**Solution**: Copy the fixed code to VPS.

---

## 🚀 Step-by-Step (5 Minutes)

### Step 1: Open TWO Files

**File 1 - The Fix** (in this workspace):
- Click on `backend/CORS-FIX-COPY-PASTE.txt`
- Select ALL text (`Ctrl+A`)
- Copy (`Ctrl+C`)

**File 2 - The Server** (on VPS):
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
nano server.js
```

---

### Step 2: Find & Replace

In nano on VPS:

1. **Press** `Ctrl+W` (search)
2. **Type**: `app.use(cors`
3. **Press** `Enter`

You'll see something like:
```javascript
app.use(cors({
    origin: function(origin, callback) {
        const allowedOrigins = [
            ...
        ];
        
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy violation'), false);
    },
    credentials: true
}));
```

4. **Delete** from `app.use(cors({` down to `}));` (about 10-12 lines)

5. **Paste** the content you copied from `CORS-FIX-COPY-PASTE.txt` (`Ctrl+Shift+V` or right-click paste)

---

### Step 3: Save & Restart

1. **Save**: `Ctrl+X`, then `Y`, then `Enter`

2. **Restart**:
   ```bash
   pm2 restart workforce-backend
   ```

3. **Wait 10 seconds**, then check:
   ```bash
   pm2 status
   ```

**Look for**:
- ✅ `restarts: 0` (should STOP increasing)
- ✅ `status: online`

---

## ✅ Success!

If `restarts` stays at 0 for 1 minute, the fix worked!

Your backend will now:
- ✅ Stop crashing every 30 seconds
- ✅ Accept requests from GenSpark frontend
- ✅ Connect chat assistant to real AI

---

## 🔍 What Changed?

**Old Code (CRASHED)**:
```javascript
return callback(new Error('CORS policy violation'), false);  // ❌ Throws error = crash
```

**New Code (STABLE)**:
```javascript
callback(null, false);  // ✅ Rejects gracefully = no crash
```

Plus added:
- `https://sxcrlfyt.gensparkspace.com` to allowed origins
- Wildcard support for `.gensparkspace.com` domains
- Better logging for debugging

---

## 📞 Need Help?

If you get stuck:
1. Share which step you're on
2. Share error messages
3. Share output of `pm2 status`

**Do Step 1 first - copy the CORS fix to VPS!** 🔧
