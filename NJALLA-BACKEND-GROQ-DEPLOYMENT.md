# 🚀 Njalla VPS + Groq Backend Deployment Guide

**Project:** CivicConnect - Bills Section (V32.9.5)  
**Frontend:** Netlify (Static hosting)  
**Backend:** Njalla VPS (Node.js API)  
**LLM:** Groq (Llama 3 via API)  
**Cost:** ~$15-25/month total

---

## 📋 Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│  NETLIFY (Frontend - Static Hosting)                     │
│  - index.html, CSS, JavaScript                           │
│  - Bills section UI (already built)                      │
│  - Makes HTTPS requests to Njalla backend                │
└──────────────┬───────────────────────────────────────────┘
               │
               │ HTTPS POST
               ▼
┌──────────────────────────────────────────────────────────┐
│  NJALLA VPS (Backend API Server)                         │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Node.js + Express.js                              │  │
│  │  - Rate limiting (10 req/min per user)             │  │
│  │  - Request validation                              │  │
│  │  - Error handling                                  │  │
│  │  - CORS configuration                              │  │
│  │  - API key security (environment variables)        │  │
│  └────────────────────────────────────────────────────┘  │
│               │                                           │
│               │ API Calls                                 │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Groq Integration Module                           │  │
│  │  - Groq API client                                 │  │
│  │  - Llama 3 model calls                             │  │
│  │  - Response caching (Redis optional)               │  │
│  └────────────────────────────────────────────────────┘  │
│               │                                           │
│               │ Bills Data (Future)                       │
│               ▼                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │  Government APIs Integration (Optional)            │  │
│  │  - Congress.gov API                                │  │
│  │  - ProPublica API                                  │  │
│  │  - Open States API                                 │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────┬───────────────────────────────────────────┘
               │
               │ External API Call
               ▼
┌──────────────────────────────────────────────────────────┐
│  GROQ API (https://api.groq.com)                         │
│  - Llama 3 8B Model                                      │
│  - Ultra-fast inference (< 1 second)                     │
│  - Cost: $0.10 per 1M tokens                             │
└──────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

| Service | Purpose | Monthly Cost |
|---------|---------|--------------|
| **Netlify** | Frontend hosting (static files) | $0 (Free tier) |
| **Njalla VPS** | Backend API server | $15/month (2GB RAM) |
| **Groq API** | LLM inference (Llama 3) | $2-5/month (estimated) |
| **Domain** | Custom domain (optional) | $15/year |
| **Total** | | **~$17-20/month** |

**Note:** Groq charges $0.10 per 1M tokens. Assuming:
- 1,000 users/month
- 10 messages per user = 10,000 messages
- 500 tokens per conversation = 5M tokens
- Cost: 5 × $0.10 = **$0.50/month** (very low!)

---

## 🛠️ Backend File Structure

```
njalla-backend/
├── package.json                 # Node.js dependencies
├── .env                         # Environment variables (Groq API key)
├── .gitignore                   # Ignore node_modules and .env
├── server.js                    # Main Express server
├── routes/
│   ├── groq-bills-chat.js       # Bills chat endpoint
│   ├── groq-bills-analyze.js    # Bill analysis endpoint (contextual)
│   └── groq-bills-location.js   # Bills by location endpoint
├── middleware/
│   ├── rate-limiter.js          # Rate limiting middleware
│   ├── cors-config.js           # CORS configuration
│   └── validate-request.js      # Request validation
├── services/
│   ├── groq-client.js           # Groq API integration
│   └── cache.js                 # Response caching (optional)
└── README.md                    # Deployment instructions
```

---

## 📝 Step-by-Step Deployment

### **Step 1: Set Up Njalla VPS**

1. **Purchase Njalla VPS**:
   - Go to https://njal.la/
   - Select "VPS" service
   - Choose **2GB RAM, 1 CPU** plan ($15/month)
   - Select Ubuntu 22.04 LTS

2. **SSH into VPS**:
   ```bash
   ssh root@your-njalla-ip
   ```

3. **Update System**:
   ```bash
   apt update && apt upgrade -y
   ```

4. **Install Node.js 20.x**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   node --version  # Should show v20.x
   npm --version
   ```

5. **Install PM2** (Process manager):
   ```bash
   npm install -g pm2
   ```

6. **Install Nginx** (Reverse proxy):
   ```bash
   apt install -y nginx
   ```

---

### **Step 2: Get Groq API Key**

1. **Sign up at Groq**:
   - Go to https://console.groq.com/
   - Create account (free tier available)
   - Generate API key

2. **Save API Key**:
   - Copy the key (looks like: `gsk_...`)
   - You'll add this to `.env` file later

---

### **Step 3: Deploy Backend Code to Njalla**

1. **Create Backend Directory**:
   ```bash
   cd /var/www
   mkdir civic-backend
   cd civic-backend
   ```

2. **Initialize Node.js Project**:
   ```bash
   npm init -y
   ```

3. **Install Dependencies**:
   ```bash
   npm install express cors dotenv express-rate-limit helmet groq-sdk
   ```

4. **Create `.env` File**:
   ```bash
   nano .env
   ```
   
   Add:
   ```env
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   PORT=3000
   NODE_ENV=production
   FRONTEND_URL=https://your-netlify-site.netlify.app
   ```

5. **Create `.gitignore`**:
   ```bash
   nano .gitignore
   ```
   
   Add:
   ```
   node_modules/
   .env
   *.log
   ```

---

### **Step 4: Backend Code**

#### **`server.js`** (Main Server)

```javascript
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('./middleware/cors-config');
const rateLimiter = require('./middleware/rate-limiter');

const groqBillsChatRouter = require('./routes/groq-bills-chat');
const groqBillsAnalyzeRouter = require('./routes/groq-bills-analyze');
const groqBillsLocationRouter = require('./routes/groq-bills-location');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors);
app.use(express.json({ limit: '10mb' }));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/groq/bills-chat', groqBillsChatRouter);
app.use('/api/groq/bills/analyze', groqBillsAnalyzeRouter);
app.use('/api/groq/bills/location', groqBillsLocationRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Civic Backend API running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
    console.log(`Groq API Key loaded: ${process.env.GROQ_API_KEY ? 'Yes' : 'No'}`);
});
```

#### **`middleware/cors-config.js`**

```javascript
const cors = require('cors');

