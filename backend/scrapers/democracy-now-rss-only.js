/**
 * Democracy Now RSS-Only Importer
 * v37.19.3 - Uses ONLY RSS feed data (no HTML scraping to avoid bot detection)
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');

class DemocracyNowRssImporter {
    constructor() {
        this.rssUrl = 'https://www.democracynow.org/democracynow.rss';
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }
    
    /**
     * Import articles from RSS feed
     * RSS feed provides: title, link, description, pubDate
     * We don't need to scrape HTML - RSS has enough info!
     */
    async importFromRss() {
        try {
            console.log('📡 Fetching Democracy Now RSS feed...');
            const response = await axios.get(this.rssUrl, {
                headers: { 'User-Agent': this.userAgent },
                timeout: 15000
            });
            
            const $ = cheerio.load(response.data, { xmlMode: true });
            const articles = [];
            
            $('item').each((i, elem) => {
                const title = $(elem).find('title').text().trim();
                const link = $(elem).find('link').text().trim();
                const description = $(elem).find('description').text().trim();
                const pubDate = $(elem).find('pubDate').text().trim();
                
                // Parse date
                let publishedDate = new Date();
                if (pubDate) {
                    publishedDate = new Date(pubDate);
                    if (isNaN(publishedDate.getTime())) {
                        publishedDate = new Date();
                    }
                }
                
                // Extract keywords from title and description
                const keywords = this.extractKeywords(title + ' ' + description);
                
                // Detect topics
                const topics = this.detectTopics(title + ' ' + description);
                
                if (title && link && title.length > 5) {
                    articles.push({
                        title,
                        url: link,
                        source: 'Democracy Now',
                        excerpt: description.substring(0, 500),
                        fullText: description, // RSS only has description, not full text
                        publishedDate,
                        keywords,
                        topics
                    });
                }
            });
            
            console.log(`  ✅ Found ${articles.length} articles in RSS feed`);
            return articles;
            
        } catch (error) {
            console.error('❌ RSS import failed:', error.message);
            return [];
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
            'education': ['education', 'school', 'student', 'teacher', 'university', 'college'],
            'economy': ['economy', 'economic', 'jobs', 'unemployment', 'poverty', 'inequality']
        };
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics;
    }
    
    /**
     * Run import and save to database
     */
    async runImport() {
        console.log('🚀 Starting Democracy Now RSS import...');
        console.log('📊 Using RSS feed only (no HTML scraping to avoid bot detection)');
        
        const articles = await this.importFromRss();
        
        if (articles.length === 0) {
            console.log('❌ No articles found in RSS feed');
            return { successCount: 0, skipCount: 0, errorCount: 0 };
        }
        
        console.log(`\n📋 Importing ${articles.length} articles...`);
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            console.log(`[${i + 1}/${articles.length}] ${article.title.substring(0, 80)}...`);
            
            try {
                // Check if already exists
                const existing = await Article.findOne({ url: article.url });
                if (existing) {
                    console.log(`  ⏭️  Already indexed`);
                    skipCount++;
                    continue;
                }
                
                await Article.create(article);
                console.log(`  ✅ Indexed`);
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
        
        console.log('\n✅ Import complete!');
        console.log(`  📊 Successfully indexed: ${successCount}`);
        console.log(`  ⏭️  Skipped: ${skipCount}`);
        console.log(`  ❌ Errors: ${errorCount}`);
        
        return { successCount, skipCount, errorCount };
    }
}

module.exports = DemocracyNowRssImporter;

// If run directly
if (require.main === module) {
    const mongoose = require('mongoose');
    
    async function main() {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');
        
        const importer = new DemocracyNowRssImporter();
        await importer.runImport();
        
        await mongoose.disconnect();
        console.log('✅ Disconnected from MongoDB');
        process.exit(0);
    }
    
    main().catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
