# 🔬 Citation System Debug Guide - V36.11.12

## Problem Summary

User reports: **Citations still not working properly** even after V36.11.12 fix was applied.

**Symptoms:**
- Citations appearing as `_CITATION0_` or `_CITATION1_` text
- Citations not rendering as small superscripts
- Placeholder text visible to end users

## What We've Fixed (V36.11.12)

✅ **Fixed the placeholder conflict in markdown-renderer.js**

**The Problem:**
```javascript
// OLD (BROKEN):
const placeholder = `__CITATION_${i}__`;  // ❌ Conflicts with __bold__ syntax

text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');  
// This regex CATCHES __CITATION_0__ and converts it to <strong>CITATION_0</strong>

// Try to restore:
text = text.replace('__CITATION_0__', '[1]');  // ❌ FAILS - placeholder was destroyed
```

**The Fix (V36.11.12):**
```javascript
// NEW (FIXED):
const placeholder = `◊◊CITE${i}◊◊`;  // ✅ Special chars won't match markdown

text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');  
// This regex IGNORES ◊◊CITE0◊◊ ✅

// Restore:
text = text.split('◊◊CITE0◊◊').join('[1]');  // ✅ SUCCESS - placeholder intact
```

## Diagnostic Tools Created

I've created **three test files** to help debug this issue:

### 1. **test-citation-debug.html** (8.7KB)
**Purpose:** Test the `processInlineMarkdown()` function in isolation

**What it tests:**
- Simple citations: `[1]`
- Multiple citations: `[1]`, `[2]`, `[3]`
- Citations with `**bold**` syntax
- Citations with `__bold__` syntax (the conflict case)
- Real-world examples

**Features:**
- Step-by-step debug logging
- Shows placeholder replacement process
- Highlights where failures occur

**How to use:**
```bash
# Open in browser:
open test-citation-debug.html

# Or access via web server:
https://your-domain.com/test-citation-debug.html
```

---

### 2. **test-full-citation-flow.html** (14.5KB)
**Purpose:** Test the FULL processing pipeline from backend response to rendered HTML

**What it tests:**
- Backend response → markdown-renderer.js → citation-renderer.js → CSS → Browser
- All citation conversion steps
- Sources section rendering
- Bold/italic markdown conversion
- Final <sup> element creation

**Features:**
- Visual pipeline diagram
- Pass/fail status for each test
- Citation analysis (checks for placeholders, <sup> elements, literal [1] text)
- Grid layout comparing multiple test cases

**How to use:**
```bash
open test-full-citation-flow.html
```

---

### 3. **test-backend-response-simulation.html** (18.5KB) ⭐ **RECOMMENDED**
**Purpose:** Simulate ACTUAL backend API responses and test the complete rendering

**What it tests:**
- **Test 1: Simple Citation** - Basic [1] citation with one source
- **Test 2: Multiple Citations** - Multiple [1], [2], [3] with sources
- **Test 3: Complex** - Bold (**text** and __text__) + citations + italic
- **Test 4: Real-World** - Actual Eric Adams indictment response format

**Features:**
- 🔬 Interactive debug console with timestamped logs
- 📡 Shows raw backend response (left panel)
- 🖥️ Shows frontend render (right panel)
- 📊 Automated citation analysis with pass/fail checks
- 🐛 Detailed processing pipeline logs
- 📋 Copy button to grab backend responses

**How to use:**
```bash
open test-backend-response-simulation.html

# Click buttons:
# - "Test 1: Simple Citation"
# - "Test 2: Multiple Citations"
# - "Test 3: Complex (Bold + Citations)"
# - "Test 4: Real-World Response"
```

**Expected Results (if working correctly):**
- ✅ No placeholder text visible
- ✅ Citations render as small superscripts (¹²³)
- ✅ No literal [1] in main text
- ✅ Sources section appears at bottom
- ✅ All checks show "PASS"

---

## Next Steps for User

### Step 1: Verify V36.11.12 is Deployed

**Check if the fix is actually deployed:**

```bash
# SSH into web server
ssh user@your-server.com

# Check markdown-renderer.js version
grep -n "V36.11.12" /path/to/website/js/markdown-renderer.js

# Should see:
# Line 2: * MARKDOWN RENDERER - Phase 4 Frontend Enhancement (V36.11.12)
# Line 14: * V36.11.12: Fixed citation placeholder conflict...
# Line 128: const placeholder = `◊◊CITE${citationIndex}◊◊`;  // V36.11.12: Using special chars...
```

