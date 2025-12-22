#!/bin/bash
# 🚀 Source Count Fix Deployment - v37.8.0
# Date: November 9, 2025
# Fix: Remove source limits, add missing constants, simplify citation rules
# Method: Python script embedded as heredoc (paste entire file into SSH)

echo "🚀 Starting Source Count Fix Deployment..."
echo "📅 $(date)"
echo ""

# Create Python script that will make all the changes
cat > /tmp/fix_source_limits.py << 'PYTHON_SCRIPT_EOF'
#!/usr/bin/env python3
"""
Source Count Fix for Workforce Democracy Backend
Removes artificial limits on source gathering and citations
"""

import re
import sys

FILE_PATH = '/var/www/workforce-democracy/backend/ai-service.js'

print("🔧 Source Count Fix - v37.8.0")
print("=" * 60)

try:
    # Read the file
    print(f"📖 Reading {FILE_PATH}...")
    with open(FILE_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_content = content
    changes_made = []
    
    # =========================================================================
    # CHANGE 1: Add missing constants (after line 982)
    # =========================================================================
    print("\n🔨 Change 1: Adding missing SOURCE_THRESHOLD and MAX_SEARCH_ITERATIONS constants...")
    
    # Find the location (after scoreSourceRelevance function, around line 994)
    pattern1 = r"(    return score;\n}\n\n/\*\*\n \* Analyze source gaps)"
    replacement1 = r"    return score;\n}\n\n// V37.8.0: Source gathering thresholds\nconst SOURCE_THRESHOLD = 25; // Increased to allow more sources\nconst MAX_SEARCH_ITERATIONS = 4; // Maximum iteration loops\n\n/**\n * Analyze source gaps"
    
    if re.search(pattern1, content):
        content = re.sub(pattern1, replacement1, content)
        changes_made.append("✅ Added SOURCE_THRESHOLD = 25 and MAX_SEARCH_ITERATIONS = 4")
    else:
        print("  ⚠️  Pattern not found - constants may already exist or structure changed")
    
    # =========================================================================
    # CHANGE 2: Increase filterAndSortSources default limit (line 1042)
    # =========================================================================
    print("\n🔨 Change 2: Increasing filterAndSortSources default limit from 10 to 25...")
    
    pattern2 = r"function filterAndSortSources\(sources, query, maxResults = 10\)"
    replacement2 = "function filterAndSortSources(sources, query, maxResults = 25)"
    
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content)
        changes_made.append("✅ Changed filterAndSortSources default from 10 → 25")
    else:
        print("  ⚠️  Pattern not found - may already be changed or structure different")
    
    # =========================================================================
    # CHANGE 3: Increase searchAdditionalSources hardcoded limit (line 1172)
    # =========================================================================
    print("\n🔨 Change 3: Increasing searchAdditionalSources limit from 10 to 25...")
    
    pattern3 = r"const filteredSources = filterAndSortSources\(sources, userMessage, 10\);"
    replacement3 = "const filteredSources = filterAndSortSources(sources, userMessage, 25);"
    
    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content)
        changes_made.append("✅ Changed searchAdditionalSources limit from 10 → 25")
    else:
        print("  ⚠️  Pattern not found - may already be changed")
    
    # =========================================================================
    # CHANGE 4: Simplify LLM citation restrictions (lines 1428-1445)
    # =========================================================================
    print("\n🔨 Change 4: Simplifying restrictive LLM citation warnings...")
    
    # Find and replace the restrictive warning block
    pattern4 = r"""        prompt \+= `Web Search Results - YOU MUST USE THESE SOURCES FOR CITATIONS:\\n`;
        prompt \+= `🚨 CRITICAL: EXACTLY \$\{preFetchedSources\.length\} sources are available\. Use ONLY citations \[1\] through \[\$\{preFetchedSources\.length\}\]\.\\n`;
        prompt \+= `🚨 DO NOT use \[\$\{preFetchedSources\.length \+ 1\}\] or higher - those sources DO NOT EXIST\.\\n`;
        prompt \+= `🚨 Every citation MUST match a source below\. Users click citations - broken links = bad UX\.\\n\\n`;"""
    
    replacement4 = r"""        prompt += `📚 Web Search Results - ${preFetchedSources.length} Sources Available:\n`;
        prompt += `Use these sources in your response and cite them with [1], [2], [3]... notation.\n`;
        prompt += `Each citation [N] must correspond to a source listed below.\n\n`;"""
    
    if re.search(pattern4, content):
        content = re.sub(pattern4, replacement4, content)
        changes_made.append("✅ Simplified citation warnings (removed CRITICAL/DO NOT language)")
    else:
        print("  ⚠️  Pattern not found - warnings may be different")
    
    # =========================================================================
    # CHANGE 5: Remove final warning block (lines 1443-1445)
    # =========================================================================
    print("\n🔨 Change 5: Removing final LLM restriction warnings...")
    
    pattern5 = r"""        prompt \+= `\\n🚨 FINAL WARNING: You have EXACTLY \$\{preFetchedSources\.length\} sources\. Maximum citation allowed: \[\$\{preFetchedSources\.length\}\]\\n`;
        prompt \+= `🚨 If you use \[\$\{preFetchedSources\.length \+ 1\}\] or higher, you are HALLUCINATING\. Those sources don't exist\.\\n`;
        prompt \+= `🚨 Check your response: Count citations \[1\], \[2\], \[3\]\.\.\. If any number > \$\{preFetchedSources\.length\}, DELETE IT\.\\n\\n`;"""
    
    replacement5 = ""  # Remove these lines entirely
    
    if re.search(pattern5, content):
        content = re.sub(pattern5, replacement5, content)
        changes_made.append("✅ Removed final warning block (HALLUCINATION warnings)")
    else:
        print("  ⚠️  Pattern not found - may already be removed")
    
    # =========================================================================
    # CHANGE 6: Simplify system prompt citation rules (lines 1546-1576)
    # =========================================================================
    print("\n🔨 Change 6: Simplifying system prompt citation rules...")
    
    pattern6 = r"""SOURCES AND CITATIONS - CRITICAL RULES \(v37\.8\.0 - HALLUCINATION PREVENTION\):
🚨 \*\*STOP! READ THE SOURCE COUNT ABOVE FIRST!\*\* 🚨
The prompt above says "EXACTLY N sources are available" - that's your MAXIMUM citation number\.

• \*\*RULE 1: COUNT SOURCES FIRST\*\* - Look for "Web Search Results" section above
• \*\*RULE 2: MAXIMUM CITATION = SOURCE COUNT\*\* - If 4 sources, highest citation is \[4\]
• \*\*RULE 3: NEVER HALLUCINATE CITATIONS\*\* - Don't create \[5\] \[6\] \[7\] if only 4 sources exist
• \*\*RULE 4: EACH \[N\] MUST MATCH A SOURCE\*\* - \[1\] = first source, \[2\] = second, etc\.
• \*\*RULE 5: NO SOURCES = NO CITATIONS\*\* - If 0 sources, don't use ANY \[N\] numbers

🚨 \*\*COMMON MISTAKE: Using more citations than sources provided\*\* 🚨
❌ WRONG: 4 sources provided, but you use \[1\] \[2\] \[3\] \[4\] \[5\] \[6\] \[7\] \[8\]
✅ CORRECT: 4 sources provided, so you use ONLY \[1\] \[2\] \[3\] \[4\]

CITATION VALIDATION CHECKLIST \(check BEFORE responding\):
1\. ✓ How many sources in "Web Search Results"\? \(Count the \[1\] \[2\] \[3\]\.\.\. above\)
2\. ✓ What's my MAXIMUM allowed citation\? \(It's the source count!\)
3\. ✓ Did I verify EVERY \[N\] I used has a matching source above\?
4\. ✓ Did I count my citations to ensure none exceed the maximum\?
5\. ✓ If NO sources provided, did I remove ALL \[N\] citation numbers\?

EXAMPLES:

EXAMPLE 1 - Two sources provided:
Context shows: "EXACTLY 2 sources are available\. Use ONLY \[1\] through \[2\]"
Context shows: "Web Search Results: \[1\] Al Jazeera, \[2\] Democracy Now"
✅ CORRECT: "Casualties in Gaza reached 30,000 \[1\]\. UN called for ceasefire \[2\]\."
   → Uses only \[1\] and \[2\] \(source count = 2\)
❌ WRONG: "Casualties reached 30,000 \[1\]\. UN called for ceasefire \[2\]\. Israel continues \[3\]\."
   → Uses \[3\] but only 2 sources exist! \[3\] is HALLUCINATED\."""
    
    replacement6 = """SOURCES AND CITATIONS - HOW TO USE THEM (v37.8.0):

• **RULE 1: MATCH CITATIONS TO SOURCES** - Each [N] must correspond to a source in "Web Search Results"
• **RULE 2: USE CITATIONS LIBERALLY** - Reference sources throughout your response
• **RULE 3: NO SOURCES = NO CITATIONS** - If 0 sources provided, don't use ANY [N] numbers
• **RULE 4: VERIFY BEFORE CITING** - Make sure the source you're citing actually supports your claim

EXAMPLES:

EXAMPLE 1 - Multiple sources provided:
✅ CORRECT: "Casualties in Gaza reached 30,000 [1]. UN called for ceasefire [2]. Aid blocked at borders [3]."
   → Each [N] references a specific source
❌ WRONG: "Casualties reached 30,000 [999]." 
   → [999] doesn't match any source number"""
    
    if re.search(pattern6, content):
        content = re.sub(pattern6, replacement6, content, flags=re.DOTALL)
        changes_made.append("✅ Simplified system prompt citation rules (removed maximum/hallucination warnings)")
    else:
        print("  ⚠️  Pattern not found - citation rules may be different")
    
    # =========================================================================
    # Check if any changes were made
    # =========================================================================
    if content == original_content:
        print("\n⚠️  No changes made - patterns may not match current code structure")
        print("   This could mean:")
        print("   1. Changes already applied")
        print("   2. Code structure has changed")
        print("   3. Regex patterns need adjustment")
        sys.exit(1)
    
    # =========================================================================
    # Write the modified content back
    # =========================================================================
    print("\n💾 Writing changes to file...")
    with open(FILE_PATH, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("\n✅ All changes applied successfully!")
    print("\n📋 Summary of changes:")
    for change in changes_made:
        print(f"   {change}")
    
    print("\n" + "=" * 60)
    print("✨ Fix complete! Next step: Restart PM2 backend")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    sys.exit(1)

PYTHON_SCRIPT_EOF

# Make the Python script executable
chmod +x /tmp/fix_source_limits.py

# Run the Python script
echo "🐍 Executing Python fix script..."
python3 /tmp/fix_source_limits.py

# Check if Python script succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Python script completed successfully!"
    echo ""
    echo "🔄 Now performing NUCLEAR PM2 restart..."
    echo "   (This clears Node.js module cache)"
    echo ""
    
    # Nuclear PM2 restart
    pm2 stop backend
    pm2 flush
    pm2 delete backend
    pkill -9 node
    
    echo "   Waiting 2 seconds for cleanup..."
    sleep 2
    
    cd /var/www/workforce-democracy/backend
    pm2 start server.js --name backend
    
    echo ""
    echo "✅ PM2 restart complete!"
    echo ""
    echo "🔍 Verifying changes..."
    echo ""
    
    # Verify changes
    echo "1. Checking for SOURCE_THRESHOLD constant:"
    grep -n "const SOURCE_THRESHOLD" /var/www/workforce-democracy/backend/ai-service.js | head -1
    
    echo ""
    echo "2. Checking filterAndSortSources limit:"
    grep -n "function filterAndSortSources.*maxResults = 25" /var/www/workforce-democracy/backend/ai-service.js
    
    echo ""
    echo "3. Checking searchAdditionalSources limit:"
    grep -n "filterAndSortSources(sources, userMessage, 25)" /var/www/workforce-democracy/backend/ai-service.js
    
    echo ""
    echo "4. Checking simplified citation prompt:"
    grep -n "📚 Web Search Results" /var/www/workforce-democracy/backend/ai-service.js
    
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Test with a SNAP query"
    echo "   2. Check console: document.querySelectorAll('.citation-link').length"
    echo "   3. Count sources shown at bottom"
    echo "   4. They should match now! 🎉"
    echo ""
else
    echo ""
    echo "❌ Python script failed!"
    echo "   Check error messages above"
    echo "   You may need to manually verify the changes"
    echo ""
fi
