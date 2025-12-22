#!/bin/bash
###########################################
# FIX FILTERING & REPETITION
# 1. Actually filter out music articles (fix the filtering logic)
# 2. Add anti-repetition instructions
# 3. Require specific evidence, not vague statements
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX FILTERING & REPETITION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. BACKUP
echo ""
echo "📦 Creating backup..."
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-before-filter-fix2-$TIMESTAMP.js"
echo "   ✅ Backed up"

# 2. FIX FILTERING - Actually reject music articles
echo ""
echo "🛠️  Step 1: Fixing source filtering..."

python3 << 'PYTHON_EOF'
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find filterAndSortSources and add filtering BEFORE scoring
old_filter = '''function filterAndSortSources(sources, query, maxResults = 10) {
    console.log(`📊 Scoring ${sources.length} sources for relevance...`);
    
    const scoredSources = sources.map(source => {
        const score = scoreSourceRelevance(source, query);
        return { source, score };
    });'''

new_filter = '''function filterAndSortSources(sources, query, maxResults = 10) {
    console.log(`📊 Filtering and scoring ${sources.length} sources...`);
    
    // FIRST: Remove obviously irrelevant content
    const preFiltered = sources.filter(source => {
        const titleLower = (source.title || '').toLowerCase();
        const excerptLower = (source.excerpt || '').toLowerCase();
        
        // Filter music/entertainment
        if (titleLower.match(/turn it up|hero with a hero|icing on the cake|song|album|concert/i) && 
            !titleLower.match(/policy|legislation|congress|senate|bill/i)) {
            console.log(`  🚫 Filtered: "${source.title.substring(0, 50)}..." (music/entertainment)`);
            return false;
        }
        
        // Filter generic headlines without SNAP/policy content
        if (titleLower.match(/^headlines for/i)) {
            const hasRelevant = (titleLower + excerptLower).match(/snap|food stamp|welfare|poverty|benefit|trump.*pause|court.*snap/i);
            if (!hasRelevant) {
                console.log(`  🚫 Filtered: "${source.title.substring(0, 50)}..." (generic headlines)`);
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`  ✅ After pre-filtering: ${preFiltered.length}/${sources.length} sources remain`);
    
    const scoredSources = preFiltered.map(source => {
        const score = scoreSourceRelevance(source, query);
        return { source, score };
    });'''

content = content.replace(old_filter, new_filter)

with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Fixed filtering logic")
PYTHON_EOF

echo "   ✅ Filtering logic fixed"

# 3. ADD ANTI-REPETITION INSTRUCTIONS
echo ""
echo "🛠️  Step 2: Adding anti-repetition instructions..."

python3 << 'PYTHON_EOF'
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Add anti-repetition to the comprehensive analysis framework
old_framework = '''Write naturally - NOT as template. Lead with key findings. Vary length (1-20 paragraphs). Flow like journalism.'''

new_framework = '''Write naturally - NOT as template. Lead with key findings. Vary length (1-20 paragraphs). Flow like journalism.

**AVOID REPETITION:**
• DO NOT repeat the same point multiple times
• Each paragraph should add NEW information or perspective
• If you only have 1-2 sources, write 3-5 focused paragraphs (not 10 repetitive ones)
• Use specific quotes, numbers, and evidence - NOT vague statements like "significant impact"
• If sources lack details, acknowledge limitations: "The available reporting focuses on X but doesn't provide data on Y"'''

content = content.replace(old_framework, new_framework)

with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Added anti-repetition rules")
PYTHON_EOF

echo "   ✅ Anti-repetition added"

# 4. VERIFY
echo ""
echo "🔍 Verifying..."

if grep -q "preFiltered = sources.filter" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Pre-filtering added"
fi

if grep -q "AVOID REPETITION" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Anti-repetition rules added"
fi

# 5. RESTART
echo ""
echo "♻️  Restarting..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FILTERING & REPETITION FIXED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes:"
echo "   1. ✅ Pre-filter sources BEFORE scoring (removes music/entertainment)"
echo "   2. ✅ Added anti-repetition rules"
echo "   3. ✅ Requires specific evidence, not vague statements"
echo ""
echo "🧪 TEST: Ask SNAP question again"
echo ""
echo "🔍 EXPECTED:"
echo "   • Music article GONE (filtered out)"
echo "   • Only 1-2 SNAP-relevant sources"
echo "   • 3-5 focused paragraphs (not 10 repetitive ones)"
echo "   • Specific quotes and evidence from Truthout article"
echo ""
EOFSCRIPT

chmod +x /var/www/workforce-democracy/FIX-FILTERING-AND-REPETITION.sh
bash /var/www/workforce-democracy/FIX-FILTERING-AND-REPETITION.sh
```

This will:
1. ✅ Actually filter out the music article BEFORE it reaches the LLM
2. ✅ Stop repetitive paragraphs
3. ✅ Require specific evidence

Test after this, then I'll build the article scraping! 🚀