**Expected output:**
```
2: * MARKDOWN RENDERER - Phase 4 Frontend Enhancement (V36.11.12)
14: * V36.11.12: Fixed citation placeholder conflict with markdown bold syntax (__text__)
121: // V36.11.12: Fix citation placeholder conflict with markdown bold syntax
128: const placeholder = `◊◊CITE${citationIndex}◊◊`;  // V36.11.12: Using special chars that won't conflict
144: // V36.11.12: Restore citations with global replace to catch all instances
```

**If V36.11.12 is NOT found:**
```bash
# Deploy the updated file:
# Upload js/markdown-renderer.js from your local machine to the server
scp js/markdown-renderer.js user@server:/path/to/website/js/

# Verify upload:
tail -20 /path/to/website/js/markdown-renderer.js
# Should see: window.parseMarkdownAndCitations = parseMarkdownAndCitations;
```

---

### Step 2: Clear Browser Cache COMPLETELY

**Why this matters:**
Browsers aggressively cache JavaScript files. Even if you deployed V36.11.12, the browser might still be using the old V36.11.11 version.

**How to clear cache (by browser):**

**Chrome/Edge:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cached images and files"
3. Time range: "All time"
4. Click "Clear data"
5. **Hard refresh:** `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)

**Firefox:**
1. Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
2. Select "Cache"
3. Time range: "Everything"
4. Click "OK"
5. **Hard refresh:** `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

**Safari:**
1. Press `Cmd+Option+E` to empty caches
2. Or: Safari → Preferences → Advanced → Show Develop menu
3. Develop → Empty Caches
4. **Hard refresh:** `Cmd+R` while holding `Shift`

---

### Step 3: Run Test Files

**Test in this order:**

#### **A. Run Backend Response Simulation (RECOMMENDED FIRST)**
```
URL: https://your-domain.com/test-backend-response-simulation.html
```

1. Open in browser
2. Click "Test 1: Simple Citation"
3. Check results in right panel
4. Look at "Citation Analysis Results"

**Expected results:**
- ✅ Placeholder text visible: **PASS** (No placeholders found)
- ✅ <sup> elements present: **PASS** (Found 1 citation superscript)
- ✅ No literal [1] in main text: **PASS** (All citations converted)
- ✅ Sources section present: **PASS** (Sources section rendered)

**If any checks show FAIL:**
- Check debug console (bottom panel)
- Look for error messages
- Copy debug log and send to me

#### **B. Run Full Citation Flow Test**
```
URL: https://your-domain.com/test-full-citation-flow.html
```

1. Open in browser
2. All 4 tests should auto-run
3. Check status badges (should all be green "PASS")

#### **C. Run Citation Debug Test**
```
URL: https://your-domain.com/test-citation-debug.html
```

1. Open in browser
2. All 5 tests should auto-run
3. Check debug logs for each test
4. Verify "Final output" shows `[1]` not `◊◊CITE0◊◊`

---

### Step 4: Test on Live Site

**After all test files pass, test on actual chat widgets:**

1. **Representatives Chat:**
   - Open homepage: `https://your-domain.com`
   - Click "Ask AI Assistant" or toggle Representatives chat
   - Ask: "Tell me about Eric Adams corruption case"
   - **Check:** Citations should appear as small blue superscripts ¹²³

2. **Bills Chat:**
   - Navigate to Bills section
   - Ask: "Explain the Infrastructure Investment and Jobs Act"
   - **Check:** Citations render correctly

3. **Voting Records Chat:**
   - Navigate to Voting Records section
   - Ask: "What bills did Congress pass in 2023?"
   - **Check:** Citations render correctly

**What to look for:**
- ✅ Citations appear as small elevated numbers (not regular text)
- ✅ Citations are blue and clickable
- ✅ Clicking citation scrolls to Sources section
- ✅ No "_CITATION" or "◊◊CITE" text visible
- ✅ Bold/italic markdown works correctly

---

## If Tests PASS but Live Site FAILS

This means there's a different issue in the production environment.

**Possible causes:**

### 1. **CDN/Caching Issues**
If using Cloudflare or another CDN:

```bash
# Purge CDN cache for JavaScript files
# Cloudflare example:
curl -X POST "https://api.cloudflare.com/client/v4/zones/YOUR_ZONE_ID/purge_cache" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"files":["https://your-domain.com/js/markdown-renderer.js","https://your-domain.com/js/citation-renderer.js"]}'
```

### 2. **Script Loading Order**
Check HTML to ensure scripts load in correct order:

```html
<!-- MUST be in this order: -->
<script src="js/citation-renderer.js"></script>  <!-- FIRST -->
<script src="js/markdown-renderer.js"></script>   <!-- SECOND -->
<script src="js/inline-civic-chat.js"></script>   <!-- THIRD -->
```

### 3. **Backend Response Format**
The backend might be sending citations in a different format.

