#!/bin/bash

#################################################
# 🔍 DIAGNOSE CIVIC-LLM-ASYNC v37.18.5
# Checks if civic-llm-async.js has the correct function call
#################################################

echo ""
echo "🔍 DIAGNOSING civic-llm-async.js..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

FILE="civic-llm-async.js"

if [ ! -f "$FILE" ]; then
  echo "❌ ERROR: $FILE not found in current directory!"
  echo "   Current directory: $(pwd)"
  exit 1
fi

echo "✅ Found: $FILE"
echo ""

# Check for INCORRECT function call
if grep -q "aiService\.generateResponse" "$FILE"; then
  echo "❌ PROBLEM DETECTED!"
  echo ""
  echo "   Found: aiService.generateResponse()"
  echo "   This function DOES NOT EXIST in ai-service.js!"
  echo ""
  echo "   Correct function: aiService.analyzeWithAI()"
  echo ""
  echo "📍 Location:"
  grep -n "aiService\.generateResponse" "$FILE"
  echo ""
  echo "🔧 FIX NEEDED: Run FIX-CIVIC-LLM-ASYNC-v37.18.5.js"
  echo ""
  exit 1
fi

# Check for CORRECT function call
if grep -q "aiService\.analyzeWithAI" "$FILE"; then
  echo "✅ CORRECT FUNCTION CALL DETECTED!"
  echo ""
  echo "   Using: aiService.analyzeWithAI()"
  echo "   This is the correct function! ✅"
  echo ""
  echo "📍 Location:"
  grep -n "aiService\.analyzeWithAI" "$FILE"
  echo ""
  echo "✨ civic-llm-async.js is properly configured!"
  echo ""
  exit 0
fi

echo "⚠️  WARNING: Neither function call found!"
echo "   Expected: aiService.generateResponse OR aiService.analyzeWithAI"
echo ""
echo "   This might indicate:"
echo "   - Wrong file version"
echo "   - File has been modified"
echo "   - Different code structure"
echo ""
exit 1
