#!/usr/bin/env node

/**
 * 🔧 FIX CIVIC-LLM-ASYNC v37.18.5
 * 
 * CRITICAL BUG: civic-llm-async.js calls aiService.generateResponse() 
 * but that function doesn't exist!
 * 
 * Correct function: aiService.analyzeWithAI()
 * 
 * This bug causes:
 * - No sources returned to frontend
 * - "I searched for current sources but didn't find..." message
 * - Citations not showing up
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing civic-llm-async.js v37.18.5...\n');

const FILE_PATH = path.join(__dirname, 'civic-llm-async.js');

// Check if file exists
if (!fs.existsSync(FILE_PATH)) {
  console.error('❌ ERROR: civic-llm-async.js not found');
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(FILE_PATH, 'utf8');

// Check current state
if (content.includes('aiService.analyzeWithAI')) {
  console.log('✅ Fix already applied! Using analyzeWithAI()');
  process.exit(0);
}

if (!content.includes('aiService.generateResponse')) {
  console.error('❌ ERROR: Expected code pattern not found');
  console.error('   Looking for: aiService.generateResponse');
  process.exit(1);
}

console.log('🔍 Found incorrect function call: aiService.generateResponse\n');
console.log('📝 Applying fix...\n');

// Replace the incorrect function call
content = content.replace(
  /aiService\.generateResponse\(/g,
  'aiService.analyzeWithAI('
);

// Write the fixed content
fs.writeFileSync(FILE_PATH, content, 'utf8');

console.log('✅ Fix applied successfully!\n');
console.log('📋 Changes made:');
console.log('   - Changed: aiService.generateResponse()');
console.log('   → To: aiService.analyzeWithAI()');
console.log('');
console.log('🎯 Impact:');
console.log('   - Sources will now be returned to frontend');
console.log('   - Citations will appear in AI responses');
console.log('   - Congress.gov bills will show up');
console.log('   - "I searched for current sources..." message will disappear');
console.log('');
console.log('✨ civic-llm-async.js has been updated!');
