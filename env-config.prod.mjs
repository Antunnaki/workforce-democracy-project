// Load environment configuration
const cfg = await fetch('/config.json').then(r => r.json()).catch(() => ({}));

// Environment detection
const host = window.location.hostname;
const forceProd = host === 'workforcedemocracyproject.org' || host === 'www.workforcedemocracyproject.org';
const isProd = forceProd || cfg.mode === 'production';

window.WDP_API_BASE = (forceProd ? 'https://api.workforcedemocracyproject.org' : (cfg.apiBase || (isProd 
    ? 'https://api.workforcedemocracyproject.org' 
    : 'https://api-beta.workforcedemocracyproject.org')));

window.WDP_MODE = (forceProd ? 'production' : (cfg.mode || (isProd ? 'production' : 'beta')));

if (forceProd) {
    console.log(`[Env] Production FORCED by hostname: ${host}`);
}
console.log(`[Env] Config loaded: ${window.WDP_MODE} mode`, window.WDP_API_BASE);