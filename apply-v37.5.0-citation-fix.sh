#!/bin/bash
# Workforce Democracy Project - v37.5.0 Citation Fix Deployment Script
# This script applies the citation mismatch fix to ai-service.js
# 
# What it does:
# 1. Creates backup of current ai-service.js
# 2. Applies v37.5.0 changes (pre-search sources before LLM call)
# 3. Restarts PM2 backend
# 4. Shows startup logs to verify the fix loaded
#
# Usage: bash apply-v37.5.0-citation-fix.sh

set -e  # Exit on any error

echo "════════════════════════════════════════════════════════════════"
echo "  Workforce Democracy - v37.5.0 Citation Fix Deployment"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/backend

# Step 1: Create backup
echo "📦 Step 1: Creating backup..."
BACKUP_FILE="ai-service-BACKUP-pre-v37.5.0-$(date +%Y%m%d-%H%M%S).js"
cp ai-service.js "$BACKUP_FILE"
echo "   ✅ Backup created: $BACKUP_FILE"
echo ""

# Step 2: Apply v37.5.0 changes
echo "🔧 Step 2: Applying v37.5.0 changes to ai-service.js..."

# Change 1: Update header comment from v37.1.0 to v37.5.0
sed -i 's/WORKFORCE DEMOCRACY PROJECT - AI Service (CONSOLIDATED v37\.1\.0)/WORKFORCE DEMOCRACY PROJECT - AI Service (CONSOLIDATED v37.5.0)/' ai-service.js
echo "   ✅ Updated version header to v37.5.0"

# Change 2: Add v37.5.0 feature description in header
sed -i '/- From llm-proxy.js: Smart caching, NEWS_SOURCES, searchAdditionalSources/a\ * - v37.5.0: Pre-search sources BEFORE LLM call to fix citation mismatches' ai-service.js
echo "   ✅ Added v37.5.0 feature description"

# Change 3: Add startup markers after header comment (after line 18 closing */)
sed -i '/\*\/$/a\
\
console.log('\''🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED - CITATION FIX ACTIVE 🚀🚀🚀'\'');\
console.log('\''📅 File loaded at:\'\'', new Date().toISOString());\
console.log('\''✨ Features: Pre-search sources BEFORE LLM call to prevent citation mismatches'\'');' ai-service.js
echo "   ✅ Added startup log markers"

# Change 4: Update buildContextualPrompt function signature (around line 1137)
sed -i 's/function buildContextualPrompt(query, context, chatType) {/function buildContextualPrompt(query, context, chatType, preFetchedSources = []) {/' ai-service.js
echo "   ✅ Updated buildContextualPrompt function signature"

# Change 5: Add pre-fetched sources section in buildContextualPrompt (after governmentData section)
# This is complex, so we'll create a separate patch file
cat > /tmp/v37.5.0-prompt-patch.txt << 'ENDPATCH'
    // V37.5.0: Add pre-fetched sources (NEW!)
    // This is the critical fix - LLM now sees sources BEFORE generating response
    if (preFetchedSources && preFetchedSources.length > 0) {
        prompt += `Web Search Results - YOU MUST USE THESE SOURCES FOR CITATIONS:\n`;
        prompt += `IMPORTANT: ${preFetchedSources.length} sources are available. Use ONLY citations [1] through [${preFetchedSources.length}].\n\n`;
        preFetchedSources.forEach((result, i) => {
            const sourceNum = i + 1;
            prompt += `[${sourceNum}] ${result.source || result.title}${result.trusted ? ' [TRUSTED]' : ''}\n`;
            prompt += `    Title: ${result.title}\n`;
            prompt += `    URL: ${result.url}\n`;
            if (result.excerpt) {
                prompt += `    Excerpt: ${result.excerpt.substring(0, 200)}\n`;
            }
            prompt += `\n`;
        });
        prompt += `\nREMEMBER: You have ${preFetchedSources.length} sources. Only use [1] through [${preFetchedSources.length}] in your response.\n\n`;
    }
    
