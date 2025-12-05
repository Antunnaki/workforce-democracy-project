# 🌐 API ENDPOINTS - Complete Reference

**Last Updated**: 2025-11-10  
**Backend**: Njalla VPS (185.193.126.13)  
**Base URL**: `https://api.workforcedemocracyproject.org`  
**Status**: ⚠️ NEEDS VERIFICATION (see Testing section below)

---

## 📊 ENDPOINT STATUS

### ✅ **CONFIRMED WORKING** (Used in production)

#### 1. **Civic LLM Chat** (Groq/Llama 3.3)
```http
POST /api/civic/llm-chat
```

**Purpose**: AI-powered chat for all civic engagement features

**Request Body**:
```json
{
  "message": "What is Roe v Wade?",
  "context": "general",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous question..."
    },
    {
      "role": "assistant",
      "content": "Previous answer..."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "response": "**Roe v. Wade (1973)** was a landmark Supreme Court case...",
  "sources": [
    {
      "title": "Oyez: Roe v. Wade",
      "url": "https://www.oyez.org/cases/1971/70-18",
      "priority": 1
    }
  ],
  "responseTime": 1250,
  "cost": 0.00012,
  "source": "groq"
}
```

**Context Types**:
- `general` - General civic questions
- `billExplanation` - Explain legislation
- `representativeAnalysis` - Analyze voting records
- `courtCaseExplanation` - Explain court decisions

**Used By**:
- `js/backend-api.js` (line 111)
- `js/chat-clean.js` (universal chat system)

---

#### 2. **Civic LLM Health Check**
```http
GET /api/civic/llm-health
```

**Purpose**: Check if LLM service is operational

**Response**:
```json
{
  "status": "healthy",
  "llmChat": "operational",
  "database": "connected",
  "groqApi": "configured",
  "model": "llama-3.3-70b-versatile",
  "provider": "Groq",
  "timestamp": "2025-11-10T12:00:00Z"
}
```

**Used By**:
- `js/backend-api.js` (line 49)
- Health monitoring dashboard (future)

---

#### 3. **ProPublica Nonprofit Search**
```http
GET /api/nonprofits/search?q={query}&state={state}&city={city}
```

**Purpose**: Search 1.8M+ nonprofits from IRS 990 data

**Parameters**:
- `q` (required): Search query (organization name, EIN)
- `state` (optional): Two-letter state code (e.g., CA, NY)
- `city` (optional): City name

**Example**:
```http
GET /api/nonprofits/search?q=food+bank&state=CA&city=Oakland
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "ein": "123456789",
      "name": "Oakland Food Bank",
      "city": "Oakland",
      "state": "CA",
      "ntee_code": "K31",
      "classification": "Food Banks",
      "subsection_code": "3",
      "ruling_date": "1985-05-15",
      "deductibility_code": "1",
      "foundation_code": "15",
      "organization_code": "1",
      "exempt_organization_status_code": "1",
      "tax_period": "202312",
      "asset_code": "3",
      "income_code": "3",
      "filing_requirement_code": "1",
      "pf_filing_requirement_code": "0",
      "sort_name": null,
      "postal_code": "94601-1234"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 100
}
```

**Used By**:
- `js/community-services.js` (v37.8.7)
- Community Services Widget on homepage

---

#### 4. **ProPublica Nonprofit Details**
```http
GET /api/nonprofits/:ein
```

**Purpose**: Get detailed information for a specific nonprofit (EIN)

**Example**:
```http
GET /api/nonprofits/123456789
```

