/* WDP chat-clean.reset.js LIVE TIMESTAMP-VERIFIED 2025-12-16T11:45Z */
(function(){
  'use strict';
  
  // Nuclear proof-of-execution
  alert('WDP Chat Reset JS loaded @ ' + new Date().toISOString());

  // Config — set via data attr or fallback
  const API_BASE = (window.WDP_API_BASE) || 'https://api.workforcedemocracyproject.org';

  // Safe selectors
  function $(id){ return document.getElementById(id); }

  // Ensure required nodes exist or create them
  function ensureChatDOM(){
    // Floating button
    if (!$('openChatBtn')) {
      const btn = document.createElement('button');
      btn.id = 'openChatBtn';
      btn.type = 'button';
      btn.setAttribute('aria-label','Open chat');
      btn.style.position='fixed';
      btn.style.right='16px';
      btn.style.bottom='16px';
      btn.style.zIndex='9999';
      btn.style.width='56px';
      btn.style.height='56px';
      btn.style.borderRadius='50%';
      btn.style.border='none';
      btn.style.background='#1d4ed8';
      btn.style.color='#fff';
      btn.style.fontSize='20px';
      btn.style.boxShadow='0 6px 16px rgba(0,0,0,.25)';
      btn.textContent='💬';
      document.body.appendChild(btn);
    }

    // Modal container
    if (!$('chat-modal')) {
      const modal = document.createElement('div');
      modal.id = 'chat-modal';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      modal.style.position='fixed';
      modal.style.right='16px';
      modal.style.bottom='80px';
      modal.style.width='min(420px, 94vw)';
      modal.style.maxHeight='70vh';
      modal.style.display='none';
      modal.style.flexDirection='column';
      modal.style.background='#0f172a';
      modal.style.color='#fff';
      modal.style.borderRadius='12px';
      modal.style.boxShadow='0 12px 28px rgba(0,0,0,.35)';
      modal.style.overflow='hidden';
      modal.style.zIndex='10000';

      modal.innerHTML = `
        <div id="chat-header" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#111827;border-bottom:1px solid rgba(255,255,255,.08)">
          <div style="font-weight:600">Civic Assistant</div>
          <button id="closeChatBtn" type="button" aria-label="Close chat" style="background:transparent;border:none;color:#fff;font-size:18px;line-height:1">×</button>
        </div>
        <div id="chat-messages" style="padding:12px; gap:10px;display:flex;flex-direction:column;overflow:auto;min-height:160px;maxHeight:44vh;background:#0b1220"></div>
        <form id="chat-form" style="display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08);background:#0b1220">
          <input id="chat-input" type="text" autocomplete="off" placeholder="Ask about your representatives, bills, or voting…" aria-label="Message" style="flex:1;padding:10px 12px;border-radius:8px;border:1px solid #334155;background:#111827;color:#fff" />
          <button id="sendChatBtn" type="submit" style="padding:10px 14px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-weight:600">Send</button>
        </form>
      `;
      document.body.appendChild(modal);
    }
  }

  function openModal(){ const m=$('chat-modal'); if (m) m.style.display='flex'; }
  function closeModal(){ const m=$('chat-modal'); if (m) m.style.display='none'; }

  function addMessage(text, role){
    const list = $('chat-messages');
    if (!list) return;
    const bubble = document.createElement('div');
    bubble.style.padding='10px 12px';
    bubble.style.borderRadius='10px';
    bubble.style.maxWidth='90%';
    bubble.style.whiteSpace='pre-wrap';
    bubble.style.wordBreak='break-word';
    bubble.textContent = text;
    if (role === 'user') {
      bubble.style.alignSelf='flex-end';
      bubble.style.background='#1f2a44';
    } else {
      bubble.style.alignSelf='flex-start';
      bubble.style.background='#122233';
    }
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
  }

  async function sendMessage(prompt){
    addMessage(prompt, 'user');
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method:'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ message: prompt })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply = data?.reply || data?.message || '[No reply]';
      addMessage(String(reply), 'assistant');
    } catch (err) {
      console.error('[Chat] send failed', err);
      addMessage('Sorry — the assistant is temporarily unavailable. Please try again shortly.', 'assistant');
    }
  }

  function wire(){
    const btn = $('openChatBtn');
    const modal = $('chat-modal');
    const closeBtn = $('closeChatBtn');
    const form = $('chat-form');
    const input = $('chat-input');

    if (!btn || !modal || !form || !input) {
      console.warn('[Chat] Missing nodes', { btn:!!btn, modal:!!modal, form:!!form, input:!!input });
      return;
    }

    btn.addEventListener('click', () => {
      openModal();
      setTimeout(()=> input?.focus(), 0);
    });
    closeBtn?.addEventListener('click', closeModal);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = input.value.trim();
      if (!val) return;
      input.value='';
      sendMessage(val);
    });

    // Escape to close
    document.addEventListener('keydown', (e)=>{
      if (e.key === 'Escape') closeModal();
    });

    console.log('[Chat] reset widget wired ✅');
  }

  // Init
  window.addEventListener('DOMContentLoaded', () => {
    try {
      ensureChatDOM();
      wire();
    } catch (e) {
      console.error('[Chat] reset init failed', e);
    }
  });
})();