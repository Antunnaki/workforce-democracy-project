/**
 * Fact Verification Engine
 * 
 * Multi-source fact-checking system that combats misinformation by:
 * 1. Searching trusted fact-checking sources (PolitiFact, FactCheck.org, Snopes, AP Fact Check)
 * 2. Aggregating results with weighted scoring
 * 3. Using Groq + Llama3 for contextual analysis
 * 4. Providing transparent sourcing
 * 
 * Philosophy:
 * - NO censorship or content removal
 * - TRANSPARENT sources and methodology
 * - USER EDUCATION over content blocking
 * - Multiple independent fact-checkers (no single source of truth)
 * - Privacy-first (DuckDuckGo for searches)
 * 
 * Fact-Check Sources (weighted by reputation):
 * - PolitiFact (Pulitzer Prize winner) - Weight: 1.0
 * - FactCheck.org (Annenberg Public Policy Center) - Weight: 1.0
 * - Snopes (longest-running fact-checker) - Weight: 0.9
 * - AP Fact Check (Associated Press) - Weight: 1.0
 * - Reuters Fact Check - Weight: 1.0
 * 
 * Returns:
 * - Verification status (true, false, mixed, unverifiable)
 * - Confidence score (0-100)
 * - Source citations with links
 * - Contextual summary from LLM
 */

const EthicalScraper = require('./ethical-scraper');
const CacheManager = require('./cache-manager');
const axios = require('axios');

class FactVerificationEngine {
    constructor() {
        this.scraper = new EthicalScraper();
        this.cache = new CacheManager({
            cacheDir: './cache/fact-checks'
        });
        
        // Trusted fact-checking sources
        this.factCheckSources = [
            {
                name: 'PolitiFact',
                domain: 'politifact.com',
                weight: 1.0,
                searchPrefix: 'site:politifact.com'
            },
            {
                name: 'FactCheck.org',
                domain: 'factcheck.org',
                weight: 1.0,
                searchPrefix: 'site:factcheck.org'
            },
            {
                name: 'AP Fact Check',
                domain: 'apnews.com/hub/ap-fact-check',
                weight: 1.0,
                searchPrefix: 'site:apnews.com/hub/ap-fact-check'
            },
            {
                name: 'Reuters Fact Check',
                domain: 'reuters.com/fact-check',
                weight: 1.0,
                searchPrefix: 'site:reuters.com/fact-check'
            },
            {
                name: 'Snopes',
                domain: 'snopes.com',
                weight: 0.9,
                searchPrefix: 'site:snopes.com'
            }
        ];
        
        // Groq API for LLM analysis (Llama3)
        this.groqApiKey = process.env.GROQ_API_KEY || null;
        this.groqBaseUrl = 'https://api.groq.com/openai/v1';
        
        console.log('🔍 Fact Verification Engine initialized');
        console.log(`   Sources: ${this.factCheckSources.length} independent fact-checkers`);
        console.log(`   LLM: ${this.groqApiKey ? 'Groq + Llama3 enabled' : 'API key not configured'}`);
    }
    
    /**
     * Verify a claim using multiple fact-checking sources
     */
    async verifyClaim(claim, options = {}) {
        const {
            minSources = 2,        // Minimum sources needed for confident verification
            includeContext = true, // Include LLM contextual analysis
            cacheResults = true    // Cache results for 7 days
        } = options;
        
        // Check cache first
        const cacheKey = `fact_check_${this.hashClaim(claim)}`;
        if (cacheResults) {
            const cached = await this.cache.get(cacheKey);
            if (cached) {
                console.log('✓ Using cached fact-check result');
                return cached;
            }
        }
        
        console.log(`🔍 Fact-checking: "${claim.substring(0, 100)}..."`);
        
        // Search all fact-checking sources in parallel
        const searchResults = await Promise.allSettled(
            this.factCheckSources.map(source => 
                this.searchFactCheckSource(claim, source)
            )
        );
        
        // Extract successful results
        const findings = searchResults
            .filter(r => r.status === 'fulfilled' && r.value.results.length > 0)
            .map(r => r.value);
        
        // If no sources found anything, return unverifiable
        if (findings.length === 0) {
            const result = {
                claim: claim,
                status: 'unverifiable',
                confidence: 0,
                message: 'No fact-check articles found for this claim',
                sources: [],
                context: includeContext ? await this.generateContext(claim, []) : null,
                timestamp: new Date().toISOString()
            };
            
            if (cacheResults) {
                await this.cache.set(cacheKey, result);
            }
            
            return result;
        }
        
        // Aggregate findings from all sources
        const aggregated = this.aggregateFindings(findings);
        
        // Generate contextual summary with LLM
        const context = includeContext 
            ? await this.generateContext(claim, findings)
            : null;
        
        const result = {
            claim: claim,
            status: aggregated.status,
            confidence: aggregated.confidence,
            message: aggregated.message,
            sources: aggregated.sources,
            breakdown: aggregated.breakdown,
            context: context,
            timestamp: new Date().toISOString(),
            methodology: 'Multi-source verification with weighted aggregation'
        };
        
        // Cache for 7 days
        if (cacheResults) {
            await this.cache.set(cacheKey, result);
        }
        
        return result;
    }
    
