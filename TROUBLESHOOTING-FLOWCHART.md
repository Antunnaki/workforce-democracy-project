# 🔧 Troubleshooting Flowchart

```
START: User submits query "What is workforce democracy?"
│
├─> Query sent to backend via POST /api/civic/llm-chat/submit
│   │
│   ├─> ✅ Backend returns job ID (HTTP 202)
│   │   │
│   │   └─> Frontend polls /status/:jobId every 5 seconds
│   │       │
│   │       ├─> Status: "pending" → Keep polling
│   │       │
│   │       └─> Status: "completed" → Fetch /result/:jobId
│   │           │
│   │           ├─> Backend curl test shows FULL response (1800+ chars) ✅
│   │           │   │
│   │           │   └─> ⚠️ PROBLEM HERE ⚠️
│   │           │       Frontend shows "empty response" (37 chars)
│   │           │       
│   │           │       WHY?
│   │           │       ├─> Old JavaScript file cached
│   │           │       ├─> Response extraction logic outdated
│   │           │       └─> Not reading data.result.response correctly
│   │           │
│   │           └─> FIX: Load new JavaScript file
│   │               │
│   │               ├─> ❌ Tried: Cache-busting query parameter (?v=20251112-2230)
│   │               │   Result: FAILED - Browser ignored it
│   │               │
│   │               └─> ✅ Solution: Rename file to v37.9.13.js
│   │                   │
│   │                   ├─> Browser treats it as NEW resource
│   │                   ├─> Bypasses all cache layers
│   │                   └─> Loads updated code
│   │                       │
│   │                       └─> Frontend correctly extracts response
│   │                           │
│   │                           └─> ✅ SUCCESS: Shows full AI response
│   │
│   └─> ❌ Backend doesn't return job ID
│       │
│       └─> Check backend logs: pm2 logs workforcedemocracy-backend
│
└─> ❌ Query never sent to backend
    │
    └─> Check browser console for JavaScript errors
```

---

## Decision Tree: What to Check

### Problem: "Sorry, I received an empty response"

```
Is backend working?
│
├─> YES (curl test shows full response)
│   │
│   └─> Is correct JS file loading?
│       │
│       ├─> YES (universal-chat-v37.9.13.js in Network tab)
│       │   │
│       │   └─> Check response extraction logic in JS file
│       │       const aiResponse = data.result?.response || data.result?.message...
│       │
│       └─> NO (universal-chat-v37.9.12.js or other version)
│           │
│           └─> 🎯 RUN quick-fix.sh 🎯
│               │
│               ├─> Still loading old file?
│               │   │
│               │   ├─> Check service worker (sw.js)
│               │   ├─> Purge CDN/Cloudflare cache
│               │   └─> Test in incognito mode
│               │
│               └─> New file loading?
│                   │
│                   └─> ✅ FIXED
│
└─> NO (curl test fails or times out)
    │
    ├─> Check backend is running:
    │   pm2 status
    │
    ├─> Check backend logs:
    │   pm2 logs workforcedemocracy-backend --lines 50
    │
    └─> Check port 3001 is open:
        netstat -tlnp | grep 3001
```

---

## Common Scenarios

### Scenario 1: Hard Refresh Doesn't Help
**Diagnosis**: Service worker or CDN caching  
**Solution**: 
1. Run `quick-fix.sh` (rename file)
2. Check for `sw.js` and increment cache version
3. Purge Cloudflare cache if applicable

### Scenario 2: Works in Incognito, Fails in Normal Browser
**Diagnosis**: Local browser cache issue  
**Solution**: 
1. Clear all browser data for workforcedemocracy.org
2. Or rename JS file via `quick-fix.sh`

### Scenario 3: Backend Returns Empty Response
**Diagnosis**: AI service error or job processing failure  
**Solution**: 
1. Check backend logs: `pm2 logs workforcedemocracy-backend`
2. Look for errors in AI service or source fetching
3. Check job queue status

### Scenario 4: Network Tab Shows 404 for JS File
**Diagnosis**: File path mismatch  
**Solution**: 
1. Verify file exists: `ls -la /var/www/workforce-democracy/js/`
2. Check index.html references correct path
3. Check nginx/apache config for correct root directory

---

## Cache Bypass Hierarchy (Most to Least Aggressive)

1. **🔥 Nuclear Option**: Completely new filename with timestamp
   ```bash
   chat-$(date +%s).js
   ```

2. **🎯 Recommended**: Increment version in filename
   ```bash
   universal-chat-v37.9.13.js
   ```

3. **⚠️ Weak**: Query parameter (can be ignored)
   ```bash
   universal-chat.js?v=20251112-2230
   ```

4. **❌ Doesn't Work**: Just hard refresh
   ```bash
   Ctrl+Shift+R
   ```

---

## Testing Matrix

| Test | Backend Curl | Frontend (Normal) | Frontend (Incognito) | Diagnosis |
|------|--------------|-------------------|----------------------|-----------|
| 1 | ✅ Full response | ❌ Empty | ❌ Empty | Backend routing issue |
| 2 | ✅ Full response | ❌ Empty | ✅ Full response | Browser cache issue |
| 3 | ✅ Full response | ❌ Empty | ✅ Full response | **CURRENT SITUATION** |
| 4 | ❌ Error | ❌ Empty | ❌ Empty | Backend down/error |
| 5 | ✅ Full response | ✅ Full response | ✅ Full response | Everything working |

**Current Status**: Test #3 → Solution: Run `quick-fix.sh`

---

## Success Indicators

After running `quick-fix.sh`, you should see:

### 1. Network Tab (F12 → Network)
```
✅ universal-chat-v37.9.13.js (Status: 200)
❌ NOT universal-chat-v37.9.12.js
```

### 2. Console Logs
```javascript
✅ [CleanChat v37.9.13] ✅ Received result after "5.8" "seconds:"
✅ [CleanChat] 📊 Raw response: "Workforce democracy refers to..."
✅ Text length: 1856 (NOT 37)
```

### 3. Visual Display
```
✅ Full AI response visible in chat
✅ Sources section (may be empty if no relevant sources)
❌ NOT "Sorry, I received an empty response"
```

---

## Quick Reference Commands

```bash
# Check which JS files exist
ls -lh /var/www/workforce-democracy/js/universal-chat*.js

# Check what index.html references
grep "universal-chat" /var/www/workforce-democracy/index.html

# Test backend API
curl http://localhost:3001/api/civic/llm-chat/result/YOUR_JOB_ID | jq

# Check backend logs
pm2 logs workforcedemocracy-backend --lines 50

# Restart backend (if needed)
pm2 restart workforcedemocracy-backend

# Nuclear reset (only if desperate)
pm2 delete workforcedemocracy-backend
pm2 start /var/www/workforce-democracy/backend/server.js --name workforcedemocracy-backend
```

---

**Next Step**: Run `quick-fix.sh` and follow the testing checklist in README.md
