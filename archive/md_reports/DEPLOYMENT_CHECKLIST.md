# 🚀 Deployment Checklist - v37.1.4

**Date**: November 4, 2025  
**Version**: 37.1.4  
**Type**: Backend Only (No Frontend Changes)  
**Priority**: CRITICAL

---

## ✅ **Pre-Deployment**

- [x] Code changes reviewed
- [x] Root cause analysis completed
- [x] Technical documentation created
- [x] Deployment instructions prepared
- [x] Rollback plan documented
- [ ] User notified of deployment
- [ ] Testing environment ready (optional - can deploy directly)

---

## 📋 **Deployment Steps**

### **Step 1: Backup Current Version**

```bash
# SSH to production VPS
ssh root@185.193.126.13

# Navigate to backend directory
cd /var/www/workforce-democracy/backend

# Create timestamped backup
cp ai-service.js ai-service.js.v37.1.3.backup
cp ai-service.js ai-service.js.$(date +%Y%m%d_%H%M%S).backup

# Verify backup exists
ls -lh ai-service.js*
# Expected: See ai-service.js and backup files
```

**Status**: [ ] Complete

---

### **Step 2: Upload Modified File**

**Option A: Direct Edit** (if using SSH editor)
```bash
# Edit file directly
nano ai-service.js
# Copy changes from GenSpark version
# Save and exit
```

**Option B: SCP Upload** (if uploading from local)
```bash
# From your local machine
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

**Option C: Git Pull** (if changes committed to repo)
```bash
cd /var/www/workforce-democracy/backend
git pull origin main
# Verify ai-service.js updated
```

**Status**: [ ] Complete

---

### **Step 3: Verify File Changes**

```bash
# Check file size (should be slightly larger due to added code)
ls -lh ai-service.js

# Search for v37.1.4 markers to confirm it's the new version
grep "V37.1.4" ai-service.js
# Expected: Should find multiple "V37.1.4" comments

# Quick sanity check for key changes
grep "Final source validation" ai-service.js
# Expected: Should find the validation code
```

**Expected Output**:
```
V37.1.4 FIX: Filter out search page URLs that AI might include
V37.1.4: Validate government source URL
V37.1.4 CRITICAL FIX: Skip search pages and search engines
V37.1.4 CRITICAL FIX: Final validation to ensure NO search URLs
```

**Status**: [ ] Complete

---

### **Step 4: Restart Backend**

```bash
# Check current status
pm2 status backend

# Restart backend process
pm2 restart backend

# Verify restart successful
pm2 status backend
# Expected: Status should be "online", uptime should be < 1 minute
```

**Expected Output**:
```
┌─────┬────────────┬─────────────┬─────────┬─────────┬──────────┐
│ id  │ name       │ mode        │ status  │ uptime  │ cpu      │
├─────┼────────────┼─────────────┼─────────┼─────────┼──────────┤
│ 0   │ backend    │ fork        │ online  │ 10s     │ 0%       │
└─────┴────────────┴─────────────┴─────────┴─────────┴──────────┘
```

**Status**: [ ] Complete

---

### **Step 5: Monitor Logs**

```bash
# Watch logs in real-time (keep this running during initial testing)
pm2 logs backend

# In another terminal, check recent logs
pm2 logs backend --lines 100
```

**Look for**:
- ✅ No startup errors
- ✅ Server listening messages
- ✅ No immediate crashes

**Status**: [ ] Complete

---

## 🧪 **Post-Deployment Testing**

### **Test 1: Basic Functionality**

```bash
# Test basic query
curl -X POST http://185.193.126.13/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "context": "general", "timezone": "America/New_York"}' \
  | jq .

# Expected: Should get valid JSON response with success: true
```

**Status**: [ ] Complete  
**Result**: _______________

---

### **Test 2: Citation URL Validation** (CRITICAL)

**Via Frontend**:
1. Open https://workforcedemocracyproject.org
2. Open chat
3. Ask: "What is the vibe shift in the 2024 race?"
4. Wait for response with citations `[1]`, `[2]`, `[3]`
5. Click each citation link

**Expected**:
- ✅ Citations are clickable (superscript numbers)
- ✅ Each citation opens an actual article page
- ❌ NONE open search pages (e.g., `/search?q=`)

**Status**: [ ] Complete  
**Citations Link to Articles**: [ ] YES / [ ] NO  
**Any Search URLs**: [ ] YES / [ ] NO

---

### **Test 3: Source Count Match** (CRITICAL)

**Via Frontend**:
1. Same query as Test 2
2. Count citation numbers in text (e.g., `[1]`, `[2]`, `[3]`, `[4]`)
3. Expand "Sources" section
4. Count sources in list

**Expected**:
- ✅ Citation count matches source list count
- ✅ All citations clickable
- ✅ No "undefined" or missing sources

**Status**: [ ] Complete  
**Citation Count**: _____  
**Source List Count**: _____  
**Match**: [ ] YES / [ ] NO

---

### **Test 4: Backend Log Validation** (CRITICAL)

```bash
# Check logs for validation messages
pm2 logs backend --lines 50 | grep "Final source validation"

