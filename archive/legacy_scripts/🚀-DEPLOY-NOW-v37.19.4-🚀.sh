#!/bin/bash

# 🚀 DEPLOY v37.19.4 - STRICT CITATION VERIFICATION
# Quick deployment script for production (Version A)

echo "================================================"
echo "🚀 DEPLOYING v37.19.4 TO PRODUCTION"
echo "================================================"
echo ""
echo "📋 WHAT THIS FIXES:"
echo "   - AI citing sources that don't mention the subject"
echo "   - Source #4 type issues (marginal relevance)"
echo "   - Fabricated connections between sources and claims"
echo ""
echo "🔧 CHANGES:"
echo "   - MIN_RELEVANCE_FOR_LLM: 50 → 60 (stricter)"
echo "   - 3-Test Verification: Name → Topic → Claim"
echo "   - Zero-tolerance policy for citations"
echo ""
echo "================================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run as root (sudo)"
    exit 1
fi

# Backup directory
BACKUP_DIR="/var/www/workforce-democracy/version-a/backend"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "📂 Working directory: $BACKUP_DIR"
cd $BACKUP_DIR || exit 1

# Step 1: Backup current version
echo ""
echo "📦 STEP 1: Backing up current ai-service.js..."
cp ai-service.js ai-service.js.backup-v37.19.3-$TIMESTAMP
echo "   ✅ Backup created: ai-service.js.backup-v37.19.3-$TIMESTAMP"

# Step 2: Copy from Version B
echo ""
echo "📋 STEP 2: Copying updated ai-service.js from Version B..."
cp /var/www/workforce-democracy/version-b/backend/ai-service.js ./ai-service.js
echo "   ✅ File copied"

# Verify file exists
if [ ! -f "ai-service.js" ]; then
    echo "   ❌ ERROR: ai-service.js not found!"
    exit 1
fi

# Step 3: Verify version
echo ""
echo "🔍 STEP 3: Verifying version..."
VERSION_CHECK=$(grep "v37.19.4" ai-service.js)
if [ -z "$VERSION_CHECK" ]; then
    echo "   ⚠️  WARNING: v37.19.4 not found in file!"
    echo "   File might not be the correct version."
    read -p "   Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "   ❌ Deployment cancelled"
        exit 1
    fi
else
    echo "   ✅ Version v37.19.4 confirmed in file"
fi

# Step 4: Restart service
echo ""
echo "🔄 STEP 4: Restarting workforce-backend-a.service..."
systemctl restart workforce-backend-a.service
sleep 2

# Step 5: Check service status
echo ""
echo "📊 STEP 5: Checking service status..."
systemctl status workforce-backend-a.service --no-pager -l | head -10

# Step 6: Verify logs
echo ""
echo "📝 STEP 6: Checking logs for v37.19.4..."
tail -50 /var/log/workforce-backend-a.log | grep "v37.19"

# Final status
echo ""
echo "================================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "================================================"
echo ""
echo "🧪 NEXT STEPS:"
echo "   1. Go to: https://workforcedemocracyproject.org/"
echo "   2. Ask: 'What are Mamdani's policies?'"
echo "   3. Verify:"
echo "      ✅ 3-4 highly relevant sources"
echo "      ✅ All sources mention 'Mamdani'"
echo "      ✅ No Source #4 type issues"
echo "      ✅ Perfect citation match"
echo "      ✅ 10-12 second response time"
echo ""
echo "🔍 MONITORING:"
echo "   tail -f /var/log/workforce-backend-a.log"
echo ""
echo "🔙 ROLLBACK (if needed):"
echo "   sudo cp ai-service.js.backup-v37.19.3-$TIMESTAMP ai-service.js"
echo "   sudo systemctl restart workforce-backend-a.service"
echo ""
echo "================================================"
