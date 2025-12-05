# Article Scraper - Quick Start Guide

## 🎯 What You're Deploying

**Article Scraper v1.0.0** - Fetches full article content (2,000-10,000 chars) instead of short excerpts (100-200 chars), enabling your AI to provide:

- ✅ Specific dollar amounts ("$23 billion cut")
- ✅ Direct quotes from reporting  
- ✅ Detailed statistics and data
- ✅ Multi-dimensional policy analysis

---

## ⚡ Ultra-Fast Deployment (30 seconds)

### Copy-Paste This Into Your Server

```bash
# SSH to your server
ssh root@185.193.126.13

# Navigate to project directory
cd /var/www/workforce-democracy

# Download and run deployment script
cat > DEPLOY-ARTICLE-SCRAPER.sh << 'ENDOFSCRIPT'
[Paste contents of DEPLOY-ARTICLE-SCRAPER.sh here]
ENDOFSCRIPT

chmod +x DEPLOY-ARTICLE-SCRAPER.sh
bash DEPLOY-ARTICLE-SCRAPER.sh
```

**That's it!** The script does everything automatically.

---

## 🧪 Verify It Works (3 steps)

### 1. Check Deployment

```bash
bash TEST-ARTICLE-SCRAPER.sh
```

Should show: `✅ ALL CHECKS PASSED!`

### 2. Watch Logs

```bash
pm2 logs backend --lines 50
```

### 3. Test Query (via your frontend)

Ask: **"What are the latest developments with SNAP benefits?"**

---

## 📊 Expected Results

### In Logs (pm2 logs backend)

```
🔍 Pre-searching for sources before LLM call...
📚 Found 3 sources - adding to context for LLM
📄 Scraping full article content...

🔍 Starting article scraping for 3 sources (max 3 concurrent)...
  📦 Processing batch 1 (3 articles)...
  ✅ Scraped 4523 chars from truthout.org
  ✅ Scraped 3201 chars from commondreams.org
  ✅ Scraped 6789 chars from democracynow.org
  ✅ Scraping complete: 3/3 succeeded (0 from cache)

  ✅ Scraped 3/3 articles successfully
```

### In AI Response

**BEFORE (with excerpts only):**
> "Truthout reports on SNAP benefit cuts affecting low-income families."

**AFTER (with full articles):**
> "According to Truthout's reporting, the Trump administration has proposed a $23 billion cut to SNAP over the next decade, which would eliminate benefits for an estimated 3 million people—including 1.2 million children. The cuts target 'able-bodied adults without dependents' (ABAWDs) by imposing stricter work requirements. Economic analysis shows this would reduce GDP by $35-41 billion due to SNAP's 1.5-1.8x multiplier effect..."

---

## ✅ Success Checklist

- [ ] Deployment script ran without errors
- [ ] TEST-ARTICLE-SCRAPER.sh shows all checks passed
- [ ] PM2 logs show scraping activity (`✅ Scraped XXXX chars`)
- [ ] AI response includes specific numbers and quotes
- [ ] Second identical query shows cache hits (`💾 Cache HIT`)

---

## 🐛 If Something Goes Wrong

### Problem: Deployment Failed

**Solution:**
```bash
# Check what went wrong
cat /var/www/workforce-democracy/backend/ai-service.js | grep -A 5 "article-scraper"

# If needed, restore backup
ls -la /var/www/workforce-democracy/backups/
cp /var/www/workforce-democracy/backups/ai-service_pre-scraper_*.js \
   /var/www/workforce-democracy/backend/ai-service.js

# Restart
pm2 restart all
```

### Problem: No Scraping in Logs

**Check if cheerio is installed:**
```bash
cd /var/www/workforce-democracy/backend
npm list cheerio
```

**If not installed:**
```bash
npm install cheerio --save
pm2 restart all
```

### Problem: Scraping Fails for All Articles

**Check connectivity:**
```bash
curl -I https://truthout.org
curl -I https://commondreams.org
```

Should return `HTTP/2 200`

### Problem: Response Still Generic

**Verify scraping actually ran:**
```bash
pm2 logs backend --lines 200 | grep "Scraped"
```

**Should see:**
```
✅ Scraped 4523 chars from truthout.org
```

**If not, check:**
1. Did you make query via frontend? (Not direct API call)
2. Was it a policy query? (SNAP, welfare, healthcare, etc.)
3. Were sources found? (Look for `📚 Found X sources`)

---

## 📞 Quick Support Commands

```bash
# View all logs
pm2 logs backend --lines 100

# View errors only
pm2 logs backend --err --lines 50

# Filter for scraping activity
pm2 logs backend | grep -E "Scraping|Cache|📄|🔍"

# Check PM2 status
pm2 list

# Full restart (clears cache)
pm2 stop all && pm2 flush && pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# Check file existence
ls -la /var/www/workforce-democracy/backend/article-scraper.js
```

---

## 🎯 Test Queries

Try these to verify scraping works:

1. **"What are the latest developments with SNAP benefits?"**
   - Should scrape Truthout, Common Dreams, Democracy Now
   - Response should include specific dollar amounts

2. **"How is Medicare being affected by current policies?"**
   - Should trigger source search + scraping
   - Response should cite articles with data

3. **"What's happening with unemployment benefits?"**
   - Should scrape progressive sources
   - Response should include quotes and statistics

---

## 📈 Performance Notes

### First Query (Cold Cache)
- Takes 10-15 seconds (includes scraping)
- Scrapes top 5 sources
- Caches for 24 hours

### Second Query (Warm Cache)
- Takes < 1 second (instant)
- Shows: `💾 Cache HIT: [article title]`
- Uses cached content

### Expected Cache Hit Rate
- **75-85%** (most queries hit cached content)

---

## 🚀 Next Steps After Deployment

Once article scraper is working:

### Immediate
1. ✅ Verify scraping works with test queries
2. ✅ Monitor cache hit rate (should see `💾 Cache HIT` on repeat queries)
3. ✅ Confirm response quality improved (specific data vs. vague)

### Phase 2 (Next Enhancement)
- **Economic Data APIs** - Add USDA SNAP stats, Census poverty data, BLS employment data
- **Estimated Time:** 3 hours development
- **Impact:** Combine progressive reporting + government statistics

### Phase 3 (Future)
- **"Follow the Money"** - OpenSecrets campaign finance API
- **More RSS Feeds** - Jacobin, In These Times, The Nation, Labor Notes
- **Enhanced Extraction** - Tables, charts, PDF parsing

---

## 📚 Full Documentation

- **ARTICLE-SCRAPER-README.md** - Complete technical documentation
- **DEPLOYMENT-SUMMARY.md** - Detailed deployment guide
- **TEST-ARTICLE-SCRAPER.sh** - Automated testing script

---

## ⏱️ Total Deployment Time

- **Copying script:** 1 minute
- **Running deployment:** 2 minutes  
- **Testing verification:** 2 minutes
- **Total:** ~5 minutes

---

## 🎉 Ready?

**Run this now:**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy
bash DEPLOY-ARTICLE-SCRAPER.sh
```

Then test with:
> **"What are the latest developments with SNAP benefits?"**

Watch the magic happen! 🚀
