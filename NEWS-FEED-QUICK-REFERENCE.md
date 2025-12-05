# 📰 News Feed Quick Reference Card

**Deploy in 15 minutes** | **Cost: $0** | **Status: ✅ Ready**

---

## 📁 Files to Upload

```
data/news-sources.json                  ← 15 vetted sources
js/news-feed.js                         ← RSS aggregator
js/news-ui.js                           ← UI controller
netlify/functions/rss-proxy.js          ← CORS proxy
news.html                               ← Main page
news-sources-transparency.html          ← Transparency page
```

---

## 🚀 Deploy Commands

### Option 1: Drag & Drop
1. Drag project folder to Netlify
2. Wait for deployment
3. Done!

### Option 2: Git Push
```bash
git add .
git commit -m "feat: Add news feed"
git push origin main
```

---

## ✅ Verify Deployment

1. **Visit**: `https://yoursite.netlify.app/news.html`
2. **Console should show**:
   ```
   [NewsFeed v1.0.0] Initializing...
   [NewsFeed] ✅ Loaded 15 vetted sources
   [NewsFeed] ✅ Fetched XX articles
   ```
3. **Netlify Functions**: Should show `rss-proxy` active
4. **Privacy Check**: Zero trackers detected

---

## 🔧 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Sources not loading | Check `data/news-sources.json` uploaded |
| Function not found | Check `netlify/functions/rss-proxy.js` exists |
| Articles not displaying | Verify Tailwind CSS loaded |
| Domain not whitelisted | Add to `allowedDomains` in proxy function |
| Old articles showing | Click "Clear Cache" → "Refresh News" |

---

## 📊 What Users Get

- **15 vetted news sources** (US, UK, Australia)
- **5 categories** (Civic, Labor, Business, Investigative, General)
- **Bias labels** (Least Biased, Left-Center, Left)
- **Factual accuracy badges** (High, Very High)
- **100% privacy** (zero tracking)
- **Free forever** ($0 cost)

---

## 📈 Next Steps

1. **Deploy** (15 min)
2. **Test** (30 min)
3. **Add to navigation** (5 min)
4. **Gather user feedback** (ongoing)
5. **Add more sources** (optional)

---

## 💡 Pro Tips

- **Cache**: Auto-expires after 30 minutes
- **Filters**: Work instantly (client-side)
- **Mobile**: Fully responsive out of the box
- **Privacy**: Verify with Privacy Badger extension
- **Sources**: Review quarterly (March, June, Sept, Dec)

---

## 🎯 Success = When Users

- Visit news page daily
- Click through to articles
- Use filters to personalize
- Trust your source vetting
- Suggest new sources

---

**Full Guide**: `NEWS-FEED-DEPLOYMENT-GUIDE.md`  
**Methodology**: `NEWS-SOURCES-VETTING-METHODOLOGY.md`  
**Summary**: `QUICK-WINS-IMPLEMENTATION-SUMMARY.md`

**Ready to deploy!** 🚀
