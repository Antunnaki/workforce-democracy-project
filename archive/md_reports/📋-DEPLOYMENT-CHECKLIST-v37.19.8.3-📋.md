# 📋 DEPLOYMENT CHECKLIST v37.19.8.3 📋

Use this checklist to ensure proper deployment and verification.

---

## ☐ Pre-Deployment (Verify Problem Exists)

### 1. Check Current Server Version
```bash
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "AI-SERVICE.JS v37"'
```
- [ ] Confirm shows `v37.19.8.1` (not v37.19.8.3)

### 2. Verify Bug #1 Exists (getCacheStats Error)
```bash
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "getCacheStats is not defined"'
```
- [ ] Confirm error appears in logs

### 3. Verify Bug #2 Exists (Old relevanceScore)
```bash
ssh root@185.193.126.13 'grep -n "relevanceScore.*Default for DuckDuckGo" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```
- [ ] Confirm shows `relevanceScore: 50` (not 100)

### 4. Check Current Results
```bash
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Providing.*validated sources"'
```
- [ ] Confirm shows "Providing 3 validated sources" (not 10)

---

## ☐ Download Files

### 1. Download from GenSpark
- [ ] Downloaded `ai-service-v37.19.8.3-SCRAPER-FIX.js`
- [ ] Downloaded `article-search-service-v37.19.8.3-RELEVANCE-100.js`

### 2. Verify Local Files
```bash
# Check if files exist in Downloads
ls -lh ~/Downloads/ai-service-v37.19.8.3-SCRAPER-FIX.js
ls -lh ~/Downloads/article-search-service-v37.19.8.3-RELEVANCE-100.js
```
- [ ] Both files exist

### 3. Verify getCacheStats Fix (Local)
```bash
grep "getCacheStats" ~/Downloads/ai-service-v37.19.8.3-SCRAPER-FIX.js | head -2
```
- [ ] Confirm shows `const { scrapeMultipleArticles, getCacheStats } =`

### 4. Verify relevanceScore Fix (Local)
```bash
grep -A 1 "relevanceScore.*100" ~/Downloads/article-search-service-v37.19.8.3-RELEVANCE-100.js
```
- [ ] Confirm shows `relevanceScore: 100,`

---

## ☐ Rename & Move Files

### 1. Rename Files
```bash
cd ~/Downloads
mv ai-service-v37.19.8.3-SCRAPER-FIX.js ai-service.js
mv article-search-service-v37.19.8.3-RELEVANCE-100.js article-search-service.js
```
- [ ] Files renamed

### 2. Move to Project Directory
```bash
mv ai-service.js "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend/ai-service.js"
mv article-search-service.js "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend/services/article-search-service.js"
```
- [ ] Files moved

### 3. Verify Local Deployment Files
```bash
ls -lh "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend/ai-service.js"
ls -lh "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend/services/article-search-service.js"
```
- [ ] Both files exist in project directory

---

## ☐ Deploy to Server

### 1. Navigate to Backend Directory
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend"
```
- [ ] Current directory confirmed

### 2. Upload ai-service.js
```bash
scp ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js
```
- [ ] Upload successful
- [ ] Password: `YNWA1892LFC`

### 3. Upload article-search-service.js
```bash
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js
```
- [ ] Upload successful

### 4. Restart Backend Service
```bash
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'
```
- [ ] Service restarted

### 5. Check Service Status
```bash
ssh root@185.193.126.13 'sudo systemctl status workforce-backend-b.service'
```
- [ ] Service shows "active (running)"

---

## ☐ Verify Deployment

### 1. Check Version in Logs
```bash
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19.8.3"'
```
- [ ] Shows: `AI-SERVICE.JS v37.19.8.3 LOADED - SCRAPER FIX`
- [ ] Shows: `v37.19.8.3: SCRAPER FIX - Import getCacheStats`

### 2. Verify Fix #1: getCacheStats Import
```bash
ssh root@185.193.126.13 'grep "getCacheStats" /var/www/workforce-democracy/version-b/backend/ai-service.js | head -2'
```
- [ ] Shows: `const { scrapeMultipleArticles, getCacheStats } = require('./article-scraper');`

### 3. Verify Fix #2: relevanceScore 100
```bash
ssh root@185.193.126.13 'grep -A 1 "relevanceScore.*100.*v37.19.8.2" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```
- [ ] Shows: `relevanceScore: 100,`

