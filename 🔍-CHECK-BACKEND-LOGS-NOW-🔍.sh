#!/bin/bash
# Check what's ACTUALLY happening in the backend logs

echo "🔍 CHECKING BACKEND EXECUTION PATH"
echo "===================================="
echo ""

echo "1️⃣ Last query execution (full trace):"
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep -A 50 "Mamdani"'

echo ""
echo "2️⃣ Looking for 'Local database returned':"
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "Local database returned"'

echo ""
echo "3️⃣ Looking for 'Activating DuckDuckGo fallback':"
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "Activating DuckDuckGo"'

echo ""
echo "4️⃣ Looking for 'Progressive candidate detected':"
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "progressive candidate"'

echo ""
echo "5️⃣ Looking for 'Searching for candidate':"
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep "Searching for candidate"'

echo ""
echo "6️⃣ Check all console.log from article-search-service:"
ssh root@185.193.126.13 'tail -300 /var/log/workforce-backend-b.log | grep -E "📊|🔍|🦆|💾|⚠️"'

echo ""
echo "✅ Done!"