    /**
     * Search a specific fact-checking source
     */
    async searchFactCheckSource(claim, source) {
        try {
            const query = `${source.searchPrefix} ${claim}`;
            const results = await this.scraper.searchDuckDuckGo(query, 5);
            
            // Filter results to ensure they're from the correct domain
            const relevantResults = results.filter(r => 
                r.url.includes(source.domain)
            );
            
            return {
                source: source.name,
                weight: source.weight,
                results: relevantResults.map(r => ({
                    title: r.title,
                    url: r.url,
                    snippet: r.snippet,
                    rating: this.extractRating(r.title, r.snippet, source.name)
                }))
            };
        } catch (error) {
            console.error(`Error searching ${source.name}:`, error.message);
            return {
                source: source.name,
                weight: source.weight,
                results: []
            };
        }
    }
    
    /**
     * Extract fact-check rating from title/snippet
     * Different sources use different terminology
     */
    extractRating(title, snippet, sourceName) {
        const text = `${title} ${snippet}`.toLowerCase();
        
        // PolitiFact ratings
        if (sourceName === 'PolitiFact') {
            if (text.includes('true') && !text.includes('mostly') && !text.includes('half')) return 'true';
            if (text.includes('mostly true')) return 'mostly-true';
            if (text.includes('half true') || text.includes('half-true')) return 'half-true';
            if (text.includes('mostly false')) return 'mostly-false';
            if (text.includes('false') && !text.includes('mostly')) return 'false';
            if (text.includes('pants on fire')) return 'pants-on-fire';
        }
        
        // General ratings
        if (text.includes('false') || text.includes('misleading') || text.includes('incorrect')) {
            return 'false';
        }
        if (text.includes('true') || text.includes('accurate') || text.includes('correct')) {
            return 'true';
        }
        if (text.includes('mixed') || text.includes('partially') || text.includes('lacks context')) {
            return 'mixed';
        }
        
        return 'unrated';
    }
    
    /**
     * Aggregate findings from multiple sources
     */
    aggregateFindings(findings) {
        let trueScore = 0;
        let falseScore = 0;
        let mixedScore = 0;
        let totalWeight = 0;
        
        const sources = [];
        
        findings.forEach(finding => {
            finding.results.forEach(result => {
                const weight = finding.weight;
                totalWeight += weight;
                
                // Convert ratings to scores
                switch (result.rating) {
                    case 'true':
                    case 'mostly-true':
                        trueScore += weight;
                        break;
                    case 'false':
                    case 'mostly-false':
                    case 'pants-on-fire':
                        falseScore += weight;
                        break;
                    case 'mixed':
                    case 'half-true':
                        mixedScore += weight;
                        break;
                }
                
                sources.push({
                    source: finding.source,
                    title: result.title,
                    url: result.url,
                    rating: result.rating,
                    snippet: result.snippet
                });
            });
        });
        
        // Normalize scores
        trueScore = (trueScore / totalWeight) * 100;
        falseScore = (falseScore / totalWeight) * 100;
        mixedScore = (mixedScore / totalWeight) * 100;
        
        // Determine overall status
        let status, confidence, message;
        
        if (falseScore > 50) {
            status = 'false';
            confidence = Math.round(falseScore);
            message = 'Multiple fact-checkers have rated this claim as false or misleading';
        } else if (trueScore > 50) {
            status = 'true';
            confidence = Math.round(trueScore);
            message = 'Multiple fact-checkers have verified this claim as accurate';
        } else if (mixedScore > 30 || (trueScore > 20 && falseScore > 20)) {
            status = 'mixed';
            confidence = Math.round((trueScore + falseScore + mixedScore) / 3);
            message = 'Fact-checkers have found this claim contains both accurate and inaccurate elements';
        } else {
            status = 'unverifiable';
            confidence = Math.round((trueScore + falseScore + mixedScore) / 3);
            message = 'Insufficient fact-check coverage to make a confident determination';
        }
        
        return {
            status,
            confidence,
            message,
            sources: sources.slice(0, 10), // Limit to top 10 sources
            breakdown: {
                trueScore: Math.round(trueScore),
                falseScore: Math.round(falseScore),
                mixedScore: Math.round(mixedScore),
                totalSources: findings.length
            }
        };
    }
    
