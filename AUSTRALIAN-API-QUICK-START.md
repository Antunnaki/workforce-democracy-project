# 🇦🇺 Australian API - Quick Start Guide

## ✅ **You Got the API Key!**

**Your Key**: `CcmWo6CZ9gvhFUYiPtFeNiiw`  
**Status**: Active and ready to use  
**Type**: Non-commercial (perfect for your project)

---

## 🚀 **3-Step Deployment**

### 1️⃣ Upload Files to VPS

```bash
# SSH into VPS
ssh root@workforcedemocracyproject.org

# Go to backend directory
cd /var/www/workforce-democracy/backend/

# Upload australian-parliament-api.js
# (Copy content from workspace file)
```

### 2️⃣ Add API Key to .env

```bash
# Edit .env
nano /var/www/workforce-democracy/backend/.env

# Add this line:
OPENAUSTRALIA_API_KEY=CcmWo6CZ9gvhFUYiPtFeNiiw

# Save: Ctrl+X, Y, Enter
```

### 3️⃣ Update Existing Files & Restart

```bash
# Update government-apis.js (add Australian imports)
# Update server.js (add Australian query detection)

# Restart backend
/opt/nodejs/bin/pm2 restart workforce-democracy-backend

# Check logs
/opt/nodejs/bin/pm2 logs --lines 20
```

---

## ✅ **Test It Works**

Visit your site and ask:
- "Tell me about Anthony Albanese"
- "What is Peter Dutton's voting record?"
- "Adam Bandt climate change policy"

**Expected**: Detailed response with Australian MP data + voting records

---

## 📦 **Files Created**

### New (1 file)
- `backend/australian-parliament-api.js` - OpenAustralia.org integration

### Modified (2 files)
- `backend/government-apis.js` - Import Australian functions
- `backend/server.js` - Detect Australian queries

---

## 🎯 **What It Does**

- ✅ Search Australian MPs and Senators by name
- ✅ Get voting records (divisions)
- ✅ Search Hansard (parliamentary debates)
- ✅ Policy position analysis
- ✅ Automatic detection of Australian queries
- ✅ Web search fallback for context

---

## 🔐 **Privacy**

- ✅ OpenAustralia.org: Non-profit, no tracking
- ✅ API key stored server-side only
- ✅ No Big Tech dependencies
- ✅ Open source project

---

## 📖 **Full Documentation**

See `DEPLOY-AUSTRALIAN-API-V36.9.md` for complete deployment guide with:
- Step-by-step VPS deployment
- Troubleshooting tips
- API endpoint details
- Testing procedures
- Example queries

---

## 🎉 **Result**

Your Workforce Democracy Project now supports **Australian federal parliament** with the same quality as US coverage! 🇦🇺

**Better than US**: OpenAustralia.org API is active (ProPublica Congress API discontinued)

---

**Ready to deploy?** Follow the 3 steps above! 🚀
