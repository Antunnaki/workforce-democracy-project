# ✅ V36.12.3 Deployment Checklist

**Print this page and check off items as you complete them!**

---

## 📦 **PHASE 1: DEPLOY FRONTEND** (5 minutes)

### Pre-Deployment
- [ ] Read [QUICK-START-V36.12.3.md](QUICK-START-V36.12.3.md) Section 1
- [ ] Understand what's being fixed (photo overlay + text contrast)

### Deployment Steps
- [ ] Go to **Publish tab** in development environment
- [ ] Click **Publish** or **Deploy** button
- [ ] Wait for deployment to complete (~2 minutes)
- [ ] Note deployment time: _______________

### Verification
- [ ] Open live site in browser
- [ ] Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- [ ] Open browser console (`F12`)
- [ ] Console shows: `🚀 [REP-FINDER V36.12.3]`
- [ ] Enter ZIP code: `10001`
- [ ] Photos load cleanly (no "S" over Chuck Schumer)
- [ ] Text above ZIP entry is crisp white
- [ ] "Found 7 representatives" header is crisp white

### Troubleshooting (if needed)
- [ ] Still shows V36.12.2? → Clear cache and hard refresh again
- [ ] Photos still have letters? → Try incognito mode
- [ ] Text still low contrast? → Verify CSS version updated

### Sign-Off
- [ ] **Frontend deployment complete**
- [ ] Deployed by: _______________
- [ ] Date/Time: _______________
- [ ] Issues encountered: _______________

---

## 🔧 **PHASE 2: DEPLOY BACKEND** (10 minutes)

### Pre-Deployment
- [ ] Read [QUICK-START-V36.12.3.md](QUICK-START-V36.12.3.md) Section 2
- [ ] Understand what's being fixed (website URL routing)
- [ ] Have VPS SSH credentials ready

### Step 1: Access Server
- [ ] SSH into VPS: `ssh user@api.workforcedemocracyproject.org`
- [ ] Navigate to backend: `cd /var/www/workforce-democracy/backend`
- [ ] Verify current file exists: `ls -la us-representatives.js`

### Step 2: Backup
- [ ] Create backup: `cp us-representatives.js us-representatives.js.backup-v36.12.2`
- [ ] Verify backup exists: `ls -la *.backup*`
- [ ] Note backup location: _______________

### Step 3: Edit File
- [ ] Open file: `nano us-representatives.js` (or vim/code)
- [ ] Find function `formatCongressMember` (around line 359)
- [ ] Add website URL generation code (see quick start guide)
- [ ] Verify `let websiteUrl` declaration added
- [ ] Verify `if (!websiteUrl || websiteUrl.trim() === '')` logic added
- [ ] Verify senator URL pattern: `https://www.${lastName}.senate.gov`
- [ ] Verify house URL pattern: `https://${lastName}.house.gov`
- [ ] Verify console.log statements added
- [ ] Save file (`Ctrl+X` → `Y` → `Enter` in nano)

### Step 4: Restart Backend
- [ ] Restart PM2: `pm2 restart workforce-democracy-backend`
- [ ] Check status: `pm2 status`
- [ ] Backend shows "online" status
- [ ] Check logs: `pm2 logs workforce-democracy-backend --lines 20`
- [ ] No error messages in logs

### Step 5: Test Backend
- [ ] Test API with curl:
```bash
curl "https://api.workforcedemocracyproject.org/api/query" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "find representatives for 10001"}' \
  | grep "website"
```
- [ ] Response shows: `"website": "https://www.schumer.senate.gov"` ✅
- [ ] Response NOT showing: `"https://www.congress.gov/member/S000148"` ❌
- [ ] Check logs for URL generation: `pm2 logs | grep "WEBSITE FIX"`
- [ ] Logs show: `📝 [WEBSITE FIX] Generated Senate URL...`

### Verification on Live Site
- [ ] Go to live site
- [ ] Enter ZIP: `10001`
- [ ] Find Chuck Schumer card
- [ ] Click **🌐 Website** button
- [ ] Opens: `https://www.schumer.senate.gov` ✅
- [ ] Does NOT open: `https://www.congress.gov/member/S000148` ❌
- [ ] Test another senator (e.g., Kirsten Gillibrand)
- [ ] Website link also works correctly

### Troubleshooting (if needed)
- [ ] PM2 won't restart? → Check syntax: `node us-representatives.js`
- [ ] Still goes to congress.gov? → Check logs for "WEBSITE FIX" messages
- [ ] 500 error? → Check PM2 logs: `pm2 logs --lines 50`
- [ ] Can't find function? → Search: `grep -n "formatCongressMember" us-representatives.js`

### Sign-Off
- [ ] **Backend deployment complete**
- [ ] Deployed by: _______________
- [ ] Date/Time: _______________
- [ ] Issues encountered: _______________

---

## 🧪 **PHASE 3: END-TO-END TESTING** (5 minutes)

### Test Case 1: New York (ZIP 10001)
- [ ] Enter ZIP: `10001`
- [ ] Results load successfully
- [ ] Shows 7 representatives (2 federal + 5 state)
- [ ] Chuck Schumer photo is clean (no letter "S")
- [ ] Kirsten Gillibrand photo is clean (no letter "G")
- [ ] All photos load without letter overlays
- [ ] Text is crisp white and readable
- [ ] Chuck Schumer website: `schumer.senate.gov` ✅
- [ ] Kirsten Gillibrand website: `gillibrand.senate.gov` ✅
- [ ] Phone numbers show (if available)
- [ ] Website buttons show for all reps

