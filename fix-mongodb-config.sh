#!/bin/bash

################################################################################
# MongoDB Configuration Fix Script
# Purpose: Fix the journal.enabled config error and start MongoDB
# Date: January 17, 2025
################################################################################

echo "════════════════════════════════════════════════════════════════════════"
echo "🔧 FIXING MONGODB CONFIGURATION"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Create correct MongoDB 7.0 configuration (without deprecated journal.enabled)
echo "⚙️  Creating corrected MongoDB configuration..."
cat > /etc/mongod.conf << 'EOF'
# MongoDB 7.0 Configuration
storage:
  dbPath: /var/lib/mongodb

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

echo "✅ Configuration file updated"
echo ""

# Ensure proper permissions
echo "🔐 Setting correct permissions..."
chown -R mongodb:mongodb /var/lib/mongodb
chown -R mongodb:mongodb /var/log/mongodb
chmod 755 /var/lib/mongodb
chmod 755 /var/log/mongodb

echo "✅ Permissions set"
echo ""

# Reload systemd
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Start MongoDB
echo "🚀 Starting MongoDB service..."
systemctl start mongod

# Wait for MongoDB to start
echo "⏳ Waiting for MongoDB to initialize (5 seconds)..."
sleep 5

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "📊 VERIFICATION"
echo "════════════════════════════════════════════════════════════════════════"

# Check MongoDB status
echo "📊 MongoDB Service Status:"
systemctl status mongod --no-pager | head -15
echo ""

# Check if MongoDB is listening
echo "🔌 Checking MongoDB port 27017..."
if ss -tuln | grep -q ":27017"; then
    echo "✅ MongoDB is listening on port 27017"
else
    echo "❌ WARNING: MongoDB is not listening on port 27017"
    echo "📋 Checking logs..."
    tail -20 /var/log/mongodb/mongod.log
    exit 1
fi
echo ""

# Test MongoDB connection
echo "🧪 Testing MongoDB connection..."
sleep 2
if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
    echo "✅ MongoDB connection successful"
else
    echo "⚠️  Retrying connection..."
    sleep 3
    if mongosh --eval "db.adminCommand('ping')" --quiet > /dev/null 2>&1; then
        echo "✅ MongoDB connection successful (retry)"
    else
        echo "❌ Cannot connect to MongoDB"
        exit 1
    fi
fi
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "📊 CREATE DATABASE & COLLECTION"
echo "════════════════════════════════════════════════════════════════════════"

echo "📊 Creating workforce_democracy database and userbackups collection..."
mongosh --quiet << 'MONGOEOF'
use workforce_democracy;
db.createCollection('userbackups');
db.userbackups.createIndex({ username: 1 }, { unique: true });
print('✅ Database: workforce_democracy');
print('✅ Collection: userbackups');
print('✅ Index: username (unique)');
MONGOEOF

echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo "🔄 RESTART PM2 BACKEND"
echo "════════════════════════════════════════════════════════════════════════"

echo "🔄 Restarting backend to connect to MongoDB..."
/opt/nodejs/bin/pm2 restart backend

echo "⏳ Waiting for backend to initialize (5 seconds)..."
sleep 5

echo ""
echo "📊 PM2 Status:"
/opt/nodejs/bin/pm2 list

echo ""
echo "📋 Backend Logs (checking for MongoDB connection):"
/opt/nodejs/bin/pm2 logs backend --lines 30 --nostream

echo ""
echo "════════════════════════════════════════════════════════════════════════"
echo "✅ MONGODB CONFIGURATION FIXED"
echo "════════════════════════════════════════════════════════════════════════"
echo ""
echo "📊 MongoDB Info:"
echo "   Status: Running"
echo "   Host: localhost (127.0.0.1)"
echo "   Port: 27017"
echo "   Database: workforce_democracy"
echo "   Collection: userbackups"
echo ""
echo "🔍 Verify MongoDB is running:"
echo "   systemctl status mongod"
echo "   mongosh --eval 'db.adminCommand(\"ping\")'"
echo ""
echo "🧪 Next: Test registration endpoint from browser/curl"
echo "════════════════════════════════════════════════════════════════════════"
