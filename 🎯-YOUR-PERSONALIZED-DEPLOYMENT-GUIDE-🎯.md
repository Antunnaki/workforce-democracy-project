# 🎯 YOUR PERSONALIZED DEPLOYMENT GUIDE 🎯

**Your VPS Environment**: 185.193.126.13  
**Your Project**: Workforce Democracy Project  
**Your A/B Structure**: Version A (Production) + Version B (Test)  
**Date**: November 26, 2025

---

## 📍 YOUR CURRENT ENVIRONMENT STRUCTURE

Based on the three main documents reviewed, here's YOUR specific setup:

### **Your VPS Directory Structure**
```
/var/www/workforce-democracy/
├── version-a/
│   ├── backend/           ← PRODUCTION (Port 3001) - NEVER EDIT DIRECTLY
│   │   ├── server.js
│   │   ├── civic-llm-async.js  ← [CRITICAL] Bug fixed in v37.18.5
│   │   ├── routes/
│   │   │   ├── civic-routes.js
│   │   │   └── bills-routes.js
│   │   ├── utils/
│   │   │   ├── contact-info-enhancer.js
│   │   │   └── bill-cache.js
│   │   ├── us-representatives.js
│   │   └── .env (PORT=3001, NODE_ENV=production)
│   ├── frontend/          ← SHARED FRONTEND FILES
│   │   ├── index.html
│   │   ├── privacy.html
│   │   ├── css/
│   │   │   └── main.css
│   │   └── js/
│   │       ├── main.js
│   │       ├── security.js
│   │       ├── civic.js
│   │       ├── civic-representative-finder.js
│   │       ├── bills-section.js
│   │       ├── jobs.js
│   │       ├── learning.js
│   │       ├── language.js
│   │       ├── local.js
│   │       ├── philosophies.js
│   │       ├── charts.js
│   │       └── personalization.js
│   └── logs/
├── version-b/
│   ├── backend/           ← TEST/DEVELOPMENT (Port 3002) - EDIT HERE FIRST
│   │   ├── [same structure as version-a]
│   │   ├── FIX-CIVIC-LLM-COMPLETE-v37.18.6.js  ← Your latest fix
│   │   └── .env (PORT=3002, NODE_ENV=development)
│   └── frontend/          ← Same as version-a (shared)
├── deployment-scripts/
│   ├── sync-b-to-a.sh    ← Main deployment script
│   ├── rollback.sh       ← Emergency rollback
│   └── backup.sh         ← Manual backups
└── backups/
    └── [timestamped backups]
```

### **Your System Services**
- **Production**: `workforce-backend-a.service` (Port 3001)
- **Development**: `workforce-backend-b.service` (Port 3002)
- **Database**: `workforce_democracy` (PostgreSQL, shared by both)
- **Node.js**: v20.19.5

### **Your API Endpoints**
**Production (Port 3001)**:
- `http://localhost:3001/api/civic/representatives/search`
- `http://localhost:3001/api/civic/llm-chat/submit`
- `http://localhost:3001/api/civic/llm-chat/status/:jobId`
- `http://localhost:3001/api/civic/llm-chat/result/:jobId`
- `http://localhost:3001/api/ai/analyze-bill`

**Test (Port 3002)**: Same endpoints on port 3002

---

## 🚨 CRITICAL RULES FOR YOUR ENVIRONMENT

### **Golden Rule #1: NEVER EDIT VERSION A DIRECTLY**
❌ **Never SSH and edit `/var/www/workforce-democracy/version-a/`**  
✅ **Always work in `/var/www/workforce-democracy/version-b/`**

### **Golden Rule #2: Test in Version B BEFORE Deploying to A**
✅ Edit files in `version-b/backend/`  
✅ Restart `workforce-backend-b.service`  
✅ Test thoroughly on port 3002  
✅ ONLY THEN deploy to Version A using `sync-b-to-a.sh`

### **Golden Rule #3: Use Deployment Scripts**
✅ **Deploy**: `./sync-b-to-a.sh` (auto-backup + auto-rollback on failure)  
✅ **Rollback**: `./rollback.sh 20251126-235959`  
✅ **Backup**: `./backup.sh both`

### **Golden Rule #4: Version A Can Only Be Updated From Version B**
- Version B → Version A ✅ (via `sync-b-to-a.sh`)
- Version A → Version B ❌ (Never)
- Manual edits to Version A ❌ (Never)

---

## 📦 YOUR PERSONALIZED UPLOAD STRUCTURE

### **Scenario 1: Uploading BACKEND Changes (Bug Fixes, API Updates)**

#### **Step 1: Upload to Version B**
```bash
# On your local machine
scp backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js
```

