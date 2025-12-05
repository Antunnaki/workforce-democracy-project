# 🤖 Llama 3 Backend Architecture

## Overview

Complete guide to implementing a low-cost, ethical, secure Llama 3 backend for civic transparency features with citation-based fact-checking.

---

## 🎯 Architecture Goals

1. **Low Cost**: $5-20/month operational costs
2. **Ethical**: Transparent, cited, fact-checked responses
3. **Secure**: API key protection, rate limiting, data privacy
4. **Accurate**: Official sources only, multi-source verification
5. **Scalable**: Handle 1,000+ users/day efficiently

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Static)                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Workforce Democracy Website (index.html)            │   │
│  │  - Civic Transparency Section                        │   │
│  │  - Jobs Analysis Section                             │   │
│  │  - Ethical Business Chat                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓ HTTPS POST                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API SERVER                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js / FastAPI Server                         │   │
│  │  - Request validation & sanitization                 │   │
│  │  - Rate limiting (per user/IP)                       │   │
│  │  - Query routing                                     │   │
│  │  - Response caching (Redis)                          │   │
│  │  - Analytics logging                                 │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Llama 3 Inference Engine                            │   │
│  │  - Question understanding & classification           │   │
│  │  - API endpoint identification                       │   │
│  │  - Response formatting                               │   │
│  │  - Citation generation                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Government API Integration Layer                    │   │
│  │  - Congress.gov fetcher                              │   │
│  │  - ProPublica fetcher                                │   │
│  │  - CourtListener fetcher                             │   │
│  │  - Open States fetcher                               │   │
│  │  - International API fetchers                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Fact-Checking Layer                                 │   │
│  │  - Cross-reference multiple sources                  │   │
│  │  - FactCheck.org API                                 │   │
│  │  - Verify data consistency                           │   │
│  │  - Confidence scoring                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Response Builder                                    │   │
│  │  - Format answer with inline citations              │   │
│  │  - Generate source list                              │   │
│  │  - Add verification badges                           │   │
│  │  - Include confidence score                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  - Congress.gov API (free)                                   │
│  - ProPublica API (free)                                     │
│  - CourtListener API (free)                                  │
│  - Open States API (free)                                    │
│  - FactCheck.org API (free)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Options (Cost Comparison)

### Option 1: Together AI (Recommended for Start)

**Pros**:
- ✅ Serverless (no infrastructure management)
- ✅ Pay-per-token pricing
- ✅ Instant scaling
- ✅ No cold starts
- ✅ Simple API integration

**Cons**:
- ❌ Higher per-token cost at scale
- ❌ Less control over model

**Cost**: ~$0.20/1M tokens
- 150K queries/month × 500 tokens = 75M tokens
- **$15/month** (without caching)
- **$5/month** (with 70% cache hit rate)

**Setup Time**: 1 day

**Code Example**:
```python
import together

together.api_key = os.environ["TOGETHER_API_KEY"]

response = together.Complete.create(
    model="meta-llama/Llama-3-70b-chat-hf",
    prompt=f"Answer this civic question: {user_query}\n\nUse these sources: {sources}",
    max_tokens=500,
    temperature=0.7,
)
```

---

### Option 2: RunPod (Best for Scale)

**Pros**:
- ✅ Cheapest per-hour pricing
- ✅ Pay-per-second billing
- ✅ Full control over model
- ✅ GPU instances
- ✅ Can fine-tune model

**Cons**:
- ❌ Requires infrastructure management
- ❌ Cold start latency
- ❌ More complex setup

**Cost**: ~$0.30-0.60/hour
- 8 hours/day active = 240 hours/month
- **$72-144/month** (always-on)
- **$20-40/month** (with auto-scaling)

**Setup Time**: 3-5 days

**Optimization**: Use serverless with auto-scaling
- Spin up only when needed
- Scale to zero during low traffic
- **Reduces cost to ~$15-25/month**

---

### Option 3: Modal (Serverless Python)

**Pros**:
- ✅ Python-native
- ✅ Excellent cold start optimization
- ✅ Pay-per-second
- ✅ Easy deployment
- ✅ Built-in GPU support

**Cons**:
- ❌ Moderate pricing
- ❌ Learning curve for platform

**Cost**: ~$0.0001/second of compute
- Similar to RunPod but easier setup
- **$15-30/month** with auto-scaling

