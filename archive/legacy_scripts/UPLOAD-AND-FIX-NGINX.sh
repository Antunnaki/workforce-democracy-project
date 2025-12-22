#!/bin/bash

# ===================================================================
# UPLOAD AND FIX NGINX FROM MAC
# ===================================================================
# This script uploads the deployment script to your VPS and runs it
# Run this from your Mac Terminal
# ===================================================================

echo "======================================================================"
echo "🚀 NGINX CORS FIX - UPLOAD FROM MAC"
echo "======================================================================"
echo ""

# Configuration
VPS_IP="185.193.126.13"
VPS_USER="root"
VPS_PATH="/root/"
LOCAL_SCRIPT="backend/deploy-nginx-cors-fix.sh"
LOCAL_CONFIG="backend/nginx-cors-config.conf"

# Check if files exist
if [ ! -f "$LOCAL_SCRIPT" ]; then
    echo "❌ Error: Could not find $LOCAL_SCRIPT"
    echo "Make sure you're running this from the project root directory"
    exit 1
fi

if [ ! -f "$LOCAL_CONFIG" ]; then
    echo "❌ Error: Could not find $LOCAL_CONFIG"
    exit 1
fi

# Step 1: Upload deployment script
echo "📤 Step 1: Uploading deployment script to VPS..."
scp "$LOCAL_SCRIPT" "${VPS_USER}@${VPS_IP}:${VPS_PATH}deploy-nginx-cors-fix.sh"
if [ $? -eq 0 ]; then
    echo "✅ Deployment script uploaded"
else
    echo "❌ Upload failed"
    exit 1
fi
echo ""

# Step 2: Upload nginx config reference
echo "📤 Step 2: Uploading Nginx config reference..."
scp "$LOCAL_CONFIG" "${VPS_USER}@${VPS_IP}:${VPS_PATH}nginx-cors-config.conf"
if [ $? -eq 0 ]; then
    echo "✅ Config reference uploaded"
else
    echo "❌ Upload failed"
    exit 1
fi
echo ""

# Step 3: Make script executable and run
echo "======================================================================"
echo "🔧 Step 3: Running deployment script on VPS..."
echo "======================================================================"
echo ""
echo "The script will:"
echo "  1. Find your Nginx config file"
echo "  2. Create a backup"
echo "  3. Open nano editor for you to add CORS headers"
echo "  4. Test the configuration"
echo "  5. Reload Nginx"
echo ""
read -p "Press Enter to connect to VPS and run deployment script..."
echo ""

# SSH into VPS and run the script
ssh -t "${VPS_USER}@${VPS_IP}" "chmod +x ${VPS_PATH}deploy-nginx-cors-fix.sh && ${VPS_PATH}deploy-nginx-cors-fix.sh"

echo ""
echo "======================================================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================================================"
echo ""
echo "Next steps:"
echo "1. Go to https://workforcedemocracyproject.org"
echo "2. Open browser console (F12)"
echo "3. Click 'Get Started' and try registration"
echo "4. CORS errors should be gone!"
echo ""
echo "Files uploaded to VPS:"
echo "  - ${VPS_PATH}deploy-nginx-cors-fix.sh"
echo "  - ${VPS_PATH}nginx-cors-config.conf (reference)"
echo ""
