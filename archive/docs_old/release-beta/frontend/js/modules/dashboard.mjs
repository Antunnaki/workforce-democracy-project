import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('home-dashboard')) {
  console.log('[Dashboard] mount called');
  if (!target) return;

  target.innerHTML = `
    <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; color:#fff;">
      <h2 style="margin-top:0; font-size:1.25rem;">Civic Dashboard</h2>
      <div id="dash-status">Connecting to live records...</div>
      <div id="dash-tiles" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-top:16px;"></div>
      <p style="margin-top:20px; font-size:0.9rem;">
        <a href="/dashboard.html" style="color:#60a5fa; text-decoration:none; font-weight:600;">View Full Dashboard →</a>
      </p>
    </div>
  `;

  const status = target.querySelector('#dash-status');
  const tiles = target.querySelector('#dash-tiles');

  loadDashboard(status, tiles);
}

async function loadDashboard(status, container) {
  try {
    const r = await fetch(`${CONFIG.API_BASE}/api/dashboard`);
    const d = await r.json();
    status.style.display = 'none';

    const items = [
      { label: 'Tracked Bills', value: d?.counts?.bills, color: '#3b82f6', icon: '📜', details: 'Important legislation currently being monitored.' },
      { label: 'Recent Votes', value: d?.counts?.votes, color: '#10b981', icon: '✅', details: 'Recent voting records matched to your interests.' },
      { label: 'Active Reps', value: d?.counts?.alignedReps, color: '#f59e0b', icon: '🏛️', details: 'Representatives currently serving your community.' },
    ];

    container.innerHTML = items.map((it, idx) => `
      <div id="tile-${idx}" class="dash-tile" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; cursor:pointer; transition: all 0.2s; display:flex; flex-direction:column; gap:8px;" 
           onmouseover="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.2)';"
           onmouseout="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.1)';"
           onclick="const d = this.querySelector('.dash-detail'); d.style.display = (d.style.display === 'none' ? 'block' : 'none')">
        <div style="display:flex; justify-content:space-between; align-items:center; opacity:0.8; font-size:0.85rem; font-weight:600;">
          <span>${it.label}</span>
          <span>${it.icon}</span>
        </div>
        <div style="font-size:2.5rem; font-weight:800; color:${it.color}; line-height:1;">${it.value ?? '—'}</div>
        <div class="dash-detail" style="display:none; font-size:0.85rem; margin-top:12px; opacity:0.9; line-height:1.5; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
          ${it.details}
        </div>
      </div>
    `).join('');

  } catch (err) {
    status.textContent = 'Unable to load live dashboard stats.';
    status.style.color = '#f87171';
  }
}