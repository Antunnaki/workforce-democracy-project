import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('app-root')) {
  const section = document.createElement('section');
  section.id = 'mod-voting';
  section.innerHTML = `
    <h2>Voting Information</h2>
    <div id="voting-container">
      <p>Loading voting information...</p>
    </div>
  `;
  
  target.appendChild(section);
  
  // Load voting information
  loadVotingInfo();
  
  console.log('[Voting] module mounted');
}

async function loadVotingInfo() {
  try {
    const response = await fetch(`${CONFIG.API_BASE}/api/voting-info`);
    const data = await response.json();
    
    const container = document.getElementById('voting-container');
    if (data.info) {
      container.innerHTML = `
        <div class="voting-info">
          <h3>Next Election</h3>
          <p>Date: ${data.info.nextElectionDate || 'N/A'}</p>
          <p>Type: ${data.info.electionType || 'N/A'}</p>
          
          <h3>Voter Registration</h3>
          <p>Status: ${data.info.registrationStatus || 'Unknown'}</p>
          <p>Deadline: ${data.info.registrationDeadline || 'N/A'}</p>
        </div>
      `;
    } else {
      container.innerHTML = '<p>No voting information available.</p>';
    }
  } catch (error) {
    console.error('[Voting] Error loading data:', error);
    document.getElementById('voting-container').innerHTML = '<p>Error loading voting information.</p>';
  }
}