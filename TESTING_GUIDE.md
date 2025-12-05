# Welcome Modal Testing Guide

## Quick Test Instructions

### 1. Clear Previous Tour Data
Open browser console (F12) and run:
```javascript
localStorage.removeItem('hasSeenGuidedTour');
localStorage.removeItem('wdp_personalization_enabled');
localStorage.removeItem('wdp_personalization_choice');
localStorage.removeItem('wdp_user_postcode');
```

Or simply:
```javascript
localStorage.clear();
```

### 2. Refresh the Page
The modal should appear after 1 second.

---

## Visual Checklist

### Step 1: Welcome
- [ ] Purple gradient header visible
- [ ] "Welcome to Workforce Democracy!" title
- [ ] 4 feature cards in grid layout:
  - [ ] 🗳️ Civic Engagement
  - [ ] 💼 Job Exploration
  - [ ] 🤝 Ethical Business
  - [ ] 📚 Learning Center
- [ ] Cards have subtle borders
- [ ] "Let's Go!" button is styled
- [ ] Hover effect on cards works

### Step 2: Civic Engagement
- [ ] Step icon (🗳️) visible at top
- [ ] Purple gradient heading text
- [ ] Light purple background box with checklist
- [ ] 4 checkmarks with features
- [ ] "Next" button works
- [ ] Progress dot 2 is now active

### Step 3: Jobs
- [ ] Step icon (💼) visible
- [ ] Purple gradient heading
- [ ] 2 feature cards (Compare 230+ & AI Assistant)
- [ ] Cards have icons on left side
- [ ] Text aligned properly
- [ ] "Next" button works

### Step 4: Ethical Business & Learning
- [ ] Step icon (🤝) visible
- [ ] 2 colored gradient boxes:
  - [ ] Purple-tinted box (Ethical Business)
  - [ ] Green-tinted box (Learning Center)
- [ ] Both boxes have different styling
- [ ] Text readable in both boxes
- [ ] "Next" button works

### Step 5: Personalization
- [ ] Step icon (✨) visible
- [ ] Light purple input form box
- [ ] Postcode input field present
- [ ] Placeholder text: "e.g., SW1A 1AA"
- [ ] Input focus shows purple border & shadow
- [ ] Green-accented privacy badge below
- [ ] Shield icon (🔐) in privacy badge
- [ ] 4 privacy bullet points listed
- [ ] "What gets remembered" section visible
- [ ] Two buttons:
  - [ ] "Enable Personalization"
  - [ ] "No Thanks, Keep It Simple"
- [ ] Link to Privacy Settings at bottom

### Progress Indicators
- [ ] 5 dots visible at bottom of modal
- [ ] Active dot has purple gradient
- [ ] Dots update as you progress
- [ ] All previous dots stay active

### General Layout
- [ ] Modal centered on screen
- [ ] Close button (X) in top-right corner
- [ ] Modal has white background
- [ ] Purple shadow around modal
- [ ] Text is readable and properly sized
- [ ] No overflow or cut-off content
- [ ] Buttons have proper spacing

---

## Functional Testing

### Navigation
1. [ ] Click "Let's Go!" - advances to step 2
2. [ ] Click "Next" on step 2 - advances to step 3
3. [ ] Click "Next" on step 3 - advances to step 4
4. [ ] Click "Next" on step 4 - advances to step 5
5. [ ] Click "Skip tour" - closes modal immediately
6. [ ] Click X button - closes modal

### Postcode Input (Step 5)
1. [ ] Click in postcode field - shows purple border
2. [ ] Type "SW1A 1AA" - text appears
3. [ ] Click outside - border returns to grey
4. [ ] Focus again - purple border returns

### Personalization Buttons (Step 5)
1. **Enable Personalization:**
   - [ ] Click button with postcode entered
   - [ ] Modal closes
   - [ ] Success notification appears: "We'll find local resources for you"
   - [ ] Check localStorage:
     ```javascript
     localStorage.getItem('wdp_personalization_enabled') // should be 'true'
     localStorage.getItem('wdp_user_postcode') // should be your postcode
     ```

2. **Enable Without Postcode:**
   - [ ] Clear postcode field
   - [ ] Click "Enable Personalization"
   - [ ] Success notification: "Your journey is now customized"
   - [ ] Check localStorage - postcode should be empty string

3. **No Thanks:**
   - [ ] Click "No Thanks, Keep It Simple"
   - [ ] Modal closes
   - [ ] Notification: "Welcome! Scroll down to start exploring"
   - [ ] Check localStorage:
     ```javascript
     localStorage.getItem('wdp_personalization_enabled') // should be 'false'
     localStorage.getItem('wdp_personalization_choice') // should be 'skipped'
     ```

### Persistence
1. [ ] Complete tour once
2. [ ] Refresh page
3. [ ] Modal should NOT appear again
4. [ ] Clear localStorage
5. [ ] Refresh page
6. [ ] Modal appears again

---

## Responsive Testing

### Desktop (1920px)
- [ ] Modal max-width: 700px
- [ ] Feature cards: 2 columns (4 cards)
- [ ] All content visible without scrolling
- [ ] Progress dots centered

