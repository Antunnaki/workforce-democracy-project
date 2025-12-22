const fetch = require('node-fetch');
async function test() {
    const urls = [
        'https://api-beta.workforcedemocracyproject.org/api/dashboard',
        'https://api-beta.workforcedemocracyproject.org/api/chat'
    ];
    for (const url of urls) {
        console.log(`Testing ${url}`);
        try {
            const res = await fetch(url, { 
                method: 'OPTIONS',
                headers: {
                    'Origin': 'https://beta.workforcedemocracyproject.org',
                    'Access-Control-Request-Method': 'POST',
                    'Access-Control-Request-Headers': 'Content-Type'
                }
            });
            console.log(`OPTIONS Status: ${res.status}`);
            console.log(`Allow-Origin: ${res.headers.get('access-control-allow-origin')}`);
            console.log(`Allow-Methods: ${res.headers.get('access-control-allow-methods')}`);
            
            const getRes = await fetch(url, {
                method: 'GET',
                headers: {
                    'Origin': 'https://beta.workforcedemocracyproject.org'
                }
            });
            console.log(`GET Status: ${getRes.status}`);
            if (getRes.status === 404) {
                const text = await getRes.text();
                console.log(`404 Body: ${text.substring(0, 100)}`);
            }
            
            const postRes = await fetch(url, {
                method: 'POST',
                headers: {
                    'Origin': 'https://beta.workforcedemocracyproject.org',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'test' })
            });
            console.log(`POST Status: ${postRes.status}`);
            if (postRes.status === 404) {
                const text = await postRes.text();
                console.log(`404 Body: ${text.substring(0, 100)}`);
            }
        } catch (e) {
            console.log(`Error: ${e.message}`);
        }
        console.log('---');
    }
}
test();