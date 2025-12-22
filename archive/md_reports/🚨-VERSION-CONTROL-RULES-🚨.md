# 🚨🚨🚨 VERSION CONTROL RULES - READ THIS FIRST 🚨🚨🚨

**⚠️ CRITICAL: READ BEFORE MAKING ANY CHANGES ⚠️**

---

## 🎯 **THE GOLDEN RULE**

```
┌────────────────────────────────────────────────────────────┐
│                                                             │
│  ✅ ALL CHANGES GO TO VERSION B (TEST) ONLY                │
│                                                             │
│  ❌ NEVER EDIT VERSION A (PRODUCTION) DIRECTLY             │
│                                                             │
│  ✅ DEPLOY VERSION B → VERSION A ONLY WHEN STABLE          │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

---

## 📂 **VERSION STRUCTURE**

### **VERSION A - PRODUCTION (LIVE SITE)**

```
Location:     /var/www/workforce-democracy/version-a/
Backend Port: 3001
Frontend:     https://workforcedemocracyproject.org
API:          https://api.workforcedemocracyproject.org
Database:     workforce_democracy
Status:       🔒 READ-ONLY (except via deployment script)
```

**⚠️ NEVER EDIT VERSION A FILES DIRECTLY**

### **VERSION B - TESTING (DEVELOPMENT)**

```
Location:     /var/www/workforce-democracy/version-b/
Backend Port: 3002
Frontend:     https://sxcrlfyt.gensparkspace.com (GenSpark)
API:          http://localhost:3002 (VPS only)
Database:     workforce_democracy_test
Status:       ✅ ACTIVE DEVELOPMENT - Edit freely
```

**✅ ALL CHANGES GO HERE**

---

## 🔄 **DEPLOYMENT WORKFLOW**

### **Step 1: Make Changes to VERSION B**

```bash
# Edit files in VERSION B
cd /var/www/workforce-democracy/version-b/backend

# Example: Edit a route
nano routes/voting-routes.js

# Save changes
```

### **Step 2: Test in VERSION B**

```bash
# Restart VERSION B backend
sudo systemctl restart workforce-backend-version-b

# Check logs
sudo journalctl -u workforce-backend-version-b -f

# Test on GenSpark site
# https://sxcrlfyt.gensparkspace.com

# Test API directly
curl http://localhost:3002/api/your-endpoint
```

### **Step 3: Deploy to VERSION A (When Stable)**

```bash
# Run deployment script
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh

# Script will:
# 1. Backup VERSION A automatically
# 2. Run tests on VERSION B
# 3. Ask for confirmation
# 4. Sync VERSION B → VERSION A
# 5. Restart VERSION A backend
# 6. Verify deployment
```

### **Step 4: Verify Live Site**

```bash
# Check live site
# https://workforcedemocracyproject.org

# Test live API
curl https://api.workforcedemocracyproject.org/api/your-endpoint
```

---

## 🚫 **WHAT NOT TO DO**

### ❌ **NEVER DO THIS:**

```bash
# ❌ DON'T edit VERSION A directly
cd /var/www/workforce-democracy/version-a/backend
nano routes/voting-routes.js  # ❌ NO NO NO!

# ❌ DON'T copy files manually
cp my-file.js /var/www/workforce-democracy/version-a/  # ❌ NO!

# ❌ DON'T restart VERSION A manually after edits
sudo systemctl restart workforce-backend-version-a  # ❌ NO!
```

### ✅ **ALWAYS DO THIS:**

```bash
# ✅ Edit VERSION B
cd /var/www/workforce-democracy/version-b/backend
nano routes/voting-routes.js  # ✅ YES!

# ✅ Deploy via script
./deployment-scripts/sync-b-to-a.sh  # ✅ YES!
```

---

## 🆘 **EMERGENCY PROCEDURES**

### **If You Accidentally Edited VERSION A:**

```bash
# 1. STOP - Don't save or restart
# 2. Discard changes
cd /var/www/workforce-democracy/version-a
git checkout .  # If using git

