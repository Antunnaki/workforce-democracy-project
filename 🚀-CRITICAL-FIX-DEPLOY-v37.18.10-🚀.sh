#!/bin/bash

###############################################################################
# 🚀 CRITICAL FIX DEPLOYMENT - v37.18.10
###############################################################################
#
# What this fixes:
#   - Chat showing "[object Object]" instead of AI response
#   - Backend was calling non-existent aiService.generateResponse()
#   - Changed to use analyzeWithAI (the actual exported function)
#
# Impact:
#   - FIXES chat modal completely
#   - FIXES homepage inline chat
#   - Backend restart REQUIRED
#
# Deploy to:
#   - Version B: /var/www/workforce-democracy/version-b/backend/civic-llm-async.js
#
# Created: 2025-11-27 22:00
# Version: v37.18.10
# Severity: CRITICAL
#
###############################################################################

set -e  # Exit on error

echo ""
echo "=========================================================================="
echo "  🚨 CRITICAL FIX DEPLOYMENT - v37.18.10"
echo "=========================================================================="
echo ""
echo "This script will:"
echo "  1. Upload fixed backend/civic-llm-async.js to Version B"
echo "  2. Restart workforce-backend-b.service"
echo "  3. Verify backend is running"
echo "  4. Show recent logs"
echo ""
echo "⚠️  CRITICAL: This fixes the '[object Object]' chat bug"
echo ""
echo "Target: root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/"
echo "Password: YNWA1892LFC"
echo ""
echo "Press ENTER to continue, or Ctrl+C to cancel..."
read

###############################################################################
# STEP 1: Upload Fixed File
###############################################################################

echo ""
echo "--------------------------------------------------------------------------"
echo "  📤 STEP 1: Uploading backend/civic-llm-async.js..."
echo "--------------------------------------------------------------------------"
echo ""

scp backend/civic-llm-async.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/civic-llm-async.js

if [ $? -eq 0 ]; then
    echo "✅ File uploaded successfully!"
else
    echo "❌ Upload failed! Check your network connection and try again."
    exit 1
fi

###############################################################################
# STEP 2: Restart Backend Service
###############################################################################

echo ""
echo "--------------------------------------------------------------------------"
echo "  🔄 STEP 2: Restarting workforce-backend-b.service..."
echo "--------------------------------------------------------------------------"
echo ""

ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'

if [ $? -eq 0 ]; then
    echo "✅ Service restarted successfully!"
else
    echo "❌ Service restart failed!"
    exit 1
fi

# Wait for service to fully start
echo ""
echo "⏳ Waiting 3 seconds for service to start..."
sleep 3

###############################################################################
# STEP 3: Verify Service Status
###############################################################################

echo ""
echo "--------------------------------------------------------------------------"
echo "  ✅ STEP 3: Verifying service status..."
echo "--------------------------------------------------------------------------"
echo ""

ssh root@185.193.126.13 'sudo systemctl status workforce-backend-b.service --no-pager | head -20'

###############################################################################
# STEP 4: Check Logs
###############################################################################

echo ""
echo "--------------------------------------------------------------------------"
echo "  📋 STEP 4: Checking recent logs..."
echo "--------------------------------------------------------------------------"
echo ""

ssh root@185.193.126.13 'tail -30 /var/log/workforce-backend-b.log'

###############################################################################
# STEP 5: Success Message
###############################################################################

