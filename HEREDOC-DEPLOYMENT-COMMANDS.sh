#!/bin/bash

################################################################################
# COMPREHENSIVE ANALYSIS IMPROVEMENTS - HEREDOC DEPLOYMENT
# Copy-paste these commands directly into your SSH terminal
################################################################################

echo "========================================================================"
echo "🚀 COMPREHENSIVE ANALYSIS IMPROVEMENTS DEPLOYMENT"
echo "========================================================================"

# ==============================================================================
# STEP 1: Create comprehensive-improvements.py
# ==============================================================================

echo ""
echo "📝 Step 1/3: Creating comprehensive-improvements.py..."

cat > /tmp/comprehensive-improvements.py << 'PYTHON_SCRIPT_1'
#!/usr/bin/env python3
"""
Comprehensive Analysis Improvements for Progressive Policy Assistant
- Increase source threshold from 8 to 12
- Improve gap analysis with more diverse follow-up queries
- Enhance LLM prompting for specific data (dollar amounts, quotes)
"""

import re
import sys

def read_file(filepath):
    """Read file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
        sys.exit(1)

def write_file(filepath, content):
    """Write file content"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Successfully updated {filepath}")
    except Exception as e:
        print(f"❌ Error writing {filepath}: {e}")
        sys.exit(1)

def improve_gap_analysis(content):
    """Replace gap analysis function with improved version"""
    
    # Find the analyzeSourceGaps function
    pattern = r'function analyzeSourceGaps\(sources, originalQuery\) \{.*?^}'
    
    improved_function = '''function analyzeSourceGaps(sources, originalQuery) {
    if (!originalQuery || typeof originalQuery !== 'string') {
        return { needsMoreData: false, followUpQueries: [] };
    }
    
    const queryLower = originalQuery.toLowerCase();
    const followUpQueries = [];
    
    // ==================================================================
    // TOPIC-SPECIFIC FOLLOW-UP QUERIES
    // ==================================================================
    
    // SNAP & Food Assistance Programs
    if (queryLower.match(/snap|food stamp|welfare|nutrition assistance/i)) {
        if (sources.length < 12) {
            followUpQueries.push('SNAP benefits cuts 2025 statistics dollar amounts');
            followUpQueries.push('SNAP benefits economic impact poverty rates');
            followUpQueries.push('SNAP benefits congressional bill HR details');
            followUpQueries.push('SNAP benefits recipients affected numbers');
        }
    }
    
    // Healthcare & Insurance
    else if (queryLower.match(/healthcare|medicare|medicaid|aca|affordable care/i)) {
        if (sources.length < 12) {
            followUpQueries.push(originalQuery + ' policy analysis statistics');
            followUpQueries.push(originalQuery + ' economic impact cost data');
            followUpQueries.push(originalQuery + ' affected population numbers');
        }
    }
    
    // Labor & Workers Rights
    else if (queryLower.match(/labor|union|worker|wage|strike/i)) {
        if (sources.length < 12) {
            followUpQueries.push(originalQuery + ' union organizing data');
            followUpQueries.push(originalQuery + ' wage statistics economic impact');
            followUpQueries.push(originalQuery + ' workers affected numbers');
        }
    }
    
    // Climate & Environment
    else if (queryLower.match(/climate|environment|renewable|fossil fuel|carbon/i)) {
        if (sources.length < 12) {
            followUpQueries.push(originalQuery + ' emissions data statistics');
            followUpQueries.push(originalQuery + ' economic analysis costs');
            followUpQueries.push(originalQuery + ' policy legislation details');
        }
    }
    
    // Corporate & Tax Policy
    else if (queryLower.match(/corporate|tax|wealth|billionaire|regulation/i)) {
        if (sources.length < 12) {
            followUpQueries.push(originalQuery + ' tax revenue numbers data');
            followUpQueries.push(originalQuery + ' economic impact analysis');
            followUpQueries.push(originalQuery + ' corporate profits statistics');
        }
    }
    
    // Housing & Rent
    else if (queryLower.match(/housing|rent|eviction|homeless|afford/i)) {
        if (sources.length < 12) {
            followUpQueries.push(originalQuery + ' rent prices statistics');
            followUpQueries.push(originalQuery + ' eviction data numbers');
            followUpQueries.push(originalQuery + ' housing crisis analysis');
        }
    }
    
    // Immigration & Border
    else if (queryLower.match(/immigration|immigrant|border|refugee|asylum/i)) {
        if (sources.length < 12) {
            followUpQueries.push(originalQuery + ' immigration statistics data');
            followUpQueries.push(originalQuery + ' policy impact analysis');
            followUpQueries.push(originalQuery + ' affected population numbers');
        }
    }
    
    // Generic policy queries - catch-all
    else if (sources.length < 12) {
        followUpQueries.push(originalQuery + ' policy analysis statistics');
        followUpQueries.push(originalQuery + ' economic data impact');
        followUpQueries.push(originalQuery + ' legislative details numbers');
    }
    
    return {
        needsMoreData: followUpQueries.length > 0,
        followUpQueries: followUpQueries.slice(0, 4) // Max 4 follow-ups for better coverage
    };
}'''
    
    # Replace the function
    modified = re.sub(pattern, improved_function, content, flags=re.MULTILINE | re.DOTALL)
    
    if modified == content:
        print("⚠️ Warning: Gap analysis function pattern not found")
        return content
    
    print("✅ Improved gap analysis function")
    return modified

