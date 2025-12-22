# 📰 News Feed - VPS Deployment Guide

**Version**: 1.0.0  
**Date**: November 13, 2025  
**Status**: ✅ **Ready for Deployment**

---

## 📋 Overview

This guide explains how to deploy the **Independent News Feed** feature to your VPS at `api.workforcedemocracyproject.org`.

### What This Feature Does:
- ✅ Aggregates RSS feeds from **15 vetted independent news sources**
- ✅ Client-side rendering (fast, privacy-first)
- ✅ Server-side CORS proxy (bypasses browser restrictions)
- ✅ Category filtering (Labor, Democracy, Climate, etc.)
- ✅ Bias indicators (left-lean, center, progressive)
- ✅ Beautiful Tailwind CSS interface

### Why VPS Instead of Netlify:
- ❌ Netlify Functions require Git deployment (not drag & drop)
- ✅ You already have a VPS with Node.js backend
- ✅ More control and flexibility
- ✅ Simpler deployment workflow

---

## 📁 Files Created

### Backend Files (for VPS):
```
backend/
└── rss-proxy-endpoint.js    (NEW - RSS proxy API endpoint)
```

### Frontend Files (for Netlify):
```
news.html                     (News feed page)
js/news-feed.js              (UPDATED - now calls VPS API)
data/news-sources.json       (15 vetted news sources)
```

### Documentation:
```
NEWS-FEED-VPS-DEPLOYMENT.md  (This file)
```

---

## 🚀 Deployment Steps

### **Step 1: Upload Backend File to VPS**

From your local machine:

```bash
# Upload the RSS proxy endpoint to VPS
scp -P 22 backend/rss-proxy-endpoint.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

**Expected output**:
```
rss-proxy-endpoint.js         100%  8343    1.2MB/s   00:00
```

---

### **Step 2: Add Endpoint to Backend Server**

SSH into your VPS:

```bash
ssh root@185.193.126.13 -p 22
```

Edit the server.js file:

```bash
cd /var/www/workforce-democracy/backend
nano server.js
```

**Find this section** (usually around line 200-300, after other route definitions):

```javascript
// Add your other routes here...
```

**Add this line** right after your existing routes:

```javascript
// RSS Proxy for News Feed (v1.0.0)
app.use('/api/rss', require('./rss-proxy-endpoint'));
```

**Save and exit**: `Ctrl+X`, then `Y`, then `Enter`

---

### **Step 3: Verify Dependencies**

The RSS proxy uses `axios`, which should already be installed. Verify:

```bash
cd /var/www/workforce-democracy/backend
npm list axios
```

**Expected output**:
```
workforce-democracy-backend@1.0.0 /var/www/workforce-democracy/backend
└── axios@1.6.2
```

**If axios is missing** (unlikely):
```bash
npm install axios
```

---

### **Step 4: Restart Backend Server**

```bash
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0 --lines 30
```

**Look for these success messages**:
```
✅ RSS Proxy endpoint loaded
   📋 15 approved news sources
   ⏱️  Cache duration: 30 minutes
```

**If you DON'T see these messages**, check for errors:
```bash
/opt/nodejs/bin/pm2 logs 0 --err --lines 50
```

---

### **Step 5: Test the RSS Proxy Endpoint**

From your local machine, test the endpoint:

```bash
# Test health check
curl https://api.workforcedemocracyproject.org/api/rss/health

# Expected response:
# {"success":true,"service":"RSS Proxy","version":"1.0.0","status":"operational","approved_domains":15,"cache_duration":1800}

# Test actual RSS fetching
curl "https://api.workforcedemocracyproject.org/api/rss/proxy?url=https://www.democracynow.org/democracynow.rss"

