# 🚀 Deploy v37.7.0 - Source Relevance Improvements

**Version**: v37.7.0  
**Date**: November 8, 2025  
**Status**: Ready to deploy  

---

## ✨ What's New in v37.7.0

### **Source Relevance Filtering**
The AI will now **intelligently filter sources** based on query topic, eliminating irrelevant articles like Boeing for SNAP queries.

**Key Features**:
1. **Topic-Specific Filtering**
   - SNAP queries: Heavy penalty (-200) for non-food/nutrition content
   - Boeing/aerospace articles: -150 penalty for SNAP queries
   - Welfare, labor, healthcare queries: Similar topic validation

2. **Domain Reputation Boost**
   - Independent progressive media: +75 score boost
   - Democracy Now, Truthout, Common Dreams prioritized
   - Total of 9 trusted domains boosted

3. **Freshness Scoring**
   - Last 7 days: +30 bonus
   - Last 30 days: +15 bonus
   - Last 90 days: +5 bonus

**Expected Result**: SNAP queries will NO LONGER return Boeing articles!

---

## 📦 What Was Changed

**File**: `backend/ai-service.js`

**New Functions Added** (before `searchAdditionalSources`):
1. `scoreSourceRelevance(source, query)` - Scores each source 0-300+
2. `filterAndSortSources(sources, query, maxResults)` - Filters and ranks sources

**Modified Function**:
- `searchAdditionalSources()` - Now calls `filterAndSortSources()` before returning

**Total Lines Added**: ~140 lines

---

## 🚀 Deployment Steps

### **Option 1: Manual Upload** (RECOMMENDED)

1. **Download the modified file**:
   ```bash
   # From this project directory
   # File is already modified: backend/ai-service.js
   ```

2. **Upload to VPS**:
   ```bash
   # Using SCP
   scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js
   ```

3. **SSH to VPS and restart PM2**:
   ```bash
   ssh root@185.193.126.13
   cd /var/www/workforce-democracy/backend
   pm2 restart backend
   pm2 logs backend --lines 50
   ```

---

### **Option 2: Direct Copy-Paste** (If SCP not available)

1. **SSH to VPS**:
   ```bash
   ssh root@185.193.126.13
   cd /var/www/workforce-democracy/backend
   ```

2. **Create backup**:
   ```bash
   cp ai-service.js ai-service-BACKUP-v37.6.0-$(date +%Y%m%d).js
   ```

3. **Edit the file**:
   ```bash
   nano ai-service.js
   ```

4. **Find line ~870** (search for `async function searchAdditionalSources`)

5. **Insert the two new functions** BEFORE `searchAdditionalSources`:
   - See `backend/ai-service.js` lines 870-1012 for the exact code
   - Functions: `scoreSourceRelevance()` and `filterAndSortSources()`

6. **Modify the return statement** in `searchAdditionalSources`:
   - Find the `return sources;` at the end of the function
   - Replace with the filtered return (see lines 1105-1112)

7. **Save and exit** (Ctrl+X, Y, Enter)

8. **Restart PM2**:
   ```bash
   pm2 restart backend
   pm2 logs backend --lines 50
   ```

---

## 🧪 Testing v37.7.0

### **Test Query**:
```
"What happens if SNAP benefits are cut?"
```

### **Expected Backend Logs**:
```
🔍 Pre-searching sources before LLM call...
🌍 Using global RSS/API sources
✅ Found 10 total sources...
📊 Scoring 10 sources for relevance...
  ⚠️  "Boeing announces..." - Not SNAP-related (-200)
  ⚠️  "Tech industry..." - Unrelated industry (-150)
  ✅ Kept 3/10 sources (removed 7 irrelevant)
  🏆 Top sources:
     1. Truthout [TRUSTED]: "SNAP cuts would devastate..."
     2. Common Dreams [TRUSTED]: "Food insecurity rises..."
     3. The Guardian: "Federal benefits under threat..."
  🎯 Returning 3 relevant sources
✅ Providing 3 validated sources to LLM
```

### **What Changed From Before**:
- **Before**: 10 sources including Boeing article
- **After**: 3 highly relevant sources, Boeing filtered out
- **Trusted sources**: Ranked at top with [TRUSTED] marker

---

## 🔍 Verify Deployment

### **Check for v37.7.0 markers**:
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
grep -n "V37.7.0" ai-service.js
```

**Expected output**:
```
871: * V37.7.0: Score source relevance based on query topic
995: * V37.7.0: Filter and sort sources by relevance
1105:    // V37.7.0: Filter and sort by relevance
```

### **Check function existence**:
```bash
grep "function scoreSourceRelevance" ai-service.js
grep "function filterAndSortSources" ai-service.js
```

Both should return results.

---

## 📊 Implementation Details

### **Scoring Algorithm**:

**Base Score**: 100 points

**Topic Penalties**:
- No SNAP/food mention for SNAP query: -200
- Boeing/aerospace for SNAP query: -150
- No welfare mention for welfare query: -150
- No labor mention for labor query: -150
- No health mention for healthcare query: -150

**Domain Boosts**:
- Trusted domain (Democracy Now, etc.): +75
- SNAP in title for SNAP query: +50

**Freshness Boosts**:
- Last 7 days: +30
- Last 30 days: +15
- Last 90 days: +5

**Filtering**:
- Sources with score ≤ 0 are removed
- Remaining sources sorted by score (highest first)
- Top 10 sources returned

---

## 🐛 Troubleshooting

### **Problem**: PM2 won't restart
```bash
pm2 stop backend
pm2 delete backend
pm2 start server.js --name backend
```

### **Problem**: Syntax error after edit
```bash
# Restore backup
cp ai-service-BACKUP-v37.6.0-*.js ai-service.js
pm2 restart backend

# Try again more carefully
```

### **Problem**: Functions not being called
```bash
# Check logs for scoreSourceRelevance calls
pm2 logs backend --lines 200 | grep "📊 Scoring"

# If missing, check function placement
grep -n "scoreSourceRelevance" ai-service.js
grep -n "filterAndSortSources" ai-service.js
```

### **Problem**: Still getting Boeing articles
```bash
# Check if filtering is active
pm2 logs backend --lines 200 | grep "⚠️"

# Should see penalty messages like:
#   ⚠️  "Boeing..." - Not SNAP-related (-200)
```

---

## ✅ Success Criteria

**v37.7.0 is successfully deployed when**:
1. ✅ Backend logs show `📊 Scoring N sources for relevance...`
2. ✅ Backend logs show `✅ Kept X/Y sources (removed Z irrelevant)`
3. ✅ Backend logs show `🏆 Top sources:`
4. ✅ SNAP query returns NO Boeing articles
5. ✅ Trusted sources (Democracy Now, Truthout) appear at top
6. ✅ All sources are relevant to the query topic

---

## 📚 Next Steps After Deployment

1. **Test with multiple queries**:
   - "What happens if SNAP benefits are cut?"
   - "Medicare for all"
   - "Union strikes"
   - "Healthcare costs"

2. **Monitor logs** for irrelevant sources:
   ```bash
   pm2 logs backend --lines 0
   # Then ask various questions in the chat
   ```

3. **Fine-tune penalties** if needed:
   - Edit scoreSourceRelevance() function
   - Adjust penalty values (-200, -150, etc.)
   - Restart PM2

4. **Move to next feature**:
   - Analytical frameworks (deeper analysis)
   - Generic phrase removal
   - Economic impact data

---

**Ready to deploy? Follow the steps above!** 🚀

**Need help? Check the troubleshooting section or restore from backup.**
