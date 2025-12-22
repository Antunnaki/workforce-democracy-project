# 🔍 DIAGNOSIS: v37.19.7 - Why Only 3 Sources?

**Date**: 2025-12-01  
**Version Deployed**: v37.19.7  
**Expected**: 10-20+ sources  
**Actual**: 3 sources  
**Status**: ❌ **INVESTIGATION REQUIRED**

---

## 📊 OBSERVED BEHAVIOR

### **Test Query**: "What are Mamdani's policies?"

**Console Logs Show**:
- ✅ Job submitted successfully
- ✅ Processing completed (11.8 seconds)
- ✅ 3 sources returned from backend
- ✅ 3 citations in text
- ✅ Perfect citation match (3 = 3)

**Sources Received**:
1. "The Historic Rise of Zohran Mamdani" - Democracy Now (Nov 28, 2025) - Score: 200
2. "Mamdani's Affordability Agenda" - Democracy Now (Nov 26, 2025) - Score: 200
3. "From Affordability to Genocide, Trump-Mamdani Meeting" - Democracy Now (Nov 24, 2025) - Score: 200

**All sources**:
- ✅ Mention "Mamdani" explicitly (relevance scoring working correctly)
- ✅ From trusted source (Democracy Now)
- ✅ Perfect relevance scores (200)
- ❌ ALL from same source (Democracy Now only)
- ❌ Only 3 total sources (expected 10-20+)

---

## 🔬 ROOT CAUSE HYPOTHESES

### **Hypothesis 1: Database Has Limited Mamdani Articles**
**Likelihood**: 🔴 **VERY HIGH**

**Evidence**:
- Only 3 sources returned despite search limit of 100
- All sources are from Democracy Now (no The Intercept, Jacobin, ProPublica, etc.)
- All sources are very recent (Nov 24-28, 2025)
- All have perfect relevance scores (200) = these are the ONLY matches

**Probable Cause**: The MongoDB article database was pre-indexed with limited articles. When searching for "Mamdani policies", the system finds all available articles (3), but there simply aren't more in the database.

**Test**: We need to check how many articles are in the database total, and how many mention "Mamdani"

### **Hypothesis 2: Search Query Is Too Specific**
**Likelihood**: 🟡 **MEDIUM**

**Evidence**:
- Search query: "Mamdani policies"
- This requires both "Mamdani" AND "policies" to appear
- May be filtering out articles that mention Mamdani but don't use the word "policies"

**Probable Cause**: The search may be too narrow. Articles about Mamdani's "platform", "agenda", "proposals", "positions" might be excluded because they don't contain "policies"

**Test**: Try broader search terms like just "Mamdani" or "Mamdani platform agenda proposals"

### **Hypothesis 3: Article Scraping/Indexing Stopped Early**
**Likelihood**: 🟡 **MEDIUM**

**Evidence**:
- v37.19.0 introduced MongoDB pre-indexing
- System switched from DuckDuckGo (slow, 100% timeout) to local database
- Database may have been seeded with limited articles initially

**Probable Cause**: The article indexing job may have:
- Only run once with limited results
- Only indexed Democracy Now (not other sources)
- Stopped before completing full indexing

**Test**: Check when articles were indexed, how many total articles exist, breakdown by source

### **Hypothesis 4: Person-Name Filtering Too Aggressive**
**Likelihood**: 🟢 **LOW**

**Evidence**:
- All 3 sources correctly mention "Mamdani" (scores = 200)
- Person-name bonus is working as intended
- No false positives (no irrelevant sources)

**Probable Cause**: NOT the issue - filtering is working correctly, just not enough articles to filter

---

## 🧪 DIAGNOSTIC QUERIES NEEDED

To identify the exact problem, we need to run these queries on the server:

### **Query 1: Total Articles in Database**
```bash
ssh root@185.193.126.13
mongosh workforce_democracy
db.articles.countDocuments()
# Expected: Thousands of articles
# If <100: Database not properly indexed
```

### **Query 2: Articles Mentioning "Mamdani"**
```bash
db.articles.find({ $text: { $search: "Mamdani" } }).count()
# Expected: 10-50 articles
# If = 3: Database only has 3 Mamdani articles (problem confirmed)
```

### **Query 3: Articles by Source**
```bash
db.articles.aggregate([
    { $group: { _id: "$source", count: { $sum: 1 } } },
    { $sort: { count: -1 } }
])
# Expected: Democracy Now, The Intercept, Jacobin, ProPublica, etc.
# If only Democracy Now: Other sources not indexed
```

### **Query 4: Recent Articles About Mamdani**
```bash
db.articles.find({ 
    $text: { $search: "Mamdani" },
    publishedDate: { $gte: new Date('2020-01-01') }
}).sort({ publishedDate: -1 }).limit(20)
# Shows all Mamdani articles available
```

