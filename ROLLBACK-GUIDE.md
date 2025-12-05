# Universal Rollback Guide - Emergency Recovery Procedures

## 🚨 When to Use This Guide

Use this guide if:
- New deployment breaks the site
- Chat functionality stops working completely
- JavaScript errors prevent page from loading
- User experience is worse than before
- You need to quickly restore previous working version

**⏱️ Estimated Rollback Time: 5-10 minutes**

---

## 📋 Pre-Rollback Checklist

**Before rolling back, verify:**

1. ✅ You have backup files from before deployment
2. ✅ You know what's broken (take screenshots)
3. ✅ You've checked browser console for specific errors
4. ✅ You've tried hard refresh (`Ctrl+Shift+R`) on multiple browsers
5. ✅ The issue is reproducible (not just your cache)

**⚠️ Don't rollback immediately - most issues can be fixed faster than rolling back**

---

## 🔍 Quick Diagnosis (Try This First)

### Issue: "Chat button doesn't appear"

**Quick Fix (30 seconds):**
1. Press `F12` → Console tab
2. Look for error: `404 universal-chat.js`
3. If found: File didn't upload to Netlify
4. Solution: Re-upload `js/universal-chat.js` to Netlify

**No need to rollback!**

---

### Issue: "Chat opens but won't send messages"

**Quick Fix (1 minute):**
1. Press `F12` → Console tab
2. Look for error involving `/api/civic/llm-chat`
3. If found: Backend issue, NOT frontend deployment issue
4. Check backend health: Open https://api.workforcedemocracyproject.org/api/civic/llm-health
   - If 200 OK: Backend is fine, check CORS
   - If error: Backend is down, restart PM2 on VPS

**No need to rollback - this is backend issue!**

---

### Issue: "Typewriter effect broken / citations weird"

**Quick Fix (2 minutes):**
1. Press `F12` → Console tab
2. Look for JavaScript errors
3. Check Network tab - is `universal-chat.js` loaded fully?
4. Check file size in Network tab - should be ~45KB
5. If incomplete: Re-upload file
6. If complete: Check for conflicting old scripts

**Try removing old script tags first before rollback!**

---

## 🔄 Rollback Procedures

If quick fixes don't work, follow these rollback procedures based on severity.

---

## 🟡 LEVEL 1: Partial Rollback (Recommended First)

**Use when:** Chat is broken but rest of site works fine

**Time:** 3-5 minutes

### Step 1: Restore HTML Files

1. Go to Netlify → **Deploys** tab
2. Find the deployment BEFORE you deployed v37.1.0 (it will have a timestamp)
3. Click on that old deployment
4. Click **"Publish deploy"** button at top
5. Wait 1-2 minutes for deployment to complete

**This restores:**
- Old HTML files (with old script tags)
- Old chat files (inline-civic-chat.js, etc.)

**This preserves:**
- All backend changes (v37.0.2 still running)
- CSS files
- Image files
- Representative data integration

### Step 2: Verify Rollback

1. Visit your site with hard refresh: `Ctrl+Shift+R`
2. Check console - should NOT see "Universal Chat v37.1.0"
3. Should see old chat components
4. Test old chat functionality
5. If working: ✅ Rollback successful

### Step 3: Document What Went Wrong

Create a file `DEPLOYMENT-FAILURE-LOG.md`:
```markdown
# Deployment Failure Log

**Date:** [Today's date]
**Attempted Deployment:** Universal Chat v37.1.0
**Rollback Performed:** Yes - Level 1 (Partial)

## What Went Wrong
[Describe the issue]

## Error Messages
[Paste console errors]

## Screenshots
[Attach screenshots]

## Next Steps
[What to try differently next time]
```

---

## 🟠 LEVEL 2: Full Rollback (If Level 1 Fails)

**Use when:** Entire site is broken or Level 1 didn't work

**Time:** 5-10 minutes

### Step 1: Restore from Local Backup

**You need your backup folder:** `backup-v37.0.x-[DATE]/`

1. Log into Netlify dashboard
2. Go to **Deploys** tab
3. Scroll to **"Deploy manually"** section
4. Drag and drop your backup folder
5. OR click **"Browse to upload"** and select backup folder

