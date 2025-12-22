# Version 37.3.0 - Global Independent News System

**Date**: November 5, 2025  
**Type**: Major Feature - Global RSS + News APIs  
**Priority**: HIGH - Replaces blocked DuckDuckGo scraping

---

## 🌍 **What's New**

### **Global Independent News Coverage**

Replaced failing DuckDuckGo scraping with:
- ✅ **50+ RSS feeds** from independent sources worldwide
- ✅ **Guardian API** integration (free, 5,000 requests/day)
- ✅ **Multi-language support** (English, with expansion capability)
- ✅ **Hourly caching** for efficiency
- ✅ **Source bias tracking** with user warnings
- ✅ **Regional coverage**: US, Middle East, Latin America, Europe, Asia-Pacific, Africa, Australia

**Total Cost**: $0/month

---

## 📊 **Sources Included**

### **Tier 1: Independent Progressive** (Highest Trust)
- Democracy Now, The Intercept, ProPublica, Jacobin
- Common Dreams, Truthout, The Nation, In These Times
- Middle East Eye, Electronic Intifada, Mondoweiss
- NACLA (Latin America)
- Labor Notes, Grist (specialized)

### **Tier 2: Non-Western State Media** (Alternative Perspective)
- Al Jazeera (Middle East, Global)
- TeleSUR (Latin America)

### **Tier 3: Establishment Liberal** (Fact-Check Required)
- The Guardian (UK) - via API + RSS
- SCMP (Hong Kong/Asia)
- The Diplomat (Asia)
- Guardian Australia
- EuroNews

### **Tier 4: Western State Media** (Heavy Scrutiny)
- BBC World News ⚠️ **Fact-check required**
- Deutsche Welle ⚠️ **Pro-NATO bias warning**
- ABC Australia

### **Tier 5: Wire Services** (Basic Facts Only)
- AP News
- Reuters

---

## 🎯 **Key Features**

### **1. Smart Source Selection**
Automatically detects query topic and selects appropriate sources:

```
Query: "Palestine protests"
→ Prioritizes: Al Jazeera, Middle East Eye, Electronic Intifada

Query: "Australian climate policy"  
→ Prioritizes: Guardian Australia, ABC Australia, Grist

Query: "Union strike in US"
→ Prioritizes: Labor Notes, Democracy Now, Jacobin
```

### **2. Source Bias Tracking**
Every source includes metadata:
- `bias_classification`: independent_progressive, state_media_nonwestern, etc.
- `trust_level`: highest, high, medium, low
- `bias_warning`: Pro-NATO bias, Pro-establishment, etc.
- `use_for_analysis`: true/false (can we use for progressive analysis?)

### **3. Hourly Caching**
- RSS feeds cached for 1 hour
- Reduces server load
- Faster response times
- Automatic cache cleanup

### **4. Guardian API Integration**
- 5,000 free requests/day
- High-quality global coverage
- Fact-checking protocol applied
- Tagged with establishment bias warning

---

## 🚀 **Deployment Steps**

### **Prerequisites**

1. **Install RSS Parser Package**:
   ```bash
   ssh root@185.193.126.13
   cd /var/www/workforce-democracy/backend
   npm install rss-parser
   ```

2. **Add Guardian API Key to Environment**:
   ```bash
   nano .env
   ```
   
   Add line:
   ```
   GUARDIAN_API_KEY=[REDACTED_GUARDIAN_API_KEY]
   ```

### **Step 1: Backup**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service.js.v37.2.1.backup
ls -lh ai-service.js*
```

### **Step 2: Upload New Files**

```bash
# From your local machine
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.3.0"

# Upload rss-service.js (NEW FILE)
scp backend/rss-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Upload modified ai-service.js
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### **Step 3: Verify Files**

```bash
ssh root@185.193.126.13 "ls -lh /var/www/workforce-democracy/backend/*.js | grep -E 'rss-service|ai-service'"
```

Should show both files with recent timestamps.

### **Step 4: Install Dependencies**

```bash
ssh root@185.193.126.13 "cd /var/www/workforce-democracy/backend && npm install rss-parser"
```

