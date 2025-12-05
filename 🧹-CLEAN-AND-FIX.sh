#!/bin/bash

cd /var/www/workforce-democracy/backend

echo "🧹 Cleaning up and applying proper fix..."
echo ""

# Step 1: Restore from the most recent GOOD backup (before we started messing with it)
echo "📦 Looking for clean backup..."
CLEAN_BACKUP=$(ls -t ai-service-BACKUP-20*.js 2>/dev/null | head -1)

if [ -n "$CLEAN_BACKUP" ]; then
    echo "Found clean backup: $CLEAN_BACKUP"
    cp "$CLEAN_BACKUP" ai-service.js
    echo "✅ Restored clean version"
else
    echo "❌ No clean backup found!"
    exit 1
fi

echo ""
echo "📝 Verifying clean state..."
grep -A 5 "return hasTemporalIndicator" ai-service.js | head -10
echo ""

# Step 2: Find the correct line number
RETURN_LINE=$(grep -n "return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;" ai-service.js | cut -d: -f1)

if [ -z "$RETURN_LINE" ]; then
    echo "❌ Could not find return statement!"
    exit 1
fi

echo "Found return statement at line: $RETURN_LINE"
echo ""

# Step 3: Create new backup
cp ai-service.js ai-service-BACKUP-clean-fix-$(date +%Y%m%d-%H%M%S).js

# Step 4: Insert policy keywords BEFORE the return line
sed -i "${RETURN_LINE}i\\    // Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1\\n    const isPolicyQuery = messageLower.match(\\n        /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/\\n    );\\n" ai-service.js

# Step 5: Update the return statement
NEW_RETURN_LINE=$((RETURN_LINE + 4))
sed -i "${NEW_RETURN_LINE}s/return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;/return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPolicyQuery;/" ai-service.js

# Step 6: Verify
echo "🔍 Verifying changes..."
echo "Lines $((RETURN_LINE - 2)) to $((NEW_RETURN_LINE + 2)):"
sed -n "$((RETURN_LINE - 2)),$((NEW_RETURN_LINE + 2))p" ai-service.js | cat -n
echo ""

# Step 7: Test syntax
if node -c ai-service.js 2>/dev/null; then
    echo "✅ Syntax valid!"
    pm2 restart backend
    echo "✅ Backend restarted!"
    echo ""
    pm2 logs backend --lines 30
else
    echo "❌ Syntax error! Restoring backup..."
    cp ai-service-BACKUP-clean-fix-*.js ai-service.js
    node -c ai-service.js
fi