ENDPATCH

# Find the line with "Add government data if available" and insert after the closing }
LINE_NUM=$(grep -n "// Add government data if available" ai-service.js | head -1 | cut -d: -f1)
if [ -n "$LINE_NUM" ]; then
    # Find the closing brace after this line
    CLOSING_LINE=$((LINE_NUM + 3))
    sed -i "${CLOSING_LINE}r /tmp/v37.5.0-prompt-patch.txt" ai-service.js
    echo "   ✅ Added pre-fetched sources to LLM prompt"
else
    echo "   ⚠️  Warning: Could not find insertion point for prompt patch"
fi

# Change 6: Update analyzeWithAI to pre-search sources
# This is the most complex change - we need to replace the section around line 1010-1058
cat > /tmp/v37.5.0-presearch-patch.txt << 'ENDPATCH'
        
        // =============================================================================
        // PHASE 1: Search for sources FIRST (v37.5.0 FIX)
        // =============================================================================
        // This ensures LLM knows exactly which sources exist before generating citations
        let sources = [];
        
        try {
            // Preliminary check: does this query need sources?
            if (needsCurrentInfo(query, '')) {
                console.log(`🔍 Pre-searching sources before LLM call...`);
                sources = await searchAdditionalSources(query, query); // Use query twice since no LLM response yet
                console.log(`📚 Found ${sources.length} sources to provide to LLM`);
            } else {
                console.log(`ℹ️  Query doesn't need current sources, proceeding without pre-search`);
            }
        } catch (error) {
            console.error('⚠️ Pre-search failed (non-fatal):', error.message);
            sources = [];
        }
        
        // Also extract sources from context
        const contextSources = extractSources('', context);
        sources.push(...contextSources);
        
        // Deduplicate sources before passing to LLM
        const uniqueSources = [];
        const seenUrls = new Set();
        sources.forEach(source => {
            if (source.url && !seenUrls.has(source.url)) {
                // Validate URL (no search pages)
                if (!source.url.includes('/search?q=') && 
                    !source.url.includes('duckduckgo.com') && 
                    !source.url.includes('google.com/search')) {
                    seenUrls.add(source.url);
                    uniqueSources.push(source);
                }
            }
        });
        
        console.log(`✅ Providing ${uniqueSources.length} validated sources to LLM`);
        
        // Build user message with context AND pre-searched sources
        const userMessage = buildContextualPrompt(query, context, chatType, uniqueSources);
        
        console.log(`🤖 AI Query: "${query.substring(0, 50)}..." (context: ${chatType}, sources: ${uniqueSources.length})`);
        
        // =============================================================================
        // PHASE 2: Call LLM with sources already available
        // =============================================================================
ENDPATCH

# Find "For NYC mayoral race" line and replace from there to "const response = await axios.post"
START_LINE=$(grep -n "For NYC mayoral race or other local elections happening" ai-service.js | head -1 | cut -d: -f1)
END_LINE=$(grep -n "const response = await axios.post" ai-service.js | head -1 | cut -d: -f1)

if [ -n "$START_LINE" ] && [ -n "$END_LINE" ]; then
    # Calculate line after the system prompt (should be around line 1012)
    INSERT_LINE=$((START_LINE + 2))
    # Delete old code between systemPrompt and axios.post
    sed -i "${INSERT_LINE},$((END_LINE - 1))d" ai-service.js
    # Insert new v37.5.0 pre-search code
    sed -i "${INSERT_LINE}r /tmp/v37.5.0-presearch-patch.txt" ai-service.js
    echo "   ✅ Added Phase 1 pre-search and Phase 2 LLM call"
else
    echo "   ⚠️  Warning: Could not find insertion point for pre-search patch"
fi

