# localStorage Persistence - Testing Checklist

**Created**: January 19, 2025  
**Purpose**: Step-by-step guide to diagnose localStorage clearing issue

---

## 🎯 Test 1: Production Site Comparison (HIGHEST PRIORITY)

**Time Required**: 5 minutes  
**Purpose**: Determine if problem is GenSpark-specific or code-related

### Steps:

1. **Open Production Site**
   ```
   URL: https://workforcedemocracyproject.org/
   Browser: Chrome (same as GenSpark test)
   ```

2. **Register New Account**
   - Username: `test_prod_[timestamp]`
   - Password: Simple test password
   - Complete all 3 wizard steps

3. **Verify Data Saved**
   - Open DevTools (F12)
   - Go to Console tab
   - Run:
   ```javascript
   console.log('Username:', localStorage.getItem('wdp_username'));
   console.log('Password hash:', localStorage.getItem('wdp_password_hash'));
   console.log('Salt:', localStorage.getItem('wdp_salt'));
   console.log('User data:', localStorage.getItem('wdp_user_data'));
   ```
   - All should show values ✅

4. **Reload Page**
   - Press F5
   - Wait for page to fully load

5. **Check Data Again**
   - Open DevTools Console
   - Run same commands as step 3
   - **DOCUMENT RESULTS**:
     - [ ] Data persists (production site is fine!)
     - [ ] Data disappears (problem exists on production too!)

### Expected Outcomes:

**If data PERSISTS on production:**
- ✅ Code is correct
- ✅ Problem is GenSpark-specific
- 🔜 Next: Contact GenSpark support
- 🔜 Consider deploying to production only

**If data DISAPPEARS on production:**
- ❌ Problem is in code or browser
- 🔜 Next: Run Test 2 (Diagnostic Tool)
- 🔜 Next: Run Test 3 (Chrome without extensions)

---

## 🔬 Test 2: Diagnostic Tool

**Time Required**: 10 minutes  
**Purpose**: Identify which localStorage operations are failing

### Steps:

1. **Open Diagnostic Tool**
   ```
   URL: https://sxcrlfyt.gensparkspace.com/test-storage-persistence.html
   Browser: Chrome
   ```

2. **Run Test 1: Write & Immediate Read**
   - Click "Run Test 1" button
   - **EXPECTED**: All keys should read back ✅
   - **DOCUMENT**: Any keys that fail

3. **Run Test 2: Reload Persistence**
   - Click "Step 1: Set Test Data"
   - Note the timestamp shown
   - **Reload page (F5)**
   - Click "Step 2: Check Data"
   - **DOCUMENT**: 
     - [ ] How many keys survived? ___/4
     - [ ] Which patterns disappeared?
     - [ ] Which patterns persisted?

4. **Run Test 3: Pattern Analysis**
   - Click "Run Test 3" button
   - **Reload page (F5)**
   - Click "Run Test 3" button again
   - **DOCUMENT**: Which key naming patterns survive

5. **Run Test 4: Live Monitoring**
   - Click "Start Monitoring"
   - Register a new account on main site (in another tab)
   - Return to diagnostic tab
   - **DOCUMENT**: Any removeItem() or clear() calls logged?

---

## 🔌 Test 3: Chrome Without Extensions

**Time Required**: 5 minutes  
**Purpose**: Rule out extension interference

### Steps:

1. **Open Chrome Guest Window**
   - Click your Chrome profile icon
   - Select "Guest"
   - This disables ALL extensions

2. **Test on GenSpark**
   ```
   URL: https://sxcrlfyt.gensparkspace.com/
   ```

3. **Register New Account**
   - Complete wizard
   - Verify data in console

4. **Reload and Check**
   - Press F5
   - Check localStorage again
   - **DOCUMENT**: Did data persist?

### Expected Outcomes:

**If data PERSISTS without extensions:**
- ✅ Extension is interfering
- 🔜 Test with extensions disabled one by one
- 🔜 Suspects: LastPass, Capital One Shopping, Eno®

**If data DISAPPEARS without extensions:**
- ✅ Not an extension issue
- 🔜 Confirms GenSpark hosting or browser policy

