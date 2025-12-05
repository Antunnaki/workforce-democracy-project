# 🌐 Netlify Deployment - Citation Fix Guide

## The Netlify Problem

**Netlify uses a global CDN** that aggressively caches files. Even after you deploy new code:
- ❌ Edge servers worldwide still serve OLD cached versions
- ❌ "Fire" in DuckDuckGo only clears LOCAL browser cache
- ❌ Netlify's CDN cache persists globally for hours/days
- ❌ Cache propagation takes 5-10 minutes globally

---

## 🚨 Quick Fix for Netlify (3 steps)

### Step 1: Clear Netlify's Cache

**Go to Netlify Dashboard:**
```
1. Log in to https://app.netlify.com
2. Select your site
3. Click "Deploys" tab
4. Click "Trigger deploy" dropdown
5. Select "Clear cache and deploy site"
6. Wait for deployment to complete (2-5 minutes)
```

This clears Netlify's global CDN cache.

---

### Step 2: Add Timestamp to Force Cache Bust

**Update `index.html` line 3549:**

**CURRENT:**
```html
<script src="js/markdown-renderer.js?v=36.11.12"></script>
```

**CHANGE TO:**
```html
<script src="js/markdown-renderer.js?v=36.11.12&t=1706000000"></script>
```

**Even BETTER (unique every time):**
```html
<script>
const timestamp = Date.now();
document.write('<script src="js/markdown-renderer.js?v=36.11.12&t=' + timestamp + '"><\/script>');
</script>
```

Or use a build-time variable:
```html
<!-- If using Netlify environment variables: -->
<script src="js/markdown-renderer.js?v=36.11.12&t=BUILD_TIME"></script>
```

Change `1706000000` to current Unix timestamp or any random number.

**Why this works:**
- Creates a UNIQUE URL: `?v=36.11.12&t=1706000000`
- Netlify CDN sees this as a NEW file
- Browsers see this as a NEW file
- Bypasses ALL caching layers

---

### Step 3: Push to Git and Redeploy

```bash
# Commit the change:
git add index.html
git commit -m "Force cache bust for markdown-renderer V36.11.12"
git push origin main  # or master, or whatever your branch is

# Netlify will auto-deploy (if configured)
# OR manually trigger deploy in Netlify dashboard
```

**Wait 10 minutes:**
- Netlify needs time to:
  - Build your site
  - Deploy to CDN
  - Propagate globally to all edge servers

---

### Step 4: Clear Local Browser and Test

**Clear DuckDuckGo Fire:**
- Already done ✅

**Also clear in DevTools:**
1. Open your site
2. Press `F12` (open DevTools)
3. Right-click the refresh button
4. Select **"Empty Cache and Hard Reload"**

**Then run diagnostic:**
```
Open: https://your-site.netlify.app/netlify-citation-diagnostic.html

Expected result:
✅ Check 2: Script Version - PASS
V36.11.12 DETECTED
```

---

## 🔍 Diagnostic Tool

I created a **Netlify-specific diagnostic** for you:

**File:** `netlify-citation-diagnostic.html`

**Upload this to your site and open it:**
```
https://your-site.netlify.app/netlify-citation-diagnostic.html
```

**What it checks:**
- ✅ Which version Netlify is serving
- ✅ If function code has ◊◊CITE placeholder
- ✅ If function works correctly
- ✅ File URL and version parameter
- ✅ Netlify-specific caching info

**What to do with results:**

**If shows "OLD VERSION DETECTED":**
→ Netlify CDN still has old file cached
→ Follow "Clear Netlify Cache" steps above

**If shows "V36.11.12 DETECTED":**
→ Correct version is loaded
→ If citations still broken, different issue
→ Check browser console for errors

---

## 🐛 Netlify-Specific Issues

### Issue 1: Build Process Not Including File

**Problem:** Netlify might not be including `js/markdown-renderer.js` in the build.

**Check:**
1. Go to Netlify Dashboard → Deploys
2. Click latest deploy
3. Click "Deploy log"
4. Search for "markdown-renderer"

**If not found:**
- File might be in `.gitignore`
- File might not be in your Git repository
- Build process might be excluding it

**Solution:**
```bash
# Check if file is in Git:
git ls-files | grep markdown-renderer

# If not found, add it:
git add js/markdown-renderer.js
git commit -m "Add markdown-renderer V36.11.12"
git push
```

---

### Issue 2: Netlify Headers Caching

**Problem:** Netlify might have custom headers forcing long cache times.

**Check `netlify.toml` or `_headers` file:**
```toml
# netlify.toml
[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"  # ❌ 1 year cache!
```

**Solution:**
```toml
# netlify.toml
[[headers]]
  for = "/js/markdown-renderer.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"  # ✅ No cache

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"  # Other JS files
```

Or in `_headers` file:
```
/js/markdown-renderer.js
  Cache-Control: public, max-age=0, must-revalidate

/*.js
  Cache-Control: public, max-age=31536000
```

---

### Issue 3: Deploy Preview vs Production

**Problem:** You might be testing a deploy preview URL instead of production.

**Check:**
- **Deploy preview:** `https://deploy-preview-123--yoursite.netlify.app`
- **Production:** `https://yoursite.netlify.app` or custom domain

**Deploy previews may have different caching behavior.**

**Solution:**
Test on production URL after full deployment completes.

---

### Issue 4: Netlify Asset Optimization

**Problem:** Netlify's asset optimization might be bundling/minifying files.

**Check Netlify Dashboard:**
```
Site Settings → Build & Deploy → Post processing
```

**If "Bundle JS" or "Minify JS" is enabled:**
- Netlify may be caching the optimized bundle
- Even if source changes, bundle might not update

