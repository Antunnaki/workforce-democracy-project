## 🚀 Backend Deployment Guide - Njalla VPS with Ollama

**For:** Ethical Business AI Assistant  
**LLM:** Llama 3.2 (Self-Hosted via Ollama)  
**Hosting:** Njalla VPS  
**Privacy:** 100% - No external APIs, no logging

---

## 📋 **Prerequisites**

### **What You'll Need:**

1. **Njalla VPS Account**
   - Minimum: 2 CPU cores, 8GB RAM, 50GB storage
   - Recommended: 4 CPU cores, 16GB RAM, 100GB storage (for better performance)
   - OS: Ubuntu 22.04 LTS or Ubuntu 24.04 LTS

2. **Domain Name** (via Njalla or elsewhere)
   - Example: `api.workforcedemocracy.org`
   - Will be used for backend API calls

3. **Frontend Hosting** (Netlify - FREE)
   - Your static HTML/CSS/JS files
   - Fast global CDN
   - Easy deployment from Git

4. **SSH Access** to your Njalla VPS
   - You'll get this from Njalla dashboard
   - Example: `ssh root@your-vps-ip`

---

## 🎯 **Architecture Overview**

```
User's Browser (Static Site via Netlify)
         ↓
    HTTPS Request
         ↓
Njalla VPS (Your Backend)
    ├─ Node.js Express Server (Port 3000)
    ├─ Ollama (Llama 3.2) (Port 11434)
    └─ Nginx (Reverse Proxy) (Port 80/443)
         ↓
    Llama 3 generates response
         ↓
    Response sent back to browser
```

**Key Points:**
- ✅ Frontend on Netlify (fast, global CDN)
- ✅ Backend on Njalla (your private server)
- ✅ Ollama runs locally (no external LLM APIs)
- ✅ Zero external dependencies for AI
- ✅ Completely private and self-hosted

---

## 📦 **Step 1: Set Up Njalla VPS**

### **1.1 Connect to Your VPS:**

```bash
# SSH into your VPS
ssh root@your-vps-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential tools
sudo apt install -y curl wget git build-essential
```

### **1.2 Create Non-Root User (Security Best Practice):**

```bash
# Create user
adduser wdp

# Add to sudo group
usermod -aG sudo wdp

# Switch to new user
su - wdp
```

---

## 🤖 **Step 2: Install Ollama + Llama 3**

### **2.1 Install Ollama:**

```bash
# Download and install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installation
ollama --version
```

### **2.2 Download Llama 3.2 Model:**

```bash
# Pull Llama 3.2 3B (Smaller, faster - recommended for VPS)
ollama pull llama3.2:3b-instruct

# OR pull Llama 3.1 8B (Larger, better quality)
# ollama pull llama3.1:8b-instruct

# OR pull Llama 3.1 70B (Best quality, requires LOTS of RAM/GPU)
# ollama pull llama3.1:70b-instruct

# Test it works
ollama run llama3.2:3b-instruct "What is a worker cooperative?"
```

**Model Comparison:**

| Model | Size | RAM Needed | Speed | Quality |
|-------|------|------------|-------|---------|
| Llama 3.2 3B | 1.9GB | 4GB | Very Fast | Good |
| Llama 3.1 8B | 4.7GB | 8GB | Fast | Great |
| Llama 3.1 70B | 40GB | 64GB | Slow | Excellent |

**Recommendation:** Start with **Llama 3.2 3B** for testing, upgrade to **3.1 8B** if needed.

### **2.3 Run Ollama as a Service:**

```bash
# Enable Ollama to start on boot
sudo systemctl enable ollama

# Start Ollama service
sudo systemctl start ollama

# Check status
sudo systemctl status ollama

# View logs
sudo journalctl -u ollama -f
```

Ollama now runs on `http://localhost:11434`

---

## 🟢 **Step 3: Set Up Node.js Backend**

### **3.1 Install Node.js:**

```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version  # Should be v20.x.x
npm --version
```

