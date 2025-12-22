# CORS Whitelist Update - Add GenSpark Preview URL

## 🚨 **ISSUE**

GenSpark preview URL is being blocked by CORS:

```
Origin https://sxcrlfyt.gensparkspace.com is not allowed by Access-Control-Allow-Origin
```

**Error in console:**
```
[Error] Origin https://sxcrlfyt.gensparkspace.com is not allowed by Access-Control-Allow-Origin. Status code: 200
[Error] Fetch API cannot load https://api.workforcedemocracyproject.org/api/civic/llm-health due to access control checks.
```

---

## ✅ **SOLUTION**

Add GenSpark preview URL to Nginx CORS whitelist on VPS.

---

## 📝 **VPS NGINX CONFIGURATION**

### **File Location:**
```
/etc/nginx/sites-available/api.workforcedemocracyproject.org
```

### **Current Allowed Origin:**
```nginx
add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
```

### **Updated Allowed Origins (Multiple):**

**Option A: Add GenSpark to allowed origins (Simple)**
```nginx
# Map to handle multiple origins
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
}

# In server block, replace fixed origin with mapped variable:
add_header 'Access-Control-Allow-Origin' $cors_origin always;
```

**Option B: Use regex pattern (Flexible - allows any GenSpark subdomain)**
```nginx
# Map to handle multiple origins with regex
map $http_origin $cors_origin {
    default "";
    "~^https://workforcedemocracyproject\.org$" $http_origin;
    "~^https://[a-z0-9]+\.gensparkspace\.com$" $http_origin;
}

# In server block:
add_header 'Access-Control-Allow-Origin' $cors_origin always;
```

---

## 🔧 **STEP-BY-STEP UPDATE**

### **Step 1: SSH to VPS**
```bash
ssh user@your-vps-ip
```

### **Step 2: Edit Nginx Config**
```bash
sudo nano /etc/nginx/sites-available/api.workforcedemocracyproject.org
```

### **Step 3: Find Current CORS Section**

Look for this section (around line 40-60):
```nginx
# CORS Headers
add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, PATCH, OPTIONS' always;
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
```

### **Step 4: Add Origin Mapping**

**Add this BEFORE the server block:**
```nginx
# Map to handle multiple allowed origins
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    "https://sxcrlfyt.gensparkspace.com" $http_origin;
}
```

**Modify CORS header line:**
```nginx
# OLD:
add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;

# NEW:
add_header 'Access-Control-Allow-Origin' $cors_origin always;
```

### **Step 5: Test Configuration**
```bash
sudo nginx -t
```

**Expected output:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### **Step 6: Reload Nginx**
```bash
sudo systemctl reload nginx
```

### **Step 7: Verify**

Test from your browser on GenSpark preview:
```javascript
// Open browser console and run:
fetch('https://api.workforcedemocracyproject.org/api/civic/llm-health')
    .then(r => r.json())
    .then(d => console.log('✅ CORS working!', d))
    .catch(e => console.error('❌ CORS still blocked:', e));
```

**Expected response:**
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

## 📋 **COMPLETE NGINX CONFIG EXAMPLE**

```nginx
# Map for multiple allowed origins
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

## 🧪 **TESTING CHECKLIST**

After updating Nginx configuration:

### **Test 1: Production URL (Should Still Work)**
```
URL: https://workforcedemocracyproject.org
Test: Send chat message
Expected: ✅ Works (CORS allowed)
```

### **Test 2: GenSpark Preview (Should Now Work)**
```
URL: https://sxcrlfyt.gensparkspace.com
Test: Send chat message
Expected: ✅ Works (CORS allowed)
```

### **Test 3: Random URL (Should Be Blocked)**
```
URL: https://example.com
Test: Try to call API
Expected: ❌ Blocked (CORS denied)
```

---

## 🔒 **SECURITY NOTE**

The map approach is secure because:
- ✅ Only explicitly listed origins are allowed
- ✅ Other origins receive empty string → CORS fails
- ✅ No wildcards (*) that allow any origin
- ✅ Each origin must match exactly

---

## ⚠️ **IMPORTANT**

**After GenSpark testing is complete**, you may want to:
1. Keep GenSpark URL in whitelist (for future testing)
2. OR remove it and only allow production URL

**To remove later:**
```nginx
# Remove GenSpark line from map:
map $http_origin $cors_origin {
    default "";
    "https://workforcedemocracyproject.org" $http_origin;
    # "https://sxcrlfyt.gensparkspace.com" $http_origin;  ← Comment out or delete
}
```

Then reload: `sudo systemctl reload nginx`

---

## 📞 **IF YOU NEED HELP**

If you're not comfortable editing Nginx config, send me:
1. Current Nginx config file (sanitized of sensitive info)
2. I'll provide exact line-by-line instructions
3. Or provide complete updated config file

---

**This will fix the CORS issue and allow full backend testing on GenSpark preview!** 🚀
