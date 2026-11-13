(function installCosmosAndZeroGravityTree() {
  const THEME_KEY = "skilltree_cosmos_theme_v1";
  window.getCosmosTheme = function() {
    try {
      return Object.assign({
        nebulaAlpha: 0.28,
        sapSpeed: 1.0,
        accent: "#38bdf8",
        sapColor: "#34d399"
      }, JSON.parse(localStorage.getItem(THEME_KEY) || "{}"));
    } catch {
      return { nebulaAlpha: 0.28, sapSpeed: 1.0, accent: "#38bdf8", sapColor: "#34d399" };
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

    const stars = Array.from({ length: 135 }, (_, i) => ({
      x: (Math.sin(i * 91.7) * 0.5 + 0.5),
      y: (Math.cos(i * 47.3) * 0.5 + 0.5),
      r: (i % 7 === 0) ? 1.8 : ((i % 3 === 0) ? 1.1 : 0.65),
      phase: i * 0.9,
      hue: i % 5 === 0 ? "#7dd3fc" : (i % 9 === 0 ? "#fde68a" : "#f8fafc")
    }));

    function resize() {
      w = c.width = window.innerWidth;
      h = c.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    function drawCosmos(now) {
      const t = now * 0.001;
      const theme = window.getCosmosTheme();
      const na = Number(theme.nebulaAlpha) || 0.28;

      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, w, h);

      const nebulae = [
        { x: w * 0.22, y: h * 0.24, r: Math.max(w, h) * 0.42, c1: `rgba(56,189,248,${na * 0.55})`, c2: "rgba(2,6,23,0)" },
        { x: w * 0.80, y: h * 0.68, r: Math.max(w, h) * 0.48, c1: `rgba(139,92,246,${na * 0.50})`, c2: "rgba(2,6,23,0)" },
        { x: w * 0.52, y: h * 0.48, r: Math.max(w, h) * 0.36, c1: `rgba(16,185,129,${na * 0.32})`, c2: "rgba(2,6,23,0)" }
      ];
      nebulae.forEach(n => {
        const g = ctx.createRadialGradient(n.x, n.y, 4, n.x, n.y, n.r);
        g.addColorStop(0, n.c1);
        g.addColorStop(1, n.c2);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      });

      // Distant Spiral Galaxy
      ctx.save();
      ctx.translate(w * 0.82, h * 0.18);
      ctx.rotate(-0.45 + Math.sin(t * 0.05) * 0.03);
      ctx.scale(1, 0.42);
      const gal = ctx.createRadialGradient(0, 0, 1, 0, 0, 44);
      gal.addColorStop(0, `rgba(224,242,254,${na * 1.1})`);
      gal.addColorStop(0.4, `rgba(129,140,248,${na * 0.55})`);
      gal.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = gal;
      ctx.beginPath();
      ctx.arc(0, 0, 44, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Ringed Gas Giant
      const px = w * 0.16, py = h * 0.78, pr = 22;
      const pGrad = ctx.createRadialGradient(px - 7, py - 7, 2, px, py, pr);
      pGrad.addColorStop(0, "rgba(125,211,252,0.42)");
      pGrad.addColorStop(0.65, "rgba(30,58,138,0.28)");
      pGrad.addColorStop(1, "rgba(2,6,23,0.05)");
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-0.35);
      ctx.strokeStyle = "rgba(148,163,184,0.24)";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(0, 0, 38, 9, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Small Amber Moon
      const mx = w * 0.14, my = h * 0.22;
      const mGrad = ctx.createRadialGradient(mx - 3, my - 3, 1, mx, my, 9);
      mGrad.addColorStop(0, "rgba(253,224,71,0.45)");
      mGrad.addColorStop(1, "rgba(180,83,9,0.06)");
      ctx.fillStyle = mGrad;
      ctx.beginPath();
      ctx.arc(mx, my, 9, 0, Math.PI * 2);
      ctx.fill();

      stars.forEach(s => {
        const alpha = 0.28 + 0.65 * (0.5 + 0.5 * Math.sin(t * 1.6 + s.phase));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = s.hue;
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fill();
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

    const getParentIdx = (n, i) => {
      if (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < nodes.length && n.parentIdx !== i) return n.parentIdx;
      if (n.parentId && idToIdx.has(n.parentId)) return idToIdx.get(n.parentId);
      return -1;
    };

    const childrenMap = nodes.map(() => []);
    const roots = [];
    nodes.forEach((n, i) => {
      const p = getParentIdx(n, i);
      n.parentIdx = p;
      if (p >= 0) childrenMap[p].push(i);
      else roots.push(i);
    });

    const maxR = nodes.length >= 40 ? 43 : (nodes.length >= 15 ? 38 : 32);

    function placeSubtree(idx, baseAngle, spread, depth, radius) {
      const n = nodes[idx];
      const wobble = Math.sin(seed * 0.001 + idx * 1.7) * 0.09;
      const ang = baseAngle + wobble;
      n.x = Math.min(93, Math.max(7, 50 + Math.cos(ang) * radius));
      n.y = Math.min(93, Math.max(7, 50 + Math.sin(ang) * radius));

      const kids = childrenMap[idx];
      if (!kids.length) return;
      const step = spread / Math.max(1, kids.length);
      const start = ang - spread * 0.5 + step * 0.5;
      const nextSpread = Math.max(0.42, spread * 0.74);
      const nextRadius = Math.min(maxR, radius + (maxR / 4.2));
      kids.forEach((kIdx, k) => {
        placeSubtree(kIdx, start + k * step, nextSpread, depth + 1, nextRadius);
      });
    }

    const rootCount = Math.max(1, roots.length);
    roots.forEach((rIdx, r) => {
      const ang = (r * ((Math.PI * 2) / rootCount)) + ((seed % 360) * 0.01745) + (r * 0.15);
      const spread = (Math.PI * 1.75) / rootCount;
      placeSubtree(rIdx, ang, spread, 1, maxR * 0.34);
    });
    return nodes;
  };

  window.renderWorldTreeCanvas = function(ctx, w, h, nodes) {
    if (!ctx) return;
    const theme = window.getCosmosTheme();
    const cx = w * 0.5, cy = h * 0.5;
    const now = performance.now() * 0.001 * (Number(theme.sapSpeed) || 1);

    for (let r = 0; r < 9; r++) {
      const a = (r * 2.39996) + Math.sin(now * 0.3 + r) * 0.06;
      const len = Math.min(w, h) * (0.14 + (r % 3) * 0.04);
      const ex = cx + Math.cos(a) * len, ey = cy + Math.sin(a) * len;
      const cpx = cx + Math.cos(a + 0.35) * (len * 0.55), cpy = cy + Math.sin(a + 0.35) * (len * 0.55);
      const rg = ctx.createLinearGradient(cx, cy, ex, ey);
      rg.addColorStop(0, "rgba(56,189,248,0.42)");
      rg.addColorStop(1, "rgba(16,185,129,0)");
      ctx.strokeStyle = rg;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.stroke();
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
      const cpx = (sx + nx) * 0.5 - dy * 0.14;
      const cpy = (sy + ny) * 0.5 + dx * 0.14;

      const active = n.status === "mastered" || n.status === "learning";
      const limbColor = n.status === "mastered" ? "#f59e0b" : (active ? theme.sapColor : theme.accent);

      ctx.strokeStyle = active ? `${limbColor}99` : "rgba(56,189,248,0.34)";
      ctx.lineWidth = pIdx < 0 ? 4.2 : (active ? 2.8 : 2.0);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpx, cpy, nx, ny);
      ctx.stroke();

      // Traveling Bioluminescent Sap-Flicker Light Pulse
      const pulseT = (now * 0.55 + i * 0.19) % 1;
      const inv = 1 - pulseT;
      const px = inv * inv * sx + 2 * inv * pulseT * cpx + pulseT * pulseT * nx;
      const py = inv * inv * sy + 2 * inv * pulseT * cpy + pulseT * pulseT * ny;
      const flicker = 0.55 + 0.45 * Math.sin(now * 9 + i * 3.1);

      const sg = ctx.createRadialGradient(px, py, 0.5, px, py, active ? 9 : 6.5);
      sg.addColorStop(0, `rgba(255,255,255,${0.95 * flicker})`);
      sg.addColorStop(0.45, active ? "rgba(52,211,153,0.75)" : "rgba(56,189,248,0.65)");
      sg.addColorStop(1, "rgba(2,6,23,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.arc(px, py, active ? 9 : 6.5, 0, Math.PI * 2);
      ctx.fill();
    });

    const corePulse = 1 + Math.sin(now * 2.4) * 0.08;
    const halo = ctx.createRadialGradient(cx, cy, 2, cx, cy, 34 * corePulse);
    halo.addColorStop(0, "rgba(255,255,255,0.95)");
    halo.addColorStop(0.28, "rgba(56,189,248,0.75)");
    halo.addColorStop(0.65, "rgba(16,185,129,0.28)");
    halo.addColorStop(1, "rgba(2,6,23,0)");
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, 34 * corePulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(125,211,252,0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, 17 * corePulse, 0, Math.PI * 2);
    ctx.stroke();
  };

  function hookPersonalTreeLoop() {
    const c = document.getElementById("treeCanvas");
    if (!c || c.dataset.sapLoop) return;
    c.dataset.sapLoop = "1";
    function tick() {
      const ws = document.getElementById("activeTreeWorkspace");
      if (ws && !ws.classList.contains("hidden") && typeof userData !== "undefined" && typeof activeTreeId !== "undefined") {
        const tree = (userData?.trees || []).find(t => t.id === activeTreeId);
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
  setInterval(hookPersonalTreeLoop, 600);
})();
