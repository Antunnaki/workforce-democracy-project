#!/bin/bash
# Script to verify the CORS configuration update for beta environment

echo "=== Verifying CORS Configuration Update ==="
echo ""

echo "Testing CORS headers with new beta Netlify origin..."
echo "----------------------------------------------------"
curl -sSI -H 'Origin: https://beta-workforcedemocracyproject.netlify.app' \
  https://api-beta.workforcedemocracyproject.org/health | grep -i '^access-control-'
echo ""

echo "Testing root redirect (expect 302)..."
echo "-------------------------------------"
curl -sSI https://api-beta.workforcedemocracyproject.org | head -n1
echo ""

echo "Testing health endpoint (expect JSON response)..."
echo "-----------------------------------------------"
curl -sL https://api-beta.workforcedemocracyproject.org | head -n5
echo ""

echo "=== Verification Complete ==="
echo ""
echo "If the Access-Control-Allow-Origin header shows \"https://beta-workforcedemocracyproject.netlify.app\","
echo "and the other tests show expected responses, then the update was successful."