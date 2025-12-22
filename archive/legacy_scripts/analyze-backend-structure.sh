#!/bin/bash

# Diagnostic Script for AI Service Structure Analysis
# Purpose: Find ACTUAL insertion points for iterative search and music filter

echo "============================================"
echo " AI-SERVICE.JS STRUCTURE ANALYSIS"
echo "============================================"
echo ""

cd /var/www/workforce-democracy/backend || exit 1

# Check if file exists
if [ ! -f "ai-service.js" ]; then
    echo "❌ ERROR: ai-service.js not found!"
    exit 1
fi

echo "✅ Found ai-service.js"
echo ""

# 1. Find analyzeWithAI function and source search patterns
echo "=== 1. ANALYZING analyzeWithAI FUNCTION ==="
echo "Looking for source search patterns..."
echo ""

grep -n "sources.*=.*await\|searchAdditional\|needsCurrentInfo" ai-service.js | head -20

echo ""
echo "=== Context around source assignments ==="
grep -B10 -A10 "sources.*=.*await searchAdditional" ai-service.js | head -40

echo ""
echo ""

# 2. Find scoreSourceRelevance function
echo "=== 2. ANALYZING scoreSourceRelevance FUNCTION ==="
echo "Looking for 'combined' variable definition..."
echo ""

grep -n "function scoreSourceRelevance" ai-service.js
echo ""

# Get line number and show context
SCORE_LINE=$(grep -n "^function scoreSourceRelevance" ai-service.js | cut -d: -f1)
if [ -n "$SCORE_LINE" ]; then
    echo "Found scoreSourceRelevance at line $SCORE_LINE"
    echo ""
    echo "First 50 lines of function:"
    sed -n "${SCORE_LINE},$((SCORE_LINE + 50))p" ai-service.js
fi

echo ""
echo ""

# 3. Search for 'combined' variable
echo "=== 3. SEARCHING FOR 'combined' VARIABLE ==="
grep -n "combined.*=" ai-service.js | head -10

echo ""
echo ""

# 4. Check if article scraper import exists
echo "=== 4. CHECKING ARTICLE SCRAPER INTEGRATION ==="
grep -n "article-scraper\|scrapeMultipleArticles" ai-service.js

echo ""
echo ""

# 5. Find gap analysis function (if it exists)
echo "=== 5. CHECKING FOR GAP ANALYSIS FUNCTION ==="
grep -n "analyzeSourceGaps" ai-service.js

echo ""
echo ""

# 6. Get file statistics
echo "=== 6. FILE STATISTICS ==="
wc -l ai-service.js
ls -lh ai-service.js

echo ""
echo ""

# 7. Check for recent backups
echo "=== 7. RECENT BACKUP FILES ==="
ls -lth ai-service*.js | head -5

echo ""
echo ""

# 8. Show structure summary
echo "=== 8. FUNCTION STRUCTURE SUMMARY ==="
echo "All function definitions:"
grep -n "^async function\|^function " ai-service.js | head -30

echo ""
echo "============================================"
echo " ANALYSIS COMPLETE"
echo "============================================"
echo ""
echo "📋 Please share the output above so we can:"
echo "  1. Find where sources are actually searched"
echo "  2. Locate the scoreSourceRelevance function"
echo "  3. Find where to insert gap analysis"
echo "  4. Find where to insert music filter"
echo ""
