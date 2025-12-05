#!/usr/bin/env python3
"""
Remove the entire civic engagement section from index.html
Lines 853-1550 (695 lines total)
"""

# Read the file
with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"📖 Original file: {len(lines)} lines")

# Keep lines before civic section (1-852)
# Skip civic section (853-1550) 
# Keep lines after civic section (1551+)

new_lines = []
new_lines.extend(lines[:852])  # Lines 1-852 (index 0-851)

# Add replacement comment
new_lines.append('\n')
new_lines.append('        <!-- CIVIC SECTION REMOVED - Visit civic-platform.html for advanced civic features -->\n')
new_lines.append('        <!-- Old civic engagement interface replaced with Civic Platform v37.0.0 -->\n')
new_lines.append('\n')

new_lines.extend(lines[1550:])  # Lines 1551+ (index 1550+)

print(f"📝 New file: {len(new_lines)} lines")
print(f"✂️  Removed: {len(lines) - len(new_lines)} lines")

# Create backup
with open('index.html.backup-civic-removal', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print(f"💾 Backup saved: index.html.backup-civic-removal")

# Write new file
with open('index.html', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print(f"✅ Civic section removed successfully!")

print("\n🎯 Summary:")
print(f"   • Removed lines 853-1550 (695 lines)")
print(f"   • Added replacement comment")
print(f"   • Navigation links already removed")
print("\n📦 Next steps:")
print("   1. Download index.html from this project")
print("   2. Upload to Netlify with civic-platform.html + civic/ folder")
print("   3. Test at workforcedemocracyproject.netlify.app")
