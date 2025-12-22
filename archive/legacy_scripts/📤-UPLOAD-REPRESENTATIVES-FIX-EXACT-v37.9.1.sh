#!/bin/bash

# ============================================================================
# 📤 UPLOAD REPRESENTATIVES API FIX TO VPS - v37.9.1
# (Uses exact filename: us-representatives-FIXED-v37.9.1.js)
# ============================================================================

echo "============================================================================"
echo "📤 UPLOADING REPRESENTATIVES API FIX TO VPS"
echo "============================================================================"
echo ""

# Local directory where files are stored
LOCAL_DIR="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files"

# VPS details
VPS_SERVER="185.193.126.13"
VPS_USER="root"
VPS_BACKEND_DIR="/var/www/workforce-democracy/backend"

echo "📂 Local directory: $LOCAL_DIR"
echo "🌐 VPS server: $VPS_SERVER"
echo "👤 VPS user: $VPS_USER"
echo ""

# ============================================================================
# Upload the file with its current name and rename during upload
# ============================================================================

FILE_LOCAL="us-representatives-FIXED-v37.9.1.js"
FILE_REMOTE="us-representatives.js"

echo "📤 Uploading $FILE_LOCAL..."

if [ ! -f "$LOCAL_DIR/$FILE_LOCAL" ]; then
    echo "❌ Error: $FILE_LOCAL not found in $LOCAL_DIR"
    echo ""
    echo "Please ensure you have downloaded the fixed file."
    exit 1
fi

echo "✅ File found locally"
echo "📤 Uploading to $VPS_BACKEND_DIR/$FILE_REMOTE..."
echo ""

# Upload and rename in one step
scp "$LOCAL_DIR/$FILE_LOCAL" $VPS_USER@$VPS_SERVER:$VPS_BACKEND_DIR/$FILE_REMOTE

if [ $? -ne 0 ]; then
    echo "❌ Upload failed"
    exit 1
fi

echo ""
echo "============================================================================"
echo "✅ UPLOAD COMPLETE"
echo "============================================================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "  1. SSH into your VPS:"
echo "     ssh $VPS_USER@$VPS_SERVER"
echo ""
echo "  2. Restart the backend:"
echo "     cd $VPS_BACKEND_DIR"
echo "     pm2 restart workforce-backend"
echo ""
echo "  3. Test the fix:"
echo "     curl 'http://localhost:3001/api/civic/representatives/search?zip=80204'"
echo ""
echo "  Expected Result:"
echo "    - Senators: Michael Bennet, John Hickenlooper"
echo "    - House Rep: Diana DeGette (CO-1)"
echo "    - State legislators from Colorado"
echo ""
echo "🎉 File successfully uploaded to VPS!"
echo ""
echo "============================================================================"
