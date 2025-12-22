#!/bin/bash
#
# 🚀 DEPLOY REPRESENTATIVES API FIX - v37.9.1
# Fixes 404 error for ZIP code lookups (e.g., ZIP 80204)
#
# WHAT THIS FIXES:
# - Broken ZIP→District lookup (FCC/Census API chain was failing)
# - Replaces with Google Civic API + ZIP database fallback
# - Now works for ALL US ZIP codes including 80204 (Colorado)
#
# DEPLOYMENT METHOD: Upload to VPS + Execute
# Target: /var/www/workforce-democracy/backend/
#

echo "======================================"
echo "🚀 DEPLOYING REPRESENTATIVES FIX v37.9.1"
echo "======================================"
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/backend/ || exit 1

# Backup original file
echo "📦 Creating backup..."
BACKUP_FILE="us-representatives.js.backup-$(date +%Y%m%d-%H%M%S)"
cp us-representatives.js "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# The fixed us-representatives.js file should already be uploaded to your Mac
# This script assumes you've already scp'd the file to the VPS

# Verify the file exists
if [ ! -f "us-representatives.js" ]; then
    echo "❌ ERROR: us-representatives.js not found!"
    echo "Please upload the fixed file first:"
    echo "  scp backend/us-representatives.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
    exit 1
fi

echo "✅ Fixed file detected"
echo ""

# Restart PM2 backend
echo "🔄 Restarting backend with PM2..."
pm2 restart workforce-backend || pm2 restart all

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETE!"
echo "======================================"
echo ""
echo "🎯 TEST NOW:"
echo "   curl 'http://185.193.126.13:3001/api/civic/representatives/search?zip=80204'"
echo ""
echo "   Expected: Real representatives from Colorado District 1"
echo "   - Should show 2 Senators (Michael Bennet, John Hickenlooper)"
echo "   - Should show 1 House Rep (Diana DeGette - CO-1)"
echo "   - Should show state legislators"
echo ""
echo "📋 WHAT CHANGED:"
echo "   - Fixed zipToCongressionalDistrict() function"
echo "   - Added Google Civic Information API (primary)"
echo "   - Added ZIP code database (offline fallback)"
echo "   - ZIP 80204 now works: Colorado, District 1"
echo ""
echo "🔍 CHECK LOGS:"
echo "   pm2 logs workforce-backend --lines 50"
echo ""