    /**
     * Generate contextual summary using Groq + Llama3
     */
    async generateContext(claim, findings) {
        if (!this.groqApiKey) {
            return {
                error: 'LLM API key not configured',
                summary: null
            };
        }
        
        try {
            // Build context from findings
            const sourceSummaries = findings.map(f => 
                `${f.source}: ${f.results.map(r => `"${r.title}"`).join(', ')}`
            ).join('\n');
            
            const prompt = `You are a neutral fact-checking assistant helping citizens evaluate political claims.

Claim being fact-checked:
"${claim}"

Fact-check sources found:
${sourceSummaries || 'No sources found'}

Task: Provide a brief, neutral summary (2-3 sentences) that:
1. Explains the context of the claim
2. Highlights key factual points
3. Notes any important nuances or missing context
4. Remains completely non-partisan

Do not state your own opinion. Focus on helping the user understand the facts.`;

            const response = await axios.post(
                `${this.groqBaseUrl}/chat/completions`,
                {
                    model: 'llama3-70b-8192',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a neutral, non-partisan fact-checking assistant.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 300
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.groqApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 15000
                }
            );
            
            return {
                summary: response.data.choices[0].message.content,
                model: 'llama3-70b-8192',
                provider: 'Groq'
            };
        } catch (error) {
            console.error('Error generating context:', error.message);
            return {
                error: error.message,
                summary: null
            };
        }
    }
    
    /**
     * Batch verify multiple claims
     */
    async batchVerify(claims, options = {}) {
        const results = await Promise.allSettled(
            claims.map(claim => this.verifyClaim(claim, options))
        );
        
        return results.map((r, i) => ({
            claim: claims[i],
            result: r.status === 'fulfilled' ? r.value : {
                error: r.reason.message,
                status: 'error'
            }
        }));
    }
    
    /**
     * Get trending misinformation topics
     * Useful for proactive fact-checking
     */
    async getTrendingMisinformation() {
        try {
            // Search for recent fact-checks across all sources
            const recentChecks = await Promise.allSettled(
                this.factCheckSources.map(source => 
                    this.scraper.searchDuckDuckGo(
                        `${source.searchPrefix} 2024`,
                        10
                    )
                )
            );
            
            const allArticles = recentChecks
                .filter(r => r.status === 'fulfilled')
                .flatMap(r => r.value);
            
            // Group by topic/keyword
            const topics = this.extractTopics(allArticles);
            
            return {
                topics: topics.slice(0, 10),
                totalArticles: allArticles.length,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error fetching trending misinformation:', error.message);
            return {
                error: error.message,
                topics: []
            };
        }
    }
    
    /**
     * Extract common topics from articles
     */
    extractTopics(articles) {
        const topicCounts = {};
        
        articles.forEach(article => {
            const text = `${article.title} ${article.snippet}`.toLowerCase();
            
            // Common misinformation topics
            const topics = [
                'election', 'voting', 'fraud', 'vaccine', 'covid',
                'climate', 'immigration', 'healthcare', 'economy',
                'crime', 'taxes', 'education', 'social security'
            ];
            
            topics.forEach(topic => {
                if (text.includes(topic)) {
                    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                }
            });
        });
        
        return Object.entries(topicCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([topic, count]) => ({ topic, count }));
    }
    
    /**
     * Simple hash function for claim caching
     */
    hashClaim(claim) {
        let hash = 0;
        for (let i = 0; i < claim.length; i++) {
            const char = claim.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }
}

module.exports = FactVerificationEngine;