#### **Step 2: Connect via SSH**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend
```

#### **Step 3: Verify Upload**
```bash
# Check file size and modification date
ls -lh civic-llm-async.js

# Quick check for the fix (example: verify aiService.analyzeWithAI exists)
grep "aiService.analyzeWithAI" civic-llm-async.js
```

#### **Step 4: Restart Version B Service**
```bash
sudo systemctl restart workforce-backend-b.service
sudo systemctl status workforce-backend-b.service
```

#### **Step 5: Test on Port 3002**
```bash
# Test API endpoint
curl http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'

# Get job ID from response, then check result
curl http://localhost:3002/api/civic/llm-chat/result/[JOB_ID]
```

#### **Step 6: Check Logs**
```bash
tail -f /var/log/workforce-backend-b.log
```

#### **Step 7: Deploy to Version A (Production)**
```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

**What `sync-b-to-a.sh` Does**:
1. ✅ Auto-backs up Version A
2. ✅ Stops Version A gracefully
3. ✅ Syncs `version-b/backend/` → `version-a/backend/`
4. ✅ Preserves Version A's `.env` (production config)
5. ✅ Starts Version A
6. ✅ Verifies deployment
7. ✅ Auto-rolls back if verification fails

#### **Step 8: Verify Production**
```bash
# Check service status
sudo systemctl status workforce-backend-a.service

# Test production endpoint
curl http://localhost:3001/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'

# Check production logs
tail -f /var/log/workforce-backend-a.log
```

---

### **Scenario 2: Uploading FRONTEND Changes (HTML, CSS, JavaScript)**

#### **Important: Frontend is SHARED Between A and B**
Since `version-a/frontend/` and `version-b/frontend/` are typically symlinked or shared:

#### **Step 1: Upload to Version B Frontend**
```bash
# On your local machine
scp js/personalization.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/

# Or upload multiple files
scp privacy.html index.html \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/
```

#### **Step 2: Test Frontend Changes**
```bash
# Visit in browser
https://sxcrlfyt.gensparkspace.com  # (assuming frontend is served)

# Or test locally if you have a static server
cd /var/www/workforce-democracy/version-b/frontend
python3 -m http.server 8080
```

#### **Step 3: Deploy Frontend to Production**
Since frontend is shared, changes may already be live. But to be safe:

```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

**Note**: If frontend is truly shared (same directory), you might only need to clear browser cache or CDN cache.

---

### **Scenario 3: Uploading NEW Features (Backend + Frontend Together)**

#### **Example: Civic LLM v37.18.6 Complete Fix**

#### **Step 1: Upload ALL Backend Files to Version B**
```bash
# On your local machine
scp backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js

scp backend/deep-research-v37.18.3-ENHANCED.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/deep-research.js

# If routes changed
scp backend/routes/civic-routes.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/routes/
```

#### **Step 2: Upload Frontend Files**
```bash
scp js/civic.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/

scp index.html \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/
```

#### **Step 3: Restart Version B and Test**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend
sudo systemctl restart workforce-backend-b.service

# Test on port 3002
curl http://localhost:3002/api/civic/llm-chat/submit ...
```

#### **Step 4: Deploy to Production**
```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

---

### **Scenario 4: Uploading DOCUMENTATION (No Deployment Needed)**

Documentation files don't affect running services:

```bash
# Upload to project root or docs directory
scp README.md DEPLOYMENT.md PROJECT_SUMMARY.md \
    root@185.193.126.13:/var/www/workforce-democracy/docs/

# Or upload deployment scripts
scp DEPLOY-COMPLETE-FIX-MAC.sh \
    root@185.193.126.13:/var/www/workforce-democracy/deployment-scripts/

# Make executable
ssh root@185.193.126.13
chmod +x /var/www/workforce-democracy/deployment-scripts/DEPLOY-COMPLETE-FIX-MAC.sh
```

---

## 🔧 YOUR PERSONALIZED WORKFLOW

### **Daily Development Workflow**
```bash
┌─────────────────────────────────────────┐
│ 1. Edit files locally                   │
│    ├── backend/civic-llm-async.js      │
│    ├── backend/routes/civic-routes.js  │
│    └── frontend/js/civic.js            │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 2. Upload to Version B                  │
│    scp files → version-b/backend/       │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 3. Test on Port 3002                    │
│    curl localhost:3002/api/...          │
│    Check logs, verify results           │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 4. Deploy to Version A (Production)     │
│    cd deployment-scripts/               │
│    ./sync-b-to-a.sh                     │
└─────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────┐
│ 5. Verify Production (Port 3001)        │
│    curl localhost:3001/api/...          │
│    Check logs, monitor errors           │
└─────────────────────────────────────────┘
```

---

## 🚨 EMERGENCY PROCEDURES FOR YOUR ENVIRONMENT

### **If Version A Crashes**
```bash
# Check status
sudo systemctl status workforce-backend-a.service

