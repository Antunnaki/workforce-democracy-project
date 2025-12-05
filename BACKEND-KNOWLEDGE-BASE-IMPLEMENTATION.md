# Backend Knowledge Base Implementation Plan

**Date**: January 28, 2025  
**Version**: 1.0  
**Status**: 🚀 Ready to Implement  
**Server**: Njalla VPS Backend

---

## 🎯 Project Overview

Build a centralized knowledge base on the Njalla VPS backend that:
- ✅ Caches government data (bills, reps, court cases)
- ✅ Stores educational content (cooperatives, B Corps, FAQs)
- ✅ Tracks user context across all 9 chat assistants
- ✅ Provides intelligent query routing (cache first, AI fallback)
- ✅ Maintains conversation memory for context-aware responses

**Estimated Cost Savings**: 80-90% reduction in AI API costs  
**Estimated Response Time**: 0-50ms (vs 500-2000ms for AI queries)

---

## 🏗️ Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: DATA STORAGE (PostgreSQL)                         │
├─────────────────────────────────────────────────────────────┤
│  • government_data (bills, reps, court_cases)               │
│  • educational_content (cooperatives, b_corps, faqs)        │
│  • user_contexts (location, preferences, voting_history)    │
│  • conversation_memory (cross-chat context)                 │
│  • cached_responses (AI responses for reuse)                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: API LAYER (Node.js + Express)                     │
├─────────────────────────────────────────────────────────────┤
│  • /api/chat/bills - Bills chat endpoint                    │
│  • /api/chat/civic - Civic chats endpoint                   │
│  • /api/chat/ethical - Ethical business endpoint            │
│  • /api/chat/voting - Voting assistant endpoint             │
│  • /api/chat/candidates - Candidate analysis endpoint       │
│  • /api/data/bills - Government data API                    │
│  • /api/data/reps - Representatives API                     │
│  • /api/data/courts - Court cases API                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: INTELLIGENT ROUTING                               │
├─────────────────────────────────────────────────────────────┤
│  1. Parse user query                                         │
│  2. Check knowledge base cache (PostgreSQL)                  │
│  3. If found → Return cached data (FREE, instant)            │
│  4. If not found → Query Groq API (~$0.0001)                │
│  5. Cache response for future queries                        │
│  6. Update conversation memory                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: GROQ API INTEGRATION                              │
├─────────────────────────────────────────────────────────────┤
│  • Llama 3 model for complex queries                        │
│  • Context-enhanced prompts                                  │
│  • Response caching                                          │
│  • Cost tracking                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema

### **Table 1: `bills`**
```sql
CREATE TABLE bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id VARCHAR(50) UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    full_text TEXT,
    status VARCHAR(50),
    government_level VARCHAR(20), -- federal, state, local
    state VARCHAR(2), -- for state/local bills
    introduced_date DATE,
    last_action_date DATE,
    sponsor_name VARCHAR(255),
    categories TEXT[], -- array of categories
    tags TEXT[], -- searchable tags
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bills_bill_id ON bills(bill_id);
CREATE INDEX idx_bills_state ON bills(state);
CREATE INDEX idx_bills_categories ON bills USING GIN(categories);
```

### **Table 2: `representatives`**
```sql
CREATE TABLE representatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rep_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100), -- Senator, Representative, etc.
    party VARCHAR(50),
    state VARCHAR(2),
    district VARCHAR(10),
    office_address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    voting_record JSONB, -- structured voting data
    committee_assignments TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reps_state ON representatives(state);
CREATE INDEX idx_reps_district ON representatives(district);
```

### **Table 3: `court_cases`**
```sql
CREATE TABLE court_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id VARCHAR(100) UNIQUE NOT NULL,
    case_name VARCHAR(500) NOT NULL,
    case_name_normalized VARCHAR(500), -- for matching (lowercase, no punctuation)
    year INTEGER,
    court_level VARCHAR(50), -- supreme, federal, state
    country VARCHAR(10), -- US, MX, AU, etc.
    summary TEXT NOT NULL,
    impact TEXT,
    significance TEXT,
    decision TEXT,
    vote_split VARCHAR(20), -- e.g., "5-4", "7-2"
    majority_author VARCHAR(255),
    full_opinion_url TEXT,
    topics TEXT[], -- abortion, civil rights, etc.
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cases_normalized_name ON court_cases(case_name_normalized);
CREATE INDEX idx_cases_topics ON court_cases USING GIN(topics);
CREATE INDEX idx_cases_country ON court_cases(country);
```

