(function installWorldTreeGraphics() {
  const addBtn = document.getElementById("addNodeBtn");
  if (addBtn && !document.getElementById("autoLayoutBtn")) {
    const btn = document.createElement("button");
    btn.id = "autoLayoutBtn"; btn.type = "button"; btn.textContent = "🌿"; btn.title = "Auto-Arrange Organic Canopy";
    btn.className = "px-2 py-1 bg-slate-800 border border-slate-700 text-emerald-300 rounded text-xs font-bold";
    btn.onclick = async () => {
      const tree = userTrees[selectedTree]; if (!tree || !tree.nodes.length) return;
      const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n])), levels = {};
      tree.nodes.forEach(n => {
        let d = 0, cur = n, seen = new Set();
        while (cur.parentId && byId[cur.parentId] && !seen.has(cur.id)) { seen.add(cur.id); cur = byId[cur.parentId]; d++; }
        (levels[d] = levels[d] || []).push(n);
      });
      const maxD = Math.max(...Object.keys(levels).map(Number));
      Object.entries(levels).forEach(([dStr, list]) => {
        const d = Number(dStr), spread = 64 + d * 18;
        list.forEach((n, i) => {
          const frac = (i + 1) / (list.length + 1) - 0.5;
          const arch = Math.cos(frac * Math.PI) * 10;
          n.x = Math.round(50 + frac * spread);
          n.y = Math.round((maxD === 0 ? 48 : 64 - (d / Math.max(1, maxD)) * 52) - arch);
        });
      });
      if (window.resetTreeCamera) window.resetTreeCamera();
      drawConstellation();
      await saveUserData();
    };
    addBtn.parentElement.insertBefore(btn, addBtn);
  }

  window.renderWorldTreeCanvas = function(ctx, w, h, nodes, isBlueprint) {
    const rx = w * 0.5, ry = h * 0.96, th = Math.min(h * 0.34, 95 + nodes.length * 6), cy = ry - th;
    const tw = Math.min(28, 11 + nodes.length * 0.45);

    ctx.save();
    const mist = ctx.createRadialGradient(rx, cy - th * 0.35, 10, rx, cy - th * 0.35, Math.max(w * 0.55, 220));
    mist.addColorStop(0, "rgba(56, 189, 248, 0.14)");
    mist.addColorStop(0.55, "rgba(168, 85, 247, 0.06)");
    mist.addColorStop(1, "rgba(15, 23, 42, 0)");
    ctx.fillStyle = mist;
    ctx.fillRect(-w, -h * 2, w * 3, h * 3);

    const bark = ctx.createLinearGradient(rx - tw * 2, cy, rx + tw * 2, ry);
    bark.addColorStop(0, "#1e293b"); bark.addColorStop(0.5, "#334155"); bark.addColorStop(1, "#0f172a");
    ctx.fillStyle = bark;
    ctx.beginPath();
    ctx.moveTo(rx - tw * 3.6, h);
    ctx.quadraticCurveTo(rx - tw * 1.1, ry - 6, rx - tw * 0.85, ry - 26);
    ctx.bezierCurveTo(rx - tw * 0.55, ry - th * 0.45, rx - tw * 0.25, cy + 18, rx, cy);
    ctx.bezierCurveTo(rx + tw * 0.25, cy + 18, rx + tw * 0.55, ry - th * 0.45, rx + tw * 0.85, ry - 26);
    ctx.quadraticCurveTo(rx + tw * 1.1, ry - 6, rx + tw * 3.6, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(56, 189, 248, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(rx, ry); ctx.quadraticCurveTo(rx - 3, cy + th * 0.45, rx, cy); ctx.stroke();

    ctx.lineCap = "round";
    const byId = Object.fromEntries(nodes.map((n, i) => [n.id || i, n]));
    nodes.forEach((n, idx) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      const p = (n.parentId && byId[n.parentId]) ? byId[n.parentId] : (typeof n._p === "number" && n._p >= 0 ? nodes[n._p] : null);
      const sx = p ? (p.x / 100) * w : rx, sy = p ? (p.y / 100) * h : cy + 8;
      const ctrl1x = sx + (nx - sx) * 0.15, ctrl1y = sy - Math.abs(sy - ny) * 0.35;
      const ctrl2x = sx + (nx - sx) * 0.55, ctrl2y = ny + 22;
      const limbW = p ? Math.max(3, tw * 0.3) : Math.max(5, tw * 0.48 - idx * 0.08);
      const active = isBlueprint || n.status === "mastered" || n.status === "learning";
      const col = n.status === "learning" ? "#f59e0b" : (n.color || "#38bdf8");

      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, nx, ny);
      ctx.lineWidth = limbW + 2.5; ctx.strokeStyle = "#0f172a"; ctx.globalAlpha = 0.9; ctx.stroke();
      ctx.lineWidth = limbW; ctx.strokeStyle = active ? "#1e293b" : "#273549"; ctx.stroke();

      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.bezierCurveTo(ctrl1x, ctrl1y, ctrl2x, ctrl2y, nx, ny);
      ctx.lineWidth = active ? Math.max(1.8, limbW * 0.42) : 1.2;
      ctx.strokeStyle = active ? col : "#475569";
      ctx.shadowColor = active ? col : "transparent";
      ctx.shadowBlur = active ? 10 : 0;
      ctx.globalAlpha = active ? 0.85 : 0.45;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });
    ctx.restore();
  };

  window.drawBranchesOnly = function() {
    const tree = userTrees[selectedTree]; if (!tree) return;
    const c = document.getElementById("treeCanvas"), ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    window.renderWorldTreeCanvas(ctx, c.width, c.height, tree.nodes || [], false);
  };
})();
