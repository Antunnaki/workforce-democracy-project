# 🔒 Apply Existing SSL Certificate to Civic Platform Backend

**Date**: November 3, 2025  
**Purpose**: Configure existing SSL certificate for backend API (185.193.126.13)  
**Status**: Ready to apply

---

## 📋 Prerequisites Check

Before we start, let me know:

1. **What domain/subdomain is the SSL certificate for?**
   - Example: `api.workforcedemocracyproject.org`
   - Example: `backend.workforcedemocracyproject.org`
   - Example: `workforcedemocracyproject.org`

2. **Where are the SSL certificate files located?**
   - Certificate file (`.crt` or `.pem`)
   - Private key file (`.key`)
   - Chain/CA bundle file (if separate)

3. **How was the certificate obtained?**
   - Let's Encrypt (certbot)
   - Commercial provider (GoDaddy, Namecheap, etc.)
   - Self-signed

---

## 🎯 Option 1: SSL Certificate Already in /etc/letsencrypt/ (Certbot)

If you used Let's Encrypt/certbot, your certificates are likely here:

### Step 1: Check if certificate exists

```bash
# Check for existing certificates
sudo ls -la /etc/letsencrypt/live/

# Expected output:
# drwxr-xr-x 2 root root 4096 Nov  3 12:00 your-domain.com
# drwxr-xr-x 2 root root 4096 Nov  3 12:00 api.your-domain.com
```

### Step 2: Identify your certificate domain

```bash
# List all certificate domains
sudo ls /etc/letsencrypt/live/
```

### Step 3: Configure backend server to use SSL

```bash
# Navigate to backend directory
cd /var/www/workforce-democracy/backend

# Backup current server.js
cp server.js server.js.backup-before-ssl-$(date +%Y%m%d-%H%M%S)

# We'll need to update server.js to:
# 1. Add HTTPS support
# 2. Change port from 3001 to 443 (or keep 3001 with Nginx reverse proxy)
# 3. Load SSL certificate files
```

**Which approach do you prefer?**

**A) Direct HTTPS on backend** (Node.js serves HTTPS on port 443)
- Backend: `https://185.193.126.13:443` or `https://api.yourdomain.com:443`
- Requires: Modify server.js to use HTTPS module
- Pros: Simple, direct SSL
- Cons: Backend must run on port 443 (requires sudo/privileges)

**B) Nginx reverse proxy** (Recommended)
- Frontend: `https://workforcedemocracyproject.org`
- Backend: Internal `http://localhost:3001` → External `https://api.yourdomain.com`
- Requires: Nginx configuration for SSL termination
- Pros: Industry standard, better performance, easier to manage
- Cons: One extra layer

---

## 🎯 Option 2: SSL Certificate in Custom Location

If your SSL certificate is in a different location:

### Step 1: Find your certificate files

```bash
# Search for certificate files
sudo find / -name "*.crt" -o -name "*.pem" 2>/dev/null | grep -E "(ssl|cert)"

# Search for key files
sudo find / -name "*.key" 2>/dev/null | grep -E "(ssl|cert)"
```

### Step 2: Verify certificate details

```bash
# Check certificate info
sudo openssl x509 -in /path/to/certificate.crt -text -noout

# Look for:
# - Subject: CN = your-domain.com
# - Validity dates
# - Issuer
```

### Step 3: Note file paths

Once you identify the files, note:
```
Certificate: /path/to/fullchain.pem (or .crt)
Private Key: /path/to/privkey.pem (or .key)
```

---

## 🚀 Implementation Approach A: Direct HTTPS in Node.js

### Update server.js to use HTTPS

```javascript
// Add at the top of server.js
const https = require('https');
const fs = require('fs');

// Load SSL certificate
const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/YOUR-DOMAIN/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/YOUR-DOMAIN/fullchain.pem')
};

// Instead of:
// app.listen(3001, ...);

// Use:
https.createServer(sslOptions, app).listen(443, () => {
    console.log('🔒 HTTPS Server running on port 443');
    console.log('✅ SSL Certificate loaded successfully');
});
```

### Deployment Commands

