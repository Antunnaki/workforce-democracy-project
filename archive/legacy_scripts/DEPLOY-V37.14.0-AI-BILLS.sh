#!/bin/bash
###############################################################################
# V37.14.0 AI BILLS ANALYSIS DEPLOYMENT
# Date: November 21, 2025
# 
# What's New:
# - AI-powered bill analysis (Groq + Llama 3.3-70b)
# - Plain-language summaries (8th-grade reading level)
# - Real impact ratings (1-5 stars with justifications)
# - Interactive AI chat about bills
# - Smart 30-day caching (bills don't change often)
# - "Read Full Bill" links
# - NO MORE hardcoded 3-star ratings!
#
# Components:
# - Backend: New route file (ai-bills-routes.js) + server.js update
# - Frontend: Updated bills-section.js + bills-section.css
###############################################################################

echo "🚀 Starting V37.14.0 AI Bills Analysis Deployment"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# =============================================================================
# PART 1: BACKEND DEPLOYMENT (VPS)
# =============================================================================

echo "📦 PART 1: Backend Deployment (VPS)"
echo "───────────────────────────────────────────────────────────────"
echo ""

echo "⚠️  MANUAL STEPS REQUIRED:"
echo ""
echo "1️⃣  Upload backend files to VPS:"
echo "    cd \"/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES/WDP-v37.13.0\""
echo "    scp backend/routes/ai-bills-routes.js root@185.193.126.13:/var/www/workforce-democracy/backend/routes/"
echo "    scp backend/server.js root@185.193.126.13:/var/www/workforce-democracy/backend/"
echo ""
echo "2️⃣  SSH into VPS:"
echo "    ssh root@185.193.126.13"
echo ""
echo "3️⃣  Verify Groq API key exists:"
echo "    cd /var/www/workforce-democracy/backend"
echo "    grep GROQ_API_KEY .env"
echo "    # Should show: GROQ_API_KEY=gsk_hmQ..."
echo ""
echo "4️⃣  Clear PM2 cache and restart (CRITICAL!):"
echo "    /opt/nodejs/bin/pm2 stop backend"
echo "    /opt/nodejs/bin/pm2 delete backend"
echo "    /opt/nodejs/bin/pm2 flush"
echo "    NODE_ENV=production /opt/nodejs/bin/pm2 start server.js --name backend -i 1"
echo ""
echo "5️⃣  Verify backend started successfully:"
echo "    /opt/nodejs/bin/pm2 list"
echo "    # Should show 'backend' as 'online'"
echo ""
echo "6️⃣  Check logs for AI Bills route:"
echo "    /opt/nodejs/bin/pm2 logs backend --lines 30 | grep -i \"ai bills\""
echo "    # Should see: '✅ AI Bills Analysis API loaded (v37.14.0)'"
echo ""
echo "7️⃣  Test AI analysis endpoint:"
echo "    curl -X POST http://localhost:3001/api/ai/bills/health"
echo "    # Should return: {\"success\":true,\"service\":\"ai-bills-analysis\"...}"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "⏸️  PAUSE HERE - Complete backend deployment first!"
echo "   Once backend shows 'online' and logs confirm AI Bills loaded,"
echo "   press ENTER to see frontend deployment instructions..."
read -p ""

# =============================================================================
# PART 2: FRONTEND DEPLOYMENT (Netlify)
# =============================================================================

echo ""
echo "📦 PART 2: Frontend Deployment (GenSpark → Netlify)"
echo "───────────────────────────────────────────────────────────────"
echo ""

echo "The frontend files have been updated in your GenSpark workspace:"
echo "  - js/bills-section.js (AI analysis integration)"
echo "  - css/bills-section.css (AI styling)"
echo ""
echo "1️⃣  Test on GenSpark first:"
echo "    Click 'Publish Website' in GenSpark"
echo "    Visit: https://sxcrlfyt.gensparkspace.com"
echo "    Login with ZIP: 12061"
echo "    Go to Bills tab"
echo ""
echo "2️⃣  Verify AI analysis works:"
echo "    ✅ Bills display immediately"
echo "    ✅ See \"⏳ Analyzing impact...\" appear"
echo "    ✅ After 2-3 seconds per bill, see:"
echo "       - 🤖 AI Summary badge"
echo "       - Plain-language summary"
echo "       - Real impact rating (⭐⭐⭐⭐ 4/5, etc.)"
echo "       - Impact reason explanation"
echo "       - \"Affects: [specific groups]\" text"
echo "       - 📄 Read Full Bill Text button"
echo "    ✅ Click \"Ask AI About This Bill\" → Working chat!"
echo ""
echo "3️⃣  If everything works on GenSpark, deploy to Netlify:"
echo "    - Download project from GenSpark"
echo "    - Drag entire folder to Netlify"
echo "    - Wait for deployment"
echo "    - Visit: https://workforcedemocracyproject.org"
echo "    - Clear browser cache (Cmd+Shift+R)"
echo "    - Test again"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""

# =============================================================================
# VERIFICATION CHECKLIST
# =============================================================================

