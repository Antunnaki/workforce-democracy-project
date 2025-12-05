# ⚡ Quick Start: V36.12.3 Deployment

**Time Required**: 20 minutes  
**Difficulty**: Easy  
**Status**: ✅ All files ready to deploy

---

## 🎯 **What We Fixed**

Based on your testing feedback:

1. ✅ **Photo overlay** - Letters no longer show over photos
2. ✅ **Text contrast** - ZIP description and header now crisp white
3. ✅ **Website URLs** - Links go to actual rep websites (not congress.gov profiles)
4. ℹ️ **Contact links** - Already present, show when backend has data

---

## 📦 **STEP 1: Deploy Frontend** (5 min)

### What to Do:
1. Go to **Publish tab**
2. Click **Publish** or **Deploy**
3. Wait for completion (~2 min)

### Test It Works:
1. Open your site
2. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Open browser console (`F12`)
4. Look for: `🚀 [REP-FINDER V36.12.3]`
5. Enter ZIP: `10001`
6. Check:
   - ✅ Photos are clean (no letters on top)
   - ✅ Text is crisp white and readable

---

## 🔧 **STEP 2: Deploy Backend** (10 min)

### What to Do:

**A. Access Server:**
```bash
ssh your-username@api.workforcedemocracyproject.org
cd /var/www/workforce-democracy/backend
```

**B. Backup Current File:**
```bash
cp us-representatives.js us-representatives.js.backup
```

**C. Update Function:**

Open file:
```bash
nano us-representatives.js
```

Find function `formatCongressMember` (around line 359).

Replace the `website:` line (currently line 374):

**FIND THIS:**
```javascript
website: member.officialWebsiteUrl || `https://www.congress.gov/member/${member.bioguideId}`,
```

**REPLACE WITH THIS ENTIRE SECTION:**
```javascript
// 🔧 FIX: Build actual website URL if officialWebsiteUrl is missing
let websiteUrl = member.officialWebsiteUrl;

// If congress.gov doesn't provide website, construct senator/house website
if (!websiteUrl || websiteUrl.trim() === '') {
    const lastName = (member.lastName || '').toLowerCase();
    const firstName = (member.firstName || '').toLowerCase();
    
    if (chamber === 'Senate') {
        // Senate website pattern: https://www.lastname.senate.gov
        websiteUrl = `https://www.${lastName}.senate.gov`;
        console.log(`📝 [WEBSITE FIX] Generated Senate URL for ${member.firstName} ${member.lastName}: ${websiteUrl}`);
    } else {
        // House website pattern: https://lastname.house.gov
        websiteUrl = `https://${lastName}.house.gov`;
        console.log(`📝 [WEBSITE FIX] Generated House URL for ${member.firstName} ${member.lastName}: ${websiteUrl}`);
    }
}

// ... (keep the rest of the return statement as-is, just update website line)
website: websiteUrl, // ✅ FIXED: Now uses constructed URL if officialWebsiteUrl is empty
```

**IMPORTANT**: You need to:
1. Add the new code BEFORE the `return {` statement
2. Declare `let websiteUrl` at the top of the function
3. Change the `website:` line in the return statement to use `websiteUrl`

**D. Restart Backend:**
```bash
pm2 restart workforce-democracy-backend
pm2 logs --lines 20  # Verify no errors
```

### Test It Works:
1. Go to your live site
2. Enter ZIP: `10001`
3. Find Chuck Schumer
4. Click his **🌐 Website** button
5. Should open: `https://www.schumer.senate.gov` ✅
6. Should NOT open: `https://www.congress.gov/member/S000148` ❌

---

## ✅ **STEP 3: Final Verification** (5 min)

Test these 3 things:

### Test 1: Photos
- Enter ZIP code
- Look at representative photos
- **Expected**: Clean photos, no letters overlapping

### Test 2: Text Contrast
- Look at text above ZIP entry box
- Look at "Found X representatives" header
- **Expected**: Crisp white text, easy to read

### Test 3: Website Links
- Click Chuck Schumer's website button
- **Expected**: Opens `schumer.senate.gov` (actual site)
- **NOT**: Opens `congress.gov/member/...` (profile page)

---

## 🐛 **TROUBLESHOOTING**

### "I still see V36.12.2 in console"
→ Hard refresh: `Ctrl+Shift+R` or `Cmd+Shift+R`  
→ Or: Clear browser cache

### "Photos still have letters overlapping"
→ Check console shows `V36.12.3`  
→ If yes, try different browser (cache issue)

### "Website links still go to congress.gov"
→ Check backend restarted: `pm2 status`  
→ Check backend logs: `pm2 logs | grep "WEBSITE FIX"`  
→ Should see: `📝 [WEBSITE FIX] Generated Senate URL...`

### "I don't see contact links"
→ This is expected if backend doesn't have data:
   - **Phone**: Shows if available
   - **Email**: Usually hidden (congress.gov doesn't provide)
   - **Website**: Always shows (we generate it now)

---

## 📊 **COMPLETE FILE CHANGES**

If you want to see exactly what changed:

**Frontend Files Modified:**
- `js/rep-finder-simple.js` - Photo overlay + contrast fixes
- `index.html` - Cache-busting versions updated

**Backend Files Modified:**
- `backend/us-representatives.js` - Website URL construction

**See Full Details**: [🚀-V36.12.3-DEPLOYMENT-ROADMAP.md](🚀-V36.12.3-DEPLOYMENT-ROADMAP.md)

---

## ✨ **DONE!**

Once you complete all 3 steps above, all 4 user-reported issues are fixed:

1. ✅ Photo overlay removed
2. ✅ Text contrast improved  
3. ✅ Website URLs route correctly
4. ✅ Contact links present (show when data available)

---

**Questions?** Check the full deployment guide: `🚀-V36.12.3-DEPLOYMENT-ROADMAP.md`

**Time to Deploy**: ~20 minutes total
