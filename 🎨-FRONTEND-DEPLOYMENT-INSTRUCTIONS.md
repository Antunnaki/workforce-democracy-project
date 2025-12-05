# 🎨 Frontend Deployment Instructions - v37.9.12

**Purpose**: Update chat widget to use async polling (no more timeouts!)  
**Time**: 5 minutes  
**Files to update**: 2 (chat-clean.js, index.html)

---

## 📋 What You'll Do

1. Replace the `sendQuery()` function in `js/chat-clean.js`
2. Update version number in `index.html`
3. Clear browser cache
4. Test California policy query

---

## 🔧 Step 1: Update chat-clean.js

### **Option A: Replace via File Upload** (Recommended - Safer)

I'll create the complete updated `chat-clean.js` file for you. Then you can:

1. Download the new file
2. Upload it to `/var/www/workforce-democracy/js/` via FTP/SFTP
3. Overwrite the existing `chat-clean.js`

### **Option B: Manual Edit** (Faster if comfortable with nano/vim)

1. SSH into VPS
2. Open file: `nano /var/www/workforce-democracy/js/chat-clean.js`
3. Find line 506: `async function sendQuery(userMessage) {`
4. Delete lines 506-690 (the entire current sendQuery function)
5. Paste the new function from `FRONTEND-SENDQUERY-REPLACEMENT-v37.9.12.js`
6. Save and exit

---

## 📝 Step 2: Update index.html Version

Find this line in `index.html`:
```html
<script src="js/chat-clean.js?v=37.9.11" defer></script>
```

Change to:
```html
<script src="js/chat-clean.js?v=37.9.12" defer></script>
```

This forces browsers to fetch the new version (cache busting).

---

## 🧹 Step 3: Clear Browser Cache

**Important**: Old JavaScript will be cached!

- Chrome: Ctrl+Shift+Delete → Clear cached images and files
- Firefox: Ctrl+Shift+Delete → Cached Web Content
- Or: Hard refresh with Ctrl+F5

---

## ✅ Step 4: Test

1. Go to https://workforcedemocracyproject.org
2. Open chat widget
3. Ask: "Tell me about California labor policies"
4. **Expected**: 
   - See progress updates: "Searching RSS feeds... 20%"
   - Response after 60-90 seconds (NO TIMEOUT!)
   - Sources displayed at bottom

---

## 🆘 Which Option Do You Prefer?

**Option A**: I create complete `chat-clean.js` file → You upload via FTP  
**Option B**: You manually edit the file on VPS  

Let me know and I'll proceed! 🚀
