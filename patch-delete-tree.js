(function installUnifiedTreeDelete() {
  function findTreesStorage() {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const raw = localStorage.getItem(k);
      if (!raw || raw[0] !== '[' && raw[0] !== '{') continue;
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length && (parsed[0].nodes || parsed[0].name || parsed[0].title)) {
          return { key: k, data: parsed, wrapped: false };
        }
        if (parsed && typeof parsed === 'object') {
          for (const prop of ['trees', 'userTrees', 'constellations', 'skillTrees']) {
            if (Array.isArray(parsed[prop])) {
              return { key: k, data: parsed, prop, wrapped: true };
            }
          }
        }
      } catch {}
    }
    return null;
  }

  function wireSingleDeleteButton() {
    const addNodeBtn = document.getElementById('addNodeBtn');
    const toolbar = addNodeBtn?.parentElement;
    if (!toolbar) return;

    // Remove all existing trash/delete buttons in this toolbar so only one clean button remains
    [...toolbar.querySelectorAll('button')].forEach(b => {
      const txt = (b.textContent || '').trim();
      const title = (b.getAttribute('title') || '').toLowerCase();
      if (txt.includes('🗑') || title.includes('delete') || b.id.toLowerCase().includes('delete')) {
        b.remove();
      }
    });

    const delBtn = document.createElement('button');
    delBtn.id = 'deleteTreeBtn';
    delBtn.type = 'button';
    delBtn.textContent = '🗑️';
    delBtn.title = 'Delete Active Constellation';
    delBtn.className = 'px-2 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-200 rounded text-xs font-bold';

    delBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const sel = document.getElementById('treeSelect');
      const idx = sel ? sel.selectedIndex : 0;
      const label = sel?.options?.[idx]?.textContent?.trim() || `Constellation #${idx + 1}`;

      if (!confirm(`Delete "${label}" permanently?`)) return;

      // 1. Update global array if exposed on window
      const globalArr = Array.isArray(window.userTrees) ? window.userTrees : null;
      if (globalArr && idx >= 0 && idx < globalArr.length) {
        globalArr.splice(idx, 1);
      }

      // 2. Update localStorage directly
      const store = findTreesStorage();
      let remainingCount = globalArr ? globalArr.length : 0;
      if (store) {
        const arr = store.wrapped ? store.data[store.prop] : store.data;
        if (Array.isArray(arr) && idx >= 0 && idx < arr.length) {
          arr.splice(idx, 1);
          remainingCount = arr.length;
          localStorage.setItem(store.key, JSON.stringify(store.data));
        }
      }

      // 3. Persist to cloud if saveUserData is on window
      if (typeof window.saveUserData === 'function') {
        try { await window.saveUserData(); } catch {}
      }

      // 4. Update dropdown & view in-place without triggering a full-page reload
      if (sel && sel.options[idx]) {
        sel.remove(idx);
      }

      if (remainingCount === 0 || (sel && sel.options.length === 0)) {
        document.getElementById('activeTreeWorkspace')?.classList.add('hidden');
        document.getElementById('emptyTreeBanner')?.classList.remove('hidden');
      } else if (sel) {
        sel.selectedIndex = Math.max(0, Math.min(idx, sel.options.length - 1));
        sel.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, true);

    toolbar.appendChild(delBtn);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireSingleDeleteButton);
  else wireSingleDeleteButton();
  setTimeout(wireSingleDeleteButton, 600);
  setTimeout(wireSingleDeleteButton, 1800);
})();