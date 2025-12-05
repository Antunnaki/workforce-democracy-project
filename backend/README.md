# 🏛️ Workforce Democracy Project - Backend API

**Version**: 1.0  
**Status**: 🚧 In Development  
**Architecture**: Cache-First Knowledge Base with AI Fallback

---

## 🎯 Overview

Intelligent backend server that powers all 9 chat assistants with:
- ✅ **Shared knowledge base** (bills, representatives, court cases, cooperatives)
- ✅ **Smart caching** (80-90% cache hit rate target)
- ✅ **Cross-chat context** (conversations remembered across assistants)
- ✅ **Cost optimization** (cache first, AI fallback)
- ✅ **Privacy-first** (user data encrypted and controlled)

---

## 🏗️ Architecture

```
Frontend (9 Chat Assistants)
    ↓
Backend API (Node.js + Express)
    ↓
┌─────────────────────────────────┐
│  Intelligent Query Routing      │
│  1. Check Cache (FREE, 0-50ms)  │
│  2. Check DB (FREE, 50-200ms)   │
│  3. Call Groq AI (~$0.0001)     │
│  4. Cache Response for Future   │
└─────────────────────────────────┘
    ↓
PostgreSQL Knowledge Base
    ├─ Bills (federal, state, local)
    ├─ Representatives & voting records
    ├─ Supreme Court cases
    ├─ Worker cooperatives & B Corps
    ├─ User contexts (encrypted)
    ├─ Conversation memory
    └─ Cached responses
```

---

## 📊 Database Schema

### **9 Core Tables**:

1. **`bills`** - Government legislation (federal, state, local)
2. **`representatives`** - Elected officials & voting records
3. **`court_cases`** - Supreme Court & federal cases
4. **`cooperatives`** - Worker cooperatives & B Corps
5. **`user_contexts`** - User preferences & location (encrypted)
6. **`conversation_memory`** - Cross-chat conversation history
7. **`cached_responses`** - AI response cache
8. **`faq_content`** - Pre-written FAQ answers
9. **`api_usage_metrics`** - Cost tracking & analytics

### **3 Views**:
- `cache_hit_rate` - Cache performance by chat type
- `popular_court_cases` - Most-asked cases
- `cost_summary` - Daily cost tracking

---

## 🚀 Quick Start

### **Prerequisites**:
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### **Installation**:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual credentials

# 4. Create database
createdb workforce_democracy

# 5. Run database schema
psql -U postgres -d workforce_democracy -f database-schema.sql

# 6. Start server
npm run dev
```

Server will run on `http://localhost:3001`

---

## 🔧 API Endpoints

### **Chat Endpoints**

#### `POST /api/chat/query`
Universal chat endpoint for all 9 assistants

**Request**:
```json
{
  "chat_type": "supreme-court",
  "user_id": "anonymous-hash-12345",
  "query": "what is roe v wade?",
  "context": {
    "location": { "postcode": "90210", "state": "CA" }
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
  "topics": ["roe v wade", "abortion", "privacy"]
}
```

### **Data Endpoints**

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

### **Metrics Endpoints**

#### `GET /api/metrics/summary`
Get cache hit rate, costs, and performance metrics

---

## 💡 How It Works

### **Query Flow**:

```javascript
1. User asks: "what is roe v wade?"
   ↓
2. Backend normalizes query → generates hash
   ↓
3. CHECK CACHE:
   • Query hash found? → Return cached response (FREE, 0-50ms) ✅
   ↓
4. CHECK DATABASE:
   • Famous case in court_cases table? → Return DB response (FREE, 50-200ms) ✅
   ↓
5. CALL GROQ AI:
   • No cache, no DB match → Query Groq API (~$0.0001, 500-2000ms)
   • Cache response for future queries
   ↓
6. SAVE TO MEMORY:
   • Store conversation for cross-chat context
   • Extract topics & entities
   ↓
7. RETURN RESPONSE:
   • Include source (cache/database/ai)
   • Include response time & cost
```

### **Example: Cross-Chat Context**

**User in Bills Chat**: "What is HR 1234?"
→ System saves: User interested in HR 1234 (healthcare bill)

**Later, User in Representatives Chat**: "How did my rep vote on that healthcare bill?"
→ System knows "that healthcare bill" = HR 1234
→ Returns vote without asking which bill!

---

## 🔒 Security & Privacy

### **Encryption**:
- User data encrypted at rest (AES-256)
- Conversation memory encrypted
- Voting history encrypted
- HTTPS for all communication

### **Privacy**:
- Anonymous user IDs (no personal info required)
- Opt-in for personalization
- Data retention: 30 days (configurable)
- Right to be forgotten (delete all user data)