**Setup Time**: 2-3 days

---

### Option 4: Fly.io (Container-Based)

**Pros**:
- ✅ Global edge deployment
- ✅ Low latency worldwide
- ✅ Simple container deployment
- ✅ Excellent scaling

**Cons**:
- ❌ CPU-only (no GPU)
- ❌ Slower inference
- ❌ Better for API server, not LLM

**Cost**: ~$0.02/hour for CPU
- Use for **API server** not LLM inference
- **$15/month** for always-on API server

**Recommended Setup**:
- Fly.io for API server (fast, global)
- Together AI for LLM inference
- **Total: $20/month**

---

## 🏆 Recommended Architecture (Low Cost)

### Stack:
1. **API Server**: Fly.io ($15/month)
2. **LLM Inference**: Together AI ($5/month with caching)
3. **Caching**: Redis Cloud (free tier)
4. **Database**: SQLite or PostgreSQL (Fly.io included)

### Total Cost: **$20/month**

### Why This Works:
- ✅ API server responds instantly (global edge)
- ✅ LLM calls only when needed
- ✅ 70%+ cache hit rate reduces LLM cost
- ✅ Simple deployment
- ✅ Scales to 10,000+ users

---

## 📦 Backend Implementation

### Tech Stack

**Language**: Python (recommended) or Node.js

**Framework**: FastAPI (Python) or Express.js (Node.js)

**Key Libraries**:
- `together` - LLM inference
- `redis` - Caching
- `httpx` / `axios` - API requests
- `pydantic` / `zod` - Validation
- `ratelimit` - Rate limiting

---

### Project Structure

```
workforce-democracy-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Environment config
│   ├── models.py            # Pydantic models
│   ├── routers/
│   │   ├── civic.py         # Civic queries
│   │   ├── jobs.py          # Jobs analysis
│   │   └── ethical.py       # Ethical business chat
│   ├── services/
│   │   ├── llm.py           # Llama 3 integration
│   │   ├── government_apis.py # API fetchers
│   │   ├── fact_check.py    # Verification
│   │   └── citations.py     # Citation builder
│   ├── utils/
│   │   ├── cache.py         # Redis caching
│   │   ├── rate_limit.py    # Rate limiting
│   │   └── security.py      # API key management
│   └── prompts/
│       ├── civic_prompt.txt
│       ├── jobs_prompt.txt
│       └── ethical_prompt.txt
├── tests/
│   ├── test_civic.py
│   ├── test_llm.py
│   └── test_apis.py
├── requirements.txt
├── Dockerfile
├── fly.toml                 # Fly.io config
├── .env.example
└── README.md
```

---

### Core API Endpoint

**File**: `app/routers/civic.py`

```python
from fastapi import APIRouter, HTTPException, Depends
from app.services import llm, government_apis, fact_check, citations
from app.utils import cache, rate_limit
from app.models import CivicQuery, CivicResponse

router = APIRouter(prefix="/api/civic", tags=["civic"])

@router.post("/query", response_model=CivicResponse)
@rate_limit.limit("10/minute")  # 10 queries per user per minute
async def query_civic_data(query: CivicQuery):
    """
    Handle civic transparency queries with fact-checking and citations.
    
    Example query:
    {
      "question": "What is the status of H.R. 1234?",
      "context": {
        "country": "us",
        "level": "federal"
      }
    }
    """
    
    # Check cache first (70% hit rate expected)
    cache_key = f"civic:{query.question}:{query.context}"
    cached = await cache.get(cache_key)
    if cached:
        return cached
    
    # Step 1: Understand the query using Llama 3
    query_analysis = await llm.analyze_query(
        question=query.question,
        context=query.context
    )
    # Returns: { "type": "bill_status", "identifiers": ["H.R. 1234"] }
    
    # Step 2: Fetch data from government APIs
    govt_data = await government_apis.fetch_data(
        query_type=query_analysis["type"],
        identifiers=query_analysis["identifiers"],
        country=query.context.country
    )
    # Returns: Bill data from Congress.gov
    
    # Step 3: Fact-check with multiple sources
    verification = await fact_check.verify(
        data=govt_data,
        query=query.question
    )
    # Returns: { "verified": true, "sources": [...], "confidence": 0.95 }
    
    # Step 4: Generate answer with Llama 3
    answer = await llm.generate_answer(
        question=query.question,
        data=govt_data,
        verification=verification
    )
    
    # Step 5: Build citations
    response = citations.build_response(
        answer=answer,
        sources=verification["sources"],
        confidence=verification["confidence"]
    )
    
    # Cache for 1 hour (bills don't change that often)
    await cache.set(cache_key, response, ttl=3600)
    
    return response
```

