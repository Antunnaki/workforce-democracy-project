// Environment detection (Synchronous for early access)
const host = window.location.hostname;
const forceProd = host === 'workforcedemocracyproject.org' || host === 'www.workforcedemocracyproject.org';
const isBetaHost = host.includes('beta') || host.includes('netlify.app');

// Initial default based on hostname (SYNCHRONOUS)
window.WDP_MODE = forceProd ? 'production' : (isBetaHost ? 'beta' : 'production');
window.WDP_API_BASE = forceProd 
    ? 'https://api.workforcedemocracyproject.org' 
    : (isBetaHost ? 'https://api-beta.workforcedemocracyproject.org' : 'https://api.workforcedemocracyproject.org');

// Log early to diagnose hostname detection
console.log(`[Env] Host detection: ${host} -> Mode: ${window.WDP_MODE}, Base: ${window.WDP_API_BASE}`);

// Load environment configuration (Asynchronous override)
let cfg = {};
try {
    const r = await fetch('/config.json');
    if (r.ok) {
        cfg = await r.json();
        if (cfg.apiBase) window.WDP_API_BASE = cfg.apiBase;
        if (cfg.mode) window.WDP_MODE = cfg.mode;
        console.log('[Env] Config.json override applied:', cfg);
    }
} catch (e) {
    console.warn('[Env] Failed to load config.json, using host defaults');
}

// Export for app-shell or others
export const envConfig = {
    apiBase: window.WDP_API_BASE,
    mode: window.WDP_MODE
};

if (forceProd) {
    console.log(`[Env] Production FORCED by hostname: ${host}`);
}
console.log(`[Env] Config loaded: ${window.WDP_MODE} mode`, window.WDP_API_BASE);