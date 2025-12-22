import{ CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('home-reps')) {
  if (!target) return;
  target.innerHTML = `
    <h2>My Representatives</h2>
    <div id="reps-status">Loading…</div>
    <ul id="reps-list" style="padding-left:18px"></ul>
   <p><a href="/reps.html" style="color:#60a5fa;text-decoration:none;">More details →</a></p>
  `;
  const status = target.querySelector('#reps-status');
  const list = target.querySelector('#reps-list');

  fetch(`${CONFIG.API_BASE}/api/representatives`)
    .then(r => r.ok ? r.json() : Promise.reject(new Error('HTTP '+r.status)))
    .then(data => {
      status.textContent = '';
     const reps = Array.isArray(data?.results) ? data.results : [];
      if (!reps.length) { status.textContent = 'No representatives found.'; return; }
      for (const rep of reps) {
        const li = document.createElement('li');
        li.textContent = [rep.name, rep.office, rep.party].filter(Boolean).join(' — ');
        list.appendChild(li);
      }
    })
    .catch(err => {
      console.error('[Representatives] load failed', err);
      status.textContent = 'Unable to load representatives right now.';
    });
}

async function fetchRepresentatives() {
  try {
    const response = awaitfetch(`${CONFIG.API_BASE}/api/representatives`);
    const data = await response.json();
    
    const container = document.getElementById('reps-container');
    if (data.representatives && data.representatives.length > 0) {
     container.innerHTML = `
        <ul>
          ${data.representatives.map(rep => `
            <li>
              <strong>${rep.name}</strong> - ${rep.title}
              ${rep.party ? `<span>(${rep.party})</span>` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    } else {
      container.innerHTML = '<p>Norepresentatives found.</p>';
    }
  } catch (error) {
    console.error('[Representatives] Error fetching data:', error);
    document.getElementById('reps-container').innerHTML = '<p>Error loading representatives. Please try again later.</p>';
}
}