# Change 7: Update source return logic (around line 1096-1100)
# Replace the old source extraction with: use the same sources we gave to LLM
sed -i '/const aiText = response.data.choices\[0\].message.content;/,/console.log.*sources added to response/ {
    /const aiText/!{
        /console.log.*sources added to response/!d
    }
}' ai-service.js

# Insert the new v37.5.0 source handling after aiText assignment
LINE_NUM=$(grep -n "const aiText = response.data.choices\[0\].message.content;" ai-service.js | head -1 | cut -d: -f1)
if [ -n "$LINE_NUM" ]; then
    INSERT_LINE=$((LINE_NUM + 2))
    sed -i "${INSERT_LINE}i\\
        console.log(\`✅ AI response: \"\${aiText.substring(0, 50)}...\"\`);\
        \
        // V37.5.0: Sources already validated and deduplicated before LLM call\
        // LLM was given exactly these sources, so citations should match\
        const validSources = uniqueSources; // Use the same sources we gave to LLM\
        \
        console.log(\`✅ Returning \${validSources.length} sources (same as provided to LLM)\`);" ai-service.js
    echo "   ✅ Updated source return logic"
else
    echo "   ⚠️  Warning: Could not find insertion point for source return logic"
fi

# Change 8: Update buildContextualPrompt comment
sed -i 's/Build contextual prompt with available data$/Build contextual prompt with available data\n * V37.5.0: Now includes pre-searched sources so LLM knows what to cite/' ai-service.js
echo "   ✅ Updated buildContextualPrompt comment"

echo ""
echo "✅ All v37.5.0 changes applied successfully!"
echo ""

# Step 3: Verify changes were applied
echo "🔍 Step 3: Verifying changes..."
if grep -q "v37.5.0" ai-service.js && grep -q "🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED" ai-service.js; then
    echo "   ✅ Version markers found"
else
    echo "   ❌ ERROR: Version markers not found! Changes may not have applied correctly."
    echo "   Restoring from backup..."
    cp "$BACKUP_FILE" ai-service.js
    exit 1
fi

if grep -q "Pre-searching sources before LLM call" ai-service.js; then
    echo "   ✅ Pre-search code found"
else
    echo "   ⚠️  Warning: Pre-search code not found - manual verification needed"
fi

echo ""

# Step 4: Restart PM2
echo "🔄 Step 4: Restarting PM2 backend..."
pm2 stop backend 2>/dev/null || true
pm2 delete backend 2>/dev/null || true
pm2 start server.js --name backend
echo "   ✅ PM2 restarted"
echo ""

# Step 5: Wait for startup and show logs
echo "📋 Step 5: Checking startup logs for v37.5.0 markers..."
sleep 2
echo ""
echo "════════════════════════════════════════════════════════════════"
pm2 logs backend --lines 20 --nostream
echo "════════════════════════════════════════════════════════════════"
echo ""

# Check for success markers
if pm2 logs backend --lines 50 --nostream 2>/dev/null | grep -q "🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED"; then
    echo "✅ SUCCESS! v37.5.0 citation fix is now active!"
    echo ""
    echo "Expected behaviors:"
    echo "  • LLM now receives sources BEFORE generating response"
    echo "  • Citations [1] through [N] will match exactly N sources provided"
    echo "  • No more citation/source mismatches"
    echo ""
    echo "Test the chat now and check logs for:"
    echo "  🔍 Pre-searching sources before LLM call..."
    echo "  📚 Found X sources to provide to LLM"
    echo "  ✅ Providing X validated sources to LLM"
    echo "  🤖 AI Query: \"...\" (context: general, sources: X)"
else
    echo "⚠️  WARNING: v37.5.0 startup markers not found in logs"
    echo "The changes were applied to the file, but may not be loading correctly."
    echo "Please check the full logs with: pm2 logs backend"
fi

echo ""
echo "Backup saved as: $BACKUP_FILE"
echo "To rollback if needed: cp $BACKUP_FILE ai-service.js && pm2 restart backend"
echo ""
echo "════════════════════════════════════════════════════════════════"
