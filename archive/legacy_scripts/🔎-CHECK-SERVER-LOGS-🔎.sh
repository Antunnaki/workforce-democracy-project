#!/bin/bash
# Check server logs for exact execution path

echo "🔎 CHECKING SERVER LOGS FOR EXECUTION PATH"
echo "=========================================="
echo ""

echo "📋 Last 500 lines of backend logs (filtered for relevant info):"
echo ""

ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -E "progressive|article|database|search|Mamdani|source|Duck"'

echo ""
echo "=========================================="
echo "🔍 Looking for specific indicators:"
echo ""

echo "1. Progressive candidate detection:"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -i "progressive candidate"'

echo ""
echo "2. Local database search:"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -i "Searching local article database"'

echo ""
echo "3. Database results:"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -i "Local database returned"'

echo ""
echo "4. DuckDuckGo fallback activation:"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -i "Activating DuckDuckGo"'

echo ""
echo "5. Any errors:"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -iE "error|failed|exception"'

echo ""
echo "✅ Log check complete!"