echo "✅ VERIFICATION CHECKLIST"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Backend (VPS):"
echo "  [ ] PM2 shows 'backend' as 'online'"
echo "  [ ] Logs show '✅ AI Bills Analysis API loaded (v37.14.0)'"
echo "  [ ] No 'Cannot find module' errors"
echo "  [ ] Health endpoint returns success"
echo "  [ ] Groq API key configured in .env"
echo ""
echo "Frontend (Live Site):"
echo "  [ ] Bills display immediately (no waiting for AI)"
echo "  [ ] AI analysis loads in background (see ⏳ symbol)"
echo "  [ ] AI summaries appear after 2-3 seconds"
echo "  [ ] Impact ratings show 1-5 stars (not always 3)"
echo "  [ ] Impact reasons displayed"
echo "  [ ] 'Read Full Bill Text' button works"
echo "  [ ] AI chat responds to questions"
echo "  [ ] Cached bills load instantly (2nd visit)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""

# =============================================================================
# EXPECTED RESULTS
# =============================================================================

echo "🎯 EXPECTED RESULTS"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "User Experience:"
echo "  1. User visits Bills tab → Bills appear INSTANTLY"
echo "  2. User sees \"⏳ Analyzing impact...\" on each bill"
echo "  3. After 2-3 seconds, AI analysis appears:"
echo "     - 🤖 AI Summary: \"This bill increases Social Security...\""
echo "     - Impact: ⭐⭐⭐⭐ 4/5"
echo "     - Reason: \"Significant impact - affects 2.5M retirees\""
echo "     - Affects: \"Teachers, firefighters, police officers\""
echo "  4. User clicks 📄 Read Full Bill Text → Congress.gov opens"
echo "  5. User clicks \"Ask AI About This Bill\" → Working chat!"
echo "  6. User asks: \"How does this affect teachers?\""
echo "  7. AI responds with specific, helpful analysis"
echo ""
echo "Performance:"
echo "  - First load: 50 bills analyzed in ~90 seconds (background)"
echo "  - Cached load: INSTANT (no AI calls needed)"
echo "  - Cache duration: 30 days (bills rarely change)"
echo "  - User sees bills immediately (hybrid approach works!)"
echo ""
echo "Privacy:"
echo "  - ✅ Only public bill data sent to Groq"
echo "  - ✅ NO user identity/location sent to AI"
echo "  - ✅ Analysis cached on YOUR VPS (not Groq)"
echo "  - ✅ Aligns with zero-knowledge philosophy"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""

# =============================================================================
# TROUBLESHOOTING
# =============================================================================

echo "🐛 TROUBLESHOOTING"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Problem: Backend won't start"
echo "  → Check logs: /opt/nodejs/bin/pm2 logs backend --err"
echo "  → Look for 'Cannot find module ai-bills-routes'"
echo "  → Verify file uploaded: ls -la /var/www/workforce-democracy/backend/routes/ai-bills-routes.js"
echo ""
echo "Problem: AI analysis not loading"
echo "  → Check browser console (F12)"
echo "  → Look for fetch errors to /api/ai/bills/analyze"
echo "  → Test backend directly:"
echo "    curl -X POST http://localhost:3001/api/ai/bills/analyze -H \"Content-Type: application/json\" -d '{\"bill\":{\"id\":\"TEST\",\"title\":\"Test Bill\",\"summary\":\"Test\"}}'"
echo ""
echo "Problem: Groq API errors"
echo "  → Check Groq API key: grep GROQ_API_KEY /var/www/workforce-democracy/backend/.env"
echo "  → Test key validity: curl https://api.groq.com/openai/v1/models -H \"Authorization: Bearer \$GROQ_API_KEY\""
echo "  → Check Groq dashboard: https://console.groq.com"
echo ""
echo "Problem: Still shows hardcoded 3 stars"
echo "  → Clear browser cache (Cmd+Shift+R)"
echo "  → Check frontend version: View page source → search for 'V37.14.0'"
echo "  → May need to redeploy frontend"
echo ""
echo "Problem: PM2 module caching (old code running)"
echo "  → Follow EXACT sequence from Part 1, Step 4"
echo "  → NEVER use 'pm2 restart' - it doesn't clear cache!"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "📚 DOCUMENTATION"
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Created/Updated Files:"
echo "  Backend:"
echo "    - backend/routes/ai-bills-routes.js (NEW - 13KB)"
echo "    - backend/server.js (UPDATED - added AI bills route)"
echo ""
echo "  Frontend:"
echo "    - js/bills-section.js (UPDATED - AI integration)"
echo "    - css/bills-section.css (UPDATED - AI styling)"
echo ""
echo "  Documentation:"
echo "    - 📊-BILLS-AI-ANALYSIS-ISSUE-📊.md (root cause analysis)"
echo "    - ⚡-AI-ANALYSIS-QUICK-ANSWERS-⚡.md (Q&A guide)"
echo "    - DEPLOY-V37.14.0-AI-BILLS.sh (this script)"
echo ""

echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "🎉 DEPLOYMENT GUIDE COMPLETE!"
echo ""
echo "Next steps:"
echo "  1. Complete Part 1 (Backend) steps above"
echo "  2. Verify backend is working"
echo "  3. Complete Part 2 (Frontend) steps"
echo "  4. Test on live site"
echo "  5. Report back with results!"
echo ""
echo "═══════════════════════════════════════════════════════════════"
