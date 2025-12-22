# 🚀 BACKEND DEPLOYMENT FROM MAC - Complete Guide

**Your Status:** Backend NOT deployed (getting 404 errors)  
**Your VPS:** 185.193.126.13 (Njalla)  
**Goal:** Deploy Node.js backend to enable AI-powered civic features

---

## 📊 Current Situation Analysis

**From your console logs:**
```
❌ Bills API error: 404
❌ Failed to fetch bills from backend: Error: Unable to reach bills database
⚠️ Falling back to sample data...
```

**What this means:**
- Frontend → Trying to connect to: `https://api.workforcedemocracyproject.org`
- Backend → **NOT RUNNING** (404 error)
- Result → Using fallback sample data only

---

## 🎯 Deployment Overview

### **What We'll Do:**
1. ✅ Upload backend code from your Mac to VPS
2. ✅ Install dependencies on VPS
3. ✅ Set up PostgreSQL database
4. ✅ Configure environment variables
5. ✅ Start backend with PM2
6. ✅ Test AI chat endpoint

### **Time Required:** ~15-20 minutes

---

## 📋 Prerequisites Check

Before starting, verify you have:

- [ ] SSH access to VPS: `root@185.193.126.13`
- [ ] SSH password for the VPS
- [ ] Groq API key (for LLM - Llama 3.3-70b)
- [ ] Backend code in your project's `backend/` folder

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Prepare Backend Code on Your Mac**

Open Terminal on your Mac (`Cmd+Space` → type "Terminal" → Enter)

```bash
# Navigate to your project directory
cd /path/to/workforce-democracy-project

# Verify backend folder exists
ls -la backend/

# You should see:
# - server.js
# - package.json
# - database-schema.sql
# - ai-service.js
# - etc.
```

---

### **Step 2: Upload Backend Code to VPS**

#### **Option A: Using SCP (Recommended)**

```bash
# Create tar.gz of backend folder
cd /path/to/workforce-democracy-project
tar -czf backend.tar.gz backend/

# Upload to VPS
scp backend.tar.gz root@185.193.126.13:/root/

# Verify upload
ssh root@185.193.126.13 "ls -lh /root/backend.tar.gz"
```

#### **Option B: Using rsync (Better for updates)**

```bash
# From your Mac, sync backend folder to VPS
rsync -avz --progress backend/ root@185.193.126.13:/root/workforce-democracy-backend/

# This will:
# - Upload all files
# - Show progress
# - Preserve permissions
# - Only upload changed files on subsequent runs
```

---

### **Step 3: SSH into VPS and Extract**

```bash
# Connect to VPS
ssh root@185.193.126.13

# Once connected, run these commands on VPS:

# Extract backend (if using Option A - tar.gz)
cd /root
tar -xzf backend.tar.gz
mv backend workforce-democracy-backend
cd workforce-democracy-backend

# Or if using Option B (rsync), just navigate:
cd /root/workforce-democracy-backend

# Verify files are there
ls -la
# You should see: server.js, package.json, database-schema.sql, etc.
```

---

### **Step 4: Install Node.js & Dependencies on VPS**

```bash
# Still on VPS, install Node.js (if not already installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show v9.x.x or higher

# Install PM2 (process manager)
npm install -g pm2

# Install backend dependencies
cd /root/workforce-democracy-backend
npm install

# This installs:
# - express
# - groq-sdk
# - pg (PostgreSQL)
# - cors
# - dotenv
# - etc.
```

---

### **Step 5: Set Up PostgreSQL Database**

```bash
# Install PostgreSQL (if not already installed)
apt-get update
apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
CREATE DATABASE workforce_democracy;
CREATE USER wdp_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;
\q
EOF

# Run database schema
cd /root/workforce-democracy-backend
sudo -u postgres psql -d workforce_democracy -f database-schema.sql

# Verify tables created
sudo -u postgres psql -d workforce_democracy -c "\dt"
# You should see tables: bills, bill_cache, representatives, etc.
```

---

### **Step 6: Configure Environment Variables**

```bash
# Still on VPS, create .env file
cd /root/workforce-democracy-backend
cat > .env << 'EOF'
# Backend Configuration
PORT=3001
NODE_ENV=production

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=workforce_democracy
DB_USER=wdp_user
DB_PASSWORD=your_secure_password_here

# Groq API (for LLM)
GROQ_API_KEY=your_groq_api_key_here

# Security
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# Frontend URL (for CORS)
FRONTEND_URL=https://workforcedemocracyproject.org

# API Configuration
API_BASE_URL=https://api.workforcedemocracyproject.org
EOF

# Replace placeholders
nano .env
# Edit these lines:
# - DB_PASSWORD=your_secure_password_here (same as used above)
# - GROQ_API_KEY=your_groq_api_key_here (get from https://console.groq.com)
# Save: Ctrl+O, Enter, Ctrl+X
```

---

### **Step 7: Start Backend with PM2**

```bash
# Start backend
cd /root/workforce-democracy-backend
pm2 start server.js --name "workforce-democracy-api"

# Set PM2 to auto-start on reboot
pm2 startup
pm2 save

# Check status
pm2 status

# You should see:
# ┌─────┬──────────────────────────┬─────────────┬─────────┬─────────┐
# │ id  │ name                     │ mode        │ status  │ cpu     │
# ├─────┼──────────────────────────┼─────────────┼─────────┼─────────┤
# │ 0   │ workforce-democracy-api  │ fork        │ online  │ 0%      │
# └─────┴──────────────────────────┴─────────────┴─────────┴─────────┘

# View logs (real-time)
pm2 logs workforce-democracy-api

# View logs (last 20 lines)
pm2 logs workforce-democracy-api --lines 20 --nostream

# If you see errors, check:
pm2 logs workforce-democracy-api --err --lines 50
```