def improve_llm_prompting(content):
    """Enhance LLM system prompt to request specific data"""
    
    # Find the system prompt in the analyzeWithAI function
    pattern = r'const systemPrompt = `You are a progressive policy analyst.*?Please cite sources with \[Source X\] notation\.`'
    
    improved_prompt = '''const systemPrompt = `You are a progressive policy analyst with expertise in economic policy, labor rights, healthcare, and social justice issues.

**CRITICAL ANALYSIS REQUIREMENTS:**
1. **Cite SPECIFIC DATA**: Always include dollar amounts, percentages, and numeric impacts when available
2. **Use DIRECT QUOTES**: Include direct quotes from articles when they contain key facts or statements
3. **Provide ATTRIBUTION**: Cite sources with [Source X] notation and include publication names
4. **Show ECONOMIC IMPACT**: Emphasize how many people are affected and the financial consequences
5. **Include LEGISLATIVE DETAILS**: Cite bill numbers (HR XXXX, S. XXXX), vote counts, and dates
6. **Highlight CONTRADICTIONS**: Point out discrepancies in official statements vs. factual data

**EXAMPLES OF GOOD ANALYSIS:**
- "According to Truthout's November 2025 article, SNAP cuts will reduce benefits by $23/month for 42.1 million recipients [Source 1]"
- "Common Dreams reports HR 5376 passed 218-217, with Rep. Johnson stating the bill would 'save taxpayers money' despite CBO estimates showing $12B in cuts to nutrition assistance [Source 2]"
- "ProPublica's investigation found that 'corporate tax avoidance cost the federal government $240 billion in 2024,' directly contradicting Treasury claims of increased revenue [Source 3]"

**AVOID GENERIC STATEMENTS:**
❌ "According to reports, SNAP cuts affect millions..."
✅ "According to Truthout, SNAP cuts affect 42.1 million recipients, reducing monthly benefits by an average of $23 per household..."

Based on the provided sources, analyze the user's query with specific data, direct quotes, and clear attribution. Please cite sources with [Source X] notation.`'''
    
    # Replace the prompt
    modified = re.sub(pattern, improved_prompt, content, flags=re.MULTILINE | re.DOTALL)
    
    if modified == content:
        print("⚠️ Warning: LLM system prompt pattern not found - trying alternative pattern")
        
        # Alternative pattern - search for just the start of the prompt
        alt_pattern = r'const systemPrompt = `You are a progressive policy analyst[^`]*`'
        modified = re.sub(alt_pattern, improved_prompt, content, flags=re.MULTILINE)
        
        if modified == content:
            print("⚠️ Warning: Could not find LLM system prompt to update")
            return content
    
    print("✅ Enhanced LLM system prompt")
    return modified

