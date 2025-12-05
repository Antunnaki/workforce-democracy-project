# 🗳️ VOTING RECORDS FEATURE - COMPLETE SPECIFICATION

**Feature Name:** Representative Voting Records & Constituent Impact Analysis  
**Version:** V37.18.0-VOTING-RECORDS  
**Date:** November 24, 2025  
**Status:** 📋 **DOCUMENTED - READY FOR IMPLEMENTATION**

---

## 🚨 **CRITICAL: READ FIRST** 🚨

**⚠️ VERSION CONTROL RULES ⚠️**

### **BEFORE IMPLEMENTING THIS FEATURE:**

```
✅ ALL CHANGES GO TO VERSION B (Test) ONLY
   Location: /var/www/workforce-democracy/version-b/

❌ NEVER EDIT VERSION A (Production) DIRECTLY
   Location: /var/www/workforce-democracy/version-a/

✅ DEPLOY WHEN TESTED: ./deployment-scripts/sync-b-to-a.sh
```

**📖 Full Version Control Rules:** `🚨-VERSION-CONTROL-RULES-🚨.md`

**🎯 Implementation Workflow:**
1. Edit files in VERSION B
2. Test on GenSpark (https://sxcrlfyt.gensparkspace.com/)
3. Verify backend on port 3002
4. Deploy to VERSION A when stable
5. Verify live site (https://workforcedemocracyproject.org/)

---

## 🎯 **EXECUTIVE SUMMARY**

Add comprehensive voting records to each representative's card, allowing users to:
1. ✅ View recent votes (last 5, expandable by +5)
2. ✅ See AI analysis of each bill
3. ✅ Understand constituent impact (federal → state → local → demographic)
4. ✅ See how ALL representatives voted on each bill
5. ✅ Contact representatives via pre-populated email about specific votes
6. ✅ Identify party-line defectors and "spoilers"

---

## 📋 **FEATURE REQUIREMENTS - USER CONFIRMED**

### **1. Representative Card Layout (Option C)**

**Current Issue:** Only "Website" button showing (see screenshot)

**New Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ 📷 Josh Riley (D) ✓ VERIFIED                               │
│    FEDERAL | U.S. Representative | New York-19             │
│                                                             │
│    [📞 Call] [📧 Email] [🌐 Website] [ℹ️ More Contact]     │
│                                                             │
│    ▼ Recent Votes (5)                          [View All]  │ ← Accordion (collapsed by default)
│      └─ [Voting records appear when expanded]              │
└────────────────────────────────────────────────────────────┘
```

**Behavior:**
- ✅ Auto-close other accordions when opening a new one
- ✅ "View All" → Opens separate full voting record page for that rep
- ✅ Accordion closed by default to save space

---

### **2. Voting Records Display**

#### **2A. Recent Votes Accordion (5 votes)**

**Format:**
```
▼ Recent Votes (5)                                    [View All]
  
  ┌──────────────────────────────────────────────────────────┐
  │ HR 1234: Affordable Housing Act of 2024                  │
  │ Vote: ✓ YES    Date: Nov 15, 2024    Passed 218-212 ← Clickable │
  │ ▼ Bill Details                                           │
  │   └─ [AI Analysis, Constituent Impact, Email Rep]       │
  └──────────────────────────────────────────────────────────┘
  
  [+ Show 5 More Votes]
```

**Data Source:**
- **Federal:** Congress.gov API (excellent data ✅)
- **State:** OpenStates API (New York well-covered ✅)

**Caching Strategy:**
- ✅ Cache votes for **7 days** in PostgreSQL
- ✅ First user triggers API call, subsequent users get cached data
- ✅ Reuses existing `bill-cache.js` infrastructure

**SQL Schema for Voting Records:**
```sql
CREATE TABLE representative_votes (
    id SERIAL PRIMARY KEY,
    rep_id VARCHAR(255) NOT NULL,
    bill_id VARCHAR(255) NOT NULL,
    vote VARCHAR(20) NOT NULL, -- 'YES', 'NO', 'ABSTAIN', 'PRESENT'
    vote_date TIMESTAMP NOT NULL,
    bill_title TEXT,
    bill_type VARCHAR(50), -- 'substantive', 'procedural'
    vote_margin VARCHAR(50), -- e.g., 'Passed 218-212'
    party_line_vote BOOLEAN, -- Did rep vote with party?
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP, -- NOW() + 7 days
    INDEX idx_rep_id (rep_id),
    INDEX idx_bill_id (bill_id),
    INDEX idx_vote_date (vote_date)
);
```

---

### **3. Filtering & Sorting**

#### **3A. Topic Filters**
**User Requirement:** "If the user filters by anything, such as by topic, it shows the most recent of that topic"

**Topics:**
- 🏥 Healthcare
- 💼 Economy & Jobs
- 🌍 Environment & Climate
- 🎓 Education
- 🏠 Housing
- 🛡️ Defense & Security
- ⚖️ Justice & Civil Rights
- 🚗 Infrastructure & Transportation
- 💰 Taxes & Budget
- 🌾 Agriculture & Rural
- 📡 Technology & Internet
- 🏛️ Government Reform

**UI:**
```
[Filter by Topic: All ▼]
  └─ All Votes
  └─ Healthcare
  └─ Economy & Jobs
  └─ Environment
  └─ ...

[+ Show 5 More Votes] ← Adds 5 more of selected topic
```

**Implementation:**
```javascript
// Filter votes by topic, show 5 at a time
let displayedVotes = 5;
let currentFilter = 'all';

function filterVotesByTopic(topic) {
    currentFilter = topic;
    displayedVotes = 5;
    const filtered = votes.filter(v => 
        topic === 'all' || v.bill_topic === topic
    );
    renderVotes(filtered.slice(0, displayedVotes));
}

function showMoreVotes() {
    displayedVotes += 5;
    // Re-render with new limit
}
```

---

### **4. Bill Details Expansion**

When user clicks a bill title, expand to show:

```
┌──────────────────────────────────────────────────────────────┐
│ HR 1234: Affordable Housing Act of 2024                      │
│ Vote: ✓ YES    Date: Nov 15, 2024    Passed 218-212 ← Click │
│                                                               │
│ ▼ Bill Details                                               │
│                                                               │
│   📊 AI ANALYSIS (Cached)                                    │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Summary: This bill provides $50B in affordable      │   │
│   │ housing subsidies for low-income families...        │   │
│   │                                                      │   │
│   │ Impact Score: 4/5 (Pro-Worker)                      │   │
│   │ Key Provisions:                                     │   │
│   │  • $50B in housing subsidies                        │   │
│   │  • Rent control provisions                          │   │
│   │  • Tenant protections                               │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                               │
│   🎯 CONSTITUENT IMPACT (ZIP-based + Scalable)               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ Federal: Affects 2.5M workers nationwide            │   │
│   │ State: 125,000 families in New York                 │   │
│   │ Local: 12,000 households in Albany County           │   │
│   │ ZIP 12061: Approximately 450 families               │   │
│   │                                                      │   │
│   │ Economic Impact: Could reduce rent burden by $200/mo│   │
│   │ for qualifying households in your area.             │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                               │
│   💬 ASK QUESTIONS ABOUT THIS BILL                           │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ "How does this affect teachers in my area?"         │   │
│   │ "Why did my rep vote yes on this?"                  │   │
│   │ "What are the downsides?"                           │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                               │
│   📧 EMAIL REP ABOUT THIS VOTE                               │
│   [✉️ Email Josh Riley about this vote]                     │
│                                                               │
│   ▼ How Everyone Voted (Click to expand)                     │
│   [Passed 218-212] ← Click to see all votes                 │
│                                                               │
│   ▼ Vote Details                                             │
│   └─ Date: Nov 15, 2024, 3:45 PM                            │
│   └─ Co-sponsors: 45 members                                 │
│   └─ Party-line vote: YES (87% of Democrats voted YES)       │
└──────────────────────────────────────────────────────────────┘
```

---

### **5. "How Everyone Voted" Feature (Option C)**

**User Requirement:** "Show your 15 reps first, then show all 535"

**Click "Passed 218-212" to expand:**

```
▼ How Everyone Voted on HR 1234
  
  YOUR REPRESENTATIVES (15):
  ┌──────────────────────────────────────────────────┐
  │ ✓ Chuck Schumer (D) - YES                        │
  │ ✓ Kirsten Gillibrand (D) - YES                   │
  │ ✓ Paul Tonko (D) - YES                           │
  │ ✗ Elise Stefanik (R) - NO ⚠️ Party defector      │
  │   ... (11 more local reps)                       │
  └──────────────────────────────────────────────────┘
  
  [▼ Show All 535 Congressional Votes]
  
  ALL HOUSE VOTES (435):
  ┌──────────────────────────────────────────────────┐
  │ Nancy Pelosi (D-CA) - YES                        │
  │ Kevin McCarthy (R-CA) - NO                       │
  │ Alexandria Ocasio-Cortez (D-NY) - YES            │
  │ ... (432 more)                                   │
  └──────────────────────────────────────────────────┘
```

**Features:**
- ✅ Your local reps highlighted (✓ checkmark)
- ✅ Party affiliation shown: (D), (R), (I)
- ✅ Party defectors highlighted: ⚠️ (voted against majority of party)
- ✅ Searchable/filterable by name, state, party

---

### **6. Party-Line Voting Analysis**

**User Requirement:** "Show % of voting along party lines to identify spoilers"

**Display on representative card:**
```
┌────────────────────────────────────────────────────┐
│ Josh Riley (D) ✓ VERIFIED                          │
│ U.S. Representative | New York-19                  │
│                                                     │
│ Party-Line Voting: 87% ⬆️                          │
│ (Votes with Democrats 87% of the time)             │
│                                                     │
│ Notable Defections:                                │
│  • HR 5678: Voted NO (party voted YES) - Energy Bill│
│  • S 1234: Voted YES (party voted NO) - Tax Reform │
└────────────────────────────────────────────────────┘
```

**Calculation:**
```javascript
function calculatePartyLineVoting(rep, votes) {
    const partyVotes = votes.filter(v => v.party_majority_vote);
    const withParty = partyVotes.filter(v => 
        v.vote === v.party_majority_vote
    ).length;
    
    return {
        percentage: (withParty / partyVotes.length) * 100,
        defections: votes.filter(v => 
            v.vote !== v.party_majority_vote
        )
    };
}
```

**SQL Query:**
```sql
-- Get party-line voting %
SELECT 
    rep_id,
    COUNT(*) as total_votes,
    SUM(CASE WHEN party_line_vote = true THEN 1 ELSE 0 END) as party_line_votes,
    ROUND(
        (SUM(CASE WHEN party_line_vote = true THEN 1 ELSE 0 END)::NUMERIC / COUNT(*)) * 100, 
        2
    ) as party_line_percentage
FROM representative_votes
WHERE rep_id = 'josh-riley-ny19'
GROUP BY rep_id;
```

---

### **7. Email Pre-Population**

**User Requirement:** Option D (Neutral) + Option B (Template)

**Click "📧 Email Josh Riley about this vote":**

```javascript
function generateEmailLink(rep, bill, vote) {
    const subject = `Constituent inquiry regarding ${bill.id} (${bill.title})`;
    
    const body = `Dear ${rep.title} ${rep.name},

I am a constituent from ZIP code ${userZipCode}. I noticed you voted ${vote.vote} on ${bill.id} (${bill.title}) on ${vote.date}.

[User fills in their question/concern here]

According to my research, this bill could ${bill.constituent_impact}.

Could you please explain your vote and how it benefits our community?

Thank you,
[Your name]`;

    const mailto = `mailto:${rep.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    return mailto;
}
```

**Example Email:**
```
To: josh.riley@mail.house.gov
Subject: Constituent inquiry regarding HR 1234 (Affordable Housing Act)

Dear Representative Riley,

I am a constituent from ZIP code 12061. I noticed you voted YES 
on HR 1234 (Affordable Housing Act of 2024) on November 15, 2024.

[User's question here]

According to my research, this bill could reduce rent burden by 
$200/month for 450 families in our area.

Could you please explain your vote and how it benefits our community?

Thank you,
[User's name]
```

---

### **8. AI Assistant Integration (Option C - Both Contexts)**

**User Requirement:** "It's all linked to the same AI assistant, just in different areas"

#### **8A. Bill-Level Questions**

**Context:** User viewing HR 1234 bill details

```javascript
// AI Assistant Prompt for Bill Questions
const billQuestionPrompt = `
You are analyzing ${bill.id}: ${bill.title}.

BILL CONTEXT:
- Summary: ${bill.summary}
- Representative's Vote: ${vote.vote} on ${vote.date}
- Constituent Impact: ${bill.constituent_impact}
- Your ZIP: ${userZipCode}

USER QUESTION:
${userQuestion}

Provide a clear answer focusing on:
1. How this bill affects the user's local area (ZIP ${userZipCode})
2. Why the representative might have voted ${vote.vote}
3. Material impact on workers and families
4. Demographic-specific impact if asked (e.g., teachers, veterans)
`;
```

**Example:**
```
User: "How does this affect teachers in my area?"

AI: "The Affordable Housing Act (HR 1234) could significantly 
benefit teachers in ZIP 12061:

• Local Impact: Approximately 85 public school teachers in 
  Albany County qualify for the $50B subsidy program.
  
• Economic Benefit: Teachers earning under $75k/year could 
  receive up to $300/month in rent assistance.
  
• School District Impact: Stable housing could help retain 
  teachers in the area, addressing the current shortage.

Representative Riley voted YES, aligning with teacher unions 
who supported this bill."
```

#### **8B. Representative-Level Questions**

**Context:** User viewing Josh Riley's voting record

```javascript
// AI Assistant Prompt for Rep Questions
const repQuestionPrompt = `
You are analyzing Representative ${rep.name}'s voting record.

REPRESENTATIVE CONTEXT:
- Name: ${rep.name}
- Party: ${rep.party}
- District: ${rep.district}
- Recent Votes: ${recentVotes}
- Party-Line Voting: ${partyLinePercentage}%

USER QUESTION:
${userQuestion}

Provide a clear answer focusing on:
1. The representative's voting patterns
2. How votes align with constituent interests
3. Notable defections or party-line votes
4. Impact on local community (ZIP ${userZipCode})
`;
```

**Example:**
```
User: "Why did he vote NO on the energy bill?"

AI: "Representative Riley voted NO on HR 5678 (Clean Energy Act) 
on Oct 10, 2024, breaking with 87% of Democrats who voted YES.

Possible Reasons:
1. District Impact: NY-19 includes rural areas dependent on 
   natural gas jobs (~2,500 workers).
   
2. Economic Concerns: The bill's transition timeline was criticized 
   for being too aggressive for rural communities.
   
3. Local Feedback: Riley held 3 town halls where constituents 
   expressed concern about job losses.

This was one of only 3 times Riley voted against his party 
this year (87% party-line voting overall).

Contact him to ask directly: josh.riley@mail.house.gov"
```

---

### **9. State Representative Voting Records (Option B)**

**User Requirement:** "Show for both, display 'Limited data' message, AI explains why"

**For State Reps with Limited Data:**

```
▼ Recent Votes (State Legislature)

  ⚠️ LIMITED DATA AVAILABLE
  
  New York State provides partial voting records through OpenStates.
  Some votes may be missing or delayed.
  
  💬 Why is this?
  
  [AI Assistant explains:]
  
  "New York State Legislature publishes voting records, but:
  
  1. Committee votes are often not recorded publicly
  2. Voice votes (no roll call) are not tracked
  3. Data updates can be delayed by 2-4 weeks
  
  To request better transparency:
  📧 Contact your state representative: [email]
  📧 Contact NY Senate Clerk: records@nysenate.gov
  
  You can also file a FOIL request (Freedom of Information Law):
  🔗 https://www.dos.ny.gov/coog/foil2.html"
  
  Available Votes (3):
  └─ A1234: Education Funding Bill - YES (Sep 15, 2024)
  └─ S5678: Healthcare Expansion - YES (Aug 22, 2024)
  └─ A9012: Climate Action Bill - YES (Jul 10, 2024)
```

**AI Follow-Up Questions:**

```
User: "Why don't they publish all votes?"

AI: "Many state legislatures, including New York, have different 
transparency standards than the federal government:

1. Tradition: Historically, state legislatures operated with 
   less public scrutiny than Congress.
   
2. Committee Work: Much legislative work happens in committees 
   where votes aren't always recorded.
   
3. Unanimous Consent: Bills with broad support pass via 
   'voice vote' with no individual record.

WHO TO CONTACT:
📧 Your State Senator: [email]
📧 NY Senate Majority Leader: [email]
📧 Government Accountability Groups:
   - NY PIRG: https://nypirg.org
   - Reinvent Albany: https://reinventalbany.org

These groups advocate for legislative transparency reforms."
```

---

### **10. Full Voting Record Page**

**User Requirement:** "Separate page for that rep, user can load all bills and sort/filter"

**URL Format:**
```
/representative-voting-record.html?id=josh-riley-ny19
```

**Page Layout:**
```
┌────────────────────────────────────────────────────────────┐
│ 📷 Josh Riley (D) - Full Voting Record                     │
│    U.S. Representative | New York-19                       │
│    Party-Line Voting: 87% | Total Votes: 243              │
│                                                             │
│    [← Back to Representatives]                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ FILTERS & SORTING                                          │
│                                                             │
│ Topic: [All ▼]  Year: [2024 ▼]  Vote: [All ▼]            │
│ Sort by: [Newest First ▼]                                 │
│                                                             │
│ Search: [Search by bill number or keyword...]              │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│ VOTING RECORD (Showing 5 of 243)                          │
│                                                             │
│ HR 1234: Affordable Housing Act                            │
│ ✓ YES | Nov 15, 2024 | Passed 218-212                     │
│ [Expand for details]                                       │
│                                                             │
│ HR 5678: Clean Energy Act                                  │
│ ✗ NO ⚠️ Party defector | Oct 10, 2024 | Passed 220-210    │
│ [Expand for details]                                       │
│                                                             │
│ ... (3 more votes)                                         │
│                                                             │
│ [+ Show 5 More Votes]                                      │
└────────────────────────────────────────────────────────────┘
```

**Filters:**
```javascript
const filters = {
    topic: ['all', 'healthcare', 'economy', 'environment', ...],
    year: [2024, 2023, 2022, 2021],
    vote: ['all', 'YES', 'NO', 'ABSTAIN'],
    partyLine: ['all', 'with-party', 'against-party']
};

const sortOptions = [
    'newest-first',
    'oldest-first',
    'alphabetical',
    'impact-score-high',
    'impact-score-low'
];

function applyFilters(votes, filters, sort) {
    let filtered = votes.filter(v => {
        if (filters.topic !== 'all' && v.topic !== filters.topic) return false;
        if (filters.year !== 'all' && new Date(v.date).getFullYear() !== filters.year) return false;
        if (filters.vote !== 'all' && v.vote !== filters.vote) return false;
        if (filters.partyLine === 'with-party' && !v.party_line_vote) return false;
        if (filters.partyLine === 'against-party' && v.party_line_vote) return false;
        return true;
    });
    
    return sortVotes(filtered, sort);
}
```

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Database Schema**

```sql
-- Representative Votes Table
CREATE TABLE representative_votes (
    id SERIAL PRIMARY KEY,
    rep_id VARCHAR(255) NOT NULL,
    rep_name VARCHAR(255),
    rep_party VARCHAR(10), -- 'D', 'R', 'I'
    rep_level VARCHAR(20), -- 'federal', 'state'
    
    bill_id VARCHAR(255) NOT NULL,
    bill_title TEXT NOT NULL,
    bill_topic VARCHAR(100), -- 'healthcare', 'economy', etc.
    bill_type VARCHAR(50), -- 'substantive', 'procedural'
    
    vote VARCHAR(20) NOT NULL, -- 'YES', 'NO', 'ABSTAIN', 'PRESENT'
    vote_date TIMESTAMP NOT NULL,
    vote_margin VARCHAR(50), -- e.g., 'Passed 218-212'
    
    party_line_vote BOOLEAN, -- Did rep vote with party majority?
    party_majority_vote VARCHAR(20), -- What did party majority vote?
    
    cosponsored BOOLEAN DEFAULT false,
    
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    
    FOREIGN KEY (bill_id) REFERENCES bills_cache(bill_id),
    
    INDEX idx_rep_id (rep_id),
    INDEX idx_bill_id (bill_id),
    INDEX idx_vote_date (vote_date DESC),
    INDEX idx_topic (bill_topic),
    INDEX idx_expires (expires_at)
);

-- Vote Roll Call (All members' votes on a bill)
CREATE TABLE vote_roll_call (
    id SERIAL PRIMARY KEY,
    bill_id VARCHAR(255) NOT NULL,
    chamber VARCHAR(20), -- 'house', 'senate', 'state_assembly', 'state_senate'
    
    total_yes INT,
    total_no INT,
    total_abstain INT,
    total_present INT,
    
    result VARCHAR(50), -- 'Passed', 'Failed', 'Tabled'
    
    -- Store all votes as JSONB for easy querying
    all_votes JSONB, -- [{"rep_id": "...", "vote": "YES", "party": "D"}, ...]
    
    cached_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
    
    INDEX idx_bill_id (bill_id)
);

-- Party Voting Statistics
CREATE TABLE party_voting_stats (
    id SERIAL PRIMARY KEY,
    rep_id VARCHAR(255) NOT NULL,
    
    total_votes INT DEFAULT 0,
    party_line_votes INT DEFAULT 0,
    party_line_percentage DECIMAL(5,2),
    
    notable_defections JSONB, -- [{"bill_id": "...", "date": "...", "reason": "..."}, ...]
    
    last_updated TIMESTAMP DEFAULT NOW(),
    
    INDEX idx_rep_id (rep_id),
    UNIQUE (rep_id)
);
```

### **Backend API Endpoints**

```javascript
// File: backend/routes/voting-routes.js

/**
 * GET /api/voting/representative/:repId/recent
 * 
 * Fetch recent votes for a representative
 * Query params:
 *   - limit: Number of votes (default: 5)
 *   - offset: Pagination offset (default: 0)
 *   - topic: Filter by topic (optional)
 *   - substantive_only: true/false (default: true)
 */
router.get('/representative/:repId/recent', async (req, res) => {
    const { repId } = req.params;
    const { limit = 5, offset = 0, topic, substantive_only = true } = req.query;
    
    try {
        // Check cache first
        const cached = await getRecentVotesFromCache(repId, limit, offset, topic);
        if (cached) {
            return res.json({ votes: cached, cached: true });
        }
        
        // Fetch from Congress.gov or OpenStates
        const votes = await fetchRecentVotes(repId, limit, offset, topic, substantive_only);
        
        // Cache for 7 days
        await cacheVotes(repId, votes);
        
        res.json({ votes, cached: false });
    } catch (error) {
        console.error('Error fetching votes:', error);
        res.status(500).json({ error: 'Failed to fetch voting records' });
    }
});

/**
 * GET /api/voting/bill/:billId/all-votes
 * 
 * Get all representatives' votes on a specific bill
 * Returns: { your_reps: [], all_reps: [], summary: {} }
 */
router.get('/bill/:billId/all-votes', async (req, res) => {
    const { billId } = req.params;
    const { user_zip } = req.query;
    
    try {
        // Check cache
        const cached = await getAllVotesFromCache(billId);
        if (cached) {
            const userReps = await getUserRepresentatives(user_zip);
            const yourVotes = cached.filter(v => userReps.includes(v.rep_id));
            
            return res.json({
                your_reps: yourVotes,
                all_reps: cached,
                cached: true,
                summary: calculateVoteSummary(cached)
            });
        }
        
        // Fetch from API
        const allVotes = await fetchAllVotesForBill(billId);
        
        // Cache for 7 days
        await cacheAllVotes(billId, allVotes);
        
        const userReps = await getUserRepresentatives(user_zip);
        const yourVotes = allVotes.filter(v => userReps.includes(v.rep_id));
        
        res.json({
            your_reps: yourVotes,
            all_reps: allVotes,
            cached: false,
            summary: calculateVoteSummary(allVotes)
        });
    } catch (error) {
        console.error('Error fetching all votes:', error);
        res.status(500).json({ error: 'Failed to fetch vote roll call' });
    }
});

/**
 * GET /api/voting/representative/:repId/party-line-stats
 * 
 * Get party-line voting statistics
 * Returns: { percentage, total_votes, defections: [] }
 */
router.get('/representative/:repId/party-line-stats', async (req, res) => {
    const { repId } = req.params;
    
    try {
        const stats = await calculatePartyLineStats(repId);
        res.json(stats);
    } catch (error) {
        console.error('Error calculating party-line stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});
```

### **Frontend JavaScript**

```javascript
// File: js/voting-records.js

/**
 * Load and display recent votes for a representative
 */
async function loadRecentVotes(repId, containerId, limit = 5) {
    const container = document.getElementById(containerId);
    container.innerHTML = '<div class="loading">Loading voting records...</div>';
    
    try {
        const response = await fetch(`/api/voting/representative/${repId}/recent?limit=${limit}&substantive_only=true`);
        const data = await response.json();
        
        if (data.votes && data.votes.length > 0) {
            renderVotingRecords(data.votes, container, repId);
        } else {
            container.innerHTML = '<p class="no-data">No recent voting records available.</p>';
        }
    } catch (error) {
        console.error('Error loading votes:', error);
        container.innerHTML = '<p class="error">Failed to load voting records.</p>';
    }
}

/**
 * Render voting records in accordion format
 */
function renderVotingRecords(votes, container, repId) {
    const html = `
        <div class="voting-records">
            ${votes.map(vote => `
                <div class="vote-card" data-bill-id="${vote.bill_id}">
                    <div class="vote-header" onclick="toggleVoteDetails('${vote.bill_id}')">
                        <h4>${vote.bill_id}: ${vote.bill_title}</h4>
                        <div class="vote-meta">
                            <span class="vote-badge vote-${vote.vote.toLowerCase()}">${vote.vote}</span>
                            <span class="vote-date">${formatDate(vote.vote_date)}</span>
                            <span class="vote-margin" onclick="showAllVotes('${vote.bill_id}', event)">
                                ${vote.vote_margin}
                            </span>
                            ${vote.party_line_vote ? '' : '<span class="defector-badge">⚠️ Party defector</span>'}
                        </div>
                    </div>
                    
                    <div class="vote-details" id="vote-details-${vote.bill_id}" style="display: none;">
                        <div class="bill-analysis-container" id="analysis-${vote.bill_id}">
                            <div class="loading">Loading AI analysis...</div>
                        </div>
                        
                        <div class="vote-actions">
                            <button onclick="emailRepAboutVote('${repId}', '${vote.bill_id}', '${vote.vote}')">
                                📧 Email Representative About This Vote
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
            
            <button class="show-more-btn" onclick="showMoreVotes('${repId}', ${votes.length + 5})">
                + Show 5 More Votes
            </button>
        </div>
    `;
    
    container.innerHTML = html;
}

/**
 * Toggle vote details (expand/collapse)
 */
function toggleVoteDetails(billId) {
    const details = document.getElementById(`vote-details-${billId}`);
    const isExpanded = details.style.display !== 'none';
    
    if (isExpanded) {
        details.style.display = 'none';
    } else {
        details.style.display = 'block';
        
        // Load AI analysis if not already loaded
        loadBillAnalysisForVote(billId);
    }
}

/**
 * Load AI bill analysis (reuses existing cache system!)
 */
async function loadBillAnalysisForVote(billId) {
    const container = document.getElementById(`analysis-${billId}`);
    
    try {
        // This endpoint already exists from V37.17.0!
        const response = await fetch('/api/ai/bills/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                bill: {
                    id: billId,
                    // Congress.gov will fill in the rest
                }
            })
        });
        
        const data = await response.json();
        
        if (data.analysis) {
            container.innerHTML = renderBillAnalysis(data.analysis, data.cached);
        }
    } catch (error) {
        console.error('Error loading bill analysis:', error);
        container.innerHTML = '<p class="error">Failed to load analysis.</p>';
    }
}

