(function installLushWorldTreeEngine() {
  const addBtn = document.getElementById("addNodeBtn");
  if (addBtn && !document.getElementById("autoLayoutBtn")) {
    const btn = document.createElement("button");
    btn.id = "autoLayoutBtn";
    btn.type = "button";
    btn.textContent = "🌿";
    btn.title = "Grow Organic Branching Tree";
    btn.className = "px-2 py-1 bg-slate-800 border border-slate-700 text-emerald-300 rounded text-xs font-bold";
    btn.onclick = async () => {
      const tree = userTrees[selectedTree];
      if (!tree || !tree.nodes.length) return;
      window.computeOrganicTreePositions(tree.nodes, Date.now());
      if (window.resetTreeCamera) window.resetTreeCamera();
      drawConstellation();
      await saveUserData();
    };
    addBtn.parentElement.insertBefore(btn, addBtn);
  }

  // Deterministic pseudo-random helper so each tree gets a unique organic shape (or re-rolls with a new seed)
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  window.computeOrganicTreePositions = function(nodes, customSeed) {
    if (!nodes || !nodes.length) return nodes;
    const seedStr = (customSeed || nodes.map(n => n.title).join("|")).toString();
    let hash = 2166136261;
    for (let i = 0; i < seedStr.length; i++) hash = Math.imul(hash ^ seedStr.charCodeAt(i), 16777619);
    const rand = mulberry32(hash);

    const hasExplicitTree = nodes.some(n => (typeof n.parentIdx === "number" && n.parentIdx >= 0) || n.parentId);
    const idToIdx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));

    // Build prerequisite hierarchy (Tier I roots -> Tier II/III/IV branches)
    const pMap = nodes.map((n, i) => {
      if (typeof n.parentIdx === "number") return n.parentIdx;
      if (n.parentId && idToIdx[n.parentId] !== undefined) return idToIdx[n.parentId];
      if (!hasExplicitTree) {
        if (i < 3) return -1;
        return Math.floor((i - 1) / 2);
      }
      return -1;
    });

    const children = nodes.map(() => []);
    const roots = [];
    pMap.forEach((p, i) => {
      if (p >= 0 && p < nodes.length && p !== i) children[p].push(i);
      else roots.push(i);
    });

    // Measure subtree leaf weight so heavy branches get wider natural spread angles
    const weights = new Array(nodes.length).fill(1);
    function weigh(u) {
      if (!children[u].length) return (weights[u] = 1);
      weights[u] = children[u].reduce((sum, v) => sum + weigh(v), 0);
      return weights[u];
    }
    roots.forEach(weigh);

    const totalW = Math.max(1, roots.reduce((a, r) => a + weights[r], 0));
    const baseLen = nodes.length >= 20 ? 18 : 22;

    // Grow each root limb outward from the top of the trunk (x: 50, y: 74)
    let cursor = 0;
    roots.forEach((r, rIdx) => {
      const share = weights[r] / totalW;
      const centerFrac = (cursor + weights[r] * 0.5) / totalW - 0.5;
      // Spread main limbs between -62 deg (left) and +62 deg (right)
      const limbAngle = centerFrac * 2.15 + (rand() - 0.5) * 0.16;
      const limbDist = baseLen * (0.95 + rand() * 0.25);

      nodes[r].x = Math.round(50 + Math.sin(limbAngle) * limbDist * 1.45);
      nodes[r].y = Math.round(73 - Math.cos(limbAngle) * limbDist * 0.85);
      nodes[r]._p = -1;

      function growBranch(u, parentAngle, depth) {
        const kids = children[u];
        if (!kids.length) return;
        const subTotal = kids.reduce((s, k) => s + weights[k], 0);
        // Fan child branches organically around parent limb direction
        const fanArc = Math.min(1.45, 0.52 + kids.length * 0.26);
        let subCur = 0;

        kids.forEach((v) => {
          const frac = (subCur + weights[v] * 0.5) / subTotal - 0.5;
          const sway = (rand() - 0.5) * 0.22;
          // Pull gently upward toward the sun as depth increases
          const rawAngle = parentAngle * 0.72 + frac * fanArc + sway;
          const clampedAngle = Math.max(-1.32, Math.min(1.32, rawAngle));
          const len = Math.max(12, (baseLen - depth * 1.4) * (0.88 + rand() * 0.34));

          nodes[v].x = Math.round(nodes[u].x + Math.sin(clampedAngle) * len * 1.55);
          nodes[v].y = Math.round(nodes[u].y - Math.cos(clampedAngle) * len * 0.88);
          nodes[v]._p = u;

          growBranch(v, clampedAngle, depth + 1);
          subCur += weights[v];
        });
      }

      growBranch(r, limbAngle, 1);
      cursor += weights[r];
    });

    return nodes;
  };

  window.renderWorldTreeCanvas = function(ctx, w, h, nodes, isBlueprint) {
    const rx = w * 0.5, ry = h * 0.96, th = Math.min(h * 0.26, 76 + nodes.length * 1.6), cy = ry - th;
    const tw = Math.min(28, 13 + nodes.length * 0.35);

    ctx.save();

    // 1. Soft astral canopy glow
    const mist = ctx.createRadialGradient(rx, cy - th * 0.6, 15, rx, cy - th * 0.6, Math.max(w * 0.75, 300));
    mist.addColorStop(0, "rgba(16, 185, 129, 0.14)");
    mist.addColorStop(0.55, "rgba(14, 165, 233, 0.08)");
    mist.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = mist;
    ctx.fillRect(-w * 2.5, -h * 2.5, w * 6, h * 5);

    // 2. Lush layered foliage clusters around all mid/upper canopy nodes
    nodes.forEach((n, idx) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      const isCrown = ny < cy + 8 || idx >= 3;
      if (!isCrown) return;
      const rad = 52;
      const leafGrad = ctx.createRadialGradient(nx, ny - 6, 5, nx, ny - 6, rad);
      leafGrad.addColorStop(0, "rgba(16, 185, 129, 0.22)");
      leafGrad.addColorStop(0.55, "rgba(5, 150, 105, 0.11)");
      leafGrad.addColorStop(1, "rgba(6, 78, 59, 0)");
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.arc(nx - 14, ny - 4, rad * 0.85, 0, Math.PI * 2);
      ctx.arc(nx + 15, ny - 8, rad * 0.82, 0, Math.PI * 2);
      ctx.arc(nx, ny - 16, rad * 0.92, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Spreading root buttresses & textured bark trunk
    const bark = ctx.createLinearGradient(rx - tw * 2.5, cy, rx + tw * 2.5, ry);
    bark.addColorStop(0, "#1e293b");
    bark.addColorStop(0.5, "#334155");
    bark.addColorStop(1, "#0f172a");
    ctx.fillStyle = bark;
    ctx.beginPath();
    ctx.moveTo(rx - tw * 4.6, h);
    ctx.quadraticCurveTo(rx - tw * 1.5, ry - 6, rx - tw, ry - 26);
    ctx.bezierCurveTo(rx - tw * 0.65, ry - th * 0.45, rx - tw * 0.35, cy + 14, rx, cy);
    ctx.bezierCurveTo(rx + tw * 0.35, cy + 14, rx + tw * 0.65, ry - th * 0.45, rx + tw, ry - 26);
    ctx.quadraticCurveTo(rx + tw * 1.5, ry - 6, rx + tw * 4.6, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1.3;
    [-0.45, 0, 0.45].forEach(off => {
      ctx.beginPath();
      ctx.moveTo(rx + tw * off * 1.7, ry);
      ctx.quadraticCurveTo(rx + tw * off * 0.6, cy + th * 0.5, rx + tw * off * 0.25, cy + 6);
      ctx.stroke();
    });

    // 4. Tapered organic limbs, decorative twigs, and bioluminescent sap veins
    ctx.lineCap = "round";
    const byId = Object.fromEntries(nodes.map((n, i) => [n.id || i, n]));
    nodes.forEach((n, idx) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      let p = null;
      if (typeof n.parentIdx === "number" && n.parentIdx >= 0) p = nodes[n.parentIdx];
      else if (typeof n._p === "number" && n._p >= 0) p = nodes[n._p];
      else if (n.parentId && byId[n.parentId]) p = byId[n.parentId];

      const sx = p ? (p.x / 100) * w : rx + ((nx - rx) * 0.08);
      const sy = p ? (p.y / 100) * h : cy + 8;
      const ctrl1x = sx + (nx - sx) * 0.22, ctrl1y = sy - Math.abs(sy - ny) * 0.42;
      const ctrl2x = sx + (nx - sx) * 0.68, ctrl2y = ny + 14;

      const limbW = !p ? Math.max(7, tw * 0.55) : (p.parentIdx >= 0 || p._p >= 0 ? 3.4 : 5.2);
      const active = isBlueprint || n.status === "mastered" || n.status === "learning";
      const col = n.status === "learning" ? "#f59e0b" : (n.color || "#38bdf8");

      // Outer wooden limb
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, nx, ny);
      ctx.lineWidth = limbW + 2.4;
      ctx.strokeStyle = "#090d16";
      ctx.globalAlpha = 0.95;
      ctx.stroke();

      ctx.lineWidth = limbW;
      ctx.strokeStyle = active ? "#293548" : "#1e293b";
      ctx.stroke();

      // Inner glowing sap vein
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, nx, ny);
      ctx.lineWidth = active ? Math.max(1.6, limbW * 0.38) : 1;
      ctx.strokeStyle = active ? col : "#475569";
      ctx.shadowColor = active ? col : "transparent";
      ctx.shadowBlur = active ? 9 : 0;
      ctx.globalAlpha = active ? 0.9 : 0.42;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Subtle decorative outer twigs + leaf buds on outer branches
      if (idx >= 3) {
        const dir = idx % 2 === 0 ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.quadraticCurveTo(nx + dir * 16, ny - 10, nx + dir * 24, ny - 22);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = "rgba(52, 211, 153, 0.35)";
        ctx.stroke();

        ctx.fillStyle = "rgba(52, 211, 153, 0.45)";
        ctx.beginPath();
        ctx.ellipse(nx + dir * 25, ny - 23, 5, 2.5, dir * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  };

  window.drawBranchesOnly = function() {
    const tree = userTrees[selectedTree];
    if (!tree) return;
    const c = document.getElementById("treeCanvas"), ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    window.renderWorldTreeCanvas(ctx, c.width, c.height, tree.nodes || [], false);
  };
})();
        