---

### LLM Service

**File**: `app/services/llm.py`

```python
import together
import os
from app.prompts import load_prompt

together.api_key = os.environ["TOGETHER_API_KEY"]

CIVIC_SYSTEM_PROMPT = """You are a civic transparency assistant for a democracy platform.

Your role:
1. Answer questions about government, bills, representatives, and court decisions
2. ALWAYS cite official sources (Congress.gov, CourtListener, etc.)
3. Be non-partisan and factual
4. Admit when information is uncertain
5. Format responses clearly with inline citations [1], [2]

You will receive:
- User question
- Data from official government APIs
- Fact-check verification results

Your task:
- Synthesize the information
- Write a clear, accurate answer
- Include inline citations
- Highlight any uncertainties
"""

async def analyze_query(question: str, context: dict) -> dict:
    """
    Analyze user question to determine what data to fetch.
    
    Example:
    Q: "What is the status of H.R. 1234?"
    → { "type": "bill_status", "identifiers": ["H.R. 1234"], "apis": ["congress.gov"] }
    """
    
    prompt = f"""Analyze this civic question and determine what type of data is needed:

Question: {question}
Context: {context}

Return JSON with:
- type: bill_status, representative_info, court_decision, voting_record, etc.
- identifiers: List of bill numbers, names, case numbers, etc.
- apis: Which government APIs to query

Be precise and extract all relevant identifiers."""

    response = together.Complete.create(
        model="meta-llama/Llama-3-70b-chat-hf",
        prompt=prompt,
        max_tokens=200,
        temperature=0.3,  # Low temperature for factual extraction
    )
    
    # Parse JSON from response
    import json
    return json.loads(response["output"]["choices"][0]["text"])


async def generate_answer(
    question: str,
    data: dict,
    verification: dict
) -> str:
    """
    Generate cited answer using Llama 3.
    
    Includes inline citations and source references.
    """
    
    sources_text = "\n".join([
        f"[{i+1}] {src['organization']}: {src['excerpt']}"
        for i, src in enumerate(verification["sources"])
    ])
    
    prompt = f"""{CIVIC_SYSTEM_PROMPT}

User Question: {question}

Official Government Data:
{format_govt_data(data)}

Verified Sources:
{sources_text}

Verification Status: {'✅ Verified' if verification['verified'] else '⚠️ Unverified'}
Confidence: {verification['confidence'] * 100}%

Generate a clear, accurate answer with inline citations [1], [2], etc.
Be conversational but precise. Cite every fact."""

    response = together.Complete.create(
        model="meta-llama/Llama-3-70b-chat-hf",
        prompt=prompt,
        max_tokens=500,
        temperature=0.7,  # Moderate temperature for natural writing
    )
    
    return response["output"]["choices"][0]["text"]


def format_govt_data(data: dict) -> str:
    """Format government API data for LLM consumption."""
    # Simplified for brevity
    return json.dumps(data, indent=2)
```

---

### Government API Fetcher

**File**: `app/services/government_apis.py`

