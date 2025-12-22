#!/bin/bash
# WORKFORCE DEMOCRACY PROJECT - V37.13.0 PRIVACY-FIRST DEPLOYMENT
# Quick-Start Deployment Script (Copy-Paste Ready)
#
# PRIVACY: NO Google tracking, offline Census data only
# Date: November 21, 2025

echo "════════════════════════════════════════════════════════════════"
echo "  WORKFORCE DEMOCRACY - V37.13.0 PRIVACY-FIRST DEPLOYMENT"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🛡️  PRIVACY MODE: Offline Census data (NO Google tracking)"
echo ""

# Step 1: Install Privacy-First Packages
echo "📦 [1/5] Installing privacy-first npm packages..."
cd /var/www/workforce-democracy/backend
npm install zipcodes us-congressional-districts

# Verify installation
echo ""
echo "✅ Verifying package installation..."
npm list | grep -E "(zipcodes|us-congressional-districts)"

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "📝 NEXT STEPS (Run on your Mac in NEW terminal window):"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "1. Navigate to your project folder:"
echo "   cd \"/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.13.0-PRIVACY-FIRST-ZIP-MAPPING/\""
echo ""
echo "2. Upload updated backend file:"
echo "   scp backend/routes/bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/"
echo ""
echo "3. Come back to THIS terminal and press ENTER to continue..."
read -p ""

# Step 2: Verify File Upload
echo ""
echo "📋 [2/5] Verifying updated file..."
if grep -q "PRIVACY MODE" /var/www/workforce-democracy/backend/routes/bills-routes.js; then
    echo "✅ Updated file detected!"
else
    echo "❌ ERROR: File not updated! Please re-upload and try again."
    exit 1
fi

# Step 3: Stop Backend
echo ""
echo "🛑 [3/5] Stopping backend (cache clear mode)..."
/opt/nodejs/bin/pm2 stop backend
/opt/nodejs/bin/pm2 delete backend
/opt/nodejs/bin/pm2 flush

# Step 4: Start Backend Fresh
echo ""
echo "🚀 [4/5] Starting backend with privacy-first configuration..."
cd /var/www/workforce-democracy/backend
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1

# Wait for startup
sleep 3

# Step 5: Verify Deployment
echo ""
echo "🔍 [5/5] Verifying privacy-first deployment..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "BACKEND LOGS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
/opt/nodejs/bin/pm2 logs backend --lines 20 --nostream | grep -E "(PRIVACY|Bills API|ZIP Mapping)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TESTING ZIP MAPPING:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test ZIP → State
echo -n "ZIP 12061 → State: "
curl -s "http://localhost:3001/api/bills/location?zip=12061" | grep -o '"state":"[A-Z]*"' || echo "❌ FAILED"

# Test ZIP → District
echo -n "ZIP 12061 → District: "
curl -s "http://localhost:3001/api/bills/location?zip=12061" | grep -o '"district":"[0-9]*"' || echo "⚠️  Not detected (optional)"

# Test State Bills Count
echo -n "State Bills Loaded: "
STATE_BILL_COUNT=$(curl -s "http://localhost:3001/api/bills/location?zip=12061" | grep -o '"level":"state"' | wc -l | xargs)
echo "$STATE_BILL_COUNT bills"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PRIVACY VERIFICATION:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check health endpoint
curl -s "http://localhost:3001/api/bills/health" | grep -E "(privacy|google_tracking|zip_offline)"

echo ""
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🎯 EXPECTED RESULTS:"
echo "   ✅ State: \"NY\""
echo "   ✅ District: \"20\" (or ⚠️  not detected - that's OK!)"
echo "   ✅ State Bills: 10-20 bills"
echo "   ✅ google_tracking: false"
echo "   ✅ privacy_first: true"
echo ""
echo "📋 NEXT STEPS:"
echo "   1. Exit VPS: exit"
echo "   2. Test on live site: https://sxcrlfyt.gensparkspace.com"
echo "   3. Log in with ZIP 12061"
echo "   4. Go to Bills tab - should see NY bills!"
echo ""
echo "🛡️  PRIVACY: NO Google tracking - Offline Census data only!"
echo ""
echo "════════════════════════════════════════════════════════════════"
