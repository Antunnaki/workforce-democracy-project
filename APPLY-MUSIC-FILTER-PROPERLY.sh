#!/bin/bash
###########################################
# PROPERLY APPLY MUSIC FILTER
# Replace the entire filterAndSortSources function
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 APPLY MUSIC FILTER PROPERLY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# BACKUP
echo ""
echo "📦 Creating backup..."
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-before-proper-filter-$TIMESTAMP.js"
echo "   ✅ Backed up"

# REPLACE THE ENTIRE FUNCTION
echo ""
echo "🛠️  Replacing filterAndSortSources function..."

python3 << 'PYTHON_EOF'
import re

with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find and replace the ENTIRE filterAndSortSources function
# Pattern: from "function filterAndSortSources" to the closing brace before "async function searchAdditionalSources"

old_function = r'''function filterAndSortSources\(sources, query, maxResults = 15\) \{
    console\.log\(`📊 Scoring \$\{sources\.length\} sources for relevance\.\.\.\`\);
    
    const scoredSources = sources\.map\(source => \{
        const score = scoreSourceRelevance\(source, query\);
        return \{ source, score \};
    \}\);
    
    const filtered = scoredSources\.filter\(s => s\.score > 0\);
    
    console\.log\(`  ✅ Kept \$\{filtered\.length\}/\$\{sources\.length\} sources \(removed \$\{sources\.length - filtered\.length\} irrelevant\)\`\);
    
    filtered\.sort\(\(a, b\) => b\.score - a\.score\);
    
    const topSources = filtered\.slice\(0, maxResults\)\.map\(s => s\.source\);
    
    if \(topSources\.length > 0\) \{
        console\.log\(`  🏆 Top sources:\`\);
        topSources\.slice\(0, 3\)\.forEach\(\(source, i\) => \{
            const trusted = source\.trusted \? ' \[TRUSTED\]' : '';
            console\.log\(`     \$\{i \+ 1\}\. \$\{source\.source\}\$\{trusted\}: "\$\{source\.title\.substring\(0, 60\)\}\.\.\.""\`\);
        \}\);
    \}
    
    return topSources;
\}'''

new_function = '''function filterAndSortSources(sources, query, maxResults = 15) {
    console.log(`📊 Filtering and scoring ${sources.length} sources...`);
    
    // STEP 1: PRE-FILTER irrelevant content (music, generic headlines)
    const preFiltered = sources.filter(source => {
        const titleLower = (source.title || '').toLowerCase();
        const excerptLower = (source.excerpt || '').toLowerCase();
        
        // Filter music/entertainment articles
        if (titleLower.match(/turn it up|hero with a hero|icing on the cake|song|album|concert|performance|music review/i)) {
            console.log(`  🚫 FILTERED: "${source.title.substring(0, 50)}..." (music/entertainment)`);
            return false;
        }
        
        // Filter generic headlines without policy content
        if (titleLower.match(/^headlines for|^news brief|^daily digest/i)) {
            const hasPolicy = (titleLower + excerptLower).match(/snap|food stamp|welfare|poverty|benefit|healthcare|labor|worker|union|trump.*pause|court.*snap/i);
            if (!hasPolicy) {
                console.log(`  🚫 FILTERED: "${source.title.substring(0, 50)}..." (generic headlines, no policy)`);
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`  ✅ After pre-filtering: ${preFiltered.length}/${sources.length} sources remain`);
    
    // STEP 2: Score remaining sources
    const scoredSources = preFiltered.map(source => {
        const score = scoreSourceRelevance(source, query);
        return { source, score };
    });
    
    // STEP 3: Filter by score
    const filtered = scoredSources.filter(s => s.score > 0);
    
    console.log(`  ✅ After relevance scoring: ${filtered.length}/${preFiltered.length} sources kept`);
    
    // STEP 4: Sort by score
    filtered.sort((a, b) => b.score - a.score);
    
    // STEP 5: Take top N
    const topSources = filtered.slice(0, maxResults).map(s => s.source);
    
    if (topSources.length > 0) {
        console.log(`  🏆 Top ${topSources.length} sources:`);
        topSources.slice(0, 3).forEach((source, i) => {
            const trusted = source.trusted ? ' [TRUSTED]' : '';
            console.log(`     ${i + 1}. ${source.source}${trusted}: "${source.title.substring(0, 60)}..."`);
        });
    }
    
    return topSources;
}'''

# Use regex to replace
content = re.sub(old_function, new_function, content, flags=re.DOTALL)

with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Function replaced")
PYTHON_EOF

echo "   ✅ Function replaced"

# VERIFY
echo ""
echo "🔍 Verifying..."

if grep -q "PRE-FILTER irrelevant content" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Pre-filter code present"
else
    echo "   ❌ Pre-filter NOT found!"
    exit 1
fi

if grep -q "FILTERED.*music/entertainment" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Music filter present"
else
    echo "   ❌ Music filter NOT found!"
    exit 1
fi

# RESTART
echo ""
echo "♻️  Restarting..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MUSIC FILTER APPLIED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🧪 TEST: Ask SNAP question - music article should be GONE"
echo ""
echo "🔍 WATCH LOGS FOR:"
echo "   • '🚫 FILTERED: \"Turn It Up...\" (music/entertainment)'"
echo "   • Only 1-2 SNAP sources remaining"
echo ""
EOFSCRIPT

chmod +x /var/www/workforce-democracy/APPLY-MUSIC-FILTER-PROPERLY.sh
bash /var/www/workforce-democracy/APPLY-MUSIC-FILTER-PROPERLY.sh
```

Run this, then test. Once the music is gone, I'll immediately start building the article scraper! 🚀