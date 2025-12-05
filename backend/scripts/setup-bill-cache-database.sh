#!/bin/bash

# =====================================================================
# BILL ANALYSIS CACHE - PostgreSQL Setup Script
# Version: V37.17.0-BILL-CACHE
# Date: 2025-01-XX
# 
# This script sets up the PostgreSQL database for bill analysis caching
# =====================================================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🗄️  Bill Analysis Cache - Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 14+ first"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is installed${NC}"
echo ""

# Configuration (can be overridden by environment variables)
DB_NAME="${DB_NAME:-workforce_democracy}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "Database Configuration:"
echo "  - Database: $DB_NAME"
echo "  - User: $DB_USER"
echo "  - Host: $DB_HOST"
echo "  - Port: $DB_PORT"
echo ""

# Prompt for password
read -sp "Enter PostgreSQL password for user '$DB_USER': " DB_PASSWORD
echo ""
echo ""

# Export password for psql
export PGPASSWORD="$DB_PASSWORD"

# Test connection
echo "Testing database connection..."
if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT 1;" &> /dev/null; then
    echo -e "${RED}❌ Failed to connect to PostgreSQL${NC}"
    echo "Please check your credentials and try again"
    exit 1
fi

echo -e "${GREEN}✅ Connected to PostgreSQL${NC}"
echo ""

# Check if database exists
DB_EXISTS=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to continue and apply the schema? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 0
    fi
else
    echo "Creating database '$DB_NAME'..."
    if ! createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"; then
        echo -e "${RED}❌ Failed to create database${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Database created${NC}"
fi

echo ""
echo "Applying database schema..."

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SCHEMA_FILE="$SCRIPT_DIR/../database/bill-analysis-cache-schema.sql"

# Check if schema file exists
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_FILE${NC}"
    exit 1
fi

# Apply schema
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE"; then
    echo -e "${GREEN}✅ Schema applied successfully${NC}"
else
    echo -e "${RED}❌ Failed to apply schema${NC}"
    exit 1
fi

echo ""
echo "Verifying tables..."

# Count tables
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "
    SELECT COUNT(*) 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('bills_cache', 'bill_questions_cache', 'cache_metrics')
")

if [ "$TABLE_COUNT" = "3" ]; then
    echo -e "${GREEN}✅ All 3 tables created successfully${NC}"
    echo "   - bills_cache"
    echo "   - bill_questions_cache"
    echo "   - cache_metrics"
else
    echo -e "${YELLOW}⚠️  Expected 3 tables, found $TABLE_COUNT${NC}"
fi

echo ""
echo "Verifying views..."

# Count views
VIEW_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "
    SELECT COUNT(*) 
    FROM information_schema.views 
    WHERE table_schema = 'public' 
    AND table_name IN ('popular_bills', 'popular_questions', 'cache_performance_summary')
")

if [ "$VIEW_COUNT" = "3" ]; then
    echo -e "${GREEN}✅ All 3 views created successfully${NC}"
    echo "   - popular_bills"
    echo "   - popular_questions"
    echo "   - cache_performance_summary"
else
    echo -e "${YELLOW}⚠️  Expected 3 views, found $VIEW_COUNT${NC}"
fi

echo ""
echo "Verifying functions..."

# Count functions
FUNCTION_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "
    SELECT COUNT(*) 
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname IN ('extract_keywords', 'keyword_match_score', 'cleanup_expired_caches')
")

if [ "$FUNCTION_COUNT" = "3" ]; then
    echo -e "${GREEN}✅ All 3 functions created successfully${NC}"
    echo "   - extract_keywords"
    echo "   - keyword_match_score"
    echo "   - cleanup_expired_caches"
else
    echo -e "${YELLOW}⚠️  Expected 3 functions, found $FUNCTION_COUNT${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Database setup complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update your .env file with database credentials:"
echo "   DB_USER=$DB_USER"
echo "   DB_NAME=$DB_NAME"
echo "   DB_HOST=$DB_HOST"
echo "   DB_PORT=$DB_PORT"
echo "   DB_PASSWORD=<your-password>"
echo ""
echo "2. Start your backend server:"
echo "   cd backend"
echo "   npm install"  
echo "   npm start"
echo ""
echo "3. Test the bill analysis endpoint:"
echo "   curl -X POST http://localhost:3001/api/ai/bills/analyze \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"bill\": {\"id\": \"hr1234\", \"title\": \"Test Bill\", \"level\": \"federal\"}}'"
echo ""
echo "4. Monitor cache performance:"
echo "   psql -U $DB_USER -d $DB_NAME -c 'SELECT * FROM cache_performance_summary;'"
echo ""
echo "=========================================="

# Clear password from environment
unset PGPASSWORD
