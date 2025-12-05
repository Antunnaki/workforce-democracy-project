# 💡 FEATURE PROPOSAL: Campaign Promises vs Reality Analysis

## 🎯 YOUR VISION

> "What a representative states on their website as policy goals, and how their votes and actions contradicts their promises. Then a detailed analysis and explanation could be employed discussing these contradictions."

**This is an EXCELLENT feature!** Here's how we can implement it.

---

## 📋 PROPOSED IMPLEMENTATION

### **Phase 1: Data Collection (IMMEDIATE)**

**1. Campaign Website Scraping**
- Add campaign website URLs to database
- Scrape policy positions from official sites
- Store as structured data:
  ```javascript
  {
    candidate: "Zohran Mamdani",
    campaign_url: "https://www.mamdaninyc.com/issues",
    promises: [
      {
        category: "Housing",
        promise: "Expand rent control to all buildings",
        date_stated: "2024-03-15",
        source_url: "https://www.mamdaninyc.com/housing-plan"
      }
    ]
  }
  ```

**2. Voting Record Integration**
- Pull from Congress.gov API (already have access)
- Pull from NYC Council votes (for local candidates)
- Match votes to campaign promises

**3. Public Statements Archive**
- News articles quoting the candidate
- Social media posts (if available)
- Speeches and interviews

---

### **Phase 2: Contradiction Detection (SMART)**

**Automated Matching:**
```javascript
{
  candidate: "Zohran Mamdani",
  contradictions: [
    {
      promise: "Support universal rent control",
      reality: "Voted against Rent Control Expansion Act (Bill #1234)",
      date_promised: "2024-03-15",
      date_voted: "2024-08-20",
      severity: "HIGH", // Direct contradiction
      source_promise: "Campaign website",
      source_vote: "NYC Council Vote Record"
    }
  ]
}
```

**AI Analysis Prompt:**
```
CONTRADICTION ANALYSIS REQUIRED:

Campaign Promise (2024-03-15):
"I will fight for universal rent control in all NYC buildings"

Actual Vote (2024-08-20):
Voted AGAINST Bill #1234 (Rent Control Expansion Act)

Your Task:
1. Explain the contradiction clearly
2. Provide context (were there other factors?)
3. Show impact on constituents
4. Let users draw their own conclusions
```

---

### **Phase 3: UI Display (USER-FACING)**

**Example Output:**
```
Zohran Mamdani's Policies:

AFFORDABILITY AGENDA [1] [2]:
✅ Promised: Expand rent control
📊 Reality: Voted FOR Rent Stabilization Act (2024-06-15) [Vote Record]
✅ Consistent with campaign promise

HOUSING JUSTICE [3]:
✅ Promised: "No tenant left behind"
❌ Reality: Voted AGAINST Emergency Housing Fund (2024-09-01) [Vote Record]
⚠️  CONTRADICTION DETECTED

ANALYSIS:
While Mamdani campaigned on comprehensive tenant protections, his vote
against the Emergency Housing Fund contradicts this stated priority.
The fund would have provided $50M for eviction prevention, directly
supporting tenants facing displacement...
```

---

## 🔧 TECHNICAL ARCHITECTURE

### **New Database Tables:**

**1. `campaign_promises`**
```sql
CREATE TABLE campaign_promises (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255),
    promise_text TEXT,
    category VARCHAR(100), -- Housing, Healthcare, etc.
    date_stated DATE,
    source_url TEXT,
    created_at TIMESTAMP
);
```

**2. `voting_records`**
```sql
CREATE TABLE voting_records (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255),
    bill_number VARCHAR(100),
    bill_title TEXT,
    vote VARCHAR(50), -- YES, NO, ABSTAIN
    vote_date DATE,
    bill_summary TEXT,
    source_url TEXT,
    created_at TIMESTAMP
);
```

**3. `contradictions` (auto-generated)**
```sql
CREATE TABLE contradictions (
    id SERIAL PRIMARY KEY,
    candidate_name VARCHAR(255),
    promise_id INTEGER REFERENCES campaign_promises(id),
    vote_id INTEGER REFERENCES voting_records(id),
    contradiction_type VARCHAR(50), -- DIRECT, INDIRECT, NUANCED
    severity VARCHAR(20), -- HIGH, MEDIUM, LOW
    ai_analysis TEXT,
    created_at TIMESTAMP
);
```

---

## 🎯 IMPLEMENTATION PHASES

### **PHASE 1: Quick Win (1-2 days)**
- ✅ Increase search limit (15 → 50) - **DONE in v37.19.7**
- ✅ Fix person-name detection - **DONE in v37.19.7**
- ⏳ Add manual campaign URLs for top candidates
- ⏳ Scrape policy pages

### **PHASE 2: Voting Records (3-5 days)**
- Connect to Congress.gov API
- Connect to NYC Council API
- Store voting history

### **PHASE 3: Contradiction Analysis (5-7 days)**
- Build matching algorithm
- Add contradiction detection to AI prompt
- Create UI for displaying contradictions

### **PHASE 4: Automated Updates (ongoing)**
- Daily scraper for new votes
- Alert system for new contradictions
- Historical tracking

---

## 💭 QUESTIONS FOR YOU

**1. Priority Candidates:**
Which candidates should we start with?
- [ ] Zohran Mamdani (NYC Mayor)
- [ ] AOC (Congressional)
- [ ] Bernie Sanders (Senate)
- [ ] All progressive candidates?

**2. Data Sources:**
Which sources should we prioritize?
- [ ] Campaign websites (official)
- [ ] Congress.gov (federal votes)
- [ ] NYC Council (local votes)
- [ ] State legislatures (via OpenStates API)
- [ ] Social media (Twitter/X)?

**3. Analysis Style:**
How should we present contradictions?
- [ ] Factual only (just show the data)
- [ ] AI analysis (explain context)
- [ ] Both (data + analysis)

**4. Immediate Action:**
Want me to start with:
- [ ] v37.19.7 (more sources) - READY NOW
- [ ] Campaign website scraper for Mamdani
- [ ] Voting record integration
- [ ] All of the above

---

## 🚀 READY FOR v37.19.7 NOW

**Immediate fix available:**
- Increased search limit: 15 → 50 articles
- Fixed person-name detection (excludes "policies", "campaign", etc.)
- Better keyword filtering

**File**: `article-search-service-v37.19.7-MORE-SOURCES.js`

This should give you 10-20+ sources instead of just 4.

---

**What would you like me to implement first?** 🎯