**Expected output**:
```
added 1 package
```

### **Step 5: Add Environment Variable**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
nano .env
```

Add (if not already there):
```
GUARDIAN_API_KEY=[REDACTED_GUARDIAN_API_KEY]
```

Save: `Ctrl+O`, Enter, `Ctrl+X`

### **Step 6: Restart Backend**

```bash
pm2 restart backend
```

### **Step 7: Check Logs**

```bash
pm2 logs backend --lines 50
```

**Look for**:
- ✅ No errors about missing 'rss-parser'
- ✅ Server started successfully

---

## 🧪 **Testing**

### **Test 1: Global News Query**

**In terminal**:
```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 0"
```

**On website**, ask:
**"What's happening in Palestine?"**

**Expected backend logs**:
```
🌍 Global news search: "What's happening in Palestine?"
  🎯 Detected: regions=[middle_east], topics=[middle_east]
📡 Fetching RSS: Al Jazeera English
  ✅ Al Jazeera English: Found 3 articles
📡 Fetching RSS: Middle East Eye
  ✅ Middle East Eye: Found 3 articles
📡 Fetching RSS: Electronic Intifada
  ✅ Electronic Intifada: Found 3 articles
✅ Global news: Found 9 sources
  📊 Breakdown: 6 independent, 3 alternative, 0 establishment
```

---

### **Test 2: Australian News Query**

**Ask**: **"Australian climate policy"**

**Expected logs**:
```
🌍 Global news search: "Australian climate policy"
  🎯 Detected: regions=[asia_pacific], topics=[australia, climate]
📡 Fetching RSS: Guardian Australia
📡 Fetching RSS: ABC News Australia  
📡 Fetching RSS: Grist (Climate)
🗞️  Searching Guardian API: "Australian climate policy"
✅ Global news: Found 8 sources
```

---

### **Test 3: Latin America Query**

**Ask**: **"Venezuela economic policy"**

**Expected logs**:
```
🌍 Global news search: "Venezuela economic policy"
  🎯 Detected: regions=[latin_america]
📡 Fetching RSS: TeleSUR English
📡 Fetching RSS: NACLA
📡 Fetching RSS: Democracy Now
✅ Global news: Found 7 sources
```

---

### **Test 4: Labor/Union Query**

**Ask**: **"UAW strike update"**

**Expected logs**:
```
🌍 Global news search: "UAW strike update"
  🎯 Detected: topics=[labor]
📡 Fetching RSS: Labor Notes
📡 Fetching RSS: Jacobin
📡 Fetching RSS: Democracy Now
✅ Global news: Found 8 sources
```

---

## 📊 **Source Bias Display**

Sources now include bias metadata. Frontend can display:

```
Sources:
[1] Democracy Now - Palestine Protests [Independent Progressive ✓]
[2] Al Jazeera - Gaza Update [Alternative Perspective - State-funded ⚠️]
[3] BBC World - Middle East News [State Media - Fact-check required ⚠️]
[4] The Guardian - Israel Response [Establishment Liberal - Verify ⚠️]
```

---

## 🎯 **Regional Coverage**

| Region | Sources | Trust Level |
|--------|---------|-------------|
| **US** | 8 independent + 2 wire | Highest |
| **Middle East** | 3 independent + 1 state (Al Jazeera) | Highest/High |
| **Latin America** | 1 independent + 1 state (TeleSUR) | High |
| **Europe** | 3 establishment + 1 state (BBC, DW) | Medium |
| **Asia-Pacific** | 3 establishment | Medium |
| **Australia** | 3 establishment | Medium |
| **Africa** | 2 sources | Medium |

---

## 💰 **Cost Analysis**

| Service | Requests/Day | Cost/Month | Cost/Year |
|---------|--------------|------------|-----------|
| **RSS Feeds** | Unlimited | $0 | $0 |
| **Guardian API** | 5,000/day | $0 | $0 |
| **Total** | - | **$0** | **$0** |

**vs. Previous Options**:
- NewsAPI: $449/month = $5,388/year
- Bing News: $7/month = $84/year

**Savings**: $5,388/year ✅

---

## 🔍 **How It Works**

### **Query Processing Flow**:

```
1. User asks: "What's happening in Palestine?"
   ↓
