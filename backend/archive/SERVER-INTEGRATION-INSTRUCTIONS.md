# 🔧 Server.js Integration Instructions

**File**: `/var/www/workforce-democracy/backend/server.js`  
**Task**: Add RSS proxy endpoint route  
**Time**: 2 minutes

---

## 📝 Instructions

### Step 1: Open server.js

```bash
cd /var/www/workforce-democracy/backend
nano server.js
```

---

### Step 2: Find the Routes Section

**Look for** existing route definitions. They usually look like:

```javascript
// Chat endpoint
app.post('/api/chat/query', async (req, res) => {
    // ... code ...
});

// Government APIs
app.use('/api/government', governmentAPIs);

// Add your other routes here...  ← FIND THIS AREA
```

**OR** look for comments like:
- `// API Routes`
- `// Add routes here`
- `// External API integrations`

---

### Step 3: Add the RSS Proxy Route

**Add these lines** in the routes section:

```javascript
// =============================================================================
// RSS PROXY FOR NEWS FEED (v1.0.0 - 2025-11-13)
// =============================================================================
// Proxies RSS feeds to bypass CORS restrictions for news aggregator
// Endpoint: /api/rss/proxy?url=<rss-feed-url>
// See: backend/rss-proxy-endpoint.js for implementation
app.use('/api/rss', require('./rss-proxy-endpoint'));
```

---

### Step 4: Save and Exit

- Press `Ctrl+X`
- Press `Y` (yes, save changes)
- Press `Enter` (confirm filename)

---

### Step 5: Verify Syntax

**Test for syntax errors** before restarting:

```bash
node -c server.js
```

**Expected output**: (nothing = success!)

**If you see errors**, fix the syntax and try again.

---

### Step 6: Restart Server

```bash
/opt/nodejs/bin/pm2 restart 0
```

**Watch the logs** to confirm it loaded:

```bash
/opt/nodejs/bin/pm2 logs 0 --lines 20
```

**Look for**:
```
✅ RSS Proxy endpoint loaded
   📋 15 approved news sources
   ⏱️  Cache duration: 30 minutes
```

---

### Step 7: Test the Endpoint

**Health check** (from any machine):

```bash
curl https://api.workforcedemocracyproject.org/api/rss/health
```

**Expected response**:
```json
{
  "success": true,
  "service": "RSS Proxy",
  "version": "1.0.0",
  "status": "operational",
  "approved_domains": 15,
  "cache_duration": 1800
}
```

**Test actual RSS fetching**:

```bash
curl "https://api.workforcedemocracyproject.org/api/rss/proxy?url=https://www.democracynow.org/democracynow.rss"
```

**Expected**: XML content of the RSS feed

---

## 🎯 Where to Add It

### Option A: Near Other API Routes

**If you have**:
```javascript
app.use('/api/government', governmentAPIs);
app.use('/api/civic', civicRoutes);
```

**Add after them**:
```javascript
app.use('/api/government', governmentAPIs);
app.use('/api/civic', civicRoutes);
app.use('/api/rss', require('./rss-proxy-endpoint'));  // ← ADD HERE
```

---

### Option B: Near External Integrations

**If you have**:
```javascript
// External API integrations
const governmentAPIs = require('./government-apis');
const nonprofitProxy = require('./nonprofit-proxy');
```

**Add after**:
```javascript
// External API integrations
const governmentAPIs = require('./government-apis');
const nonprofitProxy = require('./nonprofit-proxy');
app.use('/api/rss', require('./rss-proxy-endpoint'));  // ← ADD HERE
```

---

### Option C: Before Error Handlers

**If you see**:
```javascript
// Error handling
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
```

**Add BEFORE error handlers**:
```javascript
app.use('/api/rss', require('./rss-proxy-endpoint'));  // ← ADD HERE

// Error handling (must be last)
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
```

---

## ⚠️ Important Notes

### 1. **Order Matters**
- Add **BEFORE** error handlers
- Add **AFTER** middleware (express.json(), etc.)

### 2. **One Line is All You Need**
```javascript
app.use('/api/rss', require('./rss-proxy-endpoint'));
```

That's it! Don't overcomplicate it.

### 3. **Restart is Required**
Changes to `server.js` require PM2 restart to take effect.

### 4. **Check Logs**
Always check PM2 logs after restart to confirm no errors.

---

## 🐛 Troubleshooting

### Issue: "Cannot find module './rss-proxy-endpoint'"

**Cause**: File not uploaded to VPS

**Fix**:
```bash
# From local machine
scp -P 22 backend/rss-proxy-endpoint.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Then restart
ssh root@185.193.126.13 -p 22
/opt/nodejs/bin/pm2 restart 0
```

---

### Issue: "Unexpected token" or syntax error

**Cause**: Typo in server.js

**Fix**: Check syntax
```bash
node -c /var/www/workforce-democracy/backend/server.js
```

Common mistakes:
- Missing semicolon
- Missing closing bracket
- Typo in filename

---

### Issue: Server won't restart

**Cause**: Syntax error or port conflict

**Fix**: Check detailed logs
```bash
/opt/nodejs/bin/pm2 logs 0 --err --lines 50
```

---

### Issue: 404 on /api/rss/health

**Cause**: Route not added or server not restarted

**Fix**: 
1. Verify line was added: `grep "rss-proxy" /var/www/workforce-democracy/backend/server.js`
2. Restart: `/opt/nodejs/bin/pm2 restart 0`
3. Check logs: `/opt/nodejs/bin/pm2 logs 0 --lines 20`

---

## ✅ Success Checklist

After adding the route:
- [ ] server.js syntax is valid (`node -c server.js`)
- [ ] PM2 restarted successfully
- [ ] Logs show "RSS Proxy endpoint loaded"
- [ ] Health check returns JSON response
- [ ] Test RSS fetch returns XML content
- [ ] No errors in PM2 logs

**All checked?** You're done! ✅

---

## 📖 Full Documentation

For complete deployment guide, see:
- `QUICK-START-NEWS-FEED.md` - Quick deployment
- `NEWS-FEED-VPS-DEPLOYMENT.md` - Full guide with troubleshooting

---

**That's it!** One line of code, restart PM2, and you're live! 🚀
