#!/bin/bash

###############################################################################
# 🚨 EMERGENCY ROLLBACK
###############################################################################
#
# The v37.18.10 fix broke the backend.
# This script restores the PREVIOUS working version.
#
# We'll use Version A (production) which is known to work
#
###############################################################################

set -e

echo ""
echo "=========================================================================="
echo "  🚨 EMERGENCY ROLLBACK - Restoring Working Backend"
echo "=========================================================================="
echo ""
echo "This will:"
echo "  1. Copy working civic-llm-async.js from Version A to Version B"
echo "  2. Restart Version B backend"
echo "  3. Restore functionality"
echo ""
echo "Press ENTER to continue..."
read

echo ""
echo "📋 Copying working file from Version A to Version B..."
ssh root@185.193.126.13 'cp /var/www/workforce-democracy/version-a/backend/civic-llm-async.js /var/www/workforce-democracy/version-b/backend/civic-llm-async.js'

echo ""
echo "🔄 Restarting Version B backend..."
ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'

echo ""
echo "⏳ Waiting 3 seconds..."
sleep 3

echo ""
echo "✅ Checking status..."
ssh root@185.193.126.13 'systemctl status workforce-backend-b.service --no-pager | head -15'

echo ""
echo "=========================================================================="
echo "  ✅ ROLLBACK COMPLETE"
echo "=========================================================================="
echo ""
echo "The backend should now be working again."
echo "The chat will still show [object Object] but at least the backend runs."
echo ""
echo "=========================================================================="
