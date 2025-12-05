/**
 * Democracy Now Article Scraper
 * v37.19.2 - Uses RSS feed + search queries for targeted scraping
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');

class DemocracyNowScraper {
    constructor() {
        this.baseUrl = 'https://www.democracynow.org';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }
    
    /**
     * Get article URLs from RSS feed
     */
    async getRssFeedUrls() {
        try {
            console.log('📡 Fetching Democracy Now RSS feed...');
            const response = await axios.get(`${this.baseUrl}/democracynow.rss`, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            
            const $ = cheerio.load(response.data, { xmlMode: true });
            const urls = [];
            
            $('item link').each((i, elem) => {
                const url = $(elem).text().trim();
                if (url && !urls.includes(url)) {
                    urls.push(url);
                }
            });
            
            console.log(`  ✅ Found ${urls.length} article URLs from RSS feed`);
            return urls;
            
        } catch (error) {
            console.error('❌ RSS feed failed:', error.message);
            return [];
        }
    }
    
    /**
     * Get URLs for specific search topics
     * This helps get historical articles about important topics
     */
    async getSearchUrls(searchTerms = []) {
        const urls = [];
        
        for (const term of searchTerms) {
            try {
                console.log(`  🔍 Searching for: "${term}"`);
                
                // Democracy Now search URL
                const searchUrl = `${this.baseUrl}/search?query=${encodeURIComponent(term)}`;
                
                await new Promise(resolve => setTimeout(resolve, 2000)); // Ethical delay
                
                const response = await axios.get(searchUrl, {
                    headers: { 'User-Agent': this.userAgent },
                    timeout: 15000
                });
                
                const $ = cheerio.load(response.data);
                
                // Find article links in search results
                $('a[href*="/2020/"], a[href*="/2021/"], a[href*="/2022/"], a[href*="/2023/"], a[href*="/2024/"], a[href*="/2025/"]').each((i, elem) => {
                    let url = $(elem).attr('href');
                    
                    if (url && !url.startsWith('http')) {
                        url = this.baseUrl + url;
                    }
                    
                    // Only get unique article URLs
                    if (url && !urls.includes(url) && (
                        url.includes('/2020/') || url.includes('/2021/') || 
                        url.includes('/2022/') || url.includes('/2023/') || 
                        url.includes('/2024/') || url.includes('/2025/')
                    )) {
                        urls.push(url);
                    }
                });
                
                console.log(`    ✅ Found ${urls.length} total URLs so far`);
                
            } catch (error) {
                console.error(`  ⚠️  Search for "${term}" failed:`, error.message);
            }
        }
        
        return urls;
    }
    
    /**
     * Scrape a single Democracy Now article
     */
    async scrapeArticle(url) {
        try {
            // Check if already in database
            const existing = await Article.findOne({ url });
            if (existing) {
                return null; // Skip silently
            }
            
            // Ethical delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const response = await axios.get(url, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000,
                maxRedirects: 5
            });
            
            const $ = cheerio.load(response.data);
            
            // Extract article data - try multiple selectors
            const title = $('h1').first().text().trim() || 
                         $('h1.headline').text().trim() ||
                         $('meta[property="og:title"]').attr('content') ||
                         $('title').text().trim();
            
            const excerpt = $('meta[name="description"]').attr('content') || 
                           $('meta[property="og:description"]').attr('content') || 
                           $('.dek').text().trim() ||
                           '';
            
            const fullText = $('.story_description').text().trim() ||
                            $('.story_text').text().trim() || 
                            $('article').text().trim() ||
                            $('.news_article').text().trim() || 
                            '';
            
            const dateStr = $('meta[property="article:published_time"]').attr('content') || 
                           $('time').first().attr('datetime') ||
                           $('.date').first().text().trim();
            
            // Parse date
            let publishedDate = new Date();
            if (dateStr) {
                publishedDate = new Date(dateStr);
                if (isNaN(publishedDate.getTime())) {
                    publishedDate = new Date(); // Fallback to now
                }
            }
            
            // Validate we got content
            if (!title || title.length < 10) {
                console.log(`  ⚠️  No valid title found (got: "${title}")`);
                return null;
            }
            
            // Log what we extracted for debugging
            console.log(`      Title length: ${title.length}, Excerpt length: ${excerpt.length}, Content length: ${fullText.length}`);
            
            // Extract keywords from title and excerpt
            const keywords = this.extractKeywords(title + ' ' + excerpt);
            
            // Detect topics
            const topics = this.detectTopics(title + ' ' + excerpt + ' ' + fullText);
            
            const article = {
                title,
                url,
                source: 'Democracy Now',
                excerpt: excerpt.substring(0, 500),
                fullText: fullText.length > 0 ? fullText.substring(0, 5000) : excerpt, // Use excerpt if no full text
                publishedDate,
                keywords,
                topics
            };
            
            console.log(`  ✅ Scraped: ${title.substring(0, 60)}...`);
            return article;
            
        } catch (error) {
            console.error(`  ❌ Failed: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                          'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had'];
        
        const words = text.toLowerCase()
            .replace(/[^a-z\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.includes(word));
        
        return [...new Set(words)].slice(0, 50);
    }
    
    /**
     * Detect topics from text
     */
    detectTopics(text) {
        const textLower = text.toLowerCase();
        const topics = [];
        
        const topicKeywords = {
            'politics': ['election', 'vote', 'candidate', 'campaign', 'congress', 'senate', 'mayor', 'political', 'mamdani', 'aoc'],
            'labor': ['worker', 'union', 'strike', 'wage', 'labor', 'employment', 'workplace'],
            'housing': ['housing', 'rent', 'tenant', 'eviction', 'homeless', 'affordable', 'shelter'],
            'healthcare': ['healthcare', 'hospital', 'medical', 'insurance', 'medicare', 'medicaid', 'doctor'],
            'climate': ['climate', 'environment', 'renewable', 'pollution', 'carbon', 'green', 'energy'],
            'justice': ['justice', 'court', 'police', 'prison', 'criminal', 'rights', 'reform'],
            'immigration': ['immigration', 'immigrant', 'border', 'refugee', 'asylum', 'deportation'],
            'education': ['education', 'school', 'student', 'teacher', 'university', 'college']
        };
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics;
    }
    
    /**
     * Run full scrape with targeted search terms
     */
    async runFullScrape(maxArticles = 100) {
        console.log('🚀 Starting Democracy Now scrape...');
        console.log(`📊 Target: ${maxArticles} articles`);
        
        // Get URLs from RSS feed first
        let urls = await this.getRssFeedUrls();
        
        // If we need more articles, search for specific topics
        if (urls.length < maxArticles) {
            console.log(`📡 Getting more articles via topic search...`);
            
            const searchTerms = [
                'Zohran Mamdani',
                'AOC Alexandria Ocasio-Cortez', 
                'Bernie Sanders',
                'medicare for all',
                'workers rights',
                'housing justice',
                'progressive politics',
                'democratic socialist',
                'labor union',
                'climate justice'
            ];
            
            const searchUrls = await this.getSearchUrls(searchTerms);
            urls = [...new Set([...urls, ...searchUrls])]; // Combine and deduplicate
        }
        
        // Limit to requested number
        urls = urls.slice(0, maxArticles);
        
        if (urls.length === 0) {
            console.log('❌ No URLs found');
            return { successCount: 0, skipCount: 0, errorCount: 0 };
        }
        
        console.log(`\n📋 Scraping ${urls.length} articles...`);
        console.log(`⏱️  Estimated time: ~${Math.ceil(urls.length * 2 / 60)} minutes\n`);
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            console.log(`[${i + 1}/${urls.length}] ${url.substring(0, 80)}...`);
            
            const articleData = await this.scrapeArticle(url);
            
            if (articleData === null) {
                skipCount++;
                continue;
            }
            
            try {
                await Article.create(articleData);
                successCount++;
            } catch (error) {
                if (error.code === 11000) {
                    skipCount++;
                } else {
                    console.error(`  ❌ Save failed: ${error.message}`);
                    errorCount++;
                }
            }
        }
        
        console.log('\n✅ Scraping complete!');
        console.log(`  📊 Successfully indexed: ${successCount}`);
        console.log(`  ⏭️  Skipped: ${skipCount}`);
        console.log(`  ❌ Errors: ${errorCount}`);
        
        return { successCount, skipCount, errorCount };
    }
}

module.exports = DemocracyNowScraper;

// If run directly
if (require.main === module) {
    const mongoose = require('mongoose');
    
    async function main() {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const scraper = new DemocracyNowScraper();
        await scraper.runFullScrape(50); // Start with 50 articles
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
    
    main().catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
