# Backend Instruction Update - Plain Text Formatting

## 🎯 Problem
Backend is sending HTML tags (`<p>`, `<strong>`, `<ul>`, etc.) which appear as raw text when using the typewriter effect.

## ✅ Solution
Backend sends **plain text** with `\n\n` for paragraph breaks. Frontend handles formatting during typewriter effect.

---

## 📝 Backend Changes Required

### **File**: `backend/ai-service.js`

**Location**: Around lines 260-280 in the `buildContextualPrompt()` function

**Find this section**:
```javascript
prompt += `Instructions:
Respond naturally and conversationally, as if talking to a friend who genuinely wants to understand.

- Start directly with your explanation - no headers or labels
- Use a warm, patient tone that adapts to the user's energy
- Explain complex topics in simple, relatable terms
- When citing information, weave sources naturally into your response (like: "According to ProPublica's investigation..." or "Congress.gov shows that...")
- Only include source links when they genuinely add value to the discussion
- If the user seems frustrated, acknowledge their feelings with genuine empathy
- End with an open invitation for more questions, but make it feel natural, not formulaic

Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation.`;
```

**Replace with**:
```javascript
prompt += `Instructions:
Respond naturally and conversationally, as if talking to a friend who genuinely wants to understand.

- Start directly with your explanation - no headers or labels
- Use a warm, patient tone that adapts to the user's energy
- Explain complex topics in simple, relatable terms
- When citing information, weave sources naturally into your response (like: "According to ProPublica's investigation..." or "Congress.gov shows that...")
- Only include source links when they genuinely add value to the discussion
- If the user seems frustrated, acknowledge their feelings with genuine empathy
- End with an open invitation for more questions, but make it feel natural, not formulaic

FORMATTING RULES:
- Use PLAIN TEXT only - no HTML tags (<p>, <strong>, <ul>, etc.)
- Use double line breaks (\\n\\n) to separate paragraphs
- Use single line breaks (\\n) for line breaks within a paragraph
- Use simple text formatting: *asterisks* for emphasis if needed, but keep it minimal
- Do not use bullet points with HTML - if you need lists, use simple dashes:
  - Like this
  - And this

Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation in plain text with paragraph breaks.`;
```

---

## 🔧 How to Apply the Change

### **Option 1: SSH into VPS and Edit**
```bash
ssh your-user@185.193.126.13
cd /path/to/backend
nano ai-service.js

# Find the Instructions section (around line 260-280)
# Update the prompt as shown above
# Save and exit (Ctrl+X, Y, Enter)

# Restart the backend
pm2 restart workforce-democracy-backend
pm2 logs
```

### **Option 2: Ask Me to Provide Full Function**
If you prefer, I can provide the complete `buildContextualPrompt()` function with the changes already made, and you can replace the entire function.

---

## ✅ Testing After Change

1. **Clear PostgreSQL cache** (important - old cached responses will still have HTML):
```bash
ssh your-user@185.193.126.13
psql -U wdp_user -d workforce_democracy
```

```sql
TRUNCATE TABLE cached_responses;
```

2. **Test in Bills Chat**:
```
User: "Can you tell me about HR 1 please?"
```

Expected response should be **plain text** with paragraph breaks, no HTML tags visible.

3. **Check typewriter effect**:
- Should see typing indicator (●●●) first
- Text should type out character-by-character
- Paragraph breaks should format nicely
- No HTML tags visible

---

## 📊 Expected Behavior

### **Before (Current - Broken)**:
```
<p><strong>Thank you for your question!</strong></p> <ul><li>Point 1</li></ul>
```

### **After (Fixed)**:
```
Thank you for your question!

This is the first paragraph explaining something important.

This is the second paragraph with more details.

If you have more questions, feel free to ask!
```

---

## 🎨 Frontend Handling (Already Implemented)

The updated `typewriterEffect()` function in `js/bills-chat.js` now:
1. Splits text on `\n\n` to find paragraphs
2. Creates `<p>` elements for each paragraph
3. Types character-by-character within each paragraph
4. Converts single `\n` to `<br>` tags within paragraphs
5. Adds small pause between paragraphs (45ms vs 15ms)

---

## 📝 Next Steps

1. Apply backend change to `ai-service.js`
2. Restart backend with `pm2 restart`
3. Clear cached responses from PostgreSQL
4. Test in Bills Chat
5. Deploy updated `js/bills-chat.js` to Netlify (already ready)

