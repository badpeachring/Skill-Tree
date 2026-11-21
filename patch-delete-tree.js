(function installCleanDeleteBtn() {
  function syncButton() {
    const addNodeBtn = document.getElementById('addNodeBtn');
    const toolbar = addNodeBtn?.parentElement;
    if (!toolbar) return;

    [...toolbar.querySelectorAll('button')].forEach(b => {
      if (b.id === 'afCleanDeleteTreeBtn') return;
      const txt = (b.textContent || '').trim();
      const title = (b.getAttribute('title') || '').toLowerCase();
      if (txt.includes('🗑') || title.includes('delete') || b.id.toLowerCase().includes('delete')) {
        b.remove();
      }
    });

    if (document.getElementById('afCleanDeleteTreeBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'afCleanDeleteTreeBtn';
    btn.type = 'button';
    btn.textContent = '🗑️';
    btn.title = 'Delete Active Constellation';
    btn.className = 'px-2 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-200 rounded text-xs font-bold';
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof window.deleteCurrentTree === 'function') {
        window.deleteCurrentTree();
      }
    });
    toolbar.appendChild(btn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncButton);
  else syncButton();
  setTimeout(syncButton, 500);
  setTimeout(syncButton, 1500);
  setTimeout(syncButton, 3000);
})();