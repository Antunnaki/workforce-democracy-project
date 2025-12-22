#!/bin/bash
# Get complete execution trace from server logs

echo "🔬 COMPLETE LOG TRACE - Last Query Execution"
echo "============================================="
echo ""

echo "Getting last 1000 lines and filtering for relevant execution..."
echo ""

ssh root@185.193.126.13 'tail -1000 /var/log/workforce-backend-b.log' > /tmp/backend-logs.txt

echo "📋 Full trace of source gathering:"
grep -E "Progressive|Searching|database|sources|Duck|fallback|Score|Providing|Found|article" /tmp/backend-logs.txt | tail -100

echo ""
echo "============================================="
echo ""
echo "🔍 Checking if searchCandidate was called:"
grep "Searching for candidate" /tmp/backend-logs.txt | tail -5

echo ""
echo "🔍 Checking if fallback activated:"
grep -i "activating.*duck\|fallback" /tmp/backend-logs.txt | tail -5

echo ""
echo "🔍 Checking source counts:"
grep -E "Local database returned|Providing.*validated" /tmp/backend-logs.txt | tail -10

echo ""
echo "✅ Done - check output above"
