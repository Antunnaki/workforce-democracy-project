#✅ Deployment Checklist - Enhanced RSS v37.4.0

Use this checklist to ensure smooth deployment!

---

## 📋 Pre-Deployment Checklist

### Files Ready? ✅

- [ ] `backend/keyword-extraction.js` (15KB) - Downloaded/ready to upload
-[ ] `backend/rss-service-MERGED-v37.4.0.js` (32KB) - Downloaded/ready to upload
- [ ] `DEPLOY-MERGED-RSS-v37.4.0.md` - Read and understood deployment steps

### Access Verified? 🔑

- [ ] Can SSH to VPS: `ssh root@185.193.126.13`
- [ ] Can navigate to: `/var/www/advocacyunion.com/backend`
- [ ] Have SCP/SFTP access to upload files

### Safety Net Ready?🛡️

- [ ] Understand backup process (copy current `rss-service.js`)
- [ ] Understand rollback process (restore from backup)
- [ ] Know how to check PM2 logs: `pm2 logs universal-chat-service`

---

## 🚀 Deployment Checklist

### Step 1: Upload Files ⬆️

- [ ] Upload `keyword-extraction.js` to `/var/www/advocacyunion.com/backend/`
- [ ] Upload `rss-service-MERGED-v37.4.0.js` to `/var/www/advocacyunion.com/backend/`

**Commands:**
```bash
scpbackend/keyword-extraction.js root@185.193.126.13:/var/www/advocacyunion.com/backend/
scp backend/rss-service-MERGED-v37.4.0.js root@185.193.126.13:/var/www/advocacyunion.com/backend/
```

### Step 2: SSH to VPS 🔐

- [ ] Connected to VPS: `ssh root@185.193.126.13`
- [ ] Navigated to backend: `cd /var/www/advocacyunion.com/backend`

### Step 3: Create Backup 💾

- [ ] Created timestamped backup:
```bash
cp rss-service.js rss-service-BACKUP-$(date +%Y%m%d-%H%M%S).js
```

- [ ] Verified backup exists:
```bash
ls -lh rss-service-BACKUP-*
```

**Expected output:**
```
-rw-r--r-- 1 root root 27K Nov 6 XX:XX rss-service-BACKUP-YYYYMMDD-HHMMSS.js
```

### Step 4: Replace Old File 🔄

- [ ] Moved old file to safety:
```bash
mv rss-service.js rss-service-OLD.js
```

- [ ] Renamed new file:
```bash
mv rss-service-MERGED-v37.4.0.js rss-service.js
```

- [ ] Verified files exist:
```bash
ls -lh rss-service.js keyword-extraction.js```

**Expected output:**
```
-rw-r--r-- 1 root root 15K Nov 6 XX:XX keyword-extraction.js
-rw-r--r-- 1 root root 32K Nov 6 XX:XX rss-service.js
```

### Step 5: Restart PM2 Service ♻️

**CRITICAL:** Must DELETE first, not just restart (clears code cache)

- [ ] Deleted old service:
```bash
pm2 delete universal-chat-service
```

- [ ] Started new service:
```bash
pm2 start server.js --name universal-chat-service```

- [ ] Checked service is running:
```bash
pm2 status
```

**Expected output:**
```
│ universal-chat-service │ 0 │ online │ ...
```

### Step 6: Verify Deployment 🔍

- [ ] Checked logs for startup:
```bash
pm2 logs universal-chat-service --lines 30
```

**Look for:**
```
✅ Module loaded successfully
✅ Server started on port XXXX
(No error messages)
```

---

## 🧪 Testing Checklist

### Test 1: 19th Amendment Question

- [ ] Opened Universal Chat onwebsite
- [ ] Asked: "What would be societal implications if the 19th amendment is repealed?"
- [ ] Waited for response (10-15 seconds)

**Expected Results:**

- [ ] Received 5 sources
- [ ] Sources are about women's rights/suffrage/voting(NOT Oasis/Thames Water)
- [ ] Sources include independent outlets (Common Dreams, Truthout, etc.)
- [ ] Citations are clickable and open real article URLs

