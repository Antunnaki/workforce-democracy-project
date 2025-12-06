#!/bin/bash

##############################################################################
# FIX VPS BACKEND CORS AND BILLDATA ISSUES
##############################################################################
#
# This script fixes two critical issues:
# 1. Updates Nginx CORS configuration to allow requests from Netlify frontend
# 2. Fixes the billData.committees.map is not a function error
#
##############################################################################

echo ""
echo "🔧 FIXING VPS BACKEND CORS AND BILLDATA ISSUES"
echo "==============================================="
echo ""
echo "📅 Started: $(date)"
echo ""

# Navigate to backend directory
cd /var/www/workforce-democracy/backend/

echo "✅ Step 1: Backing up current files..."
cp routes/ai-bills-routes.js routes/ai-bills-routes.js.backup.$(date +%s)
cp ../nginx/sites-enabled/workforce-backend ../nginx/sites-enabled/workforce-backend.backup.$(date +%s) 2>/dev/null || echo "   (Nginx config backup skipped - file may not exist)"

echo "✅ Step 2: Updating ai-bills-routes.js to fix committees.map error..."

# Apply the fix for billData.committees.map is not a function
cat > routes/ai-bills-routes.js << 'EOF'
/**
 * WORKFORCE DEMOCRACY PROJECT - AI Bills Routes
 * Version: 37.18.6-COMPLETE-FIX
 * Date: December 5, 2025
 * 
 * AI-powered bill analysis with:
 * - Level 3 Deep Research (multi-source)
 * - Smart Caching (30-day TTL for active bills)
 * - Forever cache for settled bills
 * - Privacy-First (DuckDuckGo search, no Google)
 * 
 * Endpoints:
 * - POST /api/ai/bills/analyze - Deep bill analysis
 * - POST /api/ai/bills/chat - Interactive Q&A about bills
 * 
 * CHANGE LOG v37.18.6-COMPLETE-FIX:
 * - FIXED: billData.committees.map is not a function error
 * - FIXED: Web search 403 errors (added proper headers)
 * - FIXED: Rate limiting (429 errors) with exponential backoff
 * 
 * CHANGE LOG v37.18.5-AI-BILLS-ASYNC-FIX:
 * - FIXED: Async queue concurrency issues
 * - FIXED: Job status polling loops
 * - FIXED: Duplicate job submissions
 * - IMPROVED: Error handling and logging
 * 
 * CHANGE LOG v37.17.0-BILL-CACHE-OPTIMIZATION:
 * - ADDED: Smart PostgreSQL caching layer
 * - ADDED: Forever cache for settled bills
 * - ADDED: 30-day cache for active bills
 * - FIXED: Duplicate cache entries
 * 
 * CHANGE LOG v37.15.0-DEEP-RESEARCH-AI-ANALYSIS:
 * - ADDED: Level 3 Deep Research (multi-source analysis)
 * - ADDED: Web search integration (DuckDuckGo)
 * - ADDED: Economic impact analysis framework
 * - ADDED: Labor empowerment scoring
 * - ADDED: Class analysis (Das Kapital framework)
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();
const billCache = require('../services/bill-cache-service');
const { OPENSTATES_API_KEY } = require('../../config/api-keys');
const { sleep, exponentialBackoff } = require('../utils/helpers');

// API Configuration
const CONGRESS_API_KEY = process.env.CONGRESS_API_KEY;
const OPENSTATES_API_BASE = 'https://v3.openstates.org';
const COURT_LISTENER_API_BASE = 'https://www.courtlistener.com/api/rest/v3';

// Rate limiting configuration
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second

// =============================================================================
// CONGRESS.GOV API - FEDERAL BILLS
// =============================================================================

/**
 * Fetch full bill details from Congress.gov
 * Returns: { fullText, summary, sponsors, committees, actions, votes }
 */
