/**
 * ADD THESE ENDPOINTS TO backend/server.js
 * 
 * Location: After the /api/backend/query endpoint (around line 600)
 * Before the app.listen() call at the end
 */

// At the top with other requires:
const { searchNonprofits, getNonprofitDetails } = require('./nonprofit-proxy');

// Add these routes:

// ============================================================================
// NONPROFIT ORGANIZATIONS API (ProPublica Proxy)
// ============================================================================

/**
 * Search nonprofits via ProPublica Nonprofit Explorer API
 * GET /api/nonprofits/search?q=legal+aid&state=NY&city=New+York
 */
app.get('/api/nonprofits/search', async (req, res) => {
    const { q, state, city } = req.query;
    
    if (!q) {
        return res.status(400).json({
            success: false,
            error: 'Search query (q) is required',
            example: '/api/nonprofits/search?q=legal+aid&state=NY'
        });
    }
    
    try {
        console.log(`🔍 Nonprofit search: "${q}"`, { state, city });
        
        // Search via proxy
        const organizations = await searchNonprofits(q, { state, city });
        
        console.log(`✅ Found ${organizations.length} nonprofits`);
        
        res.json({
            success: true,
            data: organizations,
            total: organizations.length,
            query: q,
            filters: { state, city }
        });
        
    } catch (error) {
        console.error('❌ Nonprofit search error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to search nonprofits at this time',
            message: 'The nonprofit database is temporarily unavailable. Please try again in a moment.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get detailed information about a specific nonprofit
 * GET /api/nonprofits/:ein
 */
app.get('/api/nonprofits/:ein', async (req, res) => {
    const { ein } = req.params;
    
    if (!ein || !/^\d{9}$/.test(ein)) {
        return res.status(400).json({
            success: false,
            error: 'Valid 9-digit EIN (Employer Identification Number) is required',
            example: '/api/nonprofits/123456789'
        });
    }
    
    try {
        console.log(`🔍 Nonprofit details: ${ein}`);
        
        const details = await getNonprofitDetails(ein);
        
        res.json({
            success: true,
            data: details
        });
        
    } catch (error) {
        console.error('❌ Nonprofit details error:', error);
        
        if (error.message.includes('404')) {
            res.status(404).json({
                success: false,
                error: 'Nonprofit not found',
                message: 'No organization found with that EIN'
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Unable to retrieve nonprofit details',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
});

/**
 * AI-powered nonprofit recommendations (Optional Enhancement)
 * POST /api/nonprofits/recommend
 * Body: { category, location, userNeeds }
 */
app.post('/api/nonprofits/recommend', async (req, res) => {
    const { category, location, userNeeds } = req.body;
    
    if (!category) {
        return res.status(400).json({
            success: false,
            error: 'Category is required'
        });
    }
    
    try {
        console.log(`🤖 AI recommendation request:`, { category, location });
        
        // Define category search terms
        const categoryTerms = {
            'legal-aid': 'legal aid',
            'housing': 'housing assistance',
            'healthcare': 'health services',
            'food': 'food bank',
            'workers-rights': 'labor rights',
            'mental-health': 'mental health'
        };
        
        const searchQuery = categoryTerms[category] || category;
        
        // Search for relevant nonprofits
        const organizations = await searchNonprofits(searchQuery, {
            state: location?.state,
            city: location?.city
        });
        
        if (organizations.length === 0) {
            return res.json({
                success: true,
                recommendations: [],
                message: 'No organizations found in your area. Try expanding your search area.'
            });
        }
        
        // If AI service is available, use it for ranking
        if (typeof analyzeWithAI === 'function') {
            const aiPrompt = `You are a compassionate community support assistant helping someone find nonprofit organizations.

User's need: ${userNeeds || `Looking for ${category} services`}
Location: ${location ? `${location.city}, ${location.state}` : 'Not specified'}

Available organizations (top 10):
${organizations.slice(0, 10).map((org, i) => 
    `${i+1}. ${org.name}
   Location: ${org.city}, ${org.state}
   Annual Revenue: $${org.revenue_amount?.toLocaleString() || 'N/A'}
   Subsection: ${org.subsection || 'Not specified'}`
).join('\n\n')}

Task: Rank the top 5 organizations and explain why each might be helpful. Consider:
1. Relevance to user's needs
2. Geographic proximity
3. Organization size/capacity (revenue)
4. Type of services (subsection)

Respond in JSON format:
{
  "recommendations": [
    {
      "ein": "organization EIN",
      "name": "organization name",
      "rank": 1,
      "reason": "why this is a good match (1-2 sentences)",
      "highlights": ["key point 1", "key point 2"]
    }
  ],
  "general_advice": "Brief, compassionate guidance (2-3 sentences)"
}`;

            try {
                const aiResponse = await analyzeWithAI(aiPrompt, [], 'community-recommendation');
                
                // Merge AI recommendations with full org data
                const enrichedRecommendations = aiResponse.recommendations.map(rec => {
                    const org = organizations.find(o => o.ein === rec.ein);
                    return { ...org, ...rec };
                });
                
                return res.json({
                    success: true,
                    recommendations: enrichedRecommendations,
                    advice: aiResponse.general_advice,
                    total_found: organizations.length,
                    ai_powered: true
                });
                
            } catch (aiError) {
                console.warn('⚠️ AI analysis failed, falling back to simple list:', aiError.message);
                // Fall through to basic response
            }
        }
        
        // Fallback: Return top organizations without AI ranking
        const topOrgs = organizations.slice(0, 5).map((org, i) => ({
            ...org,
            rank: i + 1,
            reason: `Top result for ${category} in your area`,
            highlights: [`Annual revenue: $${org.revenue_amount?.toLocaleString() || 'N/A'}`, `Located in ${org.city}, ${org.state}`]
        }));
        
        res.json({
            success: true,
            recommendations: topOrgs,
            advice: `We found ${organizations.length} organizations that might be able to help you. Review each one to find the best match for your needs.`,
            total_found: organizations.length,
            ai_powered: false
        });
        
    } catch (error) {
        console.error('❌ Recommendation error:', error);
        
        res.status(500).json({
            success: false,
            error: 'Unable to generate recommendations',
            message: 'Please try searching directly or visit the full nonprofit explorer.',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// ============================================================================
// END NONPROFIT ENDPOINTS
// ============================================================================

console.log('✅ Nonprofit API endpoints registered');
console.log('   - GET  /api/nonprofits/search?q=term');
console.log('   - GET  /api/nonprofits/:ein');
console.log('   - POST /api/nonprofits/recommend');
