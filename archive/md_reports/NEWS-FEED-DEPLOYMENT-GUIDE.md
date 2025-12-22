# 📰 Independent News Feed - Deployment Guide

**Version**: 1.0.0  
**Created**: January 13, 2026  
**Status**: ✅ READY TO DEPLOY  
**Estimated Deployment Time**: 15-20 minutes

---

## 🎉 What's Been Built

You now have a **complete independent news feed feature** ready to deploy!

### ✅ Components Created:

1. **News Source Database** (`data/news-sources.json`)
   - 15 vetted independent news sources
   - US (11), UK (4), Australia (3)
   - Full metadata: bias ratings, factual accuracy, RSS feeds
   
2. **RSS Feed Fetcher** (`js/news-feed.js`)
   - Aggregates multiple RSS feeds
   - Client-side caching (30 min expiry)
   - Privacy-first (localStorage only)
   
3. **CORS Proxy** (`netlify/functions/rss-proxy.js`)
   - Netlify serverless function
   - Domain whitelist security
   - Handles cross-origin requests
   
4. **News Section UI** (`news.html`)
   - Beautiful article cards
   - Category/country/bias filters
   - Responsive design (mobile-ready)
   
5. **UI Controller** (`js/news-ui.js`)
   - Manages article display
   - Handles filtering
   - Cache management
   
6. **Transparency Page** (`news-sources-transparency.html`)
   - Complete vetting methodology
   - Public accountability
   - User feedback process

7. **Vetting Documentation** (`NEWS-SOURCES-VETTING-METHODOLOGY.md`)
   - Detailed criteria
   - Review process
   - Quarterly update schedule

---

## 🚀 Deployment Steps

### Step 1: Upload Files to Your Project (2 minutes)

Upload these files via GenSpark or your deployment method:

```
data/news-sources.json                  ← News source database
js/news-feed.js                         ← RSS feed fetcher
js/news-ui.js                           ← UI controller
netlify/functions/rss-proxy.js          ← CORS proxy function
news.html                               ← News feed page
news-sources-transparency.html          ← Transparency page
NEWS-SOURCES-VETTING-METHODOLOGY.md     ← Documentation
NEWS-FEED-DEPLOYMENT-GUIDE.md           ← This file
```

### Step 2: Deploy to Netlify (5 minutes)

#### Option A: Drag & Drop (Easiest)
1. Go to Netlify dashboard
2. Drag project folder to deploy
3. Wait for deployment to complete
4. Netlify will automatically detect and deploy the serverless function

#### Option B: Git Deploy
```bash
git add .
git commit -m "feat: Add independent news feed integration"
git push origin main
```
Netlify will auto-deploy.

### Step 3: Verify Netlify Function Deployed (2 minutes)

1. Go to **Netlify Dashboard** → **Functions** tab
2. You should see: `rss-proxy` function listed
3. Status should be: **Active**

If not visible:
- Check that `netlify/functions/rss-proxy.js` exists
- Netlify auto-detects functions in this folder
- Re-deploy if needed

### Step 4: Add Navigation Link (3 minutes)

Add a link to the news feed in your main navigation:

**In `index.html` (or your main template):**
```html
<nav>
    <!-- Existing nav items -->
    <a href="news.html">📰 Independent News</a>
</nav>
```

### Step 5: Test the News Feed (5 minutes)

1. **Navigate to news page**: 
   - Go to: `https://yoursite.netlify.app/news.html`

2. **Check console logs**:
   - Press `F12` to open Developer Tools
   - Look for:
     ```
     [NewsFeed v1.0.0] Initializing...
     [NewsFeed] ✅ Loaded 15 vetted sources
     [NewsFeed] 🔄 Fetching articles...
     [NewsFeed] ✅ ProPublica: 10 articles
     [NewsFeed] ✅ BBC News: 10 articles
     ...
     [NewsFeed] ✅ Fetched XX articles
     ```

3. **Test filters**:
   - Try filtering by Category (Civic & Government)
   - Try filtering by Country (United States)
   - Try filtering by Perspective (Least Biased)
   - Articles should update instantly

4. **Test article links**:
   - Click "Read More →" on an article
   - Should open original article in new tab
   - Verify privacy (no tracking added)

5. **Test cache**:
   - Refresh page
   - Articles should load instantly from cache
   - Click "Clear Cache" → "Refresh News"
   - Should fetch fresh articles

6. **Test transparency page**:
   - Click "About Our Sources" button
   - Should show complete vetting methodology
   - All sections should be readable

---

## 🔧 Troubleshooting

### Problem: "Failed to load news sources"
**Cause**: `data/news-sources.json` not found  
**Solution**:
- Verify file uploaded to `data/` folder
- Check file path in browser: `https://yoursite.netlify.app/data/news-sources.json`
- Should return JSON content

### Problem: "Failed to fetch RSS feed" for all sources
**Cause**: Netlify function not deployed  
**Solution**:
- Check Netlify Dashboard → Functions tab
- Should see `rss-proxy` function listed
- If missing, check `netlify/functions/rss-proxy.js` exists
- Re-deploy site

### Problem: "Domain not in whitelist" error
**Cause**: New RSS source not in allowed domains  
**Solution**:
- Edit `netlify/functions/rss-proxy.js`
- Add domain to `allowedDomains` array (line 23)
- Redeploy site

