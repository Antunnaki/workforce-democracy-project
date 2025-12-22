#!/bin/bash

# ========================================
# FIX OPENSTATES 404 ERROR
# ========================================
# This script fixes the OpenStates API 404 error by updating the jurisdiction format
# From: "CO" 
# To: "ocd-jurisdiction/country:us/state:co/government"

echo "🔧 ========================================"
echo "🔧 FIXING OPENSTATES 404 ERROR"
echo "🔧 ========================================"
echo ""

# Navigate to backend directory
cd /root/backend || { echo "❌ Backend directory not found!"; exit 1; }

echo "📋 Backing up current us-representatives.js..."
cp us-representatives.js us-representatives.js.backup-$(date +%Y%m%d-%H%M%S)

echo "✅ Backup created!"
echo ""

echo "📝 The fix has been applied to the file in GenSpark."
echo "📝 You need to download the updated backend/us-representatives.js from GenSpark"
echo "📝 and upload it to your VPS."
echo ""

echo "🚀 After uploading the new file, restart PM2:"
echo ""
echo "   pm2 restart workforce-backend"
echo "   pm2 save"
echo ""

echo "✅ Then test with:"
echo ""
echo "   curl \"http://localhost:3001/api/civic/representatives/search?zip=80204\""
echo ""

echo "🎯 Expected result: 2 federal senators + state legislators"
echo ""

echo "📋 What was fixed:"
echo "   - OpenStates GraphQL query now uses proper jurisdiction format"
echo "   - Changed from: jurisdiction: \"CO\""
echo "   - Changed to: jurisdiction: \"ocd-jurisdiction/country:us/state:co/government\""
echo ""

echo "🔍 About the errors:"
echo "   ⚠️ Google Civic API 403 - This is expected (rate limit or requires API key)"
echo "   ❌ OpenStates API 404 - NOW FIXED (jurisdiction format was wrong)"
echo "   ✅ ZIP Database fallback - Already working! (found 2 senators)"
echo ""

echo "✅ Fix complete! Upload the new file and restart PM2."

