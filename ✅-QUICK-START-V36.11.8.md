# ✅ Quick Start - V36.11.8 Deployment

## 🎯 What You Need to Do

### 1️⃣ Update Backend (5 minutes)

**Option A - If you have the updated files locally:**
\`\`\`bash
# SSH to your server
ssh root@185.193.126.13

# Navigate to backend
cd /root/workforce-democracy/backend

# Update server.js (copy the new CORS section)
# Lines 28-56 need the Netlify wildcard check

# Restart
pm2 restart workforce-backend

# Check logs
pm2 logs workforce-backend --lines 20
\`\`\`

**Option B - Manual edit on server:**
\`\`\`bash
ssh root@185.193.126.13
cd /root/workforce-democracy/backend
nano server.js
# Add after line 39:
#
# // V36.11.8: Allow ANY Netlify deploy preview URL
# const isNetlify = origin && (
#     origin.includes('.netlify.app') ||
#     origin.includes('workforcedemocracyproject.org')
# );
#
# Then change line 48 to:
# if (allowedOrigins.indexOf(origin) !== -1 || isNetlify) {

# Save (Ctrl+O, Enter, Ctrl+X)
pm2 restart workforce-backend
\`\`\`

### 2️⃣ Deploy Frontend to Netlify (2 minutes)

\`\`\`bash
# From your local project directory
netlify deploy --prod

# OR drag-and-drop to Netlify web interface
\`\`\`

### 3️⃣ Clear Cache & Test (1 minute)

1. **Hard refresh:** `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Search representatives:** Enter ZIP 92101
3. **Check header:** Should see DARK blue/purple boxes with clear white numbers
4. **Test chat:** Click "💬 Ask About Representatives", ask a question
5. **Check console:** Should see V36.11.8 logs, no 404 errors

## ✅ Success Checklist

- [ ] Backend restarted, logs show "Allowed origin" for Netlify
- [ ] Frontend deployed to Netlify successfully
- [ ] Console shows: `🚀 [REP-FINDER-SIMPLE V36.11.8]`
- [ ] Statistics boxes are DARK blue/purple (not transparent)
- [ ] White numbers clearly visible (no squinting)
- [ ] Chat responds with real AI (not generic fallback)
- [ ] No 404 errors in console
- [ ] Photos load (or show gradient fallback)

## 🚨 If Something's Wrong

### Chat Still Shows 404
```bash
# Check backend logs
ssh root@185.193.126.13
pm2 logs workforce-backend --lines 50

# Look for:
# ✅ "Allowed origin: https://your-netlify-url"
# ⚠️ "Blocked request from..." means CORS needs manual update
```

### Header Still Low Contrast
- Clear cache in Incognito mode
- Check Console for version (should be V36.11.8)
- Inspect element on stat box, background should be `#1e3a8a` not `rgba(...)`

### Photos Still Blocked
- Check Netlify deploy logs
- Verify `_headers` file deployed
- May take 1-2 minutes for CDN to update

## 🎉 That's It!

Total time: ~10 minutes  
Difficulty: Easy (mostly copy-paste)

**Questions?** Check [🚀-V36.11.8-NETLIFY-DEPLOYMENT.md](🚀-V36.11.8-NETLIFY-DEPLOYMENT.md) for detailed troubleshooting.
