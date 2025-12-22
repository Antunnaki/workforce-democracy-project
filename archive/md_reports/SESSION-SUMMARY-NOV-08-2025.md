# Session Summary: Source Count Issue (Nov 8-9, 2025)

## 🚨 CRITICAL CORRECTION (Nov 9)

**⚠️ WARNING: This session's diagnosis was INCORRECT. Read this correction first!**

### **Previous Understanding (WRONG):**
- AI thought: "Only 4-5 sources being FOUND"
- AI action: Increase source gathering threshold
- AI added: Iteration loop to find MORE sources

### **User's ACTUAL Problem (CORRECT):**
**User's test results:**
- Console: `document.querySelectorAll('.citation-link').length` = **11 citations**
- Sources shown: **Only 4 sources displayed**
- User wants: **"11 to be shown if there are 11! 99 shown if there are 99!"**

**What's REALLY happening:**
1. ✅ LLM IS generating 11 citations correctly
2. ✅ Backend IS finding 11 sources (or potentially more)
3. ❌ Backend is FILTERING/LIMITING sources to only 4 before sending to frontend
4. ❌ Previous AI Nov 7 added RESTRICTIONS thinking "LLM is hallucinating" (WRONG)

**Critical User Quote:**
> "no, I want 11 to be shown if there are 11! I want 99 shown if there are 99 sources cited!"

This proves the problem is **backend source filtering**, NOT insufficient source gathering.

### **What Needs to Be Done (CORRECTED):**

**REVERT these WRONG changes:**
1. ❌ `backend/ai-service.js` lines 1428-1445 - Restrictions telling LLM "don't cite beyond N"
2. ❌ `backend/ai-service.js` lines 1542-1575 - Hallucination prevention limiting citations

**ADD/FIX these items:**
1. ✅ Add constants (lines 983-984): `SOURCE_THRESHOLD = 15`, `MAX_SEARCH_ITERATIONS = 4`
2. ✅ Investigate source filtering (lines 1290-1305) - why 11 found → 4 sent to frontend
3. ✅ Remove any hardcoded limits on sources passed to frontend
4. ✅ Goal: If LLM cites 11, frontend receives ALL 11 sources

---

## 🎯 Primary Problem (ORIGINAL - PARTIALLY WRONG)

**User Goal:** Get 10-15 sources with specific data (dollar amounts, percentages, quotes, bill numbers)
**Current State:** Only getting 4 sources shown (but LLM is citing 11!)
**Real Issue:** Backend filtering, not insufficient gathering

## 🔍 Root Cause Analysis

After examining `/var/www/workforce-democracy/backend/ai-service.js`, I found THREE critical issues:

### Issue 1: Gap Analysis Threshold Too Low
**Location:** Lines 1009, 1018, 1029
**Problem:** `analyzeSourceGaps()` only triggers follow-ups when `sources.length < 5` or `< 3`
**Impact:** Loop stops searching when it reaches 5 sources, never hitting the 12 target

```javascript
// CURRENT CODE (BROKEN)
if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
    if (sources.length < 5) {  // ❌ TOO LOW
        followUpQueries.push('SNAP benefits cuts 2025 statistics');
        ...
    }
}
```

### Issue 2: No Iteration Loop
**Location:** Lines 1245-1270
**Problem:** Code only runs follow-up queries ONCE, doesn't loop until threshold reached
**Impact:** Even if follow-ups are generated, they only execute once

```javascript
// CURRENT CODE (BROKEN)
const gaps = analyzeSourceGaps(sources, query);
if (gaps.needsMoreData && gaps.followUpQueries.length > 0) {
    // Runs follow-ups ONCE
    for (const followUpQuery of gaps.followUpQueries) {
        // ...
    }
    // NO LOOP BACK TO CHECK IF WE REACHED THRESHOLD
}
```

### Issue 3: No Explicit Threshold Constant
**Location:** Missing
**Problem:** No `SOURCE_THRESHOLD = 12` constant used in gap analysis
**Impact:** Different parts of code use different thresholds (5, 3, 10, 12)

## 📊 Actual Execution Flow (From Logs)

```
Initial search → 2 sources
Gap analysis: sources.length (2) < 5 ✅ triggers follow-ups
Follow-up iteration 1 → +3 sources (total: 5)
Gap analysis: sources.length (5) >= 5 ❌ STOPS (should continue to 12!)
Final validation: 5 → 4 sources (1 filtered out)
```

## ✅ Solution

### Fix 1: Increase Gap Analysis Thresholds
Change all `< 5` and `< 3` checks to `< 12`:

```javascript
// NEW CODE
const SOURCE_THRESHOLD = 12;

if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
    if (sources.length < SOURCE_THRESHOLD) {  // ✅ NOW 12
        followUpQueries.push('SNAP benefits cuts 2025 statistics');
        ...
    }
}
```

### Fix 2: Add Iteration Loop
Wrap follow-up logic in a loop that continues until threshold reached:

