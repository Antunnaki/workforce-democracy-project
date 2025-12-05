# 🚀 YOUR PERSONALIZED DEPLOYMENT GUIDE - v37.11.6

**For:** Workforce Democracy Project  
**Your Setup:** Mac → VPS (185.193.126.13) + Netlify  
**Version:** v37.11.6-ENCRYPTION-FIX  
**Date:** January 19, 2025

---

## 📋 YOUR SYSTEM OVERVIEW

### Your Development Environment:
- **Local Machine:** Mac
- **Working Directory:** `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/`
- **Scripts Location:** `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files/`
- **GenSpark Chat:** Where you're reading this now (file editing environment)

### Your Production Servers:
1. **Backend (VPS):**
   - Server: `185.193.126.13`
   - Directory: `/var/www/workforce-democracy/backend/`
   - PM2 Process: `backend`
   - Port: 3001

2. **Frontend (Netlify):**
   - Site: https://workforcedemocracyproject.org
   - Deployment: Drag & drop or Git

---

## 🎯 YOUR TYPICAL WORKFLOW

Based on your previous sessions, here's what you usually do:

### For Backend Changes:
```bash
# 1. Download file from GenSpark
# 2. Navigate to your scripts folder
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"

# 3. Upload to VPS
scp "filename.js" root@185.193.126.13:/var/www/workforce-democracy/backend/

# 4. SSH into VPS
ssh root@185.193.126.13

# 5. Nuclear PM2 restart (your preferred method)
cd /var/www/workforce-democracy/backend/
pm2 stop backend && pm2 delete backend && pkill -9 node && sleep 3
pm2 start server.js --name backend && pm2 save

# 6. Verify
pm2 logs backend --lines 50
```

### For Frontend Changes:
1. Go to https://app.netlify.com/
2. Navigate to your site
3. Go to "Deploys" tab
4. Drag and drop project folder
5. Wait for deployment

---

## 🔧 FOR THIS SPECIFIC FIX (v37.11.6)

### What Needs to Be Deployed:

#### BACKEND (VPS):
**File:** `backend/routes/personalization.js`

**Your Steps:**
```bash
# 1. Download personalization.js from GenSpark

# 2. Navigate to scripts folder
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"

# 3. Upload to VPS
scp "personalization.js" root@185.193.126.13:/var/www/wdp-backend/routes/

# 4. SSH and restart
ssh root@185.193.126.13
pm2 restart wdp-backend
pm2 logs wdp-backend --lines 50
```

**OR Use The Automated Script:**
```bash
# 1. Download deploy-v37.11.6-backend.sh from GenSpark

# 2. Make executable and run
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"
chmod +x deploy-v37.11.6-backend.sh
./deploy-v37.11.6-backend.sh
```

#### FRONTEND (Netlify):
**File:** `js/personalization-system.js`

**Your Steps:**
1. Download the entire project folder from GenSpark (or just the updated `js/personalization-system.js`)
2. Go to https://app.netlify.com/
3. Navigate to your Workforce Democracy Project site
4. Click "Deploys" tab
5. Drag the project folder (or just drag the `js` folder)
6. Wait for build to complete (~1 minute)
7. Click "Open production deploy" to verify

---

## ⚡ QUICK REFERENCE COMMANDS

### SSH Access:
```bash
ssh root@185.193.126.13
```

### Navigate to Backend:
```bash
cd /var/www/workforce-democracy/backend/
# or for personalization:
cd /var/www/wdp-backend/
```

### Check PM2 Status:
```bash
pm2 list
pm2 logs backend --lines 50
pm2 logs wdp-backend --lines 50
```

### Nuclear Restart (Your Preferred Method):
```bash
pm2 stop backend && pm2 delete backend && pkill -9 node && sleep 3
pm2 start server.js --name backend && pm2 save
```

### Check File Contents on VPS:
```bash
# View file
cat /var/www/wdp-backend/routes/personalization.js | grep "iv"

# Search for specific content
grep -n "sessionPassword" /var/www/workforce-democracy/js/personalization-system.js
```

### Check MongoDB:
```bash
mongosh wdp
db.userbackups.find().pretty()
db.userbackups.findOne({username: "tester2"})
exit
```

---

## 🧪 YOUR TESTING WORKFLOW

Based on your previous sessions:

### Browser Console Testing:
```javascript
// Open console (F12) on https://workforcedemocracyproject.org

// Test 1: Register
PersonalizationSystem.register('tester3', 'Password123!');

// Test 2: Check data
localStorage.getItem('wdp_username');
PersonalizationSystem.getUserData();

// Test 3: Make change
const data = PersonalizationSystem.getUserData();
data.preferences.location = 'New York';
PersonalizationSystem.updateUserData(data);

// Test 4: Verify sync
// Should see: 🔄 Syncing to server... ✅ Sync complete
```

### Fire Button Test:
1. Use DuckDuckGo Fire Button
2. Or manually: DevTools → Application → Clear storage → Clear site data
3. Reload page (F5)
4. Should see: "Welcome back, tester3!"
5. Enter: "Password123!"
6. Should see: ✅ Session restored successfully!

---

## 📊 YOUR TYPICAL ISSUES & SOLUTIONS

### Issue 1: "Files edited but not showing on production"
**Solution:** Make sure you:
1. ✅ Downloaded the file from GenSpark
2. ✅ Uploaded to the correct VPS directory
3. ✅ Restarted PM2 (for backend) or redeployed (for frontend)
4. ✅ Cleared browser cache

