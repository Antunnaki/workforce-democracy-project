#!/usr/bin/env python3
"""
Properly fix the needsCurrentInfo() function to add policy keywords.
This Python script will correctly insert the code INSIDE the function.
"""

import re
import sys

def fix_ai_service(filename):
    """Add policy keywords to needsCurrentInfo() function."""
    
    print(f"📖 Reading {filename}...")
    with open(filename, 'r') as f:
        lines = f.readlines()
    
    print(f"   Total lines: {len(lines)}")
    
    # Find the needsCurrentInfo function
    func_start = None
    func_end = None
    return_line = None
    
    for i, line in enumerate(lines):
        if 'function needsCurrentInfo' in line:
            func_start = i
            print(f"   Found needsCurrentInfo() at line {i+1}")
        
        if func_start is not None and return_line is None:
            if 'return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;' in line:
                if 'isPolicyQuery' not in line:  # Make sure we haven't already fixed it
                    return_line = i
                    print(f"   Found return statement at line {i+1}")
        
        if func_start is not None and func_end is None:
            if line.strip() == '}' and i > func_start + 5:
                func_end = i
                print(f"   Function ends at line {i+1}")
                break
    
    if return_line is None:
        # Check if it's already been fixed
        for i, line in enumerate(lines):
            if 'isPolicyQuery' in line and 'needsCurrentInfo' in ''.join(lines[max(0, i-50):i]):
                print("✅ Policy keywords already present!")
                return False
        
        print("❌ Could not find return statement to fix")
        return False
    
    # Check lines around return to make sure we're in the right place
    print(f"\n📋 Context (lines {return_line-2} to {return_line+2}):")
    for i in range(max(0, return_line-2), min(len(lines), return_line+3)):
        print(f"   {i+1}: {lines[i].rstrip()}")
    
    # Insert the policy keywords code BEFORE the return statement
    policy_code = [
        "    // Policy and benefits queries (SNAP, welfare, healthcare, etc.) - v37.6.1\n",
        "    const isPolicyQuery = messageLower.match(\n",
        "        /snap|food stamp|benefit|welfare|medicaid|medicare|social security|unemployment|housing assistance|policy|cut|reduce|increase|expand|program|assistance|aid|support|subsidy/\n",
        "    );\n",
        "    \n"
    ]
    
    # Update the return statement
    new_return = lines[return_line].replace(
        'return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov;',
        'return hasTemporalIndicator || admitsUnknown || isCampaignFinance || isCurrentEvent || isLocalGov || isPolicyQuery;'
    )
    
    # Build new content
    new_lines = lines[:return_line] + policy_code + [new_return] + lines[return_line+1:]
    
    # Create backup
    import shutil
    from datetime import datetime
    backup_name = filename.replace('.js', f'-BACKUP-python-fix-{datetime.now().strftime("%Y%m%d-%H%M%S")}.js')
    shutil.copy2(filename, backup_name)
    print(f"\n📦 Backup created: {backup_name}")
    
    # Write new content
    with open(filename, 'w') as f:
        f.writelines(new_lines)
    
    print(f"✅ Updated {filename}")
    
    # Show the result
    print(f"\n📋 Result (lines {return_line-2} to {return_line+8}):")
    for i in range(max(0, return_line-2), min(len(new_lines), return_line+9)):
        print(f"   {i+1}: {new_lines[i].rstrip()}")
    
    return True

if __name__ == '__main__':
    filename = '/var/www/workforce-democracy/backend/ai-service.js'
    
    print("🔧 Policy Keywords Fix Script")
    print("=" * 50)
    
    if fix_ai_service(filename):
        print("\n✅ Fix applied successfully!")
        print("\nNext steps:")
        print("  1. Test syntax: node -c ai-service.js")
        print("  2. Restart: pm2 restart backend")
        print("  3. Check logs: pm2 logs backend --lines 30")
    else:
        print("\n⚠️  No changes made")
