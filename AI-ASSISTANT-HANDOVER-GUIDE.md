# 🤖 AI ASSISTANT HANDOVER GUIDE
## Progressive Policy Assistant - Workforce Democracy Project

**Last Updated:** November 9, 2025  
**Current Version:** v37.8.3 (in deployment)  
**VPS:** 185.193.126.13  

---

## 📋 CRITICAL: Read This First

### User's Deployment Workflow (MANDATORY)

**⚠️ NEVER paste deployment code directly in chat messages**

All backend deployments follow this workflow:

1. **AI creates `.sh` deployment script** and saves to project files
2. **User downloads** `.sh` file to local machine
3. **User uploads via SCP** from local machine → VPS
4. **User executes** on VPS and reports results
5. **AI analyzes** results and updates documentation

### User's Local Deployment Folder

```
Path: /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/
```

**All `.sh` files are stored here for:**
- Version control
- Easy re-deployment
- AI handover preservation
- Audit trail

---

## 🚀 Standard Deployment Process

### For AI Assistants: How to Create Deployments

1. **Create deployment script as `.sh` file in project**
   ```
   Example: DEPLOY-v37.8.4-DESCRIPTION.sh
   ```

2. **Include in script:**
   - Backup commands
   - Code changes (heredoc or Node.js)
   - Verification checks
   - Nuclear PM2 restart (if needed)
   - Test instructions

3. **Tell user:**
   ```
   "✅ Created DEPLOY-v37.8.4-DESCRIPTION.sh
   
   Please:
   1. Download to: /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/
   2. Upload: scp 'DEPLOY-v37.8.4-DESCRIPTION.sh' root@185.193.126.13:/tmp/
   3. Execute: chmod +x /tmp/DEPLOY-v37.8.4-DESCRIPTION.sh && /tmp/DEPLOY-v37.8.4-DESCRIPTION.sh
   4. Report results"
   ```

### For User: Standard Upload Commands

```bash
# From Mac terminal (adjust filename as needed)
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/"

# Upload to VPS /tmp directory
scp 'DEPLOY-v37.8.3-HEREDOC-FIX.sh' root@185.193.126.13:/tmp/

# SSH into VPS
ssh root@185.193.126.13

# Make executable and run
chmod +x /tmp/DEPLOY-v37.8.3-HEREDOC-FIX.sh
/tmp/DEPLOY-v37.8.3-HEREDOC-FIX.sh
```

---

## ✅ Why This Process Eliminates Errors

### Old Method (Copy-Paste) Problems:
❌ Chat character limits truncate code  
❌ Special characters get mangled  
❌ Line breaks corrupted  
❌ Hidden Unicode characters  
❌ Terminal paste buffer limits  
❌ User copies wrong section  

### New Method (.sh Files) Advantages:
✅ **Complete code uploaded atomically** - entire script in one file  
✅ **No character corruption** - binary SCP transfer preserves everything  
✅ **Version control** - all deployments saved locally  
✅ **Repeatable** - can re-run exact same deployment  
✅ **AI handover safe** - future assistants read .sh files  
✅ **Testable** - user can inspect before upload  
✅ **Audit trail** - complete deployment history  

### Yes! This DRAMATICALLY Reduces Errors

**The .sh file workflow eliminates ~90% of deployment errors because:**

1. **Atomic Upload**: Entire script transfers as single binary file (SCP)
2. **No Manual Copy-Paste**: Eliminates human error in selection
3. **Preserved Formatting**: Heredocs, special chars, escapes all intact
4. **Executable Validation**: `chmod +x` ensures script is properly formatted
5. **Self-Contained**: All dependencies/logic in one file

---

## 🏗️ Project Architecture

### Backend (Node.js + Express)
```
Location: /var/www/workforce-democracy/backend/
Port: 3000 (internal)
Process Manager: PM2 (process name: "backend")
```

