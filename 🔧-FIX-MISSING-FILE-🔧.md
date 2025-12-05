# 🔧 FIX: Missing article-search-service.js Upload

## ❌ CURRENT ISSUE

**Backend Data Mismatch**:
- 3 citations in text
- 4 sources from backend
- Source #4 score: **180** (should be ~30)

**Why**: Only `ai-service.js` was uploaded, but `article-search-service.js` (which has person-name bonus scoring) was not!

---

## 🎯 THE MISSING PIECE

v37.19.5/v37.19.6 requires **TWO files**:

1. ✅ `ai-service.js` - UPLOADED (anti-contradiction rules)
2. ❌ `article-search-service.js` - **MISSING** (person-name bonus scoring)

Without file #2, Source #4 gets score 180 instead of 30 → doesn't get filtered.

---

## ✅ QUICK FIX (1 FILE)

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.0/backend"

# Upload the missing file:
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js

# Restart:
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# Test again - should now see 3 sources total (Source #4 filtered)
```

---

## 📊 EXPECTED RESULTS AFTER FIX

**Before (current)**:
- 4 sources sent to AI
- Source #4 score: 180
- AI says: "Source ³ doesn't discuss policy and is excluded"
- Still self-contradictory

**After (with article-search-service.js)**:
- **3 sources** sent to AI (Source #4 filtered before AI sees it)
- Source #4 score: ~30 (filtered out at MIN_RELEVANCE_FOR_LLM = 60)
- **No mention of Source #4** in response
- Clean, no contradictions

---

## 📝 LESSON FOR FUTURE DEPLOYMENTS

**When deploying multi-file updates**:

1. ✅ Check documentation for which files changed
2. ✅ Upload ALL changed files BEFORE restarting service
3. ✅ v37.19.5/v37.19.6 = 2 files:
   - `ai-service.js`
   - `services/article-search-service.js`

**Don't restart service until all files uploaded!**

---

## 🎯 VERIFICATION

After uploading `article-search-service.js` and restarting:

**Test**: "What are Mamdani's policies?"

**Check console logs for**:
```
Sources received from backend: 3
Citation numbers: ["[1]", "[2]", "[3]"]
✅ Perfect match: 3 citations = 3 sources
```

**Should NOT see**:
- ❌ 4 sources
- ❌ "does not discuss" or "is excluded"
- ❌ Backend data mismatch

---

**Upload the missing file and test again!** 🚀