**Response**:
```json
{
  "success": true,
  "data": {
    "organization": {
      "ein": "123456789",
      "name": "Oakland Food Bank",
      "address": "123 Main St",
      "city": "Oakland",
      "state": "CA",
      "zipcode": "94601",
      "ruling_year": 1985,
      "subsection": "Charitable Organization",
      "classification": "Food Banks",
      "deductibility": "Contributions are deductible",
      "foundation": "Organization that normally receives no more than one-third of its support from gross investment income",
      "organization": "Corporation",
      "status": "Unconditional Exemption",
      "tax_period": 202312,
      "asset_cd": 3,
      "income_cd": 3,
      "filing_req_cd": 1,
      "pf_filing_req_cd": 0,
      "acct_pd": 12,
      "asset_amt": 1250000,
      "income_amt": 850000,
      "revenue_amt": 850000,
      "ntee_cd": "K31",
      "sort_name": null
    },
    "filings_with_data": [
      {
        "tax_prd": 202312,
        "tax_prd_yr": 2023,
        "formtype": 990,
        "pdf_url": "https://projects.propublica.org/nonprofits/...",
        "updated": "2024-05-15"
      }
    ],
    "fromCache": false
  }
}
```

**Used By**:
- `js/community-services.js` - Enhanced modal (Phase 1)
- Report Outdated Info feature (Phase 2 - pending)

---

### ❓ **NEEDS TESTING** (Referenced in code but not confirmed)

#### 5. **Groq Voting Assistant**
```http
POST /api/groq/voting-assistant
```

**Status**: ⚠️ UNCLEAR - Code references this but uses `/api/civic/llm-chat` in practice

**Purpose**: AI assistant for voter registration questions

**Expected Request**:
```json
{
  "message": "How do I register to vote in California?",
  "context": {
    "state": "CA",
    "country": "USA"
  }
}
```

**Referenced By**:
- `js/config.js` (line 49)
- `js/voting-assistant.js` (line 463)

**Test Command**:
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/groq/voting-assistant \
  -H "Content-Type: application/json" \
  -d '{"message":"How do I register to vote?"}'
```

---

#### 6. **Groq Bills Chat**
```http
POST /api/groq/bills-chat
```

**Status**: ⚠️ UNCLEAR - May be replaced by `/api/civic/llm-chat` with `billExplanation` context

**Purpose**: AI assistant for bill analysis

**Expected Request**:
```json
{
  "message": "What does HR1234 do?",
  "billContext": {
    "id": "HR1234",
    "title": "Healthcare Reform Act",
    "summary": "Expands Medicare..."
  }
}
```

**Referenced By**:
- `js/config.js` (line 50)
- `js/bills-section.js` (line 133, 600)

**Test Command**:
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/groq/bills-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Explain this bill"}'
```

---

#### 7. **Groq Candidate Analysis**
```http
POST /api/groq/candidate-analysis
```

**Status**: ⚠️ UNCLEAR - Referenced in config but not implemented in civic section

**Purpose**: AI analysis of political candidates

**Expected Request**:
```json
{
  "message": "Analyze this candidate's voting record",
  "candidate": {
    "name": "Jane Smith",
    "office": "U.S. Senate",
    "state": "CA"
  }
}
```

**Referenced By**:
- `js/config.js` (line 51)

**Test Command**:
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/groq/candidate-analysis \
  -H "Content-Type: application/json" \
  -d '{"message":"Analyze voting record"}'
