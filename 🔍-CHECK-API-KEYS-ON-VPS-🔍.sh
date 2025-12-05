#!/bin/bash
# 🔍 Check API Keys on VPS 🔍

echo "═══════════════════════════════════════════════════"
echo "CHECKING API KEYS ON VPS"
echo "═══════════════════════════════════════════════════"
echo ""

# Check if .env file exists
echo "1. Checking if .env file exists..."
ssh root@185.193.126.13 "ls -la /var/www/workforce-democracy/backend/.env"
echo ""

# Check API keys in .env
echo "2. Checking API keys in .env file..."
ssh root@185.193.126.13 "grep -E 'CONGRESS_API_KEY|OPENSTATES_API_KEY|GOOGLE_CIVIC_API_KEY' /var/www/workforce-democracy/backend/.env"
echo ""

# Check if dotenv is installed
echo "3. Checking if dotenv package is installed..."
ssh root@185.193.126.13 "cd /var/www/workforce-democracy/backend && npm list dotenv"
echo ""

# Check server.js for dotenv loading
echo "4. Checking if server.js loads .env..."
ssh root@185.193.126.13 "head -20 /var/www/workforce-democracy/backend/server.js | grep -i dotenv"
echo ""

echo "═══════════════════════════════════════════════════"
echo "DIAGNOSTIC COMPLETE"
echo "═══════════════════════════════════════════════════"
