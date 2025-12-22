# 🚀 Complete Deployment Guide - Frontend + Backend

**Version**: V36.4.1  
**Date**: January 28, 2025  
**Time Required**: 1-2 hours total

---

## 📋 Prerequisites Checklist

Before starting, ensure you have:

- [ ] Netlify account (free tier is fine)
- [ ] Njalla VPS access credentials
- [ ] Domain configured: `workforcedemocracyproject.org` → Netlify
- [ ] Subdomain configured: `api.workforcedemocracyproject.org` → Njalla VPS IP
- [ ] Groq API key (sign up at https://groq.com/)
- [ ] Terminal/SSH client installed

---

# PART 1: FRONTEND DEPLOYMENT TO NETLIFY

## 🌐 Step 1: Prepare Frontend for Deployment

Open terminal in your project root directory.

### Test Locally First (Optional but Recommended)

```bash
# If you have a local server, test the site
python3 -m http.server 8000
# Or
npx serve .

# Open browser to http://localhost:8000
# Test Supreme Court chat, Bills section, etc.
# Press Ctrl+C to stop when done
```

---

## 📦 Step 2: Install Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Verify installation
netlify --version
```

---

## 🔐 Step 3: Login to Netlify

```bash
# Login to Netlify (opens browser)
netlify login

# Follow browser prompts to authorize
# Return to terminal when done
```

---

## 🎯 Step 4: Initialize Netlify Site

```bash
# Initialize Netlify in your project
netlify init

# You'll be prompted with questions:
# ? What would you like to do? 
#   → Select: "Create & configure a new site"
#
# ? Team:
#   → Select your team (usually your username)
#
# ? Site name (leave blank for random):
#   → Type: workforce-democracy-project
#   (or leave blank for random name, you can change later)
#
# ? Your build command (hugo build/yarn run build/etc):
#   → Press Enter (leave empty - we're deploying static files)
#
# ? Directory to deploy (blank for current dir):
#   → Press Enter (we're deploying the root directory)
#
# ? Netlify functions folder:
#   → Press Enter (no functions)

# CLI will create netlify.toml config file
```

---

## ⚙️ Step 5: Configure Netlify Settings

Create or update `netlify.toml`:

```bash
# Create netlify.toml file
cat > netlify.toml << 'EOF'
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/api/*"
  to = "https://api.workforcedemocracyproject.org/:splat"
  status = 200
  force = true

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"
EOF

echo "✅ netlify.toml created!"
```

---

## 🚀 Step 6: Deploy to Netlify

```bash
# Deploy to Netlify
netlify deploy --prod

# You'll see:
# Deploying to main site URL...
# ✔ Finished hashing 
# ✔ CDN requesting X files
# ✔ Finished uploading X assets
# ✔ Deploy is live!
#
# Unique Deploy URL: https://random-name-12345.netlify.app
# Website URL:       https://workforce-democracy-project.netlify.app

# Copy the Website URL - this is your live site!
```

---

## 🌍 Step 7: Configure Custom Domain (Optional)

If you have `workforcedemocracyproject.org`:

```bash
# Add custom domain
netlify domains:add workforcedemocracyproject.org

# Follow instructions to add DNS records:
# 1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
# 2. Add CNAME record:
#    Name: www
#    Value: workforce-democracy-project.netlify.app
# 3. Add A record for apex domain (if needed):
#    Name: @
#    Value: 75.2.60.5 (Netlify's IP)

# Enable HTTPS (automatic with Netlify)
netlify ssl:enable

# Wait 24-48 hours for DNS propagation
```

---

## ✅ Step 8: Verify Frontend Deployment

```bash
# Open your live site
netlify open:site

# Test in browser:
# 1. Navigate to Supreme Court section
# 2. Ask: "what is roe v wade?"
# 3. Verify it responds with case details
# 4. Test Bills section
# 5. Test Ethical Business section
```

---

# PART 2: BACKEND DEPLOYMENT TO NJALLA VPS

## 🖥️ Step 9: Connect to Njalla VPS

```bash
# SSH into your Njalla VPS
# Replace with your actual VPS IP
ssh root@YOUR_NJALLA_IP

# Example:
# ssh root@185.123.45.67

# Enter password when prompted
# You should see: root@hostname:~#
```

---

## 📦 Step 10: Install Prerequisites

```bash
# Update system packages
apt update && apt upgrade -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install nginx -y

# Install certbot for SSL
apt install certbot python3-certbot-nginx -y

# Install PM2 globally
npm install -g pm2

# Verify installations
node --version  # Should show v18.x.x
npm --version
psql --version
nginx -v
pm2 --version

echo "✅ All prerequisites installed!"
```

---

## 🗄️ Step 11: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# You're now in PostgreSQL prompt: postgres=#
```

**In PostgreSQL prompt, run these commands:**

```sql
-- Create database
CREATE DATABASE workforce_democracy;

-- Create user with password (CHANGE THIS PASSWORD!)
CREATE USER wdp_user WITH ENCRYPTED PASSWORD 'YOUR_SECURE_PASSWORD_HERE';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE workforce_democracy TO wdp_user;

-- Grant schema privileges
\c workforce_democracy
GRANT ALL ON SCHEMA public TO wdp_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO wdp_user;

-- Exit PostgreSQL
\q
```

```bash
# Back in bash shell
echo "✅ Database created!"
```

---

## 📁 Step 12: Create Project Directory

```bash
# Create directory structure
mkdir -p /var/www/workforce-democracy
cd /var/www/workforce-democracy

# Create backend directory
mkdir backend

echo "✅ Directory structure created!"
```

---

## 📤 Step 13: Upload Backend Files

**Open a NEW terminal on your LOCAL machine** (don't close VPS connection):

```bash
# On YOUR LOCAL MACHINE (not VPS!)

# Navigate to your project directory
cd /path/to/your/project

# Create compressed archive of backend folder
tar -czf backend.tar.gz backend/

# Upload to VPS (replace with your VPS IP)
scp backend.tar.gz root@YOUR_NJALLA_IP:/var/www/workforce-democracy/

# Example:
# scp backend.tar.gz root@185.123.45.67:/var/www/workforce-democracy/

# Enter password when prompted
# You should see: backend.tar.gz    100%   XKB
```

---

## 📂 Step 14: Extract Backend Files on VPS

**Back in your VPS terminal:**

```bash
# Navigate to project directory
cd /var/www/workforce-democracy

# Extract backend files
tar -xzf backend.tar.gz

# Navigate into backend
cd backend

# List files to verify
ls -la

# You should see:
# database-schema.sql
# server.js
# package.json
# .env.example
# README.md

echo "✅ Backend files extracted!"
```

---

## 🔧 Step 15: Configure Environment Variables

```bash
# Copy env template
cp .env.example .env

# Edit .env file
nano .env

# Press arrow keys to navigate
# Update these values:
```

**Replace these in .env:**

```bash
# Server Configuration
NODE_ENV=production
PORT=3001

# Frontend URL (UPDATE THIS!)
FRONTEND_URL=https://workforcedemocracyproject.org

# Database Configuration (UPDATE PASSWORD!)
DB_USER=wdp_user
DB_HOST=localhost
DB_NAME=workforce_democracy
DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DB_PORT=5432

# Groq API Configuration (GET KEY FROM https://groq.com/)
GROQ_API_KEY=your_groq_api_key_here
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.1-70b-versatile

# Session & Security (GENERATE THESE!)
SESSION_SECRET=paste_random_secret_here
JWT_SECRET=paste_random_secret_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**Generate random secrets:**

```bash
# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste into .env for SESSION_SECRET

# Generate JWT_SECRET  
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy output and paste into .env for JWT_SECRET
```

**Save and exit nano:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter` to save

```bash
echo "✅ Environment configured!"
```

---

## 📦 Step 16: Install Node.js Dependencies

```bash
# Install dependencies (this may take 2-3 minutes)
npm install

# You should see:
# added XXX packages
# 
# No critical vulnerabilities

echo "✅ Dependencies installed!"
```

---

## 🗄️ Step 17: Initialize Database Schema

```bash
# Run database schema
PGPASSWORD='YOUR_SECURE_PASSWORD_HERE' psql -U wdp_user -d workforce_democracy -f database-schema.sql

# You should see lots of CREATE TABLE, CREATE INDEX messages
# And at the end: INSERT 0 5 (the 5 famous court cases)

# Verify tables were created
PGPASSWORD='YOUR_SECURE_PASSWORD_HERE' psql -U wdp_user -d workforce_democracy -c "\dt"

# You should see list of tables:
# bills
# representatives
# court_cases
# cooperatives
# user_contexts
# conversation_memory
# cached_responses
# faq_content
# api_usage_metrics
# schema_version

# Verify famous cases were loaded
PGPASSWORD='YOUR_SECURE_PASSWORD_HERE' psql -U wdp_user -d workforce_democracy -c "SELECT case_name, year FROM court_cases;"

# You should see:
# Roe v. Wade | 1973
# Brown v. Board of Education | 1954
# Miranda v. Arizona | 1966
# Citizens United v. FEC | 2010
# Dobbs v. Jackson Women's Health Organization | 2022

echo "✅ Database initialized with 5 famous cases!"
```

---

## 🚀 Step 18: Test Server Locally

```bash
# Test run server
npm start

# You should see:
# ═══════════════════════════════════════════════════
#   🏛️  Workforce Democracy Project - Backend API
# ═══════════════════════════════════════════════════
#   Server running on port 3001
#   ✅ Connected to PostgreSQL database

# Press Ctrl+C to stop
```

---

## 🔄 Step 19: Set Up PM2 for Auto-Restart

```bash
# Start with PM2
pm2 start server.js --name workforce-democracy-backend

# You should see:
# [PM2] Starting server.js in fork_mode (1 instance)
# [PM2] Done.

# Check status
pm2 status

# You should see:
# │ id │ name                          │ status │
# │ 0  │ workforce-democracy-backend  │ online │

# View logs (Ctrl+C to exit)
pm2 logs workforce-democracy-backend --lines 20

# Save PM2 configuration
pm2 save

# Set up auto-start on server reboot
pm2 startup

# Copy and run the command it outputs
# It will look like:
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u root --hp /root

echo "✅ PM2 configured!"
```

---

## 🌐 Step 20: Configure Nginx Reverse Proxy

```bash
# Create Nginx configuration
nano /etc/nginx/sites-available/api.workforcedemocracyproject.org

# Paste this configuration:
```

**Paste into nano:**

```nginx
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y`
- Press `Enter`

```bash
# Enable the site
ln -s /etc/nginx/sites-available/api.workforcedemocracyproject.org /etc/nginx/sites-enabled/

# Test Nginx configuration
nginx -t

# You should see:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# Reload Nginx
systemctl reload nginx

echo "✅ Nginx configured!"
```

---

## 🔒 Step 21: Set Up SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
certbot --nginx -d api.workforcedemocracyproject.org

# Follow prompts:
# Enter email address: your-email@example.com
# Agree to terms: Y
# Share email with EFF: Y or N (your choice)
# 
# Certbot will automatically configure HTTPS!

# You should see:
# Successfully received certificate.
# Certificate is saved at: /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem

# Test auto-renewal
certbot renew --dry-run

# You should see:
# Congratulations, all simulated renewals succeeded

echo "✅ SSL certificate installed!"
```

---

## ✅ Step 22: Test Backend API

```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"2025-01-28T..."}

# Test from public URL
curl https://api.workforcedemocracyproject.org/health

# Should return same result

# Test Supreme Court query
curl -X POST https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Content-Type: application/json" \
  -d '{
    "chat_type": "supreme-court",
    "user_id": "test-user-123",
    "query": "what is roe v wade?"
  }'

# Should return detailed case information!

echo "✅ Backend API is live!"
```

---

## 🔗 Step 23: Update Frontend to Use Backend

**On your LOCAL machine**, update the frontend configuration:

```bash
# Navigate to project directory
cd /path/to/your/project

# Create or update config file
cat > js/config.js << 'EOF'
/**
 * WORKFORCE DEMOCRACY PROJECT - Configuration
 * Version: V36.4.1
 */

const CONFIG = {
    // Backend API URL
    BACKEND_API: 'https://api.workforcedemocracyproject.org',
    
    // Environment
    ENVIRONMENT: 'production',
    
    // Feature flags
    USE_BACKEND: true,
    USE_GROQ_FALLBACK: true,
    
    // Cache settings
    CACHE_ENABLED: true,
    
    // Debug mode
    DEBUG: false
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
EOF

echo "✅ Config created!"
```

---

## 🔄 Step 24: Redeploy Frontend to Netlify

```bash
# Deploy updated frontend
netlify deploy --prod

# Verify deployment
netlify open:site

echo "✅ Frontend redeployed with backend integration!"
```

---

## 🧪 Step 25: End-to-End Testing

### Test Supreme Court Chat:

1. Open: `https://workforcedemocracyproject.org`
2. Navigate to: **Civic Engagement → Supreme Court**
3. Click into chat input (should auto-expand)
4. Ask: **"what is roe v wade?"**
5. ✅ Should get detailed case information from backend!

### Test Bills Section:

1. Navigate to: **Bills**
2. Click **"Enable Personalization"**
3. Enter postcode: **90210**
4. ✅ Should load bills for that area

### Test Ethical Business:

1. Navigate to: **Ethical Business**
2. Enter postcode: **90210**
3. Click search
4. ✅ Should find cooperatives (once data populated)

---

## 📊 Step 26: Monitor Backend Performance

**On your VPS:**

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs workforce-democracy-backend --lines 50

# Monitor in real-time
pm2 monit

# Check database stats
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "
SELECT 
    chat_type,
    source,
    COUNT(*) as queries,
    ROUND(AVG(response_time_ms), 2) as avg_response_ms,
    SUM(cost) as total_cost
FROM api_usage_metrics
WHERE timestamp > NOW() - INTERVAL '1 day'
GROUP BY chat_type, source
ORDER BY queries DESC;
"

# Check cache hit rate
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "SELECT * FROM cache_hit_rate;"
```

---

## 🎉 Step 27: Verify Deployment Success

### ✅ Checklist:

- [ ] Frontend deployed to Netlify
- [ ] Frontend accessible at workforcedemocracyproject.org
- [ ] Backend running on Njalla VPS
- [ ] Backend API accessible at api.workforcedemocracyproject.org
- [ ] PostgreSQL database running
- [ ] 5 famous court cases loaded
- [ ] PM2 auto-restart configured
- [ ] Nginx reverse proxy working
- [ ] SSL certificate installed (HTTPS)
- [ ] Supreme Court chat responds with case details
- [ ] Backend logs show query processing
- [ ] No critical errors in PM2 logs

---

## 🔧 Troubleshooting

### Frontend Issues:

```bash
# Clear Netlify cache and redeploy
netlify deploy --prod --clear-cache

# Check build logs
netlify logs

# Check site status
netlify status
```

### Backend Issues:

```bash
# Check PM2 status
pm2 status

# Restart backend
pm2 restart workforce-democracy-backend

# Check logs
pm2 logs --lines 100

# Check if port 3001 is listening
netstat -tlnp | grep 3001

# Check Nginx status
systemctl status nginx

# Test database connection
PGPASSWORD='YOUR_PASSWORD' psql -U wdp_user -d workforce_democracy -c "SELECT NOW();"
```

### SSL Issues:

```bash
# Check certificate status
certbot certificates

# Renew certificate
certbot renew

# Check Nginx SSL config
nginx -t
```

---

## 📝 Post-Deployment Tasks

### 1. Monitor Performance:

```bash
# Set up daily monitoring cron job
crontab -e

# Add this line (runs daily at 2 AM):
0 2 * * * /usr/bin/node /var/www/workforce-democracy/backend/scripts/daily-metrics.js >> /var/log/wdp-metrics.log 2>&1
```

### 2. Set Up Backups:

```bash
# Create backup script
cat > /var/www/workforce-democracy/backup.sh << 'EOF'
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/workforce-democracy"
mkdir -p $BACKUP_DIR

# Backup database
PGPASSWORD='YOUR_PASSWORD' pg_dump -U wdp_user workforce_democracy | gzip > $BACKUP_DIR/db_$TIMESTAMP.sql.gz

# Keep only last 7 days of backups
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $TIMESTAMP"
EOF

# Make executable
chmod +x /var/www/workforce-democracy/backup.sh

# Add to crontab (runs daily at 3 AM)
crontab -e
# Add: 0 3 * * * /var/www/workforce-democracy/backup.sh >> /var/log/wdp-backup.log 2>&1
```

### 3. Populate Additional Data:

```bash
# TODO: Add scripts to populate:
# - Bills data (from Congress.gov API)
# - Representatives data (from ProPublica API)
# - Cooperatives data (from various sources)
```

---

## 🎊 Congratulations!

Your Workforce Democracy Project is now **LIVE**! 🎉

### You now have:

✅ **Frontend** live at workforcedemocracyproject.org  
✅ **Backend API** running on Njalla VPS  
✅ **Database** with 5 famous court cases  
✅ **SSL certificates** (HTTPS everywhere)  
✅ **Auto-restart** (PM2 monitoring)  
✅ **Intelligent caching** (cost optimization)  
✅ **Cross-chat context** (smart conversations)  
✅ **Privacy-first** (encrypted user data)  

### Next Steps:

1. Monitor performance and costs
2. Populate more data (bills, reps, cooperatives)
3. Share with users and gather feedback
4. Iterate and improve based on usage

---

## 📞 Support

If you encounter issues:

1. Check logs: `pm2 logs`
2. Check database: `psql -U wdp_user -d workforce_democracy`
3. Check Nginx: `nginx -t`
4. Check SSL: `certbot certificates`

---

**Your democracy platform is ready to change the world!** 🌍✨
