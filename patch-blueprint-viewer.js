(function installFullVisualBlueprints() {
  const modal = document.getElementById("serverInspectModal");
  if (!modal) return;

  modal.className = "fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md hidden flex flex-col";
  modal.innerHTML = `
    <div class="px-4 py-2.5 border-b border-sky-500/25 bg-slate-950 flex items-center justify-between shrink-0">
      <div>
        <div class="flex items-center space-x-1.5">
          <span id="inspTag" class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">Concept</span>
          <span id="inspAuthor" class="text-[11px] text-slate-400">By Architect</span>
        </div>
        <h2 id="inspTitle" class="text-base font-black text-white skyrim-font mt-0.5">Tree Name</h2>
      </div>
      <div class="flex items-center space-x-2">
        <button id="bpCloneAllBtn" class="px-2.5 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-bold">+ Clone Tree</button>
        <button id="bpCloseBtn" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button>
      </div>
    </div>
    <div id="bpCanvasWrap" class="relative flex-1 overflow-hidden touch-none">
      <canvas id="bpCanvas" class="absolute inset-0 w-full h-full"></canvas>
      <div id="bpNodesLayer" class="absolute inset-0 origin-top-left"></div>
      <div class="absolute top-2.5 left-3 text-[10px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-full border border-slate-800">Pinch to zoom • Drag to pan • Tap any star to inspect & harvest</div>
    </div>
    <div id="bpNodeDrawer" class="hidden border-t border-sky-500/30 bg-slate-900/95 p-4 space-y-2 max-h-[44vh] overflow-y-auto shrink-0">
      <div class="flex justify-between items-start gap-2">
        <div>
          <span id="bpNodeTier" class="text-[10px] font-black uppercase text-amber-300">Tier I</span>
          <h3 id="bpNodeTitle" class="text-sm font-bold text-white skyrim-font">Skill Name</h3>
        </div>
        <button id="bpHarvestBtn" class="px-3 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-xs font-bold shrink-0">+ Harvest Skill</button>
      </div>
      <p id="bpNodeNotes" class="text-xs text-slate-300 leading-relaxed"></p>
      <div id="bpNodeMeta" class="space-y-1 text-[11px]"></div>
    </div>
  `;
    let activeBp = null, bpCam = { scale: 1, tx: 0, ty: 0 }, bpPtrs = new Map(), bpPinchD = 0, bpPinchS = 1, bpPanX = 0, bpPanY = 0, bpOrigX = 0, bpOrigY = 0;

  function computeFixedCanopy(nodes) {
    const tiers = ["Tier I", "Tier II", "Tier III", "Tier IV"];
    const buckets = [[], [], [], []];
    nodes.forEach((n, i) => {
      const tIdx = tiers.findIndex(k => (n.tier || "").includes(k));
      buckets[tIdx >= 0 ? tIdx : Math.min(3, Math.floor(i / 2))].push({ ...n, _origIdx: i });
    });
    const out = [];
    buckets.forEach((list, row) => {
      list.forEach((n, col) => {
        const x = n.x || Math.round(((col + 1) / (list.length + 1)) * 78 + 11);
        const y = n.y || Math.round(68 - row * 17 + (col % 2 === 0 ? -2 : 2));
        out.push({ ...n, x, y, _parentIdx: row === 0 ? -1 : Math.max(0, out.length - list.length - 1) });
      });
    });
    return out;
  }

  function renderBpCanopy() {
    if (!activeBp) return;
    const c = document.getElementById("bpCanvas"), layer = document.getElementById("bpNodesLayer"), wrap = document.getElementById("bpCanvasWrap");
    c.width = wrap.clientWidth; c.height = wrap.clientHeight;
    layer.style.transform = `translate(${bpCam.tx}px, ${bpCam.ty}px) scale(${bpCam.scale})`;
    const ctx = c.getContext("2d"); ctx.clearRect(0, 0, c.width, c.height);
    ctx.save(); ctx.translate(bpCam.tx, bpCam.ty); ctx.scale(bpCam.scale, bpCam.scale);
    const rx = c.width * 0.5, ry = c.height * 0.94, th = Math.min(c.height * 0.34, 110), cy = ry - th;
    ctx.fillStyle = "#1e293b";
    ctx.beginPath(); ctx.moveTo(rx - 42, c.height); ctx.quadraticCurveTo(rx, ry - 14, rx + 42, c.height); ctx.fill();
    ctx.beginPath(); ctx.moveTo(rx - 14, ry); ctx.quadraticCurveTo(rx - 5, ry - th * 0.5, rx, cy); ctx.quadraticCurveTo(rx + 5, ry - th * 0.5, rx + 14, ry); ctx.fill();
    const layout = activeBp._layout;
    layout.forEach(n => {
      const nx = (n.x / 100) * c.width, ny = (n.y / 100) * c.height, p = n._parentIdx >= 0 ? layout[n._parentIdx] : null;
      const sx = p ? (p.x / 100) * c.width : rx, sy = p ? (p.y / 100) * c.height : cy + 6;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(sx, (sy + ny) * 0.55, (sx + nx) * 0.5, ny + 18, nx, ny);
      ctx.lineWidth = p ? 3.5 : 6; ctx.strokeStyle = n.color || "#38bdf8"; ctx.globalAlpha = 0.65; ctx.stroke();
    });
    ctx.restore();
    layer.innerHTML = layout.map((n, i) => `<button type="button" data-i="${i}" style="left:${n.x}%;top:${n.y}%;border-color:${n.color || "#38bdf8"};box-shadow:0 0 14px ${n.color || "#38bdf8"}55" class="bp-star absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><div style="background:#0f172a;border-color:${n.color || "#38bdf8"}" class="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold">${n.icon || "✦"}</div><span class="text-[10px] font-bold text-slate-100 bg-slate-950/90 px-2 py-0.5 rounded border border-slate-800 mt-1 whitespace-nowrap">${n.title}</span></button>`).join("");
    layer.querySelectorAll(".bp-star").forEach(btn => btn.onclick = () => {
      const n = layout[Number(btn.dataset.i)];
      document.getElementById("bpNodeDrawer").classList.remove("hidden");
      document.getElementById("bpNodeTier").textContent = n.tier || "Blueprint Skill";
      document.getElementById("bpNodeTitle").textContent = n.title;
      document.getElementById("bpNodeNotes").textContent = n.notes || "";
      const steps = (n.steps || []).map(s => `<div class="text-emerald-300">☑ ${s.text}</div>`).join("");
      const links = (n.links || []).map(l => `<a href="${l.url}" target="_blank" class="block text-sky-400 underline">🔗 ${l.label}</a>`).join("");
      document.getElementById("bpNodeMeta").innerHTML = steps + links;
      document.getElementById("bpHarvestBtn").onclick = () => harvestSingleNode(activeBp.id, n._origIdx);
    });
  }

  const wrap = document.getElementById("bpCanvasWrap");
  wrap.addEventListener("pointerdown", e => { bpPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (bpPtrs.size === 1) { bpPanX = e.clientX; bpPanY = e.clientY; bpOrigX = bpCam.tx; bpOrigY = bpCam.ty; } else if (bpPtrs.size === 2) { const [a, b] = [...bpPtrs.values()]; bpPinchD = Math.hypot(b.x - a.x, b.y - a.y) || 1; bpPinchS = bpCam.scale; } });
  wrap.addEventListener("pointermove", e => { if (!bpPtrs.has(e.pointerId)) return; bpPtrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (bpPtrs.size === 1) { bpCam.tx = bpOrigX + (e.clientX - bpPanX); bpCam.ty = bpOrigY + (e.clientY - bpPanY); renderBpCanopy(); } else if (bpPtrs.size === 2) { const [a, b] = [...bpPtrs.values()]; bpCam.scale = Math.min(2.6, Math.max(0.6, bpPinchS * (Math.hypot(b.x - a.x, b.y - a.y) / bpPinchD))); renderBpCanopy(); } });
  const endBp = e => bpPtrs.delete(e.pointerId); wrap.addEventListener("pointerup", endBp); wrap.addEventListener("pointercancel", endBp);
  document.getElementById("bpCloseBtn").onclick = () => modal.classList.add("hidden");
  document.getElementById("bpCloneAllBtn").onclick = async () => { if (!activeBp) return; const layout = activeBp._layout; const cloned = layout.map((n, i) => ({ id: "cl_" + Date.now() + "_" + i, title: n.title, status: "locked", tier: n.tier || "Tier I • Foundation", icon: n.icon || "✦", color: n.color || "#38bdf8", x: n.x, y: n.y, notes: n.notes || "", steps: n.steps || [], links: n.links || [], parentId: null })); await createNewTree(activeBp.title, activeBp.attr, cloned); modal.classList.add("hidden"); navigate("viewTrees", "My Constellations"); };

  window.inspectServerTree = function(id) {
    const t = publicTreesCache.find(x => x.id === id); if (!t) return;
    activeBp = { ...t, _layout: computeFixedCanopy(t.nodes || []) };
    bpCam = { scale: 1, tx: 0, ty: 0 };
    window.history.pushState({ modal: "inspect" }, "");
    document.getElementById("inspTag").textContent = `${t.attr} • ${t.tag}`;
    document.getElementById("inspTitle").textContent = t.title;
    document.getElementById("inspAuthor").textContent = `By ${t.author}`;
    document.getElementById("bpNodeDrawer").classList.add("hidden");
    modal.classList.remove("hidden");
    setTimeout(renderBpCanopy, 30);
  };
})();
                                                           
