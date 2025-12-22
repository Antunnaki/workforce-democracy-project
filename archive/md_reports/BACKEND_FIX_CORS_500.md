# 🚨 URGENT: Backend CORS 500 Error Fix

## 🐛 Problem
Backend is returning **500 Internal Server Error** on CORS preflight (OPTIONS) requests, preventing Representatives chat from working.

**Error in Browser**:
```
Preflight response is not successful. Status code: 500
Fetch API cannot load https://api.workforcedemocracyproject.org/api/chat/query due to access control checks.
```

---

## 🔍 Root Cause
The `/api/chat/query` endpoint is crashing on OPTIONS requests (CORS preflight checks) instead of returning a proper 200 OK response.

---

## 🔧 Fix Instructions

### **Step 1: SSH into VPS**
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
```

---

### **Step 2: Check Current OPTIONS Handler**

```bash
grep -n "app.options" server.js
```

**Expected**: Should show OPTIONS handler for `/api/chat/query`  
**If not found**: That's the problem!

---

### **Step 3: Check Server Logs for 500 Error**

```bash
pm2 logs workforce-backend --lines 100 | grep -A 5 "OPTIONS"
```

Look for error messages when OPTIONS request comes in. Copy any errors you see.

---

### **Step 4: Add/Fix OPTIONS Handler**

Open server.js:
```bash
nano server.js
```

**Find the section with CORS middleware** (should be near the top, around line 40-60).

**Make sure you have this**:
```javascript
// Handle preflight requests for all routes
app.options('*', cors(corsOptions));
```

**Or more specifically for the chat endpoint**:
```javascript
// CORS preflight for chat endpoint
app.options('/api/chat/query', cors(corsOptions));
```

---

### **Step 5: Verify CORS Configuration**

In `server.js`, find the `corsOptions` object. It should look like this:

```javascript
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://workforcedemocracyproject.org',
            'https://www.workforcedemocracyproject.org',
            'http://localhost:3000',
            'http://localhost:8080',
            'http://127.0.0.1:3000'
        ];
        
        // Allow requests with no origin (like mobile apps or Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('⚠️ Blocked request from unauthorized origin:', origin);
            callback(null, false); // Don't throw error, just deny
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};
```

**Key points**:
- ✅ `optionsSuccessStatus: 200` must be set
- ✅ `methods` must include `OPTIONS`
- ✅ Origin callback should NOT throw errors (use `callback(null, false)` instead)

---

### **Step 6: Check the /api/chat/query Route**

Find the POST route in server.js:
```bash
grep -n "app.post.*chat.*query" server.js
```

Make sure it's defined AFTER the CORS middleware and OPTIONS handler:

```javascript
// CORS middleware (must be early)
app.use(cors(corsOptions));

// Handle OPTIONS preflight
app.options('*', cors(corsOptions));

// Then your routes
app.post('/api/chat/query', async (req, res) => {
    // ... your code
});
```

---

### **Step 7: Common Issues to Check**

#### **Issue A: Error in Route Handler**
If your `/api/chat/query` route has an error in the code, it might crash on OPTIONS too.

**Check for**:
- Syntax errors
- Missing `try/catch` blocks
- Undefined variables

#### **Issue B: Middleware Crashing**
If middleware runs before the OPTIONS handler, it might crash.

**Check for**:
- Body parser trying to parse OPTIONS requests
- Authentication middleware running on OPTIONS

**Fix**: Add OPTIONS handler BEFORE other middleware:
```javascript
app.options('*', cors(corsOptions)); // First!
app.use(express.json()); // Then other middleware
```

#### **Issue C: Database Connection**
OPTIONS requests shouldn't need database, but if db is down it might cause 500.

**Check**:
```bash
systemctl status postgresql
```

---

### **Step 8: Restart Backend**

After making changes:
```bash
# Save file (Ctrl+X, Y, Enter)

# Test syntax
node -c server.js

# Restart
pm2 restart workforce-backend

# Watch logs
pm2 logs workforce-backend --lines 50
```

---

### **Step 9: Test from Frontend**

In your browser console, run:
```javascript
fetch('https://api.workforcedemocracyproject.org/api/chat/query', {
    method: 'OPTIONS',
    headers: {
        'Origin': 'https://workforcedemocracyproject.org',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
    }
}).then(r => console.log('OPTIONS status:', r.status, r.ok))
```

**Expected**: `OPTIONS status: 200 true`  
**Currently**: `OPTIONS status: 500 false`

---

## 🚨 Quick Fix (If Uncertain)

If you're not sure what's wrong, add this RIGHT AFTER the CORS middleware in server.js:

```javascript
// CORS middleware
app.use(cors(corsOptions));

// ===== ADD THIS BLOCK =====
// Explicit OPTIONS handler for all routes (must be before other routes)
app.options('*', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});
// ===== END BLOCK =====

// Then your routes below...
```

This manually handles ALL OPTIONS requests with 200 OK before any routes can crash.

---

## 📊 Verification Steps

### **1. Check PM2 Logs**
```bash
pm2 logs workforce-backend
```

Send a test query from frontend, look for:
- ✅ OPTIONS request logged with 200 status
- ✅ POST request logged with chat query
- ❌ Any 500 errors or stack traces

### **2. Check with curl**
```bash
curl -X OPTIONS https://api.workforcedemocracyproject.org/api/chat/query \
  -H "Origin: https://workforcedemocracyproject.org" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -i
```

**Expected**: 
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://workforcedemocracyproject.org
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

**Currently**: Probably shows 500

---

## 🎯 After Fix Works

Once OPTIONS returns 200, the Representatives chat will:
1. ✅ Successfully query backend
2. ✅ Get real voting record data from AI
3. ✅ Display with typewriter effect
4. ✅ No more generic fallback messages

---

## 📞 Need Help?

Copy and paste:
1. Output from `pm2 logs` when you send a test query
2. Output from the `curl` command above
3. The CORS configuration section from your server.js

And I'll tell you exactly what to fix!

---

**Priority**: HIGH - This is blocking all Representatives chat functionality  
**Estimated Fix Time**: 5-10 minutes once you identify the issue  
**Risk**: Low - just fixing OPTIONS handler, won't break anything
