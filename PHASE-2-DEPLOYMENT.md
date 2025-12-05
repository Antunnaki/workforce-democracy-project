# Phase 2 Deployment Guide - Backend Source Integration

## 🎯 What Phase 2 Adds

**New Capabilities:**
- ✅ Real DuckDuckGo news searches (14 trusted sources)
- ✅ Real OpenSecrets campaign finance data
- ✅ Intelligent source detection (knows when to search)
- ✅ Ethical rate limiting (2s for news, 5s for finance)
- ✅ Smart caching:
  - **News**: 7 days (news can update)
  - **Finance**: PERMANENT (more ethical, never re-request)

**No Frontend Changes Needed:**
- Universal chat already calls `/api/civic/llm-chat`
- Will automatically receive and display sources
- Frontend code unchanged from Phase 1

---

## 📋 Prerequisites

**Before deploying Phase 2:**
- ✅ Phase 1 deployed and working (universal chat on Netlify)
- ✅ VPS access (SSH)
- ✅ Backend running on VPS (PM2)
- ✅ Dependencies already installed:
  - `axios` v1.6.2 ✅ (already in package.json)
  - `cheerio` v1.0.0-rc.12 ✅ (already in package.json)

**Good News:** You already have all dependencies! No `npm install` needed.

---

## 🚀 Deployment Steps

### Step 1: Backup Current Backend (CRITICAL)

**On your VPS via SSH:**

```bash
# Navigate to backend directory
cd /path/to/civic/backend

# Create backup of current llm-proxy.js
cp llm-proxy.js llm-proxy.js.backup-$(date +%Y%m%d)

# Verify backup created
ls -lh llm-proxy.js.backup-*
```

**Expected output:**
```
-rw-r--r-- 1 user user 8.0K Nov  3 14:30 llm-proxy.js.backup-20251103
```

**⚠️ CRITICAL:** Don't skip this - you need this file to rollback!

---

### Step 2: Upload New llm-proxy.js

**You have two options:**

#### Option A: Manual Upload via SCP (Recommended)

**On your local computer:**
```bash
# Upload the new file (replace with your VPS details)
scp civic/backend/llm-proxy.js user@your-vps-ip:/path/to/civic/backend/llm-proxy.js
```

#### Option B: Direct Edit on VPS

**On your VPS via SSH:**
```bash
# Open file in editor
nano /path/to/civic/backend/llm-proxy.js

# Copy the ENTIRE contents of the new llm-proxy.js
# Paste into nano
# Save: Ctrl+O, Enter
# Exit: Ctrl+X
```

---

### Step 3: Verify File Upload

**On your VPS:**

```bash
# Check file size (should be ~20KB, up from ~8KB)
ls -lh llm-proxy.js

# Check for new code (search for "PHASE 2")
grep -n "PHASE 2" llm-proxy.js
```

**Expected output:**
```
-rw-r--r-- 1 user user 20K Nov  3 14:35 llm-proxy.js
17:// PHASE 2: SOURCE SEARCH & CACHING
150:// PHASE 2: Search for additional sources if needed
```

If you see these lines, upload was successful! ✅

---

### Step 4: Test Syntax (Before Restarting)

**On your VPS:**

```bash
# Test for syntax errors
node -c llm-proxy.js
```

**Expected output:** (nothing = good!)
```
[no output means file is valid]
```

**If you see errors:**
```
SyntaxError: Unexpected token...
```

This means there was a copy/paste issue. **DON'T RESTART PM2!**

**Fix:**
```bash
# Restore backup
cp llm-proxy.js.backup-20251103 llm-proxy.js

# Try upload again
```

---

### Step 5: Restart Backend

**On your VPS:**

```bash
# Restart PM2 (this activates the changes)
pm2 restart all

# Watch logs for errors
pm2 logs --lines 50
```

**Expected output (good signs):**
```
🤖 Universal Chat v37.1.0 initializing...
✅ CORS handled by Nginx reverse proxy
✅ Civic platform API loaded
✅ LLM proxy loaded
📊 Cache stats: 0 news, 0 finance (permanent)
```

**If you see errors:**
```
Error: Cannot find module 'axios'
Error: Cannot find module 'cheerio'
```

**This shouldn't happen** (you have these installed), but if it does:
```bash
cd /path/to/backend
npm install
pm2 restart all
```

---

### Step 6: Test Backend Health

**From your computer, test the endpoint:**

```bash
# Test health endpoint
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```

**Expected output:**
```json
{
  "success": true,
  "available": true,
  "model": "llama3-70b-8192",
  "provider": "Groq",
  "message": "LLM service is available"
}
```

**If you get this, backend is running!** ✅

---

### Step 7: Test Source Search

**Test with a query that should trigger sources:**

