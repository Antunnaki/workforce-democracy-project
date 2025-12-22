# 🚀 DEPLOY v37.19.7 - COMPREHENSIVE POLICY SCRAPING 🚀

## ✅ VERSION: v37.19.7 - READY FOR DEPLOYMENT

**Date**: 2025-12-01  
**Version**: v37.19.7 - COMPREHENSIVE POLICY SCRAPING  
**Status**: ✅ READY TO DEPLOY

---

## 📋 WHAT'S NEW IN v37.19.7

### 🎯 COMPREHENSIVE POLICY SCRAPING ENHANCEMENTS

**Problem**: Only 4 sources being used for policy analysis despite thousands of indexed articles

**Root Causes**:
1. ❌ Search limit too low (15→50 articles) → Not using full database
2. ❌ 'policies' keyword treated as person name → Irrelevant scoring
3. ❌ Too aggressive filtering → Missing relevant articles

**v37.19.7 FIXES**:
1. ✅ **Increased search limits**: 50→100 articles for comprehensive coverage
2. ✅ **Improved person-name detection**: Excludes more topic words ('policy', 'policies', 'voting', 'record', 'campaign', 'election', 'candidate', 'representative', 'senator', 'congressman', 'mayor', 'governor', 'president')
3. ✅ **Better keyword filtering**: More accurate relevance scoring
4. ✅ **Support for all representatives/candidates**: Federal, state, and local
5. ✅ **Trusted investigative sources**: Prioritizes Democracy Now, The Intercept, Jacobin, ProPublica, Common Dreams, Truthout

**Expected Results**:
- **10-20+ sources** (up from 4) for comprehensive policy analysis
- **Fact-based analysis** from trusted investigative journalists
- **All levels of government**: Federal, state, and local representatives/candidates
- **Promise vs Reality**: Compare campaign promises with actual voting records/actions

---

## 📁 FILES TO DEPLOY

You need to deploy **TWO files** to Version B:

1. **ai-service-v37.19.7-COMPREHENSIVE-POLICY.js** → Upload to: `/var/www/workforce-democracy/version-b/backend/ai-service.js`
2. **article-search-service-v37.19.7-COMPREHENSIVE-POLICY.js** → Upload to: `/var/www/workforce-democracy/version-b/backend/services/article-search-service.js`

---

## 🖥️ QUICK DEPLOY TO VERSION B (TEST)

**⚠️ CRITICAL PATH REMINDER**: Your folder is now `WDP-v37.19.7`  
Update the path in Command 1 below!

### **1️⃣ Download Files from GenSpark**
- Click `ai-service-v37.19.7-COMPREHENSIVE-POLICY.js` → Download
- Click `article-search-service-v37.19.7-COMPREHENSIVE-POLICY.js` → Download

### **2️⃣ Rename Files**
```bash
# Rename to standard names (remove version suffix)
mv ~/Downloads/ai-service-v37.19.7-COMPREHENSIVE-POLICY.js ~/Downloads/ai-service.js
mv ~/Downloads/article-search-service-v37.19.7-COMPREHENSIVE-POLICY.js ~/Downloads/article-search-service.js
```

### **3️⃣ Move to Your Project Folder**
```bash
# ⚠️ UPDATE THIS PATH TO MATCH YOUR FOLDER VERSION
mv ~/Downloads/ai-service.js "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.7/backend/ai-service.js"
mv ~/Downloads/article-search-service.js "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.7/backend/services/article-search-service.js"
```

### **4️⃣ Deploy to Version B**
```bash
# Navigate to your project folder
# ⚠️ UPDATE THIS PATH TO MATCH YOUR FOLDER VERSION
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.7/backend"

# Upload ai-service.js
scp ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js

# Upload article-search-service.js
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js

# Restart Version B service
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# Check service status
ssh root@185.193.126.13 'sudo systemctl status workforce-backend-b.service'

# Verify v37.19.7 loaded in logs
# ⚠️ UPDATE version number below to v37.19.7
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19.7"'
```

---

## ✅ EXPECTED LOG OUTPUT

After deployment, you should see:

```
🚀🚀🚀 AI-SERVICE.JS v37.19.7 LOADED - COMPREHENSIVE POLICY SCRAPING 🚀🚀🚀
🤖 AI MODEL: Alibaba Cloud Qwen 2.5-72B (NOT US big tech Llama/GPT)
✨ Features: Pre-indexed article database + Fast local search (<1s vs 160s DuckDuckGo)
🗄️  v37.19.0: MongoDB article archive for instant historical searches
🔗 v37.19.1: CITATION FIX - Enforce citing ALL sources (was disabled, now fixed)
🎯 v37.19.2: SMART RELEVANCE - Title match=high, mention only=low, cite only relevant
🛡️  v37.19.3: ANTI-HALLUCINATION - No inventing facts/dates/positions; MIN_RELEVANCE 40→50
✅ v37.19.4: CITATION VERIFICATION - Snippet must mention person/topic; MIN_RELEVANCE 50→60
🎯 v37.19.5: PERSON-NAME BONUS - Name in title +200, excerpt +100; forbid self-contradictions
⚙️  v37.19.6: PROMPT OPTIMIZED - Condensed rules to fix 413 Payload Too Large error
🌍 v37.19.7: COMPREHENSIVE POLICY SCRAPING - Limit 50→100; all reps/candidates; state+local; trusted investigative sources
```

---

## 🧪 TEST VERSION B AFTER DEPLOYMENT

