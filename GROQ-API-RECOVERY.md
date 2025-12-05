# 🔑 GROQ API CONFIGURATION - COMPLETE REFERENCE

**Date**: January 28, 2025  
**Status**: All information preserved! ✅  
**Purpose**: Recover Groq API setup in case of session interruption

---

## 🎯 GROQ API INFORMATION

### **What is Groq?**

Groq provides ultra-fast AI inference using custom hardware. You're using it to power:
- 🗳️ **Voting Assistant** - Answers voting questions
- 📜 **Bills Chat** - Explains legislation

### **Model Used**

**Llama 3 (8B, 8192 context window)**
- Model ID: `llama3-8b-8192`
- Provider: Meta (via Groq)
- Speed: ~350 tokens/second
- Cost: FREE tier available!

---

## 🔧 YOUR CURRENT SETUP

### **Backend Configuration** (`backend-server-example.js`)

```javascript
const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
```

### **Environment Variables** (`.env` file on VPS)

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
FRONTEND_URL=https://workforce-democracy.netlify.app
PORT=3000
NODE_ENV=production
```

### **Frontend Configuration** (`js/config.js`)

```javascript
API_BASE_URL: 'https://api.workforcedemocracyproject.org',
GROQ_ENABLED: true
```

---

## 🆕 HOW TO GET A NEW GROQ API KEY

If you lost your key or need a new one:

### **Step 1: Go to Groq Console**

Visit: https://console.groq.com

### **Step 2: Sign Up / Sign In**

- Use your email
- Verify email
- Free tier available!

### **Step 3: Create API Key**

1. Click **"API Keys"** in sidebar
2. Click **"Create New Key"**
3. Give it a name: `Workforce Democracy Project`
4. Click **"Create"**
5. **COPY THE KEY IMMEDIATELY** (starts with `gsk_...`)

### **Step 4: Update Your Backend**

```bash
ssh root@YOUR_VPS_IP
cd /var/www/workforce-api
nano .env
```

Replace:
```env
GROQ_API_KEY=gsk_your_old_key_here
```

With:
```env
GROQ_API_KEY=gsk_your_new_key_here
```

Save and restart:
```bash
pm2 restart workforce-api
```

---

## 💰 GROQ API PRICING (2025)

### **FREE Tier** ✅

**What you get**:
- 14,400 requests per day
- 30 requests per minute
- Llama 3 (8B) model
- No credit card required

**Your usage**:
- ~100-500 requests/day (estimated)
- Well within free tier! ✅

### **Paid Tier** (if you exceed free tier)

**Pay-as-you-go**:
- $0.05 per 1M input tokens
- $0.10 per 1M output tokens

**Example**: If you had 50,000 AI conversations/month:
- Input: ~25M tokens = $1.25
- Output: ~12.5M tokens = $1.25
- **Total**: ~$2.50/month

**Your likely cost**: $0-5/month (free tier covers most needs)

---

## 📡 CURRENT ENDPOINTS USING GROQ

### **1. Voting Assistant** ✅

**Endpoint**: `POST /api/groq/voting-assistant`

**Request**:
```json
{
  "message": "How do I register to vote in California?",
  "country": "USA",
  "context": {...}
}
```

**Response**:
```json
{
  "response": "To register to vote in California, you can...",
  "metadata": {
    "model": "llama3-8b-8192",
    "tokens": 245,
    "timestamp": "2025-01-28T..."
  }
}
```

---

### **2. Bills Chat** ✅

**Endpoint**: `POST /api/groq/bills-chat`

**Request**:
```json
{
  "message": "What does this bill mean for small businesses?",
  "context": "HR 5678 - Renewable Energy Expansion Act"
}
```

**Response**:
```json
{
  "response": "This bill would impact small businesses by...",
  "metadata": {
    "model": "llama3-8b-8192",
    "tokens": 312,
    "timestamp": "2025-01-28T..."
  }
}
```

---

## 🔒 SECURITY BEST PRACTICES

### **✅ DO**:

1. **Store API key in `.env` file**
   ```env
   GROQ_API_KEY=gsk_...
   ```

2. **Add `.env` to `.gitignore`**
   ```bash
   echo ".env" >> .gitignore
   ```

3. **Set file permissions**
   ```bash
   chmod 600 /var/www/workforce-api/.env
   ```

4. **Rotate keys periodically**
   - Every 3-6 months
   - After team member leaves
   - If key leaked

5. **Monitor usage**
   - Check Groq console weekly
   - Set up usage alerts

### **❌ DON'T**:

1. ❌ Commit API key to Git
2. ❌ Share key publicly
3. ❌ Use same key for dev/prod
4. ❌ Store key in frontend code
5. ❌ Share `.env` file

---

## 🧪 TEST YOUR GROQ CONNECTION

### **Method 1: Via Backend Health Check**

```bash
curl https://api.workforcedemocracyproject.org/health
```

Should show:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 12345
}
```

