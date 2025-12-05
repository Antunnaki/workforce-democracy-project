#!/bin/bash
# Debug why music filtering isn't working

echo "=========================================="
echo "DEBUGGING MUSIC FILTER"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ Checking if filterAndSortSources has pre-filtering:"
echo ""
grep -A 30 "function filterAndSortSources" ai-service.js | head -35
echo ""

echo "2️⃣ Checking where filterAndSortSources is called:"
echo ""
grep -n "filterAndSortSources" ai-service.js | head -10
echo ""

echo "=========================================="
