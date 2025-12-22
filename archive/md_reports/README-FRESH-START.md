# 🚀 FRESH START - Citation Fix Deployment v37.4.1

## ⚠️ IMPORTANT: You Said You Want to Start Over

I'm creating a completely fresh package for you. Ignore ALL previous files and documentation.

---

## 📦 What's in This Package

This package contains **3 backend files** that fix the citation system:

1. **backend/ai-service.js** - Removed citation validator, increased sources to 10
2. **backend/rss-service.js** - Lowered relevance threshold, increased max sources
3. **backend/keyword-extraction.js** - Better keyword extraction for names

---

## 🎯 What These Fixes Do

**BEFORE (Current State on VPS):**
- ❌ Only showing 1 source for queries like "ron desantis"
- ❌ Citations [2]-[12] disappearing
- ❌ Wrong keywords extracted ("about" instead of "ron")

**AFTER (Once You Deploy):**
- ✅ Shows 5-10 sources
- ✅ ALL citations stay clickable
- ✅ Better keyword extraction

---

## 🚀 How to Deploy (3 Simple Steps)

### **Step 1: Upload Files**

From your **local machine**, navigate to wherever you download this folder and run:

```bash
scp backend/ai-service.js \
    backend/rss-service.js \
    backend/keyword-extraction.js \
    root@198.211.117.62:/var/www/workforce-democracy/backend/
```

**What to expect:** You'll see "100%" for each file

---

### **Step 2: Set File Ownership**

SSH into your VPS and run:

```bash
ssh root@198.211.117.62
cd /var/www/workforce-democracy/backend/
chown www-data:www-data ai-service.js rss-service.js keyword-extraction.js
```

---

### **Step 3: Restart Backend**

Still on the VPS, run:

```bash
pm2 delete backend
pm2 start server.js --name backend
pm2 save
```

**Verify it's running:**

```bash
pm2 status
```

You should see `backend │ online`

---

## ✅ How to Test

Open your browser and test:

```
https://workforce-democracy.com/?q=ron%20desantis
```

**You should see:**
- ✅ 5-10 news sources (not just 1)
- ✅ ALL citations [1] through [10] clickable
- ✅ No citations disappearing

---

## 📝 Version Information

- **Version:** v37.4.1
- **Date:** November 6, 2025
- **Purpose:** Fix citation system to show more sources and keep all citations clickable

---

## 🆘 If You Get Stuck

1. **Upload fails?** - Make sure you're in the correct directory where you downloaded this folder
2. **Permission denied?** - Make sure you're using `root@198.211.117.62`
3. **PM2 won't restart?** - Try `pm2 logs backend` to see what's wrong

---

## 📁 Files Included

```
backend/
├── ai-service.js (58 KB)
├── rss-service.js (27 KB)
└── keyword-extraction.js (16 KB)

README-FRESH-START.md (this file)
DEPLOY-COMMANDS.txt (copy-paste commands)
```

---

**That's it! Three steps and you're done.**
