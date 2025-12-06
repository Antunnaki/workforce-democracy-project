#!/bin/bash

# TEST CHAT FIXES
# This script tests if the chat fixes are working correctly

echo "🔍 TESTING CHAT FIXES"
echo "===================="
echo ""

echo "1. Testing backend health endpoint..."
curl -s -X GET "https://api.workforcedemocracyproject.org/api/civic/health"
echo ""

echo "2. Testing AI service health endpoint..."
curl -s -X GET "https://api.workforcedemocracyproject.org/api/civic/llm-health"
echo ""

echo "3. Testing direct chat endpoint..."
curl -s -X POST "https://api.workforcedemocracyproject.org/api/civic/llm-chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, who are you?"}'
echo ""

echo ""
echo "✅ TEST COMPLETE"
echo ""
echo "NEXT STEPS:"
echo "1. Visit https://workforcedemocracyproject.netlify.app"
echo "2. Open browser developer tools (F12)"
echo "3. Click on the chat widget"
echo "4. Send a test message"
echo "5. Check for any errors in the Console tab"
echo "6. Verify that the Network tab shows successful API calls"