#!/bin/bash

# ============================================================================
# 📤 UPLOAD PROJECT_MASTER_GUIDE.md DEPLOYMENT SCRIPT TO VPS
# ============================================================================
# 
# This script uploads the deployment script from your Mac to your VPS server
#
# Local Directory:  /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files
# VPS Server:       185.193.126.13
# VPS Directory:    /root/ (or any directory you prefer)
#
# Usage: Run this from your Mac Terminal
#
# ============================================================================

echo "============================================================================"
echo "📤 UPLOADING DEPLOYMENT SCRIPT TO VPS"
echo "============================================================================"
echo ""

# Local directory where .sh files are stored
LOCAL_DIR="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"

# File to upload
FILE="🚀-DEPLOY-PROJECT-MASTER-GUIDE-v37.9.1.sh"

# VPS details
VPS_SERVER="185.193.126.13"
VPS_USER="root"
VPS_DIR="/root/"

echo "📂 Local directory: $LOCAL_DIR"
echo "📁 File to upload: $FILE"
echo "🌐 VPS server: $VPS_SERVER"
echo "👤 VPS user: $VPS_USER"
echo "📍 VPS destination: $VPS_DIR"
echo ""

# Check if file exists locally
if [ ! -f "$LOCAL_DIR/$FILE" ]; then
    echo "❌ Error: File not found in local directory!"
    echo "Expected: $LOCAL_DIR/$FILE"
    echo ""
    echo "Please ensure the file is in your SH-Files directory."
    exit 1
fi

echo "✅ File found locally"
echo ""

# Upload file to VPS using scp
echo "📤 Uploading file to VPS..."
echo "Command: scp \"$LOCAL_DIR/$FILE\" $VPS_USER@$VPS_SERVER:$VPS_DIR"
echo ""

scp "$LOCAL_DIR/$FILE" $VPS_USER@$VPS_SERVER:$VPS_DIR

# Check if upload was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "============================================================================"
    echo "✅ UPLOAD COMPLETE"
    echo "============================================================================"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. SSH into your VPS:"
    echo "     ssh $VPS_USER@$VPS_SERVER"
    echo ""
    echo "  2. Make the script executable:"
    echo "     chmod +x $FILE"
    echo ""
    echo "  3. Run the deployment script:"
    echo "     ./$FILE"
    echo ""
    echo "🎉 File successfully uploaded to VPS!"
    echo ""
    echo "============================================================================"
else
    echo ""
    echo "❌ Upload failed!"
    echo ""
    echo "Possible reasons:"
    echo "  - VPS server not reachable"
    echo "  - SSH credentials incorrect"
    echo "  - Network connection issue"
    echo ""
    echo "Please check your connection and try again."
    exit 1
fi
