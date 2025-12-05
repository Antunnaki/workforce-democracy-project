# Chat Troubleshooting Guide

## 🎯 Current Issue

The chat functionality is not working. Let's diagnose and fix it step by step.

## 📁 Key Files Involved

### Frontend
- `/js/chat-clean.js` - Main chat interface (v37.4.5)
- Connects to: `https://api.workforcedemocracyproject.org/api/civic/llm-chat`

### Backend
- `/backend/server.js` - Main server (port 3001)
- `/civic/backend/llm-proxy.js` - LLM chat endpoint handler
- `/backend/ai-service.js` - AI integration with Groq

---

## 🔍 Diagnostic Checklist

### Step 1: Check Backend Environment Variables

The backend needs a GROQ_API_KEY to work. Let's verify:

```bash
cd /var/www/workforce-democracy/backend
ls -la | grep .env
```

**Expected:** You should see a `.env` file
**Problem:** If no `.env` file exists, the API won't work

### Step 2: Create/Verify .env File

```bash
cd /var/www/workforce-democracy/backend
cp .env.example .env
nano .env
```

**Required Variables:**
```bash
# Critical for chat to work
GROQ_API_KEY=your_actual_groq_api_key_here

# Database (if using persistent features)
DB_USER=postgres
DB_HOST=localhost
DB_NAME=workforce_democracy
DB_PASSWORD=your_password_here
DB_PORT=5432

# Server config
PORT=3001
NODE_ENV=production
```

**Get your Groq API key:**
1. Go to https://console.groq.com
2. Sign up / Log in
3. Create an API key
4. Paste it in .env as `GROQ_API_KEY=gsk_...`

### Step 3: Check Backend Server Status

```bash
# Check if backend is running
pm2 list

# Check logs
pm2 logs workforce-backend --lines 50

# If not running, start it:
cd /var/www/workforce-democracy/backend
pm2 start server.js --name workforce-backend

# Or restart if already running:
pm2 restart workforce-backend
```

### Step 4: Test Backend Connectivity

```bash
# Test health endpoint
curl https://api.workforcedemocracyproject.org/health

# Test LLM health endpoint
curl https://api.workforcedemocracyproject.org/api/civic/llm-health

# Test actual chat endpoint (POST)
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What is democracy?",
    "context": "general",
    "conversationHistory": []
  }'
```

**Expected successful response:**
```json
{
  "success": true,
  "message": "Democracy is a system of government...",
  "sources": [],
  "model": "llama3-70b-8192"
}
```

**Common Errors:**
- `GROQ_API_KEY not configured` → Add API key to .env
- `Connection refused` → Backend not running
- `502 Bad Gateway` → Nginx can't reach backend
- `CORS error` → Check Nginx CORS configuration

### Step 5: Check Nginx Configuration

```bash
# Check Nginx config for backend proxy
sudo nano /etc/nginx/sites-enabled/workforce-backend

# Should contain:
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type" always;
}

# Test Nginx config
sudo nginx -t

# Reload if OK
sudo systemctl reload nginx
```

### Step 6: Check Frontend Console

Open browser console (F12) on your website and try to send a chat message. Look for:

```
[CleanChat v37.4.5] 📤 Sending query: {...}
```

**Common Frontend Errors:**
- `Failed to fetch` → Backend unreachable
- `CORS error` → Nginx not configured properly
- `400 Bad Request` → Frontend sending wrong data format
- `500 Internal Server Error` → Backend crashed, check PM2 logs

---

## 🛠️ Quick Fixes

### Fix #1: Missing GROQ_API_KEY

```bash
cd /var/www/workforce-democracy/backend
echo "GROQ_API_KEY=gsk_YOUR_ACTUAL_KEY_HERE" >> .env
pm2 restart workforce-backend
```

### Fix #2: Backend Not Running

```bash
cd /var/www/workforce-democracy/backend
pm2 start server.js --name workforce-backend
pm2 save
```

### Fix #3: Port Conflict

