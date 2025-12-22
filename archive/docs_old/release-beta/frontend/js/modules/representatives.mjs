import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('home-reps')) {
  console.log('[Representatives] mount called');
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
    const r = await fetch(`${CONFIG.API_BASE}/api/representatives?zip=${zip}`);
    const data = await r.json();
    const reps = data.results || [];

    if (reps.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:40px; background:rgba(255,255,255,0.05); border-radius:12px; border:1px solid rgba(255,255,255,0.1);">
          <p style="opacity:0.6;">No representatives found for ZIP code: <strong>${zip}</strong></p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
        ${reps.map(rep => `
          <div class="rep-card" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:18px; transition: transform 0.2s;">
            <div style="display:flex; gap:16px; align-items:center;">
              <div style="width:70px; height:70px; border-radius:50%; overflow:hidden; border:2px solid #3b82f6; flex-shrink:0; background:#1e293b;">
                <img src="${rep.photoUrl || 'https://via.placeholder.com/70'}" alt="${rep.name}" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div style="flex:1; min-width:0;">
                <h4 style="margin:0; font-size:1.1rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${rep.name}</h4>
                <p style="margin:2px 0 0 0; font-size:0.85rem; color:#60a5fa; font-weight:600;">${rep.party}</p>
                <p style="margin:2px 0 0 0; font-size:0.8rem; opacity:0.7; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${rep.office}</p>
              </div>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <a href="tel:${rep.contact?.phone || '#'}" style="text-decoration:none; text-align:center; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:0.85rem; font-weight:600; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>📞</span> Call
              </a>
              <a href="mailto:${rep.contact?.email || '#'}" style="text-decoration:none; text-align:center; padding:10px; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:10px; color:#fff; font-size:0.85rem; font-weight:600; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:6px;">
                <span>✉️</span> Email
              </a>
            </div>
            
            ${rep.contact?.links?.[0] ? `
              <a href="${rep.contact.links[0].url}" target="_blank" style="text-decoration:none; text-align:center; padding:12px; background:#3b82f6; border-radius:10px; color:#fff; font-size:0.9rem; font-weight:700; transition:all 0.2s; box-shadow: 0 4px 10px rgba(59, 130, 246, 0.25);">
                Visit Official Website
              </a>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

  } catch (err) {
    container.innerHTML = '<div style="text-align:center; padding:40px; color:#f87171;">Unable to connect to representative database. Please try again.</div>';
  }
}