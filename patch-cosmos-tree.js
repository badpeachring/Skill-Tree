(function installCosmosAndZeroGravityTree() {
  const THEME_KEY = "skilltree_cosmos_theme_v1";
  window.getCosmosTheme = function() {
    try {
      return Object.assign({ nebulaAlpha: 0.32, sapSpeed: 1.0, accent: "#38bdf8", sapColor: "#34d399" }, JSON.parse(localStorage.getItem(THEME_KEY) || "{}"));
    } catch {
      return { nebulaAlpha: 0.32, sapSpeed: 1.0, accent: "#38bdf8", sapColor: "#34d399" };
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
      const na = Number(window.getCosmosTheme().nebulaAlpha) || 0.32;
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);

      [
        { x: w * 0.22, y: h * 0.24, r: Math.max(w, h) * 0.45, c1: `rgba(56,189,248,${na * 0.6})` },
        { x: w * 0.80, y: h * 0.68, r: Math.max(w, h) * 0.50, c1: `rgba(139,92,246,${na * 0.55})` },
        { x: w * 0.50, y: h * 0.50, r: Math.max(w, h) * 0.38, c1: `rgba(16,185,129,${na * 0.38})` }
      ].forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 4, n.x, n.y, n.r);
        g.addColorStop(0, n.c1);
        g.addColorStop(1, "rgba(2,6,23,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // Spiral Galaxy
      ctx.save();
      ctx.translate(w * 0.82, h * 0.18);
      ctx.rotate(-0.45);
      ctx.scale(1, 0.42);
      const gal = ctx.createRadialGradient(0, 0, 1, 0, 0, 48);
      gal.addColorStop(0, `rgba(224,242,254,${na * 1.15})`);
      gal.addColorStop(0.45, `rgba(129,140,248,${na * 0.6})`);
      gal.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = gal;
      ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Ringed Gas Giant
      const px = w * 0.16, py = h * 0.78, pr = 24;
      const pGrad = ctx.createRadialGradient(px - 7, py - 7, 2, px, py, pr);
      pGrad.addColorStop(0, "rgba(125,211,252,0.48)");
      pGrad.addColorStop(0.65, "rgba(30,58,138,0.32)");
      pGrad.addColorStop(1, "rgba(2,6,23,0.05)");
      ctx.fillStyle = pGrad;
      ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
      ctx.save();
      ctx.translate(px, py); ctx.rotate(-0.35);
      ctx.strokeStyle = "rgba(148,163,184,0.28)"; ctx.lineWidth = 2.8;
      ctx.beginPath(); ctx.ellipse(0, 0, 42, 10, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();

      stars.forEach(s => {
        ctx.globalAlpha = 0.28 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.phase));
        ctx.fillStyle = s.hue;
        ctx.beginPath(); ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawCosmos);
    }
    requestAnimationFrame(drawCosmos);
  }

  // Wide-Expanse 360° Layout + Anti-Overlap Repulsion Solver
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

    // Scale virtual sky expanse based on node count so labels never collide
    const span = nodes.length >= 45 ? 135 : (nodes.length >= 20 ? 105 : 65);
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

    // Repulsion pass: push any close nodes apart so titles and icons are cleanly readable
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

  // Bold, Thick Tapered Organic Space-Tree + Continuous Sap-Flicker Light Flow
  window.renderWorldTreeCanvas = function(ctx, w, h, nodes) {
    if (!ctx) return;
    const theme = window.getCosmosTheme();
    const cx = w * 0.5, cy = h * 0.5;
    const now = performance.now() * 0.001 * (Number(theme.sapSpeed) || 1);

    // Thick Nebula Energy Root Tendrils
    for (let r = 0; r < 10; r++) {
      const a = (r * 2.39996) + Math.sin(now * 0.35 + r) * 0.08;
      const len = Math.min(w, h) * (0.20 + (r % 3) * 0.05);
      const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len;
      const cpx = cx + Math.cos(a + 0.4) * (len * 0.55), cpy = cy + Math.sin(a + 0.4) * (len * 0.55);
      const rg = ctx.createLinearGradient(cx, cy, ex, ey);
      rg.addColorStop(0, "rgba(56,189,248,0.58)");
      rg.addColorStop(0.6, "rgba(16,185,129,0.22)");
      rg.addColorStop(1, "rgba(16,185,129,0)");
      ctx.strokeStyle = rg;
      ctx.lineWidth = 4.5;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.quadraticCurveTo(cpx, cpy, ex, ey); ctx.stroke();
    }

    const list = Array.isArray(nodes) ? nodes : [];
    const idMap = new Map();
    list.forEach((n, i) => { if (n.id) idMap.set(n.id, i); });

    list.forEach((n, i) => {
      const nx = (n.x / 100) * w, ny = (n.y / 100) * h;
      const pIdx = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < list.length)
        ? n.parentIdx
        : (n.parentId && idMap.has(n.parentId) ? idMap.get(n.parentId) : -1);

      const sx = pIdx >= 0 ? (list[pIdx].x / 100) * w : cx;
      const sy = pIdx >= 0 ? (list[pIdx].y / 100) * h : cy;
      const dx = nx - sx, dy = ny - sy;
      const cpx = (sx + nx) * 0.5 - dy * 0.16;
      const cpy = (sy + ny) * 0.5 + dx * 0.16;

      const active = n.status === "mastered" || n.status === "learning";
      const limbColor = n.status === "mastered" ? "#f59e0b" : (active ? theme.sapColor : theme.accent);

      // Outer Bioluminescent Bark Aura (Thick & Glowing)
      ctx.strokeStyle = active ? `${limbColor}33` : "rgba(56,189,248,0.18)";
      ctx.lineWidth = pIdx < 0 ? 16 : 11;
      ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cpx, cpy, nx, ny); ctx.stroke();

      // Core Living Wood Vessel
      ctx.strokeStyle = active ? `${limbColor}cc` : "rgba(56,189,248,0.58)";
      ctx.lineWidth = pIdx < 0 ? 7.5 : (active ? 5.2 : 4.0);
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.quadraticCurveTo(cpx, cpy, nx, ny); ctx.stroke();

      // Continuous Traveling Bioluminescent Sap-Flicker Light Pulses (2 staggered sparks per branch)
      for (let s = 0; s < 2; s++) {
        const pulseT = (now * 0.65 + i * 0.17 + s * 0.5) % 1;
        const inv = 1 - pulseT;
        const px = inv * inv * sx + 2 * inv * pulseT * cpx + pulseT * pulseT * nx;
        const py = inv * inv * sy + 2 * inv * pulseT * cpy + pulseT * pulseT * ny;
        const flicker = 0.65 + 0.35 * Math.sin(now * 11 + i * 2.7 + s);

        const sg = ctx.createRadialGradient(px, py, 0.5, px, py, active ? 13 : 10);
        sg.addColorStop(0, `rgba(255,255,255,${0.98 * flicker})`);
        sg.addColorStop(0.4, active ? "rgba(52,211,153,0.85)" : "rgba(56,189,248,0.80)");
        sg.addColorStop(1, "rgba(2,6,23,0)");
        ctx.fillStyle = sg;
        ctx.beginPath(); ctx.arc(px, py, active ? 13 : 10, 0, Math.PI * 2); ctx.fill();
      }
    });

    // Large Central Cosmic Heartwood Core
    const corePulse = 1 + Math.sin(now * 2.6) * 0.10;
    const halo = ctx.createRadialGradient(cx, cy, 4, cx, cy, 54 * corePulse);
    halo.addColorStop(0, "rgba(255,255,255,0.98)");
    halo.addColorStop(0.25, "rgba(56,189,248,0.85)");
    halo.addColorStop(0.60, "rgba(16,185,129,0.38)");
    halo.addColorStop(1, "rgba(2,6,23,0)");
    ctx.fillStyle = halo;
    ctx.beginPath(); ctx.arc(cx, cy, 54 * corePulse, 0, Math.PI * 2); ctx.fill();

    ctx.strokeStyle = "rgba(125,211,252,0.7)";
    ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(cx, cy, 26 * corePulse, 0, Math.PI * 2); ctx.stroke();
  };

  // Continuous 60fps loop for Personal Constellations canvas (runs automatically without touch)
  function startPersonalCanvasLoop() {
    const c = document.getElementById("treeCanvas");
    if (!c || c.dataset.autoPulse) return;
    c.dataset.autoPulse = "1";
    function tick() {
      const ws = document.getElementById("activeTreeWorkspace");
      const sel = document.getElementById("treeSelect");
      if (ws && !ws.classList.contains("hidden") && typeof userData !== "undefined" && Array.isArray(userData?.trees)) {
        const curId = sel ? sel.value : "";
        const tree = userData.trees.find(t => t.id === curId) || userData.trees[0];
        if (tree && Array.isArray(tree.nodes)) {
          const ctx = c.getContext("2d");
          if (ctx && c.width && c.height) {
            ctx.clearRect(0, 0, c.width, c.height);
            window.renderWorldTreeCanvas(ctx, c.width, c.height, tree.nodes);
          }
        }
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  startDeepSpaceCanvas();
  setInterval(startPersonalCanvasLoop, 400);
})();
