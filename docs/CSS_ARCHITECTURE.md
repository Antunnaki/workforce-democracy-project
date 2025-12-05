# CSS Architecture Documentation
**Workforce Democracy Project - Complete Styling Guide**

---

## 📋 Table of Contents
1. [Color Palette](#color-palette)
2. [CSS File Structure](#css-file-structure)
3. [Specificity Hierarchy](#specificity-hierarchy)
4. [Chat Widget Styling](#chat-widget-styling)
5. [Common Issues & Solutions](#common-issues--solutions)
6. [Best Practices](#best-practices)

---

## 🎨 Color Palette

### Primary Brand Colors (Purple-Blue Gradient)
```css
--primary: #667eea;              /* Primary purple-blue */
--primary-dark: #764ba2;         /* Deeper purple */
--primary-light: #8b9dff;        /* Lighter blue-purple */
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Used For:**
- Primary buttons (Vote on Bills, etc.)
- Chat toggle button
- Chat header
- Links and interactive elements
- Focus states

### Background Colors (Light Blue-Grey)
```css
--bg-lightest: #f5f7fa;          /* Lightest background */
--bg-light: #e8ecf3;             /* Light background */
--bg-medium: #c3cfe2;            /* Medium background */
```

### Section Backgrounds
```css
--section-hero: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
--section-civic: linear-gradient(135deg, #f0f3f8 0%, #d4dce9 100%);
--section-jobs: linear-gradient(135deg, #e8ecf3 0%, #bdc9de 100%);
--section-business: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
```

### Chat Widget Colors (Light/White)
```css
/* Chat window background */
background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);

/* Messages area background */
background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);

/* Input container */
background: #ffffff;
border-top: 1px solid #e5e7eb;
```

**Design Decision:** Chat widget backgrounds match the overall light/white aesthetic of the website, creating visual consistency. Only the header and toggle button use purple branding.

### Text Colors
```css
--text-primary: #2d3748;         /* Primary text (dark grey) */
--text-secondary: #4a5568;       /* Secondary text (medium grey) */
--text-light: #718096;           /* Tertiary text */
--text-inverse: #ffffff;         /* White text (on purple backgrounds) */
```

---

## 📁 CSS File Structure

### Loading Order (Critical!)
Files load in this order in `index.html`:

```html
1. css/unified-color-scheme.css      ← CSS variables & base colors
2. css/main.css                       ← Main styles & layout
3. css/hero-new.css                   ← Hero section
4. css/jobs-new.css                   ← Jobs section
5. css/civic-redesign.css             ← Civic section
6. css/ethical-business.css           ← Business section
7. css/inline-chat-widget.css         ← Chat widget base styles
8. css/unified-personalization.css    ← Personalization modal
9. css/chat-widget-ultra-clean.css    ← Chat widget overrides (high specificity)
10. <style> inline block              ← Final overrides (HIGHEST specificity)
```

**Why This Order Matters:**
- Later files override earlier files (CSS cascade)
- Inline `<style>` blocks have highest priority
- `!important` flags should be avoided but are used in inline styles for maximum specificity

---

## 🎯 Specificity Hierarchy

### CSS Specificity Levels (Low to High)
```
1. Element selectors              .chat-window { }
2. Class selectors                .chat-widget .chat-window { }
3. Multiple class selectors       .civic-chat-widget .chat-window { }
4. ID selectors                   #civicChatWindow { }
5. ID + class selectors           #civicChatWindow.chat-window { }
6. Inline styles                  <div style="..."> 
7. !important flag                background: #fff !important;
8. Inline <style> block           <style> #id { ... } </style>
9. Inline + !important (MAX)      <style> #id { ... !important; } </style>
```

### Current Chat Widget Implementation
**Location:** `index.html` lines ~79-97 (inline `<style>` block)

```css
/* Maximum specificity: ID selector + !important in inline <style> */
#civicChatWindow.chat-window,
#civicChatWindow {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
    background-color: #ffffff !important;
}
```

**Why This Approach:**
- After multiple attempts with external CSS files, inline styles proved most reliable
- Ensures consistent appearance across all devices and browsers
- Prevents conflicts from external stylesheets or cached CSS
- Can be moved to external CSS once conflicts are fully resolved

---

## 💬 Chat Widget Styling

### Component Breakdown

#### 1. Chat Toggle Button (Purple - Brand Color)
```css
.civic-chat-widget .chat-toggle {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 2px 12px rgba(102, 126, 234, 0.25);
}
```

#### 2. Chat Window Container (Light Gradient)
```css
#civicChatWindow.chat-window {
    background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%) !important;
    background-color: #ffffff !important;
}
```

#### 3. Chat Header (Purple - Brand Color)
```css
.chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}
```

#### 4. Messages Area (Light Gradient)
```css
#civicChatMessages.chat-messages {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
    background-color: #ffffff !important;
}
```

#### 5. Input Container (Solid White)
```css
#civicChatWindow .chat-input-container {
    background: #ffffff !important;
    background-color: #ffffff !important;
    border-top: 1px solid #e5e7eb;
}
```

### Purple vs White Elements

**PURPLE Elements (Brand Identity):**
- ✅ Chat toggle button
- ✅ Chat header bar
- ✅ Primary action buttons (Vote on Bills, etc.)
- ✅ User message bubbles
- ✅ Send button

**WHITE/LIGHT Elements (Content Areas):**
- ✅ Chat window background
- ✅ Messages area (conversation display)
- ✅ Input container
- ✅ Assistant message bubbles
- ✅ Empty state background

---

## 🚨 Common Issues & Solutions

### Issue 1: Chat Widget Shows Purple Background
**Symptoms:** Messages area or chat window has purple/lavender tint

**Root Cause:** Lower-specificity CSS being overridden by section backgrounds or cached styles

**Solution:**
```css
/* Use inline <style> block with ID selectors + !important */
#civicChatMessages.chat-messages {
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
    background-color: #ffffff !important;
}
```

### Issue 2: Changes Not Appearing on Mobile
**Symptoms:** Desktop shows correct colors, mobile shows old colors

**Root Causes:**
1. Browser cache (most common)
2. Service worker cache
3. CDN cache

**Solutions:**
1. **Hard refresh:** Cmd+Shift+R (iOS Safari)
2. **Clear browser cache:** Settings > Safari > Clear History and Website Data
3. **Version query parameters:** `style.css?v=20250123`
4. **Inline styles:** Use `<style>` blocks which can't be cached

### Issue 3: CSS Conflicts Between Files
**Symptoms:** Styles randomly changing, inconsistent appearance

**Root Cause:** Multiple CSS files defining same selectors with similar specificity

**Solution:**
```css
/* Use highly specific selectors in later-loading files */
#civicChatWidget.civic-chat-widget .chat-window {
    /* Overrides earlier .chat-window definitions */
}
```

---

## ✅ Best Practices

### 1. Avoid !important Flags
**Why:** Creates "specificity wars" and makes debugging difficult

**When to Use:**
- Inline `<style>` blocks only
- Temporary diagnostic testing
- Final overrides when all else fails

**Better Alternatives:**
- Increase selector specificity
- Load CSS files in correct order
- Use ID selectors (#element)

### 2. Use CSS Variables
**Why:** Consistent colors, easy maintenance

**Good:**
```css
background: var(--primary-gradient);
color: var(--text-primary);
```

**Bad:**
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: #2d3748;
```

