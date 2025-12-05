#!/bin/bash

###############################################################################
# Documentation Cleanup Script
# This script will organize all your documentation files into proper folders
###############################################################################

echo "🧹 Starting documentation cleanup..."

# Create organized folder structure
echo "📁 Creating folder structure..."
mkdir -p docs/{guides,deployment,fixes,session-notes,testing,archived}

# Move guides and documentation
echo "📖 Moving guides..."
mv *GUIDE*.md docs/guides/ 2>/dev/null
mv *SUMMARY*.md docs/guides/ 2>/dev/null
mv *README*.md docs/guides/ 2>/dev/null
mv *DOCUMENTATION*.md docs/guides/ 2>/dev/null
mv *REFERENCE*.md docs/guides/ 2>/dev/null
mv *HANDOVER*.md docs/guides/ 2>/dev/null

# Move deployment files
echo "🚀 Moving deployment files..."
mv *DEPLOY*.* docs/deployment/ 2>/dev/null
mv *DEPLOYMENT*.* docs/deployment/ 2>/dev/null
mv deploy-*.sh docs/deployment/ 2>/dev/null
mv deploy-*.py docs/deployment/ 2>/dev/null

# Move fix files
echo "🔧 Moving fix files..."
mv *FIX*.md docs/fixes/ 2>/dev/null
mv *BUGFIX*.md docs/fixes/ 2>/dev/null
mv *FIX*.sh docs/fixes/ 2>/dev/null
mv FIX-*.sh docs/fixes/ 2>/dev/null
mv fix-*.py docs/fixes/ 2>/dev/null
mv fix-*.sh docs/fixes/ 2>/dev/null

# Move session notes and status files
echo "📝 Moving session notes..."
mv *SESSION*.md docs/session-notes/ 2>/dev/null
mv *STATUS*.md docs/session-notes/ 2>/dev/null
mv *COMPLETE*.md docs/session-notes/ 2>/dev/null
mv *COMPLETE*.txt docs/session-notes/ 2>/dev/null

# Move test files
echo "🧪 Moving test files..."
mv test-*.html docs/testing/ 2>/dev/null
mv test-*.sh docs/testing/ 2>/dev/null
mv test-*.js docs/testing/ 2>/dev/null
mv *TEST*.md docs/testing/ 2>/dev/null
mv *TESTING*.md docs/testing/ 2>/dev/null

# Move version-specific files to archived
echo "📦 Moving version-specific files to archived..."
mv *v36.* docs/archived/ 2>/dev/null
mv *v37.* docs/archived/ 2>/dev/null
mv *V36.* docs/archived/ 2>/dev/null
mv *V37.* docs/archived/ 2>/dev/null
mv *V42*.* docs/archived/ 2>/dev/null
mv *V32*.* docs/archived/ 2>/dev/null
mv *V33*.* docs/archived/ 2>/dev/null
mv *V34*.* docs/archived/ 2>/dev/null
mv *V35*.* docs/archived/ 2>/dev/null

# Move analysis and diagnostic scripts
echo "🔍 Moving diagnostic files..."
mv *ANALYSIS*.md docs/archived/ 2>/dev/null
mv *AUDIT*.md docs/archived/ 2>/dev/null
mv *DIAGNOSTIC*.md docs/archived/ 2>/dev/null
mv *DEBUG*.md docs/archived/ 2>/dev/null
mv analyze-*.sh docs/archived/ 2>/dev/null
mv diagnose-*.sh docs/archived/ 2>/dev/null
mv check-*.sh docs/archived/ 2>/dev/null
mv verify-*.sh docs/archived/ 2>/dev/null

# Move command scripts
echo "⚡ Moving command scripts..."
mv *COMMAND*.sh docs/deployment/ 2>/dev/null
mv *COMMANDS*.txt docs/deployment/ 2>/dev/null
mv *COPY-PASTE*.txt docs/deployment/ 2>/dev/null
mv *COPY-PASTE*.sh docs/deployment/ 2>/dev/null

