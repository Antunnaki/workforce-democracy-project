# 🛡️ Deployment Safeguards & Best Practices

**Version**: 1.0  
**Date**: November 8, 2025  
**Purpose**: Prevent deployment issues and ensure file synchronization

---

## 🎉 SUCCESS! Backend is Running Clean!

**Evidence:**
```
[PM2] Done.
│ 0  │ backend  │ fork  │ 0  │ online  │ 0%  │ 14.6mb │
Server running on port 3001
Environment: production
```

**No errors in error log!** ✅

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [File Verification System](#file-verification-system)
3. [PM2 Cache Management](#pm2-cache-management)
4. [Backup Strategy](#backup-strategy)
5. [Rollback Procedures](#rollback-procedures)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## 1. Pre-Deployment Checklist

### ✅ Before Every Backend Deployment

```bash
cd /var/www/workforce-democracy/backend

# 1. Create timestamped backup
cp ai-service.js "ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js"

# 2. Verify current file state
bash verify-backend-files.sh

# 3. Test syntax of current file
node -c ai-service.js

# 4. Document what you're changing
echo "Deploying: [DESCRIPTION]" >> DEPLOYMENT_LOG.txt
echo "Date: $(date)" >> DEPLOYMENT_LOG.txt
echo "Previous backup: $(ls -t ai-service-BACKUP-*.js | head -1)" >> DEPLOYMENT_LOG.txt
echo "---" >> DEPLOYMENT_LOG.txt

# 5. Stop PM2 (don't restart, STOP)
pm2 stop backend

# 6. Apply your changes
# ... make edits here ...

# 7. Verify syntax of new file
node -c ai-service.js

# 8. Clear PM2 cache and start fresh
pm2 flush
pm2 delete backend
pm2 start server.js --name backend

# 9. Wait and check logs
sleep 3
pm2 logs backend --lines 50
```

---

## 2. File Verification System

### Create verify-backend-files.sh

```bash
#!/bin/bash
# File: /var/www/workforce-democracy/backend/verify-backend-files.sh

cd /var/www/workforce-democracy/backend

echo "🔍 Backend File Verification - v37.6.1+"
echo "═══════════════════════════════════════════"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

# Test 1: Policy keywords present
echo -n "Checking policy keywords... "
if grep -q "isPolicyQuery" ai-service.js; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
    
    # Count occurrences
    COUNT=$(grep -c "isPolicyQuery" ai-service.js)
    echo -n "  Reference count: "
    if [ "$COUNT" -eq 2 ]; then
        echo -e "${GREEN}✅ $COUNT (correct)${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️  $COUNT (expected 2)${NC}"
        ((FAIL++))
    fi
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Policy keywords missing!"
    ((FAIL++))
fi

# Test 2: No orphaned code
echo -n "Checking for orphaned code... "
ORPHANED=$(awk '/^}$/,/^function/ {if (/isPolicyQuery/) print NR": "$0}' ai-service.js)
if [ -z "$ORPHANED" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "  Found code between functions:"
    echo "$ORPHANED"
    ((FAIL++))
fi

# Test 3: Syntax validation
echo -n "Testing JavaScript syntax... "
if node -c ai-service.js 2>/dev/null; then
    echo -e "${GREEN}✅ PASS${NC}"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  Syntax errors found:"
    node -c ai-service.js
    ((FAIL++))
fi

# Test 4: Function scope check
echo -n "Verifying function scope... "
# Check that isPolicyQuery is declared inside needsCurrentInfo
FUNC_START=$(grep -n "function needsCurrentInfo" ai-service.js | cut -d: -f1)
FUNC_END=$(awk "/function needsCurrentInfo/,/^}$/ {if (/^}$/) {print NR; exit}}" ai-service.js)
POLICY_LINE=$(grep -n "const isPolicyQuery" ai-service.js | cut -d: -f1)

if [ "$POLICY_LINE" -gt "$FUNC_START" ] && [ "$POLICY_LINE" -lt "$FUNC_END" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  isPolicyQuery is inside needsCurrentInfo() (lines $FUNC_START-$FUNC_END)"
    ((PASS++))
else
    echo -e "${RED}❌ FAIL${NC}"
    echo "  isPolicyQuery at line $POLICY_LINE is OUTSIDE function ($FUNC_START-$FUNC_END)"
    ((FAIL++))
fi

# Test 5: File size sanity check
echo -n "File size check... "
FILE_SIZE=$(wc -c < ai-service.js)
if [ "$FILE_SIZE" -gt 50000 ] && [ "$FILE_SIZE" -lt 100000 ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    echo "  File size: $FILE_SIZE bytes (reasonable)"
    ((PASS++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}"
    echo "  File size: $FILE_SIZE bytes (expected ~58KB)"
fi

# Summary
echo ""
echo "═══════════════════════════════════════════"
echo -e "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "File checksum: $(md5sum ai-service.js | cut -d' ' -f1)"
    exit 0
else
    echo -e "${RED}❌ Some checks failed!${NC}"
    echo ""
    echo "Please review issues above before deploying."
    exit 1
fi
```

### Make it executable:

```bash
chmod +x /var/www/workforce-democracy/backend/verify-backend-files.sh
```

### Add to .bashrc for easy access:

```bash
echo "alias check-backend='cd /var/www/workforce-democracy/backend && bash verify-backend-files.sh'" >> ~/.bashrc
source ~/.bashrc
```

Now you can just run: `check-backend`

---

## 3. PM2 Cache Management

### Understanding PM2 Caching Issues

**Problem:** PM2 can cache:
- Old error logs
- Process metadata
- Module states

**Solution:** Always clear cache when deploying fixes:

```bash
# Clear all PM2 caches
pm2 flush               # Clear log files
pm2 delete backend      # Remove process entry
pm2 start server.js --name backend  # Start fresh

# Verify clean start
pm2 logs backend --lines 20
```

### PM2 Cache Troubleshooting Flowchart

```
Is backend showing errors?
    ↓ YES
    ↓
Has the file been fixed?
    ↓ YES
    ↓
Are errors still at the SAME line number?
    ↓ YES
    ↓
PM2 IS LOADING CACHED CODE!
    ↓
SOLUTION:
    1. pm2 stop backend
    2. pm2 flush
    3. pm2 delete backend
    4. pm2 start server.js --name backend
    5. Check logs: pm2 logs backend --lines 30
```

---

## 4. Backup Strategy

### Automated Backup Before Every Edit

Create a pre-edit backup function:

```bash
# Add to ~/.bashrc
backup-ai-service() {
    cd /var/www/workforce-democracy/backend
    BACKUP_NAME="ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js"
    cp ai-service.js "$BACKUP_NAME"
    echo "✅ Backup created: $BACKUP_NAME"
    ls -lah "$BACKUP_NAME"
}
```

Usage:
```bash
backup-ai-service
nano ai-service.js  # Make your edits
```

### Backup Retention Policy

Keep backups organized:

```bash
# Keep only last 10 backups (run weekly)
cd /var/www/workforce-democracy/backend
ls -t ai-service-BACKUP-*.js | tail -n +11 | xargs rm -f
```

### Critical Backup Points

Always backup before:
- ✅ Adding new functions
- ✅ Modifying existing functions
- ✅ Deploying from AI assistant changes
- ✅ Testing experimental features

---

## 5. Rollback Procedures

### Quick Rollback

```bash
cd /var/www/workforce-democracy/backend

# List recent backups
ls -lah ai-service-BACKUP-* | tail -5

# Restore (replace TIMESTAMP)
pm2 stop backend
cp ai-service-BACKUP-YYYYMMDD-HHMMSS.js ai-service.js

# Verify
node -c ai-service.js

# Restart
pm2 delete backend
pm2 start server.js --name backend
pm2 logs backend --lines 30
```

### Emergency Rollback (One Command)

```bash
cd /var/www/workforce-democracy/backend && pm2 stop backend && cp "$(ls -t ai-service-BACKUP-*.js | head -1)" ai-service.js && pm2 delete backend && pm2 start server.js --name backend && pm2 logs backend --lines 30
```

---

## 6. Common Issues & Solutions

### Issue 1: "messageLower is not defined"

**Cause:** Code inserted outside function scope

**Solution:**
```bash
# Verify isPolicyQuery is INSIDE needsCurrentInfo()
bash verify-backend-files.sh

# If test 4 fails, code is outside function
# Restore from backup and re-apply fix carefully
```

### Issue 2: Syntax Valid But Errors Persist

**Cause:** PM2 loading cached version

**Solution:**
```bash
pm2 flush
pm2 delete backend
pm2 start server.js --name backend
```

### Issue 3: Duplicate isPolicyQuery Declarations

**Cause:** Multiple fix attempts

**Solution:**
```bash
# Check for duplicates
grep -n "isPolicyQuery" ai-service.js

# Should show EXACTLY 2 lines
# If more, restore from clean backup
```

### Issue 4: File Modified But Changes Don't Apply

**Cause:** Editing wrong file or PM2 not restarting

**Solution:**
```bash
# Verify you're editing the right file
ls -l /var/www/workforce-democracy/backend/ai-service.js

# Check PM2 is using correct path
pm2 describe backend | grep script

# Force reload
pm2 delete backend
pm2 start server.js --name backend
```

---

## 7. File Synchronization Protocol

### Before AI Assistant Makes Changes

1. **AI Assistant documents current state:**
   ```bash
   md5sum ai-service.js
   wc -l ai-service.js
   grep -c "isPolicyQuery" ai-service.js
   ```

2. **User confirms file state:**
   - Run same commands
   - Compare checksums
   - If different, AI reviews latest version

3. **AI creates backup:**
   - Always create backup before modifications
   - Document backup name

4. **Apply changes:**
   - Use Python/verified scripts
   - Avoid manual sed when possible

5. **Verify:**
   - Run verify-backend-files.sh
   - Test syntax
   - Check PM2 logs

### File State Documentation Template

```
=== DEPLOYMENT LOG ===
Date: YYYY-MM-DD HH:MM:SS
Version: v37.X.X
File: ai-service.js
Checksum BEFORE: [md5sum]
Lines BEFORE: [line count]
Changes: [description]
Backup: [filename]
Checksum AFTER: [md5sum]
Lines AFTER: [line count]
Status: SUCCESS/FAILED
Notes: [any issues encountered]
======================
```

---

## 8. Deployment Workflow Diagram

```
┌─────────────────────────────────────┐
│ 1. CREATE BACKUP                    │
│    backup-ai-service                │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 2. VERIFY CURRENT STATE             │
│    bash verify-backend-files.sh     │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 3. STOP PM2                         │
│    pm2 stop backend                 │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 4. APPLY CHANGES                    │
│    [edit ai-service.js]             │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 5. TEST SYNTAX                      │
│    node -c ai-service.js            │
└────────────┬────────────────────────┘
             ↓
        ┌────┴────┐
        │ Valid?  │
        └────┬────┘
         YES │ NO
             │ └─────────────────┐
             ↓                   ↓
┌────────────────────┐  ┌────────────────┐
│ 6. CLEAR PM2 CACHE │  │ ROLLBACK       │
│    pm2 flush       │  │ Restore backup │
│    pm2 delete      │  └────────────────┘
└────────┬───────────┘
         ↓
┌─────────────────────────────────────┐
│ 7. START FRESH                      │
│    pm2 start server.js --name       │
│    backend                          │
└────────────┬────────────────────────┘
             ↓
┌─────────────────────────────────────┐
│ 8. VERIFY LOGS                      │
│    pm2 logs backend --lines 50      │
└────────────┬────────────────────────┘
             ↓
        ┌────┴────┐
        │Success? │
        └────┬────┘
         YES │ NO
             │ └───────────────────┐
             ↓                     ↓
    ┌────────────────┐    ┌───────────────┐
    │ DOCUMENT       │    │ DEBUG         │
    │ - Checksum     │    │ - Check logs  │
    │ - Version      │    │ - Verify file │
    │ - Changes      │    │ - Rollback    │
    └────────────────┘    └───────────────┘
```

---

## 9. Quick Reference Commands

```bash
# Check backend status
pm2 status
pm2 logs backend --lines 30

# Verify file integrity
bash verify-backend-files.sh

# Create backup
cp ai-service.js "ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js"

# Test syntax
node -c ai-service.js

# Fresh restart
pm2 stop backend
pm2 flush
pm2 delete backend
pm2 start server.js --name backend

# View full function
awk '/function needsCurrentInfo/,/^}$/' ai-service.js | cat -n

# Count isPolicyQuery references (should be 2)
grep -c "isPolicyQuery" ai-service.js

# Check file checksum
md5sum ai-service.js
```

---

## 10. Success Criteria

After ANY backend deployment, verify:

✅ PM2 shows `status: online`  
✅ Error log is empty  
✅ Out log shows "Server running on port 3001"  
✅ `bash verify-backend-files.sh` passes all tests  
✅ File checksum documented  
✅ Backup created and verified  

---

**Remember:** When in doubt, STOP, BACKUP, VERIFY! 🛡️

**Document Maintained By**: AI Development Team  
**Last Updated**: November 8, 2025  
**Version**: 1.0
