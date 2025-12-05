#!/bin/bash

# ============================================================================
# DEPLOYMENT SCRIPT - V36.11.18 ZIP Search Debug
# ============================================================================

echo "🚀 Starting deployment of V36.11.18 - ZIP Search Debug"
echo ""

# Set colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SERVER="root@185.193.126.13"
REMOTE_PATH="/var/www/workforce-democracy"
TEMP_DIR="/tmp/workforce-v36.11.18"

# Create temporary directory
echo -e "${BLUE}📁 Creating temporary directory...${NC}"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo -e "${GREEN}✅ Temporary directory created: $TEMP_DIR${NC}"
echo ""

# ============================================================================
# CREATE FILES LOCALLY
# ============================================================================

echo -e "${BLUE}📝 Creating files locally...${NC}"
echo ""

# ============================================================================
# FILE 1: test-zip-search.html
# ============================================================================

echo -e "${YELLOW}Creating test-zip-search.html...${NC}"

cat > test-zip-search.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ZIP Search Debug - Workforce Democracy</title>
    <link rel="stylesheet" href="css/community-services.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
            background: #f9fafb;
        }
        .debug-panel {
            background: #1f2937;
            color: #f3f4f6;
            padding: 1.5rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            font-family: 'Courier New', monospace;
            font-size: 0.875rem;
        }
        .debug-panel h3 {
            color: #60a5fa;
            margin-top: 0;
        }
        .test-cases {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }
        .test-case {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            border: 2px solid #e5e7eb;
            cursor: pointer;
            transition: all 0.2s;
        }
        .test-case:hover {
            border-color: #667eea;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }
        .test-case h4 {
            margin: 0 0 0.5rem 0;
            color: #1f2937;
        }
        .test-case p {
            margin: 0;
            color: #6b7280;
            font-size: 0.875rem;
        }
    </style>
</head>
<body>
    <h1 style="text-align: center; color: #1f2937; margin-bottom: 1rem;">🔍 ZIP Code Search Debug</h1>
    <p style="text-align: center; color: #6b7280; margin-bottom: 2rem;">Testing proximity-based nonprofit search</p>

    <!-- Debug Console -->
    <div class="debug-panel">
        <h3>📊 Debug Console</h3>
        <div id="debugConsole">
            <p style="color: #9ca3af;">Open browser console (F12) to see detailed logs...</p>
        </div>
    </div>

    <!-- Quick Test Cases -->
    <h2 style="color: #1f2937; margin-bottom: 1rem;">Quick Test Cases</h2>
    <div class="test-cases">
        <div class="test-case" onclick="testSearch('12061', 'food bank')">
            <h4>🗽 New York</h4>
            <p>ZIP: 12061</p>
            <p>Search: food bank</p>
        </div>
        <div class="test-case" onclick="testSearch('12061', 'food')">
            <h4>🗽 New York (Broader)</h4>
            <p>ZIP: 12061</p>
            <p>Search: food</p>
        </div>
        <div class="test-case" onclick="testSearch('90210', 'housing')">
            <h4>🌴 California</h4>
            <p>ZIP: 90210</p>
            <p>Search: housing</p>
        </div>
        <div class="test-case" onclick="testSearch('10001', 'legal aid')">
            <h4>🗽 Manhattan</h4>
            <p>ZIP: 10001</p>
            <p>Search: legal aid</p>
        </div>
        <div class="test-case" onclick="testSearch('60601', 'healthcare')">
            <h4>🏙️ Chicago</h4>
            <p>ZIP: 60601</p>
            <p>Search: healthcare</p>
        </div>
        <div class="test-case" onclick="testSearch('78701', 'community')">
            <h4>🤠 Texas</h4>
            <p>ZIP: 78701</p>
            <p>Search: community</p>
        </div>
    </div>

    <!-- Community Services Widget -->
    <div id="communityServicesWidget"></div>

    <script src="js/community-services.js"></script>
    <script>
        // Capture console logs and display them
        const originalLog = console.log;
        const originalError = console.error;
        const debugConsole = document.getElementById('debugConsole');
        
        function addDebugLine(type, ...args) {
            const line = document.createElement('div');
            line.style.color = type === 'error' ? '#f87171' : '#a5f3fc';
            line.style.marginBottom = '0.25rem';
            line.textContent = `[${new Date().toLocaleTimeString()}] ${args.join(' ')}`;
            debugConsole.appendChild(line);
            debugConsole.scrollTop = debugConsole.scrollHeight;
        }
        
        console.log = function(...args) {
            originalLog.apply(console, args);
            if (args.some(arg => typeof arg === 'string' && (arg.includes('🔍') || arg.includes('📦') || arg.includes('✅') || arg.includes('📊')))) {
                addDebugLine('log', ...args);
            }
        };
        
        console.error = function(...args) {
            originalError.apply(console, args);
            addDebugLine('error', ...args);
        };
        
        // Test function
        function testSearch(zip, keyword) {
            document.getElementById('zipCode').value = zip;
            document.getElementById('serviceKeyword').value = keyword;
            
            // Clear debug console
            debugConsole.innerHTML = `<p style="color: #9ca3af;">Testing: ZIP ${zip} + "${keyword}"</p>`;
            
            // Trigger search
            searchByLocation();
        }
        
        // Initial info
        console.log('🚀 Test page loaded. Click a test case or use the search form below.');
    </script>
</body>
</html>
HTMLEOF

echo -e "${GREEN}✅ test-zip-search.html created${NC}"
echo ""

# ============================================================================
# BACKUP AND UPLOAD
# ============================================================================

echo -e "${BLUE}📤 Uploading files to server...${NC}"
echo ""

# Test SSH connection first
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ssh -o ConnectTimeout=5 "$SERVER" "echo 'Connection successful'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
    echo ""
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    echo -e "${RED}Please make sure you can SSH to the server first${NC}"
    exit 1
fi

# Create backups on server
echo -e "${YELLOW}Creating backups on server...${NC}"
ssh "$SERVER" << 'SSHEOF'
cd /var/www/workforce-democracy
mkdir -p backups/v36.11.18
cp js/community-services.js backups/v36.11.18/community-services.js.backup 2>/dev/null || echo "No existing js file"
cp css/community-services.css backups/v36.11.18/community-services.css.backup 2>/dev/null || echo "No existing css file"
echo "✅ Backups created in /var/www/workforce-democracy/backups/v36.11.18/"
SSHEOF

echo -e "${GREEN}✅ Backups created${NC}"
echo ""

# Upload test-zip-search.html
echo -e "${YELLOW}Uploading test-zip-search.html...${NC}"
scp test-zip-search.html "$SERVER:$REMOTE_PATH/"
echo -e "${GREEN}✅ test-zip-search.html uploaded${NC}"
echo ""

# ============================================================================
# INSTRUCTIONS FOR REMAINING FILES
# ============================================================================

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}⚠️  IMPORTANT: Manual Step Required${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "I've uploaded the test page, but js/community-services.js and"
echo "css/community-services.css need to be updated manually because"
echo "they contain your existing code with modifications."
echo ""
echo -e "${GREEN}NEXT STEPS:${NC}"
echo ""
echo "1. Navigate to your project directory:"
echo "   cd '/Users/acejrowski/Desktop/AG/WORKFORCE DEMOCRACY PROJECT/SITE FILES'"
echo ""
echo "2. Upload the modified files:"
echo "   scp js/community-services.js $SERVER:$REMOTE_PATH/js/"
echo "   scp css/community-services.css $SERVER:$REMOTE_PATH/css/"
echo ""
echo "3. Test the debug page:"
echo "   http://185.193.126.13/test-zip-search.html"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}✅ Test page deployed successfully!${NC}"
echo ""

# Cleanup
cd ~
rm -rf "$TEMP_DIR"
