# Version 37.2.0 - Independent Local Election Sources

**Date**: November 5, 2025  
**Type**: Backend Enhancement - NO BIG TECH  
**Priority**: HIGH - Enables local election coverage

---

## 🎯 **What's New**

### **100% Independent from Big Tech**

Added four new source types for local election coverage:

1. ✅ **Enhanced Ballotpedia Scraping** - Non-profit political encyclopedia
2. ✅ **Wikipedia API** - Wikimedia Foundation (non-profit)
3. ✅ **Local News Scraping** - Direct from community journalism
4. ✅ **Manual Source Curation** - Hand-picked local race links

**Zero Big Tech APIs** - No Google, no Facebook, no Amazon

---

## 📊 **New Capabilities**

### **Before v37.2.0**:
- ❌ Dorcey Applyrs (Albany mayor) → "Not a known candidate"
- ❌ Local races → No sources found
- ❌ Regional news → Generic national sources only

### **After v37.2.0**:
- ✅ Dorcey Applyrs → Ballotpedia profile + election info
- ✅ Local races → Times Union, Gothamist, The City coverage
- ✅ Regional news → Community journalism sources
- ✅ Candidate backgrounds → Wikipedia profiles

---

## 🗂️ **New Data Sources**

### **1. Local Independent News**

| Source | Coverage | Type |
|--------|----------|------|
| **The City NYC** | NYC | Independent journalism |
| **Gothamist** | NYC | Local news |
| **Times Union** | Albany, Capital Region | Regional news |
| **Syracuse.com** | Syracuse, Central NY | Regional news |
| **Buffalo News** | Buffalo, Western NY | Regional news |

**Cache**: 3 days (local news updates frequently)  
**Rate Limit**: 1 second delay between requests (ethical)

---

### **2. Wikipedia (Wikimedia Foundation)**

**What it provides**:
- Candidate biographies
- Background information
- Career history
- Political positions

**API Endpoint**: `https://en.wikipedia.org/api/rest_v1/page/summary/{name}`

**Example**:
- Query: "Tell me about Dorcey Applyrs"
- Returns: Wikipedia summary + link to full article

**Cache**: 30 days (biographical info stable)  
**Rate Limit**: Respectful (per candidate query)

---

### **3. Ballotpedia (Non-Profit)**

**What it provides**:
- Candidate profiles
- Election results
- Local race coverage
- Campaign information

**Example URLs**:
- `https://ballotpedia.org/Dorcey_Applyrs`
- `https://ballotpedia.org/Albany,_New_York_mayoral_election,_2025`

**Cache**: 14 days (election info updates frequently)  
**Rate Limit**: 2 second delay (ethical)

---

### **4. Curated Local Races**

**Hand-picked sources for known races**:

Currently includes:
- ✅ Albany Mayor 2025 (Dorcey Applyrs)

**Easy to expand** - Just add new entries to configuration

---

## 🔧 **Technical Implementation**

### **Multi-Source Strategy**

The system now uses **intelligent routing**:

```
User Query
    ↓
Is it a local election? → Search local news sources
    ↓
Is it a candidate query? → Search Wikipedia + Ballotpedia
    ↓
Is it campaign finance? → Search OpenSecrets
    ↓
National/state topic? → Search DuckDuckGo
    ↓
Combine all results → Validate → Return sources
```

### **Query Detection**

**Local Election Detection**:
```javascript
/mayor|city council|county|local|albany|buffalo|syracuse|rochester/
```

**Candidate Query Detection**:
```javascript
/candidate|running for|who is|tell me about/
```

**Campaign Finance Detection**:
```javascript
/donor|contribution|campaign finance|pac|funding/
```

---

## 📝 **Files Modified**

### **backend/ai-service.js**

**New Configuration** (Lines ~260):
- `LOCAL_NEWS_SOURCES` - Regional news outlets

**New Functions**:
1. `searchWikipedia(candidateName)` - Line ~620
2. `searchBallotpedia(query)` - Line ~670
3. `searchLocalNews(query, region)` - Line ~730
4. `getKnownLocalRaceSources(query)` - Line ~850

**Updated Function**:
- `searchAdditionalSources()` - Enhanced with multi-source strategy

**Module Exports** - Added new functions

---

## 🚀 **Deployment Steps**

### **Step 1: Backup Current Version**

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service.js.v37.1.4.backup
ls -lh ai-service.js*
```

### **Step 2: Upload Modified File**

```bash
# From your local machine
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.2.0"
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

### **Step 3: Verify Upload**

```bash
ssh root@185.193.126.13 "grep -c 'V37.2.0' /var/www/workforce-democracy/backend/ai-service.js"
```

**Expected output**: `15` (or similar - multiple v37.2.0 markers)

### **Step 4: Restart Backend**

```bash
ssh root@185.193.126.13 "pm2 restart backend"
```

### **Step 5: Monitor Logs**

```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 50"
```

---

## 🧪 **Testing Guide**

### **Test 1: Albany Mayor (Curated Sources)**

**Query**: "Can you tell me about Dorcey Applyrs?"

**Expected Sources**:
- ✅ Ballotpedia: Dorcey Applyrs profile
- ✅ Ballotpedia: Albany mayoral election 2025
- ✅ Wikipedia: Dorcey Applyrs (if available)

**Backend Logs to Look For**:
```
📌 Found 2 curated sources for local race
📖 Searching Wikipedia for: Dorcey Applyrs
🗳️  Searching Ballotpedia for: Dorcey Applyrs
✅ Found 4 total sources (2 curated, 2 searched)
```

