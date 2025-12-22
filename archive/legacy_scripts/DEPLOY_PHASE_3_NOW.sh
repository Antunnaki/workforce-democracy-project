#!/bin/bash
# ============================================================================
# PHASE 3 CITATION RENDERING - DEPLOYMENT SCRIPT
# Version: V36.7.1 Phase 3
# Date: October 30, 2025
# ============================================================================

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                  🚀 PHASE 3 DEPLOYMENT SCRIPT                    ║"
echo "║              Citation Rendering Implementation                    ║"
echo "║                     V36.7.1 Phase 3                              ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

# VPS Configuration
VPS_IP="185.193.126.13"
VPS_USER="root"
VPS_PATH="/var/www/workforce-democracy"

echo "📋 Deployment Configuration:"
echo "   VPS IP: $VPS_IP"
echo "   User: $VPS_USER"
echo "   Path: $VPS_PATH"
echo ""

# Check if we're in the correct directory
if [ ! -f "index.html" ]; then
    echo "❌ ERROR: index.html not found!"
    echo "   Please run this script from the project root directory."
    exit 1
fi

echo "✅ Running from correct directory"
echo ""

# Prompt for confirmation
read -p "🔄 Ready to deploy Phase 3 files to VPS? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "STEP 1: Deploying NEW files (citation renderer + CSS)"
echo "═══════════════════════════════════════════════════════════════════"
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
echo "📤 Uploading css/citations.css..."
scp css/citations.css $VPS_USER@$VPS_IP:$VPS_PATH/css/
if [ $? -eq 0 ]; then
    echo "✅ citations.css uploaded successfully"
else
    echo "❌ Failed to upload citations.css"
    exit 1
fi

echo ""
echo "📤 Uploading test-citations.html (optional test page)..."
scp test-citations.html $VPS_USER@$VPS_IP:$VPS_PATH/
if [ $? -eq 0 ]; then
    echo "✅ test-citations.html uploaded successfully"
else
    echo "⚠️  Failed to upload test-citations.html (not critical)"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "STEP 2: Deploying MODIFIED files (chat widgets + index.html)"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "📤 Uploading js/bills-chat.js..."
scp js/bills-chat.js $VPS_USER@$VPS_IP:$VPS_PATH/js/
if [ $? -eq 0 ]; then
    echo "✅ bills-chat.js uploaded successfully"
else
    echo "❌ Failed to upload bills-chat.js"
    exit 1
fi

echo ""
echo "📤 Uploading js/inline-civic-chat.js..."
scp js/inline-civic-chat.js $VPS_USER@$VPS_IP:$VPS_PATH/js/
if [ $? -eq 0 ]; then
    echo "✅ inline-civic-chat.js uploaded successfully"
else
    echo "❌ Failed to upload inline-civic-chat.js"
    exit 1
fi

echo ""
echo "📤 Uploading js/ethical-business-chat.js..."
scp js/ethical-business-chat.js $VPS_USER@$VPS_IP:$VPS_PATH/js/
if [ $? -eq 0 ]; then
    echo "✅ ethical-business-chat.js uploaded successfully"
else
    echo "❌ Failed to upload ethical-business-chat.js"
    exit 1
fi

echo ""
echo "📤 Uploading index.html..."
scp index.html $VPS_USER@$VPS_IP:$VPS_PATH/
if [ $? -eq 0 ]; then
    echo "✅ index.html uploaded successfully"
else
    echo "❌ Failed to upload index.html"
    exit 1
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "STEP 3: Verifying deployment on VPS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "🔍 Checking if files exist on VPS..."
ssh $VPS_USER@$VPS_IP << 'ENDSSH'
cd /var/www/workforce-democracy

echo "Checking new files:"
if [ -f "js/citation-renderer.js" ]; then
    echo "✅ js/citation-renderer.js exists"
    ls -lh js/citation-renderer.js
else
    echo "❌ js/citation-renderer.js NOT FOUND"
fi

if [ -f "css/citations.css" ]; then
    echo "✅ css/citations.css exists"
    ls -lh css/citations.css
else
    echo "❌ css/citations.css NOT FOUND"
fi

echo ""
echo "Checking modified files:"
if [ -f "js/bills-chat.js" ]; then
    echo "✅ js/bills-chat.js exists"
else
    echo "❌ js/bills-chat.js NOT FOUND"
fi

if [ -f "js/inline-civic-chat.js" ]; then
    echo "✅ js/inline-civic-chat.js exists"
else
    echo "❌ js/inline-civic-chat.js NOT FOUND"
fi

if [ -f "js/ethical-business-chat.js" ]; then
    echo "✅ js/ethical-business-chat.js exists"
else
    echo "❌ js/ethical-business-chat.js NOT FOUND"
fi

if [ -f "index.html" ]; then
    echo "✅ index.html exists"
else
    echo "❌ index.html NOT FOUND"
fi

echo ""
echo "Checking if citation-renderer.js is referenced in index.html:"
if grep -q "citation-renderer.js" index.html; then
    echo "✅ citation-renderer.js script tag found in index.html"
else
    echo "❌ citation-renderer.js NOT referenced in index.html"
fi

echo ""
echo "Checking if citations.css is referenced in index.html:"
if grep -q "citations.css" index.html; then
    echo "✅ citations.css link tag found in index.html"
else
    echo "❌ citations.css NOT referenced in index.html"
fi

echo ""
echo "File permissions:"
ls -la js/citation-renderer.js 2>/dev/null || echo "File not found"
ls -la css/citations.css 2>/dev/null || echo "File not found"
ENDSSH

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ PHASE 3 DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "📋 What was deployed:"
echo "   ✅ js/citation-renderer.js (NEW)"
echo "   ✅ css/citations.css (NEW)"
echo "   ✅ test-citations.html (NEW - optional)"
echo "   ✅ js/bills-chat.js (MODIFIED)"
echo "   ✅ js/inline-civic-chat.js (MODIFIED)"
echo "   ✅ js/ethical-business-chat.js (MODIFIED)"
echo "   ✅ index.html (MODIFIED)"
echo ""
echo "🧪 Testing Instructions:"
echo "   1. Open: https://workforcedemocracyproject.org/test-citations.html"
echo "   2. Test: Click buttons to see citation rendering"
echo "   3. Live: Send 'Tell me about Eric Adams' in Bills chat"
echo "   4. Verify: Citations appear as clickable superscripts"
echo ""
echo "🔍 Debugging (if needed):"
echo "   • Check browser console for errors"
echo "   • Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "   • View source: Verify script tags are present"
echo ""
echo "📚 Documentation:"
echo "   • See: PHASE_3_CITATION_RENDERING_COMPLETE.md"
echo "   • Test suite: test-citations.html"
echo "   • API reference: js/citation-renderer.js (comments)"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