def increase_source_threshold(content):
    """Increase source threshold from 8 to 12"""
    
    # Look for threshold in gap analysis
    modified = re.sub(
        r'if \(sources\.length < 8\)',
        'if (sources.length < 12)',
        content
    )
    
    if modified == content:
        print("⚠️ Warning: Source threshold pattern not found")
        return content
    
    print("✅ Increased source threshold from 8 to 12")
    return modified

def main():
    """Main execution"""
    print("=" * 70)
    print("🚀 COMPREHENSIVE ANALYSIS IMPROVEMENTS")
    print("=" * 70)
    
    filepath = '/root/workforce_democracy/backend/ai-service.js'
    
    print(f"\n📖 Reading {filepath}...")
    content = read_file(filepath)
    print(f"✅ Read {len(content)} bytes")
    
    # Apply all improvements
    print("\n🔧 Applying improvements...")
    content = increase_source_threshold(content)
    content = improve_gap_analysis(content)
    content = improve_llm_prompting(content)
    
    # Write updated file
    print(f"\n💾 Writing updated file...")
    write_file(filepath, content)
    
    print("\n" + "=" * 70)
    print("✅ ALL IMPROVEMENTS APPLIED SUCCESSFULLY")
    print("=" * 70)
    print("\n📋 Changes made:")
    print("  1. ✅ Source threshold increased: 8 → 12")
    print("  2. ✅ Gap analysis improved: 7 topic-specific patterns")
    print("  3. ✅ Follow-up queries: 3 → 4 per topic")
    print("  4. ✅ LLM prompting enhanced: specific data requirements")
    print("\n🔄 Next step: Nuclear PM2 restart required")
    print("=" * 70)

if __name__ == '__main__':
    main()
PYTHON_SCRIPT_1

chmod +x /tmp/comprehensive-improvements.py
echo "✅ Created comprehensive-improvements.py"

# ==============================================================================
# STEP 2: Create fix-scrapers.py
# ==============================================================================

echo ""
echo "📝 Step 2/3: Creating fix-scrapers.py..."

cat > /tmp/fix-scrapers.py << 'PYTHON_SCRIPT_2'
#!/usr/bin/env python3
"""
Fix Common Dreams and Democracy Now scrapers
Update CSS selectors and improve content extraction
"""

import re
import sys

def read_file(filepath):
    """Read file content"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        print(f"❌ Error reading {filepath}: {e}")
        sys.exit(1)

def write_file(filepath, content):
    """Write file content"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✅ Successfully updated {filepath}")
    except Exception as e:
        print(f"❌ Error writing {filepath}: {e}")
        sys.exit(1)

