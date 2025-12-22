# 🚀 Upload & Deploy Deep Research Fix from Mac

## 📍 Your Setup

- **Mac Path:** `/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/`
- **VPS:** `root@185.193.126.13`
- **Target:** `/var/www/workforce-democracy/version-b/backend/`
- **Note:** ⚠️ **ALWAYS deploy to Version B first** (never Version A directly!)

---

## ⚡ OPTION 1: One-Command Upload & Deploy (RECOMMENDED)

### Step 1: Download Files to Your Mac

Save all these files to your project folder:
```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend/
```

Files you need:
1. `DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh`
2. `FIX-DEEP-RESEARCH-CALL-v37.18.4.js`
3. `DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh`

### Step 2: Upload & Execute (One Command!)

**Copy and paste this into your Mac Terminal:**

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"

# Upload all 3 files to VPS Version B
scp DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
scp FIX-DEEP-RESEARCH-CALL-v37.18.4.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
scp DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

# SSH in and execute the deployment
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-b/backend && chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh && ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh'
```

**That's it!** The script will:
1. ✅ Upload all files
2. ✅ SSH into VPS
3. ✅ Run diagnostic
4. ✅ Apply the fix
5. ✅ Restart Version B backend
6. ✅ Test and show results

---

## 📋 OPTION 2: Step-by-Step Manual Deployment

### Step 1: Upload Files to VPS

```bash
# From your Mac terminal
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"

# Upload diagnostic script
scp DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

# Upload fix script
scp FIX-DEEP-RESEARCH-CALL-v37.18.4.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

# Upload deployment script
scp DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

### Step 2: SSH into VPS

```bash
ssh root@185.193.126.13
```

### Step 3: Navigate to Version B Backend

```bash
cd /var/www/workforce-democracy/version-b/backend
```

### Step 4: Make Scripts Executable

```bash
chmod +x DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
```

### Step 5: Run the Deployment

```bash
./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
```

The script will automatically:
- Run diagnostics
- Apply the fix
- Restart Version B (port 3002)
- Test the fix
- Show results

---

## 🔍 Verify the Fix

### Check Logs for Deep Research Activity

```bash
# On VPS, after deployment
tail -100 /var/log/workforce-backend-b.log | grep -i "deep research\|congress.gov"
```

**Expected output:**
```
[Deep Research] Searching Congress.gov for Charles E. Schumer...
🏛️ GOVERNMENT SOURCE (score: 500): "H.R. 6249"
[Deep Research] Found 10 Congress.gov bills
```

### Test API Endpoint

```bash
# On VPS
curl -X POST "http://localhost:3002/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{"message": "How has Chuck Schumer voted on healthcare?", "context": {"page": "civic-platform"}}'

# Use the returned jobId to check results
curl "http://localhost:3002/api/civic/llm-chat/result/YOUR_JOB_ID_HERE" | jq '.result.sources'
```

**Expected:** 10+ Congress.gov sources with `relevanceScore: 500`

---

## 🎯 Test on GenSpark (Version B Frontend)

After confirming the fix works on Version B backend:

1. **Visit:** `https://sxcrlfyt.gensparkspace.com`
2. **Enter ZIP:** `12061`
3. **Ask:** "How has Chuck Schumer voted on healthcare?"
4. **Expect:** AI response with specific Congress.gov bill citations

---

## 🚀 Deploy to Production (Version A)

⚠️ **ONLY after Version B is fully tested and working!**

### Step 1: Run Deployment Script

```bash
# On VPS
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

This will:
1. ✅ Backup Version A
2. ✅ Stop Version A service
3. ✅ Copy Version B → Version A
4. ✅ Restart Version A service (port 3001)
5. ✅ Verify deployment
6. ✅ Auto-rollback if it fails

### Step 2: Verify Production

```bash
# Test Version A (production)
curl "http://localhost:3001/api/civic/representatives/search?zip=12061"

# Check Version A logs
tail -50 /var/log/workforce-backend-a.log
```

### Step 3: Test Live Site

Visit: `https://workforcedemocracyproject.org`

---

## 📁 File Locations

