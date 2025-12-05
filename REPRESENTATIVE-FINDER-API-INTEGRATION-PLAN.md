# 🌍 Representative Finder - Multi-Country API Integration Plan

**Date:** November 1, 2025  
**Version:** V36.11.0  
**Scope:** 7 Countries with Government API + DDG Fallback

---

## 📊 **Current Status Analysis**

### **✅ What You Already Have:**

1. **Congress.gov API** (Federal US Bills & Legislation) ✅
   - API Key: Configured
   - Used for: Bills, legislation tracking
   - **NOT used for representatives yet**

2. **DuckDuckGo Web Scraper** ✅
   - Privacy-focused search
   - Multi-region support (US, UK, Canada, Australia, NZ, EU)
   - Trusted source filtering
   - Already implemented in `backend/government-apis.js`

3. **Australian Parliament API** ✅
   - Integrated via `backend/australian-parliament-api.js`
   - Functions available:
     - `searchAustralianMP()`
     - `getMPDetails()`
     - `getVotingRecord()`
     - `searchHansard()`

4. **ProPublica API** ⚠️
   - Code exists but you mentioned it's discontinued for representatives
   - Keep code for future fallback

---

## 🎯 **Countries Supported** (from your existing code):

1. 🇺🇸 **USA**
2. 🇲🇽 **Mexico**
3. 🇦🇺 **Australia**
4. 🇩🇪 **Germany**
5. 🇫🇷 **France**
6. 🇨🇦 **Canada**
7. 🇬🇧 **UK**

---

## 🚀 **Implementation Strategy**

### **Phase 1: Use Congress.gov for US Federal Representatives** ⭐
**Priority: HIGH - You already have the API key!**

Congress.gov has a `/member` endpoint we're not using yet:

```
GET https://api.congress.gov/v3/member
GET https://api.congress.gov/v3/member/{bioguideId}
GET https://api.congress.gov/v3/member/{chamber}/{stateAbbr}
```

**This gives us:**
- All current Senators and House Representatives
- Full names, party, state, district
- Office phone, email, website
- Committee assignments
- Biographical info
- Official photos

**Implementation:**
- Create `getCongressMembers()` function
- Create `getMembersByState()` function  
- Map ZIP → State + District using FCC API (free, government)
- Return real representative data

---

### **Phase 2: OpenStates API for US State Legislators** ⭐
**Priority: MEDIUM - Sign up required**

**You mentioned you tried before and couldn't get it - let's troubleshoot:**

Common issues:
1. **Email verification required** - Check spam folder
2. **API key activation delay** - Takes 5-15 minutes
3. **Free tier limits** - 1000 requests/day (plenty for your use case)

**Signup URL:** https://openstates.org/accounts/profile/

**Once you have the key:**
- Add to `.env`: `OPENSTATES_API_KEY=your_key_here`
- Covers all 50 US states + DC + territories
- State senators, house/assembly members
- Real names, parties, districts, contact info

---

### **Phase 3: DuckDuckGo Fallback for All Countries** ⭐
**Priority: HIGH - Already implemented!**

**For countries without APIs, use your existing DDG scraper:**

```javascript
// From government-apis.js (already exists!)
searchWebForCandidate(candidateName, location)
```

**Features you already have:**
- ✅ Auto-detects country from query
- ✅ Searches region-specific trusted sources
- ✅ Privacy-focused (no tracking)
- ✅ Caching support
- ✅ Fact-checking via trusted sources

**Trusted sources by region** (from your existing code):
- **US:** nytimes.com, propublica.org, ballotpedia.org, politico.com, npr.org
- **UK:** bbc.co.uk, theguardian.com, parliament.uk, independent.co.uk
- **Canada:** cbc.ca, theglobeandmail.com, thestar.com, macleans.ca
- **Australia:** abc.net.au, theconversation.com, smh.com.au
- **EU:** europarl.europa.eu, politico.eu, euobserver.com

---

## 📋 **Recommended API Sources Per Country**

### 🇺🇸 **USA**

**Federal (Senators + House):**
- ✅ **Congress.gov API** - Official, free, you have key
- Fallback: DDG scraper

**State Legislators:**
- ✅ **OpenStates API** - Try signing up again
- Fallback: DDG scraper + Ballotpedia

**Local (City Council, Judges):**
- ✅ **DDG scraper** (already implemented)
- ✅ **Ballotpedia scraper** (already implemented in `government-apis.js`)

---

### 🇨🇦 **Canada**

**Federal MPs:**
- **Represent API** - https://represent.opennorth.ca/
  - ✅ Free, no API key
  - ✅ Open source, non-profit
  - ✅ JSON responses
  - Covers House of Commons + Senate
  
**Provincial:**
- **Represent API** - Same as above
- Fallback: DDG scraper

---

### 🇬🇧 **UK**

**Parliament (MPs):**
- **UK Parliament API** - https://members-api.parliament.uk/
  - ✅ Official government API
  - ✅ Free, no API key required
  - ✅ JSON responses
  - House of Commons + House of Lords

**Alternative:**
- **TheyWorkForYou API** - https://www.theyworkforyou.com/api/
  - ✅ Non-profit, open source
  - ✅ Free API key
  - ✅ Voting records included

---

### 🇦🇺 **Australia**

**Federal Parliament:**
- ✅ **Your existing Australian Parliament API** (already integrated!)
- Functions ready to use:
  - `searchAustralianMP(name, electorate)`
  - `getMPDetails(mpId)`
  - `getVotingRecord(mpId)`

**Issue you mentioned:**
- "OpenAustralia was only providing HTML returns not JSON"
- ✅ **Your current implementation handles this!** (uses web scraping)
- Fallback: DDG scraper

