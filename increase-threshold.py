#!/usr/bin/env python3
"""
Increase source threshold from 8 to 12 in ai-service.js
This will allow the system to gather 10-15 sources per query instead of 4-5
"""

import re
import sys

# Read the file
with open('/root/progressive-policy-assistant/backend/ai-service.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the threshold in analyzeSourceGaps function
# Pattern: if (sources.length < 8) {
old_pattern = r'if \(sources\.length < 8\) \{'
new_pattern = r'if (sources.length < 12) {'

if re.search(old_pattern, content):
    content = re.sub(old_pattern, new_pattern, content)
    print("✅ Updated source threshold from 8 to 12")
else:
    print("⚠️ Pattern not found - searching for alternative patterns...")
    # Try to find the actual pattern
    gap_function = re.search(r'function analyzeSourceGaps.*?(?=\nfunction|\nmodule\.exports|\Z)', content, re.DOTALL)
    if gap_function:
        print("Found analyzeSourceGaps function:")
        print(gap_function.group(0)[:500])
    sys.exit(1)

# Write back
with open('/root/progressive-policy-assistant/backend/ai-service.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ File updated successfully")
