#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# 🚀 DEPLOYMENT v37.8.5 - Enhanced Community Support Modal
# ═══════════════════════════════════════════════════════════════════════════════
#
# ENHANCEMENT: Replace ProPublica link with detailed modal popup
#
# FEATURES:
# - Address as PRIMARY feature with tap-to-navigate (opens Maps app)
# - Website link if available
# - DuckDuckGo search button for contact info (privacy-respecting)
# - Mission statement / description
# - Annual revenue
# - Remove ProPublica link (not relevant for users seeking help)
#
# ═══════════════════════════════════════════════════════════════════════════════

echo "🚀 DEPLOYMENT v37.8.5 - Enhanced Community Support Modal"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""

# This deployment only updates FRONTEND files (no backend changes needed)
# The files will be deployed to Netlify, not the VPS

echo "📋 FILES TO UPDATE:"
echo "   • js/community-services.js - Modal popup functionality"
echo "   • css/community-services.css - Modal styling"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT READY"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "📤 NEXT STEPS:"
echo ""
echo "1. Download updated files from project:"
echo "   - js/community-services.js"
echo "   - css/community-services.css"
echo ""
echo "2. Deploy to Netlify:"
echo "   - Replace files in your local project"
echo "   - Commit changes to Git"
echo "   - Push to main branch"
echo "   - Netlify will auto-deploy"
echo ""
echo "   OR use Netlify manual deploy:"
echo "   - Drag & drop updated files to Netlify deploy interface"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🎯 WHAT THIS ADDS"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "When users click an organization:"
echo ""
echo "✅ Modal popup appears with:"
echo "   📍 ADDRESS (tap to navigate)"
echo "      - Mobile: Opens native Maps app (Apple Maps/Google Maps/Waze)"
echo "      - Desktop: Opens Google Maps in new tab"
echo ""
echo "   🌐 WEBSITE (if available)"
echo "      - Direct link to organization's website"
echo ""
echo "   📞 CONTACT INFORMATION"
echo "      - 🔍 Search DuckDuckGo button (privacy-respecting)"
echo "      - Opens search for: \"[Org Name] contact phone email\""
echo ""
echo "   📋 ABOUT"
echo "      - Mission statement / description"
echo ""
echo "   💰 ANNUAL REVENUE"
echo "      - Formatted revenue amount"
echo ""
echo "❌ REMOVED:"
echo "   • ProPublica nonprofit status link (not relevant for users)"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "🧪 TESTING AFTER DEPLOYMENT"
echo "═══════════════════════════════════════════════════════════════════════════════"
echo ""
echo "1. Go to homepage"
echo "2. Scroll to 'Find Community Support'"
echo "3. Enter ZIP: 10001"
echo "4. Click 'Search My State'"
echo "5. Click any organization card"
echo ""
echo "✅ EXPECTED:"
echo "   • Modal popup appears"
echo "   • Address is prominent with 'Open in Maps' button"
echo "   • Click address → opens Maps app (mobile) or Google Maps (desktop)"
echo "   • Website link appears if available"
echo "   • DuckDuckGo search button for contact info"
echo "   • Organization description shown"
echo "   • No ProPublica link"
echo ""
echo "📱 MOBILE TEST:"
echo "   • Tap address → should offer to open in Apple Maps/Google Maps/Waze"
echo "   • Tap DuckDuckGo button → opens DuckDuckGo search in new tab"
echo ""
echo "💻 DESKTOP TEST:"
echo "   • Click address → opens Google Maps in new tab with directions"
echo "   • Click website → opens org website in new tab"
echo ""
echo "═══════════════════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT GUIDE COMPLETE"
echo "═══════════════════════════════════════════════════════════════════════════════"
