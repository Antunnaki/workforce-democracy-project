import { CONFIG } from '/js/app-shell.mjs';
import { showRepDeepDive } from './rep-modal.mjs';

export function mount(target = document.getElementById('home-reps')) {
  console.log('%c[Representatives] mount called v1.1.9-RESET-ENABLED', 'color: #3b82f6; font-weight: bold;');
  if (!target) return;

  target.innerHTML = `
    <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; color:#fff;">
      <h2 style="margin-top:0; font-size:1.25rem;">My Representatives</h2>
      <p style="font-size:0.9rem; opacity:0.8; margin-bottom:16px;">Find your officials anonymously. We don't store your personal data.</p>
      
      <div style="display:flex; gap:8px; margin-bottom:20px;">
        <input id="rep-zip" type="text" placeholder="Enter ZIP Code" style="flex:1; padding:10px; border-radius:8px; border:1px solid #334155; background:#111827; color:#fff;" maxlength="5">
        <button id="rep-search" style="padding:10px 16px; border-radius:8px; border:none; background:#3b82f6; color:#fff; cursor:pointer; font-weight:600;">Search</button>
      </div>

      <div id="reps-results">
        <div style="text-align:center; padding:20px; opacity:0.6;">Enter your ZIP code to see your local representatives.</div>
      </div>
    </div>
  `;

  const input = target.querySelector('#rep-zip');
  const btn = target.querySelector('#rep-search');
  const results = target.querySelector('#reps-results');

  btn.addEventListener('click', () => {
    const zip = input.value.trim();
    if (!zip || zip.length < 5) {
      alert('Please enter a valid 5-digit ZIP code');
      return;
    }
    loadReps(zip, results);
  });
}

async function loadReps(zip, container) {
  container.innerHTML = '<div style="text-align:center; padding:40px; opacity:0.7;">Searching official records with patience...</div>';
  
  try {
    const r = await fetch(`${CONFIG.API_BASE}/api/civic/representatives/search?zip=${zip}`);
    const data = await r.json();
    const reps = data.results || [];

    if (reps.length === 0) {
      const errorMsg = data.error || (data.success ? `No representatives found for ZIP code: <strong>${zip}</strong>` : 'Failed to retrieve records');
      
      // Detailed source info
      const counts = data.counts || { federal: 0, state: 0 };
      const dataSources = data.data_sources || ['None reported'];
      const locationInfo = data.location || data.location_used || {};
      
      const errors = data.errors || {};
      const sourceDetails = `
        <div style="font-size:0.8rem; opacity:0.5; margin-top:15px; text-align:left; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
            <p style="margin-bottom:5px;"><strong>Technical Diagnostics:</strong></p>
            <ul style="margin:0; padding-left:20px;">
                <li>App Version: v1.1.10</li>
                <li>Status: ${data.success ? 'Success (0 results)' : (data.error || 'Failed')}</li>
                <li>Sources Checked: ${dataSources.join(', ')}</li>
                <li>Federal Count: ${counts.federal ?? 0}</li>
                <li>State Count: ${counts.state ?? 0}</li>
                <li>Detected State: ${locationInfo.state || 'Unknown'}</li>
                <li>District: ${locationInfo.district || 'Not determined'}</li>
                ${errors.federal ? `<li style="color:#f87171;">Federal Error: ${errors.federal}</li>` : ''}
                ${errors.state ? `<li style="color:#f87171;">State Error: ${errors.state}</li>` : ''}
            </ul>
            <div style="margin-top:10px; padding:8px; background:rgba(255,255,255,0.05); border-radius:4px;">
                <p style="margin:0; font-weight:bold; color:#60a5fa;">Stuck on an old version?</p>
                <p style="margin:2px 0 0 0;">Please perform a <strong>Hard Refresh</strong> (Cmd+Shift+R or Ctrl+F5) to clear browser cache.</p>
            </div>
            ${data.message ? `<p style="margin-top:5px; font-style:italic;">Note: ${data.message}</p>` : ''}
        </div>
      `;

      container.innerHTML = `
        <div style="text-align:center; padding:40px; background:rgba(255,255,255,0.05); border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
          <p style="opacity:0.8; font-size:1.1rem;">${errorMsg}</p>
          <p style="opacity:0.6; font-size:0.9rem; margin-top:10px;">We searched official government records but couldn't find matches for this location.</p>
          ${sourceDetails}
          <button onclick="location.reload()" style="margin-top:20px; padding:8px 16px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; border-radius:8px; cursor:pointer;">Retry Search</button>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
        ${reps.map((rep, idx) => `
          <div class="rep-card" data-idx="${idx}" style="background:rgba(255,255,255,0.05); border:1px solid ${rep.is_fallback ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255,255,255,0.15)'}; border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:18px; transition: transform 0.2s; cursor: pointer; position: relative;">
            ${rep.is_fallback ? `<div style="position:absolute; top:10px; right:10px; background:#f59e0b; color:#000; font-size:0.65rem; font-weight:800; padding:2px 6px; border-radius:4px; text-transform:uppercase;">Fallback</div>` : ''}
            <div style="display:flex; gap:16px; align-items:center;">
              <div style="width:70px; height:70px; border-radius:50%; overflow:hidden; border:2px solid #3b82f6; flex-shrink:0; background:#1e293b;">
                <img src="${rep.photo_url || 'https://via.placeholder.com/70'}" alt="${rep.name}" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div style="flex:1; min-width:0;">
                <h4 style="margin:0; font-size:1.1rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${rep.name}</h4>
                <p style="margin:2px 0 0 0; font-size:0.85rem; color:#60a5fa; font-weight:600;">${rep.party}</p>
                <p style="margin:2px 0 0 0; font-size:0.8rem; opacity:0.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${rep.office}</p>
              </div>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <a href="tel:${rep.phone || '#'}" onclick="event.stopPropagation();" style="text-decoration:none; text-align:center; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:0.85rem; font-weight:600; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>📞</span> Call
              </a>
              <a href="mailto:${rep.email || '#'}" onclick="event.stopPropagation();" style="text-decoration:none; text-align:center; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:0.85rem; font-weight:600; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>✉️</span> Email
              </a>
            </div>
            
            <button class="deep-dive-btn" style="width:100%; padding:12px; background:#3b82f6; border:none; border-radius:10px; color:#fff; font-size:0.9rem; font-weight:700; cursor:pointer; transition:all 0.2s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);">
                View Voting Record & Deep Dive
            </button>
          </div>
        `).join('')}
      </div>
    `;

    // Add click listeners for deep dive
    container.querySelectorAll('.rep-card').forEach(card => {
        card.addEventListener('click', () => {
            const idx = card.getAttribute('data-idx');
            showRepDeepDive(reps[idx]);
        });
    });

  } catch (err) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:#f87171;">Unable to connect to representative database. Please try again.</div>';
  }
}