# 👉 UPLOAD FROM MAC - Simple Instructions

**⚡ Yes! You can upload from your Mac and fix this in 2 commands**

---

## 🎯 Quick Answer

The Nginx config file lives on the **VPS server** (not in your backend folder), but you can upload a deployment script from your Mac that will help you fix it.

---

## ⚡ Option 1: Super Simple (2 Commands from Mac)

### Step 1: Make upload script executable
```bash
# From your project root directory on Mac:
chmod +x UPLOAD-AND-FIX-NGINX.sh
```

### Step 2: Run it!
```bash
./UPLOAD-AND-FIX-NGINX.sh
```

**What it does**:
1. Uploads deployment script to VPS
2. Uploads CORS config reference to VPS  
3. SSH into VPS automatically
4. Runs the deployment script
5. Opens nano editor for you to add CORS headers
6. Tests and reloads Nginx

**Time**: 5 minutes  
**Manual editing**: Yes (in nano on VPS)

---

## 📋 Option 2: Manual Upload (More Control)

### Step 1: Upload files from Mac
```bash
# From your project root directory on Mac:
scp backend/deploy-nginx-cors-fix.sh root@185.193.126.13:/root/
scp backend/nginx-cors-config.conf root@185.193.126.13:/root/
```

### Step 2: SSH into VPS
```bash
ssh root@185.193.126.13
```

### Step 3: Run deployment script on VPS
```bash
chmod +x /root/deploy-nginx-cors-fix.sh
/root/deploy-nginx-cors-fix.sh
```

The script will:
- ✅ Find your Nginx config file
- ✅ Create a backup
- ✅ Open nano for you to edit
- ✅ Test configuration
- ✅ Reload Nginx

---

## 📝 Option 3: Fully Manual (Old School)

### Step 1: SSH into VPS
```bash
ssh root@185.193.126.13
```

### Step 2: Find Nginx config
```bash
ls -la /etc/nginx/sites-enabled/
```

### Step 3: Backup config
```bash
# Replace YOUR_CONFIG_FILE with actual filename
cp /etc/nginx/sites-enabled/YOUR_CONFIG_FILE /etc/nginx/sites-enabled/YOUR_CONFIG_FILE.backup
```

### Step 4: Edit config
```bash
nano /etc/nginx/sites-enabled/YOUR_CONFIG_FILE
```

### Step 5: Add CORS headers
Find the `location /api/ {` section and add these lines inside it (after the proxy settings):

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

Save: `Ctrl+X`, then `Y`, then `Enter`

### Step 6: Test and reload
```bash
nginx -t
systemctl reload nginx
systemctl status nginx
```

---

## 🎯 Which Option Should You Use?

| Option | Best For | Time |
|--------|----------|------|
| **Option 1** (Auto script) | Quick fix | 5 min |
| **Option 2** (Manual upload) | More control | 7 min |
| **Option 3** (Fully manual) | Understanding each step | 10 min |

---

## 📚 Files Created for You

All these files are in your project:

| File | Location | Purpose |
|------|----------|---------|
| **UPLOAD-AND-FIX-NGINX.sh** | Project root | Run from Mac to auto-upload and fix |
| **backend/deploy-nginx-cors-fix.sh** | Backend folder | Deployment script (runs on VPS) |
| **backend/nginx-cors-config.conf** | Backend folder | CORS config reference |

---

## ✅ What to Do Right Now

**Recommended**: Use Option 1 (simplest)

```bash
# From your Mac Terminal, in project root:
chmod +x UPLOAD-AND-FIX-NGINX.sh
./UPLOAD-AND-FIX-NGINX.sh
```

Then follow the prompts. It will SSH into your VPS automatically and guide you through the fix.

---

## 🎉 After Deployment

Test it:
1. Go to https://workforcedemocracyproject.org
2. Open console (F12)
3. Click "Get Started"
4. Try registration
5. **Expected**: No CORS errors! 🎉

---

**💡 Pro Tip**: The Nginx config file is on the VPS because Nginx runs on the VPS (it's the reverse proxy that sits in front of your Node.js backend). That's why we need to edit it on the server, not in your local backend folder.
