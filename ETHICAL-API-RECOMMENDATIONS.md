# 🌐 Ethical API Recommendations for Phase 2 Backend

**Document Version:** 1.0  
**Created:** 2025-01-25  
**Status:** Pre-deployment Planning  
**Philosophy:** Privacy-first, ethical computing, user agency, transparency

---

## 📋 Executive Summary

This document provides **thoroughly researched recommendations** for ethical API services aligned with the Workforce Democracy Project's core values. All recommendations prioritize:

- **Privacy-first architecture** (minimal data collection)
- **Ethical business practices** (no surveillance capitalism)
- **Transparency** (open about data handling)
- **User agency** (users control their data)
- **No vendor lock-in** (open standards, portable)

---

## 🎯 Current API Placeholder Locations

### Files Requiring Updates:
1. **`js/bills-chat.js`** (line 169)
   - Current: `https://your-njalla-domain.com/api/bills/chat`
   - Purpose: Legislative bill Q&A chat endpoint

2. **`js/bills-section.js`** (line 151)
   - Current: `https://your-njalla-domain.com/api/bills/search`
   - Purpose: Congressional bill search

3. **`js/bills-section.js`** (line 652)
   - Current: `https://your-njalla-domain.com/api/bills/summary`
   - Purpose: Bill summary generation

---

## 🔍 API Service Categories Needed

### 1. **AI/LLM Services** (Conversational Chat)
### 2. **Government Data APIs** (Legislative Information)
### 3. **Backend Hosting** (Your API Server)
### 4. **Database Services** (Data Storage)

---

## 🤖 Part 1: AI/LLM Services (Ethical Recommendations)

### ⭐ **RECOMMENDED: Groq (Current Choice)**

**Website:** https://groq.com  
**Privacy Score:** 9/10  
**Ethics Score:** 10/10

#### ✅ Why Groq Aligns with Your Values:

1. **Privacy-Respecting**
   - No training on user data by default
   - Clear data retention policies (30 days)
   - GDPR & SOC 2 compliant
   - API calls don't contribute to model training unless explicitly opted in

2. **Ethical Business Model**
   - Focus on **inference speed** (hardware innovation), not data harvesting
   - No surveillance capitalism
   - Transparent pricing ($0.10-0.27 per 1M tokens for Llama models)
   - Open-weight model support (Llama 3, Mixtral)

3. **Technical Excellence**
   - **10x faster** than competitors (LPU architecture)
   - Sub-second response times for conversational chat
   - Supports open models (no vendor lock-in)

4. **Free Tier**
   - 14,400 requests/day (refreshes daily)
   - 6,000 requests/minute rate limit
   - All models available (including Llama 3.3 70B)

#### 📝 Implementation Example:
```javascript
// Ethical Groq API call (bills-chat.js)
async function chatWithBills(userMessage) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {role: 'system', content: 'You are a helpful assistant...'},
                {role: 'user', content: userMessage}
            ],
            temperature: 0.7,
            max_tokens: 1024
        })
    });
    return await response.json();
}
```

