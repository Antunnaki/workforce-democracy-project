# 📰 News Feed - Quick Start Guide

**Status**: ✅ Ready to deploy  
**Time Required**: ~10 minutes  
**Difficulty**: Easy (copy-paste commands)

---

## 🚀 Step-by-Step Deployment

### **Step 1: Upload Backend File** (2 minutes)

From your local machine:

```bash
scp -P 22 backend/rss-proxy-endpoint.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

---

### **Step 2: Add Route to Server** (3 minutes)

SSH into VPS:

```bash
ssh root@185.193.126.13 -p 22
cd /var/www/workforce-democracy/backend
nano server.js
```

**Find a line that looks like**:
```javascript
// Add your other routes here...
```

**Add this line right after it**:
```javascript
// RSS Proxy for News Feed (v1.0.0)
app.use('/api/rss', require('./rss-proxy-endpoint'));
```

**Save**: `Ctrl+X`, `Y`, `Enter`

---

### **Step 3: Restart Backend** (1 minute)

```bash
/opt/nodejs/bin/pm2 restart 0
/opt/nodejs/bin/pm2 logs 0 --lines 20
```

**Look for**:
```
✅ RSS Proxy endpoint loaded
   📋 15 approved news sources
```

---

### **Step 4: Test API** (1 minute)

From your local machine:

```bash
curl https://api.workforcedemocracyproject.org/api/rss/health
```

**Expected**:
```json
{"success":true,"service":"RSS Proxy","version":"1.0.0","status":"operational"}
```

---

### **Step 5: Deploy Frontend to Netlify** (3 minutes)

**Drag & Drop** these files to Netlify:
- `news.html`
- `js/news-feed.js` (UPDATED - calls VPS now)
- `data/news-sources.json`
- All other existing files

**OR** if using Git:
```bash
git add news.html js/news-feed.js data/news-sources.json backend/rss-proxy-endpoint.js
git commit -m "Add news feed with VPS backend"
git push origin main
```

---

### **Step 6: Test Live Site** (1 minute)

Visit: `https://workforcedemocracyproject.org/news.html`

**Expected**:
- ✅ News articles load within 5 seconds
- ✅ Multiple sources appear
- ✅ Category filters work
- ✅ No console errors

---

## ✅ Success Checklist

- [ ] Backend file uploaded
- [ ] Route added to server.js
- [ ] Backend restarted successfully
- [ ] API health check returns OK
- [ ] Frontend deployed to Netlify
- [ ] News page loads articles
- [ ] No errors in browser console

---

## 🐛 Quick Troubleshooting

**Problem**: API returns 404
- **Fix**: Make sure you added the route to `server.js` and restarted PM2

**Problem**: CORS error
- **Fix**: Already handled by the endpoint - clear browser cache and try again

**Problem**: No articles loading
- **Fix**: Check browser console for specific errors, verify API health endpoint works

---

## 📖 Full Documentation

See `NEWS-FEED-VPS-DEPLOYMENT.md` for:
- Complete troubleshooting guide
- API endpoint reference
- Performance optimization tips
- Security considerations

---

**That's it!** Your independent news feed is live! 🎉
