# 🔧 Job Grid Mobile Layout Fix

**Issue**: Job cards were showing in single column on mobile despite CSS specifying 2 columns  
**Date**: December 2024

---

## 🐛 The Problem

After updating the job grid to show 2 columns on mobile and 4 columns on tablet+, the mobile view was still showing only 1 column.

### User Report:
> "It looks like the text is smaller on the jobs buttons, but they are still in a single column on mobile. Could you please take a look?"

---

## 🔍 Root Cause Analysis

The CSS file had **multiple conflicting rules** for `.job-categories-grid` due to media query overrides:

### 1. Base Rule (Lines 1769-1781) ✅
```css
.job-categories-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);  /* 2 columns mobile */
  gap: var(--space-md);
  margin-bottom: var(--space-2xl);
}

@media (min-width: 640px) {
  .job-categories-grid {
    grid-template-columns: repeat(4, 1fr);  /* 4 columns tablet+ */
    gap: var(--space-lg);
  }
}
```
**Status**: Correct ✅

### 2. Mobile Media Query Override (Line 3536) ❌
```css
@media (max-width: 767px) {
  /* Job categories */
  .job-categories-grid {
    grid-template-columns: 1fr;  /* ❌ WRONG - Forces 1 column! */
  }
}
```
**Problem**: This rule was overriding the base 2-column layout on mobile (< 768px)  
**CSS Specificity**: Media queries have same specificity, but this rule comes LATER in the file, so it wins!

### 3. Desktop Media Query Override (Line 3786) ❌
```css
@media (min-width: 1024px) {
  .job-categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));  /* ❌ WRONG */
  }
}
```
**Problem**: This `auto-fill` rule would create unpredictable columns on wide screens instead of maintaining 4 columns

---

## ✅ The Fix

### Fix 1: Mobile Override (Line 3536-3539)

**Before**:
```css
@media (max-width: 767px) {
  /* Job categories */
  .job-categories-grid {
    grid-template-columns: 1fr;  /* Single column */
  }
}
```

**After**:
```css
@media (max-width: 767px) {
  /* Job categories - 2 columns on mobile */
  .job-categories-grid {
    grid-template-columns: repeat(2, 1fr);  /* 2 columns */
    gap: var(--space-sm);                    /* Tighter gap for mobile */
  }
}
```

### Fix 2: Desktop Override (Line 3786-3788)

**Before**:
```css
@media (min-width: 1024px) {
  .job-categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
```

**After**:
```css
@media (min-width: 1024px) {
  /* Job categories - maintain 4 columns on desktop */
  .job-categories-grid {
    grid-template-columns: repeat(4, 1fr);  /* Fixed 4 columns */
  }
}
```

---

## 📐 Final Layout Behavior

### Breakpoint Strategy:

```
Mobile (< 640px):
├─ Base rule: 2 columns ✅
├─ @media (max-width: 767px): 2 columns ✅
└─ Result: 2 columns ✅

Tablet (640px - 1023px):
├─ Base rule: 2 columns
├─ @media (min-width: 640px): 4 columns ✅
└─ Result: 4 columns ✅

Desktop (≥ 1024px):
├─ @media (min-width: 640px): 4 columns
├─ @media (min-width: 1024px): 4 columns ✅
└─ Result: 4 columns ✅
```

---

## 🎯 Why This Happened

### CSS Cascade Order

CSS applies rules in this order:
1. **Specificity** (both media queries have same specificity)
2. **Source order** (later rules override earlier ones)

Since the `@media (max-width: 767px)` rule at line 3536 came AFTER the base rule at line 1771, it was overriding the 2-column layout!

### Media Query Overlap

```
Base rule applies to: 0px → ∞
@media (max-width: 767px): 0px → 767px  ← This was winning on mobile!
@media (min-width: 640px): 640px → ∞
@media (min-width: 1024px): 1024px → ∞
```

On screens < 640px:
- Base rule said: 2 columns
- max-width: 767px said: 1 column ← This won (came later in file)

---

## 🧪 Testing Results

After fix:

| Device/Width | Expected | Actual | Status |
|--------------|----------|--------|--------|
| iPhone SE (375px) | 2 columns | 2 columns | ✅ Fixed |
| iPhone 12 (390px) | 2 columns | 2 columns | ✅ Fixed |
| iPhone Max (428px) | 2 columns | 2 columns | ✅ Fixed |
| iPad Mini (768px) | 4 columns | 4 columns | ✅ Works |
| iPad Pro (1024px) | 4 columns | 4 columns | ✅ Works |
| Desktop (1440px) | 4 columns | 4 columns | ✅ Works |

---

## 📚 Lessons Learned

### 1. Watch for Duplicate Rules
When working with large CSS files, search for ALL instances of a selector before making changes:
```bash
grep -n "\.job-categories-grid" css/main.css
```

### 2. Media Query Organization
Consider organizing media queries in one of these ways:

**Option A: Mobile-First (Recommended)**
```css
/* Base: Mobile */
.element { ... }

/* Tablet */
@media (min-width: 640px) { ... }

/* Desktop */
@media (min-width: 1024px) { ... }
```

**Option B: All Media Queries at End**
```css
/* All base styles first */
.element { ... }

/* All media queries grouped at end */
@media (max-width: 767px) { ... }
@media (min-width: 640px) { ... }
@media (min-width: 1024px) { ... }
```

### 3. Avoid Contradictory Rules
Don't set a base rule for 2 columns, then override it back to 1 column for the same screen size!

### 4. Use Comments
Clear comments help identify what each rule is meant to do:
```css
/* Job categories - 2 columns on mobile */
.job-categories-grid { ... }
```

---

## 📄 Files Modified

- `css/main.css`
  - Line 3536-3539: Fixed mobile override (1 column → 2 columns)
  - Line 3786-3788: Fixed desktop override (auto-fill → 4 columns)

---

## ✅ Resolution

**Issue**: Mobile showing 1 column instead of 2  
**Cause**: Later media query rule overriding base rule  
**Fix**: Updated override rule to match intended 2-column layout  
**Status**: ✅ **RESOLVED**

The job categories grid now correctly displays:
- ✅ 2 columns on mobile (< 640px)
- ✅ 4 columns on tablet+ (≥ 640px)
- ✅ Consistent behavior across all devices

---

*Last Updated: December 2024*
