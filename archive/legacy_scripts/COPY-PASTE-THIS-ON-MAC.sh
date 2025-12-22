#!/bin/bash

# ======================================================================
# DEEP RESEARCH FIX - UPLOAD & DEPLOY FROM MAC
# ======================================================================
# Purpose: Upload fix files to VPS and execute deployment automatically
# Run from: Mac Terminal
# Target: VPS Version B (testing environment)
# ======================================================================

echo "🚀 DEEP RESEARCH FIX - UPLOAD & DEPLOY FROM MAC"
echo "================================================"
echo ""
echo "This script will:"
echo "  1. Upload 3 files to VPS Version B"
echo "  2. SSH into VPS and execute deployment"
echo "  3. Show you the results"
echo ""
echo "Target: root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/"
echo ""

# Ask for confirmation
read -p "Ready to deploy? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "Deployment cancelled."
    exit 1
fi

# Define paths
MAC_PROJECT_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0/backend"
VPS_HOST="root@185.193.126.13"
VPS_TARGET="/var/www/workforce-democracy/version-b/backend"

# Check if we're in the right directory
if [ ! -f "DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh" ]; then
    echo "⚠️  Files not found in current directory."
    echo "   Changing to project directory..."
    cd "$MAC_PROJECT_PATH" || {
        echo "❌ ERROR: Could not find project directory."
        echo "   Please make sure files are in: $MAC_PROJECT_PATH"
        exit 1
    }
fi

echo ""
echo "📤 STEP 1: Uploading files to VPS..."
echo "===================================="
echo ""

# Upload diagnostic script
echo "Uploading: DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh"
scp DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh $VPS_HOST:$VPS_TARGET/

# Upload fix script
echo "Uploading: FIX-DEEP-RESEARCH-CALL-v37.18.4.js"
scp FIX-DEEP-RESEARCH-CALL-v37.18.4.js $VPS_HOST:$VPS_TARGET/

# Upload deployment script
echo "Uploading: DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh"
scp DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh $VPS_HOST:$VPS_TARGET/

echo ""
echo "✅ Files uploaded successfully!"
echo ""

echo ""
echo "🔧 STEP 2: Executing deployment on VPS..."
echo "=========================================="
echo ""

# SSH in and execute deployment
ssh $VPS_HOST << 'ENDSSH'
    cd /var/www/workforce-democracy/version-b/backend
    
    # Make scripts executable
    chmod +x DIAGNOSE-DEEP-RESEARCH-v37.18.4.sh
    chmod +x DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
    
    # Run deployment
    ./DEPLOY-DEEP-RESEARCH-FIX-v37.18.4.sh
ENDSSH

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "======================="
echo ""
echo "Next steps:"
echo "  1. Test on GenSpark: https://sxcrlfyt.gensparkspace.com"
echo "  2. Enter ZIP: 12061"
echo "  3. Ask: 'How has Chuck Schumer voted on healthcare?'"
echo "  4. Expect: Specific Congress.gov bill citations"
echo ""
echo "If everything works, deploy to production:"
echo "  ssh root@185.193.126.13"
echo "  cd /var/www/workforce-democracy/deployment-scripts"
echo "  ./sync-b-to-a.sh"
echo ""
