# ⚡ Quick Start Guide for Next AI Assistant

**Session Date:** Nov 8, 2025  
**Status:** Source count fix 50% complete (iteration loop needed)  
**Time to Complete:** 10-15 minutes

---

## 🎯 Your Mission

Complete the source count fix by applying the iteration loop that failed to deploy.

**Current:** 4 sources per query  
**Target:** 10-15 sources per query  
**Blocker:** Iteration loop not applied (regex pattern mismatch)

---

## 📖 Read These First (In Order)

1. **HANDOVER-SESSION-NOV-08-2025.md** ← START HERE (14KB, 5 min read)
2. **NEXT-STEPS-FOR-AI.md** (8KB, 3 min read)
3. **SESSION-SUMMARY-NOV-08-2025.md** (6KB, 2 min read)

**Total reading time:** ~10 minutes

---

## ⚡ Quick Action Plan (5 Steps)

### Step 1: Read Actual Code (2 min)
```javascript
// Use AI Read tool
Read('backend/ai-service.js', offset: 1240, limit: 35)

// Look for "PHASE 1.25" comment
// Note the EXACT code structure
```

### Step 2: Apply Iteration Loop (3 min)
```javascript
// Use AI Edit tool
Edit('backend/ai-service.js',
  old_string: '[exact code from Step 1]',
  new_string: '[iteration loop from handover doc]'
)
```

**New code to insert:** See HANDOVER-SESSION-NOV-08-2025.md lines 74-116

### Step 3: Verify (1 min)
```javascript
// Check it worked
Grep(pattern: 'Starting iterative source search', path: 'backend')

// Should find the string in ai-service.js
```

### Step 4: User Restarts Backend (2 min)
Provide these commands for user:
```bash
pm2 stop backend && pm2 flush && pm2 delete backend && pkill -9 node
cd /var/www/workforce-democracy/backend
pm2 start server.js --name backend
pm2 logs backend --lines 50
```

### Step 5: Test & Verify (5 min)
User tests SNAP query:
- **Query:** "What are Republicans proposing for SNAP benefits?"
- **Expected:** 10-15 sources (not 4)
- **Logs should show:** Iteration messages

---

## ✅ Success Criteria

You'll know it worked when:

1. ✅ Grep finds "Starting iterative source search" in ai-service.js
2. ✅ Backend logs show:
   ```
   🔍 Starting iterative source search...
   🔄 Iteration 1: Have 2/12 sources
   🔄 Iteration 2: Have 6/12 sources
   🔄 Iteration 3: Have 11/12 sources
   ✅ Iterative search complete: 13 total sources
   ```
3. ✅ SNAP query returns 10-15 sources (not 4)

---

## 🚨 What NOT to Do

❌ Don't guess at code structure - READ IT FIRST  
❌ Don't use regex patterns - USE AI EDIT TOOL  
❌ Don't create new version files (V37.9.md)  
❌ Don't create emoji files (🚀-DEPLOY.md)  
❌ Don't skip verification - CHECK YOUR WORK

---

## ✅ What TO Do

✅ Read actual code with Read tool  
✅ Use Edit tool with exact strings  
✅ Verify with Grep or Read  
✅ Update handover docs when done  
✅ Mark task as complete

---

## 🔑 Critical Info

**Backend path:**
```
/var/www/workforce-democracy/backend/ai-service.js
```

**Lines to modify:** ~1245-1270 (the follow-up section)

**Constants already present:**
```javascript
// Lines 983-984
const SOURCE_THRESHOLD = 12;
const MAX_SEARCH_ITERATIONS = 4;
```

**What's working:**
- ✅ LLM generating specific data
- ✅ Article scraper working
- ✅ Constants applied
- ✅ Thresholds updated

**What's NOT working:**
- ❌ Iteration loop (still runs once, doesn't loop)

---

## 📊 Context Summary

**What happened Nov 8:**
1. Analyzed backend (identified 3 issues)
2. Created 6-change deployment script
3. User ran script successfully
4. 3/6 changes applied ✅
5. Iteration loop failed (regex mismatch) ❌
6. Created comprehensive handover docs ✅

**Why iteration loop failed:**
- Regex pattern assumed code structure
- Actual structure different (spacing/indentation)
- Pattern didn't match, change didn't apply

**How you'll succeed:**
- Read actual code first (don't assume)
- Use Edit tool with exact strings
- Verify immediately

---

## 💡 Pro Tips

1. **Read Before Editing**
   ```javascript
   Read('backend/ai-service.js', offset: 1245, limit: 30)
   // Copy the EXACT old code
   ```

2. **Edit With Exact Strings**
   ```javascript
   Edit('backend/ai-service.js',
     old_string: '[exact code from Read]',  // Include exact spacing!
     new_string: '[new iteration loop]'
   )
   ```

3. **Verify Immediately**
   ```javascript
   Grep(pattern: 'Starting iterative', path: 'backend')
   // Should return a line number
   ```

4. **Update Docs**
   - Change AI-HANDOVER-COMPLETE.md status to "✅ COMPLETED"
   - Update HANDOVER-SESSION-NOV-08-2025.md with results

---

## 🆘 If You Get Stuck

1. **Code doesn't match?**
   - Use Grep to find "PHASE 1.25"
   - Read more lines to get full context
   - Look for exact spacing/indentation

2. **Edit fails?**
   - Check old_string matches EXACTLY
   - Include all whitespace
   - Try reading the file again to see current state

3. **Can't find the code?**
   ```javascript
   Grep(pattern: 'PHASE 1.25', path: 'backend')
   Grep(pattern: 'analyzeSourceGaps', path: 'backend')
   Grep(pattern: 'followUpQueries', path: 'backend')
   ```

4. **Not sure what to do?**
   - Re-read HANDOVER-SESSION-NOV-08-2025.md
   - It has complete instructions and code

---

## 📞 After You're Done

### Update These Files:

1. **AI-HANDOVER-COMPLETE.md**
   - Change status from "⚠️ Partially Applied" to "✅ COMPLETED"

2. **HANDOVER-SESSION-NOV-08-2025.md**
   - Add "Completion Status" section
   - Document verification results

3. **This File** (QUICK-START-NEXT-AI.md)
   - Mark as "✅ COMPLETED" at top
   - Add completion date

---

## 🎯 Remember

**You're not starting from scratch!**

- ✅ Problem diagnosed
- ✅ Solution designed
- ✅ Half the fix already deployed
- ✅ Complete instructions ready

**You just need to apply ONE code change** (the iteration loop).

Everything else is documentation/verification.

---

## ⏱️ Time Budget

- **5 min:** Read handover docs
- **2 min:** Read actual code
- **3 min:** Apply iteration loop fix
- **1 min:** Verify with Grep
- **2 min:** Provide restart commands to user
- **5 min:** Wait for user to test
- **2 min:** Update documentation

**Total: ~20 minutes** (including user actions)

---

## 🎉 Expected Outcome

**Before your session:**
```
User query → 4 sources
```

**After your session:**
```
User query → 10-15 sources ✅
Backend logs show iterations ✅
User happy ✅
Documentation updated ✅
```

---

**You got this!** 🚀

The hard work (analysis, diagnosis) is done. You just need to complete one code change that didn't apply due to regex pattern mismatch.

**Key to success:** Read the actual code structure first, don't assume.

---

**Files to read:**
1. HANDOVER-SESSION-NOV-08-2025.md (complete context)
2. NEXT-STEPS-FOR-AI.md (detailed steps)
3. This file (quick reference)

**Good luck!** 💪
