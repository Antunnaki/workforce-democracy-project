# 🏛️ CIVIC PLATFORM v37.0.0 - DEPLOYMENT GUIDE

## 📦 WHAT'S IN THIS PACKAGE

Complete democratic engagement platform built from scratch:
- ✅ Representative profiles with 6 comprehensive tabs
- ✅ User dashboard for civic engagement tracking
- ✅ Bill tracking and voting system
- ✅ Fact-checking submission with AI verification
- ✅ Campaign finance integration (FEC API)
- ✅ Ethical web scraping with DuckDuckGo
- ✅ LLM assistant (Groq + Llama3) throughout

## 🚀 DEPLOYMENT STEPS

### **Step 1: Upload All Files**

From your local machine (not SSH'd in):

```bash
cd ~/Desktop/civic-platform-v37

# Upload entire civic directory
scp -r -P 22 civic/ root@185.193.126.13:/var/www/workforce-democracy/

# Upload test page
scp -P 22 civic-platform.html root@185.193.126.13:/var/www/workforce-democracy/

# Upload backend components
scp -r -P 22 civic/backend/* root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### **Step 2: Install New Dependencies**

SSH into VPS:

```bash
ssh root@185.193.126.13 -p 22
cd /var/www/workforce-democracy/backend

# Install new packages
npm install axios cheerio robots-parser
```

### **Step 3: Set Up Database Tables**

The civic platform uses the existing RESTful Table API with new schemas defined in `civic/database/civic-schema.js`.

Tables will be created automatically on first use via the Table API.

### **Step 4: Configure Environment Variables**

Edit `.env` file (if it exists):

```bash
cd /var/www/workforce-democracy/backend
nano .env
```

Add these lines (all are optional but recommended):

```env
# FEC API (optional - uses DEMO_KEY by default)
FEC_API_KEY=your_fec_key_here

# Congress.gov API (you should already have this)
CONGRESS_API_KEY=your_key_here

# Groq AI (you should already have this)
GROQ_API_KEY=your_groq_key_here
```

### **Step 5: Restart Backend**

```bash
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0 --lines 20
```

Look for:
```
✅ Civic platform routes loaded
✅ FEC API initialized
✅ Ethical scraper initialized
```

### **Step 6: Test the Platform**

Open in browser:
```
http://185.193.126.13/civic-platform.html
```

Test these features:
1. **Enter your ZIP code** → Should load your representatives
2. **Click a representative** → Should open 6-tab modal
3. **Browse bills** → Should see recent legislation
4. **Submit a fact-check** → Should start AI conversation
5. **Vote on a bill** → Should save your position

### **Step 7: Verify API Endpoints**

Test these in browser or curl:

```bash
# Representative search
curl "http://localhost:3001/api/civic/representatives?zip=12061"

# Bill search
curl "http://localhost:3001/api/civic/bills?category=labor&status=active"

# Campaign finance (example candidate)
curl "http://localhost:3001/api/civic/campaign-finance/P80001571"

# Fact-check submission
curl -X POST "http://localhost:3001/api/civic/fact-check" \
  -H "Content-Type: application/json" \
  -d '{"claim": "Test claim", "rep_id": "B001135"}'
```

## 📁 FILE STRUCTURE

```
/var/www/workforce-democracy/
├── civic-platform.html                    (Test page)
├── civic/
│   ├── components/
│   │   ├── representative-profile.js      (6-tab modal)
│   │   ├── user-dashboard.js              (Civic hub)
│   │   ├── bill-tracker.js                (Browse & vote on bills)
│   │   ├── fact-checker.js                (Submission system)
│   │   └── llm-assistant.js               (AI integration)
│   ├── services/
│   │   ├── data-aggregator.js             (Combines all sources)
│   │   ├── fact-verification.js           (Multi-source checking)
│   │   ├── ethical-scraper.js             (DuckDuckGo + scraping)
│   │   ├── fec-api.js                     (Campaign finance)
│   │   ├── openstates-api.js              (State legislators)
│   │   └── votesmart-api.js               (Issue positions)
│   ├── backend/
│   │   ├── civic-api.js                   (Main API router)
│   │   ├── cache-manager.js               (7-day caching)
│   │   └── scraping-queue.js              (Rate-limited scraping)
│   ├── styles/
│   │   └── civic-platform.css             (Complete styling)
│   └── database/
│       └── civic-schema.js                (Database tables)
└── backend/
    └── server.js                          (Add civic routes here)
```

## 🔧 TROUBLESHOOTING

### **Issue: Representative data not loading**

Check:
```bash
# Verify Congress API key
grep CONGRESS_API_KEY /var/www/workforce-democracy/backend/.env

# Test Congress API directly
curl "https://api.congress.gov/v3/member?api_key=YOUR_KEY"
```

### **Issue: Campaign finance data missing**

FEC API is optional. If not working:
```bash
# Check FEC API status
curl "https://api.open.fec.gov/v1/candidates/"

# Or use without FEC data (will skip that tab)
```

### **Issue: Fact-checking not working**

Check Groq API:
```bash
# Verify Groq key
grep GROQ_API_KEY /var/www/workforce-democracy/backend/.env

# Test AI service
curl -X POST "http://localhost:3001/api/ai/query" \
  -H "Content-Type: application/json" \
  -d '{"query": "Test", "context": "test"}'
```

### **Issue: Web scraping errors**

Check robots.txt compliance:
```bash
# View scraper logs
/opt/nodejs/bin/pm2 logs 0 | grep "Scraping"

# Should see "Checking robots.txt" before each scrape
```

## 🎯 INTEGRATION WITH MAIN SITE

Once testing is complete, integrate into `index.html`:

```html
<!-- Add to index.html <head> -->
<link rel="stylesheet" href="civic/styles/civic-platform.css">

<!-- Add to index.html <body> -->
<div id="civicPlatform"></div>

<!-- Add before closing </body> -->
<script src="civic/components/representative-profile.js"></script>
<script src="civic/components/user-dashboard.js"></script>
<script src="civic/components/bill-tracker.js"></script>
<script src="civic/components/fact-checker.js"></script>
<script src="civic/components/llm-assistant.js"></script>
<script>
    // Initialize civic platform
    CivicPlatform.init();
</script>
```

## 📊 VERSION HISTORY

- **v37.0.0** - Complete civic platform rebuild
- **v36.11.19** - ZIP code search fix + enrichment (previous)

## 🆘 SUPPORT

If issues arise:
1. Check PM2 logs: `/opt/nodejs/bin/pm2 logs 0`
2. Check browser console (F12)
3. Verify all API keys are configured
4. Test individual API endpoints

## ✅ SUCCESS CHECKLIST

- [ ] All files uploaded to VPS
- [ ] Dependencies installed (axios, cheerio, robots-parser)
- [ ] Backend restarted with PM2
- [ ] Test page loads (`civic-platform.html`)
- [ ] Representatives load when ZIP entered
- [ ] Representative modal opens with 6 tabs
- [ ] Bills display and voting works
- [ ] Fact-check submission works
- [ ] AI assistant responds
- [ ] Campaign finance data loads (if FEC key configured)
- [ ] No console errors
- [ ] Ready to integrate into main site

---

**🎉 CONGRATULATIONS!** You now have a comprehensive civic engagement platform with fact-checking, AI assistance, and complete transparency! 🏛️