# Check for filtered URLs
pm2 logs backend --lines 100 | grep "Filtered"
```

**Expected Output Example**:
```
✅ Final source validation: 7 → 4 valid sources
⚠️ Filtered out search URL: https://duckduckgo.com/?q=...
⚠️ Skipped duplicate: https://example.com/article
```

**Status**: [ ] Complete  
**Validation Logs Present**: [ ] YES / [ ] NO  
**Filtered URLs (if any)**: _____

---

### **Test 5: Conversation Flow** (HIGH PRIORITY)

**Via Frontend**:
1. Ask: "What about Andrew Cuomo's campaign finance?"
2. Wait for response
3. Then ask: "Which candidate?"

**Expected**:
- ✅ Second response references context from first question
- ✅ Response is concise (1-2 paragraphs, not 6)
- ✅ Directly names candidate(s)

**Status**: [ ] Complete  
**Uses Context**: [ ] YES / [ ] NO  
**Concise Answer**: [ ] YES / [ ] NO

---

### **Test 6: Unclear Question Handling** (MEDIUM PRIORITY)

**Via Frontend**:
1. Ask: "What do you think?"

**Expected**:
- ✅ AI asks for clarification
- ✅ Provides specific options (e.g., "voting records, policy positions, or campaign finance")
- ❌ Does NOT give vague generic response

**Status**: [ ] Complete  
**Asks for Clarification**: [ ] YES / [ ] NO

---

## 🔍 **Validation Checklist**

After all tests complete, verify:

- [ ] No search URLs in any citation links
- [ ] Source counts match citation numbers
- [ ] Short follow-ups get concise answers
- [ ] Backend logs show validation working
- [ ] No errors in PM2 logs
- [ ] Frontend chat still works normally
- [ ] All existing features still functional

---

## 📊 **Test Results Summary**

| Test | Status | Notes |
|------|--------|-------|
| Basic Functionality | ⬜ | |
| Citation URLs | ⬜ | |
| Source Count Match | ⬜ | |
| Backend Logs | ⬜ | |
| Conversation Flow | ⬜ | |
| Clarification Prompts | ⬜ | |

**Overall Status**: ⬜ PASS / ⬜ FAIL

---

## ⚠️ **Rollback Procedure** (If Tests Fail)

```bash
# SSH to production
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# Restore v37.1.3 backup
cp ai-service.js.v37.1.3.backup ai-service.js

# Restart backend
pm2 restart backend

# Verify rollback
pm2 logs backend --lines 50

# Notify team
echo "Rolled back to v37.1.3 due to: [REASON]"
```

**Rollback Initiated**: [ ] YES / [ ] NO  
**Reason**: _______________

---

## 📝 **Deployment Notes**

**Deployed By**: _______________  
**Deployment Date**: _______________  
**Deployment Time**: _______________  
**Downtime**: _______________ (expected: ~5-10 seconds)

**Issues Encountered**:
- [ ] None
- [ ] Minor (list below)
- [ ] Major (rollback required)

**Issue Details**: _______________

---

## ✅ **Sign-Off**

**Technical Review**: [ ] Complete  
**Deployment**: [ ] Complete  
**Testing**: [ ] Complete  
**Documentation**: [ ] Complete

**Ready for Production**: [ ] YES / [ ] NO

---

**Next Steps After Successful Deployment**:

1. Monitor backend logs for 24 hours
2. Check for any user-reported issues
3. Verify metrics (search URL rate = 0%)
4. Document any unexpected behavior
5. Consider additional optimizations if needed

---

**Emergency Contact**:
- Backend VPS: 185.193.126.13
- PM2 Process: `backend`
- Logs: `pm2 logs backend`
- Restart: `pm2 restart backend`
