import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('home-court')) {
  console.log('[Court] mount called');
  if (!target) return;

  target.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <header style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
        <h3 style="margin:0; font-size:1.5rem; color:#fff;">Supreme Court Insights</h3>
        <p style="opacity:0.7; font-size:0.95rem; margin-top:5px;">Understanding major judicial rulings and their impact on democracy.</p>
      </header>
      
      <div id="court-cases-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
        <div style="grid-column: 1 / -1; text-align:center; padding:40px; opacity:0.7;">
          Connecting to judicial records...
        </div>
      </div>
    </div>
  `;

  loadCases(target.querySelector('#court-cases-list'));
}

async function loadCases(container) {
  try {
    const r = await fetch(`${CONFIG.API_BASE}/api/court/cases`);
    const data = await r.json();
    const cases = data.cases || [];

    if (cases.length === 0) {
      container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; opacity:0.5;">No recent high-impact cases found.</div>';
      return;
    }

    container.innerHTML = cases.map(c => `
      <div class="court-card" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="background:#dc2626; color:white; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:700; letter-spacing:0.05em;">Supreme Court</span>
          <span style="font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px; opacity:0.8;">${c.year}</span>
        </div>
        <div>
          <h4 style="margin:0; font-size:1.2rem; color:#fff; line-height:1.3;">${c.title}</h4>
          <p style="font-size:0.9rem; opacity:0.8; line-height:1.6; margin-top:10px;">${c.summary}</p>
        </div>
        
        <button class="analyze-case-btn" data-case-id="${c.id}" style="width:100%; padding:12px; background:#3b82f6; border:none; color:white; border-radius:10px; cursor:pointer; font-weight:700; font-size:0.9rem; transition:all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
          Ask AI for Breakdown
        </button>
        
        <div class="analysis-result" style="display:none; margin-top:10px; padding:16px; background:rgba(0,0,0,0.3); border-radius:12px; font-size:0.9rem; border-left:4px solid #3b82f6; line-height:1.6;">
          <div class="analysis-text"></div>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.analyze-case-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const resultDiv = btn.parentElement.querySelector('.analysis-result');
        const textDiv = resultDiv.querySelector('.analysis-text');
        
        btn.disabled = true;
        btn.textContent = 'Breaking down case...';
        resultDiv.style.display = 'block';
        textDiv.innerHTML = '<span style="opacity:0.5;">Analyzing judicial impact with patience...</span>';

        try {
          const r = await fetch(`${CONFIG.API_BASE}/api/court/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ caseId: btn.getAttribute('data-case-id') })
          });
          const data = await r.json();
          textDiv.innerHTML = data.analysis;
        } catch (err) {
          textDiv.innerHTML = '<span style="color:#f87171;">Unable to connect to analysis service.</span>';
        } finally {
          btn.disabled = false;
          btn.textContent = 'Re-Analyze Case';
        }
      });
    });

  } catch (err) {
    container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#f87171;">Error loading judicial records.</div>';
  }
}
