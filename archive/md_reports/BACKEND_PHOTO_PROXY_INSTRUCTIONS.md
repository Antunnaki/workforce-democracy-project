# Backend Photo Proxy - Fix for GenSpark CSP Blocking Photos

## Problem Identified
GenSpark's **platform-level Content Security Policy (CSP)** blocks external image sources like:
- `www.congress.gov`
- `assembly.state.ny.us`
- `www.nysenate.gov`

Our meta tag CSP in `index.html` is **overridden** by GenSpark's HTTP header CSP (headers take priority).

Console errors show:
```
[Error] Refused to load https://www.congress.gov/img/member/s000148_200.jpg 
because it does not appear in the img-src directive of the Content Security Policy.
```

---

## Solution: Backend Photo Proxy

Since we can't change GenSpark's CSP, we'll proxy external photos through your backend at `api.workforcedemocracyproject.org`.

### Benefits:
✅ All photos load from your own domain (allowed by GenSpark CSP)  
✅ Fast response with caching  
✅ Fallback to placeholder if government photo unavailable  
✅ CORS handled by your backend  

---

## Implementation Steps

### Step 1: Add Photo Proxy Route to Backend

**File:** `/var/www/workforce-democracy/backend/server.js`

Add this route **BEFORE** your existing `/api/civic/representatives` route:

```javascript
// V36.12.0: Photo Proxy Route - Bypass GenSpark CSP restrictions
app.get('/api/photo-proxy', async (req, res) => {
    const photoUrl = req.query.url;
    
    // Validate URL parameter
    if (!photoUrl) {
        console.log('❌ Photo proxy: Missing URL parameter');
        return res.status(400).json({ error: 'Missing url parameter' });
    }
    
    // Security: Only allow government photo domains
    const allowedDomains = [
        'www.congress.gov',
        'bioguide.congress.gov',
        'www.senate.ca.gov',
        'www.assembly.ca.gov',
        'assembly.state.ny.us',
        'www.nysenate.gov',
        'www.joincalifornia.com'
    ];
    
    const urlObj = new URL(photoUrl);
    const isAllowedDomain = allowedDomains.some(domain => urlObj.hostname.includes(domain));
    
    if (!isAllowedDomain) {
        console.log('⚠️ Photo proxy: Blocked unauthorized domain:', urlObj.hostname);
        return res.status(403).json({ error: 'Domain not allowed' });
    }
    
    try {
        console.log('📸 Photo proxy: Fetching', photoUrl);
        
        // Fetch photo from government source
        const response = await fetch(photoUrl, {
            headers: {
                'User-Agent': 'WorkforceDemocracyProject/1.0 (civic transparency platform)'
            },
            timeout: 5000 // 5 second timeout
        });
        
        if (!response.ok) {
            console.log(`❌ Photo proxy: HTTP ${response.status} from source`);
            return res.status(response.status).json({ error: `Source returned ${response.status}` });
        }
        
        // Get image data
        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        
        console.log(`✅ Photo proxy: Success (${buffer.length} bytes, ${contentType})`);
        
        // Cache for 7 days (photos rarely change)
        res.set({
            'Content-Type': contentType,
            'Content-Length': buffer.length,
            'Cache-Control': 'public, max-age=604800', // 7 days
            'Access-Control-Allow-Origin': '*' // Allow all origins
        });
        
        res.send(buffer);
        
    } catch (error) {
        console.error('❌ Photo proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch photo', details: error.message });
    }
});
```

### Step 2: Update Frontend to Use Proxy

**File:** `js/rep-finder-simple.js`

Find the photo URL generation (around line 280-300) and modify it to use the proxy:

**BEFORE:**
```javascript
const photoUrl = rep.photo_url || '';
```

**AFTER:**
```javascript
// V36.12.0: Use backend photo proxy to bypass GenSpark CSP
const photoUrl = rep.photo_url 
    ? `https://api.workforcedemocracyproject.org/api/photo-proxy?url=${encodeURIComponent(rep.photo_url)}`
    : '';
```

---

## Deployment Instructions

### On Your VPS:

1. **SSH into your VPS:**
   ```bash
   ssh your-user@your-vps-ip
   ```

2. **Edit server.js:**
   ```bash
   cd /var/www/workforce-democracy/backend
   nano server.js
   ```
   
3. **Add the photo proxy route** (copy from Step 1 above)

4. **Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

5. **Restart backend with PM2:**
   ```bash
   pm2 restart workforce-democracy-backend
   pm2 logs workforce-democracy-backend --lines 50
   ```

6. **Verify it's running:**
   ```bash
   pm2 status
   ```
   
   Should show:
   ```
   │ workforce-democracy-backend │ online │ 0 │
   ```

7. **Test the proxy endpoint:**
   ```bash
   curl "https://api.workforcedemocracyproject.org/api/photo-proxy?url=https://www.congress.gov/img/member/s000148_200.jpg" -I
   ```
   
   Should return:
   ```
   HTTP/2 200
   content-type: image/jpeg
   cache-control: public, max-age=604800
   ```

### On GenSpark (Frontend):

1. **Deploy updated files:**
   - `index.html` (with new CSS reference)
   - `css/contrast-fix-v36.12.0.css` (with explicit #ffffff)
   - `js/rep-finder-simple.js` (with photo proxy URL)

2. **Clear GenSpark deployment cache** (if option exists)

3. **Test in browser:**
   - Visit site
   - Open DevTools Console (F12)
   - Search for representatives
   - Photos should now load through proxy
   - Look for: `📸 Photo proxy: Fetching...` in backend logs

---

## Verification Checklist

### Backend Verification:
- [ ] Photo proxy route added to `server.js`
- [ ] PM2 shows backend online with 0 restarts
- [ ] `curl` test returns HTTP 200 with image/jpeg
- [ ] Backend logs show `📸 Photo proxy: Fetching...` messages

### Frontend Verification:
- [ ] Console shows `[REP-FINDER V36.12.0]` (after you update version)
- [ ] No more "Refused to load" CSP errors
- [ ] Photos load instead of placeholders
- [ ] Network tab shows photos coming from `api.workforcedemocracyproject.org`

### Contrast Verification:
- [ ] Header numbers "2" and "5" are white and visible
- [ ] Inspect element shows `color: #ffffff !important`
- [ ] Text shadow visible for extra contrast

---

## Troubleshooting

### If photos still don't load:
1. Check backend logs: `pm2 logs workforce-democracy-backend`
2. Check for errors: Look for `❌ Photo proxy error:`
3. Verify CORS: Make sure `Access-Control-Allow-Origin: *` header is present
4. Test proxy URL directly in browser:
   ```
   https://api.workforcedemocracyproject.org/api/photo-proxy?url=https://www.congress.gov/img/member/s000148_200.jpg
   ```

### If contrast still broken:
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Check CSS file loaded: DevTools → Network → CSS → `contrast-fix-v36.12.0.css`
3. Inspect element: Right-click number → Inspect → Check `color` property
4. Clear GenSpark cache if available

---

## Questions?

If you encounter any issues during implementation, please provide:
1. PM2 status output: `pm2 status`
2. Backend logs: `pm2 logs workforce-democracy-backend --lines 50`
3. Browser console screenshot (F12 → Console tab)
4. Network tab showing photo request/response
