# Jobs Section - Tagline Moved to Separate Row

## Date: 2025-01-XX
## Issue: Subtitle squished side-by-side with title on mobile
## Solution: Moved subtitle to its own row below the header

---

## 🎯 What Changed

The "Curious about how your work could feel different?..." text was inside the section header, causing it to appear squished next to the title on some screen sizes.

---

## 📱 Visual Layout

### Before (Squished):
```
┌────────────────────────────────────┐
│ 💼 Explore Jobs in Demo... Curio- │ ← Title and subtitle
│ us about how your work could...   │    cramped together
└────────────────────────────────────┘
```

### After (Proper Spacing):
```
┌────────────────────────────────────┐
│ 💼 Explore Jobs in Democratic      │ ← Title (clean)
│    Workplaces                      │
└────────────────────────────────────┘
┌────────────────────────────────────┐
│ Curious about how your work could  │ ← Subtitle (separate row)
│ feel different? Let's explore what │
│ happens when workers have a        │
│ genuine say in how things run      │
└────────────────────────────────────┘
  [JOB CATEGORIES GRID]
```

---

## 💻 HTML Structure Change

### Before:
```html
<header class="section-header">
    <h2 class="section-title">
        <span class="icon">💼</span>
        <span>Explore Jobs in Democratic Workplaces</span>
    </h2>
    <p class="section-subtitle">
        Curious about how your work could feel different?...
    </p>
</header>

<div class="job-categories-grid">
```

### After:
```html
<header class="section-header">
    <h2 class="section-title">
        <span class="icon">💼</span>
        <span>Explore Jobs in Democratic Workplaces</span>
    </h2>
</header>

<p class="section-tagline">
    Curious about how your work could feel different?...
</p>

<div class="job-categories-grid">
```

**Key Changes**:
- ✅ Moved `<p>` outside of `<header>` element
- ✅ Changed class from `section-subtitle` to `section-tagline`
- ✅ Now appears as separate row between header and content

---

## 🎨 CSS Styling (Already Exists!)

The `.section-tagline` class was created earlier for the civic section and automatically applies here too:

```css
.section-tagline {
  text-align: center;
  font-size: var(--font-size-lg);          /* 20px desktop */
  color: var(--text-secondary);            /* Gray */
  max-width: 700px;                        /* Constrained width */
  margin: var(--space-xl) auto;            /* 32px top/bottom */
  padding: 0 var(--space-md);              /* Horizontal padding */
  line-height: var(--line-height-relaxed); /* Easy to read */
}

/* Mobile */
@media (max-width: 767px) {
  .section-tagline {
    font-size: var(--font-size-base);  /* 16px */
    padding: 0 var(--space-sm);
    margin: var(--space-lg) auto;      /* 24px */
  }
}
```

---

## 📐 Spacing Strategy

```
Section Header
├─ 💼 Icon + Title
└─ (no bottom margin)
    ↓
  32px (desktop) / 24px (mobile)
    ↓
Tagline (Separate Row)
    ↓
  32px (desktop) / 24px (mobile)
    ↓
Job Categories Grid
```

**Result**: Clean visual separation with proper breathing room!

---

## 📱 Responsive Behavior

### Desktop (≥768px):
- Tagline: 20px font size
- Margin: 32px top and bottom
- Max width: 700px (centered)
- Plenty of space around text

### Mobile (<768px):
- Tagline: 16px font size
- Margin: 24px top and bottom
- Full width with padding
- Text wraps properly

---

## ✅ Benefits

### Better Readability:
✅ Title and subtitle clearly separated  
✅ Each element has its own space  
✅ No cramping on any screen size  
✅ Text flows naturally  

### Consistent Design:
✅ Matches Civic Transparency section layout  
✅ Consistent spacing throughout site  
✅ Professional, polished appearance  

### Mobile-Friendly:
✅ No squishing or overlapping  
✅ Proper text wrapping  
✅ Easy to read at all sizes  

---

## 📝 Files Modified

### 1. **index.html** (Lines 371-385)
**Changes**:
- Moved subtitle `<p>` outside `<header>` element
- Changed class from `section-subtitle` to `section-tagline`
- Now appears as separate row

**Result**: Tagline no longer squished with title!

---

## 🎯 Consistency Across Sections

Both main content sections now use the same pattern:

### Civic Transparency:
```
[Header]
  → 🏛️ Government Transparency
  → Where Transparency Matters Most (motto)
[Tagline Row]
  → "Ever wonder how your representatives actually vote?..."
[Content]
```

### Jobs Section:
```
[Header]
  → 💼 Explore Jobs in Democratic Workplaces
[Tagline Row]
  → "Curious about how your work could feel different?..."
[Content]
```

**Result**: Consistent, professional layout throughout!

---

## ✅ Result

The Jobs section now has:
- ✅ Clean, uncluttered title
- ✅ Tagline in its own row with proper spacing
- ✅ No squishing on mobile
- ✅ Consistent with other sections
- ✅ Professional, readable layout

The text now flows naturally instead of being cramped!

---

**Status**: ✅ Complete  
**Layout**: Header | Tagline | Content (three distinct sections)  
**Spacing**: Optimized for readability on all devices