### **Table 4: `cooperatives`**
```sql
CREATE TABLE cooperatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(500) NOT NULL,
    type VARCHAR(100), -- worker cooperative, housing coop, credit union
    industry VARCHAR(100),
    description TEXT,
    address TEXT,
    city VARCHAR(255),
    state VARCHAR(2),
    postal_code VARCHAR(20),
    country VARCHAR(10),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(255),
    employee_count INTEGER,
    founded_year INTEGER,
    certification VARCHAR(100), -- B Corp, etc.
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coops_location ON cooperatives(state, city);
CREATE INDEX idx_coops_postal ON cooperatives(postal_code);
CREATE INDEX idx_coops_type ON cooperatives(type);
```

### **Table 5: `user_contexts`**
```sql
CREATE TABLE user_contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL, -- anonymous hash or user ID
    location JSONB, -- { postcode, city, state, country }
    preferences JSONB, -- user settings
    voting_history JSONB, -- encrypted voting data
    learning_progress JSONB, -- what they've learned
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_contexts_user_id ON user_contexts(user_id);
```

### **Table 6: `conversation_memory`**
```sql
CREATE TABLE conversation_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    chat_type VARCHAR(50) NOT NULL, -- bills, civic, ethical, etc.
    message_role VARCHAR(20) NOT NULL, -- user, assistant
    message_content TEXT NOT NULL,
    topics TEXT[], -- extracted topics from message
    entities TEXT[], -- extracted entities (bill IDs, rep names, etc.)
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_conversation_user_id ON conversation_memory(user_id);
CREATE INDEX idx_conversation_timestamp ON conversation_memory(timestamp DESC);
CREATE INDEX idx_conversation_topics ON conversation_memory USING GIN(topics);
```

### **Table 7: `cached_responses`**
```sql
CREATE TABLE cached_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_hash VARCHAR(64) UNIQUE NOT NULL, -- SHA256 hash of normalized query
    query_text TEXT NOT NULL,
    response_text TEXT NOT NULL,
    source VARCHAR(20), -- 'cache', 'ai', 'database'
    chat_type VARCHAR(50),
    context_hash VARCHAR(64), -- hash of context used
    hit_count INTEGER DEFAULT 1,
    last_accessed TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cached_responses_hash ON cached_responses(query_hash);
CREATE INDEX idx_cached_responses_chat_type ON cached_responses(chat_type);
```

### **Table 8: `faq_content`**
```sql
CREATE TABLE faq_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faq_id VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(100),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    related_topics TEXT[],
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_faq_category ON faq_content(category);
```

---

## 🔧 API Endpoints

### **1. Chat Endpoints**

#### `POST /api/chat/query`
Universal chat endpoint for all assistants

**Request**:
```json
{
    "chat_type": "supreme-court",
    "user_id": "anonymous-hash-12345",
    "query": "what is roe v wade?",
    "context": {
        "location": { "country": "US" },
        "recent_topics": ["abortion", "privacy rights"]
    }
}
```

**Response**:
```json
{
    "success": true,
    "response": "**Roe v. Wade (1973)**\n\n📋 **Summary**: ...",
    "source": "cache",
    "response_time_ms": 45,
    "cost": 0,
    "topics_extracted": ["roe v wade", "abortion", "supreme court"],
    "conversation_id": "uuid-here"
}
```

#### `POST /api/chat/bills`
Bills-specific chat

#### `POST /api/chat/civic`
Civic engagement chat (reps, court, dashboard)

#### `POST /api/chat/ethical`
Ethical business chat

#### `POST /api/chat/voting`
Voting assistant chat

#### `POST /api/chat/candidates`
Candidate analysis chat

### **2. Data Endpoints**

#### `GET /api/data/bills?state=CA&level=federal`
Fetch bills by location/level

#### `GET /api/data/representatives?postcode=90210`
Fetch representatives by location

