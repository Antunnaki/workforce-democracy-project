#!/bin/bash

# ============================================================================
# 📤 UPLOAD REPRESENTATIVES API FIX TO VPS - v37.9.1
# ============================================================================
# 
# This script uploads the fixed us-representatives.js file to your VPS
#
# Local Directory:  /Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/SH-Files
# VPS Server:       185.193.126.13
# VPS Backend Dir:  /var/www/workforce-democracy/backend/
#
# WHAT THIS FIXES:
# - ZIP code 80204 (Colorado) now works
# - All US ZIP codes supported
# - Uses Google Civic API + offline ZIP database
#
# Usage: Run this from your Mac Terminal
#
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
VPS_ROOT_DIR="/root"

echo "📂 Local directory: $LOCAL_DIR"
echo "🌐 VPS server: $VPS_SERVER"
echo "👤 VPS user: $VPS_USER"
echo ""

# ============================================================================
# STEP 1: Upload fixed us-representatives.js to backend directory
# ============================================================================

FILE_BACKEND="us-representatives.js"
echo "📤 Step 1: Uploading $FILE_BACKEND to backend..."

if [ ! -f "$LOCAL_DIR/$FILE_BACKEND" ]; then
    echo "❌ Error: $FILE_BACKEND not found in $LOCAL_DIR"
    echo ""
    echo "Please ensure you have downloaded the fixed file to your SH-Files directory."
    exit 1
fi

echo "✅ File found locally"
echo "📤 Uploading to $VPS_BACKEND_DIR..."
scp "$LOCAL_DIR/$FILE_BACKEND" $VPS_USER@$VPS_SERVER:$VPS_BACKEND_DIR/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed for $FILE_BACKEND"
    exit 1
fi

echo "✅ $FILE_BACKEND uploaded successfully"
echo ""

# ============================================================================
# STEP 2: Upload deployment script to root directory
# ============================================================================

FILE_DEPLOY="🚀-DEPLOY-REPRESENTATIVES-FIX-v37.9.1.sh"
echo "📤 Step 2: Uploading deployment script..."

if [ ! -f "$LOCAL_DIR/$FILE_DEPLOY" ]; then
    echo "⚠️  Warning: $FILE_DEPLOY not found (optional)"
    echo "You can deploy manually by SSH'ing to VPS and restarting PM2"
else
    echo "✅ Deployment script found"
    echo "📤 Uploading to $VPS_ROOT_DIR..."
    scp "$LOCAL_DIR/$FILE_DEPLOY" $VPS_USER@$VPS_SERVER:$VPS_ROOT_DIR/
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment script uploaded successfully"
    else
        echo "⚠️  Deployment script upload failed (optional)"
    fi
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
echo "  2. Navigate to backend directory:"
echo "     cd $VPS_BACKEND_DIR"
echo ""
echo "  3. Verify the file was uploaded:"
echo "     ls -lh us-representatives.js"
echo ""
echo "  4. Restart the backend:"
echo "     pm2 restart workforce-backend"
echo "     # OR: pm2 restart all"
echo ""
echo "  5. Test the fix:"
echo "     curl 'http://localhost:3001/api/civic/representatives/search?zip=80204'"
echo ""
echo "  Expected Result:"
echo "    - Should return real representatives from Colorado District 1"
echo "    - Senators: Michael Bennet, John Hickenlooper"
echo "    - House Rep: Diana DeGette (CO-1)"
echo "    - State legislators from Colorado"
echo ""
echo "🎉 Files successfully uploaded to VPS!"
echo ""
echo "============================================================================"