---

### 🇩🇪 **Germany**

**Bundestag (Federal):**
- **Bundestag API** - https://www.bundestag.de/services/opendata
  - ⚠️ XML format (not JSON)
  - ⚠️ Complex structure
  - **Recommendation:** Use DDG scraper instead

**Alternative:**
- **Abgeordnetenwatch.de API** - https://www.abgeordnetenwatch.de/api
  - ✅ Independent non-profit
  - ✅ JSON responses
  - ✅ Free tier available
  - Covers Bundestag + European Parliament (German MEPs)

---

### 🇫🇷 **France**

**Assemblée Nationale (National Assembly):**
- **Open Data API** - https://www.assemblee-nationale.fr/dyn/opendata
  - ⚠️ XML format
  - ⚠️ French-language only
  - **Recommendation:** Use DDG scraper instead

**Senate:**
- **Sénat Open Data** - https://data.senat.fr/
  - ⚠️ Limited API
  - **Recommendation:** Use DDG scraper

---

### 🇲🇽 **Mexico**

**Congress (Cámara de Diputados + Senado):**
- **Sistema de Información Legislativa** - http://sil.gobernacion.gob.mx/
  - ⚠️ No public API
  - **Recommendation:** Use DDG scraper

**Alternative:**
- Manual scraping from official chamber websites
- **Recommendation:** DDG scraper with verified sources

---

## 🛠️ **Implementation Roadmap**

### **Step 1: Enhance US Representatives (Immediate - You have the API key!)**

**Backend changes:**
1. Add Congress.gov member lookup functions
2. Add FCC API for ZIP → Congressional District
3. Connect to existing `/api/civic/representatives` endpoint
4. Return real representative data instead of mocks

**Estimated time:** 2-3 hours

---

### **Step 2: Add Non-Big-Tech APIs (While you sign up for OpenStates)**

**Add these free, non-tracking APIs:**
1. **Canada - Represent API** (no key needed)
2. **UK - Parliament API** (no key needed)
3. **UK - TheyWorkForYou** (free key)
4. **Germany - Abgeordnetenwatch.de** (free tier)

**Estimated time:** 3-4 hours

---

### **Step 3: Implement Universal DDG Fallback**

**For all countries without APIs:**
1. Use existing `searchWebForCandidate()` function
2. Add caching layer (save results for 30 days)
3. Add verification badge for trusted sources
4. Display search results with source attribution

**Your existing DDG implementation already:**
- ✅ Detects country automatically
- ✅ Filters trusted sources per region
- ✅ Privacy-focused (no tracking)

**Estimated time:** 2 hours

---

### **Step 4: Add Fact-Checking & Verification**

**Implement automatic verification system:**
1. Cross-reference multiple sources
2. Flag conflicting information
3. Show source quality indicators
4. Add "Last verified" timestamps
5. Cache verified data (30-90 days)

**Verification levels:**
- 🟢 **Verified** - Official government source
- 🟡 **Reliable** - 2+ trusted sources agree
- 🟠 **Unverified** - Single source only
- 🔴 **Conflicting** - Sources disagree

**Estimated time:** 3-4 hours

---

## 💾 **Caching Strategy**

**To reduce API calls and improve performance:**

```javascript
// Cache structure
{
  zip_or_location: "90210",
  country: "USA",
  representatives: [...],
  cached_at: 1730500000000,
  verified_at: 1730500000000,
  verification_level: "verified",
  sources: ["congress.gov", "openstates.org"],
  expires_at: 1733092000000  // 30 days
}
```

**Cache duration:**
- Federal reps: 180 days (elections every 2 years)
- State reps: 90 days (varies by state)
- Local reps: 30 days (more volatility)
- DDG searches: 30 days (web content changes)

---

## 📊 **API Priority Matrix**

| Country | Level | Primary API | Fallback | Status |
|---------|-------|-------------|----------|--------|
| 🇺🇸 USA | Federal | Congress.gov ✅ | DDG | **Ready** |
| 🇺🇸 USA | State | OpenStates | DDG | **Sign up needed** |
| 🇨🇦 Canada | All | Represent API | DDG | **Needs implementation** |
| 🇬🇧 UK | All | UK Parliament API | TheyWorkForYou + DDG | **Needs implementation** |
| 🇦🇺 Australia | All | Your existing API ✅ | DDG | **Ready** |
| 🇩🇪 Germany | All | Abgeordnetenwatch.de | DDG | **Needs implementation** |
| 🇫🇷 France | All | DDG only | None | **DDG ready** |
| 🇲🇽 Mexico | All | DDG only | None | **DDG ready** |

---

## 🎯 **Next Steps**

**Immediate actions:**

1. **✅ I'll implement Congress.gov member lookup** (you have the key!)
2. **⏳ You try OpenStates signup again** (troubleshoot if blocked)
3. **✅ I'll add Canada Represent API** (no key needed)
4. **✅ I'll add UK Parliament API** (no key needed)
5. **✅ I'll enhance DDG fallback with verification**

---

## 📝 **Questions for You**

1. **Congress.gov API Key location:**
   - Is it in `/var/www/workforce-backend/.env`?
   - Variable name: `CONGRESS_API_KEY`?

2. **OpenStates roadblock:**
   - What specific error/issue did you encounter?
   - Do you want me to guide you through signup?

3. **Priority order:**
   - Which country should we implement first after USA?
   - All federal only, or include state/provincial?

4. **DDG verification:**
   - Should we show sources to users?
   - Or just use verification badges?

---

**Ready to proceed! Let me know and I'll start with Congress.gov integration!** 🚀