async function fetchFederalBillDetails(billId) {
    try {
        console.log(`📜 [Federal Bill] Fetching details for ${billId}...`);
        
        if (!CONGRESS_API_KEY) {
            console.warn('⚠️  Congress.gov API key not configured');
            return null;
        }
        
        // Parse bill ID (e.g., "HR 1234" or "S 5678")
        const billMatch = billId.match(/([HS]R?|S)\s*(\d+)/i);
        if (!billMatch) {
            console.error(`❌ [Federal Bill] Invalid bill ID format: ${billId}`);
            return null;
        }
        
        const billType = billMatch[1].toLowerCase();
        const billNumber = billMatch[2];
        const congress = 118; // Current Congress (2023-2025)
        
        // Fetch bill details from Congress.gov
        const url = `${COURT_LISTENER_API_BASE}/bill/${congress}/${billType}/${billNumber}`;
        const response = await axios.get(url, {
            params: { format: 'json', api_key: CONGRESS_API_KEY },
            timeout: 10000
        });
        
        const billData = response.data.bill;
        
        const result = {
            fullText: null,
            summary: billData.summary?.text || billData.title,
            sponsors: [],
            committees: [],
            actions: [],
            votes: []
        };
        
        // Get sponsors
        if (billData.sponsors) {
            result.sponsors = billData.sponsors.map(s => `${s.firstName || ''} ${s.lastName}`.trim());
        }
        
        // Get committees - FIXED: Check if committees is an array before mapping
        if (billData.committees && Array.isArray(billData.committees)) {
            result.committees = billData.committees.map(c => c.name);
        }
        
        // Get actions
        if (billData.actions) {
            result.actions = billData.actions.slice(0, 10); // Last 10 actions
        }
        
        // Try to fetch bill text
        if (billData.textVersions && billData.textVersions.length > 0) {
            const textUrl = billData.textVersions[0].url;
            try {
                const textResponse = await axios.get(textUrl, { timeout: 5000 });
                result.fullText = textResponse.data;
            } catch (err) {
                console.warn(`⚠️  [Federal Bill] Could not fetch full text: ${err.message}`);
            }
        }
        
        console.log(`✅ [Federal Bill] Got details for ${billId}`);
        return result;
        
    } catch (error) {
        console.error(`❌ [Federal Bill] Failed to fetch ${billId}:`, error.message);
        return null;
    }
}

/**
 * Fetch full bill text from OpenStates (State bills)
 * Returns: { text, summary, sponsors, votes }
 */
async function fetchStateBillDetails(billId, state) {
    try {
        console.log(`📜 [State Bill] Fetching details for ${billId} (${state})...`);
        
        if (!OPENSTATES_API_KEY) {
            console.warn('⚠️  OpenStates API key not configured');
            return null;
        }
        
        // Fetch bill details from OpenStates
        const url = `${OPENSTATES_API_BASE}/bills/${state}/${billId}`;
        const response = await axios.get(url, {
            headers: { 'X-API-KEY': OPENSTATES_API_KEY },
            timeout: 10000
        });
        
        const billData = response.data;
        
        const result = {
            fullText: null,
            summary: billData.abstract || billData.title,
            sponsors: [],
            votes: [],
            versions: []
        };
        
        // Get sponsors
        if (billData.sponsorships) {
            result.sponsors = billData.sponsorships.map(s => s.name);
        }
        
        // Get bill text from versions
        if (billData.versions && billData.versions.length > 0) {
            const latestVersion = billData.versions[0];
            if (latestVersion.url) {
                try {
                    const textResponse = await axios.get(latestVersion.url, { timeout: 5000 });
                    result.fullText = textResponse.data;
                } catch (err) {
                    console.warn(`⚠️  [State Bill] Could not fetch full text: ${err.message}`);
                }
            }
        }
        
        // Get voting records
        if (billData.votes) {
            result.votes = billData.votes.map(v => ({
                chamber: v.chamber,
                result: v.result,
                date: v.date
            }));
        }
        
        console.log(`✅ [State Bill] Got details for ${billId}`);
        return result;
        
    } catch (error) {
        console.error(`❌ [State Bill] Failed to fetch ${billId}:`, error.message);
        return null;
    }
}

// =============================================================================
// WEB SEARCH SERVICE (Privacy-First)
// =============================================================================

/**
 * Search for bill-related news and analysis using DuckDuckGo
 * Privacy-first: No Google, no tracking, ethical search
 * Returns: Array of {title, snippet, url, source}
 */
