#!/bin/bash
# ============================================================================
# PHASE 3 BUG FIXES - DEPLOYMENT SCRIPT
# Version: V36.7.1.1
# Date: October 30, 2025
# Fixes: Mobile citation size + Source ID conflicts
# ============================================================================

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║              🔧 PHASE 3 BUG FIXES DEPLOYMENT                     ║"
echo "║                  V36.7.1.1 - Quick Fixes                         ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# VPS Configuration
VPS_IP="185.193.126.13"
VPS_USER="root"
VPS_PATH="/var/www/workforce-democracy"

echo "🐛 Bugs Fixed:"
echo "   1. Mobile citation numbers too large (now 65% of text size)"
echo "   2. Source ID conflicts between multiple tests (unique IDs)"
echo ""
echo "📁 Files to Deploy:"
echo "   - css/citations.css (mobile size fix)"
echo "   - js/citation-renderer.js (unique ID system)"
echo ""

# Check if we're in the correct directory
if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found!"
    echo "   Please run this script from the project root directory."
    exit 1
fi

# Prompt for confirmation
read -p "🔄 Ready to deploy bug fixes? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "Deploying Fixed Files"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "📤 Uploading css/citations.css..."
scp css/citations.css $VPS_USER@$VPS_IP:$VPS_PATH/css/
if [ $? -eq 0 ]; then
    echo "✅ citations.css uploaded successfully"
else
    echo "❌ Failed to upload citations.css"
    exit 1
fi

echo ""
echo "📤 Uploading js/citation-renderer.js..."
scp js/citation-renderer.js $VPS_USER@$VPS_IP:$VPS_PATH/js/
if [ $? -eq 0 ]; then
    echo "✅ citation-renderer.js uploaded successfully"
else
    echo "❌ Failed to upload citation-renderer.js"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "Verifying Deployment"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /var/www/workforce-democracy

echo "📋 File Status:"
if [ -f "css/citations.css" ]; then
    echo "✅ css/citations.css exists"
    ls -lh css/citations.css
else
    echo "❌ css/citations.css NOT FOUND"
fi

if [ -f "js/citation-renderer.js" ]; then
    echo "✅ js/citation-renderer.js exists"
    ls -lh js/citation-renderer.js
else
    echo "❌ js/citation-renderer.js NOT FOUND"
fi

echo ""
echo "🔍 Checking for unique ID code in citation-renderer.js:"
if grep -q "uniqueId" js/citation-renderer.js; then
    echo "✅ Unique ID system found (Bug Fix 2 applied)"
else
    echo "❌ Unique ID system NOT found"
fi

echo ""
echo "🔍 Checking for mobile citation size in citations.css:"
if grep -q "0.65em" css/citations.css; then
    echo "✅ Mobile size fix found (Bug Fix 1 applied)"
else
    echo "❌ Mobile size fix NOT found"
fi
ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ BUG FIXES DEPLOYED!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📋 What was fixed:"
echo "   ✅ Mobile citation numbers now properly small (65% of text)"
echo "   ✅ Multiple responses on same page don't conflict"
echo "   ✅ Unique IDs for each response (cite-timestamp-random)"
echo ""
echo "🧪 Testing Instructions:"
echo ""
echo "Test 1: Mobile Citation Size"
echo "   1. Open: https://workforcedemocracyproject.org/test-citations.html"
echo "   2. Open DevTools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)"
echo "   3. Select 'iPhone 12 Pro' or similar"
echo "   4. Click 'Render with Citations' button"
echo "   5. ✅ Verify: Citation numbers are smaller than text"
echo ""
echo "Test 2: Multiple Responses"
echo "   1. Stay on test-citations.html"
echo "   2. Click 'Render with Citations' for Eric Adams test"
echo "   3. Click 'Render with Citations' for Remy Smith test"
echo "   4. Click citation [1] in Remy Smith section"
echo "   5. ✅ Verify: Scrolls to Remy Smith sources (not Eric Adams)"
echo ""
echo "Test 3: Live Chat"
echo "   1. Go to homepage"
echo "   2. Open Bills chat → Send 'Tell me about Eric Adams'"
echo "   3. Click any citation"
echo "   4. ✅ Verify: Scrolls correctly to source"
echo ""
echo "⚠️  IMPORTANT: Hard refresh browser to clear cache!"
echo "   Windows/Linux: Ctrl+Shift+R"
echo "   Mac: Cmd+Shift+R"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
