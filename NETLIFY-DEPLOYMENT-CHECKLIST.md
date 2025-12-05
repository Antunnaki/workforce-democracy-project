# Netlify Deployment Checklist - V36.5.0

**Date**: October 28, 2025  
**Backend Status**: 🟢 Online (185.193.126.13)  
**Frontend Status**: ⏳ Ready to deploy

---

## Quick Summary

You have:
- ✅ Backend API running on Njalla VPS
- ✅ Frontend files updated with backend integration
- ⏳ Need to upload updated files to Netlify

---

## Files to Download from GenSpark

### Required Files (5)

1. ✅ `js/backend-api.js` (NEW)
2. ✅ `js/inline-civic-chat.js` (MODIFIED)
3. ✅ `js/bills-chat.js` (MODIFIED)
4. ✅ `js/ethical-business-chat.js` (MODIFIED)
5. ✅ `index.html` (MODIFIED - line 3613)

---

## On Your Mac

### Step 1: Organize Files

```bash
# Create a deployment folder
mkdir -p ~/Documents/workforce-democracy-v36.5.0

# Navigate there
cd ~/Documents/workforce-democracy-v36.5.0
```

### Step 2: Download Files from GenSpark

1. In GenSpark editor, select each file
2. Click download button
3. Save to `~/Documents/workforce-democracy-v36.5.0/`

**Files to download**:
- `js/backend-api.js`
- `js/inline-civic-chat.js`
- `js/bills-chat.js`
- `js/ethical-business-chat.js`
- `index.html`

---

## Deploy to Netlify

### Option 1: Drag & Drop (Easiest)

1. Go to https://app.netlify.com
2. Log in to your account
3. Find your "Workforce Democracy Project" site
4. Click **"Deploys"** tab
5. Drag your entire project folder to the drop zone
6. Wait for deployment (1-2 minutes)
7. Done! ✅

### Option 2: Git Deploy (Advanced)

If you set up Git:

```bash
cd ~/Documents/workforce-democracy

# Add files
git add js/backend-api.js
git add js/inline-civic-chat.js
git add js/bills-chat.js
git add js/ethical-business-chat.js
git add index.html

# Commit
git commit -m "V36.5.0: Backend integration complete"

# Push
git push origin main
```

Netlify will auto-deploy from Git push.

---

## After Deployment

### Test 1: Check Backend Connection

1. Open your Netlify site: `https://workforcedemocracyproject.netlify.app`
2. Open browser console (F12)
3. Look for log messages:
   ```
   ✅ Backend API Integration V36.5.0 loaded
   🔗 Backend URL: http://185.193.126.13
   👤 User ID: user_...
   ```

### Test 2: Supreme Court Chat

1. Go to **Civic Engagement** tab
2. Click **Supreme Court** section
3. Click in the chat input (should auto-expand)
4. Type: **"What is Roe v Wade?"**
5. Press Enter
6. **Expected**: Detailed response about the case
7. Look for source indicator at bottom of response

### Test 3: Bills Chat

1. Go to **Vote on Bills** tab
2. Open Bills chat widget
3. Type: **"Tell me about healthcare bills"**
4. **Expected**: Response from backend
5. Check for cost transparency message

### Test 4: Check Console

Open browser console (F12) and look for:
- ✅ No errors
- ✅ Backend API loaded successfully
- ✅ Query responses showing source (cache/database/AI)

---

## Troubleshooting

### If chats don't respond:

1. **Check console for errors**:
   - Open F12 → Console tab
   - Look for red error messages

2. **Check backend status**:
   ```bash
   # On your Mac terminal
   curl http://185.193.126.13/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

3. **Check VPS** (if backend is down):
   ```bash
   ssh root@185.193.126.13
   pm2 status
   pm2 logs workforce-backend
   ```

### If backend returns errors:

1. **Check PM2 logs**:
   ```bash
   ssh root@185.193.126.13
   pm2 logs workforce-backend --lines 50
   ```

2. **Restart backend**:
   ```bash
   pm2 restart workforce-backend
   ```

### If frontend doesn't load new code:

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser settings → Clear cache
3. **Check Netlify deploy**: Make sure deployment finished successfully

---

## Success Checklist

After deployment, verify:

- [ ] Site loads without errors
- [ ] Supreme Court chat responds to "Roe v Wade"
- [ ] Bills chat responds to queries
- [ ] Ethical chat responds to queries
- [ ] Console shows backend API loaded
- [ ] Console shows no errors
- [ ] Backend health check returns OK

---

## Monitoring

### Check Backend Status Anytime

**From browser**:
```
http://185.193.126.13/health
```

**From terminal**:
```bash
curl http://185.193.126.13/health
```

### Check PM2 Status

```bash
ssh root@185.193.126.13
pm2 status
pm2 logs workforce-backend
```

---

## Cost Tracking

Expected usage with backend:
- **Cache hits**: 80% of queries (free)
- **Database hits**: 15% of queries (free)
- **AI queries**: 5% of queries (~$0.0001 each)

**Estimated monthly cost**: $1.50 - $3.00 (vs $30+ without backend)

---

## Next Steps (Optional)

After confirming everything works:

1. **Add SSL certificate** to backend (Let's Encrypt)
2. **Set up monitoring** (UptimeRobot, etc.)
3. **Add more court cases** to knowledge base
4. **Optimize database queries** for better performance
5. **Set up Git workflow** for easier deployments

---

## Support Resources

**Documentation**:
- `V36.5.0-BACKEND-INTEGRATION-COMPLETE.md` - Complete integration guide
- `DEPLOYMENT-GUIDE-COMPLETE.md` - Backend deployment guide
- `backend/README.md` - API documentation

**Backend Access**:
- SSH: `ssh root@185.193.126.13`
- Database: `sudo -u postgres psql -d workforce_democracy`

**Frontend**:
- Netlify Dashboard: https://app.netlify.com
- Your site: https://workforcedemocracyproject.netlify.app

---

## Questions?

If you encounter any issues:

1. Check console for errors (F12)
2. Check backend health: `curl http://185.193.126.13/health`
3. Check PM2 logs: `ssh root@185.193.126.13` → `pm2 logs`
4. Review `V36.5.0-BACKEND-INTEGRATION-COMPLETE.md`

---

**Ready to deploy?** 🚀

Download the 5 files from GenSpark, upload to Netlify, and test!