#### `GET /api/data/court-cases?country=US&topic=abortion`
Fetch court cases by filters

#### `GET /api/data/cooperatives?postcode=90210&radius=25`
Fetch cooperatives by location

#### `POST /api/data/user-context`
Save/update user context

---

## 🤖 Intelligent Query Routing Logic

```javascript
// Backend: Intelligent Query Handler
async function handleChatQuery(req, res) {
    const { chat_type, user_id, query, context } = req.body;
    
    // STEP 1: Normalize query
    const normalizedQuery = normalizeQuery(query);
    const queryHash = generateHash(normalizedQuery);
    
    // STEP 2: Check cached responses
    const cached = await checkCachedResponse(queryHash, chat_type);
    if (cached) {
        await updateCacheHitCount(cached.id);
        return res.json({
            success: true,
            response: cached.response_text,
            source: 'cache',
            response_time_ms: Date.now() - startTime,
            cost: 0
        });
    }
    
    // STEP 3: Check knowledge base (database queries)
    const dbResponse = await checkKnowledgeBase(normalizedQuery, chat_type, context);
    if (dbResponse) {
        await cacheResponse(queryHash, dbResponse, 'database', chat_type);
        return res.json({
            success: true,
            response: dbResponse,
            source: 'database',
            response_time_ms: Date.now() - startTime,
            cost: 0
        });
    }
    
    // STEP 4: Build rich context for AI
    const aiContext = await buildAIContext(user_id, chat_type, query);
    
    // STEP 5: Query Groq API
    const aiResponse = await queryGroqAPI(query, aiContext);
    
    // STEP 6: Cache AI response for future
    await cacheResponse(queryHash, aiResponse, 'ai', chat_type);
    
    // STEP 7: Update conversation memory
    await saveConversationMemory(user_id, chat_type, query, aiResponse);
    
    return res.json({
        success: true,
        response: aiResponse,
        source: 'ai',
        response_time_ms: Date.now() - startTime,
        cost: 0.0001
    });
}

// Build rich context from knowledge base
async function buildAIContext(user_id, chat_type, query) {
    // Get user's location and preferences
    const userContext = await db.query(
        'SELECT * FROM user_contexts WHERE user_id = $1',
        [user_id]
    );
    
    // Get recent conversation history
    const recentMessages = await db.query(
        'SELECT * FROM conversation_memory WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 10',
        [user_id]
    );
    
    // Extract topics and entities from query
    const topics = extractTopics(query);
    const entities = extractEntities(query);
    
    // Fetch relevant knowledge base data
    let relevantData = {};
    
    if (chat_type === 'bills') {
        relevantData.bills = await fetchRelevantBills(topics, userContext);
    } else if (chat_type === 'supreme-court') {
        relevantData.cases = await fetchRelevantCases(topics);
    } else if (chat_type === 'representatives') {
        relevantData.reps = await fetchRepresentatives(userContext.location);
    } else if (chat_type === 'ethical') {
        relevantData.coops = await fetchCooperatives(userContext.location);
    }
    
    return {
        user: userContext,
        recent_conversation: recentMessages.rows,
        relevant_data: relevantData,
        topics: topics,
        entities: entities
    };
}
```

---

## 📥 Data Population Strategy

### **Phase 1: Government Data (Automated)**

1. **Bills Data**:
   - Source: Congress.gov API (federal)
   - Source: State legislature APIs (LegiScan, etc.)
   - Update frequency: Daily
   - Estimated records: 10,000-50,000 active bills

2. **Representatives Data**:
   - Source: ProPublica Congress API
   - Source: OpenStates API
   - Update frequency: Monthly
   - Estimated records: 600+ federal, 7,000+ state

3. **Court Cases Data**:
   - Source: Manual entry for famous cases (start with 50-100)
   - Source: CourtListener API (future expansion)
   - Update frequency: Weekly
   - Estimated records: 100-500 landmark cases

### **Phase 2: Educational Content (Manual + Automated)**

1. **Cooperatives Database**:
   - Source: Democracy at Work Institute
   - Source: US Federation of Worker Cooperatives
   - Source: Manual entry
   - Estimated records: 5,000-10,000 cooperatives

