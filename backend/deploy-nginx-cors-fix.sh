#!/bin/bash

# ===================================================================
# NGINX CORS FIX DEPLOYMENT SCRIPT
# ===================================================================
# This script will help you find and update your Nginx configuration
# to enable CORS credentials for the personalization API
# ===================================================================

echo "======================================================================"
echo "🔍 NGINX CORS FIX DEPLOYMENT"
echo "======================================================================"
echo ""

# Step 1: Find Nginx config files
echo "📂 Step 1: Finding Nginx configuration files..."
echo ""
echo "Looking in /etc/nginx/sites-enabled/..."
ls -la /etc/nginx/sites-enabled/
echo ""
echo "Looking in /etc/nginx/conf.d/..."
ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "Directory not found"
echo ""

# Step 2: Ask user which file to edit
echo "======================================================================"
echo "📝 Step 2: Which file should we update?"
echo "======================================================================"
echo ""
echo "Common file names:"
echo "  - workforce-backend"
echo "  - api.workforcedemocracyproject.org"
echo "  - default"
echo ""
read -p "Enter the config file name (without path): " CONFIG_FILE
echo ""

# Determine the full path
if [ -f "/etc/nginx/sites-enabled/$CONFIG_FILE" ]; then
    CONFIG_PATH="/etc/nginx/sites-enabled/$CONFIG_FILE"
elif [ -f "/etc/nginx/conf.d/$CONFIG_FILE" ]; then
    CONFIG_PATH="/etc/nginx/conf.d/$CONFIG_FILE"
else
    echo "❌ Error: Could not find $CONFIG_FILE in common locations"
    echo "Please check the file name and try again"
    exit 1
fi

echo "✅ Found config file: $CONFIG_PATH"
echo ""

# Step 3: Create backup
echo "======================================================================"
echo "💾 Step 3: Creating backup..."
echo "======================================================================"
BACKUP_PATH="${CONFIG_PATH}.backup-$(date +%Y%m%d-%H%M%S)"
cp "$CONFIG_PATH" "$BACKUP_PATH"
echo "✅ Backup created: $BACKUP_PATH"
echo ""

# Step 4: Check if CORS headers already exist
echo "======================================================================"
echo "🔍 Step 4: Checking current configuration..."
echo "======================================================================"
if grep -q "Access-Control-Allow-Credentials" "$CONFIG_PATH"; then
    echo "⚠️  CORS credentials headers already exist in this file"
    echo "The file may have already been updated"
    echo ""
    read -p "Do you want to continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Deployment cancelled"
        exit 0
    fi
fi
echo ""

# Step 5: Show current location /api/ block
echo "======================================================================"
echo "📄 Step 5: Current /api/ configuration:"
echo "======================================================================"
echo ""
grep -A 15 "location /api/" "$CONFIG_PATH" || echo "Could not find 'location /api/' block"
echo ""
echo "======================================================================"
echo ""

# Step 6: Instructions for manual edit
echo "======================================================================"
echo "✏️  Step 6: Manual Edit Required"
echo "======================================================================"
echo ""
echo "I'll now open the config file in nano editor."
echo ""
echo "WHAT TO DO:"
echo "1. Find the 'location /api/ {' section"
echo "2. Add the CORS headers from backend/nginx-cors-config.conf"
echo "3. The headers should go AFTER the proxy settings"
echo "4. Save with Ctrl+X, then Y, then Enter"
echo ""
read -p "Press Enter to open nano editor..."
echo ""

# Open in nano
nano "$CONFIG_PATH"

# Step 7: Test configuration
echo ""
echo "======================================================================"
echo "🧪 Step 7: Testing Nginx configuration..."
echo "======================================================================"
if nginx -t; then
    echo ""
    echo "✅ Configuration test passed!"
    echo ""
    
    # Step 8: Reload Nginx
    echo "======================================================================"
    echo "🔄 Step 8: Reloading Nginx..."
    echo "======================================================================"
    systemctl reload nginx
    
    if systemctl is-active --quiet nginx; then
        echo "✅ Nginx reloaded successfully!"
        echo ""
        
        # Step 9: Verify
        echo "======================================================================"
        echo "✅ DEPLOYMENT COMPLETE!"
        echo "======================================================================"
        echo ""
        echo "Next steps:"
        echo "1. Go to https://workforcedemocracyproject.org"
        echo "2. Open browser console (F12)"
        echo "3. Click 'Get Started'"
        echo "4. Try to register"
        echo "5. Check for CORS errors (should be gone!)"
        echo ""
        echo "To restore backup if needed:"
        echo "  cp $BACKUP_PATH $CONFIG_PATH"
        echo "  nginx -t && systemctl reload nginx"
        echo ""
    else
        echo "❌ Error: Nginx failed to start"
        echo "Restoring backup..."
        cp "$BACKUP_PATH" "$CONFIG_PATH"
        systemctl reload nginx
        echo "Backup restored. Please check the configuration."
    fi
else
    echo ""
    echo "❌ Configuration test failed!"
    echo "The configuration has syntax errors."
    echo ""
    read -p "Do you want to restore the backup? (y/n): " RESTORE
    if [ "$RESTORE" = "y" ]; then
        cp "$BACKUP_PATH" "$CONFIG_PATH"
        echo "✅ Backup restored"
    fi
fi

echo ""
echo "======================================================================"
echo "📊 Nginx Status:"
echo "======================================================================"
systemctl status nginx --no-pager -l
