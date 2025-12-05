# 🆘 Community Support Feature - Quick Fix Guide

## 🎯 Problem Summary

**What's broken:**  
When you enter a postcode in the "Find Community Support" section, you get error:  
> "Unable to reach community services database"

**Root cause:**  
Backend server missing the nonprofit API endpoints.

---

## ✅ Quick Deploy (3 Steps)

### 1️⃣ Upload Script (From Mac)
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/"
scp 'DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh' root@185.193.126.13:/tmp/
```

### 2️⃣ Execute (On VPS)
```bash
chmod +x /tmp/DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh
/tmp/DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh
```

### 3️⃣ Test
1. Go to homepage
2. Scroll to "Find Community Support"
3. Enter ZIP: `10001`
4. Click "Search My State"
5. Should show nonprofit organizations ✅

---

## 📋 What Gets Fixed

✅ Adds `/api/nonprofits/search` endpoint  
✅ Adds `/api/nonprofits/:ein` endpoint  
✅ Connects to ProPublica nonprofit database  
✅ Users can find local:
- Food banks
- Legal aid organizations  
- Healthcare clinics
- Housing assistance
- Mental health services
- Workers' rights groups

---

## 📊 Expected Results After Deploy

**Before (broken):**
```
User enters ZIP → Error: "Unable to reach community services database"
```

**After (fixed):**
```
User enters ZIP → Shows list of local nonprofits with:
  • Organization name
  • Location (city, state, ZIP)
  • Revenue information
  • Links to details
```

---

## 📁 Files Created

- `DEPLOY-COMMUNITY-SUPPORT-FIX-v37.8.4.sh` - Deployment script
- `COMMUNITY-SUPPORT-FIX-README.md` - Detailed documentation

---

## ⏱️ Deployment Time

**Total:** ~2 minutes  
- Upload: 10 seconds  
- Execution: 30 seconds  
- PM2 restart: 5 seconds  
- Verification: 1 minute  

---

## 🔍 Quick Verification

After deployment, check:
```bash
# On VPS
pm2 logs backend --lines 20
```

Should see:
```
✅ Connected to PostgreSQL database
ℹ️  CORS handled by Nginx reverse proxy
🚀 Backend server running on port 3001
```

---

## 🆘 If Something Goes Wrong

**Restore backup:**
```bash
cd /var/www/workforce-democracy/backend
ls -lt server.js.backup-*
cp server.js.backup-LATEST server.js
pm2 restart backend
```

---

**Ready to deploy?** 🚀

Run the commands above and the community support feature will work!
