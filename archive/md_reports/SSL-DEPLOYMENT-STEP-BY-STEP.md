# 🔒 SSL Deployment - Step by Step Guide

**Domain**: `api.workforcedemocracyproject.org`  
**Approach**: Option B - Nginx Reverse Proxy ⭐  
**Date**: November 3, 2025

---

## ✅ What We Know

- SSL Certificate: `/etc/letsencrypt/live/api.workforcedemocracyproject.org/`
- Backend running on: `http://localhost:3001`
- Nginx: May need to be installed or configured
- PM2: Backend process running

---

## 🚀 Step 1: Diagnostic Check

First, let's see your Nginx setup. **Run this on your VPS**:

```bash
# Run diagnostic script
bash DEPLOY-SSL-NOW.sh
```

**OR** run these commands manually:

```bash
# Check if Nginx is installed
nginx -v

# Check existing Nginx configuration
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/conf.d/

# Verify SSL certificate
sudo openssl x509 -in /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem -noout -dates

# Check backend
/opt/nodejs/bin/pm2 list
curl http://localhost:3001/api/civic/llm-health
```

---

## 🔧 Step 2: Create Nginx SSL Configuration

**After Step 1**, I'll create the exact Nginx configuration. Here's a preview:

```nginx
# /etc/nginx/sites-available/api.workforcedemocracyproject.org

server {
    listen 443 ssl http2;
    server_name api.workforcedemocracyproject.org;

    # SSL Certificate from Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.workforcedemocracyproject.org/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;

    # HSTS (optional but recommended)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to backend (localhost:3001)
    location /api/civic/ {
        proxy_pass http://localhost:3001/api/civic/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_cache_bypass $http_upgrade;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "https://workforcedemocracyproject.org" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;
    return 301 https://$server_name$request_uri;
}
```

---

## 📝 Step 3: Deploy Configuration

Once we have the diagnostic results, I'll provide exact commands to:

1. Create the Nginx configuration file
2. Enable the site
3. Test the configuration
4. Reload Nginx
5. Test HTTPS endpoints

---

## 🧪 Step 4: Testing

After deployment, we'll test:

```bash
# 1. Health check over HTTPS
curl https://api.workforcedemocracyproject.org/api/civic/llm-health

# 2. ZIP search over HTTPS
curl "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061"

# 3. LLM chat over HTTPS
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is democracy?","context":"civic_education"}'

# 4. Verify SSL certificate
openssl s_client -connect api.workforcedemocracyproject.org:443 -servername api.workforcedemocracyproject.org | grep -E "Verify return code|subject="
```

---

## 🎯 Step 5: Update Frontend

After SSL is working, I'll update the frontend:

**Change in civic-platform.html (line 522)**:
```javascript
// FROM:
const API_BASE = 'http://185.193.126.13:3001/api/civic';

// TO:
const API_BASE = 'https://api.workforcedemocracyproject.org/api/civic';
```

---

## ⏭️ Immediate Next Step

**Please run the diagnostic script and share the output**:

```bash
cd /var/www/workforce-democracy/backend

# Download the diagnostic script (already created in GenSpark)
# OR run these commands manually:

echo "=== Nginx Check ==="
nginx -v
echo ""

echo "=== Nginx Config Locations ==="
ls -la /etc/nginx/sites-available/ 2>/dev/null || echo "sites-available/ not found"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null || echo "sites-enabled/ not found"
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "conf.d/ not found"
echo ""

echo "=== SSL Certificate Check ==="
sudo openssl x509 -in /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem -noout -dates
echo ""

echo "=== Backend Check ==="
/opt/nodejs/bin/pm2 list
curl -s http://localhost:3001/api/civic/llm-health | head -5
```

**Share the output**, and I'll create the exact deployment commands! 🚀

---

## 📋 Deployment Checklist

- [ ] Step 1: Run diagnostic check
- [ ] Step 2: Install/configure Nginx (if needed)
- [ ] Step 3: Create SSL configuration
- [ ] Step 4: Enable site and reload Nginx
- [ ] Step 5: Test HTTPS endpoints
- [ ] Step 6: Update frontend API URL
- [ ] Step 7: Deploy to Netlify
- [ ] Step 8: End-to-end testing

---

**Ready to proceed! Waiting for diagnostic output.** ✅
