/**
 * SCRAPER DIAGNOSTIC TOOL
 * Tests actual website HTML structure to find working selectors
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Test URLs for each publication
const TEST_URLS = {
    'Common Dreams': 'https://www.commondreams.org/news/millions-face-soaring-health-costs',
    'Democracy Now': 'https://www.democracynow.org/2025/11/7/headlines',
    'Jacobin': 'https://jacobin.com/2024/12/snap-benefits-cuts-poverty',
    'The Intercept': 'https://theintercept.com/2024/11/snap-food-assistance',
    'ProPublica': 'https://www.propublica.org/article/snap-benefits-cuts-analysis'
};

// All possible selectors to test
const SELECTORS_TO_TEST = [
    // Common Dreams possibilities
    '.field-name-body p',
    '.article-body p',
    'article .content p',
    '.node-article p',
    '.pf-content p',
    'article p',
    '.entry-content p',
    
    // Democracy Now possibilities
    '.story_transcript p',
    '.news_body p',
    'article .content p',
    '.story_content p',
    '.news_item p',
    'div[class*="transcript"] p',
    
    // Jacobin possibilities
    '.post-content p',
    'article .entry-content p',
    '.article-content p',
    '.post-full-content p',
    
    // The Intercept possibilities
    '.PostContent p',
    'article .content p',
    '.post-content p',
    '.ArticleBody p',
    
    // ProPublica possibilities
    '.article-body p',
    '.story-body p',
    'article .body p',
    '.prose p'
];

async function testSite(siteName, url) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🧪 TESTING: ${siteName}`);
    console.log(`📍 URL: ${url}`);
    console.log('='.repeat(80));
    
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        
        console.log(`✅ Successfully fetched (${response.data.length} bytes)\n`);
        
        // Test each selector
        const results = [];
        
        for (const selector of SELECTORS_TO_TEST) {
            const elements = $(selector);
            if (elements.length > 0) {
                let totalText = '';
                elements.each((i, elem) => {
                    const text = $(elem).text().trim();
                    if (text.length > 50) {
                        totalText += text + ' ';
                    }
                });
                
                if (totalText.length > 200) {
                    results.push({
                        selector,
                        elements: elements.length,
                        chars: totalText.length,
                        preview: totalText.substring(0, 150) + '...'
                    });
                }
            }
        }
        
        if (results.length === 0) {
            console.log('❌ NO WORKING SELECTORS FOUND\n');
            
            // Show what IS on the page
            console.log('📊 Available elements:');
            const articleElements = $('article');
            console.log(`   - <article> tags: ${articleElements.length}`);
            
            const divs = $('div[class*="content"], div[class*="article"], div[class*="body"], div[class*="story"]');
            console.log(`   - Content-related divs: ${divs.length}`);
            if (divs.length > 0) {
                divs.slice(0, 5).each((i, elem) => {
                    const classes = $(elem).attr('class');
                    console.log(`     • ${classes}`);
                });
            }
            
            const paragraphs = $('p');
            console.log(`   - Total <p> tags: ${paragraphs.length}`);
            
        } else {
            console.log(`✅ FOUND ${results.length} WORKING SELECTOR(S):\n`);
            
            // Sort by character count (descending)
            results.sort((a, b) => b.chars - a.chars);
            
            results.forEach((result, index) => {
                console.log(`${index + 1}. "${result.selector}"`);
                console.log(`   ├─ Elements: ${result.elements}`);
                console.log(`   ├─ Characters: ${result.chars.toLocaleString()}`);
                console.log(`   └─ Preview: ${result.preview}\n`);
            });
            
            console.log(`🏆 RECOMMENDED: "${results[0].selector}"`);
        }
        
    } catch (error) {
        console.error(`❌ ERROR: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
        }
    }
}

async function runTests() {
    console.log('\n🚀 PROGRESSIVE NEWS SCRAPER DIAGNOSTICS');
    console.log('Testing actual website HTML to find working selectors...\n');
    
    for (const [siteName, url] of Object.entries(TEST_URLS)) {
        await testSite(siteName, url);
        
        // Respectful delay between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DIAGNOSTIC COMPLETE');
    console.log('='.repeat(80) + '\n');
}

// Run tests
runTests().catch(console.error);
