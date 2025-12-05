# \ud83c\udf89 COMPLETE CITATION FIX PACKAGE - PERSONALIZED FOR YOUR PROJECT

## \u2705 INVESTIGATION COMPLETE & FILES UPDATED

**Date:** November 26, 2025  
**Your Project:** Workforce Democracy Project  
**Your VPS:** 185.193.126.13  
**Your System:** A/B Deployment (Version A: Production, Version B: Test)

---

## \ud83d\udcda REVIEWED YOUR PROJECT DOCUMENTATION

I've reviewed these three key project documents:

### 1\ufe0f\u20e3 **README.md** (Updated!)
- \u2705 Now reflects v37.18.6 fix status
- \u2705 Personalized for your A/B deployment system
- \u2705 Shows correct VPS IP and ports
- \u2705 Includes deployment commands for YOUR infrastructure

### 2\ufe0f\u20e3 **FRONTEND-BACKEND-STRUCTURE.md**
- \ud83d\udcd6 Complete system architecture
- \ud83d\udcd6 A/B deployment workflow
- \ud83d\udcd6 Version A (3001) vs Version B (3002)
- \ud83d\udcd6 Shared PostgreSQL database
- \ud83d\udcd6 Your project structure at `/var/www/workforce-democracy/`

### 3\ufe0f\u20e3 **AB-DEPLOYMENT-SYSTEM.md**
- \ud83d\udcd6 Version A/B rules and workflow
- \ud83d\udcd6 Deployment scripts: `sync-b-to-a.sh`, `rollback.sh`
- \ud83d\udcd6 Golden rule: NEVER edit Version A directly!
- \ud83d\udcd6 Testing workflow: B \u2192 test \u2192 A

---

## \ud83d\udd27 PERSONALIZED DEPLOYMENT SCRIPTS

I've updated the deployment scripts to match YOUR infrastructure:

### **\u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh**
```bash
VPS_IP="185.193.126.13"                    # Your VPS
VPS_USER="root"                            # Your user
VPS_BACKEND_DIR="/var/www/workforce-democracy/version-b/backend"  # Your path
LOCAL_BACKEND_DIR="./backend"              # Adjust if needed
```

### **backend/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh**
```bash
# Restarts: workforce-backend-b.service   # Your service name
# Logs to: /var/log/workforce-backend-b.log
# Tests on: http://localhost:3002         # Version B port
```

---

## \ud83d\udccd YOUR DEPLOYMENT WORKFLOW

Based on your A/B system:

### **Stage 1: Deploy to Version B (Test Environment)**
```bash
cd /path/to/your/backend/folder
chmod +x \u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh
./\u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh
```

**This will:**
1. Upload files to `/var/www/workforce-democracy/version-b/backend/`
2. Apply fixes to `civic-llm-async.js`
3. Restart `workforce-backend-b.service`
4. Submit test query to port 3002
5. Return job ID

---

### **Stage 2: Verify on Version B (Test)**

**Wait 60 seconds**, then:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend
chmod +x CHECK-RESULT.sh
./CHECK-RESULT.sh
```

**Check for:**
- \u2705 7+ sources (1 RSS + 6 Congress.gov)
- \u2705 Citations [1][2][3] in response
- \u2705 Congress.gov bills with relevanceScore: 500

---

### **Stage 3: Test on Frontend**

Frontend URL: **https://sxcrlfyt.gensparkspace.com**  
*(This uses Version B backend on port 3002)*

1. Enter ZIP: **12061**
2. Ask: **"How has Chuck Schumer voted on healthcare?"**
3. Wait 30-60 seconds
4. Look for citations: \u00b9 \u00b2 \u00b3 \u2074 \u2075 \u2076

---

### **Stage 4: Deploy to Version A (Production)**

**ONLY after Stage 2 & 3 tests pass!**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

**What `sync-b-to-a.sh` does:**
- \u2705 Creates automatic backup of Version A
- \u2705 Copies Version B \u2192 Version A
- \u2705 Preserves Version A's `.env` file
- \u2705 Restarts `workforce-backend-a.service`
- \u2705 Verifies deployment
- \u2705 **Auto-rollback if anything fails**

---

## \ud83d\udcca YOUR ENVIRONMENT DETAILS

### **Version A (LIVE Production)**
- **Location:** `/var/www/workforce-democracy/version-a/backend/`
- **Port:** 3001
- **Service:** `workforce-backend-a.service`
- **Environment:** `NODE_ENV=production`
- **Status:** v37.17.0-CONTACT-ENHANCEMENT (current)
- **\u26a0\ufe0f NEVER EDIT DIRECTLY!**

### **Version B (TEST Environment)**
- **Location:** `/var/www/workforce-democracy/version-b/backend/`
- **Port:** 3002
- **Service:** `workforce-backend-b.service`
- **Environment:** `NODE_ENV=development`
- **Status:** Ready for v37.18.6 deployment
- **\u2705 DEPLOY HERE FIRST!**

### **Shared Resources:**
- **PostgreSQL:** `workforce_democracy` (shared cache)
- **Frontend:** `/var/www/workforce-democracy/` (root)
- **Deployment Scripts:** `/var/www/workforce-democracy/deployment-scripts/`
- **Backups:** `/var/www/workforce-democracy/backups/`

---

## \ud83d\udcdd YOUR SPECIFIC FILE PATHS

### **Files to Deploy:**
```
Local Mac:
  ./backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js
  ./backend/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh

VPS Destination:
  /var/www/workforce-democracy/version-b/backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js
  /var/www/workforce-democracy/version-b/backend/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh
```

### **File to Fix:**
```
Target File:
  /var/www/workforce-democracy/version-b/backend/civic-llm-async.js

