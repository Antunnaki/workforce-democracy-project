#!/bin/bash
# Script to install and start MongoDB

echo "📥 Installing MongoDB..."

# Update package lists
apt update

# Install MongoDB
apt install -y mongodb

# Enable and start MongoDB service
systemctl enable mongodb
systemctl start mongodb

# Check MongoDB status
echo "🔍 Checking MongoDB status..."
systemctl status mongodb --no-pager

echo "✅ MongoDB installation and startup completed"