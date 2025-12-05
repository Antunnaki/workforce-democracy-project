# 🇦🇺 Australian Government APIs - Complete Guide

**Date**: January 31, 2025  
**Privacy Rating**: ✅ Government open data sources (no Big Tech)  
**Integration Potential**: 🟢 HIGH - Multiple privacy-respecting options available  

---

## ✅ **RECOMMENDED: Privacy-Respecting Australian APIs**

### 1. OpenAustralia.org Foundation API ⭐ **BEST OPTION**

**Website**: https://www.openaustralia.org.au/  
**API Docs**: https://www.openaustralia.org.au/api/  
**Type**: Non-profit, open source, privacy-focused  

**Privacy**: ✅ **EXCELLENT**
- Non-profit organization
- No tracking or data collection
- Open source (https://github.com/openaustralia)
- Run by civic tech activists
- No Big Tech dependencies

**What It Provides**:
- ✅ **MPs and Senators** - All federal representatives
- ✅ **Hansard** - Full parliamentary debate transcripts
- ✅ **Voting records** - Division votes with details
- ✅ **Speeches** - What MPs said in parliament
- ✅ **Bills** - Legislation being debated

**API Details**:
- **Format**: REST API, XML responses (easy to parse)
- **Authentication**: API key required (free, just for rate limiting)
- **CORS**: May need backend proxy
- **Rate Limits**: Generous (hundreds per hour)
- **Cost**: FREE
- **Documentation**: https://www.openaustralia.org.au/api/docs/

**Example Endpoints**:
```
# Get all MPs
https://www.openaustralia.org.au/api/getMPs?key=YOUR_KEY&output=js

# Search Hansard
https://www.openaustralia.org.au/api/getHansard?key=YOUR_KEY&search=climate&output=js

# Get MP info
https://www.openaustralia.org.au/api/getMP?key=YOUR_KEY&id=10001&output=js

# Get votes (divisions)
https://www.openaustralia.org.au/api/getDebates?key=YOUR_KEY&type=senate&date=2024-01-15
```

**API Key Request**: https://www.openaustralia.org.au/api/key  
**Privacy Policy**: Non-profit, doesn't track users

---

### 2. They Vote For You API ⭐ **VOTING RECORDS**

**Website**: https://theyvoteforyou.org.au/  
**Type**: Open Knowledge Foundation Australia project  
**GitHub**: https://github.com/openaustralia/theyvoteforyou

**Privacy**: ✅ **EXCELLENT**
- Run by OpenAustralia Foundation
- Open source
- No user tracking
- Non-profit

**What It Provides**:
- ✅ **Voting records** - How MPs voted on every division
- ✅ **Policy positions** - MP positions on climate, healthcare, etc.
- ✅ **Voting patterns** - Agreements/disagreements between MPs
- ✅ **Bill tracking** - Status and votes on legislation

**Data Access**:
- **Web scraping**: Allowed (open data)
- **Potential API**: Check GitHub for data exports
- **CSV Downloads**: May be available
- **Database dumps**: Possibly available on request

**Integration Approach**:
1. Request data dump or API access from OpenAustralia Foundation
2. Backend scraping (if allowed in robots.txt)
3. Use OpenAustralia.org API for voting data

---

### 3. Parliament of Australia Open Data

**Website**: https://www.aph.gov.au/  
**Data Portal**: https://data.aph.gov.au/  
**Type**: Official government source

**Privacy**: ✅ **EXCELLENT**
- Official government data
- Public domain
- No tracking (government site)

**What It Provides**:
- ✅ **Parliamentary data** - Official records
- ✅ **Hansard** - Debate transcripts
- ✅ **Committee reports** - Inquiry findings
- ✅ **Bills** - Legislation details
- ✅ **Senators and MPs** - Contact information

**Data Formats**:
- XML feeds
- JSON (some endpoints)
- CSV downloads
- RSS feeds

**Access**:
- **Open data**: No authentication needed for most
- **Documentation**: Check data.aph.gov.au for specifics

---

### 4. data.gov.au - Australian Open Data Portal

**Website**: https://data.gov.au/  
**Search**: https://data.gov.au/search?q=parliament  
**Type**: Government open data platform

**Privacy**: ✅ **EXCELLENT**
- Official government portal
- Open data licenses
- No tracking of data usage

**Parliamentary Datasets**:
- Electoral data (AEC)
- Parliamentary boundaries
- Committee inquiry data
- Historical election results
- Member directories

**Format**: CSV, JSON, XML, APIs (varies by dataset)

**Example Datasets**:
- "Members of Parliament" - Contact info, electorates
- "Senate Votes" - Division records
- "House of Representatives Votes" - Voting records
- "Electoral Boundaries" - Geospatial data

---

### 5. Australian Electoral Commission (AEC)

**Website**: https://www.aec.gov.au/  
**Results**: https://results.aec.gov.au/  
**Type**: Official electoral authority

**Privacy**: ✅ **EXCELLENT**
- Government agency
- Public electoral data
- No user tracking

**What It Provides**:
- ✅ **Candidates** - All federal candidates
- ✅ **Election results** - Historical and current
- ✅ **Electoral boundaries** - Electorate maps
- ✅ **Polling places** - Voting locations
- ✅ **Donation data** - Campaign finance (limited)

**Data Access**:
- CSV downloads
- JSON feeds (results.aec.gov.au)
- GIS data (boundaries)
- Historical archives

---

## 🔧 **INTEGRATION RECOMMENDATION**

### **Option 1: OpenAustralia.org API (PRIMARY) ⭐**

**Why**: Best documented, most comprehensive, privacy-focused, actively maintained

**Implementation**:
```javascript
// backend/australian-parliament-api.js

const OPENAUSTRALIA_API = {
    BASE_URL: 'https://www.openaustralia.org.au/api',
    KEY: process.env.OPENAUSTRALIA_API_KEY // Free key from their website
};

async function searchAustralianMP(name) {
    const response = await axios.get(`${OPENAUSTRALIA_API.BASE_URL}/getMPs`, {
        params: {
            key: OPENAUSTRALIA_API.KEY,
            search: name,
            output: 'js'
        }
    });
    return response.data;
}

async function getVotingRecord(mpId) {
    const response = await axios.get(`${OPENAUSTRALIA_API.BASE_URL}/getDebates`, {
        params: {
            key: OPENAUSTRALIA_API.KEY,
            person: mpId,
            type: 'senate', // or 'representatives'
            output: 'js'
        }
    });
    return response.data;
}
```

**Steps**:
1. Request API key: https://www.openaustralia.org.au/api/key
2. Add to backend `.env`: `OPENAUSTRALIA_API_KEY=your_key`
3. Create `backend/australian-parliament-api.js`
4. Integrate with existing web search fallback
5. Test with Australian MP queries

---

### **Option 2: Web Scraping They Vote For You (SUPPLEMENTAL)**

**Why**: Excellent voting analysis, policy positions

**Implementation**:
```javascript
// Scrape They Vote For You for policy positions
async function getAustralianMPPolicyPositions(mpName) {
    const searchUrl = `https://theyvoteforyou.org.au/search?q=${encodeURIComponent(mpName)}`;
    // Scrape MP profile page
    // Extract policy positions (e.g., "voted strongly for climate action")
}
```

**Ethics**: 
- Check robots.txt first
- Respect rate limits
- Cache results
- Attribute data source

---

### **Option 3: Web Search (FALLBACK)**

**Why**: Already working, covers gaps, gets news context

**Current Implementation**: Already in your backend!

```javascript
// Your existing web search already works for Australian candidates
webSearchResults = await governmentAPIs.searchWebForCandidate(query, userLocation);
// Gets results from news sources covering Australian politics
```

---

## 📊 **COMPARISON: Australian vs US Data**

| Feature | US Data | Australian Data |
|---------|---------|-----------------|
| **Federal Reps** | ❌ ProPublica (discontinued) | ✅ OpenAustralia.org API |
| **Voting Records** | ❌ No free API | ✅ OpenAustralia + They Vote For You |
| **Bills/Legislation** | ✅ Congress.gov | ✅ Parliament House API |
| **Campaign Finance** | ⚠️ FEC (limited) | ⚠️ AEC (limited) |
| **News Context** | ✅ Web search | ✅ Web search |
| **Privacy** | ✅ Government APIs | ✅ Government + non-profit |

**Conclusion**: Australian data is actually BETTER because OpenAustralia.org is excellent!

---

## 🎯 **RECOMMENDED IMPLEMENTATION PLAN**

### **Phase 1: Add OpenAustralia.org API**

**Priority**: HIGH  
**Effort**: LOW (similar to existing Congress.gov integration)  
**Privacy**: ✅ Excellent (non-profit, no tracking)

**Steps**:
1. Request free API key from OpenAustralia.org
2. Create `backend/australian-parliament-api.js`
3. Add detection for Australian queries (keywords: "Australia", "MP", "Senator", state names)
4. Integrate with existing chat system
5. Test with queries like "Anthony Albanese", "Peter Dutton"

### **Phase 2: Add They Vote For You Data**

**Priority**: MEDIUM  
**Effort**: MEDIUM (scraping or data request)  
**Privacy**: ✅ Excellent (open data)

**Steps**:
1. Check if They Vote For You has data exports
2. Contact OpenAustralia Foundation for data access
3. Implement policy position enrichment
4. Add to MP profiles in responses

### **Phase 3: Web Search Fallback**

**Priority**: LOW (already working!)  
**Effort**: NONE  
**Privacy**: ✅ Excellent (DuckDuckGo)

**Status**: Your existing web search already works for Australian candidates!

---

## 🔐 **PRIVACY ASSESSMENT**

| Source | Privacy Rating | Why |
|--------|---------------|-----|
| **OpenAustralia.org** | ✅ **A+** | Non-profit, open source, no tracking |
| **They Vote For You** | ✅ **A+** | Same team as OpenAustralia |
| **Parliament House** | ✅ **A** | Official government, open data |
| **data.gov.au** | ✅ **A** | Government open data portal |
| **AEC** | ✅ **A** | Government electoral authority |
| **Web Search (DuckDuckGo)** | ✅ **A** | Privacy-focused search |
| ~~Google Civic API~~ | ❌ **F** | Corporate tracking, avoid |

**All recommended Australian sources are privacy-respecting!** 🎉

---

## 💡 **EXAMPLE: How It Would Work**

### User Query: "Tell me about Anthony Albanese"

**Backend Flow**:
```
1. Detect Australian query (keyword: "Albanese", context)
       ↓
