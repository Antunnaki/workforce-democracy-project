#!/bin/bash

# ============================================================================
# DIRECT FIX for v37.7.0 - Copy-paste this entire script into your terminal
# ============================================================================

cd /var/www/workforce-democracy/backend

echo "🚀 Applying v37.7.0 - Direct Fix"
echo ""

# Create backup
BACKUP_FILE="ai-service-BACKUP-before-fix-$(date +%Y%m%d-%H%M%S).js"
cp ai-service.js "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"

# Find the line number of the return statement
RETURN_LINE=$(grep -n "return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;" ai-service.js | cut -d: -f1)

echo "Found return statement at line $RETURN_LINE"

# Create a temporary file with the fix
cat > /tmp/fix_policy_keywords.txt << 'EOF'
    // Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1
    const isPolicyQuery = messageLower.match(
        /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/
    );
    
    return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPolicyQuery;
EOF

# Replace the return line with the fix
sed -i "${RETURN_LINE}r /tmp/fix_policy_keywords.txt" ai-service.js
sed -i "${RETURN_LINE}d" ai-service.js

echo "✅ Policy keywords added"

# Test syntax
if node -c ai-service.js 2>/dev/null; then
    echo "✅ Syntax is valid!"
    echo ""
    echo "🔄 Restarting PM2..."
    pm2 restart backend
    echo ""
    echo "✅ Fix applied! Check logs:"
    echo "   pm2 logs backend --lines 30"
else
    echo "❌ Syntax error! Restoring backup..."
    cp "$BACKUP_FILE" ai-service.js
    exit 1
fi
