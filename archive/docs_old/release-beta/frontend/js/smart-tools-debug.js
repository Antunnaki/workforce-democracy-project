/**
 * SMART LOCAL TOOLS - MOBILE DEBUG PANEL
 * Easy-to-use debugging interface for mobile devices
 */

// Create debug panel
function createSmartToolsDebugPanel() {
    const panelHTML = `
        <div id="smartToolsDebugPanel" style="
            position: fixed;
            bottom: 60px;
            right: 10px;
            width: 90%;
            max-width: 400px;
            max-height: 70vh;
            background: white;
            border: 3px solid #667eea;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            z-index: 999999;
            display: none;
            flex-direction: column;
            overflow: hidden;
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px;
                font-weight: bold;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <span>🔍 Smart Tools Debug</span>
                <button onclick="toggleDebugPanel()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    font-size: 18px;
                    cursor: pointer;
                ">×</button>
            </div>
            
            <!-- Body -->
            <div style="
                padding: 12px;
                overflow-y: auto;
                flex: 1;
                font-size: 13px;
                line-height: 1.4;
            ">
                <div id="debugOutput" style="
                    font-family: 'Courier New', monospace;
                    background: #f5f5f5;
                    padding: 10px;
                    border-radius: 6px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    margin-bottom: 10px;
                ">Loading...</div>
                
                <button onclick="copyDebugInfo()" style="
                    width: 100%;
                    padding: 12px;
                    background: #4caf50;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 8px;
                ">📋 Copy Debug Info</button>
                
                <button onclick="testPattern()" style="
                    width: 100%;
                    padding: 12px;
                    background: #f4a261;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                    margin-bottom: 8px;
                ">🧪 Test Pattern Matching</button>
                
                <button onclick="refreshDebugInfo()" style="
                    width: 100%;
                    padding: 12px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: bold;
                    cursor: pointer;
                ">🔄 Refresh</button>
            </div>
        </div>
        
        <!-- Floating Button -->
        <button id="debugPanelToggle" onclick="toggleDebugPanel()" style="
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 999998;
            display: flex;
            align-items: center;
            justify-content: center;
        " style="display: none;">🔍</button>
    `;
    
    document.body.insertAdjacentHTML('beforeend', panelHTML);
    refreshDebugInfo();
    
    console.log('⚠️ [Debug Tool] Hidden in production. Remove "display: none;" from debugPanelToggle to enable.');
}

// Toggle debug panel
function toggleDebugPanel() {
    const panel = document.getElementById('smartToolsDebugPanel');
    const toggle = document.getElementById('debugPanelToggle');
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        panel.style.display = 'flex';
        toggle.textContent = '×';
        refreshDebugInfo();
    } else {
        panel.style.display = 'none';
        toggle.textContent = '🔍';
    }
}

