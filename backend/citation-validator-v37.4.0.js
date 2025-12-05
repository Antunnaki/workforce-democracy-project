/**
 * Citation Validator v37.4.0
 * Ensures LLM-generated citations match available sources
 * 
 * Problem: LLM generates [1], [2], [3]... [12] but only 2 sources found
 * Solution: Strip invalid citations that don't have matching sources
 */

/**
 * Validate and fix citations in AI response
 * @param {string} aiText - AI response with [1], [2], [3] citations
 * @param {Array} sources - Array of actual sources found
 * @returns {string} Fixed text with only valid citations
 */
function validateCitations(aiText, sources) {
    if (!sources || sources.length === 0) {
        // No sources - remove ALL citations
        return aiText.replace(/\[(\d+)\]/g, '');
    }
    
    const maxCitation = sources.length;
    console.log(`📋 Citation validation: Found ${maxCitation} sources, validating citations...`);
    
    let fixedText = aiText;
    let removedCount = 0;
    
    // Replace invalid citations (> sources.length) with empty string
    fixedText = fixedText.replace(/\[(\d+)\]/g, (match, number) => {
        const citationNum = parseInt(number);
        if (citationNum > maxCitation) {
            removedCount++;
            console.log(`  ❌ Removed invalid citation [${citationNum}] (only ${maxCitation} sources available)`);
            return ''; // Remove invalid citation
        }
        return match; // Keep valid citation
    });
    
    if (removedCount > 0) {
        console.log(`✅ Removed ${removedCount} invalid citations`);
    } else {
        console.log(`✅ All citations valid (1-${maxCitation})`);
    }
    
    return fixedText;
}

/**
 * Reformat sources section to match available sources
 * @param {string} aiText - AI response with Sources: section
 * @param {Array} sources - Array of actual sources
 * @returns {string} Text with corrected Sources section
 */
function fixSourcesSection(aiText, sources) {
    // Remove old Sources section
    let textWithoutSources = aiText.replace(/\n\n(Sources?:|References?:)\s*\n[\s\S]*$/i, '');
    
    if (sources.length === 0) {
        return textWithoutSources; // No sources, no section
    }
    
    // Build new Sources section with actual sources
    let sourcesSection = '\n\nSources:\n';
    sources.forEach((source, index) => {
        sourcesSection += `[${index + 1}] ${source.title || source.source} - ${source.url}\n`;
    });
    
    return textWithoutSources + sourcesSection;
}

/**
 * Complete citation fix pipeline
 * @param {string} aiText - Raw AI response
 * @param {Array} sources - Array of actual sources found
 * @returns {string} Fully validated and fixed response
 */
function fixCitations(aiText, sources) {
    console.log(`\n🔧 [CITATION FIX] Starting citation validation...`);
    console.log(`   AI response length: ${aiText.length} chars`);
    console.log(`   Sources available: ${sources.length}`);
    
    // Step 1: Validate inline citations
    let fixedText = validateCitations(aiText, sources);
    
    // Step 2: Fix Sources section
    fixedText = fixSourcesSection(fixedText, sources);
    
    console.log(`✅ [CITATION FIX] Complete! Fixed response length: ${fixedText.length} chars\n`);
    
    return fixedText;
}

module.exports = {
    validateCitations,
    fixSourcesSection,
    fixCitations
};
