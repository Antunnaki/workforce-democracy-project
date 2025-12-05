# 🎯 YOUR CUSTOM DEPLOYMENT GUIDE - Fix #13-#15

**Your Name**: acejrowski  
**Your Local Path**: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION`  
**VPS IP**: 185.193.126.13  
**VPS Backend Path**: `/var/www/workforce-backend/`  
**Date**: January 17, 2025

---

## 🚨 **CRITICAL: BACKEND MUST BE DEPLOYED FIRST!**

---

## **PART 1: BACKEND DEPLOYMENT (VPS)** ⏱️ 10 minutes

### **Step 1: Open Terminal on Your Mac** ⏱️ 30 sec

1. Press `Cmd + Space` (Spotlight)
2. Type: `Terminal`
3. Press `Enter`

**✅ You should see**: Terminal window opens

---

### **Step 2: Connect to Your VPS** ⏱️ 1 min

```bash
ssh root@185.193.126.13
```

- Type your VPS password when prompted
- Password will NOT show as you type (normal!)

**✅ SUCCESS**: You see prompt like `root@hostname:~#`  
**❌ ERROR**: Share the error message with me

---

### **Step 3: Navigate to Backend Directory** ⏱️ 30 sec

```bash
cd /var/www/workforce-backend
```

**Verify you're in the right place**:
```bash
ls -la
```

**✅ You should see**:
- `models/` folder
- `routes/` folder
- `server.js` file
- `package.json` file

**❌ IF NOT**: Try this instead:
```bash
cd /var/www/workforce-democracy/backend
```

Tell me which path works!

---

### **Step 4: Backup Current Files** ⏱️ 1 min

```bash
# Create backups (safety first!)
cp models/UserBackup.js models/UserBackup.js.BACKUP-JAN17
cp routes/personalization.js routes/personalization.js.BACKUP-JAN17
```

**Verify backups created**:
```bash
ls -la models/UserBackup.js*
ls -la routes/personalization.js*
```

**✅ You should see** both `.js` and `.js.BACKUP-JAN17` files

---

### **Step 5: Edit UserBackup.js** ⏱️ 2 min

```bash
nano models/UserBackup.js
```

**Find this section** (around line 28-38):
```javascript
  // Encrypted user data (server cannot read this)
  encrypted_data: {
    type: String,
    required: true
  },

  // Salt for encryption (public, needed for decryption)
  encryption_salt: {
    type: String,
    required: true
  },
```

**ADD these 5 lines** AFTER `encrypted_data` and BEFORE `encryption_salt`:
```javascript
  // Initialization Vector (IV) for AES-GCM encryption
  iv: {
    type: String,
    required: true
  },
```

**After editing, it should look like**:
```javascript
  // Encrypted user data (server cannot read this)
  encrypted_data: {
    type: String,
    required: true
  },

  // Initialization Vector (IV) for AES-GCM encryption
  iv: {
    type: String,
    required: true
  },

  // Salt for encryption (public, needed for decryption)
  encryption_salt: {
    type: String,
    required: true
  },
```

**Save and exit**:
- Press `Ctrl + O` (save)
- Press `Enter` (confirm filename)
- Press `Ctrl + X` (exit)

**✅ File saved!**

---

### **Step 6: Edit personalization.js (4 changes)** ⏱️ 3 min

```bash
nano routes/personalization.js
```

#### **Change 1 - Line 28** (Add `iv` to destructuring):

**FIND**:
```javascript
const { username, encrypted_data, encryption_salt, recovery_hash } = req.body;
```

**CHANGE TO**:
```javascript
const { username, encrypted_data, iv, encryption_salt, recovery_hash } = req.body;
```

---

#### **Change 2 - Line 31** (Add `iv` to validation):

**FIND**:
```javascript
if (!username || !encrypted_data || !encryption_salt || !recovery_hash) {
```

**CHANGE TO**:
```javascript
if (!username || !encrypted_data || !iv || !encryption_salt || !recovery_hash) {
```

