#!/bin/bash

# ===================================================================
# EXACT DEPLOYMENT COMMANDS FOR YOUR VPS
# ===================================================================
# Based on confirmed Nginx config: workforce-backend
# Run these commands on VPS (root@185.193.126.13)
# ===================================================================

echo "======================================================================"
echo "🔧 NGINX CORS FIX - EXACT COMMANDS FOR YOUR VPS"
echo "======================================================================"
echo ""
echo "Config file: /etc/nginx/sites-enabled/workforce-backend"
echo "Backup will be created automatically"
echo ""

# Step 1: Create backup
echo "Step 1: Creating backup..."
cp /etc/nginx/sites-enabled/workforce-backend /etc/nginx/sites-enabled/workforce-backend.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# Step 2: Check if CORS headers already exist
echo "Step 2: Checking if CORS headers already exist..."
if grep -q "Access-Control-Allow-Credentials" /etc/nginx/sites-enabled/workforce-backend; then
    echo "⚠️  CORS credentials headers already exist!"
    echo "The file may have already been updated."
    echo ""
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi
echo ""

# Step 3: Show current /api/ block
echo "======================================================================"
echo "Step 3: Current /api/ configuration:"
echo "======================================================================"
grep -A 20 "location /api/" /etc/nginx/sites-enabled/workforce-backend || echo "Could not find location block"
echo ""
echo "======================================================================"
echo ""

# Step 4: Edit file
echo "Step 4: Opening nano editor..."
echo ""
echo "WHAT TO DO IN NANO:"
echo "1. Find the 'location /api/ {' section"
echo "2. Scroll down past the proxy settings (proxy_pass, proxy_set_header, etc.)"
echo "3. BEFORE the closing '}', add the CORS headers shown below"
echo "4. Save: Ctrl+X, then Y, then Enter"
echo ""
echo "======================================================================"
echo "CORS HEADERS TO ADD:"
echo "======================================================================"
cat << 'EOF'

    # CORS Headers - CRITICAL FOR CREDENTIALS
    add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
    add_header 'Access-Control-Max-Age' '86400' always;

    # Handle preflight OPTIONS requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.org' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' '86400' always;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        add_header 'Content-Length' '0';
        return 204;
    }

EOF
echo "======================================================================"
echo ""
read -p "Press Enter to open nano editor..."

# Open nano
nano /etc/nginx/sites-enabled/workforce-backend

# Step 5: Test configuration
echo ""
echo "======================================================================"
echo "Step 5: Testing Nginx configuration..."
echo "======================================================================"
if nginx -t; then
    echo ""
    echo "✅ Configuration test PASSED!"
    echo ""
    
    # Step 6: Reload Nginx
    echo "======================================================================"
    echo "Step 6: Reloading Nginx..."
    echo "======================================================================"
    systemctl reload nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx reloaded successfully!"
        echo ""
        
        # Success
        echo "======================================================================"
        echo "🎉 DEPLOYMENT COMPLETE!"
        echo "======================================================================"
        echo ""
        echo "✅ CORS headers added to: /etc/nginx/sites-enabled/workforce-backend"
        echo "✅ Backup created with timestamp"
        echo "✅ Configuration tested successfully"
        echo "✅ Nginx reloaded"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://workforcedemocracyproject.org"
        echo "2. Open browser console (F12)"
        echo "3. Click 'Get Started'"
        echo "4. Try to register"
        echo "5. Check console - CORS errors should be gone!"
        echo ""
        echo "Backup location (if you need to restore):"
        ls -lt /etc/nginx/sites-enabled/workforce-backend.backup-* | head -1
        echo ""
    else
        echo "❌ Error: Nginx failed to reload"
        echo "Attempting to restore backup..."
        LATEST_BACKUP=$(ls -t /etc/nginx/sites-enabled/workforce-backend.backup-* | head -1)
        cp "$LATEST_BACKUP" /etc/nginx/sites-enabled/workforce-backend
        systemctl reload nginx
        echo "Backup restored. Please check the configuration."
    fi
else
    echo ""
    echo "❌ Configuration test FAILED!"
    echo "There are syntax errors in the configuration."
    echo ""
    read -p "Restore backup? (y/n): " RESTORE
    if [ "$RESTORE" = "y" ]; then
        LATEST_BACKUP=$(ls -t /etc/nginx/sites-enabled/workforce-backend.backup-* | head -1)
        cp "$LATEST_BACKUP" /etc/nginx/sites-enabled/workforce-backend
        echo "✅ Backup restored"
    fi
fi

echo ""
echo "======================================================================"
echo "Nginx Status:"
echo "======================================================================"
systemctl status nginx --no-pager -l