# 3. Make the same changes in VERSION B
cd /var/www/workforce-democracy/version-b
# Edit files here

# 4. Deploy properly
./deployment-scripts/sync-b-to-a.sh
```

### **If Live Site is Broken:**

```bash
# Emergency rollback
cd /var/www/workforce-democracy/deployment-scripts

# Find latest backup
ls -lt /var/www/workforce-democracy/backups/

# Rollback
./rollback.sh /var/www/workforce-democracy/backups/version-a-YYYYMMDD-HHMMSS
```

---

## 📋 **DEPLOYMENT CHECKLIST**

Before running `sync-b-to-a.sh`:

- [ ] ✅ All changes tested in VERSION B
- [ ] ✅ GenSpark site (VERSION B) working correctly
- [ ] ✅ No errors in VERSION B logs
- [ ] ✅ Database migrations tested (if any)
- [ ] ✅ API endpoints responding correctly
- [ ] ✅ User confirmed changes are ready for production

After running `sync-b-to-a.sh`:

- [ ] ✅ Live site (VERSION A) working correctly
- [ ] ✅ No errors in VERSION A logs
- [ ] ✅ API endpoints responding correctly
- [ ] ✅ Backup created successfully
- [ ] ✅ User notified of successful deployment

---

## 🗂️ **DIRECTORY STRUCTURE**

```
/var/www/workforce-democracy/
│
├── version-a/                    ← PRODUCTION (LIVE SITE)
│   ├── backend/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── database/
│   │   ├── node_modules/
│   │   ├── package.json
│   │   └── .env                  (PORT=3001)
│   └── frontend/                 (deployed to workforcedemocracyproject.org)
│
├── version-b/                    ← TESTING (DEVELOPMENT)
│   ├── backend/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── utils/
│   │   ├── database/
│   │   ├── node_modules/
│   │   ├── package.json
│   │   └── .env                  (PORT=3002)
│   └── frontend/                 (deployed to GenSpark)
│
├── deployment-scripts/
│   ├── sync-b-to-a.sh            ← Deploy VERSION B → VERSION A
│   ├── backup-version-a.sh       ← Manual backup
│   └── rollback.sh               ← Emergency rollback
│
└── backups/
    ├── version-a-20251124-210600/
    ├── version-a-20251125-143000/
    └── ...                       (Automatic backups before each deployment)
```

---

## 🔧 **SYSTEMD SERVICES**

### **VERSION A (Production)**

```bash
# Status
sudo systemctl status workforce-backend-version-a

# Start
sudo systemctl start workforce-backend-version-a

# Stop
sudo systemctl stop workforce-backend-version-a

# Logs
sudo journalctl -u workforce-backend-version-a -f
```

**Service File:** `/etc/systemd/system/workforce-backend-version-a.service`

### **VERSION B (Testing)**

```bash
# Status
sudo systemctl status workforce-backend-version-b

# Start
sudo systemctl start workforce-backend-version-b

# Stop
sudo systemctl stop workforce-backend-version-b

# Logs
sudo journalctl -u workforce-backend-version-b -f
```

**Service File:** `/etc/systemd/system/workforce-backend-version-b.service`

---

## 📝 **ENVIRONMENT FILES**

### **VERSION A (.env)**

```bash
# Location: /var/www/workforce-democracy/version-a/backend/.env

PORT=3001
NODE_ENV=production
DB_NAME=workforce_democracy
DB_USER=postgres
DB_PASSWORD=QaJrJ2837S6Uhjjy
DB_HOST=localhost
DB_PORT=5432

GROQ_API_KEY=gsk_...
CONGRESS_API_KEY=ktubRS8VFW27...
OPENSTATES_API_KEY=7234b76b-44f7...
```

### **VERSION B (.env)**

```bash
# Location: /var/www/workforce-democracy/version-b/backend/.env

PORT=3002
NODE_ENV=development
DB_NAME=workforce_democracy_test
DB_USER=postgres
DB_PASSWORD=QaJrJ2837S6Uhjjy
DB_HOST=localhost
DB_PORT=5432

