#!/usr/bin/env node

/**
 * 🔧 FIX DEEP RESEARCH CALL v37.18.4
 * 
 * Purpose: Insert missing searchCongressGovBills() call
 * Target: deep-research.js
 * Location: Inside searchRepresentativeVotingRecord function
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Applying Deep Research fix v37.18.4...\n');

const FILE_PATH = path.join(__dirname, 'deep-research.js');

// Check if file exists
if (!fs.existsSync(FILE_PATH)) {
  console.error('❌ ERROR: deep-research.js not found');
  process.exit(1);
}

// Read the file
let content = fs.readFileSync(FILE_PATH, 'utf8');

// Check if fix is already applied
if (content.includes('await searchCongressGovBills')) {
  console.log('✅ Fix already applied! searchCongressGovBills is being called.');
  process.exit(0);
}

console.log('🔍 Locating insertion point...\n');

// Find the searchRepresentativeVotingRecord function
const functionStart = 'async function searchRepresentativeVotingRecord';
const insertionMarker = 'let allSources = [];';

if (!content.includes(functionStart)) {
  console.error('❌ ERROR: Could not find searchRepresentativeVotingRecord function');
  process.exit(1);
}

if (!content.includes(insertionMarker)) {
  console.error('❌ ERROR: Could not find insertion point (let allSources = [];)');
  process.exit(1);
}

console.log('✅ Found insertion point\n');
console.log('📝 Inserting searchCongressGovBills() call...\n');

// The code to insert
const codeToInsert = `
  // v37.18.4: Search Congress.gov for bills sponsored by representative
  console.log(\`[Deep Research] Searching Congress.gov for bills sponsored by \${sponsorName}...\`);
  const congressBills = await searchCongressGovBills(sponsorName, query);
  if (congressBills && congressBills.length > 0) {
    console.log(\`[Deep Research] Found \${congressBills.length} Congress.gov bills\`);
    allSources.push(...congressBills);
  }

  `;

// Insert the code right after "let allSources = [];"
const lines = content.split('\n');
const newLines = [];
let inserted = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  
  if (!inserted && lines[i].includes(insertionMarker)) {
    // Insert after this line
    newLines.push(codeToInsert);
    inserted = true;
    console.log(`✅ Inserted at line ${i + 1}\n`);
  }
}

if (!inserted) {
  console.error('❌ ERROR: Failed to insert code');
  process.exit(1);
}

// Write the modified content
const newContent = newLines.join('\n');
fs.writeFileSync(FILE_PATH, newContent, 'utf8');

console.log('✅ Fix applied successfully!\n');
console.log('📋 Changes made:');
console.log('   - Added call to searchCongressGovBills()');
console.log('   - Added console logging for debugging');
console.log('   - Congress.gov bills will now be included in Deep Research\n');

console.log('✨ deep-research.js has been updated!');
