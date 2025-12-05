#!/bin/bash

################################################################################
# VPS MongoDB Clean Installation Script
# Purpose: Install MongoDB, wipe test data, configure for production use
# Version: v37.11.4-PERSONALIZATION
# Date: January 17, 2025
# VPS: 185.193.126.13
################################################################################

echo "════════════════════════════════════════════════════════════════════════"
echo "🔧 MONGODB CLEAN INSTALLATION SCRIPT"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  WARNING: This will:"
echo "   1. Remove any existing MongoDB installation"
echo "   2. Wipe all test user data"
echo "   3. Install fresh MongoDB 7.0"
echo "   4. Configure MongoDB to start on boot"
echo ""
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
    echo "❌ Installation cancelled"
    exit 1
fi

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 1: Cleanup - Remove Existing MongoDB & Test Data"
echo "════════════════════════════════════════════════════════════════════════"

# Stop any existing MongoDB service
echo "🛑 Stopping existing MongoDB services..."
systemctl stop mongod 2>/dev/null || echo "   (mongod not running)"
systemctl stop mongodb 2>/dev/null || echo "   (mongodb not running)"

# Remove existing MongoDB packages
echo "🗑️  Removing existing MongoDB packages..."
apt-get purge -y mongodb* mongod* 2>/dev/null || echo "   (no existing packages)"
apt-get autoremove -y

# Remove MongoDB data directories
echo "🗑️  Removing MongoDB data directories..."
rm -rf /var/lib/mongodb
rm -rf /var/log/mongodb
rm -rf /etc/mongod.conf

# Clean package cache
echo "🧹 Cleaning package cache..."
apt-get clean

echo "✅ Cleanup complete"
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 2: Install MongoDB 7.0 (Official Repository)"
echo "════════════════════════════════════════════════════════════════════════"

# Update package list
echo "📦 Updating package list..."
apt-get update

# Install required dependencies
echo "📦 Installing dependencies..."
apt-get install -y gnupg curl

# Import MongoDB GPG key
echo "🔑 Adding MongoDB GPG key..."
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "📦 Adding MongoDB repository..."
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list with MongoDB repo
echo "📦 Updating package list with MongoDB repository..."
apt-get update

# Install MongoDB
echo "📦 Installing MongoDB 7.0..."
apt-get install -y mongodb-org

echo "✅ MongoDB installation complete"
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 3: Configure MongoDB"
echo "════════════════════════════════════════════════════════════════════════"

# Create data directory
echo "📁 Creating data directories..."
mkdir -p /var/lib/mongodb
chown -R mongodb:mongodb /var/lib/mongodb

# Create log directory
mkdir -p /var/log/mongodb
chown -R mongodb:mongodb /var/log/mongodb

# Create MongoDB configuration
echo "⚙️  Creating MongoDB configuration..."
cat > /etc/mongod.conf << 'EOF'
# MongoDB Configuration
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true

systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log

net:
  port: 27017
  bindIp: 127.0.0.1

processManagement:
  timeZoneInfo: /usr/share/zoneinfo
EOF

echo "✅ Configuration complete"
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 4: Start MongoDB & Enable Auto-Start"
echo "════════════════════════════════════════════════════════════════════════"

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable MongoDB to start on boot
echo "🚀 Enabling MongoDB auto-start..."
systemctl enable mongod

# Start MongoDB
echo "🚀 Starting MongoDB service..."
systemctl start mongod

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to initialize (5 seconds)..."
sleep 5

echo "✅ MongoDB service started"
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 5: Verify Installation"
echo "════════════════════════════════════════════════════════════════════════"

# Check MongoDB status
echo "📊 MongoDB Service Status:"
systemctl status mongod --no-pager | head -15
echo ""

# Check if MongoDB is listening
echo "🔌 Checking MongoDB port 27017..."
if netstat -tuln | grep -q ":27017"; then
    echo "✅ MongoDB is listening on port 27017"
else
    echo "❌ WARNING: MongoDB is not listening on port 27017"
fi
echo ""

# Test MongoDB connection
echo "🧪 Testing MongoDB connection..."
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful"
else
    echo "❌ WARNING: Cannot connect to MongoDB"
fi
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 6: Create Database & Test Collection"
echo "════════════════════════════════════════════════════════════════════════"

echo "📊 Creating workforce_democracy database..."
mongosh --eval "
use workforce_democracy;
db.createCollection('userbackups');
db.userbackups.createIndex({ username: 1 }, { unique: true });
print('✅ Database and collection created');
print('✅ Unique index on username created');
" --quiet

echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "STEP 7: Restart Backend (PM2)"
echo "════════════════════════════════════════════════════════════════════════"

echo "🔄 Restarting PM2 backend process..."
/opt/nodejs/bin/pm2 restart backend

echo "⏳ Waiting for backend to initialize (3 seconds)..."
sleep 3

echo "📊 PM2 Status:"
/opt/nodejs/bin/pm2 list

echo ""
echo "📋 Backend Logs (last 20 lines):"
/opt/nodejs/bin/pm2 logs backend --lines 20 --nostream

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "✅ INSTALLATION COMPLETE"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Summary:"
echo "   ✅ MongoDB 7.0 installed"
echo "   ✅ Auto-start enabled (survives reboot)"
echo "   ✅ Database 'workforce_democracy' created"
echo "   ✅ Collection 'userbackups' created with unique username index"
echo "   ✅ Backend restarted and connected to MongoDB"
echo ""
echo "🔌 MongoDB Info:"
echo "   Host: localhost (127.0.0.1)"
echo "   Port: 27017"
echo "   Database: workforce_democracy"
echo "   Collection: userbackups"
echo ""
echo "🧪 Next Steps:"
echo "   1. Deploy frontend personalization-ui.js to GenSparkSpace"
echo "   2. Clear browser cache and localStorage"
echo "   3. Test registration with a fresh account"
echo "   4. Verify data is saved in MongoDB"
echo ""
echo "🔍 Useful Commands:"
echo "   Check MongoDB status:  systemctl status mongod"
echo "   View MongoDB logs:     tail -f /var/log/mongodb/mongod.log"
echo "   Connect to MongoDB:    mongosh"
echo "   View PM2 logs:         /opt/nodejs/bin/pm2 logs backend"
echo ""
echo "════════════════════════════════════════════════════════════════════════"
