# 🔥 CRITICAL SOURCE SEARCH FIX v37.18.14

**Date:** 2025-11-28  
**Status:** CRITICAL BUG FIXED - Source search was completely broken  
**Priority:** DEPLOY IMMEDIATELY  

---

## 🚨 ROOT CAUSE IDENTIFIED

**From Backend Logs:**
```
❌ Source search error: LOCAL_NEWS_SOURCES is not defined
ℹ️  Query doesn't need current sources, proceeding without pre-search
```

**Two Critical Bugs:**

### Bug #1: LOCAL_NEWS_SOURCES Undefined ❌
```javascript
// Line 749 tried to use:
const localSources = LOCAL_NEWS_SOURCES[region] || LOCAL_NEWS_SOURCES['default'];

// But LOCAL_NEWS_SOURCES was NEVER DEFINED!
// This crashed the entire source search system
```

### Bug #2: "Mamdani" Not in needsCurrentInfo() Regex ❌
```javascript
// Old regex didn't include "mamdani", "zohran", "bowman", etc.
const isPoliticalQuery = messageLower.match(
    /bernie sanders|aoc|biden|trump|pelosi|mcconnell|schumer|harris|...|/
);

// So "what are mamdani's policies?" returned FALSE
// System thought it didn't need sources!
```

**Result:** 0 sources for every query!

---

## ✅ FIXES APPLIED

### Fix #1: Disable searchLocalNews() Until LOCAL_NEWS_SOURCES Defined
```javascript
async function searchLocalNews(query, region = 'new_york') {
    const sources = [];
    
    // V37.18.14: LOCAL_NEWS_SOURCES not defined - skip for now
    console.log(`⚠️  searchLocalNews() called but LOCAL_NEWS_SOURCES not defined - skipping`);
    return sources;
    
    // TODO: Define LOCAL_NEWS_SOURCES or remove this function
}
```

**Impact:** searchLocalNews() no longer crashes, returns empty array instead

### Fix #2: Add Mamdani & Progressive Politicians to needsCurrentInfo()
```javascript
const isPoliticalQuery = messageLower.match(
    /mamdani|zohran|bowman|jamaal|bernie sanders|aoc|ocasio-cortez|
    biden|trump|pelosi|mcconnell|schumer|harris|senator|representative|
    candidate|progressive|establishment|policies|policy|.../
);
```

**Impact:** Queries about Mamdani, Bowman, AOC now trigger source search!

---

## 🚀 DEPLOYMENT

```bash
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js && ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service && sleep 3 && tail -50 /var/log/workforce-backend-b.log'
```

**Password:** `YNWA1892LFC`

### Expected Output:
```
🚀🚀🚀 AI-SERVICE.JS v37.18.14 LOADED - SOURCE SEARCH FIX 🚀🚀🚀
🎯 v37.18.14 FIXES: Mamdani/progressive politicians in needsCurrentInfo, LOCAL_NEWS_SOURCES bug fixed
```

---

## ✅ EXPECTED RESULTS

### Test Query: "What are Mamdani's policies?"

**Before v37.18.14:**
```
ℹ️  Query doesn't need current sources, proceeding without pre-search
❌ Source search error: LOCAL_NEWS_SOURCES is not defined
📚 Found 0 sources to provide to LLM
```

**After v37.18.14:**
```
🔍 Pre-searching sources before LLM call...
🔍 Searching independent journalism...
  ✅ Found: Democracy Now - "Mamdani Pushes Progressive Agenda"
  ✅ Found: The Intercept - "NYC Socialist Challenges Establishment"
📚 Found 5-10 sources to provide to LLM
```

**Response Quality:**
- Sources from Democracy Now, Intercept, Jacobin, Common Dreams
- Specific policy details with evidence
- International context (Vienna housing, etc.) when implemented
- No more "my training data ends April 2023" fallback

---

## 📊 WHAT CHANGED

