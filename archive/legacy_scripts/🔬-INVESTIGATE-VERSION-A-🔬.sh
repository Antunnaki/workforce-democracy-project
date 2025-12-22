#!/bin/bash
# Investigation Script - Compare Version A vs Version B
# This will download key files from Version A and compare them

echo "🔬 INVESTIGATING VERSION A vs VERSION B"
echo "========================================"
echo ""

# SSH credentials
HOST="root@185.193.126.13"
PASSWORD="YNWA1892LFC"

echo "📥 Step 1: Downloading Version A files for comparison..."
echo ""

# Create comparison directory
mkdir -p version-a-investigation
cd version-a-investigation

echo "Downloading civic-llm-async.js from Version A..."
scp ${HOST}:/var/www/workforce-democracy/version-a/backend/civic-llm-async.js ./version-a-civic-llm-async.js

echo "Downloading job-queue-service.js from Version A..."
scp ${HOST}:/var/www/workforce-democracy/version-a/backend/job-queue-service.js ./version-a-job-queue-service.js 2>/dev/null || echo "File not found (might not exist)"

echo "Downloading rss-service.js from Version A..."
scp ${HOST}:/var/www/workforce-democracy/version-a/backend/rss-service.js ./version-a-rss-service.js

echo "Downloading ai-service.js from Version A..."
scp ${HOST}:/var/www/workforce-democracy/version-a/backend/ai-service.js ./version-a-ai-service.js

echo ""
echo "📊 Step 2: Comparing file sizes..."
echo ""

echo "Version A civic-llm-async.js:"
wc -l version-a-civic-llm-async.js 2>/dev/null || echo "File not downloaded"

echo "Version A rss-service.js:"
wc -l version-a-rss-service.js 2>/dev/null || echo "File not downloaded"

echo "Version A ai-service.js:"
wc -l version-a-ai-service.js 2>/dev/null || echo "File not downloaded"

echo ""
echo "🔍 Step 3: Checking for key differences..."
echo ""

# Check if civic-llm-async.js exists in Version A
if [ -f version-a-civic-llm-async.js ]; then
    echo "✅ Version A has civic-llm-async.js"
    echo "   Checking for key functions..."
    grep -n "searchFeeds\|generateResponse\|analyzeWithAI" version-a-civic-llm-async.js | head -10
else
    echo "❌ Version A does NOT have civic-llm-async.js"
    echo "   This means Version A uses a different file structure!"
fi

echo ""
echo "🔍 Step 4: Checking what endpoints Version A actually uses..."
echo ""

# List all .js files in Version A backend
echo "Files in Version A backend directory:"
ssh ${HOST} 'ls -lh /var/www/workforce-democracy/version-a/backend/*.js' | grep -v node_modules

echo ""
echo "🔍 Step 5: Checking server.js for routing..."
echo ""

echo "Downloading server.js from Version A..."
scp ${HOST}:/var/www/workforce-democracy/version-a/backend/server.js ./version-a-server.js

if [ -f version-a-server.js ]; then
    echo "Checking how Version A routes LLM chat requests..."
    grep -n "llm-chat\|civic.*chat" version-a-server.js | head -20
fi

echo ""
echo "📋 INVESTIGATION COMPLETE"
echo "========================="
echo ""
echo "Files downloaded to: ./version-a-investigation/"
echo ""
echo "Next steps:"
echo "1. Compare version-a-civic-llm-async.js with our local backend/civic-llm-async.js"
echo "2. Check if Version A uses a completely different approach"
echo "3. Identify what's actually working in production"
echo ""
echo "Run this to see the comparison directory:"
echo "cd version-a-investigation && ls -lh"
