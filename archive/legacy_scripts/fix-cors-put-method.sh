#!/bin/bash

################################################################################
# Fix CORS - Add PUT Method
# Purpose: Allow PUT method for personalization sync endpoint
# Date: January 18, 2025
################################################################################

echo "════════════════════════════════════════════════════════════════════════"
echo "🔧 FIXING CORS - ADDING PUT METHOD"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Backup Nginx config
echo "📦 Creating backup of Nginx config..."
cp /etc/nginx/sites-enabled/workforce-backend /etc/nginx/sites-enabled/workforce-backend.backup-$(date +%Y%m%d-%H%M%S)

# Check current CORS configuration
echo "📋 Current CORS methods:"
grep "Access-Control-Allow-Methods" /etc/nginx/sites-enabled/workforce-backend || echo "   (Not found - will add)"
echo ""

# Update CORS to include PUT method
echo "🔧 Updating CORS configuration to allow PUT..."

# Use sed to update the Access-Control-Allow-Methods line
sed -i 's/Access-Control-Allow-Methods.*/add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;/' /etc/nginx/sites-enabled/workforce-backend

# If the line doesn't exist, we need to add it manually
if ! grep -q "Access-Control-Allow-Methods" /etc/nginx/sites-enabled/workforce-backend; then
    echo "⚠️  CORS methods line not found in config!"
    echo "   Please manually add this line to your Nginx config:"
    echo "   add_header Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS\" always;"
    echo ""
    echo "   Location: /etc/nginx/sites-enabled/workforce-backend"
    echo "   In the 'location /' block"
    exit 1
fi

echo "✅ CORS configuration updated"
echo ""

# Test Nginx configuration
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration test passed"
    echo ""
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    echo "✅ Nginx reloaded successfully"
else
    echo "❌ Nginx configuration test failed!"
    echo "   Restoring backup..."
    cp /etc/nginx/sites-enabled/workforce-backend.backup-* /etc/nginx/sites-enabled/workforce-backend
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "✅ CORS FIX COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📋 Updated CORS methods:"
grep "Access-Control-Allow-Methods" /etc/nginx/sites-enabled/workforce-backend
echo ""
echo "🧪 Test the sync endpoint:"
echo "   curl -X PUT https://api.workforcedemocracyproject.org/api/personalization/sync \\"
echo "     -H 'Origin: https://sxcrlfyt.gensparkspace.com' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"test\"}' -v"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
