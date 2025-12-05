/**
 * RSS MONITOR SERVICE v37.20.0
 * 
 * Monitors progressive news outlets for new articles via RSS feeds
 * Automatically triggers article scraping and indexing
 * 
 * FEATURES:
 * - Checks 7 progressive news outlets hourly
 * - Prevents duplicate indexing (MongoDB tracking)
 * - Triggers full article scraping for new discoveries
 * - Ethical delays and rate limiting
 * 
 * OUTLETS MONITORED:
 * 1. Democracy Now (most trusted for progressive candidates)
 * 2. The Intercept (investigative journalism)
 * 3. Drop Site News (independent investigative, co-founded by Jeremy Scahill)
 * 4. Jacobin (socialist perspective)
 * 5. ProPublica (investigative non-profit)
 * 6. Common Dreams (progressive news)
 * 7. Truthout (independent news)
 * 8. The Nation (oldest progressive magazine)
 */

const Parser = require('rss-parser');
const Article = require('../models/Article');
const articleScraperPlaywright = require('./article-scraper-playwright');

const parser = new Parser({
    timeout: 15000, // 15 second timeout
    headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
});

/**
 * Progressive news outlet RSS feeds
 * Prioritized by trustworthiness and progressive focus
 */
const RSS_FEEDS = [
    {
        name: 'Democracy Now',
        url: 'https://www.democracynow.org/democracynow.rss',
        priority: 1, // Highest priority for progressive candidates
        categories: ['politics', 'labor', 'social-justice']
    },
    {
        name: 'The Intercept',
        url: 'https://theintercept.com/feed/',
        priority: 2,
        categories: ['politics', 'investigative']
    },
    {
        name: 'Drop Site News',
        url: 'https://www.dropsitenews.com/feed/',
        priority: 2,
        categories: ['politics', 'investigative', 'foreign-policy']
    },
    {
        name: 'Jacobin',
        url: 'https://jacobin.com/feed/',
        priority: 2,
        categories: ['politics', 'labor', 'economics']
    },
    {
        name: 'ProPublica',
        url: 'https://www.propublica.org/feeds/propublica/main',
        priority: 2,
        categories: ['investigative', 'government']
    },
    {
        name: 'Common Dreams',
        url: 'https://www.commondreams.org/feeds/feed.rss',
        priority: 3,
        categories: ['politics', 'environment', 'social-justice']
    },
    {
        name: 'Truthout',
        url: 'https://truthout.org/feed/',
        priority: 3,
        categories: ['politics', 'social-justice']
    },
    {
        name: 'The Nation',
        url: 'https://www.thenation.com/feed/',
        priority: 3,
        categories: ['politics', 'culture']
    }
];

/**
 * Check a single RSS feed for new articles
 */
async function checkRSSFeed(feed) {
    console.log(`📡 Checking RSS feed: ${feed.name}...`);
    
    try {
        const rssFeed = await parser.parseURL(feed.url);
        
        if (!rssFeed.items || rssFeed.items.length === 0) {
            console.log(`  ⚠️  No items found in ${feed.name} feed`);
            return { discovered: 0, indexed: 0 };
        }
        
        console.log(`  📰 Found ${rssFeed.items.length} articles in feed`);
        
        let discovered = 0;
        let indexed = 0;
        
        for (const item of rssFeed.items) {
            // Check if article already exists in database
            const existingArticle = await Article.findOne({ url: item.link });
            
            if (existingArticle) {
                continue; // Skip - already indexed
            }
            
            discovered++;
            console.log(`  🆕 New article discovered: "${item.title.substring(0, 60)}..."`);
            
            // Ethical delay between discoveries (don't hammer the server)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                // Trigger full article scraping
                const scrapedContent = await articleScraperPlaywright.scrapeArticle(item.link, feed.name);
                
                if (scrapedContent && scrapedContent.fullText) {
                    // Index into MongoDB
                    const article = new Article({
                        title: item.title,
                        url: item.link,
                        source: feed.name,
                        fullText: scrapedContent.fullText,
                        searchableText: `${item.title} ${scrapedContent.fullText}`,
                        publishedDate: item.pubDate ? new Date(item.pubDate) : new Date(),
                        keywords: extractKeywords(item.title + ' ' + scrapedContent.fullText),
                        topics: feed.categories,
                        author: item.creator || item['dc:creator'] || 'Unknown',
                        metadata: {
                            rssDiscovery: true,
                            feedPriority: feed.priority,
                            scrapedAt: new Date()
                        }
                    });
                    
                    await article.save();
                    indexed++;
                    console.log(`  ✅ Indexed: "${item.title.substring(0, 60)}..."`);
                } else {
                    console.log(`  ⚠️  Failed to scrape full content: ${item.link}`);
                }
            } catch (scrapeError) {
                console.error(`  ❌ Error scraping article:`, scrapeError.message);
            }
            
            // Ethical delay between scraping (2-3 seconds)
            const delay = 2000 + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        console.log(`  📊 ${feed.name}: ${discovered} new, ${indexed} indexed`);
        return { discovered, indexed };
        
    } catch (error) {
        console.error(`  ❌ Error checking ${feed.name} RSS feed:`, error.message);
        return { discovered: 0, indexed: 0, error: error.message };
    }
}