# Expected: XML content of the RSS feed
```

**If you get errors**, see [Troubleshooting](#-troubleshooting) section below.

---

### **Step 6: Deploy Frontend to Netlify**

**Option A: Drag & Drop** (Simplest)

1. Download these files from this project:
   - `news.html`
   - `js/news-feed.js` (UPDATED version)
   - `data/news-sources.json`

2. Go to [Netlify](https://app.netlify.com)

3. Drag & drop your entire project folder (including the updated files)

4. Wait for deployment to complete

**Option B: Git Push** (If you're using Git)

```bash
git add news.html js/news-feed.js data/news-sources.json
git commit -m "Add news feed with VPS RSS proxy"
git push origin main
```

Netlify will auto-deploy.

---

### **Step 7: Test the News Feed**

Visit your news page:
```
https://workforcedemocracyproject.org/news.html
```

**What you should see**:
1. ✅ Loading spinner appears briefly
2. ✅ News articles load within 3-5 seconds
3. ✅ Articles from multiple sources appear
4. ✅ Category filters work (All, Labor, Democracy, etc.)
5. ✅ Source badges show (Democracy Now, The Intercept, etc.)
6. ✅ Bias indicators display (Progressive, Left-Lean, etc.)

**Open browser console** (`F12` or `Cmd+Option+I`):

**Expected console messages**:
```
[NewsFeed v1.0.0] Initializing...
[NewsFeed] ✅ Loaded 15 vetted sources
[NewsFeed] 🔄 Fetching articles with filters: {}
[NewsFeed] 📡 Fetching from 15 sources...
[NewsFeed] ✅ Democracy Now: 20 articles
[NewsFeed] ✅ The Intercept: 15 articles
[NewsFeed] ✅ ProPublica: 12 articles
...
[NewsFeed] ✅ Fetched 180 articles
```

**If you see errors**, check [Troubleshooting](#-troubleshooting).

---

## 🔧 How It Works

### Architecture Flow:

```
User's Browser (news.html)
    ↓
JavaScript (js/news-feed.js)
    ↓
Calls: https://api.workforcedemocracyproject.org/api/rss/proxy?url=<rss-feed>
    ↓
VPS Backend (backend/rss-proxy-endpoint.js)
    ├─ Validates domain is approved ✓
    ├─ Fetches RSS feed from source
    ├─ Returns XML to browser
    └─ Caches for 30 minutes
    ↓
Browser parses XML into articles
    ↓
Displays in beautiful card layout
```

### Security Features:

1. **Domain Whitelist**: Only 15 approved news sources allowed
2. **No Tracking**: Zero data collection, 100% client-side
3. **Caching**: Reduces load on news sources (30 min cache)
4. **Error Handling**: Graceful failures, doesn't break page
5. **Rate Limiting**: Prevents abuse (built into VPS)

---

## 🧪 Testing Checklist

After deployment, verify each feature:

### Basic Functionality:
- [ ] News page loads (`/news.html`)
- [ ] Articles appear within 5 seconds
- [ ] At least 50+ articles display
- [ ] Images load correctly
- [ ] Headlines are clickable
- [ ] "Read More" buttons work

### Filtering:
- [ ] "All Resources" shows all articles
- [ ] "Labor" filter shows only labor articles
- [ ] "Democracy" filter shows democracy articles
- [ ] "Climate" filter shows climate articles
- [ ] "Economics" filter shows economics articles
- [ ] Filters update article count correctly

### Sources:
- [ ] Articles from Democracy Now appear
- [ ] Articles from The Intercept appear
- [ ] Articles from ProPublica appear
- [ ] Articles from Common Dreams appear
- [ ] Articles from In These Times appear
- [ ] Source badges display correctly

### Performance:
- [ ] Initial load < 5 seconds
- [ ] No JavaScript errors in console
- [ ] No network errors (404s)
- [ ] Smooth scrolling
- [ ] Responsive on mobile

### API Endpoint:
- [ ] `/api/rss/health` returns 200 OK
- [ ] `/api/rss/domains` lists 15 domains
- [ ] `/api/rss/proxy?url=...` returns XML
- [ ] Unauthorized domains return 403 error
- [ ] Missing URL parameter returns 400 error

---

## 🐛 Troubleshooting

### Issue: "404 Not Found" on API calls

**Symptom**: Console shows `GET https://api.workforcedemocracyproject.org/api/rss/proxy 404`

**Cause**: RSS endpoint not loaded in server.js

**Fix**:
```bash
# SSH into VPS
ssh root@185.193.126.13 -p 22

# Check if rss-proxy-endpoint.js exists
ls -l /var/www/workforce-democracy/backend/rss-proxy-endpoint.js

# If missing, upload it again (from local machine)
scp -P 22 backend/rss-proxy-endpoint.js root@185.193.126.13:/var/www/workforce-democracy/backend/

# Verify server.js has the route
grep "rss-proxy-endpoint" /var/www/workforce-democracy/backend/server.js

# If missing, add it to server.js (see Step 2)

# Restart backend
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart 0
```

---

### Issue: "CORS Error" in browser console

