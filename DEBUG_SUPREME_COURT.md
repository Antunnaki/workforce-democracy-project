# Supreme Court Debug Guide

## Issue Report
User tested US and Britain dropdowns, but couldn't see Supreme Court decisions appear.

## Debug Steps Added

### 1. Console Logging Added to civic.js

**Location 1: After SAMPLE_COURT_DECISIONS definition (line ~730)**
```javascript
console.log('📊 SAMPLE_COURT_DECISIONS loaded:', Object.keys(SAMPLE_COURT_DECISIONS));
console.log('📊 US decisions:', SAMPLE_COURT_DECISIONS.us ? SAMPLE_COURT_DECISIONS.us.length : 'undefined');
console.log('📊 GB decisions:', SAMPLE_COURT_DECISIONS.gb ? SAMPLE_COURT_DECISIONS.gb.length : 'undefined');
```

**Location 2: In generateSampleCivicData() function (line ~1476)**
```javascript
console.log('🔍 DEBUG - Country:', country);
console.log('🔍 DEBUG - Court Decisions Found:', courtDecisions.length);
console.log('🔍 DEBUG - Court Decisions:', courtDecisions);
```

**Location 3: In displayCivicResults() function (line ~1525)**
```javascript
console.log('🔍 DEBUG - Displaying results. Court Decisions:', results.courtDecisions ? results.courtDecisions.length : 'undefined');
// ... then in the if statement:
console.log('✅ DEBUG - Rendering Supreme Court section with', results.courtDecisions.length, 'decisions');
// ... or in the else:
console.log('❌ DEBUG - NOT rendering Supreme Court section. Results:', results.courtDecisions);
```

### 2. Test Page Created

**File:** `test-supreme-court.html`

This page:
- Loads civic.js
- Checks if SAMPLE_COURT_DECISIONS exists
- Lists all country keys
- Shows details of US decisions
- Shows details of GB decisions
- Provides summary of all countries

## How to Debug

### Step 1: Open Test Page
1. Open your website URL followed by `/test-supreme-court.html`
2. Example: `https://yoursite.com/test-supreme-court.html`
3. Check all 6 test sections

**Expected Results:**
- ✅ Test 1: civic.js loaded successfully
- ✅ Test 2: SAMPLE_COURT_DECISIONS exists (Object, true)
- ✅ Test 3: 6 country keys (us, gb, au, ca, fr, de)
- ✅ Test 4: US decisions found: 2
- ✅ Test 5: GB decisions found: 1
- ✅ Test 6: All countries with decision counts

### Step 2: Test Main Site with Console Open
1. Go to your main website homepage
2. Press F12 to open Developer Tools
3. Go to "Console" tab
4. Scroll to Government Transparency section
5. Select "United States" from dropdown
6. Type "test" in search box
7. Click Search button
8. Watch console for debug messages

**Expected Console Output:**
```
📊 SAMPLE_COURT_DECISIONS loaded: Array(6) [ "us", "gb", "au", "ca", "fr", "de" ]
📊 US decisions: 2
📊 GB decisions: 1
🔍 DEBUG - Country: us
🔍 DEBUG - Court Decisions Found: 2
🔍 DEBUG - Court Decisions: Array(2) [ {…}, {…} ]
🔍 DEBUG - Displaying results. Court Decisions: 2
✅ DEBUG - Rendering Supreme Court section with 2 decisions
```

### Step 3: Check Results Container
After searching, in the console type:
```javascript
document.getElementById('civicResults').innerHTML
```

This will show you the exact HTML that was rendered.

**Look for:**
```html
<div class="court-decisions-section">
    <h3 style="...">
        <i class="fas fa-gavel"></i> Supreme Court Decisions
    </h3>
    ...
</div>
```

If you DON'T see this, the court decisions aren't being rendered.

## Possible Issues and Solutions

### Issue 1: SAMPLE_COURT_DECISIONS not loading
**Symptom:** Test page shows undefined or empty
**Cause:** civic.js not loading or syntax error
**Solution:** Check browser console for JavaScript errors

### Issue 2: Country code still wrong
**Symptom:** GB shows 0 decisions but US shows 2
**Cause:** Country code mismatch wasn't fixed
**Solution:** Verify line 192 in civic.js says `gb: [` not `uk: [`

### Issue 3: Court decisions returned but not displayed
**Symptom:** Console shows "Court Decisions Found: 2" but nothing renders
**Cause:** Display logic issue or CSS hiding the section
**Solution:** Check if `createCourtDecisionCard()` function has errors

### Issue 4: Entire civic section not working
**Symptom:** No search results at all
**Cause:** JavaScript error preventing execution
**Solution:** Check console for errors, verify all functions exported

### Issue 5: CSS hiding the section
**Symptom:** HTML exists but not visible
**Cause:** CSS display:none or visibility:hidden
**Solution:** In browser DevTools, inspect the court-decisions-section element

## Files Modified for Debugging

1. **js/civic.js**
   - Added console.log statements (3 locations)
   - No functionality changes

2. **index.html**
   - Updated cache busting: v42h-supreme-court → v42h-debug

3. **test-supreme-court.html** (new file)
   - Standalone test page to verify data structure

## Next Steps

After running the debug steps above, report back with:

1. **Test page results**: Did all 6 tests pass?
2. **Console output**: What messages appeared when you searched?
3. **HTML check**: Does `civicResults` contain the court-decisions-section div?
4. **Visual check**: Can you see the "Supreme Court Decisions" heading at all?

This will help identify exactly where the issue is occurring.

## Cache Clearing

Make sure to do a **hard refresh** after these changes:
- **Windows/Linux**: Ctrl + Shift + R
- **Mac**: Cmd + Shift + R
- **Or**: Clear browser cache completely

## Expected Behavior

When working correctly:

1. User selects country (e.g., "United States")
2. User enters any search term (e.g., "test")
3. User clicks Search
4. Page shows:
   - Demo badge at top
   - Representative card(s)
   - **"🏛️ Supreme Court Decisions" heading**
   - Decision card(s) with expandable sections
   
The Supreme Court section should appear BELOW the representatives, with a clear heading and decision cards.
