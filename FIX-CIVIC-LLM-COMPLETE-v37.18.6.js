#!/usr/bin/env node
/**
 * COMPLETE FIX: Civic LLM Citations & Deep Research
 * Version: 37.18.6
 * 
 * FIXES:
 * 1. civic-llm-async.js line 125: generateResponse → analyzeWithAI
 * 2. Integrate deep-research.js for Congress.gov bills
 */

const fs = require('fs');
const path = require('path');

const TARGET_FILE = '/var/www/workforce-democracy/version-b/backend/civic-llm-async.js';
const BACKUP_FILE = `${TARGET_FILE}.backup-v37.18.6-${Date.now()}`;

console.log('🔧 COMPLETE FIX: Civic LLM Citations & Deep Research');
console.log('=' .repeat(60));

// 1. Create backup
console.log(`\n📦 Creating backup: ${BACKUP_FILE}`);
fs.copyFileSync(TARGET_FILE, BACKUP_FILE);
console.log('✅ Backup created');

// 2. Read file
let content = fs.readFileSync(TARGET_FILE, 'utf8');
const originalContent = content;

// 3. FIX #1: Change generateResponse → analyzeWithAI
console.log('\n🔨 FIX #1: Changing generateResponse → analyzeWithAI...');
const oldLine = 'const aiResponse = await aiService.generateResponse(message, sources, context, conversationHistory);';
const newLine = 'const aiResponse = await aiService.analyzeWithAI(message, sources, context, conversationHistory);';

if (content.includes(oldLine)) {
    content = content.replace(oldLine, newLine);
    console.log('✅ Fixed function call');
} else {
    console.log('⚠️  Pattern not found or already fixed');
}

// 4. FIX #2: Integrate deep research
console.log('\n🔨 FIX #2: Integrating deep-research.js...');

// Find the processQuery function
const processQueryStart = content.indexOf('async function processQuery(jobId)');
if (processQueryStart === -1) {
    console.error('❌ ERROR: processQuery function not found');
    process.exit(1);
}

// Find Step 1 comment
const step1Index = content.indexOf('// Step 1: Search RSS feeds', processQueryStart);
if (step1Index === -1) {
    console.error('❌ ERROR: Step 1 comment not found');
    process.exit(1);
}

// Find the line with rssService.searchFeeds
const rssLine = content.indexOf('const sources = await rssService.searchFeeds(message, context);', step1Index);
if (rssLine === -1) {
    console.error('❌ ERROR: rssService.searchFeeds line not found');
    process.exit(1);
}

// Replace the RSS block with complete deep research integration
const oldRssBlock = `        // Step 1: Search RSS feeds (20% progress)
        jobQueue.updateProgress(jobId, 20, 'Searching California RSS feeds...');
        const sources = await rssService.searchFeeds(message, context);
        
        console.log(\`[Civic LLM Async] 📚 Found \${sources.length} sources for job \${jobId}\`);`;

const newRssBlock = `        // Step 1: Search RSS feeds (20% progress)
        jobQueue.updateProgress(jobId, 20, 'Searching California RSS feeds...');
        const rssSources = await rssService.searchFeeds(message, context);
        
        console.log(\`[Civic LLM Async] 📰 Found \${rssSources.length} RSS sources for job \${jobId}\`);
        
        // Step 1.5: Deep Research - Congress.gov bills (30% progress)
        let deepResearchSources = [];
        if (context.chatType === 'representatives' && context.hasRepContext) {
            try {
                jobQueue.updateProgress(jobId, 30, 'Searching Congress.gov for bills...');
                const deepResearch = require('./deep-research');
                deepResearchSources = await deepResearch.searchRepresentativeVotingRecord(message, context);
                console.log(\`[Civic LLM Async] 🏛️  Found \${deepResearchSources.length} Congress.gov bills for job \${jobId}\`);
            } catch (error) {
                console.error('[Civic LLM Async] ⚠️  Deep research failed (non-fatal):', error.message);
            }
        }
        
        // Combine all sources
        const sources = [...rssSources, ...deepResearchSources];
        console.log(\`[Civic LLM Async] 📚 Total sources: \${sources.length} (RSS: \${rssSources.length}, Congress: \${deepResearchSources.length})\`);`;

if (content.includes(oldRssBlock)) {
    content = content.replace(oldRssBlock, newRssBlock);
    console.log('✅ Integrated deep-research.js');
} else {
    console.log('⚠️  RSS block not found or already modified');
}

// 5. Update Step 2 progress comment
content = content.replace(
    '// Step 2: Generate AI response (40% progress)',
    '// Step 2: Generate AI response (50% progress)'
);

content = content.replace(
    "jobQueue.updateProgress(jobId, 40, 'Generating AI response with sources...');",
    "jobQueue.updateProgress(jobId, 50, 'Generating AI response with sources...');"
);

// 6. Write fixed file
if (content !== originalContent) {
    fs.writeFileSync(TARGET_FILE, content, 'utf8');
    console.log('\n✅ File updated successfully');
    
    console.log('\n📊 CHANGES SUMMARY:');
    console.log('  1. Fixed: generateResponse → analyzeWithAI');
    console.log('  2. Added: Deep research integration for Congress.gov bills');
    console.log('  3. Updated: Progress indicators (20% → 30% → 50%)');
    
    console.log(`\n📦 Backup saved to: ${BACKUP_FILE}`);
} else {
    console.log('\n⚠️  No changes made (already fixed or pattern mismatch)');
}

console.log('\n' + '='.repeat(60));
console.log('✅ FIX COMPLETE');
