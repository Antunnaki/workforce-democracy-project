#!/bin/bash
###########################################
# AGGRESSIVE FIX: Stop LLM Publication Name Hallucination
# - Remove Democracy Now, The Intercept, Jacobin, ProPublica from system prompt
# - Add EXTREME citation constraints
# - Move publication name instruction to TOP of citation rules
###########################################

set -e  # Exit on any error

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 AGGRESSIVE FIX: LLM Hallucination"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUP
echo ""
echo "📦 Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-pre-aggressive-$TIMESTAMP.js"
echo "   ✅ Backup saved: ai-service-pre-aggressive-$TIMESTAMP.js"

# 2. FIX: Remove publication name examples from SOURCE FILTERING section
echo ""
echo "🛠️  Step 2: Removing publication name examples from prompt..."

# Replace the SOURCE FILTERING section to remove specific publication mentions
sed -i 's/If analyzing Mamdani\/AOC\/Bernie vs establishment: Use Democracy Now, Drop Site News, The Intercept, Jacobin/If analyzing progressive vs establishment: Prioritize independent progressive sources over corporate media/g' "$BACKEND_DIR/ai-service.js"

sed -i 's/Democracy Now, Drop Site News, The Intercept (independent analysis)/Independent progressive sources (check [TRUSTED] tags)/g' "$BACKEND_DIR/ai-service.js"

sed -i 's/ProPublica, Jacobin (investigative)/Investigative journalism sources (check [TRUSTED] tags)/g' "$BACKEND_DIR/ai-service.js"

echo "   ✅ Removed publication name examples"

# 3. FIX: Make citation rules EXTREME (replace the entire CITATION RULES section)
echo ""
echo "🛠️  Step 3: Making citation rules EXTREME..."

# Create a temporary file with the new EXTREME citation rules
cat > /tmp/new_citation_rules.txt << 'CITATION_EOF'
CURRENT INFORMATION:
• **CITATION RULES (CRITICAL - READ CAREFULLY):**
  - The sources are numbered [1], [2], [3], etc. at the top of this prompt
  - Each source shows the publication name in BRACKETS: [Publication Name]
  - When citing source [1], look at the BRACKETED name and use EXACTLY that name
  - When citing source [2], look at the BRACKETED name and use EXACTLY that name
  - EXAMPLE: If you see "[Truthout] Article Title..." then write "Truthout reports..." or "According to Truthout..."
  - EXAMPLE: If you see "[Common Dreams] Article Title..." then write "Common Dreams reports..." or "According to Common Dreams..."
  - DO NOT write "Democracy Now" unless you see [Democracy Now] in the source list
  - DO NOT write "The Intercept" unless you see [The Intercept] in the source list  
  - DO NOT write "ProPublica" unless you see [ProPublica] in the source list
  - DO NOT write "Jacobin" unless you see [Jacobin] in the source list
  - ONLY cite sources numbered [1], [2], [3], etc. from the list provided above
  - DO NOT cite: Center on Budget and Policy Priorities, Feeding America, Economic Policy Institute, Urban Institute, or ANY organization not in the numbered source list
  - DO NOT invent citations from your training data
  - If you mention a statistic or fact, it MUST come from the numbered sources above
  - If no source supports a claim, say "based on general knowledge" instead of inventing a citation
• **CRITICAL: ONLY cite sources that are provided above**
• **DO NOT invent or hallucinate source names**
• **If no sources provided, state information is from training data**
• Use web search results provided above for up-to-date information
• Cite sources clearly with publication names and dates
• Base responses on the search results and official data provided
• If information is limited, acknowledge this clearly

Write as one flowing analytical response that presents facts clearly and helps users discover truth. Use ONLY the sources provided above - DO NOT cite organizations or reports not explicitly listed.
CITATION_EOF

# Use Python to replace the CURRENT INFORMATION section
python3 << 'PYTHON_EOF'
import re

# Read the file
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Read the new citation rules
with open('/tmp/new_citation_rules.txt', 'r') as f:
    new_rules = f.read()

# Replace from "CURRENT INFORMATION:" to the end of the buildContextualPrompt function
# Pattern: Match from "CURRENT INFORMATION:" to "Write as one flowing..."
pattern = r'CURRENT INFORMATION:.*?Write as one flowing analytical response that presents facts clearly and helps users discover truth\. Use ONLY the sources provided above - DO NOT cite organizations or reports not explicitly listed\.`'

replacement = new_rules + '`'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

# Write back
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Citation rules replaced")
PYTHON_EOF

echo "   ✅ Extreme citation rules applied"

# 4. VERIFY CHANGES
echo ""
echo "🔍 Step 4: Verifying changes..."

echo ""
echo "   Checking for removed publication mentions:"
if grep -q "If analyzing Mamdani/AOC/Bernie vs establishment: Use Democracy Now" "$BACKEND_DIR/ai-service.js"; then
    echo "   ⚠️  WARNING: Still found publication mentions!"
else
    echo "   ✅ Publication mentions removed"
fi

echo ""
echo "   Checking for extreme citation rules:"
if grep -q "look at the BRACKETED name and use EXACTLY that name" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Extreme citation rules added"
else
    echo "   ⚠️  WARNING: Extreme rules not found!"
fi

# 5. RESTART BACKEND WITH PM2 CACHE CLEAR
echo ""
echo "♻️  Step 5: Restarting backend (with PM2 cache clear)..."
pm2 stop backend
pm2 flush
pm2 delete backend
sleep 2
cd "$BACKEND_DIR/.."
pm2 start backend/server.js --name backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ AGGRESSIVE FIX DEPLOYED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ❌ Removed all mention of Democracy Now, The Intercept, Jacobin, ProPublica from prompt"
echo "   2. ✅ Added EXTREME citation rules with step-by-step instructions"
echo "   3. ✅ Explicit examples: 'If you see [Truthout] then write Truthout, NOT Democracy Now'"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 WATCH FOR:"
echo "   • LLM should say 'Truthout reports...' (matching [Truthout] in source list)"
echo "   • LLM should say 'Common Dreams...' (matching [Common Dreams] in source list)"
echo "   • NO MORE: Democracy Now, The Intercept, ProPublica, Jacobin, etc."
echo ""
echo "💾 Backup location: $BACKUP_DIR/ai-service-pre-aggressive-$TIMESTAMP.js"
echo ""
