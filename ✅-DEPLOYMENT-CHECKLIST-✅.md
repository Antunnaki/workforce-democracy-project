# ✅ Deep Research Fix - Deployment Checklist

## 📋 Pre-Deployment Checklist

### Understanding
- [ ] I understand the bug: Frontend CSS selector mismatch
- [ ] I know the fix: Changed `.representative-card` to `.rep-card`
- [ ] I know which file: `js/chat-clean.js`
- [ ] I've read: `🎯-SIMPLE-FIX-SUMMARY-🎯.md`

### Prerequisites
- [ ] I have SSH access to: `root@185.193.126.13`
- [ ] I have the fixed file: `js/chat-clean.js`
- [ ] I know where to upload: `/var/www/workforce-democracy/version-b/js/`
- [ ] Version B backend is running (check: `sudo systemctl status workforce-backend-b.service`)

---

## 🚀 Deployment Steps

### Step 1: Upload Fixed File
- [ ] Open terminal on my local machine
- [ ] Navigate to project directory: `cd /path/to/project`
- [ ] Run upload command:
  ```bash
  scp js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/version-b/js/chat-clean.js
  ```
- [ ] Verify upload succeeded (no errors)
- [ ] Confirm file uploaded:
  ```bash
  ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-b/js/chat-clean.js'
  ```

### Step 2: Test Version B
- [ ] Open browser
- [ ] Navigate to: `http://185.193.126.13:3002`
- [ ] Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- [ ] Go to "My Representatives" section
- [ ] Enter zip code: `12061`
- [ ] Click search
- [ ] Wait for Chuck Schumer card to appear
- [ ] Open chat widget
- [ ] Ask: "How has Chuck Schumer voted on healthcare?"
- [ ] Wait for response (~15 seconds)
- [ ] Verify response includes:
  - [ ] 7+ sources listed
  - [ ] Congress.gov links visible
  - [ ] Citations appear as superscripts (¹ ² ³)
  - [ ] Specific bill numbers (HR 2483, S 2392, etc.)
  - [ ] No "I couldn't find..." fallback message

### Step 3: Verify Deep Research (Optional but Recommended)
- [ ] Open browser console (F12)
- [ ] Check Network tab
- [ ] Look for POST to `/api/civic/llm-chat/submit`
- [ ] Verify request includes:
  ```json
  {
    "context": {
      "viewingContent": {
        "type": "representative",
        "name": "Chuck Schumer"
      }
    }
  }
  ```
- [ ] SSH into VPS: `ssh root@185.193.126.13`
- [ ] Check backend logs:
  ```bash
  tail -50 /var/log/workforce-backend-b.log | grep -i "deep research"
  ```
- [ ] Should see: "Deep Research enabled for representative: Chuck Schumer"

### Step 4: Run Automated Test (Highly Recommended)
- [ ] SSH into VPS: `ssh root@185.193.126.13`
- [ ] Upload test script:
  ```bash
  # On local machine
  scp ✅-TEST-DEEP-RESEARCH-✅.sh root@185.193.126.13:/tmp/
  ```
- [ ] Run test:
  ```bash
  # On VPS
  chmod +x /tmp/✅-TEST-DEEP-RESEARCH-✅.sh
  /tmp/✅-TEST-DEEP-RESEARCH-✅.sh
  ```
- [ ] Verify output shows:
  - [ ] "✅ PASS: Deep research triggered (7 Congress.gov sources)"
  - [ ] "✅ ALL TESTS PASSED - DEEP RESEARCH WORKING!"

### Step 5: Deploy to Production
- [ ] SSH into VPS: `ssh root@185.193.126.13`
- [ ] Navigate to deployment scripts:
  ```bash
  cd /var/www/workforce-democracy/deployment-scripts
  ```
- [ ] Check script exists:
  ```bash
  ls -la sync-b-to-a.sh
  ```
- [ ] Make executable if needed:
  ```bash
  chmod +x sync-b-to-a.sh
  ```
- [ ] Run sync script:
  ```bash
  ./sync-b-to-a.sh
  ```
- [ ] Wait for sync to complete
- [ ] Verify files synced:
  ```bash
  ls -lh /var/www/workforce-democracy/version-a/js/chat-clean.js
  ```
- [ ] Check modification date matches Version B

### Step 6: Test Production (Version A)
- [ ] Open browser
- [ ] Navigate to: `http://185.193.126.13:3001`
- [ ] Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
- [ ] Repeat same test as Step 2:
  - [ ] Go to "My Representatives"
  - [ ] Search zip code: `12061`
  - [ ] Ask: "How has Chuck Schumer voted on healthcare?"
  - [ ] Verify 7+ sources with Congress.gov bills

### Step 7: Monitor for Issues
- [ ] Check production logs:
  ```bash
  tail -50 /var/log/workforce-backend-a.log
  ```
