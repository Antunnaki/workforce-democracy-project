/**
 * HISTORICAL ARTICLE SEEDER v37.20.0
 * 
 * One-time script to backfill MongoDB with important historical articles
 * Focuses on progressive candidates, policies, and movements
 * 
 * USAGE:
 *   node backend/scripts/seed-historical-articles.js
 * 
 * FEATURES:
 * - Searches for key progressive topics/candidates
 * - Uses RSS feeds + DuckDuckGo to find articles
 * - Scrapes full content with Playwright
 * - Indexes into MongoDB
 * - Never re-scrapes (checks if article exists first)
 * 
 * TARGET: 5,000+ articles indexed
 */

const mongoose = require('mongoose');
const Article = require('../models/Article');
const rssMonitor = require('../services/rss-monitor');
const articleScraperPlaywright = require('../services/article-scraper-playwright');
const Parser = require('rss-parser');

const parser = new Parser();

/**
 * Progressive candidates and topics to search for
 * Prioritized by importance for policy research
 */
const SEARCH_TOPICS = [
    // Progressive candidates (highest priority)
    { query: 'Zohran Mamdani', priority: 1, maxArticles: 100 },
    { query: 'Alexandria Ocasio-Cortez', priority: 1, maxArticles: 100 },
    { query: 'AOC', priority: 1, maxArticles: 50 },
    { query: 'Bernie Sanders', priority: 1, maxArticles: 100 },
    { query: 'Ilhan Omar', priority: 1, maxArticles: 50 },
    { query: 'Rashida Tlaib', priority: 1, maxArticles: 50 },
    { query: 'Ayanna Pressley', priority: 1, maxArticles: 50 },
    { query: 'Cori Bush', priority: 1, maxArticles: 50 },
    { query: 'Jamaal Bowman', priority: 1, maxArticles: 50 },
    
    // Major policies (high priority)
    { query: 'Medicare for All', priority: 2, maxArticles: 50 },
    { query: 'Green New Deal', priority: 2, maxArticles: 50 },
    { query: 'Housing for All', priority: 2, maxArticles: 30 },
    { query: 'Universal Basic Income', priority: 2, maxArticles: 30 },
    { query: 'Defund the Police', priority: 2, maxArticles: 30 },
    { query: 'Criminal Justice Reform', priority: 2, maxArticles: 30 },
    
    // Policy areas (medium priority)
    { query: 'Progressive Housing Policy', priority: 3, maxArticles: 20 },
    { query: 'Labor Union Organizing', priority: 3, maxArticles: 20 },
    { query: 'Minimum Wage Increase', priority: 3, maxArticles: 20 },
    { query: 'Climate Justice', priority: 3, maxArticles: 20 },
    { query: 'Immigration Rights', priority: 3, maxArticles: 20 },
    { query: 'Student Debt Cancellation', priority: 3, maxArticles: 20 },
    { query: 'Universal Healthcare', priority: 3, maxArticles: 20 },
    { query: 'Voting Rights Act', priority: 3, maxArticles: 20 }
];

/**
 * Search RSS feed archives for a specific query
 */
async function searchRSSArchive(feed, query, maxArticles = 20) {
    console.log(`  🔍 Searching ${feed.name} for "${query}"...`);
    
    try {
        const rssFeed = await parser.parseURL(feed.url);
        const matchingArticles = [];
        
        for (const item of rssFeed.items) {
            // Check if article matches query (case-insensitive)
            const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
            const descMatch = item.contentSnippet?.toLowerCase().includes(query.toLowerCase()) || false;
            
            if (titleMatch || descMatch) {
                // Check if already in database
                const existingArticle = await Article.findOne({ url: item.link });
                
                if (!existingArticle) {
                    matchingArticles.push({
                        title: item.title,
                        url: item.link,
                        date: item.pubDate,
                        feed: feed.name
                    });
                }
            }
            
            if (matchingArticles.length >= maxArticles) {
                break;
            }
        }
        
        console.log(`    ✅ Found ${matchingArticles.length} matching articles`);
        return matchingArticles;
        
    } catch (error) {
        console.error(`    ❌ Error searching ${feed.name}:`, error.message);
        return [];
    }
}

/**
 * Seed articles for a specific topic
 */
