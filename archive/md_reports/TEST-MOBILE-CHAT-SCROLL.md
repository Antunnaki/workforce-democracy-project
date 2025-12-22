# Quick Test Guide: Mobile Chat Input Scroll

## What Was Fixed

When you tap on a chat input on mobile, the keyboard pops up and the page automatically scrolls so the input box is at the top of the screen. This way you can always see what you're typing!

## How to Test (iPhone 15 Pro Max)

### Test 1: Civic Chat Section
1. Scroll to the **Civic Transparency & Accountability** section
2. Tap on the **"Ask about specific jobs"** button (purple gradient)
3. Chat expands with input field
4. **Tap on the input field** that says "Ask about any profession..."
5. ✅ **Expected**: Page smoothly scrolls up, input appears at top of screen, keyboard slides up from bottom

### Test 2: Jobs Section  
1. Scroll to the **Democratic Workplace Jobs** section
2. Tap on **"Ask about specific jobs"** button (green gradient)
3. Chat expands with input field
4. **Tap on the input field**
5. ✅ **Expected**: Page smoothly scrolls up, input visible above keyboard

### Test 3: Typing Experience
1. With keyboard open and input at top of screen
2. Start typing: "What is a Research Assistant?"
3. ✅ **Expected**: You can see every character you type
4. ✅ **Expected**: Input stays visible, doesn't get hidden

### Test 4: Send and Return
1. Type a message
2. Tap the **Send button** (arrow icon)
3. ✅ **Expected**: Message sends, input stays accessible
4. Tap input again to type another message
5. ✅ **Expected**: Scrolls to top again

## What You Should See

### BEFORE (Old Behavior - Bad ❌)
```
Tap input → Keyboard covers input → Can't see what you're typing 😞
```

### AFTER (New Behavior - Good ✅)
```
Tap input → Page scrolls up → Input at top → Keyboard below → You can see everything! 😊
```

## Visual Guide

```
┌─────────────────────┐
│ ← Back    👤  EN    │  ← Header (stays visible)
├─────────────────────┤
│ CHAT HEADER         │
├─────────────────────┤
│ [Type here... ] 📤  │  ← Input at TOP (visible!)
├─────────────────────┤
│ Previous messages   │
│ ...                 │
└─────────────────────┘
╔═════════════════════╗
║  Q W E R T Y        ║  ← Keyboard
║  A S D F G H        ║
╚═════════════════════╝
```

## Common Issues & Solutions

### Issue: Keyboard appears but input not at top
**Solution**: Try tapping the input again, or refresh the page

### Issue: No auto-scroll happens
**Solution**: Check that JavaScript is enabled in Safari settings

### Issue: Scroll is too fast/slow
**Solution**: This is working as designed - report if uncomfortable

## Browsers to Test

Priority:
1. ✅ Safari (iOS) - iPhone 15 Pro Max
2. ✅ Chrome (iOS)
3. ✅ Firefox (iOS)

## Quick Yes/No Checklist

- [ ] Can I tap the chat input?
- [ ] Does the page scroll when keyboard appears?
- [ ] Is the input box at the top of the screen?
- [ ] Can I see the keyboard below the input?
- [ ] Can I see what I'm typing?
- [ ] Does it work in Civic chat?
- [ ] Does it work in Jobs chat?
- [ ] Is the scrolling smooth?

**If all checkboxes are YES → Fix is working! ✅**

## Approximate Scroll Distance

The page will scroll so that:
- Input box is at **top of screen** (just below header)
- Approximately **80px from top** (accounts for fixed header)
- Smooth animation takes **~300ms**

## Desktop Testing (Bonus)

On desktop/laptop:
1. Click chat input
2. ✅ **Expected**: No unwanted scrolling, works normally
3. Type and use chat as usual

## Need Help?

If something doesn't work:
1. Take a screenshot showing the problem
2. Note which chat widget (Civic or Jobs)
3. Note which browser/device
4. Report the issue with details

---

**Fix Version**: V32  
**Test Date**: 2025-01-24  
**Status**: Ready for User Testing  
**Estimated Test Time**: 2-3 minutes per chat widget
