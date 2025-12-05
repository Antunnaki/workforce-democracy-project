# 🎯 What To Do Now - v37.7.0 Emergency Recovery

**Current Status**: Backend is CRASHED - You need to restore it FIRST before deploying v37.7.0

---

## ⚠️ STEP 1: Restore Backend (CRITICAL)

Your backend crashed because it was missing policy keywords that the v37.7.0 code expected.

**On your VPS, run these commands:**

```bash
cd /var/www/workforce-democracy/backend

# 1. Save crashed version for debugging
cp ai-service.js ai-service-CRASHED-$(date +%Y%m%d-%H%M%S).js

# 2. List available backups
ls -lah ai-service-BACKUP-* | tail -5

# 3. Find the MOST RECENT backup (should be from today or Nov 7/8)
#    It will be named something like: ai-service-BACKUP-v37.6.0-20241107-143022.js

# 4. Restore that backup (REPLACE THE TIMESTAMP WITH YOUR ACTUAL ONE)
cp ai-service-BACKUP-v37.6.0-YYYYMMDD-HHMMSS.js ai-service.js

# 5. Restart backend
pm2 restart backend

# 6. Check if it's working
pm2 logs backend --lines 20
```

**Expected Output**: Should show "Server running on port 3001" with NO errors

---

## ✅ STEP 2: Apply Complete Fix (After Backend is Restored)

Once the backend is stable and working, you'll apply the complete v37.7.0 fix which includes:
- ✅ Missing policy keywords (from v37.6.1)
- ✅ New source relevance filtering (v37.7.0)

**Upload `FIX-v37.7.0-COMPLETE.sh` to your server, then:**

```bash
cd /var/www/workforce-democracy/backend

# Make it executable
chmod +x FIX-v37.7.0-COMPLETE.sh

# Run it
bash FIX-v37.7.0-COMPLETE.sh
```

**The script will:**
1. Create a new backup
2. Add policy keywords to `needsCurrentInfo()` (BEFORE the return statement)
3. Add source relevance filtering functions
4. Update `searchAdditionalSources()` to filter results
5. Validate syntax
6. Tell you to restart PM2

---

## 🧪 STEP 3: Test (After Successful Deployment)

```bash
# Restart backend
pm2 restart backend

# Watch logs
pm2 logs backend --lines 50
```

**Test on your frontend with this query:**
> "What happens if SNAP benefits are cut?"

**Expected Logs:**
```
📊 Scoring 15 sources for relevance...
  ⚠️  "Boeing Announces..." - Not SNAP-related (-200)
  ✅ Kept 8/15 sources (removed 7 irrelevant)
  🏆 Top sources:
     1. Democracy Now [TRUSTED]: "SNAP Benefits Face Major Cuts..."
     2. Common Dreams [TRUSTED]: "Food Stamp Cuts Would Impact..."
🎯 Returning 8 relevant sources
```

---

## 📊 What This Fixes

**Before v37.7.0:**
- ❌ SNAP queries didn't trigger pre-search (missing policy keywords)
- ❌ Boeing articles appeared for SNAP queries
- ❌ No topic-specific filtering
- ❌ No domain reputation scoring

**After v37.7.0:**
- ✅ SNAP queries trigger pre-search (policy keywords added)
- ✅ Boeing articles filtered out (-200 penalty)
- ✅ Topic-specific relevance scoring
- ✅ Trusted progressive media prioritized (+75 bonus)
- ✅ Freshness scoring (+30 for recent articles)

---

## 🆘 If Something Goes Wrong

**If the fix script fails:**

```bash
# Find the backup it created
ls -lah ai-service-BACKUP-before-v37.7.0-*

# Restore it
cp ai-service-BACKUP-before-v37.7.0-YYYYMMDD-HHMMSS.js ai-service.js

# Restart
pm2 restart backend
```

**Then:**
1. Copy the error message
2. Show me the PM2 logs: `pm2 logs backend --lines 50`
3. Tell me which step failed

---

## 📁 Files You Need

I've created these files in your project directory:

1. **🆘-EMERGENCY-RESTORE-FIRST.md** - Detailed restoration guide
2. **FIX-v37.7.0-COMPLETE.sh** - The automated fix script
3. **🎯-WHAT-TO-DO-NOW-v37.7.0.md** - This file (simple quick start)

---

## ❓ Questions?

- **Q: Why did the backend crash?**
  - A: Your production code was missing policy keywords from v37.6.1. My v37.7.0 code expected them to exist.

- **Q: What does the complete fix script do?**
  - A: It adds BOTH the missing v37.6.1 code AND the new v37.7.0 features in one atomic operation.

- **Q: Is this safe?**
  - A: Yes! The script creates backups before making changes and validates syntax before finishing.

---

## 🚀 Ready?

Start with **STEP 1** above and let me know when:
1. ✅ Backend is restored and running
2. ✅ Ready to apply the complete fix
3. ✅ Need help troubleshooting

**Let's get your backend back online first, then deploy the improvements! 💪**