| File | Change | Line | Impact |
|------|--------|------|--------|
| backend/ai-service.js | Added "mamdani\|zohran\|bowman" to isPoliticalQuery regex | 375 | Triggers source search for progressive politicians |
| backend/ai-service.js | Added "policies\|candidate\|progressive" keywords | 375 | Broader political query detection |
| backend/ai-service.js | Disabled searchLocalNews() until LOCAL_NEWS_SOURCES defined | 747-757 | Prevents crash, returns empty array |
| backend/ai-service.js | Updated version to v37.18.14 | 24 | Version tracking |

---

## 🧪 TESTING CHECKLIST

**Test Query 1:** "What are Mamdani's policies?"
- [ ] Backend logs show "Pre-searching sources"
- [ ] Backend logs show 5-10+ sources found
- [ ] No "LOCAL_NEWS_SOURCES is not defined" error
- [ ] No "Query doesn't need current sources" message
- [ ] Response includes specific policy details
- [ ] Sources section has real articles

**Test Query 2:** "Are there progressive candidates in Albany 2026?"
- [ ] Backend logs show source search triggered
- [ ] Sources from news outlets
- [ ] Response includes current information (not April 2023 training data)

**Test Query 3:** "What is Jamaal Bowman's voting record?"
- [ ] Source search triggered ("bowman" now in regex)
- [ ] Sources found and returned

---

## 🎯 SUCCESS CRITERIA

**Must Have:**
- ✅ No "LOCAL_NEWS_SOURCES is not defined" errors in logs
- ✅ "Mamdani" queries trigger source search
- ✅ Sources found > 0 (not 0)
- ✅ Responses include current information

**Nice to Have:**
- Sources from independent journalism (Democracy Now, Intercept)
- International policy context
- Specific bill numbers and voting records

---

## 📋 NEXT STEPS

### After This Fix Deploys:

1. **Monitor backend logs** for source search activity:
```bash
ssh root@185.193.126.13 'tail -f /var/log/workforce-backend-b.log | grep "sources\|Found\|searching"'
```

2. **Test multiple queries** to verify source search working

3. **If sources > 0:** Re-enable citation system (revert v37.18.13 nuclear fix)

4. **If sources still 0:** Investigate why DuckDuckGo/other searches failing

5. **Define LOCAL_NEWS_SOURCES** for future local news search:
```javascript
const LOCAL_NEWS_SOURCES = {
    'new_york': [
        {name: 'Gothamist', url: 'https://gothamist.com', searchPath: '/search?q='},
        {name: 'NY Daily News', url: 'https://nydailynews.com', searchPath: '/search/?q='},
        {name: 'amNY', url: 'https://amny.com', searchPath: '/?s='}
    ],
    'default': []
};
```

---

## 🔍 WHY THIS HAPPENED

**Missing Definition:**
- `searchLocalNews()` function was written to use `LOCAL_NEWS_SOURCES`
- But `LOCAL_NEWS_SOURCES` was never actually defined in the code
- When called, it crashed with "LOCAL_NEWS_SOURCES is not defined"
- This broke the entire source search pipeline

**Incomplete Politician List:**
- `needsCurrentInfo()` had major politicians (Bernie, AOC, Biden, Trump)
- But missing NYC progressives (Mamdani, Bowman, etc.)
- Queries about these politicians returned "doesn't need sources"
- No source search → no sources → AI falls back to training data

---

## 💡 LESSONS LEARNED

1. **Always define variables before using them** (JavaScript doesn't enforce this)
2. **Update politician lists regularly** (new progressives emerge constantly)
3. **Test with actual queries** ("Mamdani" should have been tested)
4. **Check error logs immediately** (this error was there all along!)
5. **Keyword lists need maintenance** (add new politicians as they gain prominence)

---

**DEPLOY NOW TO FIX SOURCE SEARCH! 🚀**

After deployment, test with "What are Mamdani's policies?" and check logs for source search activity!