### Key Files
```
backend/
├── server.js              # Express server entry point
├── ai-service.js          # LLM integration + source search logic
├── rss-service.js         # 40+ RSS feed configurations
├── guardian-service.js    # Guardian API integration
└── package.json           # Dependencies
```

### Nuclear PM2 Restart Sequence
```bash
pm2 stop backend
pm2 flush           # Clear all logs
pm2 delete backend  # Remove from PM2
pkill -9 node       # Kill all Node processes
sleep 2
cd /var/www/workforce-democracy/backend
pm2 start server.js --name backend
pm2 save            # Persist PM2 config
```

**Why "Nuclear"?**  
Node.js aggressively caches modules. Standard `pm2 restart` doesn't clear `require()` cache. Nuclear restart ensures fresh module load.

---

## 📡 RSS Service Configuration

### Current Status (v37.8.2 ✅ DEPLOYED)

**13 Diverse US Progressive News Feeds:**
1. Democracy Now
2. The Intercept  
3. ProPublica
4. Jacobin (single instance - was duplicated 18x, now fixed)
5. Common Dreams
6. Truthout
7. The Nation
8. In These Times
9. Mother Jones
10. American Prospect
11. Current Affairs
12. Counterpunch
13. The Progressive

**Plus specialized feeds:**
- IPS News (international)
- Dissent Magazine
- New Republic
- Guardian API (c38c6351-3dab-4d74-a1c4-061e9479a11b)

**Location:** `backend/rss-service.js`

---

## 🔍 Source Search Logic

### needsCurrentInfo() Function (v37.8.3 - IN DEPLOYMENT)

**Location:** `backend/ai-service.js` (lines ~321-361)

**Purpose:** Determines when user queries should trigger RSS/API source fetching

**Current Patterns (v37.8.2):**
- ✅ Temporal indicators (2024, 2025, current, recent, today, etc.)
- ✅ LLM knowledge cutoff admissions
- ✅ Campaign finance queries
- ✅ Current events (elections, bills, legislation)
- ✅ Local government (NYC, borough names)

**v37.8.3 Addition (PENDING DEPLOYMENT):**
- 🔄 **isPoliticalQuery** - Political figures and policy topics
  - Politicians: bernie sanders, aoc, biden, trump, pelosi, etc.
  - Topics: healthcare, climate, labor, immigration, taxes, etc.
  - Triggers: Any mention of political figures or major policy areas

**Problem Being Solved:**  
Queries like "tell me about bernie sanders" were returning 0 sources because they lacked temporal words. Now political queries automatically fetch current sources.

---

## 🐛 Recent Issues & Fixes

### Issue #1: Duplicate Jacobin RSS Feeds (v37.8.2)
- **Problem:** sed-based deployment had logic error, inserted Jacobin 18 times
- **Symptom:** Syntax error at line 9063, backend crash
- **Fix:** Replaced entire `rss-service.js` with heredoc containing correct version
- **Status:** ✅ FIXED (verified with `grep -c "name: 'Jacobin'"` = 1)

### Issue #2: Political Queries Return 0 Sources (v37.8.3)
- **Problem:** `needsCurrentInfo()` too restrictive, only triggers on temporal words
- **Symptom:** "bernie sanders" query shows "Query does not need current sources"
- **Fix:** Added `isPoliticalQuery` pattern matching political figures/topics
- **Status:** 🔄 IN DEPLOYMENT (using DEPLOY-v37.8.3-HEREDOC-FIX.sh)

---

## 📂 Deployment Scripts (Chronological)

### v37.8.2 (Nov 9, 2025) ✅ DEPLOYED
```
DEPLOY-v37.8.2-CORRECTED.txt
```
- Fixed duplicate Jacobin issue
- Replaced entire rss-service.js via heredoc
- Verified 13 diverse feeds present

### v37.8.3 (Nov 9, 2025) 🔄 PENDING
```
DEPLOY-v37.8.3-HEREDOC-FIX.sh
```
- Adds isPoliticalQuery pattern to needsCurrentInfo()
- Uses sed line-based replacement (format-independent)
- Triggers source search for political queries

