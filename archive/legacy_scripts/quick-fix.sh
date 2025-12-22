#!/bin/bash
# Quick Fix for Browser Cache Issue
# Workforce Democracy Chat v37.9.13

echo "🔧 Fixing browser cache issue..."

# Step 1: Create new file with updated version number
echo "📋 Step 1: Creating v37.9.13 (new filename)..."
cp /var/www/workforce-democracy/js/universal-chat-v37.9.12-ASYNC.js \
   /var/www/workforce-democracy/js/universal-chat-v37.9.13.js

if [ $? -eq 0 ]; then
    echo "✅ Created: universal-chat-v37.9.13.js"
else
    echo "❌ Failed to create new file"
    exit 1
fi

# Step 2: Update index.html to reference new file
echo "📋 Step 2: Updating index.html..."
sed -i 's|universal-chat-v37.9.12-ASYNC.js?v=20251112-2230|universal-chat-v37.9.13.js|' \
   /var/www/workforce-democracy/index.html

if [ $? -eq 0 ]; then
    echo "✅ Updated index.html"
else
    echo "❌ Failed to update index.html"
    exit 1
fi

# Step 3: Verify changes
echo "📋 Step 3: Verifying changes..."
echo ""
echo "🔍 index.html now contains:"
grep "universal-chat" /var/www/workforce-democracy/index.html | grep "script src"
echo ""

echo "🔍 JavaScript files in /js/:"
ls -lh /var/www/workforce-democracy/js/universal-chat*.js
echo ""

# Step 4: Test backend is still responding
echo "📋 Step 4: Testing backend..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health 2>/dev/null)
if [ -n "$BACKEND_HEALTH" ]; then
    echo "✅ Backend is responding"
else
    echo "⚠️  Backend health check failed (this may be OK if no /health endpoint exists)"
fi

echo ""
echo "✅ ✅ ✅ FIX APPLIED SUCCESSFULLY ✅ ✅ ✅"
echo ""
echo "📱 NEXT STEPS:"
echo "1. Visit: https://workforcedemocracy.org"
echo "2. Hard Refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)"
echo "3. Open DevTools (F12) → Network tab"
echo "4. Look for: universal-chat-v37.9.13.js loading"
echo "5. Ask: 'What is workforce democracy?'"
echo "6. Check console for FULL AI response (not 'Sorry, I received an empty response')"
echo ""
echo "Expected: Text length 1800+ characters (not 37)"
echo ""