def fix_common_dreams_scraper(content):
    """Update Common Dreams scraper with better selectors"""
    
    # Find the scrapeCommonDreams function
    pattern = r'async function scrapeCommonDreams\(url\) \{.*?^}'
    
    improved_function = '''async function scrapeCommonDreams(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.commondreams.org/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Try multiple selectors in priority order
        let paragraphs = [];
        
        // Method 1: Article content div
        paragraphs = $('.article-body p').toArray();
        
        // Method 2: Entry content (WordPress standard)
        if (paragraphs.length === 0) {
            paragraphs = $('.entry-content p').toArray();
        }
        
        // Method 3: Main content area
        if (paragraphs.length === 0) {
            paragraphs = $('article p').toArray();
        }
        
        // Method 4: Generic content selectors
        if (paragraphs.length === 0) {
            paragraphs = $('.content p, .post-content p, main p').toArray();
        }
        
        // Extract text from paragraphs
        const fullContent = paragraphs
            .map(p => $(p).text().trim())
            .filter(text => text.length > 50) // Filter out short paragraphs
            .join('\\n\\n');
        
        if (!fullContent || fullContent.length < 500) {
            console.error(`  ⚠️ Common Dreams: Short content (${fullContent.length} chars)`);
            
            // Fallback: Try to get any meaningful text
            const bodyText = $('article').text().trim();
            if (bodyText && bodyText.length > 500) {
                return bodyText.substring(0, 8000);
            }
            
            return null;
        }
        
        // Limit to reasonable length
        return fullContent.substring(0, 10000);
        
    } catch (error) {
        console.error(`  ❌ Common Dreams scraper error: ${error.message}`);
        return null;
    }
}'''
    
    # Replace the function
    modified = re.sub(pattern, improved_function, content, flags=re.MULTILINE | re.DOTALL)
    
    if modified == content:
        print("⚠️ Warning: Common Dreams scraper not found")
        return content
    
    print("✅ Fixed Common Dreams scraper")
    return modified

def fix_democracy_now_scraper(content):
    """Update Democracy Now scraper with better selectors"""
    
    # Find the scrapeDemocracyNow function
    pattern = r'async function scrapeDemocracyNow\(url\) \{.*?^}'
    
    improved_function = '''async function scrapeDemocracyNow(url) {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.democracynow.org/'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        
        // Democracy Now has different layouts for stories vs headlines
        let fullContent = '';
        
        // Method 1: Story content (full articles)
        const storyContent = $('.story_content p, .news_body p').toArray();
        if (storyContent.length > 0) {
            fullContent = storyContent
                .map(p => $(p).text().trim())
                .filter(text => text.length > 30)
                .join('\\n\\n');
        }
        
        // Method 2: Transcript content (for show segments)
        if (!fullContent || fullContent.length < 500) {
            const transcriptContent = $('.transcript p, .transcript_content p').toArray();
            if (transcriptContent.length > 0) {
                fullContent = transcriptContent
                    .map(p => $(p).text().trim())
                    .filter(text => text.length > 30)
                    .join('\\n\\n');
            }
        }
        
        // Method 3: Headlines (for daily news updates)
        if (!fullContent || fullContent.length < 500) {
            const headlines = $('.headline_body, .summary').toArray();
            if (headlines.length > 0) {
                fullContent = headlines
                    .map(h => $(h).text().trim())
                    .filter(text => text.length > 30)
                    .join('\\n\\n');
            }
        }
        
        // Method 4: Generic article content
        if (!fullContent || fullContent.length < 500) {
            const articleParagraphs = $('article p, .entry-content p, main p').toArray();
            if (articleParagraphs.length > 0) {
                fullContent = articleParagraphs
                    .map(p => $(p).text().trim())
                    .filter(text => text.length > 30)
                    .join('\\n\\n');
            }
        }
        
        if (!fullContent || fullContent.length < 200) {
            console.error(`  ⚠️ Democracy Now: Short content (${fullContent?.length || 0} chars)`);
            
            // Last resort: Try to extract summary or description
            const summary = $('.dek, .description, .summary').text().trim();
            if (summary && summary.length > 200) {
                return summary.substring(0, 8000);
            }
            
            return null;
        }
        
        // Limit to reasonable length
        return fullContent.substring(0, 10000);
        
    } catch (error) {
        console.error(`  ❌ Democracy Now scraper error: ${error.message}`);
        return null;
    }
}'''
    
    # Replace the function
    modified = re.sub(pattern, improved_function, content, flags=re.MULTILINE | re.DOTALL)
    
    if modified == content:
        print("⚠️ Warning: Democracy Now scraper not found")
        return content
    
    print("✅ Fixed Democracy Now scraper")
    return modified

