/**
 * DEBUG: Why citations aren't converting
 * This will show us exactly what's happening at each step
 */

console.log('%c🔍 CITATION DEBUG TEST', 'font-size: 20px; font-weight: bold; color: #ef4444;');

const testResponse = `Test response with citation [1] and another [2].

Sources:
[1] https://example.com/source1
[2] https://example.com/source2`;

console.log('\n📝 Test input:', testResponse);

// Step 1: Test parseSourcesList
console.log('\n==== STEP 1: Parse Sources ====');
const sourcesText = `[1] https://example.com/source1
[2] https://example.com/source2`;

if (typeof window.parseSourcesList === 'function') {
    const sources = window.parseSourcesList(sourcesText);
    console.log('✅ parseSourcesList found');
    console.log('Sources parsed:', sources);
    console.log('Sources length:', sources.length);
} else {
    console.log('❌ parseSourcesList NOT found');
}

// Step 2: Test convertCitationsToHTML
console.log('\n==== STEP 2: Convert Citations ====');
const testText = 'Test citation [1] here';
const testSources = [{number: 1, title: 'Test', url: 'http://test.com'}];

if (typeof window.convertCitationsToHTML === 'function') {
    console.log('✅ convertCitationsToHTML found');
    const converted = window.convertCitationsToHTML(testText, testSources, 'test123');
    console.log('Input text:', testText);
    console.log('Input sources:', testSources);
    console.log('Output HTML:', converted);
    console.log('Contains <sup>:', converted.includes('<sup>'));
    console.log('Still has [1]:', converted.includes('[1]'));
} else {
    console.log('❌ convertCitationsToHTML NOT found');
}

// Step 3: Test parseMarkdownAndCitations
console.log('\n==== STEP 3: Full Parse ====');
if (typeof window.parseMarkdownAndCitations === 'function') {
    console.log('✅ parseMarkdownAndCitations found');
    const result = window.parseMarkdownAndCitations(testResponse);
    console.log('Result:', result);
    console.log('Main text sample:', result.mainText.substring(0, 200));
    console.log('Sources count:', result.sources.length);
    console.log('Contains <sup>:', result.mainText.includes('<sup>'));
    console.log('Still has [1]:', result.mainText.includes('[1]'));
} else {
    console.log('❌ parseMarkdownAndCitations NOT found');
}

// Step 4: Check sources format expectation
console.log('\n==== STEP 4: Check Sources Format ====');
console.log('Backend format: "[1] https://example.com"');
console.log('Expected format: "1. Title\\n   URL: https://example.com"');
console.log('\n⚠️ FORMAT MISMATCH DETECTED!');
console.log('parseSourcesList expects numbered format like "1. Title"');
console.log('But backend sends "[1] URL" format');
console.log('\nThis is why sources.length = 0');
console.log('And why citations don\'t convert!');

console.log('\n%c🎯 SOLUTION: Fix parseSourcesList to handle [1] URL format', 'color: #10b981; font-weight: bold; font-size: 16px;');
