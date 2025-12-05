#!/bin/bash

# Quick Fix Script for Chat Functionality
# Workforce Democracy Project

echo "=========================================="
echo "🔧 Chat Quick Fix Diagnostic"
echo "=========================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check 1: .env file exists
echo "1️⃣  Checking .env file..."
if [ -f "/var/www/workforce-democracy/backend/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check if GROQ_API_KEY is set
    if grep -q "^GROQ_API_KEY=gsk_" /var/www/workforce-democracy/backend/.env; then
        echo -e "${GREEN}✅ GROQ_API_KEY is configured${NC}"
    else
        echo -e "${RED}❌ GROQ_API_KEY missing or invalid${NC}"
        echo -e "${YELLOW}   → Get your key at: https://console.groq.com${NC}"
        echo -e "${YELLOW}   → Add to /var/www/workforce-democracy/backend/.env${NC}"
        echo ""
        echo "Do you want to add your GROQ_API_KEY now? (y/n)"
        read -r add_key
        if [ "$add_key" = "y" ]; then
            echo "Enter your GROQ API key (starts with gsk_):"
            read -r api_key
            echo "GROQ_API_KEY=$api_key" >> /var/www/workforce-democracy/backend/.env
            echo -e "${GREEN}✅ API key added!${NC}"
        fi
    fi
else
    echo -e "${RED}❌ .env file not found${NC}"
    echo -e "${YELLOW}   Creating from template...${NC}"
    cp /var/www/workforce-democracy/backend/.env.example /var/www/workforce-democracy/backend/.env
    echo -e "${GREEN}✅ Created .env from template${NC}"
    echo -e "${YELLOW}   ⚠️  You need to add your GROQ_API_KEY${NC}"
    echo "Enter your GROQ API key (starts with gsk_), or press Enter to skip:"
    read -r api_key
    if [ -n "$api_key" ]; then
        sed -i "s/your_groq_api_key_here/$api_key/" /var/www/workforce-democracy/backend/.env
        echo -e "${GREEN}✅ API key configured!${NC}"
    fi
fi

echo ""

# Check 2: Backend server running
echo "2️⃣  Checking backend server..."
if pm2 list | grep -q "workforce-backend.*online"; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server not running${NC}"
    echo -e "${YELLOW}   Starting backend...${NC}"
    cd /var/www/workforce-democracy/backend
    pm2 start server.js --name workforce-backend
    pm2 save
    sleep 2
    if pm2 list | grep -q "workforce-backend.*online"; then
        echo -e "${GREEN}✅ Backend started successfully!${NC}"
    else
        echo -e "${RED}❌ Failed to start backend. Check logs with: pm2 logs workforce-backend${NC}"
    fi
fi

echo ""

# Check 3: Backend health
echo "3️⃣  Testing backend health endpoint..."
health_response=$(curl -s -o /dev/null -w "%{http_code}" https://api.workforcedemocracyproject.org/health)
if [ "$health_response" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${RED}❌ Backend health check failed (HTTP $health_response)${NC}"
    echo -e "${YELLOW}   → Check Nginx configuration${NC}"
    echo -e "${YELLOW}   → Check backend logs: pm2 logs workforce-backend${NC}"
fi

echo ""

# Check 4: LLM health
echo "4️⃣  Testing LLM service..."
llm_health=$(curl -s https://api.workforcedemocracyproject.org/api/civic/llm-health 2>/dev/null | grep -o '"available":true')
if [ -n "$llm_health" ]; then
    echo -e "${GREEN}✅ LLM service is available${NC}"
else
    echo -e "${RED}❌ LLM service not available${NC}"
    echo -e "${YELLOW}   → Check GROQ_API_KEY in .env${NC}"
    echo -e "${YELLOW}   → Restart backend: pm2 restart workforce-backend${NC}"
fi

echo ""

# Check 5: Test actual chat
echo "5️⃣  Testing chat endpoint..."
chat_test=$(curl -X POST https://api.workforcedemocracyproject.org/api/civic/llm-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "test", "context": "general", "conversationHistory": []}' \
  -s 2>/dev/null | grep -o '"success":true')

if [ -n "$chat_test" ]; then
    echo -e "${GREEN}✅ Chat endpoint working!${NC}"
    echo -e "${GREEN}   Your chat should now work on the website.${NC}"
else
    echo -e "${RED}❌ Chat endpoint test failed${NC}"
    echo -e "${YELLOW}   Checking recent logs...${NC}"
    pm2 logs workforce-backend --lines 10 --nostream
fi

echo ""
echo "=========================================="
echo "🏁 Diagnostic Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If any checks failed, follow the suggestions above"
echo "2. For detailed debugging, see: CHAT-TROUBLESHOOTING-GUIDE.md"
echo "3. Check backend logs: pm2 logs workforce-backend"
echo "4. Test on website: https://workforcedemocracyproject.org"
echo ""
