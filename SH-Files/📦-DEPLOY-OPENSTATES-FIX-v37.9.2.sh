#!/bin/bash

###############################################################################
# 📦 DEPLOY OPENSTATES FIX - v37.9.2
# Workforce Democracy Project
# 
# Purpose: Fix OpenStates API 404 errors by updating jurisdiction format
# Issue: State legislators returning 404 (only federal senators working)
# Fix: Change jurisdiction from "CO" to "ocd-jurisdiction/country:us/state:co/government"
###############################################################################

echo "═══════════════════════════════════════════════════════════════════"
echo "📦 DEPLOYING OPENSTATES FIX - v37.9.2"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Change to backend directory
cd /var/www/workforce-democracy/backend/

# Create backup
echo "💾 Creating backup..."
cp us-representatives.js us-representatives.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# Check current code
echo "🔍 Checking current jurisdiction format..."
echo ""
grep -n "jurisdiction.*people" us-representatives.js | head -5
echo ""

# Apply the fix using sed
echo "🔧 Applying OpenStates jurisdiction format fix..."
echo ""

# The fix: Replace the GraphQL query section
sed -i '535,541d' us-representatives.js

# Insert the fixed code at line 535
sed -i '534a\
        // OpenStates GraphQL API\
        // Jurisdiction format: ocd-jurisdiction/country:us/state:co/government\
        const jurisdiction = `ocd-jurisdiction/country:us/state:${state.toLowerCase()}/government`;\
        \
        const query = `\
            query {\
                people(jurisdiction: "${jurisdiction}", first: ${limit * 2}) {' us-representatives.js

# Add the console.log after the query definition
sed -i '/people(jurisdiction:/a\
        `;\
        \
        console.log(`📍 [OpenStates] Using jurisdiction: ${jurisdiction}`);' us-representatives.js

echo "✅ Fix applied"
echo ""

# Verify the fix
echo "✅ Verifying fix was applied..."
echo ""
grep -A 3 "const jurisdiction" us-representatives.js
echo ""

# Restart PM2
echo "🔄 Restarting PM2 backend..."
pm2 restart backend

echo ""
echo "⏳ Waiting 3 seconds for backend to initialize..."
sleep 3

# Check logs
echo ""
echo "📜 Checking PM2 logs..."
pm2 logs backend --lines 15 --nostream

echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE"
echo "═══════════════════════════════════════════════════════════════════"
echo ""
echo "🧪 Test the fix with:"
echo "   curl \"http://185.193.126.13:3001/api/civic/representatives/search?zip=80204\""
echo ""
echo "Expected: Federal senators + Colorado state legislators"
echo ""
