#!/bin/bash

# ======================================================================
# DEEP RESEARCH DIAGNOSTIC SCRIPT - v37.18.4
# ======================================================================
# Purpose: Diagnose why Deep Research is not calling Congress.gov API
# Date: 2025-11-26
# ======================================================================

echo "🔍 DEEP RESEARCH DIAGNOSTIC v37.18.4"
echo "===================================="
echo ""

cd /var/www/workforce-democracy/version-b/backend

echo "1️⃣ CHECK: deep-research.js exists and has searchRepresentativeVotingRecord"
echo "-----------------------------------------------------------------------"
if [ -f "deep-research.js" ]; then
    echo "✅ deep-research.js EXISTS"
    echo ""
    echo "📋 Function exports:"
    grep -n "module.exports\|exports\." deep-research.js | head -5
    echo ""
    echo "📋 searchRepresentativeVotingRecord function:"
    grep -n "async function searchRepresentativeVotingRecord\|searchRepresentativeVotingRecord:" deep-research.js
    echo ""
    echo "📋 searchCongressGovBills calls:"
    grep -n "searchCongressGovBills\|CONGRESS_API_BASE" deep-research.js | head -10
else
    echo "❌ deep-research.js NOT FOUND"
fi

echo ""
echo "2️⃣ CHECK: ai-service.js imports and calls Deep Research"
echo "-------------------------------------------------------"
grep -n "require.*deep-research" ai-service.js
echo ""
echo "📋 Deep Research trigger in ai-service.js:"
grep -n "enableDeepResearch.*searchRepresentativeVotingRecord" ai-service.js
echo ""

echo ""
echo "3️⃣ CHECK: civic-llm-async.js passes enableDeepResearch"
echo "--------------------------------------------------------"
grep -n "enableDeepResearch.*true" civic-llm-async.js
echo ""

echo ""
echo "4️⃣ CHECK: Recent logs for Deep Research activity"
echo "---------------------------------------------------"
tail -100 /var/log/workforce-backend-b.log | grep -i "deep research\|congress.gov\|searchRepresentativeVotingRecord" | tail -20
echo ""

echo ""
echo "5️⃣ CHECK: Environment variables for Congress API"
echo "---------------------------------------------------"
grep "CONGRESS_API_KEY" /var/www/workforce-democracy/version-b/backend/.env 2>/dev/null || echo "⚠️  No .env file or CONGRESS_API_KEY not set"
echo ""

echo ""
echo "6️⃣ CRITICAL: Check if searchRepresentativeVotingRecord actually calls searchCongressGovBills"
echo "----------------------------------------------------------------------------------------"
sed -n '/async function searchRepresentativeVotingRecord/,/^}/p' deep-research.js | grep -n "searchCongressGovBills\|congressBills"
echo ""

echo ""
echo "🎯 ANALYSIS COMPLETE"
echo "===================="
echo ""
echo "Next step: If searchCongressGovBills is NOT being called inside"
echo "searchRepresentativeVotingRecord, that's your bug."
echo ""
echo "Expected: searchRepresentativeVotingRecord should:"
echo "  1. Call searchCongressGovBills(query, representative)"
echo "  2. Push results to sources array"
echo "  3. Return sources"
echo ""
