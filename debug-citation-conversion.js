/**
 * DEBUG CITATION CONVERSION
 * 
 * Copy and paste this ENTIRE file into your browser console
 * while on your homepage to debug why citations aren't converting
 */

console.log('%c🔬 CITATION CONVERSION DEBUG', 'font-size: 20px; font-weight: bold; color: #ef4444;');
console.log('%c═══════════════════════════════════════════════════════', 'color: #ef4444;');

// ============================================================================
// TEST 1: Check Citation Renderer Functions
// ============================================================================
console.log('\n%c📦 TEST 1: Citation Renderer Functions', 'font-weight: bold; color: #3b82f6;');

const citationFunctions = {
    parseSourcesList: typeof window.parseSourcesList === 'function',
    convertCitationsToHTML: typeof window.convertCitationsToHTML === 'function',
    generateSourcesHTML: typeof window.generateSourcesHTML === 'function',
    parseCitationsFromResponse: typeof window.parseCitationsFromResponse === 'function'
};

Object.entries(citationFunctions).forEach(([name, exists]) => {
    if (exists) {
        console.log(`   ✅ ${name}()`);
    } else {
        console.log(`   ❌ ${name}() NOT FOUND`);
    }
});

const allCitationFunctionsLoaded = Object.values(citationFunctions).every(v => v);

if (!allCitationFunctionsLoaded) {
    console.log('\n   %c❌ ISSUE FOUND: Citation renderer not fully loaded!', 'color: #ef4444; font-weight: bold;');
    console.log('   Check if js/citation-renderer.js is loading correctly');
    console.log('   Check Network tab for 404 errors');
}

// ============================================================================
// TEST 2: Test Citation Conversion Directly
// ============================================================================
console.log('\n%c🧪 TEST 2: Testing Citation Conversion', 'font-weight: bold; color: #3b82f6;');

const sampleResponse = `Jeffries has been a strong advocate[1] for progressive policies.

Sources:
1. ProPublica - Test Article
   URL: https://example.com`;

console.log('Input text:');
console.log(sampleResponse);

if (typeof window.parseMarkdownAndCitations === 'function') {
    try {
        const result = window.parseMarkdownAndCitations(sampleResponse);
        
        console.log('\n   Output:');
        console.log('   mainText:', result.mainText);
        console.log('   sources count:', result.sources.length);
        console.log('   uniqueId:', result.uniqueId);
        
        // Check what's in the output
        const checks = {
            hasSup: result.mainText.includes('<sup>'),
            hasLiteralCitation: result.mainText.includes('[1]'),
            hasPlaceholder: result.mainText.includes('CITE') || result.mainText.includes('◊'),
            hasCitationLink: result.mainText.includes('citation-link'),
            hasSources: result.sources.length > 0
        };
        
        console.log('\n   Analysis:');
        console.log('   - Contains <sup>:', checks.hasSup ? '✅ YES' : '❌ NO');
        console.log('   - Contains [1]:', checks.hasLiteralCitation ? '⚠️ YES (not converted)' : '✅ NO');
        console.log('   - Contains placeholder:', checks.hasPlaceholder ? '❌ YES (leaked)' : '✅ NO');
        console.log('   - Contains citation-link:', checks.hasCitationLink ? '✅ YES' : '❌ NO');
        console.log('   - Parsed sources:', checks.hasSources ? '✅ YES' : '❌ NO');
        
        if (checks.hasSup && checks.hasCitationLink && !checks.hasLiteralCitation) {
            console.log('\n   %c✅ CITATION CONVERSION WORKING!', 'color: #10b981; font-weight: bold;');
            console.log('   The function works correctly. Issue must be in chat widget.');
        } else if (checks.hasLiteralCitation && !checks.hasSup) {
            console.log('\n   %c❌ CITATIONS NOT CONVERTING!', 'color: #ef4444; font-weight: bold;');
            console.log('   [1] is preserved but not converted to <sup>');
            console.log('   This means convertCitationsToHTML() is not running');
        } else if (checks.hasPlaceholder) {
            console.log('\n   %c❌ PLACEHOLDER LEAKED!', 'color: #ef4444; font-weight: bold;');
            console.log('   The placeholder from markdown processing is visible');
        }
        
    } catch (error) {
        console.log('   %c❌ ERROR:', 'color: #ef4444;', error.message);
    }
} else {
    console.log('   ❌ parseMarkdownAndCitations() not found');
}

