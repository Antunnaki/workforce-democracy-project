# ▶️ DEPLOYMENT INSTRUCTIONS - v37.18.12

**Status:** ✅ READY TO DEPLOY  
**Fixes:** Chat formatting, sources, citations, punctuation  
**Estimated Time:** 5 minutes  

---

## 🚀 STEP-BY-STEP DEPLOYMENT

### Step 1: Deploy Backend (ai-service.js)
Copy and paste this command into your terminal:

```bash
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js && ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service && sleep 3 && tail -40 /var/log/workforce-backend-b.log'
```

**Password:** `YNWA1892LFC`

**Expected Output:**
```
🚀🚀🚀 AI-SERVICE.JS v37.18.12 LOADED - CHAT FORMATTING FIX 🚀🚀🚀
📅 File loaded at: 2025-11-28T...
✨ Features: Pre-search sources + Citation hallucination prevention + Duplicate citation removal
🎯 v37.18.12 FIXES: MIN_RELEVANCE 30→15, No fake Sources paragraph, Clean punctuation
Server running on port 3002 in development environment
MongoDB connected successfully
```

---

### Step 2: Deploy Frontend (chat-clean.js)
Copy and paste this command:

```bash
scp js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/version-b/js/chat-clean.js
```

**Password:** `YNWA1892LFC`

---

### Step 3: Test on Version B

1. **Go to test site:** `https://sxcrlfyt.gensparkspace.com/`

2. **Hard refresh browser:**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + F5`

3. **Open chat** (bottom right corner)

4. **Open browser console** (F12 or right-click → Inspect → Console tab)

5. **Ask test question:** "What are Mamdani's policies?"

---

### Step 4: Verify Fixes

**Check Console Logs:**
Look for these lines in the console:
```
[CleanChat] 📚 Sources received from backend: X
```
- ✅ Should show **5-10 sources** (NOT 0!)
- ✅ Should show "Perfect match: X citations = X sources"

**Check Response Formatting:**
- ✅ Numbered sections (1., 2., 5.) on **separate lines**
- ✅ Citations visible as **superscript numbers** (¹, ², ³)
- ✅ Citations are **clickable** (click should scroll to Sources section)
- ✅ **Sources section below response** with clickable links
- ✅ **NO fake "Sources:" paragraph** at end
- ✅ **Clean punctuation** (no ` .` or `..`)

---

## ✅ WHAT CHANGED

### Issue #1: Numbered Lists Broken ✅ FIXED
**Before:** `...body cameras for all officers. 5. Environmental Sustainability: Shahzad...`  
**After:** Numbered sections on separate lines

### Issue #2: 0 Sources Returned ✅ FIXED
**Before:** `MIN_RELEVANCE_FOR_LLM = 30` filtered ALL sources  
**After:** `MIN_RELEVANCE_FOR_LLM = 15` allows quality sources through

### Issue #3: Fake "Sources:" Paragraph ✅ FIXED
**Before:** AI generated confusing "Sources: Analysis based on..." paragraph  
**After:** System prompt bans this + post-processing removes it

### Issue #4: Space Before Fullstop ✅ FIXED
**Before:** `...low-income communities .`  
**After:** `...low-income communities.`

### Issue #5: Double Fullstop ✅ FIXED
**Before:** `...for verification..`  
**After:** `...for verification.`

---

## 🧪 TEST QUERIES

Try these to verify everything works:

1. **"What are Mamdani's policies?"**
   - Should return 5-10 sources
   - Numbered policy sections properly formatted
   - Citations visible and clickable

2. **"Are there progressive candidates in Albany 2026?"**
   - Should search for current information (not fall back to training data)
   - Should return sources about 2026 elections
   - Response should be deeper than before

3. **"How did Vienna solve the housing crisis?"**
   - (Once international framework implemented)
   - Should naturally include international context
   - Should explain what worked and why

---

## 🐛 IF SOMETHING GOES WRONG

### Backend Won't Start
```bash
# Check logs for errors
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log'

# Restart service manually
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'
```

### Still Getting 0 Sources
```bash
# Check backend logs to see if sources are being filtered
ssh root@185.193.126.13 'tail -200 /var/log/workforce-backend-b.log | grep -i "sources\|relevance\|filtered"'
```

### Rollback if Needed
```bash
# Restore from Version A (known working)
ssh root@185.193.126.13
cp /var/www/workforce-democracy/version-a/backend/ai-service.js \
   /var/www/workforce-democracy/version-b/backend/ai-service.js
cp /var/www/workforce-democracy/version-a/js/chat-clean.js \
   /var/www/workforce-democracy/version-b/js/chat-clean.js
sudo systemctl restart workforce-backend-b.service
```

---

## 📊 SUCCESS METRICS

**Must Have:**
- ✅ Sources received > 0 (not 0)
- ✅ Citations = Sources (perfect match)
- ✅ Numbered lists on separate lines
- ✅ No fake Sources paragraph
- ✅ Clean punctuation

**Nice to Have:**
- Response quality improved (deeper analysis)
- More diverse sources (Democracy Now, Intercept, etc.)
- Faster response time (fewer search iterations)

---

## 🔄 NEXT STEPS AFTER DEPLOYMENT

1. **Test thoroughly** with various queries
2. **Monitor console logs** for source counts
3. **Report any issues** (share console logs)
4. **When stable:** Sync Version B → Version A
5. **Then:** Begin International Policy Framework Phase 1

---

## 📚 DOCUMENTATION REFERENCE

- **Complete Fix Details:** `🎯-FINAL-CHAT-FIX-v37.18.12-🎯.md`
- **International Policy Framework:** `🌍-INTERNATIONAL-POLICY-RESEARCH-FRAMEWORK-🌍.md`
- **Master Handover:** `🎯-MASTER-HANDOVER-DOCUMENT-🎯.md`

---

**Ready to deploy? Run the commands above! 🚀**
