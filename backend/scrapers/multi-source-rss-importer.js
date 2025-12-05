/**
 * Multi-Source RSS Importer
 * v37.19.4 - Import articles from multiple progressive news sources
 * 
 * Sources:
 * - Democracy Now
 * - The Intercept
 * - Jacobin
 * - ProPublica
 * - Common Dreams
 * - Truthout
 */

const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../models/Article');

class MultiSourceRssImporter {
    constructor() {
        this.sources = [
            {
                name: 'Democracy Now',
                rssUrl: 'https://www.democracynow.org/democracynow.rss',
                enabled: true
            },
            {
                name: 'The Intercept',
                rssUrl: 'https://theintercept.com/feed/?lang=en',
                enabled: true
            },
            {
                name: 'Jacobin',
                rssUrl: 'https://jacobin.com/feed/',
                enabled: true
            },
            {
                name: 'ProPublica',
                rssUrl: 'https://www.propublica.org/feeds/propublica/main',
                enabled: true
            },
            {
                name: 'Common Dreams',
                rssUrl: 'https://www.commondreams.org/feeds/feed.rss',
                enabled: true
            },
            {
                name: 'Truthout',
                rssUrl: 'https://truthout.org/feeds/feed.rss',
                enabled: true
            }
        ];
        
        this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    }
    
    /**
     * Import articles from a single RSS feed
     */
    async importFromSource(source) {
        try {
            console.log(`\n📡 Fetching ${source.name} RSS feed...`);
            
            const response = await axios.get(source.rssUrl, {
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
                
                // Extract keywords
                const keywords = this.extractKeywords(title + ' ' + description);
                
                // Detect topics
                const topics = this.detectTopics(title + ' ' + description);
                
                if (title && link && title.length > 5) {
                    articles.push({
                        title,
                        url: link,
                        source: source.name,
                        excerpt: description.substring(0, 500),
                        fullText: description,
                        publishedDate,
                        keywords,
                        topics
                    });
                }
            });
            
            console.log(`  ✅ Found ${articles.length} articles in ${source.name} RSS feed`);
            return articles;
            
        } catch (error) {
            console.error(`  ❌ ${source.name} RSS import failed:`, error.message);
            return [];
        }
    }
    
    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                          'of', 'with', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
                          'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that'];
        
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
            'politics': ['election', 'vote', 'candidate', 'campaign', 'congress', 'senate', 'mayor', 'political', 'mamdani', 'aoc', 'bernie'],
            'labor': ['worker', 'union', 'strike', 'wage', 'labor', 'employment', 'workplace', 'collective bargaining'],
            'housing': ['housing', 'rent', 'tenant', 'eviction', 'homeless', 'affordable', 'shelter', 'landlord'],
            'healthcare': ['healthcare', 'hospital', 'medical', 'insurance', 'medicare', 'medicaid', 'doctor', 'health care'],
            'climate': ['climate', 'environment', 'renewable', 'pollution', 'carbon', 'green', 'energy', 'fossil fuel'],
            'justice': ['justice', 'court', 'police', 'prison', 'criminal', 'rights', 'reform', 'incarceration'],
            'immigration': ['immigration', 'immigrant', 'border', 'refugee', 'asylum', 'deportation', 'ice'],
            'education': ['education', 'school', 'student', 'teacher', 'university', 'college', 'tuition'],
            'economy': ['economy', 'economic', 'jobs', 'unemployment', 'poverty', 'inequality', 'wealth']
        };
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => textLower.includes(keyword))) {
                topics.push(topic);
            }
        }
        
        return topics;
    }
    
    /**
     * Import from all enabled sources
     */
    async importAllSources() {
        console.log('🚀 Starting Multi-Source RSS Import...');
        console.log(`📊 Importing from ${this.sources.filter(s => s.enabled).length} sources`);
        
        const enabledSources = this.sources.filter(s => s.enabled);
        const results = {
            totalSuccess: 0,
            totalSkipped: 0,
            totalErrors: 0,
            bySource: {}
        };
        
        for (const source of enabledSources) {
            const articles = await this.importFromSource(source);
            
            let successCount = 0;
            let skipCount = 0;
            let errorCount = 0;
            
            console.log(`\n📋 Importing ${articles.length} articles from ${source.name}...`);
            
            for (let i = 0; i < articles.length; i++) {
                const article = articles[i];
                
                try {
                    // Check if already exists
                    const existing = await Article.findOne({ url: article.url });
                    if (existing) {
                        skipCount++;
                        continue;
                    }
                    
                    await Article.create(article);
                    successCount++;
                    
                    if (successCount <= 3) {
                        console.log(`  ✅ [${i + 1}/${articles.length}] ${article.title.substring(0, 60)}...`);
                    }
                    
                } catch (error) {
                    if (error.code === 11000) {
                        skipCount++;
                    } else {
                        console.error(`  ❌ Save failed: ${error.message}`);
                        errorCount++;
                    }
                }
            }
            
            if (successCount > 3) {
                console.log(`  ... and ${successCount - 3} more articles`);
            }
            
            console.log(`\n  📊 ${source.name} Results:`);
            console.log(`     ✅ Indexed: ${successCount}`);
            console.log(`     ⏭️  Skipped: ${skipCount}`);
            console.log(`     ❌ Errors: ${errorCount}`);
            
            results.totalSuccess += successCount;
            results.totalSkipped += skipCount;
            results.totalErrors += errorCount;
            results.bySource[source.name] = { successCount, skipCount, errorCount };
            
            // Ethical delay between sources
            if (enabledSources.indexOf(source) < enabledSources.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        return results;
    }
    
    /**
     * Run full import
     */
    async runImport() {
        const startTime = Date.now();
        
        const results = await this.importAllSources();
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ MULTI-SOURCE IMPORT COMPLETE!');
        console.log('='.repeat(60));
        console.log(`\n📊 Overall Results:`);
        console.log(`   ✅ Total indexed: ${results.totalSuccess} articles`);
        console.log(`   ⏭️  Total skipped: ${results.totalSkipped} articles`);
        console.log(`   ❌ Total errors: ${results.totalErrors} articles`);
        console.log(`   ⏱️  Duration: ${duration} seconds`);
        
        console.log(`\n📰 By Source:`);
        for (const [sourceName, stats] of Object.entries(results.bySource)) {
            console.log(`   • ${sourceName}: ${stats.successCount} new, ${stats.skipCount} skipped`);
        }
        
        return results;
    }
}

module.exports = MultiSourceRssImporter;

// If run directly
if (require.main === module) {
    const mongoose = require('mongoose');
    
    async function main() {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');
        
        const importer = new MultiSourceRssImporter();
        await importer.runImport();
        
        await mongoose.disconnect();
        console.log('\n✅ Disconnected from MongoDB');
        process.exit(0);
    }
    
    main().catch(error => {
        console.error('❌ Error:', error);
        process.exit(1);
    });
}
