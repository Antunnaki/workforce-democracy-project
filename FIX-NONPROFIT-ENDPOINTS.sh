#!/bin/bash
################################################################################
# NONPROFIT ENDPOINTS VERIFICATION AND FIX
# This will check what went wrong and fix it
################################################################################

echo "============================================"
echo "🔍 Diagnosing Nonprofit Endpoint Issue"
echo "============================================"

cd /var/www/workforce-backend

echo ""
echo "Step 1: Check if axios require was added..."
if grep -q "const axios = require('axios')" server.js; then
    echo "✅ axios require is present"
else
    echo "❌ axios require is MISSING"
fi

echo ""
echo "Step 2: Check if nonprofit endpoints exist in server.js..."
if grep -q "app.get('/api/nonprofits/search'" server.js; then
    echo "✅ Nonprofit search endpoint found in server.js"
    
    # Count how many times it appears
    COUNT=$(grep -c "app.get('/api/nonprofits/search'" server.js)
    echo "   Found $COUNT occurrence(s)"
    
    # Show the line numbers
    echo ""
    echo "   Line numbers where it appears:"
    grep -n "app.get('/api/nonprofits/search'" server.js
else
    echo "❌ Nonprofit search endpoint NOT FOUND in server.js"
fi

echo ""
echo "Step 3: Check where app.listen is located..."
if grep -q "app.listen" server.js; then
    echo "✅ app.listen found"
    grep -n "app.listen" server.js | head -5
else
    echo "⚠️  app.listen not found - checking for module.exports..."
    if grep -q "module.exports" server.js; then
        echo "✅ module.exports found"
        grep -n "module.exports" server.js | head -5
    fi
fi

echo ""
echo "Step 4: Show last 30 lines of server.js..."
echo "==========================================="
tail -30 server.js
echo "==========================================="

echo ""
echo "============================================"
echo "📋 Diagnosis Complete"
echo "============================================"
echo ""
echo "NEXT STEP: Please copy the output above and share it."
echo "I'll then provide the exact fix commands."
