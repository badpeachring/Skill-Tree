(function installOrganicTreeRender() {
  const addBtn = document.getElementById("addNodeBtn");
  if (addBtn && !document.getElementById("autoLayoutBtn")) {
    const btn = document.createElement("button");
    btn.id = "autoLayoutBtn";
    btn.type = "button";
    btn.textContent = "🌿";
    btn.title = "Auto-Arrange Tree Canopy";
    btn.className = "px-2 py-1 bg-slate-800 border border-slate-700 text-emerald-300 rounded text-xs font-bold";
    btn.onclick = async () => {
      const tree = userTrees[selectedTree];
      if (!tree || !tree.nodes.length) return;
      const byId = Object.fromEntries(tree.nodes.map(n => [n.id, n]));
      const levels = {};
      tree.nodes.forEach(n => {
        let d = 0, cur = n, seen = new Set();
        while (cur.parentId && byId[cur.parentId] && !seen.has(cur.id)) { seen.add(cur.id); cur = byId[cur.parentId]; d++; }
        (levels[d] = levels[d] || []).push(n);
      });
      const maxD = Math.max(...Object.keys(levels).map(Number));
      Object.entries(levels).forEach(([dStr, list]) => {
        const d = Number(dStr), y = maxD === 0 ? 52 : Math.max(14, 66 - (d / maxD) * 50);
        list.forEach((n, i) => { n.x = Math.round(((i + 1) / (list.length + 1)) * 76 + 12); n.y = Math.round(y + (i % 2 === 0 ? -2 : 2)); });
      });
      drawConstellation();
      await saveUserData();
    };
    addBtn.parentElement.insertBefore(btn, addBtn);
  }
    window.drawBranchesOnly = function() {
    const tree = userTrees[selectedTree]; if (!tree) return;
    const nodes = tree.nodes || [], c = document.getElementById("treeCanvas"), ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    const rootX = c.width * 0.5, rootY = c.height * 0.95;
    const trunkH = Math.min(c.height * 0.34, 65 + nodes.length * 8), crownY = rootY - trunkH, trunkW = Math.min(24, 9 + nodes.length * 0.5);
    ctx.save(); ctx.lineCap = "round";
    const grad = ctx.createLinearGradient(0, crownY, 0, c.height);
    grad.addColorStop(0, "#334155"); grad.addColorStop(1, "#0f172a");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.moveTo(rootX - trunkW * 2.8, c.height); ctx.quadraticCurveTo(rootX, rootY - 14, rootX + trunkW * 2.8, c.height); ctx.fill();
    ctx.beginPath(); ctx.moveTo(rootX - trunkW * 0.85, rootY); ctx.bezierCurveTo(rootX - trunkW * 0.5, rootY - trunkH * 0.4, rootX - trunkW * 0.25, crownY + 20, rootX, crownY); ctx.bezierCurveTo(rootX + trunkW * 0.25, crownY + 20, rootX + trunkW * 0.5, rootY - trunkH * 0.4, rootX + trunkW * 0.85, rootY); ctx.closePath(); ctx.fill();
    const byId = Object.fromEntries(nodes.map(n => [n.id, n]));
    nodes.forEach((n, idx) => {
      const nx = (n.x / 100) * c.width, ny = (n.y / 100) * c.height, p = n.parentId ? byId[n.parentId] : null;
      const sx = p ? (p.x / 100) * c.width : rootX, sy = p ? (p.y / 100) * c.height : crownY + 6;
      const th = p ? Math.max(2.5, trunkW * 0.28) : Math.max(4, trunkW * 0.45 - idx * 0.1);
      ctx.beginPath(); ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx, (sy + ny) * 0.55, (sx + nx) * 0.5, ny + 18, nx, ny);
      ctx.lineWidth = th; ctx.strokeStyle = n.status === "mastered" ? (n.color || "#38bdf8") : n.status === "learning" ? "#92400e" : "#334155";
      ctx.globalAlpha = n.status === "mastered" ? 0.72 : 0.85; ctx.stroke();
    });
    ctx.restore();
  };

  const origDraw = window.drawConstellation;
  window.drawConstellation = function() {
    origDraw();
    const tree = userTrees[selectedTree], box = document.getElementById("nodesContainer");
    if (!tree || !box) return;
    Array.from(box.children).forEach((el, idx) => {
      const n = tree.nodes[idx]; if (!n) return;
      const steps = Array.isArray(n.steps) ? n.steps : [], links = Array.isArray(n.links) ? n.links : [];
      if (!steps.length && !links.length) return;
      const done = steps.filter(s => s.done).length;
      const tag = document.createElement("span");
      tag.className = "text-[9px] text-sky-300/90 bg-slate-900/90 px-1.5 rounded mt-0.5 border border-slate-800";
      tag.textContent = `${steps.length ? `☑ ${done}/${steps.length}` : ""}${steps.length && links.length ? " • " : ""}${links.length ? `🔗 ${links.length}` : ""}`;
      el.appendChild(tag);
    });
  };
})();
