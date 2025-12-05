#!/bin/bash
# Script to remove the entire civic section (lines 853-1550) from index.html

# Create backup
cp index.html index.html.backup-civic-removal

# Remove lines 853-1550 (the entire civic section)
sed -i.bak '853,1550d' index.html

# Add a replacement comment at line 853
sed -i '852a\
\
        <!-- CIVIC SECTION REMOVED - Visit civic-platform.html for advanced civic features -->\
        <!-- Old civic engagement interface has been replaced with Civic Platform v37.0.0 -->\
' index.html

echo "✅ Civic section removed successfully!"
echo "✅ Backup saved as: index.html.backup-civic-removal"
echo "✅ Lines 853-1550 (695 lines) deleted"
echo ""
echo "Next steps:"
echo "1. Review the changes in index.html"
echo "2. Upload index.html + civic-platform.html + civic/ folder to Netlify"
echo "3. Test the site"
