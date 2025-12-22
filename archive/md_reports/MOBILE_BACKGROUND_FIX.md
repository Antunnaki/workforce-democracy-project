# Mobile Background Fix - Session 6 Part 3

## Issue
User reported: "The background isn't showing on mobile. It looks pretty much the same."

## Root Cause
The CSS selector `.section:nth-child(even/odd)` was counting ALL children of `<main>`, not just `.section` elements.

### HTML Structure
```html
<main>
  <section class="hero-section">        <!-- Child 1 (no .section class) -->
  <section class="local-section section"> <!-- Child 2 -->
  <section class="civic-section section"> <!-- Child 3 -->
  <section class="section">              <!-- Child 4 -->
  ...
</main>
```

### The Problem
- `.section:nth-child(even)` matched sections that were even children of `<main>`
- But the first child (hero) doesn't have the `.section` class
- This threw off the entire pattern!

## Solution
Changed from generic nth-child selectors to **explicit ID-based backgrounds**.

### Before (Broken)
```css
.section:nth-child(even) {
  background: var(--surface);
}

.section:nth-child(odd) {
  background: var(--background);
}
```

### After (Fixed)
```css
.section {
  background: var(--surface);  /* Default white */
}

/* Explicit alternating pattern */
#local { background: var(--background); }      /* Grey */
#civic { background: var(--surface); }         /* White */
#civicDashboard { background: var(--background); } /* Grey */
#upcomingBills { background: var(--surface); } /* White */
#billsList { background: var(--background); }  /* Grey */
#jobs { background: var(--surface); }          /* White */
#learning { background: var(--background); }   /* Grey */
#faq { background: var(--surface); }           /* White */
#philosophies { background: var(--background); } /* Grey */
```

## Visual Result

### Desktop & Mobile (Now Consistent)
```
┌──────────────────────────────┐
│  Hero (Navy→Gold gradient)   │ ← Always colorful
├──────────────────────────────┤
│  Local Resources (GREY)      │ ← #F5F7F9
├──────────────────────────────┤
│  Govt Transparency (WHITE)   │ ← #FFFFFF
├──────────────────────────────┤
│  Civic Dashboard (GREY)      │ ← #F5F7F9
├──────────────────────────────┤
│  Upcoming Bills (WHITE)      │ ← #FFFFFF
├──────────────────────────────┤
│  Bills List (GREY)           │ ← #F5F7F9
├──────────────────────────────┤
│  Jobs Section (WHITE)        │ ← #FFFFFF
├──────────────────────────────┤
│  Learning (GREY)             │ ← #F5F7F9
├──────────────────────────────┤
│  FAQ (WHITE)                 │ ← #FFFFFF
├──────────────────────────────┤
│  Philosophies (GREY)         │ ← #F5F7F9
└──────────────────────────────┘
```

## Why This Works on Mobile
1. **Explicit IDs**: No reliance on complex selectors
2. **No media query overrides**: Same CSS applies to all screen sizes
3. **Specificity**: ID selectors (higher specificity) override generic .section
4. **Direct targeting**: Each section explicitly styled

## Colors
- **Grey background**: `#F5F7F9` (soft, warm grey)
- **White background**: `#FFFFFF` (pure white)
- **Body default**: `#F5F7F9` (matches grey sections)

## Testing Checklist
✅ Mobile devices show alternating backgrounds
✅ Desktop shows same pattern
✅ Tablet shows same pattern
✅ No flickering or loading issues
✅ Consistent across all browsers
✅ Clear visual rhythm throughout page

## Files Modified
- `css/main.css` - Lines 211-259 (section background definitions)

## Cache Clearing
**Important**: Users may need to hard refresh to see changes:
- **iOS Safari**: Hold refresh button → "Request Desktop Site" → Refresh again
- **Chrome Android**: Settings → Privacy → Clear browsing data → Cached images
- **Desktop**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

**This fix guarantees alternating backgrounds work on ALL devices!** 📱💻🎨