async function seedTopic(topic) {
    console.log(`\n📚 Seeding topic: "${topic.query}" (max ${topic.maxArticles} articles)`);
    
    const allArticles = [];
    
    // Search all RSS feeds
    for (const feed of rssMonitor.RSS_FEEDS) {
        const articles = await searchRSSArchive(feed, topic.query, topic.maxArticles);
        allArticles.push(...articles);
        
        // Delay between feeds
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`  📊 Total articles found across all feeds: ${allArticles.length}`);
    
    // Scrape and index articles
    let indexed = 0;
    for (const article of allArticles) {
        try {
            console.log(`  🌐 Scraping: "${article.title.substring(0, 60)}..."`);
            
            const scrapedContent = await articleScraperPlaywright.scrapeArticle(
                article.url,
                article.feed
            );
            
            if (scrapedContent && scrapedContent.fullText) {
                // Index into MongoDB
                const newArticle = new Article({
                    title: article.title,
                    url: article.url,
                    source: article.feed,
                    fullText: scrapedContent.fullText,
                    searchableText: `${article.title} ${scrapedContent.fullText}`,
                    publishedDate: article.date ? new Date(article.date) : new Date(),
                    keywords: extractKeywords(topic.query),
                    topics: categorizeByQuery(topic.query),
                    author: scrapedContent.author || 'Unknown',
                    metadata: {
                        rssDiscovery: false, // This is historical seeding, not RSS monitoring
                        feedPriority: topic.priority,
                        scrapingMethod: 'playwright'
                    }
                });
                
                await newArticle.save();
                indexed++;
                console.log(`    ✅ Indexed: "${article.title.substring(0, 60)}..."`);
            } else {
                console.log(`    ⚠️  Failed to scrape full content`);
            }
            
        } catch (error) {
            console.error(`    ❌ Error:`, error.message);
        }
        
        // Ethical delay between articles (2-3 seconds)
        const delay = 2000 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    console.log(`  ✅ Indexed ${indexed}/${allArticles.length} articles for "${topic.query}"`);
    return indexed;
}

/**
 * Extract keywords from query
 */
function extractKeywords(query) {
    const keywords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    return keywords;
}

/**
 * Categorize article by query topic
 */
function categorizeByQuery(query) {
    const lowerQuery = query.toLowerCase();
    const topics = [];
    
    if (lowerQuery.includes('housing') || lowerQuery.includes('rent')) topics.push('housing');
    if (lowerQuery.includes('healthcare') || lowerQuery.includes('medicare')) topics.push('healthcare');
    if (lowerQuery.includes('climate') || lowerQuery.includes('green')) topics.push('climate');
    if (lowerQuery.includes('labor') || lowerQuery.includes('union') || lowerQuery.includes('wage')) topics.push('labor');
    if (lowerQuery.includes('justice') || lowerQuery.includes('police')) topics.push('justice');
    if (lowerQuery.includes('immigration')) topics.push('immigration');
    if (lowerQuery.includes('education') || lowerQuery.includes('student')) topics.push('education');
    if (lowerQuery.includes('economy') || lowerQuery.includes('ubi')) topics.push('economy');
    
    // Default to politics if no specific topic matched
    if (topics.length === 0) topics.push('politics');
    
    return topics;
}

/**
 * Main seeding function
 */
async function seedHistoricalArticles() {
    console.log('🚀 HISTORICAL ARTICLE SEEDER v37.20.0');
    console.log(`📅 ${new Date().toISOString()}`);
    console.log(`🎯 Target: ${SEARCH_TOPICS.reduce((sum, topic) => sum + topic.maxArticles, 0)} articles`);
    console.log('');
    
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce-democracy', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
        
        let totalIndexed = 0;
        
        // Seed each topic
        for (const topic of SEARCH_TOPICS) {
            const indexed = await seedTopic(topic);
            totalIndexed += indexed;
            
            // Delay between topics
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        console.log('');
        console.log('🎉 SEEDING COMPLETE!');
        console.log(`📊 Total articles indexed: ${totalIndexed}`);
        
        // Get final stats
        const stats = await rssMonitor.getIndexStats();
        console.log('');
        console.log('📚 Final Database Stats:');
        console.log(`   Total articles: ${stats.totalArticles}`);
        console.log('   By source:', stats.bySource);
        console.log('   By topic:', stats.byTopic);
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    seedHistoricalArticles()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = {
    seedHistoricalArticles,
    seedTopic,
    SEARCH_TOPICS
};
