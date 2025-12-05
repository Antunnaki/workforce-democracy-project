# 🚀 Quick Fix Guide: HTML Tags Showing in Chat

## 🔍 What Happened
You added a request for the AI to format responses with paragraphs, and the backend started sending HTML (`<p>`, `<strong>`, `<ul>`) which shows up as raw text instead of formatted content.

## ✅ The Fix (3 Steps)

---

### **Step 1: Update Backend Instructions** 🖥️

SSH into your VPS:
```bash
ssh your-user@185.193.126.13
cd /path/to/your/backend
nano ai-service.js
```

Find this section (around line 260-280):
```javascript
prompt += `Instructions:
Respond naturally and conversationally...
```

Add this at the end of the Instructions section (before the closing backtick):
```javascript
FORMATTING RULES:
- Use PLAIN TEXT only - no HTML tags (<p>, <strong>, <ul>, etc.)
- Use double line breaks (\\n\\n) to separate paragraphs
- Use single line breaks (\\n) for line breaks within a paragraph
- Use simple text formatting: *asterisks* for emphasis if needed, but keep it minimal
- Do not use bullet points with HTML - if you need lists, use simple dashes:
  - Like this
  - And this

Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation in plain text with paragraph breaks.
```

Save (Ctrl+X, Y, Enter) and restart:
```bash
pm2 restart workforce-democracy-backend
pm2 logs
```

---

### **Step 2: Clear Old Cached Responses** 🗑️

The database has cached the old HTML responses, so clear them:
```bash
psql -U wdp_user -d workforce_democracy
```

Then run:
```sql
TRUNCATE TABLE cached_responses;
\q
```

---

### **Step 3: Deploy Updated Frontend** 🚀

Upload to Netlify:
- **js/bills-chat.js** (updated typewriter effect that handles paragraphs)
- **css/inline-chat-widgets.css** (typing indicator styles)

---

## 🧪 Test It

1. Open your website
2. Open Bills Chat
3. Ask: "Can you tell me about HR 1 please?"
4. **Expected**: 
   - See typing indicator (●●●)
   - Text types out smoothly
   - Paragraphs are nicely spaced
   - **NO HTML TAGS visible**

---

## 📊 Before vs After

### ❌ Before (Broken)
```
<p><strong>Thank you!</strong></p> <ul><li>Point 1</li></ul>
```

### ✅ After (Fixed)
```
Thank you for your question!

This is the first paragraph with details.

This is the second paragraph with more information.

Feel free to ask more questions!
```

---

## 🆘 If It Still Shows HTML

1. **Check backend logs**: `pm2 logs`
2. **Verify cache is clear**: `SELECT COUNT(*) FROM cached_responses;` should return 0
3. **Check browser console**: Look for JavaScript errors
4. **Try incognito mode**: Rule out browser caching issues

---

## 📁 Files Modified

- ✅ `js/bills-chat.js` - Updated `typewriterEffect()` function
- ⏳ `backend/ai-service.js` - Need to add FORMATTING RULES
- ⏳ PostgreSQL - Need to clear cache

---

Need help with any step? Let me know! 😊