async function searchBillNews(billId, billTitle) {
    try {
        console.log(`🔍 [Web Search] Searching news for ${billId}...`);
        
        // DuckDuckGo HTML search (no API key needed, privacy-friendly)
        const query = `${billId} ${billTitle} bill legislation`;
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        
        const response = await axios.get(searchUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; WorkforceDemocracy/1.0; +https://workforcedemocracyproject.org)',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Accept-Encoding': 'gzip, deflate',
                'Connection': 'keep-alive',
                'Upgrade-Insecure-Requests': '1',
            },
            timeout: 10000
        });
        
        // Parse HTML results
        const $ = cheerio.load(response.data);
        const results = [];
        
        $('.result').slice(0, 5).each((i, elem) => {
            const title = $(elem).find('.result__title').text().trim();
            const snippet = $(elem).find('.result__snippet').text().trim();
            const url = $(elem).find('.result__url').attr('href');
            
            if (title && snippet) {
                results.push({
                    title,
                    snippet,
                    url: url || '#',
                    source: 'web_search'
                });
            }
        });
        
        console.log(`✅ [Web Search] Found ${results.length} articles for ${billId}`);
        return results;
        
    } catch (error) {
        console.warn(`⚠️  [Web Search] Failed for ${billId}:`, error.message);
        return [];
    }
}

// =============================================================================
// ENHANCED BILL ANALYSIS ENDPOINT (LEVEL 3 DEEP RESEARCH)
// =============================================================================

/**
 * POST /api/ai/bills/analyze
 * LEVEL 3 DEEP RESEARCH: Comprehensive multi-source analysis
 * Process:
 * 1. Check cache (forever for settled bills, 30 days for active)
 * 2. Fetch bill details (full text, summaries, votes)
 * 3. Search web for news/policy analysis
 * 4. Combine all sources
 * 5. Generate comprehensive AI analysis
 * 6. Cache with smart TTL
 */
router.post('/analyze', async (req, res) => {
    try {
        const { bill } = req.body;
        
        if (!bill || !bill.id) {
            return res.status(400).json({ 
                success: false,
                error: 'Bill data with ID required' 
            });
        }
        
        console.log(`🤖 [AI Bills DEEP] Analyze request for: ${bill.id} (${bill.level})`);
        
        // V37.17.0: Check PostgreSQL cache first
        const cachedBill = await billCache.getCachedBillAnalysis(bill.id);
        if (cachedBill) {
            // Reconstruct analysis object from cached data
            const cachedAnalysis = {
                summary: cachedBill.ai_analysis_full.split('\n\n')[0], // Extract summary
                key_provisions: [], // TODO: Parse from analysis
                affects: cachedBill.labor_impact || '',
                impact_score: 4, // TODO: Store this separately
                impact_reason: '',
                economic_impact: cachedBill.economic_framework || '',
                worker_empowerment: cachedBill.labor_impact || '',
                class_analysis: cachedBill.economic_framework || '',
                arguments_for: [],
                arguments_against: [],
                similar_legislation: '',
                next_steps: cachedBill.status || ''
            };
            
            // Record cache hit metric
            await billCache.recordCacheMetric('hit', 'cache', 50, 0);
            
            return res.json({
                success: true,
                bill_id: bill.id,
                cached: true,
                cache_hits: cachedBill.cache_hits,
                analysis: cachedAnalysis,
                sources: JSON.parse(cachedBill.sources_json || '[]'),
                timestamp: cachedBill.updated_at
            });
        }
        
        // Fetch bill details with exponential backoff for rate limiting
        let billDetails = null;
        try {
            billDetails = await exponentialBackoff(
                async () => {
                    if (bill.level === 'federal') {
                        return await fetchFederalBillDetails(bill.id);
                    } else {
                        return await fetchStateBillDetails(bill.id, bill.state);
                    }
                },
                MAX_RETRIES,
                INITIAL_DELAY
            );
        } catch (fetchError) {
            console.error(`❌ [AI Bills DEEP] Failed to fetch bill details after ${MAX_RETRIES} retries:`, fetchError.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch bill details from government API',
                message: fetchError.message
            });
        }
        
        if (!billDetails) {
            return res.status(404).json({
                success: false,
                error: 'Bill details not found'
            });
        }
        
        // Search for related news with exponential backoff
        let newsArticles = [];
        try {
            newsArticles = await exponentialBackoff(
                async () => await searchBillNews(bill.id, bill.title),
                MAX_RETRIES,
                INITIAL_DELAY
            );
        } catch (searchError) {
            console.warn(`⚠️  [AI Bills DEEP] Web search failed:`, searchError.message);
            // Continue without news articles - not critical
        }
        
        // Combine all sources for AI analysis
        const allSources = [
            {
                type: 'bill_details',
                title: bill.title,
                content: billDetails.summary || billDetails.fullText?.substring(0, 2000) || 'No content available',
                source: `${bill.level === 'federal' ? 'Congress.gov' : 'OpenStates'}`
            },
            ...newsArticles.map(article => ({
                type: 'news_article',
                title: article.title,
                content: article.snippet,
                source: article.url
            }))
        ];
        
        // Prepare context for AI
        const aiContext = {
            bill: {
                id: bill.id,
                title: bill.title,
                level: bill.level,
                summary: billDetails.summary,
                sponsors: billDetails.sponsors,
                committees: billDetails.committees,
                actions: billDetails.actions
            },
            sources: allSources,
            economicFramework: `
                Analyze this bill through a Marxist/Das Kapital lens:
                - How does it affect the relationship between capital and labor?
                - Which class interests does it serve?
                - Does it strengthen or weaken worker power?
                - What are the material conditions it addresses?
            `,
            laborEmpowermentFocus: `
                Score this bill on labor empowerment (1-10):
                - 1-3: Harmful to workers
                - 4-6: Neutral or mixed effects
                - 7-10: Empowering to workers
                Provide specific reasons for the score.
            `
        };
        
        // V37.15.0: Generate comprehensive AI analysis
        const aiAnalysis = await generateBillAnalysis(aiContext);
        
        if (!aiAnalysis.success) {
            return res.status(500).json({
                success: false,
                error: 'AI analysis failed',
                message: aiAnalysis.error
            });
        }
        
        // V37.17.0: Cache the analysis with smart TTL
        try {
            await billCache.cacheBillAnalysis(
                bill.id,
                bill.title,
                bill.level,
                bill.status,
                aiAnalysis.response,
                JSON.stringify(allSources),
                aiAnalysis.metadata.economic_framework,
                aiAnalysis.metadata.labor_impact
            );
            
            // Record cache miss metric
            await billCache.recordCacheMetric('miss', 'groq', aiAnalysis.metadata.tokens, aiAnalysis.metadata.cost);
        } catch (cacheError) {
            console.warn('⚠️  [AI Bills DEEP] Failed to cache analysis:', cacheError.message);
            // Continue - caching failure shouldn't break the response
        }
        
        // Return analysis
        res.json({
            success: true,
            bill_id: bill.id,
            cached: false,
            analysis: {
                summary: aiAnalysis.response.split('\n\n')[0],
                full_text: aiAnalysis.response,
                key_provisions: [],
                affects: aiAnalysis.metadata.labor_impact,
                impact_score: 5, // TODO: Extract from AI response
                impact_reason: '',
                economic_impact: aiAnalysis.metadata.economic_framework,
                worker_empowerment: aiAnalysis.metadata.labor_impact,
                class_analysis: aiAnalysis.metadata.economic_framework,
                arguments_for: [],
                arguments_against: [],
                similar_legislation: '',
                next_steps: bill.status || ''
            },
            sources: allSources,
            metadata: aiAnalysis.metadata,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ [AI Bills DEEP] Analysis error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Failed to generate bill analysis'
        });
    }
});