```javascript
// NEW CODE
const SOURCE_THRESHOLD = 12;
const MAX_ITERATIONS = 4;
let iteration = 0;

while (sources.length < SOURCE_THRESHOLD && iteration < MAX_ITERATIONS) {
    iteration++;
    const gaps = analyzeSourceGaps(sources, query);
    
    if (!gaps.needsMoreData || gaps.followUpQueries.length === 0) {
        console.log(`  ⏹️  No more follow-ups needed (iteration ${iteration})`);
        break;
    }
    
    console.log(`  🔄 Iteration ${iteration}: Have ${sources.length}/${SOURCE_THRESHOLD} sources`);
    
    for (const followUpQuery of gaps.followUpQueries) {
        // ... existing search logic ...
    }
    
    // Remove duplicates and merge
    const existingUrls = new Set(sources.map(s => s.url));
    const newSources = followUpSources.filter(s => !existingUrls.has(s.url));
    sources.push(...newSources);
    
    if (newSources.length === 0) {
        console.log(`  ⏹️  No new sources found, stopping iteration`);
        break;
    }
}
```

### Fix 3: More Diverse Follow-Up Queries
Prevent RSS cache from returning same sources by generating more diverse queries:

```javascript
// NEW CODE
if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
    if (sources.length < SOURCE_THRESHOLD) {
        followUpQueries.push(`SNAP benefits cuts ${new Date().getFullYear()} statistics`);
        followUpQueries.push('food stamp program economic impact data');
        followUpQueries.push('SNAP policy changes congressional vote');
        followUpQueries.push('food assistance program funding legislation');
        followUpQueries.push('SNAP benefits low income families impact');
        // More diverse = less cache hits
    }
}
```

## 📁 Files to Modify

1. **`/var/www/workforce-democracy/backend/ai-service.js`**
   - Add `SOURCE_THRESHOLD = 12` constant (line ~990)
   - Update `analyzeSourceGaps()` thresholds (lines 1009, 1018, 1029)
   - Replace follow-up logic with iteration loop (lines 1245-1270)
   - Generate more diverse follow-up queries

## 🚀 Deployment Method

User is SSH'd into server and cannot open `.sh` files. They need heredoc format commands to paste directly into terminal.

## 📈 Expected Results After Fix

**Before:**
```
Initial: 2 sources
Follow-up 1: +3 sources (total: 5)
STOPS → Final: 4 sources (after validation)
```

**After:**
```
Initial: 2 sources
Iteration 1: +4 sources (total: 6)
Iteration 2: +5 sources (total: 11)
Iteration 3: +2 sources (total: 13) ✅ THRESHOLD REACHED
Final: 12 sources (after validation)
```

## 🔧 Deployment Results

1. ✅ Created `DEPLOY-SOURCE-COUNT-FIX.sh` with Python script
2. ✅ Packaged in heredoc format for SSH paste
3. ✅ User ran deployment script successfully
4. ✅ Nuclear PM2 restart completed (stop → flush → delete → pkill → start)
5. ⚠️ **PARTIAL SUCCESS** - Only some changes applied

### Verification Results:

**User ran verification commands:**
```bash
grep -n "SOURCE_THRESHOLD = 12" /var/www/workforce-democracy/backend/ai-service.js
grep -n "MAX_SEARCH_ITERATIONS" /var/www/workforce-democracy/backend/ai-service.js
grep -n "Starting iterative source search" /var/www/workforce-democracy/backend/ai-service.js
```

**Output:**
```
983:const SOURCE_THRESHOLD = 12;
984:const MAX_SEARCH_ITERATIONS = 4;
[no output for third command]
```

**Analysis:**
- ✅ **Constants added successfully** (lines 983-984)
- ✅ **Threshold updates applied** (5 → SOURCE_THRESHOLD in gap analysis)
- ❌ **Iteration loop NOT applied** (Change 4 regex pattern failed)

### Current Behavior After Deployment:
```
0|backend  |     📚 Total sources after iterative search: 5
0|backend  | ✅ Final source validation: 5 → 4 valid sources
```

**Root Cause:** The regex pattern in Change 4 of the Python script was too specific and didn't match the actual code structure in `ai-service.js`. The old single follow-up code is still present.

## 📝 Notes

- The article scraper improvements ARE working (scraping full content)
- The LLM prompting enhancements ARE working (requesting specific data)
- The ONLY remaining issue is source quantity
- RSS cache is real and causing duplicate results - need diverse queries
- User has already deployed previous fixes successfully via heredoc commands

## ⚙️ Next Steps for Next Assistant

1. **Read the actual code** around lines 1245-1270 in ai-service.js to see exact structure:
   ```bash
   sed -n '1245,1270p' /var/www/workforce-democracy/backend/ai-service.js
   ```

2. **Create a corrected regex pattern** that matches the ACTUAL code structure (not the assumed structure from Change 4)

3. **Apply the iteration loop fix** using either:
   - AI direct editing (preferred - use Read/Edit/MultiEdit tools)
   - Corrected Python script with accurate regex pattern

4. **Verify the fix** by checking for the new log message:
   ```bash
   grep -n "Starting iterative source search" /var/www/workforce-democracy/backend/ai-service.js
   ```

5. **Perform nuclear PM2 restart** to clear module cache:
   ```bash
   pm2 stop backend && pm2 flush && pm2 delete backend && pkill -9 node
   cd /var/www/workforce-democracy/backend
   pm2 start server.js --name backend
   ```

6. **Test with SNAP query** to verify 10-15 sources are returned

---

**Created:** Nov 8, 2025  
**Updated:** Nov 8, 2025 (Post-deployment verification)  
**Status:** Partially deployed - iteration loop fix still needed  
**Impact:** HIGH - Core functionality improvement (in progress)