Backup Created:
  /var/www/workforce-democracy/version-b/backend/civic-llm-async.js.backup-v37.18.6-{timestamp}
```

---

## \ud83d\udd11 YOUR API KEYS (Reference)

From your environment variables:

```bash
CONGRESS_API_KEY=[REDACTED_CONGRESS_API_KEY]
OPENSTATES_API_KEY=[REDACTED_OPENSTATES_API_KEY]
GROQ_API_KEY=[REDACTED_GROQ_API_KEY]
```

**Note:** These are already configured in your `.env` files. No changes needed!

---

## \ud83c\udfaf WHAT CHANGES IN YOUR SYSTEM

### **Version B Backend Changes:**

**File:** `civic-llm-async.js`

**Line 125 - Function Call Fix:**
```javascript
// Before (v37.18.5):
const aiResponse = await aiService.generateResponse(message, sources, context, conversationHistory);

// After (v37.18.6):
const aiResponse = await aiService.analyzeWithAI(message, sources, context, conversationHistory);
```

**Lines 117-140 - Deep Research Integration:**
```javascript
// NEW in v37.18.6:
const rssSources = await rssService.searchFeeds(message, context);

let deepResearchSources = [];
if (context.chatType === 'representatives' && context.hasRepContext) {
    const deepResearch = require('./deep-research');
    deepResearchSources = await deepResearch.searchRepresentativeVotingRecord(message, context);
}

const sources = [...rssSources, ...deepResearchSources];
```

---

## \ud83d\udea8 YOUR SAFETY FEATURES

Your A/B system provides multiple safety layers:

### **Level 1: Version B Testing**
- Test environment (port 3002)
- Safe to break without affecting users
- Full testing before production

### **Level 2: Automatic Backup**
- `sync-b-to-a.sh` creates timestamped backups
- Location: `/var/www/workforce-democracy/backups/`
- Easy rollback: `./rollback.sh`

### **Level 3: Auto-Rollback**
- If `sync-b-to-a.sh` deployment fails
- Automatically restores from backup
- No manual intervention needed

### **Level 4: Service Health Checks**
- API endpoint testing after deployment
- Service status verification
- Automatic failure detection

---

## \ud83d\udcca MONITORING YOUR DEPLOYMENT

### **Check Version B Status:**
```bash
ssh root@185.193.126.13
sudo systemctl status workforce-backend-b.service
tail -f /var/log/workforce-backend-b.log
```

### **Check Version A Status:**
```bash
ssh root@185.193.126.13
sudo systemctl status workforce-backend-a.service
tail -f /var/log/workforce-backend-a.log
```

### **Check PostgreSQL Cache (Shared):**
```bash
ssh root@185.193.126.13
psql -U postgres -d workforce_democracy -c "SELECT bill_id, cache_hits FROM bills_cache ORDER BY cache_hits DESC LIMIT 5;"
```

---

## \ud83d\udcda YOUR DOCUMENTATION FILES

All updated to match your infrastructure:

### **Updated:**
- \u2705 **README.md** - Now shows your VPS, ports, services
- \u2705 **\u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh** - Your VPS IP and paths
- \u2705 **backend/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh** - Your service names

### **Created:**
- \u2705 **\ud83d\udc49-START-HERE-COMPLETE-FIX-\ud83d\udc48.md** - Quick start for YOUR system
- \u2705 **\ud83d\udd25-COMPLETE-FIX-CIVIC-LLM-v37.18.6-\ud83d\udd25.md** - Full documentation
- \u2705 **\ud83d\udcd0-FIX-SUMMARY-v37.18.6-\ud83d\udcd0.md** - Executive summary
- \u2705 **\ud83d\udd0d-BUG-DIAGRAM-\ud83d\udd0d.md** - Visual diagrams
- \u2705 **\ud83d\udcd1-COMPLETE-FIX-INDEX-v37.18.6-\ud83d\udcd1.md** - File index
- \u2705 **\ud83c\udf89-INVESTIGATION-COMPLETE-\ud83c\udf89.md** - Investigation report
- \u2705 **\ud83d\udd04-VERSION-COMPARISON-\ud83d\udd04.md** - Version comparison
- \u2705 **backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js** - Fix script
- \u2705 **backend/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh** - VPS deploy script
- \u2705 **backend/CHECK-RESULT.sh** - Result checker

---

## \u26a1 YOUR QUICK START CHECKLIST

- [ ] 1. Read `\ud83d\udc49-START-HERE-COMPLETE-FIX-\ud83d\udc48.md`
- [ ] 2. Navigate to your backend folder on Mac
- [ ] 3. Run: `chmod +x \u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh`
- [ ] 4. Run: `./\u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh`
- [ ] 5. Wait 60 seconds
- [ ] 6. SSH to VPS and run `./CHECK-RESULT.sh`
- [ ] 7. Test on https://sxcrlfyt.gensparkspace.com
- [ ] 8. Deploy to production: `./sync-b-to-a.sh`

---

## \ud83c\udf89 READY TO GO!

Everything is personalized for your Workforce Democracy Project's A/B deployment system!

**Next Action:** Open `\ud83d\udc49-START-HERE-COMPLETE-FIX-\ud83d\udc48.md` and follow the 3-step deployment.

**Your VPS:** 185.193.126.13  
**Your Test Environment:** Version B (port 3002)  
**Your Production:** Version A (port 3001)  
**Your Deployment Script:** `\u26a1-DEPLOY-COMPLETE-FIX-MAC-\u26a1.sh`

**Questions?** All documentation has been tailored to your specific infrastructure!

---

**\ud83d\ude80 Ready when you are! The fix is complete and deployment is personalized for your system!** \u2705