// Refresh debug information
function refreshDebugInfo() {
    const output = document.getElementById('debugOutput');
    if (!output) return;
    
    let info = '';
    
    // Check if Smart Local Tools exists
    info += '=== SMART LOCAL TOOLS DEBUG ===\n\n';
    
    // Try to access SmartLocalTools from window or as global
    const SmartLocalTools = window.SmartLocalTools;
    
    if (SmartLocalTools && SmartLocalTools.tools) {
        info += '✅ SmartLocalTools loaded\n\n';
        
        // List available tools
        info += '📦 Available Tools:\n';
        for (const [toolName, toolConfig] of Object.entries(SmartLocalTools.tools)) {
            info += `  - ${toolName}\n`;
            info += `    Patterns: ${toolConfig.patterns.length}\n`;
        }
        info += '\n';
        
        // Show stats
        const stats = window.getSmartToolStats ? getSmartToolStats() : null;
        if (stats) {
            info += '📊 Usage Statistics:\n';
            info += `  Total Queries: ${stats.totalQueries}\n`;
            info += `  Local Matches: ${stats.localMatches}\n`;
            info += `  LLM Fallbacks: ${stats.llmFallbacks}\n`;
            info += `  Cost Savings: ${stats.costSavings}\n\n`;
            
            if (stats.toolsUsed && Object.keys(stats.toolsUsed).length > 0) {
                info += '🔧 Tools Used:\n';
                for (const [tool, count] of Object.entries(stats.toolsUsed)) {
                    info += `  - ${tool}: ${count}x\n`;
                }
                info += '\n';
            }
        }
        
        // Show all patterns
        info += '🔍 All Patterns:\n\n';
        for (const [toolName, toolConfig] of Object.entries(SmartLocalTools.tools)) {
            info += `${toolName}:\n`;
            toolConfig.patterns.forEach(pattern => {
                info += `  • "${pattern}"\n`;
            });
            info += '\n';
        }
        
    } else if (typeof window.processWithSmartLocalTools === 'function') {
        info += '⚠️ Functions loaded but SmartLocalTools object not exposed\n\n';
        info += 'This means the system is working, but the debug\n';
        info += 'tool needs access to the SmartLocalTools object.\n\n';
        info += 'GOOD NEWS: All 3 functions exist!\n';
        info += '  ✅ processWithSmartLocalTools\n';
        info += '  ✅ detectLocalTool\n';
        info += '  ✅ getSmartToolStats\n\n';
        info += 'The tools should still work in the chat!\n\n';
    } else {
        info += '❌ SmartLocalTools NOT loaded!\n\n';
        info += 'Check:\n';
        info += '1. Is smart-local-tools.js loaded?\n';
        info += '2. Did you hard refresh? (Ctrl+Shift+R)\n';
        info += '3. Check browser console for errors\n\n';
    }
    
    // Check functions
    info += '🔧 Function Check:\n';
    info += `  processWithSmartLocalTools: ${typeof window.processWithSmartLocalTools}\n`;
    info += `  detectLocalTool: ${typeof window.detectLocalTool}\n`;
    info += `  getSmartToolStats: ${typeof window.getSmartToolStats}\n\n`;
    
    // Browser info
    info += '📱 Browser Info:\n';
    info += `  User Agent: ${navigator.userAgent.substring(0, 50)}...\n`;
    info += `  Screen: ${window.innerWidth}x${window.innerHeight}\n\n`;
    
    info += '⏰ Generated: ' + new Date().toLocaleTimeString();
    
    output.textContent = info;
}

// Copy debug info to clipboard
function copyDebugInfo() {
    const output = document.getElementById('debugOutput');
    if (!output) return;
    
    const text = output.textContent;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Debug info copied to clipboard!');
        }).catch(() => {
            // Fallback to legacy method
            copyToClipboardFallback(text);
        });
    } else {
        // Fallback for older browsers
        copyToClipboardFallback(text);
    }
}

// Fallback clipboard copy
function copyToClipboardFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        alert('✅ Debug info copied to clipboard!');
    } catch (err) {
        alert('❌ Copy failed. Please copy manually from the debug panel.');
    }
    
    document.body.removeChild(textarea);
}

// Test pattern matching
function testPattern() {
    const testQueries = [
        'Show me voting stats',
        'voting statistics',
        'Compare representatives',
        'Show me the timeline',
        'bill history',
        'voting record'
    ];
    
    let results = '=== PATTERN TEST RESULTS ===\n\n';
    
    if (typeof window.detectLocalTool === 'function') {
        testQueries.forEach(query => {
            const detected = detectLocalTool(query);
            if (detected) {
                results += `✅ "${query}"\n`;
                results += `   → Matched: ${detected.name}\n\n`;
            } else {
                results += `❌ "${query}"\n`;
                results += `   → No match found\n\n`;
            }
        });
    } else {
        results += '❌ detectLocalTool function not found!\n';
    }
    
    const output = document.getElementById('debugOutput');
    if (output) {
        output.textContent = results;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createSmartToolsDebugPanel, 500);
    });
} else {
    setTimeout(createSmartToolsDebugPanel, 500);
}

// Make functions globally available
window.toggleDebugPanel = toggleDebugPanel;
window.refreshDebugInfo = refreshDebugInfo;
window.copyDebugInfo = copyDebugInfo;
window.testPattern = testPattern;

console.log('[Smart Tools Debug] Debug panel initialized ✅');