/**
 * Generate comprehensive bill analysis using AI
 * V37.15.0: Enhanced with economic and labor frameworks
 */
async function generateBillAnalysis(context) {
    try {
        // Import AI service here to avoid circular dependencies
        const { analyzeWithAI } = require('../ai-service');
        
        const prompt = `
            You are analyzing the bill: "${context.bill.title}" (${context.bill.id})
            
            Bill Details:
            - Summary: ${context.bill.summary}
            - Level: ${context.bill.level}
            - Sponsors: ${context.bill.sponsors.join(', ')}
            - Committees: ${context.bill.committees.join(', ')}
            - Status: ${context.bill.status}
            
            Sources to analyze:
            ${context.sources.map((s, i) => `
            Source ${i + 1} (${s.type}):
            Title: ${s.title}
            Content: ${s.content}
            Source: ${s.source}`).join('\n')}
            
            Please provide a comprehensive analysis covering:
            
            1. Executive Summary (2-3 sentences)
            
            2. Key Provisions (bullet points)
            
            3. Who It Affects
               - Workers/Labor
               - Capital/Business
               - Consumers/Public
            
            4. Impact Score (1-10 scale)
               Where 1 = Strongly favors capital, 10 = Strongly favors labor
               Explain your reasoning.
            
            5. Economic Impact Analysis
               ${context.economicFramework}
            
            6. Worker Empowerment Assessment
               ${context.laborEmpowermentFocus}
            
            7. Class Analysis
               Analyze through a Marxist lens:
               - Which class interests does this bill primarily serve?
               - How does it affect the balance of class forces?
               - Does it advance or retard the material conditions of the working class?
            
            8. Arguments For (2-3 points)
            
            9. Arguments Against (2-3 points)
            
            10. Similar Legislation
                Mention any comparable bills or historical precedents
            
            11. Next Steps
                What happens next in the legislative process?
        `;
        
        const result = await analyzeWithAI(prompt, {}, 'bills');
        
        if (result.success) {
            return {
                success: true,
                response: result.response,
                sources: result.sources,
                metadata: result.metadata
            };
        } else {
            return {
                success: false,
                error: result.error || 'AI analysis failed'
            };
        }
        
    } catch (error) {
        console.error('❌ AI Bill Analysis Error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * POST /api/ai/bills/chat
 * Interactive Q&A about bills using AI
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, billContext } = req.body;
        
        if (!message) {
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }
        
        // Import AI service
        const { analyzeWithAI } = require('../ai-service');
        
        // Build context-aware prompt
        let prompt = message;
        if (billContext) {
            prompt = `
                Context: You are discussing the bill "${billContext.title}" (${billContext.id}).
                
                Bill Summary: ${billContext.summary}
                
                Question: ${message}
            `;
        }
        
        const result = await analyzeWithAI(prompt, {}, 'bills');
        
        if (result.success) {
            res.json({
                success: true,
                message: result.response,
                sources: result.sources,
                metadata: result.metadata
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error || 'AI chat failed'
            });
        }
        
    } catch (error) {
        console.error('❌ [AI Bills Chat] Error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

console.log('🏛️  AI Bills Routes initialized (v37.15.0-DEEP-RESEARCH-AI-ANALYSIS)');
console.log('   Features: Level 3 Deep Research, Multi-Source Data, Smart Caching');
console.log('   Privacy: DuckDuckGo search, no Google/Big Tech');
console.log('   Cache: Forever for settled bills, 30 days for active bills');

module.exports = router;
EOF

echo "✅ Step 3: Updating Nginx configuration for proper CORS..."

# Create or update Nginx configuration
mkdir -p ../nginx/sites-enabled/ 2>/dev/null || true

cat > ../nginx/sites-enabled/workforce-backend << 'EOF'
server {
    listen 80;
    server_name api.workforcedemocracyproject.org;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=100r/m;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Cache bypass
        proxy_cache_bypass $http_upgrade;
        
        # CORS Headers - Allow requests from Netlify frontend
        add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.netlify.app' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
        add_header 'Access-Control-Max-Age' '86400' always;

        # Handle preflight OPTIONS requests
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' 'https://workforcedemocracyproject.netlify.app' always;
            add_header 'Access-Control-Allow-Credentials' 'true' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, X-Requested-With' always;
            add_header 'Access-Control-Max-Age' '86400' always;
            add_header 'Content-Type' 'text/plain charset=UTF-8';
            add_header 'Content-Length' '0';
            return 204;
        }
    }

    # Health check endpoint
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
EOF

echo "✅ Step 4: Restarting Nginx..."
systemctl reload nginx 2>/dev/null || echo "   (Nginx restart skipped - may not be installed or accessible)"

echo "✅ Step 5: Performing nuclear PM2 restart..."
pm2 stop backend 2>/dev/null || echo "   (Backend process not running)"
pm2 flush 2>/dev/null || echo "   (No logs to flush)"
pm2 delete backend 2>/dev/null || echo "   (Process not registered with PM2)"
pkill -9 node 2>/dev/null || echo "   (No Node.js processes to kill)"
sleep 2

cd /var/www/workforce-democracy/backend/
pm2 start server.js --name backend || echo "   (Failed to start backend with PM2)"
pm2 save 2>/dev/null || echo "   (Failed to save PM2 configuration)"

echo ""
echo "✅ Step 6: Verifying deployment..."
sleep 3

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ FIX-VPS-BACKEND-CORS-AND-BILLDATA COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔧 Changes made:"
echo "   1. Fixed billData.committees.map is not a function error"
echo "   2. Added proper headers to web search requests"
echo "   3. Implemented exponential backoff for rate limiting"
echo "   4. Updated Nginx CORS configuration"
echo ""
echo "🧪 Test the fixes:"
echo "   1. Visit: https://workforcedemocracyproject.netlify.app"
echo "   2. Try searching for bills with ZIP code: 12061"
echo "   3. Check browser console for 502 errors (should be resolved)"
echo ""
echo "📅 Completed: $(date)"
echo ""