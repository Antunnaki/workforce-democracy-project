// Global error and CSP Logger for Beta environment
console.log('[CSP] Policy active - modular scripts enabled');

window.addEventListener('error', function(e) {
  console.error('[Global Error]', e.message, 'at', e.filename, ':', e.lineno);
}, true);

window.addEventListener('securitypolicyviolation', (e) => {
  console.warn('[CSP Violation]', {
    blockedURI: e.blockedURI,
    violatedDirective: e.violatedDirective,
    originalPolicy: e.originalPolicy
  });
});
