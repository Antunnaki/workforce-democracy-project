# 🚀 Workforce Democracy Project - Master Deployment Guide

**Version:** V37.16.4-CONTRAST-HOTFIX  
**Last Updated:** November 23, 2024  
**Status:** ✅ PRODUCTION READY

---

## 🚨 **CRITICAL: VERSION CONTROL SYSTEM** 🚨

**⚠️ MANDATORY READING BEFORE DEPLOYMENT ⚠️**

### **VERSION A vs VERSION B:**

| Version | Purpose | Location | Port | URL |
|---------|---------|----------|------|-----|
| **A** | Production (LIVE) | `/var/www/workforce-democracy/version-a/` | 3001 | workforcedemocracyproject.org |
| **B** | Testing (DEV) | `/var/www/workforce-democracy/version-b/` | 3002 | sxcrlfyt.gensparkspace.com |

### **GOLDEN RULES:**

```
✅ ALL CHANGES → VERSION B ONLY
❌ NEVER EDIT VERSION A DIRECTLY
✅ DEPLOY: ./deployment-scripts/sync-b-to-a.sh
❌ NO MANUAL FILE COPYING TO VERSION A
```

**📖 Complete Rules:** See `🚨-VERSION-CONTROL-RULES-🚨.md`

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Backend Deployment (VPS)](#backend-deployment-vps)
3. [Frontend Deployment (GenSpark)](#frontend-deployment-genspark)
4. [PM2 Commands Reference](#pm2-commands-reference)
5. [Troubleshooting](#troubleshooting)
6. [Environment Variables](#environment-variables)

---

## 🎯 Quick Start

### Prerequisites
- VPS Access: `root@185.193.126.13`
- Project Path: `/var/www/workforce-democracy`
- Backend Port: `3001` (NOT 3000)
- Frontend URL: `https://sxcrlfyt.gensparkspace.com/`
- Production URL: `https://workforcedemocracyproject.org/`

---

## 🖥️ Backend Deployment (VPS)

### OPTION A: One-Command Deployment

```bash
# SSH into VPS
ssh root@185.193.126.13

# Navigate to project
cd /var/www/workforce-democracy/backend

# Stop, flush, restart PM2
/opt/nodejs/bin/pm2 stop backend
/opt/nodejs/bin/pm2 delete backend
/opt/nodejs/bin/pm2 flush
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1
/opt/nodejs/bin/pm2 logs backend --lines 20
```

### OPTION B: Upload Individual Files (From Mac)

```bash
# From: ~/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.16.4/

# Upload backend files
scp backend/us-representatives.js root@185.193.126.13:/var/www/workforce-democracy/backend/us-representatives.js
scp backend/routes/civic-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/civic-routes.js

# Then restart PM2
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 restart backend
/opt/nodejs/bin/pm2 logs backend --lines 30
```

### Verify Backend Deployment

```bash
# Check PM2 status
/opt/nodejs/bin/pm2 status

# View logs
/opt/nodejs/bin/pm2 logs backend --lines 50

# Test API
curl "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061" | grep '"name"' | wc -l
# Expected: 15 (representatives after deduplication)
```

---

## 🌐 Frontend Deployment (GenSpark)

### Step 1: Publish in GenSpark

1. Click **"Publish Website"** button in GenSpark interface
2. Wait 60 seconds for deployment to complete
3. GenSpark will provide live URL

### Step 2: Clear Browser Cache

```bash
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R
```

### Step 3: Verify Frontend

1. Visit: `https://sxcrlfyt.gensparkspace.com/`
2. Test Representative Finder with ZIP `12061`
3. Expected results:
   - Found 15 Representatives
   - Purple-blue gradient header: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
   - Official photos (110px × 110px)
   - Contact buttons (phone, email, website)

---

## ⚙️ PM2 Commands Reference

### Basic Commands

```bash
# Start backend
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1

# Stop backend
/opt/nodejs/bin/pm2 stop backend

# Restart backend
/opt/nodejs/bin/pm2 restart backend

# Delete process
/opt/nodejs/bin/pm2 delete backend

# Clear logs and cache
/opt/nodejs/bin/pm2 flush

# View status
/opt/nodejs/bin/pm2 status

# View logs
/opt/nodejs/bin/pm2 logs backend
/opt/nodejs/bin/pm2 logs backend --lines 50
/opt/nodejs/bin/pm2 logs backend --err  # Error logs only
```

### Full Restart (Clears Cache)

```bash
/opt/nodejs/bin/pm2 stop backend
/opt/nodejs/bin/pm2 delete backend
/opt/nodejs/bin/pm2 flush
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1
/opt/nodejs/bin/pm2 logs backend --lines 20
```

---

## 🔧 Troubleshooting

### Issue: Backend shows 17 representatives instead of 15

**Cause:** Deduplication code not loaded  
**Solution:** Perform full PM2 flush

```bash
cd /var/www/workforce-democracy/backend
/opt/nodejs/bin/pm2 stop backend
/opt/nodejs/bin/pm2 delete backend
/opt/nodejs/bin/pm2 flush
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1
```

**Verify:** Look for these log messages:
```
🔄 [DEDUP] Removing duplicate: Charles E. Schumer
🔄 [DEDUP] Removing duplicate: Kirsten E. Gillibrand
✅ Found 15 total representatives (after deduplication)
```

### Issue: Changes not showing on live site

**Cause:** Browser cache or GenSpark not published  
**Solution:**

1. Confirm you clicked "Publish Website" in GenSpark
2. Wait 60 seconds
3. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows/Linux)
4. If still not working, try incognito/private browsing mode

### Issue: API returning empty results

**Cause:** Backend server offline or API keys expired  
**Solution:**

```bash
# Check if backend is running
ssh root@185.193.126.13
/opt/nodejs/bin/pm2 status

# If offline, restart
cd /var/www/workforce-democracy/backend
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1

# Check API keys in .env file
cat /var/www/workforce-democracy/backend/.env
```

### Issue: Console shows 429 errors (Rate Limiting)

**Cause:** Too many requests to external APIs (Congress.gov, OpenStates)  
**Impact:** Bills analysis may fail, but Representatives finder should work  
**Solution:** These are background errors - wait 10-15 minutes before retrying

### Issue: Header text is unreadable

**Status:** FIXED in V37.16.4  
**Solution:** Deploy latest frontend with improved contrast:
- Font weight upgraded to 900
- Double-layer text shadows
- Better color contrast

---

## 🔐 Environment Variables

### Backend .env File

Located at: `/var/www/workforce-democracy/backend/.env`

```bash
# Server
NODE_ENV=production
PORT=3001
BACKEND_URL=https://api.workforcedemocracyproject.org

# Database
MONGO_URI=mongodb://localhost:27017/workforce-democracy

# API Keys
CONGRESS_API_KEY=your_congress_api_key_here
OPENSTATES_API_KEY=your_openstates_api_key_here
GROQ_API_KEY=your_groq_api_key_here

# CORS
ALLOWED_ORIGINS=https://workforcedemocracyproject.org,https://sxcrlfyt.gensparkspace.com
```

### Important Notes

- **PORT must be 3001** (not 3000)
- Update ALLOWED_ORIGINS if deploying to new domain
- Keep API keys secure and never commit to Git

---

## 📊 Current Version Status

### V37.16.4-CONTRAST-HOTFIX (November 23, 2024)

**Backend Changes:**
- ✅ Deduplication fix (15 representatives instead of 17)
- ✅ Removed duplicate senators (Schumer, Gillibrand)

**Frontend Changes:**
- ✅ Improved header contrast (font-weight: 900, double text-shadow)
- ✅ Updated purple-blue gradient: `#667eea` to `#764ba2`
- ✅ Fixed CSS/HTML ID mismatch (#civicResults vs #searchResults)

**Deployment Status:**
- ✅ Backend: DEPLOYED to VPS
- ⏳ Frontend: AWAITING GenSpark Publish

---

## 📞 Support

For issues or questions:
1. Check this deployment guide first
2. Review console logs: `/opt/nodejs/bin/pm2 logs backend`
3. Test API directly: `curl https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061`

---

**Last Deployment:** V37.16.4-CONTRAST-HOTFIX  
**Next Steps:** Click "Publish Website" in GenSpark to deploy frontend changes
