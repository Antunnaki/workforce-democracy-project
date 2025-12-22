#!/bin/bash

##########################################################
# Check Job Result on VPS
# Job ID: 19f9f181-b1d7-491e-bb1b-a777990e7e09
##########################################################

VPS_USER="root"
VPS_HOST="185.193.126.13"
JOB_ID="19f9f181-b1d7-491e-bb1b-a777990e7e09"

echo ""
echo "🔍 Checking job result on VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Job ID: $JOB_ID"
echo ""

ssh ${VPS_USER}@${VPS_HOST} << 'ENDSSH'

# Check job result
echo "📊 Fetching job result..."
echo ""

RESULT=$(curl -s "http://localhost:3002/api/civic/llm-chat/result/19f9f181-b1d7-491e-bb1b-a777990e7e09")

echo "$RESULT" | jq '.'

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Count sources
SOURCE_COUNT=$(echo "$RESULT" | jq '.result.sources | length' 2>/dev/null || echo "0")

if [ "$SOURCE_COUNT" = "null" ]; then
    echo "⏳ Job may still be processing..."
    echo ""
    echo "Check status:"
    curl -s "http://localhost:3002/api/civic/llm-chat/status/19f9f181-b1d7-491e-bb1b-a777990e7e09" | jq '.'
elif [ "$SOURCE_COUNT" -gt 0 ]; then
    echo "✅ SUCCESS! Found $SOURCE_COUNT sources"
    echo ""
    echo "📰 Sources:"
    echo "$RESULT" | jq -r '.result.sources[] | "   - \(.title) (Score: \(.relevanceScore))"' | head -10
    echo ""
    echo "📄 Response preview:"
    echo "$RESULT" | jq -r '.result.response' | head -c 500
    echo "..."
else
    echo "❌ No sources found"
    echo ""
    echo "Check backend logs:"
    echo "   tail -100 /var/log/workforce-backend-b.log"
fi

echo ""

ENDSSH

echo ""
echo "✅ Check complete!"
echo ""
