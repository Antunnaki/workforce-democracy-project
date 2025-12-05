/**
 * TEST TYPEWRITER FUNCTION DIRECTLY
 * 
 * This will test the typewriter function with the exact response
 * you received from the backend
 */

console.log('%c🎬 TESTING TYPEWRITER FUNCTION', 'font-size: 20px; font-weight: bold; color: #3b82f6;');

// The exact response from your backend
const backendResponse = `Kirsten Gillibrand is a US Senator from New York, serving since 2009. She has been a prominent figure in national politics, particularly during her 2020 presidential campaign. To understand her policy positions and actions, let's examine her voting record, campaign finance, and public statements.

Gillibrand's voting record shows a mix of progressive and establishment positions. She has been a strong advocate for women's rights, LGBTQ+ rights, and healthcare reform [1]. However, her stance on issues like immigration and foreign policy has been more nuanced, sometimes aligning with establishment Democrats [2].

Sources:
[1] https://www.democracynow.org/2019/1/17/kirsten_gillibrand
[2] https://theintercept.com/2019/01/16/kirsten-gillibrand`;

console.log('Backend response (sample):', backendResponse.substring(0, 200) + '...');

// Create a test container
const testContainer = document.createElement('div');
testContainer.id = 'typewriter-test-container';
testContainer.style.cssText = 'position: fixed; top: 50px; right: 50px; width: 500px; background: white; border: 3px solid #3b82f6; padding: 30px; z-index: 999999; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-height: 80vh; overflow-y: auto;';
testContainer.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 15px; color: #3b82f6; font-size: 18px;">🎬 Typewriter Test</div>
    <div style="margin-bottom: 15px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6; font-size: 13px;">
        Testing: typewriterWithMarkdownAndCitations()<br>
        This should show citations as superscripts ¹²³
    </div>
    <div id="typewriter-test-content" style="font-size: 15px; line-height: 1.6; margin-bottom: 20px; min-height: 100px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 4px;"></div>
    <button onclick="this.parentElement.remove()" style="padding: 10px 20px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Close Test</button>
`;

document.body.appendChild(testContainer);

console.log('✅ Test container created (top-right corner)');

// Get the content div
const contentDiv = document.getElementById('typewriter-test-content');

// Add debugging to parseMarkdownAndCitations
console.log('\n%c📊 STEP 1: Testing parseMarkdownAndCitations()','font-weight: bold; color: #10b981;');
const parsed = window.parseMarkdownAndCitations(backendResponse);
console.log('Parsed result:', {
    mainTextLength: parsed.mainText.length,
    mainTextSample: parsed.mainText.substring(0, 200),
    sourcesCount: parsed.sources.length,
    hasSup: parsed.mainText.includes('<sup>'),
    hasLiteralCitation: parsed.mainText.includes('[1]'),
    uniqueId: parsed.uniqueId
});

if (parsed.mainText.includes('<sup>')) {
    console.log('   ✅ Citations converted to <sup> in parsed result');
} else if (parsed.mainText.includes('[1]')) {
    console.log('   ❌ Citations NOT converted - still shows [1]');
} else {
    console.log('   ⚠️ Citations missing entirely');
}

// Now test the typewriter function
console.log('\n%c🎬 STEP 2: Running typewriterWithMarkdownAndCitations()','font-weight: bold; color: #10b981;');
console.log('Starting typewriter effect...');

if (typeof window.typewriterWithMarkdownAndCitations === 'function') {
    window.typewriterWithMarkdownAndCitations(contentDiv, backendResponse, 5); // Speed 5ms for faster testing
    
    console.log('✅ Typewriter function called');
    console.log('⏳ Wait for typewriter effect to complete (5-10 seconds)');
    console.log('📍 Then check the blue test box on your screen');
    
    // After typewriter completes, check the result
    setTimeout(() => {
        console.log('\n%c📋 STEP 3: Checking Final Result', 'font-weight: bold; color: #10b981;');
        
        const finalHTML = contentDiv.innerHTML;
        console.log('Final HTML length:', finalHTML.length);
        console.log('Final HTML sample:', finalHTML.substring(0, 300));
        
        const checks = {
            hasSup: finalHTML.includes('<sup>'),
            hasLiteralCitation: finalHTML.includes('[1]'),
            hasCitationLink: finalHTML.includes('citation-link'),
            hasSourcesSection: finalHTML.includes('sources-section') || finalHTML.includes('Sources'),
            supCount: (finalHTML.match(/<sup>/g) || []).length
        };
        
        console.log('\n📊 Analysis:');
        console.log('  Has <sup>:', checks.hasSup ? '✅ YES' : '❌ NO');
        console.log('  Has [1] literal:', checks.hasLiteralCitation ? '❌ YES (not converted)' : '✅ NO');
        console.log('  Has citation-link:', checks.hasCitationLink ? '✅ YES' : '❌ NO');
        console.log('  Has Sources section:', checks.hasSourcesSection ? '✅ YES' : '❌ NO');
        console.log('  Number of <sup> elements:', checks.supCount);
        
        if (checks.hasSup && checks.hasCitationLink && !checks.hasLiteralCitation) {
            console.log('\n%c✅ SUCCESS! Citations rendering correctly!', 'color: #10b981; font-weight: bold; font-size: 16px;');
            console.log('   Check the blue test box - citations should appear as superscripts');
        } else if (checks.hasLiteralCitation && !checks.hasSup) {
            console.log('\n%c❌ FAILURE! Citations NOT converting!', 'color: #ef4444; font-weight: bold; font-size: 16px;');
            console.log('   [1] still appears as literal text');
            console.log('   parseMarkdownAndCitations() is not running correctly in typewriter');
        } else if (checks.hasSup && checks.hasLiteralCitation) {
            console.log('\n%c⚠️ PARTIAL! Some citations converted, some not', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
            console.log('   Mixed results - check test box to see what happened');
        }
        
        // Check if CSS is applied
        const supElements = contentDiv.querySelectorAll('sup');
        if (supElements.length > 0) {
            const firstSup = supElements[0];
            const style = window.getComputedStyle(firstSup);
            console.log('\n🎨 CSS Check (first <sup> element):');
            console.log('  font-size:', style.fontSize);
            console.log('  vertical-align:', style.verticalAlign);
            console.log('  color:', style.color);
            
            const fontSize = parseFloat(style.fontSize);
            const isSmall = fontSize < 12; // Should be around 6-8px
            
            if (isSmall && style.verticalAlign === 'super') {
                console.log('  ✅ CSS applied correctly - appears as superscript');
            } else {
                console.log('  ❌ CSS not applied - appears as regular text');
            }
        }
        
        console.log('\n%c═══════════════════════════════════════════', 'color: #3b82f6;');
        console.log('%cCheck the BLUE TEST BOX on your screen!', 'font-weight: bold; font-size: 16px; color: #3b82f6;');
        console.log('%cDo citations appear as small superscripts ¹²³?', 'color: #3b82f6;');
        console.log('%c═══════════════════════════════════════════', 'color: #3b82f6;');
        
    }, 12000); // Wait 12 seconds for typewriter to finish
    
} else {
    console.log('❌ typewriterWithMarkdownAndCitations() not found!');
}