GROQ_API_KEY=gsk_...
CONGRESS_API_KEY=ktubRS8VFW27...
OPENSTATES_API_KEY=7234b76b-44f7...
```

---

## 🎓 **FOR AI ASSISTANTS (HANDOVER)**

### **FIRST TIME WORKING ON THIS PROJECT?**

**READ THESE IN ORDER:**

1. ✅ **THIS FILE** (🚨-VERSION-CONTROL-RULES-🚨.md) - You're reading it now
2. ✅ **README.md** - Project overview
3. ✅ **DEPLOYMENT-MASTER.md** - Deployment procedures
4. ✅ **VOTING-RECORDS-FEATURE-SPECIFICATION.md** - Current feature being built

### **BEFORE MAKING ANY CHANGES:**

Ask yourself these questions:

1. ❓ **Am I editing VERSION A or VERSION B?**
   - ✅ **Correct answer:** VERSION B
   - ❌ **Wrong answer:** VERSION A

2. ❓ **Where should I make changes?**
   - ✅ **Correct:** `/var/www/workforce-democracy/version-b/`
   - ❌ **Wrong:** `/var/www/workforce-democracy/version-a/`

3. ❓ **How do I deploy to production?**
   - ✅ **Correct:** `./deployment-scripts/sync-b-to-a.sh`
   - ❌ **Wrong:** Manually copy files, edit VERSION A directly

4. ❓ **Is the user asking me to deploy to live site?**
   - ✅ **Yes:** Run `sync-b-to-a.sh` (only if VERSION B is tested)
   - ❌ **No:** Keep working in VERSION B

### **IF CONFUSED:**

**ASK THE USER:**

> "I'm about to make changes to the backend. Should I:
> 
> A) Edit VERSION B (test) and deploy later?
> B) Edit VERSION A (live production) directly? (NOT recommended)
> 
> I recommend Option A (VERSION B) for safety."

**Default answer if user doesn't specify:** **VERSION B**

---

## 🛡️ **SAFETY MECHANISMS**

### **1. Automatic Backups**

Every deployment via `sync-b-to-a.sh` automatically creates a backup:

```
/var/www/workforce-democracy/backups/version-a-YYYYMMDD-HHMMSS/
```

Backups are timestamped and preserved for 30 days.

### **2. Pre-Deployment Tests**

The `sync-b-to-a.sh` script automatically tests VERSION B before deploying:

- ✅ Backend health check
- ✅ Representatives API test (expects 15 reps for ZIP 12061)
- ✅ Bills cache API test
- ✅ Database connectivity test

If any test fails, deployment is **BLOCKED**.

### **3. Confirmation Required**

Deployment requires typing **"DEPLOY"** to proceed. This prevents accidental deployments.

### **4. Rollback Available**

If deployment goes wrong, rollback to last backup:

```bash
./rollback.sh /var/www/workforce-democracy/backups/version-a-YYYYMMDD-HHMMSS
```

---

## 📊 **MONITORING**

### **Check Which Version is Running**

```bash
# VERSION A (Production)
curl https://api.workforcedemocracyproject.org/api/health
# Should return: {"version":"A","status":"ok","port":3001}

# VERSION B (Testing)
curl http://localhost:3002/api/health
# Should return: {"version":"B","status":"ok","port":3002}
```

### **View Logs**

```bash
# VERSION A logs
sudo journalctl -u workforce-backend-version-a -f

# VERSION B logs
sudo journalctl -u workforce-backend-version-b -f

