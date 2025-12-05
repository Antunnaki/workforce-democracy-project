#!/bin/bash
# Trace what's actually being sent to the LLM

echo "=========================================="
echo "TRACING ACTUAL LLM CALL"
echo "=========================================="
echo ""

cd /var/www/workforce-democracy/backend

echo "1️⃣ First, let's add debug logging to see the ACTUAL prompt"
echo "   Creating a test to see what analyzeWithAI receives..."
echo ""

# Check if analyzeWithAI logs the prompt
echo "2️⃣ Searching for console.log in analyzeWithAI function:"
echo ""
grep -n "console.log.*prompt\|console.log.*messages\|console.log.*User Question" ai-service.js | head -10
echo ""

echo "3️⃣ Let's check the ACTUAL Groq API call to see what's sent:"
echo ""
grep -n "groq.chat.completions.create\|messages:" ai-service.js | head -20
echo ""

echo "4️⃣ Showing the analyzeWithAI function where Groq is called (lines 1100-1200):"
echo ""
sed -n '1100,1200p' ai-service.js | cat -n
echo ""

echo "=========================================="
