#!/bin/bash

# ============================================================================
# Deploy v37.7.0 - Source Relevance Filtering (from v37.6.1)
# ============================================================================
# 
# Prerequisites: v37.6.1 must be running (policy keywords already added)
# 
# This script adds:
# 1. scoreSourceRelevance() function
# 2. filterAndSortSources() function  
# 3. Updates searchAdditionalSources() to use filtering
#
# Run this ON THE SERVER: bash DEPLOY-v37.7.0-SOURCE-FILTERING.sh
# ============================================================================

cd /var/www/workforce-democracy/backend

echo "🚀 Deploying v37.7.0 - Source Relevance Filtering"
echo ""

# Verify we have the right file
if [ ! -f "ai-service.js" ]; then
    echo "❌ Error: ai-service.js not found"
    exit 1
fi

# Verify v37.6.1 is present (policy keywords exist)
if ! grep -q "isPolicyQuery" ai-service.js; then
    echo "❌ Error: v37.6.1 policy keywords not found!"
    echo "Please ensure v37.6.1 is deployed first."
    exit 1
fi

echo "✅ v37.6.1 detected (policy keywords present)"
echo ""

# Create backup
BACKUP_FILE="ai-service-BACKUP-v37.7.0-$(date +%Y%m%d-%H%M%S).js"
cp ai-service.js "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# Stop PM2
echo "🛑 Stopping PM2..."
pm2 stop backend
echo ""

# ============================================================================
# Add source relevance functions
# ============================================================================

echo "📝 Adding source relevance functions..."

# Find where to insert (before searchAdditionalSources)
SEARCH_LINE=$(grep -n "^async function searchAdditionalSources" ai-service.js | head -1 | cut -d: -f1)

if [ -z "$SEARCH_LINE" ]; then
    echo "❌ Error: Could not find searchAdditionalSources function"
    pm2 start server.js --name backend
    exit 1
fi

echo "   Inserting at line $((SEARCH_LINE - 1))"

# Create the functions file
cat > /tmp/v37_7_0_source_relevance.js << 'EOFFUNCTIONS'
/**
 * V37.7.0: Score source relevance based on query topic
 * Filters out irrelevant articles (e.g., Boeing for SNAP queries)
 */
function scoreSourceRelevance(source, query) {
    const queryLower = query.toLowerCase();
    const titleLower = (source.title || '').toLowerCase();
    const excerptLower = (source.excerpt || '').toLowerCase();
    const combined = `${titleLower} ${excerptLower}`;
    
    let score = 100; // Base score
    
    // ==================================================================
    // TOPIC-SPECIFIC FILTERING
    // ==================================================================
    
    // SNAP / Food Benefits Queries
    if (queryLower.match(/snap|food stamp|food benefit|food assistance|hunger|food insecurity/)) {
        // Must mention SNAP/food in title or excerpt
        if (!combined.match(/snap|food stamp|food benefit|hunger|food insecurity|nutrition|meal|feeding|ebt/)) {
            score -= 200; // Heavy penalty for completely off-topic
            console.log(`  ⚠️  "${source.title.substring(0, 50)}..." - Not SNAP-related (-200)`);
        }
        
        // Bonus for SNAP-specific content
        if (titleLower.includes('snap') || titleLower.includes('food stamp')) {
            score += 50;
        }
        
        // Penalty for unrelated industries (Boeing, tech, etc.)
        if (combined.match(/boeing|aircraft|airline|aerospace|manufacturing|tech company|silicon valley/)) {
            score -= 150;
            console.log(`  ⚠️  "${source.title.substring(0, 50)}..." - Unrelated industry (-150)`);
        }
    }
    
    // Welfare / Social Programs
    if (queryLower.match(/welfare|medicaid|medicare|social security|housing assistance|tanf|wic/)) {
        const programs = ['medicaid', 'medicare', 'social security', 'housing', 'tanf', 'wic', 'welfare', 'benefit'];
        const hasProgramMention = programs.some(p => combined.includes(p));
        
        if (!hasProgramMention) {
            score -= 150;
            console.log(`  ⚠️  "${source.title.substring(0, 50)}..." - Not welfare-related (-150)`);
        }
    }
    
    // Labor / Union Queries
    if (queryLower.match(/union|strike|worker|labor|wage|overtime|workplace|osha/)) {
        if (!combined.match(/union|strike|worker|labor|wage|overtime|workplace|osha|employment|job/)) {
            score -= 150;
        }
    }
    
    // Healthcare Queries
    if (queryLower.match(/healthcare|health care|insurance|hospital|medical|doctor|prescription/)) {
        if (!combined.match(/health|hospital|medical|doctor|insurance|prescription|patient|care/)) {
            score -= 150;
        }
    }
    
    // ==================================================================
    // DOMAIN REPUTATION BOOST
    // ==================================================================
    
    const trustedDomains = [
        'democracynow.org',
        'truthout.org',
        'commondreams.org',
        'jacobin.com',
        'theintercept.com',
        'propublica.org',
        'thenation.com',
        'inthesetimes.com',
        'labornotes.org'
    ];
    
    const sourceUrl = source.url || '';
    const isTrusted = trustedDomains.some(domain => sourceUrl.includes(domain));
    
    if (isTrusted) {
        score += 75; // Significant boost for independent progressive media
        source.trusted = true; // Mark as trusted
    }
    
    // ==================================================================
    // FRESHNESS BOOST
    // ==================================================================
    
    if (source.date) {
        try {
            const articleDate = new Date(source.date);
            const ageInDays = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24);
            
            if (ageInDays < 7) score += 30;      // Last week
            else if (ageInDays < 30) score += 15; // Last month
            else if (ageInDays < 90) score += 5;  // Last 3 months
        } catch (e) {
            // Ignore date parsing errors
        }
    }
    
    return score;
}

