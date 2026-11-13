(function installBlueprintAndFilterFix() {
  document.addEventListener("click", function(e) {
    const filterBtn = e.target.closest(".srv-filter");
    if (filterBtn) {
      document.querySelectorAll(".srv-filter").forEach(b => {
        b.classList.remove("bg-sky-500", "text-slate-950", "font-bold");
        b.classList.add("bg-slate-800", "text-slate-300");
      });
      filterBtn.classList.remove("bg-slate-800", "text-slate-300");
      filterBtn.classList.add("bg-sky-500", "text-slate-950", "font-bold");
    }

    const inspBtn = e.target.closest("button[onclick^='inspectServerTree']");
    if (inspBtn) {
      e.preventDefault();
      e.stopImmediatePropagation();
      const m = inspBtn.getAttribute("onclick").match(/'([^']+)'/);
      if (m && m[1]) openVisualBlueprint(m[1]);
    }
  }, true);

  const modal = document.getElementById("serverInspectModal");
  if (!modal) return;
  modal.className = "fixed inset-0 z-50 bg-slate-950 hidden flex flex-col";
  modal.innerHTML = `
    <div class="px-4 py-2.5 border-b border-sky-500/30 bg-slate-950 flex items-center justify-between shrink-0">
      <div><span id="inspTag" class="text-[10px] uppercase px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">Concept</span> <span id="inspAuthor" class="text-[11px] text-slate-400"></span><h2 id="inspTitle" class="text-sm font-black text-white skyrim-font mt-0.5"></h2></div>
      <div class="flex items-center space-x-2"><button id="bpCloneAllBtn" class="px-2.5 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-bold">+ Clone Tree</button><button id="bpCloseBtn" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button></div>
    </div>
    <div id="bpCanvasWrap" class="relative flex-1 overflow-hidden touch-none">
      <canvas id="bpCanvas" class="absolute inset-0 w-full h-full"></canvas>
      <div id="bpNodesLayer" class="absolute inset-0 origin-top-left"></div>
      <div class="absolute top-2.5 left-3 text-[10px] text-slate-400 bg-slate-950/85 px-2.5 py-1 rounded-full border border-slate-800">Pinch to zoom • Drag to pan • Tap any star node</div>
    </div>
    <div id="bpNodeDrawer" class="hidden border-t border-sky-500/30 bg-slate-900 p-4 space-y-2 max-h-[42vh] overflow-y-auto shrink-0">
      <div class="flex justify-between items-start gap-2"><div><span id="bpNodeTier" class="text-[10px] font-black uppercase text-amber-300"></span><h3 id="bpNodeTitle" class="text-sm font-bold text-white skyrim-font"></h3></div><button id="bpHarvestBtn" class="px-3 py-1.5 bg-sky-500 text-slate-950 rounded-lg text-xs font-bold shrink-0">+ Harvest Skill</button></div>
      <p id="bpNodeNotes" class="text-xs text-slate-300 leading-relaxed"></p><div id="bpNodeMeta" class="space-y-1 text-[11px]"></div>
    </div>`;

  let activeBp = null, cam = { s: 1, x: 0, y: 0 }, ptrs = new Map(), pDist = 0, pScale = 1, panX = 0, panY = 0, origX = 0, origY = 0;

  function renderBp() {
    if (!activeBp) return;
    const c = document.getElementById("bpCanvas"), layer = document.getElementById("bpNodesLayer"), wrap = document.getElementById("bpCanvasWrap");
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
      document.
        