/**
 * Extract keywords from article text
 * Focuses on political terms, names, policies
 */
function extractKeywords(text) {
    if (!text) return [];
    
    // Common political/policy keywords
    const keywords = [];
    const lowerText = text.toLowerCase();
    
    // Policy areas
    const policyTerms = [
        'housing', 'healthcare', 'medicare', 'medicaid', 'education', 'climate',
        'labor', 'wages', 'minimum wage', 'unions', 'workers', 'immigration',
        'police', 'criminal justice', 'voting rights', 'infrastructure',
        'green new deal', 'medicare for all', 'universal healthcare'
    ];
    
    for (const term of policyTerms) {
        if (lowerText.includes(term)) {
            keywords.push(term);
        }
    }
    
    // Extract capitalized words (likely names, organizations)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    keywords.push(...capitalizedWords.slice(0, 10)); // Top 10 names
    
    return [...new Set(keywords)]; // Remove duplicates
}

/**
 * Monitor all RSS feeds
 * Called by cron job hourly
 */
async function monitorAllFeeds() {
    console.log('🚀 RSS Monitor v37.20.0 - Starting feed check...');
    console.log(`📅 ${new Date().toISOString()}`);
    
    const results = {
        totalDiscovered: 0,
        totalIndexed: 0,
        errors: []
    };
    
    for (const feed of RSS_FEEDS) {
        const result = await checkRSSFeed(feed);
        results.totalDiscovered += result.discovered;
        results.totalIndexed += result.indexed;
        
        if (result.error) {
            results.errors.push({ feed: feed.name, error: result.error });
        }
        
        // Delay between feeds (respectful to different servers)
        await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log('');
    console.log('📊 RSS Monitor Summary:');
    console.log(`   🆕 Total discovered: ${results.totalDiscovered}`);
    console.log(`   ✅ Total indexed: ${results.totalIndexed}`);
    console.log(`   ❌ Errors: ${results.errors.length}`);
    
    if (results.errors.length > 0) {
        console.log('   Error details:', results.errors);
    }
    
    console.log('✅ RSS Monitor check complete');
    
    return results;
}

/**
 * Get statistics about indexed articles
 */
async function getIndexStats() {
    try {
        const stats = {
            totalArticles: await Article.countDocuments(),
            bySource: {},
            byTopic: {},
            recentArticles: await Article.find()
                .sort({ publishedDate: -1 })
                .limit(10)
                .select('title source publishedDate')
        };
        
        // Count by source
        const sources = await Article.aggregate([
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        for (const source of sources) {
            stats.bySource[source._id] = source.count;
        }
        
        // Count by topic
        const topics = await Article.aggregate([
            { $unwind: '$topics' },
            { $group: { _id: '$topics', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        for (const topic of topics) {
            stats.byTopic[topic._id] = topic.count;
        }
        
        return stats;
    } catch (error) {
        console.error('Error getting index stats:', error);
        return null;
    }
}

module.exports = {
    monitorAllFeeds,
    checkRSSFeed,
    getIndexStats,
    RSS_FEEDS
};
