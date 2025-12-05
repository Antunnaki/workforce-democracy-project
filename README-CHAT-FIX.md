# 📋 Quick Reference: Chat System Fix

## Files Created for You

1. **START-HERE-CHAT-FIX.md** ⭐ **START WITH THIS**
   - 3-step quick fix guide
   - Common issues and solutions
   - Success checklist

2. **QUICK-FIX-CHAT.sh** (Automated diagnostic script)
   - Checks all chat system components
   - Guides you through fixes
   - Run with: `./QUICK-FIX-CHAT.sh`

3. **CHAT-TROUBLESHOOTING-GUIDE.md** (Detailed debugging)
   - Complete diagnostic checklist
   - Step-by-step troubleshooting
   - Expected data flow diagrams

4. **AI-HANDOVER-CLEAN.md** (For future AI assistants)
   - Clean project overview
   - Essential directories only
   - Ignores documentation clutter

5. **archive-old-docs.sh** (Project cleanup)
   - Moves 500+ old .md/.txt files to archive
   - Keeps project root clean
   - Run with: `./archive-old-docs.sh`

---

## 🎯 Your Action Plan

### RIGHT NOW:
```bash
cd /var/www/workforce-democracy
chmod +x QUICK-FIX-CHAT.sh
./QUICK-FIX-CHAT.sh
```

### IF IT ASKS FOR API KEY:
1. Go to https://console.groq.com
2. Create an API key
3. Paste it when prompted

### AFTER CHAT WORKS:
```bash
chmod +x archive-old-docs.sh
./archive-old-docs.sh
```

---

## 🔍 What We Found

### The Chat System Architecture

**Frontend** (`/js/chat-clean.js` v37.4.5)
- Modern chat interface
- Instant text display (no typewriter effect)
- Superscript citations (¹ ² ³)
- Calls → `https://api.workforcedemocracyproject.org/api/civic/llm-chat`

**Backend** (`/civic/backend/llm-proxy.js` v37.4.5b)
- Express router handling `/api/civic/llm-chat`
- Proxies requests to Groq AI (Llama 3.3 70B)
- Searches web sources (DuckDuckGo, RSS feeds)
- Returns formatted response with citations

**AI Service** (`/backend/ai-service.js` v37.1.0)
- Groq API integration
- Smart caching (news: 7 days, finance: 90 days)
- Trusted source prioritization
- Citation validation

### The Most Likely Problem

**Missing GROQ_API_KEY in `/var/www/workforce-democracy/backend/.env`**

The backend code at line 144-149 in `llm-proxy.js`:
```javascript
if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY not configured in environment');
    return res.status(500).json({
        success: false,
        error: 'LLM service not configured. Please contact administrator.'
    });
}
```

Without this key, the chat cannot work.

---

## 📁 Essential Project Structure

```
/var/www/workforce-democracy/
├── index.html                    # Main site
├── js/                          # Frontend JavaScript
│   ├── chat-clean.js           # Chat interface
│   └── [35+ other JS files]
├── css/                         # Stylesheets
├── images/                      # Assets
├── backend/                     # Node.js API server
│   ├── server.js               # Main server (port 3001)
│   ├── .env                    # ⚠️ NEEDS GROQ_API_KEY
│   ├── ai-service.js           # AI integration
│   └── package.json
├── civic/                       # Civic platform features
│   └── backend/
│       └── llm-proxy.js        # Chat endpoint handler
└── docs/                        # Additional pages
    ├── faq.html
    ├── privacy.html
    └── learning.html
```

---

## 🎓 Understanding the Chat Flow

1. **User types message** in chat widget
2. **Frontend sends POST** to `/api/civic/llm-chat`:
   ```json
   {
     "message": "What is democracy?",
     "context": "general",
     "conversationHistory": []
   }
   ```

3. **Backend receives** at `/civic/backend/llm-proxy.js`
4. **Backend searches** web sources for context
5. **Backend calls Groq** with enriched message + source count
6. **Groq AI responds** with formatted answer + citations [1] [2] [3]
7. **Backend returns** JSON:
   ```json
   {
     "success": true,
     "message": "Democracy is a system... [1]",
     "sources": [
       {"title": "...", "url": "...", "excerpt": "..."}
     ]
   }
   ```

8. **Frontend displays** with clickable superscript citations¹ ² ³

---

## 🚨 If Chat Still Doesn't Work

### Check Backend Logs
```bash
pm2 logs workforce-backend --lines 100
```

Look for:
- `❌ GROQ_API_KEY not configured` → Add API key
- `Error: connect ECONNREFUSED` → Backend not running
- `CORS` errors → Nginx configuration issue
- Groq API errors → Check API key validity

### Check Frontend Console
Press F12 in browser, look for:
- `[CleanChat v37.4.5] 📤 Sending query` → Good, frontend working
- `Failed to fetch` → Backend unreachable
- `500 Internal Server Error` → Check backend logs
- CORS errors → Nginx needs CORS headers

### Manual Backend Restart
```bash
cd /var/www/workforce-democracy/backend
pm2 stop workforce-backend
pm2 delete workforce-backend
pm2 start server.js --name workforce-backend
pm2 save
pm2 logs workforce-backend
```

---

## 💻 Quick Command Reference

```bash
# Check backend status
pm2 list

# View backend logs
pm2 logs workforce-backend

# Restart backend
pm2 restart workforce-backend

# Test health
curl https://api.workforcedemocracyproject.org/health

# Test chat
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "context": "general"}'

# Check Nginx
sudo nginx -t
sudo systemctl reload nginx

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
```

---

## 📞 Next Steps After Chat Works

1. **Clean up project:**
   ```bash
   ./archive-old-docs.sh
   ```

2. **Test all chat features:**
   - Try different questions
   - Check citations appear
   - Verify sources are clickable
   - Test on mobile

3. **Monitor performance:**
   ```bash
   pm2 monit
   ```

4. **Read the handover for future AI:**
   ```bash
   cat AI-HANDOVER-CLEAN.md
   ```

---

## 🎉 That's It!

Your chat system should now be working. If you followed the quick fix guide and it's still not working, run the diagnostic script and share the output:

```bash
./QUICK-FIX-CHAT.sh > diagnostic-output.txt 2>&1
cat diagnostic-output.txt
```

---

*Created: 2025-11-07*  
*Purpose: Get chat working and clean up project documentation*