**Solution:**
1. Disable JS bundling temporarily
2. Redeploy
3. Test
4. Re-enable if needed

---

## 📋 Complete Netlify Fix Checklist

### Pre-Deployment
- [ ] `js/markdown-renderer.js` contains V36.11.12 code (◊◊CITE placeholder)
- [ ] File is in Git repository (`git ls-files | grep markdown-renderer`)
- [ ] `index.html` line 3549 has new version parameter with timestamp
- [ ] No `.gitignore` excluding the file

### Netlify Deployment
- [ ] Pushed to Git (`git push origin main`)
- [ ] Netlify auto-deployed (check Deploys tab)
- [ ] Deploy log shows markdown-renderer.js included
- [ ] Deploy status: "Published"

### Netlify Cache Clearing
- [ ] Triggered "Clear cache and deploy site" in Netlify dashboard
- [ ] New deployment completed successfully
- [ ] Waited 10 minutes for global propagation

### Browser Cache Clearing
- [ ] Cleared browser cache (DuckDuckGo Fire) ✅
- [ ] Hard refresh in DevTools (F12 → right-click refresh → Empty Cache)
- [ ] Closed and reopened browser
- [ ] Tried in incognito/private window

### Testing
- [ ] Ran `netlify-citation-diagnostic.html`
- [ ] Diagnostic shows "V36.11.12 DETECTED"
- [ ] Tested live chat widget
- [ ] Citations appear as ¹²³ (not _CITATION0_)

---

## 🚀 Recommended Netlify Setup

To avoid cache issues in the future:

### 1. Add Build-Time Cache Busting

**Create `netlify.toml` in project root:**
```toml
[build]
  publish = "."
  command = "echo 'Build complete'"

[build.environment]
  BUILD_ID = "${COMMIT_SHA}"

[[headers]]
  for = "/js/markdown-renderer.js"
  [headers.values]
    Cache-Control = "public, max-age=300"  # 5 minutes cache
```

### 2. Use Environment Variable for Version

**In `index.html`:**
```html
<script src="js/markdown-renderer.js?v=36.11.12&build=<!-- NETLIFY_BUILD_ID -->"></script>
```

Netlify will replace `<!-- NETLIFY_BUILD_ID -->` with unique build ID.

### 3. Add Deploy Notifications

**In Netlify Dashboard:**
```
Site Settings → Build & Deploy → Deploy notifications

Add: Slack/Email notification when deploy succeeds
```

This helps you know when deployment is actually live.

---

## 🔬 What to Send Me If Still Broken

After following ALL steps above, if still not working:

### 1. Netlify Diagnostic Results
```
Screenshot of: netlify-citation-diagnostic.html
Showing: Check 2 result (script version)
```

### 2. Netlify Deploy Info
```
Netlify Dashboard → Deploys → Latest deploy
- Deploy ID
- Deploy time
- Deploy log (search for "markdown-renderer")
```

### 3. Browser Console
```
F12 → Console tab
Copy all errors/warnings
```

### 4. Network Tab
```
F12 → Network tab → Reload page
Find: markdown-renderer.js
- Request URL
- Status code
- Response headers (Cache-Control)
- Preview tab (check if code has ◊◊CITE)
```

### 5. Git Status
```bash
git log -1 --oneline  # Last commit
git status            # Any uncommitted changes
git ls-files js/markdown-renderer.js  # File in repo?
```

---

## ⚡ Quick Emergency Fix

If you need citations working **RIGHT NOW** and can't wait for cache:

### Option 1: Rename the File

```bash
# In your project:
mv js/markdown-renderer.js js/markdown-renderer-v36-11-12.js

# Update index.html:
<script src="js/markdown-renderer-v36-11-12.js"></script>

# Commit and push:
git add .
git commit -m "Rename file to force cache bust"
git push
```

**Why this works:**
- NEW filename = NEW URL
- No cache exists for new URL
- Guaranteed to bypass all caches

### Option 2: Inline the Critical Code

If cache issues persist, temporarily inline the function:

```html
<!-- In index.html, before </body>: -->
<script>
// V36.11.12: Temporary inline fix
window.processInlineMarkdown = function(text) {
    if (!text) return '';
    
    const citationPlaceholders = [];
    let citationIndex = 0;
    
    // Save citations with special char placeholder
    text = text.replace(/\[(\d+)\]/g, (match, num) => {
        const placeholder = `◊◊CITE${citationIndex}◊◊`;
        citationPlaceholders.push({ placeholder, citation: match });
        citationIndex++;
        return placeholder;
    });
    
    // Process bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Process italic
    text = text.replace(/(?<!\*)\*(?!\*)([^*]+)\*(?!\*)/g, '<em>$1</em>');
    text = text.replace(/(?<!_)_(?!_)([^_]+)_(?!_)/g, '<em>$1</em>');
    
    // Restore citations
    citationPlaceholders.forEach(({ placeholder, citation }) => {
        text = text.split(placeholder).join(citation);
    });
    
    return text;
};
console.log('✅ Inline V36.11.12 fix loaded');
</script>
```

This guarantees the fix is applied, bypassing all file caching.

---

## Summary

**Netlify-specific issue:** Global CDN caching old files  
**Solution:** Clear Netlify cache + add timestamp to URL  
**Diagnostic tool:** `netlify-citation-diagnostic.html`  
**Timeline:** 10 minutes for global propagation  

**Next action:** Follow the 4-step Quick Fix above! 🚀

---

*Created for Netlify deployments*  
*Version: V36.11.12*  
*Last updated: 2025-01-XX*
