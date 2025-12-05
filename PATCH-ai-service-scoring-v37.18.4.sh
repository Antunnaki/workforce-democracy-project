#!/bin/bash
#
# PATCH: ai-service.js Scoring Function - v37.18.4
# 
# This patches the scoreSourceRelevance function to:
# 1. Check description and content fields (not just title/excerpt)
# 2. Give massive bonus to .gov domains and congress_bill type
# 3. Prevent Congress.gov bills from being filtered out
#
# ============================================================================

set -e

cd /var/www/workforce-democracy/version-b/backend

echo "═══════════════════════════════════════════════════════════════"
echo "  🔧 Patching ai-service.js Scoring Function - v37.18.4"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Backup
echo "📦 Backing up ai-service.js..."
cp ai-service.js ai-service-BACKUP-before-scoring-patch-$(date +%Y%m%d-%H%M%S).js
echo "   ✅ Backup created"
echo ""

# ============================================================================
# PATCH 1: Add description and content to combined search text
# ============================================================================
echo "🔧 PATCH 1: Adding description/content fields to scoring..."

# Find line 890 (const combined = ...) and replace it
sed -i "890s|.*|    const descriptionLower = (source.description || '').toLowerCase();\n    const contentLower = (source.content || '').toLowerCase();\n    const combined = \`\${titleLower} \${excerptLower} \${descriptionLower} \${contentLower}\`;|" ai-service.js

echo "   ✅ Added description and content to combined text"
echo ""

# ============================================================================
# PATCH 2: Add government source bonus BEFORE topic filtering
# ============================================================================
echo "🔧 PATCH 2: Adding government source bonus..."

# Insert after line 910 (after music filter, before base score)
sed -i '910 a\
    // ==================================================================\
    // GOVERNMENT SOURCE BONUS (v37.18.4)\
    // ==================================================================\
    // Congress.gov bills and .gov sources are PRIMARY SOURCES\
    const isGovSource = (source.url && (\
        source.url.includes("congress.gov") ||\
        source.url.includes(".gov") ||\
        source.url.includes("senate.gov") ||\
        source.url.includes("house.gov")\
    ));\
    \
    const isCongressBill = source.type === "congress_bill" || source.metadata?.billNumber;\
    \
    // MASSIVE bonus for government sources to override topic filters\
    if (isGovSource || isCongressBill) {\
        console.log(\`  🏛️  Government source detected: "${source.title?.substring(0, 50)}..."\`);\
        return 500; // GUARANTEED to pass threshold (bypasses all filters)\
    }\
' ai-service.js

echo "   ✅ Added government source bonus (+500 score)"
echo ""

# ============================================================================
# Verify changes
# ============================================================================
echo "🔍 Verifying patches..."

# Check if description/content are now in combined
if grep -q "descriptionLower" ai-service.js && grep -q "contentLower" ai-service.js; then
    echo "   ✅ Patch 1 applied: description/content fields added"
else
    echo "   ❌ Patch 1 FAILED"
    exit 1
fi

# Check if government source bonus exists
if grep -q "GOVERNMENT SOURCE BONUS" ai-service.js && grep -q "isCongressBill" ai-service.js; then
    echo "   ✅ Patch 2 applied: government source bonus added"
else
    echo "   ❌ Patch 2 FAILED"
    exit 1
fi

# Syntax check
echo ""
echo "🔍 Checking syntax..."
if node -c ai-service.js; then
    echo "   ✅ Syntax check PASSED"
else
    echo "   ❌ Syntax check FAILED - Rolling back..."
    cp ai-service-BACKUP-before-scoring-patch-*.js ai-service.js
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ PATCHES APPLIED SUCCESSFULLY"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🔄 Restarting backend..."
sudo systemctl restart workforce-backend-b.service
sleep 5

echo ""
echo "🔍 Checking service status..."
systemctl status workforce-backend-b.service --no-pager | head -15

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  🎯 READY TO TEST"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "Run this test command:"
echo ""
echo 'curl -X POST "http://localhost:3002/api/civic/llm-chat/submit" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"message": "How has Chuck Schumer voted on healthcare?", "context": {"page": "civic-platform", "section": "my-representatives", "viewingContent": {"type": "representative", "name": "Charles E. Schumer", "state": "NY", "chamber": "senate"}}}'"'"' | jq '"'"'.jobId'"'"
echo ""
echo "Then wait 30 seconds and check result with:"
echo 'curl "http://localhost:3002/api/civic/llm-chat/result/JOBID" | jq '"'"'.result.sources[] | {title, url}'"'"
echo ""
