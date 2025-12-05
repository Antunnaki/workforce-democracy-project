# 📸 Visual Guide: Backend Change

## 🎯 What You're Looking For in ai-service.js

Around **lines 260-280**, you'll see the `buildContextualPrompt()` function ending with an Instructions section.

---

## 🔍 Current Code (What You Have Now)

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
    
    return prompt;
}
```

---

## ✅ Updated Code (What You Need)

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
- Use PLAIN TEXT only - NO HTML tags like <p>, <strong>, <ul>, <li>, <br>, etc.
- Use double line breaks (\\n\\n) to separate paragraphs
- Use single line breaks (\\n) for line breaks within a paragraph
- Keep formatting minimal and natural
- If you need to emphasize something, just use clear language - no special formatting needed
- Write as if you're typing a message to someone - natural text with paragraph breaks

Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation in plain text with paragraph breaks.`;
    
    return prompt;
}
```

---

## 🎨 What Changed

### Added Section (11 lines):
```javascript
FORMATTING RULES:
- Use PLAIN TEXT only - NO HTML tags like <p>, <strong>, <ul>, <li>, <br>, etc.
- Use double line breaks (\\n\\n) to separate paragraphs
- Use single line breaks (\\n) for line breaks within a paragraph
- Keep formatting minimal and natural
- If you need to emphasize something, just use clear language - no special formatting needed
- Write as if you're typing a message to someone - natural text with paragraph breaks
```

### Modified Line:
```javascript
// OLD:
Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation.`;

// NEW:
Write as one flowing response - no section headers, no rigid structure. Just helpful, compassionate conversation in plain text with paragraph breaks.`;
```

---

## 🛠️ How to Find It in nano

1. Open file: `nano ai-service.js`
2. Press **Ctrl+W** (search)
3. Type: **Instructions:**
4. Press Enter
5. Scroll down a bit to see the full Instructions block
6. Add the FORMATTING RULES section before the final closing backtick

---

## 🔍 Search Terms to Find the Exact Spot

Search for any of these unique phrases:
- `Instructions:`
- `Write as one flowing response`
- `Just helpful, compassionate conversation`
- `buildContextualPrompt`

---

## 💾 After Editing

1. **Save**: Ctrl+X, then Y, then Enter
2. **Verify syntax**: `node -c ai-service.js` (should output nothing if valid)
3. **Restart**: `pm2 restart workforce-democracy-backend`
4. **Watch logs**: `pm2 logs` (Ctrl+C to exit)

---

## ✅ How to Confirm It Worked

### **Check the code**:
```bash
grep -A 8 "FORMATTING RULES" backend/ai-service.js
```

Should output the FORMATTING RULES section.

### **Check PM2 logs**:
```bash
pm2 logs --lines 50
```

Should show backend restarted successfully, no errors.

### **Test a query**:
Use the Bills Chat and look at the response. Should be plain text with paragraph breaks, **no HTML tags**.

---

## 🆘 Common Issues

### **"No such file or directory"**
- Make sure you're in the backend directory: `cd /path/to/backend`
- List files: `ls -la` (you should see ai-service.js)

### **"Syntax error after editing"**
- Run: `node -c ai-service.js` to see the exact error
- Most likely: forgot a closing backtick or quote
- Reopen nano and carefully check the Instructions section

### **"Backend won't restart"**
- Check PM2 status: `pm2 list`
- Check logs: `pm2 logs`
- Look for error messages about the change

---

## 📋 Quick Commands Reference

```bash
# Navigate to backend
cd /path/to/backend

# Edit file
nano ai-service.js

# Search inside nano
Ctrl+W, type "Instructions:", press Enter

# Save and exit nano
Ctrl+X, then Y, then Enter

# Verify syntax
node -c ai-service.js

# Restart backend
pm2 restart workforce-democracy-backend

# Watch logs
pm2 logs

# Check if change worked
grep "FORMATTING RULES" backend/ai-service.js
```

---

**Remember**: After making this change, you MUST clear the PostgreSQL cache or old HTML responses will still show up!

```bash
psql -U wdp_user -d workforce_democracy
TRUNCATE TABLE cached_responses;
\q
```

---

Good luck! You've got this! 💪