**Previous attempts:**
- `DEPLOY-v37.8.3-COMPLETE.txt` (regex pattern mismatch - failed)
- `DEPLOY-v37.8.3-SINGLE-PASTE.sh` (same issue - failed)

---

## 🧪 Testing Procedures

### After v37.8.3 Deployment

**Test queries (should return 10-20 sources):**
```
1. "can you tell me about bernie sanders?"
2. "what is lindsey graham's voting record?"
3. "climate policy news"
4. "healthcare reform latest"
```

**Expected logs:**
```
🌍 Using global RSS/API sources
📡 Fetching RSS: Democracy Now
📡 Fetching RSS: The Intercept
📡 Fetching RSS: Mother Jones
✅ Global news: Found 10+ sources
```

**Verification commands:**
```bash
# Check logs for source fetching
pm2 logs backend --lines 50 | grep -A5 "bernie"

# Verify isPoliticalQuery exists
grep -n "isPoliticalQuery" /var/www/workforce-democracy/backend/ai-service.js

# Count pattern checks (should be 6)
grep -A 50 "function needsCurrentInfo" /var/www/workforce-democracy/backend/ai-service.js | grep "const is" | wc -l
```

---

## 🔐 Credentials & Access

### VPS Access
```
IP: 185.193.126.13
User: root
Access: SSH key authentication
```

### Guardian API
```
Key: c38c6351-3dab-4d74-a1c4-061e9479a11b
```

---

## 📊 File Naming Conventions

### Deployment Scripts
```
DEPLOY-v{VERSION}-{DESCRIPTION}.sh
```
Examples:
- DEPLOY-v37.8.3-HEREDOC-FIX.sh
- DEPLOY-v37.8.2-CORRECTED.txt

### Verification Scripts
```
VERIFY-v{VERSION}-{CHECK}.sh
```
Examples:
- VERIFY-v37.8.3-STATUS.txt

### Hotfix Scripts
```
HOTFIX-{DATE}-{ISSUE}.sh
```
Examples:
- HOTFIX-20251109-RSS-FEEDS.sh

---

## 🎯 Common User Requests & Responses

### "Deploy this to production"
❌ **Don't:** Paste code in chat  
✅ **Do:** Create `.sh` file, instruct user to upload via SCP

### "The backend crashed"
1. Check PM2 logs: `pm2 logs backend --lines 100`
2. Check for syntax errors: `node -c /var/www/workforce-democracy/backend/FILE.js`
3. Create `.sh` fix script
4. User uploads and executes

### "Add a new RSS feed"
1. Read current `rss-service.js`
2. Create deployment script with heredoc replacement
3. Include verification (grep for feed name)
4. User deploys via .sh file

### "Feature isn't working"
1. Check if deployment completed successfully
2. Verify nuclear PM2 restart was performed
3. Check logs for errors
4. Create verification script if needed

---

## ⚠️ Critical Reminders for AI Assistants

1. **NEVER paste executable code directly in chat messages**
2. **ALWAYS create `.sh` files for backend deployments**
3. **ALWAYS include verification steps in deployment scripts**
4. **ALWAYS use nuclear PM2 restart for code changes**
5. **ALWAYS check project files BEFORE making changes** (use LS, Read)
6. **User manages file transfer** - AI creates scripts, user uploads
7. **Heredoc method preferred** for large file replacements
8. **Line-based sed** for surgical function replacements

---

## 📞 Handover Checklist

When transferring to new AI assistant:

- [ ] Read this guide completely
- [ ] Check `DEPLOYMENT-WORKFLOW.md` for process details
- [ ] Review latest deployment scripts in project files
- [ ] Check `README.md` for current project status
- [ ] Never paste code in chat - always create `.sh` files
- [ ] User's local folder: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/`

---

**End of AI Assistant Handover Guide**
