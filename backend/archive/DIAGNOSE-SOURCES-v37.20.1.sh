#!/bin/bash
#
# DIAGNOSE WHY SOURCES AREN'T FLOWING THROUGH
# v37.20.1
#

echo "=========================================="
echo "DIAGNOSTIC: Sources Flow Analysis"
echo "=========================================="
echo ""

echo "1️⃣ Checking MongoDB article count..."
ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-b/backend && node -e "const mongoose = require(\"mongoose\"); const Article = require(\"./models/Article\"); mongoose.connect(\"mongodb://localhost:27017/workforce_democracy\").then(async () => { const count = await Article.countDocuments(); console.log(\"Total articles:\", count); const mamdani = await Article.countDocuments({ \$or: [{ title: { \$regex: \"mamdani\", \$options: \"i\" } }, { fullText: { \$regex: \"mamdani\", \$options: \"i\" } }] }); console.log(\"Mamdani articles:\", mamdani); process.exit(0); });"'

echo ""
echo "2️⃣ Checking backend logs for MongoDB search..."
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log | grep -A 5 "🗄️  Searching local MongoDB"'

echo ""
echo "3️⃣ Checking for relevance filtering..."
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log | grep -E "Filtered out|MIN_RELEVANCE|Providing.*validated sources"'

echo ""
echo "4️⃣ Checking for version loaded..."
ssh root@185.193.126.13 'tail -100 /var/log/workforce-backend-b.log | grep "v37.20"'

echo ""
echo "=========================================="
echo "DIAGNOSIS COMPLETE"
echo "=========================================="
