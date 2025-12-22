#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════"
echo "🔍 Checking Current OpenStates Code on VPS"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

echo "📂 Checking us-representatives.js file..."
echo ""

echo "🔍 Looking for jurisdiction format around line 537..."
sed -n '520,580p' /var/www/workforce-democracy/backend/us-representatives.js | grep -A 5 -B 5 "jurisdiction"

echo ""
echo "═══════════════════════════════════════════════════════════════════"
