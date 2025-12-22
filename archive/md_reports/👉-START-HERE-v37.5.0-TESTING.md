# 👉 START HERE - v37.5.0 Testing Guide

## 🎯 Where We Are

✅ **v37.5.0 citation fix code deployed**  
✅ **PM2 restarted with new code**  
✅ **Startup markers showing in logs**  

❓ **UNKNOWN: Is Phase 1 pre-search actually running?**

---

## 🚀 ONE COMMAND VERIFICATION

Copy and paste this into your **SSH terminal**:

```bash
ssh root@185.193.126.13 << 'ENDSSH'
cd /var/www/workforce-democracy/backend
bash VERIFY-v37.5.0-COMPLETE.sh
ENDSSH
```

This will check:
- ✅ PM2 status
- ✅ v37.5.0 startup markers
- ✅ Phase 1 pre-search code exists
- ✅ Source injection code exists
- ❌ Old Phase 2 code removed (should NOT exist)
- ✅ Runtime logs (if you've tested chat)

---

## 🧪 LIVE CHAT TEST

**This is the REAL test!**

### **Step 1: Watch Backend Logs**
In SSH terminal:
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
pm2 logs backend --lines 0
```

### **Step 2: Test the Chat**
1. Open https://workforcedemocracy.org
2. Open browser console (F12)
3. Ask: **"What happens if SNAP benefits are cut?"**

### **Step 3: Check Logs**

**✅ SUCCESS looks like:**
```
🔍 Pre-searching sources before LLM call...
📚 Found 3 sources to provide to LLM
✅ Providing 3 validated sources to LLM
🤖 AI Query: "What happens if..." (context: general, sources: 3)
✅ Returning 3 sources (same as provided to LLM)
```

**❌ FAILURE looks like:**
```
📚 Added 2 sources to response  ← OLD Phase 2 format
```

### **Step 4: Check Browser Console**

**✅ SUCCESS looks like:**
```
citationCount === sources.length  (e.g., 3 === 3)
```

**❌ FAILURE looks like:**
```
❌ BACKEND DATA MISMATCH: 15 citations, 3 sources
```

---

## 🔧 If v37.5.0 is NOT Working

### **Problem: Still seeing old Phase 2 logs**

**Nuclear PM2 Restart:**
```bash
ssh root@185.193.126.13 << 'ENDSSH'
cd /var/www/workforce-democracy/backend
pm2 stop backend
pm2 delete backend
pm2 cleardump
pm2 start server.js --name backend
pm2 logs backend --lines 50 | grep "🚀🚀🚀"
ENDSSH
```

### **Problem: v37.5.0 startup markers not showing**

**This means code was overwritten.**

Run diagnostic:
```bash
ssh root@185.193.126.13 'bash diagnose-citation-fix.sh'
```

---

## 📊 Report Back

Please share:

1. **Output from VERIFY-v37.5.0-COMPLETE.sh** (shows PASS/FAIL counts)
2. **Backend logs** when you test chat (shows Phase 1 or Phase 2 format)
3. **Browser console output** (shows citation count match/mismatch)

This will tell us exactly what's happening! 🎯

---

## 🎉 Next Steps After v37.5.0 Confirmed

Once we confirm v37.5.0 is working, we can:

### **Add Analytical Frameworks (v37.6.0)**
- Economic policy analysis framework
- Banned phrases enforcement
- Economic impact data with sources

### **Improve Source Relevance**
- Filter out irrelevant articles (e.g., Boeing for SNAP queries)
- Add topic-specific keyword penalties

---

## 📁 Files Created for Testing

- `VERIFY-v37.5.0-COMPLETE.sh` - Complete verification script
- `test-v37.5.0-citation-fix.sh` - Quick test script
- `diagnose-citation-fix.sh` - Deep diagnostic
- `🎯-TEST-v37.5.0-NOW.md` - Detailed testing guide (this file)

---

**Ready?** Run the verification command above and share the results! 🚀