2. Try OpenAustralia.org API
       ↓
   GET /api/getMP?search=Anthony Albanese
       ↓
   Returns:
     - Full name: Anthony Norman Albanese
     - Electorate: Grayndler (NSW)
     - Party: Australian Labor Party
     - Position: Prime Minister
     - Parliament: House of Representatives
       ↓
3. Get voting record
       ↓
   GET /api/getDebates?person=10001
       ↓
   Returns recent votes and speeches
       ↓
4. Supplement with They Vote For You
       ↓
   Policy positions:
     - Voted strongly FOR climate action
     - Voted FOR increasing welfare
     - Voted FOR Indigenous Voice
       ↓
5. Web search for recent news
       ↓
   DuckDuckGo: "Anthony Albanese" + recent
       ↓
   Get articles from Australian news sources
       ↓
6. Send to AI for synthesis
       ↓
   Groq/Llama 3.3 analyzes all data
       ↓
7. Return formatted response with citations
```

---

## 📝 **NEXT STEPS**

### **To Add Australian Support**:

1. ✅ **Request OpenAustralia.org API Key**
   - Go to: https://www.openaustralia.org.au/api/key
   - Explain: Educational project about democracy
   - Free approval within 24-48 hours

2. ✅ **Create Backend Integration**
   - File: `backend/australian-parliament-api.js`
   - Add to `backend/government-apis.js` exports
   - Update server.js to detect Australian queries

3. ✅ **Test with Australian Queries**
   - "Anthony Albanese"
   - "Peter Dutton"
   - "Adam Bandt climate change"
   - "Penny Wong foreign policy"

4. ✅ **Update Frontend**
   - Add "Works for AU representatives" to UI
   - Update help text
   - Add Australian flag icon (optional)

---

## 🌏 **BONUS: State/Territory Coverage**

OpenAustralia.org focuses on federal parliament, but state data is also available:

### **State Parliaments** (Requires separate research)

| State/Territory | Potential Sources |
|----------------|-------------------|
| **New South Wales** | parliament.nsw.gov.au |
| **Victoria** | parliament.vic.gov.au |
| **Queensland** | parliament.qld.gov.au |
| **Western Australia** | parliament.wa.gov.au |
| **South Australia** | parliament.sa.gov.au |
| **Tasmania** | parliament.tas.gov.au |
| **ACT** | parliament.act.gov.au |
| **Northern Territory** | parliament.nt.gov.au |

**Note**: State APIs vary - some may not have public APIs. Web search fallback would handle these.

---

## ✅ **SUMMARY**

| Question | Answer |
|----------|--------|
| **Is Google Civic API privacy-safe?** | ❌ No - tracks users, Big Tech |
| **Are Australian APIs available?** | ✅ Yes - excellent options! |
| **Best Australian source?** | ✅ OpenAustralia.org API |
| **Privacy rating?** | ✅ A+ (non-profit, no tracking) |
| **Integration difficulty?** | ✅ Easy (similar to Congress.gov) |
| **Cost?** | ✅ FREE |
| **Ready to implement?** | ✅ Yes - just need API key |

**Australian coverage is actually EASIER and BETTER than US coverage!** 🇦🇺🎉

---

## 🚀 **READY TO PROCEED?**

If you want Australian support, I can:
1. Create the backend integration code (`australian-parliament-api.js`)
2. Update server.js to detect Australian queries
3. Add OpenAustralia.org API calls
4. Test with example Australian MP queries

Just request an API key from OpenAustralia.org first (takes 1-2 days), then we can implement! 🚀
