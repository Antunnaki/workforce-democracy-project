# 🚨 CRITICAL: Deep Research Not Calling Congress.gov - v37.18.4

## The Problem

Your Deep Research system is completing successfully (`researchType: "deep"`), but **returning 0 sources** from Congress.gov.

### What's Happening:
- ✅ Deep Research is **enabled**
- ✅ Representative name is **detected** (Charles E. Schumer)
- ✅ Search query is **constructed**
- ❌ **BUT**: `searchCongressGovBills()` is **never actually called**

### Root Cause:
The `searchRepresentativeVotingRecord()` function in `deep-research.js` is missing the actual call to `searchCongressGovBills()`.

This likely happened during the sponsor filter implementation when code was refactored but the critical function call was accidentally removed or placed incorrectly.

---

## The Fix

I've created an **automated diagnostic and fix script** that will:

1. ✅ **Diagnose** the exact issue
2. ✅ **Backup** your current `deep-research.js`
3. ✅ **Insert** the missing `searchCongressGovBills()` call
4. ✅ **Verify** syntax
5. ✅ **Restart** the backend
6. ✅ **Test** with a real query

---

## How to Deploy

### Option A: Full Automated Fix (Recommended)

```bash
# 1. Navigate to project
cd /var/www/workforce-democracy/version-b/backend

# 2. Run the complete fix
chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
```

### Option B: Step-by-Step Manual

```bash
# 1. Navigate to backend
cd /var/www/workforce-democracy/version-b/backend

# 2. Run diagnostic first
chmod +x DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
./DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh

# 3. Apply the fix
node FIX-DEEP-RESEARCH-CALL-v37.18.4.js

# 4. Restart backend
sudo systemctl restart workforce-backend-b.service

# 5. Test
curl -X POST "http://localhost:3002/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{"message": "How has Chuck Schumer voted on healthcare?", "context": {"page": "civic-platform"}}'
```

---

## What to Expect After Fix

### ✅ SUCCESS Indicators:

**In the logs (`/var/log/workforce-backend-b.log`):**
```
[Deep Research] Searching Congress.gov for Charles E. Schumer...
[Deep Research] Found 10 Congress.gov bills
```

**In the API response:**
```json
{
  "sources": [
    {
      "title": "H.R. 6249 - Substance Use Services Act",
      "url": "https://api.congress.gov/v3/bill/118/hr/6249",
      "type": "congress_bill",
      "source": "Congress.gov",
      "relevanceScore": 500
    }
    // ... more bills
  ],
  "metadata": {
    "researchType": "deep",
    "sourceCount": 13  // NOT 0!
  }
}
```

---

## Files Created

- `DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh` - Diagnostic script
- `FIX-DEEP-RESEARCH-CALL-v37.18.4.js` - Automated fix script
- `DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh` - Complete deployment automation
- `👉-CRITICAL-DEEP-RESEARCH-FIX-v37.18.4-👈.md` - This file

---

## Why This Happened

During the v37.18.4 sponsor filter implementation, the code was modified to:
1. ✅ Extract representative's name
2. ✅ Build sponsor-filtered query (`sponsor:"Schumer"`)
3. ✅ Define `searchCongressGovBills()` function
4. ❌ **BUT**: The actual **call** to `searchCongressGovBills()` was lost in the refactor

The function exists, the query is correct, but it's never invoked!

---

## Next Steps After Fix

Once Deep Research is working:

### 1. Test on GenSpark
```
URL: https://sxcrlfyt.gensparkspace.com
ZIP: 12061
Query: "How has Chuck Schumer voted on healthcare?"
```

**Expected:** AI response citing specific Congress.gov bills with URLs

### 2. Verify Contact Enhancement
Test the 4 smart contact buttons via the `/api/civic/contacts/:id` endpoint

### 3. Deploy to Production
```bash
cd /var/www/workforce-democracy/version-b
./sync-b-to-a.sh
```

---

## Emergency Rollback

If the fix causes issues:

```bash
cd /var/www/workforce-democracy/version-b/backend

# Find your backup
ls -lt deep-research-BACKUP-before-call-fix-*.js | head -1

# Restore it
BACKUP_FILE=$(ls -t deep-research-BACKUP-before-call-fix-*.js | head -1)
cp $BACKUP_FILE deep-research.js

# Restart
sudo systemctl restart workforce-backend-b.service
```

---

## Questions?

This fix specifically addresses the **missing function call** issue. If Deep Research still returns 0 sources after this fix, the next debugging steps would be:

1. ✅ Verify Congress.gov API key is set
2. ✅ Check network connectivity to `api.congress.gov`
3. ✅ Verify sponsor filter syntax is correct
4. ✅ Check for API rate limiting

---

**Ready to fix?** Run the deployment script now:

```bash
cd /var/www/workforce-democracy/version-b/backend
chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
```

