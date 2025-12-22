#!/bin/bash
# Simple script to deploy fixed JS files to the server
# This script creates a tarball with just the fixed files and uploads them

echo "📦 Creating deployment package for fixed JS files..."
tar -czf /tmp/wdp-js-fixes.tar.gz js/main.js js/chat-clean.js

echo "📤 Uploading package to server..."
scp -i ~/.ssh/id_ed25519_njalla /tmp/wdp-js-fixes.tar.gz deploy@185.193.126.13:/tmp/

echo "🔧 Extracting files on server (requires sudo)..."
ssh -i ~/.ssh/id_ed25519_njalla deploy@185.193.126.13 << 'EOF'
cd /var/www/workforcedemocracyproject.org
sudo tar -xzf /tmp/wdp-js-fixes.tar.gz
sudo chown www-data:www-data js/main.js js/chat-clean.js
sudo chmod 644 js/main.js js/chat-clean.js
rm /tmp/wdp-js-fixes.tar.gz
echo "✅ JS files deployed successfully"
EOF

echo "🧹 Cleaning up local file..."
rm /tmp/wdp-js-fixes.tar.gz

echo "✅ JS file deployment complete!"
echo "Please verify the fixes by checking the browser console for any errors."