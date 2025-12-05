#!/usr/bin/env node
/**
 * DAILY MULTI-SOURCE UPDATE CRON JOB
 * v37.19.4
 * 
 * PURPOSE: Daily automated updates from all progressive news sources
 * SCHEDULE: Run daily at 2 AM via cron
 * 
 * Cron setup (add to crontab):
 * 0 2 * * * cd /var/www/workforce-democracy/version-b && node backend/scripts/daily-multi-source-update.js >> /var/log/article-importer.log 2>&1
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Imports latest articles from all 6 progressive sources
 * 3. Logs detailed results
 * 4. Sends summary statistics
 * 5. Disconnects
 */

const mongoose = require('mongoose');
const MultiSourceRssImporter = require('../scrapers/multi-source-rss-importer');
const Article = require('../models/Article');

async function dailyUpdate() {
    const startTime = new Date();
    
    console.log('\n' + '='.repeat(70));
    console.log('🔄 DAILY MULTI-SOURCE UPDATE - ' + startTime.toISOString());
    console.log('='.repeat(70) + '\n');
    
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
        
        // Get stats before update
        const beforeCount = await Article.countDocuments();
        const beforeBySource = await Article.aggregate([
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
        
        console.log(`\n📊 Database before update:`);
        console.log(`   Total articles: ${beforeCount}`);
        beforeBySource.forEach(stat => {
            const latestDate = stat.latest ? new Date(stat.latest).toLocaleDateString() : 'Unknown';
            console.log(`   • ${stat._id}: ${stat.count} articles (latest: ${latestDate})`);
        });
        
        // Run multi-source import
        console.log('\n' + '='.repeat(70));
        const importer = new MultiSourceRssImporter();
        const results = await importer.runImport();
        console.log('='.repeat(70));
        
        // Get stats after update
        const afterCount = await Article.countDocuments();
        const afterBySource = await Article.aggregate([
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
        
        const newArticles = afterCount - beforeCount;
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        // Summary
        console.log('\n' + '='.repeat(70));
        console.log('✅ DAILY UPDATE COMPLETE!');
        console.log('='.repeat(70));
        console.log(`\n📊 Summary:`);
        console.log(`   🆕 New articles added: ${newArticles}`);
        console.log(`   📚 Total articles now: ${afterCount}`);
        console.log(`   ⏱️  Duration: ${duration} seconds`);
        console.log(`   📅 Date: ${startTime.toLocaleDateString()}`);
        console.log(`   🕐 Time: ${startTime.toLocaleTimeString()}`);
        
        console.log(`\n📰 Database after update:`);
        afterBySource.forEach(stat => {
            const before = beforeBySource.find(s => s._id === stat._id);
            const added = stat.count - (before ? before.count : 0);
            const latestDate = stat.latest ? new Date(stat.latest).toLocaleDateString() : 'Unknown';
            console.log(`   • ${stat._id}: ${stat.count} articles (+${added} new) (latest: ${latestDate})`);
        });
        
        console.log(`\n📋 Import Details:`);
        console.log(`   ✅ Successfully indexed: ${results.totalSuccess}`);
        console.log(`   ⏭️  Skipped (duplicates): ${results.totalSkipped}`);
        console.log(`   ❌ Errors: ${results.totalErrors}`);
        
        // Disconnect
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        console.log('='.repeat(70) + '\n');
        
        return {
            success: true,
            newArticles,
            totalArticles: afterCount,
            duration,
            results
        };
        
    } catch (error) {
        console.error('\n❌ DAILY UPDATE FAILED:', error.message);
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
