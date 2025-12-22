#!/bin/bash
###########################################
# QUICK WINS: Deep Analysis Improvements
# 1. Filter out music reviews and generic headlines
# 2. Increase token limit 1500 → 3000
# 3. Add comprehensive analysis prompt
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 QUICK WINS: Deep Analysis"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUPS
echo ""
echo "📦 Step 1: Creating backups..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-before-deep-analysis-$TIMESTAMP.js"
cp "$BACKEND_DIR/rss-service.js" "$BACKUP_DIR/rss-service-before-deep-analysis-$TIMESTAMP.js"
echo "   ✅ Backups saved"

# 2. INCREASE TOKEN LIMIT
echo ""
echo "🛠️  Step 2: Increasing token limit 1500 → 3000..."

sed -i 's/max_tokens: 1500,/max_tokens: 3000,/g' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Token limit increased to 3000"

# 3. ADD COMPREHENSIVE ANALYSIS PROMPT
echo ""
echo "🛠️  Step 3: Adding comprehensive analysis framework..."

python3 << 'PYTHON_EOF'
# Read ai-service.js
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the buildContextualPrompt function and add comprehensive analysis
# We'll add it before "ANALYTICAL APPROACH:"

old_analytical = '''ANALYTICAL APPROACH:
• Use verifiable facts: voting records, court docs, campaign finance, documented actions
• Show who benefits and who's harmed by policies'''

new_analytical = '''COMPREHENSIVE ANALYSIS FRAMEWORK:
When analyzing policy issues (SNAP, welfare, healthcare, labor, etc.), provide DEEP multi-dimensional analysis:

**ECONOMIC IMPACT:**
• Direct costs and benefits (specific dollar amounts)
• Multiplier effects (e.g., $1 SNAP generates $1.70 in economic activity)
• GDP impact, job creation/loss
• State and local budget effects
• Long-term fiscal implications
• Use specific numbers from sources and government data

**HEALTH IMPACT:**
• Nutrition and food security outcomes
• Healthcare costs (hospital visits, emergency room use, chronic disease rates)
• Child development, maternal health, infant mortality
• Mental health effects, addiction rates
• Life expectancy and mortality statistics
• Public health system burden and costs

**SOCIAL IMPACT:**
• Crime rates and incarceration costs (specific percentages)
• Community stability, neighborhood effects
• Education outcomes (test scores, graduation rates, college attendance)
• Housing stability and homelessness rates
• Family structure and child welfare cases
• Social mobility and inequality metrics

**POLITICAL ECONOMY (Follow the Money):**
• Who benefits financially from policy changes?
• Campaign contributions from affected industries (specific amounts)
• Lobbying expenditures (name companies and amounts)
• Corporate profit motives
• Voting records vs. campaign finance (show contradictions)
• Revolving door between industry and government

**EVIDENCE & SYNTHESIS:**
• Quote key passages from articles (with citation numbers)
• Use specific statistics and data points
• Reference research studies and methodology
• Connect economic, health, and social impacts (show cascading effects)
• Identify winners and losers
• Highlight contradictions between rhetoric and evidence

**NATURAL FLOW - NOT TEMPLATE:**
• Don't rigidly follow sections - weave impacts together naturally
• Lead with most important findings
• Let evidence guide structure
• Vary length: 1-20 paragraphs as needed
• Write as flowing analysis, not bullet points
• Make it engaging and accessible

ANALYTICAL APPROACH:
• Use verifiable facts: voting records, court docs, campaign finance, documented actions
• Show who benefits and who's harmed by policies'''

content = content.replace(old_analytical, new_analytical)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Added comprehensive analysis framework")
PYTHON_EOF

echo "   ✅ Comprehensive analysis framework added"

# 4. ADD SOURCE FILTERING TO REMOVE IRRELEVANT ARTICLES
echo ""
echo "🛠️  Step 4: Adding smart source filtering..."

python3 << 'PYTHON_EOF'
# Read ai-service.js
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the scoreSourceRelevance function and add content-type filtering