```

---

#### 8. **Bills Data by Location**
```http
GET /api/data/bills?state={state}&level={level}
```

**Status**: ⚠️ UNCLEAR - Backend README mentions this but not confirmed deployed

**Purpose**: Fetch bills from Congress.gov API filtered by location

**Parameters**:
- `state` (optional): Two-letter state code
- `level` (required): `federal`, `state`, or `local`
- `category` (optional): Bill category (healthcare, education, etc.)
- `status` (optional): Bill status (introduced, passed, enacted)

**Expected Response**:
```json
{
  "success": true,
  "bills": [
    {
      "id": "HR1234",
      "title": "Healthcare Reform Act of 2025",
      "summary": "This bill expands Medicare coverage...",
      "status": "Introduced",
      "introduced_date": "2025-01-15",
      "sponsor": {
        "name": "Rep. Jane Smith",
        "state": "CA",
        "party": "D"
      },
      "committees": ["Energy and Commerce"],
      "subjects": ["Healthcare", "Medicare"],
      "cbo_cost_estimate": 125000000000,
      "full_text_url": "https://www.congress.gov/..."
    }
  ],
  "total": 127,
  "state": "CA",
  "level": "federal"
}
```

**Referenced By**:
- `backend/README.md` (line 135)
- Architecture proposal documents

**Test Command**:
```bash
curl https://api.workforcedemocracyproject.org/api/data/bills?state=CA&level=federal
```

---

#### 9. **Representatives by Postcode**
```http
GET /api/data/representatives?postcode={postcode}
```

**Status**: ⚠️ UNCLEAR - Backend README mentions this but implementation unknown

**Purpose**: Find elected officials by postal code

**Parameters**:
- `postcode` (required): ZIP code or postal code
- `level` (optional): `federal`, `state`, `local`, or `all`

**Expected Response**:
```json
{
  "success": true,
  "representatives": [
    {
      "name": "Jane Smith",
      "office": "U.S. Senator",
      "state": "CA",
      "party": "D",
      "phone": "(202) 555-1234",
      "website": "https://smith.senate.gov",
      "photo_url": "https://...",
      "committees": ["Finance", "Judiciary"],
      "next_election": "2026-11-03"
    }
  ],
  "postcode": "94601",
  "district": "CA-12"
}
```

**Referenced By**:
- `backend/README.md` (line 139)
- `js/civic-representative-finder.js` (likely uses different API)

**Test Command**:
```bash
curl https://api.workforcedemocracyproject.org/api/data/representatives?postcode=94601
```

---

#### 10. **Court Cases Search**
```http
GET /api/data/court-cases?country={country}&topic={topic}
```

**Status**: ⚠️ UNCLEAR - Backend README mentions this but not confirmed

**Purpose**: Search Supreme Court and federal cases

**Parameters**:
- `country` (required): `US`, `UK`, `CA`, etc.
- `topic` (optional): Search by topic (abortion, privacy, etc.)
- `year` (optional): Filter by year decided
- `court` (optional): `supreme`, `federal`, `state`

**Expected Response**:
```json
{
  "success": true,
  "cases": [
    {
      "name": "Roe v. Wade",
      "citation": "410 U.S. 113 (1973)",
      "decided": "1973-01-22",
      "summary": "Landmark decision establishing constitutional right to abortion...",
      "majority_opinion": "Justice Harry Blackmun",
      "dissent": "Justice Byron White, Justice William Rehnquist",
      "topics": ["abortion", "privacy", "fourteenth amendment"],
      "oyez_url": "https://www.oyez.org/cases/1971/70-18",
      "overturned": true,
      "overturned_by": "Dobbs v. Jackson Women's Health Organization (2022)"
    }
  ],
  "total": 1,
  "country": "US",
  "topic": "abortion"
}
```

**Referenced By**:
- `backend/README.md` (line 143)
- Civic platform Supreme Court section

**Test Command**:
```bash
curl https://api.workforcedemocracyproject.org/api/data/court-cases?country=US&topic=abortion
```

---

### 🔧 **TO BE IMPLEMENTED** (Phase 2 - Charity Navigator)

#### 11. **Nonprofit Report Submission**
```http
POST /api/nonprofits/report
```

**Status**: ⏳ READY TO DEPLOY (v37.9.0) - Waiting for Charity Navigator API key

**Purpose**: User-submitted reports for outdated nonprofit information

**Request Body**:
```json
{
  "ein": "123456789",
  "orgName": "Oakland Food Bank",
  "reportType": "outdated_info",
  "message": "This organization has closed.",
  "userIp": "192.168.1.1"
}
```

**Response**:
```json
{
  "success": true,
  "reportId": "RPT-1234567890",
  "message": "Thank you for your report. We'll review it within 48 hours.",
  "estimatedReview": "2025-11-12T12:00:00Z"
}
```

**Referenced By**:
- `backend/nonprofit-proxy-phase2.js` (line 187)
- `js/community-services.js` - Report button (Phase 1 UI ready)

---

## 🧪 TESTING INSTRUCTIONS

### **Quick Test (Browser Console)**

Copy-paste this into your browser console on https://workforcedemocracyproject.org:

```javascript
// Test all endpoints
const baseURL = 'https://api.workforcedemocracyproject.org';

