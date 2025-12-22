# ✅ Quick Deploy Checklist - Citation Fix V36.11.12

## Files to Upload (2 files)

### 1. index.html
**What changed:** Line 3549 - Updated version parameter
```html
OLD: <script src="js/markdown-renderer.js?v=20251030-PHASE4-MARKDOWN"></script>
NEW: <script src="js/markdown-renderer.js?v=36.11.12"></script>
```

### 2. js/markdown-renderer.js
**What changed:** Lines 128 and 146 - Placeholder system
```javascript
OLD: const placeholder = `__CITATION_${citationIndex}__`;
NEW: const placeholder = `◊◊CITE${citationIndex}◊◊`;

OLD: text = text.replace(placeholder, citation);
NEW: text = text.split(placeholder).join(citation);
```

---

## Upload Commands

```bash
# Upload index.html:
scp index.html user@server:/path/to/website/

# Upload markdown-renderer.js:
scp js/markdown-renderer.js user@server:/path/to/website/js/
```

---

## Verify Upload

```bash
# SSH into server:
ssh user@server

# Check index.html has new version parameter:
grep "v=36.11.12" /path/to/website/index.html
# Expected: <script src="js/markdown-renderer.js?v=36.11.12"></script>

# Check markdown-renderer.js has new placeholder:
grep "◊◊CITE" /path/to/website/js/markdown-renderer.js
# Expected: const placeholder = `◊◊CITE${citationIndex}◊◊`;
```

---

## Clear Your Browser Cache

### Chrome/Edge
1. `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. **Close and reopen browser**

### Firefox
1. `Ctrl+Shift+Delete`
2. Select "Cache"
3. Time range: "Everything"
4. Click "OK"
5. **Close and reopen browser**

### Safari
1. `Cmd+Option+E` (Empty Caches)
2. **Close and reopen browser**

---

## Test (3 ways)

### Test 1: Run Diagnostic ⭐ DO THIS FIRST
```
Open: https://your-domain.com/test-live-site-diagnostic.html

Expected result:
✅ Check 2: Script Version - PASS
V36.11.12 detected - Uses ◊◊CITE placeholder
```

### Test 2: Run Original Test File
```
Open: https://your-domain.com/test-backend-response-simulation.html

Expected result:
✅ All checks show PASS
```

### Test 3: Test Live Site
```
1. Open: https://your-domain.com
2. Open Representatives chat
3. Ask: "Tell me about Eric Adams"
4. Check: Citations appear as ¹²³ (not _CITATION0_)
```

---

## Success Criteria

### ✅ If Everything Works:
- Diagnostic shows: "V36.11.12 detected"
- Test file shows: All PASS
- Live site shows: Citations as ¹²³
- No `_CITATION0_` or `◊◊CITE0◊◊` text visible

### ❌ If Still Broken:
- Read: [LIVE-SITE-FIX-INSTRUCTIONS.md](LIVE-SITE-FIX-INSTRUCTIONS.md)
- Try: Incognito window
- Try: Different browser
- Check: CDN cache (if using Cloudflare)

---

## Quick Reference

| File | Status | Action |
|------|--------|--------|
| `index.html` | ✅ Updated | Upload to server |
| `js/markdown-renderer.js` | ✅ V36.11.12 | Upload to server |
| Browser cache | ❌ Must clear | Clear completely |
| `test-live-site-diagnostic.html` | ✅ Ready | Run after deploy |

---

## Timeline

1. **Upload files** (2 minutes)
2. **Clear cache** (1 minute)
3. **Run diagnostic** (1 minute)
4. **Test live site** (2 minutes)

**Total time:** ~6 minutes

---

## What's Different Now?

### Before (broken):
```
Browser requests: js/markdown-renderer.js?v=20251030-PHASE4-MARKDOWN
Browser thinks: "I have this cached"
Browser uses: OLD V36.11.11 file from cache ❌
Result: Citations show as _CITATION0_ ❌
```

### After (fixed):
```
Browser requests: js/markdown-renderer.js?v=36.11.12
Browser thinks: "This is new, I need to download it"
Browser downloads: NEW V36.11.12 file ✅
Result: Citations show as ¹²³ ✅
```

---

**Ready to deploy? Follow the steps above! 🚀**

*If you need help: See [LIVE-SITE-FIX-INSTRUCTIONS.md](LIVE-SITE-FIX-INSTRUCTIONS.md)*
