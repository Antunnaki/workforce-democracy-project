#!/bin/bash
# Just check source count
echo ""
echo "🔍 Checking sources..."
echo ""
ssh root@185.193.126.13 << 'EOF'
RESULT=$(curl -s "http://localhost:3002/api/civic/llm-chat/result/19f9f181-b1d7-491e-bb1b-a777990e7e09")

# Check if job completed
STATUS=$(echo "$RESULT" | jq -r '.status // "unknown"' 2>/dev/null)

if [ "$STATUS" = "unknown" ]; then
    echo "📊 Job Result:"
    echo "$RESULT" | jq '.'
    echo ""
    
    # Count sources
    SOURCE_COUNT=$(echo "$RESULT" | jq '.result.sources | length' 2>/dev/null)
    
    if [ "$SOURCE_COUNT" != "null" ] && [ "$SOURCE_COUNT" != "" ]; then
        echo "✅ Found $SOURCE_COUNT sources"
        echo ""
        echo "📰 Source titles:"
        echo "$RESULT" | jq -r '.result.sources[].title' 2>/dev/null | head -10
        echo ""
        echo "📄 Response preview:"
        echo "$RESULT" | jq -r '.result.response' 2>/dev/null | head -c 500
        echo "..."
    else
        echo "❌ No sources found or job still pending"
    fi
else
    echo "⏳ Job status: $STATUS"
    echo ""
    echo "Full response:"
    echo "$RESULT" | jq '.'
fi
EOF
echo ""