const tests = [
  {
    name: '✅ Civic LLM Health',
    url: '/api/civic/llm-health',
    method: 'GET'
  },
  {
    name: '✅ Civic LLM Chat',
    url: '/api/civic/llm-chat',
    method: 'POST',
    body: {
      message: 'What is Roe v Wade?',
      context: 'general',
      conversationHistory: []
    }
  },
  {
    name: '✅ Nonprofit Search',
    url: '/api/nonprofits/search?q=food+bank&state=CA',
    method: 'GET'
  },
  {
    name: '❓ Groq Voting Assistant',
    url: '/api/groq/voting-assistant',
    method: 'POST',
    body: { message: 'How do I register to vote?' }
  },
  {
    name: '❓ Groq Bills Chat',
    url: '/api/groq/bills-chat',
    method: 'POST',
    body: { message: 'Explain HR1234' }
  },
  {
    name: '❓ Bills Data',
    url: '/api/data/bills?state=CA&level=federal',
    method: 'GET'
  },
  {
    name: '❓ Representatives',
    url: '/api/data/representatives?postcode=94601',
    method: 'GET'
  },
  {
    name: '❓ Court Cases',
    url: '/api/data/court-cases?country=US&topic=abortion',
    method: 'GET'
  }
];

console.log('🧪 Testing API Endpoints...\n');

for (const test of tests) {
  const options = {
    method: test.method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (test.body) {
    options.body = JSON.stringify(test.body);
  }
  
  fetch(baseURL + test.url, options)
    .then(async response => {
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      if (response.ok) {
        console.log(`✅ ${test.name}: HTTP ${response.status}`);
        console.log('   Response:', data);
      } else {
        console.warn(`⚠️ ${test.name}: HTTP ${response.status}`);
        console.warn('   Error:', data);
      }
    })
    .catch(error => {
      console.error(`❌ ${test.name}: ${error.message}`);
    });
}

console.log('\n📊 Results will appear above. Screenshot and send to developer!');
```

### **Expected Results**:

**Working Endpoints** (should return `HTTP 200`):
- ✅ Civic LLM Health
- ✅ Civic LLM Chat
- ✅ Nonprofit Search

**Unclear Status** (may return `HTTP 404` or `HTTP 200`):
- ❓ Groq Voting Assistant
- ❓ Groq Bills Chat
- ❓ Bills Data
- ❓ Representatives
- ❓ Court Cases

---

## 🔄 ENDPOINT MIGRATION NOTES

### **Old vs New Naming**:

Some endpoints have been renamed. Frontend code may reference old paths:

| Old Path (may be in code) | New Path (actually deployed) | Status |
|----------------------------|------------------------------|--------|
| `/api/backend/query` | `/api/civic/llm-chat` | ✅ Updated |
| `/api/groq/voting-assistant` | `/api/civic/llm-chat` (context: general) | ❓ Unclear |
| `/api/groq/bills-chat` | `/api/civic/llm-chat` (context: billExplanation) | ❓ Unclear |

### **Recommendation**:
Use `/api/civic/llm-chat` for ALL LLM queries with appropriate `context` parameter instead of separate endpoints.

---

## 📝 UPDATE LOG

- **2025-11-10**: Initial documentation based on code analysis
- **Next**: Update with actual test results from user

---

## 🚀 NEXT STEPS

**User Action Required**:
1. Run the browser console test above
2. Screenshot the results
3. Send to developer for verification
4. Developer will update this doc with confirmed endpoints

**Then**:
- Update all frontend code to use correct endpoints
- Remove references to non-existent endpoints
- Add error handling for unavailable endpoints
