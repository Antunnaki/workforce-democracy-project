#!/bin/bash
# Simple deployment script to fix the voting-info.json 404 issue

echo "📦 Creating deployment package with data directory..."
tar -czf /tmp/wdp-frontend-fix.tar.gz data

echo "📤 Uploading package to server..."
scp -i ~/.ssh/id_ed25519_njalla /tmp/wdp-frontend-fix.tar.gz deploy@185.193.126.13:/tmp/

echo "🚀 Extracting on server..."
ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13 "cd /var/www/workforcedemocracyproject.org && sudo tar -xzf /tmp/wdp-frontend-fix.tar.gz && sudo chown -R www-data:www-data data && sudo chmod -R 755 data && rm /tmp/wdp-frontend-fix.tar.gz"

echo "🧹 Cleaning up local file..."
rm /tmp/wdp-frontend-fix.tar.gz

echo "✅ Deployment complete! The data directory should now be available on the server."