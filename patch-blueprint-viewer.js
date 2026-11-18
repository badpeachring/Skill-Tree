(function installConceptViewerWithCleanHarvest() {
  let activeBp = null, cam = { s: 1, x: 0, y: 0 }, ptrs = new Map(), pDist = 0, pScale = 1, panX = 0, panY = 0, origX = 0, origY = 0;

  const getAllTrees = () => {
    const m = new Map();
    [...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []), ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])].forEach(t => { if (t?.id && !m.has(t.id)) m.set(t.id, t); });
    return [...m.values()];
  };

  window.copyPresetTreeToUser = async function(id) {
    const t = getAllTrees().find(x => x.id === id);
    if (!t) return;
    const layout = (t.nodes || []).map(n => ({ ...n }));
    window.computeOrganicTreePositions?.(layout, Date.now());
    const stamp = Date.now(), ids = layout.map((_, i) => `cp_${stamp}_${i}`);
    const cloned = layout.map((n, i) => {
      const pIdx = typeof n.parentIdx === "number" ? n.parentIdx : -1;
      const lit = pIdx < 0 || window.isGrimoireUnlocked?.(t.id, n.title);
      return {
        id: ids[i], title: n.title, status: lit ? "mastered" : "locked",
        tier: n.tier || "Category", icon: n.icon || "📖", color: n.color || "#38bdf8",
        x: n.x, y: n.y, tags: n.tags || [], notes: n.notes || "", image: n.image || "",
        steps: (n.steps || []).map(s => ({ text: s.text || s, done: false })), links: n.links || [],
        parentId: (pIdx >= 0 && ids[pIdx]) ? ids[pIdx] : null
      };
    });
    await createNewTree(t.title, t.attr || "WIS", cloned);
    document.getElementById("serverInspectModal")?.classList.add("hidden");
    navigate("viewTrees", "My Constellations");
  };

  function openCleanHarvestPicker(treeObj, nodeObj) {
    let pm = document.getElementById("cleanHarvestModal");
    if (!pm) { pm = document.createElement("div"); pm.id = "cleanHarvestModal"; pm.className = "fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"; document.body.appendChild(pm); }
    const userTrees = (typeof userData !== "undefined" && Array.isArray(userData?.trees)) ? userData.trees : [];
    pm.innerHTML = `<div class="w-full max-w-sm glass-panel rounded-2xl p-5 space-y-3"><div class="flex justify-between items-center"><h3 class="text-base font-black text-sky-400 skyrim-font">🌱 Harvest Skill Node</h3><button id="closeHarvBtn" class="text-slate-400">✕</button></div><p class="text-xs text-slate-300">Where do you want to store <b>${nodeObj.title}</b>?</p><button id="harvToNebulaBtn" class="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs">🌌 Send to The Grand Nebula (Auto-Categorized)</button><div class="space-y-1.5 pt-1"><label class="text-[10px] uppercase font-bold text-slate-400">Or add to a specific constellation:</label><select id="harvTargetSel" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white">${userTrees.map(t => `<option value="${t.id}">${t.title}</option>`).join("")}</select><button id="harvToTreeBtn" class="w-full py-2 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs">+ Add to Selected Tree</button></div></div>`;
    pm.classList.remove("hidden");
    document.getElementById("closeHarvBtn").onclick = () => pm.classList.add("hidden");
    document.getElementById("harvToNebulaBtn").onclick = async () => { pm.classList.add("hidden"); await window.harvestIntoGrandNebula?.(nodeObj, treeObj.title.split(":")[0], treeObj.attr || "WIS"); };
    document.getElementById("harvToTreeBtn").onclick = async () => {
      const target = userTrees.find(t => t.id === document.getElementById("harvTargetSel").value) || userTrees[0];
      if (!target) return alert("Create a constellation first.");
      target.nodes.push({ id: `h_${Date.now()}`, parentIdx: -1, parentId: null, title: nodeObj.title, status: "learning", tier: nodeObj.tier || "Harvested", icon: nodeObj.icon || "✦", color: nodeObj.color || "#38bdf8", x: 50, y: 65, notes: nodeObj.notes || "", steps: (nodeObj.steps || []).map(s => ({ text: s.text || s, done: false })), links: nodeObj.links || [] });
      await saveUserData?.(); pm.classList.add("hidden"); alert(`Harvested into "${target.title}"!`);
    };
  }

  function ensureModal() {
    let modal = document.getElementById("serverInspectModal");
    if (!modal) { modal = document.createElement("div"); modal.id = "serverInspectModal"; document.body.appendChild(modal); }
    // Solid deep-space background so Server Realm cards never bleed through behind Concept Trees
    modal.className = "fixed inset-0 z-50 bg-[#020617] flex flex-col";
    modal.innerHTML = `
      <div class="px-3 py-2.5 border-b border-sky-500/30 bg-slate-950 flex items-center justify-between gap-2 shrink-0">
        <div class="min-w-0"><span id="inspTag" class="text-[10px] uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">Concept</span> <span id="inspAuthor" class="text-[11px] text-slate-400"></span><h2 id="inspTitle" class="text-sm font-black text-white skyrim-font truncate"></h2></div>
        <div class="flex items-center space-x-1.5 shrink-0">
          <button id="bpFitBtn" type="button" class="px-2 py-1.5 bg-slate-800 text-sky-300 rounded-lg text-xs font-bold">⌖ Fit</button>
          <button id="bpCloneAllBtn" type="button" class="px-2.5 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-bold">+ Copy Tree</button>
          <button id="bpCloseBtn" type="button" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button>
        </div>
      </div>
      <div id="bpCanvasWrap" class="relative flex-1 overflow-hidden touch-none" style="background:radial-gradient(circle at 30% 25%, rgba(56,189,248,0.14), transparent 55%), radial-gradient(circle at 75% 70%, rgba(139,92,246,0.14), transparent 55%), #020617">
        <canvas id="bpCanvas" class="absolute inset-0 w-full h-full"></canvas>
        <div id="bpNodesLayer" class="absolute inset-0 origin-top-left"></div>
      </div>
      <div id="bpNodeDrawer" class="hidden border-t border-sky-500/40 bg-slate-900 p-4 space-y-2.5 max-h-[52vh] overflow-y-auto shrink-0">
        <div class="flex justify-between items-start gap-2"><div><span id="bpNodeTier" class="text-[10px] font-black uppercase text-amber-300"></span><h3 id="bpNodeTitle" class="text-base font-bold text-white skyrim-font"></h3></div><button id="bpCloseDrawerBtn" type="button" class="text-slate-400 text-sm px-2">✕</button></div>
        <p id="bpNodeNotes" class="text-xs text-slate-200 leading-relaxed whitespace-pre-line bg-slate-950/90 p-3 rounded-xl border border-slate-800"></p>
        <div id="bpNodeSteps" class="space-y-1.5 text-xs"></div>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <button id="bpUnlockReadBtn" type="button" class="py-2.5 bg-amber-500 text-slate-950 rounded-lg text-xs font-black">✨ Illuminate Node</button>
          <button id="bpHarvestBtn" type="button" class="py-2.5 bg-emerald-500 text-slate-950 rounded-lg text-xs font-black">🌱 Harvest Node</button>
        </div>
      </div>`;

    const wrap = document.getElementById("bpCanvasWrap");
    wrap.addEventListener("pointerdown", e => {
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) { panX = e.clientX; panY = e.clientY; origX = cam.x; origY = cam.y; }
      else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pDist = Math.hypot(b.x - a.x, b.y - a.y) || 1; pScale = cam.s; }
    });
    wrap.addEventListener("pointermove", e => {
      if (!ptrs.has(e.pointerId)) return;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size === 1) { cam.x = origX + (e.clientX - panX); cam.y = origY + (e.clientY - panY); renderBp(false); }
      else if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; cam.s = Math.min(2.5, Math.max(0.10, pScale * (Math.hypot(b.x - a.x, b.y - a.y) / pDist))); renderBp(false); }
    });
    const endP = e => ptrs.delete(e.pointerId);
    wrap.addEventListener("pointerup", endP); wrap.addEventListener("pointercancel", endP);
    document.getElementById("bpCloseBtn").onclick = () => { modal.classList.add("hidden"); activeBp = null; };
    document.getElementById("bpCloseDrawerBtn").onclick = () => document.getElementById("bpNodeDrawer").classList.add("hidden");
    document.getElementById("bpCloneAllBtn").onclick = () => activeBp && window.copyPresetTreeToUser(activeBp.id);
    document.getElementById("bpFitBtn").onclick = () => {
      if (!activeBp) return;
      const s = activeBp._layout.length >= 100 ? 0.16 : (activeBp._layout.length >= 40 ? 0.26 : 0.55);
      cam = { s, x: window.innerWidth * (0.5 - 0.5 * s), y: (window.innerHeight - 60) * (0.5 - 0.5 * s) };
      renderBp(false);
    };
    return modal;
  }

  function renderBp(rebuildDom = true) {
    if (!activeBp) return;
    const c = document.getElementById("bpCanvas"), wrap = document.getElementById("bpCanvasWrap"), layer = document.getElementById("bpNodesLayer");
    if (!c || !wrap || !layer) return;
    if (c.width !== wrap.clientWidth) c.width = wrap.clientWidth || window.innerWidth;
    if (c.height !== wrap.clientHeight) c.height = wrap.clientHeight || (window.innerHeight - 60);
    const ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    // Draw subtle deep-space background stars inside concept tree canvas
    ctx.fillStyle = "rgba(248,250,252,0.55)";
    for (let i = 0; i < 70; i++) { ctx.fillRect((Math.sin(i * 73.1) * 0.5 + 0.5) * c.width, (Math.cos(i * 39.7) * 0.5 + 0.5) * c.height, 1.5, 1.5); }
    ctx.save(); ctx.translate(cam.x, cam.y); ctx.scale(cam.s, cam.s);
    window.renderWorldTreeCanvas?.(ctx, c.width, c.height, activeBp._layout);
    ctx.restore();
    layer.style.transform = `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`;
    if (!rebuildDom) return;

    layer.innerHTML = activeBp._layout.map((n, i) => {
      const lit = n.status === "mastered" || n.parentIdx < 0 || window.isGrimoireUnlocked?.(activeBp.id, n.title);
      return `<button type="button" data-i="${i}" style="left:${n.x}%;top:${n.y}%;opacity:${lit ? "1" : "0.42"}" class="bp-star absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><div style="background:#0f172a;border-color:${lit ? (n.color || "#38bdf8") : "#475569"};box-shadow:${lit ? `0 0 16px ${n.color || "#38bdf8"}88` : "none"}" class="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm text-white font-bold">${n.icon || "📖"}</div><span class="text-[11px] font-bold ${lit ? "text-slate-100" : "text-slate-400"} bg-slate-950/90 px-2 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">${n.title}</span></button>`;
    }).join("");

    layer.querySelectorAll(".bp-star").forEach(b => b.onclick = () => {
      const n = activeBp._layout[Number(b.dataset.i)];
      n._previewSteps = (n.steps || []).map(s => ({ text: s.text || s, done: false }));
      document.getElementById("bpNodeDrawer").classList.remove("hidden");
      document.getElementById("bpNodeTier").textContent = n.tier || "Concept Skill";
      document.getElementById("bpNodeTitle").textContent = n.title;
      document.getElementById("bpNodeNotes").textContent = n.notes || "";
      const stepsBox = document.getElementById("bpNodeSteps");
      stepsBox.innerHTML = n._previewSteps.map((s, si) => `<label class="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800 text-emerald-300"><input type="checkbox" data-si="${si}"><span>${s.text}</span></label>`).join("");
      stepsBox.querySelectorAll("input[type=checkbox]").forEach(chk => chk.onchange = () => { n._previewSteps[Number(chk.dataset.si)].done = chk.checked; });

      document.getElementById("bpUnlockReadBtn").onclick = () => {
        if (n._previewSteps.length && !n._previewSteps.every(s => s.done)) {
          return alert("Complete all quest checklist steps above before illuminating this node!");
        }
        n.status = "mastered";
        window.markGrimoireUnlocked?.(activeBp.id, n.title);
        renderBp(true);
      };
      document.getElementById("bpHarvestBtn").onclick = () => openCleanHarvestPicker(activeBp, n);
    });
  }

  window.openVisualBlueprint = function(id) {
    const t = getAllTrees().find(x => x.id === id);
    if (!t) return;
    const layout = (t.nodes || []).map((n, i) => ({ ...n, _oi: i }));
    window.computeOrganicTreePositions?.(layout, Date.now());
    activeBp = { ...t, _layout: layout };
    const modal = ensureModal();
    const s = layout.length >= 100 ? 0.16 : (layout.length >= 40 ? 0.26 : 0.55);
    cam = { s, x: window.innerWidth * (0.5 - 0.5 * s), y: (window.innerHeight - 60) * (0.5 - 0.5 * s) };
    document.getElementById("inspTag").textContent = `${t.attr} • ${t.tag}`;
    document.getElementById("inspTitle").textContent = t.title;
    document.getElementById("inspAuthor").textContent = `By ${t.author}`;
    modal.classList.remove("hidden");
    renderBp(true);
  };

  window.inspectServerTree = window.openVisualBlueprint;
  let busy = false;
  const obs = new MutationObserver(() => {
    window.inspectServerTree = window.openVisualBlueprint;
    if (!busy) {
      busy = true;
      setTimeout(() => {
        busy = false;
        const pool = getAllTrees();
        document.querySelectorAll("button").forEach(btn => {
          if (!(btn.textContent || "").includes("Inspect Skills")) return;
          const card = btn.closest(".glass-panel") || btn.parentElement;
          const match = pool.find(x => x.title === card?.querySelector("h2, h3, h4, .skyrim-font")?.textContent?.trim());
          if (!match) return;
          if (match._privateHiddenFromRealm) { card.style.display = "none"; return; }
          const row = document.createElement("div");
          row.className = "flex items-center gap-2 mt-2";
          row.innerHTML = `<button type="button" class="flex-1 py-2 bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-bold">🌳 View Tree</button><button type="button" class="px-3 py-2 bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold">+ Copy Tree</button>`;
          const [vBtn, cBtn] = row.querySelectorAll("button");
          vBtn.onclick = e => { e.stopPropagation(); window.openVisualBlueprint(match.id); };
          cBtn.onclick = e => { e.stopPropagation(); window.copyPresetTreeToUser(match.id); };
          btn.replaceWith(row);
        });
      }, 150);
    }
  });
  obs.observe(document.body, { childList: true, subtree: true });
})();
