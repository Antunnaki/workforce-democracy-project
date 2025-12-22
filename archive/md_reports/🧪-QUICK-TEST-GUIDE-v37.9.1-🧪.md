# 🧪 QUICK TEST GUIDE - v37.9.1 🧪

## 30-Second Test After Deployment

### **Step 1: Deploy** (Choose One)
- **Option A:** Download entire project → Upload to Netlify
- **Option B:** Git commit + push (if using Git auto-deploy)

### **Step 2: Clear Cache**
- **Chrome/Edge:** Ctrl+Shift+Delete → Clear cache
- **Firefox:** Ctrl+Shift+Delete → Clear cache
- **Safari:** Cmd+Option+E
- **Easy Way:** Open in Incognito/Private window

### **Step 3: Test**
1. Go to your live Netlify site
2. Click "My Reps" tab
3. Enter ZIP: `80204`
4. Click "Find Representatives"

### **Step 4: Verify Success** ✅

**You Should See:**
```
┌─────────────────────────────────────┐
│ 🏛️ YOUR REPRESENTATIVES            │
├─────────────────────────────────────┤
│ [Photo] John W. Hickenlooper        │
│         U.S. Senator                │
│         Democratic                  │
├─────────────────────────────────────┤
│ [Photo] Michael F. Bennet           │
│         U.S. Senator                │
│         Democratic                  │
└─────────────────────────────────────┘
```

### **Step 5: Check Console (F12)**

**Good Signs:** ✅
```
📡 [REP-FINDER-SIMPLE V37.9.1] Loading
📡 Calling: ...representatives/search?zip=80204
✅ Success! Found 2 representatives
```

**Bad Signs:** ❌
```
404 error
POST method
Missing /search in URL
```

---

## Quick Tests (Other ZIPs)

| ZIP | State | Expected Senators |
|-----|-------|-------------------|
| 80204 | Colorado | Hickenlooper, Bennet |
| 10001 | New York | Schumer, Gillibrand |
| 90210 | California | Padilla, Butler |
| 33101 | Florida | Scott, Rubio |
| 60601 | Illinois | Durbin, Duckworth |

---

## Troubleshooting One-Liners

**Still 404?** → Clear cache harder (Settings → Clear all data)

**Old version?** → Wait 60 seconds, Netlify is rebuilding

**No photos?** → Check console for CSP errors (should be fixed)

**Wrong data?** → Verify backend is running: `curl "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=80204"`

---

## Report Template

Copy/paste this when reporting back:

```
✅ Deployed: Yes/No
✅ Cache cleared: Yes/No
✅ ZIP 80204 tested: Yes/No
✅ Result: [Success / 404 error / Other]
✅ Photos loaded: Yes/No
✅ Console logs: [paste here]
```

---

**Time to Test:** < 2 minutes  
**Expected Result:** 🟢 Working representatives display  
**Confidence:** 💯 99%