---

## 🛡️ Test 4: Protection Script Verification

**Time Required**: 5 minutes  
**Purpose**: Verify protection script is active and logging

### Steps:

1. **Deploy Updated Index.html**
   - The protection script is already added to index.html
   - Need to deploy to GenSpark
   - OR test locally

2. **Open Site with DevTools**
   ```
   URL: https://sxcrlfyt.gensparkspace.com/
   DevTools: Open Console BEFORE page loads
   ```

3. **Check for Protection Log**
   - Look for:
   ```
   🔒 Activating localStorage protection...
   ✅ localStorage protection active
   ```
   - If NOT present → Protection script not loading

4. **Register New Account**
   - Complete wizard
   - Check console for protection logs

5. **Reload Page**
   - Watch console during reload
   - **LOOK FOR**:
     - `🛡️ Protected key "${key}" - removal blocked`
     - `🛡️ localStorage.clear() called - preserving wdp_* keys`
   
6. **Check Data After Reload**
   - If protection logged blocks → Data should persist
   - If no protection logs → Script not preventing clearing

---

## 📊 Results Summary Template

After completing tests, fill out:

### Test 1: Production Site
- [ ] Tested
- Result: ________________
- Data persisted: YES / NO
- Next action: ________________

### Test 2: Diagnostic Tool
- [ ] Tested
- Test 1 result: ________________
- Test 2 result: ___/4 keys survived
- Patterns that failed: ________________
- Patterns that worked: ________________

### Test 3: Chrome Guest
- [ ] Tested
- Data persisted: YES / NO
- Conclusion: Extension interference? YES / NO

### Test 4: Protection Script
- [ ] Protection script loading: YES / NO
- [ ] Protection logs visible: YES / NO
- [ ] Blocking attempts logged: YES / NO
- Data persisted: YES / NO

---

## 🎓 Interpretation Guide

### Scenario A: Production Works, GenSpark Doesn't
**Conclusion**: GenSpark hosting has localStorage restrictions  
**Solutions**:
1. Use production site only (Netlify)
2. Contact GenSpark support
3. Implement cookie-based storage instead

### Scenario B: Both Sites Fail
**Conclusion**: Code or browser issue  
**Solutions**:
1. Check protection script logs
2. Try different browser
3. Review personalization code

### Scenario C: Guest Mode Works, Normal Doesn't
**Conclusion**: Chrome extension interfering  
**Solutions**:
1. Test with extensions disabled one by one
2. Identify problematic extension
3. Disable or configure extension

### Scenario D: Protection Script Blocks Clearing
**Conclusion**: Something IS trying to clear  
**Solutions**:
1. Review stack traces in console
2. Identify source of clearing
3. Fix or work around

---

## 📞 Next Steps After Testing

### If Problem is GenSpark-Specific:
1. Document findings
2. Contact GenSpark support
3. Deploy to production (Netlify) instead
4. Update deployment guide

### If Problem is Extension-Related:
1. Identify specific extension
2. Document workaround
3. Add notice to README
4. Consider alternative storage

### If Problem is Code-Related:
1. Review protection script stack traces
2. Fix problematic code
3. Re-test on both sites
4. Document solution

### If Problem is Browser Policy:
1. Research browser storage policies
2. Implement cookie-based fallback
3. Test across browsers
4. Document limitations

---

## 🚨 Red Flags to Watch For

1. **No protection script logs**
   - Script not loading
   - Check script path
   - Check for JS errors

2. **Stack traces in console**
   - Shows what's calling removeItem()
   - Critical debugging info
   - Screenshot immediately

3. **Inconsistent behavior**
   - Sometimes works, sometimes doesn't
   - Could indicate race condition
   - Document exact steps to reproduce

4. **All localStorage cleared**
   - Not selective clearing
   - Different problem than documented
   - Check for localStorage.clear() calls

---

**Ready to Start Testing?**

Start with **Test 1** (Production Site) - it's the most important and will tell us if this is a GenSpark-specific issue or a broader problem.

Good luck! 🍀
