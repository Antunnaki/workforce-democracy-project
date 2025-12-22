# 🚀 Deep Research Fix - Deployment Guide

## 🐛 Bug Found & Fixed

**Problem:** Frontend was looking for `.representative-card` class but actual HTML uses `.rep-card`

**Impact:** Context detection failed → `useDeepResearch` stayed `false` → Only 1 RSS source returned instead of 7+ Congress.gov sources

**Fix:** Changed `document.querySelector('.representative-card')` to `.rep-card` in `js/chat-clean.js`

---

## 📋 What You Need to Deploy

### File to Upload
- **Source:** `js/chat-clean.js` (from this project)
- **Destination:** `/var/www/workforce-democracy/version-b/js/chat-clean.js`

### Affected Service
- ❌ **NO backend restart needed** (this is a frontend-only fix)
- ✅ **Just upload the file** - browsers will load it on next page refresh

---

## 🎯 Deployment Steps (2 minutes)

### Step 1: Upload Fixed File
```bash
# From your local machine where this project is
scp js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/version-b/js/chat-clean.js
```

### Step 2: Test in Version B
```bash
# On your VPS
ssh root@185.193.126.13

# Test the frontend (open in browser)
# URL: http://185.193.126.13:3002
```

### Step 3: Test Workflow
1. **Go to "My Representatives" section**
2. **Enter zip code and search**
3. **Wait for representative cards to load**
4. **Ask the AI:** "How has [Representative Name] voted on healthcare?"
5. **Verify:** Response should include 7+ sources from Congress.gov

### Step 4: Deploy to Production
```bash
# On your VPS
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh

# Verify Version A is updated
ls -la /var/www/workforce-democracy/version-a/js/chat-clean.js
```

### Step 5: Production Test
```bash
# Test on production port
# URL: http://185.193.126.13:3001
```

---

## ✅ Expected Behavior AFTER Fix

### 🎯 When Viewing Representatives
User asks: **"How has Chuck Schumer voted on healthcare?"**

**Frontend context detection:**
```javascript
{
  page: "index",
  section: "my-representatives",
  viewingContent: {
    type: "representative",  // ✅ NOW DETECTED!
    name: "Chuck Schumer"
  }
}
```

**Backend deep research trigger:**
```javascript
needsDeepResearch() returns TRUE because:
- Message contains "voted" ✅
- Message contains "healthcare" ✅  
- context.viewingContent.type === "representative" ✅ (FIXED!)
```

**Result:**
- ✅ 7+ sources from Congress.gov
- ✅ Citations in response (¹ ² ³)
- ✅ Specific bills referenced
- ✅ Voting record analysis

---

## 🧪 Test Cases

### Test 1: Representative Voting Record
```
1. Go to My Representatives
2. Search zip code: 12061
3. Wait for Chuck Schumer card to load
4. Ask: "How has Chuck Schumer voted on healthcare?"
5. ✅ Expect: 7+ sources with Congress.gov bills
```

### Test 2: General Question (No Rep Context)
```
1. Go to Home page (scroll to top)
2. Ask: "How does healthcare policy work?"
3. ✅ Expect: 1 RSS source (Democracy Now, etc.) - normal behavior
```

### Test 3: Bill Context
```
1. Go to Bills section
2. Click on a bill
3. Ask: "What does this bill do?"
4. ✅ Expect: Bill-specific analysis (may use deep research)
```

---

## 📊 Verification Commands

### Check File Was Uploaded
```bash
ls -lh /var/www/workforce-democracy/version-b/js/chat-clean.js

# Verify modification date is recent
stat /var/www/workforce-democracy/version-b/js/chat-clean.js
```

### Check Context Detection (Browser Console)
```javascript
// In browser console after asking a question
// Should see in network tab:

POST /api/civic/llm-chat/submit
Request payload:
{
  "message": "How has Chuck Schumer voted on healthcare?",
  "context": {
    "viewingContent": {
      "type": "representative",  // ✅ Should be present!
      "name": "Chuck Schumer"
    }
  }
}
```

### Backend Logs
```bash
# Watch Version B logs during test
tail -f /var/log/workforce-backend-b.log

# Look for:
# "🔍 Deep Research enabled for representative: Chuck Schumer"
# "📊 Found 7 Congress.gov bills"
```

---

## 🔥 Emergency Rollback

### If Something Goes Wrong
```bash
# Restore from backup (Version B has many backups)
cd /var/www/workforce-democracy/version-b/js

# Find backup
ls -la chat-clean.js*

# Restore (example)
cp chat-clean.js.backup-YYYYMMDD_HHMMSS chat-clean.js

# Clear browser cache and test
```

---

## 📝 Summary

| Item | Status |
|------|--------|
| **Bug Cause** | Frontend CSS selector mismatch |
| **Files Changed** | `js/chat-clean.js` (1 line) |
| **Backend Changes** | None (backend is working perfectly) |
| **Service Restart** | Not needed |
| **Risk Level** | Very Low (frontend-only) |
| **Rollback Time** | 30 seconds (just re-upload old file) |

---

## 🎉 Success Criteria

After deployment, when viewing a representative and asking about voting:

✅ Backend log shows "Deep Research enabled"  
✅ AI response contains 7+ sources  
✅ Sources include Congress.gov bills  
✅ Citations appear as superscripts (¹ ² ³)  
✅ No error messages in browser console  

---

## 📞 Quick Reference

**Upload command:**
```bash
scp js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/version-b/js/chat-clean.js
```

**Deploy to production:**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

**Test URLs:**
- Version B (test): http://185.193.126.13:3002
- Version A (prod): http://185.193.126.13:3001

---

**Time to deploy:** ~2 minutes  
**Files to upload:** 1  
**Services to restart:** 0  
**Risk level:** Very Low ✅