---

#### **Change 3 - Line 53-61** (Add `iv` to user creation):

**FIND**:
```javascript
const userBackup = new UserBackup({
  username,
  encrypted_data,
  encryption_salt,
  recovery_hash,
  created_at: new Date(),
  last_sync: new Date(),
  device_count: 1
});
```

**CHANGE TO** (add `iv,` after `encrypted_data,`):
```javascript
const userBackup = new UserBackup({
  username,
  encrypted_data,
  iv,
  encryption_salt,
  recovery_hash,
  created_at: new Date(),
  last_sync: new Date(),
  device_count: 1
});
```

---

#### **Change 4 - Line 113-118** (Add `iv` to login response):

**FIND**:
```javascript
res.json({
  success: true,
  encrypted_data: userBackup.encrypted_data,
  encryption_salt: userBackup.encryption_salt,
  last_sync: userBackup.last_sync
});
```

**CHANGE TO** (add `iv: userBackup.iv,`):
```javascript
res.json({
  success: true,
  encrypted_data: userBackup.encrypted_data,
  iv: userBackup.iv,
  encryption_salt: userBackup.encryption_salt,
  last_sync: userBackup.last_sync
});
```

---

**Save and exit**:
- Press `Ctrl + O` (save)
- Press `Enter` (confirm)
- Press `Ctrl + X` (exit)

**✅ All 4 changes done!**

**💡 TIP**: Use `Ctrl + W` in nano to search for text

---

### **Step 7: Restart PM2** ⏱️ 1 min

```bash
/opt/nodejs/bin/pm2 restart workforce-backend
```

**Check if it restarted**:
```bash
/opt/nodejs/bin/pm2 logs workforce-backend --lines 30
```

**✅ LOOK FOR** (in the logs):
- "Server running on port..."
- "Connected to MongoDB"

**❌ LOOK FOR ERRORS**:
- "Error: missing field 'iv'"
- "ValidationError"
- Any crash messages

**✅ SUCCESS**: No errors, server running  
**❌ ERROR**: Share the error logs with me!

---

### **Step 8: Clear MongoDB Database** ⏱️ 2 min

**⚠️ CRITICAL**: All old test accounts MUST be deleted!

```bash
mongosh
```

**If `mongosh` doesn't work, try**:
```bash
mongo
```

**Once in MongoDB shell, run these commands**:
```javascript
use workforce_democracy
db.userbackups.deleteMany({})
db.userbackups.countDocuments()
```

**✅ Should return**: `0` (zero accounts)

**Exit MongoDB**:
```javascript
exit
```

**You can now close the VPS terminal or keep it open**.

---

## **PART 2: FRONTEND DEPLOYMENT (GenSparkSpace)** ⏱️ 3 minutes

### **Step 9: Update Frontend File on Your Mac** ⏱️ 1 min

1. **On your Mac**, navigate to:
   ```
   /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION
   ```

2. **Find the file**:
   ```
   js/personalization-ui.js
   ```

3. **Replace it** with the updated file from GenSpark workspace

**✅ File replaced on your Mac**

---

### **Step 10: Deploy to GenSparkSpace** ⏱️ 2 min

1. **Open GenSparkSpace** editor in browser

2. **Navigate to** `js/` folder

3. **Upload/Replace** `personalization-ui.js`

4. **Save/Publish** changes

**✅ File uploaded to GenSparkSpace**

---

### **Step 11: Clear Browser Data** ⏱️ 1 min

1. **Open GenSparkSpace site** in browser:
   ```
   https://sxcrlfyt.gensparkspace.com
   ```

2. **Open DevTools**:
   - Press `F12` OR
   - Press `Cmd + Option + I`

3. **Go to Console tab**

4. **Run these commands**:
   ```javascript
   localStorage.clear()
   location.reload()
   ```

5. **Hard refresh** the page:
   - Press `Cmd + Shift + R`

**✅ Browser data cleared!**