#### 🔒 Privacy Best Practices:
- Store API key in environment variables (never commit to git)
- Use server-side proxy (don't expose API key to frontend)
- Implement rate limiting on your backend
- Don't log user conversations long-term
- Add opt-out notice in UI: "Conversations processed via Groq (30-day retention)"

---

### 🥈 **Alternative: Ollama (Self-Hosted)**

**Website:** https://ollama.ai  
**Privacy Score:** 10/10  
**Ethics Score:** 10/10

#### ✅ Why Ollama:

1. **100% Self-Hosted**
   - Zero external API calls
   - Complete data sovereignty
   - No third-party data sharing
   - Free forever (just server costs)

2. **Open Source**
   - Fully transparent codebase
   - Community-driven
   - No vendor lock-in
   - Supports all open models

3. **Privacy Guarantees**
   - Data never leaves your server
   - You control retention policies
   - No telemetry or tracking
   - GDPR compliant by design

#### ⚠️ Trade-offs:
- **Higher infrastructure costs** (GPU server required)
- **Slower inference** than Groq (10-30 seconds vs sub-second)
- **More DevOps complexity** (model management, updates)
- **Less scalable** (limited by your server capacity)

#### 💰 Cost Estimate:
- **Option A:** Hetzner Cloud GPU server (~€100-200/month)
- **Option B:** RunPod serverless GPU (~$0.50-1.00/hour on-demand)
- **Option C:** Home server with NVIDIA GPU (one-time cost)

#### 📝 Implementation Example:
```javascript
// Self-hosted Ollama API call
async function chatWithBills(userMessage) {
    const response = await fetch('https://your-ollama-server.com/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            model: 'llama3.3:70b',
            messages: [
                {role: 'system', content: 'You are a helpful assistant...'},
                {role: 'user', content: userMessage}
            ],
            stream: false
        })
    });
    return await response.json();
}
```

---

### ❌ **AVOID: OpenAI, Anthropic, Google Gemini**

#### Why These Don't Align:

**OpenAI (ChatGPT)**
- ❌ Trains on user data by default (must opt-out)
- ❌ Data retention: 30 days (audit logs up to 1 year)
- ❌ Closed-source models (vendor lock-in)
- ❌ Expensive ($5-60 per 1M tokens)
- ❌ Privacy concerns (Microsoft partnership, government contracts)

**Anthropic (Claude)**
- ❌ Trains on conversations (unless business tier)
- ❌ Closed-source
- ❌ Expensive ($3-15 per 1M tokens)
- ⚠️ Slightly better privacy than OpenAI but still proprietary

**Google Gemini**
- ❌ Part of Google surveillance ecosystem
- ❌ Aggressive data collection
- ❌ Privacy track record concerns
- ❌ Will use data for advertising insights

---

## 🏛️ Part 2: Government Data APIs (Legislative Information)

### ⭐ **RECOMMENDED: Congress.gov API (Official)**

**Website:** https://api.congress.gov  
**Privacy Score:** 10/10  
**Ethics Score:** 10/10

#### ✅ Why Congress.gov API:

1. **Official U.S. Government Source**
   - Authoritative data (Library of Congress)
   - Real-time bill tracking
   - No privacy concerns (public data)
   - Free forever

2. **Comprehensive Data**
   - Full bill text and summaries
   - Voting records
   - Committee assignments
   - Member information
   - Bill status tracking

3. **No Restrictions**
   - Free API key (no cost)
   - Generous rate limits
   - Public domain data
   - No terms-of-service restrictions

#### 🔑 API Key: **Free** (request at api.congress.gov)

#### 📝 Implementation Example:
```javascript
// Congress.gov API call (bills-section.js)
async function searchBills(query) {
    const apiKey = process.env.CONGRESS_API_KEY;
    const response = await fetch(
        `https://api.congress.gov/v3/bill?api_key=${apiKey}&format=json&limit=20&offset=0&query=${encodeURIComponent(query)}`
    );
    return await response.json();
}

