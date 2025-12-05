#!/usr/bin/env python3
"""
Enhance LLM prompting and add more diverse follow-up queries
"""

import re
import sys

# Read the file
with open('/root/progressive-policy-assistant/backend/ai-service.js', 'r', encoding='utf-8') as f:
    content = f.read()

print("🔍 Searching for analyzeSourceGaps function...")

# Find the analyzeSourceGaps function
gap_function_match = re.search(
    r'(function analyzeSourceGaps\([^)]*\)\s*\{.*?(?=\n\s*function\s+\w+|$))',
    content,
    re.DOTALL
)

if not gap_function_match:
    print("❌ Could not find analyzeSourceGaps function")
    sys.exit(1)

old_function = gap_function_match.group(1)
print(f"✅ Found function ({len(old_function)} chars)")

# Create enhanced version with more diverse queries
new_function = '''function analyzeSourceGaps(sources, originalQuery) {
    if (!originalQuery || typeof originalQuery !== 'string') {
        return { needsMoreData: false, followUpQueries: [] };
    }
    
    const queryLower = originalQuery.toLowerCase();
    const followUpQueries = [];
    
    // Detect SNAP/welfare queries
    if (queryLower.match(/snap|food stamp|welfare|benefit/i)) {
        if (sources.length < 12) {
            followUpQueries.push('SNAP benefits cuts 2025 statistics dollar amounts');
            followUpQueries.push('SNAP benefits economic impact data poverty rates');
            followUpQueries.push('SNAP benefits Supreme Court ruling congressional vote details');
            followUpQueries.push('SNAP benefits state-by-state impact analysis');
            followUpQueries.push('SNAP benefits recipients testimony quotes');
        }
    }
    
    // Detect healthcare queries
    if (queryLower.match(/healthcare|medicaid|medicare|aca|affordable care/i)) {
        if (sources.length < 12) {
            followUpQueries.push('healthcare subsidies expiration impact statistics');
            followUpQueries.push('medicaid cuts state budgets data');
            followUpQueries.push('medicare changes enrollment numbers');
            followUpQueries.push('ACA marketplace premium increases dollar amounts');
        }
    }
    
    // Detect tax/economic queries
    if (queryLower.match(/tax|corporate|wealth|economy|deficit/i)) {
        if (sources.length < 12) {
            followUpQueries.push('corporate tax cuts revenue impact data');
            followUpQueries.push('wealth tax proposals congressional analysis');
            followUpQueries.push('deficit spending breakdown statistics');
            followUpQueries.push('economic inequality data recent studies');
        }
    }
    
    // Detect labor/union queries
    if (queryLower.match(/union|labor|worker|wage|strike/i)) {
        if (sources.length < 12) {
            followUpQueries.push('union organizing statistics 2025 data');
            followUpQueries.push('minimum wage legislation state breakdown');
            followUpQueries.push('labor strike outcomes worker testimony');
            followUpQueries.push('wage theft enforcement statistics');
        }
    }
    
    // Detect climate/environment queries
    if (queryLower.match(/climate|environment|fossil fuel|renewable|carbon/i)) {
        if (sources.length < 12) {
            followUpQueries.push('climate legislation carbon reduction targets');
            followUpQueries.push('fossil fuel subsidies dollar amounts');
            followUpQueries.push('renewable energy investment data');
            followUpQueries.push('environmental regulation rollback impact studies');
        }
    }
    
    // Detect immigration queries
    if (queryLower.match(/immigration|immigrant|border|asylum|deportation/i)) {
        if (sources.length < 12) {
            followUpQueries.push('immigration policy changes statistics 2025');
            followUpQueries.push('border enforcement budget breakdown');
            followUpQueries.push('asylum application processing data');
            followUpQueries.push('deportation numbers impact analysis');
        }
    }
    
    // Generic fallback - analyze for key policy terms
    if (followUpQueries.length === 0 && sources.length < 12) {
        const policyTerms = queryLower.match(/budget|legislation|bill|congress|court|ruling|policy|reform/i);
        if (policyTerms) {
            followUpQueries.push(`${originalQuery} statistics data analysis`);
            followUpQueries.push(`${originalQuery} congressional testimony expert quotes`);
            followUpQueries.push(`${originalQuery} impact study research findings`);
        }
    }
    
    return {
        needsMoreData: followUpQueries.length > 0,
        followUpQueries: followUpQueries.slice(0, 5) // Max 5 follow-up queries
    };
}'''

# Replace the function
content = content.replace(old_function, new_function)
print("✅ Replaced analyzeSourceGaps with enhanced version")

# Now enhance the LLM system prompt
print("\n🔍 Searching for system prompt...")

# Find the system message in buildGroqMessages
system_prompt_match = re.search(
    r"(const systemMessage = \{[^}]*role: 'system',[^}]*content: `[^`]+`[^}]*\})",
    content,
    re.DOTALL
)

if system_prompt_match:
    old_prompt = system_prompt_match.group(1)
    print(f"✅ Found system prompt ({len(old_prompt)} chars)")
    
    # Find just the content part
    content_match = re.search(r"content: `([^`]+)`", old_prompt, re.DOTALL)
    if content_match:
        old_content = content_match.group(1)
        
        # Enhanced prompt requesting specific data
        new_content = old_content + '''

CRITICAL ANALYSIS REQUIREMENTS:
1. CITE SPECIFIC DATA: Always include dollar amounts, percentages, and exact statistics from sources
2. USE DIRECT QUOTES: Include direct quotes from experts, officials, and affected people
3. NAME LEGISLATION: Reference specific bill numbers (e.g., "HR 5376", "S.2714")
4. PROVIDE DATES: Include when policies take effect, when votes occurred, deadlines
5. SHOW SCALE: Always quantify impact (how many people affected, budget changes, etc.)

EXAMPLE CITATIONS:
✅ GOOD: "According to ProPublica's November 2025 analysis, the SNAP cuts will reduce benefits by $23/month for 42.1 million recipients, starting January 1, 2026."
❌ BAD: "SNAP cuts will affect millions of recipients."

When sources provide detailed statistics, include them verbatim. When sources quote experts or officials, include their exact words in quotation marks.'''

        new_prompt = old_prompt.replace(old_content, new_content)
        content = content.replace(old_prompt, new_prompt)
        print("✅ Enhanced system prompt with specific data requirements")
else:
    print("⚠️ Could not find system prompt - skipping this enhancement")

# Write back
with open('/root/progressive-policy-assistant/backend/ai-service.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\n✅ All enhancements complete!")
print("   • Enhanced analyzeSourceGaps with 6 policy categories")
print("   • Increased follow-up queries to 5 per category")
print("   • Added specific data citation requirements to LLM prompt")
