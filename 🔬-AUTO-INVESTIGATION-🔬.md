# 🔬 AUTOMATIC INVESTIGATION - COPY AND RUN

**Copy this entire block and paste into your terminal:**

```bash
cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.11"

echo "🔬 INVESTIGATING VERSION A vs VERSION B"
echo "========================================"
echo ""

# Create investigation directory
mkdir -p version-a-investigation
cd version-a-investigation

# Download Version A files
echo "📥 Downloading Version A files..."
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/civic-llm-async.js ./version-a-civic-llm-async.js
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/rss-service.js ./version-a-rss-service.js  
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/ai-service.js ./version-a-ai-service.js
scp root@185.193.126.13:/var/www/workforce-democracy/version-a/backend/server.js ./version-a-server.js

echo ""
echo "✅ Files downloaded!"
echo ""

# Compare file sizes
echo "📊 FILE SIZE COMPARISON:"
echo "========================"
echo ""
echo "Version A files:"
wc -l version-a-*.js
echo ""
echo "Version B files (our local files):"
wc -l ../backend/civic-llm-async.js ../backend/rss-service.js ../backend/ai-service.js ../backend/server.js 2>/dev/null
echo ""

# Check for async job system
echo "🔍 CHECKING FOR ASYNC JOB SYSTEM IN VERSION A:"
echo "==============================================="
grep -n "job-queue\|jobQueue\|async" version-a-civic-llm-async.js | head -20
echo ""

# Check function calls
echo "🔍 CHECKING FUNCTION CALLS IN VERSION A:"
echo "========================================="
echo ""
echo "Does Version A call searchFeeds?"
grep -n "searchFeeds" version-a-civic-llm-async.js
echo ""
echo "Does Version A call generateResponse or analyzeWithAI?"
grep -n "generateResponse\|analyzeWithAI" version-a-civic-llm-async.js
echo ""

# Check rss-service exports
echo "🔍 CHECKING RSS-SERVICE EXPORTS:"
echo "================================"
grep -A 15 "module.exports" version-a-rss-service.js
echo ""

# Check if there's a different chat endpoint
echo "🔍 CHECKING SERVER ROUTES IN VERSION A:"
echo "========================================"
grep -n "llm-chat\|civic.*chat\|POST.*api" version-a-server.js | head -30
echo ""

# Summary
echo "📋 INVESTIGATION COMPLETE!"
echo "========================="
echo ""
echo "Files downloaded to: version-a-investigation/"
echo ""
echo "Now analyzing differences..."
echo ""

# Create a quick diff summary
echo "🔍 KEY DIFFERENCES:"
echo "==================="
echo ""
echo "1. civic-llm-async.js line count difference:"
diff <(wc -l version-a-civic-llm-async.js) <(wc -l ../backend/civic-llm-async.js) 2>/dev/null || echo "Files might be very different"
echo ""

echo "2. First 50 lines of Version A civic-llm-async.js:"
head -50 version-a-civic-llm-async.js
echo ""

echo "🎯 NEXT STEPS:"
echo "=============="
echo "1. Review the output above"
echo "2. Check if Version A has job-queue system"
echo "3. Compare function names (searchFeeds vs something else)"
echo "4. Paste ALL output above into chat for analysis"
echo ""
```

**Password you'll need to enter:** `YNWA1892LFC` (you'll enter it 4 times for the 4 file downloads)

---

## 📋 **WHAT THIS SCRIPT DOES:**

1. ✅ Downloads all key files from Version A
2. ✅ Compares file sizes between Version A and Version B
3. ✅ Searches for key functions and patterns
4. ✅ Shows you exactly what's different
5. ✅ Gives you the first 50 lines of Version A's code

---

## 🎯 **AFTER RUNNING:**

**Paste the ENTIRE output** from your terminal here, and I'll:
- Identify exactly what's different
- Figure out why your test query failed
- Create a fix that actually works
- Get the chat working properly

---

**Copy the command block above and run it now!** ⚡
