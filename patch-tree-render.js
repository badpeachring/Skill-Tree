(function installLushWorldTreeEngine() {
  const addBtn = document.getElementById("addNodeBtn");
  if (addBtn && !document.getElementById("autoLayoutBtn")) {
    const btn = document.createElement("button");
    btn.id = "autoLayoutBtn";
    btn.type = "button";
    btn.textContent = "🌿";
    btn.title = "Auto-Arrange Organic Branching Tree";
    btn.className = "px-2 py-1 bg-slate-800 border border-slate-700 text-emerald-300 rounded text-xs font-bold";
    btn.onclick = async () => {
      const tree = userTrees[selectedTree];
      if (!tree || !tree.nodes.length) return;
      window.computeOrganicTreePositions(tree.nodes);
      if (window.resetTreeCamera) window.resetTreeCamera();
      drawConstellation();
      await saveUserData();
    };
    addBtn.parentElement.insertBefore(btn, addBtn);
  }

  window.computeOrganicTreePositions = function(nodes) {
    if (!nodes || !nodes.length) return nodes;
    const hasExplicitTree = nodes.some(n => (typeof n.parentIdx === "number" && n.parentIdx >= 0) || n.parentId);
    const idToIdx = Object.fromEntries(nodes.map((n, i) => [n.id, i]));

    // Build parent index map (auto-create organic 3-limb tree if flat)
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

    // Compute subtree leaf widths so sibling branches never collide
    const widths = new Array(nodes.length).fill(1);
    function measure(u) {
      if (!children[u].length) return (widths[u] = 1);
      widths[u] = children[u].reduce((acc, v) => acc + measure(v), 0);
      return widths[u];
    }
    roots.forEach(measure);

    const totalW = Math.max(1, roots.reduce((a, r) => a + widths[r], 0));
    const maxDepth = (function getMaxD(list, d) {
      if (!list.length) return d;
      return Math.max(...list.map(u => getMaxD(children[u], d + 1)));
    })(roots, 0);

    const spanX = Math.min(220, Math.max(78, totalW * 15));
    const stepY = Math.min(20, Math.max(13, 62 / Math.max(1, maxDepth)));

    function place(u, left, right, depth) {
      const mid = (left + right) * 0.5;
      const norm = (mid / totalW) - 0.5;
      const arch = Math.cos(norm * Math.PI) * 7;
      const jitterX = ((u % 3) - 1) * 1.4;
      nodes[u].x = Math.round(50 + norm * spanX + jitterX);
      nodes[u].y = Math.round(67 - depth * stepY - arch);
      nodes[u]._p = pMap[u];
      let cur = left;
      children[u].forEach(v => {
        place(v, cur, cur + widths[v], depth + 1);
        cur += widths[v];
      });
    }

    let cursor = 0;
    roots.forEach(r => {
      place(r, cursor, cursor + widths[r], 0);
      cursor += widths[r];
    });
    return nodes;
  };

  window.renderWorldTreeCanvas = function(ctx, w, h, nodes, isBlueprint) {
    const rx = w * 0.5, ry = h * 0.96, th = Math.min(h * 0.30, 88 + nodes.length * 2.2), cy = ry - th;
    const tw = Math.min(26, 12 + nodes.length * 0.35);

    ctx.save();

    // 1. Ambient starlight crown aura
    const mist = ctx.createRadialGradient(rx, cy - th * 0.5, 12, rx, cy - th * 0.5, Math.max(w * 0.65, 260));
    mist.addColorStop(0, "rgba(16, 185, 129, 0.12)");
    mist.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
    mist.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = mist;
    ctx.fillRect(-w * 2, -h * 2.5, w * 5, h * 4);

    // 2. Lush layered foliage clusters behind upper canopy nodes
    nodes.forEach((n, idx) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      const isUpper = ny < cy + 10;
      if (!isUpper && idx >= 3) return;
      const rad = isUpper ? 46 : 32;
      const leafGrad = ctx.createRadialGradient(nx, ny - 6, 4, nx, ny - 6, rad);
      leafGrad.addColorStop(0, "rgba(16, 185, 129, 0.18)");
      leafGrad.addColorStop(0.6, "rgba(6, 95, 70, 0.10)");
      leafGrad.addColorStop(1, "rgba(6, 78, 59, 0)");
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.arc(nx - 10, ny - 4, rad * 0.85, 0, Math.PI * 2);
      ctx.arc(nx + 12, ny - 8, rad * 0.8, 0, Math.PI * 2);
      ctx.arc(nx, ny - 14, rad * 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Root flare & tapered bark trunk
    const bark = ctx.createLinearGradient(rx - tw * 2.5, cy, rx + tw * 2.5, ry);
    bark.addColorStop(0, "#172033");
    bark.addColorStop(0.45, "#2b394f");
    bark.addColorStop(1, "#0f172a");
    ctx.fillStyle = bark;
    ctx.beginPath();
    ctx.moveTo(rx - tw * 4.2, h);
    ctx.quadraticCurveTo(rx - tw * 1.4, ry - 5, rx - tw * 0.95, ry - 24);
    ctx.bezierCurveTo(rx - tw * 0.65, ry - th * 0.45, rx - tw * 0.35, cy + 16, rx, cy);
    ctx.bezierCurveTo(rx + tw * 0.35, cy + 16, rx + tw * 0.65, ry - th * 0.45, rx + tw * 0.95, ry - 24);
    ctx.quadraticCurveTo(rx + tw * 1.4, ry - 5, rx + tw * 4.2, h);
    ctx.closePath();
    ctx.fill();

    // Subtle bark grain striations
    ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
    ctx.lineWidth = 1.2;
    [-0.45, 0, 0.45].forEach(off => {
      ctx.beginPath();
      ctx.moveTo(rx + tw * off * 1.6, ry);
      ctx.quadraticCurveTo(rx + tw * off * 0.6, cy + th * 0.5, rx + tw * off * 0.25, cy + 8);
      ctx.stroke();
    });

    // 4. Tapered parent-to-child organic limbs + inner glowing sap veins
    ctx.lineCap = "round";
    const byId = Object.fromEntries(nodes.map((n, i) => [n.id || i, n]));
    nodes.forEach((n, idx) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      let p = null;
      if (typeof n.parentIdx === "number" && n.parentIdx >= 0) p = nodes[n.parentIdx];
      else if (typeof n._p === "number" && n._p >= 0) p = nodes[n._p];
      else if (n.parentId && byId[n.parentId]) p = byId[n.parentId];

      const sx = p ? (p.x / 100) * w : rx + ((nx - rx) * 0.08);
      const sy = p ? (p.y / 100) * h : cy + 10;
      const ctrl1x = sx + (nx - sx) * 0.18, ctrl1y = sy - Math.abs(sy - ny) * 0.38;
      const ctrl2x = sx + (nx - sx) * 0.62, ctrl2y = ny + 16;

      // Limb thickness tapers cleanly from trunk -> primary limb -> secondary branch -> twig
      const limbW = !p ? Math.max(6.5, tw * 0.52) : (p.parentIdx >= 0 || p._p >= 0 ? 3.2 : 4.8);
      const active = isBlueprint || n.status === "mastered" || n.status === "learning";
      const col = n.status === "learning" ? "#f59e0b" : (n.color || "#38bdf8");

      // Outer wooden bark limb
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, nx, ny);
      ctx.lineWidth = limbW + 2.2;
      ctx.strokeStyle = "#0b1120";
      ctx.globalAlpha = 0.92;
      ctx.stroke();

      ctx.lineWidth = limbW;
      ctx.strokeStyle = active ? "#243247" : "#1e293b";
      ctx.stroke();

      // Inner bioluminescent sap vein
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, nx, ny);
      ctx.lineWidth = active ? Math.max(1.5, limbW * 0.36) : 1;
      ctx.strokeStyle = active ? col : "#475569";
      ctx.shadowColor = active ? col : "transparent";
      ctx.shadowBlur = active ? 8 : 0;
      ctx.globalAlpha = active ? 0.85 : 0.4;
      ctx.stroke();
      ctx.shadowBlur = 0;
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
