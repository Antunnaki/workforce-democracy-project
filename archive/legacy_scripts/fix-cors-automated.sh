#!/bin/bash

# Automated CORS Fix Script for Workforce Democracy Project
# This script will attempt to fix CORS issues by updating the Nginx configuration

echo "🔧 Workforce Democracy Project - CORS Fix"
echo "========================================"
echo ""

# Check if we're running on the server
if [ "$(hostname)" != "workforce-backend" ]; then
    echo "⚠️  This script should be run on the backend server."
    echo "   You can copy this script to your server and run it there."
    echo ""
    echo "   To copy and run on server:"
    echo "   scp fix-cors-automated.sh root@185.193.126.13:/tmp/"
    echo "   ssh root@185.193.126.13"
    echo "   chmod +x /tmp/fix-cors-automated.sh"
    echo "   /tmp/fix-cors-automated.sh"
    echo ""
    exit 1
fi

# Create backup of current config
echo "💾 Creating backup of current Nginx configuration..."
cp /etc/nginx/sites-enabled/workforce-backend /etc/nginx/sites-enabled/workforce-backend.backup.$(date +%Y%m%d_%H%M%S)

# Update the Nginx configuration to add proper CORS headers
echo "🔧 Updating Nginx configuration..."

# Add CORS headers to the location /api/ block
cat >> /etc/nginx/sites-enabled/workforce-backend << 'EOF'

# CORS Headers for Workforce Democracy Project
# Added on $(date)
map $http_origin $cors_origin {
    default "";
    "~^https://workforcedemocracyproject\.org$" "https://workforcedemocracyproject.org";
    "~^https://.*\.netlify\.app$" "$http_origin";
    "~^http://localhost(:[0-9]+)?$" "$http_origin";
}

map $http_origin $cors_cred {
    default "false";
    "~^https://workforcedemocracyproject\.org$" "true";
    "~^https://.*\.netlify\.app$" "true";
    "~^http://localhost(:[0-9]+)?$" "true";
}

EOF

# Replace the existing location /api/ block with one that includes CORS headers
sed -i '/location \/api\/ {/,/}/ {
    /location \/api\/ {/!{/}/!d;}
    /location \/api\/ {/a\
    # CORS Headers - CRITICAL FOR FRONTEND COMMUNICATION\
    add_header Access-Control-Allow-Origin $cors_origin always;\
    add_header Access-Control-Allow-Credentials $cors_cred always;\
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;\
    add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;\
    add_header Access-Control-Max-Age 86400 always;\
    \
    # Handle preflight OPTIONS requests\
    if ($request_method = OPTIONS) {\
        add_header Access-Control-Allow-Origin $cors_origin always;\
        add_header Access-Control-Allow-Credentials $cors_cred always;\
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;\
        add_header Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With" always;\
        add_header Access-Control-Max-Age 86400 always;\
        add_header Content-Type "text/plain charset=UTF-8";\
        add_header Content-Length 0;\
        return 204;\
    }\
    \
    # Proxy settings (keep existing proxy settings)\
}' /etc/nginx/sites-enabled/workforce-backend

echo "✅ Nginx configuration updated!"

# Test the configuration
echo "🧪 Testing Nginx configuration..."
if nginx -t; then
    echo "✅ Nginx configuration test passed!"
    
    # Reload Nginx
    echo "🔄 Reloading Nginx..."
    systemctl reload nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx reloaded successfully!"
        echo ""
        echo "🎉 CORS fix completed successfully!"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://workforcedemocracyproject.org"
        echo "2. Open browser console (F12)"
        echo "3. Try to use a feature that connects to the backend"
        echo "4. Check that there are no CORS errors"
        echo ""
    else
        echo "❌ Error: Nginx failed to reload"
        echo "Restoring backup..."
        cp /etc/nginx/sites-enabled/workforce-backend.backup.* /etc/nginx/sites-enabled/workforce-backend
        systemctl reload nginx
        echo "Backup restored."
    fi
else
    echo "❌ Nginx configuration test failed!"
    echo "Restoring backup..."
    cp /etc/nginx/sites-enabled/workforce-backend.backup.* /etc/nginx/sites-enabled/workforce-backend
    nginx -t
    echo "Backup restored."
fi