**Check backend logs:**
```bash
# SSH into backend server
ssh user@backend-server.com

# Check server logs:
tail -50 /var/log/your-app/server.log | grep "query"

# Look for response format - should include [1], [2], [3] and "Sources:" section
```

**Test backend directly:**
```bash
curl -X POST https://api.your-domain.com/api/backend/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about Eric Adams",
    "context": {},
    "chatType": "representatives"
  }' | jq .

# Response should include:
# - "response": "text with [1] citations"
# - "Sources:\n1. Source name\n   URL: https://..."
```

### 4. **JavaScript Console Errors**
Open browser DevTools (F12) and check Console tab:

```javascript
// Look for errors like:
// - "window.parseMarkdownAndCitations is not a function"
// - "window.convertCitationsToHTML is not a function"
// - "Cannot read property 'mainText' of undefined"

// If these appear, scripts aren't loading correctly
```

---

## Deep Dive: What V36.11.12 Actually Fixed

### The Technical Problem

**Original code (V36.11.11):**
```javascript
function processInlineMarkdown(text) {
    const citationPlaceholders = [];
    let citationIndex = 0;
    
    // Step 1: Save citations
    text = text.replace(/\[(\d+)\]/g, (match, num) => {
        const placeholder = `__CITATION_${citationIndex}__`;  // ❌ PROBLEM HERE
        citationPlaceholders.push({ placeholder, citation: match });
        citationIndex++;
        return placeholder;
    });
    
    // Step 2: Process bold markdown
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');  // ❌ CATCHES __CITATION_0__!
    
    // Step 3: Restore citations
    citationPlaceholders.forEach(({ placeholder, citation }) => {
        text = text.replace(placeholder, citation);  // ❌ FAILS - placeholder was destroyed
    });
    
    return text;
}
```

**Execution trace (BROKEN):**
```
Input:  "The __controversial__ bill[1] was passed"

Step 1: Replace [1] with __CITATION_0__
Output: "The __controversial__ bill__CITATION_0__ was passed"

Step 2: Process __text__ → <strong>text</strong>
Regex: /__([^_]+)__/g
Matches: "__controversial__" and "__CITATION_0__"  ❌ UNINTENDED MATCH
Output: "The <strong>controversial</strong> bill<strong>CITATION_0</strong> was passed"

Step 3: Try to restore __CITATION_0__ → [1]
Looking for: "__CITATION_0__"
Found: <strong>CITATION_0</strong>  ❌ DOESN'T MATCH
Result: FAILS

Final: "The <strong>controversial</strong> bill<strong>CITATION_0</strong> was passed"
Display: Shows "_CITATION0_" text ❌
```

**Fixed code (V36.11.12):**
```javascript
function processInlineMarkdown(text) {
    const citationPlaceholders = [];
    let citationIndex = 0;
    
    // Step 1: Save citations with UNIQUE placeholder
    text = text.replace(/\[(\d+)\]/g, (match, num) => {
        const placeholder = `◊◊CITE${citationIndex}◊◊`;  // ✅ FIXED: Special characters
        citationPlaceholders.push({ placeholder, citation: match });
        citationIndex++;
        return placeholder;
    });
    
    // Step 2: Process bold markdown (now safe)
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');  // ✅ WON'T match ◊◊CITE0◊◊
    
    // Step 3: Restore citations (now reliable)
    citationPlaceholders.forEach(({ placeholder, citation }) => {
        text = text.split(placeholder).join(citation);  // ✅ More reliable than replace()
    });
    
    return text;
}
```

**Execution trace (FIXED):**
```
Input:  "The __controversial__ bill[1] was passed"

Step 1: Replace [1] with ◊◊CITE0◊◊
Output: "The __controversial__ bill◊◊CITE0◊◊ was passed"

Step 2: Process __text__ → <strong>text</strong>
Regex: /__([^_]+)__/g
Matches: "__controversial__" only  ✅ Placeholder ignored
Output: "The <strong>controversial</strong> bill◊◊CITE0◊◊ was passed"

Step 3: Restore ◊◊CITE0◊◊ → [1]
Looking for: "◊◊CITE0◊◊"
Found: "◊◊CITE0◊◊"  ✅ MATCHES
Result: SUCCESS

Final: "The <strong>controversial</strong> bill[1] was passed"
Next step: citation-renderer.js converts [1] → <sup>1</sup>
Display: "The controversial bill¹ was passed" ✅
```

### Why ◊◊CITE0◊◊ Works

**Characteristics of ◊ (lozenge, Unicode U+25CA):**
- ✅ NOT used in any markdown syntax
- ✅ Won't match: `**bold**`, `*italic*`, `__bold__`, `_italic_`, `[link]`, `# heading`
- ✅ Visually distinct in debug logs
- ✅ Unlikely to appear in natural text
- ✅ Easy to spot if something goes wrong

