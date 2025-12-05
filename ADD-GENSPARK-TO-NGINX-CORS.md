# 🚀 Add GenSpark Preview URL to Nginx CORS Whitelist

## 📋 **QUICK SUMMARY**

**Problem:** GenSpark preview (`https://sxcrlfyt.gensparkspace.com/`) is blocked by CORS when trying to access your backend API.

**Solution:** Add GenSpark URL to Nginx CORS whitelist on your VPS server.

**Time Required:** 5 minutes

---

## 🔐 **STEP 1: SSH INTO YOUR VPS**

Based on your VPS documentation, you have root access to:

```bash
ssh root@185.193.126.13
```

**Password:** [Use your VPS root password]

**Expected Result:**
```
root@Workforce-Backend:~#
```

---

## 📝 **STEP 2: BACKUP CURRENT NGINX CONFIG**

Safety first! Always backup before making changes:

```bash
sudo cp /etc/nginx/sites-available/api.workforcedemocracyproject.org \
       /etc/nginx/sites-available/api.workforcedemocracyproject.org.backup-$(date +%Y%m%d-%H%M%S)
```

**Verify backup created:**
```bash
ls -lh /etc/nginx/sites-available/ | grep backup
```

---

## 🔧 **STEP 3: EDIT NGINX CONFIGURATION**

Open the Nginx config file:

```bash
sudo nano /etc/nginx/sites-available/api.workforcedemocracyproject.org
```

---

## 📖 **STEP 4: LOCATE CURRENT CORS SECTION**

**Look for this section** (usually around lines 40-60):

```nginx
# CORS Headers
add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
```

---

## ✏️ **STEP 5: ADD ORIGIN MAPPING (BEFORE SERVER BLOCK)**

**Scroll to the TOP of the file**, and add this **BEFORE** the `server {` block:

```nginx
# Map to handle multiple allowed origins
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
}
```

**Example placement:**
```nginx
# Map to handle multiple allowed origins
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
}

server {
    listen 443 ssl http2;
    server_name api.workforcedemocracyproject.org;
    
    # ... rest of config
```

---

## 🔄 **STEP 6: UPDATE CORS HEADER LINE**

**Find this line:**
```nginx
add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
```

**Replace with:**
```nginx
add_header 'Access-Control-Allow-Origin' $cors_origin always;
```

**⚠️ IMPORTANT:** You need to change this line in **TWO PLACES**:
1. Inside the main `server {}` block
2. Inside the `if ($request_method = 'OPTIONS')` block (if it exists)

**Example:**
```nginx
server {
    # CORS Headers (CHANGE #1)
    add_header 'Access-Control-Allow-Origin' $cors_origin always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle OPTIONS preflight
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;  # CHANGE #2
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

---

## 💾 **STEP 7: SAVE AND EXIT NANO**

1. Press `Ctrl + O` (save)
2. Press `Enter` (confirm filename)
3. Press `Ctrl + X` (exit)

---

## ✅ **STEP 8: TEST NGINX CONFIGURATION**

**Before reloading, test for syntax errors:**

```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

**If you see errors:**
- Re-open the file: `sudo nano /etc/nginx/sites-available/api.workforcedemocracyproject.org`
- Double-check your changes match the examples above
- Make sure you didn't accidentally delete any semicolons or brackets

---

## 🔄 **STEP 9: RELOAD NGINX**

**If the test passed, reload Nginx:**

```bash
sudo systemctl reload nginx
```

**Verify Nginx is still running:**
```bash
sudo systemctl status nginx
```

**Expected:** `Active: active (running)`

---

## 🧪 **STEP 10: TEST CORS FROM GENSPARK PREVIEW**

**On GenSpark preview** (`https://sxcrlfyt.gensparkspace.com/`):

1. Open browser **Developer Console** (F12)
2. Go to **Console** tab
3. Paste this test:

```javascript
fetch('https://api.workforcedemocracyproject.org/api/civic/llm-health')
    .then(r => r.json())
    .then(d => console.log('✅ CORS WORKING!', d))
    .catch(e => console.error('❌ CORS BLOCKED:', e));
```

**Expected Response:**
```json
{
  "success": true,
  "available": true,
  "model": "llama3-70b-8192",
  "provider": "Groq",
  "message": "LLM service is available"
}
```

