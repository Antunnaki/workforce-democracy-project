#!/bin/bash
# 🚀 Deploy Setup Wizard Fix to VPS
# Version: v37.11.4-PERSONALIZATION
# Date: November 16, 2025

echo "═══════════════════════════════════════════════════"
echo "🚀 Deploying Setup Wizard ID Fixes to VPS"
echo "═══════════════════════════════════════════════════"
echo ""

# 1. Backup current index.html
echo "📦 Step 1: Creating backup..."
cp /var/www/html/index.html /var/www/html/index.html.backup-$(date +%Y%m%d-%H%M%S)
echo "✅ Backup created"
echo ""

# 2. Fix Setup Wizard Container IDs
echo "🔧 Step 2: Fixing Setup Wizard Container IDs..."

# Fix: setupWizardModal → personalization-overlay
sed -i 's|<div id="setupWizardModal"|<div id="personalization-overlay"|g' /var/www/html/index.html

# Add missing setup-wizard ID to inner div
sed -i 's|<div class="personalization-modal">|<div class="personalization-modal">\n            <div id="setup-wizard" class="setup-wizard">|g' /var/www/html/index.html

echo "✅ Container IDs fixed"
echo ""

# 3. Fix Form Field IDs
echo "🔧 Step 3: Fixing Form Field IDs..."

sed -i 's|id="wizardUsername"|id="wizard-username"|g' /var/www/html/index.html
sed -i 's|id="wizardPassword"|id="wizard-password"|g' /var/www/html/index.html
sed -i 's|id="wizardPasswordConfirm"|id="wizard-password-confirm"|g' /var/www/html/index.html
sed -i 's|id="wizardStreet"|id="wizard-street"|g' /var/www/html/index.html
sed -i 's|id="wizardCity"|id="wizard-city"|g' /var/www/html/index.html
sed -i 's|id="wizardState"|id="wizard-state"|g' /var/www/html/index.html
sed -i 's|id="wizardZip"|id="wizard-zip"|g' /var/www/html/index.html
sed -i 's|id="wizardLanguage"|id="wizard-language"|g' /var/www/html/index.html

echo "✅ Form field IDs fixed"
echo ""

# 4. Fix Login Modal IDs
echo "🔧 Step 4: Fixing Login Modal IDs..."

sed -i 's|<div id="loginModal"|<div id="login-modal"|g' /var/www/html/index.html
sed -i 's|id="loginUsername"|id="login-username"|g' /var/www/html/index.html
sed -i 's|id="loginPassword"|id="login-password"|g' /var/www/html/index.html
sed -i 's|id="loginError"|id="login-error"|g' /var/www/html/index.html

echo "✅ Login modal IDs fixed"
echo ""

# 5. Verify changes
echo "🔍 Step 5: Verifying deployment..."

if grep -q 'id="personalization-overlay"' /var/www/html/index.html; then
    echo "✅ personalization-overlay: FOUND"
else
    echo "❌ personalization-overlay: NOT FOUND"
fi

if grep -q 'id="setup-wizard"' /var/www/html/index.html; then
    echo "✅ setup-wizard: FOUND"
else
    echo "❌ setup-wizard: NOT FOUND"
fi

if grep -q 'id="wizard-username"' /var/www/html/index.html; then
    echo "✅ wizard-username: FOUND"
else
    echo "❌ wizard-username: NOT FOUND"
fi

if grep -q 'id="login-modal"' /var/www/html/index.html; then
    echo "✅ login-modal: FOUND"
else
    echo "❌ login-modal: NOT FOUND"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETE!"
echo "═══════════════════════════════════════════════════"
echo ""
echo "📋 Next Steps:"
echo "1. Clear browser cache (Ctrl+Shift+Delete)"
echo "2. Visit: https://workforcedemocracyproject.org"
echo "3. Click 'Get Started' - wizard should open!"
echo ""
echo "🔍 Test in browser console:"
echo "   typeof openSetupWizard"
echo "   document.getElementById('personalization-overlay')"
echo "   document.getElementById('setup-wizard')"
echo ""
