#!/bin/bash
#
# UPLOAD AND DEPLOY - Deep Research v37.18.3-ENHANCED
# 
# This script runs on your MAC to:
# 1. Upload the enhanced Deep Research module to VPS
# 2. Upload the deployment script
# 3. Execute the deployment script on VPS
# 4. Show results
#
# Usage (run on Mac):
#   cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0"
#   chmod +x UPLOAD-AND-DEPLOY-v37.18.3.sh
#   ./UPLOAD-AND-DEPLOY-v37.18.3.sh
#
# ============================================================================

set -e  # Exit on any error

VPS_HOST="root@185.193.126.13"
VPS_PATH="/var/www/workforce-democracy/version-b/backend"
LOCAL_PATH="/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.18.0"

echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 Deep Research v37.18.3 - Upload & Deploy"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📂 Local path:  $LOCAL_PATH"
echo "🌐 VPS target:  $VPS_HOST:$VPS_PATH"
echo ""

# ============================================================================
# STEP 1: Check if files exist locally
# ============================================================================
echo "🔍 STEP 1: Checking local files..."

if [ ! -f "$LOCAL_PATH/deep-research-v37.18.3-ENHANCED.js" ]; then
    echo "   ❌ ERROR: deep-research-v37.18.3-ENHANCED.js not found!"
    echo "   Please download it from the chat and place it in:"
    echo "   $LOCAL_PATH/"
    exit 1
fi
echo "   ✅ Found: deep-research-v37.18.3-ENHANCED.js"

if [ ! -f "$LOCAL_PATH/DEPLOY-v37.18.3-AUTO.sh" ]; then
    echo "   ❌ ERROR: DEPLOY-v37.18.3-AUTO.sh not found!"
    echo "   Please download it from the chat and place it in:"
    echo "   $LOCAL_PATH/"
    exit 1
fi
echo "   ✅ Found: DEPLOY-v37.18.3-AUTO.sh"
echo ""

# ============================================================================
# STEP 2: Upload files to VPS
# ============================================================================
echo "📤 STEP 2: Uploading files to VPS..."
echo ""

echo "   Uploading: deep-research-v37.18.3-ENHANCED.js"
scp "$LOCAL_PATH/deep-research-v37.18.3-ENHANCED.js" "$VPS_HOST:$VPS_PATH/"
echo "   ✅ Uploaded deep-research module"
echo ""

echo "   Uploading: DEPLOY-v37.18.3-AUTO.sh"
scp "$LOCAL_PATH/DEPLOY-v37.18.3-AUTO.sh" "$VPS_HOST:$VPS_PATH/"
echo "   ✅ Uploaded deployment script"
echo ""

# ============================================================================
# STEP 3: Make deployment script executable and run it
# ============================================================================
echo "═══════════════════════════════════════════════════════════════"
echo "  🚀 STEP 3: Running deployment on VPS..."
echo "═══════════════════════════════════════════════════════════════"
echo ""

ssh "$VPS_HOST" "cd $VPS_PATH && chmod +x DEPLOY-v37.18.3-AUTO.sh && ./DEPLOY-v37.18.3-AUTO.sh"

# ============================================================================
# FINAL MESSAGE
# ============================================================================
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ UPLOAD & DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎯 What was deployed:"
echo "   • deep-research-v37.18.3-ENHANCED.js → Enhanced Congress.gov formatting"
echo "   • Automatic backup created on VPS"
echo "   • Backend service restarted"
echo "   • Test query submitted and verified"
echo ""
echo "🌐 Next: Test on GenSpark"
echo "   1. Go to: https://sxcrlfyt.gensparkspace.com"
echo "   2. Enter ZIP: 12061"
echo "   3. Find Chuck Schumer"
echo "   4. Ask: 'How has Chuck Schumer voted on healthcare?'"
echo "   5. Expect: Congress.gov bill citations with URLs"
echo ""
echo "═══════════════════════════════════════════════════════════════"
