(function installCompactBridge() {
  const LIKED_KEY = "skilltree_liked_v1", HIDDEN_KEY = "skilltree_hidden_presets_v1", OVERRIDE_KEY = "skilltree_preset_overrides_v1";
  const PRIMARY_ADMIN = "sethmcnab13@gmail.com";
  let realmQuery = "", busy = false;

  const isOwner = () => ((typeof firebase !== "undefined" && firebase.auth?.().currentUser?.email) || "").toLowerCase() === PRIMARY_ADMIN;
  const isAdmin = () => isOwner() && Boolean(!document.getElementById("adminBar")?.classList.contains("hidden") || !document.getElementById("adminToggleBtn")?.classList.contains("hidden"));
  const allowNsfw = () => Boolean(document.getElementById("nsfwToggle")?.checked);

  function syncMenu() {
    if (!isOwner()) {
      document.getElementById("adminBar")?.classList.add("hidden");
      document.getElementById("adminToggleBtn")?.classList.add("hidden");
    }
    const list = document.querySelector("#viewMenu .max-w-md");
    if (!list) return;
    if (!document.getElementById("bridgeAiBtn")) {
      const b = document.createElement("button");
      b.id = "bridgeAiBtn"; b.type = "button";
      b.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      b.innerHTML = `<div class="text-left"><div class="text-[10px] font-black uppercase text-emerald-400">AI Architect Engine</div><div class="text-sm font-bold text-white skyrim-font">✨ BUILD SKILL TREE FROM ANY TOPIC</div><div class="text-[11px] text-slate-400">Generate 10-15 nodes → Expand anytime</div></div><span class="text-emerald-400">🧠</span>`;
      b.onclick = () => window.openAiBuilderModal?.();
      list.insertBefore(b, list.firstChild);
    }
    if (!document.getElementById("bridgeAboutBtn")) {
      const a = document.createElement("button");
      a.id = "bridgeAboutBtn"; a.type = "button";
      a.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      a.innerHTML = `<div class="text-left"><div class="text-sm font-bold text-sky-300 skyrim-font">📖 ABOUT SKILL TREE & HOW IT WORKS</div><div class="text-[11px] text-slate-400">Real-Life RPG guide, leveling math & tour</div></div><span class="text-sky-400">✦</span>`;
      a.onclick = () => { if (typeof openTutorial === "function") openTutorial(); };
      list.appendChild(a);
    }
  }

  function syncWorkspace() {
    const addBtn = document.getElementById("addNodeBtn");
    if (!addBtn) return;
    if (!document.getElementById("bridgeGrowBtn")) {
      const g = document.createElement("button");
      g.id = "bridgeGrowBtn"; g.type = "button"; g.textContent = "✨ Grow";
      g.className = "px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded text-xs font-bold";
      g.onclick = () => window.openBranchExpanderModal?.();
      addBtn.parentElement.insertBefore(g, addBtn);
    }
    if (!document.getElementById("bridgeDelBtn")) {
      const d = document.createElement("button");
      d.id = "bridgeDelBtn"; d.type = "button"; d.textContent = "🗑";
      d.className = "px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded text-xs font-bold";
      d.onclick = async () => {
        const sel = document.getElementById("treeSelect");
        const title = sel?.options[sel.selectedIndex]?.text?.trim();
        if (!title || !confirm(`Delete "${title}" permanently?`)) return;
        for (const k of Object.keys(localStorage)) {
          try {
            const v = JSON.parse(localStorage.getItem(k) || "null");
            if (Array.isArray(v?.trees)) { v.trees = v.trees.filter(t => t.id !== sel.value && t.title !== title); localStorage.setItem(k, JSON.stringify(v)); }
          } catch {}
        }
        if (typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
          try {
            const uid = firebase.auth().currentUser.uid;
            const doc = await db.collection("users").doc(uid).get();
            if (doc.exists && Array.isArray(doc.data()?.trees)) {
              await db.collection("users").doc(uid).update({ trees: doc.data().trees.filter(t => t.id !== sel.value && t.title !== title) });
            }
          } catch {}
        }
        location.reload();
      };
      addBtn.parentElement.appendChild(d);
    }
  }

  function syncDndSheet() {
    const view = document.getElementById("viewStats"), list = document.getElementById("dndAttributesList");
    if (!view || view.classList.contains("hidden") || !list) return;
    let trees = [];
    for (const k of Object.keys(localStorage)) {
      try { const v = JSON.parse(localStorage.getItem(k) || "null"); if (Array.isArray(v?.trees)) { trees = v.trees; break; } } catch {}
    }
    const attrs = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    const names = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
    const counts = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    let total = 0;
    trees.forEach(t => { const m = (t.nodes || []).filter(n => n.status === "mastered").length; total += m; counts[attrs.includes(t.attr) ? t.attr : "INT"] += m; });
    const sorted = [...attrs].sort((a, b) => counts[b] - counts[a]);
    list.innerHTML = attrs.map(a => {
      const sc = Math.min(30, 10 + Math.floor(Math.sqrt(counts[a]) * 2.2));
      const mod = Math.floor((sc - 10) / 2);
      const share = total > 0 ? Math.round((counts[a] / total) * 100) : 0;
      const pct = Math.min(100, Math.round(((sc - 10) / 20) * 100));
      return `<div class="space-y-1"><div class="flex justify-between text-xs"><span class="font-bold text-slate-200">${a} — ${names[a]} <span class="text-[10px] text-sky-400">(${share}% share)</span></span><span class="font-black text-sky-300">${sc} (${mod >= 0 ? "+" + mod : mod})</span></div><div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800"><div style="width:${pct}%" class="h-full bg-gradient-to-r from-sky-500 to-emerald-400"></div></div></div>`;
    }).join("") + `<div class="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]"><div class="bg-slate-950/80 p-2 rounded border border-slate-800">Top Affinity:<br><b class="text-emerald-400">${sorted[0]} (${names[sorted[0]]})</b></div><div class="bg-slate-950/80 p-2 rounded border border-slate-800">Growth Focus:<br><b class="text-amber-300">${sorted[5]} (${names[sorted[5]]})</b></div></div>`;
  }

  function runAll() {
    busy = false;
    obs.disconnect();
    try { syncMenu(); syncWorkspace(); syncDndSheet(); } finally { obs.observe(document.body, { childList: true, subtree: true }); }
  }
  const obs = new MutationObserver(() => { if (!busy) { busy = true; setTimeout(runAll, 150); } });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(runAll, 300);
})();
