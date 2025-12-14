#!/bin/bash
# Main Website Deployment Script
# Domain: workforcedemocracyproject.org
# Date: December 13, 2025

echo "🌐 Main Website Deployment for workforcedemocracyproject.org"
echo "=========================================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Please run as root"
  exit 1
fi

# Create website directory if it doesn't exist
echo "📁 Creating website directory..."
mkdir -p /var/www/workforcedemocracyproject.org

# Copy Nginx configuration
echo "🔧 Installing Nginx configuration..."
cp ops/TEMPLATES/nginx_main_website.conf /etc/nginx/sites-available/workforcedemocracyproject.org

# Enable site by creating symlink
echo "🔗 Enabling site..."
ln -sf /etc/nginx/sites-available/workforcedemocracyproject.org /etc/nginx/sites-enabled/

# Test Nginx configuration
echo "🔍 Testing Nginx configuration..."
nginx -t
if [ $? -ne 0 ]; then
  echo "❌ Nginx configuration test failed"
  exit 1
fi

# Reload Nginx
echo "🔄 Reloading Nginx..."
systemctl reload nginx

# Check if SSL certificate already exists
echo "🔐 Checking SSL certificate..."
if [ ! -f /etc/letsencrypt/live/workforcedemocracyproject.org/fullchain.pem ]; then
  echo "⚠️  SSL certificate not found. Obtaining new certificate..."
  certbot --nginx -d workforcedemocracyproject.org -d www.workforcedemocracyproject.org
else
  echo "✅ SSL certificate already exists"
fi

# Verify that both domains are covered by certificate
echo "🔍 Verifying certificate covers both domains..."
openssl x509 -in /etc/letsencrypt/live/workforcedemocracyproject.org/fullchain.pem -text -noout | grep "Subject Alternative Name" -A 1 | grep -q "workforcedemocracyproject.org" && \
openssl x509 -in /etc/letsencrypt/live/workforcedemocracyproject.org/fullchain.pem -text -noout | grep "Subject Alternative Name" -A 1 | grep -q "www.workforcedemocracyproject.org"

if [ $? -eq 0 ]; then
  echo "✅ Certificate covers both domains"
else
  echo "⚠️  Certificate may not cover both domains. Renewing..."
  certbot --nginx -d workforcedemocracyproject.org -d www.workforcedemocracyproject.org --force-renewal
fi

# Final Nginx reload to apply SSL
echo "🔄 Reloading Nginx with SSL configuration..."
systemctl reload nginx

echo ""
echo "========================================================"
echo "✅ Main website deployment complete!"
echo ""
echo "Next steps:"
echo "1. Deploy frontend files to /var/www/workforcedemocracyproject.org/"
echo "2. Test website access at https://workforcedemocracyproject.org"
echo "3. Verify SSL certificate with: openssl s_client -connect workforcedemocracyproject.org:443 -servername workforcedemocracyproject.org"
echo ""