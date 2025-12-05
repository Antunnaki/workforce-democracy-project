#!/bin/bash
# Show the calculateRelevanceScore function

echo "=========================================="
echo "RELEVANCE SCORE CALCULATION"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "📋 Showing calculateRelevanceScore function (lines 298-390):"
echo ""
sed -n '298,390p' keyword-extraction.js | cat -n
echo ""

echo "=========================================="