**Test Query**: "What are Mamdani's policies?"

### **Expected Results**:
- ✅ **10-20+ sources** (not just 4)
- ✅ **All sources mention "Mamdani"** (no irrelevant sources)
- ✅ **Trusted investigative sources**: Democracy Now, The Intercept, ProPublica, etc.
- ✅ **Detailed policy analysis**: Housing, healthcare, economic justice, etc.
- ✅ **No hallucinations** or fabricated citations
- ✅ **No "Source #4 doesn't mention Mamdani" contradictions**
- ✅ **Response time**: 10-15 seconds (comprehensive search)

### **Test Command** (via API - Optional):
```bash
ssh root@185.193.126.13 'curl -X POST http://localhost:3002/api/civic/llm-chat -H "Content-Type: application/json" -d "{\"message\":\"What are Mamdani policies?\",\"chatType\":\"representatives\",\"context\":\"representativeAnalysis\"}"'
```

---

## 🚀 DEPLOY TO VERSION A (PRODUCTION)

**⚠️ ONLY DEPLOY TO PRODUCTION AFTER VERSION B TESTING CONFIRMS SUCCESS**

### **Deployment Commands**:
```bash
# 1. Backup Version A current ai-service.js
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-a/backend && sudo cp ai-service.js ai-service.js.backup-v37.19.6-$(date +%Y%m%d-%H%M%S)'

# 2. Backup Version A current article-search-service.js
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-a/backend/services && sudo cp article-search-service.js article-search-service.js.backup-v37.19.6-$(date +%Y%m%d-%H%M%S)'

# 3. Copy ai-service.js from Version B to Version A
ssh root@185.193.126.13 'sudo cp /var/www/workforce-democracy/version-b/backend/ai-service.js /var/www/workforce-democracy/version-a/backend/ai-service.js'

# 4. Copy article-search-service.js from Version B to Version A
ssh root@185.193.126.13 'sudo cp /var/www/workforce-democracy/version-b/backend/services/article-search-service.js /var/www/workforce-democracy/version-a/backend/services/article-search-service.js'

# 5. Stop Version A service
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-a.service'

# 6. Start Version A service
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-a.service'

# 7. Check Version A service status
ssh root@185.193.126.13 'sudo systemctl status workforce-backend-a.service'

# 8. Verify v37.19.7 loaded in Version A logs
# ⚠️ UPDATE version number below to v37.19.7
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-a.log | grep "v37.19.7"'
```

---

## 🎯 FINAL TESTING (LIVE SITE)

**After deploying to Version A (Production):**

1. **Go to**: https://workforcedemocracyproject.org/
2. **Ask**: "What are Mamdani's policies?"
3. **Verify**:
   - ✅ 10-20+ sources from trusted investigative journalists
   - ✅ All sources mention "Mamdani"
   - ✅ Detailed, fact-based policy analysis
   - ✅ No hallucinations or fabricated citations
   - ✅ Clean, easy-to-understand formatting
   - ✅ Response time: 10-15 seconds

---

## 🔄 DEPLOYMENT CHECKLIST

### **Version B (Test) Deployment**:
- [ ] Path updated in commands to match folder version (WDP-v37.19.7)
- [ ] Both files downloaded from GenSpark
- [ ] Files renamed to standard names
- [ ] Files moved to correct folder
- [ ] ai-service.js uploaded to Version B
- [ ] article-search-service.js uploaded to Version B
- [ ] Version B service restarted
- [ ] Logs show v37.19.7 loaded
- [ ] Test query successful (10-20+ sources, no errors)

### **Version A (Production) Deployment**:
- [ ] Version B tested and confirmed stable
- [ ] Version A backups created
- [ ] Both files copied from Version B to Version A
- [ ] Version A service restarted
- [ ] Logs show v37.19.7 loaded
- [ ] Live site tested and confirmed working

---

## 📊 SUCCESS METRICS

### **Before v37.19.7**:
- ❌ Only 4 sources
- ❌ Source #4 doesn't mention Mamdani
- ❌ Limited coverage
- ❌ Backend data mismatch

### **After v37.19.7**:
- ✅ 10-20+ sources
- ✅ All sources highly relevant
- ✅ Comprehensive policy coverage
- ✅ All indexed articles utilized
- ✅ Clean, fact-based analysis

---

## 🆘 TROUBLESHOOTING

### **Issue: Only 4 sources still appear**
**Fix**: Check if BOTH files were uploaded:
```bash
ssh root@185.193.126.13 'grep "v37.19.7" /var/www/workforce-democracy/version-b/backend/ai-service.js'
ssh root@185.193.126.13 'grep "v37.19.7" /var/www/workforce-democracy/version-b/backend/services/article-search-service.js'
```

### **Issue: Service won't start**
**Fix**: Check logs for errors:
```bash
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log'
```

### **Issue: Still seeing old version in logs**
**Fix**: Force restart:
```bash
ssh root@185.193.126.13 'sudo systemctl daemon-reload'
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'
```

---

## 📝 DEPLOYMENT STATUS

- ✅ **Files Created**: ai-service-v37.19.7, article-search-service-v37.19.7
- ✅ **Ready for Download**: Both files available in GenSpark
- ⏳ **Version B**: Awaiting deployment
- ⏳ **Version A (Production)**: Awaiting Version B testing

---

**🎯 STATUS: READY FOR DEPLOYMENT**  
**👉 Next Step**: Download files and run Version B deployment commands above

---

Password for SSH: `YNWA1892LFC`
