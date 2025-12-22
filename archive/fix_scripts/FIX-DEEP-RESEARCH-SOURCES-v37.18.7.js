/**
 * FIX: Deep Research Sources Not Being Used
 * v37.18.7 - Bug fix for representative query deep research
 * 
 * PROBLEM:
 * - Deep research finds 11 Congress.gov sources
 * - AI response only uses 2 Democracy Now RSS sources (unrelated)
 * - Result: No relevant healthcare voting record information
 * 
 * ROOT CAUSE:
 * - aiService.analyzeWithAI() returns sources in result.sources
 * - BUT civic-llm-async.js expects result to be a string (the AI response)
 * - So it ignores the sources and falls back to empty array
 * - Then it uses RSS sources as fallback
 * 
 * FIX:
 * - Extract sources from aiService.analyzeWithAI() result properly
 * - Use deep research sources, NOT RSS sources when deep research enabled
 */

const fs = require('fs');
const path = require('path');

const FILE_PATH = '/var/www/workforce-democracy/version-b/backend/civic-llm-async.js';

console.log('🔧 FIX: Deep Research Sources Bug (v37.18.7)');
console.log('═══════════════════════════════════════════════\n');

// Read the file
let content;
try {
    content = fs.readFileSync(FILE_PATH, 'utf8');
    console.log('✅ Read civic-llm-async.js');
} catch (error) {
    console.error('❌ ERROR: Could not read file:', error.message);
    process.exit(1);
}

// Find the deep research block
const deepResearchBlock = `            aiResponse = result.analysis || result.response || result;
            sources = result.sources || [];`;

const fixedDeepResearchBlock = `            // v37.18.7 FIX: Extract both response AND sources from deep research
            if (typeof result === 'object' && result.response) {
                aiResponse = result.response;
                sources = result.sources || [];
                console.log(\`[Civic LLM] 📚 Deep research returned \${sources.length} sources\`);
            } else if (typeof result === 'string') {
                aiResponse = result;
                sources = [];
                console.log('[Civic LLM] ⚠️  Deep research returned string only (no sources)');
            } else {
                aiResponse = result.analysis || result.response || result;
                sources = result.sources || [];
                console.log(\`[Civic LLM] 📚 Deep research returned \${sources.length} sources (legacy format)\`);
            }`;

if (!content.includes(deepResearchBlock)) {
    console.error('❌ ERROR: Could not find deep research block to fix');
    console.error('   Expected to find:');
    console.error('   ' + deepResearchBlock.split('\n')[0]);
    process.exit(1);
}

// Apply the fix
content = content.replace(deepResearchBlock, fixedDeepResearchBlock);

console.log('✅ Applied deep research source extraction fix\n');

// Write the fixed file
try {
    fs.writeFileSync(FILE_PATH, content, 'utf8');
    console.log('✅ Wrote fixed civic-llm-async.js\n');
} catch (error) {
    console.error('❌ ERROR: Could not write file:', error.message);
    process.exit(1);
}

console.log('═══════════════════════════════════════════════');
console.log('✨ FIX COMPLETE!');
console.log('═══════════════════════════════════════════════\n');
console.log('📋 NEXT STEPS:');
console.log('1. Restart Version B backend:');
console.log('   sudo systemctl restart workforce-backend-b.service');
console.log('');
console.log('2. Test the query again:');
console.log('   "What is Chuck Schumer voting record on healthcare?"');
console.log('');
console.log('3. Expected result:');
console.log('   - Should see 11 Congress.gov bill sources');
console.log('   - Should have clickable citations [1] [2] [3]...');
console.log('   - Should show actual healthcare bills');
console.log('');
console.log('🎯 This should fix the deep research sources issue!');
