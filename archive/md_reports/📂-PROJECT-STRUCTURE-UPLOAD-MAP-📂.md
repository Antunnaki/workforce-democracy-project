# 📂 PROJECT STRUCTURE → UPLOAD DESTINATION MAP 📂

**Visual Guide**: Where Each Local File Goes on Your VPS  
**VPS**: 185.193.126.13  
**Date**: November 26, 2025

---

## 🎯 COMPLETE FILE MAPPING

### **Color Legend**
- 🟢 **GREEN** = Frontend files (HTML, CSS, JS for browser)
- 🔵 **BLUE** = Backend files (Node.js server-side)
- 🟡 **YELLOW** = Documentation (no deployment needed)
- 🟣 **PURPLE** = Deployment scripts
- ⚪ **WHITE** = Configuration files

---

## 📁 YOUR LOCAL PROJECT → VPS MAPPING

### **LOCAL PROJECT STRUCTURE**
```
workforce-democracy-local/
├── frontend/                          🟢 UPLOAD TO → /var/www/workforce-democracy/version-b/frontend/
│   ├── index.html                     🟢 → version-b/frontend/index.html
│   ├── privacy.html                   🟢 → version-b/frontend/privacy.html
│   ├── GETTING_STARTED.md             🟢 → version-b/frontend/GETTING_STARTED.md
│   ├── favicon.svg                    🟢 → version-b/frontend/favicon.svg
│   │
│   ├── css/                           🟢 UPLOAD TO → version-b/frontend/css/
│   │   ├── main.css                   🟢 → version-b/frontend/css/main.css
│   │   └── responsive.css             🟢 → version-b/frontend/css/responsive.css
│   │
│   └── js/                            🟢 UPLOAD TO → version-b/frontend/js/
│       ├── main.js                    🟢 → version-b/frontend/js/main.js
│       ├── security.js                🟢 → version-b/frontend/js/security.js
│       ├── civic.js                   🟢 → version-b/frontend/js/civic.js
│       ├── civic-representative-finder.js  🟢 → version-b/frontend/js/
│       ├── bills-section.js           🟢 → version-b/frontend/js/bills-section.js
│       ├── jobs.js                    🟢 → version-b/frontend/js/jobs.js
│       ├── learning.js                🟢 → version-b/frontend/js/learning.js
│       ├── language.js                🟢 → version-b/frontend/js/language.js
│       ├── local.js                   🟢 → version-b/frontend/js/local.js
│       ├── philosophies.js            🟢 → version-b/frontend/js/philosophies.js
│       ├── charts.js                  🟢 → version-b/frontend/js/charts.js
│       ├── personalization.js         🟢 → version-b/frontend/js/personalization.js
│       └── sw.js                      🟢 → version-b/frontend/sw.js (service worker)
│
├── backend/                           🔵 UPLOAD TO → /var/www/workforce-democracy/version-b/backend/
│   ├── server.js                      🔵 → version-b/backend/server.js
│   ├── civic-llm-async.js             🔵 → version-b/backend/civic-llm-async.js
│   ├── FIX-CIVIC-LLM-COMPLETE-v37.18.6.js  🔵 → version-b/backend/civic-llm-async.js (rename!)
│   ├── deep-research-v37.18.3-ENHANCED.js  🔵 → version-b/backend/deep-research.js (rename!)
│   ├── ai-service.js                  🔵 → version-b/backend/ai-service.js
│   ├── rss-service.js                 🔵 → version-b/backend/rss-service.js
│   ├── job-queue-service.js           🔵 → version-b/backend/job-queue-service.js
│   ├── us-representatives.js          🔵 → version-b/backend/us-representatives.js
│   │
│   ├── routes/                        🔵 UPLOAD TO → version-b/backend/routes/
│   │   ├── civic-routes.js            🔵 → version-b/backend/routes/civic-routes.js
│   │   └── bills-routes.js            🔵 → version-b/backend/routes/bills-routes.js
│   │
│   ├── utils/                         🔵 UPLOAD TO → version-b/backend/utils/
│   │   ├── contact-info-enhancer.js   🔵 → version-b/backend/utils/contact-info-enhancer.js
│   │   └── bill-cache.js              🔵 → version-b/backend/utils/bill-cache.js
│   │
│   └── .env                           ⚪ DO NOT UPLOAD (configured on VPS)
│
├── deployment-scripts/                🟣 UPLOAD TO → /var/www/workforce-democracy/deployment-scripts/
│   ├── ⚡-DEPLOY-COMPLETE-FIX-MAC-⚡.sh      🟣 → deployment-scripts/ (make executable)
│   ├── DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh  🟣 → deployment-scripts/
│   ├── CHECK-JOB-RESULT.sh            🟣 → deployment-scripts/
│   ├── ⚡-QUICK-CHECK-⚡.sh            🟣 → deployment-scripts/
│   └── CHECK-RESULT.sh                🟣 → deployment-scripts/
│
├── docs/                              🟡 UPLOAD TO → /var/www/workforce-democracy/docs/
│   ├── README.md                      🟡 → docs/README.md
│   ├── PROJECT_SUMMARY.md             🟡 → docs/PROJECT_SUMMARY.md
│   ├── DEPLOYMENT.md                  🟡 → docs/DEPLOYMENT.md
│   ├── PERSONALIZATION_SYSTEM.md      🟡 → docs/PERSONALIZATION_SYSTEM.md
│   ├── 🎯-YOUR-PERSONALIZED-DEPLOYMENT-GUIDE-🎯.md  🟡 → docs/
│   ├── 📂-PROJECT-STRUCTURE-UPLOAD-MAP-📂.md        🟡 → docs/
│   ├── 👉-START-HERE-COMPLETE-FIX-👈.md             🟡 → docs/
│   ├── 📊-FIX-SUMMARY-v37.18.6-📊.md                🟡 → docs/
│   ├── 🔍-BUG-DIAGRAM-🔍.md                         🟡 → docs/
│   ├── 📑-COMPLETE-FIX-INDEX-v37.18.6-📑.md         🟡 → docs/
│   ├── 🎉-INVESTIGATION-COMPLETE-🎉.md              🟡 → docs/
│   └── FILE_STRUCTURE.md              🟡 → docs/FILE_STRUCTURE.md
│
└── [other files not uploaded to VPS]
```

