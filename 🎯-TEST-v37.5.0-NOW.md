# 🎯 Test v37.5.0 Citation Fix - Step by Step

**Current Status**: v37.5.0 code deployed, PM2 restarted, showing startup markers ✅  
**Next Step**: **TEST to verify Phase 1 pre-search is actually running**

---

## 🚀 Quick Test (Copy & Paste)

### **Option A: Run on VPS (if you have SSH open)**

```bash
ssh root@185.193.126.13

cd /var/www/workforce-democracy/backend

# Check PM2 status
pm2 list

# Watch logs in real-time (will show Phase 1 logs when you test chat)
pm2 logs backend --lines 0
```

**Keep this terminal open**, then in your browser:
1. Go to https://workforcedemocracy.org
2. Open browser console (F12)
3. Ask in chat: **"What happens if SNAP benefits are cut?"**
4. Watch the SSH terminal for these logs:

### **Expected Logs (v37.5.0 Working):**
```
🔍 Pre-searching sources before LLM call...
📚 Found 3 sources to provide to LLM
✅ Providing 3 validated sources to LLM
🤖 AI Query: "What happens if..." (context: general, sources: 3)
✅ Returning 3 sources (same as provided to LLM)
```

### **❌ Should NOT See (Old Phase 2):**
```
📚 Added 2 sources to response  ← This is old Phase 2 format
```

---

## 🔍 Diagnostic Scripts

### **Test Script** (checks code and logs)
```bash
ssh root@185.193.126.13 'bash -s' < test-v37.5.0-citation-fix.sh
```

### **Deep Diagnostic** (if issues found)
```bash
ssh root@185.193.126.13 'bash -s' < diagnose-citation-fix.sh
```

---

## 📊 What to Check

### **1. Backend Logs (SSH Terminal)**
- ✅ Should see Phase 1 pre-search logs
- ❌ Should NOT see old Phase 2 logs

### **2. Browser Console (F12)**
- ✅ Should see: `citationCount === sources.length` (e.g., 3 === 3)
- ❌ Should NOT see: `❌ BACKEND DATA MISMATCH: 15 citations, 3 sources`

### **3. Citations in Response**
- ✅ All citations [1], [2], [3] should be clickable
- ✅ Each citation should have a matching source
- ❌ Should NOT have broken citations like [4] when only 3 sources exist

---

## 🚨 If v37.5.0 is NOT Working

### **Symptom: Still seeing old Phase 2 logs**

**Solution: Nuclear PM2 Restart**
```bash
ssh root@185.193.126.13 << 'ENDSSH'
cd /var/www/workforce-democracy/backend

# Force complete PM2 restart
pm2 stop backend
pm2 delete backend
pm2 cleardump
pm2 start server.js --name backend

# Verify startup
pm2 logs backend --lines 50 | grep "🚀🚀🚀"
ENDSSH
```

### **Symptom: v37.5.0 startup markers not appearing**

**This means code was overwritten or not saved correctly.**

Run the diagnostic script:
```bash
ssh root@185.193.126.13 'bash -s' < diagnose-citation-fix.sh
```

If code is missing, we'll need to re-apply v37.5.0 fix.

---

## ✅ Success Criteria

You'll know v37.5.0 is working when:

1. **Backend logs show:**
   - `🔍 Pre-searching sources before LLM call...`
   - `✅ Providing 3 validated sources to LLM`

2. **Browser console shows:**
   - `citationCount === sources.length`

3. **Chat response:**
   - All citations are clickable
   - No mismatch errors in console

---

## 🎯 Next Steps After v37.5.0 Confirmed Working

Once v37.5.0 is verified, we can proceed to:

### **v37.6.0: Analytical Frameworks**
- Add ECONOMIC_SOCIAL_POLICY framework for SNAP queries
- Add banned phrases enforcement ("It is essential to note...")
- Add economic impact analysis instructions

### **Future Enhancements**
- Improve source relevance filtering (remove Boeing for SNAP queries)
- Add economic data with specific sources ($1.70 multiplier for SNAP)

---

## 📞 Report Back

Please share:

1. **What logs you see** when you test the chat
2. **What browser console shows** (citation count vs source count)
3. **Whether citations are clickable** and have matching sources

This will tell us if v37.5.0 is working or if we need to troubleshoot further!

---

**Ready to test?** 🚀

Run the test script or manually test the chat and share the results!