**Make sure backup folder contains:**
- `index.html`
- `civic-platform.html`
- `js/inline-civic-chat.js` (old chat)
- `js/candidate-analysis.js` (old chat)
- `js/backend-api.js` (should be v37.0.3)
- All other files from before deployment

### Step 2: Verify Complete Rollback

1. Wait for Netlify deployment (1-2 minutes)
2. Visit site: https://workforcedemocracyproject.org
3. Hard refresh: `Ctrl+Shift+R`
4. Check console - should NOT see "Universal Chat v37.1.0"
5. Test all functionality:
   - Home page loads
   - Representative search works
   - Old chat works (if it was working before)
   - No console errors
   - Mobile view works

### Step 3: Post-Rollback Verification

**Check these pages:**
- [ ] https://workforcedemocracyproject.org (home)
- [ ] https://workforcedemocracyproject.org/civic-platform.html
- [ ] Representative search functionality
- [ ] Chat functionality (whatever was working before)

**Check console on each page:**
- Should NOT see v37.1.0 messages
- Should NOT have new errors
- Should be same as before deployment

---

## 🔴 LEVEL 3: Emergency Nuclear Rollback

**Use when:** Site is completely broken, nothing works, panic mode

**Time:** 10-15 minutes

### Prerequisites
- Access to Netlify account
- Backup files OR knowledge of last working deployment

### Option A: Restore from Netlify History (No Backup Files)

1. **Go to Netlify → Deploys tab**
2. **Find last known working deployment:**
   - Look for green checkmark
   - Look for date BEFORE your v37.1.0 deployment
   - Example: If you deployed v37.1.0 on Nov 3, find deploy from Nov 2 or earlier
3. **Click on that deployment**
4. **Click "Publish deploy"** (at top of page)
5. **Confirm:** "Are you sure?" → Yes
6. **Wait** 1-2 minutes for deployment

### Option B: Upload Complete Backup

1. **Locate your backup folder**
   - Should be named like: `backup-v37.0.2-2025-11-03/`
2. **Verify it contains ALL files:**
   ```
   backup-v37.0.2-2025-11-03/
   ├── index.html
   ├── civic-platform.html
   ├── css/
   │   └── [all CSS files]
   ├── js/
   │   ├── backend-api.js
   │   ├── inline-civic-chat.js
   │   ├── candidate-analysis.js
   │   └── [all JS files]
   ├── images/
   │   └── [all images]
   └── [any other files]
   ```
3. **Netlify → Deploys → "Deploy manually"**
4. **Drag entire backup folder** into upload area
5. **Wait** for deployment (2-3 minutes for full site)

### Step 2: Emergency Verification

**Immediately check:**
1. Site loads: https://workforcedemocracyproject.org
2. No blank page
3. No console errors
4. Basic functionality works:
   - Navigation
   - Images load
   - Forms work
   - At least one feature works

**If still broken:**
- Check Netlify build logs for errors
- Check if deployment actually completed (green checkmark)
- Try different browser
- Clear ALL browser data and try again

---

## 🔧 Post-Rollback Recovery

### Immediate Actions (Within 1 Hour)

1. **Test Full Site Functionality**
   - Go through every major feature
   - Test on desktop and mobile
   - Test in multiple browsers
   - Compare to pre-deployment screenshots

2. **Document Everything**
   ```markdown
   # Post-Rollback Report
   
   **Rollback Date:** [Date/Time]
   **Rollback Level:** Level 1 / Level 2 / Level 3
   **Reason:** [Why you rolled back]
   
   ## Current Site Status
   - [ ] Home page working
   - [ ] Civic platform working
   - [ ] Representative search working
   - [ ] Chat working (old version)
   - [ ] Mobile responsive
   - [ ] No console errors
   
   ## What We Learned
   [What went wrong and why]
   
   ## Next Attempt Plan
   [What to do differently]
   ```

3. **Notify Users (If Applicable)**
   - If site was down for >5 minutes
   - If users reported issues
   - Brief explanation of temporary issue

---

### Next Steps (Within 24 Hours)

1. **Root Cause Analysis**
   - What exactly broke?
   - Why did it break?
   - What error messages appeared?
   - Was it deployment process or code issue?

2. **Create Test Plan**
   - How to test next deployment better
   - What to check before going live
   - Staging environment setup (if needed)

