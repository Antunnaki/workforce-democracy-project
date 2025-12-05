# 🚀 Deploy ZIP Search Debug - Quick Guide

## Files to Upload to VPS

Upload these 3 files to your VPS:

```bash
# 1. Updated JavaScript (with debug logging)
js/community-services.js

# 2. Updated CSS (with proximity badges)
css/community-services.css

# 3. NEW: Test page
test-zip-search.html
```

---

## Deployment Commands

### **Option 1: SCP Upload (Recommended)**

```bash
# Upload from your local machine
scp js/community-services.js root@185.193.126.13:/var/www/workforce-democracy/js/
scp css/community-services.css root@185.193.126.13:/var/www/workforce-democracy/css/
scp test-zip-search.html root@185.193.126.13:/var/www/workforce-democracy/
```

### **Option 2: Direct SSH Edit**

```bash
# SSH into server
ssh root@185.193.126.13

# Navigate to project
cd /var/www/workforce-democracy

# Create backup
cp js/community-services.js js/community-services.js.backup
cp css/community-services.css css/community-services.css.backup

# Upload new files (use your preferred method: nano, vim, or SFTP)
```

---

## Testing Checklist

### **1. Test Page (Debug Console)**

**URL:** `http://185.193.126.13/test-zip-search.html`

✅ Click "New York - ZIP 12061 + food bank"
✅ Check debug console for logs
✅ Open browser DevTools (F12) for full logs

**What to Look For:**
```
📦 API returned X total organizations
🔍 Sample org data: [...]
📊 Proximity calculated for X orgs
✅ Found X organizations in NY and nearby ZIPs
```

### **2. Main Page (index.html)**

**URL:** `http://185.193.126.13/index.html`

✅ Scroll to "Find Community Support" section
✅ Enter ZIP: 12061
✅ Enter Service: food bank
✅ Click "🔍 Search My State"
✅ Check for results

### **3. Browser Console (DevTools)**

Press **F12** and check Console tab:

**Expected Logs:**
- 🗺️ ZIP 12061 → New York (NY)
- 🔍 Searching via backend proxy: food bank
- 📦 API returned [X] total organizations
- 🔍 Sample org data: [array of orgs]
- 📊 Proximity calculated for [X] orgs
- 📊 Filtering results:
  - Before filter: X orgs
  - Same state: X orgs
  - After filter: X orgs

---

## Debug Scenarios

### **Scenario 1: Still No Results**

**Possible Causes:**
- ProPublica API has no data for this search
- Backend cache is stale
- API rate limiting

**Actions:**
1. Try broader search: "food" instead of "food bank"
2. Test different ZIP: 10001 (Manhattan)
3. Check backend logs:
   ```bash
   pm2 logs workforce-backend
   ```

### **Scenario 2: Results Show Wrong State**

**Check Console Logs:**
- Look at "Sample org data" - does it have `state` field?
- Check `sameState` values in proximity data
- Verify ZIP range mapping is correct

**Actions:**
1. Verify org has proper state field
2. Check if ZIP-to-state mapping is correct
3. Look for edge case ZIPs

### **Scenario 3: No Proximity Badges**

**Check:**
- Are proximity calculations running?
- Do orgs have `proximity` and `displayZip` properties?
- Is CSS loading correctly?

**Actions:**
1. Check console for errors
2. Verify CSS file uploaded
3. Inspect org card HTML in DevTools

---

## Backend Verification

### **Test API Directly:**

```bash
# Test search endpoint
curl "http://185.193.126.13:3001/api/nonprofits/search?q=food+bank"

# Look for NY results
curl "http://185.193.126.13:3001/api/nonprofits/search?q=food" | grep -i "new york"

# Test specific org
curl "http://185.193.126.13:3001/api/nonprofits/123456789"
```

### **Check Backend Logs:**

```bash
# SSH to server
ssh root@185.193.126.13

# View backend logs
pm2 logs workforce-backend

# Filter for errors
pm2 logs workforce-backend --err

# Check cache hits
pm2 logs workforce-backend | grep "Cache"
```

---

## Success Indicators

✅ **Debug logs appear in console**
✅ **API returns organizations (count > 0)**
✅ **Proximity calculations complete**
✅ **Filtered results show (count > 0)**
✅ **Organization cards display**
✅ **Proximity badges visible**
✅ **ZIP codes show correctly**

---

## Rollback (If Needed)

```bash
# SSH to server
ssh root@185.193.126.13
cd /var/www/workforce-democracy

# Restore backup
cp js/community-services.js.backup js/community-services.js
cp css/community-services.css.backup css/community-services.css

# Restart if needed (probably not necessary)
pm2 restart workforce-backend
```

---

## Next Steps After Testing

### **If Results Appear:**
1. ✅ Celebrate! 🎉
2. ✅ Verify proximity badges look good
3. ✅ Test multiple ZIP codes
4. ✅ Test different keywords
5. ✅ Update README with findings

### **If Still No Results:**
1. Share console logs from test page
2. Share backend logs from `pm2 logs`
3. Test ProPublica API response directly
4. Consider alternative data sources

---

## Quick Reference

**Server:** 185.193.126.13
**Backend Port:** 3001
**Project Path:** `/var/www/workforce-democracy`
**Backend Path:** `/root/workforce-backend`

**PM2 Commands:**
```bash
pm2 list                    # List all processes
pm2 logs workforce-backend  # View logs
pm2 restart workforce-backend  # Restart backend
pm2 info workforce-backend  # Process details
```

---

**Ready to deploy? Upload the 3 files and test!** 🚀

**Test URL:** http://185.193.126.13/test-zip-search.html
