# Civic.js Data Extraction Instructions

## Overview
The `js/civic.js` file is 190KB (nearly 3000 lines) because it contains large embedded sample data objects. This causes 2-3 second page load times on mobile devices.

## Solution
Extract the sample data (lines 42-1854) to an external JSON file that loads on-demand.

## Step-by-Step Manual Extraction

### Step 1: Create the JSON File

1. Open `js/civic.js` in your text editor
2. Select and copy lines **42 through 1854** (the entire data section containing):
   - `SAMPLE_COURT_DECISIONS = {` (line 42)
   - `STATE_SUPREME_COURT_DECISIONS = {` (line 729)
   - `SAMPLE_STATE_GOVERNMENT = {` (line 1335)
   - `SAMPLE_LOCAL_GOVERNMENT = {` (line 1480)
   - `SAMPLE_BILLS = [` (line 1593)
   - Ends at line 1854 with `];`

3. Create a new file: `data/civic-sample-data.json`

4. Paste the copied content and make these transformations:

**Before (JavaScript):**
```javascript
const SAMPLE_COURT_DECISIONS = {
  us: [ ... ],
  gb: [ ... ]
};

const STATE_SUPREME_COURT_DECISIONS = {
  us: { ... }
};

const SAMPLE_STATE_GOVERNMENT = {
  us: { ... }
};

const SAMPLE_LOCAL_GOVERNMENT = {
  us: { ... }
};

const SAMPLE_BILLS = [
  ...
];
```

**After (JSON):**
```json
{
  "SAMPLE_COURT_DECISIONS": {
    "us": [ ... ],
    "gb": [ ... ]
  },
  "STATE_SUPREME_COURT_DECISIONS": {
    "us": { ... }
  },
  "SAMPLE_STATE_GOVERNMENT": {
    "us": { ... }
  },
  "SAMPLE_LOCAL_GOVERNMENT": {
    "us": { ... }
  },
  "SAMPLE_BILLS": [
    ...
  ]
}
```

**Transformation Steps:**
- Remove all `const ` declarations
- Remove all `;` at the end of variable declarations  
- Wrap the entire content in `{ }` (one root object)
- Add double quotes around each root key: `"SAMPLE_COURT_DECISIONS"`, `"STATE_SUPREME_COURT_DECISIONS"`, etc.
- Add commas between the root properties

### Step 2: Replace civic.js

1. Back up your current `js/civic.js` file
2. Delete lines 42-1854 (all the sample data)
3. Replace those deleted lines with:

```javascript
// Sample data - initialized as empty and loaded on demand
let SAMPLE_COURT_DECISIONS = {};
let STATE_SUPREME_COURT_DECISIONS = {};
let SAMPLE_STATE_GOVERNMENT = {};
let SAMPLE_LOCAL_GOVERNMENT = {};
let SAMPLE_BILLS = [];

// Data loading status
let civicDataLoaded = false;
let civicDataLoading = false;

/**
 * Ensure civic data is loaded before proceeding
 * Called by civic functions that need the sample data
 */
async function ensureCivicDataLoaded() {
    if (civicDataLoaded) {
        return true;
    }
    
    if (civicDataLoading) {
        // Wait for existing load to complete
        return new Promise((resolve) => {
            window.addEventListener('civicDataLoaded', () => resolve(true), { once: true });
        });
    }
    
    // Trigger data load if not already loading
    if (window.loadCivicData) {
        const data = await window.loadCivicData();
        SAMPLE_COURT_DECISIONS = data.SAMPLE_COURT_DECISIONS;
        STATE_SUPREME_COURT_DECISIONS = data.STATE_SUPREME_COURT_DECISIONS;
        SAMPLE_STATE_GOVERNMENT = data.SAMPLE_STATE_GOVERNMENT;
        SAMPLE_LOCAL_GOVERNMENT = data.SAMPLE_LOCAL_GOVERNMENT;
        SAMPLE_BILLS = data.SAMPLE_BILLS;
        civicDataLoaded = true;
        return true;
    }
    
    return false;
}

// Listen for civic data loaded event from civic-data-loader.js
window.addEventListener('civicDataLoaded', (event) => {
    const data = event.detail;
    SAMPLE_COURT_DECISIONS = data.SAMPLE_COURT_DECISIONS;
    STATE_SUPREME_COURT_DECISIONS = data.STATE_SUPREME_COURT_DECISIONS;
    SAMPLE_STATE_GOVERNMENT = data.SAMPLE_STATE_GOVERNMENT;
    SAMPLE_LOCAL_GOVERNMENT = data.SAMPLE_LOCAL_GOVERNMENT;
    SAMPLE_BILLS = data.SAMPLE_BILLS;
    civicDataLoaded = true;
});
```

