#!/bin/bash
# Quick result checker for latest test query

LATEST_JOB=$(tail -100 /var/log/workforce-backend-b.log | grep "Processing job" | tail -1 | grep -o '[a-f0-9-]\{36\}')

if [ -z "$LATEST_JOB" ]; then
    echo "❌ No recent job found in logs"
    echo ""
    echo "💡 TIP: Provide job ID manually:"
    echo "   ./CHECK-RESULT.sh <job-id>"
    if [ -n "$1" ]; then
        LATEST_JOB="$1"
        echo ""
        echo "Using provided job ID: $LATEST_JOB"
    else
        exit 1
    fi
fi

echo "🔍 Checking job: $LATEST_JOB"
echo ""

RESULT=$(curl -s "http://localhost:3002/api/civic/llm-chat/result/$LATEST_JOB")

echo "📊 STATUS:"
echo "$RESULT" | jq -r '.status // "unknown"'

echo ""
echo "📚 SOURCE COUNT:"
echo "$RESULT" | jq -r '.sources | length // 0'

echo ""
echo "🏛️  CONGRESS.GOV SOURCES:"
echo "$RESULT" | jq -r '.sources[] | select(.url | contains("congress.gov")) | "  - [\(.relevanceScore)] \(.title)"'

echo ""
echo "📝 RESPONSE PREVIEW:"
echo "$RESULT" | jq -r '.response' | head -3

echo ""
echo "🔢 CITATIONS IN RESPONSE:"
echo "$RESULT" | jq -r '.response' | grep -o '\[[0-9]\+\]' | sort -u

echo ""
echo "✅ Full result available at:"
echo "   curl -s http://localhost:3002/api/civic/llm-chat/result/$LATEST_JOB | jq '.'"
