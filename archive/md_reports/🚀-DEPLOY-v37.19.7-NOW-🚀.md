# 🚀 DEPLOY v37.19.7: MORE SOURCES + COMPREHENSIVE ANALYSIS

## 🎯 WHAT'S IN v37.19.7

### **Immediate Fixes:**
1. ✅ **Increased search limit**: 15 → 50 articles
2. ✅ **Fixed person-name detection**: Excludes topic words ("policies", "campaign", etc.)
3. ✅ **Better keyword filtering**: More accurate relevance scoring

### **Expected Results:**
- **Before**: 4 sources
- **After**: 10-20+ sources from comprehensive archive search

---

## 📥 DEPLOY NOW (1 FILE)

### **Step 1: Download File**
Download from GenSpark: `article-search-service-v37.19.7-MORE-SOURCES.js`
Rename to: `article-search-service.js`

### **Step 2: Create Folder (if needed)**
```bash
# On your Mac, create v37.19.7 folder:
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES"

# Copy v37.19.0 folder to v37.19.7:
cp -r WDP-v37.19.0 WDP-v37.19.7

# Navigate to new folder:
cd WDP-v37.19.7/backend
```

### **Step 3: Replace File**
```bash
# Still in WDP-v37.19.7/backend folder
# Replace the article-search-service.js with downloaded file
# (Overwrite services/article-search-service.js)
```

### **Step 4: Deploy to Version B**
```bash
# Navigate to project folder
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.7/backend"

# Upload to server
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js

# Restart Version B
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# Verify (should still show v37.19.6 in ai-service, but new article-search logic)
ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log | grep "v37.19"'
```

**Note**: Version number in logs will still show v37.19.6 (ai-service.js unchanged), but article search behavior will be v37.19.7.

---

## ✅ TEST RESULTS EXPECTED

**Query**: "What are Mamdani's policies?"

### **Before v37.19.7:**
```
Sources received from backend: 4
- Source #1: Mamdani article (score 200)
- Source #2: Mamdani article (score 180)  
- Source #3: Mamdani article (score 180)
- Source #4: "Grassroots Base" (score 180) ← Still appearing!
```

### **After v37.19.7:**
```
Sources received from backend: 10-20+
- All sources mention Mamdani in title/excerpt
- Better variety (campaign, policies, voting, news)
- Source #4 filtered out (or doesn't appear in top 50)
- More comprehensive analysis possible
```

---

## 🔍 DEBUGGING

**If still seeing only 4 sources:**

```bash
# Check server logs for search behavior:
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log | grep "Searching\|Found\|articles"'
```

**Look for:**
```
👤 Searching for candidate: "Mamdani" topic: "policies campaign election"
  📊 Found XX matching articles
  ✅ Returning YY sources
```

**Should see**: "Found 50 matching articles" or more

---

## 📊 WHAT CHANGED IN CODE

### **File: `services/article-search-service.js`**

**Change 1: Increased Limit**
```javascript
// Line 179
limit: 50, // v37.19.7: Increased from 15 to get more comprehensive coverage
```

**Change 2: Better Person-Name Detection**
```javascript
// Lines 70-75
const excludeWords = [
    'what', 'when', 'where', 'which', 'policy', 'policies', 
    'voting', 'record', 'campaign', 'election', 'candidate', 
    'representative', 'senator', 'congressman', 'mayor', 'governor', 'president'
];
const personKeywords = keywords.filter(k => 
    k.length > 3 && !excludeWords.includes(k)
);
```

**Impact:**
- "Mamdani" = person name (gets bonus)
- "policies" = NOT person name (no bonus)
- More accurate scoring

---

## 🎯 NEXT PHASE: Campaign Promises Feature

After v37.19.7 is deployed and tested, we'll implement:

### **Phase 1: Data Collection (Next)**
1. ✅ Campaign website scraper (all candidates)
2. ✅ Voting record integration (Congress.gov + local)
3. ✅ Trusted investigative journalist sources

### **Phase 2: Contradiction Analysis**
1. ✅ Compare promises vs votes
2. ✅ AI analysis with facts + context
3. ✅ Both federal and state/local

### **Phase 3: Comprehensive Coverage**
1. ✅ All representatives (not just progressives)
2. ✅ Candidates without voting history (use journalism)
3. ✅ State and local officials

**Your Requirements:**
- ✅ All representatives and candidates
- ✅ All data sources (campaign sites, voting records, journalism)
- ✅ Both factual data + AI analysis
- ✅ State and local coverage

---

## 🚀 DEPLOY NOW COMMANDS

**Copy-paste ready:**

```bash
# Step 1: Navigate to project
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.7/backend"

# Step 2: Upload file
scp services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-search-service.js

# Step 3: Restart
ssh root@185.193.126.13 'sudo systemctl stop workforce-backend-b.service'
ssh root@185.193.126.13 'sudo systemctl start workforce-backend-b.service'

# Step 4: Test on https://sxcrlfyt.gensparkspace.com/
# Ask: "What are Mamdani's policies?"
# Check console for: "Sources received from backend: XX" (should be 10-20+)
```

---

**Deploy v37.19.7 now and share results! Then we'll build the campaign promises feature.** 🚀

---

*Deployment Guide v37.19.7*  
*Created: 2025-12-01*  
*Path: WDP-v37.19.7 (DYNAMIC - matches version)*
