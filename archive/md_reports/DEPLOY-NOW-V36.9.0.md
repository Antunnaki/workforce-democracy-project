# 🚀 Deploy Community Services Discovery System - V36.9.0

## Quick Start - 3 Steps to Deploy

### Step 1: Upload New Files ⬆️

Upload these 2 new files to your server:

```
js/community-services.js          (16.2 KB)
css/community-services.css        (9.6 KB)
```

**Upload Locations:**
- `js/community-services.js` → `/var/www/html/js/`
- `css/community-services.css` → `/var/www/html/css/`

### Step 2: Update index.html 📝

Replace your current `index.html` with the modified version that includes:

**Line 301** - CSS include:
```html
<link rel="stylesheet" href="css/community-services.css?v=20250201-COMMUNITY-SERVICES">
```

**Line 1651** - Widget container:
```html
<div id="communityServicesWidget"></div>
```

**Line 3718** - JavaScript include:
```html
<script src="js/community-services.js?v=20250201-COMMUNITY-SERVICES" defer></script>
```

### Step 3: Test 🧪

1. Open your homepage
2. Scroll to **Civic Engagement** section (bottom)
3. Look for new **"Find Community Support"** widget
4. Click **"Legal Aid"** category
5. Verify organizations load

---

## What You'll See

### Before Deployment
```
❌ Unable to load organizations. Please try again.
```

### After Deployment
```
💙 Find Community Support
   Discover services and ethical businesses

[🤝 Community Services]  [🌟 Ethical Businesses]

⚖️ Legal Aid          🏠 Housing Support
🏥 Healthcare         🍽️ Food Banks
✊ Workers' Rights    🧠 Mental Health
```

---

## Files Summary

### New Files Created
1. **js/community-services.js** - Main widget functionality
   - ProPublica API integration
   - 6 community service categories
   - 6 curated ethical businesses
   - Error handling and caching

2. **css/community-services.css** - Complete styling
   - Responsive design
   - Mobile-friendly
   - Matches site aesthetic

### Modified Files
1. **index.html** - Updated with:
   - New widget container (line 1651)
   - CSS include (line 301)
   - JS include (line 3718)

### Optional Test File
- **test-nonprofit-api.html** - API debugging tool (upload if needed)

---

## Command Line Deployment

```bash
# Option 1: SCP Upload
scp js/community-services.js user@server:/var/www/html/js/
scp css/community-services.css user@server:/var/www/html/css/
scp index.html user@server:/var/www/html/

# Option 2: Git Push (if using version control)
git add js/community-services.js css/community-services.css index.html
git commit -m "Implement community services discovery V36.9"
git push origin main
```

---

## Post-Deployment Testing

### ✅ Community Services Tab
1. Click **"Legal Aid"** → Should show 6 organizations
2. Click **"Housing Support"** → Should show 6 organizations
3. Click on an organization card → Opens ProPublica in new tab
4. Click **"Search All Organizations"** → Opens nonprofits.html

### ✅ Ethical Business Tab
1. Click **"Ethical Businesses"** tab at top
2. Should display 6 business cards:
   - Equal Exchange (Coffee)
   - Patagonia (Clothing)
   - Ben & Jerry's (Ice Cream)
   - The Body Shop (Beauty)
   - King Arthur Baking (Food)
   - Seventh Generation (Cleaning)
3. Click **"Visit Website"** → Opens business site

### ✅ Mobile Testing
1. Open on phone
2. Verify layout stacks properly
3. Test touch interactions
4. Scroll should be smooth

---

## Troubleshooting

### Widget Not Showing
```bash
# Check files uploaded correctly
ls -lh /var/www/html/js/community-services.js
ls -lh /var/www/html/css/community-services.css

# Clear browser cache
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

### API Errors
```bash
# Test API directly
Open: test-nonprofit-api.html in browser
Click "Test 'civil rights'" button
Check browser console (F12)
```

### Styling Issues
```html
<!-- Verify CSS loaded in browser DevTools (F12) -->
<!-- Network tab → Look for community-services.css -->
<!-- Should return 200 OK -->
```

---

## 🎯 What Changed

**Removed:**
- ❌ Broken "Advocacy Organizations" widget
- ❌ All "IRS verification" language
- ❌ ProPublica-specific nonprofit verification focus

**Added:**
- ✅ Community Services Discovery (6 categories)
- ✅ Ethical Business Directory (6 businesses)
- ✅ View toggle (Services ↔ Businesses)
- ✅ ProPublica API integration with caching
- ✅ Mobile-responsive design
- ✅ Error handling with friendly messages

---

## 📊 Expected Performance

- **Initial Load:** < 100ms (lightweight widget)
- **API Search:** 200-500ms per category
- **Cache Duration:** 15 minutes (reduces API calls)
- **Organizations Shown:** Up to 6 per category
- **Ethical Businesses:** 6 pre-loaded (instant)

---

## 🔧 Maintenance

### To Add More Ethical Businesses

Edit `js/community-services.js`:

```javascript
// Find ETHICAL_BUSINESSES array (around line 41)
// Add new entry:
{
    name: 'New Business Name',
    type: 'Business Type',
    description: 'Why they are ethical',
    website: 'https://example.com',
    category: 'Category',
    icon: '🆕'
}
```

### To Add More Service Categories

Edit `js/community-services.js`:

```javascript
// Find SERVICE_CATEGORIES object (around line 23)
// Add new category:
'new-category': {
    icon: '🆕',
    title: 'New Service',
    description: 'Description here',
    searchTerms: ['search', 'terms'],
    color: '#667eea'
}
```

---

## 📞 Support

**Documentation:** See `COMMUNITY-SERVICES-IMPLEMENTATION-V36.9.md`

**API Testing:** Use `test-nonprofit-api.html`

**Questions:** Check browser console (F12) for error messages

---

## ✨ Success Criteria

After deployment, you should have:

1. ✅ Working community services widget in Civic section
2. ✅ 6 clickable service categories
3. ✅ Ethical business directory with 6 businesses
4. ✅ No "IRS verification" language anywhere
5. ✅ Mobile-friendly responsive design
6. ✅ Proper error handling

---

**Ready? Upload the files and test!** 🚀

The widget will automatically initialize when the page loads. No additional configuration needed.