4. Find functions that reference the sample data and add `await ensureCivicDataLoaded();` at the beginning:
   - `searchCivicData()` - already added in Step 2
   - `loadSupremeCourtDashboard()` - add: `await ensureCivicDataLoaded();` as first line
   - Any other function that reads from `SAMPLE_COURT_DECISIONS`, `STATE_SUPREME_COURT_DECISIONS`, `SAMPLE_STATE_GOVERNMENT`, `SAMPLE_LOCAL_GOVERNMENT`, or `SAMPLE_BILLS`

### Step 3: Update index.html

Add the civic-data-loader.js script **BEFORE** civic.js:

Find this line in index.html (around line 1200-1220):
```html
<script src="js/civic.js"></script>
```

Add BEFORE it:
```html
<script src="js/civic-data-loader.js"></script>
<script src="js/civic.js"></script>
```

### Step 4: Test

1. Open your site in a browser
2. Go to the Civic Transparency section
3. Select "Supreme Court" from the Government Level dropdown
4. Verify that court decisions load correctly
5. Test searching for representatives
6. Check browser console for any errors

## Expected Results

### Before Optimization:
- Page load time: **2-3 seconds** (especially on mobile)
- civic.js file size: **190KB**
- Parse time: **~500ms** on mobile devices
- All data loaded upfront (wasted if user never visits civic section)

### After Optimization:
- Page load time: **<1 second**
- civic.js file size: **~20KB** (90% reduction!)
- civic-sample-data.json: **~170KB** (loaded only when needed)
- Data loads on demand when user:
  - Clicks on Civic Transparency section
  - Or scrolls near it (100px away - preloading)

### Performance Improvement:
- **90% file size reduction** for civic.js
- **~2 second faster** initial page load
- Better mobile performance
- Data only loaded when actually needed

## Files Involved

### Already Created:
✅ `js/civic-data-loader.js` - Smart lazy loader with IntersectionObserver  
✅ `data/.gitkeep` - Data directory marker

### To Create:
⏳ `data/civic-sample-data.json` - Extracted sample data (~170KB)

### To Modify:
⏳ `js/civic.js` - Remove data, add loader integration  
⏳ `index.html` - Add civic-data-loader.js script tag

## Verification Checklist

After completing the extraction:

- [ ] civic-sample-data.json is valid JSON (use jsonlint.com to validate)
- [ ] civic.js file size reduced from 190KB to ~20KB
- [ ] civic-data-loader.js is loaded before civic.js in index.html
- [ ] Supreme Court section loads decisions correctly
- [ ] Representative search works
- [ ] No console errors when accessing civic features
- [ ] Page load time improved (check Network tab in DevTools)

## Rollback Plan

If issues occur:
1. Remove the script tag for `civic-data-loader.js` from index.html
2. Restore the original civic.js from backup
3. Delete data/civic-sample-data.json
4. Page will work exactly as before

## Additional Notes

- The civic-data-loader.js uses IntersectionObserver to preload data 100px before the civic section becomes visible
- This provides a good balance between performance and user experience
- Data is cached after first load, so subsequent visits are instant
- The loader has graceful error handling with fallback to empty data structures

## Why This Optimization Matters

Mobile devices (like iPhone 15 Pro Max) have:
- Slower JavaScript parsing than desktop
- Limited bandwidth on cellular connections
- Battery constraints

Loading 190KB of JavaScript that might never be used:
- Wastes bandwidth
- Drains battery (parsing overhead)
- Delays page interactivity
- Impacts Core Web Vitals scores

Lazy loading reduces initial payload by 90% and loads data only when needed!