### Test 2: Check PM2 Logs for Enhancement

- [ ] Ran: `pm2 logs universal-chat-service | grep "Extracted search"`

**Expected Log Entries:**
```
🔎 Extracted search query: "nineteenth amendment OR women suffrage OR voting rights..."
📌 Keywords: [nineteenth amendment, women suffrage, voting rights, gender equality, feminism]
🏷️  Topics: [womens rights, voting rights, genderequality, suffrage, feminism]
```

- [ ] Ran: `pm2 logs universal-chat-service | grep "Score:"`

**Expected Log Entries:**
```
1. [Score: 72] Common Dreams: Women's Voting Rights...
2. [Score: 65] Truthout: 19th Amendment Under Attack...
3. [Score: 60] The Guardian: Gender Equality and Voting...
4. [Score: 58] The Intercept: Suffrage in Modern Era...
5. [Score: 52] Democracy Now!: Feminism and Political Power...
```

### Test 3: Source Diversity Check

- [ ] Checked that sources come from different outlets (no duplicates)
- [ ] Checked that independent outlets are prioritized (60-80% of sources)

**Expected Breakdown:**
- 3-4 sources from independent outlets (trust_level: 'highest')
- 1-2 sources from establishment outlets (trust_level: 'medium')

---

## 🎯 Success Criteria

### All Green? You're Good! ✅

- [ ] PM2 service shows "online" status
- [ ] PM2 logs show keyword extraction happening
- [ ] PM2 logs show relevance scores (30-80 range)
- [ ] Universal Chat returns relevant sources (not irrelevant ones)
- [ ] Sources include independent outlets
- [ ] Citations are clickable and open correct URLs
- [ ] No JavaScript errors in PM2 logs

### Any Red? Troubleshoot! ⚠️

Ifany of these are true, see **Troubleshooting** section below:

- [ ] PM2 service shows "errored" status
- [ ] PM2 logs show "Cannot find module 'keyword-extraction'" error
- [ ] Still getting irrelevant sources (Oasis, Thames Water, etc.)
- [ ]No relevance scores in logs
- [ ] Citations not working
- [ ] Service crashes on startup

---

## 🔧 Troubleshooting Checklist

### Problem: PM2 shows "errored" status

- [ ] Check error logs:
```bash
pm2 logs universal-chat-service --err --lines 50
```

**Common Errors:**

**Error:** `Cannot find module './keyword-extraction'`
- [ ] Verify file exists:
```bash
ls -lh /var/www/advocacyunion.com/backend/keyword-extraction.js
```
- [ ] If missing, re-upload the file

**Error:** `SyntaxError: Unexpected token`
- [ ] Test file syntax:
```bash
node -c rss-service.js
node -c keyword-extraction.js
```
- [ ] If syntax error, file may be corrupted - re-upload

**Error:** `Permission denied`
- [ ] Fix permissions:
```bash
chmod 644 rss-service.js keyword-extraction.js
chown www-data:www-data rss-service.js keyword-extraction.js
```

### Problem: Still getting irrelevant sources

- [ ] Check if keyword extraction is running:
```bash
pm2 logs universal-chat-service | grep "Extracted search"
```

**If no "Extracted search" logs:**
- [ ] Keyword extraction might not be imported correctly
- [ ] Check for typos in require statement
- [ ] Verify `keyword-extraction.js` is in same directory

**If "Extracted search" logs exist but sources still irrelevant:**
- [ ] Check relevance scores in logs
- [ ] Scores might be too low (< 15 threshold)
- [ ] May need to adjust keyword extraction logic for specific topics

### Problem: No sources returned at all

- [ ] Test Guardian API manually:
```bash
curl "https://content.guardianapis.com/search?q=test&api-key=0e7c2e84-fd36-48db-b024-1cbfbfe0d5b6"
```

**Expected:** JSON response with `"status":"ok"`

- [ ] Test RSS feeds:
```bash
curl "https://truthout.org/feed/"
```

**Expected:** XML RSS feed

### Problem: Service keeps crashing

- [ ] Check system resources:
```bash
free -h
df -h
```

