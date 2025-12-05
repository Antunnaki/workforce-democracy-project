#!/bin/bash
# SSH into VPS and check if bills-routes.js was actually updated

ssh root@185.193.126.13 << 'EOF'

echo "=== Checking bills-routes.js on VPS ==="
echo ""

# Check file modification time
echo "📅 File modification time:"
ls -lh /var/www/workforce-democracy/backend/routes/bills-routes.js

echo ""
echo "🔍 Searching for V37.12.9 markers in the file..."

# Search for new code markers
if grep -q "V37.12.9" /var/www/workforce-democracy/backend/routes/bills-routes.js; then
    echo "✅ Found V37.12.9 marker - FILE IS UPDATED"
else
    echo "❌ V37.12.9 marker NOT FOUND - FILE IS OLD"
fi

if grep -q "Now fetching DETAILS for each bill" /var/www/workforce-democracy/backend/routes/bills-routes.js; then
    echo "✅ Found new diagnostic message - FILE IS UPDATED"
else
    echo "❌ New diagnostic message NOT FOUND - FILE IS OLD"
fi

echo ""
echo "📝 First 20 lines of fetchFederalBills function:"
grep -A 20 "async function fetchFederalBills" /var/www/workforce-democracy/backend/routes/bills-routes.js

EOF
