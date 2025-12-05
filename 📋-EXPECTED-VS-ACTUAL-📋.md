# 📋 EXPECTED vs ACTUAL - Source Flow Analysis

## 🎯 EXPECTED FLOW (What SHOULD Happen)

### **Query**: "What are Mamdani's policies?"

1. **needsCurrentInfo()** → ✅ YES (matches "mamdani")
2. **searchAdditionalSources()** called
3. **isProgressiveCandidate** → ✅ YES (matches "mamdani")
4. **Strategy 1: Global RSS** → Finds ~10 sources (Democracy Now RSS)
5. **Strategy 6: Local Database** → `searchCandidate("mamdani", "policies", true)`
   - Local DB: 3 sources (score 200)
   - DuckDuckGo fallback: 7 sources (score 100)
   - Returns: 10 sources
6. **sources array** → 10 (RSS) + 10 (database) = **20 sources total**
7. **filterAndSortSources()** → Keep top 20
8. **MIN_RELEVANCE_FOR_LLM (60)** → Filter sources
9. **LLM receives** → 10-20 sources
10. **User sees** → 10-20 sources with detailed analysis

---

## ❌ ACTUAL FLOW (What's HAPPENING)

Based on the fact that you're seeing **only 3 sources**, here's what's likely happening:

### **Hypothesis A: RSS Sources Are Low Quality**
1. ✅ Global RSS finds ~10 sources
2. ✅ Local database finds 3 sources (score 200)
3. ✅ DuckDuckGo fallback activates, finds 7 sources (score 100)
4. ✅ Total: ~20 sources
5. ❌ **filterAndSortSources()** removes RSS sources (low relevance)
6. ❌ **Result**: Only database sources remain
7. ❌ **MIN_RELEVANCE_FOR_LLM** passes 3 database sources (200 > 60)
8. ❌ **But**: Filters out 7 DuckDuckGo sources if they have score < 60
9. ❌ **LLM receives**: 3 sources
10. ❌ **User sees**: 3 sources

### **Hypothesis B: searchCandidate Not Being Called**
1. ✅ Global RSS finds ~10 sources
2. ❌ **isProgressiveCandidate** → FALSE (regex not matching)
3. ❌ **searchCandidate** never called
4. ❌ **Only RSS sources** in sources array
5. ❌ **filterAndSortSources()** keeps top sources
6. ❌ **MIN_RELEVANCE_FOR_LLM** filters to 3 best sources
7. ❌ **User sees**: 3 sources

### **Hypothesis C: DuckDuckGo Fallback Not Activating**
1. ✅ Local database returns 3 sources
2. ❌ **useFallback** is still `undefined` or `false`
3. ❌ **DuckDuckGo never called**
4. ❌ **Only 3 local sources**
5. ✅ **MIN_RELEVANCE_FOR_LLM** passes all 3 (200 > 60)
6. ❌ **User sees**: 3 sources

---

## 🔍 DIAGNOSTIC QUESTIONS TO ANSWER

Run the diagnostic script to answer these questions:

### **Question 1**: Was Progressive candidate detected?
**Look for**: `"Progressive candidate detected"`
- **If YES**: Continue to Q2
- **If NO**: `isProgressiveCandidate` regex is failing → FIX NEEDED

### **Question 2**: Was local database search triggered?
**Look for**: `"Searching local article database"`
- **If YES**: Continue to Q3
- **If NO**: Code path not reached → FIX NEEDED

### **Question 3**: Was searchCandidate called?
**Look for**: `"Searching for candidate: \"Mamdani\""`
- **If YES**: Continue to Q4
- **If NO**: articleSearchService.searchCandidate() not executing → FIX NEEDED

### **Question 4**: What did local database return?
**Look for**: `"Local database returned: X sources"`
- **If X = 3**: Continue to Q5
- **If X = 0**: Database empty → NEED TO INDEX ARTICLES
- **If X = 10+**: Database has results, problem elsewhere

### **Question 5**: Did DuckDuckGo fallback activate?
**Look for**: `"Activating DuckDuckGo fallback"`
- **If YES**: Continue to Q6
- **If NO**: Fallback condition not met OR useFallback=false → FIX NEEDED

### **Question 6**: What scores did sources have?
**Look for**: `"Source relevance scores:"`
- Check if DuckDuckGo sources appear
- Check their scores (should be 100, not 50)
- **If scores < 60**: They'll be filtered out → FIX NEEDED

### **Question 7**: How many sources after MIN_RELEVANCE filter?
**Look for**: `"Providing X validated sources to LLM"`
- **If X = 3**: Only local database sources passed
- **If X = 10+**: Success!
- **If X = 0**: All sources filtered out → FIX NEEDED

---

## 🎯 MOST LIKELY ROOT CAUSES

Based on your symptoms (consistently 3 sources), ranked by probability:

### **#1: DuckDuckGo Fallback Still Not Activating** (80%)
- `useFallback` parameter still not working
- Fallback condition `localResults.length < 10` not met (maybe returns >10 but they're filtered later?)
- Try-catch silently catching error

### **#2: DuckDuckGo Sources Have Score < 60** (60%)
- v37.19.8.2 not deployed correctly
- Still using score: 50 instead of score: 100
- All DuckDuckGo sources filtered out by MIN_RELEVANCE

### **#3: RSS Sources Displacing Database Sources** (40%)
- RSS returns many sources
- filterAndSortSources() keeps RSS, discards database
- RSS sources then filtered by MIN_RELEVANCE to 3

### **#4: searchCandidate Not Being Called** (30%)
- `isProgressiveCandidate` regex not matching
- Code path not reached
- Only RSS sources being used

---

## 🚀 NEXT STEPS

1. **RUN THE DIAGNOSTIC SCRIPT** (`🚨-RUN-THIS-DIAGNOSTIC-🚨.sh`)
2. **Share the output** so we can see exactly where sources are lost
3. **Based on output**, we'll create targeted fix

Alternatively, run each diagnostic command individually:

```bash
# Q1: Progressive candidate detected?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Progressive candidate detected"'

# Q2: Local database search triggered?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Searching local article database"'

# Q3: searchCandidate called?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Searching for candidate"'

# Q4: Local database results?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Local database returned"'

# Q5: DuckDuckGo fallback activated?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Activating DuckDuckGo"'

# Q6: Source scores?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Source relevance scores" -A 15'

# Q7: Final source count?
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Providing.*validated sources"'
```

---

**Once we see the diagnostic output, we'll know exactly where to fix!** 🎯
