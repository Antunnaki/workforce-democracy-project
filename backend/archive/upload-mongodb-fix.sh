#!/bin/bash
# =============================================================================
# UPLOAD MONGODB CONNECTION FIX TO VPS (Mac Terminal)
# Version: 37.11.6-MONGODB-FIX
# Date: January 19, 2025
# =============================================================================
#
# RUN THIS SCRIPT FROM YOUR MAC TERMINAL
#
# This script uploads the MongoDB-connected server.js and deployment script
#
# REQUIREMENTS:
# - Run from the WDP project folder
# - SSH access to VPS (root@185.193.126.13)
#
# =============================================================================

echo "═══════════════════════════════════════════════════════════"
echo "  📤 UPLOADING MONGODB FIX TO VPS"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Configuration
VPS_HOST="185.193.126.13"
VPS_USER="root"
VPS_BACKEND_DIR="/var/www/workforce-democracy/backend"

# Step 1: Upload updated server.js
echo "📤 Uploading server.js (with MongoDB connection)..."
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
scp backend/deploy-mongodb-connection.sh ${VPS_USER}@${VPS_HOST}:/root/deploy-mongodb-connection.sh

if [ $? -eq 0 ]; then
    echo "✅ Deployment script uploaded successfully"
else
    echo "❌ Failed to upload deployment script"
    exit 1
fi
echo ""

# Step 3: Make deployment script executable
echo "🔧 Making deployment script executable on VPS..."
ssh ${VPS_USER}@${VPS_HOST} "chmod +x /root/deploy-mongodb-connection.sh"

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
echo "   /root/deploy-mongodb-connection.sh"
echo ""
echo "3. The script will:"
echo "   - Backup current server.js"
echo "   - Verify MongoDB is running"
echo "   - Install mongoose if needed"
echo "   - Restart PM2"
echo "   - Test MongoDB connection"
echo ""
