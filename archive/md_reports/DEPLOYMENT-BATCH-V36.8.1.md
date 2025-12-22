# 📦 Complete Deployment Batch - V36.8.1

**Date**: 2024-10-31  
**Purpose**: Deploy grey text fixes, backend prompt update, and ProPublica API integration

---

## 🎯 What This Deployment Fixes

1. ✅ Grey text in candidate chat (desktop) - **NEW FIX**
2. ✅ Grey text in Representatives chat (mobile)
3. ✅ Grey text in Bills chat (mobile)
4. ✅ Grey text in Jobs chat (mobile)
5. ✅ Grey text in FAQ chat (mobile)
6. ✅ Grey text in Ethical Business chat (mobile)
7. ✅ "Training data ends April 2023" message - **SECOND PROMPT SECTION FIXED**
8. ✅ ProPublica Nonprofit Explorer fully functional - **SCRIPT TAGS ADDED TO INDEX.HTML**

---

## 📋 Files to Deploy

### Backend (1 file - VPS)
```
backend/ai-service.js          → /var/www/workforce-democracy/backend/
```

### Frontend CSS (4 files - Netlify/CDN)
```
css/inline-civic-chat.css      → Your frontend hosting (grey text fix)
css/jobs-modern.css            → Your frontend hosting (grey text fix)
css/faq-new.css                → Your frontend hosting (grey text fix)
css/inline-chat-widgets.css    → Your frontend hosting (grey text fix - candidate chat)
```

### Frontend ProPublica (5 files - Netlify/CDN)
```
nonprofits.html                → Your frontend hosting
js/nonprofit-explorer.js       → Your frontend hosting
js/nonprofit-widgets.js        → Your frontend hosting
css/nonprofit-explorer.css     → Your frontend hosting
css/nonprofit-widget.css       → Your frontend hosting
```

### Frontend Updated (1 file - Netlify/CDN) ⭐ CRITICAL
```
index.html                     → Your frontend hosting (ProPublica script tags ADDED - V36.8.1)
```

**Important**: `index.html` now includes the ProPublica script tags that were missing. This is what enables the nonprofit search functionality.

---

## 🚀 Deployment Instructions

### Step 1: Deploy Backend to VPS

**Option A: SCP Upload** (Recommended)
```bash
# From your local project directory:
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js.v36.8.1

# Then on VPS:
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# Create backup of current file
cp ai-service.js ai-service.js.backup.$(date +%Y%m%d_%H%M%S)

# Replace with new version
mv ai-service.js.v36.8.1 ai-service.js

# Restart backend
pm2 restart workforce-backend

# Verify
pm2 logs workforce-backend --lines 50
```

**Option B: Manual Edit**
If you prefer to edit manually, change these sections in your VPS file:

**Line 35-72**: Replace CORE_PHILOSOPHY constant with neutral version
**Line 73-77**: Replace "WHEN HANDLING CURRENT EVENTS" section

---

### Step 2: Deploy Frontend Files

**If using Netlify** (drag & drop):
1. Open Netlify dashboard
2. Go to your site's Deploys tab
3. Drag these folders/files:
   - `css/` folder (4 updated CSS files)
   - `js/nonprofit-explorer.js`
   - `js/nonprofit-widgets.js`
   - `nonprofits.html`
   - `index.html`

**If using VPS for frontend too**:
```bash
# Upload all frontend files at once
scp css/inline-civic-chat.css root@185.193.126.13:/var/www/workforce-democracy/css/
scp css/jobs-modern.css root@185.193.126.13:/var/www/workforce-democracy/css/
scp css/faq-new.css root@185.193.126.13:/var/www/workforce-democracy/css/
scp css/inline-chat-widgets.css root@185.193.126.13:/var/www/workforce-democracy/css/
scp js/nonprofit-explorer.js root@185.193.126.13:/var/www/workforce-democracy/js/
scp js/nonprofit-widgets.js root@185.193.126.13:/var/www/workforce-democracy/js/
scp nonprofits.html root@185.193.126.13:/var/www/workforce-democracy/
scp index.html root@185.193.126.13:/var/www/workforce-democracy/
```

**If using rsync** (faster for batch):
```bash
rsync -avz --progress \
  css/inline-civic-chat.css \
  css/jobs-modern.css \
  css/faq-new.css \
  css/inline-chat-widgets.css \
  root@185.193.126.13:/var/www/workforce-democracy/css/

rsync -avz --progress \
  js/nonprofit-explorer.js \
  js/nonprofit-widgets.js \
  root@185.193.126.13:/var/www/workforce-democracy/js/

rsync -avz --progress \
  nonprofits.html \
  index.html \
  root@185.193.126.13:/var/www/workforce-democracy/
```

---

