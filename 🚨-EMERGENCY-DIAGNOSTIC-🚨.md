# 🚨 EMERGENCY DIAGNOSTIC - v37.19.8 NOT WORKING 🚨

**Problem**: DuckDuckGo fallback not activating despite deployment
**Expected**: 10+ sources (3 local + 7 DuckDuckGo)
**Actual**: 3 sources only

---

## 🔍 DIAGNOSTIC COMMANDS

Run these commands to find the root cause:

### **1. Verify article-search-service.js deployed correctly**
```bash
ssh root@185.193.126.13 'grep -n "v37.19.8" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

**Expected output**: Should show "v37.19.8" in file header  
**If not found**: File didn't upload correctly

---

### **2. Check searchCandidate function signature**
```bash
ssh root@185.193.126.13 'grep -A 5 "async searchCandidate" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

**Expected output**:
```javascript
async searchCandidate(personName, topic = '', useFallback = true) {
```

**If different**: Old version still on server

---

### **3. Check if searchWithDuckDuckGo method exists**
```bash
ssh root@185.193.126.13 'grep -c "searchWithDuckDuckGo" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

**Expected output**: Number > 0 (function should exist)  
**If 0**: New method didn't deploy

---

### **4. Check if DuckDuckGo fallback logic exists**
```bash
ssh root@185.193.126.13 'grep -B 2 -A 10 "if (useFallback && localResults.length < 10)" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

**Expected output**: Should show the fallback activation logic  
**If not found**: Code didn't deploy

---

### **5. Check actual file size (should be ~18KB)**
```bash
ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

**Expected**: ~18KB (18,000+ bytes)  
**If ~9KB**: Old version (v37.19.7 or earlier)

---

### **6. Check file modification time**
```bash
ssh root@185.193.126.13 'stat /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

**Expected**: Modify time should be Dec 1, 2025, 16:52 UTC (when you uploaded)  
**If earlier**: Old file still in place

---

### **7. Verify service restarted and loaded new code**
```bash
ssh root@185.193.126.13 'systemctl status workforce-backend-b.service | grep Active'
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log | grep -i "article"'
```

**Expected**: Service active since 16:52:13 UTC  
**Look for**: Any errors loading article-search-service.js

---

## 🔬 POSSIBLE ROOT CAUSES

### **Root Cause #1: File Upload Failed Silently**
- SCP showed "100%" but file didn't actually write
- Old file still in place
- **Fix**: Re-upload with verification

### **Root Cause #2: Node.js Cached Old Module**
- Service restarted but require() cached old version
- **Fix**: Clear Node.js cache or restart server

### **Root Cause #3: Wrong File Uploaded**
- Uploaded v37.19.7 instead of v37.19.8
- **Fix**: Re-download correct file from GenSpark

### **Root Cause #4: Syntax Error Preventing Load**
- New code has syntax error
- Service falls back to old code
- **Fix**: Check logs for syntax errors

### **Root Cause #5: Path Mismatch**
- File uploaded to wrong directory
- Service loading from different path
- **Fix**: Verify paths match

---

## 🚀 QUICK FIX COMMANDS

### **Option A: Force Re-Upload**
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend"

# Delete old file on server
ssh root@185.193.126.13 'rm /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'

# Upload new file
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js

# Verify upload
ssh root@185.193.126.13 'wc -l /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
# Expected: ~450 lines (v37.19.8 has ~450 lines total)

# Restart service
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'

# Check logs
ssh root@185.193.126.13 'tail -50 /var/www/workforce-democracy-b.log | grep -i "search\|duck\|fallback"'
```

### **Option B: Clear Node.js Cache**
```bash
ssh root@185.193.126.13

# Navigate to backend
cd /var/www/workforce-democracy/version-b/backend

# Remove node_modules cache (force re-load)
rm -rf node_modules/.cache

# Restart service
sudo systemctl restart workforce-backend-b.service

# Watch logs in real-time
tail -f /var/log/workforce-backend-b.log
```

### **Option C: Nuclear Option - Full Server Restart**
```bash
ssh root@185.193.126.13 'sudo reboot'
# Wait 2 minutes for server to come back up
# Then check logs
```

---

## 🧪 TEST AFTER FIX

After applying fix, test with:
```bash
# Test query via API
ssh root@185.193.126.13 'curl -X POST http://localhost:3002/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"What are Mamdani policies?\",\"chatType\":\"representatives\",\"context\":\"representativeAnalysis\"}" \
  2>&1 | head -50'
```

**Look for in logs**:
```
📊 Local database returned: 3 sources
⚠️  Only 3 sources found in local database
🔍 Activating DuckDuckGo fallback for additional sources...
🦆 DuckDuckGo search: "Mamdani policies" (max 7 results)
```

If you see these lines, **DuckDuckGo fallback is working!**

---

## 📋 DIAGNOSTIC CHECKLIST

Run commands 1-7 above and note results here:

- [ ] Command 1 (v37.19.8 version): _______________
- [ ] Command 2 (searchCandidate signature): _______________
- [ ] Command 3 (searchWithDuckDuckGo exists): _______________
- [ ] Command 4 (Fallback logic exists): _______________
- [ ] Command 5 (File size ~18KB): _______________
- [ ] Command 6 (Modified Dec 1 16:52): _______________
- [ ] Command 7 (Service active, no errors): _______________

**Based on results, apply Option A, B, or C above.**

---

Password: `YNWA1892LFC`
