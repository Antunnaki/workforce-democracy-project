#!/bin/bash

###############################################################################
# 📤 UPLOAD TO VPS - v37.9.2
# Workforce Democracy Project
# 
# Upload .sh deployment scripts from Mac to VPS
# Server: 185.193.126.13
###############################################################################

echo "════════════════════════════════════════════════════════════════════════════"
echo "📤 UPLOAD DEPLOYMENT SCRIPT TO VPS - v37.9.2"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""

# VPS connection details
VPS_USER="root"
VPS_HOST="185.193.126.13"
VPS_PATH="/root/"

# Get current directory (should be SH-Files)
CURRENT_DIR=$(pwd)
echo "📂 Current directory: $CURRENT_DIR"
echo ""

# List available .sh files
echo "📋 Available deployment scripts:"
echo "════════════════════════════════════════════════════════════════════════════"
ls -lh *.sh 2>/dev/null | grep -v "📤-UPLOAD" | awk '{print "   " $9 " (" $5 ")"}'
echo "════════════════════════════════════════════════════════════════════════════"
echo ""

# Prompt for file to upload
echo "📝 Enter the filename to upload (or press Enter to upload latest):"
read -r FILENAME

# If no filename provided, use the latest deployment script
if [ -z "$FILENAME" ]; then
    FILENAME=$(ls -t *.sh 2>/dev/null | grep -v "📤-UPLOAD" | head -1)
    echo "   Using latest: $FILENAME"
fi

# Check if file exists
if [ ! -f "$FILENAME" ]; then
    echo "❌ Error: File '$FILENAME' not found!"
    echo ""
    echo "Available files:"
    ls -1 *.sh 2>/dev/null | grep -v "📤-UPLOAD"
    exit 1
fi

# Show file info
FILE_SIZE=$(ls -lh "$FILENAME" | awk '{print $5}')
echo ""
echo "📦 File to upload:"
echo "   Name: $FILENAME"
echo "   Size: $FILE_SIZE"
echo "   Destination: $VPS_USER@$VPS_HOST:$VPS_PATH"
echo ""

# Confirm upload
echo "🔄 Uploading..."
echo "════════════════════════════════════════════════════════════════════════════"

# Upload using scp
scp "$FILENAME" "$VPS_USER@$VPS_HOST:$VPS_PATH"

# Check if upload was successful
if [ $? -eq 0 ]; then
    echo "════════════════════════════════════════════════════════════════════════════"
    echo "✅ UPLOAD COMPLETE"
    echo "════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "📋 Next Steps:"
    echo "  1. SSH into your VPS:"
    echo "     ssh $VPS_USER@$VPS_HOST"
    echo ""
    echo "  2. Make the script executable:"
    echo "     chmod +x $FILENAME"
    echo ""
    echo "  3. Run the deployment script:"
    echo "     ./$FILENAME"
    echo ""
    echo "🎉 File successfully uploaded to VPS!"
    echo ""
    echo "════════════════════════════════════════════════════════════════════════════"
else
    echo "════════════════════════════════════════════════════════════════════════════"
    echo "❌ UPLOAD FAILED"
    echo "════════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "Possible issues:"
    echo "  • SSH key passphrase required"
    echo "  • Network connection problem"
    echo "  • VPS not accessible"
    echo ""
    exit 1
fi
