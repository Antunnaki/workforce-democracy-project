# Visible Section Borders - Cache Test

## Problem
User cannot see background color changes on mobile - suspected cache issue.

## Solution
Added **very visible colored borders** to test if CSS is loading:

### Changes Made

1. **Darker Background Color**
   - Changed from `#F5F7F9` (too subtle) 
   - To `#E8EBF0` (more noticeable grey)

2. **Visible Border Indicators**

#### Sections with GREY backgrounds = GOLD borders
```css
#local {
  background: var(--background);  /* Grey */
  border-top: 4px solid var(--secondary);     /* Gold */
  border-bottom: 4px solid var(--secondary);  /* Gold */
}

#learning {
  background: var(--background);  /* Grey */
  border-top: 4px solid var(--secondary);     /* Gold */
  border-bottom: 4px solid var(--secondary);  /* Gold */
}
```

#### Sections with WHITE backgrounds = TEAL borders
```css
#civic {
  background: var(--surface);  /* White */
  border-top: 4px solid var(--accent);     /* Teal */
  border-bottom: 4px solid var(--accent);  /* Teal */
}

#jobs {
  background: var(--surface);  /* White */
  border-top: 4px solid var(--accent);     /* Teal */
  border-bottom: 4px solid var(--accent);  /* Teal */
}
```

## What You'll See

### If CSS is Loading (Success!)
- **Local Resources** section: Gold top/bottom borders + grey background
- **Civic** section: Teal top/bottom borders + white background
- **Jobs** section: Teal top/bottom borders + white background
- **Learning** section: Gold top/bottom borders + grey background

### If CSS is NOT Loading (Cache Problem)
- No colored borders visible
- Everything still looks the same

## Colors
- 🟡 **Gold borders** = `#F39C12` (Amber Gold)
- 🔷 **Teal borders** = `#5DADE2` (Soft Teal)
- ⬜ **Grey background** = `#E8EBF0` (Darker grey - more visible!)
- ⬜ **White background** = `#FFFFFF`

## Cache Clearing Instructions

### iOS Safari (Most Effective)
1. **Settings** app → **Safari**
2. Scroll down → **Clear History and Website Data**
3. Tap **Clear History and Data**
4. Reopen Safari and visit the site

### Chrome Android
1. **Chrome** → **3 dots menu** → **History**
2. Tap **Clear browsing data**
3. Select **Cached images and files**
4. Select **All time**
5. Tap **Clear data**

### Alternative: Use Incognito/Private Mode
- Open site in private/incognito mode
- This bypasses cache entirely

## Next Steps

### If Borders Are Visible
✅ CSS is loading! The colors are just too subtle
→ We can adjust to make them more obvious

### If Borders Are NOT Visible
❌ Cache is the problem
→ Need to clear cache or wait for it to expire

---

**The borders make it absolutely clear whether the new CSS is loading!** 🎨🔍
