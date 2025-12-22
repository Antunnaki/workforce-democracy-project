# 🚀 Deep Research v37.18.3 - Quick Deployment Guide

**What this fixes:** Congress.gov bills now appear in AI chat sources (instead of empty `sources: []`)

---

## 📦 FILES TO DOWNLOAD

Download these 4 files from the chat and place them in:
```
/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/
```

1. **`deep-research-v37.18.3-ENHANCED.js`** - Enhanced Deep Research module
2. **`DEPLOY-v37.18.3-AUTO.sh`** - Auto-deployment script (runs on VPS)
3. **`UPLOAD-AND-DEPLOY-v37.18.3.sh`** - Upload script (runs on Mac)
4. **`README-DEPLOYMENT-v37.18.3.md`** - This file

---

## 🚀 ONE-COMMAND DEPLOYMENT (Mac)

```bash
# 1. Navigate to your project folder
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0"

# 2. Make the upload script executable
chmod +x UPLOAD-AND-DEPLOY-v37.18.3.sh

# 3. Run it (uploads files + deploys + tests automatically)
./UPLOAD-AND-DEPLOY-v37.18.3.sh
```

**That's it!** The script will:
- ✅ Upload enhanced Deep Research module to VPS
- ✅ Backup current version
- ✅ Deploy new version
- ✅ Restart backend
- ✅ Submit test query
- ✅ Show results

---

## 🎯 EXPECTED OUTPUT

You should see:
```
✅ Service is ACTIVE
✅ Job submitted: [jobId]
⏳ Waiting 30 seconds...
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
✅ SUCCESS: Found 5 sources!

📋 Sources:
{
  "title": "HR 1512 - Taiwan Assurance Implementation Act",
  "url": "https://www.congress.gov/bill/118th-congress/house-bill/1512",
  "type": "congress_bill"
}
```

---

## 🌐 TEST ON GENSPARK

After deployment:
1. Go to: https://sxcrlfyt.gensparkspace.com
2. Enter ZIP: `12061`
3. Find Chuck Schumer
4. Ask: **"How has Chuck Schumer voted on healthcare?"**
5. Expected: Congress.gov bill citations with URLs

---

## 🔄 MANUAL DEPLOYMENT (if you prefer)

### Upload Files
```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0"

scp deep-research-v37.18.3-ENHANCED.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/

scp DEPLOY-v37.18.3-AUTO.sh root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/
```

### Deploy on VPS
```bash
ssh root@185.193.126.13

cd /var/www/workforce-democracy/version-b/backend

chmod +x DEPLOY-v37.18.3-AUTO.sh

./DEPLOY-v37.18.3-AUTO.sh
```

---

## ✅ WHAT WAS FIXED

### Before v37.18.3:
```json
{
  "sources": [],
  "metadata": {
    "sourceCount": 0
  }
}
```
Logs: `Removed sources with scores: Congress.gov: 0, Congress.gov: 0...`

### After v37.18.3:
```json
{
  "sources": [
    {
      "title": "HR 1512 - Taiwan Assurance Implementation Act",
      "url": "https://www.congress.gov/bill/..."
    }
  ],
  "metadata": {
    "sourceCount": 5
  }
}
```
Logs: `✅ [Congress.gov] Formatted 5 bills with enhanced metadata`

---

## 🚨 ROLLBACK (if needed)

```bash
ssh root@185.193.126.13
cd /var/www/workforce-democracy/version-b/backend

# Find backup file
ls -lt deep-research-BACKUP-*.js | head -1

# Restore it
cp deep-research-BACKUP-v37.18.2-YYYYMMDD-HHMMSS.js deep-research.js

# Restart
sudo systemctl restart workforce-backend-b.service
```

---

## 📊 TECHNICAL DETAILS

**Enhanced Source Format:**
```javascript
{
  title: "HR 1234 - Healthcare Reform Act",
  url: "https://www.congress.gov/bill/...",
  type: "congress_bill",
  source: "Congress.gov",
  description: "HR 1234 - Legislative action on healthcare",  // NEW
  content: "HR 1234: Healthcare Reform Act...",              // NEW
  metadata: {                                                  // NEW
    billNumber: "1234",
    isGovernmentSource: true,
    isPrimarySource: true
  }
}
```

**Relevance Scoring:**
- Government source (.gov) → +50 bonus
- Description/content fields → Keyword matching
- Result: Score 120+ (passes threshold of 20)

---

## 🎯 SUCCESS CRITERIA

After deployment, verify:
- [ ] Backend service shows `active (running)`
- [ ] Test query returns `jobId`
- [ ] After 30 seconds, `sourceCount` > 0
- [ ] Sources array contains Congress.gov bills
- [ ] Bills have `.gov` URLs
- [ ] AI response cites specific bills

---

**Questions? Check the full deployment log or ask for help!** 🚀