### **Query 5: Articles With Different Keywords**
```bash
# Try broader search
db.articles.find({ $text: { $search: "Mamdani platform" } }).count()
db.articles.find({ $text: { $search: "Mamdani housing" } }).count()
db.articles.find({ $text: { $search: "Mamdani agenda" } }).count()
# See if using "policies" is too narrow
```

---

## 🎯 LIKELY PROBLEMS & SOLUTIONS

### **Problem 1: Database Needs More Articles** (Most Likely)
**If**: Total articles in DB < 1000 or Mamdani articles = 3

**Solution**: Implement article scraping/indexing system
- Add article scraper for Democracy Now, The Intercept, Jacobin, ProPublica, etc.
- Index historical articles (2020-2025)
- Run regular updates to keep database fresh

**Files Needed**:
- `backend/services/article-scraper.js` (new)
- `backend/jobs/index-articles.js` (new)
- Cron job to run daily/weekly

### **Problem 2: Search Query Too Narrow**
**If**: "Mamdani" returns 20+ articles but "Mamdani policies" returns 3

**Solution**: Broaden search terms in AI service
- Search for "Mamdani" + any policy-related word
- Use synonym expansion: "policies OR platform OR agenda OR proposals OR positions"
- Weight by relevance, not require exact match

**File to Update**: `backend/ai-service.js` (searchCandidate function)

### **Problem 3: Only Democracy Now Indexed**
**If**: All articles are from Democracy Now only

**Solution**: Add scrapers for other sources
- The Intercept
- Jacobin
- ProPublica
- Common Dreams
- Truthout
- Congress.gov (for voting records)

### **Problem 4: AI Prompt Needs Strengthening**
**Even with limited sources, AI should extract MORE detail**

**Current Issue**: AI response is superficial
- "affordability and grassroots engagement" (generic)
- "expanding rent control and addressing housing costs" (vague)
- "For deeper analysis... would be necessary" (cop-out)

**Solution**: Update AI prompt to:
- Extract SPECIFIC details from each source
- Quote exact proposals/policies
- Synthesize information across sources
- Never use weak endings like "would be necessary"

---

## 🚀 IMMEDIATE ACTION PLAN

### **Step 1: Diagnose Database** (Now)
Run diagnostic queries above to confirm database size and Mamdani article count

### **Step 2: If Database Is Limited** (Expected)
- Option A: Implement article scraper to populate database
- Option B: Fall back to DuckDuckGo for candidates with <10 local articles
- Option C: Hybrid approach (local database + DuckDuckGo fallback)

### **Step 3: Improve AI Prompt** (Quick Win)
Even with 3 sources, AI should produce better analysis:
- Extract ALL specific policies mentioned
- Quote exact statements
- Provide concrete details
- Never use generic summaries

### **Step 4: Add Source Diversity**
- Implement multi-source scraping
- Priority: The Intercept, Jacobin, ProPublica
- Include campaign websites, official statements

---

## 💡 RECOMMENDATIONS

### **Short-Term (Today)**:
1. **Run diagnostic queries** to confirm database size
2. **Strengthen AI prompt** to extract more detail from available sources
3. **Add DuckDuckGo fallback** if local database returns <10 sources

### **Medium-Term (This Week)**:
1. **Implement article scraper** for Democracy Now, The Intercept, Jacobin
2. **Index historical articles** (2020-2025)
3. **Add campaign website scraper** for official policy platforms

### **Long-Term (Next Month)**:
1. **Full multi-source architecture**:
   - Congress.gov (voting records)
   - State legislature APIs (state reps)
   - Ballotpedia (candidate info)
   - Campaign websites (promises)
   - Independent journalism (analysis)
2. **Promise vs. Reality tracker** (compare promises to votes)
3. **Real-time updates** (daily scraping jobs)

---

## 🎯 NEXT STEPS

**For User**:
1. Can you run the diagnostic queries above on the server?
2. This will tell us exactly how many articles are in the database
3. Then we can determine the right solution:
   - If DB is limited → Build article scraper
   - If search is too narrow → Broaden query terms
   - If prompt is weak → Strengthen AI instructions

**For AI Assistant**:
1. Await diagnostic results
2. Implement appropriate solution based on findings
3. Consider hybrid approach (local DB + DuckDuckGo fallback)

---

## 📊 CURRENT STATUS

- ✅ v37.19.7 deployed successfully
- ✅ Person-name filtering working correctly
- ✅ Citation accuracy 100%
- ✅ No hallucinations or contradictions
- ❌ Only 3 sources (expected 10-20+)
- ❌ Analysis quality weak/superficial
- ⏳ Database diagnostics needed
- ⏳ Solution pending diagnosis results

---

**The good news**: The code is working correctly!  
**The bad news**: The database likely doesn't have enough articles.  
**The solution**: Implement article scraping system to populate database.

Would you like me to:
1. Help you run the diagnostic queries?
2. Build an article scraper system?
3. Implement a DuckDuckGo fallback for limited sources?
4. Strengthen the AI prompt for better analysis?

All of the above? 🚀