old_score_start = '''function scoreSourceRelevance(source, query) {
    const queryLower = query.toLowerCase();
    const titleLower = (source.title || '').toLowerCase();
    const excerptLower = (source.excerpt || '').toLowerCase();
    const combined = `${titleLower} ${excerptLower}`;
    
    let score = 100; // Base score'''

new_score_start = '''function scoreSourceRelevance(source, query) {
    const queryLower = query.toLowerCase();
    const titleLower = (source.title || '').toLowerCase();
    const excerptLower = (source.excerpt || '').toLowerCase();
    const combined = `${titleLower} ${excerptLower}`;
    
    // Filter out irrelevant content types (music, entertainment, sports)
    const irrelevantPatterns = /\bsong\b|\balbum\b|\bmusic\b|\bconcert\b|\bperformance\b|\bhero with a hero\b|turn it up|\bsports\b|\bgame\b|\bmatch\b|\btournament\b/i;
    if (titleLower.match(irrelevantPatterns) && !combined.match(/policy|worker|labor|benefit|cut|attack|legislat/i)) {
        console.log(`  ❌ "${source.title.substring(0, 50)}..." - Entertainment/Music (-1000)`);
        return -1000; // Strong rejection
    }
    
    // Filter out generic headlines unless they contain policy terms
    if (titleLower.match(/^headlines for|^news brief|^daily digest/i)) {
        const hasPolicyContent = combined.match(/snap|food stamp|welfare|poverty|benefit|healthcare|medicaid|housing|education|labor|worker|union/i);
        if (!hasPolicyContent) {
            console.log(`  ❌ "${source.title.substring(0, 50)}..." - Generic headlines, no policy content (-500)`);
            return -500;
        }
    }
    
    let score = 100; // Base score'''

content = content.replace(old_score_start, new_score_start)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Added smart source filtering")
PYTHON_EOF

echo "   ✅ Smart filtering added (removes music, generic headlines)"

# 5. VERIFY CHANGES
echo ""
echo "🔍 Step 5: Verifying changes..."

if grep -q "max_tokens: 3000" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Token limit = 3000"
else
    echo "   ⚠️  WARNING: Token limit not updated!"
fi

if grep -q "COMPREHENSIVE ANALYSIS FRAMEWORK" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Analysis framework added"
else
    echo "   ⚠️  WARNING: Framework not found!"
fi

if grep -q "Entertainment/Music" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Smart filtering added"
else
    echo "   ⚠️  WARNING: Filtering not found!"
fi

# 6. RESTART BACKEND
echo ""
echo "♻️  Step 6: Restarting backend..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ QUICK WINS DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ✅ Token limit: 1500 → 3000 (100% increase for detailed analysis)"
echo "   2. ✅ Added comprehensive analysis framework:"
echo "      - Economic impact (multipliers, GDP, jobs)"
echo "      - Health impact (nutrition, healthcare costs, mortality)"
echo "      - Social impact (crime, education, housing, community)"
echo "      - Political economy (campaign finance, lobbying, follow the money)"
echo "   3. ✅ Smart filtering (removes music reviews, generic headlines)"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 EXPECTED:"
echo "   • Only 1-2 SNAP-relevant sources (music/headlines filtered out)"
echo "   • MUCH deeper analysis (5-15 paragraphs)"
echo "   • Economic impacts with specific numbers"
echo "   • Health and social consequences"
echo "   • Political economy analysis"
echo "   • Natural flowing narrative (not template-like)"
echo ""
echo "📋 NEXT PHASE:"
echo "   • Article scraping (full text instead of snippets)"
echo "   • Economic data APIs (USDA, Census, BLS)"
echo "   • Research paper integration"
echo ""
echo "💾 Backups:"
echo "   - $BACKUP_DIR/ai-service-before-deep-analysis-$TIMESTAMP.js"
echo "   - $BACKUP_DIR/rss-service-before-deep-analysis-$TIMESTAMP.js"
echo ""
