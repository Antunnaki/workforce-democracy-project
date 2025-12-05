# Quick Test Guide - V42V Fixes

## ⚡ 2-Minute Test

### Test 1: Dropdown Text Visibility
1. Open homepage
2. Scroll to "Civic Engagement & Transparency"
3. Look at the dropdown menus
   - ✅ **PASS:** Text is BLACK on WHITE background, clearly readable
   - ❌ **FAIL:** Text is white/invisible

### Test 2: Dropdown Functionality
1. Click "Choose your country..." dropdown
   - ✅ **PASS:** Dropdown opens and STAYS OPEN
   - ❌ **FAIL:** Dropdown appears then disappears

2. Select "United States"
   - ✅ **PASS:** Selection works, dropdown closes normally
   - ❌ **FAIL:** Can't select anything

### Test 3: Tab Switching
1. Click "My Representatives" tab
   - ✅ **PASS:** Content changes below, page scrolls smoothly
   - ❌ **FAIL:** Nothing happens or no scroll

2. Click "Supreme Court" tab
   - ✅ **PASS:** Different content shows, page scrolls
   - ❌ **FAIL:** Same content or no scroll

3. Press F12 → Console tab
   - ✅ **PASS:** No red errors
   - ❌ **FAIL:** Red JavaScript errors appear

### Test 4: Hero Image
1. Look at the circular illustration above tabs
   - ✅ **PASS:** See circle with 3 elements (People, Capitol, Scales)
   - ✅ **PASS:** See arrows connecting them
   - ✅ **PASS:** Text reads "MUTUAL ACCOUNTABILITY"
   - ❌ **FAIL:** Old linear design or broken image

### Test 5: Mobile (30 seconds)
1. Resize browser to 375px width
2. Check hero
   - ✅ **PASS:** Circular design fits screen, text readable
   - ❌ **FAIL:** Cut off or unreadable

3. Tap a tab
   - ✅ **PASS:** Easy to tap, content changes
   - ❌ **FAIL:** Too small or doesn't work

---

## 🐛 If Something Fails

### Dropdowns Still White Text:
```bash
# Clear browser cache:
Ctrl+Shift+Delete (Chrome/Firefox)
Cmd+Option+E (Safari)
```

Then **hard reload**:
- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

### Tabs Still Not Working:
1. Open Console (F12)
2. Type and press Enter:
```javascript
console.log(typeof window.switchCivicTab);
```
- Should say: `"function"`
- If says `"undefined"`: Hard reload page

### Check Version Loaded:
```javascript
// In console, paste this:
document.querySelector('link[href*="civic-redesign"]').href
```
- Should include: `v=20250122-CIRCULAR-FIX`
- If different version: Clear cache

---

## ✅ All Passing = Ready! 🎉

If all 5 tests pass, your fixes are working correctly!
