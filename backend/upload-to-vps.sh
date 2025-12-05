#!/bin/bash
# =============================================================================
# UPLOAD PERSONALIZATION FIX TO VPS (Mac Terminal)
# Version: 37.11.5-FIRE-BUTTON
# Date: January 18, 2025
# =============================================================================
#
# RUN THIS SCRIPT FROM YOUR MAC TERMINAL
#
# This script uploads the fixed server.js and deployment script to VPS
#
# REQUIREMENTS:
# - Run from the WDP-v37.11.5-FIRE-BUTTON project folder
# - SSH access to VPS (root@185.193.126.13)
#
# =============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  📤 UPLOADING FILES TO VPS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Configuration
VPS_HOST="185.193.126.13"
VPS_USER="root"
VPS_BACKEND_DIR="/var/www/workforce-democracy/backend"

# Step 1: Upload updated server.js
echo "📤 Uploading server.js..."
scp backend/server.js ${VPS_USER}@${VPS_HOST}:${VPS_BACKEND_DIR}/server.js

if [ $? -eq 0 ]; then
    echo "✅ server.js uploaded successfully"
else
    echo "❌ Failed to upload server.js"
    exit 1
fi
echo ""

# Step 2: Upload deployment script
echo "📤 Uploading deployment script..."
scp backend/deploy-personalization-fix.sh ${VPS_USER}@${VPS_HOST}:/root/deploy-personalization-fix.sh

if [ $? -eq 0 ]; then
    echo "✅ Deployment script uploaded successfully"
else
    echo "❌ Failed to upload deployment script"
    exit 1
fi
echo ""

# Step 3: Make deployment script executable
echo "🔧 Making deployment script executable on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "chmod +x /root/deploy-personalization-fix.sh"

if [ $? -eq 0 ]; then
    echo "✅ Permissions set successfully"
else
    echo "❌ Failed to set permissions"
    exit 1
fi
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  ✅ UPLOAD COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. SSH into VPS:"
echo "   ssh root@185.193.126.13"
echo ""
echo "2. Run deployment script:"
echo "   /root/deploy-personalization-fix.sh"
echo ""
echo "3. Or run commands manually if preferred:"
echo "   cd /var/www/workforce-democracy/backend"
echo "   /opt/nodejs/bin/pm2 restart backend"
echo "   /opt/nodejs/bin/pm2 logs backend --lines 30"
echo ""
