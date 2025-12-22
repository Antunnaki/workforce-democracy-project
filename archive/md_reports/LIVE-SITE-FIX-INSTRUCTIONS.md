# 🚨 URGENT: Live Site Citation Fix Instructions

## The Problem

Your **test files show ✅ PASS** but **live site still shows `_CITATION0_` text**.

This means: **Browser cache issue** - The browser is loading the OLD V36.11.11 version even though V36.11.12 is on the server.

---

## The Root Cause

**Line 3549 in index.html:**
```html
<script src="js/markdown-renderer.js?v=20251030-PHASE4-MARKDOWN"></script>
```

The version parameter `?v=20251030-PHASE4-MARKDOWN` is **still pointing to the old date**. Browsers use this to decide whether to reload the file or use the cached version.

Even though we updated the file contents to V36.11.12, the browser sees the same version string and thinks "I already have this file cached" so it uses the OLD cached version.

---

## The Fix (3 Steps)

### Step 1: Update index.html ✅ DONE

I've already updated line 3549 for you:

**OLD:**
```html
<script src="js/markdown-renderer.js?v=20251030-PHASE4-MARKDOWN"></script>
```

**NEW:**
```html
<script src="js/markdown-renderer.js?v=36.11.12"></script>
```

---

### Step 2: Deploy Both Files 📤

You need to upload TWO files to your server:

```bash
# Upload updated index.html (with new version parameter):
scp index.html user@server:/path/to/website/

# Upload markdown-renderer.js (V36.11.12):
scp js/markdown-renderer.js user@server:/path/to/website/js/

# Verify both files uploaded:
ssh user@server
grep "v=36.11.12" /path/to/website/index.html
# Should show: <script src="js/markdown-renderer.js?v=36.11.12"></script>

grep "◊◊CITE" /path/to/website/js/markdown-renderer.js
# Should show: const placeholder = `◊◊CITE${citationIndex}◊◊`;
```

---

### Step 3: Clear Browser Cache & Test 🧹

**A. Clear cache completely:**

**Chrome/Edge:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select **"Cached images and files"**
3. Time range: **"All time"**
4. Click **"Clear data"**
5. Close and reopen browser (important!)

**Firefox:**
1. Press `Ctrl+Shift+Delete`
2. Select **"Cache"**
3. Time range: **"Everything"**
4. Click **"OK"**
5. Close and reopen browser

**Safari:**
1. Press `Cmd+Option+E` (Empty Caches)
2. Close and reopen browser

**B. Run diagnostic on live site:**

Open this NEW diagnostic file I created:
```
https://your-domain.com/test-live-site-diagnostic.html
```

This will:
- Check if V36.11.12 is loaded
- Test the function directly
- Show you exactly which version the browser has cached
- Tell you if the fix is working

**Expected output:**
```
✅ Check 2: Script Version - PASS
V36.11.12 detected - Uses ◊◊CITE placeholder
```

**If still shows OLD VERSION:**
```
❌ Check 2: Script Version - FAIL
OLD VERSION detected - Uses __CITATION_ placeholder
⚠️ This is V36.11.11 or earlier
The browser is loading the OLD cached version!
```

**If it still shows OLD after clearing cache:**
- Try a different browser
- Try incognito/private window
- Try from a different device/network

---

## Why This Happened

### The Cache-Busting Parameter Problem

**What is `?v=20251030-PHASE4-MARKDOWN`?**
This is called a "cache-busting parameter". It tells the browser "This is version 20251030-PHASE4-MARKDOWN of this file."

