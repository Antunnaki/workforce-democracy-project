#!/bin/bash

###############################################################################
# 🚀 DEPLOY CHAT MODAL FIX - v37.18.9
###############################################################################
#
# What this deploys:
#   - Fixed js/chat-clean.js (aiResponse.substring bug fix)
#
# What this fixes:
#   - Chat modal (bottom-right) now works without TypeError
#   - Both homepage chat and modal chat more stable
#
# Impact:
#   - Frontend only (no backend restart needed)
#   - Both chat interfaces benefit from fix
#
# Deploy to:
#   - Production: /var/www/workforce-democracy/js/chat-clean.js
#
# Created: 2025-11-27 21:30
# Version: v37.18.9
#
###############################################################################

set -e  # Exit on error

echo ""
echo "=========================================================================="
echo "  🚀 DEPLOYING CHAT MODAL FIX - v37.18.9"
echo "=========================================================================="
echo ""
echo "This script will:"
echo "  1. Upload fixed js/chat-clean.js to production VPS"
echo "  2. Verify file was uploaded successfully"
echo "  3. Test both chat interfaces"
echo ""
echo "Target: root@185.193.126.13:/var/www/workforce-democracy/js/"
echo "Password: YNWA1892LFC"
echo ""
echo "Press ENTER to continue, or Ctrl+C to cancel..."
read

###############################################################################
# STEP 1: Upload Fixed File
###############################################################################

echo ""
echo "--------------------------------------------------------------------------"
echo "  📤 STEP 1: Uploading js/chat-clean.js..."
echo "--------------------------------------------------------------------------"
echo ""

scp js/chat-clean.js root@185.193.126.13:/var/www/workforce-democracy/js/chat-clean.js

if [ $? -eq 0 ]; then
    echo "✅ File uploaded successfully!"
else
    echo "❌ Upload failed! Check your network connection and try again."
    exit 1
fi

###############################################################################
# STEP 2: Verify Deployment
###############################################################################

echo ""
echo "--------------------------------------------------------------------------"
echo "  🔍 STEP 2: Verifying file was uploaded..."
echo "--------------------------------------------------------------------------"
echo ""

ssh root@185.193.126.13 'ls -lh /var/www/workforce-democracy/js/chat-clean.js'

if [ $? -eq 0 ]; then
    echo "✅ File verified on server!"
else
    echo "❌ File verification failed!"
    exit 1
fi

###############################################################################
# STEP 3: Success Message
###############################################################################

echo ""
echo "=========================================================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=========================================================================="
echo ""
echo "What was deployed:"
echo "  ✅ js/chat-clean.js (v37.18.9 - chat modal bug fix)"
echo ""
echo "What changed:"
echo "  ✅ Fixed TypeError: aiResponse.substring is not a function"
echo "  ✅ Added type checking for backend responses"
echo "  ✅ Chat modal (bottom-right) now works correctly"
echo "  ✅ Homepage inline chat more stable"
echo ""
echo "--------------------------------------------------------------------------"
echo "  🧪 TESTING INSTRUCTIONS:"
echo "--------------------------------------------------------------------------"
echo ""
echo "Test on: https://workforcedemocracyproject.org/"
echo ""
echo "1. TEST FLOATING CHAT MODAL (Bottom-Right):"
echo "   • Look for purple chat button (💬) in bottom-right corner"
echo "   • Click to open modal"
echo "   • Type: 'What is Chuck Schumer's voting record on healthcare?'"
echo "   • Press Enter or click Send"
echo ""
echo "2. TEST HOMEPAGE INLINE CHAT (Representatives Section):"
echo "   • Scroll to 'My Representatives' section"
echo "   • Enter your ZIP code (if not already entered)"
echo "   • Click 'Ask AI' button in a representative card"
echo "   • Type: 'What is Chuck Schumer's voting record on healthcare?'"
echo "   • Press Enter or click Send"
echo ""
echo "3. CHECK CONSOLE (F12):"
echo "   • Should see: 'Deep research returned 11 sources'"
echo "   • Should see: 'Received result after X.X seconds'"
echo "   • Should NOT see: 'TypeError: aiResponse.substring is not a function'"
echo ""
echo "4. CHECK RESPONSE QUALITY:"
echo "   • ✅ Response appears instantly (no typewriter)"
echo "   • ✅ Clickable superscript citations (¹ ² ³)"
echo "   • ✅ Collapsible 'Sources' section"
echo "   • ✅ 7-11 Congress.gov sources"
echo "   • ✅ 'Key Contradictions' section with details"
echo "   • ✅ NO 'I searched but didn't find articles' ending"
echo "   • ✅ NO <think> blocks visible"
echo ""
echo "--------------------------------------------------------------------------"
echo "  📊 EXPECTED RESULTS:"
echo "--------------------------------------------------------------------------"
echo ""
echo "BOTH chat interfaces should:"
echo "  ✅ Open without errors"
echo "  ✅ Send messages successfully"
echo "  ✅ Display AI responses with citations"
echo "  ✅ Show sources in collapsible section"
echo "  ✅ NO console errors"
echo ""
echo "If you see any errors:"
echo "  • Check browser console (F12)"
echo "  • Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)"
echo "  • Check network tab for 404 errors"
echo "  • Verify backend is running: systemctl status workforce-backend-b.service"
echo ""
echo "--------------------------------------------------------------------------"
echo "  📝 WHAT'S NEXT:"
echo "--------------------------------------------------------------------------"
echo ""
echo "If BOTH chats work:"
echo "  ✅ Chat modal bug is FIXED!"
echo "  ✅ Update user on success"
echo "  ✅ Ask if they want to deploy to production (if testing on test site)"
echo ""
echo "If floating modal still broken:"
echo "  ❌ Check browser console for new errors"
echo "  ❌ Verify js/chat-clean.js is loading (check Network tab)"
echo "  ❌ Check if GenSpark/Netlify deployment has caching issues"
echo ""
echo "=========================================================================="
echo ""
echo "Deployment completed at: $(date)"
echo ""
echo "Created by: AI Assistant"
echo "Date: 2025-11-27 21:30"
echo "Version: v37.18.9"
echo ""
echo "=========================================================================="
echo ""
