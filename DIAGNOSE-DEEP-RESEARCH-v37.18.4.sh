#!/bin/bash

##########################################################
# 🔍 DIAGNOSE DEEP RESEARCH v37.18.4
# Purpose: Check if deep-research.js has the fix applied
##########################################################

echo "🔍 Diagnosing Deep Research v37.18.4..."
echo ""

# Check if deep-research.js exists
if [ ! -f "deep-research.js" ]; then
  echo "❌ ERROR: deep-research.js not found in current directory"
  exit 1
fi

echo "✅ Found: deep-research.js"
echo ""

# Check for key functions
echo "📋 Checking for key functions..."
echo ""

# Check for searchRepresentativeVotingRecord
if grep -q "searchRepresentativeVotingRecord" deep-research.js; then
  echo "✅ Found: searchRepresentativeVotingRecord function"
else
  echo "❌ Missing: searchRepresentativeVotingRecord function"
  exit 1
fi

# Check for searchCongressGovBills
if grep -q "searchCongressGovBills" deep-research.js; then
  echo "✅ Found: searchCongressGovBills function"
else
  echo "❌ Missing: searchCongressGovBills function"
  exit 1
fi

echo ""
echo "🔍 Checking if searchCongressGovBills is being called..."
echo ""

# Check if searchCongressGovBills is called in searchRepresentativeVotingRecord
if grep -A 50 "async function searchRepresentativeVotingRecord" deep-research.js | grep -q "searchCongressGovBills"; then
  echo "✅ searchCongressGovBills IS being called"
  echo ""
  echo "📍 Location in file:"
  grep -n "searchCongressGovBills" deep-research.js | head -1
  echo ""
  echo "✨ Deep Research appears to be properly configured!"
else
  echo "❌ searchCongressGovBills is NOT being called"
  echo ""
  echo "🔧 This needs to be fixed!"
  echo "   The fix will insert the call to searchCongressGovBills"
  exit 1
fi

echo ""
echo "✅ Diagnosis complete - Deep Research is properly configured"
