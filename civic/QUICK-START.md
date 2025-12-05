# ⚡ Quick Start - Civic Platform v37.0.0

**Get up and running in 10 minutes**

---

## 🚀 Step 1: Upload (2 minutes)

From your Mac terminal:

```bash
# Upload civic directory
scp -r civic/ root@workforcedemocracyproject.org:/var/www/html/

# Upload test page
scp civic-platform.html root@workforcedemocracyproject.org:/var/www/html/
```

---

## 🔑 Step 2: Configure API Keys (3 minutes)

SSH into your VPS:

```bash
ssh root@workforcedemocracyproject.org
nano /var/www/html/backend/.env
```

Add these lines:

```env
GROQ_API_KEY=your_groq_key_here
VOTESMART_API_KEY=your_votesmart_key_here
FEC_API_KEY=DEMO_KEY
```

**Get API Keys:**
- Groq: https://console.groq.com/ (FREE - required for LLM)
- VoteSmart: https://votesmart.org/share/api (FREE - optional)
- FEC: https://api.open.fec.gov/developers/ (FREE - optional)

Save and exit: `Ctrl+X`, `Y`, `Enter`

---

## 🔧 Step 3: Integrate Backend (2 minutes)

Edit server.js:

```bash
nano /var/www/html/backend/server.js
```

Add after other requires:

```javascript
const civicApi = require('../civic/backend/civic-api');
```

Add after existing routes (before error handlers):

```javascript
app.use('/api/civic', civicApi);
```

Save and restart:

```bash
/opt/nodejs/bin/pm2 restart 0
```

---

## ✅ Step 4: Test (3 minutes)

Visit: `https://workforcedemocracyproject.org/civic-platform.html`

**Test these:**
1. ✅ Page loads
2. ✅ Click "Fact Checker" tab
3. ✅ Submit a test claim (e.g., "The sky is blue")
4. ✅ Click "Test Rep Modal" - modal should open
5. ✅ Click "Ask AI Assistant" button (bottom-right)
6. ✅ Send message to AI

**If all pass: YOU'RE DONE! 🎉**

---

## 🐛 Troubleshooting

### "API key not configured"
→ Check backend/.env has `GROQ_API_KEY=...`
→ Restart: `/opt/nodejs/bin/pm2 restart 0`

### Modal/components not working
→ Check browser console (F12) for errors
→ Ensure all files uploaded correctly

### Fact-checker stuck loading
→ Normal first time (10-20 seconds)
→ Check PM2 logs: `/opt/nodejs/bin/pm2 logs 0`

---

## 📊 What You Get

### ✅ Complete Features

1. **Multi-Source Fact-Checking**
   - 5+ independent fact-checkers
   - AI contextual analysis
   - Confidence scoring

2. **Representative Profiles**
   - 6-tab comprehensive modal
   - Campaign finance (FEC)
   - Voting records
   - Worker rights alignment

3. **Bill Tracker**
   - Browse legislation
   - Vote support/oppose
   - Compare to reps

4. **LLM AI Assistant**
   - Groq + Llama3
   - Context-aware
   - Privacy-first

5. **User Dashboard**
   - Track engagement
   - Monitor representatives
   - View activity

### 📁 Files Created

**Backend Services (9 files):**
- FEC API, OpenStates, VoteSmart
- Fact verification engine
- Data aggregator
- Cache manager
- API router
- Scraping queue

**Frontend Components (4 files):**
- LLM assistant
- Representative profile modal
- Dashboard, bills, fact-checker
- Complete CSS styling

**Test Environment:**
- civic-platform.html (standalone)

**Documentation (5 files):**
- This quick start
- Integration guide
- Deployment guide
- Morning summary
- Build status

**Total: 20+ files, 234KB of code**

---

## 🎯 Next Steps

### Immediate (Today)
1. Test civic-platform.html thoroughly
2. Try fact-checking various claims
3. Test on mobile device

### Short-Term (This Week)
1. Request VoteSmart API key
2. Get Congress.gov API key
3. Test with real users (5-10 people)

### Long-Term (Next Week+)
1. Integrate into main site navigation
2. Add geocoding for rep lookup
3. Connect Congress.gov for bills
4. Announce to full user base

---

## 📞 Need Help?

### Check Logs
```bash
/opt/nodejs/bin/pm2 logs 0 --lines 50
```

### Test Backend
```bash
curl https://workforcedemocracyproject.org/api/civic/health
```

### Browser Console
Press F12, check for error messages

### Documentation
- `civic/MORNING-SUMMARY-UPDATED.md` - Full feature list
- `civic/INTEGRATION-GUIDE.md` - Detailed integration
- `civic/README-DEPLOYMENT.md` - Deployment details

---

## ✨ Features Highlights

### Why This Is Special

1. **Independent:** No big tech (no Google, Facebook, Twitter)
2. **Multi-Source:** Never trust single source
3. **Privacy-First:** DuckDuckGo, no tracking
4. **Cost-Effective:** All free/generous free tiers
5. **Non-Partisan:** Neutral colors, objective presentation
6. **Ethical:** Robots.txt, rate limiting, transparent
7. **Open:** Groq + Llama3 (open source LLM)

### Data Sources

- ✅ FEC (Federal Election Commission)
- ✅ OpenStates (state legislators)
- ✅ VoteSmart (issue positions)
- ✅ PolitiFact (fact-checking)
- ✅ FactCheck.org (fact-checking)
- ✅ Snopes (fact-checking)
- ✅ AP Fact Check (fact-checking)
- ✅ Reuters Fact Check (fact-checking)
- ✅ DuckDuckGo (privacy-first search)
- ✅ Groq + Llama3 (AI analysis)

---

## 🎉 Success Criteria

You know it's working when:

- ✅ civic-platform.html loads without errors
- ✅ Fact-checker returns results in 10-20 seconds
- ✅ Representative modal opens with 6 tabs
- ✅ LLM assistant responds to messages
- ✅ Browser console shows "✓ Civic Platform ready!"
- ✅ PM2 logs show "✓ Civic Platform API initialized"
- ✅ `/api/civic/health` returns `{"status": "healthy"}`

---

## 💪 You're Ready!

**That's it!** In 10 minutes you have:

- ✅ Complete fact-checking system
- ✅ Representative transparency platform
- ✅ Bill tracking and user voting
- ✅ AI assistant throughout
- ✅ Privacy-first architecture
- ✅ Independent data sources

**Test thoroughly, then deploy with confidence!**

---

Built with ❤️ overnight while you slept
v37.0.0 - Truth & Democracy Platform

**Questions? Check the full docs in civic/MORNING-SUMMARY-UPDATED.md**