```python
import httpx
import os
from typing import Dict, List

CONGRESS_API_KEY = os.environ["CONGRESS_API_KEY"]
PROPUBLICA_API_KEY = os.environ["PROPUBLICA_API_KEY"]

async def fetch_bill_status(bill_number: str) -> Dict:
    """
    Fetch bill status from Congress.gov API.
    
    Example: "H.R. 1234" → Full bill data
    """
    
    # Parse bill number (H.R. 1234 → congress=118, type=hr, number=1234)
    congress, bill_type, number = parse_bill_number(bill_number)
    
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"https://api.congress.gov/v3/bill/{congress}/{bill_type}/{number}",
            params={"api_key": CONGRESS_API_KEY, "format": "json"}
        )
        response.raise_for_status()
        
        bill_data = response.json()["bill"]
        
        return {
            "billNumber": bill_number,
            "title": bill_data["title"],
            "sponsor": bill_data["sponsors"][0]["fullName"],
            "status": bill_data["latestAction"]["text"],
            "lastActionDate": bill_data["latestAction"]["actionDate"],
            "summary": bill_data.get("summary", {}).get("text", ""),
            "url": f"https://www.congress.gov/bill/{congress}th-congress/{bill_type}/{number}",
            "source": "Congress.gov",
            "fetched": datetime.now().isoformat()
        }


async def fetch_representative_info(name: str, state: str = None) -> Dict:
    """Fetch representative information from ProPublica API."""
    
    async with httpx.AsyncClient() as client:
        headers = {"X-API-Key": PROPUBLICA_API_KEY}
        response = await client.get(
            "https://api.propublica.org/congress/v1/members/current.json",
            headers=headers
        )
        response.raise_for_status()
        
        members = response.json()["results"][0]["members"]
        
        # Search for member by name
        matches = [m for m in members if name.lower() in m["last_name"].lower()]
        
        if state:
            matches = [m for m in matches if m["state"] == state.upper()]
        
        if not matches:
            return None
        
        member = matches[0]
        
        return {
            "name": f"{member['first_name']} {member['last_name']}",
            "party": member["party"],
            "state": member["state"],
            "district": member.get("district", "Senator"),
            "office": member["office"],
            "phone": member["phone"],
            "url": member["url"],
            "votesWithParty": member["votes_with_party_pct"],
            "source": "ProPublica",
            "fetched": datetime.now().isoformat()
        }


def parse_bill_number(bill_number: str) -> tuple:
    """
    Parse bill number string.
    
    Example: "H.R. 1234" → (118, "hr", "1234")
    """
    # Current congress is 118th (2023-2025)
    import re
    match = re.match(r"([HS])\.?([RJ])\.?\s*(\d+)", bill_number, re.I)
    if not match:
        raise ValueError(f"Invalid bill number: {bill_number}")
    
    chamber, bill_type, number = match.groups()
    
    congress = 118  # Update this as needed
    bill_type_code = f"{chamber.lower()}{bill_type.lower()}"
    
    return (congress, bill_type_code, number)
```

---

### Fact-Checking Service

**File**: `app/services/fact_check.py`

```python
import httpx
from typing import Dict, List

async def verify(data: Dict, query: str) -> Dict:
    """
    Verify data against multiple sources.
    
    Returns:
    {
      "verified": true/false,
      "sources": [...],
      "confidence": 0.0-1.0,
      "discrepancies": [...]
    }
    """
    
    sources = []
    
    # Source 1: Original government API (primary source)
    sources.append({
        "type": "official",
        "organization": data["source"],
        "excerpt": generate_excerpt(data),
        "url": data["url"],
        "accessDate": data["fetched"],
        "verification": "primary_source"
    })
    
    # Source 2: Cross-reference with secondary API if available
    if "billNumber" in data:
        # Cross-check with ProPublica
        propublica_data = await fetch_from_propublica(data["billNumber"])
        if propublica_data:
            sources.append({
                "type": "official",
                "organization": "ProPublica",
                "excerpt": generate_excerpt(propublica_data),
                "url": propublica_data["url"],
                "accessDate": datetime.now().isoformat(),
                "verification": "cross_referenced"
            })
    
    # Source 3: Check fact-checking databases
    fact_check_result = await check_fact_check_orgs(data, query)
    if fact_check_result:
        sources.append(fact_check_result)
    
    # Calculate confidence based on source consistency
    confidence = calculate_confidence(sources)
    
    # Check for discrepancies
    discrepancies = identify_discrepancies(sources)
    
    return {
        "verified": len(discrepancies) == 0,
        "sources": sources,
        "confidence": confidence,
        "discrepancies": discrepancies
    }


async def check_fact_check_orgs(data: Dict, query: str) -> Dict | None:
    """
    Check FactCheck.org, PolitiFact, etc.
    
    Note: Most fact-checking sites don't have public APIs.
    Alternative: Maintain curated database or use web scraping (ethically).
    """
    
    # Placeholder: In production, integrate with fact-checking databases
    # or use verified fact-check datasets
    
    return None


def calculate_confidence(sources: List[Dict]) -> float:
    """
    Calculate confidence score based on:
    - Number of sources (more = higher)
    - Source types (official > secondary)
    - Consistency (matching data = higher)
    """
    
    if len(sources) == 1:
        return 0.7  # Single source
    elif len(sources) == 2:
        return 0.85  # Cross-referenced
    else:
        return 0.95  # Multiple sources
    
    # In production: Implement proper consistency checking


def identify_discrepancies(sources: List[Dict]) -> List[str]:
    """Identify any inconsistencies between sources."""
    # Placeholder: Implement data comparison logic
    return []


def generate_excerpt(data: Dict) -> str:
    """Generate relevant excerpt for citation."""
    if "billNumber" in data:
        return f"{data['billNumber']}: {data['status']} on {data['lastActionDate']}"
    return str(data)[:200]
```

