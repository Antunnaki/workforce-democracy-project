# 🏛️ Government API Integration Guide

## Overview

This document outlines the official government APIs and reputable sources for fetching accurate, verifiable civic data. All information will be fact-checked, cited, and sourced from official government endpoints.

---

## 🎯 Core Principles

1. **Accuracy First**: Only official government APIs and verified sources
2. **Citation Always**: Every fact backed by reputable sources
3. **Real-Time Data**: Fetch live data, not static datasets
4. **Fact-Checking**: Cross-reference multiple sources for verification
5. **Transparency**: Show users where data comes from

---

## 🇺🇸 United States Government APIs

### Federal Level

#### 1. **Congress.gov API** (Primary Source)
**Purpose**: Bills, legislation, voting records, congressional activity

**Endpoint**: `https://api.congress.gov/v3`

**Key Features**:
- Real-time bill status and full text
- Roll call votes with representative names
- Committee information
- Amendments and related bills
- Sponsorship and co-sponsorship data

**Authentication**: API key required (free)
- Register at: https://api.congress.gov/sign-up/

**Example Endpoints**:
```
GET /bill - List bills
GET /bill/{congress}/{type}/{number} - Specific bill
GET /member - List members of Congress
GET /member/{bioguideId} - Specific member info
GET /committee - List committees
```

**Data Structure**:
```json
{
  "bill": {
    "billNumber": "H.R. 1234",
    "title": "Full Bill Title",
    "sponsor": {
      "firstName": "John",
      "lastName": "Doe",
      "party": "D",
      "state": "CA"
    },
    "status": "Passed House",
    "introducedDate": "2024-01-15",
    "actions": [...],
    "cosponsors": [...],
    "committees": [...],
    "text": "Full bill text...",
    "url": "https://www.congress.gov/bill/..."
  }
}
```

**Rate Limits**: 5,000 requests/hour

---

#### 2. **ProPublica Congress API** (Secondary Source)
**Purpose**: Additional congressional data, voting records, member profiles

**Endpoint**: `https://api.propublica.org/congress/v1`

**Key Features**:
- Member voting records and attendance
- Statement positions
- Financial disclosures
- Committee assignments
- Biographical information

**Authentication**: API key required (free)
- Request at: https://www.propublica.org/datastore/api/propublica-congress-api

**Example Endpoints**:
```
GET /members/{member-id}.json - Member details
GET /members/{chamber}/{congress}.json - All members
GET /{chamber}/members/{member-id}/votes.json - Voting history
GET /bills/search.json - Search bills
```

---

#### 3. **Supreme Court API (CourtListener)**
**Purpose**: Supreme Court decisions, opinions, case law

**Endpoint**: `https://www.courtlistener.com/api/rest/v3`

**Key Features**:
- Supreme Court opinions (full text)
- Case metadata and citations
- Oral arguments audio
- Party information
- Docket entries

**Authentication**: API key required (free)
- Register at: https://www.courtlistener.com/api/

**Example Endpoints**:
```
GET /opinions/ - List opinions
GET /dockets/ - List dockets
GET /audio/ - Oral arguments
GET /search/ - Search cases
```

---

#### 4. **Federal Register API**
**Purpose**: Federal regulations, executive orders, agency rules

**Endpoint**: `https://www.federalregister.gov/api/v1`

**Key Features**:
- Daily Federal Register documents
- Executive orders
- Rules and regulations
- Public notices
- Presidential documents

**Authentication**: No key required (public)

**Example Endpoints**:
```
GET /documents - List documents
GET /documents/{document_number} - Specific document
GET /public-inspection - Documents pending publication
```

---

### State Level (Example: Texas)

#### 1. **Texas Legislature Online (TLO)**
**Purpose**: State bills, legislators, committee information

**Endpoint**: `https://capitol.texas.gov/tlodocs/api`

**Note**: Most state legislatures have similar APIs. Adapt per state.

**Key Data**:
- State bills and resolutions
- State representative profiles
- Voting records (where available)
- Committee assignments
- Session information

---

#### 2. **Open States API** (Multi-State Aggregator)
**Purpose**: Unified API for all 50 states

**Endpoint**: `https://v3.openstates.org/graphql`

**Key Features**:
- Bills from all 50 states
- State legislators (all states)
- Votes and committee info
- Standardized data format

**Authentication**: API key required (free)
- Register at: https://openstates.org/accounts/signup/

**GraphQL Query Example**:
```graphql
query {
  bills(
    jurisdiction: "Texas"
    session: "88R"
  ) {
    edges {
      node {
        identifier
        title
        classification
        subject
        sponsorships {
          name
          classification
        }
      }
    }
  }
}
```

---

### Local Level

#### 1. **City-Specific APIs**
Most major cities have open data portals:

**Examples**:
- Austin, TX: `https://data.austintexas.gov/resource/`
- San Francisco, CA: `https://data.sfgov.org/resource/`
- New York, NY: `https://data.cityofnewyork.us/resource/`

