/**
 * Test script for ZIP code enrichment
 * Run: node test-enrichment.js
 */

const { searchNonprofits } = require('./nonprofit-proxy');

async function test() {
    console.log('🧪 Testing ZIP code enrichment...\n');
    
    try {
        // Test search with enrichment enabled
        const results = await searchNonprofits('food bank', {}, true);
        
        console.log(`\n📊 Results Summary:`);
        console.log(`   Total organizations: ${results.length}`);
        
        // Count how many have ZIP codes
        const withZip = results.filter(org => org.zipcode || org.postal_code);
        console.log(`   Organizations with ZIP codes: ${withZip.length}`);
        
        // Show first 5 examples
        console.log(`\n📍 Sample Results (first 5):\n`);
        results.slice(0, 5).forEach((org, i) => {
            console.log(`${i + 1}. ${org.name}`);
            console.log(`   City: ${org.city}, ${org.state}`);
            console.log(`   ZIP: ${org.zipcode || org.postal_code || 'NOT FOUND'}`);
            console.log(`   Address: ${org.address || 'NOT FOUND'}`);
            console.log('');
        });
        
        console.log('✅ Test complete!');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

test();
