#!/bin/bash
# =============================================================================
# API Keys Diagnostic Script
# Checks which API keys are configured in your .env file
# =============================================================================

echo "🔍 WORKFORCE DEMOCRACY PROJECT - API KEY DIAGNOSTIC"
echo "===================================================="
echo ""

# Check if we're on the VPS
if [ ! -f "/var/www/workforce-democracy/.env" ]; then
    echo "❌ ERROR: .env file not found at /var/www/workforce-democracy/.env"
    echo ""
    echo "Are you on the VPS? Run this command on the server:"
    echo "  ssh root@185.193.126.13"
    echo "  cd /var/www/workforce-democracy"
    echo "  bash ~/check-api-keys.sh"
    exit 1
fi

cd /var/www/workforce-democracy

echo "📍 Location: $(pwd)"
echo "📄 Checking .env file..."
echo ""

# Function to check if API key is configured
check_key() {
    local key_name=$1
    local key_value=$(grep "^${key_name}=" .env 2>/dev/null | cut -d'=' -f2)
    
    if [ -z "$key_value" ]; then
        echo "❌ $key_name: NOT SET"
        return 1
    elif [ "$key_value" = "your_${key_name,,}_here" ] || [ "$key_value" = "your_groq_api_key_here" ]; then
        echo "⚠️  $key_name: PLACEHOLDER (not configured)"
        return 1
    else
        # Show first 10 chars of key
        local preview="${key_value:0:10}..."
        echo "✅ $key_name: CONFIGURED ($preview)"
        return 0
    fi
}

echo "CRITICAL APIs (Required for Core Features):"
echo "-------------------------------------------"
check_key "GROQ_API_KEY"
echo ""

echo "RECOMMENDED APIs (Enhanced Functionality):"
echo "------------------------------------------"
check_key "CONGRESS_API_KEY"
check_key "OPENSTATES_API_KEY"
check_key "VOTESMART_API_KEY"
echo ""

echo "OPTIONAL APIs (Extra Features):"
echo "-------------------------------"
check_key "COURT_LISTENER_API_KEY"
check_key "OPENAUSTRALIA_API_KEY"
check_key "OPENSECRETS_API_KEY"
echo ""

echo "DATABASE Configuration:"
echo "----------------------"
check_key "DB_USER"
check_key "DB_PASSWORD"
check_key "DB_NAME"
echo ""

echo "===================================================="
echo ""
echo "📋 SUMMARY:"
echo ""

# Count configured vs missing
total=0
configured=0

for key in GROQ_API_KEY CONGRESS_API_KEY OPENSTATES_API_KEY VOTESMART_API_KEY COURT_LISTENER_API_KEY OPENAUSTRALIA_API_KEY OPENSECRETS_API_KEY; do
    total=$((total + 1))
    if check_key "$key" > /dev/null 2>&1; then
        configured=$((configured + 1))
    fi
done

echo "Total APIs Checked: $total"
echo "Configured: $configured"
echo "Missing: $((total - configured))"
echo ""

if [ $configured -eq 0 ]; then
    echo "⚠️  WARNING: No API keys configured!"
    echo "   Backend functionality will be severely limited."
elif [ $configured -lt 3 ]; then
    echo "⚠️  NOTICE: Limited API keys configured."
    echo "   Some features may not work."
else
    echo "✅ Good! Most APIs are configured."
fi

echo ""
echo "===================================================="
echo ""
echo "📖 For detailed API setup instructions, see:"
echo "   API-KEYS-COMPLETE-REFERENCE.md"
echo ""
echo "🔧 To add missing API keys:"
echo "   nano .env"
echo "   # Add keys, save, then restart:"
echo "   pm2 restart backend"
echo ""