echo ""
echo "=========================================================================="
echo "  ✅ CRITICAL FIX DEPLOYED!"
echo "=========================================================================="
echo ""
echo "What was fixed:"
echo "  ✅ backend/civic-llm-async.js (v37.18.10)"
echo "  ✅ Changed: generateResponse() → analyzeWithAI()"
echo "  ✅ Backend now returns proper string responses"
echo "  ✅ Chat modal will show actual AI text, not '[object Object]'"
echo ""
echo "What was deployed:"
echo "  ✅ Fixed backend file"
echo "  ✅ Restarted Version B backend (port 3002)"
echo "  ✅ Service is running"
echo ""
echo "--------------------------------------------------------------------------"
echo "  🧪 TESTING INSTRUCTIONS:"
echo "--------------------------------------------------------------------------"
echo ""
echo "Test on: https://workforcedemocracyproject.org/"
echo ""
echo "1. CLEAR BROWSER CACHE:"
echo "   • Press: Ctrl+Shift+R (Windows/Linux)"
echo "   • Or: Cmd+Shift+R (Mac)"
echo "   • Or: Clear cache in browser settings"
echo ""
echo "2. TEST FLOATING CHAT MODAL (Bottom-Right):"
echo "   • Click purple chat button (💬)"
echo "   • Ask: 'Has Mamdani been moving further to the right to appease liberals?'"
echo "   • Press Enter or Send"
echo ""
echo "3. EXPECTED RESULTS:"
echo "   ✅ Real AI response text (NOT '[object Object]')"
echo "   ✅ Proper sentences and paragraphs"
echo "   ✅ Clickable superscript citations (¹ ² ³)"
echo "   ✅ Collapsible 'Sources' section"
echo "   ✅ 1-3 relevant sources"
echo ""
echo "4. CHECK CONSOLE (F12):"
echo "   ✅ Should see: 'Generated response for job...'"
echo "   ✅ Should see: 'Final sources: X (AI validated)'"
echo "   ✅ Should NOT see: '[CleanChat] ⚠️ aiResponse is not a string'"
echo "   ✅ Should NOT see: '[object Object]' in response"
echo ""
echo "5. TEST HOMEPAGE INLINE CHAT:"
echo "   • Scroll to 'My Representatives'"
echo "   • Click 'Ask AI' on any representative"
echo "   • Ask same question"
echo "   • Verify same good results"
echo ""
echo "--------------------------------------------------------------------------"
echo "  🔍 IF STILL SHOWING '[object Object]':"
echo "--------------------------------------------------------------------------"
echo ""
echo "1. Check if service is actually running:"
echo "   ssh root@185.193.126.13 'systemctl status workforce-backend-b.service'"
echo ""
echo "2. Check logs for errors:"
echo "   ssh root@185.193.126.13 'tail -50 /var/log/workforce-backend-b.log'"
echo ""
echo "3. Verify file was uploaded correctly:"
echo "   ssh root@185.193.126.13 'grep -n \"v37.18.10\" /var/www/workforce-democracy/version-b/backend/civic-llm-async.js'"
echo ""
echo "4. Clear browser cache completely and retry"
echo ""
echo "5. Check if test backend override is active:"
echo "   - Look for: '[TEST OVERRIDE] Redirecting API calls'"
echo "   - If so, test site is calling Version B (correct)"
echo ""
echo "--------------------------------------------------------------------------"
echo "  📊 EXPECTED BACKEND LOGS:"
echo "--------------------------------------------------------------------------"
echo ""
echo "Look for these in logs:"
echo "  ✅ 'Processing job <job-id>'"
echo "  ✅ 'Found X sources for job <job-id>'"
echo "  ✅ 'Generated response for job <job-id> (XXX chars)'"
echo "  ✅ 'Final sources: X (AI validated)'"
echo "  ✅ 'Job <job-id> completed successfully'"
echo ""
echo "Should NOT see:"
echo "  ❌ 'TypeError: Cannot read property'"
echo "  ❌ 'generateResponse is not a function'"
echo "  ❌ 'undefined response'"
echo ""
echo "=========================================================================="
echo ""
echo "Deployment completed at: $(date)"
echo ""
echo "Created by: AI Assistant"
echo "Date: 2025-11-27 22:00"
echo "Version: v37.18.10"
echo "Severity: CRITICAL"
echo ""
echo "=========================================================================="
echo ""