### 3. Document Color Decisions
**Why:** Future developers understand design choices

**Always Include:**
- Why a color was chosen
- What it should be used for
- What it should NOT be used for

### 4. Mobile-First Approach
**Why:** Easier to scale up than scale down

**Pattern:**
```css
/* Base styles (mobile) */
.element {
    font-size: 14px;
}

/* Desktop styles */
@media (min-width: 768px) {
    .element {
        font-size: 16px;
    }
}
```

### 5. Semantic Class Names
**Good:**
```css
.chat-messages { }
.chat-input-container { }
.civic-section { }
```

**Bad:**
```css
.purple-box { }
.big-text { }
.container2 { }
```

---

## 🔧 Debugging Checklist

When styles aren't applying:

1. ✅ **Check browser DevTools** - See which styles are being applied
2. ✅ **Check specificity** - Higher specificity wins
3. ✅ **Check loading order** - Later CSS overrides earlier CSS
4. ✅ **Check cache** - Hard refresh to clear cache
5. ✅ **Check inline styles** - Inline styles override external CSS
6. ✅ **Check !important** - !important overrides everything
7. ✅ **Check JavaScript** - JS might be adding inline styles
8. ✅ **Check parent elements** - Backgrounds can inherit/bleed through

---

## 📱 Mobile Considerations

### Viewport Meta Tag (Critical!)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### Touch Targets
```css
/* Minimum 44x44px for touch targets (Apple guidelines) */
.chat-toggle {
    min-height: 44px;
    padding: 0.875rem 1.25rem;
}
```

### Safe Area Insets (iPhone notch)
```css
padding-bottom: env(safe-area-inset-bottom);
```

---

## 🚀 Performance Tips

1. **Minimize CSS files** - Combine when possible
2. **Use CSS variables** - Faster than repeated gradients
3. **Avoid deep nesting** - `.a .b .c .d .e` is slow
4. **Use efficient selectors** - ID and class selectors are fastest
5. **Minimize !important** - Slows down cascade resolution

---

## 📝 Quick Reference

### Adding New Colors
1. Define in `css/unified-color-scheme.css`
2. Use CSS variable: `var(--new-color)`
3. Document in this file

### Overriding Styles
1. Check current specificity
2. Increase specificity (ID selector)
3. Load CSS file later in HTML
4. Last resort: inline `<style>` block

### Testing Colors
1. Use bright diagnostic colors (red, green, blue)
2. Test on mobile device
3. Hard refresh browser
4. Check DevTools

---

**Last Updated:** 2025-01-23  
**Maintained By:** Workforce Democracy Project Team  
**Questions?** See README.md or CSS comments in source files
