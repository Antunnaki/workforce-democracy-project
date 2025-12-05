# 🔥 Fire Button Solution - VPS Deployment Commands

**Version**: v37.11.5-FIRE-BUTTON  
**Date**: January 18, 2025  
**Purpose**: Deploy backend session persistence to survive DuckDuckGo Fire button

**Your Local Path**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.5-FIRE-BUTTON/`

---

## 📋 PRE-DEPLOYMENT CHECKLIST

- [ ] Backed up current version to BACKUPS folder
- [ ] Downloaded updated files from GenSpark to current version folder
- [ ] VPS SSH access confirmed (root@workforce-democracy.org)
- [ ] Terminal ready on Mac

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### **STEP 1: Upload Backend Files from Mac to VPS**

Open Terminal on your Mac and run these commands:

```bash
# Upload Session model (NEW FILE)
scp "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.5-FIRE-BUTTON/backend/models/Session.js" root@workforce-democracy.org:/var/www/workforce-democracy/backend/models/

# Upload updated personalization routes
scp "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.5-FIRE-BUTTON/backend/routes/personalization.js" root@workforce-democracy.org:/var/www/workforce-democracy/backend/routes/

# Upload updated server.js
scp "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.5-FIRE-BUTTON/backend/server.js" root@workforce-democracy.org:/var/www/workforce-democracy/backend/
```

**Expected output**: Each file should show 100% transfer progress

---

### **STEP 2: SSH into VPS**

```bash
ssh root@workforce-democracy.org
```

**Expected**: Password prompt, then successful login

---

### **STEP 3: Navigate to Backend Directory**

```bash
cd /var/www/workforce-democracy/backend/
```

---

### **STEP 4: Install cookie-parser Package**

```bash
npm install cookie-parser
```

**Expected output**: 
```
added 1 package, and audited X packages in Xs
```

---

### **STEP 5: Verify Files Uploaded Correctly**

```bash
# Check Session model exists
ls -lh models/Session.js

# Check personalization routes updated
ls -lh routes/personalization.js

# Check server.js updated
ls -lh server.js

# Verify cookie-parser installed
ls node_modules/ | grep cookie-parser
```

**Expected**: All files should exist with recent timestamps

---

### **STEP 6: Restart Backend with PM2**

```bash
/opt/nodejs/bin/pm2 restart backend
```

**Expected output**:
```
[PM2] Applying action restartProcessId on app [backend](ids: [ 0 ])
[PM2] [backend](0) ✓
```

---

### **STEP 7: Monitor Logs for Errors**

```bash
/opt/nodejs/bin/pm2 logs backend --lines 50
```

**Look for**:
- ✅ `Server running on port XXXX`
- ✅ `MongoDB Connected` (if MongoDB setup complete)
- ✅ No error messages
- ❌ Any errors about missing modules or syntax errors

**To exit logs**: Press `Ctrl + C`

---

### **STEP 8: Test Backend Health**

```bash
curl http://localhost:3000/health
```

**Expected**: JSON response with status OK

---

## 🎨 FRONTEND DEPLOYMENT (GenSpark)

### **Files to Upload to GenSpark Project**:

1. **js/personalization-system.js** (updated with session recovery)

### **Upload Process**:
1. Go to GenSpark workspace: https://sxcrlfyt.gensparkspace.com
2. Upload updated `js/personalization-system.js`
3. Clear browser cache
4. Test Fire button recovery flow

---

## 🧪 TESTING PROCEDURE

### **Test 1: Normal Registration**
1. Open https://sxcrlfyt.gensparkspace.com
2. Register new account: `testfire01` / password
3. Verify localStorage populated (Dev Tools → Application → Local Storage)
4. **Expected**: All keys present (username, password_hash, salt, user_data)

### **Test 2: Normal Refresh (F5)**
1. Refresh page with F5
2. Check localStorage still exists
3. **Expected**: Still logged in, data intact

### **Test 3: Fire Button (CRITICAL)**
1. Log in with account
2. Wait for sync confirmation
3. Click DuckDuckGo Fire Button
4. **Expected**: Page reloads, localStorage cleared
5. **Expected**: System detects session cookie
6. **Expected**: Prompt for password to decrypt data
7. Enter password
8. **Expected**: Data restored, back to logged-in state

### **Test 4: Session Expiration**
1. Clear session cookie manually
2. Refresh page
3. **Expected**: Welcome banner shows (no session found)

---

## 🔍 TROUBLESHOOTING

### **Problem**: `cookie-parser not found`
**Solution**: 
```bash
cd /var/www/workforce-democracy/backend/
npm install cookie-parser
/opt/nodejs/bin/pm2 restart backend
```

### **Problem**: Session endpoint returns 401
**Solution**: Check browser cookies, verify session token present

### **Problem**: Backend won't restart
**Solution**:
```bash
/opt/nodejs/bin/pm2 logs backend --lines 100
# Look for syntax errors or missing dependencies
```

### **Problem**: Session restoration prompts for password but fails
**Solution**: Check browser console for decryption errors. Verify password is correct.

---

## 📊 VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Backend restarted without errors
- [ ] `/health` endpoint responds
- [ ] New user registration creates session cookie
- [ ] Session cookie visible in browser (Dev Tools → Application → Cookies)
- [ ] Session survives Fire button (prompts for password)
- [ ] Password decryption works correctly
- [ ] Data restored after Fire button + password entry
- [ ] Auto-sync still works after restoration

---

## 🆘 ROLLBACK PROCEDURE

If deployment fails and you need to rollback:

```bash
# SSH into VPS
ssh root@workforce-democracy.org

# Navigate to backend
cd /var/www/workforce-democracy/backend/

# Restore from your VPS backup (if you made one)
# OR re-upload previous working version files

# Restart backend
/opt/nodejs/bin/pm2 restart backend
```

---

## 📝 POST-DEPLOYMENT TASKS

1. [ ] Download all files from GenSpark workspace
2. [ ] Move WDP-v37.11.4-PERSONALIZATION to BACKUPS folder
3. [ ] Create new folder: WDP-v37.11.5-FIRE-BUTTON
4. [ ] Copy all downloaded files to WDP-v37.11.5-FIRE-BUTTON folder
5. [ ] Run backend deployment commands from this guide
6. [ ] Upload js/personalization-system.js to GenSpark workspace
7. [ ] Test Fire button recovery on GenSpark site
8. [ ] Deploy to production Netlify after testing confirms working

---

**🔒 Keep this file for reference during deployment!**

**⚠️ IMPORTANT**: Test thoroughly on GenSpark site before deploying to production Netlify!
