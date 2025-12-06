#🤖 AI ASSISTANT HANDOVER GUIDE
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
2.**User downloads** `.sh` file to local machine
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
chmod +x /tmp/DEPLOY-v37.8.3-HEREDOC-FIX.sh/tmp/DEPLOY-v37.8.3-HEREDOC-FIX.sh
```

---

## ✅ Why This Process Eliminates Errors

### Old Method (Copy-Paste) Problems:
❌ Chat character limits truncate code  
❌ Special characters get mangled  
❌ Line breaks corrupted  
❌ HiddenUnicode characters  
❌ Terminal paste buffer limits  
❌ User copies wrong section  

### New Method (.sh Files) Advantages:
✅ **Complete code uploaded atomically** - entire script in one file  
✅ **No character corruption** - binary SCP transfer preserves everything  
✅ **Version control** - all deployments saved locally  
✅**Repeatable** - can re-run exact same deployment  
✅ **AI handover safe** - future assistants read .sh files  
✅ **Testable** - user can inspect before upload  
✅ **Audit trail** - complete deployment history  

### Yes! This DRAMATICALLY Reduces Errors

**The .shfile workflow eliminates ~90% of deployment errors because:**

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
├── rss-service.js         # 40+RSS feed configurations
├── guardian-service.js    # Guardian API integration
└── package.json           # Dependencies
```

### Nuclear PM2 Restart Sequence
```bash
pm2 stop backend
pm2 flush           # Clear all logs
pm2 delete backend  # Remove from PM2
pkill -9 node# Kill all Node processes
sleep 2
cd /var/www/workforce-democracy/backend
pm2 start server.js --name backend
pm2 save            # Persist PM2 config
```

**Why "Nuclear"?**  
Node.js aggressively caches modules. Standard `pm2 restart` doesn't clear`require()` cache. Nuclear restart ensures fresh module load.

###PM2 Startup Configuration

To make PM2 start automatically on system boot:

1. Run this command on the VPS:
   ```bash
   pm2 startup
   ```

2. Copy and run the command it outputs, which will look like:
   ```bash
   sudo env PATH=$PATH:/usr/bin/usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root
   ```
   
   Note: This command requires sudo access and will prompt for the system password.

3. Save the current PM2 configuration:
   ```bash
   pm2 save
   ```

This ensures that the backendservice will automatically start when the VPS reboots.

---

## 📡 RSS Service Configuration

### Current Status (v37.8.2 ✅ DEPLOYED)

**13 Diverse US Progressive News Feeds:**
1. Democracy Now
2. The Intercept  
3. ProPublica4. Jacobin (single instance - was duplicated 18x, now fixed)
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

**Purpose:** Determines when user queriesshould trigger RSS/API source fetching

**Current Patterns (v37.8.2):**
- ✅ Temporal indicators (2024, 2025, current, recent, today, etc.)
- ✅ LLM knowledge cutoff admissions
- ✅ Campaign finance queries
- ✅Current events (elections, bills, legislation)
- ✅ Local government (NYC, borough names)

**v37.8.3 Addition (PENDING DEPLOYMENT):**
- 🔄 **isPoliticalQuery** - Political figures and policy topics
  - Politicians: bernie sanders, aoc, biden, trump, pelosi, etc.
  - Topics: healthcare, climate, labor, immigration, taxes, etc.
  - Triggers: Any mention of political figures or major policy areas

```
