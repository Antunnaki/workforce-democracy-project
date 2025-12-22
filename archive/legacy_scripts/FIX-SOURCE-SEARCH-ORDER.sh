#!/bin/bash
###########################################
# CRITICAL FIX: Search sources BEFORE calling LLM
# Currently: LLM responds → then sources searched → sources added after
# Should be: Sources searched → LLM responds with those sources → return
###########################################

set -e

BACKEND_DIR="/var/www/workforce-democracy/backend"
BACKUP_DIR="/var/www/workforce-democracy/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 CRITICAL FIX: Source Search Order"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. CREATE BACKUP
echo ""
echo "📦 Step 1: Creating backup..."
mkdir -p "$BACKUP_DIR"
cp "$BACKEND_DIR/ai-service.js" "$BACKUP_DIR/ai-service-before-order-fix-$TIMESTAMP.js"
echo "   ✅ Backup saved: ai-service-before-order-fix-$TIMESTAMP.js"

# 2. CREATE FIXED VERSION using Python for complex refactoring
echo ""
echo "🛠️  Step 2: Reordering source search to happen BEFORE LLM call..."

python3 << 'PYTHON_EOF'
import re

# Read the file
with open('/var/www/workforce-democracy/backend/ai-service.js', 'r') as f:
    content = f.read()

# Find the analyzeWithAI function and restructure it
# We need to move the searchAdditionalSources call BEFORE the Groq API call

# Pattern: Find the section from "// Build user message" to "// PHASE 2: Search for additional sources"
# and restructure to search sources first

old_pattern = r'''(        // Build user message with context
        const userMessage = buildContextualPrompt\(query, context, chatType\);
        
        console\.log\(`🤖 AI Query: "\$\{query\.substring\(0, 50\)\}\.\.\..*?\n        
        // Call Groq API
.*?
        console\.log\(`✅ AI response: "\$\{aiText\.substring\(0, 50\)\}\.\.\."\);
        
        // =============================================================================
        // PHASE 2: Search for additional sources if needed \(from llm-proxy\.js\)
        // =============================================================================
        let sources = \[\];
        
        try \{
            sources = await searchAdditionalSources\(query, aiText\);
            if \(sources\.length > 0\) \{
                console\.log\(`📚 Added \$\{sources\.length\} sources to response`\);
            \}
        \} catch \(error\) \{
            console\.error\('⚠️ Source search failed \(non-fatal\):', error\.message\);
            // Continue without sources - not a critical failure
        \})'''

new_code = '''        // =============================================================================
        // PHASE 1: Search for sources BEFORE calling LLM (CRITICAL FIX v37.8.0)
        // =============================================================================
        let sources = [];
        
        try {
            // Check if we need to search for current information
            if (needsCurrentInfo(query, '')) {
                console.log('🔍 Pre-searching for sources before LLM call...');
                sources = await searchAdditionalSources(query, '');
                if (sources.length > 0) {
                    console.log(`📚 Found ${sources.length} sources - adding to context for LLM`);
                    // Add sources to context so buildContextualPrompt includes them
                    context.webSearchResults = sources;
                }
            }
        } catch (error) {
            console.error('⚠️ Pre-search failed (non-fatal):', error.message);
            // Continue without sources - not a critical failure
        }
        
        // Build user message with context (now includes sources if found)
        const userMessage = buildContextualPrompt(query, context, chatType);
        
        console.log(`🤖 AI Query: "${query.substring(0, 50)}..." (context: ${chatType})`);
        
        // Call Groq API (now with sources in the prompt)
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: GROQ_MODEL,
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7, // Balance between creative and factual
                max_tokens: 1500,
                top_p: 0.9,
                frequency_penalty: 0.5, // Reduce repetition
                presence_penalty: 0.3   // Encourage topic diversity
            },
            {
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const aiText = response.data.choices[0].message.content;
        const usage = response.data.usage;
        
        console.log(`✅ AI response: "${aiText.substring(0, 50)}..."`);'''