---

### **Test 2: Local News Coverage**

**Query**: "What are the latest developments in the Albany mayoral race?"

**Expected Sources**:
- ✅ Times Union articles
- ✅ Local NY news coverage
- ✅ Ballotpedia election page

**Backend Logs to Look For**:
```
📰 Searching 5 local news sources for: "Albany mayoral race"
  ✅ Times Union (Albany): Found article - ...
  ✅ The City NYC: Found article - ...
✅ Found 5 total sources
```

---

### **Test 3: Candidate Background**

**Query**: "Tell me about Kathy Sheehan"

**Expected Sources**:
- ✅ Wikipedia: Kathy Sheehan
- ✅ Ballotpedia: Kathy Sheehan
- ✅ Local news if available

**Backend Logs to Look For**:
```
📖 Searching Wikipedia for: Kathy Sheehan
  ✅ Found Wikipedia article: Kathy Sheehan
🗳️  Searching Ballotpedia for: Kathy Sheehan
  ✅ Found Ballotpedia profile
```

---

### **Test 4: NYC Local Race**

**Query**: "Who is running for NYC mayor?"

**Expected Sources**:
- ✅ The City NYC articles
- ✅ Gothamist coverage
- ✅ Ballotpedia NYC mayoral election page

**Backend Logs to Look For**:
```
📰 Searching 5 local news sources for: "NYC mayor"
  ✅ The City NYC: Found article - ...
  ✅ Gothamist: Found article - ...
```

---

## 📊 **Cache Strategy**

| Source Type | Cache Duration | Reasoning |
|-------------|----------------|-----------|
| Wikipedia | 30 days | Biographical info changes slowly |
| Ballotpedia | 14 days | Election info updates regularly |
| Local News | 3 days | News updates frequently |
| Campaign Finance | 90 days | Quarterly updates (OpenSecrets) |
| DuckDuckGo | 7 days | General news has medium shelf life |

---

## 🎯 **Success Metrics**

After deployment, measure:

1. **Local Coverage Rate**:
   - % of local election queries with sources found
   - Target: >80% for known races

2. **Source Diversity**:
   - Mix of Ballotpedia, Wikipedia, local news
   - Target: 3+ different source types per query

3. **Response Quality**:
   - User satisfaction with local candidate info
   - Reduced "no sources found" for local queries

---

## 🔍 **Debugging Commands**

### **Check if v37.2.0 is Active**

```bash
ssh root@185.193.126.13 "grep 'V37.2.0' /var/www/workforce-democracy/backend/ai-service.js | head -5"
```

### **Watch Real-Time Logs**

```bash
ssh root@185.193.126.13 "pm2 logs backend --lines 0"
```

Then ask a local election query and watch for:
- `📌 Found X curated sources`
- `📖 Searching Wikipedia`
- `🗳️  Searching Ballotpedia`
- `📰 Searching X local news sources`

### **Check Cache Contents**

Backend logs will show cache hits:
```
📖 Using cached Wikipedia data for Dorcey Applyrs (5 days old)
```

---

## 🛠️ **Adding New Local Races**

To add coverage for a new local race, edit `getKnownLocalRaceSources()`:

```javascript
// Buffalo Mayor 2025 - Example
if (lowerQuery.includes('buffalo') && lowerQuery.includes('mayor')) {
    sources.push({
        title: 'Buffalo, New York mayoral election, 2025',
        url: 'https://ballotpedia.org/Buffalo,_New_York_mayoral_election,_2025',
        source: 'Ballotpedia',
        type: 'election',
        excerpt: 'Coverage of Buffalo mayoral race...',
        date: new Date().toISOString()
    });
}
```

**Then**:
1. Edit ai-service.js on server
2. Add new race detection
3. Restart PM2: `pm2 restart backend`

---

## 🌟 **Key Benefits**

1. **100% Independent** - No Big Tech APIs or tracking
2. **Community-Focused** - Local journalism sources prioritized
3. **Non-Profit First** - Wikipedia, Ballotpedia, local news
4. **Cost-Effective** - All free sources
5. **Ethical Scraping** - Respectful rate limits, proper user agents
6. **Expandable** - Easy to add new regions/races

---

## ⚠️ **Known Limitations**

1. **Scraping Fragility**:
   - News site HTML changes can break scrapers
   - Mitigation: Multiple fallback sources

2. **Coverage Gaps**:
   - Very small local races may not be in Ballotpedia
   - Mitigation: Manual curation feature

3. **Rate Limits**:
   - Ethical delays mean slightly slower responses
   - Trade-off: Independence from Big Tech worth the 2-3 second delay

4. **403 Errors**:
   - Some sites may block bots occasionally
   - Mitigation: Diverse source portfolio

---

## 🔄 **Rollback Plan**

If issues occur:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
cp ai-service.js.v37.1.4.backup ai-service.js
pm2 restart backend
pm2 logs backend --lines 50
```

---

## 📈 **Future Enhancements**

**Phase 2 Possibilities**:
- Add more regional news sources (Boston, Philadelphia, etc.)
- Integrate ProPublica Local Reporting Network
- Add city council race coverage
- School board elections
- County-level races

**All without Big Tech!**

---

**Deployment Status**: ✅ Ready for Production  
**Risk Level**: Low (additive features, no breaking changes)  
**Independence Level**: 💯 100% Big Tech Free
