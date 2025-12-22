# 📋 Phase 3 Strategy - Split main.css

**Current**: main.css (132KB - monolithic)  
**Target**: 4-5 modular files (~100KB total after cleanup)  
**Benefit**: Easier maintenance, faster development, cleaner organization

---

## 📊 main.css Structure Analysis

Based on analysis of the 132KB file, here are the major sections:

### Current Sections in main.css:
1. **CSS Custom Properties** (Lines 1-105) - Design tokens
2. **Reset & Base Styles** (Lines 107-163) - Box model, html/body
3. **Typography** (Lines 164-204) - Headings, paragraphs, links
4. **Layout Utilities** (Lines 205-233) - Container, section
5. **Accessibility** (Lines 234-264) - Skip links, screen readers
6. **Language Selector** (Lines 265-346) - Dropdown component
7. **Header** (Lines 347-613) - Site header, navigation, mobile menu
8. **Buttons** (Lines 614-670) - Button variants
9. **Additional Components** (Lines 671+) - Cards, modals, forms, etc.

---

## 🎯 Proposed Split Strategy

### **File 1: `core/variables.css`** (~5KB)
**Purpose**: CSS Custom Properties (Design Tokens)  
**Contains**:
- Color palette
- Spacing system
- Typography scales
- Border radius
- Shadows
- Transitions
- Z-index scale

**Why separate**: These are referenced everywhere, should load first

---

### **File 2: `core/base.css`** (~8KB)
**Purpose**: Reset & Foundation  
**Contains**:
- CSS reset (box-sizing, margin, padding)
- HTML/body base styles
- Smooth scrolling
- Font smoothing
- Overflow handling
- Main padding

**Why separate**: Foundation that everything builds on

---

### **File 3: `core/typography.css`** (~6KB)
**Purpose**: All text styles  
**Contains**:
- Heading styles (h1-h6)
- Paragraph styles
- Link styles
- Strong/bold styles
- Focus states
- Text utilities

**Why separate**: Text is fundamental, often needs adjustment

---

### **File 4: `core/layout.css`** (~10KB)
**Purpose**: Page structure  
**Contains**:
- Container styles
- Section styles
- Grid systems
- Flexbox utilities
- Spacing utilities
- Responsive breakpoints

**Why separate**: Layout is core infrastructure

---

### **File 5: `components/buttons.css`** (~8KB)
**Purpose**: Button components  
**Contains**:
- Base button (.btn)
- Button variants (primary, secondary, outline)
- Button states (hover, focus, active, disabled)
- Button sizes
- Icon buttons

**Why separate**: Buttons are reused everywhere

---

### **File 6: `components/header.css`** (~25KB)
**Purpose**: Site header & navigation  
**Contains**:
- Site header (.site-header)
- Brand/logo (.brand, .site-title)
- Desktop navigation (.nav-list)
- Mobile menu (.mobile-nav)
- Language selector
- Accessibility (skip links)

**Why separate**: Header is complex, changes often

---

### **File 7: `components/common.css`** (~40KB)
**Purpose**: Reusable components  
**Contains**:
- Cards
- Modals
- Forms
- Tables
- Lists
- Alerts
- Badges
- Other shared components

**Why separate**: Components used across features

---

### **File 8: `utilities/helpers.css`** (~8KB)
**Purpose**: Utility classes  
**Contains**:
- Display utilities (.hidden, .visible)
- Spacing utilities (.mt-*, .mb-*, .p-*)
- Text utilities (.text-center, .text-bold)
- Color utilities
- Accessibility helpers (.sr-only)

**Why separate**: Quick helpers, load last

---

## 📁 Proposed Directory Structure