---

## 🎯 UPLOAD COMMANDS BY FILE TYPE

### **🟢 FRONTEND FILES (Static HTML/CSS/JS)**

#### **Single File Upload**
```bash
# HTML files
scp frontend/index.html \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/

scp frontend/privacy.html \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/

# CSS files
scp frontend/css/main.css \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/css/

# JavaScript files
scp frontend/js/personalization.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/

scp frontend/js/main.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/
```

#### **Batch Upload (All JS Files)**
```bash
scp frontend/js/*.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/
```

#### **Upload Entire Frontend Directory**
```bash
scp -r frontend/* \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/
```

---

### **🔵 BACKEND FILES (Node.js Server-Side)**

#### **Single File Upload**
```bash
# Main backend files
scp backend/civic-llm-async.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

scp backend/ai-service.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

scp backend/server.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

#### **Upload with Rename (Important for Fixes)**
```bash
# Upload fix file and rename to actual filename
scp backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js

scp backend/deep-research-v37.18.3-ENHANCED.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/deep-research.js
```

#### **Upload Routes Directory**
```bash
scp backend/routes/civic-routes.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/routes/

scp backend/routes/bills-routes.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/routes/
```

#### **Upload Utils Directory**
```bash
scp backend/utils/contact-info-enhancer.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/utils/

