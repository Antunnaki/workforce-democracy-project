#!/usr/bin/env bash
# Workforce Democracy Project — Deployment Verification Script
# Purpose: Verify that both backend and frontend deployments are functioning correctly
# Author: AI Assistant
# Date: 2025-12-14

set -euo pipefail

# Default values
DOMAIN=${DOMAIN:-"workforcedemocracyproject.org"}
API_DOMAIN=${API_DOMAIN:-"api.workforcedemocracyproject.org"}
VERIFY_FRONTEND=${VERIFY_FRONTEND:-1}
VERIFY_BACKEND=${VERIFY_BACKEND:-1}

echo "🔍 Verifying deployment for $DOMAIN"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    if [ "$1" = "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC} $2"
    elif [ "$1" = "FAIL" ]; then
        echo -e "${RED}✗ FAIL${NC} $2"
    else
        echo -e "${YELLOW}⚠ WARN${NC} $2"
    fi
}

if [ "$VERIFY_FRONTEND" = "1" ]; then
    echo "🌐 Frontend Verification"
    echo "======================"
    
    # Check apex domain
    if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN/" | grep -q "200"; then
        print_status "PASS" "Apex domain loads correctly"
    else
        print_status "FAIL" "Apex domain failed to load"
    fi
    
    # Check www domain
    if curl -s -o /dev/null -w "%{http_code}" "https://www.$DOMAIN/" | grep -q "200"; then
        print_status "PASS" "WWW domain loads correctly"
    else
        print_status "FAIL" "WWW domain failed to load"
    fi
    
    # Check JavaScript files
    JS_FILES=("js/personalization-ui.js" "js/personalization-system.js")
    for js_file in "${JS_FILES[@]}"; do
        response=$(curl -s -I "https://$DOMAIN/$js_file")
        if echo "$response" | grep -qi "200"; then
            if echo "$response" | grep -qi "application/javascript"; then
                print_status "PASS" "$js_file loads with correct MIME type"
            else
                print_status "WARN" "$js_file loads but has unexpected MIME type"
            fi
        else
            print_status "FAIL" "$js_file failed to load"
        fi
    done
    
    # Check Content Security Policy headers
    csp_headers=$(curl -s -I "https://$DOMAIN/" | grep -i "content-security-policy" || true)
    if [ -n "$csp_headers" ]; then
        print_status "PASS" "Content Security Policy headers present"
    else
        print_status "WARN" "Content Security Policy headers missing"
    fi
    
    # Check Strict Transport Security
    hsts_headers=$(curl -s -I "https://$DOMAIN/" | grep -i "strict-transport-security" || true)
    if [ -n "$hsts_headers" ]; then
        print_status "PASS" "Strict Transport Security headers present"
    else
        print_status "WARN" "Strict Transport Security headers missing"
    fi
fi

if [ "$VERIFY_BACKEND" = "1" ]; then
    echo
    echo "⚙️  Backend Verification"
    echo "======================"
    
    # Check API health endpoint
    if curl -s -o /dev/null -w "%{http_code}" "https://$API_DOMAIN/health" | grep -q "200"; then
        print_status "PASS" "API health endpoint responds correctly"
    else
        print_status "FAIL" "API health endpoint failed"
    fi
    
    # Check API version endpoint
    version_response=$(curl -s "https://$API_DOMAIN/version" || true)
    if [ -n "$version_response" ]; then
        print_status "PASS" "API version endpoint responds"
        echo "   Version info: $version_response"
    else
        print_status "WARN" "API version endpoint has no response"
    fi
    
    # Check CORS headers for register endpoint
    cors_preflight=$(curl -s -I -X OPTIONS \
        -H "Origin: https://$DOMAIN" \
        -H "Access-Control-Request-Method: POST" \
        "https://$API_DOMAIN/api/personalization/register" || true)
        
    if echo "$cors_preflight" | grep -qi "access-control-allow-origin.*$DOMAIN"; then
        print_status "PASS" "CORS preflight passes for register endpoint"
    else
        print_status "WARN" "CORS preflight may have issues for register endpoint"
    fi
fi

echo
echo "✅ Verification complete"
echo "💡 Tip: For detailed debugging, use browser developer tools and check server logs"