### **Rate Limiting**:
- 100 requests/minute per IP
- 50 queries/hour per user
- Prevents abuse and reduces costs

---

## 💰 Cost Estimation

### **Infrastructure**:
- Njalla VPS: €15/month (already paid)
- PostgreSQL: Included
- Storage: ~10GB (included)
- **Total**: €0 additional

### **API Costs (Groq)**:
- **Without caching**: 100,000 queries × $0.0001 = $10/month
- **With 80% cache hit**: 20,000 queries × $0.0001 = $2/month
- **With 90% cache hit**: 10,000 queries × $0.0001 = $1/month

**Savings**: $8-9/month vs. no caching!

---

## 📈 Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Cache Hit Rate | 80-90% | TBD |
| Cached Response Time | <100ms | TBD |
| DB Response Time | <200ms | TBD |
| AI Response Time | <2000ms | TBD |
| Cost Per Query | $0.00001-0.00002 | TBD |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- server.test.js
```

---

## 📝 Data Population

### **Government Data** (Automated):
```bash
# Populate bills from Congress.gov API
node scripts/populate-bills.js

# Populate representatives from ProPublica API
node scripts/populate-representatives.js

# Populate court cases (manual entry + CourtListener)
node scripts/populate-court-cases.js
```

### **Educational Content** (Manual + Automated):
```bash
# Import cooperatives from CSV
node scripts/import-cooperatives.js cooperatives.csv

# Import B Corps from B Lab API
node scripts/populate-bcorps.js
```

### **Initial Data** (Included in Schema):
- ✅ 5 famous Supreme Court cases (Roe v Wade, Brown v Board, Miranda, Citizens United, Dobbs)

---

## 🔧 Environment Variables

Required variables (see `.env.example`):

- `DB_PASSWORD` - PostgreSQL password
- `GROQ_API_KEY` - Groq API key for AI queries
- `SESSION_SECRET` - Random secret for sessions
- `JWT_SECRET` - Random secret for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

Generate random secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Monitoring & Analytics

### **Cache Performance**:
```sql
SELECT * FROM cache_hit_rate;
```

### **Cost Tracking**:
```sql
SELECT * FROM cost_summary;
```

### **Popular Cases**:
```sql
SELECT * FROM popular_court_cases;
```

### **API Usage**:
```sql
SELECT chat_type, source, COUNT(*), AVG(response_time_ms)
FROM api_usage_metrics
WHERE timestamp > NOW() - INTERVAL '7 days'
GROUP BY chat_type, source;
```

---

## 🚧 Development Roadmap

### **Phase 1: Foundation** (Week 1-2)
- [x] Database schema design
- [x] Basic API server setup
- [x] Intelligent query routing
- [ ] Deploy to Njalla VPS

### **Phase 2: Data Population** (Week 3-4)
- [ ] Populate famous court cases (50-100)
- [ ] Import bills data (federal)
- [ ] Import representatives data
- [ ] Import cooperatives database

### **Phase 3: Frontend Integration** (Week 5)
- [ ] Update all 9 chat systems
- [ ] Display response source (cache/db/ai)
- [ ] Implement conversation memory
- [ ] Test all endpoints

### **Phase 4: Optimization** (Week 6)
- [ ] Load testing
- [ ] Cache hit rate optimization
- [ ] Cost monitoring
- [ ] Performance tuning

---

## 🐛 Troubleshooting

### **Database Connection Issues**:
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Test connection
psql -U postgres -d workforce_democracy -c "SELECT NOW();"
```

### **Port Already in Use**:
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>
```

### **Environment Variables Not Loading**:
```bash
# Verify .env file exists
ls -la .env

# Check dotenv is installed
npm list dotenv
```

---

## 📚 Additional Documentation

- **Database Schema**: See `database-schema.sql`
- **API Documentation**: See `API.md` (coming soon)
- **Deployment Guide**: See `DEPLOYMENT.md` (coming soon)
- **Architecture Proposal**: See `../AI-ASSISTANT-ARCHITECTURE-PROPOSAL.md`

---

## 🤝 Contributing

This is a privacy-first, ethical democracy project. Contributions welcome!

### **Guidelines**:
- Privacy-first design (no unnecessary tracking)
- Cache before AI (cost optimization)
- Clear, documented code
- Comprehensive tests
- Ethical AI usage

---

## 📄 License

MIT License - See LICENSE file

---

## 🎉 Acknowledgments

Built with love for democracy, transparency, and worker empowerment. 🏛️

**Tech Stack**:
- Node.js + Express (API server)
- PostgreSQL (knowledge base)
- Groq API (AI fallback)
- Deployed on Njalla VPS (privacy-focused hosting)

---

**Questions?** Check the main project README or open an issue!