**Typical Data**:
- City council members
- Municipal ordinances
- Budget information
- Public meetings
- Voting records

---

## 🌍 International Government APIs

### 🇬🇧 United Kingdom

#### Parliament API
**Endpoint**: `https://members-api.parliament.uk/api`

**Key Features**:
- MPs (Members of Parliament)
- Lords
- Constituencies
- Voting records
- Parliamentary questions

**Authentication**: No key required (public)

#### UK Supreme Court
**Website**: `https://www.supremecourt.uk/`
**Note**: No official API; requires web scraping or manual updates

---

### 🇦🇺 Australia

#### Parliament of Australia API
**Endpoint**: `https://api.openaustralia.org.au/api`

**Key Features**:
- Senators and representatives
- Hansard (parliamentary debates)
- Divisions (votes)

**Authentication**: API key required (free)

#### High Court of Australia
**Website**: `https://www.hcourt.gov.au/`
**Note**: No official API; case law available for manual extraction

---

### 🇨🇦 Canada

#### OpenParliament.ca API
**Endpoint**: `https://api.openparliament.ca`

**Key Features**:
- MPs and senators
- Bills and votes
- Parliamentary debates
- Hansard transcripts

**Authentication**: No key required (public)

#### Supreme Court of Canada
**Website**: `https://www.scc-csc.ca/`
**Note**: Decisions available in structured format

---

### 🇫🇷 France

#### Assemblée Nationale API
**Endpoint**: `https://data.assemblee-nationale.fr/api`

**Key Features**:
- Deputies (members)
- Legislation
- Amendments
- Votes

**Authentication**: No key required (public)

---

### 🇩🇪 Germany

#### Bundestag API
**Endpoint**: `https://www.bundestag.de/ajax/filterlist/en/members`

**Key Features**:
- Members of Bundestag
- Parliamentary groups
- Committee information

**Note**: Limited official API; may require supplementary sources

---

## 📚 Fact-Checking & Verification Sources

### Primary Fact-Checking Organizations

1. **FactCheck.org** (Annenberg Public Policy Center)
   - Non-partisan
   - Academic backing
   - Cited sources

2. **PolitiFact** (Poynter Institute)
   - Truth-O-Meter ratings
   - Detailed analysis
   - Pulitzer Prize winning

3. **Snopes**
   - Long-established
   - Wide scope
   - Detailed sourcing

4. **AP Fact Check** (Associated Press)
   - News organization
   - Real-time fact-checking
   - Global reach

5. **Reuters Fact Check**
   - International perspective
   - Rigorous standards
   - Verified sources

---

## 🤖 LLM Integration Architecture

### Data Flow

```
User Question
    ↓
Frontend sends to Backend API
    ↓
Backend validates & sanitizes
    ↓
Llama 3 processes query
    ↓
Identifies relevant government APIs
    ↓
Fetches data from official sources
    ↓
Cross-references multiple sources
    ↓
Fact-checks against verification databases
    ↓
Formats response with citations
    ↓
Returns to user with source links
```

---

### Backend API Requirements

**Endpoints Needed**:

```javascript
// Primary endpoint
POST /api/civic/query
{
  "question": "What is the status of H.R. 1234?",
  "context": {
    "country": "us",
    "level": "federal",
    "type": "bill"
  }
}

// Response format
{
  "answer": "H.R. 1234 passed the House on...",
  "sources": [
    {
      "type": "official",
      "name": "Congress.gov",
      "url": "https://www.congress.gov/bill/...",
      "accessed": "2024-01-24T12:00:00Z"
    },
    {
      "type": "fact-check",
      "name": "FactCheck.org",
      "url": "https://www.factcheck.org/...",
      "verification": "confirmed"
    }
  ],
  "relatedBills": [...],
  "votingRecord": {
    "yea": 235,
    "nay": 190,
    "representatives": [...]
  },
  "confidence": "high",
  "lastUpdated": "2024-01-24T12:00:00Z"
}
```

---

### Llama 3 Integration

**Model**: Llama 3 (8B or 70B parameter)

**Hosting Options** (Low Cost):

1. **RunPod** (cheapest for inference)
   - ~$0.30-0.60/hour for 8B model
   - Pay-per-second billing
   - GPU instances

2. **Together AI** (serverless)
   - ~$0.20/1M tokens
   - No infrastructure management
   - API access

3. **Modal** (serverless)
   - ~$0.0001/second of compute
   - Cold starts optimized
   - Python-native

4. **Fly.io** (containers)
   - ~$0.02/hour for CPU
   - Global edge deployment
   - Low latency

**Recommended**: Start with Together AI for minimal setup, migrate to RunPod if volume increases

---

## 🔒 Security & Ethics

### API Key Management
- Store all keys in environment variables
- Never commit keys to repository
- Rotate keys regularly
- Use separate keys for dev/prod

