# 🚀 READY TO DEPLOY TO GENSPARK - v37.18.7

## ✅ ALL FILES UPDATED AND READY

I've made all necessary changes. The test backend override is now ready to deploy!

---

## 📦 WHAT WAS CHANGED

### **1. Added Test Backend Override Script**
**File:** `js/test-backend-override.js`
- Overrides API URLs after page loads
- Points to: `https://api.workforcedemocracyproject.org/test`
- This routes to Version B (port 3002) via Nginx proxy

### **2. Updated index.html**
**File:** `index.html`
- Added script tag right before `</body>`
- Loads the override script last (so it overrides other config)

---

## 🎯 HOW TO DEPLOY TO GENSPARK

### **Option A: GenSpark One-Button Deploy**
1. In GenSpark, click your deploy button
2. It should automatically sync all files including the new ones
3. Done!

### **Option B: Manual File Upload (if needed)**
1. Download these 2 files from this chat:
   - `index.html`
   - `js/test-backend-override.js`
2. Upload them to GenSpark in the correct locations
3. Deploy

---

## 🧪 HOW TO TEST

After deploying to GenSpark:

1. **Open test site:** `https://sxcrlfyt.gensparkspace.com/`

2. **Clear browser cache:**
   - Chrome/Brave: Ctrl+Shift+Delete (or Cmd+Shift+Delete on Mac)
   - Or just hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

3. **Open Browser Console (F12)**

4. **Look for these messages:**
   ```
   🔧 [TEST OVERRIDE] Redirecting API calls to Version B
   ✅ [TEST OVERRIDE] CleanChat.apiBase = https://api.workforcedemocracyproject.org/test
   ✅ [TEST OVERRIDE] CONFIG.API_BASE_URL = https://api.workforcedemocracyproject.org/test
   ✅ [TEST OVERRIDE] BackendAPI.baseURL = https://api.workforcedemocracyproject.org/test
   ```

5. **Find a representative** (e.g., Chuck Schumer)

6. **Ask in the chat:**
   ```
   What is Chuck Schumer's voting record on healthcare?
   ```

---

## ✅ EXPECTED RESULTS

### **SUCCESS Indicators:**
- ✅ Console shows: `Deep research returned 11 sources`
- ✅ Response includes 7-11 sources (not just 1-2)
- ✅ Sources are Congress.gov bills (not random RSS articles)
- ✅ Citations are clickable: [1] [2] [3]
- ✅ Response talks about actual healthcare legislation

### **FAILURE Indicators:**
- ❌ Console shows: `Using global RSS/API sources`
- ❌ Only 1-2 sources
- ❌ Sources are Democracy Now or other RSS (not Congress.gov)
- ❌ Response says "I searched but didn't find articles"
- ❌ No clickable citations

---

## 🐛 IF IT DOESN'T WORK

**Check these things:**

1. **Console shows override messages?**
   - If NO → Cache issue, try incognito/private window
   - If YES → Continue testing

2. **Network tab shows calls to `/test` route?**
   - Open Network tab (F12)
   - Filter: `llm-chat`
   - URL should be: `https://api.workforcedemocracyproject.org/test/api/civic/llm-chat/...`

3. **Still failing?**
   - Send me:
     - Screenshot of console
     - Screenshot of Network tab
     - The response you got
     - Any error messages

---

## 📚 FILES CREATED/UPDATED

1. ✅ `js/test-backend-override.js` (NEW)
2. ✅ `index.html` (UPDATED - added script tag)
3. ✅ `🎯-MASTER-HANDOVER-DOCUMENT-🎯.md` (UPDATED)

---

## 🎉 WHAT HAPPENS NEXT

**If test succeeds:**
1. We remove the test override script
2. Deploy backend Version B → Version A
3. Update production frontend to use standard API
4. Deep research works everywhere!

**If test fails:**
1. Debug why Version B isn't being called
2. Check backend logs
3. Verify Nginx routing

---

## 💬 REPORT BACK

After you deploy and test, please let me know:
1. Did you see the override messages in console?
2. What response did you get?
3. How many sources? What type?
4. Any errors in console?

---

**You're one deploy away from testing! 🚀**
