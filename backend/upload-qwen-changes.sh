#!/bin/bash
# =============================================================================
# UPLOAD QWEN CHANGES TO VPS (Mac Terminal)
# Version: 37.20.1-QWEN-UPDATE
# Date: December 6, 2025
# =============================================================================
#
# RUN THIS SCRIPT FROM YOUR MAC TERMINAL
#
# This script uploads the Qwen changes to VPS
#
# REQUIREMENTS:
# - Run from the Workforce Democracy Project folder
# - SSH access to VPS (root@185.193.126.13)
#
# =============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  📤 UPLOADING QWEN CHANGES TO VPS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Configuration
VPS_HOST="185.193.126.13"
VPS_USER="root"
VPS_BACKEND_DIR="/var/www/workforce-democracy/backend"

# Step 1: Upload updated ai-service-qwen.js
echo "📤 Uploading ai-service-qwen.js..."
scp backend/ai-service-qwen.js ${VPS_USER}@${VPS_HOST}:${VPS_BACKEND_DIR}/ai-service-qwen.js

if [ $? -eq 0 ]; then
    echo "✅ ai-service-qwen.js uploaded successfully"
else
    echo "❌ Failed to upload ai-service-qwen.js"
    exit 1
fi
echo ""

# Step 2: Upload deployment script
echo "📤 Uploading deployment script..."
scp backend/deploy-qwen-changes.sh ${VPS_USER}@${VPS_HOST}:/root/deploy-qwen-changes.sh

if [ $? -eq 0 ]; then
    echo "✅ Deployment script uploaded successfully"
else
    echo "❌ Failed to upload deployment script"
    exit 1
fi
echo ""

# Step 3: Make deployment script executable
echo "🔧 Making deployment script executable on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "chmod +x /root/deploy-qwen-changes.sh"

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
echo "   /root/deploy-qwen-changes.sh"
echo ""
echo "3. Or run commands manually if preferred:"
echo "   cd /var/www/workforce-democracy/backend"
echo "   /opt/nodejs/bin/pm2 restart backend"
echo "   /opt/nodejs/bin/pm2 logs backend --lines 30"
echo ""