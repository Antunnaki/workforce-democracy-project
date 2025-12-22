# 🚀 NETLIFY TEST SITE SETUP

## 🎯 WHAT YOU NEED TO DO

You already use Netlify for production (`workforcedemocracyproject.org`), so setting up a test site is easy!

---

## 📋 OPTION A: CREATE SEPARATE TEST SITE (Recommended)

### **Step 1: Log into Netlify**
Go to: https://app.netlify.com/

### **Step 2: Add New Site**
1. Click "Add new site" button
2. Choose "Deploy manually"

### **Step 3: Prepare Your Files**
You need to deploy with the test override script:

**Make sure these files are in your project:**
- ✅ `index.html` (with the test override script tag)
- ✅ `js/test-backend-override.js` (the new file I created)
- ✅ All other project files

### **Step 4: Deploy**
1. Drag your ENTIRE project folder into Netlify
2. Wait 30 seconds for deployment
3. You'll get a URL like: `random-name-123.netlify.app`

### **Step 5: Rename (Optional)**
1. Go to Site Settings → Site Details
2. Click "Change site name"
3. Name it something like: `workforce-test`
4. Your URL becomes: `workforce-test.netlify.app`

### **Step 6: Test!**
1. Open `https://workforce-test.netlify.app`
2. Press F12 (open console)
3. Look for: `🔧 [TEST OVERRIDE] Redirecting API calls to Version B`
4. Find Chuck Schumer
5. Ask: "What is Chuck Schumer's voting record on healthcare?"

---

## 📋 OPTION B: USE PRODUCTION SITE TEMPORARILY

If you want to test on your main site temporarily:

### **Step 1: Add Test Override to Production**
1. Add `js/test-backend-override.js` to your production files
2. Add the script tag to `index.html` before `</body>`:
   ```html
   <script src="js/test-backend-override.js"></script>
   ```

### **Step 2: Deploy to Production**
1. Drag updated folder to Netlify (your production site)
2. Test on `workforcedemocracyproject.org`

### **Step 3: Remove After Testing**
1. Once confirmed working, remove the script tag
2. Delete `test-backend-override.js`
3. Deploy to production again (clean)

⚠️ **Warning:** This means production temporarily calls test backend. Your choice!

---

## 🔍 ABOUT THE "ORIGIN RETURNED ERROR CODE"

This message from Netlify Drop usually means:

**Possible causes:**
1. ✅ Upload succeeded, but trying to preview before build completes
2. ✅ File uploaded but not a valid site structure
3. ✅ Temporary Netlify Drop glitch

**What to do:**
- Ignore it if using your main Netlify account (Option A)
- Netlify Drop is for quick tests, your account is better

---

## ✅ RECOMMENDED APPROACH

### **Create a Test Site (Option A)**

**Why this is better:**
- ✅ Separate from production
- ✅ Can test without affecting live site
- ✅ Keep test site for future testing
- ✅ Professional workflow

**Steps:**
1. Log into your Netlify account
2. "Add new site" → "Deploy manually"
3. Drag project folder
4. Get test URL
5. Test there
6. When ready, deploy to production separately

---

## 🎯 QUICK CHECKLIST

**Before you deploy, make sure:**
- [ ] `index.html` has the test override script tag (before `</body>`)
- [ ] `js/test-backend-override.js` file exists in your project
- [ ] All other files are present
- [ ] You're deploying the entire project folder

**The script tag should look like:**
```html
    <!-- TEST BACKEND OVERRIDE - v37.18.7 -->
    <script src="js/test-backend-override.js"></script>

</body>
</html>
```

---

## 🧪 WHAT TO EXPECT AFTER DEPLOYMENT

### **Console Messages:**
```
🔧 [TEST OVERRIDE] Redirecting API calls to Version B
✅ [TEST OVERRIDE] CleanChat.apiBase = https://api.workforcedemocracyproject.org/test
✅ [TEST OVERRIDE] CONFIG.API_BASE_URL = https://api.workforcedemocracyproject.org/test
✅ [TEST OVERRIDE] BackendAPI.baseURL = https://api.workforcedemocracyproject.org/test
🎯 [TEST OVERRIDE] All API endpoints now pointing to Version B (port 3002)
```

### **When Testing:**
- Find Chuck Schumer (or any representative)
- Ask about healthcare voting record
- Should see: "Deep research returned 11 sources" in console
- Should see: 7-11 Congress.gov bill sources
- Should see: Clickable citations [1] [2] [3]

---

## 🐛 IF YOU GET ERRORS

### **"Origin returned error code" from Netlify Drop:**
- This is normal with Drop
- Use your main Netlify account instead
- Create a new site manually

### **No console messages:**
- Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R)
- Or clear cache: Ctrl+Shift+Delete
- Or try incognito window

### **Console shows override but no deep research:**
- Check Network tab (F12)
- Look for `/test` in the API call URL
- Should be: `https://api.workforcedemocracyproject.org/test/api/civic/llm-chat`

---

## 💡 MY RECOMMENDATION

**Do Option A - Create Test Site:**

1. **Log into Netlify:** https://app.netlify.com/
2. **Click:** "Add new site"
3. **Choose:** "Deploy manually"
4. **Drag:** Your entire project folder
5. **Wait:** 30 seconds
6. **Test:** On the new URL
7. **Report back:** What you see!

---

## 📞 WHAT TO TELL ME

After you deploy, let me know:

1. **URL:** What's your test site URL?
2. **Console:** Do you see the override messages?
3. **Response:** What did Chuck Schumer query return?
4. **Sources:** How many? What type?
5. **Errors:** Any console errors?

---

**You're using Netlify already, so this should be smooth! 🎉**

Just create a second site for testing and we'll see if deep research triggers!
