(function installDeepSearchAndTagEngine() {
  let allowNsfw = false;
  let queryText = "";

  function isTreeNsfw(t) {
    if (!t) return false;
    if (t.nsfw === true) return true;
    const tags = (t.tags || []).map(x => String(x).toLowerCase());
    if (tags.includes("nsfw") || tags.includes("18+")) return true;
    return /\b(nsfw|18\+)\b/i.test(`${t.title || ""} ${t.tag || ""}`);
  }

  function matchTreeAndNodes(t, rawQ) {
    const q = (rawQ || "").trim().toLowerCase();
    if (!q) return { matched: true, nodeHits: [] };
    const isTagSearch = q.startsWith("#");
    const term = isTagSearch ? q.slice(1) : q;
    const tags = (t.tags || []).map(x => String(x).toLowerCase());

    if (isTagSearch) {
      return { matched: tags.some(tag => tag.includes(term)), nodeHits: [] };
    }

    const headMatch = `${t.title || ""} ${t.author || ""} ${t.attr || ""} ${tags.join(" ")}`.toLowerCase().includes(term);
    const nodeHits = (t.nodes || []).filter(n =>
      `${n.title || ""} ${n.notes || ""} ${(n.steps || []).map(s => s.text || s).join(" ")}`.toLowerCase().includes(term)
    );
    return { matched: headMatch || nodeHits.length > 0, nodeHits };
  }

  function renderRealmSearchBar() {
    const list = document.getElementById("serverTreeList");
    if (!list || document.getElementById("realmSearchBox")) return;

    const box = document.createElement("div");
    box.id = "realmSearchBox";
    box.className = "glass-panel rounded-xl p-3 mb-3 space-y-2 border border-sky-500/30";
    box.innerHTML = `
      <div class="flex items-center gap-2">
        <input id="realmSearchInput" type="search" placeholder="Search trees, #tags, or inner nodes (e.g. #drywall, piriformis)..." class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
        <button id="realmNsfwToggle" type="button" class="px-2.5 py-2 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400 shrink-0">🔞 NSFW: OFF</button>
      </div>
      <div id="realmQuickTags" class="flex flex-wrap gap-1.5 text-[10px]"></div>`;
    list.parentElement.insertBefore(box, list);

    const inp = document.getElementById("realmSearchInput");
    const nsfwBtn = document.getElementById("realmNsfwToggle");

    inp.oninput = () => { queryText = inp.value; applyRealmFilter(); };
    nsfwBtn.onclick = () => {
      allowNsfw = !allowNsfw;
      nsfwBtn.textContent = allowNsfw ? "🔞 NSFW: ON" : "🔞 NSFW: OFF";
      nsfwBtn.className = allowNsfw
        ? "px-2.5 py-2 rounded-lg text-[11px] font-bold border border-rose-500 bg-rose-500/20 text-rose-300 shrink-0"
        : "px-2.5 py-2 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400 shrink-0";
      applyRealmFilter();
    };
  }

  function applyRealmFilter() {
    const list = document.getElementById("serverTreeList");
    if (!list) return;
    const pool = [
      ...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []),
      ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])
    ];

    // Collect top tags for quick filter chips
    const tagBar = document.getElementById("realmQuickTags");
    if (tagBar) {
      const counts = new Map();
      pool.forEach(t => {
        if (!allowNsfw && isTreeNsfw(t)) return;
        (t.tags || []).forEach(tg => counts.set(tg, (counts.get(tg) || 0) + 1));
      });
      const topTags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(x => x[0]);
      tagBar.innerHTML = topTags.map(tg =>
        `<button type="button" data-tag="#${tg}" class="qtag px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-sky-300">#${tg}</button>`
      ).join("");
      tagBar.querySelectorAll(".qtag").forEach(b => b.onclick = () => {
        const inp = document.getElementById("realmSearchInput");
        inp.value = inp.value === b.dataset.tag ? "" : b.dataset.tag;
        queryText = inp.value;
        applyRealmFilter();
      });
    }

    [...list.children].forEach(card => {
      const titleEl = card.querySelector("h2, h3, h4, .skyrim-font");
      const title = titleEl ? titleEl.textContent.trim() : "";
      const tree = pool.find(x => x.title === title);
      if (!tree) return;

      // Enforce NSFW safety gate
      if (!allowNsfw && isTreeNsfw(tree)) {
        card.style.display = "none";
        return;
      }

      const { matched, nodeHits } = matchTreeAndNodes(tree, queryText);
      card.style.display = matched ? "" : "none";

      // Render tag pills & matching inner-node badges on the card
      let metaBox = card.querySelector(".search-meta-badges");
      if (!metaBox) {
        metaBox = document.createElement("div");
        metaBox.className = "search-meta-badges mt-2 space-y-1";
        titleEl.parentElement.appendChild(metaBox);
      }
      const tagsHtml = (tree.tags || []).map(tg =>
        `<span class="inline-block text-[10px] px-1.5 py-0.5 mr-1 rounded ${tg === "nsfw" ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-sky-300"}">#${tg}</span>`
      ).join("");
      const hitsHtml = (queryText.trim() && nodeHits.length)
        ? `<div class="text-[11px] text-emerald-300 bg-emerald-950/50 border border-emerald-500/30 rounded-lg px-2 py-1">🎯 ${nodeHits.length} matching node(s): <b>${nodeHits.slice(0, 3).map(n => n.title).join(", ")}</b></div>`
        : "";
      metaBox.innerHTML = `${tagsHtml}${hitsHtml}`;
    });
  }

  // In-Tree Node Spotlight Search inside Blueprint Viewer
  function injectInTreeSearch() {
    const bpWrap = document.getElementById("bpCanvasWrap");
    if (!bpWrap || document.getElementById("bpNodeSearchBar")) return;

    const bar = document.createElement("div");
    bar.id = "bpNodeSearchBar";
    bar.className = "absolute top-10 left-3 right-3 z-20 flex gap-1.5";
    bar.innerHTML = `
      <input id="bpNodeSearchInput" type="search" placeholder="🔍 Jump to star node inside this tree..." class="flex-1 bg-slate-950/90 border border-sky-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none">
      <div id="bpNodeSearchResults" class="hidden absolute top-9 left-0 right-0 bg-slate-950/95 border border-slate-700 rounded-lg max-h-40 overflow-y-auto divide-y divide-slate-800"></div>`;
    bpWrap.appendChild(bar);

    const inp = document.getElementById("bpNodeSearchInput");
    const res = document.getElementById("bpNodeSearchResults");
    inp.oninput = () => {
      const q = inp.value.trim().toLowerCase();
      const stars = [...document.querySelectorAll("#bpNodesLayer .bp-star")];
      if (!q) {
        res.classList.add("hidden");
        stars.forEach(s => s.style.opacity = "1");
        return;
      }
      const matches = stars.filter(s => s.textContent.toLowerCase().includes(q));
      stars.forEach(s => s.style.opacity = matches.includes(s) ? "1" : "0.22");
      res.classList.remove("hidden");
      res.innerHTML = matches.slice(0, 8).map(s =>
        `<button type="button" data-idx="${s.dataset.i}" class="w-full text-left px-3 py-1.5 text-xs text-sky-300 hover:bg-slate-800">${s.textContent.trim()}</button>`
      ).join("") || `<div class="px-3 py-1.5 text-xs text-slate-400">No matching nodes</div>`;
      res.querySelectorAll("button").forEach(b => b.onclick = () => {
        const star = document.querySelector(`#bpNodesLayer .bp-star[data-i="${b.dataset.idx}"]`);
        if (star) star.click();
        res.classList.add("hidden");
      });
    };
  }

  const obs = new MutationObserver(() => {
    renderRealmSearchBar();
    applyRealmFilter();
    injectInTreeSearch();
  });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => { renderRealmSearchBar(); applyRealmFilter(); }, 350);
})();