### **Method 2: Test Voting Assistant**

```bash
curl -X POST https://api.workforcedemocracyproject.org/api/groq/voting-assistant \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How do I vote?",
    "country": "USA"
  }'
```

Should return AI response.

### **Method 3: Check Backend Logs**

```bash
ssh root@YOUR_VPS_IP
pm2 logs workforce-api --lines 20
```

Look for:
```
Groq API: ✅ Configured
Groq API call - Voting Assistant - Country: USA
Groq API success - Voting Assistant - Tokens: 245
```

---

## 🔧 TROUBLESHOOTING

### **"Groq API: ❌ Not configured"**

**Problem**: API key not loaded

**Fix**:
```bash
cd /var/www/workforce-api
cat .env  # Check if GROQ_API_KEY is set
nano .env  # Fix if needed
pm2 restart workforce-api
```

---

### **"Invalid API key"**

**Problem**: Wrong key or expired

**Fix**:
1. Go to https://console.groq.com
2. Generate new key
3. Update `.env` file
4. Restart backend

---

### **"Rate limit exceeded"**

**Problem**: Too many requests (unlikely with free tier)

**Fix**:
1. Check Groq console for usage
2. Add rate limiting to backend
3. Consider caching common responses
4. Upgrade to paid tier if needed

---

### **"CORS error" in Frontend**

**Problem**: Frontend can't reach backend

**Fix**:
```bash
cd /var/www/workforce-api
nano .env
```

Update:
```env
FRONTEND_URL=https://your-actual-netlify-domain.netlify.app
```

Restart:
```bash
pm2 restart workforce-api
```

---

## 📊 GROQ USAGE MONITORING

### **Check Current Usage**

1. Visit https://console.groq.com
2. Click **"Usage"** in sidebar
3. See:
   - Daily requests
   - Token consumption
   - Error rate
   - Response time

### **Set Up Alerts**

1. Go to **Settings** → **Notifications**
2. Enable:
   - Daily usage limit (e.g., 80% of free tier)
   - Error rate alerts
   - Unusual activity

---

## 🆘 EMERGENCY: LOST ACCESS TO GROQ ACCOUNT

### **Scenario**: Can't log into Groq console

**Options**:

1. **Reset Password**
   - Go to https://console.groq.com
   - Click "Forgot Password"
   - Check email

2. **Create New Account**
   - Sign up with different email
   - Generate new API key
   - Update backend `.env`

3. **Contact Groq Support**
   - Email: support@groq.com
   - Usually responds within 24 hours

4. **Switch Providers** (if necessary)
   - OpenAI (more expensive)
   - Anthropic Claude
   - Together.ai
   - Local Llama (free but slower)

---

## 📦 COMPLETE BACKEND CODE SNIPPET

**Server setup with Groq** (`backend-server-example.js`):

```javascript
const Groq = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Example endpoint
app.post('/api/groq/voting-assistant', async (req, res) => {
  try {
    const { message, country, context } = req.body;
    
    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful voting assistant...'
        },
        {
          role: 'user',
          content: message
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 500
    });

    const response = completion.choices[0]?.message?.content;
    res.json({ response });
    
  } catch (error) {
    console.error('Groq API error:', error);
    res.status(500).json({ error: 'Unable to process request' });
  }
});
```

---

## ✅ VERIFICATION CHECKLIST

Before deploying, verify:

- [ ] Groq API key obtained from console.groq.com
- [ ] API key added to `/var/www/workforce-api/.env`
- [ ] `.env` file permissions set: `chmod 600 .env`
- [ ] `.env` added to `.gitignore`
- [ ] Backend restarted: `pm2 restart workforce-api`
- [ ] Health check works: `curl https://api.../health`
- [ ] Voting assistant endpoint works
- [ ] Bills chat endpoint works
- [ ] Frontend shows: "✅ AI assistant ready"
- [ ] Console logs show successful Groq API calls

---

## 🎯 SUMMARY

**Your Groq Setup**:
- ✅ Model: Llama 3 (8B)
- ✅ Speed: Ultra-fast (350 tokens/sec)
- ✅ Cost: FREE tier (14,400 requests/day)
- ✅ Endpoints: 2 (voting + bills)
- ✅ Security: API key in .env, CORS protected
- ✅ Monitoring: Available in Groq console

**All information preserved**: Nothing was lost! ✅

**Next step**: Deploy backend with 2 new endpoints (bills + businesses)

---

## 📞 NEED HELP?

**Groq Documentation**: https://console.groq.com/docs  
**Groq Support**: support@groq.com  
**Your Backend Files**: `/var/www/workforce-api/` on Njalla VPS

---

## 🎉 YOU'RE ALL SET!

Your Groq API integration is fully documented and nothing was lost. You can now:
1. Add the 2 new backend endpoints (bills + businesses)
2. Deploy to production
3. Enjoy fast AI-powered chat assistants!

**Everything is preserved and ready to go!** 🚀
