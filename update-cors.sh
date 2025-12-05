#!/bin/bash

# V36.11.8 - Update CORS in server.js to allow Netlify URLs

echo "🔧 Updating CORS configuration for Netlify..."
echo ""

cd /var/www/workforce-backend

# Create backup
cp server.js server.js.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"

# Update the CORS section
# We need to add the Netlify check after the allowedOrigins array

# Find the line with allowedOrigins closing bracket and add the Netlify check
sed -i "/        ];/a\\
        \\
        // V36.11.8: Allow ANY Netlify deploy preview URL\\
        const isNetlify = origin && (\\
            origin.includes('.netlify.app') ||\\
            origin.includes('workforcedemocracyproject.org')\\
        );" server.js

# Update the condition to include isNetlify
sed -i "s/if (allowedOrigins.indexOf(origin) !== -1) {/if (allowedOrigins.indexOf(origin) !== -1 || isNetlify) {/" server.js

echo "✅ CORS configuration updated"
echo ""
echo "🔄 Restarting PM2..."
pm2 restart workforce-backend

echo ""
echo "✅ Backend restarted!"
echo ""
echo "📊 Checking logs for CORS messages..."
sleep 2
pm2 logs workforce-backend --lines 10 --nostream

echo ""
echo "=================================================="
echo "✅ Update Complete!"
echo ""
echo "The backend will now accept requests from:"
echo "  - Any *.netlify.app URL"
echo "  - workforcedemocracyproject.org"
echo ""
echo "To monitor logs:"
echo "  pm2 logs workforce-backend"
echo "=================================================="
