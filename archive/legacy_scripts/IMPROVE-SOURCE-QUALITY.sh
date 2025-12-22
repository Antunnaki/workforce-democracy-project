#!/bin/bash
###########################################
# IMPROVE SOURCE QUALITY & QUANTITY
# 1. Increase max sources from 15 to 25
# 2. Lower relevance threshold to find more articles
# 3. Add instruction to LLM to synthesize multiple sources
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📈 IMPROVE SOURCE QUALITY & QUANTITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUP
echo ""
echo "📦 Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-before-quality-improvements-$TIMESTAMP.js"
echo "   ✅ Backup saved"

# 2. INCREASE SOURCE COUNT 15 → 25
echo ""
echo "🛠️  Step 2: Increasing source count 15 → 25..."

sed -i 's/const maxSources = 15;/const maxSources = 25;/g' "$BACKEND_DIR/ai-service.js"
sed -i 's/filterAndSortSources(allSources, userMessage, 15)/filterAndSortSources(allSources, userMessage, 25)/g' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Increased to 25 sources"

# 3. LOWER RELEVANCE SCORING PENALTIES
echo ""
echo "🛠️  Step 3: Adjusting relevance scoring..."

# Lower the penalty for "not SNAP-related" from -200 to -50
# This will allow more tangentially related articles through
sed -i 's/score -= 200; \/\/ Heavy penalty for completely off-topic/score -= 50; \/\/ Moderate penalty for tangentially related/g' "$BACKEND_DIR/ai-service.js"

# Lower industry penalty from -150 to -75
sed -i 's/score -= 150;$/score -= 75;/g' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Lowered penalties to allow more sources through"

# 4. ADD INSTRUCTION TO LLM TO SYNTHESIZE MULTIPLE SOURCES
echo ""
echo "🛠️  Step 4: Adding synthesis instruction to LLM prompt..."

python3 << 'PYTHON_EOF'
# Read file
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the "CURRENT INFORMATION:" section and add synthesis instruction
old_text = '''CURRENT INFORMATION:
• **CITATION RULES (CRITICAL - READ CAREFULLY):**'''

new_text = '''CURRENT INFORMATION:
• **SYNTHESIZING MULTIPLE SOURCES:**
  - When you receive multiple sources, synthesize information across ALL of them
  - Look for common themes, contradictions, and complementary information
  - If multiple sources discuss the same event, combine their perspectives
  - Use the most recent and detailed information available
  - Cite each source when you use information from it
• **CITATION RULES (CRITICAL - READ CAREFULLY):**'''

content = content.replace(old_text, new_text)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Added synthesis instruction")
PYTHON_EOF

echo "   ✅ Added multi-source synthesis instruction"

# 5. VERIFY CHANGES
echo ""
echo "🔍 Step 5: Verifying changes..."

if grep -q "const maxSources = 25;" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ maxSources = 25"
else
    echo "   ⚠️  WARNING: maxSources not updated!"
fi

if grep -q "SYNTHESIZING MULTIPLE SOURCES" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Synthesis instruction added"
else
    echo "   ⚠️  WARNING: Synthesis instruction not found!"
fi

# 6. RESTART BACKEND
echo ""
echo "♻️  Step 6: Restarting backend..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SOURCE QUALITY IMPROVEMENTS COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ✅ Increased max sources from 15 to 25"
echo "   2. ✅ Lowered relevance penalties to find more articles"
echo "   3. ✅ Added instruction to LLM to synthesize across multiple sources"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 EXPECTED:"
echo "   • Backend should find 3-10+ sources (not just 1)"
echo "   • LLM should synthesize information across sources"
echo "   • Response should be more comprehensive and detailed"
echo ""
echo "💾 Backup: $BACKUP_DIR/ai-service-before-quality-improvements-$TIMESTAMP.js"
echo ""