### Laptop (1366px)
- [ ] Modal scales appropriately
- [ ] Feature cards still in 2 columns
- [ ] Text remains readable
- [ ] Buttons accessible

### Tablet (768px)
- [ ] Modal adapts to screen width
- [ ] Feature cards stack to 1 column
- [ ] Padding adjusts
- [ ] Touch targets large enough

### Mobile (375px)
- [ ] Modal fits screen (with margins)
- [ ] All feature cards single column
- [ ] Text size appropriate
- [ ] Buttons stack vertically if needed
- [ ] Postcode input full width
- [ ] Privacy badge readable

---

## Browser Testing

### Chrome/Edge
- [ ] Purple gradient renders smoothly
- [ ] No color banding
- [ ] Shadows display correctly
- [ ] Hover effects work
- [ ] Focus states visible

### Firefox
- [ ] Purple gradient displays correctly
- [ ] Border radius works
- [ ] Text gradient clips properly
- [ ] All animations smooth

### Safari (Desktop)
- [ ] Gradient backgrounds render
- [ ] -webkit-background-clip works for text
- [ ] Focus styles visible
- [ ] No layout issues

### Safari (iOS)
- [ ] Modal displays correctly
- [ ] No purple/lavender tinting
- [ ] Touch interactions work
- [ ] Postcode input keyboard appears
- [ ] Buttons tap correctly

### Chrome Mobile
- [ ] Renders identically to desktop
- [ ] Touch targets appropriate
- [ ] Scrolling smooth if needed
- [ ] Input focus works

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab moves through interactive elements
- [ ] Enter activates buttons
- [ ] Escape closes modal (if implemented)
- [ ] Focus indicators visible

### Screen Reader
- [ ] Modal announces when opened
- [ ] Headings announced properly
- [ ] Button purposes clear
- [ ] Input field labeled correctly
- [ ] Close button has aria-label

### Color Contrast
- [ ] Header text readable on purple gradient
- [ ] Body text has sufficient contrast
- [ ] Button text readable
- [ ] Privacy badge text clear
- [ ] Link colors distinguishable

---

## Edge Cases

### Long Postcode
- [ ] Enter "SW1A 1AA EXTRA TEXT"
- [ ] Input accepts all characters
- [ ] Text doesn't overflow container

### Rapid Clicking
- [ ] Click "Next" rapidly
- [ ] Steps advance properly (no skipping)
- [ ] Progress dots update correctly

### Back Button
- [ ] Complete tour
- [ ] Click browser back button
- [ ] Page behavior normal
- [ ] Modal doesn't reappear incorrectly

### Multiple Tabs
- [ ] Open site in two tabs
- [ ] Complete tour in tab 1
- [ ] Refresh tab 2
- [ ] Modal should not appear in tab 2

---

## Console Errors

During all testing:
- [ ] No JavaScript errors in console
- [ ] No CSS warnings
- [ ] No failed resource loads
- [ ] No security warnings

---

## Performance

- [ ] Modal appears within 1 second
- [ ] Step transitions are instant
- [ ] No lag when typing in postcode
- [ ] Button clicks responsive
- [ ] No jank or stutter in animations

---

## LocalStorage Verification

After enabling personalization with postcode "SW1A 1AA":

```javascript
// Check all stored values
console.log('Personalization enabled:', localStorage.getItem('wdp_personalization_enabled'));
console.log('Choice:', localStorage.getItem('wdp_personalization_choice'));
console.log('Consent date:', localStorage.getItem('wdp_personalization_consent_date'));
console.log('Postcode:', localStorage.getItem('wdp_user_postcode'));
console.log('Learning profile:', JSON.parse(localStorage.getItem('wdp_learning_profile')));
console.log('Tour seen:', localStorage.getItem('hasSeenGuidedTour'));
```

Expected output:
```
Personalization enabled: true
Choice: enabled
Consent date: 2025-01-23T[timestamp]
Postcode: SW1A 1AA
Learning profile: {
  billsViewed: [],
  votingHistory: [],
  categoriesInterested: {},
  timeSpent: {},
  questionsAsked: [],
  knowledgeLevel: 'beginner',
  postcode: 'SW1A 1AA',
  createdAt: '2025-01-23T[timestamp]'
}
Tour seen: true
```

---

## Sign-Off Checklist

Before marking as complete:
- [ ] All visual elements display correctly
- [ ] All buttons function properly
- [ ] Postcode saves correctly
- [ ] localStorage data accurate
- [ ] Modal doesn't reappear inappropriately
- [ ] Responsive on all screen sizes
- [ ] No console errors
- [ ] Accessible via keyboard
- [ ] Performance is smooth
- [ ] Privacy messaging clear and accurate

---

## Reporting Issues

If you find issues, document:
1. **What you saw** (screenshot if possible)
2. **What you expected**
3. **Steps to reproduce**
4. **Browser & device**
5. **Console errors** (if any)

---

**Testing completed by:** _________________  
**Date:** _________________  
**Devices tested:** _________________  
**Browsers tested:** _________________  
**Result:** ☐ Pass  ☐ Fail  ☐ Issues found (documented)