```bash
# 1. SSH to VPS
ssh root@185.193.126.13

# 2. Navigate to backend
cd /var/www/workforce-democracy/backend

# 3. Backup current file
cp server.js server.js.backup-before-ssl-$(date +%Y%m%d-%H%M%S)

# 4. Edit server.js (I'll provide the exact changes based on your certificate location)

# 5. Update PM2 to run on port 443
sudo /opt/nodejs/bin/pm2 restart workforce-democracy-backend

# 6. Check logs
sudo /opt/nodejs/bin/pm2 logs workforce-democracy-backend --lines 30
```

---

## 🚀 Implementation Approach B: Nginx Reverse Proxy (Recommended)

### Step 1: Configure Nginx with SSL

```nginx
# /etc/nginx/sites-available/api.yourdomain.com

server {
    listen 443 ssl http2;
    server_name api.workforcedemocracyproject.org;

    # SSL Certificate
    ssl_certificate /etc/letsencrypt/live/YOUR-DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/YOUR-DOMAIN/privkey.pem;

    # SSL Settings (modern configuration)
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers off;

    # Proxy to backend
    location /api/civic/ {
        proxy_pass http://localhost:3001/api/civic/;
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

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;
    return 301 https://$server_name$request_uri;
}
```

### Step 2: Deploy Nginx Configuration

```bash
# 1. Create Nginx config
sudo nano /etc/nginx/sites-available/api.yourdomain.com

# 2. Enable the site
sudo ln -s /etc/nginx/sites-available/api.yourdomain.com /etc/nginx/sites-enabled/

# 3. Test Nginx configuration
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx

# 5. Backend stays on port 3001 (no changes needed!)
```

---

## 📝 After SSL is Applied

### Update Frontend to Use HTTPS

Once SSL is working on the backend, update the frontend:

```bash
# Update civic-platform.html
cd /path/to/genspark/project

# Change API_BASE from:
# const API_BASE = 'http://185.193.126.13:3001/api/civic';

# To (if using approach A):
# const API_BASE = 'https://185.193.126.13:443/api/civic';

# Or (if using approach B with domain):
# const API_BASE = 'https://api.workforcedemocracyproject.org/api/civic';
```

---

## 🧪 Testing SSL Configuration

### Test HTTPS endpoint

```bash
# Test health endpoint
curl https://api.yourdomain.com/api/civic/llm-health

# Or with IP (approach A)
curl https://185.193.126.13:443/api/civic/llm-health

# Test ZIP search
curl "https://api.yourdomain.com/api/civic/representatives/search?zip=12061"

# Test LLM chat
curl -X POST https://api.yourdomain.com/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test HTTPS","context":"civic_education"}'
```

### Verify SSL certificate

```bash
# Check SSL certificate details
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com

# Expected output should show:
# - Certificate chain
# - Server certificate (your cert)
# - Verify return code: 0 (ok)
```

---

## 🎯 Next Steps - Please Provide

To proceed, I need you to tell me:

1. **Your SSL certificate domain name**
   ```bash
   # Run this command and share output:
   sudo ls /etc/letsencrypt/live/
   ```

2. **Preferred approach**
   - A) Direct HTTPS in Node.js (port 443)
   - B) Nginx reverse proxy (Recommended)

3. **Certificate file locations** (if not in `/etc/letsencrypt/`)
   ```bash
   # Run this and share output:
   sudo find /etc -name "*.crt" -o -name "*.pem" | grep -v private
   sudo find /etc -name "*key*.pem"
   ```

4. **Current Nginx configuration** (to see if already configured)
   ```bash
   # Share output of:
   sudo cat /etc/nginx/sites-enabled/default
   ```

---

## 📚 Complete Deployment Script (Will Create After You Confirm)

Once you provide the above information, I'll create a complete copy-paste deployment script that will:

1. ✅ Apply SSL certificate to backend
2. ✅ Configure Nginx (if using approach B)
3. ✅ Update frontend API URL to use HTTPS
4. ✅ Test all endpoints
5. ✅ Verify SSL is working correctly

---

## 🔐 Security Enhancements (After SSL Applied)

Once HTTPS is working, we should also:

1. **Enable HSTS** (HTTP Strict Transport Security)
2. **Add security headers** (X-Frame-Options, CSP, etc.)
3. **Configure automatic certificate renewal** (if using Let's Encrypt)
4. **Update CORS policy** to only allow HTTPS origins

---

**Ready to proceed! Please provide the information above and I'll create the exact deployment commands for your setup.** 🚀