# Or view log files directly
tail -f /var/log/workforce-backend-version-a.log
tail -f /var/log/workforce-backend-version-b.log
```

---

## ❓ **FAQ**

### **Q: Can I test changes on the live site?**

**A:** NO! Always test in VERSION B (GenSpark site) first.

---

### **Q: I found a bug on the live site. How do I fix it?**

**A:** 
1. Reproduce bug in VERSION B
2. Fix in VERSION B
3. Test thoroughly
4. Deploy via `sync-b-to-a.sh`

---

### **Q: Can I make a quick hotfix directly to VERSION A?**

**A:** NO! Even for emergencies:
1. Fix in VERSION B
2. Test (even if quick)
3. Deploy via script

The deployment script only takes 2-3 minutes and includes safety checks.

---

### **Q: What if VERSION B and VERSION A have different code?**

**A:** This is expected! VERSION B is always ahead of VERSION A. Deploy when VERSION B is stable and tested.

---

### **Q: Can I sync VERSION A → VERSION B?**

**A:** NO! Flow is ALWAYS VERSION B → VERSION A. Never the reverse.

If you need to reset VERSION B to match VERSION A:

```bash
# Only if needed (rare!)
rm -rf /var/www/workforce-democracy/version-b/backend/*
cp -r /var/www/workforce-democracy/version-a/backend/* \
      /var/www/workforce-democracy/version-b/backend/
```

---

### **Q: How do I update the GenSpark site (VERSION B frontend)?**

**A:**
1. Make changes to frontend files in VERSION B
2. Use GenSpark's "Publish" button to deploy
3. Test at https://sxcrlfyt.gensparkspace.com/

---

### **Q: How do I update the live site (VERSION A frontend)?**

**A:**
1. Test frontend changes on GenSpark (VERSION B) first
2. When ready, publish to https://workforcedemocracyproject.org/

---

## 🎯 **QUICK REFERENCE**

| Task | Command | Location |
|------|---------|----------|
| Edit backend files | `cd /var/www/workforce-democracy/version-b/backend` | VERSION B |
| Restart test backend | `sudo systemctl restart workforce-backend-version-b` | VERSION B |
| Test changes | Visit `https://sxcrlfyt.gensparkspace.com/` | VERSION B |
| Deploy to production | `./deployment-scripts/sync-b-to-a.sh` | Deploy B→A |
| View test logs | `sudo journalctl -u workforce-backend-version-b -f` | VERSION B |
| View production logs | `sudo journalctl -u workforce-backend-version-a -f` | VERSION A |
| Emergency rollback | `./deployment-scripts/rollback.sh [backup-path]` | Restore A |

---

## 🔐 **PERMISSIONS**

All VERSION A files should be:
- **Owner:** root
- **Permissions:** 755 (directories), 644 (files)
- **Protected:** Only deployment script can modify

All VERSION B files should be:
- **Owner:** root
- **Permissions:** 755 (directories), 644 (files)
- **Editable:** Can be edited freely for development

---

## 📅 **MAINTENANCE SCHEDULE**

### **Daily**
- Check VERSION A logs for errors
- Monitor VERSION B for new changes

### **Weekly**
- Review backups in `/var/www/workforce-democracy/backups/`
- Clean up backups older than 30 days

### **Monthly**
- Review deployment history
- Update dependencies in VERSION B, test, then deploy to VERSION A

---

## 🚨 **CRITICAL REMINDERS**

```
┌─────────────────────────────────────────────────────────────┐
│                                                              │
│  1. ✅ ALL CHANGES → VERSION B                              │
│                                                              │
│  2. ❌ NEVER EDIT VERSION A DIRECTLY                        │
│                                                              │
│  3. ✅ DEPLOY VIA SCRIPT: ./sync-b-to-a.sh                  │
│                                                              │
│  4. ❌ NO MANUAL FILE COPYING TO VERSION A                  │
│                                                              │
│  5. ✅ TEST IN VERSION B BEFORE DEPLOYING                   │
│                                                              │
│  6. ❌ NO DIRECT DATABASE CHANGES IN PRODUCTION             │
│                                                              │
│  7. ✅ ALWAYS BACKUP (automatic via script)                 │
│                                                              │
│  8. ❌ NO EXCEPTIONS TO THESE RULES                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated:** November 24, 2025  
**Version:** 1.0  
**Status:** 🔒 **MANDATORY READING FOR ALL AI ASSISTANTS**

---

**IF YOU VIOLATE THESE RULES, THE LIVE SITE WILL BREAK. DON'T BE THAT AI.** 😱

**WHEN IN DOUBT, ASK THE USER!** 🙋