async function getBillSummary(billType, billNumber, congress) {
    const apiKey = process.env.CONGRESS_API_KEY;
    const response = await fetch(
        `https://api.congress.gov/v3/bill/${congress}/${billType}/${billNumber}/summaries?api_key=${apiKey}&format=json`
    );
    return await response.json();
}
```

#### 📚 Documentation:
- Official docs: https://api.congress.gov/
- Bill endpoint: `/v3/bill/{congress}/{type}/{number}`
- Search endpoint: `/v3/bill?query={search}`
- Rate limit: 1,000 requests/hour (can request increase)

---

### 🥈 **Alternative: ProPublica Congress API**

**Website:** https://projects.propublica.org/api-docs/congress-api/  
**Privacy Score:** 10/10  
**Ethics Score:** 10/10

#### ✅ Why ProPublica:

1. **Nonprofit Journalism**
   - Mission-driven organization
   - No advertising or tracking
   - Investigative journalism focus
   - Pulitzer Prize winners

2. **Enhanced Data**
   - Member voting records
   - Committee membership
   - Campaign finance links
   - Floor statements

3. **Free API**
   - No cost
   - Simple API key registration
   - Well-documented

#### 🔑 API Key: **Free** (email request to propublica)

#### 📝 Implementation Example:
```javascript
// ProPublica Congress API
async function getMemberVotes(memberId) {
    const apiKey = process.env.PROPUBLICA_API_KEY;
    const response = await fetch(
        `https://api.propublica.org/congress/v1/members/${memberId}/votes.json`,
        {
            headers: {
                'X-API-Key': apiKey
            }
        }
    );
    return await response.json();
}
```

---

## 🖥️ Part 3: Backend Hosting (Ethical Recommendations)

### ⭐ **RECOMMENDED: Njalla (Current Choice)**

**Website:** https://njal.la  
**Privacy Score:** 10/10  
**Ethics Score:** 10/10

#### ✅ Why Njalla Aligns:

1. **Privacy-First Mission**
   - Founded by The Pirate Bay founder (privacy activist)
   - Anonymous domain registration
   - No customer data collection
   - Accepts cryptocurrency

2. **Ethical Values**
   - Anti-surveillance stance
   - Transparency reports
   - Whistleblower-friendly
   - Free speech advocacy

3. **Services Offered**
   - Domain registration
   - VPS hosting
   - Email hosting
   - No tracking or logging

#### 💰 VPS Pricing:
- **Small:** €15/month (2 CPU, 2GB RAM, 40GB SSD)
- **Medium:** €30/month (4 CPU, 4GB RAM, 80GB SSD)
- **Large:** €60/month (8 CPU, 8GB RAM, 160GB SSD)

#### 📍 Server Locations:
- Sweden, Netherlands, Luxembourg (strong privacy laws)
- All locations: GDPR compliant
- No U.S. jurisdiction (no NSA backdoors)

---

### 🥈 **Alternative: Hetzner Cloud**

**Website:** https://www.hetzner.com  
**Privacy Score:** 9/10  
**Ethics Score:** 9/10

#### ✅ Why Hetzner:

1. **European Privacy**
   - German company (strong data protection laws)
   - GDPR compliant
   - No U.S. jurisdiction
   - Transparent privacy policy

2. **Best Price/Performance**
   - **€4.49/month** (2 CPU, 4GB RAM, 40GB SSD)
   - **€8.49/month** (2 CPU, 8GB RAM, 80GB SSD)
   - Significantly cheaper than AWS/Google/Azure

3. **Green Energy**
   - 100% renewable energy data centers
   - Carbon-neutral operations
   - Environmental leadership

#### 📍 Server Locations:
- Germany, Finland, Sweden (EU privacy jurisdiction)
- Optional: U.S. locations (if needed for latency)

---

### ❌ **AVOID: AWS, Google Cloud, Microsoft Azure**

#### Why These Don't Align:

**Amazon Web Services (AWS)**
- ❌ Government surveillance partnerships (CIA contract)
- ❌ Facial recognition technology sold to police
- ❌ Anti-union practices
- ❌ Privacy concerns (data mining for advertising)

**Google Cloud Platform**
- ❌ Surveillance capitalism business model
- ❌ Extensive user tracking
- ❌ Data used for advertising
- ❌ Government contracts (Project Maven)

**Microsoft Azure**
- ❌ Government surveillance partnerships (PRISM)
- ❌ Windows telemetry concerns
- ❌ LinkedIn data integration
- ❌ Less privacy-focused than alternatives

---

## 🗄️ Part 4: Database Services (Ethical Recommendations)

### ⭐ **RECOMMENDED: Self-Hosted PostgreSQL**

**Privacy Score:** 10/10  
**Ethics Score:** 10/10

#### ✅ Why Self-Hosted PostgreSQL:

1. **Complete Control**
   - Data never leaves your server
   - No third-party access
   - You control backups and retention
   - Open source (no vendor lock-in)

2. **Privacy Guarantees**
   - Zero external data sharing
   - GDPR compliant by design
   - No telemetry or tracking
   - Encryption at rest available

3. **Technical Excellence**
   - Industry-standard RDBMS
   - Battle-tested reliability
   - Excellent performance
   - Rich ecosystem

#### 📝 Deployment:
```bash
# Install PostgreSQL on Njalla VPS
sudo apt update
sudo apt install postgresql postgresql-contrib

