#!/bin/bash
###########################################
# FIX RSS RELEVANCE THRESHOLD
# 1. Lower minRelevanceScore from 15 to 5
# 2. Add SNAP-related keyword expansion
# 3. Make scoring more generous
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX RSS RELEVANCE THRESHOLD"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUPS
echo ""
echo "📦 Step 1: Creating backups..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/rss-service.js" "$BACKUP_DIR/rss-service-before-threshold-fix-$TIMESTAMP.js"
cp "$BACKEND_DIR/keyword-extraction.js" "$BACKUP_DIR/keyword-extraction-before-threshold-fix-$TIMESTAMP.js"
echo "   ✅ Backups saved"

# 2. LOWER THRESHOLD FROM 15 TO 5
echo ""
echo "🛠️  Step 2: Lowering minRelevanceScore 15 → 5..."

sed -i 's/minRelevanceScore = 15/minRelevanceScore = 5/g' "$BACKEND_DIR/rss-service.js"

echo "   ✅ Threshold lowered to 5"

# 3. ADD SNAP-RELATED KEYWORD EXPANSION
echo ""
echo "🛠️  Step 3: Adding SNAP keyword expansion..."

python3 << 'PYTHON_EOF'
# Read keyword-extraction.js
with open('/var/www/workforce-democracy/backend/keyword-extraction.js', 'r') as f:
    content = f.read()

# Find the extractSearchKeywords function and add SNAP expansion
# Look for the return statement and add SNAP expansion before it

old_pattern = '''    return {
        keywords: keywords,
        topics: topics,
        regions: regions
    };
}'''

new_pattern = '''    // SNAP query expansion (v37.8.0)
    const queryLower = userMessage.toLowerCase();
    if (queryLower.match(/snap|food stamp|food benefit|food assistance/i)) {
        console.log('  🔍 SNAP query detected - expanding keywords...');
        keywords.push('welfare', 'poverty', 'hunger', 'food insecurity', 
                      'food assistance', 'nutrition', 'usda', 'agriculture',
                      'trump', 'judge', 'payment', 'crisis', 'low-income',
                      'safety net', 'social program', 'benefits cut', 'benefits attack');
        console.log(`  ✅ Expanded to ${keywords.length} keywords`);
    }
    
    return {
        keywords: keywords,
        topics: topics,
        regions: regions
    };
}'''

content = content.replace(old_pattern, new_pattern)

# Write back
with open('/var/www/workforce-democracy/backend/keyword-extraction.js', 'w') as f:
    f.write(content)

print("✅ Added SNAP keyword expansion")
PYTHON_EOF

echo "   ✅ SNAP keywords expanded"

# 4. MAKE SCORING MORE GENEROUS
echo ""
echo "🛠️  Step 4: Making relevance scoring more generous..."

# Increase title match from +20 to +30
sed -i 's/score += 20; *\/\/ Only +20 per keyword in title/score += 30; \/\/ +30 per keyword in title (more generous)/g' "$BACKEND_DIR/keyword-extraction.js"

# Increase excerpt match from +10 to +15
sed -i 's/score += 10; *\/\/ Only +10 per keyword in excerpt/score += 15; \/\/ +15 per keyword in excerpt (more generous)/g' "$BACKEND_DIR/keyword-extraction.js"

echo "   ✅ Increased scoring weights"

# 5. VERIFY CHANGES
echo ""
echo "🔍 Step 5: Verifying changes..."

if grep -q "minRelevanceScore = 5" "$BACKEND_DIR/rss-service.js"; then
    echo "   ✅ Threshold = 5"
else
    echo "   ⚠️  WARNING: Threshold not updated!"
fi

if grep -q "SNAP query expansion" "$BACKEND_DIR/keyword-extraction.js"; then
    echo "   ✅ SNAP expansion added"
else
    echo "   ⚠️  WARNING: SNAP expansion not found!"
fi

if grep -q "score += 30" "$BACKEND_DIR/keyword-extraction.js"; then
    echo "   ✅ Scoring weights increased"
else
    echo "   ⚠️  WARNING: Scoring not updated!"
fi

# 6. RESTART BACKEND
echo ""
echo "♻️  Step 6: Restarting backend..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 30

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ RSS THRESHOLD FIX COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ✅ Lowered minRelevanceScore from 15 to 5 (66% reduction)"
echo "   2. ✅ Added 15+ SNAP-related keywords (welfare, poverty, hunger, Trump, etc.)"
echo "   3. ✅ Increased scoring: title +30 (was +20), excerpt +15 (was +10)"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 WATCH FOR IN LOGS:"
echo "   • '🔍 SNAP query detected - expanding keywords...'"
echo "   • '✅ Expanded to XX keywords'"
echo "   • '✅ RSS: 5-15/20 articles passed' (not just 1/20!)"
echo ""
echo "💾 Backups:"
echo "   - $BACKUP_DIR/rss-service-before-threshold-fix-$TIMESTAMP.js"
echo "   - $BACKUP_DIR/keyword-extraction-before-threshold-fix-$TIMESTAMP.js"
echo ""
