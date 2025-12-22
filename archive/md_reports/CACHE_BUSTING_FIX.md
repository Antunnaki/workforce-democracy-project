# Cache Busting Fix - Aggressive Approach
## Date: 2025-01-20

## The Problem

User is on mobile and after publishing changes multiple times, the website still looks the same. This strongly suggests **aggressive browser/service worker caching** is preventing fresh files from loading.

## Root Cause

Service workers are VERY aggressive with caching, especially on mobile browsers. Even with "network first" strategy, mobile Safari and mobile Chrome often serve cached versions of files.

## Solution Implemented

### 1. **Disabled Service Worker Caching (sw.js)**

Changed cache version to: `'wdp-v7-cache-disabled-debug'`

Modified fetch strategy to **NEVER cache**, always fetch fresh:
```javascript
// Fetch event - NETWORK ONLY (caching disabled for debugging)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request, {
            cache: 'no-store',  // Force fresh fetch, no caching
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        })
        .then((response) => {
            // DO NOT CACHE - just return fresh response
            return response;
        })
    );
});
```

### 2. **Added Cache-Busting Query Parameters (index.html)**

Added `?v=20250120-fix7` to ALL CSS and JavaScript file references:

```html
<!-- CSS -->
<link rel="stylesheet" href="css/main.css?v=20250120-fix7">

<!-- JavaScript -->
<script src="js/security.js?v=20250120-fix7"></script>
<script src="js/language.js?v=20250120-fix7"></script>
<script src="js/charts.js?v=20250120-fix7"></script>
<script src="js/civic.js?v=20250120-fix7"></script>
<script src="js/civic-voting.js?v=20250120-fix7"></script>
<script src="js/jobs.js?v=20250120-fix7"></script>
<script src="js/learning.js?v=20250120-fix7"></script>
<script src="js/faq.js?v=20250120-fix7"></script>
<script src="js/local.js?v=20250120-fix7"></script>
<script src="js/philosophies.js?v=20250120-fix7"></script>
<script src="js/main.js?v=20250120-fix7"></script>
```

## How This Works

### Cache-Busting Query Parameters
When a URL changes (even just the query string), browsers treat it as a completely different resource and **MUST** fetch it fresh from the server. The `?v=20250120-fix7` makes the browser think these are brand new files it's never seen before.

### Disabled Service Worker Caching
The service worker now explicitly tells the browser:
- `cache: 'no-store'` - Don't store in HTTP cache
- `Cache-Control: no-cache` - Don't use cached versions
- `Pragma: no-cache` - Legacy cache directive
- `Expires: 0` - Content is immediately stale

## Testing Instructions

**CRITICAL: You MUST unregister old service worker on mobile!**

### Option 1: Clear All Site Data (EASIEST)
1. On mobile, go to browser settings
2. Find "Site Settings" or "Privacy"
3. Find https://sxcrlfyt.gensparkspace.com/
4. Tap "Clear Data" or "Delete Data"
5. This removes everything including service worker
6. Reload the site

### Option 2: Visit in Private/Incognito Mode
1. Open DuckDuckGo in **Private Mode**
2. Visit https://sxcrlfyt.gensparkspace.com/
3. Service workers don't persist in private mode
4. This should show fresh content

### Option 3: Try Different Browser
1. If you have another browser on mobile (Safari, Chrome, Firefox)
2. Visit the site in that fresh browser
3. Should load new content

## What You Should See After Publishing

Once the cache is cleared:

1. **Philosophy Modal Test:**
   - Click "Learn More" on "Worker Empowerment"
   - Should see: **White background, navy text, Inter font**
   - Should NOT see: Grey backgrounds or white text

2. **FAQ Test:**
   - Expand any question
   - Should see: **White background, navy text, Inter font**
   - Should NOT see: Grey backgrounds or white text

3. **Consistency:**
   - Philosophy modals and FAQ sections should look **identical** in style
   - Only content differs

## If This Still Doesn't Work

If after clearing all site data and republishing, you STILL see old styling, then:

1. **Check if files are actually being published** - The publish system might not be deploying to the CDN correctly
2. **Check for CDN caching** - The hosting provider might have its own cache layer
3. **Check for proxy caching** - Mobile carriers sometimes cache content

## Next Steps

1. **Publish** these changes
2. **Clear all site data** for sxcrlfyt.gensparkspace.com on mobile
3. **Reload** the site
4. **Test** philosophy modals and FAQ sections
5. **Report back** what you see

## Notes for Future

Once we confirm the styling is working:
- We can re-enable service worker caching
- We should update the cache version whenever we make style changes
- Cache-busting query parameters should be updated with each deployment

---

**Files Modified:**
- `sw.js` - Disabled caching completely
- `index.html` - Added cache-busting query parameters to all CSS/JS
- (Previous styling fixes still in place)

**Cache Version:** v7-cache-disabled-debug
