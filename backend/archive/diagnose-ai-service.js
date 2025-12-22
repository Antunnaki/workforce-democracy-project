/**
 * WORKFORCE DEMOCRACY PROJECT - AI Connectivity Diagnostic
 * 
 * Tests connectivity to AI providers and verifies environment configuration.
 */

require('dotenv').config();
require('./utils/polyfills');

async function runDiagnostic() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  🏛️  WDP AI Connectivity Diagnostic');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  Time: ${new Date().toISOString()}`);
    console.log(`  Node Version: ${process.version}`);
    console.log('═══════════════════════════════════════════════════\n');

    // 1. Check Polyfills
    console.log('1. Testing Polyfills...');
    if (typeof File !== 'undefined') {
        console.log('✅ File object is defined');
        try {
            const f = new File(['test'], 'test.txt');
            console.log(`✅ File creation successful: ${f.name} (${f.size} bytes)`);
        } catch (e) {
            console.log(`❌ File creation failed: ${e.message}`);
        }
    } else {
        console.log('❌ File object is MISSING');
    }
    console.log('');

    // 2. Check API Keys
    console.log('2. Checking API Keys...');
    const keys = {
        GROQ_API_KEY: process.env.GROQ_API_KEY ? 'FOUND (starts with ' + process.env.GROQ_API_KEY.substring(0, 5) + '...)' : 'MISSING',
        QWEN_API_KEY: process.env.QWEN_API_KEY ? 'FOUND (starts with ' + process.env.QWEN_API_KEY.substring(0, 5) + '...)' : 'MISSING',
        DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY ? 'FOUND (starts with ' + process.env.DASHSCOPE_API_KEY.substring(0, 5) + '...)' : 'MISSING'
    };
    Object.entries(keys).forEach(([key, val]) => console.log(`  ${key}: ${val}`));
    console.log('');

    // 3. Check CORS Configuration
    console.log('3. Checking CORS Configuration...');
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(o => o.trim())
        .filter(o => o);
    console.log('  ALLOWED_ORIGINS (env):', allowedOrigins.length ? allowedOrigins.join(', ') : 'NONE');
    
    const defaultOrigins = [
        'https://workforcedemocracyproject.netlify.app',
        'https://workforcedemocracyproject.org',
        'https://www.workforcedemocracyproject.org',
        'https://beta.workforcedemocracyproject.org',
        'https://api-beta.workforcedemocracyproject.org',
        'https://workforce-democracy.njal.la'
    ];
    console.log('  Default project origins (hardcoded fallback):');
    defaultOrigins.forEach(o => console.log(`    - ${o}`));
    console.log('');

    // 4. Test AI Connectivity
    console.log('4. Testing AI Connectivity...');
    try {
        const { analyzeWithAI } = require('./ai-service-qwen');
        console.log('   Service loaded. Attempting test query...');
        
        const startTime = Date.now();
        const result = await analyzeWithAI('Reply with "Connectivity OK" and nothing else.');
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        if (result.success) {
            console.log(`✅ AI Response received in ${duration}s: "${result.response.trim()}"`);
            console.log(`   Sources found: ${result.sources?.length || 0}`);
        } else {
            console.log(`❌ AI Analysis failed: ${result.error || 'Unknown error'}`);
            if (result.fallback) console.log('   (Result was a fallback message)');
        }
    } catch (error) {
        console.error(`❌ Diagnostic failed with exception: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Data: ${JSON.stringify(error.response.data)}`);
        }
    }
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  Diagnostic Complete');
    console.log('═══════════════════════════════════════════════════');
}

runDiagnostic();
