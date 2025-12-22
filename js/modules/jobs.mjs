import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('app-root')) {
  const section = document.createElement('section');
  section.id = 'mod-jobs';
  section.innerHTML = `
    <h2>Job Opportunities</h2>
    <div id="jobs-container">
      <p>Loading job opportunities...</p>
    </div>
  `;
  
  target.appendChild(section);
  
  // Load jobs
  loadJobs();
  
  console.log('[Jobs] module mounted');
}

async function loadJobs() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/jobs`);
    const data = await response.json();
    
    const container = document.getElementById('jobs-container');
    if (data.jobs && data.jobs.length > 0) {
      container.innerHTML = `
        <div class="jobs-list">
          ${data.jobs.map(job => `
            <div class="job-card">
              <h3>${job.title}</h3>
              <p>${job.organization}</p>
              <p>${job.location}</p>
              <button onclick="window.open('${job.link}', '_blank')">View Details</button>
            </div>
          `).join('')}
        </div>
      `;
    } else {
      container.innerHTML = '<p>No job opportunities available at this time.</p>';
    }
  } catch (error) {
    console.error('[Jobs] Error loading data:', error);
    document.getElementById('jobs-container').innerHTML = '<p>Error loading job opportunities.</p>';
  }
}