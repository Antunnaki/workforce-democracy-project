#!/bin/bash

################################################################################
# Documentation Cleanup Script
# Organizes 900+ docs into clean archive structure
################################################################################

echo "=========================================================================="
echo "📚 DOCUMENTATION CLEANUP - ORGANIZING 900+ FILES"
echo "=========================================================================="
echo ""

# Create archive structure
echo "📁 Creating archive structure..."
mkdir -p docs/archive/2025-11/{deployment-guides,session-summaries,version-specific,test-files,emoji-files,summaries}
mkdir -p docs/scripts/{python,bash}
mkdir -p docs/backend-deployment
echo "✅ Archive structure created"
echo ""

# Count files before
BEFORE_COUNT=$(ls -1 | wc -l)
echo "📊 Files in root before cleanup: $BEFORE_COUNT"
echo ""

# Archive version-specific docs (V36, V37, etc.)
echo "🗂️  Archiving version-specific documentation..."
find . -maxdepth 1 -name "V*.md" -exec mv {} docs/archive/2025-11/version-specific/ \; 2>/dev/null
find . -maxdepth 1 -name "v37*.md" -exec mv {} docs/archive/2025-11/version-specific/ \; 2>/dev/null
find . -maxdepth 1 -name "*-v37*.md" -exec mv {} docs/archive/2025-11/version-specific/ \; 2>/dev/null
find . -maxdepth 1 -name "*-V3*.md" -exec mv {} docs/archive/2025-11/version-specific/ \; 2>/dev/null
echo "  ✓ Version-specific docs archived"

# Archive session-dated files
echo "🗂️  Archiving session-dated files..."
find . -maxdepth 1 -name "*-NOV-*-2025.md" -exec mv {} docs/archive/2025-11/session-summaries/ \; 2>/dev/null
find . -maxdepth 1 -name "*-SESSION-*.md" -exec mv {} docs/archive/2025-11/session-summaries/ \; 2>/dev/null
find . -maxdepth 1 -name "*-HANDOVER-*.md" ! -name "AI-HANDOVER-COMPLETE.md" -exec mv {} docs/archive/2025-11/session-summaries/ \; 2>/dev/null
echo "  ✓ Session docs archived"

# Archive duplicate deployment guides
echo "🗂️  Archiving duplicate deployment guides..."
find . -maxdepth 1 -name "DEPLOY-*.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "START-HERE-*.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "DEPLOYMENT-*.md" ! -name "DEPLOYMENT-CHECKLIST.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "READY-TO-*.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
echo "  ✓ Deployment guides archived"

# Archive emoji-prefixed files
echo "🗂️  Archiving emoji-prefixed files..."
find . -maxdepth 1 -name "🚀-*.md" -o -name "🚀-*.txt" -o -name "🚀-*.sh" | while read file; do
    mv "$file" docs/archive/2025-11/emoji-files/ 2>/dev/null
done
find . -maxdepth 1 -name "✅-*.md" -o -name "✅-*.txt" | while read file; do
    mv "$file" docs/archive/2025-11/emoji-files/ 2>/dev/null
done
find . -maxdepth 1 -name "📚-*.md" -o -name "📋-*.md" -o -name "📊-*.md" -o -name "📖-*.md" | while read file; do
    mv "$file" docs/archive/2025-11/emoji-files/ 2>/dev/null
done
find . -maxdepth 1 -name "🎯-*.md" -o -name "🎯-*.txt" -o -name "🎯-*.sh" | while read file; do
    mv "$file" docs/archive/2025-11/emoji-files/ 2>/dev/null
done
find . -maxdepth 1 -name "👉-*.md" -o -name "⚡-*.txt" -o -name "🔧-*.md" | while read file; do
    mv "$file" docs/archive/2025-11/emoji-files/ 2>/dev/null
done
echo "  ✓ Emoji files archived"

# Archive test/debug files
echo "🗂️  Archiving test and debug files..."
find . -maxdepth 1 -name "test-*.html" -exec mv {} docs/archive/2025-11/test-files/ \; 2>/dev/null
find . -maxdepth 1 -name "test-*.js" -exec mv {} docs/archive/2025-11/test-files/ \; 2>/dev/null
find . -maxdepth 1 -name "debug-*.html" -exec mv {} docs/archive/2025-11/test-files/ \; 2>/dev/null
find . -maxdepth 1 -name "debug-*.js" -exec mv {} docs/archive/2025-11/test-files/ \; 2>/dev/null
find . -maxdepth 1 -name "diagnostic-*.html" -exec mv {} docs/archive/2025-11/test-files/ \; 2>/dev/null
echo "  ✓ Test/debug files archived"