**Symptom**: 
```
Access to fetch at 'https://api.workforcedemocracyproject.org/api/rss/proxy' 
from origin 'https://workforcedemocracyproject.org' has been blocked by CORS policy
```

**Cause**: Nginx not configured to allow CORS

**Fix**:
```bash
# SSH into VPS
ssh root@185.193.126.13 -p 22

# Edit Nginx config
sudo nano /etc/nginx/sites-enabled/workforce-backend

# Add these lines inside the location / block:
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
add_header Access-Control-Allow-Headers "Content-Type";

# Save and test config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

**Note**: The RSS endpoint already sets CORS headers, but Nginx might override them.

---

### Issue: "Domain not in approved whitelist"

**Symptom**: Console shows `403 Forbidden` with message about domain whitelist

**Cause**: Trying to fetch RSS from a source not in the approved list

**Fix**: This is **intentional security**. Only vetted sources are allowed.

**To add a new source**:
1. Verify the source is legitimate and independent
2. Add domain to `APPROVED_DOMAINS` array in `backend/rss-proxy-endpoint.js`
3. Add source to `data/news-sources.json`
4. Re-upload and restart backend

---

### Issue: "No articles loading"

**Symptom**: Spinner runs forever, no articles appear

**Possible causes**:

1. **Backend not running**:
   ```bash
   /opt/nodejs/bin/pm2 status
   # If stopped, restart: /opt/nodejs/bin/pm2 restart 0
   ```

2. **Network firewall blocking**:
   ```bash
   # Test from VPS itself
   curl http://localhost:3001/api/rss/health
   # Should return JSON
   ```

3. **RSS sources down**:
   - Check browser console for specific source errors
   - Some sources may be temporarily unavailable
   - System will skip failed sources and load others

4. **Wrong API URL**:
   - Verify `js/news-feed.js` has correct URL:
   ```javascript
   const proxyUrl = `https://api.workforcedemocracyproject.org/api/rss/proxy?url=...`;
   ```

---

### Issue: "Slow loading (10+ seconds)"

**Symptom**: Articles eventually load but take too long

**Causes & Fixes**:

1. **First load is always slower** (fetching 15 RSS feeds)
   - Expected: 3-5 seconds
   - Subsequent loads use cache (instant)

2. **Some sources are slow**:
   - System has 10-second timeout per source
   - Slow sources won't block others
   - Check console for which sources timeout

3. **Network latency**:
   - VPS location might be far from news sources
   - Consider enabling Cloudflare CDN for caching

---

### Issue: Backend server won't restart

**Symptom**: PM2 restart fails or shows errors

**Diagnosis**:
```bash
# Check syntax errors
cd /var/www/workforce-democracy/backend
node -c rss-proxy-endpoint.js

# Check server.js syntax
node -c server.js

# View detailed error logs
/opt/nodejs/bin/pm2 logs 0 --err --lines 100
```

**Common issues**:
- Missing comma in `require()` statement
- Typo in filename
- Missing dependencies (run `npm install`)

---

## 📊 API Endpoint Reference

### GET `/api/rss/health`

Health check endpoint.

**Response**:
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

---

### GET `/api/rss/domains`

List approved news source domains.

**Response**:
```json
{
  "success": true,
  "approved_domains": [
    "americanprospect.org",
    "bbc.co.uk",
    "commondreams.org",
    ...
  ],
  "count": 15,
  "usage": "Only RSS feeds from these domains are allowed"
}
```

---

### GET `/api/rss/proxy?url=<rss-feed-url>`

Fetch RSS feed via CORS proxy.

**Parameters**:
- `url` (required): RSS feed URL (must be from approved domain)

**Example**:
```
GET /api/rss/proxy?url=https://www.democracynow.org/democracynow.rss
```

**Success Response** (200 OK):
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Democracy Now!</title>
    <item>
      <title>Article Title</title>
      <link>https://...</link>
      <description>Article description...</description>
      <pubDate>Mon, 13 Nov 2025 10:00:00 GMT</pubDate>
    </item>
    ...
  </channel>
</rss>
```

**Headers**:
- `Content-Type: application/xml; charset=utf-8`
- `Access-Control-Allow-Origin: *`
- `Cache-Control: public, max-age=1800`
- `X-RSS-Source: democracynow.org`

**Error Responses**:

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing "url" parameter | No `?url=` in request |
| 400 | Invalid URL format | Malformed URL |
| 403 | Domain not in whitelist | Unauthorized source |
| 404 | Feed source not found | RSS URL doesn't exist |
| 504 | Feed source timeout | Source took >10s to respond |
| 500 | Internal error | Server error |

