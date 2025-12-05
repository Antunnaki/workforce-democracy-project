#!/bin/bash

# Script to archive old documentation files
# This cleans up the project root by moving historical docs to an archive

ARCHIVE_DIR="/var/www/workforce-democracy/docs-archive-$(date +%Y%m%d)"

echo "Creating archive directory: $ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR"

cd /var/www/workforce-democracy

# Count files before
BEFORE_COUNT=$(ls -1 *.md *.txt *.sh 2>/dev/null | wc -l)
echo "Found $BEFORE_COUNT documentation files to archive"

# Move all markdown files (except README.md and AI-HANDOVER-CLEAN.md)
echo "Archiving .md files..."
find . -maxdepth 1 -type f -name "*.md" \
  ! -name "README.md" \
  ! -name "AI-HANDOVER-CLEAN.md" \
  -exec mv {} "$ARCHIVE_DIR/" \;

# Move all .txt files in root
echo "Archiving .txt files..."
find . -maxdepth 1 -type f -name "*.txt" -exec mv {} "$ARCHIVE_DIR/" \;

# Move deployment .sh scripts (keep archive-old-docs.sh)
echo "Archiving old .sh deployment scripts..."
find . -maxdepth 1 -type f -name "*.sh" \
  ! -name "archive-old-docs.sh" \
  -exec mv {} "$ARCHIVE_DIR/" \;

# Move test/debug HTML files from root
echo "Archiving test/debug HTML files..."
find . -maxdepth 1 -type f -name "test-*.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "debug-*.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "*-test.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "diagnostic-*.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "simple-*.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "netlify-*.html" -exec mv {} "$ARCHIVE_DIR/" \;

# Move debug JS files from root
echo "Archiving debug JavaScript files..."
find . -maxdepth 1 -type f -name "debug-*.js" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "test-*.js" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "extract-*.js" -exec mv {} "$ARCHIVE_DIR/" \;

# Move backup HTML files
echo "Archiving backup HTML files..."
find . -maxdepth 1 -type f -name "*-backup*.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "*-old*.html" -exec mv {} "$ARCHIVE_DIR/" \;
find . -maxdepth 1 -type f -name "*.html.backup*" -exec mv {} "$ARCHIVE_DIR/" \;

# Count files after
AFTER_COUNT=$(find "$ARCHIVE_DIR" -type f | wc -l)

echo ""
echo "================================"
echo "Archive Complete!"
echo "================================"
echo "Files archived: $AFTER_COUNT"
echo "Archive location: $ARCHIVE_DIR"
echo ""
echo "Kept in root:"
echo "  - README.md"
echo "  - AI-HANDOVER-CLEAN.md"
echo "  - index.html (main site)"
echo "  - All /css/, /js/, /backend/, /images/, /docs/ directories"
echo ""
echo "Your project root is now clean! 🎉"