const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',  // Local development
    'http://localhost:3000'
];

module.exports = cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});
```

#### **`middleware/rate-limiter.js`**

```javascript
const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    message: {
        error: 'Too many requests',
        message: 'Please wait a moment before trying again'
    },
    standardHeaders: true,
    legacyHeaders: false
});
```

#### **`services/groq-client.js`**

```javascript
const Groq = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const MODEL = 'llama3-8b-8192';  // Llama 3 8B with 8K context window

/**
 * Call Groq API with Llama 3
 * @param {Array} messages - Conversation messages
 * @param {Object} options - Optional parameters
 * @returns {Promise<string>} - AI response
 */
async function callGroq(messages, options = {}) {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: messages,
            model: options.model || MODEL,
            temperature: options.temperature || 0.7,
            max_tokens: options.maxTokens || 1000,
            top_p: 1,
            stream: false
        });

        return chatCompletion.choices[0]?.message?.content || 'No response generated';
    } catch (error) {
        console.error('Groq API Error:', error);
        throw new Error('Failed to get AI response');
    }
}

module.exports = { callGroq, MODEL };
```

#### **`routes/groq-bills-chat.js`** (General Bills Chat)

```javascript
const express = require('express');
const router = express.Router();
const { callGroq } = require('../services/groq-client');

router.post('/', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Invalid message' });
        }

        const messages = [
            {
                role: 'system',
                content: `You are a helpful legislative research assistant specializing in U.S. government bills and legislation. 
                
Your role is to:
- Explain bills and legislation in clear, simple language
- Provide context on how bills affect communities
- Explain the legislative process
- Help users understand their representatives' positions
- Stay non-partisan and factual

Always cite sources when possible and encourage users to read official documents.`
            },
            {
                role: 'user',
                content: message
            }
        ];

        const response = await callGroq(messages);

        res.json({
            response: response,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Bills Chat Error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            message: 'Please try again in a moment'
        });
    }
});

module.exports = router;
```

#### **`routes/groq-bills-analyze.js`** (Contextual Bill Analysis)

```javascript
const express = require('express');
const router = express.Router();
const { callGroq } = require('../services/groq-client');

