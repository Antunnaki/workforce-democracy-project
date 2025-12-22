/**
 * TEST ON HOMEPAGE - Copy and paste this into browser console
 * 
 * Instructions:
 * 1. Open: https://www.genspark.ai (or your actual site)
 * 2. Press F12 (open DevTools)
 * 3. Go to Console tab
 * 4. Copy and paste this ENTIRE file into console
 * 5. Press Enter
 * 6. Results will display in console
 */

console.log('%c🔬 HOMEPAGE CITATION TEST', 'font-size: 20px; font-weight: bold; color: #667eea;');
console.log('%c═══════════════════════════════════════════════════════', 'color: #667eea;');

const results = {
    scriptsLoaded: false,
    version: 'UNKNOWN',
    functionTest: 'NOT RUN',
    issues: []
};

// ============================================================================
// TEST 1: Check if scripts are loaded
// ============================================================================
console.log('\n%c📦 TEST 1: Checking if scripts are loaded...', 'font-weight: bold; color: #3b82f6;');

const scriptsCheck = {
    parseMarkdownAndCitations: typeof window.parseMarkdownAndCitations === 'function',
    convertCitationsToHTML: typeof window.convertCitationsToHTML === 'function',
    processInlineMarkdown: typeof window.processInlineMarkdown === 'function',
    typewriterWithMarkdownAndCitations: typeof window.typewriterWithMarkdownAndCitations === 'function'
};

if (scriptsCheck.parseMarkdownAndCitations) {
    console.log('   ✅ parseMarkdownAndCitations() is loaded');
} else {
    console.log('   ❌ parseMarkdownAndCitations() NOT FOUND');
    results.issues.push('parseMarkdownAndCitations() not loaded');
}

if (scriptsCheck.convertCitationsToHTML) {
    console.log('   ✅ convertCitationsToHTML() is loaded');
} else {
    console.log('   ❌ convertCitationsToHTML() NOT FOUND');
    results.issues.push('convertCitationsToHTML() not loaded');
}

if (scriptsCheck.processInlineMarkdown) {
    console.log('   ✅ processInlineMarkdown() is loaded');
} else {
    console.log('   ❌ processInlineMarkdown() NOT FOUND');
    results.issues.push('processInlineMarkdown() not loaded');
}

if (scriptsCheck.typewriterWithMarkdownAndCitations) {
    console.log('   ✅ typewriterWithMarkdownAndCitations() is loaded');
} else {
    console.log('   ❌ typewriterWithMarkdownAndCitations() NOT FOUND');
    results.issues.push('typewriterWithMarkdownAndCitations() not loaded');
}

results.scriptsLoaded = Object.values(scriptsCheck).every(v => v === true);

if (results.scriptsLoaded) {
    console.log('\n   %c✅ ALL SCRIPTS LOADED SUCCESSFULLY', 'color: #10b981; font-weight: bold;');
} else {
    console.log('\n   %c❌ SCRIPTS NOT LOADING - CHECK BELOW FOR ISSUES', 'color: #ef4444; font-weight: bold;');
}

// ============================================================================
// TEST 2: Check version (if script loaded)
// ============================================================================
console.log('\n%c🔍 TEST 2: Checking script version...', 'font-weight: bold; color: #3b82f6;');

if (scriptsCheck.processInlineMarkdown) {
    const functionCode = window.processInlineMarkdown.toString();
    
    if (functionCode.includes('◊◊CITE')) {
        console.log('   %c✅ V36.11.12 DETECTED', 'color: #10b981; font-weight: bold;');
        console.log('   Function uses: ◊◊CITE placeholder (CORRECT VERSION)');
        results.version = 'V36.11.12';
    } else if (functionCode.includes('__CITATION_')) {
        console.log('   %c❌ OLD VERSION DETECTED (V36.11.11 or earlier)', 'color: #ef4444; font-weight: bold;');
        console.log('   Function uses: __CITATION_ placeholder (WRONG VERSION)');
        results.version = 'V36.11.11 or earlier';
        results.issues.push('OLD version loaded (needs cache clear)');
    } else {
        console.log('   %c⚠️ UNKNOWN VERSION', 'color: #f59e0b; font-weight: bold;');
        console.log('   Cannot find citation placeholder in code');
        results.version = 'UNKNOWN';
        results.issues.push('Cannot determine version');
    }
} else {
    console.log('   %c❌ Cannot check version - function not loaded', 'color: #ef4444;');
}

// ============================================================================
// TEST 3: Test the function
// ============================================================================
console.log('\n%c🧪 TEST 3: Testing function with sample input...', 'font-weight: bold; color: #3b82f6;');

