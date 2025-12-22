import { CONFIG } from '/js/app-shell.mjs';

export function showRepDeepDive(rep) {
    console.log('[RepModal] Opening deep dive for:', rep.name);
    
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'rep-modal-overlay';
    overlay.style = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        padding: 20px;
        box-sizing: border-box;
    `;

    // Create modal container
    const modal = document.createElement('div');
    modal.style = `
        background: #0f172a;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 24px;
        width: 100%;
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        color: #fff;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    `;

    modal.innerHTML = `
        <button id="close-modal" style="position: sticky; top: 20px; left: calc(100% - 60px); width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(255,255,255,0.1); color: #fff; font-size: 24px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: background 0.2s;">&times;</button>
        
        <div style="padding: 40px;">
            <div style="display: flex; gap: 32px; align-items: flex-start; margin-bottom: 40px; flex-wrap: wrap;">
                <div style="width: 160px; height: 160px; border-radius: 24px; overflow: hidden; border: 4px solid #3b82f6; background: #1e293b; flex-shrink: 0;">
                    <img src="${rep.photo_url || 'https://via.placeholder.com/160'}" alt="${rep.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div style="flex: 1; min-width: 280px;">
                    <h2 style="margin: 0; font-size: 2.5rem; line-height: 1.1;">${rep.name}</h2>
                    <p style="margin: 8px 0 0 0; font-size: 1.25rem; color: #60a5fa; font-weight: 600;">${rep.party} &bull; ${rep.title}</p>
                    <p style="margin: 4px 0 0 0; font-size: 1.1rem; opacity: 0.7;">Representing ${rep.district}</p>
                    
                    <div style="display: flex; gap: 12px; margin-top: 24px; flex-wrap: wrap;">
                        <a href="tel:${rep.phone || '#'}" class="action-btn" style="padding: 12px 20px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px;">📞 Call Office</a>
                        <a href="mailto:${rep.email || '#'}" class="action-btn" style="padding: 12px 20px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; text-decoration: none; font-weight: 600; display: flex; align-items: center; gap: 8px;">✉️ Email</a>
                        <a href="${rep.website || '#'}" target="_blank" class="action-btn" style="padding: 12px 20px; border-radius: 12px; background: #3b82f6; color: #fff; text-decoration: none; font-weight: 700;">Official Website</a>
                    </div>
                </div>
            </div>

            <div id="modal-content-loader" style="text-align: center; padding: 60px;">
                <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-radius: 50%; border-top-color: #3b82f6; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 16px; opacity: 0.7;">Gathering official records and AI analysis...</p>
            </div>

            <div id="modal-content" style="display: none;">
                <section style="margin-bottom: 40px;">
                    <h3 style="font-size: 1.5rem; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                        <span>🧠</span> AI Deep Dive Analysis
                    </h3>
                    <div id="ai-analysis" style="background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 16px; padding: 24px; line-height: 1.6; font-size: 1.05rem; color: #e2e8f0;">
                        <!-- AI Content -->
                    </div>
                </section>

                <section>
                    <h3 style="font-size: 1.5rem; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                        <span>🗳️</span> Recent Voting Record & Actions
                    </h3>
                    <div id="voting-records" style="display: flex; flex-direction: column; gap: 16px;">
                        <!-- Voting Content -->
                    </div>
                </section>
            </div>
        </div>
        
        <style>
            @keyframes spin { to { transform: rotate(360deg); } }
            .action-btn:hover { background: rgba(255,255,255,0.1) !important; transform: translateY(-2px); }
            .vote-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; }
            .ai-research-card { background: #1e293b; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 0 16px 16px 0; font-family: inherit; line-height: 1.6; white-space: pre-wrap; }
        </style>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const closeBtn = modal.querySelector('#close-modal');
    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) closeBtn.onclick();
    };

    // Load Voting Data
    if (rep.is_fallback) {
        showFallbackMessage(rep);
    } else {
        loadVotingData(rep.id, rep.name, rep.level);
    }
}

function showFallbackMessage(rep) {
    const loader = document.getElementById('modal-content-loader');
    const content = document.getElementById('modal-content');
    const aiContainer = document.getElementById('ai-analysis');
    const votesContainer = document.getElementById('voting-records');

    aiContainer.innerHTML = `
        <div style="padding: 10px; border-left: 4px solid #f59e0b; background: rgba(245, 158, 11, 0.1);">
            <p><strong>Note:</strong> Detailed records for this representative are currently limited because official API keys are missing or restricted on the server.</p>
            <p style="margin-top: 10px;">We are providing this basic information as a fallback to ensure you can still identify your officials.</p>
        </div>
    `;

    votesContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; background: rgba(255,255,255,0.03); border-radius: 16px;">
            <p style="opacity:0.7;">Voting records are unavailable for fallback profiles.</p>
            ${rep.website ? `<a href="${rep.website}" target="_blank" style="display:inline-block; margin-top:15px; color:#60a5fa; text-decoration:none; font-weight:600;">Visit Official Website for Records →</a>` : ''}
        </div>
    `;

    loader.style.display = 'none';
    content.style.display = 'block';
}

