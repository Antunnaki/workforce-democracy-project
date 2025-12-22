#!/bin/bash
# Setup script for frontend deployment helper and sudoers configuration
# This script must be run as root

echo "🔧 Setting up frontend deployment helper and sudoers configuration..."

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Copy sudoers file
echo "📋 Installing sudoers configuration..."
cp /tmp/sudoers-wdp-frontend-deploy /etc/sudoers.d/
chown root:root /etc/sudoers.d/sudoers-wdp-frontend-deploy
chmod 0440 /etc/sudoers.d/sudoers-wdp-frontend-deploy

# Validate sudoers configuration
echo "✅ Validating sudoers configuration..."
visudo -cf /etc/sudoers
if [ $? -ne 0 ]; then
    echo "❌ Error in main sudoers file"
    exit 1
fi

visudo -cf /etc/sudoers.d/sudoers-wdp-frontend-deploy
if [ $? -ne 0 ]; then
    echo "❌ Error in frontend deploy sudoers file"
    exit 1
fi

# Install helper script
echo "🔧 Installing helper script..."
install -o root -g root -m 0750 /tmp/wdp-frontend-deploy-helper.sh /usr/local/bin/wdp-frontend-deploy-helper.sh

# Create log file
echo "📝 Creating log file..."
touch /var/log/wdp-frontend-deploy.log
chown deploy:adm /var/log/wdp-frontend-deploy.log
chmod 644 /var/log/wdp-frontend-deploy.log

# Create backup directory
echo "📁 Creating backup directory..."
mkdir -p /var/backups
chown deploy:www-data /var/backups
chmod 755 /var/backups

# Test the helper
echo "🧪 Testing helper script..."
sudo -u deploy /usr/local/bin/wdp-frontend-deploy-helper.sh --help || true

echo "✅ Frontend deployment helper setup complete!"
echo "You can now run the frontend deployment script from your local machine."