3. **Fix and Re-Deploy Checklist**
   ```markdown
   Before next deployment attempt:
   - [ ] Identify exact cause of previous failure
   - [ ] Fix the issue in code
   - [ ] Test locally (if possible)
   - [ ] Test in browser console
   - [ ] Create new backup
   - [ ] Deploy at low-traffic time
   - [ ] Monitor console immediately
   - [ ] Have rollback plan ready
   - [ ] Test on mobile immediately
   ```

---

## 📊 Rollback Decision Matrix

Use this to decide which rollback level to use:

| Symptom | Severity | Rollback Level | Time |
|---------|----------|----------------|------|
| Chat button missing | Low | Try quick fix first | 1 min |
| Chat won't send messages | Low-Medium | Check backend, then Level 1 | 3 min |
| JavaScript errors in console | Medium | Level 1 | 5 min |
| Some pages broken | Medium-High | Level 2 | 10 min |
| Site won't load at all | Critical | Level 3 | 15 min |
| Users reporting issues | High | Level 2 or 3 | 10 min |
| Blank page | Critical | Level 3 immediately | 10 min |

---

## 🛡️ Prevention for Future Deployments

### Before Every Deployment:

1. **Create Backup**
   - Download all current files
   - Name folder with version and date
   - Store in safe location

2. **Test Locally (If Possible)**
   - Open HTML files in browser locally
   - Check console for errors
   - Test all functionality

3. **Deploy at Safe Time**
   - Low traffic hours
   - When you have time to monitor
   - NOT right before leaving for the day
   - NOT on Friday afternoon

4. **Have Rollback Ready**
   - Know which deployment to restore to
   - Have backup files accessible
   - This guide open in browser tab

### During Deployment:

1. **Monitor Immediately**
   - Open console right after deployment
   - Check for errors first 5 minutes
   - Test all major features

2. **Test Progressively**
   - Desktop first
   - Then mobile
   - Then different browsers
   - Then different features

### After Deployment:

1. **Stay Alert for 1 Hour**
   - Monitor for user reports
   - Check console occasionally
   - Be ready to rollback

2. **Full Test After 24 Hours**
   - Re-test all features
   - Check for delayed issues
   - Verify no performance degradation

---

## 📞 Emergency Contacts

**When to escalate:**
- Rollback doesn't work
- Site still broken after Level 3
- Data loss occurred
- Security issue suspected

**Who to contact:**
- Developer: [Your contact]
- Netlify Support: https://answers.netlify.com/
- VPS Provider: [If backend affected]

**Information to provide:**
- Deployment timestamp
- Rollback level attempted
- Error messages (screenshots)
- Browser console logs
- Network tab screenshots

---

## 💾 Rollback Checklist

Print this and keep with backup files:

```
EMERGENCY ROLLBACK CHECKLIST

[ ] Identified what's broken
[ ] Tried quick fixes (hard refresh, console check)
[ ] Verified issue is real (not cache)
[ ] Located backup files
[ ] Chose rollback level (1/2/3)
[ ] Executed rollback procedure
[ ] Verified site works after rollback
[ ] Documented what went wrong
[ ] Created post-rollback report
[ ] Planned next attempt (if applicable)
[ ] Notified users (if needed)

Rollback Date: ________________
Rollback Level: ________________
Performed By: ________________
Result: ⬜ Success / ⬜ Partial / ⬜ Failed
```

---

## 🎓 Learning from Rollbacks

**Every rollback is a learning opportunity:**

1. **What went wrong?**
   - Technical issue?
   - Process issue?
   - Testing gap?

2. **How to prevent it?**
   - Better testing?
   - Staging environment?
   - Smaller deployments?

3. **How to detect it faster?**
   - Monitoring?
   - Alerts?
   - User feedback?

4. **How to rollback faster?**
   - Better documentation?
   - Automated rollback?
   - Clearer procedures?

---

## ✅ Success Criteria

**Rollback is successful when:**

1. ✅ Site is accessible
2. ✅ No console errors (or same as before)
3. ✅ Main features work
4. ✅ Mobile works
5. ✅ Representative search works
6. ✅ Chat works (old version)
7. ✅ No user complaints
8. ✅ Same performance as before
9. ✅ All pages load
10. ✅ No data loss

---

**End of Rollback Guide**

*Keep this guide accessible during all deployments. Hope you never need it, but be prepared if you do.*
