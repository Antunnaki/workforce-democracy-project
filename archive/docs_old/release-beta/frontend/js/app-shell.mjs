/* WDP app-shell.mjs 2025-12-16 */
// Central config (toggle per env)
export const CONFIG = {
  API_BASE: window.WDP_API_BASE || 'https://api.workforcedemocracyproject.org',
};

export async function boot() {
  // Render navigation + empty root
  const root = document.getElementById('app-root');
  if (!root) {
    document.body.insertAdjacentHTML('beforeend', '<main id="app-root"></main>');
  }
  console.log('[Shell] booted');
}

boot();