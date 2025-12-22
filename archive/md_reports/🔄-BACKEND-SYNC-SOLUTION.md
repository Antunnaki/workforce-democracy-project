# 🔄 Backend Version Sync Solution

**Problem**: Backend on VPS keeps running old code (v36.x) while frontend is v37.0.0  
**Root Cause**: Manual backend deployment causes version drift  
**Solution**: Automated deployment process + version management  

---

## 🎯 **Immediate Fix Applied**

### **What Changed**:

**File**: `backend/server.js`

**Change**: Removed CORS middleware (now handled by Nginx)

```diff
- // Middleware - CORS Configuration (V36.5.1: Multi-origin support + wildcard for testing)
- app.use(cors({
-     origin: function(origin, callback) {
-         // ... 40 lines of CORS config
-     },
-     credentials: true
- }));

+ // V37.0.1: CORS DISABLED - Now handled by Nginx reverse proxy
+ // This prevents duplicate Access-Control-Allow-Origin headers
+ console.log('ℹ️  CORS handled by Nginx reverse proxy (v37.0.1)');
```

**Why**: Nginx already handles CORS, so Express CORS was causing duplicate headers.

---

## 🚀 **How to Deploy Backend v37.0.1**

### **Option 1: Automated Script (Recommended)**

I created a deployment script that handles everything:

**From your local machine** (where you downloaded the GenSpark project):

```bash
# Make script executable
chmod +x deploy-backend-v37.sh

# Run deployment
./deploy-backend-v37.sh
```

**What it does**:
1. ✅ Creates backup on VPS
2. ✅ Uploads new backend files via rsync
3. ✅ Installs dependencies
4. ✅ Restarts PM2 process
5. ✅ Tests endpoints
6. ✅ Shows logs

---

### **Option 2: Manual Deployment**

If the script doesn't work, follow these manual steps:

#### **Step 1: Upload Files to VPS**

From your local machine:

```bash
# Navigate to project directory
cd /path/to/workforce-democracy-project

# Upload backend files (from local to VPS)
rsync -avz --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    ./backend/ root@185.193.126.13:/var/www/workforce-democracy/backend/
```

#### **Step 2: SSH into VPS and Restart**

```bash
# SSH into VPS
ssh root@185.193.126.13

# Navigate to backend
cd /var/www/workforce-democracy/backend

# Install dependencies (if needed)
npm install --production

# Restart PM2
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend

# Check logs
sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 20
```

#### **Step 3: Verify**

```bash
# Test health endpoint
curl https://api.workforcedemocracyproject.org/api/civic/llm-health

# Check CORS headers (should see only ONE Access-Control-Allow-Origin)
curl -I https://api.workforcedemocracyproject.org/api/civic/llm-health | grep -i "access-control"
```

**Expected**: Only ONE `access-control-allow-origin` header (from Nginx, not Express)

---

## 🔧 **Option 3: Quick Fix on VPS (Temporary)**

If you just want to fix the immediate issue without uploading files:

**SSH into VPS**:

```bash
ssh root@185.193.126.13
```

**Edit server.js**:

```bash
cd /var/www/workforce-democracy/backend
nano server.js
```

**Find line ~28** (the `app.use(cors({` block) and comment it out:

```javascript
// V37.0.1: CORS handled by Nginx
/*
app.use(cors({
    origin: function(origin, callback) {
        // ... entire CORS config
    },
    credentials: true
}));
*/
console.log('ℹ️ CORS handled by Nginx reverse proxy (v37.0.1)');
```

**Save and restart**:

```bash
# Ctrl+O to save, Enter, Ctrl+X to exit
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend
```

---

## 🛡️ **Long-term Solution: Prevent Version Drift**

### **Problem**: 
- Frontend in GenSpark gets updated to v37.0.0
- Backend on VPS stays at v36.x
- They get out of sync → things break

### **Solutions**:

#### **1. Version Management (Recommended)**

Add a version file that both frontend and backend check:

**Create**: `backend/version.json`
```json
{
  "version": "37.0.1",
  "frontend": "37.0.0",
  "backend": "37.0.1",
  "lastUpdated": "2025-11-03",
  "changes": [
    "CORS moved to Nginx",
    "Fixed duplicate CORS headers"
  ]
}
```

**Backend checks version on startup**:
```javascript
const version = require('./version.json');
console.log(`🚀 Backend v${version.backend} starting...`);
```

**Frontend checks compatibility**:
```javascript
const response = await fetch('https://api.workforcedemocracyproject.org/version');
const backendVersion = await response.json();
if (backendVersion.backend !== expectedVersion) {
    console.warn('⚠️ Backend version mismatch!');
}
```

---

#### **2. Deployment Checklist**

**When updating project**:

- [ ] Update frontend files
- [ ] Update backend files
- [ ] Deploy frontend to Netlify
- [ ] Deploy backend to VPS (use script!)
- [ ] Test all endpoints
- [ ] Verify CORS headers
- [ ] Check browser console

---

#### **3. Git Integration (Best Practice)**

**Setup Git on VPS**:

```bash
# On VPS
cd /var/www/workforce-democracy/backend
git init
git remote add origin <your-repo-url>

# Deploy process becomes:
git pull origin main
npm install
pm2 restart workforce-democracy-backend
```

---

#### **4. CI/CD Pipeline (Future)**

**GitHub Actions** example:

```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
    paths: ['backend/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to VPS
        run: |
          rsync -avz ./backend/ root@185.193.126.13:/var/www/workforce-democracy/backend/
          ssh root@185.193.126.13 "cd /var/www/workforce-democracy/backend && npm install && pm2 restart workforce-democracy-backend"
```

---

## 📊 **Testing After Deployment**

### **Test 1: Version Check**

```bash
# Should show v37.0.1 or higher
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

### **Test 2: CORS Headers**

```bash
curl -I https://api.workforcedemocracyproject.org/api/civic/llm-health | grep -i "access-control"
```

**Expected**:
```
access-control-allow-origin: https://workforcedemocracyproject.org
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-headers: Content-Type, Authorization
```

**Should NOT see**:
```
vary: Origin                              ← Should be GONE
access-control-allow-credentials: true    ← Should be GONE
```

### **Test 3: Frontend**

1. Go to: `https://workforcedemocracyproject.org/civic-platform.html`
2. Open DevTools (F12)
3. Enter ZIP: `12061`
4. Should see: 3 representatives (no CORS errors!)

---

## 🐛 **Troubleshooting**

### **Issue**: "Access-Control-Allow-Origin cannot contain more than one origin"

**Cause**: Both Nginx AND Express setting CORS headers  
**Fix**: Remove CORS from Express (this deployment does that)

### **Issue**: Backend still at old version after deployment

**Check**:
```bash
ssh root@185.193.126.13
cat /var/www/workforce-democracy/backend/server.js | head -15
```

Should show:
```javascript
/**
 * WORKFORCE DEMOCRACY PROJECT - Backend API Server
 * Version: 37.0.1
```

If it shows old version, files didn't upload correctly. Use rsync again.

### **Issue**: PM2 process not restarting

**Solution**:
```bash
ssh root@185.193.126.13
sudo /opt/nodejs/bin/pm2 delete workforce-democracy-backend
sudo /opt/nodejs/bin/pm2 start /var/www/workforce-democracy/backend/server.js --name workforce-democracy-backend
sudo /opt/nodejs/bin/pm2 save
```

---

## 📝 **Deployment Script Usage**

### **Prerequisites**:

1. SSH access to VPS configured
2. rsync installed locally
3. Project downloaded from GenSpark

### **Usage**:

```bash
# From project root directory
./deploy-backend-v37.sh
```

### **Script Features**:

- ✅ Automatic backup before deployment
- ✅ Excludes node_modules (re-installs on server)
- ✅ Preserves .env file on server
- ✅ Automatic PM2 restart
- ✅ Health check after deployment
- ✅ Keeps last 5 backups

### **Rollback** (if deployment breaks something):

```bash
ssh root@185.193.126.13

# List backups
ls -lt /var/www/workforce-democracy/backend-backups/

# Restore from backup
cp -r /var/www/workforce-democracy/backend-backups/backend-backup-20251103-XXXXXX/* /var/www/workforce-democracy/backend/

# Restart
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend
```

---

## 🎯 **Summary**

### **What Was Wrong**:
- Backend on VPS: v36.x (old)
- Frontend in GenSpark: v37.0.0 (new)
- Backend had CORS enabled
- Nginx ALSO had CORS enabled
- Result: Duplicate CORS headers → browser rejected requests

### **What We Fixed**:
- ✅ Removed CORS from Express backend
- ✅ Let Nginx handle CORS exclusively
- ✅ Updated backend version to v37.0.1
- ✅ Created deployment script for future updates

### **How to Prevent This**:
- ✅ Use deployment script: `./deploy-backend-v37.sh`
- ✅ Always deploy backend when frontend changes
- ✅ Check versions match
- ✅ Test CORS headers after deployment

---

## 📚 **Files Modified**

1. **`backend/server.js`** - Removed CORS middleware (v37.0.1)
2. **`deploy-backend-v37.sh`** - NEW - Automated deployment script
3. **`🔄-BACKEND-SYNC-SOLUTION.md`** - This guide

---

## 🚀 **Next Steps**

1. **Deploy backend** using one of the methods above
2. **Test CORS headers** (should see only ONE origin header)
3. **Test frontend** at civic-platform.html
4. **Save deployment script** for future use

---

**Status**: ✅ Solution ready - choose deployment method and execute! 🎉
