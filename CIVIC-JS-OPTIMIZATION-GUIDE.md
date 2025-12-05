# Civic.js Optimization Guide - Step-by-Step

## What We're Doing

Moving 170KB of sample data from `civic.js` to an external JSON file that loads only when needed.

---

## Files Created

1. ✅ `js/civic-data-loader.js` (3.7KB) - Smart data loader
2. ✅ `data/.gitkeep` - Data directory marker
3. ⏳ `data/civic-sample-data.json` - Sample data (to be created)
4. ⏳ `js/civic-optimized.js` - Smaller civic.js (to be created)

---

## Step 1: Extract Data from civic.js

### Lines to Extract

**From civic.js, extract lines 42-1854** which contain:
- `SAMPLE_COURT_DECISIONS` (line 42-728)
- `STATE_SUPREME_COURT_DECISIONS` (line 729-1334)
- `SAMPLE_STATE_GOVERNMENT` (line 1335-1479)
- `SAMPLE_LOCAL_GOVERNMENT` (line 1480-1592)
- `SAMPLE_BILLS` (line 1593-1854)

### Create JSON Structure

```json
{
  "SAMPLE_COURT_DECISIONS": {
    "us": [ /* court decisions */ ],
    "au": [ /* court decisions */ ],
    "gb": [ /* court decisions */ ],
    /* etc */
  },
  "STATE_SUPREME_COURT_DECISIONS": {
    "california": [ /* decisions */ ],
    "texas": [ /* decisions */ ],
    /* etc */
  },
  "SAMPLE_STATE_GOVERNMENT": {
    "us": { "states": [ /* state data */ ] },
    /* etc */
  },
  "SAMPLE_LOCAL_GOVERNMENT": {
    "us": { "cities": [ /* city data */ ] },
    /* etc */
  },
  "SAMPLE_BILLS": [
    { /* bill data */ },
    { /* bill data */ }
  ]
}
```

### Manual Extraction Steps

1. Open `js/civic.js`
2. Find line 42: `const SAMPLE_COURT_DECISIONS = {`
3. Copy from line 42 to line 1854 (ends with `];` after SAMPLE_BILLS)
4. Remove the `const` declarations:
   - `const SAMPLE_COURT_DECISIONS = ` → just keep the `{...}`
   - `const STATE_SUPREME_COURT_DECISIONS = ` → just keep the `{...}`
   - etc.
5. Wrap in JSON structure shown above
6. Save as `data/civic-sample-data.json`

---

## Step 2: Create Optimized civic.js

### What Stays in civic.js

- `GOVERNMENT_APIS` (lines 8-39) - Small, always needed
- `CivicState` (lines 1857-1880) - State management
- All functions (lines 1885-2969) - Logic needed

### What Changes

**At the top of the file, add**:
```javascript
// Data will be loaded on demand by civic-data-loader.js
let SAMPLE_COURT_DECISIONS = {};
let STATE_SUPREME_COURT_DECISIONS = {};
let SAMPLE_STATE_GOVERNMENT = {};
let SAMPLE_LOCAL_GOVERNMENT = {};
let SAMPLE_BILLS = [];

// Listen for data loaded event
window.addEventListener('civicDataLoaded', (event) => {
  SAMPLE_COURT_DECISIONS = event.detail.SAMPLE_COURT_DECISIONS;
  STATE_SUPREME_COURT_DECISIONS = event.detail.STATE_SUPREME_COURT_DECISIONS;
  SAMPLE_STATE_GOVERNMENT = event.detail.SAMPLE_STATE_GOVERNMENT;
  SAMPLE_LOCAL_GOVERNMENT = event.detail.SAMPLE_LOCAL_GOVERNMENT;
  SAMPLE_BILLS = event.detail.SAMPLE_BILLS;
});
```

**Remove lines 42-1854** (all the const declarations with sample data)

---

## Step 3: Update index.html

### Add civic-data-loader.js

**Before civic.js**, add:
```html
<script src="js/civic-data-loader.js?v=20250124-LAZY-LOAD"></script>
<script src="js/civic.js?v=20250124-OPTIMIZED"></script>
```

---

## Automated Script (Alternative)

If manual extraction is tedious, here's a Node.js script:

```javascript
const fs = require('fs');

// Read civic.js
const civicJs = fs.readFileSync('js/civic.js', 'utf8');
const lines = civicJs.split('\n');

// Extract data section (lines 42-1854)
const dataSection = lines.slice(41, 1854).join('\n');

// Parse and create JSON (this requires some manual cleanup)
// Save data section to temp file for manual JSON conversion
fs.writeFileSync('temp-civic-data.txt', dataSection);

console.log('Data extracted to temp-civic-data.txt');
console.log('Manually convert to JSON format and save as data/civic-sample-data.json');
```

---

## Expected Results

### Before Optimization
- `civic.js`: 190KB
- Page load: 2-3 seconds
- Data always loads

### After Optimization
- `civic.js`: 15-20KB (optimized)
- `civic-data-loader.js`: 3.7KB (new)
- `civic-sample-data.json`: 170KB (loads only when needed)
- Page load: <1 second
- Data loads when user clicks civic section

---

## Testing

1. Open site in browser
2. Page should load fast (<1 second)
3. Click on Civic Transparency section
4. Data should load (may see brief loading indicator)
5. Civic section should work normally

---

## Rollback Plan

If something breaks:
1. Keep original `civic.js` as `civic.js.backup`
2. Remove `civic-data-loader.js` script tag from index.html
3. Restore original civic.js

---

## Next Steps

Due to the size and complexity of the data extraction (1800+ lines), I recommend:

**Option A**: I can create a complete automated script
**Option B**: You manually extract using steps above
**Option C**: I create a simplified version with representative sample data

Which would you prefer? 🤔