```bash
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who are Chuck Schumer'\''s top donors?",
    "context": "representativeAnalysis"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Chuck Schumer is the U.S. Senator from New York...",
  "sources": [
    {
      "title": "Campaign Finance: Chuck Schumer",
      "url": "https://www.opensecrets.org/...",
      "source": "OpenSecrets.org",
      "type": "finance",
      "excerpt": "Campaign contribution data...",
      "date": "2025-11-03T..."
    }
  ],
  "context": "representativeAnalysis",
  "model": "llama3-70b-8192"
}
```

**Key things to check:**
- ✅ `sources` array exists
- ✅ `sources` is not empty
- ✅ Source has `type: "finance"` for OpenSecrets

---

### Step 8: Check PM2 Logs

**On your VPS:**

```bash
pm2 logs --lines 100
```

**Look for these messages (good signs):**
```
🔍 Searching news sources for: "Chuck Schumer donors"
💰 Searching OpenSecrets for: Chuck Schumer
  ✅ Found finance data for Chuck Schumer
  💾 Cached for 90 days (will refresh quarterly)
✅ Found 1 total sources
📚 Added 1 sources to response
```

**Test again with same query:**
```bash
# Run the same curl command again
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Who funds Chuck Schumer?",
    "context": "representativeAnalysis"
  }'
```

**This time, logs should show:**
```
💰 Using cached finance data for Chuck Schumer (0 days old)
```

**This proves caching is working!** ✅

---

### Step 9: Test on Frontend

**Open your site:**
1. Go to https://workforcedemocracyproject.org
2. Click purple chat button
3. Type: "Who are Chuck Schumer's top donors?"
4. Press Enter

**Expected result:**
- ✅ LLM response appears with typewriter effect
- ✅ "View Sources (1)" button appears below response
- ✅ Click "View Sources" - OpenSecrets source is shown
- ✅ Source badge is ORANGE (finance type)
- ✅ Clicking source link opens OpenSecrets in new tab

**Test news sources:**
1. Type: "What's the latest on the 2025 budget?"
2. Press Enter

**Expected result:**
- ✅ LLM response appears
- ✅ "View Sources (2-3)" button appears
- ✅ Sources are mix of independent/factcheck types
- ✅ Badges are GREEN (independent) or BLUE (factcheck)

---

## 🧪 Complete Testing Checklist

### Backend Tests (via curl)

- [ ] Health endpoint returns `available: true`
- [ ] Campaign finance query returns sources
- [ ] Second campaign finance query uses cache (check logs)
- [ ] News query returns sources
- [ ] General query (like "how does a bill become law") returns NO sources
- [ ] No errors in PM2 logs

### Frontend Tests (via website)

- [ ] Chat button still appears and works
- [ ] Chat sends messages successfully
- [ ] Campaign finance queries show sources
- [ ] "View Sources" button appears
- [ ] Sources expand/collapse correctly
- [ ] Source badges have correct colors:
  - GREEN = Independent journalists
  - BLUE = Fact-checkers
  - GRAY = Mainstream news
  - ORANGE = Campaign finance
- [ ] Clicking source opens in new tab
- [ ] Mobile: Sources still work on small screen

### Cache Tests

- [ ] Same query twice = cache hit (check logs)
- [ ] Finance cache persists after PM2 restart
- [ ] News cache expires after 7 days (optional long-term test)

---

## 📊 Monitoring

### After Deployment, Monitor These:

**PM2 Logs (first hour):**
```bash
pm2 logs --lines 200
```

