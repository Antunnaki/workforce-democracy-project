#!/bin/bash

# ✅ Deep Research Test Script v37.18.7
# Tests if frontend properly sends representative context to backend

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  🧪 Deep Research Context Detection Test                ║"
echo "╔══════════════════════════════════════════════════════════╗"
echo ""

# Configuration
API_BASE="http://localhost:3002"

echo "📋 Test Configuration:"
echo "   Backend: $API_BASE"
echo "   Endpoint: /api/civic/llm-chat/submit"
echo ""

# Test 1: WITH Representative Context (Should trigger deep research)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST 1: Representative Context (SHOULD USE DEEP RESEARCH)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Submitting job with representative context..."

RESPONSE1=$(curl -s -X POST "$API_BASE/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "How has Chuck Schumer voted on healthcare?",
    "zipCode": "12061",
    "context": {
      "viewingContent": {
        "type": "representative",
        "name": "Chuck Schumer",
        "state": "NY"
      }
    }
  }')

JOB_ID1=$(echo $RESPONSE1 | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JOB_ID1" ]; then
  echo "❌ FAILED: Could not get job ID"
  echo "Response: $RESPONSE1"
  exit 1
fi

echo "✅ Job submitted: $JOB_ID1"
echo ""
echo "⏳ Waiting 15 seconds for job to complete..."
sleep 15

echo ""
echo "📊 Fetching result..."
RESULT1=$(curl -s "$API_BASE/api/civic/llm-chat/result/$JOB_ID1")

# Count sources
SOURCE_COUNT1=$(echo $RESULT1 | grep -o '"sources":\[' | wc -l)
CONGRESS_COUNT1=$(echo $RESULT1 | grep -o 'congress.gov' | wc -l)

echo ""
echo "📊 RESULTS:"
echo "   Job ID: $JOB_ID1"
echo "   Congress.gov sources: $CONGRESS_COUNT1"
echo ""

if [ $CONGRESS_COUNT1 -ge 5 ]; then
  echo "✅ PASS: Deep research triggered ($CONGRESS_COUNT1 Congress.gov sources)"
else
  echo "❌ FAIL: Deep research NOT triggered (only $CONGRESS_COUNT1 Congress.gov sources)"
  echo ""
  echo "Full response:"
  echo "$RESULT1" | jq '.' 2>/dev/null || echo "$RESULT1"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 TEST 2: NO Context (SHOULD USE RSS ONLY)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📤 Submitting job without representative context..."

RESPONSE2=$(curl -s -X POST "$API_BASE/api/civic/llm-chat/submit" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about healthcare policy",
    "zipCode": "12061"
  }')

JOB_ID2=$(echo $RESPONSE2 | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)

if [ -z "$JOB_ID2" ]; then
  echo "❌ FAILED: Could not get job ID"
  echo "Response: $RESPONSE2"
  exit 1
fi

echo "✅ Job submitted: $JOB_ID2"
echo ""
echo "⏳ Waiting 15 seconds for job to complete..."
sleep 15

echo ""
echo "📊 Fetching result..."
RESULT2=$(curl -s "$API_BASE/api/civic/llm-chat/result/$JOB_ID2")

# Count sources
CONGRESS_COUNT2=$(echo $RESULT2 | grep -o 'congress.gov' | wc -l)
RSS_COUNT2=$(echo $RESULT2 | grep -o 'democracynow.org\|rss' | wc -l)

echo ""
echo "📊 RESULTS:"
echo "   Job ID: $JOB_ID2"
echo "   Congress.gov sources: $CONGRESS_COUNT2"
echo "   RSS sources: $RSS_COUNT2"
echo ""

if [ $CONGRESS_COUNT2 -le 1 ]; then
  echo "✅ PASS: RSS-only mode (no deep research)"
else
  echo "⚠️  UNEXPECTED: Deep research triggered without rep context"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Test 1 (WITH rep context):"
echo "   Congress.gov sources: $CONGRESS_COUNT1"
if [ $CONGRESS_COUNT1 -ge 5 ]; then
  echo "   Status: ✅ PASS"
else
  echo "   Status: ❌ FAIL"
fi
echo ""
echo "Test 2 (WITHOUT rep context):"
echo "   Congress.gov sources: $CONGRESS_COUNT2"
if [ $CONGRESS_COUNT2 -le 1 ]; then
  echo "   Status: ✅ PASS"
else
  echo "   Status: ⚠️  UNEXPECTED"
fi
echo ""

if [ $CONGRESS_COUNT1 -ge 5 ] && [ $CONGRESS_COUNT2 -le 1 ]; then
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  ✅ ALL TESTS PASSED - DEEP RESEARCH WORKING!           ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  exit 0
else
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  ❌ TESTS FAILED - INVESTIGATE LOGS                     ║"
  echo "╚══════════════════════════════════════════════════════════╝"
  exit 1
fi
