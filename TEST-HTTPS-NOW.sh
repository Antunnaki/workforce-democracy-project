#!/bin/bash
# Quick HTTPS Testing Script
# Domain: api.workforcedemocracyproject.org

echo "🧪 Testing HTTPS Endpoints"
echo "=========================="
echo ""

echo "Test 1: Health Check"
echo "URL: https://api.workforcedemocracyproject.org/api/civic/llm-health"
curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health
echo ""
echo ""

echo "Test 2: ZIP Code Search"
echo "URL: https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061"
curl -s "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061"
echo ""
echo ""

echo "Test 3: LLM Chat"
echo "URL: https://api.workforcedemocracyproject.org/api/civic/llm-chat"
curl -s -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is democracy?","context":"civic_education"}'
echo ""
echo ""

echo "Test 4: Verify SSL Certificate"
echo "Domain: api.workforcedemocracyproject.org:443"
openssl s_client -connect api.workforcedemocracyproject.org:443 -servername api.workforcedemocracyproject.org 2>/dev/null | grep -E "Verify return code:|subject=|issuer="
echo ""

echo "=========================="
echo "✅ Testing complete!"
