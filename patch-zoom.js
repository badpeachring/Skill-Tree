(function installPinchZoomAndPan() {
  window.treeView = { scale: 1, tx: 0, ty: 0 };
  const mainArea = document.querySelector("#activeTreeWorkspace main");
  if (!mainArea) return;

  mainArea.style.touchAction = "none";

  const hud = document.createElement("div");
  hud.className = "absolute bottom-3 right-3 z-20 flex items-center space-x-1.5 bg-slate-950/90 border border-sky-500/40 rounded-full px-2.5 py-1 text-[11px] shadow-lg";
  hud.innerHTML = `<button type="button" id="zoomOutBtn" class="text-sky-300 font-black px-1">－</button><span id="zoomPctLabel" class="text-slate-200 font-bold min-w-[36px] text-center">100%</span><button type="button" id="zoomInBtn" class="text-sky-300 font-black px-1">＋</button><button type="button" id="zoomResetBtn" class="text-amber-300 font-bold pl-1 border-l border-slate-800">⌖</button>`;
  mainArea.appendChild(hud);

  function applyTransform() {
    const box = document.getElementById("nodesContainer");
    const { scale, tx, ty } = window.treeView;
    if (box) {
      box.style.transformOrigin = "0 0";
      box.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    }
    const lbl = document.getElementById("zoomPctLabel");
    if (lbl) lbl.textContent = `${Math.round(scale * 100)}%`;
    if (typeof window.drawBranchesOnly === "function") window.drawBranchesOnly();
  }
  window.resetTreeCamera = () => { window.treeView = { scale: 1, tx: 0, ty: 0 }; applyTransform(); };

  document.getElementById("zoomInBtn").onclick = () => { window.treeView.scale = Math.min(2.8, +(window.treeView.scale + 0.25).toFixed(2)); applyTransform(); };
  document.getElementById("zoomOutBtn").onclick = () => { window.treeView.scale = Math.max(0.55, +(window.treeView.scale - 0.25).toFixed(2)); applyTransform(); };
  document.getElementById("zoomResetBtn").onclick = () => window.resetTreeCamera();
    let pointers = new Map(), pinchStartDist = 0, pinchStartScale = 1, panStartX = 0, panStartY = 0, panOrigTx = 0, panOrigTy = 0;

  mainArea.addEventListener("pointerdown", (e) => {
    if (draggingNode) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panStartX = e.clientX; panStartY = e.clientY;
      panOrigTx = window.treeView.tx; panOrigTy = window.treeView.ty;
    } else if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      pinchStartDist = Math.hypot(p2.x - p1.x, p2.y - p1.y) || 1;
      pinchStartScale = window.treeView.scale;
    }
  });

  mainArea.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId) || draggingNode) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      window.treeView.tx = panOrigTx + (e.clientX - panStartX);
      window.treeView.ty = panOrigTy + (e.clientY - panStartY);
      applyTransform();
    } else if (pointers.size === 2) {
      const [p1, p2] = Array.from(pointers.values());
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      window.treeView.scale = Math.min(2.8, Math.max(0.55, pinchStartScale * (dist / pinchStartDist)));
      applyTransform();
    }
  });

  const endPtr = (e) => { pointers.delete(e.pointerId); };
  mainArea.addEventListener("pointerup", endPtr);
  mainArea.addEventListener("pointercancel", endPtr);

  const origDrawBranches = window.drawBranchesOnly;
  window.drawBranchesOnly = function() {
    const c = document.getElementById("treeCanvas"), ctx = c && c.getContext("2d");
    if (!c || !ctx) return;
    const { scale, tx, ty } = window.treeView;
    ctx.save(); ctx.clearRect(0, 0, c.width, c.height);
    ctx.translate(tx, ty); ctx.scale(scale, scale);
    const fakeClear = ctx.clearRect.bind(ctx);
    ctx.clearRect = () => {};
    origDrawBranches();
    ctx.clearRect = fakeClear;
    ctx.restore();
  };
})();
