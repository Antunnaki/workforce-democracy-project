/**
 * TEST INSTANT RENDERER (NO TYPEWRITER)
 * 
 * This tests the new instant renderer that bypasses the typewriter effect.
 * Citations should now display correctly as superscripts.
 */

console.log('%c🚀 TESTING INSTANT RENDERER', 'font-size: 20px; font-weight: bold; color: #10b981;');

// The exact response from your backend
const backendResponse = `Kirsten Gillibrand is a US Senator from New York, serving since 2009. She has been a prominent figure in national politics, particularly during her 2020 presidential campaign. To understand her policy positions and actions, let's examine her voting record, campaign finance, and public statements.

Gillibrand's voting record shows a mix of progressive and establishment positions. She has been a strong advocate for women's rights, LGBTQ+ rights, and healthcare reform [1]. However, her stance on issues like immigration and foreign policy has been more nuanced, sometimes aligning with establishment Democrats [2].

Sources:
[1] https://www.democracynow.org/2019/1/17/kirsten_gillibrand
[2] https://theintercept.com/2019/01/16/kirsten-gillibrand`;

// Create a test container
const testContainer = document.createElement('div');
testContainer.id = 'instant-renderer-test';
testContainer.style.cssText = 'position: fixed; top: 50px; right: 50px; width: 500px; background: white; border: 3px solid #10b981; padding: 30px; z-index: 999999; box-shadow: 0 8px 24px rgba(0,0,0,0.3); max-height: 80vh; overflow-y: auto;';
testContainer.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 15px; color: #10b981; font-size: 18px;">🚀 Instant Renderer Test</div>
    <div style="margin-bottom: 15px; padding: 15px; background: #f0fdf4; border-left: 4px solid #10b981; font-size: 13px;">
        Testing: renderWithCitationsInstantly()<br>
        <strong>Expected:</strong> Citations as superscripts ¹²³<br>
        <strong>No typewriter effect</strong> (instant render)
    </div>
    <div id="instant-test-content" style="font-size: 15px; line-height: 1.6; margin-bottom: 20px; min-height: 100px; border: 1px solid #e5e7eb; padding: 15px; border-radius: 4px; background: #fafafa;"></div>
    <div id="instant-test-status" style="margin-bottom: 15px; padding: 15px; border-radius: 6px; font-weight: 600;"></div>
    <button onclick="this.parentElement.remove()" style="padding: 10px 20px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Close Test</button>
