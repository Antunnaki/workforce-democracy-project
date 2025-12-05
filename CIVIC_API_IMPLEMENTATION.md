# Civic Transparency - API Implementation Guide

## Current Status: Demonstration Mode ⚠️

The Civic Transparency module is currently running in **demonstration mode** with sample data. This document explains why and how to implement real government API integration.

---

## Why Demo Mode?

### Static Website Limitations

This is a **static website** (HTML/CSS/JavaScript only), which has the following constraints:

1. **No Backend Server** - Cannot run server-side code (Node.js, Python, etc.)
2. **CORS Restrictions** - Government APIs block direct browser requests for security
3. **API Keys** - Cannot store API keys securely in client-side code
4. **Rate Limiting** - Browser requests would expose your IP and hit rate limits quickly
5. **Data Processing** - Complex data transformations need server processing

### What Works Now

✅ **Fully Functional Interface**
- Search functionality
- Country selection
- Advanced filtering UI
- Representative cards with voting visualizations
- Chart.js integration for voting patterns
- Chat assistant interface
- Modal windows for detailed bill analysis
- Responsive mobile design

❌ **What's Simulated**
- Actual government data (currently uses sample/placeholder data)
- LLM chat responses (currently uses rule-based responses)
- Real-time API calls to congress.gov, ProPublica, etc.

---

## Government APIs Available

### United States 🇺🇸