/**
 * V37.7.0: Filter and sort sources by relevance
 */
function filterAndSortSources(sources, query, maxResults = 10) {
    console.log(`📊 Scoring ${sources.length} sources for relevance...`);
    
    // Score all sources
    const scoredSources = sources.map(source => {
        const score = scoreSourceRelevance(source, query);
        return { source, score };
    });
    
    // Filter out low-scoring sources (below 0)
    const filtered = scoredSources.filter(s => s.score > 0);
    
    console.log(`  ✅ Kept ${filtered.length}/${sources.length} sources (removed ${sources.length - filtered.length} irrelevant)`);
    
    // Sort by score (highest first)
    filtered.sort((a, b) => b.score - a.score);
    
    // Return top results
    const topSources = filtered.slice(0, maxResults).map(s => s.source);
    
    // Log top sources
    if (topSources.length > 0) {
        console.log(`  🏆 Top sources:`);
        topSources.slice(0, 3).forEach((source, i) => {
            const trusted = source.trusted ? ' [TRUSTED]' : '';
            console.log(`     ${i + 1}. ${source.source}${trusted}: "${source.title.substring(0, 60)}..."`);
        });
    }
    
    return topSources;
}

EOFFUNCTIONS

# Insert functions before searchAdditionalSources
INSERT_LINE=$((SEARCH_LINE - 1))
sed -i "${INSERT_LINE}r /tmp/v37_7_0_source_relevance.js" ai-service.js

echo "✅ Source relevance functions added"
echo ""

# ============================================================================
# Update searchAdditionalSources to use filtering
# ============================================================================

echo "📝 Updating searchAdditionalSources() to use filtering..."

# Find the return statement in searchAdditionalSources
# We need to find the line that says "return sources;" inside searchAdditionalSources
FUNC_START=$(grep -n "^async function searchAdditionalSources" ai-service.js | head -1 | cut -d: -f1)
FUNC_END=$(awk "/^async function searchAdditionalSources/,/^}$/ {if (/^}$/) {print NR; exit}}" ai-service.js)

# Find return sources; within that function
RETURN_SOURCES=$(awk "NR >= $FUNC_START && NR <= $FUNC_END && /return sources;/ {print NR; exit}" ai-service.js)

if [ -z "$RETURN_SOURCES" ]; then
    echo "❌ Error: Could not find 'return sources;' in searchAdditionalSources"
    pm2 start server.js --name backend
    exit 1
fi

echo "   Found 'return sources;' at line $RETURN_SOURCES"

# Replace the return statement
sed -i "${RETURN_SOURCES}c\\    // V37.7.0: Filter and sort by relevance\\n    if (sources.length > 0) {\\n        const filteredSources = filterAndSortSources(sources, userMessage, 10);\\n        console.log(\`🎯 Returning \${filteredSources.length} relevant sources\`);\\n        return filteredSources;\\n    }\\n    \\n    return sources;" ai-service.js

echo "✅ searchAdditionalSources() updated"
echo ""

# ============================================================================
# Verify and restart
# ============================================================================

echo "🧪 Testing syntax..."
if node -c ai-service.js 2>/dev/null; then
    echo "✅ Syntax valid!"
else
    echo "❌ Syntax error detected!"
    echo "Restoring backup..."
    cp "$BACKUP_FILE" ai-service.js
    pm2 start server.js --name backend
    exit 1
fi

echo ""
echo "🔄 Restarting PM2 with cache clear..."
pm2 flush
pm2 delete backend
pm2 start server.js --name backend

sleep 3

echo ""
echo "✅✅✅ v37.7.0 Source Relevance Deployed! ✅✅✅"
echo ""
echo "📋 What was added:"
echo "  ✅ scoreSourceRelevance() function"
echo "  ✅ filterAndSortSources() function"
echo "  ✅ searchAdditionalSources() now filters results"
echo ""
echo "🧪 Test with: \"What happens if SNAP benefits are cut?\""
echo ""
echo "Expected backend logs:"
echo "  📊 Scoring N sources for relevance..."
echo "  ⚠️  \"Boeing...\" - Not SNAP-related (-200)"
echo "  ✅ Kept X/Y sources (removed Z irrelevant)"
echo "  🏆 Top sources:"
echo "     1. Democracy Now [TRUSTED]: \"...\""
echo "  🎯 Returning X relevant sources"
echo ""
echo "📊 Check logs now:"
echo "   pm2 logs backend --lines 50"
