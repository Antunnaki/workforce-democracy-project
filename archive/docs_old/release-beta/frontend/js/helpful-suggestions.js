/**
 * Helpful Suggestions System
 * 
 * Detects common issues from user messages and suggests fixes.
 * 100% privacy-respecting, no AI needed, transparent to users.
 * 
 * Philosophy: Empower users with knowledge, don't auto-fix without consent.
 */

const COMMON_ISSUES = {
  // Chat-related issues
  'chat not opening': {
    fix: 'Clear your browser cache',
    steps: [
      'Press Ctrl+Shift+Delete (PC) or Cmd+Shift+Delete (Mac)',
      'Select "Cached images and files"',
      'Click "Clear data"',
      'Refresh this page'
    ],
    autoFixable: false
  },
  
  'chat not working': {
    fix: 'Clear your browser cache',
    steps: [
      'Press Ctrl+Shift+Delete (PC) or Cmd+Shift+Delete (Mac)',
      'Select "Cached images and files"',
      'Click "Clear data"',
      'Refresh this page'
    ],
    autoFixable: false
  },
  
  'chat frozen': {
    fix: 'Refresh the page',
    steps: [
      'Press Ctrl+R (PC) or Cmd+R (Mac)',
      'Or click the refresh button in your browser'
    ],
    autoFixable: false
  },
  
  // Button issues
  'button not working': {
    fix: 'Try a hard refresh',
    steps: [
      'Press Ctrl+Shift+R (PC) or Cmd+Shift+R (Mac)',
      'This reloads without cache'
    ],
    autoFixable: false
  },
  
  'buttons not clickable': {
    fix: 'Try a hard refresh',
    steps: [
      'Press Ctrl+Shift+R (PC) or Cmd+Shift+R (Mac)',
      'This reloads without cache'
    ],
    autoFixable: false
  },
  
  // Loading issues
  'page not loading': {
    fix: 'Check your internet connection',
    steps: [
      'Make sure you\'re connected to the internet',
      'Try reloading the page',
      'If problem persists, try a different browser'
    ],
    autoFixable: false
  },
  
  'slow loading': {
    fix: 'This might be a connection issue',
    steps: [
      'Check your internet speed',
      'Try closing other tabs',
      'Consider using a faster connection'
    ],
    autoFixable: false
  },
  
  // Display issues
  'text not visible': {
    fix: 'Try zooming in',
    steps: [
      'Press Ctrl+Plus (PC) or Cmd+Plus (Mac) to zoom in',
      'Press Ctrl+0 (PC) or Cmd+0 (Mac) to reset zoom'
    ],
    autoFixable: false
  },
  
  'cant see': {
    fix: 'Try adjusting your zoom level',
    steps: [
      'Press Ctrl+Plus (PC) or Cmd+Plus (Mac) to zoom in',
      'Press Ctrl+Minus (PC) or Cmd+Minus (Mac) to zoom out',
      'Press Ctrl+0 (PC) or Cmd+0 (Mac) to reset zoom'
    ],
    autoFixable: false
  },
  
  // Mobile issues
  'not working on mobile': {
    fix: 'Try clearing your mobile browser cache',
    steps: [
      'Open your browser settings',
      'Find "Privacy" or "Clear browsing data"',
      'Clear cached images and files',
      'Restart your browser'
    ],
    autoFixable: false
  },
  
  'mobile view broken': {
    fix: 'Try rotating your device',
    steps: [
      'Rotate to landscape mode',
      'Then rotate back to portrait',
      'Or try refreshing the page'
    ],
    autoFixable: false
  }
};

/**
 * Detect if user message describes a known issue
 * @param {string} message - User's message
 * @returns {Object|null} - Issue details or null if no match
 */
function detectKnownIssue(message) {
  const lowerMessage = message.toLowerCase();
  
  for (let [issueKeywords, solution] of Object.entries(COMMON_ISSUES)) {
    if (lowerMessage.includes(issueKeywords)) {
      return {
        issue: issueKeywords,
        ...solution
      };
    }
  }
  
  return null;
}

/**
 * Generate helpful suggestion message (HTML format)
 * @param {Object} issue - Issue details from detectKnownIssue()
 * @returns {string} - HTML formatted suggestion
 */
function generateSuggestionHTML(issue) {
  const stepsHTML = issue.steps
    .map((step, index) => `<li>${index + 1}. ${step}</li>`)
    .join('');
  
  return `
    <div class="helpful-suggestion">
      <div class="suggestion-header">
        <span class="suggestion-icon">💡</span>
        <strong>I think I can help with that!</strong>
      </div>
      
      <div class="suggestion-body">
        <p><strong>Quick Fix:</strong> ${issue.fix}</p>
        
        <details>
          <summary>Show me how</summary>
          <ol class="suggestion-steps">
            ${stepsHTML}
          </ol>
        </details>
        
        <p class="suggestion-footer">Did this help? Let me know! 😊</p>
      </div>
    </div>
  `;
}

/**
 * Check message for known issues and return suggestion if found
 * @param {string} userMessage - User's chat message
 * @returns {string|null} - HTML suggestion or null
 */
function checkForHelpfulSuggestion(userMessage) {
  // Only check if message contains words suggesting a problem
  const problemIndicators = ['not', 'cant', 'can\'t', 'won\'t', 'wont', 'broken', 'issue', 'problem', 'bug', 'error'];
  const hasProblemIndicator = problemIndicators.some(indicator => 
    userMessage.toLowerCase().includes(indicator)
  );
  
  if (!hasProblemIndicator) {
    return null; // Not describing a problem
  }
  
  // Check for known issues
  const issue = detectKnownIssue(userMessage);
  
  if (issue) {
    return generateSuggestionHTML(issue);
  }
  
  // No known issue, but user seems to be describing a problem
  return `
    <div class="helpful-suggestion">
      <div class="suggestion-header">
        <span class="suggestion-icon">🤔</span>
        <strong>Sorry to hear you're having trouble!</strong>
      </div>
      
      <div class="suggestion-body">
        <p>I don't recognize this specific issue, but here are some things to try:</p>
        
        <ol class="suggestion-steps">
          <li>Try refreshing the page (Ctrl+R or Cmd+R)</li>
          <li>Clear your browser cache (Ctrl+Shift+Delete)</li>
          <li>Try a different browser (Chrome, Firefox, Safari)</li>
          <li>Check your internet connection</li>
        </ol>
        
        <p class="suggestion-footer">
          Still having issues? Please describe the problem in more detail and I'll do my best to help! 💬
        </p>
      </div>
    </div>
  `;
}

// Make globally available for chat widgets
window.checkForHelpfulSuggestion = checkForHelpfulSuggestion;

// Example usage in chat widgets:
/*
function sendChatMessage() {
  const userMessage = document.getElementById('chatInput').value;
  
  // Display user message
  displayMessage(userMessage, 'user');
  
  // Check for helpful suggestions
  const suggestion = checkForHelpfulSuggestion(userMessage);
  
  if (suggestion) {
    // Show suggestion BEFORE AI response
    displayMessage(suggestion, 'assistant');
  }
  
  // Then get normal AI response
  getAIResponse(userMessage).then(response => {
    displayMessage(response, 'assistant');
  });
}
*/
