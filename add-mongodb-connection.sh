#!/bin/bash

################################################################################
# Add MongoDB Connection to server.js
# Version: v37.11.4-PERSONALIZATION
# Date: January 17, 2025
################################################################################

echo "════════════════════════════════════════════════════════════════════════"
echo "🔧 ADDING MONGODB CONNECTION TO SERVER.JS"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Backup current server.js
echo "📦 Creating backup of server.js..."
cp /var/www/workforce-democracy/backend/server.js /var/www/workforce-democracy/backend/server.js.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# Create a temporary file with the MongoDB connection code
cat > /tmp/mongodb-connection.txt << 'EOF'

// =============================================================================
// MONGODB CONNECTION (v37.11.4-PERSONALIZATION)
// =============================================================================
const mongoose = require('mongoose');

// MongoDB connection string (localhost, default port)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/workforce_democracy';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('   Database: workforce_democracy');
  console.log('   Host: localhost:27017');
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('⚠️  Personalization features will not work without MongoDB');
});

// MongoDB connection event handlers
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

EOF

# Find the line number where PostgreSQL pool ends (around line 80)
# We'll insert MongoDB connection after the PostgreSQL pool configuration

echo "📝 Adding MongoDB connection to server.js..."

# Use awk to insert the MongoDB connection code after the PostgreSQL pool
awk '
/^const pool = new Pool\(\{/ {
    in_pool = 1
}
in_pool && /^\}\);/ {
    print
    system("cat /tmp/mongodb-connection.txt")
    in_pool = 0
    next
}
{ print }
' /var/www/workforce-democracy/backend/server.js > /var/www/workforce-democracy/backend/server.js.new

# Replace the original with the new version
mv /var/www/workforce-democracy/backend/server.js.new /var/www/workforce-democracy/backend/server.js

# Clean up temp file
rm /tmp/mongodb-connection.txt

echo "✅ MongoDB connection code added"
echo ""

# Verify the change was made
echo "📊 Verifying MongoDB connection code..."
if grep -q "mongoose.connect" /var/www/workforce-democracy/backend/server.js; then
    echo "✅ MongoDB connection code found in server.js"
else
    echo "❌ ERROR: MongoDB connection code not added!"
    echo "   Restoring backup..."
    mv /var/www/workforce-democracy/backend/server.js.backup-* /var/www/workforce-democracy/backend/server.js
    exit 1
fi
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "🔄 RESTARTING BACKEND"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Restart PM2 backend
echo "🔄 Restarting PM2 backend process..."
/opt/nodejs/bin/pm2 restart backend

# Wait for initialization
echo "⏳ Waiting for backend to initialize (5 seconds)..."
sleep 5

# Check logs
echo ""
echo "📋 Backend Logs (checking for MongoDB connection):"
/opt/nodejs/bin/pm2 logs backend --lines 40 --nostream

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "✅ MONGODB CONNECTION ADDED"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "🔍 Look for this in the logs above:"
echo "   ✅ MongoDB connected successfully"
echo "   Database: workforce_democracy"
echo "   Host: localhost:27017"
echo ""
echo "🧪 If you see the success message, test registration again:"
echo "   curl -X POST http://localhost:3001/api/personalization/register \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"username\":\"testuser123\",\"encrypted_data\":\"test\",\"iv\":\"test\",\"encryption_salt\":\"test\",\"recovery_hash\":\"test\"}'"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
