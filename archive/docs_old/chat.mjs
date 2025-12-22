import { CONFIG } from '/js/app-shell.mjs';

export function mount(target = document.getElementById('app-root')){
  const wrap = document.createElement('section');
  wrap.id = 'mod-chat';
  wrap.innerHTML = `
    <button id="openChatBtn" type="button" style="position:fixed;right:16px;bottom:16px;z-index:9999;width:56px;height:56px;border:none;border-radius:50%;background:#1d4ed8;color:#fff;box-shadow:0 6px 16px rgba(0,0,0,.25)">💬</button>
    <div id="chat-modal" style="display:none;position:fixed;right:16px;bottom:80px;width:min(420px,94vw);max-height:70vh;z-index:10000;background:#0f172a;color:#fff;border-radius:12px;box-shadow:0 12px 28px rgba(0,0,0,.35);overflow:hidden">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#111827;border-bottom:1px solid rgba(255,255,255,.08)">
        <strong>Civic Assistant</strong>
        <button id="closeChatBtn" type="button" style="background:transparent;border:none;color:#fff;font-size:18px">×</button>
      </div>
      <div id="chat-messages" style="padding:12px;display:flex;flex-direction:column;gap:10px;min-height:160px;max-height:44vh;overflow:auto;background:#0b1220"></div>
      <form id="chat-form" style="display:flex;gap:8px;padding:12px;border-top:1px solid rgba(255,255,255,.08);background:#0b1220">
        <input id="chat-input" type="text" placeholder="Ask about reps, bills, voting…" style="flex:1;padding:10px 12px;border-radius:8px;border:1px solid #334155;background:#111827;color:#fff" />
        <button type="submit" style="padding:10px 14px;border-radius:8px;border:none;background:#1d4ed8;color:#fff;font-weight:600">Send</button>
      </form>
    </div>`;
  target.appendChild(wrap);

  const btn = wrap.querySelector('#openChatBtn');
  const modal = wrap.querySelector('#chat-modal');
  const closeBtn = wrap.querySelector('#closeChatBtn');
  const form = wrap.querySelector('#chat-form');
  const input = wrap.querySelector('#chat-input');
  const msgs = wrap.querySelector('#chat-messages');

  btn.addEventListener('click',()=>{ 
    modal.style.display='block'; 
    setTimeout(()=>input.focus(),0); 
  });
  
  closeBtn.addEventListener('click',()=>{
    modal.style.display='none';
    btn.focus();
  });
  
  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'block') {
      modal.style.display = 'none';
      btn.focus();
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const val = input.value.trim(); 
    if (!val) return; 
    input.value='';
    
    // Add user message
    const user = document.createElement('div'); 
    user.textContent = val; 
    user.style.cssText='align-self:flex-end;background:#1f2a44;padding:10px 12px;border-radius:10px;max-width:90%'; 
    msgs.appendChild(user); 
    msgs.scrollTop = msgs.scrollHeight;
    
    try {
      const r = await fetch(`${CONFIG.API_BASE}/api/chat`, {
        method:'POST', 
        headers:{'Content-Type':'application/json'}, 
        body:JSON.stringify({message:val})
      });
      
      const data = r.ok ? await r.json() : {reply:`Error ${r.status}`};
      const ai = document.createElement('div'); 
      ai.textContent = data?.reply || data?.message || '[No reply]'; 
      ai.style.cssText='align-self:flex-start;background:#122233;padding:10px 12px;border-radius:10px;max-width:90%'; 
      msgs.appendChild(ai); 
      msgs.scrollTop = msgs.scrollHeight;
    } catch(err){
      const ai = document.createElement('div'); 
      ai.textContent = 'Network error. Please try again.'; 
      ai.style.cssText='align-self:flex-start;background:#122233;padding:10px 12px;border-radius:10px;max-width:90%'; 
      msgs.appendChild(ai);
    }
  });
  
  // Scroll input into view on focus for mobile
  input.addEventListener('focus', () => {
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        input.scrollIntoView({behavior: 'smooth', block: 'center'});
      }, 300);
    }
  });

  console.log('[Chat] module mounted');
}