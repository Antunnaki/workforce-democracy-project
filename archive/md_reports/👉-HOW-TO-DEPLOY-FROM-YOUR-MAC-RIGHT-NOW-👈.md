# 👉 HOW TO DEPLOY FROM YOUR MAC RIGHT NOW 👈

## ⚡ ONE COMMAND - FULL DEPLOYMENT ⚡

### What You Need:
1. **Terminal** on your Mac
2. **SSH access** to VPS (root@185.193.126.13)
3. **3 files** downloaded from chat to:
   `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend/`

---

## 🚀 DEPLOYMENT STEPS

### Step 1: Download Files from Chat

Download these 3 files from the chat and save them to:
`/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend/`

1. `DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh`
2. `FIX-DEEP-RESEARCH-CALL-v37.18.4.js`
3. `DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh`
4. `⚡-UPLOAD-EXECUTE-DEEP-RESEARCH-FIX-FROM-MAC-⚡.sh` (this deployment script)

---

### Step 2: Open Terminal and Run

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"

chmod +x ⚡-UPLOAD-EXECUTE-DEEP-RESEARCH-FIX-FROM-MAC-⚡.sh

./⚡-UPLOAD-EXECUTE-DEEP-RESEARCH-FIX-FROM-MAC-⚡.sh
```

**That's it!** The script will:
- ✅ Upload all 3 fix files to VPS
- ✅ Make them executable
- ✅ Run the deployment script automatically
- ✅ Apply the Deep Research fix
- ✅ Restart the backend
- ✅ Run a test query
- ✅ Show you the results

---

## 📊 What The Script Does

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   YOUR MAC                                                  │
│   ↓ SCP Upload                                             │
│   VPS (185.193.126.13)                                     │
│   ↓ Make Executable                                        │
│   Run DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh                 │
│   ↓                                                        │
│   1. Backup deep-research.js                               │
│   2. Insert missing searchCongressGovBills() call          │
│   3. Restart workforce-backend-b.service                   │
│   4. Submit test: "How has Chuck Schumer voted on..."      │
│   5. Show job ID for verification                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Expected Output

You should see:
```
⚡ DEEP RESEARCH FIX DEPLOYMENT v37.18.4 ⚡

⚙️  Step 1: Verifying local files exist...
   ✅ Found: DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
   ✅ Found: FIX-DEEP-RESEARCH-CALL-v37.18.4.js
   ✅ Found: DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh

⚙️  Step 2: Uploading files to VPS Version B...
   📤 Uploading: DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
   ✅ Uploaded successfully
   📤 Uploading: FIX-DEEP-RESEARCH-CALL-v37.18.4.js
   ✅ Uploaded successfully
   📤 Uploading: DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
   ✅ Uploaded successfully

⚙️  Step 3: Making scripts executable on VPS...
   ✅ Scripts are now executable

⚙️  Step 4: Executing deployment script on VPS...
   🚀 Running: ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh

[... deployment output ...]

✅ DEPLOYMENT COMPLETE!
```

---

## 🔍 Verify Deployment

After the script finishes, check the test results:

```bash
# SSH into VPS
ssh root@185.193.126.13

# Check logs for Deep Research activity
tail -f /var/log/workforce-backend-b.log | grep -i 'deep\|congress'
```

**Look for:**
- `[Deep Research] Starting search for representative...`
- `[Deep Research] Searching Congress.gov for bills...`
- `Found 10+ Congress.gov bills with relevanceScore: 500`

---

## 🚨 If Something Goes Wrong

### Error: "No such file or directory"
**Cause:** Files not downloaded to the correct folder  
**Fix:** 
1. Download all 4 files from chat
2. Save to: `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend/`
3. Run script again

### Error: "Permission denied"
**Cause:** Script not executable  
**Fix:**
```bash
chmod +x ⚡-UPLOAD-EXECUTE-DEEP-RESEARCH-FIX-FROM-MAC-⚡.sh
```

### Error: "Connection refused"
**Cause:** SSH not connecting to VPS  
**Fix:** Verify VPS is online:
```bash
ping 185.193.126.13
```

---

## 📋 Summary

**Time:** ~30 seconds  
**Risk:** Low (automatic backup, easy rollback)  
**Impact:** Fixes Deep Research to search Congress.gov bills  
**Target:** Version B (port 3002) only

---

## 🎯 Next Steps After Deployment

1. ✅ Script uploads files
2. ✅ Script executes deployment
3. ✅ Backend restarts
4. 🔍 **You verify:** Check logs show Deep Research triggered
5. 🎉 **Success:** Deep Research finds Congress.gov bills
6. 🚀 **Deploy to Production:** Use `./sync-b-to-a.sh` when ready

---

**Created:** November 26, 2025  
**Version:** v37.18.4-DEEP-RESEARCH-FIX  
**Status:** ✅ READY TO USE