---

### **Step 8: Configure Nginx (Reverse Proxy)**

Your VPS needs Nginx to route `api.workforcedemocracyproject.org` to `localhost:3001`

```bash
# Install Nginx (if not already installed)
apt-get install -y nginx

# Create Nginx config for API subdomain
cat > /etc/nginx/sites-available/api.workforcedemocracyproject.org << 'EOF'
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.workforcedemocracyproject.org;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.workforcedemocracyproject.org/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # CORS headers (allow frontend)
    add_header Access-Control-Allow-Origin "https://workforcedemocracyproject.org" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    add_header Access-Control-Allow-Credentials "true" always;

    # Proxy to Node.js backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# Enable site
ln -s /etc/nginx/sites-available/api.workforcedemocracyproject.org /etc/nginx/sites-enabled/

# Test Nginx config
nginx -t

# If OK, restart Nginx
systemctl restart nginx
```

---

### **Step 9: Get SSL Certificate (Let's Encrypt)**

```bash
# Install Certbot
apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d api.workforcedemocracyproject.org

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS (option 2)

# Set auto-renewal
systemctl enable certbot.timer
```

---

### **Step 10: Test Backend from Mac**

From your Mac Terminal, test the endpoints:

```bash
# Test health endpoint
curl https://api.workforcedemocracyproject.org/api/civic/llm-health

# Expected response:
# {"status":"ok","timestamp":"2025-11-10T...","version":"1.0"}

# Test chat endpoint
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "What is HR 1234?",
    "context": "billExplanation",
    "conversationHistory": []
  }'

# Expected response:
# {
#   "response": "HR 1234 is the Education Funding Equity Act...",
#   "sources": [...],
#   "cached": false,
#   "model": "llama-3.3-70b-versatile"
# }
```

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

- [ ] PM2 shows backend as "online"
- [ ] Nginx is running: `systemctl status nginx`
- [ ] SSL certificate is valid: `certbot certificates`
- [ ] Health endpoint returns OK: `curl https://api.workforcedemocracyproject.org/api/civic/llm-health`
- [ ] Chat endpoint returns AI response
- [ ] Frontend connects successfully (no more 404 errors)
- [ ] Browser console shows: `[Backend API] ✅ Connected to https://api.workforcedemocracyproject.org`

---

## 🔧 POST-DEPLOYMENT: Configure DNS

**If `api.workforcedemocracyproject.org` doesn't resolve:**

1. Go to your domain registrar (where you bought workforcedemocracyproject.org)
2. Add A record:
   - **Subdomain:** `api`
   - **Type:** A
   - **Value:** `185.193.126.13`
   - **TTL:** 300 (5 minutes)
3. Wait 5-10 minutes for DNS propagation
4. Test: `ping api.workforcedemocracyproject.org`

---

## 🆘 TROUBLESHOOTING

### **Issue: Backend won't start**

```bash
# Check logs
pm2 logs workforce-democracy-api --lines 50

# Common issues:
# 1. Port 3001 already in use
lsof -i :3001
kill -9 <PID>
pm2 restart workforce-democracy-api

# 2. Database connection failed
sudo -u postgres psql -d workforce_democracy -c "SELECT NOW();"

# 3. Missing environment variables
cat .env
# Verify all variables are set
```

### **Issue: 404 errors persist**

```bash
# Check Nginx is routing correctly
curl http://localhost:3001/api/civic/llm-health

# If this works, Nginx config is wrong
# If this fails, backend isn't running
```

### **Issue: CORS errors**

```bash
# Check Nginx CORS headers
curl -I https://api.workforcedemocracyproject.org/api/civic/llm-health

# Should include:
# Access-Control-Allow-Origin: https://workforcedemocracyproject.org
```

---

## 📚 QUICK REFERENCE COMMANDS

### **PM2 Management:**
```bash
pm2 status                    # Check status
pm2 logs --lines 20          # View logs
pm2 restart all              # Restart
pm2 stop all                 # Stop
pm2 delete all               # Remove all processes
```

### **Database:**
```bash
# Connect to database
sudo -u postgres psql -d workforce_democracy

# Check bill cache
SELECT COUNT(*) FROM bill_cache;

# Check tables
\dt
```

### **Nginx:**
```bash
systemctl status nginx       # Check status
nginx -t                     # Test config
systemctl restart nginx      # Restart
tail -f /var/log/nginx/error.log  # View errors
```

---

## 🎯 EXPECTED RESULTS

**After successful deployment:**

1. **Frontend shows AI responses** (not sample data)
2. **Console logs show:**
   ```
   [Backend API] ✅ Connected
   [Backend API] Response source: groq-api
   ```
3. **Bills tab displays real explanations**
4. **Chat features powered by Llama 3.3-70b**
5. **PostgreSQL caches responses for future queries**

---

## 📝 MAINTENANCE

### **Update Backend Code:**
```bash
# From your Mac
rsync -avz --progress backend/ root@185.193.126.13:/root/workforce-democracy-backend/

# On VPS
ssh root@185.193.126.13 "cd /root/workforce-democracy-backend && pm2 restart workforce-democracy-api"
```

### **View Performance:**
```bash
ssh root@185.193.126.13 "pm2 monit"
```

### **Database Backup:**
```bash
ssh root@185.193.126.13 "sudo -u postgres pg_dump workforce_democracy > /root/backup-$(date +%Y%m%d).sql"
```

---

**Status:** 🚀 Ready to deploy!  
**Time:** 15-20 minutes  
**Difficulty:** Medium (copy-paste commands provided)

**Questions?** Check troubleshooting section or let me know!
