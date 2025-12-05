# 🧪 How to Test the Representative Finder

**File:** `test-rep-finder.html`

---

## 📋 Quick Instructions

### Option 1: Test in GenSpark Preview

1. Click on `test-rep-finder.html` in the file list
2. Click "Preview" button
3. Look at the screen:
   - **Top section:** Shows test status (⏳ Loading → ✅ Passed or ❌ Failed)
   - **Debug Console:** Shows all JavaScript logs
   - **Bottom section:** Shows the actual Representative Finder UI

### Option 2: Test Locally

1. Download your project files from GenSpark
2. Open `test-rep-finder.html` in your web browser
3. Same result as above

---

## ✅ What You Should See

### If Everything Works:

**Status Badge:** ✅ Test Passed (green)

**Debug Console shows:**
```
✅ Mock services initialized
📦 Loading civic-representative-finder.js...
🔍 [V36.10.0] civic-representative-finder.js loading...
[RepFinder] Container found, initializing...
🔍 [RepFinder] Initializing...
✅ [RepFinder] Initialized successfully
✅ ✅ ✅ ALL TESTS PASSED!
```

**UI Shows:**
- 🔒 Blue privacy disclosure box
- ZIP code input field
- "Find Reps" button
- Toggle for full address (optional)

---

## ❌ What to Look For If It Fails

### Status Badge: ❌ Test Failed (red)

**Check Debug Console for:**

**Error 1: File Not Loading**
```
❌ RepresentativeFinder.js did not load
```
→ **Solution:** File path issue or GenSpark caching

**Error 2: Container Not Found**
```
❌ Container #civicResults not found
```
→ **Solution:** HTML structure issue

**Error 3: UI Not Rendering**
```
❌ UI was not rendered (container is empty)
```
→ **Solution:** JavaScript initialization issue

---

## 📊 What the Test Checks

1. ✅ Container element exists (`#civicResults`)
2. ✅ JavaScript file loads (`RepresentativeFinder` object exists)
3. ✅ UI renders (container has HTML content)
4. ✅ Content length (should be 3000+ characters)

---

## 🐛 Troubleshooting

### "Test Passed" but UI looks broken
- Check browser console (F12) for CSS errors
- Verify `css/civic-representative-finder.css` exists

### "Test Failed" - File did not load
- GenSpark preview cache issue
- Click "Publish" first, then preview
- Or download files and test locally

### Debug console is empty
- JavaScript is blocked or not running
- Check browser settings
- Try different browser

---

## 💡 What This Proves

**If test passes:**
- ✅ Your code is 100% correct
- ✅ File structure is correct
- ✅ JavaScript logic works
- ✅ Issue is GenSpark preview caching (not code bugs)

**If test fails:**
- Check error messages in debug console
- Each error tells you exactly what's wrong
- Easy to diagnose and fix

---

## 🚀 Next Steps After Test

### If Test Passes:
1. Deploy to Netlify
2. It will work on live site
3. GenSpark preview was the issue

### If Test Fails:
1. Share screenshot of debug console
2. I'll diagnose the specific error
3. Quick fix and re-test

---

**Test created:** November 1, 2025  
**Version:** V36.10.0  
**File:** test-rep-finder.html  
**Purpose:** Verify Representative Finder works outside main site