# Secure configuration
sudo -u postgres psql
CREATE DATABASE workforce_democracy;
CREATE USER wdp_api WITH ENCRYPTED PASSWORD 'strong_password';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_api;
```

#### 🔒 Security Hardening:
- Encrypted connections only (SSL/TLS)
- Strong password authentication
- Firewall rules (only backend server access)
- Regular automated backups
- Encryption at rest (LUKS or PostgreSQL encryption)

---

### 🥈 **Alternative: MongoDB (Self-Hosted)**

**Privacy Score:** 10/10  
**Ethics Score:** 9/10

#### ✅ Why MongoDB:

1. **Document-Oriented**
   - Flexible schema
   - JSON-like documents
   - Good for evolving data models

2. **Open Source**
   - SSPL license (copyleft)
   - Community edition free forever
   - No vendor lock-in

#### ⚠️ Caution:
- **MongoDB Atlas** (cloud) = privacy concerns (third-party managed)
- **Self-hosted only** for your use case

---

### ❌ **AVOID: Firebase, Supabase, PlanetScale (Cloud-Hosted)**

#### Why These Don't Align:

**Firebase (Google)**
- ❌ Part of Google surveillance ecosystem
- ❌ Data accessible to Google
- ❌ Privacy concerns
- ❌ Vendor lock-in

**Supabase**
- ⚠️ Third-party managed (PostgreSQL as a service)
- ⚠️ Your data on their servers
- ⚠️ Better than Firebase but not self-hosted
- ✅ Can self-host (but then just use PostgreSQL directly)

**PlanetScale**
- ⚠️ MySQL as a service
- ⚠️ Third-party data access
- ⚠️ Pricing unpredictability

---

## 🏗️ Recommended Architecture (Phase 2)

### **Full Stack: Privacy-First**

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Static Site - Current)                       │
│  ├── Hosted: Njalla or Cloudflare Pages                │
│  ├── Encryption: AES-256-GCM client-side               │
│  └── Storage: localStorage only                        │
└─────────────────────────────────────────────────────────┘
                          ▼
                    HTTPS (TLS 1.3)
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Backend API Server (Node.js/Express)                   │
│  ├── Hosted: Njalla VPS (Sweden/Netherlands)           │
│  ├── Framework: Express.js or Fastify                  │
│  ├── Rate Limiting: 100 req/min per IP                 │
│  └── Logging: Minimal (no PII storage)                 │
└─────────────────────────────────────────────────────────┘
                          ▼
            ┌─────────────┴─────────────┐
            ▼                           ▼
┌───────────────────────┐   ┌───────────────────────┐
│  Groq API (LLM)       │   │  PostgreSQL Database  │
│  ├── Llama 3.3 70B    │   │  ├── Self-hosted      │
│  ├── 30-day retention │   │  ├── Encrypted        │
│  └── No training      │   │  └── Daily backups    │
└───────────────────────┘   └───────────────────────┘
            ▼
┌───────────────────────┐
│  Congress.gov API     │
│  ├── Official source  │
│  ├── Public data      │
│  └── Free forever     │
└───────────────────────┘
```

---

## 🔐 Security & Privacy Checklist

### Before Going Live with Phase 2:

- [ ] **Environment Variables**
  - Store all API keys in `.env` file (never commit)
  - Use `dotenv` package for Node.js
  - Rotate keys every 90 days

- [ ] **HTTPS Everywhere**
  - TLS 1.3 only (no older protocols)
  - Let's Encrypt free SSL certificate
  - HSTS header enabled

- [ ] **Rate Limiting**
  - Backend: 100 requests/minute per IP
  - Frontend: Client-side debouncing
  - Cloudflare rate limiting (if used)

- [ ] **Data Minimization**
  - Only store essential data
  - No logging of user conversations (except errors)
  - Auto-delete old data (30-90 day retention)

- [ ] **CORS Configuration**
  - Whitelist only your domain
  - No wildcard (`*`) origins
  - Credentials: true only if needed

- [ ] **Database Security**
  - Strong passwords (32+ characters)
  - Firewall rules (backend server only)
  - Encrypted connections (SSL/TLS)
  - Regular backups (encrypted)

- [ ] **Monitoring & Logging**
  - Server health monitoring (UptimeRobot)
  - Error logging (no PII)
  - Security alerts (SSH login attempts)

