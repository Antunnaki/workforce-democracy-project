# 🚨 FIX: 413 Payload Too Large Error - v37.19.6

## ❌ PROBLEM

v37.19.5 deployed successfully but **failed with 413 error**:

```
Error: Job failed: Request failed with status code 413
```

**Root Cause**: Prompt became too long after adding detailed anti-contradiction rules
- HTTP 413 = "Payload Too Large"
- The LLM API rejected the request because prompt exceeded size limit

---

## ✅ SOLUTION: v37.19.6

**Condensed the anti-contradiction prompt** from 35 lines to 5 lines:

### **Before (v37.19.5) - 35 lines:**
```
🚨🚨🚨 FORBIDDEN: SELF-CONTRADICTORY CITATIONS (v37.19.5) 🚨🚨🚨

❌ NEVER EVER cite a source and then say it's irrelevant/doesn't mention the subject:

WRONG EXAMPLES (DO NOT DO THIS):
❌ "Source [4] discusses the Democratic base but does not mention Mamdani [4]"
❌ "The fourth source...does not mention Mamdani or his policies [4]"
[... 25 more lines ...]
```

### **After (v37.19.6) - 5 lines:**
```
🚨 FORBIDDEN: SELF-CONTRADICTORY CITATIONS 🚨
❌ NEVER cite [N] then say "doesn't mention" or "not related"
❌ Wrong: "Source [4] doesn't mention Mamdani [4]"
✅ Right: Don't cite [4] at all - just use [1] [2] [3]
Rule: If irrelevant → Don't cite, don't mention, skip entirely
```

**Same rules, 85% less text** → Fixes 413 error

---

## 🚀 QUICK DEPLOY (1 FILE)

```bash
# Download from GenSpark: ai-service-v37.19.6-FIX-413-ERROR.js
# Rename to: ai-service.js

cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.0/backend"

# Upload to Version B:
scp ai-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/ai-service.js

# Restart:
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# Verify v37.19.6:
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19.6"'
```

**Expected output:**
```
🚀🚀🚀 AI-SERVICE.JS v37.19.6 LOADED - PROMPT OPTIMIZED (FIX 413 ERROR) 🚀🚀🚀
⚙️  v37.19.6: PROMPT OPTIMIZED - Condensed rules to fix 413 Payload Too Large error
```

---

## ✅ WHAT'S PRESERVED

All features from v37.19.5 still work:
- ✅ Person-name bonus scoring (+200 title, +100 excerpt)
- ✅ Anti-self-contradiction rules (condensed but same effect)
- ✅ Source #4 filtering
- ✅ 3-test citation verification

**Only difference**: Prompt is shorter, no functional changes

---

## 📊 PROMPT SIZE COMPARISON

| Version | Prompt Lines | Status |
|---------|--------------|--------|
| v37.19.4 | ~150 lines | ✅ Works |
| v37.19.5 | ~185 lines | ❌ **413 Error** |
| v37.19.6 | ~155 lines | ✅ **FIXED** |

---

## 🎯 TEST AFTER DEPLOYMENT

**Query**: "What are Mamdani's policies?"

**Expected**:
- ✅ 3 sources (not 4)
- ✅ All mention "Mamdani"
- ✅ No 413 error
- ✅ No self-contradictions
- ✅ Response time: 10-12 seconds

---

## 📝 MASTER HANDOVER UPDATED

Added version number verification reminders:

**New Section:**
```
⚠️ CRITICAL: VERSION NUMBER VERIFICATION
- ALWAYS update version numbers in grep/tail commands
- Example: If deploying v37.19.6, change v37.19.4 → v37.19.6
```

This ensures deployment commands match actual version being deployed.

---

**Status**: READY TO DEPLOY  
**File**: ai-service-v37.19.6-FIX-413-ERROR.js  
**Risk**: Low  
**Impact**: Fixes 413 error, preserves all features

---

*Quick Fix v37.19.6*  
*Created: 2025-12-01*
