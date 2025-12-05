#!/bin/bash
# Comprehensive diagnostic to find exactly where sources are being lost

echo "🚨 COMPREHENSIVE DIAGNOSTIC - Finding Where Sources Disappear"
echo "=============================================================="
echo ""

echo "Step 1: Check if Progressive candidate was detected"
echo "---------------------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Progressive candidate detected"' | tail -2
echo ""

echo "Step 2: Check if local database search was triggered"
echo "----------------------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Searching local article database"' | tail -2
echo ""

echo "Step 3: Check searchCandidate execution"
echo "---------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/www/workforce-democracy/version-b.log | grep "Searching for candidate"' | tail -2
echo ""

echo "Step 4: Check local database results"
echo "------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Local database returned"' | tail -2
echo ""

echo "Step 5: Check if DuckDuckGo fallback activated"
echo "----------------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep -i "Activating DuckDuckGo"' | tail -2
echo ""

echo "Step 6: Check total sources found"
echo "---------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Found.*total sources"' | tail -2
echo ""

echo "Step 7: Check sources after filterAndSortSources"
echo "------------------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Returning.*relevant sources"' | tail -2
echo ""

echo "Step 8: Check source relevance scores"
echo "-------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Source relevance scores" -A 15' | tail -20
echo ""

echo "Step 9: Check sources after MIN_RELEVANCE_FOR_LLM filter"
echo "--------------------------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Providing.*validated sources"' | tail -2
echo ""

echo "Step 10: Check if any sources were filtered out"
echo "-----------------------------------------------"
ssh root@185.193.126.13 'tail -500 /var/log/workforce-backend-b.log | grep "Filtered out.*low-relevance"' | tail -5
echo ""

echo "=============================================================="
echo "✅ Diagnostic complete - analyze output above to find where sources are lost"
