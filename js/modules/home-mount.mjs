console.log('[HomeMount] module loading...');
window.WDP_HOME_MOUNT_LOADED = true;
import { CONFIG, boot } from '/js/app-shell.mjs';
import { mount as mountChat } from '/js/modules/chat.mjs';
import { mount as mountReps } from '/js/modules/representatives.mjs';
import { mount as mountDash } from '/js/modules/dashboard.mjs';
import { mount as mountBills } from '/js/modules/bills.mjs';
import { mount as mountCourt } from '/js/modules/court.mjs';
import { initTabs } from '/js/modules/tab-controller.mjs';

async function init() {
  console.log('[HomeMount] Initializing modules...');
  
  // Wait for config to be ready (prevents race conditions with other boot calls)
  await boot();
  
  const chatTarget = document.getElementById('home-chat');
  const repsTarget = document.getElementById('home-reps');
  const dashTarget = document.getElementById('home-dashboard');
  const billsTarget = document.getElementById('home-bills');
  const courtTarget = document.getElementById('home-court');

  console.log('[HomeMount] Targets:', { chatTarget, repsTarget, dashTarget, billsTarget, courtTarget });

  mountChat(chatTarget);
  mountReps(repsTarget);
  mountDash(dashTarget);
  mountBills(billsTarget);
  mountCourt(courtTarget);
  console.log('[HomeMount] All modules mount functions called');
  
  // Initialize Tab Controller after modules are mounted
  initTabs();
}

// Execute immediately since modules are deferred by default
init();