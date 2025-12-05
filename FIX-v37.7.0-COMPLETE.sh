#!/bin/bash

# ============================================================================
# COMPLETE FIX for v37.7.0 - Source Relevance + Policy Keywords
# ============================================================================
# 
# This script:
# 1. Adds missing policy keywords to needsCurrentInfo() 
# 2. Adds scoreSourceRelevance() function
# 3. Adds filterAndSortSources() function  
# 4. Updates searchAdditionalSources() to use filtering
#
# Run this ON THE SERVER after creating a backup
# ============================================================================

echo "🚀 Applying v37.7.0 - Complete Fix (Policy Keywords + Source Relevance)"
echo ""

# Verify we're in the right directory
if [ ! -f "ai-service.js" ]; then
    echo "❌ Error: ai-service.js not found in current directory"
    echo "Please run: cd /var/www/workforce-democracy/backend"
    exit 1
fi

# Create backup
echo "📦 Creating backup..."
BACKUP_FILE="ai-service-BACKUP-before-v37.7.0-$(date +%Y%m%d-%H%M%S).js"
cp ai-service.js "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# ============================================================================
# STEP 1: Add policy keywords to needsCurrentInfo()
# ============================================================================

echo "📝 Step 1: Adding policy keywords to needsCurrentInfo()..."

# Find line number of the return statement in needsCurrentInfo
RETURN_LINE=$(grep -n "return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;" ai-service.js | cut -d: -f1)

if [ -z "$RETURN_LINE" ]; then
    echo "❌ Error: Could not find return statement in needsCurrentInfo()"
    exit 1
fi

echo "   Found return statement at line $RETURN_LINE"

# Insert policy keywords check BEFORE the return statement
sed -i "${RETURN_LINE}i\\    // Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1\\n    const isPolicyQuery = messageLower.match(\\n        /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/\\n    );\\n" ai-service.js

# Update the return statement to include isPolicyQuery
sed -i "${RETURN_LINE}s/return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;/    /" ai-service.js

# Add the new return statement after deleting the old one
NEW_RETURN_LINE=$((RETURN_LINE + 4))
sed -i "${NEW_RETURN_LINE}a\\    return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPolicyQuery;" ai-service.js

echo "✅ Policy keywords added to needsCurrentInfo()"
echo ""

# ============================================================================  
# STEP 2: Add source relevance functions BEFORE searchAdditionalSources
# ============================================================================

echo "📝 Step 2: Adding source relevance functions..."

# Find line number where searchAdditionalSources starts
SEARCH_LINE=$(grep -n "^async function searchAdditionalSources" ai-service.js | head -1 | cut -d: -f1)

if [ -z "$SEARCH_LINE" ]; then
    echo "❌ Error: Could not find searchAdditionalSources function"
    exit 1
fi

echo "   Found searchAdditionalSources at line $SEARCH_LINE"

# Create temp file with the new functions
cat > /tmp/v37_7_0_functions.js << 'EOFFUNCTIONS'
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

# Insert the functions BEFORE searchAdditionalSources
INSERT_LINE=$((SEARCH_LINE - 1))
sed -i "${INSERT_LINE}r /tmp/v37_7_0_functions.js" ai-service.js

echo "✅ Source relevance functions added"
echo ""

# ============================================================================
# STEP 3: Update searchAdditionalSources to use filtering
# ============================================================================

echo "📝 Step 3: Updating searchAdditionalSources to use filtering..."

# Find the return statement in searchAdditionalSources  
# We need to find it carefully - it's inside a try-catch
SEARCH_RETURN=$(awk '/^async function searchAdditionalSources/,/^}$/ {if (/^    return sources;$/) print NR}' ai-service.js | tail -1)

if [ -z "$SEARCH_RETURN" ]; then
    echo "❌ Error: Could not find return statement in searchAdditionalSources"
    exit 1
fi

echo "   Found return statement at line $SEARCH_RETURN"

# Replace the simple return with filtered return
sed -i "${SEARCH_RETURN}s|^    return sources;|    // V37.7.0: Filter and sort by relevance\n    if (sources.length > 0) {\n        const filteredSources = filterAndSortSources(sources, userMessage, 10);\n        console.log(\`🎯 Returning \${filteredSources.length} relevant sources\`);\n        return filteredSources;\n    }\n    \n    return sources;|" ai-service.js

echo "✅ searchAdditionalSources updated to use filtering"
echo ""

# ============================================================================
# STEP 4: Verify changes
# ============================================================================

echo "🔍 Verifying changes..."

# Check for policy keywords
if grep -q "isPolicyQuery" ai-service.js; then
    echo "✅ Policy keywords found"
else
    echo "❌ Policy keywords NOT found"
    exit 1
fi

# Check for new functions
if grep -q "scoreSourceRelevance" ai-service.js && grep -q "filterAndSortSources" ai-service.js; then
    echo "✅ Source relevance functions found"
else
    echo "❌ Source relevance functions NOT found"
    exit 1
fi

# Check for filtering in searchAdditionalSources
if grep -q "filterAndSortSources(sources, userMessage" ai-service.js; then
    echo "✅ Filtering integrated in searchAdditionalSources"
else
    echo "❌ Filtering NOT integrated"
    exit 1
fi

# Test syntax
echo ""
echo "🧪 Testing syntax..."
if node -c ai-service.js 2>/dev/null; then
    echo "✅ Syntax is valid!"
else
    echo "❌ Syntax error detected!"
    echo "Restoring backup..."
    cp "$BACKUP_FILE" ai-service.js
    exit 1
fi

echo ""
echo "✅✅✅ v37.7.0 Complete Fix Applied Successfully! ✅✅✅"
echo ""
echo "📋 Summary:"
echo "  ✅ Policy keywords added to needsCurrentInfo()"
echo "  ✅ scoreSourceRelevance() function added"
echo "  ✅ filterAndSortSources() function added"
echo "  ✅ searchAdditionalSources() updated to use filtering"
echo "  ✅ Syntax validated"
echo ""
echo "🔄 Next: Restart PM2"
echo "   pm2 restart backend"
echo "   pm2 logs backend --lines 50"
echo ""
echo "🧪 Test Query: \"What happens if SNAP benefits are cut?\""
echo ""
echo "Expected logs:"
echo "  📊 Scoring N sources for relevance..."
echo "  ⚠️  \"Boeing...\" - Not SNAP-related (-200)"
echo "  ✅ Kept X/Y sources (removed Z irrelevant)"
echo "  🏆 Top sources:"
echo "  🎯 Returning X relevant sources"
