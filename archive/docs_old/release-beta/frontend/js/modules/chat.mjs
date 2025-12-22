import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('home-chat')) {
  console.log('[Chat] mount called');
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
      // V37.17.0: Use the unified civic chat endpoint
      const r = await fetch(`${CONFIG.API_BASE}/api/civic/llm-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: val,
          context: 'general'
        })
      });
      const data = await r.json();
      msgs.removeChild(loading);

      const aiMsg = document.createElement('div');
      // The civic-routes.js returns the message in the 'message' field, not 'reply'
      aiMsg.textContent = data.message || '[No response]';
      aiMsg.style.cssText = 'align-self:flex-start;background:#1e293b;padding:12px 16px;border-radius:0 12px 12px 12px;max-width:85%;line-height:1.4;';
      msgs.appendChild(aiMsg);
      msgs.scrollTop = msgs.scrollHeight;

      // Add sources if available
      if (data.sources && data.sources.length > 0) {
        const sourcesDiv = document.createElement('div');
        sourcesDiv.style.cssText = 'font-size: 11px; opacity: 0.7; margin-top: 4px; padding-left: 16px;';
        sourcesDiv.innerHTML = '<strong>Sources:</strong><br>' + data.sources.map(s => `<a href="${s.url}" target="_blank" style="color: #60a5fa; text-decoration: none;">• ${s.title || s.name || 'Source'}</a>`).join('<br>');
        msgs.appendChild(sourcesDiv);
        msgs.scrollTop = msgs.scrollHeight;
      }
    } catch (err) {
      loading.textContent = 'I am sorry, I am having trouble connecting right now. Please try again.';
      loading.style.color = '#f87171';
    }
  });
}