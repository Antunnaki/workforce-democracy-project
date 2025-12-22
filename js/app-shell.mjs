/* WDP app-shell.mjs 2025-12-22 V1.1.9 */
import { envConfig } from '/env-config.mjs';

// Central config (dynamic)
export const CONFIG = {
  VERSION: '1.1.12-20251222-CSP-FIX',
  get API_BASE() {
    return window.WDP_API_BASE || envConfig.apiBase || 'https://api.workforcedemocracyproject.org';
  },
  get MODE() {
    return window.WDP_MODE || envConfig.mode || 'production';
  }
};

export async function boot() {
  // Real singleton check across multiple module loads (versioned/unversioned)
  if (window.WDP_BOOT_PROMISE) {
    console.log(`[Shell] Returning existing boot promise (V${CONFIG.VERSION})`);
    return window.WDP_BOOT_PROMISE;
  }
  
  window.WDP_BOOT_PROMISE = (async () => {
    console.log(`%c[Shell] 🚀 Booting V${CONFIG.VERSION}...`, 'color: #3b82f6; font-weight: bold; font-size: 1.2rem;');
    console.log(`%c[Shell] Targeting: ${CONFIG.API_BASE}`, 'color: #10b981;');
    
    // Clear old service workers if version mismatch detected
    if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (let reg of regs) {
            console.log('[Shell] Monitoring ServiceWorker...');
        }
    }

    // Update UI based on mode
    if (CONFIG.MODE === 'beta') {
      const title = document.getElementById('page-title');
      // More robust check to prevent multiple appends
      if (title && !title.textContent.includes('Beta')) {
          title.textContent = title.textContent.trim() + ' - Beta';
      }
      
      const mainTitle = document.getElementById('main-title');
      if (mainTitle && !mainTitle.textContent.includes('Beta')) {
          mainTitle.textContent = mainTitle.textContent.trim() + ' - Beta';
      }
      
      const statusBar = document.getElementById('beta-status-bar');
      if (statusBar) {
          statusBar.style.display = 'block';
          statusBar.title = `V${CONFIG.VERSION}`;
      }
    }

    // Render navigation + empty root
    const root = document.getElementById('app-root');
    if (!root) {
      document.body.insertAdjacentHTML('beforeend', '<main id="app-root"></main>');
    }
    console.log(`[Shell] ✅ Boot complete. Mode: ${CONFIG.MODE} | Target: ${CONFIG.API_BASE}`);
    return true;
  })();

  return window.WDP_BOOT_PROMISE;
}

// Global hook for external scripts
window.WDP_BOOT = boot;

// Auto-boot if not already booting
boot();