async function loadVotingData(id, name, level) {
    const loader = document.getElementById('modal-content-loader');
    const content = document.getElementById('modal-content');
    const aiContainer = document.getElementById('ai-analysis');
    const votesContainer = document.getElementById('voting-records');

    try {
        const response = await fetch(`${CONFIG.API_BASE}/api/civic/representatives/${id}/votes?name=${encodeURIComponent(name)}&level=${level}`);
        const data = await response.json();

        if (data.success) {
            // Fill AI Analysis
            aiContainer.innerHTML = data.aiSummary.split('\n\n').map(p => `<p style="margin-bottom: 16px;">${p}</p>`).join('');

            // Fill Voting Records
            if (data.votes && data.votes.length > 0) {
                votesContainer.innerHTML = data.votes.map(vote => {
                    if (vote.isAiResearch) {
                        return `
                            <div class="vote-item">
                                <h4 style="margin: 0 0 12px 0; color: #60a5fa;">${vote.title}</h4>
                                <div class="ai-research-card">${vote.content}</div>
                                ${vote.sources ? `<div style="margin-top: 12px; font-size: 0.85rem; opacity: 0.6;">Sources: ${vote.sources.map(s => `<a href="${s.url}" target="_blank" style="color: #60a5fa; text-decoration: none;">[${s.title || 'Source'}]</a>`).join(', ')}</div>` : ''}
                            </div>
                        `;
                    }
                    return `
                        <div class="vote-item">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                <h4 style="margin: 0; font-size: 1.1rem; flex: 1; padding-right: 20px;">${vote.title}</h4>
                                <span style="font-size: 0.85rem; opacity: 0.6; white-space: nowrap;">${vote.date}</span>
                            </div>
                            <div style="display: flex; gap: 12px; align-items: center;">
                                <span style="padding: 4px 10px; border-radius: 6px; background: ${vote.action === 'Sponsored' ? '#10b981' : '#3b82f6'}; color: #fff; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;">${vote.action}</span>
                                <span style="font-size: 0.9rem; opacity: 0.8;">Bill: ${vote.billNumber}</span>
                            </div>
                            <p style="margin: 12px 0 0 0; font-size: 0.95rem; line-height: 1.4; opacity: 0.7;">${vote.description || 'No additional description available.'}</p>
                        </div>
                    `;
                }).join('');
            } else {
                votesContainer.innerHTML = '<p style="opacity: 0.6; text-align: center; padding: 20px;">No specific voting records found in recent official logs. AI Analysis provides broader context above.</p>';
            }

            loader.style.display = 'none';
            content.style.display = 'block';
        } else {
            throw new Error(data.error);
        }
    } catch (err) {
        loader.innerHTML = `<p style="color: #f87171;">Failed to load voting records: ${err.message}</p>`;
    }
}
