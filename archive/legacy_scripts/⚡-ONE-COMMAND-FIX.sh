#!/bin/bash
# ⚡ ONE-COMMAND FIX for v37.7.0 - Copy and paste this entire block

cd /var/www/workforce-democracy/backend && \
cp ai-service.js "ai-service-BACKUP-$(date +%Y%m%d-%H%M%S).js" && \
RETURN_LINE=$(grep -n "return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;" ai-service.js | cut -d: -f1) && \
sed -i "${RETURN_LINE}i\\    // Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1\\n    const isPolicyQuery = messageLower.match(\\n        /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/\\n    );\\n" ai-service.js && \
sed -i "${RETURN_LINE}s/return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;/return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPolicyQuery;/" ai-service.js && \
node -c ai-service.js && \
pm2 restart backend && \
echo "✅ Fix applied! Backend restarted." && \
pm2 logs backend --lines 20