---

## 🔒 Security Implementation

### Environment Variables

**File**: `.env`

```bash
# LLM
TOGETHER_API_KEY=your_together_api_key_here

# Government APIs
CONGRESS_API_KEY=your_congress_api_key
PROPUBLICA_API_KEY=your_propublica_api_key
COURTLISTENER_API_KEY=your_courtlistener_api_key
OPENSTATES_API_KEY=your_openstates_api_key

# Caching
REDIS_URL=redis://localhost:6379

# Security
API_SECRET_KEY=your_random_secret_key_here
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_PERIOD=60  # seconds

# CORS
ALLOWED_ORIGINS=https://your-site.com,https://www.your-site.com
```

### Rate Limiting

**File**: `app/utils/rate_limit.py`

```python
from fastapi import HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def limit(rate: str):
    """
    Rate limit decorator.
    
    Usage:
    @limit("10/minute")  # 10 requests per minute
    async def my_endpoint():
        ...
    """
    return limiter.limit(rate)
```

### CORS Configuration

**File**: `app/main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Workforce Democracy API")

# CORS - Only allow your domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ["ALLOWED_ORIGINS"].split(","),
    allow_credentials=False,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)
```

---

## 📊 Caching Strategy

### Redis Configuration

**File**: `app/utils/cache.py`

```python
import redis.asyncio as redis
import json
import os

redis_client = redis.from_url(os.environ["REDIS_URL"])

async def get(key: str):
    """Get cached value."""
    value = await redis_client.get(key)
    if value:
        return json.loads(value)
    return None

async def set(key: str, value: any, ttl: int = 3600):
    """Set cached value with TTL (default 1 hour)."""
    await redis_client.setex(
        key,
        ttl,
        json.dumps(value)
    )

async def invalidate(pattern: str):
    """Invalidate cache keys matching pattern."""
    keys = await redis_client.keys(pattern)
    if keys:
        await redis_client.delete(*keys)
```

### Cache Strategy

```python
# Different TTLs for different data types:

CACHE_TTLS = {
    "bill_status": 3600,      # 1 hour (bills don't change often)
    "representative": 86400,  # 24 hours (profiles rarely change)
    "court_decision": 604800, # 7 days (decisions don't change)
    "voting_record": 3600,    # 1 hour (may be updated)
    "news_summary": 1800,     # 30 minutes (news changes frequently)
}
```

**Expected Cache Hit Rate**: 70-80%
- Reduces LLM calls by 70-80%
- Reduces API calls by 70-80%
- **Cost savings: $15/month → $5/month**

---

## 🚀 Deployment Process

### Deploy to Fly.io

1. **Install Fly CLI**:
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Create Fly app**:
```bash
fly launch
# Follow prompts, name your app
```

3. **Set environment variables**:
```bash
fly secrets set TOGETHER_API_KEY="your_key"
fly secrets set CONGRESS_API_KEY="your_key"
fly secrets set PROPUBLICA_API_KEY="your_key"
# ... etc
```

4. **Deploy**:
```bash
fly deploy
```

5. **Check status**:
```bash
fly status
fly logs
```

### Configure Redis

Use Redis Cloud (free tier):
1. Sign up at https://redis.com/try-free/
2. Create database
3. Copy connection string
4. Set as `REDIS_URL` secret

---

## 🧪 Testing

### Unit Tests

**File**: `tests/test_civic.py`