if (scriptsCheck.processInlineMarkdown) {
    try {
        const input = 'Test __bold__[1] text';
        const output = window.processInlineMarkdown(input);
        
        console.log('   Input:  "' + input + '"');
        console.log('   Output: "' + output + '"');
        
        const checks = [];
        
        if (output.includes('[1]')) {
            console.log('   ✅ Citation [1] preserved correctly');
            checks.push('citation-preserved');
        } else if (output.includes('◊◊CITE')) {
            console.log('   ❌ Placeholder not restored - shows ◊◊CITE');
            checks.push('placeholder-leaked');
            results.issues.push('Placeholder not restoring correctly');
        } else if (output.includes('CITATION')) {
            console.log('   ❌ Placeholder leaked - shows CITATION text');
            checks.push('placeholder-leaked');
            results.issues.push('Placeholder visible in output');
        } else {
            console.log('   ❌ Citation completely lost');
            checks.push('citation-lost');
            results.issues.push('Citation lost during processing');
        }
        
        if (output.includes('<strong>bold</strong>')) {
            console.log('   ✅ Bold __text__ converted correctly');
            checks.push('bold-works');
        } else {
            console.log('   ❌ Bold conversion failed');
            checks.push('bold-failed');
            results.issues.push('Bold markdown not converting');
        }
        
        if (checks.includes('citation-preserved') && checks.includes('bold-works')) {
            console.log('\n   %c✅ FUNCTION TEST PASSED', 'color: #10b981; font-weight: bold;');
            results.functionTest = 'PASSED';
        } else {
            console.log('\n   %c❌ FUNCTION TEST FAILED', 'color: #ef4444; font-weight: bold;');
            results.functionTest = 'FAILED';
        }
        
    } catch (error) {
        console.log('   %c❌ ERROR: ' + error.message, 'color: #ef4444;');
        results.functionTest = 'ERROR';
        results.issues.push('Function threw error: ' + error.message);
    }
} else {
    console.log('   %c❌ Cannot test - function not loaded', 'color: #ef4444;');
    results.functionTest = 'NOT LOADED';
}

// ============================================================================
// TEST 4: Check script tags in HTML
// ============================================================================
console.log('\n%c🔗 TEST 4: Checking script tags in HTML...', 'font-weight: bold; color: #3b82f6;');

const scripts = Array.from(document.scripts);
const markdownScript = scripts.find(s => s.src.includes('markdown-renderer'));
const citationScript = scripts.find(s => s.src.includes('citation-renderer'));

if (markdownScript) {
    console.log('   ✅ Found markdown-renderer.js script tag');
    console.log('   URL: ' + markdownScript.src);
    
    const hasVersion = markdownScript.src.includes('?v=');
    if (hasVersion) {
        const version = markdownScript.src.match(/\?v=([^&]+)/)?.[1];
        console.log('   Version parameter: ' + version);
        
        if (version === '36.11.12') {
            console.log('   ✅ Correct version parameter (36.11.12)');
        } else {
            console.log('   ⚠️ Version parameter: ' + version + ' (expected: 36.11.12)');
            results.issues.push('Version parameter not updated');
        }
    } else {
        console.log('   ⚠️ No version parameter (files will cache indefinitely)');
        results.issues.push('No version parameter for cache busting');
    }
} else {
    console.log('   ❌ markdown-renderer.js script tag NOT FOUND');
    results.issues.push('markdown-renderer.js script tag missing from HTML');
}

if (citationScript) {
    console.log('   ✅ Found citation-renderer.js script tag');
    console.log('   URL: ' + citationScript.src);
} else {
    console.log('   ❌ citation-renderer.js script tag NOT FOUND');
    results.issues.push('citation-renderer.js script tag missing from HTML');
}

// ============================================================================
// FINAL SUMMARY
// ============================================================================
console.log('\n%c═══════════════════════════════════════════════════════', 'color: #667eea;');
console.log('%c📊 FINAL SUMMARY', 'font-size: 18px; font-weight: bold; color: #667eea;');
console.log('%c═══════════════════════════════════════════════════════', 'color: #667eea;');

console.log('\n%cScripts Loaded:', 'font-weight: bold;', results.scriptsLoaded ? '✅ YES' : '❌ NO');
console.log('%cVersion:', 'font-weight: bold;', results.version);
console.log('%cFunction Test:', 'font-weight: bold;', results.functionTest);

if (results.issues.length === 0) {
    console.log('\n%c🎉 ALL TESTS PASSED - Citations should be working!', 'color: #10b981; font-size: 16px; font-weight: bold;');
    console.log('\nNext step: Test the actual chat widget with a real query.');
} else {
    console.log('\n%c⚠️ ISSUES FOUND:', 'color: #ef4444; font-size: 16px; font-weight: bold;');
    results.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
    });
    
    console.log('\n%cRECOMMENDED ACTIONS:', 'font-weight: bold; color: #f59e0b;');
    
    if (!results.scriptsLoaded) {
        console.log('   1. Check if js/markdown-renderer.js and js/citation-renderer.js exist');
        console.log('   2. Check if they are in your Git repository');
        console.log('   3. Check Netlify build log for errors');
        console.log('   4. Make sure files are not in .gitignore');
    }
    
    if (results.version === 'V36.11.11 or earlier') {
        console.log('   1. Clear Netlify cache: Deploys → Trigger deploy → Clear cache');
        console.log('   2. Add timestamp to version parameter in index.html');
        console.log('   3. Wait 10 minutes for CDN propagation');
        console.log('   4. Clear browser cache and test again');
    }
}

console.log('\n%c═══════════════════════════════════════════════════════', 'color: #667eea;');
console.log('%cCopy these results and send to developer if you need help.', 'color: #64748b; font-style: italic;');
console.log('%c═══════════════════════════════════════════════════════', 'color: #667eea;');

// Return results object for easy access
results;
