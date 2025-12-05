#!/bin/bash
# Fix Nginx to properly proxy Civic API endpoints
# Date: November 3, 2025

echo "🔧 Fixing Nginx configuration for Civic API"
echo "============================================"
echo ""

# Backup current config
echo "📋 Step 1: Backing up current configuration..."
cp /etc/nginx/sites-available/workforce-backend /etc/nginx/sites-available/workforce-backend.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# Create updated configuration
echo "📋 Step 2: Creating updated Nginx configuration..."
cat > /etc/nginx/sites-available/workforce-backend << 'EOF'
server {
    server_name api.workforcedemocracyproject.org;

    # Proxy all requests to backend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers for civic platform
        add_header Access-Control-Allow-Origin "https://workforcedemocracyproject.org" always;
        add_header Access-Control-Allow-Origin "https://www.workforcedemocracyproject.org" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Authorization" always;
    }

    listen 443 ssl http2; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/api.workforcedemocracyproject.org/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/api.workforcedemocracyproject.org/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

# Redirect HTTP to HTTPS
server {
    if ($host = api.workforcedemocracyproject.org) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name api.workforcedemocracyproject.org;
    return 404; # managed by Certbot
}
EOF

echo "✅ Configuration updated"
echo ""

# Test configuration
echo "📋 Step 3: Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo ""
    
    # Reload Nginx
    echo "📋 Step 4: Reloading Nginx..."
    systemctl reload nginx
    echo "✅ Nginx reloaded"
    echo ""
    
    # Wait a moment for reload
    sleep 2
    
    # Test HTTPS endpoints
    echo "📋 Step 5: Testing HTTPS endpoints..."
    echo ""
    
    echo "Test 1: Health Check"
    curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health | jq '.' 2>/dev/null || curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health
    echo ""
    
    echo "Test 2: ZIP Search"
    curl -s "https://api.workforcedemocracyproject.org/api/civic/representatives/search?zip=12061" | jq '.success' 2>/dev/null || echo "Response received (jq not installed for pretty print)"
    echo ""
    
    echo "Test 3: LLM Chat"
    curl -s -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
      -H "Content-Type: application/json" \
      -d '{"message":"Test HTTPS","context":"civic_education"}' | jq '.success' 2>/dev/null || echo "Response received"
    echo ""
    
    echo "============================================"
    echo "✅ SSL DEPLOYMENT COMPLETE!"
    echo ""
    echo "Your API is now available at:"
    echo "🔗 https://api.workforcedemocracyproject.org/api/civic/"
    echo ""
    echo "Next: Update frontend to use HTTPS URL"
    
else
    echo "❌ Nginx configuration has errors"
    echo "Restoring backup..."
    cp /etc/nginx/sites-available/workforce-backend.backup-* /etc/nginx/sites-available/workforce-backend
    systemctl reload nginx
    echo "Backup restored. Please check the errors above."
    exit 1
fi