### Issue 2: "PM2 restart doesn't pick up changes"
**Solution:** Use your nuclear restart:
```bash
pm2 stop backend && pm2 delete backend && pkill -9 node && sleep 3
pm2 start server.js --name backend && pm2 save
```

### Issue 3: "Changes work locally but not in production"
**Solution:** 
- Backend: Check you uploaded to `/var/www/wdp-backend/` not `/var/www/workforce-democracy/backend/`
- Frontend: Make sure Netlify deployment completed successfully

### Issue 4: "MongoDB not connected"
**Solution:**
```bash
ssh root@185.193.126.13
systemctl status mongod
# If not running:
systemctl start mongod
pm2 restart wdp-backend
```

---

## 🎯 FOR THIS SPECIFIC DEPLOYMENT

### Pre-Deployment Checklist:
- [ ] Read **👉-READ-THIS-FIRST-👈.md**
- [ ] Understand the bug fix (encryption sync issue)
- [ ] Have terminal open
- [ ] Have Netlify dashboard open
- [ ] Have GenSpark open to download files

### Backend Deployment Checklist:
- [ ] Download `backend/routes/personalization.js` from GenSpark
- [ ] Navigate to SH-Files directory
- [ ] Upload to VPS: `scp personalization.js root@185.193.126.13:/var/www/wdp-backend/routes/`
- [ ] SSH into VPS: `ssh root@185.193.126.13`
- [ ] Restart PM2: `pm2 restart wdp-backend`
- [ ] Check logs: `pm2 logs wdp-backend --lines 50`
- [ ] Verify no errors in logs

### Frontend Deployment Checklist:
- [ ] Download project folder from GenSpark (or just `js/personalization-system.js`)
- [ ] Go to https://app.netlify.com/
- [ ] Navigate to site → Deploys tab
- [ ] Drag & drop project folder
- [ ] Wait for "Published" status
- [ ] Clear browser cache
- [ ] Test on production site

### Post-Deployment Testing:
- [ ] Open https://workforcedemocracyproject.org
- [ ] Open browser console (F12)
- [ ] Run: `PersonalizationSystem.register('tester3', 'Password123!');`
- [ ] Verify: ✅ Registration successful
- [ ] Make a change: Update location
- [ ] Verify: 🔄 Syncing... ✅ Sync complete
- [ ] Use Fire Button (or clear all data)
- [ ] Reload page
- [ ] Verify: Password prompt appears
- [ ] Enter password
- [ ] Verify: ✅ Session restored successfully!

---

## 🚨 EMERGENCY ROLLBACK

If something breaks:

### Backend Rollback:
```bash
ssh root@185.193.126.13
cd /var/www/wdp-backend/routes/
# If you made a backup:
cp personalization.js.backup personalization.js
# OR download previous version and upload
pm2 restart wdp-backend
```

### Frontend Rollback:
1. Go to Netlify dashboard
2. Navigate to Deploys
3. Find previous successful deploy
4. Click "Publish deploy" on the old version

---

## 📞 QUICK HELP

### If Backend Won't Start:
```bash
ssh root@185.193.126.13
pm2 logs wdp-backend --err --lines 50
# Look for syntax errors or MongoDB connection issues
```

### If Frontend Shows Old Code:
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R
2. Clear cache: DevTools → Network → Disable cache
3. Verify Netlify shows "Published" status

### If Encryption Still Fails:
```bash
# Check MongoDB has encrypted data
ssh root@185.193.126.13
mongosh wdp
db.userbackups.findOne({username: "tester3"})
# encrypted_data should be long base64 string
# iv should be 64-char hex string
```

---

## 💡 TIPS FROM YOUR PREVIOUS SESSIONS

1. **Always use nuclear PM2 restart** - Your preferred method that always works
2. **Download files to SH-Files directory** - Keeps everything organized
3. **Check PM2 logs immediately after restart** - Catches errors early
4. **Test in browser console first** - Before announcing it's fixed
5. **Use Fire Button to test** - The real test of persistence

---

## 📚 RELATED DOCUMENTATION

For this specific fix:
- **👉-READ-THIS-FIRST-👈.md** - Overview and explanation
- **⚡-QUICK-DEPLOY-CARD-v37.11.6.txt** - One-page reference
- **DEPLOY-v37.11.6-ENCRYPTION-FIX.md** - Detailed technical deployment
- **VISUAL-FIX-EXPLANATION-v37.11.6.txt** - Visual diagrams

For general reference:
- **PROJECT_MASTER_GUIDE.md** - Complete project documentation
- **README.md** - Project overview and current status

---

## ✅ SUMMARY

**Your Typical Flow:**
```
GenSpark (edit) → Download → SH-Files → SCP upload → SSH → PM2 restart
                                        ↓
                                    Netlify (drag & drop)
                                        ↓
                                    Test in browser
```

**For This Fix:**
1. Backend: Upload `personalization.js` → Restart PM2
2. Frontend: Deploy to Netlify → Clear cache
3. Test: Register → Sync → Fire Button → Password → Success!

**Success Indicators:**
- ✅ Console: "✅ Registration successful"
- ✅ Console: "🔄 Syncing... ✅ Sync complete"
- ✅ Console: "✅ Session restored successfully!"
- ❌ NO MORE: "InvalidCharacterError"

---

**Ready to deploy?** Start with the backend, then frontend, then test! 🚀

**Questions?** Check the documentation files or ask me!
