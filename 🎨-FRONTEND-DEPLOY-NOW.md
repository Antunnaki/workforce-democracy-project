# 🎨 Frontend Deployment - Method 1: Complete File Replacement

**Status**: ✅ File ready to deploy  
**Time**: 5 minutes  
**Risk**: Low (we have backups)

---

## 📥 Step 1: Download Updated File

The file `js/chat-clean.js` in this project has been updated with async polling code.

**Download it now** - it's ready to upload to your VPS!

---

## 📤 Step 2: Upload to VPS

### **Option A: Using SCP (From your local machine)**

```bash
# Upload updated file to VPS
scp -P 22 js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/js/
```

**Note**: This will overwrite the existing file.

---

### **Option B: Using SFTP/FTP Client** (FileZilla, Cyberduck, etc.)

1. Connect to VPS: `185.193.126.13`
2. Navigate to: `/var/www/workforce-democracy/js/`
3. Upload `chat-clean.js` (overwrite existing)
4. Done!

---

### **Option C: Copy-Paste via SSH** (If file transfer is difficult)

1. SSH into VPS:
   ```bash
   ssh root@185.193.126.13 -p 22
   ```

2. Backup current file:
   ```bash
   cd /var/www/workforce-democracy/js
   cp chat-clean.js chat-clean.js.backup-$(date +%Y%m%d-%H%M%S)
   ```

3. Download new file directly on VPS:
   ```bash
   # I'll provide the download command once you choose this option
   ```

---

## 🔧 Step 3: Update index.html Version

SSH into VPS:

```bash
ssh root@185.193.126.13 -p 22
cd /var/www/workforce-democracy
```

Find and update the version number:

```bash
# Find the line
grep "chat-clean.js?" index.html

# Edit the file
nano index.html
```

**Find this line** (search for `chat-clean.js`):
```html
<script src="js/chat-clean.js?v=37.9.11" defer></script>
```

**Change to**:
```html
<script src="js/chat-clean.js?v=37.9.12-ASYNC" defer></script>
```

**Save**: Ctrl+X, Y, Enter

---

## 🧹 Step 4: Clear Your Browser Cache

**Important!** Your browser has the old JavaScript cached.

### **Chrome/Edge**:
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"

### **Firefox**:
1. Press `Ctrl+Shift+Delete`
2. Select "Cache"
3. Click "Clear Now"

### **Or**: Hard refresh with `Ctrl+F5` on the homepage

---

## ✅ Step 5: Test!

1. Go to https://workforcedemocracyproject.org
2. Open chat widget (bottom-right corner)
3. Ask: **"Tell me about California labor policies"**

### **What You Should See**:

✅ **Loading message updates every 5 seconds**:
- "Searching RSS feeds... 20%"
- "Generating AI response... 50%"
- "Formatting response... 90%"

✅ **Response after 60-90 seconds** (NO TIMEOUT!)

✅ **Sources displayed at bottom**

✅ **No "Load failed" or timeout errors**

---

## 🎯 Which Upload Method Do You Prefer?

**Tell me which option you want**:
- **Option A**: SCP from local machine (fastest)
- **Option B**: SFTP/FTP client (most visual)
- **Option C**: Copy-paste via SSH (if file transfer is blocked)

I'll guide you through the one you choose! 🚀
