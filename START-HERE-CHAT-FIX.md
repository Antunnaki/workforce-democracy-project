# 🚀 START HERE: Fix Your Chat in 3 Steps

## The Problem

Your chat isn't working. Most likely cause: **Missing GROQ_API_KEY** in backend configuration.

---

## ⚡ Quick Fix (5 minutes)

### Step 1: Run the Diagnostic Script

```bash
cd /var/www/workforce-democracy
chmod +x QUICK-FIX-CHAT.sh
./QUICK-FIX-CHAT.sh
```

This will:
- ✅ Check if .env file exists
- ✅ Verify GROQ_API_KEY is configured
- ✅ Check if backend server is running
- ✅ Test the API endpoints
- ✅ Give you specific fix instructions

### Step 2: Get Your Groq API Key (if needed)

1. Go to: https://console.groq.com
2. Sign up or log in
3. Click "Create API Key"
4. Copy the key (starts with `gsk_...`)

### Step 3: Add the Key and Restart

```bash
# Add API key to .env
cd /var/www/workforce-democracy/backend
nano .env

# Add this line (replace with your actual key):
GROQ_API_KEY=gsk_your_actual_key_here

# Save (Ctrl+O, Enter, Ctrl+X)

# Restart backend
pm2 restart workforce-backend

# Check logs
pm2 logs workforce-backend --lines 20
```

---

## ✅ Verify It Works

### Test 1: Backend Health
```bash
curl https://api.workforcedemocracyproject.org/health
```
**Expected:** `{"status":"ok", ...}`

### Test 2: LLM Service
```bash
curl https://api.workforcedemocracyproject.org/api/civic/llm-health
```
**Expected:** `{"available":true, ...}`

### Test 3: Chat Endpoint
```bash
curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is democracy?", "context": "general", "conversationHistory": []}'
```
**Expected:** JSON response with `"success":true` and a message about democracy

### Test 4: Frontend
1. Open https://workforcedemocracyproject.org
2. Press F12 (open browser console)
3. Try sending a chat message
4. Look for: `[CleanChat v37.4.5] ✅ Received response`

---

## 🎯 Common Issues & Fixes

### Issue 1: "GROQ_API_KEY not configured"
**Fix:**
```bash
cd /var/www/workforce-democracy/backend
echo "GROQ_API_KEY=gsk_YOUR_KEY_HERE" >> .env
pm2 restart workforce-backend
```

### Issue 2: "Backend server not running"
**Fix:**
```bash
cd /var/www/workforce-democracy/backend
pm2 start server.js --name workforce-backend
pm2 save
```

### Issue 3: "Connection refused" or "502 Bad Gateway"
**Fix:**
```bash
# Check if backend is listening on port 3001
sudo lsof -i :3001

# Check Nginx config
sudo nginx -t

# Restart Nginx if needed
sudo systemctl reload nginx
```

### Issue 4: "CORS error" in browser console
**Fix:**
```bash
# Check Nginx CORS configuration
sudo nano /etc/nginx/sites-enabled/workforce-backend

# Should have:
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
add_header Access-Control-Allow-Headers "Content-Type" always;

# Reload Nginx
sudo systemctl reload nginx
```

---

## 📚 Additional Resources

- **Detailed Guide:** `CHAT-TROUBLESHOOTING-GUIDE.md`
- **AI Handover:** `AI-HANDOVER-CLEAN.md`
- **Backend Logs:** `pm2 logs workforce-backend`
- **Frontend Code:** `/js/chat-clean.js`
- **Backend Code:** `/civic/backend/llm-proxy.js`

---

## 🧹 Bonus: Clean Up Your Project

After fixing chat, clean up the 500+ documentation files:

```bash
cd /var/www/workforce-democracy
chmod +x archive-old-docs.sh
./archive-old-docs.sh
```

This moves all old .md/.txt files to a dated archive folder, leaving only:
- README.md
- AI-HANDOVER-CLEAN.md
- CHAT-TROUBLESHOOTING-GUIDE.md
- START-HERE-CHAT-FIX.md (this file)

---

## 💡 Pro Tips

1. **Check logs first:** `pm2 logs workforce-backend --lines 50`
2. **Monitor in real-time:** `pm2 logs workforce-backend` (Ctrl+C to exit)
3. **Restart cleanly:** `pm2 restart workforce-backend --update-env`
4. **Test locally:** Use curl commands before testing on website

---

## 🎉 Success Checklist

- [ ] .env file exists with GROQ_API_KEY
- [ ] Backend shows "online" in `pm2 list`
- [ ] `/health` endpoint returns 200 OK
- [ ] `/api/civic/llm-health` shows `"available":true`
- [ ] Chat endpoint test returns success
- [ ] Browser console shows no errors
- [ ] Chat messages work on website

---

**Need help?** Check `CHAT-TROUBLESHOOTING-GUIDE.md` for step-by-step debugging.

**Still stuck?** Share the output of:
```bash
./QUICK-FIX-CHAT.sh > chat-diagnostic.txt 2>&1
cat chat-diagnostic.txt
```

*Last Updated: 2025-11-07*