- [ ] Look for errors (should be none)
- [ ] Test with different representatives (optional)
- [ ] Test with different questions (optional)

---

## 📊 Success Criteria

### ✅ Must Have (Critical)
- [ ] Version B shows 7+ sources for representative questions
- [ ] Congress.gov bills appear in sources
- [ ] Citations display as superscripts (¹ ² ³)
- [ ] No JavaScript errors in console
- [ ] Production (Version A) works same as Version B

### ✅ Should Have (Important)
- [ ] Deep research log messages in backend logs
- [ ] Context detection visible in network requests
- [ ] Test script passes all tests
- [ ] Specific bill numbers mentioned in response

### ✅ Nice to Have (Optional)
- [ ] Response quality is high
- [ ] Citations are clickable and expand
- [ ] Links to Congress.gov open correctly
- [ ] Loading indicators show progress

---

## 🔥 Troubleshooting

### If Upload Fails
- [ ] Check SSH connection: `ssh root@185.193.126.13 'pwd'`
- [ ] Verify file path exists: `ssh root@185.193.126.13 'ls -la /var/www/workforce-democracy/version-b/js/'`
- [ ] Check permissions: `ssh root@185.193.126.13 'ls -la /var/www/workforce-democracy/version-b/'`

### If Version B Backend Not Running
- [ ] Check service: `sudo systemctl status workforce-backend-b.service`
- [ ] If inactive, start: `sudo systemctl start workforce-backend-b.service`
- [ ] Check logs: `tail -50 /var/log/workforce-backend-b.log`

### If Still Only 1 Source
- [ ] Verify file was actually uploaded (check modification date)
- [ ] Clear browser cache completely
- [ ] Check for JavaScript errors in console
- [ ] Verify `.rep-card` elements exist in HTML (inspect element)
- [ ] Check backend logs for "Deep Research" messages

### If Sync Script Fails
- [ ] Check script exists: `ls -la /var/www/workforce-democracy/deployment-scripts/sync-b-to-a.sh`
- [ ] Check permissions: `chmod +x /var/www/workforce-democracy/deployment-scripts/sync-b-to-a.sh`
- [ ] Run with verbose output: `bash -x /var/www/workforce-democracy/deployment-scripts/sync-b-to-a.sh`

### If Production Shows Old Behavior
- [ ] Verify sync completed: `diff /var/www/workforce-democracy/version-a/js/chat-clean.js /var/www/workforce-democracy/version-b/js/chat-clean.js`
- [ ] Clear browser cache and hard refresh
- [ ] Check Version A backend logs: `tail -50 /var/log/workforce-backend-a.log`

---

## 📝 Rollback Plan (If Needed)

### Quick Rollback (Version B)
```bash
# On VPS
cd /var/www/workforce-democracy/version-b/js
ls -la chat-clean.js*  # Find backup
cp chat-clean.js.backup-YYYYMMDD_HHMMSS chat-clean.js
```

### Production Rollback (Version A)
```bash
# On VPS
cd /var/www/workforce-democracy/version-a/js
ls -la chat-clean.js*  # Find backup
cp chat-clean.js.backup-YYYYMMDD_HHMMSS chat-clean.js
```

---

## 📞 Post-Deployment Report

### Deployment Summary
- [ ] Deployment date/time: ________________
- [ ] Version B test result: ⭐⭐⭐⭐⭐
- [ ] Production test result: ⭐⭐⭐⭐⭐
- [ ] Issues encountered: None / [List here]
- [ ] Resolution time: _____ minutes

### Test Results
- [ ] Representative context detected: YES / NO
- [ ] Deep research triggered: YES / NO
- [ ] Sources count: _____ (expected: 7+)
- [ ] Congress.gov sources: _____ (expected: 5+)
- [ ] Citations working: YES / NO

### Notes
```
[Add any observations, edge cases found, or recommendations]





```

---

## 🎉 Completion

- [ ] All tests passed
- [ ] Production deployed
- [ ] Documentation updated
- [ ] Team notified (if applicable)
- [ ] Monitoring enabled

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

**Deployed by:** ________________  
**Date:** ________________  
**Time:** ________________

---

## 📚 Reference Documents

Quick links to guides:
- `README.md` - Main overview
- `🎯-SIMPLE-FIX-SUMMARY-🎯.md` - Plain English explanation
- `🚀-FIX-DEEP-RESEARCH-DEPLOYMENT-🚀.md` - Detailed deployment guide
- `📊-BUG-DIAGRAM-📊.md` - Visual explanation
- `✅-TEST-DEEP-RESEARCH-✅.sh` - Automated test script

---

**Total estimated time:** 10-15 minutes  
**Difficulty:** Easy  
**Risk level:** Very Low ✅