# Move old comparison and before/after files
echo "📊 Moving comparison files..."
mv *BEFORE*.md docs/archived/ 2>/dev/null
mv *AFTER*.md docs/archived/ 2>/dev/null
mv *COMPARISON*.md docs/archived/ 2>/dev/null
mv *VISUAL*.md docs/archived/ 2>/dev/null
mv *VISUAL*.txt docs/archived/ 2>/dev/null
mv *DIAGRAM*.md docs/archived/ 2>/dev/null

# Move emoji-prefixed documentation files
echo "🎯 Moving emoji-prefixed documentation..."
find . -maxdepth 1 -name "*-*.md" -type f -exec sh -c '
    for file; do
        if [[ "$file" =~ ^\./(🎯|📖|⚡|✅|🚀|📋|🔧|🎉|📊|⭐|📚|👉|🔍|⚠️|🚨|🧪|📝|📦|📄|🔥|🆘|🧹|🎨) ]]; then
            mv "$file" docs/archived/ 2>/dev/null
        fi
    done
' sh {} +

find . -maxdepth 1 -name "*-*.txt" -type f -exec sh -c '
    for file; do
        if [[ "$file" =~ ^\./(🎯|📖|⚡|✅|🚀|📋|🔧|🎉|📊|⭐|📚|👉|🔍|⚠️|🚨|🧪|📝|📦|📄|🔥|🆘|🧹|🎨) ]]; then
            mv "$file" docs/archived/ 2>/dev/null
        fi
    done
' sh {} +

# Move shell script tools to archived
echo "🛠️ Moving shell script tools..."
mv *SHOW*.sh docs/archived/ 2>/dev/null
mv *FIND*.sh docs/archived/ 2>/dev/null
mv *TRACE*.sh docs/archived/ 2>/dev/null
mv *NUCLEAR*.sh docs/archived/ 2>/dev/null
mv *AGGRESSIVE*.sh docs/archived/ 2>/dev/null

# Move backend-related archived files
echo "🗄️ Moving backend-related files..."
mv *BACKEND*.md docs/archived/ 2>/dev/null
mv *BACKEND*.txt docs/archived/ 2>/dev/null
mv backend-*.js docs/archived/ 2>/dev/null
mv backend-*.txt docs/archived/ 2>/dev/null
mv backend-*.sh docs/archived/ 2>/dev/null

# Move other cleanup and archiving files
echo "🗂️ Moving miscellaneous files..."
mv *CLEANUP*.md docs/archived/ 2>/dev/null
mv *ARCHIVE*.md docs/archived/ 2>/dev/null
mv cleanup-*.sh docs/archived/ 2>/dev/null
mv archive-*.sh docs/archived/ 2>/dev/null
mv *REMOVAL*.md docs/archived/ 2>/dev/null
mv remove-*.sh docs/archived/ 2>/dev/null

# Move remaining .txt documentation
echo "📄 Moving remaining documentation..."
mv *QUICK*.txt docs/archived/ 2>/dev/null
mv *START*.txt docs/archived/ 2>/dev/null
mv *STEP*.txt docs/archived/ 2>/dev/null

# Count results
echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Results:"
echo "   Guides:          $(ls -1 docs/guides/ 2>/dev/null | wc -l) files"
echo "   Deployment:      $(ls -1 docs/deployment/ 2>/dev/null | wc -l) files"
echo "   Fixes:           $(ls -1 docs/fixes/ 2>/dev/null | wc -l) files"
echo "   Session Notes:   $(ls -1 docs/session-notes/ 2>/dev/null | wc -l) files"
echo "   Testing:         $(ls -1 docs/testing/ 2>/dev/null | wc -l) files"
echo "   Archived:        $(ls -1 docs/archived/ 2>/dev/null | wc -l) files"
echo ""
echo "🎉 All documentation organized!"
echo ""
echo "📁 New structure:"
echo "   docs/"
echo "   ├── guides/         - Main documentation and guides"
echo "   ├── deployment/     - Deployment scripts and instructions"
echo "   ├── fixes/          - Bug fixes and patches"
echo "   ├── session-notes/  - Session summaries and status"
echo "   ├── testing/        - Test files and scripts"
echo "   └── archived/       - Historical and version-specific files"
echo ""
