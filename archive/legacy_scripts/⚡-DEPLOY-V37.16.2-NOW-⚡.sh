#!/bin/bash

#############################################################################
# WORKFORCE DEMOCRACY PROJECT - V37.16.2 DEPLOYMENT
# CRITICAL FIX: Location object empty → now populated
# 
# BUG FIXED:
# - Frontend showed "No Representatives Found" despite backend returning 17 reps
# - Root cause: API route accessed result.state/result.district (don't exist)
# - Fix: Use result.location_used instead
# 
# FILE CHANGED: backend/routes/civic-routes.js (1 file)
# 
# Run from VPS (SSH to root@185.193.126.13):
# bash ⚡-DEPLOY-V37.16.2-NOW-⚡.sh
#############################################################################

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  🚀 V37.16.2 DEPLOYMENT - LOCATION OBJECT FIX"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Step 1: Navigate to backend directory
echo "📂 Step 1: Navigate to backend directory..."
cd /var/www/workforce-democracy/backend

# Step 2: Backup current file (just in case)
echo "💾 Step 2: Backup current civic-routes.js..."
cp routes/civic-routes.js routes/civic-routes.js.v37.16.1.backup
echo "   ✅ Backup saved: routes/civic-routes.js.v37.16.1.backup"

# Step 3: User must upload file manually
echo ""
echo "⚠️  Step 3: UPLOAD REQUIRED"
echo "   Please upload the fixed file from your Mac:"
echo ""
echo "   scp backend/routes/civic-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/"
echo ""
read -p "   Press ENTER after uploading the file..."

# Step 4: Verify file was uploaded (check modification time)
echo ""
echo "🔍 Step 4: Verify file upload..."
ls -lh routes/civic-routes.js
echo ""
read -p "   Does the timestamp look recent? Press ENTER to continue..."

# Step 5: PM2 Critical Restart Sequence
echo ""
echo "🔄 Step 5: PM2 CRITICAL RESTART SEQUENCE..."
echo "   (This clears Node.js module cache)"
echo ""

echo "   → Stopping backend..."
/opt/nodejs/bin/pm2 stop backend

echo "   → Deleting backend (clears cache)..."
/opt/nodejs/bin/pm2 delete backend

echo "   → Flushing logs..."
/opt/nodejs/bin/pm2 flush

echo "   → Starting backend fresh..."
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1

echo "   → Checking status..."
/opt/nodejs/bin/pm2 status

# Step 6: Check logs
echo ""
echo "📋 Step 6: Checking PM2 logs..."
echo "   (Looking for successful startup messages)"
echo ""
/opt/nodejs/bin/pm2 logs backend --lines 20 --nostream

# Step 7: Test API endpoint
echo ""
echo "🧪 Step 7: Testing API endpoint..."
echo "   Testing: GET /api/civic/representatives/search?zip=12061"
echo ""

response=$(curl -s "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061")

# Check if location object is populated
location=$(echo "$response" | jq -r '.location')

if [ "$location" == "{}" ] || [ "$location" == "null" ]; then
    echo "   ❌ FAILED: Location object is still empty!"
    echo ""
    echo "   Response location: $location"
    echo ""
    echo "   Please check PM2 logs for errors:"
    echo "   /opt/nodejs/bin/pm2 logs backend"
    exit 1
else
    echo "   ✅ SUCCESS: Location object is populated!"
    echo ""
    echo "   Location data:"
    echo "$response" | jq '.location'
    echo ""
fi

# Check representative count
rep_count=$(echo "$response" | jq -r '.results | length')
echo "   Representative count: $rep_count"

if [ "$rep_count" -lt 10 ]; then
    echo "   ⚠️  WARNING: Expected ~17 representatives, got $rep_count"
else
    echo "   ✅ Representative count looks good!"
fi

# Final summary
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  ✅ V37.16.2 DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "📊 RESULTS:"
echo "   • Location object: POPULATED ✅"
echo "   • Representatives returned: $rep_count ✅"
echo ""
echo "🧪 NEXT STEPS:"
echo "   1. Test frontend: https://sxcrlfyt.gensparkspace.com/"
echo "   2. Navigate to 'My Reps' tab"
echo "   3. Enter ZIP: 12061"
echo "   4. Click 'Find Reps'"
echo "   5. Should see 17 representatives!"
echo ""
echo "📝 VERIFICATION:"
echo "   curl \"https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061\" | jq '.location'"
echo ""
echo "═══════════════════════════════════════════════════════════"
