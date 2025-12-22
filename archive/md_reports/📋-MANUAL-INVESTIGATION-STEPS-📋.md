# 📋 MANUAL INVESTIGATION - VERSION A vs VERSION B

**Goal:** Understand what Version A (production) is actually doing that works

**Password:** `YNWA1892LFC`

---

## 🔍 **STEP 1: Download Version A Files**

Run these commands one by one:

```bash
# Create investigation directory
mkdir -p version-a-investigation
cd version-a-investigation

# Download civic-llm-async.js from Version A
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/civic-llm-async.js ./version-a-civic-llm-async.js

# Download rss-service.js from Version A
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/rss-service.js ./version-a-rss-service.js

# Download ai-service.js from Version A
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/ai-service.js ./version-a-ai-service.js

# Download server.js from Version A
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/server.js ./version-a-server.js
```

---

## 🔍 **STEP 2: Check What Files Exist in Version A**

```bash
ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/version-a/backend/*.js | grep -v node_modules'
```

This will show us ALL .js files in Version A backend.

---

## 🔍 **STEP 3: Compare File Sizes**

```bash
# Check line counts
wc -l version-a-*.js
```

This tells us if the files are similar sizes or completely different.

---

## 🔍 **STEP 4: Search for Key Functions**

```bash
# Check if Version A uses searchFeeds
grep -n "searchFeeds" version-a-civic-llm-async.js

# Check if Version A uses generateResponse or analyzeWithAI
grep -n "generateResponse\|analyzeWithAI" version-a-civic-llm-async.js

# Check what rss-service exports in Version A
grep -n "module.exports" version-a-rss-service.js
```

---

## 🔍 **STEP 5: Check Version A Logs**

```bash
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-a.log | grep -i "llm\|chat\|search\|mamdani"'
```

This shows what Version A is actually doing in production.

---

## 🔍 **STEP 6: Test Version A Directly**

```bash
# SSH into server
ssh root@185.193.126.13

# Test Version A backend directly
curl -X POST http://localhost:3001/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Has Mamdani been moving to the right?","context":"representativeAnalysis","chatType":"representatives"}'
```

This will show us what Version A actually returns.

---

## 📊 **EXPECTED FINDINGS:**

### **Scenario 1: Version A doesn't have civic-llm-async.js**
- Version A might use a completely different file structure
- Async job system might be Version B only
- Version A might have synchronous LLM chat

### **Scenario 2: Version A has civic-llm-async.js but different code**
- Functions might have different names
- Implementation might be older/simpler
- Might not use job queue at all

### **Scenario 3: Version A and B are supposed to be identical**
- Our changes broke Version B
- Need to revert Version B to match Version A
- Then carefully apply fixes one at a time

---

## 🎯 **AFTER INVESTIGATION:**

Once you've downloaded the Version A files and run the commands above, **paste the outputs here** and I'll:

1. Analyze the differences
2. Identify why Version A might work better (or differently)
3. Create a plan to either:
   - Fix Version B to match Version A's working approach, OR
   - Revert Version B and carefully apply only necessary fixes

---

## ⚡ **QUICK START (Run All at Once):**

If you want to run all investigation commands at once:

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.11"

# Create investigation directory
mkdir -p version-a-investigation
cd version-a-investigation

# Download all files
echo "Downloading Version A files..."
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/civic-llm-async.js ./version-a-civic-llm-async.js
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/rss-service.js ./version-a-rss-service.js  
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/ai-service.js ./version-a-ai-service.js
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/server.js ./version-a-server.js

# Check file sizes
echo ""
echo "File sizes:"
wc -l version-a-*.js

# Search for key functions
echo ""
echo "Searching for key functions in civic-llm-async.js:"
grep -n "searchFeeds\|generateResponse\|analyzeWithAI" version-a-civic-llm-async.js | head -20

echo ""
echo "Checking rss-service exports:"
grep -A 10 "module.exports" version-a-rss-service.js

echo ""
echo "Investigation complete! Files saved to version-a-investigation/"
```

---

**Run the Quick Start commands and paste the output here!** 🚀
