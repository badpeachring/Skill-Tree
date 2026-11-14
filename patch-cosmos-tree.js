(function installCosmosAndGlowingTree() {
  const THEME_KEY = "skilltree_cosmos_theme_v3";
  window.getCosmosTheme = function() {
    try {
      return Object.assign({
        nebulaAlpha: 0.30,
        glowColor: "#38bdf8",
        activeGlow: "#34d399",
        glowStrength: 16
      }, JSON.parse(localStorage.getItem(THEME_KEY) || "{}"));
    } catch {
      return { nebulaAlpha: 0.30, glowColor: "#38bdf8", activeGlow: "#34d399", glowStrength: 16 };
    }
  };
  window.saveCosmosTheme = function(cfg) {
    localStorage.setItem(THEME_KEY, JSON.stringify(Object.assign(window.getCosmosTheme(), cfg)));
  };

  function startDeepSpaceCanvas() {
    const c = document.getElementById("starfieldCanvas");
    if (!c || c.dataset.cosmosHooked) return;
    c.dataset.cosmosHooked = "1";
    const ctx = c.getContext("2d");
    let w = 0, h = 0;

    const stars = Array.from({ length: 145 }, (_, i) => ({
      x: (Math.sin(i * 91.7) * 0.5 + 0.5),
      y: (Math.cos(i * 47.3) * 0.5 + 0.5),
      r: (i % 7 === 0) ? 2.0 : ((i % 3 === 0) ? 1.2 : 0.7),
      phase: i * 0.9,
      hue: i % 5 === 0 ? "#7dd3fc" : (i % 9 === 0 ? "#fde68a" : "#f8fafc")
    }));

    function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
    window.addEventListener("resize", resize);
    resize();

    function drawCosmos(now) {
      const t = now * 0.001;
      const na = Number(window.getCosmosTheme().nebulaAlpha) || 0.30;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);

      [
        { x: w * 0.22, y: h * 0.24, r: Math.max(w, h) * 0.45, c1: `rgba(56,189,248,${na * 0.55})` },
        { x: w * 0.80, y: h * 0.68, r: Math.max(w, h) * 0.50, c1: `rgba(139,92,246,${na * 0.50})` },
        { x: w * 0.50, y: h * 0.50, r: Math.max(w, h) * 0.38, c1: `rgba(16,185,129,${na * 0.35})` }
      ].forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 4, n.x, n.y, n.r);
        g.addColorStop(0, n.c1);
        g.addColorStop(1, "rgba(2,6,23,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      ctx.save();
      ctx.translate(w * 0.82, h * 0.18);
      ctx.rotate(-0.45);
      ctx.scale(1, 0.42);
      const gal = ctx.createRadialGradient(0, 0, 1, 0, 0, 48);
      gal.addColorStop(0, `rgba(224,242,254,${na * 1.1})`);
      gal.addColorStop(0.45, `rgba(129,140,248,${na * 0.55})`);
      gal.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = gal;
      ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      const px = w * 0.16, py = h * 0.78, pr = 24;
      const pGrad = ctx.createRadialGradient(px - 7, py - 7, 2, px, py, pr);
      pGrad.addColorStop(0, "rgba(125,211,252,0.45)");
      pGrad.addColorStop(0.65, "rgba(30,58,138,0.30)");
      pGrad.addColorStop(1, "rgba(2,6,23,0.05)");
      ctx.fillStyle = pGrad;
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(px, py); ctx.rotate(-0.35);
      ctx.strokeStyle = "rgba(148,163,184,0.25)"; ctx.lineWidth = 2.6;
      ctx.beginPath(); ctx.ellipse(0, 0, 42, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      stars.forEach(s => {
        ctx.globalAlpha = 0.35 + 0.55 * (0.5 + 0.5 * Math.sin(t * 1.4 + s.phase));
        ctx.fillStyle = s.hue;
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawCosmos);
    }
    requestAnimationFrame(drawCosmos);
  }

  window.computeOrganicTreePositions = function(nodes, seed = 1) {
    if (!Array.isArray(nodes) || !nodes.length) return nodes;
    const idToIdx = new Map();
    nodes.forEach((n, i) => { if (n.id) idToIdx.set(n.id, i); });

    const childrenMap = nodes.map(() => []);
    const roots = [];
    nodes.forEach((n, i) => {
      let p = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < nodes.length && n.parentIdx !== i)
        ? n.parentIdx
        : (n.parentId && idToIdx.has(n.parentId) ? idToIdx.get(n.parentId) : -1);
      n.parentIdx = p;
      if (p >= 0) childrenMap[p].push(i);
      else roots.push(i);
    });

    const span = nodes.length >= 45 ? 135 : (nodes.length >= 20 ? 105 : 68);
    const stepR = span / 4.2;

    function placeSubtree(idx, baseAngle, spread, depth, radius) {
      const n = nodes[idx];
      const wobble = Math.sin(seed * 0.001 + idx * 1.7) * 0.11;
      const ang = baseAngle + wobble;
      n.x = 50 + Math.cos(ang) * radius;
      n.y = 50 + Math.sin(ang) * radius;

      const kids = childrenMap[idx];
      if (!kids.length) return;
      const step = spread / Math.max(1, kids.length);
      const start = ang - spread * 0.5 + step * 0.5;
      const nextSpread = Math.max(0.55, spread * 0.82);
      kids.forEach((kIdx, k) => {
        placeSubtree(kIdx, start + k * step, nextSpread, depth + 1, radius + stepR);
      });
    }

    const rootCount = Math.max(1, roots.length);
    roots.forEach((rIdx, r) => {
      const ang = (r * ((Math.PI * 2) / rootCount)) + ((seed % 360) * 0.01745);
      placeSubtree(rIdx, ang, (Math.PI * 1.9) / rootCount, 1, stepR * 1.15);
    });

    const minDistX = 28, minDistY = 16;
    for (let iter = 0; iter < 45; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
            const pushX = (dx >= 0 ? 1 : -1) * (minDistX - Math.abs(dx)) * 0.28;
            const pushY = (dy >= 0 ? 1 : -1) * (minDistY - Math.abs(dy)) * 0.28;
            nodes[i].x -= pushX; nodes[j].x += pushX;
            nodes[i].y -= pushY; nodes[j].y += pushY;
          }
        }
      }
    }
    return nodes;
  };

  // Harmonious Astral & Bioluminescent Glowing Branches
  window.renderWorldTreeCanvas = function(ctx, w, h, nodes) {
    if (!ctx) return;
    const theme = window.getCosmosTheme();
    const cx = w * 0.5, cy = h * 0.5;
    const baseGlow = theme.glowColor || "#38bdf8";
    const blurAmt = Number(theme.glowStrength) || 16;

    // Subtle Nebula Root Tendrils
    for (let r = 0; r < 10; r++) {
      const a = (r * 2.39996);
      const len = Math.min(w, h) * (0.16 + (r % 3) * 0.04);
      const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len;
      const cpx = cx + Math.cos(a + 0.4) * (len * 0.55), cpy = cy + Math.sin(a + 0.4) * (len * 0.55);
      const rg = ctx.createLinearGradient(cx, cy, ex, ey);
      rg.addColorStop(0, baseGlow);
      rg.addColorStop(1, "rgba(2,6,23,0)");
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = rg;
      ctx.lineWidth = 3.5;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cpx, cpy, ex, ey); ctx.stroke();
      ctx.restore();
    }

    const list = Array.isArray(nodes) ? nodes : [];
    const idMap = new Map();
    list.forEach((n, i) => { if (n.id) idMap.set(n.id, i); });

    list.forEach((n) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      const pIdx = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < list.length)
        ? n.parentIdx
        : (n.parentId && idMap.has(n.parentId) ? idMap.get(n.parentId) : -1);

      const sx = pIdx >= 0 ? (list[pIdx].x / 100) * w : cx;
      const sy = pIdx >= 0 ? (list[pIdx].y / 100) * h : cy;
      const dx = nx - sx, dy = ny - sy;
      const cpx = (sx + nx) * 0.5 - dy * 0.15;
      const cpy = (sy + ny) * 0.5 + dx * 0.15;

      const mastered = n.status === "mastered";
      const learning = n.status === "learning";

      // Soft Outer Nebula Halo
      ctx.save();
      ctx.shadowColor = baseGlow;
      ctx.shadowBlur = mastered ? blurAmt * 1.3 : blurAmt * 0.8;
      ctx.strokeStyle = baseGlow;
      ctx.globalAlpha = mastered ? 0.55 : (learning ? 0.42 : 0.26);
      ctx.lineWidth = pIdx < 0 ? 9 : 6.5;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cpx, cpy, nx, ny); ctx.stroke();

      // Sleek Translucent Starlight Filament
      const grad = ctx.createLinearGradient(sx, sy, nx, ny);
      grad.addColorStop(0, baseGlow);
      grad.addColorStop(1, mastered ? "#fde68a" : (learning ? "#6ee7b7" : "#bae6fd"));
      ctx.shadowBlur = 0;
      ctx.strokeStyle = grad;
      ctx.globalAlpha = mastered ? 0.92 : (learning ? 0.78 : 0.48);
      ctx.lineWidth = pIdx < 0 ? 3.2 : 2.2;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cpx, cpy, nx, ny); ctx.stroke();
      ctx.restore();
    });

    // Harmonized Central Cosmic Seed Core
    ctx.save();
    const halo = ctx.createRadialGradient(cx, cy, 3, cx, cy, 44);
    halo.addColorStop(0, "#ffffff");
    halo.addColorStop(0.32, baseGlow);
    halo.addColorStop(0.75, "rgba(15,23,42,0.2)");
    halo.addColorStop(1, "rgba(2,6,23,0)");
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, 44, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };

  startDeepSpaceCanvas();
})();
