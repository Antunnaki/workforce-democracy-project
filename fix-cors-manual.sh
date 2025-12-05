#!/bin/bash

################################################################################
# Manual CORS Fix - Safer Approach
# Date: January 18, 2025
################################################################################

echo "════════════════════════════════════════════════════════════════════════"
echo "🔧 MANUAL CORS FIX"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Restore from backup if exists
BACKUP=$(ls -t /etc/nginx/sites-enabled/workforce-backend.backup-* 2>/dev/null | head -1)
if [ -n "$BACKUP" ]; then
    echo "📦 Restoring from backup: $BACKUP"
    cp "$BACKUP" /etc/nginx/sites-enabled/workforce-backend
    echo "✅ Backup restored"
else
    echo "⚠️  No backup found - proceeding with current config"
fi

echo ""
echo "📝 Please manually edit the Nginx config file:"
echo "   nano /etc/nginx/sites-enabled/workforce-backend"
echo ""
echo "🔍 Find these lines (there are 2 occurrences):"
echo "   add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS' always;"
echo ""
echo "✏️  Change them to:"
echo "   add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;"
echo ""
echo "💾 Save: Ctrl+X, Y, Enter"
echo ""
echo "🧪 Test config:"
echo "   nginx -t"
echo ""
echo "🔄 Reload Nginx:"
echo "   systemctl reload nginx"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
