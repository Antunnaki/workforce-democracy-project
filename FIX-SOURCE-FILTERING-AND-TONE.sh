#!/bin/bash
###########################################
# FIX SOURCE FILTERING & TONE
# 1. Debug why only 1/20 sources passes filter
# 2. Show what the other 19 articles are
# 3. Fix "users" language in responses
# 4. Adjust scoring to be less strict
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 FIX SOURCE FILTERING & TONE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUP
echo ""
echo "📦 Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-before-filter-fix-$TIMESTAMP.js"
echo "   ✅ Backup saved"

# 2. FIX "USERS" LANGUAGE IN SYSTEM PROMPT
echo ""
echo "🛠️  Step 2: Removing 'users' language from prompts..."

sed -i 's/helps users discover truth/presents facts clearly/g' "$BACKEND_DIR/ai-service.js"
sed -i 's/help users/provide information/g' "$BACKEND_DIR/ai-service.js"
sed -i 's/Let evidence guide users to truth/Present evidence directly/g' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Removed 'users' references"

# 3. MAKE SNAP SCORING MORE PERMISSIVE
echo ""
echo "🛠️  Step 3: Making SNAP relevance scoring more permissive..."

python3 << 'PYTHON_EOF'
# Read file
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the scoreSourceRelevance function and make SNAP matching much broader
old_snap_check = '''if (queryLower.match(/snap|food stamp|food benefit|food assistance|hunger|food insecurity/)) {
        if (!combined.match(/snap|food stamp|food benefit|hunger|food insecurity|nutrition|meal|feeding|ebt/)) {
            score -= 50; // Moderate penalty for tangentially related'''

new_snap_check = '''if (queryLower.match(/snap|food stamp|food benefit|food assistance|hunger|food insecurity/)) {
        // Much broader matching - include welfare, poverty, benefits, assistance, etc.
        if (!combined.match(/snap|food stamp|food benefit|hunger|food insecurity|nutrition|meal|feeding|ebt|welfare|poverty|benefit|assistance|poor|low-income|safety net|social program|usda|agriculture|trump|judge|payment|crisis/i)) {
            score -= 50; // Moderate penalty for tangentially related'''

content = content.replace(old_snap_check, new_snap_check)

# Also make the industry penalty only apply to very specific unrelated terms
old_industry = '''if (combined.match(/boeing|aircraft|airline|aerospace|manufacturing|tech company|silicon valley/)) {
            score -= 75;'''

new_industry = '''// Only penalize if it's CLEARLY about industry and NOT about policy/workers
        if (combined.match(/boeing.*aircraft|airline.*schedule|silicon valley.*startup|tech company.*ipo/i) && 
            !combined.match(/worker|labor|job|employ|wage|benefit|union/i)) {
            score -= 75;'''

content = content.replace(old_industry, new_industry)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Made SNAP scoring more permissive")
PYTHON_EOF

echo "   ✅ Broadened SNAP relevance matching"

# 4. ADD DEBUG LOGGING TO SEE WHY ARTICLES ARE FILTERED
echo ""
echo "🛠️  Step 4: Adding debug logging to see filtered articles..."

python3 << 'PYTHON_EOF'
# Read file
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the filterAndSortSources function and add logging for rejected sources
old_filter = '''const filtered = scoredSources.filter(s => s.score > 0);
    console.log(`  ✅ Kept ${filtered.length}/${sources.length} sources (removed ${sources.length - filtered.length} irrelevant)`);'''

new_filter = '''const filtered = scoredSources.filter(s => s.score > 0);
    
    // Debug: Show WHY sources were rejected
    const rejected = scoredSources.filter(s => s.score <= 0);
    if (rejected.length > 0 && rejected.length <= 5) {
        console.log(`  ❌ Rejected ${rejected.length} sources:`);
        rejected.forEach(r => {
            console.log(`     - "${r.source.title.substring(0, 60)}..." (score: ${r.score})`);
        });
    }
    
    console.log(`  ✅ Kept ${filtered.length}/${sources.length} sources (removed ${sources.length - filtered.length} irrelevant)`);'''

content = content.replace(old_filter, new_filter)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Added debug logging for rejected sources")
PYTHON_EOF

echo "   ✅ Added rejection logging"

# 5. VERIFY CHANGES
echo ""
echo "🔍 Step 5: Verifying changes..."

if grep -q "presents facts clearly" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Removed 'users' language"
else
    echo "   ⚠️  WARNING: 'users' still present"
fi

if grep -q "welfare|poverty|benefit|assistance|poor|low-income" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Broadened SNAP matching"
else
    echo "   ⚠️  WARNING: Broader matching not found"
fi

# 6. RESTART BACKEND
echo ""
echo "♻️  Step 6: Restarting backend..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FILTERING & TONE FIXES COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ✅ Removed 'users' language from prompts"
echo "   2. ✅ Broadened SNAP matching to include: welfare, poverty, benefits, assistance, etc."
echo "   3. ✅ Made industry penalties more specific (only penalize truly unrelated content)"
echo "   4. ✅ Added debug logging to see WHY sources are rejected"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 WATCH FOR:"
echo "   • More sources passing filter (should see 5-10+ instead of 1)"
echo "   • Debug log showing rejected sources and their scores"
echo "   • NO 'users' language in response"
echo ""
echo "💾 Backup: $BACKUP_DIR/ai-service-before-filter-fix-$TIMESTAMP.js"
echo ""