### Test Case 2: Los Angeles (ZIP 90001)
- [ ] Enter ZIP: `90001`
- [ ] Results load successfully
- [ ] California senators appear
- [ ] Photos load cleanly
- [ ] Text is readable
- [ ] Website links work correctly

### Test Case 3: Chicago (ZIP 60601)
- [ ] Enter ZIP: `60601`
- [ ] Results load successfully
- [ ] Illinois senators appear
- [ ] Photos load cleanly
- [ ] Text is readable
- [ ] Website links work correctly

### Browser Console Check
- [ ] Open console (`F12`)
- [ ] Console shows: `🚀 [REP-FINDER V36.12.3]`
- [ ] Console shows: `📊 [REP-FINDER V36.12.3] Received 7 representatives`
- [ ] Console shows: `🎴 [REP-FINDER V36.12.3] Rendering card 1/7`
- [ ] Console shows: `📝 [WEBSITE FIX] Generated Senate URL...`
- [ ] No JavaScript errors
- [ ] No CSP errors
- [ ] No 404 errors (except possibly for some photos)

### Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if Mac available)
- [ ] Test in Edge
- [ ] All browsers show consistent results

### Mobile Testing (if possible)
- [ ] Test on mobile device
- [ ] Photos display correctly
- [ ] Text is readable
- [ ] Website links work
- [ ] Layout is responsive

### Sign-Off
- [ ] **All tests passed**
- [ ] Tested by: _______________
- [ ] Date/Time: _______________
- [ ] Browsers tested: _______________
- [ ] Issues found: _______________

---

## 📊 **SUCCESS CRITERIA**

Check all that apply:

- [ ] Console shows `🚀 [REP-FINDER V36.12.3]`
- [ ] Photos load cleanly (no letter overlays)
- [ ] Text is crisp white (high contrast)
- [ ] "Found X representatives" header is readable
- [ ] Chuck Schumer website → `schumer.senate.gov`
- [ ] Kirsten Gillibrand website → `gillibrand.senate.gov`
- [ ] Backend logs show `📝 [WEBSITE FIX] Generated Senate URL`
- [ ] No JavaScript errors in console
- [ ] No CSP violations in console
- [ ] Contact buttons appear (phone, website)
- [ ] All 3 test ZIP codes work correctly

**If ALL boxes checked above**: ✅ **DEPLOYMENT SUCCESSFUL!**

---

## 🔮 **OPTIONAL: FUTURE IMPROVEMENTS**

_These are NOT required but enhance the experience:_

### Improvement 1: Add Email Data via ProPublica
- [ ] Read [BACKEND-IMPLEMENTATION-ROADMAP.md](BACKEND-IMPLEMENTATION-ROADMAP.md) Section 3.1
- [ ] Get ProPublica API key
- [ ] Add `.env` variable: `PROPUBLICA_API_KEY=...`
- [ ] Create `enrichWithProPublica()` function
- [ ] Update `formatCongressMember()` to async
- [ ] Update function callers to use `await`
- [ ] Test email links appear
- [ ] Deployed by: _______________
- [ ] Date/Time: _______________

### Improvement 2: Fix State Representative Photos
- [ ] Read [BACKEND-IMPLEMENTATION-ROADMAP.md](BACKEND-IMPLEMENTATION-ROADMAP.md) Section 3.2
- [ ] Find photo proxy code
- [ ] Add state domains to whitelist:
  - [ ] `nysenate.gov`
  - [ ] `assembly.ca.gov`
  - [ ] `senate.ca.gov`
  - [ ] `legislature.ca.gov`
  - [ ] `ilga.gov`
  - [ ] `flsenate.gov`
  - [ ] `txlege.state.tx.us`
- [ ] Restart photo proxy service
- [ ] Test Alexis Weik's photo (nysenate.gov)
- [ ] Test other state rep photos
- [ ] Deployed by: _______________
- [ ] Date/Time: _______________

### Improvement 3: Verify Phone Number Field
- [ ] Read [BACKEND-IMPLEMENTATION-ROADMAP.md](BACKEND-IMPLEMENTATION-ROADMAP.md) Section 3.3
- [ ] Add debug logging to see term fields
- [ ] Check if `latestTerm.office` is actually phone
- [ ] Find correct phone field if different
- [ ] Update phone mapping in code
- [ ] Test phone numbers display correctly
- [ ] Deployed by: _______________
- [ ] Date/Time: _______________

---

## 📝 **DEPLOYMENT NOTES**

Use this space to document any issues, decisions, or learnings:

```
Date: _______________
Deployed by: _______________

Issues Encountered:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Solutions Applied:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Time Taken:
- Frontend deployment: ___ minutes
- Backend deployment: ___ minutes
- Testing: ___ minutes
- Total: ___ minutes

Next Steps:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

Additional Notes:
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

## 🎉 **CONGRATULATIONS!**

If you've checked all required boxes above, you've successfully deployed V36.12.3!

**All 4 user-reported issues are now fixed**:
1. ✅ Photo overlay removed
2. ✅ Text contrast improved
3. ✅ Website URLs route correctly
4. ✅ Contact links present (show when data available)

**Share your success**:
- [ ] Take screenshot of working site
- [ ] Update team/stakeholders
- [ ] Document any learnings
- [ ] Plan optional improvements

---

**Version**: V36.12.3  
**Last Updated**: November 2, 2025  
**Status**: Ready for Deployment  
**Total Time**: ~20 minutes (required only)