**Why we use split().join() instead of replace():**
```javascript
// replace() without regex only replaces FIRST occurrence:
const text = "Test ◊◊CITE0◊◊ and ◊◊CITE0◊◊ again";
text.replace("◊◊CITE0◊◊", "[1]");
// → "Test [1] and ◊◊CITE0◊◊ again"  ❌ Only first replaced

// split().join() replaces ALL occurrences:
text.split("◊◊CITE0◊◊").join("[1]");
// → "Test [1] and [1] again"  ✅ All replaced
```

---

## Troubleshooting Checklist

Use this checklist to systematically diagnose the issue:

### ✅ Pre-Deployment Checks
- [ ] V36.11.12 code is correct in `js/markdown-renderer.js`
- [ ] File contains `◊◊CITE${citationIndex}◊◊` placeholder (line 128)
- [ ] File contains `text.split(placeholder).join(citation)` (line 146)
- [ ] Version comment says "V36.11.12" at top of file

### ✅ Deployment Checks
- [ ] Updated `js/markdown-renderer.js` uploaded to web server
- [ ] File permissions are correct (readable by web server)
- [ ] File path is correct: `/path/to/website/js/markdown-renderer.js`
- [ ] No backup files interfering (e.g., `markdown-renderer.js.bak`)

### ✅ Browser Checks
- [ ] Browser cache cleared completely
- [ ] Hard refresh performed (`Ctrl+Shift+R` or `Cmd+Shift+R`)
- [ ] DevTools Console shows no JavaScript errors
- [ ] DevTools Network tab shows `markdown-renderer.js` loaded (Status 200)
- [ ] DevTools Sources tab shows updated code with `◊◊CITE0◊◊`

### ✅ Test File Checks
- [ ] `test-backend-response-simulation.html` opens without errors
- [ ] Test 1 shows "PASS" for all checks
- [ ] No placeholder text visible in rendered output
- [ ] Citations appear as `<sup>` elements in HTML inspector

### ✅ Live Site Checks
- [ ] Representatives chat loads without errors
- [ ] Sending a query returns a response
- [ ] Response includes citations
- [ ] Citations render as small superscripts (¹²³)
- [ ] Clicking citation scrolls to Sources section

### ✅ Backend Checks
- [ ] Backend server is running
- [ ] `/api/backend/query` endpoint responds to curl test
- [ ] Response format includes `[1]`, `[2]`, `[3]` citations
- [ ] Response includes `Sources:` section with proper format

---

## What to Send Me If Still Broken

If tests still fail after following all steps above, please provide:

### 1. Screenshot
- Take screenshot showing the citation rendering issue
- Make sure to capture the full chat message including Sources section

### 2. Browser Console Log
```javascript
// Open DevTools (F12) → Console tab
// Copy all console output and paste in a file
```

### 3. Test Results
```
Run test-backend-response-simulation.html
Click "Test 1: Simple Citation"
Copy the entire Debug Console output
Paste into a file named: test-results.txt
```

### 4. Version Verification
```bash
# SSH into server
grep -n "V36.11.12" /path/to/website/js/markdown-renderer.js

# Copy output and send to me
```

### 5. Network Tab
```
Open DevTools (F12) → Network tab
Filter: JS
Refresh page
Right-click markdown-renderer.js → Copy → Copy as cURL
Paste into a file named: network-debug.txt
```

### 6. Backend Response Sample
```bash
# Run this curl command:
curl -X POST https://api.your-domain.com/api/backend/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Tell me about Eric Adams",
    "context": {},
    "chatType": "representatives"
  }' | jq . > backend-response.json

# Send me backend-response.json
```

---

## Summary

**What we fixed:** Placeholder conflict in markdown renderer (V36.11.12)

**How to verify:**
1. Deploy V36.11.12 (if not already deployed)
2. Clear browser cache completely
3. Run test files (especially `test-backend-response-simulation.html`)
4. Test on live site

**Expected outcome:**
- ✅ Citations render as small superscripts ¹²³
- ✅ No placeholder text visible
- ✅ Bold/italic markdown works correctly
- ✅ Sources section appears at bottom

**If still broken:**
- Run through troubleshooting checklist
- Collect diagnostic information
- Send details to me for further investigation

---

## Version History

- **V36.11.10** - Fixed backend API endpoint mismatch
- **V36.11.11** - Added !important flags to citation CSS
- **V36.11.12** - Fixed placeholder conflict in markdown renderer (THIS VERSION)

---

*Created: 2025-01-XX*  
*Last Updated: 2025-01-XX*  
*Version: V36.11.12*