// ============================================================================
// TEST 3: Check Script Tags
// ============================================================================
console.log('\n%c🔗 TEST 3: Script Tags in HTML', 'font-weight: bold; color: #3b82f6;');

const scripts = Array.from(document.scripts);
const citationScript = scripts.find(s => s.src.includes('citation-renderer'));
const markdownScript = scripts.find(s => s.src.includes('markdown-renderer'));

if (citationScript) {
    console.log('   ✅ citation-renderer.js found');
    console.log('   URL:', citationScript.src);
} else {
    console.log('   ❌ citation-renderer.js script tag NOT FOUND');
}

if (markdownScript) {
    console.log('   ✅ markdown-renderer.js found');
    console.log('   URL:', markdownScript.src);
} else {
    console.log('   ❌ markdown-renderer.js script tag NOT FOUND');
}

// ============================================================================
// TEST 4: Test convertCitationsToHTML Directly
// ============================================================================
console.log('\n%c🎯 TEST 4: Testing convertCitationsToHTML() Directly', 'font-weight: bold; color: #3b82f6;');

if (typeof window.convertCitationsToHTML === 'function') {
    try {
        const testText = 'This is a test[1] with citation[2].';
        const testSources = [
            { number: 1, title: 'Source 1', url: 'https://example.com/1' },
            { number: 2, title: 'Source 2', url: 'https://example.com/2' }
        ];
        
        const converted = window.convertCitationsToHTML(testText, testSources, 'test-123');
        
        console.log('   Input:', testText);
        console.log('   Output:', converted);
        
        if (converted.includes('<sup>')) {
            console.log('   ✅ convertCitationsToHTML() WORKS!');
            console.log('   [1] and [2] converted to <sup> elements');
        } else {
            console.log('   ❌ convertCitationsToHTML() DID NOT CONVERT!');
            console.log('   Function ran but did not produce <sup> elements');
        }
    } catch (error) {
        console.log('   ❌ ERROR:', error.message);
    }
} else {
    console.log('   ❌ convertCitationsToHTML() not found');
}

// ============================================================================
// TEST 5: Check markdown-renderer integration
// ============================================================================
console.log('\n%c🔄 TEST 5: Markdown Renderer → Citation Renderer Flow', 'font-weight: bold; color: #3b82f6;');

const fullTestResponse = `He has been a strong advocate for **progressive policies**[1].

Sources:
1. Test Source`;

console.log('Testing full pipeline with markdown + citation:');
console.log('Input:', fullTestResponse);

if (typeof window.parseMarkdownAndCitations === 'function') {
    const result = window.parseMarkdownAndCitations(fullTestResponse);
    console.log('Output:', result.mainText);
    
    const hasBold = result.mainText.includes('<strong>');
    const hasSup = result.mainText.includes('<sup>');
    
    console.log('\n   Checks:');
    console.log('   - Bold converted:', hasBold ? '✅' : '❌');
    console.log('   - Citation converted:', hasSup ? '✅' : '❌');
    
    if (hasBold && hasSup) {
        console.log('\n   %c✅ FULL PIPELINE WORKS!', 'color: #10b981; font-weight: bold;');
    } else if (hasBold && !hasSup) {
        console.log('\n   %c⚠️ MARKDOWN WORKS, CITATIONS DON\'T', 'color: #f59e0b; font-weight: bold;');
        console.log('   Markdown renderer is working (V36.11.12)');
        console.log('   But citation renderer is not converting [1] to <sup>');
    }
}

// ============================================================================
// TEST 6: Simulate What Chat Widget Does
// ============================================================================
console.log('\n%c💬 TEST 6: Simulating Chat Widget Behavior', 'font-weight: bold; color: #3b82f6;');

const chatResponse = `Jeffries has been a strong advocate[1] for progressive policies.

Sources:
1. ProPublica - Test Article
   URL: https://example.com`;

console.log('Simulating typewriterWithMarkdownAndCitations():');

