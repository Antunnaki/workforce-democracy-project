import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('home-bills')) {
  console.log('[Bills] mount called');
  if (!target) return;

  target.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:20px;">
      <header style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 15px;">
        <h3 style="margin:0; font-size:1.5rem; color:#fff;">Upcoming Legislation</h3>
        <p style="opacity:0.7; font-size:0.95rem; margin-top:5px;">Review bills affecting your community with empathetic AI analysis.</p>
      </header>
      
      <div id="bills-list" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:20px;">
        <!-- Card 1 -->
        <div class="bill-card" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:16px; transition: transform 0.2s;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="background:#2563eb; color:white; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:700; letter-spacing:0.05em;">H.R. 1234</span>
            <span style="font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px; opacity:0.8;">Priority: High</span>
          </div>
          <div>
            <h4 style="margin:0; font-size:1.2rem; color:#fff; line-height:1.3;">Community Infrastructure & Green Spaces Act</h4>
            <p style="font-size:0.9rem; opacity:0.8; line-height:1.6; margin-top:10px;">A bill to provide federal grants for the development of urban parks, community gardens, and sustainable public transportation in underserved areas.</p>
          </div>
          
          <button class="analyze-bill-btn" data-bill-id="HR1234" style="width:100%; padding:12px; background:#3b82f6; border:none; color:white; border-radius:10px; cursor:pointer; font-weight:700; font-size:0.9rem; transition:all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
            Analyze Local Impact
          </button>
          
          <div class="analysis-result" style="display:none; margin-top:10px; padding:16px; background:rgba(0,0,0,0.3); border-radius:12px; font-size:0.9rem; border-left:4px solid #3b82f6; line-height:1.6;">
            <div class="analysis-text"></div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="bill-card" style="background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.15); border-radius:16px; padding:24px; display:flex; flex-direction:column; gap:16px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="background:#059669; color:white; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:700; letter-spacing:0.05em;">S. 567</span>
            <span style="font-size:0.8rem; background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px; opacity:0.8;">Status: In Committee</span>
          </div>
          <div>
            <h4 style="margin:0; font-size:1.2rem; color:#fff; line-height:1.3;">Small Business Digital Empowerment Act</h4>
            <p style="font-size:0.9rem; opacity:0.8; line-height:1.6; margin-top:10px;">Legislation aimed at providing tax credits and technical assistance to small businesses adopting digital commerce tools.</p>
          </div>
          
          <button class="analyze-bill-btn" data-bill-id="S567" style="width:100%; padding:12px; background:#3b82f6; border:none; color:white; border-radius:10px; cursor:pointer; font-weight:700; font-size:0.9rem; transition:all 0.2s; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">
            Analyze Local Impact
          </button>
          
          <div class="analysis-result" style="display:none; margin-top:10px; padding:16px; background:rgba(0,0,0,0.3); border-radius:12px; font-size:0.9rem; border-left:4px solid #3b82f6; line-height:1.6;">
            <div class="analysis-text"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  target.querySelectorAll('.analyze-bill-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const resultDiv = btn.parentElement.querySelector('.analysis-result');
      const textDiv = resultDiv.querySelector('.analysis-text');
      
      btn.disabled = true;
      btn.textContent = 'Analyzing...';
      resultDiv.style.display = 'block';
      textDiv.innerHTML = '<span style="opacity:0.5;">Generating patient, community-focused analysis...</span>';

      try {
        const r = await fetch(`${CONFIG.API_BASE}/api/bills/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ billId: btn.getAttribute('data-bill-id') })
        });
        const data = await r.json();
        textDiv.innerHTML = data.analysis || 'Analysis unavailable.';
      } catch (err) {
        textDiv.innerHTML = '<span style="color:#f87171;">Error connecting to analysis service.</span>';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Re-Analyze Bill';
      }
    });
  });
}
