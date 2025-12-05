#!/usr/bin/env node
/**
 * POPULATE ALL SOURCES - ONE-TIME SETUP
 * v37.19.4
 * 
 * PURPOSE: Initial population of article database from all sources
 * RUN: node backend/scripts/populate-all-sources.js
 * 
 * This imports articles from:
 * - Democracy Now
 * - The Intercept
 * - Jacobin
 * - ProPublica
 * - Common Dreams
 * - Truthout
 */

const mongoose = require('mongoose');
const MultiSourceRssImporter = require('../scrapers/multi-source-rss-importer');
const Article = require('../models/Article');

// ANSI colors
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m'
};

function log(emoji, message, color = colors.reset) {
    console.log(`${color}${emoji} ${message}${colors.reset}`);
}

async function main() {
    console.log('\n' + '='.repeat(70));
    log('🚀', 'WORKFORCE DEMOCRACY - MULTI-SOURCE DATABASE POPULATION', colors.bright);
    console.log('='.repeat(70) + '\n');
    
    try {
        // Connect to MongoDB
        log('📡', 'Connecting to MongoDB...', colors.blue);
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        log('✅', 'Connected to MongoDB', colors.green);
        
        // Show current database stats
        log('📊', 'Checking current database...', colors.blue);
        const currentCount = await Article.countDocuments();
        
        if (currentCount > 0) {
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
            
            log('📚', `Current database has ${currentCount} articles:`, colors.cyan);
            sourceStats.forEach(stat => {
                const latestDate = stat.latest ? new Date(stat.latest).toLocaleDateString() : 'Unknown';
                console.log(`   • ${stat._id}: ${stat.count} articles (latest: ${latestDate})`);
            });
        } else {
            log('📭', 'Database is empty - starting fresh', colors.yellow);
        }
        
        // Configuration
        console.log('\n' + '-'.repeat(70));
        log('🔧', 'Configuration:', colors.blue);
        console.log('   • Sources: 6 progressive news outlets');
        console.log('   • Democracy Now, The Intercept, Jacobin, ProPublica, Common Dreams, Truthout');
        console.log('   • Estimated articles per source: 20-40');
        console.log('   • Total expected: 120-240 articles');
        console.log('   • Estimated time: 2-3 minutes');
        console.log('   • Duplicate articles will be skipped automatically');
        console.log('-'.repeat(70) + '\n');
        
        // Run importer
        log('📥', 'Starting multi-source import...', colors.blue);
        const importer = new MultiSourceRssImporter();
        const results = await importer.runImport();
        
        // Show updated database stats
        const newCount = await Article.countDocuments();
        const newSourceStats = await Article.aggregate([
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
        
        const addedArticles = newCount - currentCount;
        
        console.log('\n' + '='.repeat(70));
        log('✅', 'IMPORT COMPLETE!', colors.bright + colors.green);
        console.log('='.repeat(70));
        console.log(`\n${colors.green}📊 Results:${colors.reset}`);
        console.log(`   ✅ Successfully indexed: ${results.totalSuccess} articles`);
        console.log(`   ⏭️  Skipped (already indexed): ${results.totalSkipped} articles`);
        console.log(`   ❌ Errors: ${results.totalErrors} articles`);
        console.log(`   🆕 Net new articles: ${addedArticles}`);
        
        console.log(`\n${colors.cyan}📚 Database now has ${newCount} total articles:${colors.reset}`);
        newSourceStats.forEach(stat => {
            const latestDate = stat.latest ? new Date(stat.latest).toLocaleDateString() : 'Unknown';
            console.log(`   • ${stat._id}: ${stat.count} articles (latest: ${latestDate})`);
        });
        
        // Next steps
        console.log('\n' + '='.repeat(70));
        log('🎯', 'NEXT STEPS:', colors.bright + colors.blue);
        console.log('='.repeat(70));
        console.log(`\n1. ${colors.green}Setup automated daily updates:${colors.reset}`);
        console.log(`   crontab -e`);
        console.log(`   Add: 0 2 * * * cd /var/www/workforce-democracy/version-b && node backend/scripts/daily-multi-source-update.js >> /var/log/article-importer.log 2>&1`);
        console.log(`\n2. ${colors.green}Test the system:${colors.reset}`);
        console.log(`   Query: "What are Mamdani's policies?"`);
        console.log(`   Expected: 10-20 sources from multiple outlets`);
        console.log(`\n3. ${colors.yellow}Monitor logs:${colors.reset}`);
        console.log(`   tail -f /var/log/article-importer.log`);
        console.log('');
        
    } catch (error) {
        console.error(`\n${colors.red}❌ ERROR:${colors.reset}`, error.message);
        console.error(error.stack);
        process.exit(1);
    } finally {
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