---

## ✅ **VERIFICATION CHECKLIST**

After completing all steps:

- [ ] SSH'd into VPS (root@185.193.126.13)
- [ ] Created backup of Nginx config
- [ ] Added `map` directive before `server` block
- [ ] Changed CORS header to use `$cors_origin` variable (in 2 places)
- [ ] Saved file
- [ ] Ran `sudo nginx -t` (test passed)
- [ ] Ran `sudo systemctl reload nginx`
- [ ] Tested from GenSpark preview (CORS working)
- [ ] Tested from production URL (still working)

---

## 🔒 **SECURITY NOTE**

This configuration is secure because:
- ✅ Only **explicitly listed** origins are allowed
- ✅ Production URL still works: `https://workforcedemocracyproject.org`
- ✅ GenSpark preview now works: `https://sxcrlfyt.gensparkspace.com`
- ✅ All other origins are **blocked** (receive empty string)
- ✅ No wildcards that allow any domain

---

## 📋 **COMPLETE NGINX CONFIG REFERENCE**

Here's what your updated config should look like:

```nginx
# Map to handle multiple allowed origins
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
}

server {
    listen 443 ssl http2;
    server_name api.workforcedemocracyproject.org;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.workforcedemocracyproject.org/privkey.pem;

    # CORS Headers (using mapped origin)
    add_header 'Access-Control-Allow-Origin' $cors_origin always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Handle OPTIONS preflight
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' $cors_origin always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    # Proxy to Node.js backend
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

---

## 🔧 **TROUBLESHOOTING**

### Problem: "nginx: [emerg] invalid number of arguments in 'map'"

**Cause:** Map directive is inside server block instead of outside.

**Fix:** Move the `map` directive to **before** the `server {` line.

---

### Problem: "nginx: [emerg] unexpected '{'"

**Cause:** Missing semicolon or bracket.

**Fix:** Check all lines end with `;` and brackets are balanced.

---

### Problem: CORS still blocked after reload

**Cause:** Browser cache or Nginx didn't reload properly.

**Fix:**
```bash
# Hard restart Nginx
sudo systemctl restart nginx

# Clear browser cache (Ctrl + Shift + Delete)
# Try test again
```

---

### Problem: Production site stops working

**Cause:** Typo in production URL in map directive.

**Fix:** Check URL is exactly: `"https://workforcedemocracyproject.org"` (no trailing slash)

---

## 🚨 **ROLLBACK (IF SOMETHING GOES WRONG)**

If anything breaks, restore the backup:

```bash
# 1. Find your backup
ls -lh /etc/nginx/sites-available/ | grep backup

# 2. Restore it (replace TIMESTAMP with actual backup date)
sudo cp /etc/nginx/sites-available/api.workforcedemocracyproject.org.backup-TIMESTAMP \
       /etc/nginx/sites-available/api.workforcedemocracyproject.org

# 3. Test config
sudo nginx -t

# 4. Reload Nginx
sudo systemctl reload nginx
```

---

## 📞 **NEED HELP?**

If you run into issues:

1. **Show me the error:**
   - Copy/paste the exact error message from `sudo nginx -t`
   
2. **Show me the config:**
   - Run: `cat /etc/nginx/sites-available/api.workforcedemocracyproject.org`
   - Copy/paste the output (I'll spot the issue)

3. **Check Nginx logs:**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   ```

---

## 🎯 **WHAT THIS FIXES**

After this update:

✅ **Production URL** continues working: `https://workforcedemocracyproject.org`  
✅ **GenSpark preview** now works: `https://sxcrlfyt.gensparkspace.com`  
✅ **Backend API** accessible from both URLs  
✅ **Universal chat** can connect to backend from GenSpark  
✅ **All test fixes** can be fully tested before deploying to production  

---

## ⏭️ **AFTER TESTING IS COMPLETE**

Once you've finished testing on GenSpark and want to remove it from the whitelist:

```bash
sudo nano /etc/nginx/sites-available/api.workforcedemocracyproject.org
```

**Comment out or delete the GenSpark line:**
```nginx
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    # "https://sxcrlfyt.gensparkspace.com" $http_origin;  ← Comment out
}
```

**Then reload:**
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

**That's it! Your GenSpark preview will now have full backend access for testing. 🚀**
