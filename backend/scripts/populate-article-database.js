#!/usr/bin/env node
/**
 * ARTICLE DATABASE POPULATION SCRIPT
 * v37.19.0
 * 
 * PURPOSE: Populate MongoDB with articles from Democracy Now archive
 * RUN: node backend/scripts/populate-article-database.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Runs Democracy Now scraper (100 articles initially)
 * 3. Shows statistics
 * 4. Can be run again to add more articles (auto-skips duplicates)
 */

const mongoose = require('mongoose');
const DemocracyNowRssImporter = require('../scrapers/democracy-now-rss-only');
const Article = require('../models/Article');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function main() {
    console.log('\n' + '='.repeat(60));
    log('🚀', 'WORKFORCE DEMOCRACY - ARTICLE DATABASE POPULATION', colors.bright);
    console.log('='.repeat(60) + '\n');
    
    try {
        // Step 1: Connect to MongoDB
        log('📡', 'Connecting to MongoDB...', colors.blue);
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        log('✅', 'Connected to MongoDB', colors.green);
        
        // Step 2: Show current database stats
        log('📊', 'Checking current database...', colors.blue);
        const currentCount = await Article.countDocuments();
        const sourceStats = await Article.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 },
                    latest: { $max: '$publishedDate' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        if (currentCount > 0) {
            log('📚', `Current database has ${currentCount} articles:`, colors.cyan);
            sourceStats.forEach(stat => {
                const latestDate = stat.latest ? new Date(stat.latest).toLocaleDateString() : 'Unknown';
                console.log(`   • ${stat._id}: ${stat.count} articles (latest: ${latestDate})`);
            });
        } else {
            log('📭', 'Database is empty - starting fresh', colors.yellow);
        }
        
        // Step 3: Ask user how many articles to scrape
        console.log('\n' + '-'.repeat(60));
        log('🔧', 'Configuration:', colors.blue);
        console.log(`   • Source: Democracy Now RSS feed`);
        console.log(`   • Method: RSS-only (no HTML scraping to avoid bot detection)`);
        console.log(`   • Expected articles: ~35 from RSS feed`);
        console.log(`   • Estimated time: ~10 seconds`);
        console.log(`   • Duplicate articles will be skipped automatically`);
        console.log('-'.repeat(60) + '\n');
        
        // Step 4: Run importer (RSS only - no HTML scraping to avoid bot detection)
        log('📥', 'Starting RSS import...', colors.blue);
        const importer = new DemocracyNowRssImporter();
        const results = await importer.runImport();
        
        // Step 5: Show results
        console.log('\n' + '='.repeat(60));
        log('✅', 'SCRAPING COMPLETE!', colors.bright + colors.green);
        console.log('='.repeat(60));
        
        if (!results || typeof results !== 'object') {
            console.log(`\n${colors.red}❌ Scraping failed - no results returned${colors.reset}`);
            results = { successCount: 0, skipCount: 0, errorCount: 0 };
        } else {
            console.log(`\n${colors.green}📊 Results:${colors.reset}`);
            console.log(`   ✅ Successfully indexed: ${results.successCount || 0} articles`);
            console.log(`   ⏭️  Skipped (already indexed): ${results.skipCount || 0} articles`);
            console.log(`   ❌ Errors: ${results.errorCount || 0} articles`);
        }
        
        // Step 6: Show updated database stats
        const newCount = await Article.countDocuments();
        const newSourceStats = await Article.aggregate([
            {
                $group: {
                    _id: '$source',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        console.log(`\n${colors.cyan}📚 Database now has ${newCount} total articles:${colors.reset}`);
        newSourceStats.forEach(stat => {
            console.log(`   • ${stat._id}: ${stat.count} articles`);
        });
        
        // Step 7: Next steps
        console.log('\n' + '='.repeat(60));
        log('🎯', 'NEXT STEPS:', colors.bright + colors.blue);
        console.log('='.repeat(60));
        console.log(`\n1. ${colors.green}Deploy updated ai-service.js:${colors.reset}`);
        console.log(`   scp backend/ai-service.js backend/services/article-search-service.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/`);
        console.log(`\n2. ${colors.green}Restart backend service:${colors.reset}`);
        console.log(`   ssh root@185.193.126.13 'sudo systemctl restart workforce-backend-b.service'`);
        console.log(`\n3. ${colors.green}Test with query:${colors.reset}`);
        console.log(`   "What are Mamdani's policies?"`);
        console.log(`\n4. ${colors.yellow}To add more articles later:${colors.reset}`);
        console.log(`   node backend/scripts/populate-article-database.js 200`);
        console.log('');
        
    } catch (error) {
        console.error(`\n${colors.red}❌ ERROR:${colors.reset}`, error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
        // Disconnect from MongoDB
        await mongoose.disconnect();
        log('👋', 'Disconnected from MongoDB', colors.blue);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = main;
