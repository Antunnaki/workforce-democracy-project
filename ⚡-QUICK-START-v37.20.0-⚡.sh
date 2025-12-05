#!/bin/bash

# ⚡ QUICK START - ARTICLE SCRAPER SYSTEM v37.20.0 ⚡
# Complete installation and setup script
# Password: YNWA1892LFC

echo "🚀 ARTICLE SCRAPER SYSTEM v37.20.0 - QUICK START"
echo "================================================"
echo ""
echo "This will install and configure:"
echo "  ✅ RSS Monitor (7 progressive outlets)"
echo "  ✅ Playwright Article Scraper (JavaScript-capable)"
echo "  ✅ MongoDB Article Index (full-text search)"
echo "  ✅ Historical Seeder (5,000+ articles)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

echo ""
echo "📦 PHASE 1: INSTALL DEPENDENCIES ON SERVER"
echo "==========================================="
echo ""

# Install Playwright on server
ssh root@185.193.126.13 << 'EOF'
cd /var/www/workforce-democracy/version-b/backend

echo "📥 Installing Playwright..."
npm install playwright

echo "🌐 Installing Chromium browser..."
npx playwright install chromium

echo "📚 Installing RSS parser..."
npm install rss-parser

echo "✅ Dependencies installed!"
EOF

echo ""
echo "📤 PHASE 2: UPLOAD NEW FILES"
echo "============================="
echo ""

cd "/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.19.8/backend"

echo "Uploading RSS Monitor..."
scp services/rss-monitor.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/rss-monitor.js

echo "Uploading Article Scraper..."
scp services/article-scraper-playwright.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/services/article-scraper-playwright.js

echo "Uploading Enhanced Article Model..."
scp models/Article.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/models/Article.js

echo "Creating scripts directory..."
ssh root@185.193.126.13 'mkdir -p /var/www/workforce-democracy/version-b/backend/scripts'

echo "Uploading Historical Seeder..."
scp scripts/seed-historical-articles.js root@185.193.126.13:/var/www/workforce-democracy/version-b/backend/scripts/seed-historical-articles.js

echo "✅ All files uploaded!"

echo ""
echo "⏰ PHASE 3: SET UP CRON JOB"
echo "==========================="
echo ""

ssh root@185.193.126.13 << 'EOF'
# Add cron job for hourly RSS monitoring
(crontab -l 2>/dev/null; echo "0 * * * * cd /var/www/workforce-democracy/version-b/backend && node -e \"require('./services/rss-monitor').monitorAllFeeds()\" >> /var/log/rss-monitor.log 2>&1") | crontab -

echo "✅ Cron job installed (runs every hour)"
EOF

echo ""
echo "🎉 INSTALLATION COMPLETE!"
echo "========================="
echo ""
echo "🌱 NEXT STEP: RUN HISTORICAL SEEDER"
echo "===================================="
echo ""
echo "This will populate your database with 5,000+ articles."
echo "It will take 2-3 hours to complete."
echo ""
echo "Run this command:"
echo ""
echo "  ssh root@185.193.126.13 'cd /var/www/workforce-democracy/version-b/backend && node scripts/seed-historical-articles.js'"
echo ""
echo "Or run it in screen session (so it continues if you disconnect):"
echo ""
echo "  ssh root@185.193.126.13"
echo "  cd /var/www/workforce-democracy/version-b/backend"
echo "  screen -S seeder"
echo "  node scripts/seed-historical-articles.js"
echo "  # Press Ctrl+A then D to detach"
echo "  # Reconnect later with: screen -r seeder"
echo ""
echo "✅ System ready to seed!"
