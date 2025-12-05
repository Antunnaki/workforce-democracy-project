#!/usr/bin/env python3
"""
Workforce Democracy Project - v37.5.0 Citation Fix Deployment Script
This script applies the citation mismatch fix to ai-service.js

What it does:
1. Creates backup of current ai-service.js
2. Applies v37.5.0 changes (pre-search sources before LLM call)
3. Restarts PM2 backend
4. Shows startup logs to verify the fix loaded

Usage: python3 apply-v37.5.0-citation-fix.py
"""

import os
import sys
import subprocess
from datetime import datetime
import shutil

# Colors for output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_step(step, message):
    print(f"{Colors.BLUE}🔧 Step {step}: {message}{Colors.ENDC}")

def print_success(message):
    print(f"{Colors.GREEN}   ✅ {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}   ⚠️  {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}   ❌ {message}{Colors.ENDC}")

def run_command(cmd, shell=False):
    """Run a command and return output"""
    try:
        if shell:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
        else:
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        print_error(f"Command failed: {e}")
        return None

def main():
    print(f"{Colors.HEADER}{'=' * 64}")
    print("  Workforce Democracy - v37.5.0 Citation Fix Deployment")
    print(f"{'=' * 64}{Colors.ENDC}\n")
    
    # Step 1: Navigate to backend directory
    backend_dir = "/var/www/workforce-democracy/backend"
    ai_service_file = os.path.join(backend_dir, "ai-service.js")
    
    if not os.path.exists(ai_service_file):
        print_error(f"ai-service.js not found at {ai_service_file}")
        sys.exit(1)
    
    os.chdir(backend_dir)
    print_success(f"Working directory: {backend_dir}\n")
    
    # Step 2: Create backup
    print_step(1, "Creating backup...")
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_file = f"ai-service-BACKUP-pre-v37.5.0-{timestamp}.js"
    shutil.copy2(ai_service_file, backup_file)
    print_success(f"Backup created: {backup_file}\n")
    
    # Step 3: Read current file
    print_step(2, "Reading current ai-service.js...")
    with open(ai_service_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    print_success(f"Read {len(lines)} lines\n")
    
    # Step 4: Apply v37.5.0 changes
    print_step(3, "Applying v37.5.0 changes...")
    
    # Change 1: Update header version
    for i, line in enumerate(lines):
        if "WORKFORCE DEMOCRACY PROJECT - AI Service (CONSOLIDATED v37.1.0)" in line:
            lines[i] = line.replace("v37.1.0", "v37.5.0")
            print_success("Updated version header to v37.5.0")
            break
    
    # Change 2: Add v37.5.0 feature description
    for i, line in enumerate(lines):
        if "- From llm-proxy.js: Smart caching, NEWS_SOURCES, searchAdditionalSources" in line:
            lines.insert(i + 1, " * - v37.5.0: Pre-search sources BEFORE LLM call to fix citation mismatches")
            print_success("Added v37.5.0 feature description")
            break
    
    # Change 3: Add startup markers after header comment
    for i, line in enumerate(lines):
        if line.strip() == "*/" and i < 30:  # Header comment closing
            # Insert console.log statements after the closing comment
            insert_pos = i + 1
            new_lines = [
                "",
                "console.log('🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED - CITATION FIX ACTIVE 🚀🚀🚀');",
                "console.log('📅 File loaded at:', new Date().toISOString());",
                "console.log('✨ Features: Pre-search sources BEFORE LLM call to prevent citation mismatches');"
            ]
            for j, new_line in enumerate(new_lines):
                lines.insert(insert_pos + j, new_line)
            print_success("Added startup log markers")
            break
    
    # Change 4: Update buildContextualPrompt function signature
    for i, line in enumerate(lines):
        if "function buildContextualPrompt(query, context, chatType) {" in line:
            lines[i] = "function buildContextualPrompt(query, context, chatType, preFetchedSources = []) {"
            print_success("Updated buildContextualPrompt function signature")
            break
    
    # Change 5: Add pre-fetched sources to prompt (after governmentData section)
    for i, line in enumerate(lines):
        if "// Add government data if available" in line:
            # Find the closing brace (3 lines down typically)
            for j in range(i, min(i + 10, len(lines))):
                if lines[j].strip() == "}":
                    insert_pos = j + 1
                    presearch_section = """    
    // V37.5.0: Add pre-fetched sources (NEW!)
    // This is the critical fix - LLM now sees sources BEFORE generating response
    if (preFetchedSources && preFetchedSources.length > 0) {
        prompt += `Web Search Results - YOU MUST USE THESE SOURCES FOR CITATIONS:\\n`;
        prompt += `IMPORTANT: ${preFetchedSources.length} sources are available. Use ONLY citations [1] through [${preFetchedSources.length}].\\n\\n`;
        preFetchedSources.forEach((result, i) => {
            const sourceNum = i + 1;
            prompt += `[${sourceNum}] ${result.source || result.title}${result.trusted ? ' [TRUSTED]' : ''}\\n`;
            prompt += `    Title: ${result.title}\\n`;
            prompt += `    URL: ${result.url}\\n`;
            if (result.excerpt) {
                prompt += `    Excerpt: ${result.excerpt.substring(0, 200)}\\n`;
            }
            prompt += `\\n`;
        });
        prompt += `\\nREMEMBER: You have ${preFetchedSources.length} sources. Only use [1] through [${preFetchedSources.length}] in your response.\\n\\n`;
    }"""
                    lines.insert(insert_pos, presearch_section)
                    print_success("Added pre-fetched sources to LLM prompt")
                    break
            break
    
    # Change 6: Add Phase 1 pre-search (after systemPrompt declaration)
    for i, line in enumerate(lines):
        if "For NYC mayoral race or other local elections happening" in line and "you WILL receive up-to-date sources" in lines[i+1]:
            # Find the next line that's not part of the template string
            for j in range(i, min(i + 20, len(lines))):
                if "const response = await axios.post" in lines[j]:
                    insert_pos = j - 1
                    # Remove old code between systemPrompt and axios.post if it exists
                    # We'll insert the new Phase 1 code here
                    presearch_phase = """        
        // =============================================================================
        // PHASE 1: Search for sources FIRST (v37.5.0 FIX)
        // =============================================================================
        // This ensures LLM knows exactly which sources exist before generating citations
        let sources = [];
        
        try {
            // Preliminary check: does this query need sources?
            if (needsCurrentInfo(query, '')) {
                console.log(`🔍 Pre-searching sources before LLM call...`);
                sources = await searchAdditionalSources(query, query); // Use query twice since no LLM response yet
                console.log(`📚 Found ${sources.length} sources to provide to LLM`);
            } else {
                console.log(`ℹ️  Query doesn't need current sources, proceeding without pre-search`);
            }
        } catch (error) {
            console.error('⚠️ Pre-search failed (non-fatal):', error.message);
            sources = [];
        }
        
        // Also extract sources from context
        const contextSources = extractSources('', context);
        sources.push(...contextSources);
        
        // Deduplicate sources before passing to LLM
        const uniqueSources = [];
        const seenUrls = new Set();
        sources.forEach(source => {
            if (source.url && !seenUrls.has(source.url)) {
                // Validate URL (no search pages)
                if (!source.url.includes('/search?q=') && 
                    !source.url.includes('duckduckgo.com') && 
                    !source.url.includes('google.com/search')) {
                    seenUrls.add(source.url);
                    uniqueSources.push(source);
                }
            }
        });
        
        console.log(`✅ Providing ${uniqueSources.length} validated sources to LLM`);
        
        // Build user message with context AND pre-searched sources
        const userMessage = buildContextualPrompt(query, context, chatType, uniqueSources);
        
        console.log(`🤖 AI Query: "${query.substring(0, 50)}..." (context: ${chatType}, sources: ${uniqueSources.length})`);
        
        // =============================================================================
        // PHASE 2: Call LLM with sources already available
        // ============================================================================="""
                    lines.insert(insert_pos, presearch_phase)
                    print_success("Added Phase 1 pre-search and Phase 2 LLM call")
                    break
            break
    
    # Change 7: Update source return logic (after aiText assignment)
    for i, line in enumerate(lines):
        if "const aiText = response.data.choices[0].message.content;" in line:
            # Look for the section between aiText and the return statement
            # Replace old source extraction with new v37.5.0 logic
            insert_pos = i + 2  # After usage line
            new_source_logic = """        
        console.log(`✅ AI response: "${aiText.substring(0, 50)}..."`);
        
        // V37.5.0: Sources already validated and deduplicated before LLM call
        // LLM was given exactly these sources, so citations should match
        const validSources = uniqueSources; // Use the same sources we gave to LLM
        
        console.log(`✅ Returning ${validSources.length} sources (same as provided to LLM)`);"""
            
            # Find and remove old source extraction code
            for j in range(i + 1, min(i + 50, len(lines))):
                if "return {" in lines[j]:
                    # Delete lines between i+2 and j-1
                    del lines[i+2:j]
                    # Insert new logic
                    lines.insert(i+2, new_source_logic)
                    print_success("Updated source return logic")
                    break
            break
    
    # Change 8: Update buildContextualPrompt comment
    for i, line in enumerate(lines):
        if "Build contextual prompt with available data" in line and "V37.5.0" not in lines[i+1]:
            lines.insert(i + 1, " * V37.5.0: Now includes pre-searched sources so LLM knows what to cite")
            print_success("Updated buildContextualPrompt comment")
            break
    
    print()
    
    # Step 5: Write updated file
    print_step(4, "Writing updated ai-service.js...")
    updated_content = '\n'.join(lines)
    with open(ai_service_file, 'w', encoding='utf-8') as f:
        f.write(updated_content)
    print_success(f"File updated successfully\n")
    
    # Step 6: Verify changes
    print_step(5, "Verifying changes...")
    with open(ai_service_file, 'r', encoding='utf-8') as f:
        verify_content = f.read()
    
    checks = [
        ("v37.5.0 version marker", "v37.5.0" in verify_content),
        ("Startup rockets", "🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED" in verify_content),
        ("Pre-search code", "Pre-searching sources before LLM call" in verify_content),
        ("Phase 1 comment", "PHASE 1: Search for sources FIRST" in verify_content),
        ("Updated function signature", "buildContextualPrompt(query, context, chatType, preFetchedSources = [])" in verify_content),
    ]
    
    all_passed = True
    for check_name, passed in checks:
        if passed:
            print_success(f"{check_name} found")
        else:
            print_error(f"{check_name} NOT found")
            all_passed = False
    
    if not all_passed:
        print_error("\nSome checks failed! Restoring from backup...")
        shutil.copy2(backup_file, ai_service_file)
        print_warning(f"Restored from {backup_file}")
        sys.exit(1)
    
    print()
    
    # Step 7: Restart PM2
    print_step(6, "Restarting PM2 backend...")
    run_command("pm2 stop backend", shell=True)
    run_command("pm2 delete backend", shell=True)
    run_command("pm2 start server.js --name backend", shell=True)
    print_success("PM2 restarted\n")
    
    # Step 8: Show logs
    print_step(7, "Checking startup logs for v37.5.0 markers...")
    import time
    time.sleep(2)
    print()
    print(f"{Colors.HEADER}{'=' * 64}{Colors.ENDC}")
    logs = run_command("pm2 logs backend --lines 30 --nostream", shell=True)
    if logs:
        print(logs)
    print(f"{Colors.HEADER}{'=' * 64}{Colors.ENDC}\n")
    
    # Check for success
    if logs and "🚀🚀🚀 AI-SERVICE.JS v37.5.0 LOADED" in logs:
        print(f"{Colors.GREEN}✅ SUCCESS! v37.5.0 citation fix is now active!{Colors.ENDC}\n")
        print("Expected behaviors:")
        print("  • LLM now receives sources BEFORE generating response")
        print("  • Citations [1] through [N] will match exactly N sources provided")
        print("  • No more citation/source mismatches\n")
        print("Test the chat now and check logs for:")
        print("  🔍 Pre-searching sources before LLM call...")
        print("  📚 Found X sources to provide to LLM")
        print("  ✅ Providing X validated sources to LLM")
        print(f"  🤖 AI Query: \"...\" (context: general, sources: X)\n")
    else:
        print_warning("v37.5.0 startup markers not found in logs")
        print_warning("The changes were applied to the file, but may not be loading correctly.")
        print("Please check the full logs with: pm2 logs backend\n")
    
    print(f"Backup saved as: {backup_file}")
    print(f"To rollback if needed: cp {backup_file} ai-service.js && pm2 restart backend\n")
    print(f"{Colors.HEADER}{'=' * 64}{Colors.ENDC}")

if __name__ == "__main__":
    main()
