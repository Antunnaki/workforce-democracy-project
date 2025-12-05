#!/bin/bash
#
# AUTOMATED DEPLOYMENT SCRIPT - Deep Research v37.18.3-ENHANCED
# 
# This script deploys the enhanced Deep Research module to Version B backend
# and tests the Congress.gov integration.
#
# Usage (run on VPS after uploading deep-research-v37.18.3-ENHANCED.js):
#   chmod +x DEPLOY-v37.18.3-AUTO.sh
#   ./DEPLOY-v37.18.3-AUTO.sh
#
# ============================================================================

set -e  # Exit on any error

echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 Deep Research v37.18.3-ENHANCED Deployment"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/version-b/backend
echo "✅ Working directory: $(pwd)"
echo ""

# ============================================================================
# STEP 1: Backup current deep-research module
# ============================================================================
echo "📦 STEP 1: Backing up current deep-research.js..."
BACKUP_FILE="deep-research-BACKUP-v37.18.2-$(date +%Y%m%d-%H%M%S).js"
cp deep-research.js "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# ============================================================================
# STEP 2: Deploy enhanced version
# ============================================================================
echo "🔄 STEP 2: Deploying deep-research-v37.18.3-ENHANCED.js..."
if [ ! -f "deep-research-v37.18.3-ENHANCED.js" ]; then
    echo "   ❌ ERROR: deep-research-v37.18.3-ENHANCED.js not found!"
    echo "   Please upload it first using:"
    echo "   scp deep-research-v37.18.3-ENHANCED.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/"
    exit 1
fi

cp deep-research-v37.18.3-ENHANCED.js deep-research.js
echo "   ✅ Deployed: deep-research.js"
echo ""

# ============================================================================
# STEP 3: Syntax check
# ============================================================================
echo "🔍 STEP 3: Checking syntax..."
if node -c deep-research.js; then
    echo "   ✅ Syntax check PASSED"
else
    echo "   ❌ Syntax check FAILED!"
    echo "   Rolling back..."
    cp "$BACKUP_FILE" deep-research.js
    exit 1
fi
echo ""

# ============================================================================
# STEP 4: Restart backend service
# ============================================================================
echo "🔄 STEP 4: Restarting workforce-backend-b.service..."
sudo systemctl restart workforce-backend-b.service
echo "   ⏳ Waiting 5 seconds for MongoDB connection..."
sleep 5
echo ""

# ============================================================================
# STEP 5: Check service status
# ============================================================================
echo "🔍 STEP 5: Checking service status..."
if systemctl is-active --quiet workforce-backend-b.service; then
    echo "   ✅ Service is ACTIVE"
    systemctl status workforce-backend-b.service --no-pager | head -15
else
    echo "   ❌ Service FAILED to start!"
    echo "   Checking logs:"
    tail -50 /var/log/workforce-backend-b.log
    exit 1
fi
echo ""

# ============================================================================
# STEP 6: Submit test query
# ============================================================================
echo "📤 STEP 6: Submitting Deep Research test query..."
echo "   Query: 'How has Chuck Schumer voted on healthcare?'"
echo ""

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

if [ "$JOB_ID" == "null" ] || [ -z "$JOB_ID" ]; then
    echo "   ❌ Failed to submit job!"
    exit 1
fi

echo ""
echo "   ✅ Job submitted: $JOB_ID"
echo "   ⏳ Waiting 30 seconds for Deep Research to complete..."
echo ""

# Progress bar
for i in {1..30}; do
    echo -n "▓"
    sleep 1
done
echo ""
echo ""

# ============================================================================
# STEP 7: Check results
# ============================================================================
echo "📥 STEP 7: Checking Deep Research results..."
echo ""

RESULT=$(curl -s "http://localhost:3002/api/civic/llm-chat/result/$JOB_ID")

# Check if job completed
STATUS=$(echo "$RESULT" | jq -r '.status')
if [ "$STATUS" != "completed" ]; then
    echo "   ⚠️  Job status: $STATUS"
    echo "   Full response:"
    echo "$RESULT" | jq '.'
    exit 1
fi

# Check source count
SOURCE_COUNT=$(echo "$RESULT" | jq -r '.result.metadata.sourceCount // 0')
echo "   📊 Source count: $SOURCE_COUNT"
echo ""

if [ "$SOURCE_COUNT" -eq 0 ]; then
    echo "   ❌ WARNING: No sources found!"
    echo "   Checking logs for errors:"
    echo ""
    tail -100 /var/log/workforce-backend-b.log | grep -i "deep research\|congress.gov\|error" | tail -20
    echo ""
    echo "   Full result metadata:"
    echo "$RESULT" | jq '.result.metadata'
else
    echo "   ✅ SUCCESS: Found $SOURCE_COUNT sources!"
    echo ""
    echo "   📋 Sources:"
    echo "$RESULT" | jq '.result.sources[] | {title, url, type}'
    echo ""
fi

# ============================================================================
# STEP 8: Check logs for Deep Research activity
# ============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "📋 STEP 8: Deep Research Log Summary"
echo "═══════════════════════════════════════════════════════════════"
echo ""
tail -100 /var/log/workforce-backend-b.log | grep -i "deep research\|congress.gov\|found.*bills\|formatted.*bills" | tail -10
echo ""

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📊 Results Summary:"
echo "   • Job ID: $JOB_ID"
echo "   • Status: $STATUS"
echo "   • Sources found: $SOURCE_COUNT"
echo ""

if [ "$SOURCE_COUNT" -gt 0 ]; then
    echo "🎉 SUCCESS! Deep Research is working with enhanced Congress.gov sources!"
    echo ""
    echo "🌐 Next Steps:"
    echo "   1. Test on GenSpark: https://sxcrlfyt.gensparkspace.com"
    echo "   2. Enter ZIP: 12061"
    echo "   3. Ask: 'How has Chuck Schumer voted on healthcare?'"
    echo "   4. Expect: Congress.gov bill citations with URLs"
    echo ""
    echo "📝 To view full result:"
    echo "   curl \"http://localhost:3002/api/civic/llm-chat/result/$JOB_ID\" | jq '.result.response' | head -100"
    echo ""
else
    echo "⚠️  Deep Research deployed but no sources found."
    echo "   This may be expected if Congress.gov returned no matching bills."
    echo "   Check the logs above for API errors."
    echo ""
    echo "🔄 To rollback:"
    echo "   cp $BACKUP_FILE deep-research.js"
    echo "   sudo systemctl restart workforce-backend-b.service"
    echo ""
fi

echo "═══════════════════════════════════════════════════════════════"
