(function installEnforcedDeleteBtn() {
  const BTN_ID = 'afEnforcedDeleteTreeBtn';

  function enforceSingleButton() {
    const addNodeBtn = document.getElementById('addNodeBtn');
    const toolbar = addNodeBtn?.parentElement;
    if (!toolbar) return;

    // Kill EVERY other trash/delete button in the toolbar
    [...toolbar.querySelectorAll('button')].forEach(b => {
      if (b.id === BTN_ID) return;
      const txt = (b.textContent || '').trim();
      const title = (b.getAttribute('title') || '').toLowerCase();
      const id = (b.id || '').toLowerCase();
      const cls = (b.className || '').toLowerCase();
      const isRedTrash = (cls.includes('rose') || cls.includes('red')) && (txt.includes('🗑') || txt === '' || b.querySelector('svg'));
      if (txt.includes('🗑') || title.includes('delete') || id.includes('delete') || isRedTrash) {
        b.remove();
      }
    });

    if (document.getElementById(BTN_ID)) return;

    const btn = document.createElement('button');
    btn.id = BTN_ID;
    btn.type = 'button';
    btn.textContent = '🗑️';
    btn.title = 'Delete Active Constellation';
    btn.className = 'px-2 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-200 rounded text-xs font-bold';
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.deleteCurrentTree === 'function') {
        await window.deleteCurrentTree();
      } else {
        alert('Cache error: window.deleteCurrentTree not loaded yet. Clear browser cache or close/reopen tab.');
      }
    });
    toolbar.appendChild(btn);
  }

  function startObserver() {
    enforceSingleButton();
    const target = document.getElementById('activeTreeWorkspace') || document.body;
    const obs = new MutationObserver(() => enforceSingleButton());
    obs.observe(target, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startObserver);
  else startObserver();
})();