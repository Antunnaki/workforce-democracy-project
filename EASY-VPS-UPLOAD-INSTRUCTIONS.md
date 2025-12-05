# 🚀 EASY VPS UPLOAD - Complete Instructions

**What you're doing:** Uploading the updated `server.js` and `personalization.js` files to your VPS.

---

## 📦 OPTION 1: Upload Just 2 Files (Easiest!)

From your **local machine terminal**:

### **Step 1: Upload updated server.js**

```bash
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/backend/server-UPDATED-WITH-PERSONALIZATION.js" root@185.193.126.13:/var/www/workforce-democracy/backend/server.js
```

**⚠️ Note:** This will overwrite your existing server.js with the personalization-enabled version.

### **Step 2: Upload personalization route**

```bash
scp -P 22 "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/backend/routes/personalization.js" root@185.193.126.13:/var/www/workforce-democracy/backend/routes/personalization.js
```

### **Step 3: Restart backend (SSH into VPS)**

```bash
ssh root@185.193.126.13 -p 22
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0 --lines 30
```

**Look for these success messages:**
```
✅ Connected to PostgreSQL database
🏛️  Civic Platform API loaded (v37.0.0)
🔐 Personalization API loaded (v37.11.4)
Server running on port 3001
```

### **Step 4: Test the API**

```bash
# Still on VPS
curl http://localhost:3001/api/personalization/health
```

**Expected response:**
```json
{
  "status": "ok",
  "users": 0,
  "timestamp": "2025-11-15T..."
}
```

---

## 📦 OPTION 2: Manual Copy-Paste Method (If SCP Doesn't Work)

### **For server.js:**

1. **On local machine:**
   ```bash
   cat backend/server-UPDATED-WITH-PERSONALIZATION.js
   ```

2. **Copy all the output**

3. **SSH into VPS:**
   ```bash
   ssh root@185.193.126.13 -p 22
   cd /var/www/workforce-democracy/backend
   cp server.js server.js.backup  # Backup first!
   nano server.js
   ```

4. **Delete all content (Ctrl+K repeatedly)**

5. **Paste the copied content**

6. **Save:** `Ctrl+X`, `Y`, `Enter`

### **For personalization.js:**

1. **On local machine:**
   ```bash
   cat backend/routes/personalization.js
   ```

2. **Copy all the output**

3. **SSH into VPS:**
   ```bash
   ssh root@185.193.126.13 -p 22
   cd /var/www/workforce-democracy/backend
   mkdir -p routes
   nano routes/personalization.js
   ```

4. **Paste the copied content**

5. **Save:** `Ctrl+X`, `Y`, `Enter`

6. **Restart backend:**
   ```bash
   /opt/nodejs/bin/pm2 restart 0
   /opt/nodejs/bin/pm2 logs 0 --lines 30
   ```

---

## ✅ SUCCESS CHECKLIST

After uploading, verify these:

- [ ] **server.js uploaded** to `/var/www/workforce-democracy/backend/server.js`
- [ ] **personalization.js uploaded** to `/var/www/workforce-democracy/backend/routes/personalization.js`
- [ ] **PM2 restarted** without errors
- [ ] **Logs show:** `🔐 Personalization API loaded (v37.11.4)`
- [ ] **Health check works:** `curl http://localhost:3001/api/personalization/health`
- [ ] **No errors in PM2 logs**

---

## 🔧 TROUBLESHOOTING

### **Issue: "Cannot find module './routes/personalization'"**

**Solution:**
```bash
# Make sure the file exists
ls -la /var/www/workforce-democracy/backend/routes/personalization.js

# If missing, create it
cd /var/www/workforce-democracy/backend
mkdir -p routes
nano routes/personalization.js
# Paste the code from backend/routes/personalization.js
```

### **Issue: "Address already in use"**

**Solution:**
```bash
# PM2 is trying to start a duplicate
/opt/nodejs/bin/pm2 delete 0
/opt/nodejs/bin/pm2 start server.js --name workforce-backend
```

### **Issue: SCP permission denied**

**Solution:**
```bash
# Check file permissions on VPS
ssh root@185.193.126.13 -p 22
ls -la /var/www/workforce-democracy/backend/

# Fix permissions if needed
chmod 755 /var/www/workforce-democracy/backend
chmod 644 /var/www/workforce-democracy/backend/server.js
```

---

## 📊 WHAT GETS ADDED TO server.js

Only **3 lines** are added to your existing server.js:

**Line 26 (with other requires):**
```javascript
const personalizationRoutes = require('./routes/personalization');
```

**Line 877 (with other route definitions):**
```javascript
app.use('/api/personalization', personalizationRoutes);
console.log('🔐 Personalization API loaded (v37.11.4)');
```

That's it! Everything else in server.js stays the same.

---

## 🎯 NEXT STEPS AFTER UPLOAD

Once the backend is working:

1. **Update your Netlify frontend** to point to the VPS backend
2. **Test registration flow** on your Netlify site
3. **Test login flow** 
4. **Test cross-device sync**
5. **Celebrate!** 🎉

---

## 💡 TIPS

- **Always backup before overwriting:** `cp server.js server.js.backup`
- **Check PM2 logs if anything fails:** `/opt/nodejs/bin/pm2 logs 0`
- **Test health endpoint first:** `curl http://localhost:3001/api/personalization/health`
- **Use OPTION 2 (copy-paste) if SCP doesn't work**

---

**Need help? Check the logs:**
```bash
/opt/nodejs/bin/pm2 logs 0 --lines 100
```

**Good luck!** 🚀
