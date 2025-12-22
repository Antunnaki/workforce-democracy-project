// Load environment configuration
const cfg = await fetch('/config.json').then(r => r.json()).catch(() => ({}));
window.WDP_API_BASE = cfg.apiBase || window.WDP_API_BASE || 'https://api-beta.workforcedemocracyproject.org';
console.log('[Env] Config loaded');