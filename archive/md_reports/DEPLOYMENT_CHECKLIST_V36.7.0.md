# ✅ Deployment Checklist - V36.7.0

## Pre-Deployment Verification

- [ ] All files in `backend/` folder are updated
- [ ] README.md shows V36.7.0 as latest version
- [ ] Documentation files created:
  - [ ] 🚀_START_HERE_V36.7.0.md
  - [ ] DEPLOYMENT_GUIDE_V36.7.0.md
  - [ ] IMPLEMENTATION_COMPLETE_V36.7.0.md
  - [ ] QUICK_DEPLOYMENT_COMMANDS.sh
  - [ ] VISUAL_SUMMARY_V36.7.0.txt

---

## Deployment Steps

### ☑️ Step 1: Backup Current Files
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
cp server.js server.js.backup-v36.6.0
cp ai-service.js ai-service.js.backup-v36.6.0
cp government-apis.js government-apis.js.backup-v36.6.0
exit
```

**Verification**:
- [ ] Backups created successfully
- [ ] .backup-v36.6.0 files exist in backend folder

---

### ☑️ Step 2: Upload New Files
```bash
# Run from local machine where files are located
scp backend/package.json root@185.193.126.13:/var/www/workforce-democracy/backend/
scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/
scp backend/ai-service.js root@185.193.126.13:/var/www/workforce-democracy/backend/
scp backend/government-apis.js root@185.193.126.13:/var/www/workforce-democracy/backend/
```

**Verification**:
- [ ] package.json uploaded successfully
- [ ] server.js uploaded successfully
- [ ] ai-service.js uploaded successfully
- [ ] government-apis.js uploaded successfully

---

### ☑️ Step 3: Install Dependencies
```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend
npm install cheerio
```

**Verification**:
- [ ] cheerio installed successfully
- [ ] No error messages from npm install
- [ ] Run `npm list cheerio` to verify installation

---

### ☑️ Step 4: Verify Environment Variables
```bash
cat .env | grep GROQ_API_KEY
```

**Verification**:
- [ ] GROQ_API_KEY is present (gsk_...3Jlo)
- [ ] GROQ_MODEL is NOT set (will use default: llama-3.3-70b-versatile)
- [ ] CONGRESS_API_KEY is set (or will add later)
- [ ] Database credentials are correct

---

### ☑️ Step 5: Clear Old Cache
```bash
sudo -u postgres psql -d workforce_democracy -c "TRUNCATE TABLE cached_responses;"
```

**Expected output**:
```
TRUNCATE TABLE
```

**Verification**:
- [ ] Cache cleared successfully
- [ ] No error messages

---

### ☑️ Step 6: Restart Backend
```bash
pm2 restart workforce-backend
```

**Expected output**:
```
[PM2] Applying action restartProcessId on app [workforce-backend]
[PM2] [workforce-backend] ✓
```

**Verification**:
- [ ] PM2 restart completed
- [ ] No error messages

---

### ☑️ Step 7: Check PM2 Status
```bash
pm2 status
```

**Expected output**:
```
┌─────┬────────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name               │ mode    │ ↺       │ status  │ cpu      │
├─────┼────────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ workforce-backend  │ fork    │ 0       │ online  │ 0%       │
└─────┴────────────────────┴─────────┴─────────┴─────────┴──────────┘
```

**Verification**:
- [ ] Status shows "online" (NOT "errored")
- [ ] No restart loops (↺ should be low number)

---

### ☑️ Step 8: Check Logs
```bash
pm2 logs workforce-backend --lines 50
```

**Look for SUCCESS indicators**:
- [ ] ✅ "llama-3.3-70b-versatile" appears in logs
- [ ] ✅ "Backend started on port 3000" or similar
- [ ] ✅ "Database connected" or similar
- [ ] ✅ No syntax errors
- [ ] ✅ No "module not found" errors

**Red flags** (if you see these, deployment failed):
- [ ] ❌ "SyntaxError"
- [ ] ❌ "Cannot find module 'cheerio'"
- [ ] ❌ "await is only valid in async functions"
- [ ] ❌ Backend keeps restarting

---

### ☑️ Step 9: Test Health Check
```bash
curl https://api.workforcedemocracyproject.org/health
```

**Expected output**:
```json
{"status":"ok","timestamp":"2025-01-30T..."}
```

**Verification**:
- [ ] Status is "ok"
- [ ] Timestamp is current
- [ ] No error messages

---

## Post-Deployment Testing

### ☑️ Test 1: Eric Adams (Misinformation Fix)

**Action**: 
- Open https://workforcedemocracyproject.org
- Go to Representatives chat
- Ask: "Tell me about Eric Adams"

**Expected behavior**:
- [ ] Response mentions "indicted on federal corruption charges"
- [ ] Critical analysis of housing record
- [ ] Mentions "policies favored developers over tenants" or similar
- [ ] Does NOT say "advocate for housing"
- [ ] Does NOT say "making waves"

**Status**: ☐ Pass / ☐ Fail

**If fail**: Check PM2 logs for errors

---

### ☑️ Test 2: Human Rights Framework

**Action**: 
- Ask: "What is Chuck Schumer's voting record?"

**Expected behavior**:
- [ ] Mentions ACA as "insurance access through private markets"
- [ ] Says "fell short of guaranteeing healthcare as a right" or similar
- [ ] Distinguishes market reforms from universal guarantees
- [ ] Does NOT say "progressive healthcare reform" without qualification

**Status**: ☐ Pass / ☐ Fail

**If fail**: Check ai-service.js CORE_PHILOSOPHY section

---

### ☑️ Test 3: Global Expansion (UK)

**Action**: 
- Ask: "Tell me about Keir Starmer"

**Expected behavior**:
- [ ] Provides comprehensive analysis (not "I don't have information")
- [ ] Response includes details about UK politics
- [ ] PM2 logs show: "📍 Detected location: UK"
- [ ] PM2 logs show: "🌐 Web searching for..."

**Status**: ☐ Pass / ☐ Fail

**If fail**: Check server.js queryWithRealAI function

---

### ☑️ Test 4: Local Candidate Detection

**Action**: 
- Ask: "Who is running for NYC mayor?"

**Expected behavior**:
- [ ] Provides candidate information
- [ ] PM2 logs show: "🗳️ Detected local candidate query"
- [ ] PM2 logs show: "🗳️ Scraping Ballotpedia" or "🌐 Web searching"

**Status**: ☐ Pass / ☐ Fail

**If fail**: Check government-apis.js functions exist

---

### ☑️ Test 5: AI Model Update

**Action**: 
- Check PM2 logs

**Expected behavior**:
- [ ] Logs show "llama-3.3-70b-versatile" (NOT llama-3.1)
- [ ] AI responses are engaging and varied (not repetitive)
- [ ] No HTML tags in responses (plain text with paragraph breaks)

**Status**: ☐ Pass / ☐ Fail

**If fail**: Check ai-service.js line 23 (GROQ_MODEL)

---

## Troubleshooting Guide

### Issue: Backend shows "errored" in PM2

**Diagnosis**:
```bash
pm2 logs workforce-backend --lines 100
```

**Common causes**:
1. **Syntax error** → Check error line number, fix and restart
2. **Missing cheerio** → Run `npm install cheerio`
3. **Wrong model name** → Verify ai-service.js has llama-3.3-70b-versatile
4. **Duplicate code** → Should not happen (we fixed this)

**Solution**:
```bash
# If syntax error found, restore backup:
cp server.js.backup-v36.6.0 server.js
pm2 restart workforce-backend

