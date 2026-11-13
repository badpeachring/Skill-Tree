(function installVisualBlueprintAndCopyEngine() {
  let activeBp = null, cam = { s: 1, x: 0, y: 0 }, ptrs = new Map(), pDist = 0, pScale = 1, panX = 0, panY = 0, origX = 0, origY = 0;

  function findTreeById(id) {
    const pool = [
      ...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []),
      ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])
    ];
    return pool.find(x => x.id === id);
  }

  window.copyPresetTreeToUser = async function(id) {
    const t = findTreeById(id);
    if (!t) return;
    const layout = (t.nodes || []).map((n, i) => ({ ...n }));
    if (typeof window.computeOrganicTreePositions === "function") {
      window.computeOrganicTreePositions(layout);
    }
    const stamp = Date.now();
    const ids = layout.map((_, i) => `cp_${stamp}_${i}`);
    const cloned = layout.map((n, i) => {
      const pIdx = typeof n.parentIdx === "number" ? n.parentIdx : (typeof n._p === "number" ? n._p : -1);
      return {
        id: ids[i],
        title: n.title,
        status: "locked",
        tier: n.tier || "Tier I • Foundation",
        icon: n.icon || "✦",
        color: n.color || "#38bdf8",
        x: n.x,
        y: n.y,
        notes: n.notes || "",
        steps: n.steps || [],
        links: n.links || [],
        parentId: (pIdx >= 0 && ids[pIdx]) ? ids[pIdx] : null
      };
    });
    await createNewTree(t.title, t.attr || "INT", cloned);
    const modal = document.getElementById("serverInspectModal");
    if (modal) modal.classList.add("hidden");
    navigate("viewTrees", "My Constellations");
  };

  function ensureModal() {
    let modal = document.getElementById("serverInspectModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "serverInspectModal";
      document.body.appendChild(modal);
    }
    modal.className = "fixed inset-0 z-50 bg-slate-950 flex flex-col";
    modal.innerHTML = `
      <div class="px-3 py-2.5 border-b border-sky-500/30 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
        <div class="min-w-0">
          <span id="inspTag" class="text-[10px] uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">Concept</span>
          <span id="inspAuthor" class="text-[11px] text-slate-400"></span>
          <h2 id="inspTitle" class="text-sm font-black text-white skyrim-font mt-0.5 truncate"></h2>
        </div>
        <div class="flex items-center space-x-1.5 shrink-0">
          <button id="bpRegrowBtn" type="button" class="px-2 py-1.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-bold" title="Re-Grow Organic Branches">🎲</button>
          <button id="bpCloneAllBtn" type="button" class="px-2.5 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-bold">+ Copy Tree</button>
          <button id="bpCloseBtn" type="button" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button>
        </div>
      </div>
      <div id="bpCanvasWrap" class="relative flex-1 overflow-hidden touch-none">
        <canvas id="bpCanvas" class="absolute inset-0 w-full h-full"></canvas>
        <div id="bpNodesLayer" class="absolute inset-0 origin-top-left"></div>
        <div class="absolute top-2.5 left-3 text-[10px] text-slate-400 bg-slate-950/85 px-2.5 py-1 rounded-full border border-slate-800">Pinch to zoom • Drag to pan • Tap any star node</div>
      </div>
      <div id="bpNodeDrawer" class="hidden border-t border-sky-500/30 bg-slate-900 p-4 space-y-2 max-h-[42vh] overflow-y-auto shrink-0">
        <div class="flex justify-between items-start gap-2"><div><span id="bpNodeTier" class="text-[10px] font-black uppercase text-amber-300"></span><h3 id="bpNodeTitle" class="text-sm font-bold text-white skyrim-font"></h3></div><button id="bpHarvestBtn" type="button" class="px-3 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-xs font-bold shrink-0">+ Harvest Skill</button></div>
        <p id="bpNodeNotes" class="text-xs text-slate-300 leading-relaxed"></p><div id="bpNodeMeta" class="space-y-1 text-[11px]"></div>
      </div>`;

    const wrap = document.getElementById("bpCanvasWrap");
    wrap.addEventListener("pointerdown", e => { ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 1) { panX = e.clientX; panY = e.clientY; origX = cam.x; origY = cam.y; } else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pDist = Math.hypot(b.x - a.x, b.y - a.y) || 1; pScale = cam.s; } });
    wrap.addEventListener("pointermove", e => { if (!ptrs.has(e.pointerId)) return; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (ptrs.size === 1) { cam.x = origX + (e.clientX - panX); cam.y = origY + (e.clientY - panY); renderBp(); } else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; cam.s = Math.min(2.6, Math.max(0.42, pScale * (Math.hypot(b.x - a.x, b.y - a.y) / pDist))); renderBp(); } });
    const endP = e => ptrs.delete(e.pointerId);
    wrap.addEventListener("pointerup", endP);
    wrap.addEventListener("pointercancel", endP);
    document.getElementById("bpCloseBtn").onclick = () => modal.classList.add("hidden");
    document.getElementById("bpRegrowBtn").onclick = () => {
      if (!activeBp) return;
      window.computeOrganicTreePositions(activeBp._layout, Date.now());
      renderBp();
    };
    document.getElementById("bpCloneAllBtn").onclick = () => {
      if (activeBp) window.copyPresetTreeToUser(activeBp.id);
    };
    return modal;
  }

  function renderBp() {
    if (!activeBp) return;
    const c = document.getElementById("bpCanvas"), layer = document.getElementById("bpNodesLayer"), wrap = document.getElementById("bpCanvasWrap");
    if (!c || !layer || !wrap) return;
    c.width = wrap.clientWidth || window.innerWidth;
    c.height = wrap.clientHeight || (window.innerHeight - 60);
    layer.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.scale(cam.s, cam.s);
    if (typeof window.renderWorldTreeCanvas === "function") {
      window.renderWorldTreeCanvas(ctx, c.width, c.height, activeBp._layout, true);
    }
    ctx.restore();

    layer.innerHTML = activeBp._layout.map((n, i) => `<button type="button" data-i="${i}" style="left:${n.x}%;top:${n.y}%" class="bp-star absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><div style="background:#0f172a;border-color:${n.color || "#38bdf8"};box-shadow:0 0 14px ${n.color || "#38bdf8"}66" class="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold">${n.icon || "✦"}</div><span class="text-[10px] font-bold text-slate-100 bg-slate-950/90 px-2 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">${n.title}</span></button>`).join("");
    layer.querySelectorAll(".bp-star").forEach(b => b.onclick = () => {
      const n = activeBp._layout[Number(b.dataset.i)];
      document.getElementById("bpNodeDrawer").classList.remove("hidden");
      document.getElementById("bpNodeTier").textContent = n.tier || "Concept Skill";
      document.getElementById("bpNodeTitle").textContent = n.title;
      document.getElementById("bpNodeNotes").textContent = n.notes || "";
      document.getElementById("bpNodeMeta").innerHTML = (n.steps || []).map(s => `<div class="text-emerald-300">☑ ${s.text}</div>`).join("") + (n.links || []).map(l => `<a href="${l.url}" target="_blank" class="block text-sky-400 underline">🔗 ${l.label}</a>`).join("");
      document.getElementById("bpHarvestBtn").onclick = () => harvestSingleNode(activeBp.id, n._oi);
    });
  }

  window.openVisualBlueprint = function(id) {
    const t = findTreeById(id);
    if (!t) return;
    const layout = (t.nodes || []).map((n, i) => ({ ...n, _oi: i }));
    if (typeof window.computeOrganicTreePositions === "function") {
      window.computeOrganicTreePositions(layout);
    }
    activeBp = { ...t, _layout: layout };
    const modal = ensureModal();
    cam = layout.length >= 15 ? { s: 0.62, x: window.innerWidth * 0.19, y: 25 } : { s: 1, x: 0, y: 0 };
    document.getElementById("inspTag").textContent = `${t.attr} • ${t.tag}`;
    document.getElementById("inspTitle").textContent = t.title;
    document.getElementById("inspAuthor").textContent = `By ${t.author}`;
    modal.classList.remove("hidden");
    requestAnimationFrame(renderBp);
  };

  function upgradeServerCards() {
    document.querySelectorAll("#serverTreeList button").forEach(btn => {
      const txt = btn.textContent || "";
      if (!txt.includes("Inspect")) return;
      const card = btn.closest(".glass-panel") || btn.parentElement;
      const titleEl = card ? card.querySelector("h3, h4, .skyrim-font") : null;
      const title = titleEl ? titleEl.textContent.trim() : "";
      const pool = [...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []), ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])];
      const match = pool.find(x => x.title === title);
      if (!match) return;

      const row = document.createElement("div");
      row.className = "flex items-center gap-2 mt-2";
      row.innerHTML = `
        <button type="button" class="flex-1 py-2 bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-bold">🌳 View Tree</button>
        <button type="button" class="px-3 py-2 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold">+ Copy Tree</button>`;
      row.children[0].onclick = (e) => { e.stopPropagation(); window.openVisualBlueprint(match.id); };
      row.children[1].onclick = (e) => { e.stopPropagation(); window.copyPresetTreeToUser(match.id); };
      btn.replaceWith(row);
    });
  }

  window.inspectServerTree = window.openVisualBlueprint;
  if (typeof window.renderServerTrees === "function") {
    const orig = window.renderServerTrees;
    window.renderServerTrees = function() {
      orig();
      window.inspectServerTree = window.openVisualBlueprint;
      upgradeServerCards();
    };
    window.renderServerTrees();
  }
})();