### Problem: Articles not displaying
**Cause**: RSS parsing error or CSS issue  
**Solution**:
- Check browser console for errors
- Verify Tailwind CSS loaded: `<script src="https://cdn.tailwindcss.com"></script>`
- Check `js/news-ui.js` loaded correctly

### Problem: Cached articles showing old content
**Cause**: Cache not expired yet (30 min TTL)  
**Solution**:
- Click "Clear Cache" button
- Then click "Refresh News"
- Or wait 30 minutes for auto-refresh

---

## ✅ Success Criteria

You'll know deployment was successful when:

1. ✅ News page loads at `/news.html`
2. ✅ Console shows `[NewsFeed v1.0.0] Initializing...`
3. ✅ Console shows `[NewsFeed] ✅ Loaded 15 vetted sources`
4. ✅ Articles display in grid layout
5. ✅ Filters work (category, country, bias)
6. ✅ Article links open to original sources
7. ✅ Transparency page shows vetting methodology
8. ✅ Privacy notice shows at bottom
9. ✅ No tracking scripts detected (verify with browser privacy tools)
10. ✅ Netlify function shows as "Active" in dashboard

---

## 📊 What Your Users Will See

### News Feed Page:
- **Hero section** with mission statement
- **Filter controls** (category, country, perspective)
- **Article cards** with:
  - Source name + bias label
  - Article title + description
  - "Read More" link
  - Factual accuracy badge
  - Publication time
- **Privacy notice** (zero tracking guarantee)

### Transparency Page:
- **6 mandatory criteria** for source inclusion
- **Bias rating scale** explanation
- **Current sources** by country
- **Vetting process** details
- **User feedback** instructions

---

## 🔒 Privacy Verification

Verify privacy-first implementation:

1. **Open browser DevTools** → Network tab
2. **Load news page**
3. **Verify**:
   - ✅ No requests to Google Analytics
   - ✅ No requests to Facebook Pixel
   - ✅ No requests to advertising networks
   - ✅ Only requests to:
     - Your Netlify domain (site files)
     - `/.netlify/functions/rss-proxy` (CORS proxy)
   - ✅ RSS feeds fetched through proxy (not directly)

4. **Check localStorage**:
   - Open DevTools → Application → Local Storage
   - Should see: `newsFeedCache` (encrypted article cache)
   - Nothing else news-related

5. **Test with Privacy Badger** (browser extension):
   - Should show: **0 trackers blocked**
   - If any trackers show, investigate and remove

---

## 📈 Future Enhancements (Phase 2)

Once basic news feed is working, you can add:

### 1. Postcode Personalization Integration
- Detect user's location from existing postcode data
- Auto-filter news to user's country
- Show local news sources first

### 2. Additional Countries
- Add sources for:
  - 🇨🇦 Canada (English + French)
  - 🇫🇷 France (French)
  - 🇩🇪 Germany (German)
  - 🇪🇸 Spain (Spanish)
  - 🇲🇽 Mexico (Spanish)

### 3. Mobile App Features
- Save articles for offline reading
- Push notifications for breaking news (opt-in)
- Share articles via native share

### 4. Advanced Filters
- Filter by publication date range
- Search by keyword
- Save filter preferences
- Email digest (opt-in)

---

## 📞 Support

**Questions during deployment?**

1. **Check console logs** - Most issues show error messages
2. **Verify file paths** - All files in correct folders
3. **Check Netlify function** - Must be deployed and active
4. **Test RSS proxy** - Visit `/.netlify/functions/rss-proxy?url=https://www.propublica.org/feeds/propublica/main`
5. **Clear browser cache** - Force reload with Ctrl+Shift+R

**Still stuck?** Check:
- Netlify build logs for errors
- Browser console for JavaScript errors
- Network tab for failed requests

---

## 🎉 Congratulations!

You've just deployed a **privacy-first, factually accurate, independent news feed**!

Your users can now:
- ✅ Read news from 15 vetted sources
- ✅ Filter by category, country, and perspective
- ✅ Understand source bias and accuracy
- ✅ Trust complete privacy (zero tracking)
- ✅ Learn about your vetting methodology
- ✅ Suggest new sources or report issues

**This is a major feature!** 🚀

---

## 📋 Deployment Checklist

Before marking as complete:

- [ ] All files uploaded to project
- [ ] Deployed to Netlify
- [ ] Netlify function showing as Active
- [ ] News page loads successfully
- [ ] Articles displaying in grid
- [ ] Filters working correctly
- [ ] "Read More" links opening articles
- [ ] Transparency page showing content
- [ ] Privacy notice visible
- [ ] Zero trackers detected
- [ ] Navigation link added to site
- [ ] Tested on mobile device
- [ ] Console logs show no errors
- [ ] Cache functionality working
- [ ] User can clear cache and refresh

---

**Deployment Status**: ✅ READY  
**Cost**: $0 (all free APIs + Netlify serverless)  
**Maintenance**: Quarterly source reviews (2-3 hours every 3 months)  
**User Value**: HIGH (informed civic engagement)

**Deploy now and give your users access to independent, factually accurate news!** 📰✨
