#!/bin/bash

# ============================================================================
# DIRECT APPLICATION OF v37.7.0 - SOURCE RELEVANCE IMPROVEMENTS
# ============================================================================

cat << 'DEPLOYMENT_SCRIPT' | ssh root@185.193.126.13 'bash -s'

cd /var/www/workforce-democracy/backend

echo "🚀 Applying v37.7.0 - Source Relevance Improvements"
echo ""

# Create backup
echo "📦 Creating backup..."
cp ai-service.js ai-service-BACKUP-v37.7.0-pre-$(date +%Y%m%d-%H%M%S).js
echo "✅ Backup created"
echo ""

# Find the line number where searchAdditionalSources starts
LINE_NUM=$(grep -n "^async function searchAdditionalSources" ai-service.js | head -1 | cut -d: -f1)

if [ -z "$LINE_NUM" ]; then
    echo "❌ Error: Could not find searchAdditionalSources function"
    exit 1
fi

echo "📍 Found searchAdditionalSources at line $LINE_NUM"

# Create the new functions to insert BEFORE searchAdditionalSources
cat > /tmp/source-relevance-functions.js << 'EOFUNCTIONS'
/**
 * V37.7.0: Score source relevance based on query topic
 * Filters out irrelevant articles (e.g., Boeing for SNAP queries)
 */
function scoreSourceRelevance(source, query) {
    const queryLower = query.toLowerCase();
    const titleLower = (source.title || '').toLowerCase();
    const excerptLower = (source.excerpt || '').toLowerCase();
    const combined = \`\${titleLower} \${excerptLower}\`;
    
    let score = 100; // Base score
    
    // ==================================================================
    // TOPIC-SPECIFIC FILTERING
    // ==================================================================
    
    // SNAP / Food Benefits Queries
    if (queryLower.match(/snap|food stamp|food benefit|food assistance|hunger|food insecurity/)) {
        // Must mention SNAP/food in title or excerpt
        if (!combined.match(/snap|food stamp|food benefit|hunger|food insecurity|nutrition|meal|feeding|ebt/)) {
            score -= 200; // Heavy penalty for completely off-topic
            console.log(\`  ⚠️  "\${source.title.substring(0, 50)}..." - Not SNAP-related (-200)\`);
        }
        
        // Bonus for SNAP-specific content
        if (titleLower.includes('snap') || titleLower.includes('food stamp')) {
            score += 50;
        }
        
        // Penalty for unrelated industries (Boeing, tech, etc.)
        if (combined.match(/boeing|aircraft|airline|aerospace|manufacturing|tech company|silicon valley/)) {
            score -= 150;
            console.log(\`  ⚠️  "\${source.title.substring(0, 50)}..." - Unrelated industry (-150)\`);
        }
    }
    
    // Welfare / Social Programs
    if (queryLower.match(/welfare|medicaid|medicare|social security|housing assistance|tanf|wic/)) {
        const programs = ['medicaid', 'medicare', 'social security', 'housing', 'tanf', 'wic', 'welfare', 'benefit'];
        const hasProgramMention = programs.some(p => combined.includes(p));
        
        if (!hasProgramMention) {
            score -= 150;
            console.log(\`  ⚠️  "\${source.title.substring(0, 50)}..." - Not welfare-related (-150)\`);
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
    console.log(\`📊 Scoring \${sources.length} sources for relevance...\`);
    
    // Score all sources
    const scoredSources = sources.map(source => {
        const score = scoreSourceRelevance(source, query);
        return { source, score };
    });
    
    // Filter out low-scoring sources (below 0)
    const filtered = scoredSources.filter(s => s.score > 0);
    
    console.log(\`  ✅ Kept \${filtered.length}/\${sources.length} sources (removed \${sources.length - filtered.length} irrelevant)\`);
    
    // Sort by score (highest first)
    filtered.sort((a, b) => b.score - a.score);
    
    // Return top results
    const topSources = filtered.slice(0, maxResults).map(s => s.source);
    
    // Log top sources
    if (topSources.length > 0) {
        console.log(\`  🏆 Top sources:\`);
        topSources.slice(0, 3).forEach((source, i) => {
            const trusted = source.trusted ? ' [TRUSTED]' : '';
            console.log(\`     \${i + 1}. \${source.source}\${trusted}: "\${source.title.substring(0, 60)}..."\`);
        });
    }
    
    return topSources;
}

EOFUNCTIONS

# Insert the new functions BEFORE searchAdditionalSources
echo "📝 Inserting relevance scoring functions..."
sed -i "${LINE_NUM}r /tmp/source-relevance-functions.js" ai-service.js

# Now find where searchAdditionalSources returns sources and add filtering
# Find the return statement in searchAdditionalSources
RETURN_LINE=$(awk '/^async function searchAdditionalSources/,/^}$/ {print NR": "$0}' ai-service.js | grep "return sources;" | tail -1 | cut -d: -f1)

if [ -z "$RETURN_LINE" ]; then
    echo "❌ Error: Could not find return statement in searchAdditionalSources"
    exit 1
fi

echo "📍 Found return statement at line $RETURN_LINE"

# Replace the simple return with filtered return
sed -i "${RETURN_LINE}s|    return sources;|    // V37.7.0: Filter and sort by relevance\n    if (sources.length > 0) {\n        const filteredSources = filterAndSortSources(sources, userMessage, 10);\n        console.log(\`🎯 Returning \${filteredSources.length} relevant sources\`);\n        return filteredSources;\n    }\n    \n    return sources;|" ai-service.js

echo "✅ Code updated successfully!"
echo ""

# Verify the changes
echo "🔍 Verifying changes..."
if grep -q "scoreSourceRelevance" ai-service.js && grep -q "filterAndSortSources" ai-service.js; then
    echo "✅ V37.7.0 functions found in ai-service.js"
else
    echo "❌ Error: Functions not found after insertion"
    exit 1
fi

echo ""
echo "♻️  Restarting PM2..."
pm2 restart backend

echo ""
echo "📋 Checking PM2 status..."
pm2 list | grep backend

echo ""
echo "📊 Recent logs (checking for v37.7.0 markers)..."
pm2 logs backend --lines 20 --nostream | grep -E "📊|🏆|🎯|✅"

echo ""
echo "✅ v37.7.0 deployment complete!"
echo ""
echo "🧪 Test with: \"What happens if SNAP benefits are cut?\""
echo "Expected logs:"
echo "  📊 Scoring N sources for relevance..."
echo "  ✅ Kept X/Y sources (removed Z irrelevant)"
echo "  🏆 Top sources:"
echo "  🎯 Returning X relevant sources"

DEPLOYMENT_SCRIPT