```
css/
  ├── core/
  │   ├── variables.css (5KB) - Design tokens
  │   ├── base.css (8KB) - Reset & foundation
  │   ├── typography.css (6KB) - Text styles
  │   └── layout.css (10KB) - Page structure
  ├── components/
  │   ├── buttons.css (8KB) - Button components
  │   ├── header.css (25KB) - Site header
  │   └── common.css (40KB) - Shared components
  ├── utilities/
  │   └── helpers.css (8KB) - Utility classes
  ├── features/
  │   ├── civic-platform.css (16KB) - Existing
  │   ├── civic-redesign.css (17KB) - Existing
  │   └── ... (other feature files)
  └── fixes/
      └── contrast-fixes.css (8KB) - Phase 2 result
```

**Total Core Size**: ~110KB (vs 132KB - saves 22KB)

---

## 🚀 Implementation Plan

### **Step 1**: Create Core Directory
- Create `css/core/` folder
- Extract and create 4 core files

### **Step 2**: Create Components Directory
- Create `css/components/` folder  
- Extract and create 3 component files

### **Step 3**: Create Utilities Directory
- Create `css/utilities/` folder
- Extract and create helpers file

### **Step 4**: Update index.html
- Replace single main.css with modular files
- Maintain correct load order
- Update version tags

### **Step 5**: Move Existing Files
- Move feature files to `css/features/`
- Move contrast-fixes.css to `css/fixes/`
- Keep flat structure for now (Phase 4 will organize)

### **Step 6**: Delete old main.css
- Archive or delete after verification

### **Step 7**: Test Everything
- Visual regression testing
- Check console for errors
- Verify all features work

---

## ⚠️ Critical Considerations

### **Load Order Matters!**
Files must load in this order:
1. **variables.css** - First (defines tokens)
2. **base.css** - Foundation
3. **typography.css** - Text before layout
4. **layout.css** - Structure
5. **buttons.css** - Before header (header uses buttons)
6. **header.css** - Header component
7. **common.css** - Shared components
8. **helpers.css** - Utilities load last
9. **Feature files** - Existing feature CSS
10. **contrast-fixes.css** - Load LAST (overrides)

### **No Duplication**
- Each rule should exist in only ONE file
- Clear ownership of each selector
- Document which file owns what

### **Maintain Specificity**
- Don't increase specificity unnecessarily
- Keep cascade natural
- Comment when !important is needed

---

## 📊 Expected Benefits

### **Development**:
- ✅ Find styles faster (know which file)
- ✅ Edit with confidence (isolated changes)
- ✅ Avoid conflicts (clear ownership)
- ✅ Faster onboarding (logical structure)

### **Performance**:
- ✅ Can optimize individual files
- ✅ Can lazy-load non-critical files
- ✅ Better browser caching (change one, not all)
- ✅ Smaller file sizes overall

### **Maintenance**:
- ✅ Clear responsibility
- ✅ Easy to update
- ✅ Prevents CSS bloat
- ✅ Professional structure

---

## 🎯 Phase 3 Execution

**Recommended Approach**: **Conservative Strategy**

Instead of full reorganization, do a **minimal split** first:

### **Minimal Split** (Safer, Faster):
1. Extract variables to `core/variables.css`
2. Keep rest as `core/main-core.css` (renamed, cleaned)
3. Test thoroughly
4. Further split later if needed

### **Full Split** (More work, better result):
1. Create all 8 modular files
2. Update index.html load order
3. Test everything thoroughly
4. More maintainable long-term

---

## 🤔 Recommendation

**For Phase 3, I recommend**: **Minimal Split**

**Why**:
- ✅ Lower risk
- ✅ Faster to complete
- ✅ Still major improvement
- ✅ Can iterate later

**Minimal Split Plan**:
1. Create `css/core/variables.css` (extract design tokens)
2. Rename `main.css` → `css/core/main-core.css`
3. Update index.html
4. Test

**Future** (Phase 4+):
- Further split main-core.css if needed
- Organize into folders
- Additional optimization

---

## ✅ Decision Point

**Which approach do you prefer?**

**Option A: Minimal Split** (30 minutes)
- Extract variables only
- Safer, faster
- Still huge improvement

**Option B: Full Split** (1-2 hours)
- Create all 8 files
- Maximum benefit
- More work, more testing

Which would you like me to proceed with?