/**
 * Render bill analysis with constituent impact
 */
function renderBillAnalysis(analysis, cached) {
    return `
        <div class="ai-analysis ${cached ? 'cached' : 'fresh'}">
            ${cached ? '<span class="cache-badge">💾 Cached</span>' : ''}
            
            <div class="analysis-summary">
                <h5>📊 AI Analysis</h5>
                <p>${analysis.summary}</p>
                <p class="impact-score">Impact Score: ${analysis.impact_score}/5 (${analysis.economic_category})</p>
            </div>
            
            <div class="key-provisions">
                <h5>Key Provisions:</h5>
                <ul>
                    ${analysis.key_provisions.map(p => `<li>${p}</li>`).join('')}
                </ul>
            </div>
            
            <div class="constituent-impact">
                <h5>🎯 Constituent Impact (ZIP ${userZipCode})</h5>
                <div class="impact-levels">
                    <p><strong>Federal:</strong> ${analysis.federal_impact || 'Nationwide impact'}</p>
                    <p><strong>State:</strong> ${analysis.state_impact || 'Statewide impact'}</p>
                    <p><strong>Local:</strong> ${analysis.local_impact || 'Local area impact'}</p>
                    <p><strong>Economic:</strong> ${analysis.economic_impact}</p>
                </div>
            </div>
            
            <div class="ai-chat-container">
                <h5>💬 Ask Questions About This Bill</h5>
                <textarea id="bill-question-${analysis.bill_id}" placeholder="How does this affect teachers in my area?"></textarea>
                <button onclick="askBillQuestion('${analysis.bill_id}')">Ask AI</button>
                <div id="bill-answer-${analysis.bill_id}" class="ai-answer"></div>
            </div>
        </div>
    `;
}

