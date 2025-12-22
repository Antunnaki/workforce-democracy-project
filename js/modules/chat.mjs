import { CONFIG } from '/js/app-shell.mjs';

// =============================================================================
// CITATION CONVERSION (Simple Superscripts ¹² ³)
// =============================================================================

function convertCitations(text, sources) {
    if (!text) return '';
    const superscriptMap = {
        '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
        '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '0': '⁰'
    };

    const convertToSuperscript = (num) => {
        return num.toString().split('').map(d => superscriptMap[d] || d).join('');
    };

    // Replace [1], [2], etc. with superscript numbers
    return text.replace(/\[(\d+)\]/g, (match, number) => {
        const index = parseInt(number);
        // User requirement: "If no source, don't include citation"
        if (sources && sources[index - 1]) {
            return `<sup class="citation-link" data-source-index="${index - 1}" style="cursor:pointer; color:#60a5fa; font-weight:bold; padding:0 2px;" title="Click to see source">${convertToSuperscript(number)}</sup>`;
        }
        return ''; // Remove citation if source missing
    });
}

// =============================================================================
// MARKDOWN RENDERING (Simple)
// =============================================================================

function renderMarkdown(text) {
    if (!text) return '';
    let html = text;
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" style="color:#60a5fa; text-decoration:none;">$1</a>');
    
    // Newlines to breaks
    html = html.replace(/\n\n/g, '<br><br>');
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// =============================================================================
// SOURCES SECTION BUILDER
// =============================================================================

function buildSourcesSection(sources) {
    if (!sources || sources.length === 0) return '';

    const sourcesList = sources.map((s, i) => {
        const title = s.title || s.name || 'Source';
        const url = s.url || '#';
        return `<div id="source-${i}" style="margin-bottom:8px; padding:8px; background:rgba(255,255,255,0.05); border-radius:6px; font-size:12px;">
            <span style="opacity:0.6; margin-right:8px;">[${i + 1}]</span>
            <a href="${url}" target="_blank" style="color:#60a5fa; text-decoration:none; font-weight:500;">${title}</a>
            ${s.publication ? `<br><span style="opacity:0.5; font-size:10px; margin-left:24px;">${s.publication}</span>` : ''}
        </div>`;
    }).join('');

    return `
        <div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">
            <details>
                <summary style="cursor:pointer; font-size:12px; font-weight:600; opacity:0.8; margin-bottom:10px; outline:none; user-select:none;">
                    View Sources (${sources.length})
                </summary>
                <div class="sources-list" style="max-height:200px; overflow-y:auto; scrollbar-width:thin;">
                    ${sourcesList}
                </div>
            </details>
        </div>
    `;
}

// =============================================================================
// CONTEXT DETECTION
// =============================================================================

function detectContext() {
    const path = window.location.pathname;
    const context = { 
        page: 'home', 
        section: null, 
        viewingContent: null 
    };
    
    if (path.includes('civic-platform')) context.page = 'civic-platform';
    else if (path.includes('philosophies')) context.page = 'philosophies';
    else if (path.includes('learning')) context.page = 'learning';
    else if (path.includes('privacy')) context.page = 'privacy';
    
    return context;
}

export function mount(target = document.getElementById('home-chat')) {
  console.log(`[Chat] mount called v37.20.7-Enhanced (Mode: ${CONFIG.MODE})`);
  if (!target) return;

  const wrap = document.createElement('section');
  wrap.id = 'mod-chat';
  wrap.innerHTML = `
    <button id="openChatBtn" type="button" style="position:fixed;right:16px;bottom:16px;z-index:9999;width:56px;height:56px;border:none;border-radius:50%;background:#1d4ed8;color:#fff;box-shadow:0 6px 16px rgba(0,0,0,.25); cursor:pointer; font-size:24px;">💬</button>
    <div id="chat-modal" style="display:none;position:fixed;right:16px;bottom:80px;width:min(420px,94vw);max-height:80vh;z-index:10000;background:#0f172a;color:#fff;border-radius:16px;box-shadow:0 12px 48px rgba(0,0,0,0.5);overflow:hidden; border:1px solid rgba(255,255,255,0.1); flex-direction:column;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:#1e293b;border-bottom:1px solid rgba(255,255,255,.1)">
        <div>
          <strong style="display:block;">Civic Assistant</strong>
          <span style="font-size:11px; opacity:0.7;">Friendly • Empathetic • Patient</span>
        </div>
        <button id="closeChatBtn" type="button" style="background:transparent;border:none;color:#fff;font-size:24px;cursor:pointer;">×</button>
      </div>
      <div id="chat-messages" style="padding:20px;display:flex;flex-direction:column;gap:12px;min-height:200px;max-height:50vh;overflow-y:auto;background:#0b1220;scrollbar-width:thin;">
        <div style="align-self:flex-start;background:#1e293b;padding:12px 16px;border-radius:0 12px 12px 12px;max-width:85%; line-height:1.4;">
          Hello! I'm your Civic Assistant. I'm here to help you understand your government and democracy with patience and understanding. How can I support you today?
        </div>
      </div>
      <form id="chat-form" style="display:flex;gap:10px;padding:16px;border-top:1px solid rgba(255,255,255,.1);background:#1e293b">
        <input id="chat-input" type="text" placeholder="Ask anything about your community…" style="flex:1;padding:12px 16px;border-radius:10px;border:1px solid #334155;background:#0f172a;color:#fff; outline:none;" />
        <button type="submit" style="padding:10px 18px;border-radius:10px;border:none;background:#2563eb;color:#fff;font-weight:600;cursor:pointer;">Send</button>
      </form>
    </div>`;
  target.appendChild(wrap);

  const btn = wrap.querySelector('#openChatBtn');
  const modal = wrap.querySelector('#chat-modal');
  const closeBtn = wrap.querySelector('#closeChatBtn');
  const form = wrap.querySelector('#chat-form');
  const input = wrap.querySelector('#chat-input');
  const msgs = wrap.querySelector('#chat-messages');

  btn.addEventListener('click', () => {
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 100);
  });
  
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = input.value.trim();
    if (!val) return;
    input.value = '';

    // Add User Message
    const userMsg = document.createElement('div');
    userMsg.textContent = val;
    userMsg.style.cssText = 'align-self:flex-end;background:#2563eb;padding:10px 14px;border-radius:12px 0 12px 12px;max-width:85%;margin-left:auto;';
    msgs.appendChild(userMsg);
    msgs.scrollTop = msgs.scrollHeight;

    // Add Loading Indicator
    const loading = document.createElement('div');
    loading.textContent = 'Thinking with patience...';
    loading.style.cssText = 'align-self:flex-start;opacity:0.6;font-size:12px;margin-top:4px;';
    msgs.appendChild(loading);
    msgs.scrollTop = msgs.scrollHeight;

    try {
      // V37.20.2: Use the most robust endpoint and ensure CONFIG is up to date
      const apiBase = CONFIG.API_BASE;
      const endpoint = `${apiBase}/api/civic/llm-chat`;
      console.log(`[Chat] Sending query to: ${endpoint} (Mode: ${CONFIG.MODE})`);
      
      const r = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          message: val,
          context: detectContext()
        })
      });
      const data = await r.json();
      msgs.removeChild(loading);

      const aiMsgContainer = document.createElement('div');
      aiMsgContainer.style.cssText = 'align-self:flex-start;background:#1e293b;padding:12px 16px;border-radius:0 12px 12px 12px;max-width:85%;line-height:1.4;';
      
      const responseText = data.response || data.message || '[No response]';
      const sources = data.sources || [];
      
      // Process text: 1. Convert citations, 2. Render Markdown
      const withCitations = convertCitations(responseText, sources);
      const htmlContent = renderMarkdown(withCitations);
      const sourcesHTML = buildSourcesSection(sources);
      
      aiMsgContainer.innerHTML = htmlContent + sourcesHTML;
      
      // Add event listeners to citation links
      aiMsgContainer.querySelectorAll('.citation-link').forEach(citation => {
          citation.addEventListener('click', (e) => {
              e.preventDefault();
              const index = citation.dataset.sourceIndex;
              const sourceEl = aiMsgContainer.querySelector(`#source-${index}`);
              const details = aiMsgContainer.querySelector('details');
              if (details) details.open = true;
              if (sourceEl) sourceEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
      });
      
      msgs.appendChild(aiMsgContainer);
      msgs.scrollTop = msgs.scrollHeight;

    } catch (err) {
      console.error('[Chat] Error:', err);
      loading.textContent = 'I am sorry, I am having trouble connecting right now. Please try again.';
      loading.style.color = '#f87171';
    }
  });
}