---

## **PART 3: TEST EVERYTHING** 🧪 ⏱️ 5 minutes

### **Step 12: Test Registration** ⏱️ 3 min

1. **Click "Get Started"**

2. **Fill out Step 1** (username/password)
   - Username: `testfinal`
   - Password: (anything secure)

3. **CHECK CONSOLE** for:
   ```
   Registering account...
   ✅ Registration successful
   ```

4. **Fill out Step 2** (address)
   - Any valid address

5. **CHECK CONSOLE** for:
   ```
   ✅ Address saved
   ```

6. **Fill out Step 3** (language)

7. **CHECK CONSOLE** for:
   ```
   ✅ Language saved
   🔑 Recovery key displayed
   ```

8. **Click "Download Key"**
   - Alert should appear with filename

9. **Click "Complete Setup! ✓"**

10. **🎯 NEW - CHECK CONSOLE** for:
    ```
    📤 Syncing data to backend...
    ✅ Data synced successfully
    ✅ Setup complete - reloading page...
    ```

11. **Page reloads automatically**

12. **VERIFY**:
    - ✅ Account menu appears (top-right)
    - ✅ Welcome banner HIDDEN (bottom-left)

**✅ SUCCESS**: Registration works!  
**❌ ERROR**: Share console logs with me

---

### **Step 13: Test Login** ⏱️ 2 min

1. **Click account menu** → "Sign Out"

2. **Welcome banner reappears**

3. **Click "Sign In"**

4. **Enter credentials**:
   - Username: `testfinal`
   - Password: (what you used)

5. **Click "Proceed"**

6. **🎯 CHECK CONSOLE** - Should see:
   ```
   Logging in...
   ✅ Login successful
   👤 showAccountIndicator() called
   ✅ Account indicator displayed
   ```

7. **🎯 SHOULD NOT SEE**:
   ```
   ❌ Decryption failed: TypeError...  ← GONE!
   ❌ Login error: Invalid username...  ← GONE!
   ```

8. **VERIFY**:
   - ✅ Login works
   - ✅ Account menu appears
   - ✅ Welcome banner hidden
   - ✅ No errors in console

**✅ SUCCESS**: Login works perfectly!  
**❌ ERROR**: Share console logs with me

---

## 🎉 **YOU'RE DONE!**

If both tests passed:
- ✅ Registration works
- ✅ Sync works
- ✅ Login works
- ✅ No decryption errors
- ✅ **FULL PERSONALIZATION SYSTEM IS WORKING!**

---

## 📊 **NEXT STEPS (After Testing)**

### **Optional: Deploy to Netlify Production**

1. **Navigate to your project folder**:
   ```
   /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.11.4-PERSONALIZATION
   ```

2. **Drag entire folder** to Netlify dashboard

3. **Wait 1-2 minutes** for deployment

4. **Test on production** site:
   ```
   https://workforcedemocracyproject.org
   ```

### **Clean Up Test Accounts**

Once you have your real account created:

**On VPS**:
```bash
mongosh
use workforce_democracy
db.userbackups.deleteMany({ username: { $in: ['test', 'test2', 'test3', 'test4', 'testfinal'] } })
exit
```

---

## 📞 **IF YOU GET STUCK**

**At ANY step**, if something doesn't work:

1. **STOP** at that step
2. **Copy** the error message
3. **Screenshot** if needed
4. **Tell me**:
   - Which step number
   - What you see
   - Any error messages

I'll help you fix it immediately!

---

## 📚 **FILES SUMMARY**

### **Backend (VPS)**:
- ✅ `models/UserBackup.js` - Added `iv` field
- ✅ `routes/personalization.js` - 4 changes to save/return `iv`

### **Frontend (GenSparkSpace)**:
- ✅ `js/personalization-ui.js` - Added sync call to `completeSetup()`

### **Total Changes**: 3 files, ~40 lines

---

**🚀 Ready to start? Begin with Step 1 and let me know when you complete each part!**
