/**
 * CIVIC DATA EXTRACTION SCRIPT
 * This Node.js script extracts the sample data from civic.js lines 42-1854
 * and creates a properly formatted JSON file
 * 
 * Usage: node extract-civic-data.js
 */

const fs = require('fs');
const path = require('path');

// Read the civic.js file
const civicJsPath = path.join(__dirname, 'js', 'civic.js');
const civicJs = fs.readFileSync(civicJsPath, 'utf8');

// Split into lines
const lines = civicJs.split('\n');

// Extract lines 42-1854 (array indices 41-1853)
const dataLines = lines.slice(41, 1854);

// Join them back
let dataContent = dataLines.join('\n');

// Transform JavaScript to JSON
// Remove const declarations
dataContent = dataContent.replace(/^const\s+/gm, '');

// Find the main data objects and wrap them in JSON structure
// This requires careful regex to handle the structure

// Create JSON structure
const jsonData = {
    SAMPLE_COURT_DECISIONS: null,
    STATE_SUPREME_COURT_DECISIONS: null,
    SAMPLE_STATE_GOVERNMENT: null,
    SAMPLE_LOCAL_GOVERNMENT: null,
    SAMPLE_BILLS: null
};

// Try to eval the data in a safe context (since it's our own code)
try {
    // Create a context with the data
    eval(`
        ${dataContent}
        
        jsonData.SAMPLE_COURT_DECISIONS = SAMPLE_COURT_DECISIONS;
        jsonData.STATE_SUPREME_COURT_DECISIONS = STATE_SUPREME_COURT_DECISIONS;
        jsonData.SAMPLE_STATE_GOVERNMENT = SAMPLE_STATE_GOVERNMENT;
        jsonData.SAMPLE_LOCAL_GOVERNMENT = SAMPLE_LOCAL_GOVERNMENT;
        jsonData.SAMPLE_BILLS = SAMPLE_BILLS;
    `);
    
    // Write to JSON file
    const jsonPath = path.join(__dirname, 'data', 'civic-sample-data.json');
    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    console.log('✅ Successfully extracted civic data to data/civic-sample-data.json');
    console.log(`📊 File size: ${(fs.statSync(jsonPath).size / 1024).toFixed(1)}KB`);
    
} catch (error) {
    console.error('❌ Error extracting data:', error.message);
    console.error('This script needs to be run in a Node.js environment');
    process.exit(1);
}
