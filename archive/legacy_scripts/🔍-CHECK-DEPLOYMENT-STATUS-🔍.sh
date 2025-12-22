#!/bin/bash

##############################################################################
# 🔍 CHECK DEPLOYMENT STATUS - Verify if v37.9.4 actually deployed
##############################################################################

echo ""
echo "🔍🔍🔍 CHECKING DEPLOYMENT STATUS v37.9.4 🔍🔍🔍"
echo ""

cd /var/www/workforce-democracy/backend/

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 1: California RSS Feeds in rss-service.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "CalMatters" rss-service.js; then
    echo "✅ CalMatters found in rss-service.js"
    echo ""
    echo "California feeds found:"
    grep -i "calmatters\|la times california\|kqed\|sacramento bee" rss-service.js | head -10
else
    echo "❌ CalMatters NOT FOUND in rss-service.js"
    echo "🚨 DEPLOYMENT DID NOT RUN OR FAILED!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 2: SOURCE_THRESHOLD in ai-service.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

threshold=$(grep "const SOURCE_THRESHOLD" ai-service.js)
echo "Found: $threshold"

if grep -q "const SOURCE_THRESHOLD = 25" ai-service.js; then
    echo "✅ SOURCE_THRESHOLD = 25 (correct)"
else
    echo "❌ SOURCE_THRESHOLD is NOT 25"
    echo "🚨 DEPLOYMENT DID NOT RUN OR FAILED!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 3: Policy Research Patterns in ai-service.js"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if grep -q "housing|homelessness|unhoused" ai-service.js; then
    echo "✅ Policy research patterns found"
else
    echo "❌ Policy research patterns NOT FOUND"
    echo "🚨 DEPLOYMENT DID NOT RUN OR FAILED!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 4: Deployment Backups"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Recent backups:"
ls -lt *.backup-* 2>/dev/null | head -5 || echo "❌ No backup files found!"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "CHECK 5: PM2 Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

pm2 list | grep backend

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if grep -q "CalMatters" rss-service.js && grep -q "const SOURCE_THRESHOLD = 25" ai-service.js; then
    echo "✅ Deployment appears to have succeeded"
    echo "   But PM2 may need nuclear restart to clear cache"
    echo ""
    echo "Run nuclear restart:"
    echo "   pm2 stop backend && pm2 delete backend && pkill -9 node"
    echo "   sleep 3"
    echo "   pm2 start server.js --name backend && pm2 save"
else
    echo "❌ Deployment DID NOT run successfully"
    echo "   Files were not modified"
    echo ""
    echo "Need to run deployment script:"
    echo "   chmod +x 🚀-DEPLOY-POLICY-RESEARCH-v37.9.4.sh"
    echo "   ./🚀-DEPLOY-POLICY-RESEARCH-v37.9.4.sh"
fi

echo ""
