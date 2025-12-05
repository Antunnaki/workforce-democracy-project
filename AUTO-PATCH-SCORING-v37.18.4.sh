#!/bin/bash
#
# AUTO-PATCH: ai-service.js Scoring Function - v37.18.4
# 
# This automatically patches the scoreSourceRelevance function using sed
# to recognize Congress.gov bills and give them high scores
#
# ============================================================================

set -e

cd /var/www/workforce-democracy/version-b/backend

echo "═══════════════════════════════════════════════════════════════"
echo "  🔧 Auto-Patching ai-service.js Scoring - v37.18.4"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Backup
echo "📦 Creating backup..."
BACKUP_FILE="ai-service-BACKUP-before-scoring-patch-$(date +%Y%m%d-%H%M%S).js"
cp ai-service.js "$BACKUP_FILE"
echo "   ✅ Backup: $BACKUP_FILE"
echo ""

# ============================================================================
# PATCH 1: Add description and content to combined text (line 890)
# ============================================================================
echo "🔧 PATCH 1: Adding description/content fields..."

# Find the exact line with: const combined = `${titleLower} ${excerptLower}`;
# Replace it with extended version including description and content

sed -i '/const combined = `\${titleLower} \${excerptLower}`;/c\    const descriptionLower = (source.description || '"'"''"'"').toLowerCase();\n    const contentLower = (source.content || '"'"''"'"').toLowerCase();\n    const combined = `${titleLower} ${excerptLower} ${descriptionLower} ${contentLower}`;' ai-service.js

echo "   ✅ Added description and content to combined text"
echo ""

# ============================================================================
# PATCH 2: Add government source bonus
# ============================================================================
echo "🔧 PATCH 2: Adding government source bonus..."

# Create the government source bonus code block
cat > /tmp/gov-source-bonus.txt << 'EOF'
    
    // ==================================================================
    // GOVERNMENT SOURCE BONUS (v37.18.4)
    // ==================================================================
    // Congress.gov bills and .gov sources are PRIMARY SOURCES
    // Give them GUARANTEED high score to bypass topic filters
    const isGovSource = (source.url && (
        source.url.includes('congress.gov') ||
        source.url.includes('.gov') ||
        source.url.includes('senate.gov') ||
        source.url.includes('house.gov')
    ));
    
    const isCongressBill = source.type === 'congress_bill' || source.metadata?.billNumber;
    
    // MASSIVE bonus for government sources to override topic filters
    if (isGovSource || isCongressBill) {
        console.log(`  🏛️  GOVERNMENT SOURCE: "${source.title?.substring(0, 50)}..." → SCORE: 500`);
        return 500; // GUARANTEED to pass threshold (threshold is 30)
    }
    
EOF

# Insert the government source bonus BEFORE "let score = 100;"
# This ensures .gov sources bypass all topic-specific filters
sed -i '/let score = 100; \/\/ Base score/r /tmp/gov-source-bonus.txt' ai-service.js

echo "   ✅ Added government source bonus (+500 for .gov domains)"
echo ""

# ============================================================================
# Verify patches
# ============================================================================
echo "🔍 Verifying patches..."

# Check PATCH 1
if grep -q "descriptionLower" ai-service.js && grep -q "contentLower" ai-service.js; then
    echo "   ✅ PATCH 1 verified: description/content fields added"
else
    echo "   ❌ PATCH 1 FAILED!"
    echo "   Rolling back..."
    cp "$BACKUP_FILE" ai-service.js
    exit 1
fi

# Check PATCH 2
if grep -q "GOVERNMENT SOURCE BONUS (v37.18.4)" ai-service.js && grep -q "isCongressBill" ai-service.js; then
    echo "   ✅ PATCH 2 verified: government source bonus added"
else
    echo "   ❌ PATCH 2 FAILED!"
    echo "   Rolling back..."
    cp "$BACKUP_FILE" ai-service.js
    exit 1
fi

# Syntax check
echo ""
echo "🔍 Checking syntax..."
if node -c ai-service.js; then
    echo "   ✅ Syntax check PASSED"
else
    echo "   ❌ Syntax check FAILED!"
    echo "   Rolling back..."
    cp "$BACKUP_FILE" ai-service.js
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ PATCHES APPLIED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# ============================================================================
# Restart backend
# ============================================================================
echo "🔄 Restarting backend service..."
sudo systemctl restart workforce-backend-b.service
sleep 5

systemctl status workforce-backend-b.service --no-pager | head -15

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎯 TESTING DEEP RESEARCH WITH PATCHED SCORING"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Submit test query
echo "📤 Submitting test query..."
RESPONSE=$(curl -s -X POST "http://localhost:3002/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How has Chuck Schumer voted on healthcare?",
    "context": {
      "page": "civic-platform",
      "section": "my-representatives",
      "viewingContent": {
        "type": "representative",
        "name": "Charles E. Schumer",
        "state": "NY",
        "chamber": "senate"
      }
    }
  }')

echo "$RESPONSE" | jq '.'
JOB_ID=$(echo "$RESPONSE" | jq -r '.jobId')

echo ""
echo "   ✅ Job submitted: $JOB_ID"
echo "   ⏳ Waiting 30 seconds for Deep Research..."
echo ""

# Progress bar
for i in {1..30}; do
    echo -n "▓"
    sleep 1
done
echo ""
echo ""

# Check result
echo "📥 Checking results..."
RESULT=$(curl -s "http://localhost:3002/api/civic/llm-chat/result/$JOB_ID")

SOURCE_COUNT=$(echo "$RESULT" | jq -r '.result.metadata.sourceCount // 0')
echo "   📊 Source count: $SOURCE_COUNT"
echo ""

if [ "$SOURCE_COUNT" -gt 0 ]; then
    echo "   🎉 SUCCESS! Found $SOURCE_COUNT sources"
    echo ""
    echo "   📋 Sources:"
    echo "$RESULT" | jq '.result.sources[] | {title, url, type}'
    echo ""
    echo "   🏛️  Government source logs:"
    tail -100 /var/log/workforce-backend-b.log | grep "GOVERNMENT SOURCE" | tail -10
else
    echo "   ⚠️  No sources found"
    echo "   Checking logs:"
    tail -100 /var/log/workforce-backend-b.log | grep -i "congress\|government\|score\|removed sources" | tail -20
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ PATCH COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""

if [ "$SOURCE_COUNT" -gt 0 ]; then
    echo "🎯 Next: Test on GenSpark"
    echo "   https://sxcrlfyt.gensparkspace.com"
    echo "   ZIP: 12061"
    echo "   Ask: 'How has Chuck Schumer voted on healthcare?'"
else
    echo "🔄 To rollback:"
    echo "   cp $BACKUP_FILE ai-service.js"
    echo "   sudo systemctl restart workforce-backend-b.service"
fi

echo ""
