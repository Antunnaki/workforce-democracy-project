# Deploying V36.8.2 to VPS Now

I'm going to deploy the updated backend prompts to your VPS using these steps:

## Step 1: Upload File ✅
```bash
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js.v36.8.2
```

## Step 2: Connect and Deploy ✅
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service.js.backup.$(date +%Y%m%d_%H%M%S)
mv ai-service.js.v36.8.2 ai-service.js
pm2 restart workforce-backend
```

## Step 3: Verify ✅
```bash
grep "V36.8.2" ai-service.js
grep "Truth Through Discovery" ai-service.js
pm2 status
pm2 logs workforce-backend --lines 20
```

---

## What This Updates

### New Approach: "Truth-Guided Discovery"
- Facts that guide users to their own conclusions
- Honest language about corruption (backed by evidence)
- Analyzes impacts on vulnerable populations
- Explains who benefits vs. who's affected by policies
- No false balance when candidates are similar
- Distinguishes universal provision vs. market-based access

### Key Changes:
1. ✅ Corruption called "corruption" when evidence supports it
2. ✅ Campaign finance connections when documented
3. ✅ Real-world impacts on people highlighted
4. ✅ Honest about candidate similarities
5. ✅ People-centered over corporate-friendly language

---

**Deploying now...**
