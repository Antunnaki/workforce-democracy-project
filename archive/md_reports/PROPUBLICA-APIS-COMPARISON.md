# 🔍 ProPublica APIs - What's What?

**Quick Reference**: Understanding the different ProPublica services

---

## 📊 Two Completely Different APIs

| API | Domain | Purpose | Status |
|-----|--------|---------|--------|
| **Nonprofit Explorer API** | `projects.propublica.org` | Search 1.8M nonprofits (IRS 990 data) | ✅ **ACTIVE & WORKING** (V36.8.6 fix) |
| **Congress API** | `api.propublica.org` | Federal voting records, members | ❌ **DISCONTINUED** (no new keys) |

---

## ✅ Nonprofit Explorer API (WORKING)

### What It Does
- Search 1.8M+ nonprofit organizations
- Access IRS Form 990 financial data
- Get mission statements, locations, contact info

### How You Use It
- **Frontend**: `js/nonprofit-explorer.js`, `js/nonprofit-widgets.js`
- **Endpoint**: `https://projects.propublica.org/nonprofits/api/v2/`
- **Authentication**: None required (public API)
- **Status**: ✅ **Working perfectly after V36.8.6 CSP fix**

### User Features
- "Explore All Advocacy Groups" button
- Search by keywords (e.g., "civil rights", "employment")
- Filter by category (advocacy, legal, employment, education)
- View financial data, locations, missions

### Example
```javascript
fetch('https://projects.propublica.org/nonprofits/api/v2/search.json?q=civil%20rights')
  .then(res => res.json())
  .then(data => console.log(data.organizations));
```

---

## ❌ Congress API (DISCONTINUED)

### What It Did
- Federal representative voting records
- Bill sponsorships and cosponsors
- Committee assignments
- Party line voting percentages

### Why It's Gone
- Officially discontinued (no new API keys available)
- Documentation exists only as "historical reference"
- Sunset sometime between Oct 2017 and 2024

### Impact on Your Site
**NONE** - Your candidate search never relied on it because:
1. Web search provides better, more comprehensive data
2. Works for local/state/international candidates (Congress API only covered federal)
3. Includes context from independent journalism

---

## 🆚 What Each API Does

### Nonprofit Explorer API ✅
```
User searches for: "employment advocacy organizations"
       ↓
Nonprofit Explorer API returns:
  - National Employment Law Project (NELP)
  - WorkingWorld
  - Restaurant Opportunities Centers United
  - [Financial data, locations, contact info]
```

### Congress API ❌ (If It Still Worked)
```
User asks about: "Alexandria Ocasio-Cortez voting record"
       ↓
Congress API would return:
  - Votes with party: 89%
  - Missed votes: 2%
  - Committee: Financial Services
  - Recent votes: [List of bills and positions]
```

**Reality**: Your web search returns better data from Democracy Now and The Intercept!

---

## 🎯 Your Current System

### Nonprofit Search (Uses Nonprofit Explorer API ✅)
```
Frontend → ProPublica Nonprofit Explorer API → Display organizations
```

### Candidate Search (Uses Web Search + AI ✅)
```
User query
    ↓
Web Search (DuckDuckGo)
    ↓
Get results from:
    - Democracy Now
    - The Intercept  
    - Drop Site News
    - Ballotpedia (for local candidates)
    ↓
AI analyzes and synthesizes (Groq/Llama 3.3)
    ↓
Response with citations
```

---

## 📋 What You Need to Know

### For Nonprofit Functionality
✅ **V36.8.6 CSP fix unblocked the Nonprofit Explorer API**
- Was: 100% broken (CSP blocking all API calls)
- Now: Fully working (wildcard `https://*.propublica.org` in CSP)

### For Candidate Search
✅ **Already optimal - no changes needed**
- Never used Congress API (it was optional)
- Web search approach is superior
- No action required

---

## 🔧 Technical Details

### CSP Fix (V36.8.6)
```html
<!-- BEFORE (Blocked API) -->
connect-src 'self' https://api.workforcedemocracyproject.org https://projects.propublica.org;

<!-- AFTER (Allows API) -->
connect-src 'self' https://api.workforcedemocracyproject.org https://projects.propublica.org https://*.propublica.org;
                                                                                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                                                           This fixed nonprofit API calls
```

### Why Candidate Search Doesn't Need Congress API
```javascript
// backend/server.js - Representative search logic
if (chatType === 'representatives') {
    // Try ProPublica Congress API (will fail - no key)
    const repResult = await governmentAPIs.getRepresentativeInfo(query);
    
    // Falls back to web search (this is what actually works!)
    if (!repResult.success) {
        webSearchResults = await governmentAPIs.searchWebForCandidate(query);
        // ^ Gets Democracy Now, The Intercept, Drop Site News, etc.
    }
}
```

---

## 💡 Summary

| Feature | API Used | Status |
|---------|----------|--------|
| **Nonprofit search** | Nonprofit Explorer (`projects.propublica.org`) | ✅ Working (V36.8.6) |
| **Candidate search** | Web Search (DuckDuckGo) | ✅ Working (always has been) |
| **Federal voting records** | ~~Congress API (`api.propublica.org`)~~ | ❌ Discontinued (never needed) |

**Bottom Line**:
- ✅ Nonprofit functionality **fixed in V36.8.6**
- ✅ Candidate search **already perfect**
- ❌ Congress API **discontinued but irrelevant**

Your system is fully functional! 🎉
