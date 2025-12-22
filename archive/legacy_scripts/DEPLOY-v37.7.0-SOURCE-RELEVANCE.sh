#!/bin/bash

# ============================================================================
# DEPLOY v37.7.0 - SOURCE RELEVANCE IMPROVEMENTS
# ============================================================================
# 
# Features:
# - Topic-specific keyword filtering (SNAP, welfare, labor, healthcare)
# - Domain reputation boost (Democracy Now, Truthout, Common Dreams)
# - Freshness scoring (recent articles ranked higher)
# - Heavy penalties for off-topic articles (Boeing for SNAP queries)
#
# Expected Result:
# - SNAP queries will no longer return Boeing articles
# - Independent progressive media ranked higher
# - More relevant sources overall
#
# ============================================================================

echo "🚀 Deploying v37.7.0 - Source Relevance Improvements"
echo ""

# Create backup
echo "📦 Creating backup..."
cp backend/ai-service.js backend/ai-service-BACKUP-v37.6.0-$(date +%Y%m%d-%H%M%S).js
echo "✅ Backup created"
echo ""

# The ai-service.js file has already been updated locally with:
# 1. scoreSourceRelevance() function (lines ~870-990)
# 2. filterAndSortSources() function (lines ~995-1020)
# 3. Updated searchAdditionalSources() to use filtering (line ~1105)

echo "📝 Changes in v37.7.0:"
echo "  - Added scoreSourceRelevance() function with topic-specific filtering"
echo "  - Added filterAndSortSources() function to rank sources"
echo "  - SNAP queries: Heavy penalty (-200) for non-SNAP content"
echo "  - Industry filter: -150 penalty for Boeing/aerospace/tech companies"
echo "  - Domain boost: +75 for Democracy Now, Truthout, Common Dreams, etc."
echo "  - Freshness boost: +30 for last 7 days, +15 for last month"
echo ""

echo "🔍 Implementation Summary:"
echo ""
echo "Topic-Specific Filters Added:"
echo "  • SNAP/Food Benefits - Must mention food/hunger/SNAP"
echo "  • Welfare/Social Programs - Must mention benefits/programs"
echo "  • Labor/Union - Must mention workers/unions/strikes"
echo "  • Healthcare - Must mention health/medical/insurance"
echo ""
echo "Trusted Domains (+75 boost):"
echo "  • democracynow.org"
echo "  • truthout.org"
echo "  • commondreams.org"
echo "  • jacobin.com"
echo "  • theintercept.com"
echo "  • propublica.org"
echo "  • thenation.com"
echo "  • inthesetimes.com"
echo "  • labornotes.org"
echo ""

echo "⚠️  DEPLOYMENT INSTRUCTIONS:"
echo ""
echo "1. Upload the modified backend/ai-service.js to VPS"
echo "2. SSH to VPS: ssh root@185.193.126.13"
echo "3. Navigate to: cd /var/www/workforce-democracy/backend"
echo "4. Restart PM2: pm2 restart backend"
echo "5. Check logs: pm2 logs backend --lines 50"
echo ""
echo "Expected log markers:"
echo "  📊 Scoring N sources for relevance..."
echo "  ✅ Kept X/Y sources (removed Z irrelevant)"
echo "  🏆 Top sources:"
echo "  🎯 Returning X relevant sources"
echo ""

echo "✅ v37.7.0 deployment guide complete!"
echo ""
echo "📄 Next: Upload ai-service.js to VPS and restart PM2"
