#!/usr/bin/env node
/**
 * DAILY ARTICLE UPDATE CRON JOB
 * v37.19.0
 * 
 * PURPOSE: Daily automated updates of article database
 * SCHEDULE: Run daily at 2 AM via cron
 * 
 * Cron setup (add to crontab):
 * 0 2 * * * cd /var/www/workforce-democracy/version-b && node backend/scripts/daily-article-update.js >> /var/log/article-scraper.log 2>&1
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Scrapes latest 50 articles from Democracy Now
 * 3. Logs results
 * 4. Disconnects
 */

const mongoose = require('mongoose');
const DemocracyNowScraper = require('../scrapers/democracy-now-scraper');
const Article = require('../models/Article');

async function dailyUpdate() {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 DAILY ARTICLE UPDATE - ' + new Date().toISOString());
    console.log('='.repeat(60) + '\n');
    
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
        
        // Get current stats
        const beforeCount = await Article.countDocuments();
        console.log(`📊 Current database has ${beforeCount} articles`);
        
        // Run scraper for latest 50 articles
        console.log('🕷️  Scraping latest 50 articles...');
        const scraper = new DemocracyNowScraper();
        const results = await scraper.runFullScrape(50);
        
        // Get updated stats
        const afterCount = await Article.countDocuments();
        const newArticles = afterCount - beforeCount;
        
        // Log results
        console.log('\n✅ Daily update complete!');
        console.log(`   📊 New articles added: ${newArticles}`);
        console.log(`   📚 Total articles now: ${afterCount}`);
        console.log(`   ✅ Successfully indexed: ${results.successCount}`);
        console.log(`   ⏭️  Skipped (already indexed): ${results.skipCount}`);
        console.log(`   ❌ Errors: ${results.errorCount}`);
        
        // Disconnect
        await mongoose.disconnect();
        console.log('👋 Disconnected from MongoDB\n');
        
        return {
            success: true,
            newArticles,
            totalArticles: afterCount,
            results
        };
        
    } catch (error) {
        console.error('❌ Daily update failed:', error.message);
        console.error(error.stack);
        
        // Ensure disconnect even on error
        try {
            await mongoose.disconnect();
        } catch (disconnectError) {
            console.error('Failed to disconnect:', disconnectError.message);
        }
        
        return {
            success: false,
            error: error.message
        };
    }
}

// Run if called directly
if (require.main === module) {
    dailyUpdate()
        .then(result => {
            if (result.success) {
                console.log('✅ Daily update successful');
                process.exit(0);
            } else {
                console.error('❌ Daily update failed');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('Fatal error:', error);
            process.exit(1);
        });
}

module.exports = dailyUpdate;