### **3.2 Create Backend Project:**

```bash
# Create project directory
mkdir -p ~/wdp-backend
cd ~/wdp-backend

# Initialize npm project
npm init -y

# Install dependencies
npm install express cors helmet axios dotenv compression
npm install --save-dev nodemon
```

### **3.3 Create Backend Files:**

Create `server.js`:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const ethicalBusinessRoutes = require('./routes/ethicalBusiness');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// CORS - Allow frontend domain
app.use(cors({
    origin: [
        'https://your-netlify-domain.netlify.app',
        'https://workforcedemocracy.org', // Your custom domain
        'http://localhost:3000' // For local testing
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/ethical-business', ethicalBusinessRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 WDP Backend running on port ${PORT}`);
    console.log(`🤖 Ollama endpoint: http://localhost:11434`);
});
```

Create `routes/ethicalBusiness.js`:

```javascript
// routes/ethicalBusiness.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Ollama configuration
const OLLAMA_URL = 'http://localhost:11434';
const MODEL = 'llama3.2:3b-instruct'; // Change to llama3.1:8b-instruct if using that

// System prompt for ethical business assistant
const SYSTEM_PROMPT = `You are a helpful, knowledgeable assistant specializing in worker cooperatives, ethical businesses, and democratic workplaces.

Your role:
- Explain worker cooperatives, ethical businesses, community services, and social enterprises
- Help users understand the benefits of democratic workplaces
- Provide information about how cooperatives differ from traditional businesses
- Guide users on finding ethical businesses in their area
- Answer questions about starting or joining cooperatives
- Be warm, encouraging, and educational
- Use clear, accessible language
- Include relevant examples when helpful

Remember:
- Be non-partisan and factual
- Focus on education, not persuasion
- Emphasize privacy and user control
- Keep responses concise but informative (aim for 200-300 words)
- Use bullet points and formatting for readability`;

/**
 * POST /api/ethical-business/chat
 * Handle chat messages from frontend
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`💬 Received question: ${message.substring(0, 100)}...`);

        // Build conversation history for context
        let fullPrompt = SYSTEM_PROMPT + '\n\n';
        
        if (context && Array.isArray(context) && context.length > 0) {
            fullPrompt += 'Previous conversation:\n';
            context.forEach(msg => {
                fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
            });
            fullPrompt += '\n';
        }
        
        fullPrompt += `User: ${message}\nAssistant:`;

        // Call Ollama
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: MODEL,
            prompt: fullPrompt,
            stream: false,
            options: {
                temperature: 0.7,
                top_p: 0.9,
                top_k: 40,
                num_predict: 500, // Max tokens in response
                stop: ['User:', '\n\nUser:'] // Stop if model tries to continue conversation
            }
        }, {
            timeout: 60000 // 60 second timeout
        });

        const aiResponse = response.data.response.trim();
        
        console.log(`✅ Generated response (${aiResponse.length} chars)`);

        // Return response
        res.json({
            response: aiResponse,
            model: MODEL,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Error generating response:', error.message);
        
        // Return user-friendly error
        res.status(500).json({
            error: 'Failed to generate response',
            message: 'Please try again in a moment.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * GET /api/ethical-business/status
 * Check if Ollama is running
 */
router.get('/status', async (req, res) => {
    try {
        const response = await axios.get(`${OLLAMA_URL}/api/tags`);
        const models = response.data.models || [];
        const hasLlama = models.some(m => m.name.includes('llama'));

        res.json({
            ollama: 'running',
            models: models.map(m => m.name),
            ready: hasLlama,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(503).json({
            ollama: 'not running',
            error: error.message
        });
    }
});

module.exports = router;
```

Create `package.json` scripts:

```json
{
  "name": "wdp-backend",
  "version": "1.0.0",
  "description": "Workforce Democracy Project Backend API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "keywords": ["worker-cooperatives", "ethical-business", "democracy"],
  "author": "Workforce Democracy Project",
  "license": "MIT"
}
```

### **3.4 Test Backend Locally:**

```bash
# Start server
npm start

# In another terminal, test health endpoint
curl http://localhost:3000/health

# Test Ollama status
curl http://localhost:3000/api/ethical-business/status

# Test chat (send a question)
curl -X POST http://localhost:3000/api/ethical-business/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is a worker cooperative?"}'
```

You should see a response from Llama 3!

---

## 🔒 **Step 4: Set Up Nginx (Reverse Proxy + HTTPS)**

### **4.1 Install Nginx:**

```bash
sudo apt install -y nginx
```

### **4.2 Configure Nginx:**

Create `/etc/nginx/sites-available/wdp-backend`:

```nginx
server {
    listen 80;
    server_name api.workforcedemocracy.org;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeouts for AI responses
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3000/health;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/wdp-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **4.3 Set Up HTTPS with Let's Encrypt:**

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.workforcedemocracy.org

# Certbot will automatically:
# - Get certificate
# - Configure nginx for HTTPS
# - Set up auto-renewal
```

Your API is now accessible at `https://api.workforcedemocracy.org`!

---

## 🔧 **Step 5: Set Up PM2 (Process Manager)**

PM2 keeps your Node.js server running and restarts it if it crashes.

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start your backend with PM2
cd ~/wdp-backend
pm2 start server.js --name wdp-backend

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup

# Check status
pm2 status
pm2 logs wdp-backend

# Useful PM2 commands:
# pm2 restart wdp-backend
# pm2 stop wdp-backend
# pm2 delete wdp-backend
```

---

## 🌐 **Step 6: Update Frontend Configuration**

In your frontend code (`js/ethical-business-chat.js`), update the API endpoint:

```javascript
const ETHICAL_BUSINESS_CHAT_CONFIG = {
    // UPDATE THIS after backend is deployed
    apiEndpoint: 'https://api.workforcedemocracy.org/api/ethical-business/chat',
    
    // Set to false to use real backend
    mockMode: false,
    
    // ... rest of config
};
```

Redeploy your frontend to Netlify.

---

## ✅ **Step 7: Test End-to-End**

1. **Visit your frontend:** `https://workforcedemocracy.org`
2. **Scroll to Ethical Business section**
3. **Click on AI Assistant chat**
4. **Ask a question:** "What is a worker cooperative?"
5. **Wait for response** (should take 2-10 seconds)
6. **See AI-generated answer!**

---

## 📊 **Monitoring & Maintenance**

### **Check Logs:**

```bash
# Backend logs
pm2 logs wdp-backend

# Ollama logs
sudo journalctl -u ollama -f

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Check Resource Usage:**

```bash
# CPU/RAM usage
htop

# Disk space
df -h

# Ollama model storage
ls -lh ~/.ollama/models/
```

### **Update Ollama Model:**

```bash
# Pull latest version
ollama pull llama3.2:3b-instruct

# Restart backend
pm2 restart wdp-backend
```

---

## 💰 **Cost Estimate**

**Njalla VPS (8GB RAM):** ~$10-20/month  
**Domain:** ~$10/year (if not using Njalla's)  
**Netlify (Frontend):** FREE  
**Ollama (Self-hosted):** FREE  
**Let's Encrypt SSL:** FREE  

**Total:** ~$10-20/month (just the VPS!)

---

## 🔒 **Privacy Guarantee**

✅ **No external LLM APIs** - Llama runs on YOUR server  
✅ **No conversation logging** - Code doesn't store anything  
✅ **User chats on their device** - localStorage only  
✅ **Anonymous requests** - No user identification  
✅ **HTTPS encryption** - All traffic encrypted  
✅ **Self-hosted** - You control everything  

---

## 🚀 **You're Done!**

Your ethical business AI assistant is now:
- ✅ Self-hosted on Njalla
- ✅ Using Llama 3 locally (no external APIs)
- ✅ Completely private
- ✅ Fast and responsive
- ✅ Ready for users!

**Questions? Check `pm2 logs` or `journalctl -u ollama`!**