`;

document.body.appendChild(testContainer);

console.log('✅ Test container created (top-right corner with green border)');

// Get the content div
const contentDiv = document.getElementById('instant-test-content');
const statusDiv = document.getElementById('instant-test-status');

// Check if instant renderer is loaded
if (typeof window.renderWithCitationsInstantly !== 'function') {
    console.log('%c❌ INSTANT RENDERER NOT LOADED!', 'color: #ef4444; font-weight: bold; font-size: 16px;');
    statusDiv.innerHTML = '❌ <strong>ERROR:</strong> renderWithCitationsInstantly() not found!<br>Make sure instant-citation-renderer.js is loaded.';
    statusDiv.style.background = '#fee2e2';
    statusDiv.style.color = '#991b1b';
} else {
    console.log('✅ renderWithCitationsInstantly() found');
    
    // Call the instant renderer
    console.log('\n%c🚀 Calling instant renderer...','font-weight: bold; color: #10b981;');
    window.renderWithCitationsInstantly(contentDiv, backendResponse);
    
    // Check result after 2 seconds (instant renderer uses 300ms delay)
    setTimeout(() => {
        console.log('\n%c📋 Checking Result', 'font-weight: bold; color: #10b981;');
        
        const finalHTML = contentDiv.innerHTML;
        console.log('Final HTML length:', finalHTML.length);
        console.log('Final HTML sample:', finalHTML.substring(0, 300));
        
        const checks = {
            hasSup: finalHTML.includes('<sup>'),
            hasLiteralCitation: finalHTML.includes('[1]'),
            hasCitationLink: finalHTML.includes('citation-link'),
            hasSourcesSection: finalHTML.includes('sources-section') || finalHTML.toLowerCase().includes('sources'),
            supCount: (finalHTML.match(/<sup>/g) || []).length
        };
        
        console.log('\n📊 Analysis:');
        console.log('  Has <sup>:', checks.hasSup ? '✅ YES' : '❌ NO');
        console.log('  Has [1] literal:', checks.hasLiteralCitation ? '❌ YES (bad)' : '✅ NO (good)');
        console.log('  Has citation-link:', checks.hasCitationLink ? '✅ YES' : '❌ NO');
        console.log('  Has Sources section:', checks.hasSourcesSection ? '✅ YES' : '❌ NO');
        console.log('  Number of <sup> elements:', checks.supCount);
        
        // Check CSS
        const supElements = contentDiv.querySelectorAll('sup');
        if (supElements.length > 0) {
            const firstSup = supElements[0];
            const style = window.getComputedStyle(firstSup);
            console.log('\n🎨 CSS Check (first <sup> element):');
            console.log('  font-size:', style.fontSize);
            console.log('  vertical-align:', style.verticalAlign);
            console.log('  color:', style.color);
            
            const fontSize = parseFloat(style.fontSize);
            const isSmall = fontSize < 12;
            
            if (isSmall && style.verticalAlign === 'super') {
                console.log('  ✅ CSS applied correctly');
            } else {
                console.log('  ⚠️ CSS may not be applied properly');
            }
        }
        
        // Display result in status box
        if (checks.hasSup && checks.hasCitationLink && !checks.hasLiteralCitation && checks.hasSourcesSection) {
            console.log('\n%c✅ SUCCESS! INSTANT RENDERER WORKS!', 'color: #10b981; font-weight: bold; font-size: 16px;');
            console.log('   Citations display as clickable superscripts');
            console.log('   Sources section included');
            console.log('   No typewriter effect (instant render)');
            
            statusDiv.innerHTML = `
                ✅ <strong>SUCCESS!</strong><br>
                • Citations display as superscripts: ${checks.supCount} found<br>
                • Sources section included<br>
                • No [1] literal text<br>
                • Instant rendering (no typewriter)
            `;
            statusDiv.style.background = '#d1fae5';
            statusDiv.style.color = '#065f46';
            
        } else if (checks.hasLiteralCitation && !checks.hasSup) {
            console.log('\n%c❌ FAILURE! Citations NOT converting!', 'color: #ef4444; font-weight: bold; font-size: 16px;');
            
            statusDiv.innerHTML = `
                ❌ <strong>FAILURE</strong><br>
                Citations still showing as [1] literal text<br>
                Instant renderer not working correctly
            `;
            statusDiv.style.background = '#fee2e2';
            statusDiv.style.color = '#991b1b';
            
        } else {
            console.log('\n%c⚠️ PARTIAL SUCCESS', 'color: #f59e0b; font-weight: bold; font-size: 16px;');
            
            statusDiv.innerHTML = `
                ⚠️ <strong>PARTIAL</strong><br>
                Has <sup>: ${checks.hasSup ? 'Yes' : 'No'}<br>
                Has [1]: ${checks.hasLiteralCitation ? 'Yes (bad)' : 'No (good)'}<br>
                Has Sources: ${checks.hasSourcesSection ? 'Yes' : 'No'}
            `;
            statusDiv.style.background = '#fef3c7';
            statusDiv.style.color = '#92400e';
        }
        
        console.log('\n%c═══════════════════════════════════════════', 'color: #10b981;');
        console.log('%cLook at the GREEN TEST BOX on your screen!', 'font-weight: bold; font-size: 16px; color: #10b981;');
        console.log('%cDo citations appear as small superscripts ¹²³?', 'color: #10b981;');
        console.log('%c═══════════════════════════════════════════', 'color: #10b981;');
        
    }, 2000);
}