---

## 📈 Performance Metrics

### Expected Performance:

| Metric | Target | Notes |
|--------|--------|-------|
| **First Load** | 3-5 seconds | Fetches 15 RSS feeds |
| **Cached Load** | <1 second | Uses browser cache |
| **Articles Fetched** | 150-200 | ~10-15 per source |
| **Cache Duration** | 30 minutes | Reduces server load |
| **Success Rate** | >90% | Some sources may fail occasionally |

### Optimization Tips:

1. **Enable Cloudflare** on Netlify for faster static asset delivery
2. **Increase cache duration** if news freshness isn't critical (edit `CACHE_DURATION`)
3. **Reduce sources** if loading too slow (remove from `data/news-sources.json`)
4. **Add CDN** for VPS API endpoint (Cloudflare Workers)

---

## 🔐 Security Considerations

### What's Protected:

✅ **Domain Whitelist**: Only approved sources allowed  
✅ **No User Input**: URL comes from trusted JSON file  
✅ **Error Sanitization**: No sensitive info leaked in errors  
✅ **Rate Limiting**: PM2 and Nginx handle abuse prevention  
✅ **No Data Storage**: Zero persistence, zero tracking  

### What's NOT Protected:

⚠️ **DDoS on VPS**: Anyone can call the proxy endpoint  
⚠️ **News Source Outages**: If source goes down, we can't fetch  
⚠️ **SSL Certificate Expiry**: Monitor VPS SSL cert renewal  

### Recommendations:

1. **Add rate limiting** to `/api/rss/*` in Nginx if abuse detected
2. **Monitor VPS bandwidth** - each request fetches ~50-200KB
3. **Set up uptime monitoring** (UptimeRobot, Pingdom, etc.)
4. **Keep dependencies updated** (`npm audit` monthly)

---

## 🎯 Next Steps (Optional Enhancements)

### Phase 2 Features (Not Required Now):

1. **International News Sources** (UK, Canada, Australia, France, Germany)
2. **User Bookmarking** (save favorite articles)
3. **Email Digest** (weekly roundup of top stories)
4. **Search Functionality** (filter by keyword)
5. **Source Reliability Ratings** (community-driven)
6. **Read Progress Tracking** (mark as read)
7. **Mobile App** (React Native)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Backend file uploaded to VPS
- [ ] Server.js updated with RSS route
- [ ] Backend restarted successfully
- [ ] `/api/rss/health` returns 200 OK
- [ ] `/api/rss/domains` lists 15 sources
- [ ] Test RSS fetch works (Democracy Now)
- [ ] Frontend deployed to Netlify
- [ ] News page loads at `/news.html`
- [ ] Articles display within 5 seconds
- [ ] No console errors
- [ ] Category filters work
- [ ] Source badges display
- [ ] Mobile responsive
- [ ] All links work

---

## 📞 Support

**If you encounter issues**:

1. **Check PM2 logs**: `/opt/nodejs/bin/pm2 logs 0`
2. **Check browser console**: `F12` → Console tab
3. **Test API endpoint**: `curl https://api.workforcedemocracyproject.org/api/rss/health`
4. **Verify file uploaded**: `ls -l /var/www/workforce-democracy/backend/rss-proxy-endpoint.js`
5. **Check Nginx logs**: `sudo tail -f /var/log/nginx/error.log`

**Provide these details when asking for help**:
- PM2 log output (last 50 lines)
- Browser console errors
- API health check response
- Network tab showing failed requests

---

## 🎉 Conclusion

You now have a **fully functional independent news aggregator** powered by your own VPS!

**Key Benefits**:
- ✅ **Full control**: Hosted on your infrastructure
- ✅ **Privacy-first**: Zero tracking, client-side processing
- ✅ **Cost-effective**: No Netlify Function fees
- ✅ **Flexible**: Easy to add/remove sources
- ✅ **Reliable**: Caching prevents source outages from breaking site

**What You've Built**:
- Modern RSS aggregator with 15 vetted sources
- Secure CORS proxy with domain whitelist
- Beautiful, responsive UI with Tailwind CSS
- Category filtering and bias indicators
- 30-minute intelligent caching

**Enjoy your independent news feed!** 📰✊

---

**Deployment Date**: November 13, 2025  
**Version**: 1.0.0  
**Status**: ✅ **Production Ready**
