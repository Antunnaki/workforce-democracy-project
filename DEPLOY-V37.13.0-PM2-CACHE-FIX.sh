#!/bin/bash
###############################################################################
# V37.13.0 PRIVACY-FIRST DEPLOYMENT - PM2 CACHE FIX
# Date: November 21, 2025
# 
# CRITICAL: PM2 caches Node.js modules! Must use stop/delete/flush sequence
# This script ensures the new code (zipcodes only, NO us-congressional-districts) loads
###############################################################################

echo "🚀 Starting V37.13.0 Privacy-First Deployment (PM2 Cache Fix)"
echo "=============================================================="
echo ""

# Step 1: STOP + DELETE + FLUSH PM2 (clears module cache)
echo "📦 Step 1: Clearing PM2 cache..."
/opt/nodejs/bin/pm2 stop backend
/opt/nodejs/bin/pm2 delete backend
/opt/nodejs/bin/pm2 flush
echo "✅ PM2 cache cleared"
echo ""

# Step 2: Verify the updated file is present
echo "🔍 Step 2: Verifying V37.13.0 file..."
if grep -q "37.13.0-PRIVACY-FIRST-ZIP-MAPPING" /var/www/workforce-democracy/backend/routes/bills-routes.js; then
    echo "✅ V37.13.0 file detected"
else
    echo "❌ ERROR: V37.13.0 file NOT found!"
    echo "Please upload bills-routes.js first using:"
    echo "scp backend/routes/bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/"
    exit 1
fi
echo ""

# Step 3: Check for old dependency
echo "🔍 Step 3: Checking for old us-congressional-districts dependency..."
if grep -q "us-congressional-districts" /var/www/workforce-democracy/backend/routes/bills-routes.js; then
    echo "❌ ERROR: Old code still present! File upload failed!"
    exit 1
else
    echo "✅ Clean - no us-congressional-districts dependency"
fi
echo ""

# Step 4: Verify zipcodes package installed
echo "📦 Step 4: Verifying zipcodes package..."
cd /var/www/workforce-democracy/backend
if npm list zipcodes | grep -q "zipcodes@"; then
    echo "✅ zipcodes package installed"
else
    echo "⚠️ Installing zipcodes package..."
    npm install zipcodes
fi
echo ""

# Step 5: START PM2 (fresh Node.js process, no cache)
echo "🚀 Step 5: Starting backend with fresh PM2 process..."
cd /var/www/workforce-democracy/backend
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1 --node-args="--max-old-space-size=2048"
echo ""

# Step 6: Wait for backend to initialize
echo "⏳ Waiting 5 seconds for backend to initialize..."
sleep 5
echo ""

# Step 7: Check PM2 status
echo "📊 Step 7: PM2 Status..."
/opt/nodejs/bin/pm2 list
echo ""

# Step 8: Test ZIP 12061 → NY mapping
echo "🧪 Step 8: Testing ZIP 12061 → NY mapping..."
curl -s "http://localhost:3001/api/bills/location?zip=12061" | grep -o '"state":"[^"]*"' | head -1
echo ""

# Step 9: Check backend logs for errors
echo "📋 Step 9: Checking backend logs for module errors..."
/opt/nodejs/bin/pm2 logs backend --lines 50 --nostream | grep -i "cannot find module"
if [ $? -eq 0 ]; then
    echo "❌ ERROR: Module loading issues detected!"
    echo "Full logs:"
    /opt/nodejs/bin/pm2 logs backend --lines 100 --nostream
    exit 1
else
    echo "✅ No module errors detected"
fi
echo ""

# Step 10: Final verification
echo "✅ Step 10: Final Verification..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Backend Status:"
/opt/nodejs/bin/pm2 list | grep backend
echo ""
echo "Testing ZIP 12061 API..."
curl -s "http://localhost:3001/api/bills/location?zip=12061" > /tmp/test-bills.json
echo "State: $(cat /tmp/test-bills.json | grep -o '"state":"[^"]*"' | head -1)"
echo "District: $(cat /tmp/test-bills.json | grep -o '"district":"[^"]*"' | head -1)"
echo "State Bills: $(cat /tmp/test-bills.json | grep -o '"stateBills":\[[^]]*\]' | head -1)"
echo ""
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Next Steps:"
echo "1. Review the output above for any errors"
echo "2. Check logs: /opt/nodejs/bin/pm2 logs backend --lines 50"
echo "3. Test on: https://sxcrlfyt.gensparkspace.com"
echo "   - Login with ZIP: 12061"
echo "   - Go to Bills tab"
echo "   - Verify you see NY state bills"
echo ""
echo "Expected Results:"
echo "✓ State: NY"
echo "✓ District: 20"
echo "✓ 10-20 NY state bills loaded"
echo "✓ No 'Cannot find module' errors"
echo "✓ No Google tracking"
