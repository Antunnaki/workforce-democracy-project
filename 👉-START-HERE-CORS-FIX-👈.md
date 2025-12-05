# 👉 START HERE: CORS Credentials Fix

**⚡ Quick Summary**: Your personalization system is almost ready! The backend is running perfectly with MongoDB and session support. You just need to update one Nginx configuration file to allow credentials for the personalization API.

---

## 🎯 What You Need to Do

### 1️⃣ SSH into Your VPS
```bash
ssh root@185.193.126.13
```

### 2️⃣ Copy and Paste This Command Block

```bash
# Find your Nginx config file
echo "Looking for Nginx configuration..."
ls -la /etc/nginx/sites-enabled/

# The file is likely named:
# - workforce-backend
# - api.workforcedemocracyproject.org  
# - default
```

### 3️⃣ Edit the Config File
Replace `YOUR_CONFIG_FILE` with the actual filename:

```bash
# Backup first
cp /etc/nginx/sites-enabled/YOUR_CONFIG_FILE /etc/nginx/sites-enabled/YOUR_CONFIG_FILE.backup

# Edit the file
nano /etc/nginx/sites-enabled/YOUR_CONFIG_FILE
```

### 4️⃣ Find and Update `/api/` Location Block

Look for a section that starts with:
```nginx
location /api/ {
```

Add these CORS headers inside that block (after the proxy settings):

```nginx
    # CORS Headers - CRITICAL FOR CREDENTIALS
    add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    add_header 'Access-Control-Max-Age' '86400' always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' '86400' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

### 5️⃣ Test and Reload Nginx

```bash
# Test configuration
nginx -t

# If test passes, reload Nginx
systemctl reload nginx

# Verify it's running
systemctl status nginx
```

---

## ✅ How to Test

1. Go to https://workforcedemocracyproject.org
2. Click "Get Started" 
3. Try to register a personalization account
4. **Expected Result**: Registration should work, no CORS errors in console

---

## 📚 Detailed Instructions

For complete step-by-step instructions, troubleshooting, and testing procedures, see:
- **FIX-NGINX-CORS-CREDENTIALS.md** (full deployment guide)

---

## 🎉 What This Fixes

✅ Personalization registration will work  
✅ Session cookies will be set (survive Fire button on some browsers)  
✅ MongoDB session storage will function  
✅ Password-protected data recovery after Fire button  

---

**🔒 Master Deployment Guide Updated**: Version 1.3 confirms MongoDB is installed and running.