### On Your Mac:
```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/
└── backend/
    ├── DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
    ├── FIX-DEEP-RESEARCH-CALL-v37.18.4.js
    └── DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
```

### On VPS (Version B - Testing):
```
/var/www/workforce-democracy/version-b/backend/
├── DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
├── FIX-DEEP-RESEARCH-CALL-v37.18.4.js
├── DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
└── deep-research.js ← This file will be fixed
```

### On VPS (Version A - Production):
```
/var/www/workforce-democracy/version-a/backend/
└── deep-research.js ← Will be updated after sync-b-to-a.sh
```

---

## 🆘 Troubleshooting

### Issue: "Permission denied" when using scp

**Solution:** Make sure you're using the correct path and have SSH access

```bash
# Test SSH access first
ssh root@185.193.126.13 'echo "SSH works!"'
```

### Issue: Scripts uploaded but not executable

**Solution:** Set permissions after upload

```bash
ssh root@185.193.126.13 'chmod +x /var/www/workforce-democracy/version-b/backend/*.sh'
```

### Issue: "deep-research.js" not found during fix

**Solution:** Verify file exists

```bash
ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-b/backend/deep-research.js'
```

If it doesn't exist, you may need to create it first or check if it's in a subdirectory.

### Issue: Fix applied but still getting 0 sources

**Possible causes:**
1. **Version B service not restarted** 
   ```bash
   ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'
   ```

2. **Congress.gov API key not set**
   ```bash
   ssh root@185.193.126.13 'grep CONGRESS_API_KEY /var/www/workforce-democracy/version-b/backend/.env'
   ```

3. **Network connectivity issue**
   ```bash
   ssh root@185.193.126.13 'curl -I https://api.congress.gov/v3/'
   ```

---

## 🔄 Rollback Plan

If the fix causes issues in Version B:

```bash
# On VPS
cd /var/www/workforce-democracy/version-b/backend

# Find your backup
ls -lt deep-research-BACKUP-before-call-fix-*.js | head -1

# Restore it
BACKUP=$(ls -t deep-research-BACKUP-before-call-fix-*.js | head -1)
cp $BACKUP deep-research.js

# Restart service
sudo systemctl restart workforce-backend-b.service
```

---

## ✅ Quick Checklist

Before deploying to production:

- [ ] Files uploaded to Version B
- [ ] Deployment script executed successfully
- [ ] Version B logs show "Searching Congress.gov"
- [ ] API returns 10+ Congress.gov sources
- [ ] Sources have `relevanceScore: 500`
- [ ] GenSpark test shows bill citations
- [ ] No errors in Version B logs

**Only after ALL checks pass:** Run `./sync-b-to-a.sh` to deploy to production!

---

## 📞 Support

**Problem uploading files?**
- Check SSH connection: `ssh root@185.193.126.13 'pwd'`
- Verify path on Mac: `ls "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"`

**Problem executing scripts?**
- Check permissions: `ls -lh *.sh` (should show `rwxr-xr-x`)
- Make executable: `chmod +x *.sh`

**Problem with the fix?**
- Check logs: `tail -100 /var/log/workforce-backend-b.log`
- Use rollback procedure above

---

## 🎉 Success Indicators

You'll know it's working when:

1. **Upload completes:**
   ```
   DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh    100%   3KB   1.5MB/s   00:00
   FIX-DEEP-RESEARCH-CALL-v37.18.4.js    100%   6KB   3.0MB/s   00:00
   DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh  100%   3KB   1.5MB/s   00:00
   ```

2. **Deployment runs:**
   ```
   🔧 DEEP RESEARCH FIX DEPLOYMENT - v37.18.4
   ==========================================
   ✅ Backed up to: deep-research-BACKUP-...
   ✅ Fix applied successfully
   ✅ Syntax check passed
   ✅ Service restarted
   ```

3. **Test succeeds:**
   ```
   🏛️ Checking for Congress.gov sources:
   {
     "title": "H.R. 6249 - Substance Use Services Act",
     "url": "https://api.congress.gov/v3/bill/118/hr/6249",
     "relevanceScore": 500
   }
   ```

---

**Ready to deploy?** Copy and paste the **OPTION 1** command above! 🚀

