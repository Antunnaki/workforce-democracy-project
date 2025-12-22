const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

const API_BASE = 'http://localhost:3001';

async function testSyncChat() {
    console.log('--- Testing Sync Chat ---');
    try {
        const response = await axios.post(`${API_BASE}/api/civic/llm-chat`, {
            message: 'Hello, who are you?',
            context: 'general'
        });
        console.log('Sync Response Status:', response.status);
        console.log('Sync Response Data:', JSON.stringify(response.data, null, 2));
        if (response.data.fallback) {
            console.log('⚠️ FALLBACK DETECTED');
        } else {
            console.log('✅ REAL RESPONSE DETECTED');
        }
    } catch (error) {
        console.error('Sync Chat Error:', error.response ? error.response.data : error.message);
    }
}

async function testAsyncChat() {
    console.log('\n--- Testing Async Chat ---');
    try {
        // 1. Submit
        const submitResponse = await axios.post(`${API_BASE}/api/civic/llm-chat/submit`, {
            message: 'What is the Workforce Democracy Project?',
            context: 'general'
        });
        console.log('Submit Response Status:', submitResponse.status);
        const jobId = submitResponse.data.jobId;
        console.log('Job ID:', jobId);

        // 2. Poll Status
        let status = 'pending';
        let attempts = 0;
        while ((status === 'pending' || status === 'processing') && attempts < 10) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 2000));
            const statusResponse = await axios.get(`${API_BASE}/api/civic/llm-chat/status/${jobId}`);
            status = statusResponse.data.status;
            console.log(`Polling Attempt ${attempts}: Status = ${status}`);
        }

        // 3. Get Result
        if (status === 'completed') {
            const resultResponse = await axios.get(`${API_BASE}/api/civic/llm-chat/result/${jobId}`);
            console.log('Async Result Status:', resultResponse.status);
            console.log('Async Result Data:', JSON.stringify(resultResponse.data, null, 2));
        } else {
            console.log('❌ Async job did not complete in time');
        }
    } catch (error) {
        console.error('Async Chat Error:', error.response ? error.response.data : error.message);
    }
}

async function runTests() {
    await testSyncChat();
    await testAsyncChat();
}

runTests();