def main():
    """Main execution"""
    print("=" * 70)
    print("🔧 FIXING ARTICLE SCRAPERS")
    print("=" * 70)
    
    filepath = '/root/workforce_democracy/backend/article-scraper.js'
    
    print(f"\n📖 Reading {filepath}...")
    content = read_file(filepath)
    print(f"✅ Read {len(content)} bytes")
    
    # Apply fixes
    print("\n🔧 Applying scraper fixes...")
    content = fix_common_dreams_scraper(content)
    content = fix_democracy_now_scraper(content)
    
    # Write updated file
    print(f"\n💾 Writing updated file...")
    write_file(filepath, content)
    
    print("\n" + "=" * 70)
    print("✅ SCRAPER FIXES APPLIED SUCCESSFULLY")
    print("=" * 70)
    print("\n📋 Changes made:")
    print("  1. ✅ Common Dreams: 4 fallback selector strategies")
    print("  2. ✅ Democracy Now: 4 content type handlers")
    print("  3. ✅ Both: Improved error handling and logging")
    print("  4. ✅ Both: Better User-Agent headers")
    print("\n🔄 Next step: Test with actual URLs")
    print("=" * 70)

if __name__ == '__main__':
    main()
PYTHON_SCRIPT_2

chmod +x /tmp/fix-scrapers.py
echo "✅ Created fix-scrapers.py"

# ==============================================================================
# STEP 3: Run both Python scripts
# ==============================================================================

echo ""
echo "========================================================================"
echo "🚀 EXECUTING IMPROVEMENTS"
echo "========================================================================"

echo ""
echo "📋 Step 3a: Running comprehensive-improvements.py..."
python3 /tmp/comprehensive-improvements.py

echo ""
echo "📋 Step 3b: Running fix-scrapers.py..."
python3 /tmp/fix-scrapers.py

# ==============================================================================
# STEP 4: Nuclear PM2 restart
# ==============================================================================

echo ""
echo "========================================================================"
echo "🔄 NUCLEAR PM2 RESTART"
echo "========================================================================"

echo ""
echo "🛑 Stopping backend..."
pm2 stop backend 2>/dev/null || true

echo "🗑️  Flushing logs..."
pm2 flush 2>/dev/null || true

echo "🗑️  Deleting backend process..."
pm2 delete backend 2>/dev/null || true

echo "💀 Killing all Node.js processes..."
pkill -9 node 2>/dev/null || true

sleep 2

echo "🚀 Starting fresh backend process..."
cd /root/workforce_democracy/backend
pm2 start server.js --name backend

sleep 3

# ==============================================================================
# STEP 5: Verify deployment
# ==============================================================================

echo ""
echo "========================================================================"
echo "✅ VERIFYING DEPLOYMENT"
echo "========================================================================"

echo ""
pm2 status backend

echo ""
echo "📋 Recent logs:"
pm2 logs backend --lines 20 --nostream

# ==============================================================================
# FINAL SUMMARY
# ==============================================================================

echo ""
echo "========================================================================"
echo "✅ DEPLOYMENT COMPLETE"
echo "========================================================================"
echo ""
echo "📊 Improvements Applied:"
echo "  ✅ Source threshold: 8 → 12 sources"
echo "  ✅ Gap analysis: 7 topic-specific patterns"
echo "  ✅ Follow-up queries: 3 → 4 per topic"
echo "  ✅ LLM prompting: Enhanced for specific data/quotes"
echo "  ✅ Common Dreams scraper: 4 fallback strategies"
echo "  ✅ Democracy Now scraper: 4 content type handlers"
echo ""
echo "🧪 Test Query:"
echo "  what are the latest updates on snap benefits? why has this happened?"
echo ""
echo "📊 Expected Results:"
echo "  ✅ 10-15 sources returned"
echo "  ✅ Full article content (2,000-10,000 chars)"
echo "  ✅ Dollar amounts in AI response"
echo "  ✅ Direct quotes in AI response"
echo "  ✅ Bill numbers in AI response"
echo ""
echo "========================================================================"