```python
import pytest
from app.services import llm, government_apis

@pytest.mark.asyncio
async def test_bill_status_query():
    """Test fetching bill status."""
    
    data = await government_apis.fetch_bill_status("H.R. 1234")
    
    assert data["billNumber"] == "H.R. 1234"
    assert "title" in data
    assert "status" in data
    assert data["source"] == "Congress.gov"

@pytest.mark.asyncio
async def test_llm_query_analysis():
    """Test LLM query analysis."""
    
    analysis = await llm.analyze_query(
        question="What is the status of H.R. 1234?",
        context={"country": "us", "level": "federal"}
    )
    
    assert analysis["type"] == "bill_status"
    assert "H.R. 1234" in analysis["identifiers"]
```

### Integration Tests

Test full flow end-to-end:
1. User query
2. LLM analysis
3. API fetching
4. Fact-checking
5. Response generation
6. Citation formatting

---

## 📈 Monitoring

### Logging

Use structured logging:

```python
import structlog

logger = structlog.get_logger()

logger.info(
    "civic_query_processed",
    question=query.question,
    response_time_ms=response_time,
    cache_hit=was_cached,
    sources_count=len(sources),
    confidence=confidence_score
)
```

### Analytics

Track:
- Queries per day
- Cache hit rate
- Average response time
- API call counts
- LLM token usage
- Most common questions
- Error rates

### Alerts

Set up alerts for:
- High error rate (>5%)
- Slow responses (>5 seconds)
- API quota approaching limit
- High LLM costs (>$10/day)

---

## 💰 Final Cost Breakdown

### Monthly Costs (1,000 users/day)

```
API Server (Fly.io):        $15/month
LLM Inference (Together):   $5/month (with caching)
Redis Cache (Cloud):        $0/month (free tier)
Domain & SSL:               $0/month (included)
─────────────────────────────────────
TOTAL:                      $20/month
```

### Scaling Costs

**At 10,000 users/day**:
- API Server: $15/month (same, scales automatically)
- LLM: $15/month (3x queries, same cache rate)
- Redis: $10/month (upgrade from free tier)
- **Total: $40/month**

**At 100,000 users/day**:
- API Server: $50/month (scale up)
- LLM: $100/month (consider RunPod at this scale)
- Redis: $30/month
- **Total: $180/month**

---

## ✅ Implementation Checklist

### Week 1: Foundation
- [ ] Set up Fly.io account
- [ ] Set up Together AI account
- [ ] Register for all government API keys
- [ ] Create GitHub repo
- [ ] Set up basic FastAPI project
- [ ] Deploy "Hello World" to Fly.io
- [ ] Configure Redis

### Week 2: Core Features
- [ ] Implement LLM service
- [ ] Implement Congress.gov integration
- [ ] Build query analysis
- [ ] Build response generation
- [ ] Add caching layer
- [ ] Test end-to-end

### Week 3: Enhancement
- [ ] Add fact-checking
- [ ] Implement citation system
- [ ] Add ProPublica integration
- [ ] Add court decisions
- [ ] Implement rate limiting
- [ ] Add error handling

### Week 4: Polish & Deploy
- [ ] Write comprehensive tests
- [ ] Add monitoring/logging
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation
- [ ] Deploy to production
- [ ] Connect to frontend

---

## 🎯 Success Metrics

### Performance Targets
- ✅ Response time: <2 seconds (with cache)
- ✅ Response time: <5 seconds (without cache)
- ✅ Cache hit rate: >70%
- ✅ Uptime: >99.5%
- ✅ Error rate: <1%

### Quality Targets
- ✅ Accuracy: >95% (verified with sources)
- ✅ Citations: 100% of facts cited
- ✅ Source diversity: 2+ sources per query
- ✅ User satisfaction: Monitor feedback

---

## 🚀 Ready to Build!

You now have:
- ✅ Complete architecture design
- ✅ Cost-optimized deployment plan
- ✅ Code examples and structure
- ✅ Security best practices
- ✅ Testing strategy
- ✅ Monitoring approach
- ✅ Step-by-step implementation guide

**Estimated Time**: 4 weeks to production

**Estimated Cost**: $20/month for 1,000 users/day

**Next Steps**:
1. Register for API keys (1 day)
2. Set up development environment (1 day)
3. Build core functionality (2 weeks)
4. Test and polish (1 week)
5. Deploy and monitor (ongoing)

**Let's build this ethical, accurate, low-cost civic transparency platform!** 🏛️🤖
