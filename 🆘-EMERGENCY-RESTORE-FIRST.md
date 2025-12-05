# 🆘 EMERGENCY: Restore Backend First

**Status**: Backend is CRASHED - must restore before deploying v37.7.0

---

## ⚠️ CRITICAL: Do These Steps IN ORDER

### Step 1: Save Crashed Version (for debugging)

```bash
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service-CRASHED-$(date +%Y%m%d-%H%M%S).js
```

### Step 2: Find Your Most Recent Backup

```bash
ls -lah ai-service-BACKUP-* | tail -5
```

Look for the most recent backup from today or Nov 7/8. It should be named:
- `ai-service-BACKUP-v37.6.0-20241107-XXXXXX.js` or similar

### Step 3: Restore the Backup

```bash
# Replace YYYYMMDD-HHMMSS with your actual backup timestamp
cp ai-service-BACKUP-v37.6.0-YYYYMMDD-HHMMSS.js ai-service.js
```

**Example:**
```bash
cp ai-service-BACKUP-v37.6.0-20241107-143022.js ai-service.js
```

### Step 4: Restart Backend

```bash
pm2 restart backend
```

### Step 5: Verify It's Working

```bash
pm2 logs backend --lines 20
```

**Expected Output:**
- Should show "Server running on port 3001" or similar
- NO errors about "messageLower is not defined"
- Backend should respond to health checks

### Step 6: Test the App

Visit your frontend and try a simple query like:
- "Tell me about labor unions"

If it works, proceed to Step 7. If not, check PM2 logs again.

---

## Step 7: Now Deploy v37.7.0 Complete Fix

**Once backend is restored and working**, run the complete fix script:

```bash
cd /var/www/workforce-democracy/backend

# Upload FIX-v37.7.0-COMPLETE.sh to this directory first

# Make it executable
chmod +x FIX-v37.7.0-COMPLETE.sh

# Run it
bash FIX-v37.7.0-COMPLETE.sh
```

The script will:
1. ✅ Create a new backup
2. ✅ Add missing policy keywords to `needsCurrentInfo()`
3. ✅ Add `scoreSourceRelevance()` function
4. ✅ Add `filterAndSortSources()` function
5. ✅ Update `searchAdditionalSources()` to use filtering
6. ✅ Validate syntax
7. ✅ Restart PM2

---

## What Went Wrong?

The production `needsCurrentInfo()` function was missing this code:

```javascript
// Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1
const isPolicyQuery = messageLower.match(
    /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/
);
```

And the return statement was missing `|| isPolicyQuery`.

My v37.7.0 code expected those keywords to be there, which caused the crash.

**The FIX-v37.7.0-COMPLETE.sh script fixes BOTH issues in one deployment.**

---

## Rollback Plan (If Needed)

If the complete fix script fails:

```bash
# Find the backup it creates (will be named ai-service-BACKUP-v37.7.0-*.js)
ls -lah ai-service-BACKUP-v37.7.0-*

# Restore it
cp ai-service-BACKUP-v37.7.0-YYYYMMDD-HHMMSS.js ai-service.js

# Restart
pm2 restart backend
```

---

## Questions?

If you encounter any errors:
1. Copy the FULL error message
2. Show me the PM2 logs: `pm2 logs backend --lines 50`
3. Tell me which step failed

---

**Ready to proceed? Start with Step 1 above! 🚀**