- [ ] Check if port is already in use:
```bash
netstat -tlnp | grep:3000
```

- [ ] Restart PM2 completely:
```bash
pm2 delete all
pm2 start server.js --name universal-chat-service
```

---

## 🔄 Rollback Checklist

If deployment fails or causes issues:

### Quick Rollback

- [ ] Stop current service:
```bash
pm2 delete universal-chat-service
```

- [ ] Restore backup:
```bash
cp rss-service-BACKUP-*.js rss-service.js
```

**Or restore OLD version:**
```bash
cp rss-service-OLD.js rss-service.js
```

- [ ] Remove new keyword extraction file(optional):
```bash
mv keyword-extraction.js keyword-extraction.js.DISABLED
```

- [ ] Restart with old version:
```bash
pm2 start server.js --name universal-chat-service
```

- [ ] Verify service is running:
```bash
pm2 status
pm2 logs universal-chat-service --lines 20
```

- [ ] Test Universal Chat works (even with irrelevant sources)

### After Rollback

- [ ] Document what went wrong
- [ ] Share error logs with me
- [ ] We'll fix the issue and try again

**Backup files preserved:**
- `rss-service-BACKUP-YYYYMMDD-HHMMSS.js` (timestamped)
- `rss-service-OLD.js` (previous version)

---

## 📊 Post-Deployment Monitoring

### First Hour After Deployment

- [ ] Monitor PM2 logs every 5-10 minutes:
```bash
pm2 logs universal-chat-service --lines 50
```

- [ ] Test with 3-5 different questions
- [ ] Verify relevance scores are appropriate (30-80 range)
- [ ] Check for any error messages

### First Day After Deployment

- [ ] Check PM2 status periodically:
```bash
pm2 status
```

- [ ] Review PM2 logs for any warnings:
```bash
pm2 logs universal-chat-service --lines 100
```

- [ ] Monitor cache cleanup (should happen every hour):
```bash
pm2 logs universal-chat-service | grep "Cleaned.*cache"
```

### First Week After Deployment

- [ ] Verify service hasn't crashed
- [ ] Check that sources remain relevant across various topics
- [ ] Monitor user feedback on source quality
- [ ] Adjust relevance threshold if needed (currently 15)

---

## 📞 Support Checklist

If youneed help:

### Information to Provide

- [ ] PM2 logs (last 50 lines):
```bash
pm2 logs universal-chat-service --lines 50 --nostream
```

- [ ] PM2 status:
```bash
pm2 status
```

- [ ] File verification:
```bashls -lh /var/www/advocacyunion.com/backend/*.js
```

- [ ] Describe the issue:
  - What question did you ask?
  - What sources did you get?
  - What error messages appeared?
  - What step of deployment did you reach?

### Quick Diagnostic Commands

```bash
# Check if service is running
pm2 status

# Check recent logs
pm2 logs universal-chat-service --lines 50

# Check for errors only
pm2 logs universal-chat-service --err --lines 30

# Check file sizes
ls -lh /var/www/advocacyunion.com/backend/

# Test Node.js syntax
cd /var/www/advocacyunion.com/backend
node -c rss-service.js
node -c keyword-extraction.js
```

---

## 🎉 Deployment Complete!

When all items are checked:

- [ ] **Deployment successful** ✅
- [] **Testing passed** ✅
- [ ] **Monitoring started** ✅
- [ ] **Backup verified** ✅

**Congratulations!** Your Enhanced RSS Service v37.4.0 is live! 🚀

---

## 📝 Notes Section

Use this space to record any issues, observations, or adjustments made during deployment:

**Deployment Date/Time:** _______________________

**Backup File Created:** _______________________

**PM2 Service Status After Deployment:** _______________________

**First Test Results:**
- Question asked: _______________________
- Sources received: _______________________
- Relevance scores: _______________________

**Issues Encountered:**
_______________________
_______________________

**Resolutions:**
_______________________
_______________________

**Overall Status:** ⭐️ _____________ (Success / Needs Attention / Rolled Back)

---

**Ready to deploy? Let's do this! 🚀**