2. Detect region: middle_east
   ↓
3. Select appropriate RSS feeds:
   - Al Jazeera (state media, alternative perspective)
   - Middle East Eye (independent)
   - Electronic Intifada (independent)
   - Mondoweiss (independent)
   ↓
4. Fetch RSS feeds in parallel (cached if recent)
   ↓
5. Sort by trust level (independent first)
   ↓
6. Return top 10 sources
   ↓
7. AI uses sources with bias awareness
   ↓
8. User sees sources with bias warnings
```

---

## ⚠️ **Important Notes**

### **1. BBC Fact-Checking**
- BBC tagged as `state_media_western`
- Bias warning: "Pro-Western, pro-NATO bias"
- `use_for_analysis`: false
- Use for basic facts only, not analysis

### **2. Deutsche Welle Restrictions**
- Tagged as `state_media_western`
- Bias warning: "Pro-NATO bias on foreign policy"
- Good for: EU politics, climate, German domestic
- Avoid for: NATO, Russia, Ukraine analysis

### **3. Guardian Fact-Checking**
- Tagged as `establishment_liberal`
- Bias warning: "Verify progressive claims"
- `use_for_analysis`: false
- Good reporting but establishment bias

### **4. Al Jazeera Context**
- Tagged as `state_media_nonwestern`
- Note: Qatar-funded
- Excellent Middle East coverage
- `use_for_analysis`: true (provides alternative perspective)

---

## 🐛 **Troubleshooting**

### **Error: Cannot find module 'rss-parser'**

**Fix**:
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
npm install rss-parser
pm2 restart backend
```

### **Error: Guardian API returns 401**

**Fix**: Check `.env` file has correct API key:
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
cat .env | grep GUARDIAN
```

Should show:
```
GUARDIAN_API_KEY=[REDACTED_GUARDIAN_API_KEY]
```

### **No RSS Sources Found**

**Check logs**:
```bash
pm2 logs backend | grep "RSS"
```

Look for network errors, timeouts, or invalid URLs.

### **Cache Not Clearing**

**Manual clear** (if needed):
```javascript
// In Node.js console or add endpoint:
rssService.clearRSSCache();
```

---

## 📈 **Performance**

### **Response Times**:
- **First request** (no cache): 2-5 seconds (RSS fetching)
- **Cached request**: <100ms (instant)
- **Cache duration**: 1 hour

### **Memory Usage**:
- Each RSS feed: ~10KB cached
- 50 feeds: ~500KB total
- Minimal impact on server

### **Rate Limits**:
- **Guardian API**: 5,000/day (very generous)
- **RSS Feeds**: No limits (direct scraping)

---

## 🔄 **Future Enhancements**

### **Phase 2 Possibilities**:
1. **More Languages**: Spanish, Arabic, French RSS feeds
2. **Video Sources**: Democracy Now video feed
3. **Podcasts**: RSS feeds for audio content
4. **Regional Expansion**: More African, Asian sources
5. **Real-time Alerts**: Breaking news notifications
6. **Source Scoring**: User feedback on source quality

---

## ✅ **Success Criteria**

After deployment:

- [ ] No "Cannot find module" errors
- [ ] RSS feeds fetching successfully
- [ ] Guardian API working
- [ ] Sources include bias metadata
- [ ] Cache working (check logs show "Using cache")
- [ ] Different regions get appropriate sources
- [ ] No 403 errors from DuckDuckGo (it's now backup)

---

## 📚 **Documentation**

- **RSS Service Code**: `backend/rss-service.js`
- **Integration**: `backend/ai-service.js` (lines ~880-920)
- **Environment**: `backend/.env`
- **Package**: `rss-parser` in `package.json`

---

**Status**: ✅ Ready for Deployment  
**Risk**: Low (fallback to old system if RSS fails)  
**Independence**: 💯 100% Big Tech Free  
**Cost**: $0/month forever