#### 1. Congress.gov API
- **URL**: `https://api.congress.gov/v3`
- **Requires**: API Key (free from [congress.gov](https://api.congress.gov/sign-up/))
- **Data**: Bills, votes, members, committees
- **Docs**: https://api.congress.gov

#### 2. ProPublica Congress API
- **URL**: `https://api.propublica.org/congress/v1`
- **Requires**: API Key (free from [ProPublica](https://www.propublica.org/datastore/api/propublica-congress-api))
- **Data**: Member profiles, voting records, statements
- **Docs**: https://projects.propublica.org/api-docs/congress-api/

#### 3. OpenStates API (State Legislatures)
- **URL**: `https://v3.openstates.org/graphql`
- **Requires**: API Key
- **Data**: State legislators, bills, votes
- **Docs**: https://docs.openstates.org/api-v3/

### Other Countries

#### Australia 🇦🇺
- **OpenAustralia API**: https://www.openaustralia.org.au/api/
- **Australian Parliament API**: https://api.aph.gov.au

#### Britain 🇬🇧
- **UK Parliament API**: https://members-api.parliament.uk/
- **Commons Votes API**: https://commonsvotes-api.parliament.uk

#### France 🇫🇷
- **Assemblée Nationale API**: https://data.assemblee-nationale.fr/
- **Sénat API**: https://data.senat.fr/

#### Germany 🇩🇪
- **Bundestag API**: https://www.bundestag.de/ajax/filterlist/en/members

#### Canada 🇨🇦
- **OpenParliament API**: https://api.openparliament.ca
- **House of Commons**: https://www.ourcommons.ca/members/en

---

## Implementation Options

### Option 1: Backend Server (Recommended)

Create a simple backend server to proxy API requests:

**Architecture:**
```
Browser → Your Backend Server → Government APIs
  ↓            ↓                      ↓
Frontend   Node.js/Python         congress.gov
(Static)   (API Proxy)            ProPublica, etc.
```

**Backend Technologies:**
- **Node.js + Express** - Fast, JavaScript-based
- **Python + Flask** - Simple, easy to set up
- **Next.js API Routes** - Serverless functions
- **Cloudflare Workers** - Edge computing

**Example Node.js Backend:**

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Environment variables for API keys
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const PROPUBLICA_API_KEY = process.env.PROPUBLICA_API_KEY;

// Search representatives
app.get('/api/representatives/search', async (req, res) => {
    const { query, country } = req.query;
    
    try {
        if (country === 'us') {
            const response = await axios.get(
                `https://api.propublica.org/congress/v1/members.json`,
                {
                    headers: {
                        'X-API-Key': PROPUBLICA_API_KEY
                    }
                }
            );
            
            // Filter and format data
            const members = response.data.results[0].members
                .filter(m => m.first_name.toLowerCase().includes(query.toLowerCase()) || 
                            m.last_name.toLowerCase().includes(query.toLowerCase()));
            
            res.json({ representatives: members });
        }
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
});

// Get voting record
app.get('/api/representatives/:id/votes', async (req, res) => {
    const { id } = req.params;
    
    try {
        const response = await axios.get(
            `https://api.propublica.org/congress/v1/members/${id}/votes.json`,
            {
                headers: {
                    'X-API-Key': PROPUBLICA_API_KEY
                }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'API request failed' });
    }
});

app.listen(3000, () => {
    console.log('API proxy server running on port 3000');
});
```

**Update Frontend:**

```javascript
// js/civic.js - Update performCivicSearch function

async function performCivicSearch(country, query) {
    try {
        // Call your backend server instead of sample data
        const response = await fetch(`https://your-backend.com/api/representatives/search?query=${query}&country=${country}`);
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to sample data if API fails
        return generateSampleCivicData(country, query);
    }
}
```

### Option 2: Serverless Functions

Use serverless platforms that provide API proxy capabilities:

**Platforms:**
- **Vercel Functions** - Free tier available
- **Netlify Functions** - Free tier available
- **AWS Lambda** - Pay per use
- **Cloudflare Workers** - Free tier available

**Example Vercel Function:**

```javascript
// api/search-representatives.js

export default async function handler(req, res) {
    const { query, country } = req.query;
    
    if (country === 'us') {
        const response = await fetch(
            `https://api.propublica.org/congress/v1/members.json`,
            {
                headers: {
                    'X-API-Key': process.env.PROPUBLICA_API_KEY
                }
            }
        );
        
        const data = await response.json();
        // Filter and return data
        res.json({ representatives: data.results[0].members });
    }
}
```

### Option 3: CORS Proxy (Not Recommended)

Use a public CORS proxy like `cors-anywhere` or `allorigins`:

⚠️ **WARNING**: 
- Not secure (exposes API keys)
- Rate limiting issues
- Unreliable third-party service
- Only use for testing, never production

```javascript
// NOT RECOMMENDED FOR PRODUCTION
const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
const apiUrl = 'https://api.congress.gov/v3/member';

fetch(proxyUrl + apiUrl)
    .then(response => response.json())
    .then(data => console.log(data));
```

---

## LLM Chat Assistant Integration

The chat assistant currently uses rule-based responses. To implement real LLM:

### Option 1: OpenAI API

```javascript
async function getChatResponse(message) {
    const response = await fetch('https://your-backend.com/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            context: 'civic_transparency'
        })
    });
    
    const data = await response.json();
    return data.response;
}
```

**Backend:**
```javascript
// Backend endpoint
app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: "You are a civic transparency assistant helping users understand government voting records and legislation."
            },
            {
                role: "user",
                content: message
            }
        ]
    });
    
    res.json({ response: response.choices[0].message.content });
});
```

### Option 2: Alternative LLM APIs
- **Anthropic Claude** - Similar to OpenAI
- **Google Gemini** - Free tier available
- **Cohere** - Good for text generation
- **Hugging Face** - Open source models

---

## Implementation Steps

### Step 1: Choose Your Approach
1. **Full Backend** - Best for production, most control
2. **Serverless** - Good balance of simplicity and cost
3. **Hybrid** - Static frontend + serverless functions

### Step 2: Set Up Backend
1. Create backend project (Node.js/Python/etc.)
2. Install dependencies (express, axios, etc.)
3. Set up environment variables for API keys
4. Implement API proxy endpoints
5. Deploy to hosting service (Heroku, Railway, Render, etc.)

### Step 3: Get API Keys
1. Sign up for congress.gov API key
2. Sign up for ProPublica API key
3. Get OpenStates API key (if needed)
4. Get OpenAI API key (for chat)

### Step 4: Update Frontend
1. Update `js/civic.js` - Replace `generateSampleCivicData()` with real API calls
2. Update error handling
3. Add loading states
4. Test thoroughly

### Step 5: Deploy
1. Deploy backend server
2. Update frontend with backend URL
3. Test in production
4. Monitor API usage and costs

---

## Cost Estimates

### API Costs (Monthly)
- **Congress.gov**: FREE ✅
- **ProPublica**: FREE ✅
- **OpenStates**: FREE ✅
- **OpenAI GPT-4**: $0.03 per 1K tokens (pay-as-you-go)
- **Alternative**: OpenAI GPT-3.5: $0.002 per 1K tokens

### Backend Hosting
- **Vercel/Netlify Functions**: FREE tier available (100GB bandwidth)
- **Railway**: $5-20/month
- **Heroku**: $7/month (Eco tier)
- **DigitalOcean**: $5/month (basic droplet)

### Expected Monthly Cost
- **Low Traffic** (< 1000 users): $0-10/month
- **Medium Traffic** (1000-10,000 users): $10-50/month
- **High Traffic** (10,000+ users): $50-200/month

---

## Security Considerations

### API Key Protection
✅ **DO:**
- Store API keys in environment variables
- Use backend server to hide keys
- Rotate keys regularly
- Monitor API usage

❌ **DON'T:**
- Hardcode API keys in frontend code
- Commit API keys to Git
- Share API keys publicly
- Use keys in client-side JavaScript

### Rate Limiting
- Implement request caching
- Use database to store frequently accessed data
- Add rate limiting to your backend
- Monitor API quotas

### Data Privacy
- Don't store user searches long-term
- Comply with GDPR if applicable
- Add privacy policy
- Encrypt sensitive data

---

## Testing Strategy

### 1. Local Development
```bash
# Run backend locally
npm run dev

# Test endpoints
curl http://localhost:3000/api/representatives/search?query=cruz&country=us
```

### 2. Integration Testing
- Test each API endpoint
- Verify data transformation
- Check error handling
- Test rate limiting

### 3. User Testing
- Test search functionality
- Verify voting record display
- Check mobile responsiveness
- Test chat assistant

---

## Support Resources

### Documentation
- [Congress.gov API Docs](https://api.congress.gov)
- [ProPublica Congress API](https://projects.propublica.org/api-docs/congress-api/)
- [OpenStates API v3](https://docs.openstates.org/api-v3/)

### Communities
- [r/webdev](https://reddit.com/r/webdev)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/government-data)
- [OpenStates Slack](https://openstates.org/about/)

---

## Conclusion

The Civic Transparency module is **fully designed and ready for API integration**. The demonstration mode shows exactly how the interface will work with real data. Implementation requires:

1. ✅ Backend server or serverless functions (required)
2. ✅ Government API keys (free)
3. ✅ LLM API key (optional, paid)
4. ✅ 2-4 hours of development time
5. ✅ $0-20/month hosting costs

The current demonstration validates the design and user experience. Real implementation is straightforward with the architecture already in place.

---

**Questions?** See the documentation or open an issue for support.

**Ready to implement?** Follow the steps above and you'll have real government data flowing in no time! 🚀