**How browsers cache files:**
1. Browser requests: `js/markdown-renderer.js?v=20251030-PHASE4-MARKDOWN`
2. Server sends the file
3. Browser caches it with key: `js/markdown-renderer.js?v=20251030-PHASE4-MARKDOWN`
4. Next time browser sees same URL → uses cached file (doesn't download again)

**The problem:**
- You updated `js/markdown-renderer.js` file contents to V36.11.12 ✅
- But you DIDN'T change the version parameter in index.html ❌
- So browser still sees: `?v=20251030-PHASE4-MARKDOWN`
- Browser thinks: "I have this version cached already" ❌
- Browser uses OLD cached file instead of downloading new one ❌

**The solution:**
- Change version parameter to: `?v=36.11.12` ✅
- Browser sees different version string
- Browser thinks: "This is new, I need to download it" ✅
- Browser downloads and caches NEW V36.11.12 file ✅

---

## Verification Checklist

After deploying and clearing cache:

### ✅ Diagnostic File Check
- [ ] `test-live-site-diagnostic.html` shows: **"✅ V36.11.12 detected"**
- [ ] Check 2: Script Version = **PASS**
- [ ] Check 3: Function Test = **PASS**
- [ ] Check 4: Placeholder in Code = **PASS** (shows ◊◊CITE)

### ✅ Live Site Check
- [ ] Open: `https://your-domain.com`
- [ ] Open Representatives chat
- [ ] Ask: "Tell me about Eric Adams"
- [ ] Citations appear as: **¹²³** (small blue elevated numbers)
- [ ] Citations are **clickable**
- [ ] Clicking citation **scrolls to Sources section**
- [ ] **NO** `_CITATION0_` or `_CITATION1_` text visible
- [ ] **NO** `◊◊CITE0◊◊` text visible

### ✅ Browser Console Check
- [ ] Press F12 → Console tab
- [ ] No errors mentioning "citation" or "markdown"
- [ ] No errors mentioning "undefined"

---

## What If It Still Doesn't Work?

### Scenario 1: Diagnostic shows OLD VERSION after clearing cache

**Problem:** Browser stubbornly caching old file

**Solutions:**
1. **Try incognito/private window** (no cache at all)
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
   - Safari: Cmd+Shift+N

2. **Try different browser entirely**
   - If Chrome fails, try Firefox
   - Fresh browser = fresh cache

3. **Add timestamp to version parameter:**
   ```html
   <script src="js/markdown-renderer.js?v=36.11.12&t=<?php echo time(); ?>"></script>
   ```
   Or manually:
   ```html
   <script src="js/markdown-renderer.js?v=36.11.12&t=1234567890"></script>
   ```
   Change the number each time you update

4. **Check CDN cache** (if using Cloudflare/similar):
   ```bash
   # Purge CDN cache for the file:
   # (Exact method depends on your CDN)
   curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{"files":["https://your-domain.com/js/markdown-renderer.js"]}'
   ```

---

### Scenario 2: Diagnostic shows V36.11.12 but live site STILL broken

**Problem:** The function is loaded correctly but not being called, OR called with wrong parameters

**Check:**
1. Open live site
2. Press F12 → Console tab
3. Type:
   ```javascript
   window.processInlineMarkdown("Test[1] text")
   ```
4. Should output: `"Test[1] text"` (citation preserved)

5. Type:
   ```javascript
   window.parseMarkdownAndCitations("Test[1]\n\nSources:\n1. Test")
   ```
6. Should output object with `mainText` containing `<sup>`

**If these work but live chat doesn't:**
- Issue is in chat widget implementation
- Backend might be sending wrong format
- Need to debug `addInlineChatMessageWithTypewriter()` function

---

### Scenario 3: Test file passes, diagnostic passes, but specific chat widget fails

**Problem:** One chat widget not calling the right function

**Check which widget:**
- Representatives chat (inline-civic-chat.js)
- Bills chat (bills-chat.js)
- Candidate analysis (candidate-analysis.js)
- Ethical business chat (ethical-business-chat.js)

**Debug steps:**
1. Open the failing widget
2. Press F12 → Console tab
3. Send a test message
4. Look for console logs like:
   ```
   [Inline Chat] ✅ Response generated: ...
   ```
5. Check if response includes `[1]` citations
6. Check if `typewriterWithMarkdownAndCitations()` is called

---

## Emergency Fallback: Bypass Cache Entirely

If nothing else works, you can force browsers to NEVER cache this file:

### Option 1: Modify server headers (best)

**Apache (.htaccess):**
```apache
<Files "markdown-renderer.js">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires 0
</Files>
```

**Nginx:**
```nginx
location ~* markdown-renderer\.js$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires 0;
}
```

### Option 2: Use timestamp in HTML (easier)

```html
<script>
    const timestamp = new Date().getTime();
    document.write('<script src="js/markdown-renderer.js?v=36.11.12&t=' + timestamp + '"><\/script>');
</script>
```

---

## Summary

**What you need to do NOW:**

1. ✅ **Upload index.html** (already updated with `?v=36.11.12`)
2. ✅ **Upload js/markdown-renderer.js** (V36.11.12 with ◊◊CITE placeholder)
3. ✅ **Clear browser cache completely** (and close/reopen browser)
4. ✅ **Run diagnostic:** `test-live-site-diagnostic.html`
5. ✅ **Verify:** Diagnostic shows "V36.11.12 detected"
6. ✅ **Test live site:** Citations should now work

**If diagnostic still shows OLD VERSION after clearing cache:**
- Try incognito window
- Try different browser
- Check CDN cache
- Use timestamp in version parameter

**If diagnostic shows NEW VERSION but citations still don't work:**
- Check browser console for errors
- Test functions manually in console
- Debug specific chat widget
- Check backend response format

---

## Need Help?

If after following ALL steps above it still doesn't work, send me:

1. **Screenshot** of `test-live-site-diagnostic.html` results
2. **Screenshot** of live site showing the issue
3. **Browser console log** (F12 → Console → copy all)
4. **Server verification:**
   ```bash
   grep "v=36.11.12" index.html
   grep "◊◊CITE" js/markdown-renderer.js
   ```

---

**Created:** 2025-01-XX  
**Version:** V36.11.12  
**Status:** Cache-busting parameter updated in index.html