# View errors
tail -100 /var/log/workforce-backend-a.log

# Restart
sudo systemctl restart workforce-backend-a.service

# If still broken, rollback to last backup
cd /var/www/workforce-democracy/deployment-scripts
ls -lt ../backups/  # Find latest backup
./rollback.sh 20251126-143022  # Use actual timestamp
```

### **If Deployment Fails**
`sync-b-to-a.sh` has **automatic rollback**:
- If verification fails after deployment
- Script automatically restores from backup
- No manual intervention needed

### **Manual Rollback**
```bash
cd /var/www/workforce-democracy/deployment-scripts

# List available backups
ls -lt ../backups/

# Rollback to specific backup
./rollback.sh 20251126-143022

# Verify rollback worked
sudo systemctl status workforce-backend-a.service
curl http://localhost:3001/api/civic/representatives/search?zipCode=12061
```

---

## 📊 YOUR MONITORING COMMANDS

### **Check Both Services**
```bash
# Status
sudo systemctl status workforce-backend-a.service
sudo systemctl status workforce-backend-b.service

# Logs (real-time)
tail -f /var/log/workforce-backend-a.log
tail -f /var/log/workforce-backend-b.log

# Logs (last 100 lines)
tail -100 /var/log/workforce-backend-a.log

# Logs (search for errors)
grep -i error /var/log/workforce-backend-a.log
grep -i "aiService" /var/log/workforce-backend-b.log
```

### **Check Database Cache**
```bash
# Connect to PostgreSQL
psql -U postgres -d workforce_democracy

# Check bill cache
SELECT COUNT(*) FROM bill_cache;
SELECT bill_id, last_accessed FROM bill_cache ORDER BY last_accessed DESC LIMIT 10;

# Check LLM job queue (if applicable)
SELECT * FROM llm_jobs ORDER BY created_at DESC LIMIT 10;

# Exit
\q
```

### **Test API Endpoints**
```bash
# Test Version A (Production)
curl http://localhost:3001/api/civic/representatives/search?zipCode=12061

# Test Version B (Development)
curl http://localhost:3002/api/civic/representatives/search?zipCode=12061

# Test LLM Chat (Version A)
curl -X POST http://localhost:3001/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'

# Get result (replace JOB_ID)
curl http://localhost:3001/api/civic/llm-chat/result/[JOB_ID]
```

---

## 🎯 YOUR FILE UPLOAD CHEAT SHEET

### **Quick SCP Commands**

#### **Upload Single Backend File**
```bash
scp backend/civic-llm-async.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

#### **Upload Single Frontend File**
```bash
scp js/personalization.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/
```

#### **Upload Entire Directory**
```bash
scp -r backend/routes/ \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

#### **Upload Multiple Files at Once**
```bash
scp backend/civic-llm-async.js \
    backend/deep-research.js \
    backend/ai-service.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

#### **Upload with Rename**
```bash
scp FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js
```

---

## 🔐 YOUR ENVIRONMENT VARIABLES

### **Version A (.env)**
```bash
# Location: /var/www/workforce-democracy/version-a/backend/.env
PORT=3001
NODE_ENV=production
DB_NAME=workforce_democracy
CONGRESS_API_KEY=your_key_here
OPENSTATES_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### **Version B (.env)**
```bash
# Location: /var/www/workforce-democracy/version-b/backend/.env
PORT=3002
NODE_ENV=development
DB_NAME=workforce_democracy  # Same database, shared cache!
CONGRESS_API_KEY=your_key_here
OPENSTATES_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

**Important**: `sync-b-to-a.sh` preserves Version A's `.env` file!

---

## 📋 YOUR DEPLOYMENT CHECKLIST

### **Before Uploading**
- [ ] Files tested locally
- [ ] Code reviewed for syntax errors
- [ ] Comments added for complex logic
- [ ] Version numbers updated (if applicable)

### **After Uploading to Version B**
- [ ] Files uploaded successfully (check file size/timestamp)
- [ ] Version B service restarted
- [ ] Version B service status checked (running)
- [ ] Version B logs reviewed (no errors)
- [ ] API endpoints tested on port 3002
- [ ] Frontend tested (if applicable)
- [ ] Database queries working (if applicable)

### **Before Deploying to Version A**
- [ ] Version B fully tested and working
- [ ] No errors in Version B logs
- [ ] All expected features working
- [ ] Performance acceptable
- [ ] User acceptance testing passed (if applicable)

