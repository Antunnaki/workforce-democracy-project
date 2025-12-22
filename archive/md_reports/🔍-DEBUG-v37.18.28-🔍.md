# 🔍 DEBUG REQUEST - v37.18.28

## 🚨 ISSUE

**Deployed:** v37.18.28 with progressive candidate detection  
**Result:** Still only **1 source** (Democracy Now)  
**Expected:** 10-20+ sources

**Log evidence:**
```
✅ AI response: "... His platform includes: ... ¹"
✅ Returning 1 sources (same as provided to LLM)
```

**Missing log line:** `📌 Progressive candidate detected`

---

## 🔎 DIAGNOSTIC NEEDED

Please run this command to get **full backend logs** for the "mamdani" query:

```bash
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep -B 10 -A 30 "what are mamdani"'
```

**Password:** `YNWA1892LFC`

---

## 🎯 WHAT WE'RE LOOKING FOR

1. **Does `needsCurrentInfo()` return true?**
   ```
   🔍 Pre-searching sources before LLM call...
   ```

2. **Does progressive detection trigger?**
   ```
   📌 Progressive candidate detected - prioritizing Democracy Now, Intercept, Drop Site
   ```

3. **What does `searchAdditionalSources()` return?**
   ```
   📚 Found X sources to provide to LLM
   ```

4. **Are sources being filtered out?**
   ```
   ✅ Filtered to X relevant sources (threshold: 10)
   ```

5. **What's the relevance scoring?**
   ```
   📊 Article relevance: Title="..." Score=XX
   ```

---

## 🤔 HYPOTHESIS

I suspect one of these is happening:

### Hypothesis 1: Progressive detection not triggering
- Query is "what are mamdani's policies" (lowercase 'mamdani')
- Regex checks for `/mamdani|aoc|.../` (lowercase match should work)
- But maybe it's being called on a modified query?

### Hypothesis 2: Sources found but filtered out
- System finds 10-20 sources
- Relevance scoring filters them to < 10 threshold
- Only 1 source passes

### Hypothesis 3: RSS service returning empty
- `getGlobalNewsSources()` is called
- But RSS feeds are empty/broken
- Only 1 source from fallback DuckDuckGo

### Hypothesis 4: Search not running at all
- `needsCurrentInfo()` returns FALSE for some reason
- No search happens
- 1 source comes from somewhere else (curated list?)

---

## 📊 EXPECTED FULL LOG FLOW

**Correct flow should be:**

```
🤖 AI Query: "what are mamdani's policies?..." 
🔍 Pre-searching sources before LLM call...
🌍 Using global RSS/API sources
  📌 Progressive candidate detected - prioritizing Democracy Now, Intercept, Drop Site
📰 Fetching Democracy Now RSS feed...
📰 Fetching The Intercept RSS feed...
📰 Fetching Drop Site News RSS feed...
✅ Found 15 articles from Democracy Now
✅ Found 8 articles from The Intercept
✅ Found 5 articles from Drop Site
📊 Scoring 28 articles for relevance...
✅ Filtered to 20 relevant sources (threshold: 10)
🔍 Starting iterative source search...
  🔄 Iteration 1: Have 20/25 sources
  ⏹️ No more follow-ups needed (threshold met)
✅ Iterative search complete: 20 total sources (1 iterations)
🤖 Providing 20 sources to LLM
✅ AI response: "... [1] ... [2] ... [15]"
✅ Returning 20 sources (same as provided to LLM)
```

**But we're seeing:**
```
🤖 AI Query: "what are mamdani's policies?..." 
✅ Returning 1 sources (same as provided to LLM)
```

**Missing:** All the search logs!

---

## 🎯 ACTION REQUIRED

Run the diagnostic command above and paste the **full output** so I can see:
1. What search functions are being called
2. What sources are being found
3. Where they're getting filtered/lost

This will tell us exactly where the bug is!