```bash
# Check what's using port 3001
sudo lsof -i :3001

# If something else is using it, change backend port
nano /var/www/workforce-democracy/backend/.env
# Change: PORT=3002

pm2 restart workforce-backend

# Update Nginx proxy_pass
sudo nano /etc/nginx/sites-enabled/workforce-backend
# Change: proxy_pass http://localhost:3002;

sudo systemctl reload nginx
```

### Fix #4: Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# If not running:
sudo systemctl start postgresql

# Test connection
sudo -u postgres psql -c "SELECT version();"

# Create database if needed
sudo -u postgres createdb workforce_democracy
```

---

## 📊 Expected Data Flow

1. **User sends message** → Frontend (`chat-clean.js`)
2. **Frontend calls** → `POST https://api.workforcedemocracyproject.org/api/civic/llm-chat`
3. **Nginx proxies** → `http://localhost:3001/api/civic/llm-chat`
4. **Backend handles** → `/civic/backend/llm-proxy.js` (Express router)
5. **LLM proxy calls** → Groq API with GROQ_API_KEY
6. **Groq responds** → AI-generated answer with citations
7. **Backend searches** → Web sources (DuckDuckGo, RSS feeds)
8. **Backend returns** → JSON with `{message, sources}` array
9. **Frontend displays** → Formatted answer with clickable citations

---

## 🧪 Testing Script

Save this as `test-chat.sh` and run it:

```bash
#!/bin/bash

echo "=== Chat System Diagnostics ==="
echo ""

echo "1. Checking backend .env file..."
if [ -f /var/www/workforce-democracy/backend/.env ]; then
    echo "✅ .env file exists"
    if grep -q "GROQ_API_KEY=" /var/www/workforce-democracy/backend/.env; then
        echo "✅ GROQ_API_KEY is set"
    else
        echo "❌ GROQ_API_KEY missing in .env"
    fi
else
    echo "❌ .env file missing"
fi

echo ""
echo "2. Checking backend server..."
pm2 list | grep workforce-backend
if [ $? -eq 0 ]; then
    echo "✅ Backend process found"
else
    echo "❌ Backend not running"
fi

echo ""
echo "3. Testing health endpoint..."
curl -s https://api.workforcedemocracyproject.org/health | head -n 5

echo ""
echo "4. Testing LLM health..."
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | jq .

echo ""
echo "5. Testing chat endpoint..."
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "context": "general"}' \
  -s | jq '.success'

echo ""
echo "=== End Diagnostics ==="
```

---

## 🎯 Most Likely Issue

Based on the code review, the **most likely problem** is:

**Missing GROQ_API_KEY** in `/var/www/workforce-democracy/backend/.env`

The backend won't work without it because:
- Line 145 in `llm-proxy.js` checks: `if (!GROQ_API_KEY) { return error }`
- Line 219 uses it: `'Authorization': Bearer ${GROQ_API_KEY}`

---

## 📞 Next Steps

1. **Run the archive script** to clean up documentation:
   ```bash
   cd /var/www/workforce-democracy
   chmod +x archive-old-docs.sh
   ./archive-old-docs.sh
   ```

2. **Fix the chat** (most likely):
   ```bash
   cd /var/www/workforce-democracy/backend
   cp .env.example .env
   nano .env  # Add your GROQ_API_KEY
   pm2 restart workforce-backend
   pm2 logs workforce-backend --lines 20
   ```

3. **Test it**:
   - Open https://workforcedemocracyproject.org
   - Open browser console (F12)
   - Try to send a chat message
   - Check console for errors

---

## 💡 Quick Win Commands

```bash
# One-command fix (if you have GROQ key)
cd /var/www/workforce-democracy/backend && \
echo "GROQ_API_KEY=gsk_YOUR_KEY_HERE" >> .env && \
echo "PORT=3001" >> .env && \
echo "NODE_ENV=production" >> .env && \
pm2 restart workforce-backend && \
pm2 logs workforce-backend --lines 5
```

Replace `gsk_YOUR_KEY_HERE` with your actual Groq API key from https://console.groq.com

---

*Last Updated: 2025-11-07*
*For: Workforce Democracy Chat System Debugging*
