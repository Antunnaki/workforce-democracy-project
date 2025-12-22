// Simple API test script
async function testAPI() {
  try {
    console.log('Testing API connectivity...');
    
    // Test health endpoint
    const healthResponse = await fetch('https://api-beta.workforcedemocracyproject.org/health');
    console.log('Health endpoint:', healthResponse.status, await healthResponse.text());
    
    // Test chat endpoint (simple test)
    const chatResponse = await fetch('https://api-beta.workforcedemocracyproject.org/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Hello'
      })
    });
    
    console.log('Chat endpoint:', chatResponse.status);
    if (chatResponse.ok) {
      const data = await chatResponse.json();
      console.log('Chat response:', data);
    } else {
      console.log('Chat error response:', await chatResponse.text());
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testAPI();