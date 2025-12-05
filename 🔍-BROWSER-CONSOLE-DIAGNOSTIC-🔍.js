/**
 * 🔍 BROWSER CONSOLE DIAGNOSTIC SCRIPT
 * Copy and paste this into your browser console at:
 * https://sxcrlfyt.gensparkspace.com/
 * 
 * This will tell us exactly what's wrong with the Representatives display
 */

console.clear();
console.log('═══════════════════════════════════════════════════════');
console.log('🔍 WORKFORCE DEMOCRACY - REPRESENTATIVES DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════\n');

// TEST 1: Check which JavaScript file is loaded
console.log('TEST 1: Checking loaded JavaScript files...');
const scripts = Array.from(document.querySelectorAll('script'));
const repFinderScript = scripts.find(s => s.src.includes('rep-finder'));
if (repFinderScript) {
    console.log('✅ Found rep-finder script:', repFinderScript.src);
} else {
    console.error('❌ No rep-finder script found!');
}
console.log('');

// TEST 2: Check if displayResults function exists
console.log('TEST 2: Checking if displayResults function exists...');
if (typeof window.displayResults === 'function') {
    console.log('✅ displayResults function exists');
} else {
    console.log('⚠️ displayResults is not a global function (might be in module scope)');
}
console.log('');

// TEST 3: Test the API directly
console.log('TEST 3: Testing Representatives API...');
fetch('https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061')
    .then(response => {
        console.log('API Response Status:', response.status, response.statusText);
        return response.json();
    })
    .then(data => {
        console.log('\n📊 API RESPONSE RECEIVED:');
        console.log('─────────────────────────────────────────────────');
        console.log('Success:', data.success);
        console.log('Total Representatives:', data.total);
        console.log('Has "representatives" property:', !!data.representatives);
        console.log('Has "results" property:', !!data.results);
        
        if (data.representatives) {
            console.log('\n✅ "representatives" array exists!');
            console.log('   Length:', data.representatives.length);
            console.log('   First rep:', data.representatives[0]?.name);
            console.log('   First rep photo:', data.representatives[0]?.photo_url);
        } else {
            console.error('\n❌ "representatives" property is missing!');
        }
        
        if (data.results) {
            console.log('\n✅ "results" array exists!');
            console.log('   Length:', data.results.length);
            console.log('   First rep:', data.results[0]?.name);
        } else {
            console.log('\n⚠️ "results" property is missing');
        }
        
        console.log('\n📍 Location Data:');
        console.log('   ZIP:', data.query_zip);
        console.log('   State:', data.location?.state);
        console.log('   District:', data.location?.district);
        
        console.log('\n─────────────────────────────────────────────────');
        console.log('FULL API RESPONSE:');
        console.log(data);
        
        // TEST 4: Simulate what the frontend code does
        console.log('\n\nTEST 4: Simulating frontend code...');
        const reps = data.representatives || [];
        console.log('Frontend extracts reps:', reps.length, 'representatives');
        
        if (reps.length === 0) {
            console.error('❌ PROBLEM: Frontend would show "No Representatives Found"');
            console.error('   Reason: data.representatives is', data.representatives);
        } else {
            console.log('✅ Frontend should display', reps.length, 'representatives');
        }
    })
    .catch(error => {
        console.error('❌ API REQUEST FAILED:', error);
    });

// TEST 5: Check DOM elements
console.log('\nTEST 5: Checking DOM elements...');
setTimeout(() => {
    const zipInput = document.getElementById('zipInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    console.log('ZIP Input:', zipInput ? '✅ Found' : '❌ Not found');
    console.log('Search Button:', searchBtn ? '✅ Found' : '❌ Not found');
    console.log('Search Results Container:', searchResults ? '✅ Found' : '❌ Not found');
    
    if (searchResults) {
        console.log('Search Results HTML length:', searchResults.innerHTML.length);
        console.log('Current content preview:', searchResults.innerHTML.substring(0, 200));
    }
}, 1000);

// TEST 6: Check for color scheme in loaded CSS/JS
console.log('\nTEST 6: Checking for updated color scheme...');
setTimeout(() => {
    // Check if the new gradient color exists in any inline styles
    const gradientElements = document.querySelectorAll('[style*="#667eea"]');
    if (gradientElements.length > 0) {
        console.log('✅ NEW color scheme (#667eea) found!', gradientElements.length, 'elements');
    } else {
        console.log('❌ NEW color scheme (#667eea) NOT found');
        
        // Check for old color
        const oldGradientElements = document.querySelectorAll('[style*="#5b21b6"]');
        if (oldGradientElements.length > 0) {
            console.error('❌ OLD color scheme (#5b21b6) still present!', oldGradientElements.length, 'elements');
        }
    }
}, 2000);

console.log('\n═══════════════════════════════════════════════════════');
console.log('⏳ Diagnostic running... Check results above and below');
console.log('═══════════════════════════════════════════════════════\n');

// INSTRUCTIONS
console.log('\n📋 NEXT STEPS:');
console.log('1. Wait 3 seconds for all tests to complete');
console.log('2. Look for ✅ (pass) or ❌ (fail) in the results above');
console.log('3. Copy ALL the output and send it to me');
console.log('\n💡 TIP: You can right-click in console and "Save as..." to save the full log');