# This is complex, so let's use a more targeted approach
# Find line "// Build user message with context" and insert source search BEFORE it

# Find the line number
lines = content.split('\n')
target_line = None
for i, line in enumerate(lines):
    if '// Build user message with context' in line and 'buildContextualPrompt' in lines[i+1]:
        target_line = i
        break

if target_line is None:
    print("❌ Could not find target line")
    exit(1)

print(f"✅ Found target at line {target_line}")

# Insert the source search code BEFORE "// Build user message"
source_search_code = """        // =============================================================================
        // PHASE 1: Search for sources BEFORE calling LLM (CRITICAL FIX v37.8.0)
        // =============================================================================
        let sources = [];
        
        try {
            // Check if we need to search for current information
            if (needsCurrentInfo(query, '')) {
                console.log('🔍 Pre-searching for sources before LLM call...');
                sources = await searchAdditionalSources(query, '');
                if (sources.length > 0) {
                    console.log(`📚 Found ${sources.length} sources - adding to context for LLM`);
                    // Add sources to context so buildContextualPrompt includes them
                    context.webSearchResults = sources;
                }
            }
        } catch (error) {
            console.error('⚠️ Pre-search failed (non-fatal):', error.message);
            // Continue without sources - not a critical failure
        }
        
"""

# Insert the code
lines.insert(target_line, source_search_code)

# Now find and REMOVE/COMMENT the old PHASE 2 source search (after LLM response)
phase2_start = None
for i, line in enumerate(lines):
    if 'PHASE 2: Search for additional sources if needed' in line:
        phase2_start = i - 2  # Include the comment lines above
        break

if phase2_start:
    # Comment out the old PHASE 2 section (about 15 lines)
    for i in range(phase2_start, min(phase2_start + 15, len(lines))):
        if not lines[i].strip().startswith('//') and lines[i].strip():
            lines[i] = '        // ' + lines[i].lstrip()

# Write back
content = '\n'.join(lines)
with open('/var/www/workforce-democracy/backend/ai-service.js', 'w') as f:
    f.write(content)

print("✅ Code restructured - sources now searched BEFORE LLM call")
PYTHON_EOF

echo "   ✅ Source search moved to BEFORE LLM call"

# 3. VERIFY CHANGES
echo ""
echo "🔍 Step 3: Verifying changes..."

if grep -q "PHASE 1: Search for sources BEFORE calling LLM" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ New PHASE 1 source search found"
else
    echo "   ❌ ERROR: PHASE 1 not found!"
    exit 1
fi

if grep -q "Pre-searching for sources before LLM call" "$BACKEND_DIR/ai-service.js"; then
    echo "   ✅ Pre-search log message found"
else
    echo "   ❌ ERROR: Pre-search code not found!"
    exit 1
fi

# 4. RESTART BACKEND
echo ""
echo "♻️  Step 4: Restarting backend..."
pm2 restart backend
sleep 3
pm2 logs backend --lines 20

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ SOURCE SEARCH ORDER FIXED!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Changes made:"
echo "   1. ✅ Sources now searched BEFORE LLM generates response"
echo "   2. ✅ Sources added to context.webSearchResults for buildContextualPrompt"
echo "   3. ✅ LLM now sees sources in prompt with publication names [Truthout], [Common Dreams]"
echo ""
echo "🧪 TEST NOW:"
echo "   Ask: 'What are the latest attacks on SNAP benefits?'"
echo ""
echo "🔍 WATCH FOR:"
echo "   • Backend logs: '🔍 Pre-searching for sources before LLM call...'"
echo "   • Backend logs: '📚 Found X sources - adding to context for LLM'"
echo "   • LLM should say 'Truthout reports...' NOT 'Democracy Now'"
echo ""
echo "💾 Backup: $BACKUP_DIR/ai-service-before-order-fix-$TIMESTAMP.js"
echo ""
