#!/bin/bash
# COMPLETE FIX DEPLOYMENT: Civic LLM Citations & Deep Research
# Version: 37.18.6

set -e  # Exit on error

echo "🚀 DEPLOYING COMPLETE CIVIC LLM FIX v37.18.6"
echo "==========================================="

# 1. Apply fix
echo ""
echo "🔧 Step 1: Applying fix to civic-llm-async.js..."
node FIX-CIVIC-LLM-COMPLETE-v37.18.6.js

# 2. Validate syntax
echo ""
echo "✅ Step 2: Validating JavaScript syntax..."
if node -c /var/www/workforce-democracy/version-b/backend/civic-llm-async.js 2>/dev/null; then
    echo "✅ Syntax valid"
else
    echo "❌ SYNTAX ERROR! Rolling back..."
    LATEST_BACKUP=$(ls -t /var/www/workforce-democracy/version-b/backend/civic-llm-async.js.backup-v37.18.6-* | head -1)
    cp "$LATEST_BACKUP" /var/www/workforce-democracy/version-b/backend/civic-llm-async.js
    echo "❌ Rollback complete. Fix failed."
    exit 1
fi

# 3. Restart backend (Version B - Test Environment)
echo ""
echo "🔄 Step 3: Restarting workforce-backend-b service (Test Environment)..."
sudo systemctl restart workforce-backend-b.service
sleep 3

# 4. Check service status
echo ""
echo "📊 Step 4: Checking service status..."
if sudo systemctl is-active --quiet workforce-backend-b.service; then
    echo "✅ Service running (Version B - Test Environment)"
else
    echo "❌ SERVICE FAILED! Check logs: tail -f /var/log/workforce-backend-b.log"
    exit 1
fi

# 5. Submit test query
echo ""
echo "🧪 Step 5: Submitting test query..."
RESPONSE=$(curl -s -X POST http://localhost:3002/api/civic/llm-chat/submit \
    -H "Content-Type: application/json" \
    -d '{
        "message": "How has Chuck Schumer voted on healthcare?",
        "context": {
            "chatType": "representatives",
            "hasRepContext": true,
            "zipCode": "12061"
        }
    }')

JOB_ID=$(echo "$RESPONSE" | jq -r '.jobId')

if [ "$JOB_ID" != "null" ] && [ -n "$JOB_ID" ]; then
    echo "✅ Test query submitted: $JOB_ID"
    echo ""
    echo "📋 Check results in 60 seconds:"
    echo "   curl -s http://localhost:3002/api/civic/llm-chat/result/$JOB_ID | jq '.'"
    echo ""
    echo "📊 Monitor logs:"
    echo "   tail -f /var/log/workforce-backend-b.log | grep -i 'sources\\|congress\\|citation'"
else
    echo "⚠️  Test query failed, but service is running"
fi

echo ""
echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE v37.18.6"
echo ""
echo "🎯 EXPECTED RESULTS:"
echo "  - Backend finds 6+ Congress.gov bills"
echo "  - Citations appear in AI response: [1], [2], [3]..."
echo "  - Frontend displays clickable superscript citations: ¹ ² ³"
echo "  - Source section shows Congress.gov bills with relevanceScore: 500"
echo ""
echo "🔵 Testing on: Version B (port 3002) - Test Environment"
echo "🟬 Frontend: https://sxcrlfyt.gensparkspace.com (uses Version B backend)"
echo ""
echo "🔍 VERIFY FIX:"
echo "  1. Wait 60 seconds for test query to complete"
echo "  2. Check result: curl -s http://localhost:3002/api/civic/llm-chat/result/$JOB_ID | jq '.'"
echo "  3. Look for 'sources' array with Congress.gov URLs"
echo "  4. Test frontend: https://sxcrlfyt.gensparkspace.com (ZIP: 12061)"