## ✅ Post-Deployment Testing Checklist

### Test #1: Backend Prompt Fixed
1. Go to Candidate Chat (desktop)
2. Ask: "What are recent developments for Mamdani?"
3. **Expected**: NO mention of "training data ends April 2023"
4. **Expected**: Cites recent sources with dates

### Test #2: Grey Text Fixed (Desktop)
1. Open Candidate Chat on desktop
2. Ask any question
3. **Expected**: Assistant responses in dark grey (#2d3748), NOT light grey

### Test #3: Grey Text Fixed (Mobile)
1. Open on iPhone (DuckDuckGo or Safari)
2. Test these chats:
   - Representatives chat
   - Bills chat  
   - Jobs chat
   - FAQ chat
   - Ethical Business chat
3. **Expected**: All assistant messages in dark grey (#2d3748)

### Test #4: ProPublica API Working
1. Go to https://yoursite.com/nonprofits.html
2. Search for "red cross"
3. **Expected**: Results load with organization details
4. Click on organization
5. **Expected**: Detailed view with financials, mission, etc.

### Test #5: ProPublica Widgets Working
1. Go to Ethical Business section
2. Click "Search Nonprofits" button
3. **Expected**: Inline search widget appears
4. Search for organization
5. **Expected**: Results display inline

---

## 🔍 Troubleshooting

### Backend Still Says "Training Data Ends April 2023"
```bash
# Verify file was updated:
ssh root@185.193.126.13
grep -A 7 "WHEN HANDLING CURRENT EVENTS" /var/www/workforce-democracy/backend/ai-service.js

# Should show new version:
# • You have access to web search for current information...

# If still old, PM2 may not have restarted:
pm2 restart workforce-backend --update-env
pm2 flush  # Clear logs
pm2 logs workforce-backend --lines 100
```

### Grey Text Still Appearing
```bash
# Check if CSS files were uploaded:
ls -lh /var/www/workforce-democracy/css/inline-civic-chat.css
ls -lh /var/www/workforce-democracy/css/inline-chat-widgets.css

# Verify file contents have the fix:
grep -A 2 "V36.8.1" /var/www/workforce-democracy/css/inline-chat-widgets.css

# Clear browser cache:
# Chrome: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Safari: Cmd+Option+E, then reload
```

### ProPublica API Not Loading
```bash
# Check if files exist:
ls -lh /var/www/workforce-democracy/js/nonprofit-explorer.js
ls -lh /var/www/workforce-democracy/nonprofits.html

# Check browser console for errors:
# F12 → Console tab
# Look for CORS errors or 404s

# Verify CSP allows ProPublica:
grep "projects.propublica.org" /var/www/workforce-democracy/index.html
```

---

## 📊 Deployment Summary

**Total Files**: 10
- Backend: 1 file (ai-service.js)
- CSS: 4 files (grey text fixes)
- JavaScript: 2 files (ProPublica API)
- HTML: 2 files (nonprofits page + updated index)
- CSS: 1 file (nonprofit widgets, already exists)

**Total Size**: ~150KB compressed

**Estimated Deployment Time**:
- Backend: 2 minutes (upload + restart)
- Frontend: 5 minutes (upload + cache clear)
- Testing: 10 minutes
- **Total**: ~15-20 minutes

**Expected Improvements**:
- ✅ All text readable (no more grey)
- ✅ No confusing "2023 training data" messages
- ✅ Full nonprofit search functionality
- ✅ Professional, polished user experience

---

## 🎉 What Users Will See After Deployment

### Before
- Grey text hard to read on mobile
- Confusing "my training ends in 2023" messages
- No nonprofit search functionality

### After  
- ✅ Clear, readable dark text everywhere
- ✅ AI clearly cites recent web sources
- ✅ Full nonprofit explorer with 1.8M+ organizations
- ✅ Inline nonprofit widgets in ethical business section
- ✅ Professional, trustworthy presentation

---

## 📝 Version Control

**Version**: V36.8.1  
**Date**: 2024-10-31  
**Changes**:
- Grey text fixes (6 chat interfaces)
- Backend prompt neutralization
- ProPublica API integration
- Security audit complete
- Rate limiting strategy complete

**Git Commands** (if using version control):
```bash
git add css/ js/ backend/ index.html nonprofits.html
git commit -m "V36.8.1: Grey text fixes, prompt update, ProPublica API"
git push origin main
```

---

## 🆘 Need Help?

If any deployment step fails:
1. Check the troubleshooting section above
2. Verify VPS file permissions: `ls -la /var/www/workforce-democracy/`
3. Check PM2 status: `pm2 status`
4. Check PM2 logs: `pm2 logs workforce-backend --lines 100`
5. Refer to previous deployment notes in README.md

**Remember**: Create backups before replacing files!
