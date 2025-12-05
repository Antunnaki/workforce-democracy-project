/**
 * Test script to see what Democracy Now's HTML actually looks like
 */

const axios = require('axios');
const cheerio = require('cheerio');

async function testScrape() {
    const url = 'https://www.democracynow.org/2025/11/28/the_historic_rise_of_zohran_mamdani';
    
    console.log('Testing URL:', url);
    
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('\n=== TITLE TESTS ===');
        console.log('h1:', $('h1').first().text().trim().substring(0, 100));
        console.log('h1.headline:', $('h1.headline').text().trim().substring(0, 100));
        console.log('og:title:', $('meta[property="og:title"]').attr('content')?.substring(0, 100));
        console.log('title tag:', $('title').text().trim().substring(0, 100));
        
        console.log('\n=== EXCERPT TESTS ===');
        console.log('meta description:', $('meta[name="description"]').attr('content')?.substring(0, 100));
        console.log('og:description:', $('meta[property="og:description"]').attr('content')?.substring(0, 100));
        console.log('.dek:', $('.dek').text().trim().substring(0, 100));
        
        console.log('\n=== CONTENT TESTS ===');
        console.log('.story_description length:', $('.story_description').text().trim().length);
        console.log('.story_text length:', $('.story_text').text().trim().length);
        console.log('article length:', $('article').text().trim().length);
        
        console.log('\n=== DATE TESTS ===');
        console.log('article:published_time:', $('meta[property="article:published_time"]').attr('content'));
        console.log('time datetime:', $('time').first().attr('datetime'));
        console.log('.date:', $('.date').first().text().trim());
        
        console.log('\n=== ALL H1 ELEMENTS ===');
        $('h1').each((i, elem) => {
            console.log(`h1 ${i}:`, $(elem).text().trim().substring(0, 100));
        });
        
        console.log('\n=== SUCCESS ===');
        console.log('Page loaded successfully, checking selectors...');
        
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

testScrape();
