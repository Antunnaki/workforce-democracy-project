#!/bin/bash

#############################################################
# V37.16.2 DEPLOYMENT - RUN THIS DIRECTLY ON VPS
# Location: /var/www/workforce-democracy/
#############################################################

echo "🚀 Starting V37.16.2 Deployment..."

# Navigate to backend directory
cd /var/www/workforce-democracy/backend

echo "📦 Stopping PM2 backend process..."
/opt/nodejs/bin/pm2 stop backend

echo "🗑️ Deleting PM2 backend process (clears module cache)..."
/opt/nodejs/bin/pm2 delete backend

echo "🧹 Flushing PM2 logs..."
/opt/nodejs/bin/pm2 flush

echo "🚀 Starting backend with NODE_ENV=production..."
NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1

echo "📊 PM2 Status:"
/opt/nodejs/bin/pm2 status

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test with:"
echo "   curl \"https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061\" | jq '.location'"
echo ""
