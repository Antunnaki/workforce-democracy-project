#!/bin/bash
# Diagnostic Script for Cache Issues
# Workforce Democracy Chat

echo "🔍 CACHE DIAGNOSTIC REPORT"
echo "=========================="
echo ""

# Check 1: JavaScript files
echo "1️⃣ JavaScript Files in /js/:"
echo "----------------------------"
ls -lh /var/www/workforce-democracy/js/universal-chat*.js 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ No universal-chat*.js files found"
else
    echo "✅ Files exist"
fi
echo ""

# Check 2: index.html references
echo "2️⃣ index.html Script References:"
echo "--------------------------------"
grep -n "script src" /var/www/workforce-democracy/index.html | grep -i "chat\|universal"
echo ""

# Check 3: Service Worker
echo "3️⃣ Service Worker Check:"
echo "------------------------"
if [ -f /var/www/workforce-democracy/sw.js ]; then
    echo "⚠️  Service worker FOUND: /var/www/workforce-democracy/sw.js"
    echo "   This could be causing aggressive caching"
    echo ""
    echo "   Service worker cache version:"
    grep -i "cache.*version\|cache.*name" /var/www/workforce-democracy/sw.js | head -5
else
    echo "✅ No service worker found (good for cache issues)"
fi
echo ""

# Check 4: .htaccess caching rules
echo "4️⃣ .htaccess Caching Rules:"
echo "---------------------------"
if [ -f /var/www/workforce-democracy/.htaccess ]; then
    echo "📄 .htaccess exists, checking for cache-related rules:"
    grep -i "cache\|expires\|etag" /var/www/workforce-democracy/.htaccess | head -10
    if [ $? -ne 0 ]; then
        echo "   No explicit cache rules found"
    fi
else
    echo "   No .htaccess file found"
fi
echo ""

# Check 5: Nginx config (if applicable)
echo "5️⃣ Nginx Configuration:"
echo "-----------------------"
if [ -f /etc/nginx/sites-available/workforcedemocracy.org ]; then
    echo "📄 Nginx config exists, checking for cache-related rules:"
    grep -i "cache\|expires" /etc/nginx/sites-available/workforcedemocracy.org | head -10
    if [ $? -ne 0 ]; then
        echo "   No explicit cache rules found"
    fi
else
    echo "   No Nginx config found (may be using Apache)"
fi
echo ""

# Check 6: Backend status
echo "6️⃣ Backend API Status:"
echo "----------------------"
BACKEND_PORT=$(ps aux | grep "node.*server.js\|node.*app.js" | grep -v grep | head -1)
if [ -n "$BACKEND_PORT" ]; then
    echo "✅ Backend process is running:"
    ps aux | grep "node.*server.js\|node.*app.js" | grep -v grep | head -3
    echo ""
    
    # Test a recent job
    echo "   Testing backend API..."
    HEALTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health 2>/dev/null)
    if [ "$HEALTH_TEST" = "200" ] || [ "$HEALTH_TEST" = "404" ]; then
        echo "   ✅ Backend is responding (HTTP $HEALTH_TEST)"
    else
        echo "   ⚠️  Backend response: HTTP $HEALTH_TEST"
    fi
else
    echo "❌ Backend process not found"
fi
echo ""

# Check 7: File permissions
echo "7️⃣ File Permissions:"
echo "--------------------"
ls -la /var/www/workforce-democracy/index.html 2>/dev/null | tail -1
ls -la /var/www/workforce-democracy/js/universal-chat*.js 2>/dev/null | tail -3
echo ""

# Check 8: Recent modifications
echo "8️⃣ Recent File Modifications:"
echo "-----------------------------"
echo "Last modified (index.html):"
stat -c "%y %n" /var/www/workforce-democracy/index.html 2>/dev/null || stat -f "%Sm %N" /var/www/workforce-democracy/index.html 2>/dev/null
echo ""
echo "Last modified (JS files):"
stat -c "%y %n" /var/www/workforce-democracy/js/universal-chat*.js 2>/dev/null || stat -f "%Sm %N" /var/www/workforce-democracy/js/universal-chat*.js 2>/dev/null
echo ""

# Summary
echo "=========================="
echo "📊 DIAGNOSTIC SUMMARY"
echo "=========================="
echo ""
echo "🎯 Common Cache Issues:"
echo "  1. Service worker caching old JS file"
echo "  2. CDN/Cloudflare not purged"
echo "  3. Browser cache not fully cleared"
echo "  4. Wrong file referenced in index.html"
echo ""
echo "💡 Recommended Actions:"
echo "  1. Run quick-fix.sh to rename JS file"
echo "  2. If service worker exists, increment its cache version"
echo "  3. If using Cloudflare, purge cache"
echo "  4. Test in incognito mode"
echo ""