### Rate Limiting
- Respect API rate limits
- Implement caching to reduce calls
- Queue requests if necessary
- Show users when data is cached vs. live

### Data Privacy
- Don't log user queries long-term
- Anonymize analytics
- GDPR/CCPA compliant
- Clear data retention policy

### Ethical AI Use
- Cite all sources clearly
- Show confidence levels
- Admit when uncertain
- Avoid bias in presentation
- Allow users to verify sources

---

## 💰 Cost Estimation

### API Costs (Mostly Free!)
- **Congress.gov**: FREE (5,000 req/hr)
- **ProPublica**: FREE (with rate limits)
- **CourtListener**: FREE (with rate limits)
- **Open States**: FREE (1,000 req/day)
- **Most International APIs**: FREE

### LLM Costs (Budget Estimates)

**Scenario: 1,000 users/day, 5 queries each**
- 5,000 queries/day
- ~150,000 queries/month
- Average 500 tokens/response

**Together AI**:
- 150K queries × 500 tokens = 75M tokens/month
- 75M × $0.20/1M = **$15/month**

**RunPod** (if self-hosting):
- ~8 hours/day active
- 8 × 30 = 240 hours/month
- 240 × $0.40/hr = **$96/month**
- More cost-effective at scale

**Caching Strategy** (reduce by 70%):
- Cache common questions
- 5,000 → 1,500 unique queries/day
- **$4.50/month** (Together AI)

---

## 📖 Citation System Requirements

### Citation Format

Every response must include:

```javascript
{
  "answer": "Full answer text...",
  "citations": [
    {
      "id": 1,
      "sourceType": "official",  // official, fact-check, academic, news
      "organization": "Congress.gov",
      "title": "H.R. 1234 - Bill Status",
      "url": "https://www.congress.gov/bill/118th-congress/house-bill/1234",
      "accessDate": "2024-01-24",
      "relevant Excerpt": "Bill passed House 235-190 on January 20, 2024",
      "verification": "primary_source"
    },
    {
      "id": 2,
      "sourceType": "fact-check",
      "organization": "FactCheck.org",
      "title": "Analysis of H.R. 1234 Claims",
      "url": "https://www.factcheck.org/...",
      "accessDate": "2024-01-24",
      "relevantExcerpt": "Confirmed voting record matches official data",
      "verification": "verified"
    }
  ],
  "inlineReferences": "H.R. 1234 passed the House 235-190 on January 20, 2024 [1]. This has been fact-checked and verified [2]."
}
```

### Display Requirements

1. **Inline Citations**: [1], [2] links in text
2. **Source List**: Full citations at bottom
3. **Verification Badge**: ✅ Verified, ⚠️ Unverified, ❌ Disputed
4. **Source Quality**: Show if official/primary vs. secondary
5. **Access Date**: When data was fetched
6. **Live Update**: Indicate if data is cached or real-time

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (Week 1-2)
- ✅ Frontend infrastructure ready (done!)
- [ ] Set up backend server
- [ ] Configure Llama 3 instance
- [ ] Implement basic Congress.gov integration
- [ ] Test end-to-end query flow

### Phase 2: Core APIs (Week 3-4)
- [ ] Integrate all US federal APIs
- [ ] Add state-level API (start with Texas)
- [ ] Implement caching layer
- [ ] Build citation system
- [ ] Add fact-checking verification

### Phase 3: International (Week 5-6)
- [ ] UK Parliament API
- [ ] Australian Parliament API
- [ ] Canadian Parliament API
- [ ] European APIs (FR, DE)

### Phase 4: Polish (Week 7-8)
- [ ] Optimize LLM prompts
- [ ] Fine-tune response formatting
- [ ] Add confidence scoring
- [ ] Implement advanced caching
- [ ] Performance testing

### Phase 5: Launch (Week 9)
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation
- [ ] Monitoring setup
- [ ] Deploy to production

---

## 📞 API Registration Links

Register for these APIs in advance:

1. **Congress.gov**: https://api.congress.gov/sign-up/
2. **ProPublica Congress**: https://www.propublica.org/datastore/api/propublica-congress-api
3. **CourtListener**: https://www.courtlistener.com/api/
4. **Open States**: https://openstates.org/accounts/signup/
5. **OpenAustralia**: https://www.openaustralia.org.au/api/key

---

## ✅ Ready to Implement!

All infrastructure is in place:
- ✅ Frontend optimized (190KB → 25KB!)
- ✅ Lazy loading enabled
- ✅ Minimal demo data showing layout
- ✅ API endpoints documented
- ✅ LLM architecture designed
- ✅ Citation system specified
- ✅ Cost estimates provided

**Next Steps**:
1. Register for API keys
2. Set up backend server
3. Deploy Llama 3 instance
4. Connect APIs
5. Test and iterate
6. Deploy to production!

**Estimated Time to Live Backend**: 4-8 weeks (depending on complexity)

**Estimated Monthly Cost**: $5-20 (with good caching)

Let's build this! 🚀
