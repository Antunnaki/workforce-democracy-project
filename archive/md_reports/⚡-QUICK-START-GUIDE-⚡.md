# ⚡ QUICK START GUIDE - FIX v37.18.6 ⚡

## 🎯 THE PROBLEM

**User reports**: No citations appear on frontend despite backend finding Congress.gov bills

**Root cause**: TWO bugs in `backend/civic-llm-async.js`:
1. ❌ Calling `aiService.generateResponse()` (doesn't exist)
2. ❌ Never calling `deep-research.js` (Congress.gov search)

---

## 🚀 THE FIX (2 Minutes)

### Step 1: Deploy
```bash
cd /path/to/backend
chmod +x ⚡-DEPLOY-COMPLETE-FIX-MAC-⚡.sh
./⚡-DEPLOY-COMPLETE-FIX-MAC-⚡.sh
```

### Step 2: Wait
Wait 60 seconds for test query to complete.

### Step 3: Verify
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend
chmod +x CHECK-RESULT.sh
./CHECK-RESULT.sh
```

### Step 4: Test Frontend
Go to: https://sxcrlfyt.gensparkspace.com
- ZIP: `12061`
- Ask: "How has Chuck Schumer voted on healthcare?"
- Expected: ¹ ² ³ citations with Congress.gov bills

---

## ✅ SUCCESS CRITERIA

You should see:

### In Logs:
```
📰 Found 1 RSS sources
🏛️  Found 6 Congress.gov bills
📚 Total sources: 7
```

### In API Response:
```json
{
  "sources": [
    {"title": "S.1820 - Prescription Drug...", "url": "congress.gov/..."}
  ]
}
```

### On Frontend:
- Superscript citations: ¹ ² ³
- Congress.gov bills in sources
- Clickable source links

---

## 🆘 TROUBLESHOOTING

### If deployment fails:
```bash
# Check service status
ssh root@185.193.126.13
sudo systemctl status workforce-backend-b

# Check logs
tail -50 /var/log/workforce-backend-b.log
```

### If no citations appear:
```bash
# Verify fix was applied
ssh root@185.193.126.13
grep "analyzeWithAI" /var/www/workforce-democracy/version-b/backend/civic-llm-async.js
# Should return: const aiResponse = await aiService.analyzeWithAI(...)
```

### If no Congress.gov bills:
```bash
# Verify deep research integrated
ssh root@185.193.126.13
grep "deep-research" /var/www/workforce-democracy/version-b/backend/civic-llm-async.js
# Should return: const deepResearch = require('./deep-research');
```

---

## 📁 WHAT WAS CREATED

- `backend/FIX-CIVIC-LLM-COMPLETE-v37.18.6.js` - Fix script
- `backend/DEPLOY-CIVIC-LLM-COMPLETE-v37.18.6.sh` - VPS deploy
- `⚡-DEPLOY-COMPLETE-FIX-MAC-⚡.sh` - Mac upload script
- `backend/CHECK-RESULT.sh` - Result checker
- `🔥-COMPLETE-FIX-CIVIC-LLM-v37.18.6-🔥.md` - Full docs
- `📊-FIX-SUMMARY-v37.18.6-📊.md` - Summary
- This file - Quick start guide

---

## 🎯 EXPECTED OUTCOME

| Metric | Before | After |
|--------|--------|-------|
| Sources | 1 RSS | 7 (1 RSS + 6 Congress) |
| Citations | 0 | 3-6 |
| User Trust | Low | High |

---

## 💾 PRODUCTION DEPLOYMENT

Once verified on Version B:
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/deployment-scripts
./sync-b-to-a.sh
```

---

**Ready to fix! Run the deploy script now.** 🚀
