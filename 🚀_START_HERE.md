# 🚀 Start Here: Fix HTML Tags in Chat

## 🎯 What's the Problem?

Your AI chat is showing raw HTML like:
```
<p><strong>Thank you!</strong></p> <ul><li>Point 1</li></ul>
```

Instead of nice formatted text.

---

## ✅ The Solution (3 Steps)

### **Step 1: Update Backend** (5 minutes)
```bash
ssh your-user@185.193.126.13
cd /path/to/backend
nano ai-service.js
```

Find "Instructions:" section (around line 260), add this before the final line:

```
FORMATTING RULES:
- Use PLAIN TEXT only - NO HTML tags
- Use double line breaks (\\n\\n) to separate paragraphs
- Keep it natural and conversational
```

Save (Ctrl+X, Y, Enter), then:
```bash
pm2 restart workforce-democracy-backend
```

**See**: `BACKEND_EXACT_CHANGE.txt` for exact text

---

### **Step 2: Clear Cache** (1 minute)
```bash
psql -U wdp_user -d workforce_democracy
TRUNCATE TABLE cached_responses;
\q
```

---

### **Step 3: Deploy Frontend** (2 minutes)
Upload to Netlify:
- ✅ `js/bills-chat.js`
- ✅ `css/inline-chat-widgets.css`

---

## 🧪 Test It

1. Open Bills Chat
2. Ask: "Can you tell me about HR 1?"
3. Expected: Nice paragraphs, NO HTML tags visible

---

## 📚 Need More Help?

- **Quick Guide**: `QUICK_FIX_GUIDE.md`
- **Step-by-Step Checklist**: `FIX_CHECKLIST.md`
- **Visual Backend Guide**: `VISUAL_BACKEND_CHANGE.md`
- **Complete Summary**: `HTML_TAG_FIX_SUMMARY.md`

---

**Total Time**: ~8 minutes  
**Status**: Frontend ready ✅ | Backend needs update ⏳

Good luck! 💪