if (typeof window.typewriterWithMarkdownAndCitations === 'function') {
    console.log('   ✅ typewriterWithMarkdownAndCitations() exists');
    
    // Create a test div
    const testDiv = document.createElement('div');
    testDiv.id = 'citation-debug-test';
    testDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: white; border: 2px solid #ef4444; padding: 20px; max-width: 400px; z-index: 99999; box-shadow: 0 4px 12px rgba(0,0,0,0.3);';
    document.body.appendChild(testDiv);
    
    // Test the typewriter function
    console.log('   Creating test div on page (top-right corner)...');
    console.log('   This will show exactly how chat widget renders text');
    
    // Call the function
    window.parseMarkdownAndCitations(chatResponse);
    const parsed = window.parseMarkdownAndCitations(chatResponse);
    testDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #ef4444;">🔬 Citation Debug Test</div>
        <div style="margin-bottom: 10px; font-size: 14px;">
            ${parsed.mainText}
        </div>
        ${parsed.sources.length > 0 ? window.generateSourcesHTML(parsed.sources, parsed.uniqueId) : ''}
        <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    `;
    
    console.log('   %c✅ Test div created on page!', 'color: #10b981;');
    console.log('   Look at top-right corner of your screen');
    console.log('   Check if citation appears as superscript ¹ or as [1]');
    
} else {
    console.log('   ❌ typewriterWithMarkdownAndCitations() not found');
}

// ============================================================================
// FINAL DIAGNOSIS
// ============================================================================
console.log('\n%c═══════════════════════════════════════════════════════', 'color: #ef4444;');
console.log('%c📊 FINAL DIAGNOSIS', 'font-size: 18px; font-weight: bold; color: #ef4444;');
console.log('%c═══════════════════════════════════════════════════════', 'color: #ef4444;');

const diagnosis = {
    markdownRendererLoaded: typeof window.processInlineMarkdown === 'function',
    markdownVersion: 'UNKNOWN',
    citationRendererLoaded: allCitationFunctionsLoaded,
    conversionWorks: false
};

// Check markdown version
if (diagnosis.markdownRendererLoaded) {
    const code = window.processInlineMarkdown.toString();
    diagnosis.markdownVersion = code.includes('◊◊CITE') ? 'V36.11.12' : 'OLD';
}

console.log('\n%cComponents Status:', 'font-weight: bold;');
console.log('  Markdown Renderer:', diagnosis.markdownRendererLoaded ? '✅ Loaded' : '❌ Not loaded');
console.log('  Markdown Version:', diagnosis.markdownVersion);
console.log('  Citation Renderer:', diagnosis.citationRendererLoaded ? '✅ Loaded' : '❌ Not loaded');

if (diagnosis.markdownRendererLoaded && diagnosis.markdownVersion === 'V36.11.12' && diagnosis.citationRendererLoaded) {
    console.log('\n%c✅ ALL COMPONENTS LOADED CORRECTLY', 'color: #10b981; font-weight: bold;');
    console.log('\n%c🔍 Check the test div (top-right corner):', 'font-weight: bold;');
    console.log('   - If citation shows as ¹ → Everything works!');
    console.log('   - If citation shows as [1] → Citation renderer not running in pipeline');
    console.log('\n%cMost likely issue:', 'font-weight: bold;');
    console.log('   The functions work in isolation but chat widget may not be calling them correctly');
} else if (!diagnosis.citationRendererLoaded) {
    console.log('\n%c❌ CITATION RENDERER NOT LOADED', 'color: #ef4444; font-weight: bold;');
    console.log('\n%cSolution:', 'font-weight: bold;');
    console.log('   1. Check if js/citation-renderer.js exists in your files');
    console.log('   2. Check Network tab for 404 errors');
    console.log('   3. Make sure file is in Git repository');
    console.log('   4. Redeploy to Netlify');
} else if (diagnosis.markdownVersion !== 'V36.11.12') {
    console.log('\n%c⚠️ OLD MARKDOWN RENDERER VERSION', 'color: #f59e0b; font-weight: bold;');
    console.log('   Clear Netlify cache and redeploy');
}

console.log('\n%c═══════════════════════════════════════════════════════', 'color: #ef4444;');
console.log('%cDone! Look at the test div in top-right corner.', 'font-style: italic; color: #64748b;');