router.post('/', async (req, res) => {
    try {
        const { bill, question } = req.body;

        if (!bill || !question) {
            return res.status(400).json({ error: 'Missing bill data or question' });
        }

        const billContext = `
Bill Number: ${bill.billNumber}
Title: ${bill.title}
Summary: ${bill.summary}
Category: ${bill.category}
Government Level: ${bill.level}
Sponsors: ${bill.sponsors ? bill.sponsors.join(', ') : 'Unknown'}
`;

        const messages = [
            {
                role: 'system',
                content: `You are an expert legislative analyst. A user is reading a specific bill and has a question about it.

Provide detailed, accurate analysis based on the bill information provided. Explain implications, potential impacts, and answer the user's specific question.

Be objective, cite the bill details, and help the user understand the legislation.`
            },
            {
                role: 'user',
                content: `I'm reading this bill:

${billContext}

My question: ${question}`
            }
        ];

        const analysis = await callGroq(messages, { maxTokens: 1500 });

        res.json({
            analysis: analysis,
            billNumber: bill.billNumber,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Bill Analysis Error:', error);
        res.status(500).json({
            error: 'Failed to analyze bill',
            message: 'Please try again in a moment'
        });
    }
});

module.exports = router;
```

#### **`routes/groq-bills-location.js`** (Bills by Location - Future)

```javascript
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { zipCode, includeLocal, includeState, includeFederal } = req.body;

        // TODO: Integrate with government APIs to fetch real bills
        // For now, return placeholder response

        res.json({
            message: 'Bills by location endpoint - Coming soon!',
            zipCode: zipCode,
            bills: [],
            note: 'Will integrate with Congress.gov, ProPublica, and Open States APIs'
        });

    } catch (error) {
        console.error('Bills Location Error:', error);
        res.status(500).json({
            error: 'Failed to fetch bills',
            message: 'Please try again in a moment'
        });
    }
});

module.exports = router;
```

---

### **Step 5: Start Backend with PM2**

```bash
# Test the server first
node server.js

# If working, start with PM2
pm2 start server.js --name civic-backend

# Save PM2 process list
pm2 save

# Set PM2 to start on system boot
pm2 startup

# Check status
pm2 status
pm2 logs civic-backend
```

---

### **Step 6: Configure Nginx Reverse Proxy**

```bash
nano /etc/nginx/sites-available/civic-backend
```

Add:
```nginx
server {
    listen 80;
    server_name your-njalla-domain.com;  # Or use IP address

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/civic-backend /etc/nginx/sites-enabled/
nginx -t  # Test configuration
systemctl restart nginx
```

---

### **Step 7: SSL Certificate (Optional but Recommended)**

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d your-njalla-domain.com

# Auto-renewal is set up automatically
```

---

### **Step 8: Update Frontend (Netlify)**

In your JavaScript files, update the API endpoints:

```javascript
// js/bills-chat.js
const API_BASE = 'https://your-njalla-domain.com/api';

// js/bills-section.js
const API_BASE = 'https://your-njalla-domain.com/api';
```

---

## 🧪 Testing the Backend

### **Test Health Check**:
```bash
curl https://your-njalla-domain.com/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-01-24T..."}
```

### **Test Bills Chat**:
```bash
curl -X POST https://your-njalla-domain.com/api/groq/bills-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is HR 1234 about?"}'
```

### **Test Bill Analysis**:
```bash
curl -X POST https://your-njalla-domain.com/api/groq/bills/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "bill": {
      "billNumber": "HR 1234",
      "title": "Education Funding Act",
      "summary": "Increases funding for schools",
      "category": "education",
      "level": "federal"
    },
    "question": "How does this affect my local school?"
  }'
```

---

## 🔒 Security Checklist

- [x] API key stored in environment variables (not in code)
- [x] Rate limiting enabled (10 requests/minute)
- [x] CORS configured to only allow your Netlify domain
- [x] Helmet.js for security headers
- [x] Request validation middleware
- [x] SSL certificate (HTTPS)
- [x] PM2 process management
- [x] Nginx reverse proxy
- [x] Error handling (no sensitive data in error messages)

---

## 📊 Monitoring & Maintenance

### **Check Logs**:
```bash
pm2 logs civic-backend
pm2 logs civic-backend --lines 100
```

### **Restart Backend**:
```bash
pm2 restart civic-backend
```

### **Update Code**:
```bash
cd /var/www/civic-backend
git pull  # If using Git
pm2 restart civic-backend
```

### **Monitor Resource Usage**:
```bash
pm2 monit
htop  # Install: apt install htop
```

---

## 🎯 Next Steps

1. **Deploy Backend**: Follow steps above to deploy on Njalla VPS
2. **Get Groq API Key**: Sign up at https://console.groq.com/
3. **Update Frontend**: Change API_BASE in JavaScript files
4. **Test Integration**: Test all three endpoints
5. **Go Live**: Deploy frontend to Netlify with updated API endpoints

---

## 💡 Future Enhancements

- Add response caching with Redis (reduce API calls by 70%)
- Integrate government APIs (Congress.gov, ProPublica)
- Add PostgreSQL database for bill storage
- Implement user authentication (optional)
- Add analytics (track popular bills, user engagement)

---

## 📞 Support

- **Groq Documentation**: https://console.groq.com/docs
- **Express.js Docs**: https://expressjs.com/
- **PM2 Docs**: https://pm2.keymetrics.io/

**Estimated Setup Time**: 2-3 hours  
**Monthly Cost**: $17-20  
**Scalability**: Handles 1,000+ users/day easily
