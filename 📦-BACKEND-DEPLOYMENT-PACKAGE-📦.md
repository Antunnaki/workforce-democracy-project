# 📦 BACKEND DEPLOYMENT PACKAGE

**VPS**: 185.193.126.13  
**Files to Deploy**: 2 backend files  
**Method**: Copy these files to VPS and restart PM2

---

## 📁 **FILES TO DEPLOY**

### **File 1: backend/models/UserBackup.js**
**Location on VPS**: `/path/to/backend/models/UserBackup.js`

This file has been updated in your local project. You need to copy it to the VPS.

**What changed**: Added `iv` field to the schema (lines 38-42)

---

### **File 2: backend/routes/personalization.js**
**Location on VPS**: `/path/to/backend/routes/personalization.js`

This file has been updated in your local project. You need to copy it to the VPS.

**What changed**: 
- Registration now saves `iv` (line 28, 31, 56)
- Login now returns `iv` (line 115)

---

## 🔧 **DEPLOYMENT METHODS**

### **Method A: SSH + Manual Copy**
```bash
# 1. SSH into VPS
ssh root@185.193.126.13

# 2. Navigate to backend directory
cd /path/to/your/backend

# 3. Create backup of current files
cp models/UserBackup.js models/UserBackup.js.backup
cp routes/personalization.js routes/personalization.js.backup

# 4. Use nano/vim to edit files or upload via SFTP
nano models/UserBackup.js
nano routes/personalization.js
```

### **Method B: Git Push/Pull**
```bash
# On your local machine:
git add backend/models/UserBackup.js
git add backend/routes/personalization.js
git commit -m "Fix: Add IV field for encryption (Bug #13)"
git push origin main

# On VPS:
ssh root@185.193.126.13
cd /path/to/your/backend
git pull origin main
```

### **Method C: SFTP Upload**
```bash
# Using command line SFTP:
sftp root@185.193.126.13

# Once connected:
cd /path/to/backend/models
put backend/models/UserBackup.js

cd ../routes
put backend/routes/personalization.js

exit
```

---

## 🔄 **AFTER FILES ARE UPLOADED**

### **Step 1: Restart PM2**
```bash
# SSH into VPS
ssh root@185.193.126.13

# Restart the backend process
pm2 restart workforce-democracy-backend

# OR if you don't know the process name:
pm2 list
# Look for your backend process name, then:
pm2 restart [process-name]
```

### **Step 2: Verify Restart**
```bash
# Check logs
pm2 logs workforce-democracy-backend --lines 50

# Look for:
# ✅ "Server running on port..."
# ✅ "Connected to MongoDB"
# ❌ NO errors about missing fields
```

### **Step 3: Test Backend API**
```bash
# Test the registration endpoint
curl -X POST https://api.workforcedemocracyproject.org/api/personalization/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "encrypted_data": "test123",
    "iv": "abc123",
    "encryption_salt": "salt123",
    "recovery_hash": "hash123"
  }'

# Should return:
# {"success":true,"message":"Account created successfully","username":"testuser"}
```

---

## 🗑️ **CLEAR DATABASE (REQUIRED)**

### **After Backend is Deployed and Restarted**
```bash
# SSH into VPS
ssh root@185.193.126.13

# Open MongoDB shell
mongosh

# Use your database
use workforce_democracy

# Delete ALL test accounts (old schema incompatible!)
db.userbackups.deleteMany({})

# Verify deletion
db.userbackups.countDocuments()
# Should return: 0

# Exit MongoDB
exit
```

**⚠️ WHY**: All existing accounts are missing the `iv` field. They WILL cause errors!

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Backend files copied to VPS
- [ ] PM2 restarted successfully
- [ ] No errors in PM2 logs
- [ ] MongoDB connected
- [ ] Database cleared (0 accounts)
- [ ] Test API call succeeded
- [ ] Ready for frontend deployment

---

## 📞 **IF YOU GET STUCK**

### **Can't SSH into VPS**:
- Verify IP: 185.193.126.13
- Check SSH key/password
- Try: `ssh -v root@185.193.126.13` for verbose output

### **Don't know backend path**:
```bash
# After SSH:
find / -name "workforce-democracy*" -type d 2>/dev/null
# Or:
pm2 list
# Look at the "script" column for the path
```

### **PM2 not found**:
```bash
# Check if PM2 is installed
which pm2
# If not installed:
npm install -g pm2
```

---

**NEXT**: Once backend is deployed and verified, we'll deploy the frontend!