### **After Deploying to Version A**
- [ ] Deployment script completed successfully
- [ ] Version A service status checked (running)
- [ ] Version A logs reviewed (no new errors)
- [ ] API endpoints tested on port 3001
- [ ] Frontend tested in production
- [ ] Backup created successfully
- [ ] Rollback procedure tested (optional)

---

## 🎓 YOUR SPECIFIC USE CASES

### **Use Case 1: Fix Civic LLM Bug (v37.18.5 → v37.18.6)**

**Issue**: `aiService.generateResponse()` doesn't exist, should be `aiService.analyzeWithAI()`

**Upload Steps**:
```bash
# 1. Upload fixed file to Version B
scp backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js

# 2. SSH and restart
ssh root@185.193.126.13
sudo systemctl restart workforce-backend-b.service

# 3. Test on port 3002
curl -X POST http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'

# 4. Deploy to production
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

---

### **Use Case 2: Add Personalization System**

**Files to Upload**:
- `js/personalization.js` (NEW)
- `js/main.js` (UPDATED - welcome tour)
- `privacy.html` (UPDATED - new section)
- `index.html` (UPDATED - cache version)

**Upload Steps**:
```bash
# Upload frontend files
scp js/personalization.js js/main.js privacy.html index.html \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/

# No backend restart needed (static files)
# Test in browser
# Deploy via sync-b-to-a.sh if needed
```

---

### **Use Case 3: Add Deep Research Integration**

**Files to Upload**:
- `backend/deep-research-v37.18.3-ENHANCED.js` (NEW)
- `backend/civic-llm-async.js` (UPDATED - calls deep-research)
- `backend/ai-service.js` (verify exports)

**Upload Steps**:
```bash
# Upload all backend files
scp backend/deep-research-v37.18.3-ENHANCED.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/deep-research.js

scp backend/civic-llm-async.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

# SSH and restart
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend
sudo systemctl restart workforce-backend-b.service

# Verify deep-research is being called
tail -f /var/log/workforce-backend-b.log | grep -i "deep-research"

# Test and deploy
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

---

## 🎯 YOUR SUCCESS METRICS

### **After Civic LLM Fix (v37.18.6)**
- ✅ Sources increase from 1 to 7+
- ✅ 6+ Congress bills appear in results
- ✅ 3-6 citations in AI responses
- ✅ "I searched but didn't find..." message disappears
- ✅ More specific AI answers

### **After Personalization System**
- ✅ Welcome tour shows 5 steps (was 4)
- ✅ Privacy page has personalization section
- ✅ Users can enable/disable personalization
- ✅ Data encrypted in localStorage
- ✅ Delete personalization data works

---

## 🏆 YOUR DEPLOYMENT BEST PRACTICES

1. **Always Work in Version B First**
2. **Test Thoroughly Before Production**
3. **Use Deployment Scripts (Auto-Backup + Auto-Rollback)**
4. **Monitor Logs After Deployment**
5. **Keep Backups (Automated via sync-b-to-a.sh)**
6. **Document Changes (README, CHANGELOG)**
7. **Version Control (Git tags for releases)**
8. **Never Edit Version A Directly**
9. **Check Both Services Status Daily**
10. **Test API Endpoints After Every Deploy**

---

## 🆘 YOUR SUPPORT RESOURCES

### **Documentation Files**
- `PROJECT_SUMMARY.md` - Complete project overview
- `DEPLOYMENT.md` - General deployment guide
- `PERSONALIZATION_SYSTEM.md` - Personalization architecture
- `BACKEND_ARCHITECTURE.md` - Server-side details (if exists)
- `README.md` - Quick start guide

### **Quick Help Commands**
```bash
# View deployment script help
cd /var/www/workforce-democracy/deployment-scripts
cat sync-b-to-a.sh  # Read script comments

# View service logs
journalctl -u workforce-backend-a.service -f
journalctl -u workforce-backend-b.service -f

# Check Node.js version
node --version  # Should be v20.19.5

# Check database connection
psql -U postgres -d workforce_democracy -c "SELECT version();"
```

---

## ✅ YOUR DEPLOYMENT IS NOW COMPLETE!

You now have:
- ✅ Personalized upload structure for YOUR VPS
- ✅ Specific commands for YOUR environment
- ✅ Clear workflow for YOUR A/B deployment system
- ✅ Emergency procedures for YOUR setup
- ✅ Monitoring commands for YOUR services
- ✅ File upload cheat sheet for YOUR project

**Next Steps**:
1. Bookmark this guide
2. Test upload workflow with a small file
3. Practice deployment on Version B
4. Deploy to Version A when ready
5. Monitor and enjoy! 🎉

---

**Built specifically for YOUR Workforce Democracy Project on VPS 185.193.126.13** ✨

🏛️ **Workforce Democracy Project EST 2025**  
*Version A/B Deployment System - v37.18.6+*
