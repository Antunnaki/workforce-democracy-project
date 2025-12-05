# 🚀 QUICK DEPLOYMENT REFERENCE

## 📦 WHAT WAS FIXED (v37.8.1)

**Problem**: Iteration loop stopped at 5 sources instead of continuing to 25

**Root Cause**: `analyzeSourceGaps()` had hardcoded thresholds (`< 5`, `< 3`)

**Solution**: Updated all 3 thresholds to use `SOURCE_THRESHOLD` constant (25)

---

## 🎯 ONE-COMMAND DEPLOYMENT

### Step 1: Open deployment file
```bash
# File location in this chat:
DEPLOY-GAP-ANALYSIS-FIX.txt
```

### Step 2: Copy entire heredoc block
- Starts with: `cat > /tmp/deploy-gap-fix.sh << 'HEREDOC_EOF'`
- Ends with: `/tmp/deploy-gap-fix.sh`

### Step 3: SSH to server
```bash
ssh root@185.193.126.13
```

### Step 4: Paste and run
- Paste the copied block
- Press Enter
- Wait for "✅ DEPLOYMENT COMPLETE!"

---

## 🧪 QUICK TEST

### Browser Console:
```javascript
// Count citations in console
document.querySelectorAll('.citation-link').length

// Should be 10-25 instead of 4
```

### Backend Logs:
```bash
pm2 logs news-backend --lines 50

# Look for:
# 🔄 Iteration 1: Have X/25 sources
# 🔄 Iteration 2: Have X/25 sources
# ✅ Iterative search complete: X total sources
```

---

## 📊 EXPECTED RESULTS

### Before Fix:
- 4-5 sources
- Iteration stops at "Have 5/12 sources"
- "⏹️ No more follow-ups available"

### After Fix:
- 10-25 sources (depending on cache)
- Iterations continue: "Have 8/25", "Have 15/25", etc.
- Stops at SOURCE_THRESHOLD or MAX_ITERATIONS

---

## 🔧 CHANGES APPLIED

**File**: `backend/ai-service.js`

1. Line 1013: `< 5` → `< SOURCE_THRESHOLD`
2. Line 1022: `< 5` → `< SOURCE_THRESHOLD`
3. Line 1033: `< 3` → `< SOURCE_THRESHOLD`

**Constant Used**: `SOURCE_THRESHOLD = 25`

---

## ⚠️ KNOWN ISSUE

**RSS Cache**: May return duplicate sources, resulting in fewer unique sources after deduplication.

**Solution**: Wait 1 hour for cache expiry or test with diverse queries.

---

## 📁 FILES CREATED

1. ✅ `DEPLOY-GAP-ANALYSIS-FIX.txt` - Deployment script (heredoc format)
2. ✅ `SESSION-SUMMARY-NOV-09-GAP-FIX.md` - Full technical summary
3. ✅ `QUICK-DEPLOY-REFERENCE.md` - This file
4. ✅ Updated `PROJECT_MASTER_GUIDE.md` - Version 37.8.1

---

## 🎯 USER ACTION REQUIRED

1. ✅ Open `DEPLOY-GAP-ANALYSIS-FIX.txt`
2. ✅ Copy heredoc block
3. ✅ SSH to server
4. ✅ Paste and run
5. ✅ Test with query: "SNAP benefits 2025 cuts"
6. ✅ Report citation count vs sources displayed

---

**Ready to Deploy!** 🚀
