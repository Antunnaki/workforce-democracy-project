#!/bin/bash
# ==============================================================================
# CORS FIX FOR UNIVERSAL CHAT - v37.3.1
# ==============================================================================
# Issue: Origin http://185.193.126.13 is blocked by CORS policy
# Solution: Add origin to Nginx CORS whitelist
# ==============================================================================

echo "🔧 Fixing CORS to allow http://185.193.126.13..."

# Backup current nginx config
sudo cp /etc/nginx/sites-enabled/workforce-democracy /etc/nginx/sites-enabled/workforce-democracy.backup-$(date +%Y%m%d-%H%M%S)

# Check if CORS headers exist in nginx config
if sudo grep -q "Access-Control-Allow-Origin" /etc/nginx/sites-enabled/workforce-democracy; then
    echo "✅ Found existing CORS configuration"
    
    # Show current CORS config
    echo ""
    echo "Current CORS configuration:"
    sudo grep -A 5 "Access-Control-Allow-Origin" /etc/nginx/sites-enabled/workforce-democracy
    
    echo ""
    echo "📝 YOU NEED TO MANUALLY ADD THIS LINE TO THE NGINX CONFIG:"
    echo ""
    echo "Edit the nginx config file:"
    echo "  sudo nano /etc/nginx/sites-enabled/workforce-democracy"
    echo ""
    echo "Find the section with 'Access-Control-Allow-Origin' headers"
    echo "Add this line to the list of allowed origins:"
    echo ""
    echo "  add_header Access-Control-Allow-Origin 'http://185.193.126.13' always;"
    echo ""
    echo "OR if using a conditional CORS setup, add '185.193.126.13' to the allowed list"
    echo ""
else
    echo "⚠️  No CORS configuration found in Nginx!"
    echo "This is unusual since server.js says CORS is handled by Nginx."
    echo ""
    echo "Please check:"
    echo "1. /etc/nginx/sites-enabled/workforce-democracy"
    echo "2. /etc/nginx/nginx.conf"
    echo "3. /etc/nginx/sites-available/workforce-democracy"
fi

echo ""
echo "After editing the nginx config, restart nginx:"
echo "  sudo nginx -t  # Test configuration"
echo "  sudo systemctl reload nginx  # Reload if test passes"