# Archive summaries
echo "🗂️  Archiving summary files..."
find . -maxdepth 1 -name "*-SUMMARY*.md" -exec mv {} docs/archive/2025-11/summaries/ \; 2>/dev/null
find . -maxdepth 1 -name "*-SUMMARY*.txt" -exec mv {} docs/archive/2025-11/summaries/ \; 2>/dev/null
find . -maxdepth 1 -name "*-COMPLETE*.md" ! -name "AI-HANDOVER-COMPLETE.md" ! -name "COMPREHENSIVE-IMPROVEMENTS.md" -exec mv {} docs/archive/2025-11/summaries/ \; 2>/dev/null
find . -maxdepth 1 -name "*-FINAL*.md" -exec mv {} docs/archive/2025-11/summaries/ \; 2>/dev/null
find . -maxdepth 1 -name "*-VISUAL*.txt" -exec mv {} docs/archive/2025-11/summaries/ \; 2>/dev/null
echo "  ✓ Summary files archived"

# Archive old scripts (keep current ones)
echo "🗂️  Archiving old deployment scripts..."
find . -maxdepth 1 -name "deploy-*.sh" ! -name "deploy-comprehensive-improvements.sh" -exec mv {} docs/scripts/bash/ \; 2>/dev/null
find . -maxdepth 1 -name "apply-*.sh" -exec mv {} docs/scripts/bash/ \; 2>/dev/null
find . -maxdepth 1 -name "fix-*.sh" -exec mv {} docs/scripts/bash/ \; 2>/dev/null
find . -maxdepth 1 -name "*.py" ! -name "comprehensive-improvements.py" ! -name "fix-scrapers.py" -exec mv {} docs/scripts/python/ \; 2>/dev/null
echo "  ✓ Old scripts archived"

# Archive backend deployment docs
echo "🗂️  Archiving backend deployment docs..."
find . -maxdepth 1 -name "BACKEND-*.md" -exec mv {} docs/backend-deployment/ \; 2>/dev/null
echo "  ✓ Backend docs organized"

# Archive miscellaneous files
echo "🗂️  Archiving miscellaneous files..."
find . -maxdepth 1 -name "FIX-*.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "BUGFIX-*.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "PHASE-*.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "*-GUIDE*.md" ! -name "PROJECT_MASTER_GUIDE.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
find . -maxdepth 1 -name "*-CHECKLIST*.md" ! -name "DEPLOYMENT-CHECKLIST.md" -exec mv {} docs/archive/2025-11/deployment-guides/ \; 2>/dev/null
echo "  ✓ Miscellaneous files archived"

# Create archive index
echo ""
echo "📝 Creating archive index..."
cat > docs/archive/README.md << 'EOF'
# 📚 Documentation Archive

This directory contains historical documentation from previous development sessions.

## 📁 Organization

### **2025-11/** - November 2025 Session
- **deployment-guides/** - Version-specific deployment instructions
- **session-summaries/** - Daily session handovers and summaries
- **version-specific/** - V36, V37 documentation
- **test-files/** - HTML/JS test and debug files
- **emoji-files/** - Emoji-prefixed quick-start guides
- **summaries/** - Session summaries and visual diagrams

## 🎯 Current Documentation

**See root directory for current docs:**
- `README.md` - Main overview
- `START-HERE.md` - Deployment guide
- `QUICK-REFERENCE.md` - Commands
- `PROJECT_MASTER_GUIDE.md` - Complete reference

## 📖 Finding Archived Files

Most archived files are **superseded** by current documentation.

If you need to reference old deployment methods:
1. Check `deployment-guides/` by date
2. Review `session-summaries/` for context
3. Compare with current `COMPREHENSIVE-IMPROVEMENTS.md`

## ⚠️ Important

**These files are historical** and may contain outdated paths, deprecated methods, or superseded approaches.

**Always use current documentation** in the root directory for active development.
EOF
echo "✅ Archive index created"

# Count files after
AFTER_COUNT=$(ls -1 | wc -l)
ARCHIVED_COUNT=$((BEFORE_COUNT - AFTER_COUNT))

echo ""
echo "=========================================================================="
echo "✅ CLEANUP COMPLETE!"
echo "=========================================================================="
echo ""
echo "📊 Results:"
echo "  Before:  $BEFORE_COUNT files in root"
echo "  After:   $AFTER_COUNT files in root"
echo "  Archived: $ARCHIVED_COUNT files"
echo ""
echo "📁 Archived files organized in:"
echo "  docs/archive/2025-11/deployment-guides/"
echo "  docs/archive/2025-11/session-summaries/"
echo "  docs/archive/2025-11/version-specific/"
echo "  docs/archive/2025-11/test-files/"
echo "  docs/archive/2025-11/emoji-files/"
echo "  docs/archive/2025-11/summaries/"
echo "  docs/scripts/python/"
echo "  docs/scripts/bash/"
echo ""
echo "📖 Essential docs remaining in root:"
ls -1 *.md *.sh 2>/dev/null | grep -E "^(README|START-HERE|QUICK-REFERENCE|PROJECT_MASTER_GUIDE|AI-HANDOVER-COMPLETE|DEPLOYMENT-CHECKLIST|COMPREHENSIVE-IMPROVEMENTS|HEREDOC-DEPLOYMENT-COMMANDS)" || echo "  (List essential files)"
echo ""
echo "✨ Your root directory is now clean and organized!"
echo "=========================================================================="