2. **B Corps Directory**:
   - Source: B Lab API
   - Update frequency: Monthly
   - Estimated records: 7,000+ B Corps

3. **FAQ Content**:
   - Source: Existing FAQ database (js/faq-new.js)
   - Update frequency: As needed
   - Estimated records: 50-100 FAQs

### **Phase 3: User Data (Dynamic)**

1. **User Contexts**:
   - Source: Frontend submissions (opt-in)
   - Encrypted storage
   - Privacy-first design

2. **Conversation Memory**:
   - Source: Chat interactions
   - Retention: 30 days (configurable)
   - Encrypted storage

---

## 🔒 Security & Privacy

### **Encryption**:
- ✅ User data encrypted at rest (AES-256)
- ✅ Conversation memory encrypted
- ✅ Voting history encrypted
- ✅ HTTPS for all API communication

### **Privacy**:
- ✅ Anonymous user IDs (no personal info required)
- ✅ Opt-in for personalization
- ✅ Data retention policies (30-90 days)
- ✅ Right to be forgotten (user can delete all data)

### **Rate Limiting**:
- ✅ API rate limits per IP (100 requests/minute)
- ✅ User-based rate limits (50 queries/hour)
- ✅ Prevents abuse and reduces costs

---

## 💰 Cost Estimation

### **Infrastructure Costs**:
- Njalla VPS: €15/month (already paid)
- PostgreSQL: Included in VPS
- Storage: ~10GB database (included)
- **Total**: €0 additional (using existing VPS)

### **API Costs (Groq)**:
- **Without caching**: 100,000 queries/month × $0.0001 = $10/month
- **With 80% cache hit rate**: 20,000 queries/month × $0.0001 = $2/month
- **With 90% cache hit rate**: 10,000 queries/month × $0.0001 = $1/month

**Estimated Savings**: $8-9/month compared to no caching!

---

## 🚀 Implementation Timeline

### **Week 1: Database Setup**
- [ ] Set up PostgreSQL on Njalla VPS
- [ ] Create database schema (all 8 tables)
- [ ] Set up encryption for sensitive data
- [ ] Create database backup system

### **Week 2: API Development**
- [ ] Build Node.js/Express API server
- [ ] Implement intelligent query routing
- [ ] Create all API endpoints
- [ ] Add rate limiting and security

### **Week 3: Data Population**
- [ ] Populate famous court cases (50-100)
- [ ] Import bills data from APIs
- [ ] Import representatives data
- [ ] Import cooperatives database

### **Week 4: Frontend Integration**
- [ ] Update all 9 chat systems to call backend API
- [ ] Display response source (cache vs AI)
- [ ] Implement conversation memory
- [ ] Test all endpoints

### **Week 5: Testing & Optimization**
- [ ] Load testing
- [ ] Cache hit rate optimization
- [ ] Cost monitoring
- [ ] Performance tuning

### **Week 6: Launch**
- [ ] Deploy to production
- [ ] Monitor performance
- [ ] Iterate based on usage

---

## 📊 Success Metrics

**Track these metrics to measure effectiveness**:

1. **Cache Hit Rate**: Target 80-90%
2. **Response Time**: Target <100ms for cached, <2000ms for AI
3. **Cost Per Query**: Target $0.00001-0.00002 (vs $0.0001 without cache)
4. **User Satisfaction**: Measure via feedback
5. **Context Accuracy**: Measure how often cross-chat context helps

---

## 🎉 Expected Benefits

1. **💰 Cost Savings**: 80-90% reduction in AI costs
2. **⚡ Speed**: 10-40x faster responses for cached queries
3. **🎯 Accuracy**: Factual government data, not hallucinated
4. **🧠 Intelligence**: Cross-chat context awareness
5. **🔒 Privacy**: User data stays on your server
6. **✅ Reliability**: No dependency on external AI for common queries

---

## 🤔 Next Steps

1. **Confirm Architecture**: Does this design meet your needs?
2. **Choose Tech Stack**: Node.js + PostgreSQL OK?
3. **Set Priorities**: Which data to populate first?
4. **Timeline**: 6-week timeline acceptable?

**Ready to start building?** Let's begin with the database schema! 🚀
