# 🚀 Deploy V36.8.2 Backend Updates

**What**: Updated AI prompts with truth-guided discovery approach  
**Where**: VPS backend (185.193.126.13)  
**Method**: Upload and replace

---

## ⚡ Quick Deploy (Automated)

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v36.7.1"

# Upload updated file
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/ai-service.js.v36.8.2

# Deploy on VPS
ssh root@185.193.126.13 << 'ENDSSH'
cd /var/www/workforce-democracy/backend
cp ai-service.js ai-service.js.backup.$(date +%Y%m%d_%H%M%S)
mv ai-service.js.v36.8.2 ai-service.js
pm2 restart workforce-backend
pm2 status
pm2 logs workforce-backend --lines 30 --nostream
ENDSSH
```

---

## ✅ Verify Deployment

```bash
ssh root@185.193.126.13

# Check for new version marker
grep "V36.8.2" /var/www/workforce-democracy/backend/ai-service.js

# Check for new approach
grep "Truth Through Discovery" /var/www/workforce-democracy/backend/ai-service.js

# Check PM2 status
pm2 status
```

---

## 🧪 Test the Updated AI

### Test 1: Ask about Mamdani
**Prompt**: "What are recent developments for Zohran Mamdani?"

**Should see**:
- ✅ Recent 2024 information with sources
- ✅ NO "my training data ends April 2023"
- ✅ Policy positions with impact explanations
- ✅ Honest tone without being preachy

### Test 2: Ask about corruption
**Prompt**: "Tell me about Eric Adams"

**Should see**:
- ✅ Clear statement of corruption charges
- ✅ Specific allegations detailed
- ✅ Not watered down to "ethics violations"
- ✅ Full context with sources

### Test 3: Compare candidates
**Prompt**: "What's the difference between [two establishment candidates]?"

**Should see**:
- ✅ Honest assessment of similarities if they exist
- ✅ Campaign finance connections if relevant
- ✅ No false balance manufactured

---

## 📊 What Changed

### Key Updates:
1. **"Truth Through Discovery"** approach - guide users to conclusions through facts
2. **Corruption language** - honest but backed by evidence
3. **People-centered analysis** - impacts on vulnerable populations
4. **Corporate vs. community** - explain who benefits
5. **No false balance** - state when candidates are similar

See `V36.8.2-PROMPT-UPDATE-SUMMARY.md` for detailed explanation.

---

## 🎯 Expected Behavior After Deployment

**When discussing politicians**:
- Clear factual statements about indictments/convictions
- Campaign finance connections when documented
- Real-world policy impacts on people

**When comparing candidates**:
- Honest about similarities on corporate influence
- Notes genuine differences when they exist
- No manufactured equivalence

**When explaining policies**:
- Distinguishes universal vs. market-based access
- Explains impacts on vulnerable populations
- Lets users connect the dots

---

## 🔄 Rollback (if needed)

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# See available backups
ls -lh ai-service.js.backup.*

# Restore previous version
cp ai-service.js.backup.YYYYMMDD_HHMMSS ai-service.js

# Restart
pm2 restart workforce-backend
```

---

**Ready when you are!** Just run the Quick Deploy commands above. 🚀