### 4. Verify No getCacheStats Errors
```bash
ssh root@185.193.126.13 'tail -200 /var/log/workforce-backend-b.log | grep "getCacheStats is not defined"'
```
- [ ] No results (error doesn't appear)

---

## ☐ Test Functionality

### 1. Test Query: "What are Mamdani's policies?"
- [ ] Query submitted via frontend
- [ ] Wait for response (may take 15-30 seconds first time)

### 2. Check Server Logs for Execution
```bash
ssh root@185.193.126.13 'tail -200 /var/log/workforce-backend-b.log | grep -E "Progressive candidate|Local database|DuckDuckGo|Providing.*validated"'
```

Expected to see:
- [ ] "Progressive candidate detected: MAMDANI"
- [ ] "Local database returned 3 sources"
- [ ] "Activating DuckDuckGo fallback"
- [ ] "Providing 10 validated sources to LLM" (not 3!)

### 3. Check Source Relevance Scores
```bash
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "Source relevance scores" -A 15'
```

Expected to see:
- [ ] 3 Democracy Now sources: score 200
- [ ] 7 DuckDuckGo sources: score 100 (not 0-30!)
- [ ] All 10 sources above MIN_RELEVANCE (60)

### 4. Check Article Scraping
```bash
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "Scraped:"'
```

Expected to see:
- [ ] "Scraped: Democracy Now (4500+ chars)"
- [ ] "Scraped: The Intercept (3000+ chars)"
- [ ] Multiple successful scrapes (not "Scraping failed")
- [ ] NO "getCacheStats is not defined" errors

### 5. Verify Cache Stats Log
```bash
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "Scraper cache:"'
```

Expected to see:
- [ ] "📊 Scraper cache: 10 articles, 0 hits, 10 misses"
- [ ] (Or similar numbers showing cache is working)

---

## ☐ Verify Response Quality

### 1. Check AI Response Content
Review the actual response from "What are Mamdani's policies?"

Expected to see:
- [ ] **10 sources cited** (not just 3)
- [ ] **Specific policy mechanisms** (e.g., "Good Cause Eviction legislation")
- [ ] **Direct quotes** (e.g., "Mamdani stated: '...'")
- [ ] **Numbers and data** (e.g., "$2 billion budget", "50% reduction")
- [ ] **Multiple policy areas** (housing, healthcare, economic justice, etc.)

### 2. Verify Not Generic/Shallow
The response should NOT be:
- [ ] Generic statements without specifics
- [ ] Only citing Democracy Now (should cite 10 sources)
- [ ] Missing concrete policy details

---

## ☐ Optional: Test Other Queries

### 1. Test Other Progressive Candidates
- [ ] "What are AOC's policies?"
- [ ] "What are Bernie Sanders' policies?"

Expected behavior:
- [ ] Similar results: 10+ sources, detailed analysis
- [ ] Mix of local DB + DuckDuckGo sources

### 2. Test State/Local Candidates
- [ ] "What are [local candidate]'s policies?"

Expected behavior:
- [ ] Should find sources if they exist
- [ ] DuckDuckGo fallback activates if <10 local sources

---

## ☐ Post-Deployment

### 1. Monitor Error Logs
```bash
ssh root@185.193.126.13 'tail -f /var/log/workforce-backend-b.log'
```
- [ ] No critical errors appearing
- [ ] Scraping succeeding
- [ ] Sources being found and validated

### 2. Update Documentation
- [ ] Mark v37.19.8.3 as "DEPLOYED TO VERSION B" in master document
- [ ] Note deployment date and time
- [ ] Document any issues encountered

### 3. Plan Production Deployment
After Version B is stable for 24-48 hours:
- [ ] Sync Version B → Version A using `./sync-b-to-a.sh`
- [ ] Test production deployment
- [ ] Monitor production logs

---

## 🚨 Rollback Plan (If Issues Occur)

If v37.19.8.3 causes problems:

```bash
# 1. Stop service
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'

# 2. Restore from backup (if available)
# OR re-upload previous working version (v37.19.8.1)

# 3. Restart service
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# 4. Verify rollback
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19"'
```

---

## ✅ Deployment Complete

Once all checkboxes are checked:

- [ ] **v37.19.8.3 deployed successfully**
- [ ] **Both bugs fixed** (getCacheStats + relevanceScore)
- [ ] **10 sources working** (not 3)
- [ ] **Detailed analysis working** (not shallow)
- [ ] **No errors in logs**

**Congratulations!** Your comprehensive policy scraping system is now fully functional.

---

**Created:** 2025-12-01  
**Version:** v37.19.8.3  
**Purpose:** Step-by-step deployment verification checklist
