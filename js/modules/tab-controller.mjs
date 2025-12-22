export function initTabs() {
  const tabs = document.querySelectorAll('.civic-tab');
  const panels = document.querySelectorAll('.civic-panel');

  if (!tabs.length || !panels.length) {
    console.warn('[Tabs] Navigation elements not found');
    return;
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.getAttribute('data-tab');
      
      // Update Tabs
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Update Panels
      panels.forEach(panel => {
        if (panel.id === `${targetId}-panel`) {
          panel.classList.add('active');
          console.log(`[Tabs] Switched to ${targetId}`);
        } else {
          panel.classList.remove('active');
        }
      });
    });
  });

  console.log('[Tabs] Controller initialized');
}
