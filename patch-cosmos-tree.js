(function installInfiniteCosmosAndSingleSpineTree() {
  const THEME_KEY = "skilltree_cosmos_theme_v3";
  window.getCosmosTheme = function() {
    try {
      return Object.assign({ nebulaAlpha: 0.30, glowColor: "#38bdf8", activeGlow: "#34d399", glowStrength: 16 }, JSON.parse(localStorage.getItem(THEME_KEY) || "{}"));
    } catch { return { nebulaAlpha: 0.30, glowColor: "#38bdf8", activeGlow: "#34d399", glowStrength: 16 }; }
  };
  window.saveCosmosTheme = function(cfg) { localStorage.setItem(THEME_KEY, JSON.stringify(Object.assign(window.getCosmosTheme(), cfg))); };

  function startDeepSpaceCanvas() {
    const c = document.getElementById("starfieldCanvas");
    if (!c || c.dataset.cosmosHooked) return;
    c.dataset.cosmosHooked = "1";
    const ctx = c.getContext("2d");
    let w = 0, h = 0;
    const stars = Array.from({ length: 145 }, (_, i) => ({
      x: Math.sin(i * 91.7) * 0.5 + 0.5, y: Math.cos(i * 47.3) * 0.5 + 0.5,
      r: i % 7 === 0 ? 2.0 : (i % 3 === 0 ? 1.2 : 0.7), phase: i * 0.9,
      hue: i % 5 === 0 ? "#7dd3fc" : (i % 9 === 0 ? "#fde68a" : "#f8fafc")
    }));
    const resize = () => { w = c.width = window.innerWidth; h = c.height = window.innerHeight; };
    window.addEventListener("resize", resize);
    resize();

    function drawCosmos(now) {
      const t = now * 0.001, na = Number(window.getCosmosTheme().nebulaAlpha) || 0.30;
      ctx.fillStyle = "#020617"; ctx.fillRect(0, 0, w, h);
      [
        { x: w * 0.22, y: h * 0.24, r: Math.max(w, h) * 0.45, c1: `rgba(56,189,248,${na * 0.55})` },
        { x: w * 0.80, y: h * 0.68, r: Math.max(w, h) * 0.50, c1: `rgba(139,92,246,${na * 0.50})` },
        { x: w * 0.50, y: h * 0.50, r: Math.max(w, h) * 0.38, c1: `rgba(16,185,129,${na * 0.35})` }
      ].forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 4, n.x, n.y, n.r);
        g.addColorStop(0, n.c1); g.addColorStop(1, "rgba(2,6,23,0)");
        ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      });
      ctx.save(); ctx.translate(w * 0.82, h * 0.18); ctx.rotate(-0.45); ctx.scale(1, 0.42);
      const gal = ctx.createRadialGradient(0, 0, 1, 0, 0, 48);
      gal.addColorStop(0, `rgba(224,242,254,${na * 1.1})`); gal.addColorStop(0.45, `rgba(129,140,248,${na * 0.55})`); gal.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = gal; ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill(); ctx.restore();

      const px = w * 0.16, py = h * 0.78, pr = 24;
      const pGrad = ctx.createRadialGradient(px - 7, py - 7, 2, px, py, pr);
      pGrad.addColorStop(0, "rgba(125,211,252,0.45)"); pGrad.addColorStop(0.65, "rgba(30,58,138,0.30)"); pGrad.addColorStop(1, "rgba(2,6,23,0.05)");
      ctx.fillStyle = pGrad; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.translate(px, py); ctx.rotate(-0.35);
      ctx.strokeStyle = "rgba(148,163,184,0.25)"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.ellipse(0, 0, 42, 10, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

      stars.forEach(s => {
        ctx.globalAlpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.phase));
        ctx.fillStyle = s.hue; ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1; requestAnimationFrame(drawCosmos);
    }
    requestAnimationFrame(drawCosmos);
  }

  // Single-Spine Category Branching + Dynamic 1,000+ Node Expanse
  window.computeOrganicTreePositions = function(nodes, seed = 1) {
    if (!Array.isArray(nodes) || !nodes.length) return nodes;
    const idToIdx = new Map();
    nodes.forEach((n, i) => { if (n.id) idToIdx.set(n.id, i); });

    const childrenMap = nodes.map(() => []);
    const roots = [];
    nodes.forEach((n, i) => {
      let p = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < nodes.length && n.parentIdx !== i)
        ? n.parentIdx : (n.parentId && idToIdx.has(n.parentId) ? idToIdx.get(n.parentId) : -1);
      n.parentIdx = p;
      if (p >= 0) childrenMap[p].push(i); else roots.push(i);
    });

    // Dynamic sky radius scales smoothly from 15 nodes up to 1,000+ nodes
    const stepR = nodes.length >= 120 ? 15 : (nodes.length >= 40 ? 17 : 19);

    function walkSpine(idx, angle, spread, radius) {
      const n = nodes[idx];
      const curve = Math.sin(radius * 0.04 + seed * 0.001) * 0.08;
      const ang = angle + curve;
      n.x = 50 + Math.cos(ang) * radius;
      n.y = 50 + Math.sin(ang) * radius;

      const kids = childrenMap[idx];
      if (!kids.length) return;
      if (kids.length === 1) {
        // Single continuous progression spine
        walkSpine(kids[0], ang, spread, radius + stepR);
      } else {
        // Forks only when splitting into distinct categories/sub-branches
        const fan = Math.min(1.35, Math.max(0.45, spread * 0.85));
        const step = fan / (kids.length - 1);
        kids.forEach((kIdx, k) => {
          const branchAng = ang - fan * 0.5 + k * step;
          walkSpine(kIdx, branchAng, fan * 0.65, radius + stepR * 1.15);
        });
      }
    }

    const rCount = Math.max(1, roots.length);
    roots.forEach((rIdx, r) => {
      const ang = (r * ((Math.PI * 2) / rCount)) - Math.PI / 2;
      walkSpine(rIdx, ang, (Math.PI * 1.8) / rCount, stepR * 1.2);
    });

    // Repulsion pass prevents label collisions without snapping bounds
    const minX = 24, minY = 14;
    for (let pass = 0; pass < 35; pass++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          if (Math.abs(dx) < minX && Math.abs(dy) < minY) {
            const px = (dx >= 0 ? 1 : -1) * (minX - Math.abs(dx)) * 0.25;
            const py = (dy >= 0 ? 1 : -1) * (minY - Math.abs(dy)) * 0.25;
            nodes[i].x -= px; nodes[j].x += px; nodes[i].y -= py; nodes[j].y += py;
          }
        }
      }
    }
    return nodes;
  };

  window.renderWorldTreeCanvas = function(ctx, w, h, nodes) {
    if (!ctx) return;
    const theme = window.getCosmosTheme();
    const cx = w * 0.5, cy = h * 0.5, baseGlow = theme.glowColor || "#38bdf8", blur = Number(theme.glowStrength) || 16;
    const list = Array.isArray(nodes) ? nodes : [];
    const idMap = new Map();
    list.forEach((n, i) => { if (n.id) idMap.set(n.id, i); });

    list.forEach((n) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      const pIdx = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < list.length) ? n.parentIdx : (n.parentId && idMap.has(n.parentId) ? idMap.get(n.parentId) : -1);
      const sx = pIdx >= 0 ? (list[pIdx].x / 100) * w : cx, sy = pIdx >= 0 ? (list[pIdx].y / 100) * h : cy;
      const cpx = (sx + nx) * 0.5 - (ny - sy) * 0.12, cpy = (sy + ny) * 0.5 + (nx - sx) * 0.12;
      const lit = n.status === "mastered" || n.status === "learning" || pIdx < 0;

      ctx.save();
      ctx.shadowColor = baseGlow;
      ctx.shadowBlur = lit ? blur : 0;
      ctx.strokeStyle = lit ? baseGlow : "#334155";
      ctx.globalAlpha = n.status === "mastered" ? 0.92 : (lit ? 0.62 : 0.28);
      ctx.lineWidth = pIdx < 0 ? 4.5 : (lit ? 3.2 : 1.8);
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cpx, cpy, nx, ny); ctx.stroke();
      ctx.restore();
    });

    ctx.save();
    const halo = ctx.createRadialGradient(cx, cy, 3, cx, cy, 42);
    halo.addColorStop(0, "#ffffff"); halo.addColorStop(0.35, baseGlow); halo.addColorStop(1, "rgba(2,6,23,0)");
    ctx.globalAlpha = 0.85; ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, 42, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  startDeepSpaceCanvas();
})();