scp backend/utils/bill-cache.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/utils/
```

#### **Upload Entire Backend Directory**
```bash
scp -r backend/* \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

---

### **🟣 DEPLOYMENT SCRIPTS**

#### **Upload Deployment Scripts**
```bash
# Upload script files
scp deployment-scripts/⚡-DEPLOY-COMPLETE-FIX-MAC-⚡.sh \
    root@185.193.126.13:/var/www/workforce-democracy/deployment-scripts/

scp deployment-scripts/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh \
    root@185.193.126.13:/var/www/workforce-democracy/deployment-scripts/

# Make them executable (SSH required)
ssh root@185.193.126.13
chmod +x /var/www/workforce-democracy/deployment-scripts/*.sh
```

---

### **🟡 DOCUMENTATION FILES**

#### **Upload Documentation**
```bash
# Create docs directory if needed
ssh root@185.193.126.13 "mkdir -p /var/www/workforce-democracy/docs"

# Upload doc files
scp docs/*.md \
    root@185.193.126.13:/var/www/workforce-democracy/docs/

# Or upload specific files
scp README.md PROJECT_SUMMARY.md DEPLOYMENT.md \
    root@185.193.126.13:/var/www/workforce-democracy/docs/
```

---

## 🔄 AFTER UPLOAD: REQUIRED ACTIONS

### **🟢 After Frontend Upload**
```bash
# No restart needed (static files)
# Just clear browser cache or CDN cache

# If cache busting used, may need to update version numbers
# Check in browser: Ctrl+Shift+R (hard reload)
```

### **🔵 After Backend Upload**
```bash
# Always restart Version B service
ssh root@185.193.126.13
sudo systemctl restart workforce-backend-b.service

# Check status
sudo systemctl status workforce-backend-b.service

# Monitor logs for errors
tail -f /var/log/workforce-backend-b.log

# Test API endpoints on port 3002
curl http://localhost:3002/api/civic/representatives/search?zipCode=12061
```

### **🟣 After Deployment Script Upload**
```bash
# Make executable
ssh root@185.193.126.13
chmod +x /var/www/workforce-democracy/deployment-scripts/*.sh

# Test script (dry run if available)
cd /var/www/workforce-democracy/deployment-scripts
./your-script.sh --dry-run  # If supported
```

---

## ⚠️ FILES YOU SHOULD NEVER UPLOAD

### **❌ DO NOT UPLOAD THESE**
```bash
# Environment variables (configured on VPS)
backend/.env                    ❌ DO NOT UPLOAD
version-a/backend/.env          ❌ DO NOT UPLOAD
version-b/backend/.env          ❌ DO NOT UPLOAD

# Node modules (installed on VPS)
node_modules/                   ❌ DO NOT UPLOAD
backend/node_modules/           ❌ DO NOT UPLOAD

# Git files (not needed on production server)
.git/                           ❌ DO NOT UPLOAD
.gitignore                      ❌ DO NOT UPLOAD

# Local development files
.DS_Store                       ❌ DO NOT UPLOAD
Thumbs.db                       ❌ DO NOT UPLOAD
*.swp                           ❌ DO NOT UPLOAD
*.log                           ❌ DO NOT UPLOAD

# Build artifacts (if any)
dist/                           ❌ DO NOT UPLOAD
build/                          ❌ DO NOT UPLOAD

# Database files (PostgreSQL on VPS)
*.db                            ❌ DO NOT UPLOAD
*.sqlite                        ❌ DO NOT UPLOAD
```

---

## 🎯 QUICK REFERENCE: FILE TYPE → DESTINATION

| **File Type** | **Local Path** | **VPS Destination** | **Restart Needed?** |
|---------------|----------------|---------------------|---------------------|
| HTML | `frontend/index.html` | `version-b/frontend/index.html` | No |
| CSS | `frontend/css/main.css` | `version-b/frontend/css/main.css` | No |
| Frontend JS | `frontend/js/main.js` | `version-b/frontend/js/main.js` | No |
| Backend JS | `backend/civic-llm-async.js` | `version-b/backend/civic-llm-async.js` | Yes (Version B) |
| Routes | `backend/routes/civic-routes.js` | `version-b/backend/routes/civic-routes.js` | Yes (Version B) |
| Utils | `backend/utils/bill-cache.js` | `version-b/backend/utils/bill-cache.js` | Yes (Version B) |
| Scripts | `deployment-scripts/*.sh` | `deployment-scripts/*.sh` | No (chmod +x) |
| Docs | `docs/*.md` | `docs/*.md` | No |

---

## 🚀 COMPLETE UPLOAD WORKFLOW EXAMPLE

### **Scenario: Upload Civic LLM Fix v37.18.6**

#### **Step 1: Identify Files to Upload**
```
Local Files:
- backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js  (backend fix)
- backend/deep-research-v37.18.3-ENHANCED.js  (new feature)
- frontend/js/civic.js                         (frontend update)
- docs/👉-START-HERE-COMPLETE-FIX-👈.md        (documentation)
```

#### **Step 2: Upload Backend Files**
```bash
# Upload fix file (rename to actual filename)
scp backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js

# Upload new deep-research module
scp backend/deep-research-v37.18.3-ENHANCED.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/deep-research.js
```

#### **Step 3: Upload Frontend Files**
```bash
scp frontend/js/civic.js \
    root@185.193.126.13:/var/www/workforce-democracy/version-b/frontend/js/
```

#### **Step 4: Upload Documentation**
```bash
scp docs/👉-START-HERE-COMPLETE-FIX-👈.md \
    root@185.193.126.13:/var/www/workforce-democracy/docs/
```

#### **Step 5: SSH and Restart Version B**
```bash
ssh root@185.193.126.13
sudo systemctl restart workforce-backend-b.service
sudo systemctl status workforce-backend-b.service
```

#### **Step 6: Test on Port 3002**
```bash
# Test LLM Chat
curl -X POST http://localhost:3002/api/civic/llm-chat/submit \
  -H "Content-Type: application/json" \
  -d '{"message":"How has Chuck Schumer voted on healthcare?","zipCode":"12061"}'

# Check result (get jobId from above)
curl http://localhost:3002/api/civic/llm-chat/result/[JOB_ID]
```

#### **Step 7: Check Logs**
```bash
tail -f /var/log/workforce-backend-b.log
# Look for:
# - "aiService.analyzeWithAI" (confirms fix)
# - "deep-research" calls
# - No errors
```

#### **Step 8: Deploy to Production**
```bash
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

#### **Step 9: Verify Production**
```bash
sudo systemctl status workforce-backend-a.service
curl http://localhost:3001/api/civic/llm-chat/submit ...
tail -f /var/log/workforce-backend-a.log
```

---

## 📊 FILE MAPPING CHEAT SHEET

### **Frontend Files**
```
LOCAL                                    VPS
────────────────────────────────────────────────────────────────────
frontend/index.html                  →  version-b/frontend/index.html
frontend/privacy.html                →  version-b/frontend/privacy.html
frontend/css/main.css                →  version-b/frontend/css/main.css
frontend/js/main.js                  →  version-b/frontend/js/main.js
frontend/js/personalization.js       →  version-b/frontend/js/personalization.js
frontend/js/civic.js                 →  version-b/frontend/js/civic.js
frontend/js/civic-representative-finder.js → version-b/frontend/js/civic-representative-finder.js
frontend/js/bills-section.js         →  version-b/frontend/js/bills-section.js
```

### **Backend Files**
```
LOCAL                                    VPS
────────────────────────────────────────────────────────────────────
backend/server.js                    →  version-b/backend/server.js
backend/civic-llm-async.js           →  version-b/backend/civic-llm-async.js
backend/ai-service.js                →  version-b/backend/ai-service.js
backend/deep-research.js             →  version-b/backend/deep-research.js
backend/routes/civic-routes.js       →  version-b/backend/routes/civic-routes.js
backend/routes/bills-routes.js       →  version-b/backend/routes/bills-routes.js
backend/utils/contact-info-enhancer.js → version-b/backend/utils/contact-info-enhancer.js
backend/utils/bill-cache.js          →  version-b/backend/utils/bill-cache.js
```

### **Deployment Scripts**
```
LOCAL                                    VPS
────────────────────────────────────────────────────────────────────
deployment-scripts/sync-b-to-a.sh    →  deployment-scripts/sync-b-to-a.sh
deployment-scripts/rollback.sh       →  deployment-scripts/rollback.sh
deployment-scripts/backup.sh         →  deployment-scripts/backup.sh
deployment-scripts/⚡-DEPLOY-COMPLETE-FIX-MAC-⚡.sh → deployment-scripts/
deployment-scripts/CHECK-JOB-RESULT.sh → deployment-scripts/CHECK-JOB-RESULT.sh
```

---

## ✅ FINAL CHECKLIST

### **Before Upload**
- [ ] Identify which files changed
- [ ] Determine file type (frontend/backend/docs)
- [ ] Prepare upload commands
- [ ] Note if rename needed (e.g., FIX-CIVIC-LLM → civic-llm-async.js)

### **During Upload**
- [ ] Upload to Version B (not Version A!)
- [ ] Verify file upload (check size/timestamp)
- [ ] Rename files if needed

### **After Upload**
- [ ] Restart services if backend changed
- [ ] Test on port 3002 (Version B)
- [ ] Check logs for errors
- [ ] Deploy to Version A when ready
- [ ] Verify production (port 3001)

---

**This mapping guide ensures every file goes to the correct VPS location!** ✨

🏛️ **Workforce Democracy Project - File Upload Reference**  
*Version B First, Always!*