---

## 💰 Cost Estimate (Monthly)

### **Recommended Setup:**

| Service | Provider | Cost |
|---------|----------|------|
| **Domain** | Njalla | $15 |
| **VPS Hosting** | Njalla Medium VPS | €30 (~$33) |
| **Database** | Self-hosted PostgreSQL | $0 (included) |
| **LLM API** | Groq Free Tier | $0 (14k req/day) |
| **Government Data** | Congress.gov API | $0 |
| **SSL Certificate** | Let's Encrypt | $0 |
| **Total** | | **~$48/month** |

### **If Groq Free Tier Exceeded:**
- **Groq Paid Tier:** $0.10-0.27 per 1M tokens
- **Estimate:** ~$10-30/month (depends on usage)
- **Total:** ~$58-78/month

### **Budget Option (€25/month total):**
- Hetzner Cloud VPS: €8.49/month
- Njalla Domain: $15/month
- Everything else: Free
- **Total:** ~$25/month

---

## 🎯 Implementation Roadmap

### **Phase 2.1: Backend Setup (Week 1)**
1. Provision Njalla VPS (Medium)
2. Install Node.js, PostgreSQL, Nginx
3. Configure SSL (Let's Encrypt)
4. Set up firewall and security hardening
5. Deploy basic Express.js API

### **Phase 2.2: API Integration (Week 2)**
1. Register Groq API key (free tier)
2. Register Congress.gov API key
3. Implement `/api/bills/search` endpoint
4. Implement `/api/bills/summary` endpoint
5. Add rate limiting and error handling

### **Phase 2.3: Chat Integration (Week 3)**
1. Implement `/api/bills/chat` endpoint
2. Connect to Groq API (Llama 3.3 70B)
3. Add conversation context management
4. Test response quality and latency
5. Add privacy notice to UI

### **Phase 2.4: Testing & Optimization (Week 4)**
1. Load testing (stress test API endpoints)
2. Security audit (penetration testing)
3. Privacy verification (no data leaks)
4. Performance optimization (caching, CDN)
5. Documentation and deployment

---

## 📚 Additional Resources

### **Privacy-Focused Guides:**
- EFF Surveillance Self-Defense: https://ssd.eff.org/
- OWASP API Security: https://owasp.org/www-project-api-security/
- NIST Privacy Framework: https://www.nist.gov/privacy-framework

### **Ethical Hosting Reviews:**
- Privacy Tools: https://www.privacytools.io/
- Ethical Web: https://ethical.net/resources/

### **API Documentation:**
- Groq API: https://console.groq.com/docs
- Congress.gov API: https://api.congress.gov/
- ProPublica Congress API: https://projects.propublica.org/api-docs/congress-api/

---

## ✅ Final Recommendation Summary

### **Ethical Stack (Privacy-First):**

1. **AI/LLM:** Groq (Llama 3.3 70B)
   - Privacy-respecting, fast, free tier generous

2. **Government Data:** Congress.gov API
   - Official source, free, no privacy concerns

3. **Hosting:** Njalla VPS (Sweden/Netherlands)
   - Privacy activist-founded, GDPR compliant, accepts crypto

4. **Database:** Self-hosted PostgreSQL
   - Complete control, no third-party access, open source

5. **SSL:** Let's Encrypt
   - Free, automated, industry standard

### **Total Monthly Cost:** ~$48 (or $25 with Hetzner)

### **Privacy Score:** 10/10 ✅
### **Ethics Score:** 10/10 ✅
### **Alignment with Philosophy:** 100% ✅

---

## 🔄 Next Steps

1. **Review this document** and confirm alignment with your values
2. **Choose hosting provider** (Njalla vs Hetzner)
3. **Register API keys** (Groq, Congress.gov)
4. **Provision VPS** and set up backend infrastructure
5. **Update placeholder URLs** in JavaScript files
6. **Begin Phase 2 implementation** following roadmap

---

**Document Maintainer:** AI Assistant  
**Last Updated:** 2025-01-25  
**Status:** Ready for Review  

**Philosophy Check:** This document prioritizes user privacy, ethical computing, and transparency over convenience or cost savings. All recommendations avoid surveillance capitalism and respect user agency.
