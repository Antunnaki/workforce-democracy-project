#!/bin/bash
# Complete SSL Deployment Script
# Domain: api.workforcedemocracyproject.org
# Date: November 3, 2025

echo "🔒 SSL Certificate Deployment for Civic Platform v37.0.0"
echo "=========================================================="
echo ""

# Show current Nginx configs
echo "📋 Current Nginx configurations:"
echo ""
echo "=== workforce-backend config ==="
cat /etc/nginx/sites-available/workforce-backend
echo ""
echo "=== workforce-democracy config ==="
cat /etc/nginx/sites-available/workforce-democracy
echo ""
echo "=== Enabled sites ==="
ls -la /etc/nginx/sites-enabled/
echo ""

# Check if SSL config already exists
echo "📋 Checking for existing SSL configuration..."
if [ -f /etc/nginx/sites-available/api.workforcedemocracyproject.org ]; then
    echo "⚠️  SSL config already exists"
    cat /etc/nginx/sites-available/api.workforcedemocracyproject.org
else
    echo "✅ No SSL config found - ready to create new one"
fi
echo ""

echo "========================================================"
echo "✅ Diagnostic complete!"
echo ""
echo "Next: I'll create the SSL configuration based on your existing setup."