**Look for:**
- ✅ Successful source searches
- ✅ Cache hits
- ⚠️ Any 429 errors (rate limiting - shouldn't happen with our delays)
- ⚠️ Any timeout errors

**Expected pattern:**
```
🔍 Searching news sources for: "..." 
  ✅ Found: Zeteo
  ✅ Found: PolitiFact
💾 Cached 2 news sources
✅ Found 2 total sources
📚 Added 2 sources to response
```

**Cache Stats (every hour):**
```
📊 Cache stats: 5 news (7d), 3 finance (90d)
🧹 Cleaned 2 old news cache entries
```

---

## 🔧 Troubleshooting

### Issue: Sources not appearing

**Symptoms:**
- Chat works but no "View Sources" button
- Response has `sources: []`

**Check:**
```bash
# Check PM2 logs
pm2 logs --lines 50

# Look for:
ℹ️ Query does not need current sources
```

**Solution:**
- This is expected for general queries!
- Try a query with temporal words: "latest", "current", "2025"
- Or finance words: "donors", "campaign finance"

---

### Issue: "Cannot find module" errors

**Symptoms:**
```
Error: Cannot find module 'axios'
```

**Solution:**
```bash
cd /path/to/backend
npm install
pm2 restart all
```

---

### Issue: DuckDuckGo blocking requests

**Symptoms (in logs):**
```
❌ DuckDuckGo search error: Request failed with status code 429
```

**Solution:**
- This is unlikely with 2-second delays
- If it happens: Cache will prevent repeated requests
- User still gets LLM response, just no sources

**Monitor:**
```bash
pm2 logs | grep "429"
```

If you see many 429 errors, increase delay in code from 2000ms to 3000ms.

---

### Issue: OpenSecrets blocking scraping

**Symptoms (in logs):**
```
❌ OpenSecrets search error: Request failed
```

**Solution:**
- Cache prevents repeated requests (permanent)
- Check if User-Agent is being sent correctly
- OpenSecrets might be down temporarily

**Verify cache working:**
```bash
pm2 logs | grep "cached finance"
```

Should see: `💰 Using cached finance data for [name]`

---

### Issue: Slow responses

**Symptoms:**
- Chat takes 10+ seconds to respond

**Check logs:**
```bash
pm2 logs | grep "Searching"
```

**If you see many searches:**
- First request is slow (has to search)
- Second request should be fast (cached)

**This is expected behavior:**
- First search: 5-10 seconds (searching + 5s delay for OpenSecrets)
- Cached: <2 seconds

---

## 🔄 Rollback Procedure (If Needed)

### Quick Rollback (5 minutes)

**On your VPS:**

```bash
# Restore backup
cp llm-proxy.js.backup-20251103 llm-proxy.js

# Restart PM2
pm2 restart all

# Verify
pm2 logs --lines 20
```

**Expected result:**
- Backend works
- Chat works
- No sources (back to Phase 1)

---

## ✅ Success Criteria

**Phase 2 is successful when:**

1. ✅ Backend restarts without errors
2. ✅ Health endpoint returns 200 OK
3. ✅ Campaign finance queries return sources
4. ✅ News queries return sources
5. ✅ Cache is working (second query faster)
6. ✅ Frontend displays sources correctly
7. ✅ Source badges have correct colors
8. ✅ No 429 rate limit errors
9. ✅ PM2 logs show cache stats hourly
10. ✅ System stable for 24 hours

---

## 📈 Performance Expectations

### First Request (No Cache)
```
User asks: "Who funds Chuck Schumer?"

Backend flow:
1. LLM response: 1-2 seconds
2. OpenSecrets search: 5-7 seconds (includes 5s ethical delay)
3. Total: 6-9 seconds

User sees:
- Typing indicator for 6-9 seconds
- Then response with typewriter effect
- Then "View Sources (1)" button
```

### Second Request (Cached)
```
User asks: "Who are Schumer's donors?" (same person)

Backend flow:
1. LLM response: 1-2 seconds
2. Cache hit: instant
3. Total: 1-2 seconds

User sees:
- Typing indicator for 1-2 seconds
- Then response with typewriter effect
- Then "View Sources (1)" button (same source)
```

**This is a HUGE improvement:**
- First request: Worth the wait for real data
- Subsequent requests: Fast as Phase 1

---

## 🎯 Cache Efficiency Predictions

**After 1 week of use:**
- Finance cache: ~20-50 representatives
- News cache: ~100-200 topics
- Cache hit rate: ~60-70%
- Average response time: ~3 seconds (down from 7)

**After 1 month:**
- Finance cache: ~200+ representatives (permanent)
- Cache hit rate: ~80%+
- Average response time: ~2 seconds

**Why permanent finance cache is ethical:**
- We only cache what users actually search for
- Campaign finance data from 2024 won't change in 2025
- OpenSecrets updates quarterly, not daily
- We're not mirroring their entire database
- We respect their servers (5-second delay + permanent cache)

---

## 📝 Post-Deployment Log

**Complete after deployment:**

```
PHASE 2 DEPLOYMENT LOG

Deployment Date: _______________
Deployed By: _______________

Pre-Deployment Checks:
[ ] Backup created: llm-proxy.js.backup-YYYYMMDD
[ ] Dependencies verified (axios, cheerio)
[ ] Phase 1 working correctly

Deployment Steps:
[ ] New llm-proxy.js uploaded to VPS
[ ] Syntax check passed (node -c)
[ ] PM2 restarted successfully
[ ] Health endpoint returns 200 OK

Testing:
[ ] Finance query returns sources
[ ] News query returns sources
[ ] Cache working (second query faster)
[ ] Frontend displays sources
[ ] Source badges correct colors
[ ] Mobile works

Monitoring (24 hours):
[ ] No 429 rate limit errors
[ ] No crashes
[ ] Cache stats appearing hourly
[ ] User feedback positive

Status: ⬜ Success / ⬜ Partial / ⬜ Rollback Required

Notes:
_______________________________________
_______________________________________
```

---

## 🎉 You're Done!

**Once all checks pass:**
- ✅ Phase 2 is complete
- ✅ Universal chat has real sources
- ✅ Cache is working ethically
- ✅ System is production-ready

**Next steps:**
- Monitor for 48 hours
- Gather user feedback
- Celebrate! 🎊

---

**End of Phase 2 Deployment Guide**
