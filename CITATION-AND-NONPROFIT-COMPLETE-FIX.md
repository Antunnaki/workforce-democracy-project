# 🔧 Complete Fix: Citations + Nonprofit Section

**Date**: November 1, 2025  
**Issues**: 
1. Citations still showing as `__CITATION0__` instead of `[1]`
2. Nonprofit "Advocacy Organizations" section not loading

---

## 🔍 ROOT CAUSE ANALYSIS

### Citation Issue
- **Backend fix is working** (tested with curl - proper [1] [2] [3])
- **Frontend still shows `__CITATION0__`**
- **Problem**: Response going through different code path OR frontend cache

### Nonprofit Issue  
- **Error**: "Unable to load organizations. Please try again."
- **Root Cause**: CSP blocking OR JavaScript error OR API endpoint issue
- **V36.8.6 attempted fix**: Added `https://*.propublica.org` to CSP
- **Status**: Still not working - need to investigate further

---

## 🎯 SOLUTION STRATEGY

### Phase 1: Citation Deep Dive
1. Check ALL response paths in server.js
2. Verify fixCitationFormat is applied to ALL returns
3. Check frontend cache/service workers
4. Test with browser hard refresh

### Phase 2: Nonprofit Section Fix
1. Check browser console for exact error
2. Verify CSP is actually deployed on live site
3. Check JavaScript nonprofit-widgets.js for errors
4. Rebuild section with proper error handling

---

## 📋 COMMANDS TO RUN

### Step 1: Find ALL places where responses are returned

```bash
# Find all response return points in server.js
grep -n "text:" /var/www/workforce-democracy/backend/server.js | grep -v "//"
```

### Step 2: Check if nonprofit widgets file exists and is correct

```bash
# Check nonprofit JavaScript files
ls -la /var/www/workforce-democracy/frontend/js/nonprofit*
```

### Step 3: Test nonprofit API from backend directly

```bash
# Test ProPublica API from server
curl "https://projects.propublica.org/nonprofits/api/v2/search.json?q=civil%20rights" | head -50
```

---

## 💡 NEXT STEPS

Based on the analysis, we need to:

1. **For Citations**: Apply fix to ALL response paths (not just the main one)
2. **For Nonprofits**: Check if files are deployed to frontend, verify CSP on live site
3. **Rebuild nonprofit section** with your vision: Community services finder (not IRS verification)

---

**Ready to proceed with systematic fixes!**