# Then fix the specific file and re-upload
```

---

### Issue: Still seeing placeholder messages

**Diagnosis**:
Cache wasn't cleared properly

**Solution**:
```bash
sudo -u postgres psql -d workforce_democracy
\c workforce_democracy
TRUNCATE TABLE cached_responses;
\q
pm2 restart workforce-backend
```

---

### Issue: HTML tags still appearing

**Diagnosis**:
Frontend not updated yet (backend is ready)

**Solution**:
Backend sends plain text with \n\n. Frontend needs to convert to <p> tags.
This is a **separate frontend deployment** (not part of V36.7.0 backend update).

---

### Issue: Web search not working

**Diagnosis**:
Check if cheerio is installed

**Solution**:
```bash
npm list cheerio
# If not found:
npm install cheerio
pm2 restart workforce-backend
```

---

### Issue: Global detection not working

**Diagnosis**:
Check queryWithRealAI function in server.js

**Solution**:
Verify lines 409-428 have the candidate detection logic with international keywords.

---

## Rollback Procedure (If Needed)

If deployment fails and issues can't be resolved quickly:

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/backend

# Restore all backups
cp server.js.backup-v36.6.0 server.js
cp ai-service.js.backup-v36.6.0 ai-service.js
cp government-apis.js.backup-v36.6.0 government-apis.js

# Restart
pm2 restart workforce-backend

# Verify rollback successful
pm2 status
pm2 logs workforce-backend --lines 20
```

**Note**: Cache will still be cleared, but that's not a problem (it will rebuild).

---

## Success Criteria

Deployment is **100% successful** when all checkboxes are marked:

**Infrastructure**:
- [ ] PM2 status: online
- [ ] Health check returns ok
- [ ] Logs show llama-3.3-70b-versatile
- [ ] No syntax errors in logs

**Functionality**:
- [ ] Test 1 passes (Eric Adams mentions indictment)
- [ ] Test 2 passes (Schumer uses human rights lens)
- [ ] Test 3 passes (UK politician works)
- [ ] Test 4 passes (Local candidate detection works)
- [ ] Test 5 passes (AI model updated, no HTML tags)

**Documentation**:
- [ ] All documentation files created
- [ ] README.md updated to V36.7.0

---

## Post-Deployment Monitoring

### First Hour After Deployment

**Check every 15 minutes**:
```bash
pm2 status
pm2 logs workforce-backend --lines 20
```

**Look for**:
- [ ] No restart loops
- [ ] No error messages
- [ ] Queries being processed successfully
- [ ] Cache being built (responses getting faster)

### First 24 Hours

**Check once per hour**:
- [ ] PM2 status remains online
- [ ] No memory leaks (memory usage stable)
- [ ] Response times improving as cache builds

---

## Next Steps After Successful Deployment

1. **Frontend Typewriter Effect** (Separate Deployment)
   - Backend ready (sends plain text with \n\n)
   - Frontend needs update to convert to <p> tags
   - Implement character-by-character reveal

2. **Monitor User Feedback**
   - Test with real users
   - Collect feedback on accuracy
   - Verify no misinformation issues

3. **API Keys (Optional Enhancement)**
   - Add Congress.gov API key for better bill data
   - Add ProPublica API key for better voting records
   - System works without these (uses web search fallback)

---

## Support

If you encounter issues not covered in this checklist:

1. **Check logs first**: `pm2 logs workforce-backend --lines 100`
2. **Review documentation**: See DEPLOYMENT_GUIDE_V36.7.0.md
3. **Restore backup if needed**: Follow rollback procedure above

---

**Estimated completion time**: 10-15 minutes

**Risk level**: Low (backups made, easy rollback)

**Impact**: High (fixes misinformation, adds global support, implements 18 Living Philosophies)

---

✅ **All tasks complete! Ready to deploy! 🚀🌍💚**
