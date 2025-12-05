# 📚 START HERE: v37.19.4 - STRICT CITATION VERIFICATION

## 🎯 WHAT IS THIS?

**Version**: v37.19.4  
**Status**: READY FOR PRODUCTION DEPLOYMENT  
**Fix**: Strict 3-test citation verification to prevent AI from citing sources that don't mention the subject

---

## ⚡ QUICK START (30 seconds)

### **Problem You Reported:**
> "There's an incorrect statement in the second paragraph. The fourth source has no information to support it. Please amend the AI's citation if there is no information to support the statement."

**Example**: AI cited Source #4 ("Grassroots Democratic Base Survey") for Mamdani despite the source not mentioning him anywhere.

### **What We Fixed (Option 1 = A + B):**
✅ **Option A**: Raised relevance filter from 50 to 60 (filters marginal sources)  
✅ **Option B**: Added strict 3-test verification for every citation

---

## 🛡️ THE 3-TEST VERIFICATION SYSTEM

Every citation must pass ALL 3 tests:

```
TEST 1: NAME VERIFICATION
└─ Does source title/snippet contain person's NAME?
   NO → ❌ DON'T CITE
   YES → Continue to Test 2

TEST 2: TOPIC VERIFICATION  
└─ Does source explicitly state your TOPIC?
   NO → ❌ DON'T CITE
   YES → Continue to Test 3

TEST 3: CLAIM VERIFICATION
└─ Does source directly support your CLAIM?
   NO → ❌ DON'T CITE
   YES → ✅ SAFE TO CITE
```

**ZERO-TOLERANCE**: If ANY test fails → Don't cite

---

## 📊 WHAT CHANGED

| Component | v37.19.3 | v37.19.4 | Impact |
|-----------|----------|----------|--------|
| **Relevance Filter** | 50 | **60** | Filters more marginal sources |
| **Citation Rules** | General checklist | **3-test decision tree** | Mandatory verification |
| **Example in Prompt** | Generic | **Real Mamdani/Source #4** | Concrete "don't do this" |
| **Self-Check** | Optional | **Mandatory before submission** | Forces verification |

---

## 🚀 DEPLOY TO PRODUCTION (3 minutes)

### **Step 1: SSH to Server**
```bash
ssh root@185.193.126.13
# Password: YNWA1892LFC
```

### **Step 2: Backup + Deploy**
```bash
cd /var/www/workforce-democracy/version-a/backend
sudo cp ai-service.js ai-service.js.backup-$(date +%Y%m%d-%H%M%S)
sudo cp /var/www/workforce-democracy/version-b/backend/ai-service.js ./ai-service.js
```

### **Step 3: Restart Service**
```bash
sudo systemctl restart workforce-backend-a.service
sudo systemctl status workforce-backend-a.service
```

**Expected**: `Active: active (running)`

### **Step 4: Verify Version**
```bash
tail -50 /var/log/workforce-backend-a.log | grep "v37.19"
```

**Expected Output**:
```
🚀🚀🚀 AI-SERVICE.JS v37.19.4 LOADED - CITATION VERIFICATION FIX 🚀🚀🚀
✅ v37.19.4: CITATION VERIFICATION - Snippet must mention person/topic; MIN_RELEVANCE 50→60
```

---

## ✅ TEST IT (1 minute)

### **Go to**: `https://workforcedemocracyproject.org/`
### **Ask**: "What are Mamdani's policies?"

### **Expected Results**:

✅ **3-4 highly relevant sources** (all mention "Mamdani" in title/snippet)  
✅ **Perfect citation match** (citations = sources)  
✅ **No Source #4 issue** (marginal sources filtered or not cited)  
✅ **No fabricated connections** (only claims directly in sources)  
✅ **Fast response** (10-12 seconds)

### **Red Flags** (should NOT see):

❌ Source like "Grassroots Democratic Base" cited for Mamdani  
❌ Claims not explicitly in sources (e.g., "surveys confirm support for Mamdani")  
❌ Invented facts/dates/positions  

---

## 🔍 TROUBLESHOOTING

### **Service Won't Start**
```bash
tail -100 /var/log/workforce-backend-a.log
node -c /var/www/workforce-democracy/version-a/backend/ai-service.js
```

### **Still Seeing Bad Citations**
1. Check `MIN_RELEVANCE_FOR_LLM = 60` in deployed file
2. Verify prompt includes "STRICT CITATION VERIFICATION (v37.19.4)"
3. Clear browser cache

### **Too Few Sources**
- Check logs: `grep "Filtered out" /var/log/workforce-backend-a.log`
- Threshold 60 might be too high for some queries
- Consider lowering to 55-58 if needed

---

## 📚 FULL DOCUMENTATION

- **Deployment Guide**: `👉-DEPLOY-v37.19.4-STRICT-CITATION-👈.md`
- **Technical Details**: `🛡️-STRICT-CITATION-v37.19.4-🛡️.md`
- **Master Document**: `🎯-MASTER-HANDOVER-DOCUMENT-🎯.md`

---

## 🎯 SUCCESS CRITERIA

**v37.19.4 is successful when**:

1. ✅ Service running: `active (running)`
2. ✅ Version loaded: `v37.19.4` in logs
3. ✅ Test query: 3-4 perfect sources
4. ✅ Citations: 100% match sources
5. ✅ No fabrications: 0 invented facts
6. ✅ Source #4 issue: FIXED

---

## 🚨 ROLLBACK (if needed)

```bash
cd /var/www/workforce-democracy/version-a/backend
sudo cp ai-service.js.backup-YYYYMMDD-HHMMSS ai-service.js
sudo systemctl restart workforce-backend-a.service
```

---

## 📝 WHAT'S NEXT?

After successful deployment:
1. Monitor production for 24 hours
2. Check for user reports of citation issues
3. Review logs for filtered sources
4. Fine-tune threshold (60) if needed

---

**Status**: READY FOR DEPLOYMENT  
**Estimated Time**: 5 minutes total  
**Risk Level**: Low (easy rollback)  
**Impact**: High (fixes fabricated citations)

---

*Quick Start Guide v37.19.4*  
*Created: 2025-12-01*  
*Ready to deploy!*