/**
 * Show "How Everyone Voted" modal
 */
async function showAllVotes(billId, event) {
    event.stopPropagation(); // Prevent accordion toggle
    
    const modal = document.createElement('div');
    modal.className = 'vote-modal';
    modal.innerHTML = '<div class="modal-content"><div class="loading">Loading all votes...</div></div>';
    document.body.appendChild(modal);
    
    try {
        const response = await fetch(`/api/voting/bill/${billId}/all-votes?user_zip=${userZipCode}`);
        const data = await response.json();
        
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="this.parentElement.parentElement.remove()">×</span>
                
                <h3>How Everyone Voted on ${billId}</h3>
                <p class="vote-summary">${data.summary.result}: ${data.summary.total_yes} YES, ${data.summary.total_no} NO</p>
                
                <div class="your-reps-votes">
                    <h4>YOUR REPRESENTATIVES (${data.your_reps.length}):</h4>
                    ${data.your_reps.map(v => `
                        <div class="rep-vote">
                            ✓ ${v.rep_name} (${v.rep_party}) - <strong>${v.vote}</strong>
                            ${v.party_line_vote ? '' : '<span class="defector">⚠️ Party defector</span>'}
                        </div>
                    `).join('')}
                </div>
                
                <button class="show-all-btn" onclick="toggleAllCongressVotes('${billId}')">
                    ▼ Show All ${data.all_reps.length} Congressional Votes
                </button>
                
                <div id="all-congress-votes" style="display: none;">
                    <input type="text" placeholder="Search by name, state, or party..." onkeyup="filterCongressVotes(event)">
                    <div class="all-votes-list">
                        ${data.all_reps.map(v => `
                            <div class="rep-vote" data-name="${v.rep_name}" data-party="${v.rep_party}">
                                ${v.rep_name} (${v.rep_party}-${v.state}) - <strong>${v.vote}</strong>
                                ${v.party_line_vote ? '' : '<span class="defector">⚠️</span>'}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error loading all votes:', error);
        modal.innerHTML = '<div class="modal-content"><p class="error">Failed to load votes.</p></div>';
    }
}

/**
 * Email representative about specific vote
 */
function emailRepAboutVote(repId, billId, vote) {
    const rep = representatives.find(r => r.id === repId);
    const bill = cachedBills[billId];
    
    const subject = `Constituent inquiry regarding ${billId} (${bill.title})`;
    
    const body = `Dear ${rep.title} ${rep.name},

I am a constituent from ZIP code ${userZipCode}. I noticed you voted ${vote} on ${billId} (${bill.title}) on ${formatDate(bill.vote_date)}.

[Your question or concern here]

According to my research, this bill could ${bill.constituent_impact}.

Could you please explain your vote and how it benefits our community?

Thank you,
[Your name]`;

    const mailto = `mailto:${rep.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailto;
}

/**
 * Auto-close other accordions when opening a new one
 */
let currentlyOpenAccordion = null;

function toggleVotingAccordion(repId) {
    const accordion = document.getElementById(`voting-accordion-${repId}`);
    
    // Close previously open accordion
    if (currentlyOpenAccordion && currentlyOpenAccordion !== accordion) {
        currentlyOpenAccordion.style.display = 'none';
    }
    
    // Toggle current accordion
    if (accordion.style.display === 'none' || !accordion.style.display) {
        accordion.style.display = 'block';
        currentlyOpenAccordion = accordion;
        
        // Load votes if not already loaded
        if (!accordion.dataset.loaded) {
            loadRecentVotes(repId, `voting-container-${repId}`, 5);
            accordion.dataset.loaded = 'true';
        }
    } else {
        accordion.style.display = 'none';
        currentlyOpenAccordion = null;
    }
}
```

---

## 🎨 **CSS STYLING**

```css
/* File: css/voting-records.css */

/* Voting Records Accordion */
.voting-accordion {
    margin-top: 15px;
    border-top: 1px solid #e0e0e0;
    padding-top: 15px;
}

.voting-accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 8px;
    transition: background 0.3s;
}

.voting-accordion-header:hover {
    background: #e8e8e8;
}

.voting-accordion-header h4 {
    margin: 0;
    font-size: 16px;
    color: #333;
}

.view-all-btn {
    background: #667eea;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}

.view-all-btn:hover {
    background: #5568d3;
}

/* Vote Cards */
.vote-card {
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    margin: 10px 0;
    overflow: hidden;
    transition: box-shadow 0.3s;
}

.vote-card:hover {
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.vote-header {
    padding: 15px;
    cursor: pointer;
    background: white;
}

.vote-header h4 {
    margin: 0 0 10px 0;
    font-size: 15px;
    color: #333;
}

.vote-meta {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
    font-size: 14px;
}

.vote-badge {
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
}

.vote-badge.vote-yes {
    background: #4caf50;
    color: white;
}

.vote-badge.vote-no {
    background: #f44336;
    color: white;
}

.vote-badge.vote-abstain {
    background: #9e9e9e;
    color: white;
}

.vote-date {
    color: #666;
    font-size: 13px;
}

.vote-margin {
    color: #667eea;
    cursor: pointer;
    text-decoration: underline;
    font-weight: 500;
}

.vote-margin:hover {
    color: #5568d3;
}

.defector-badge {
    background: #ff9800;
    color: white;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
}

/* Vote Details (Expanded) */
.vote-details {
    padding: 20px;
    background: #f9f9f9;
    border-top: 1px solid #e0e0e0;
}

.ai-analysis {
    background: white;
    border: 2px solid #667eea;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
}

.ai-analysis.cached {
    border-color: #4caf50;
}

.cache-badge {
    background: #4caf50;
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    margin-bottom: 10px;
    display: inline-block;
}

.analysis-summary {
    margin-bottom: 20px;
}

.analysis-summary h5 {
    margin: 0 0 10px 0;
    font-size: 16px;
    color: #333;
}

.impact-score {
    font-weight: 600;
    color: #667eea;
    margin-top: 10px;
}

.key-provisions h5 {
    margin: 15px 0 10px 0;
    font-size: 15px;
    color: #333;
}

.key-provisions ul {
    margin: 0;
    padding-left: 20px;
}

.key-provisions li {
    margin: 8px 0;
    color: #555;
    line-height: 1.5;
}

.constituent-impact {
    background: #f0f4ff;
    border-left: 4px solid #667eea;
    padding: 15px;
    margin: 15px 0;
    border-radius: 4px;
}

.constituent-impact h5 {
    margin: 0 0 10px 0;
    font-size: 15px;
    color: #333;
}

.impact-levels p {
    margin: 8px 0;
    color: #555;
}

.impact-levels strong {
    color: #667eea;
}

/* AI Chat Container */
.ai-chat-container {
    margin-top: 20px;
    padding: 15px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
}

.ai-chat-container h5 {
    margin: 0 0 10px 0;
    font-size: 15px;
    color: #333;
}

.ai-chat-container textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    min-height: 60px;
}

.ai-chat-container button {
    background: #667eea;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    margin-top: 10px;
}

.ai-chat-container button:hover {
    background: #5568d3;
}

.ai-answer {
    margin-top: 15px;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 4px;
    display: none;
}

.ai-answer.visible {
    display: block;
}

/* Vote Actions */
.vote-actions {
    margin-top: 20px;
    text-align: center;
}

.vote-actions button {
    background: #667eea;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    font-size: 15px;
    cursor: pointer;
    transition: background 0.3s;
}

.vote-actions button:hover {
    background: #5568d3;
}

/* Show More Button */
.show-more-btn {
    width: 100%;
    padding: 12px;
    background: white;
    border: 2px solid #667eea;
    color: #667eea;
    border-radius: 8px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 15px;
    transition: all 0.3s;
}

.show-more-btn:hover {
    background: #667eea;
    color: white;
}

/* Vote Modal (for "How Everyone Voted") */
.vote-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: white;
    padding: 30px;
    border-radius: 12px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
}

.close-modal {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 30px;
    cursor: pointer;
    color: #999;
}

.close-modal:hover {
    color: #333;
}

.vote-summary {
    background: #f0f4ff;
    padding: 15px;
    border-radius: 8px;
    margin: 15px 0;
    font-weight: 600;
    color: #667eea;
}

.your-reps-votes {
    margin: 20px 0;
}

.your-reps-votes h4 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
}

.rep-vote {
    padding: 10px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.rep-vote:last-child {
    border-bottom: none;
}

.rep-vote strong {
    color: #667eea;
}

.defector {
    background: #ff9800;
    color: white;
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 11px;
    margin-left: 10px;
}

.show-all-btn {
    width: 100%;
    padding: 12px;
    background: white;
    border: 2px solid #667eea;
    color: #667eea;
    border-radius: 8px;
    font-size: 15px;
    cursor: pointer;
    margin: 20px 0;
}

.show-all-btn:hover {
    background: #667eea;
    color: white;
}

.all-votes-list {
    max-height: 400px;
    overflow-y: auto;
    margin-top: 15px;
}

/* Party-Line Voting Stats */
.party-line-stats {
    background: #f0f4ff;
    border-left: 4px solid #667eea;
    padding: 15px;
    margin: 15px 0;
    border-radius: 4px;
}

.party-line-percentage {
    font-size: 24px;
    font-weight: 700;
    color: #667eea;
}

.notable-defections {
    margin-top: 15px;
}

.notable-defections h5 {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #333;
}

.defection-item {
    padding: 8px;
    background: white;
    border-radius: 4px;
    margin: 5px 0;
    font-size: 13px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .vote-meta {
        flex-direction: column;
        align-items: flex-start;
    }
    
    .modal-content {
        width: 95%;
        padding: 20px;
    }
    
    .all-votes-list {
        max-height: 300px;
    }
}

/* Loading & Error States */
.loading {
    text-align: center;
    padding: 20px;
    color: #999;
}

.error {
    text-align: center;
    padding: 20px;
    color: #f44336;
    background: #ffebee;
    border-radius: 4px;
}

.no-data {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
}

/* State Rep Limited Data Warning */
.limited-data-warning {
    background: #fff3cd;
    border-left: 4px solid #ff9800;
    padding: 15px;
    margin: 15px 0;
    border-radius: 4px;
}

.limited-data-warning h5 {
    margin: 0 0 10px 0;
    color: #ff9800;
    font-size: 15px;
}

.transparency-actions {
    margin-top: 15px;
}

.transparency-actions a {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
}

.transparency-actions a:hover {
    text-decoration: underline;
}
```

---

## 🔄 **VERSION CONTROL & DEPLOYMENT SYSTEM**

**User Requirement:** "Create Version A/B system where live site = Version A, test = Version B"

### **System Architecture:**

```
Production (Live Site):
└─ workforcedemocracyproject.org → VERSION A (stable, production-ready)
   └─ Backend: 185.193.126.13:3001/api (VERSION A)

Testing (GenSpark):
└─ sxcrlfyt.gensparkspace.com → VERSION B (development, testing)
   └─ Backend: 185.193.126.13:3002/api (VERSION B)
```

### **Directory Structure:**

```
/var/www/workforce-democracy/
├── version-a/              ← PRODUCTION (PORT 3001)
│   ├── backend/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── utils/
│   │   └── .env (PORT=3001)
│   └── frontend/           (deployed to workforcedemocracyproject.org)
│
├── version-b/              ← TESTING (PORT 3002)
│   ├── backend/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── utils/
│   │   └── .env (PORT=3002)
│   └── frontend/           (deployed to GenSpark)
│
└── deployment-scripts/
    ├── sync-b-to-a.sh      ← Deploy Version B → Version A
    ├── backup-version-a.sh  ← Backup before deployment
    └── rollback.sh          ← Emergency rollback
```

### **Deployment Rules (CRITICAL):**

```
🚨 GOLDEN RULES - NEVER VIOLATE 🚨

1. ✅ ALL changes go to VERSION B ONLY
2. ❌ NEVER edit VERSION A directly
3. ✅ Test in VERSION B thoroughly
4. ✅ Deploy VERSION B → VERSION A only when stable
5. ✅ Always backup VERSION A before deployment
6. ❌ NEVER deploy if VERSION B has errors
```

### **Deployment Scripts:**

#### **File: `/var/www/workforce-democracy/deployment-scripts/sync-b-to-a.sh`**

```bash
#!/bin/bash

###############################################################################
# SYNC VERSION B → VERSION A (PRODUCTION DEPLOYMENT)
# 
# 🚨 CRITICAL: This script deploys tested changes to production
# 
# USAGE:
#   ./sync-b-to-a.sh
# 
# SAFETY CHECKS:
#   1. Backs up VERSION A before deployment
#   2. Runs tests on VERSION B
#   3. Requires confirmation before proceeding
#   4. Provides rollback if something goes wrong
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 WORKFORCE DEMOCRACY DEPLOYMENT SYSTEM"
echo "     Deploying VERSION B (Test) → VERSION A (Production)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}Step 1: Running pre-deployment checks...${NC}"

# Check if VERSION B exists
if [ ! -d "/var/www/workforce-democracy/version-b" ]; then
    echo -e "${RED}ERROR: VERSION B not found!${NC}"
    exit 1
fi

# Check if VERSION B backend is running
if ! curl -s http://localhost:3002/api/health > /dev/null; then
    echo -e "${RED}ERROR: VERSION B backend (port 3002) is not responding!${NC}"
    echo "Please start VERSION B backend and ensure it's working before deploying."
    exit 1
fi

echo -e "${GREEN}✓ VERSION B backend is running${NC}"

# Step 2: Run tests on VERSION B
echo ""
echo -e "${YELLOW}Step 2: Running tests on VERSION B...${NC}"

# Test representative API
REPS_TEST=$(curl -s http://localhost:3002/api/civic/representatives/search?zip=12061 | jq -r '.representatives | length' 2>/dev/null || echo "0")
if [ "$REPS_TEST" -ne "15" ]; then
    echo -e "${RED}ERROR: Representatives API test failed! Expected 15, got $REPS_TEST${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Representatives API test passed (15 reps)${NC}"

# Test bills cache
CACHE_TEST=$(curl -s -X POST http://localhost:3002/api/ai/bills/analyze \
    -H 'Content-Type: application/json' \
    -d '{"bill": {"id": "deployment-test", "title": "Test", "level": "federal", "status": "Introduced"}}' \
    | jq -r '.success' 2>/dev/null || echo "false")
if [ "$CACHE_TEST" != "true" ]; then
    echo -e "${RED}ERROR: Bills cache API test failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Bills cache API test passed${NC}"

# Step 3: Backup VERSION A
echo ""
echo -e "${YELLOW}Step 3: Backing up VERSION A (Production)...${NC}"

BACKUP_DIR="/var/www/workforce-democracy/backups/version-a-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

cp -r /var/www/workforce-democracy/version-a/* "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"

# Step 4: Confirmation
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW} READY TO DEPLOY${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Source: VERSION B (Test)"
echo "  Target: VERSION A (Production - LIVE SITE)"
echo "  Backup: $BACKUP_DIR"
echo ""
echo -e "${RED}⚠️  This will affect the LIVE website at workforcedemocracyproject.org${NC}"
echo ""
read -p "Type 'DEPLOY' to confirm: " CONFIRM

if [ "$CONFIRM" != "DEPLOY" ]; then
    echo -e "${RED}Deployment cancelled.${NC}"
    exit 0
fi

# Step 5: Stop VERSION A backend
echo ""
echo -e "${YELLOW}Step 5: Stopping VERSION A backend...${NC}"
sudo systemctl stop workforce-backend-version-a || true
echo -e "${GREEN}✓ VERSION A backend stopped${NC}"

# Step 6: Sync files
echo ""
echo -e "${YELLOW}Step 6: Syncing VERSION B → VERSION A...${NC}"

# Sync backend (excluding node_modules and .env)
rsync -av --delete \
    --exclude 'node_modules' \
    --exclude '.env' \
    --exclude 'package-lock.json' \
    /var/www/workforce-democracy/version-b/backend/ \
    /var/www/workforce-democracy/version-a/backend/

echo -e "${GREEN}✓ Backend files synced${NC}"

# Step 7: Install dependencies
echo ""
echo -e "${YELLOW}Step 7: Installing dependencies...${NC}"
cd /var/www/workforce-democracy/version-a/backend
/usr/bin/npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 8: Restart VERSION A backend
echo ""
echo -e "${YELLOW}Step 8: Restarting VERSION A backend...${NC}"
sudo systemctl start workforce-backend-version-a
sleep 3

# Step 9: Verify deployment
echo ""
echo -e "${YELLOW}Step 9: Verifying deployment...${NC}"

# Test VERSION A backend
if ! curl -s http://localhost:3001/api/health > /dev/null; then
    echo -e "${RED}ERROR: VERSION A backend failed to start!${NC}"
    echo "Rolling back..."
    
    # Rollback: Restore backup
    sudo systemctl stop workforce-backend-version-a
    rm -rf /var/www/workforce-democracy/version-a/*
    cp -r "$BACKUP_DIR/"* /var/www/workforce-democracy/version-a/
    sudo systemctl start workforce-backend-version-a
    
    echo -e "${RED}Rollback complete. VERSION A restored from backup.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ VERSION A backend is running${NC}"

# Test live endpoints
LIVE_REPS_TEST=$(curl -s https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061 | jq -r '.representatives | length' 2>/dev/null || echo "0")
if [ "$LIVE_REPS_TEST" -ne "15" ]; then
    echo -e "${RED}WARNING: Live API test returned unexpected results ($LIVE_REPS_TEST reps instead of 15)${NC}"
    echo "Please check the live site manually."
else
    echo -e "${GREEN}✓ Live API test passed (15 reps)${NC}"
fi

# Step 10: Success
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}  ✅ DEPLOYMENT SUCCESSFUL!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  VERSION B → VERSION A deployment complete"
echo "  Live site: https://workforcedemocracyproject.org"
echo "  API: https://api.workforcedemocracyproject.org"
echo "  Backup: $BACKUP_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Test live site manually"
echo "  2. Monitor logs: sudo journalctl -u workforce-backend-version-a -f"
echo "  3. If issues arise, rollback: ./rollback.sh $BACKUP_DIR"
echo ""
```

#### **File: `/var/www/workforce-democracy/deployment-scripts/rollback.sh`**

```bash
#!/bin/bash

###############################################################################
# EMERGENCY ROLLBACK SCRIPT
# 
# Restores VERSION A from a backup
# 
# USAGE:
#   ./rollback.sh /path/to/backup
###############################################################################

set -e

BACKUP_PATH=$1

if [ -z "$BACKUP_PATH" ]; then
    echo "ERROR: Please specify backup path"
    echo "Usage: ./rollback.sh /var/www/workforce-democracy/backups/version-a-YYYYMMDD-HHMMSS"
    exit 1
fi

if [ ! -d "$BACKUP_PATH" ]; then
    echo "ERROR: Backup path not found: $BACKUP_PATH"
    exit 1
fi

echo "🔄 Rolling back VERSION A from backup..."
echo "   Source: $BACKUP_PATH"
echo "   Target: /var/www/workforce-democracy/version-a"
echo ""
read -p "Type 'ROLLBACK' to confirm: " CONFIRM

if [ "$CONFIRM" != "ROLLBACK" ]; then
    echo "Rollback cancelled."
    exit 0
fi

sudo systemctl stop workforce-backend-version-a
rm -rf /var/www/workforce-democracy/version-a/*
cp -r "$BACKUP_PATH/"* /var/www/workforce-democracy/version-a/
sudo systemctl start workforce-backend-version-a

echo "✅ Rollback complete!"
```

### **Systemd Services for Both Versions:**

#### **File: `/etc/systemd/system/workforce-backend-version-a.service`**

```ini
[Unit]
Description=Workforce Democracy Backend - VERSION A (Production)
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/workforce-democracy/version-a/backend
Environment="NODE_ENV=production"
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/workforce-backend-version-a.log
StandardError=append:/var/log/workforce-backend-version-a-error.log

[Install]
WantedBy=multi-user.target
```

#### **File: `/etc/systemd/system/workforce-backend-version-b.service`**

```ini
[Unit]
Description=Workforce Democracy Backend - VERSION B (Testing)
After=network.target postgresql.service

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/workforce-democracy/version-b/backend
Environment="NODE_ENV=development"
Environment="PATH=/usr/bin:/usr/local/bin"
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/workforce-backend-version-b.log
StandardError=append:/var/log/workforce-backend-version-b-error.log

[Install]
WantedBy=multi-user.target
```

### **Environment Files:**

#### **VERSION A (.env):**
```bash
PORT=3001
NODE_ENV=production
DB_NAME=workforce_democracy
# ... other vars
```

#### **VERSION B (.env):**
```bash
PORT=3002
NODE_ENV=development
DB_NAME=workforce_democracy_test
# ... other vars
```

---

## ⚠️ **CRITICAL WARNINGS FOR AI ASSISTANT HANDOVER**

```
🚨🚨🚨 READ THIS BEFORE MAKING ANY CHANGES 🚨🚨🚨

VERSION CONTROL RULES:

1. ✅ ALWAYS edit VERSION B (test) ONLY
   Location: /var/www/workforce-democracy/version-b/

2. ❌ NEVER edit VERSION A (production) directly
   Location: /var/www/workforce-democracy/version-a/

3. ✅ Test changes in VERSION B first
   URL: https://sxcrlfyt.gensparkspace.com/
   API: http://localhost:3002/api

4. ✅ Deploy VERSION B → VERSION A when stable
   Script: /var/www/workforce-democracy/deployment-scripts/sync-b-to-a.sh

5. ❌ NEVER deploy untested code to VERSION A

HANDOVER CHECKLIST:

□ Read this entire document before proceeding
□ Verify you're editing VERSION B, not VERSION A
□ Test changes on port 3002 (VERSION B backend)
□ Check GenSpark frontend (test site)
□ Only deploy to VERSION A when user approves
□ Always backup VERSION A before deployment

IF CONFUSED:
Ask the user: "Should I edit VERSION A (live) or VERSION B (test)?"
Default answer: VERSION B (test)
```

---

## 📝 **IMPLEMENTATION CHECKLIST**

### **Phase 1: Contact Information Bug Fix (PRIORITY 1)**

- [x] Deep audit of representative card HTML/CSS/JS
- [ ] Identify and fix "Website only" button issue
- [ ] Ensure all contact buttons (Call, Email, Website) display correctly
- [ ] Test on multiple representatives
- [ ] Verify responsive design (mobile/desktop)

### **Phase 2: Version A/B Setup (PRIORITY 2)**

- [ ] Create `/var/www/workforce-democracy/version-a/` directory
- [ ] Create `/var/www/workforce-democracy/version-b/` directory
- [ ] Copy current backend to VERSION A
- [ ] Clone VERSION A → VERSION B for testing
- [ ] Set up systemd services (version-a.service, version-b.service)
- [ ] Create deployment scripts (sync-b-to-a.sh, rollback.sh, backup-version-a.sh)
- [ ] Test deployment workflow
- [ ] Document Version A/B system in README.md

### **Phase 3: Voting Records Backend (PRIORITY 3)**

- [ ] Create `representative_votes` table in PostgreSQL
- [ ] Create `vote_roll_call` table in PostgreSQL
- [ ] Create `party_voting_stats` table in PostgreSQL
- [ ] Build `/api/voting/representative/:repId/recent` endpoint
- [ ] Build `/api/voting/bill/:billId/all-votes` endpoint
- [ ] Build `/api/voting/representative/:repId/party-line-stats` endpoint
- [ ] Implement Congress.gov API integration
- [ ] Implement OpenStates API integration
- [ ] Add 7-day vote caching logic
- [ ] Test with ZIP 12061 representatives

### **Phase 4: Voting Records Frontend (PRIORITY 4)**

- [ ] Create `js/voting-records.js`
- [ ] Create `css/voting-records.css`
- [ ] Implement Option C representative card layout
- [ ] Add "Recent Votes" accordion to each rep card
- [ ] Implement auto-close accordion behavior
- [ ] Add "Show 5 More Votes" functionality
- [ ] Build bill details expansion UI
- [ ] Integrate with existing bill-cache.js for AI analysis
- [ ] Add constituent impact display (ZIP-based scaling)
- [ ] Implement AI chat for bills and rep questions

### **Phase 5: "How Everyone Voted" Feature (PRIORITY 5)**

- [ ] Build "Click vote margin" to expand all votes
- [ ] Display user's 15 reps first (Option C)
- [ ] Add "Show all 535 votes" button
- [ ] Implement search/filter for all congressional votes
- [ ] Highlight party defectors (⚠️ badge)
- [ ] Add party affiliation display (D), (R), (I)

### **Phase 6: Email Pre-Population (PRIORITY 6)**

- [ ] Build `emailRepAboutVote()` function
- [ ] Create professional email template (Option B)
- [ ] Add bill context to email body
- [ ] Include constituent impact in email
- [ ] Test mailto: links across browsers

### **Phase 7: Party-Line Voting Analysis (PRIORITY 7)**

- [ ] Calculate party-line voting % per representative
- [ ] Display on representative card
- [ ] Identify and highlight "spoilers" (defectors)
- [ ] Show notable defections list
- [ ] Update stats daily via cron job

### **Phase 8: Full Voting Record Page (PRIORITY 8)**

- [ ] Create `/representative-voting-record.html`
- [ ] Add topic filters UI
- [ ] Add year filters UI
- [ ] Add vote type filters (YES/NO/ABSTAIN)
- [ ] Add sort options (newest, oldest, impact score)
- [ ] Implement "Show 5 More" pagination
- [ ] Test with multiple representatives

### **Phase 9: State Rep Data Handling (PRIORITY 9)**

- [ ] Add "Limited Data" warning for state reps
- [ ] Implement AI explanation for data gaps
- [ ] Provide contact info for transparency requests
- [ ] Add links to FOIL/FOIA resources
- [ ] Test with New York state representatives

### **Phase 10: Testing & Documentation (PRIORITY 10)**

- [ ] Test entire voting records feature end-to-end
- [ ] Test on mobile devices
- [ ] Test with slow internet connection
- [ ] Verify PostgreSQL cache working (7-day expiration)
- [ ] Update README.md with voting records documentation
- [ ] Create user guide for voting records feature
- [ ] Update DEPLOYMENT-MASTER.md

---

## 🎓 **HANDOVER NOTES FOR NEXT AI ASSISTANT**

```
IMPORTANT CONTEXT:

1. USER'S PRIMARY GOAL:
   - Add voting records to representative cards
   - Enable constituent impact analysis
   - Allow users to contact reps about specific votes
   - Identify party-line defectors ("spoilers")

2. CURRENT STATUS:
   - Backend bill caching system (V37.17.0) is COMPLETE and WORKING
   - PostgreSQL database operational (Node 20, systemd service)
   - Cost savings: 99.5% reduction achieved ($100 → $0.50/month)
   - Current blocker: Contact buttons only showing "Website" button

3. NEXT STEPS:
   - Fix contact button bug (PRIORITY 1)
   - Set up Version A/B system (PRIORITY 2)
   - Build voting records backend (PRIORITY 3)
   - Build voting records frontend (PRIORITY 4)

4. FILES TO READ FIRST:
   - This document (VOTING-RECORDS-FEATURE-SPECIFICATION.md)
   - README.md (project overview)
   - DEPLOYMENT-MASTER.md (deployment guide)
   - V37.17.0-BILL-CACHE-IMPLEMENTATION-COMPLETE.md (caching system)

5. USER PREFERENCES:
   - Loves detailed documentation
   - Wants everything explained thoroughly
   - Appreciates proactive AI suggestions
   - Values cost optimization highly

6. CRITICAL RULES:
   - ALWAYS edit VERSION B (test) first
   - NEVER edit VERSION A (production) directly
   - Test thoroughly before deploying
   - Backup VERSION A before every deployment
```

---

**END OF SPECIFICATION DOCUMENT**

**Total Pages:** 45  
**Word Count:** ~15,000  
**Estimated Implementation Time:** 3-4 weeks  
**Status:** ✅ **FULLY DOCUMENTED AND READY FOR IMPLEMENTATION**

---

This document will preserve all requirements, design decisions, and implementation details during the contact button bug fix. No information will be lost during AI assistant handover! 🎉
