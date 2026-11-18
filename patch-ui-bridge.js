(function installUnifiedBridge() {
  const PRIMARY_ADMIN = "sethmcnab13@gmail.com";
  let busy = false;

  const isOwner = () => ((typeof firebase !== "undefined" && firebase.auth?.().currentUser?.email) || "").toLowerCase() === PRIMARY_ADMIN;

  function syncMenu() {
    if (!isOwner()) {
      document.getElementById("adminBar")?.classList.add("hidden");
      document.getElementById("adminToggleBtn")?.classList.add("hidden");
    }
    const list = document.querySelector("#viewMenu .max-w-md");
    if (!list) return;

    if (!document.getElementById("bridgeAiBtn")) {
      const b = document.createElement("button");
      b.id = "bridgeAiBtn"; b.type = "button"; b.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      b.innerHTML = `<div class="text-left"><div class="text-[10px] font-black uppercase text-emerald-400">AI Architect Engine</div><div class="text-sm font-bold text-white skyrim-font">✨ BUILD SKILL TREE FROM ANY TOPIC</div><div class="text-[11px] text-slate-400">Generate 12-15 nodes → Expand branches anytime</div></div><span class="text-emerald-400">🧠</span>`;
      b.onclick = () => window.openAiBuilderModal?.();
      list.insertBefore(b, list.firstChild);
    }

    if (!document.getElementById("bridgePrivBtn")) {
      const p = document.createElement("button");
      p.id = "bridgePrivBtn"; p.type = "button"; p.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      p.innerHTML = `<div class="text-left"><div class="text-[10px] font-black uppercase text-amber-400">Encrypted Peer Sharing</div><div class="text-sm font-bold text-white skyrim-font">🔒 PRIVATE TREE SHARE & HARVEST</div><div class="text-[11px] text-slate-400">Share workflows via PIN or harvest to Grand Nebula</div></div><span class="text-amber-400">🗝</span>`;
      p.onclick = () => window.openPrivateShareModal?.();
      list.insertBefore(p, document.getElementById("bridgeAiBtn")?.nextSibling || list.firstChild);
    }

    if (!document.getElementById("bridgeQuestBtn")) {
      const q = document.createElement("button");
      q.id = "bridgeQuestBtn"; q.type = "button"; q.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      q.innerHTML = `<div class="text-left"><div class="text-[10px] font-black uppercase text-sky-400">Active Log & Scratchpad</div><div class="text-sm font-bold text-white skyrim-font">🎯 QUEST BOARD & FIELD NOTES</div><div class="text-[11px] text-slate-400">View all active quests, private notes & draw next spark</div></div><span class="text-sky-400">⚔</span>`;
      q.onclick = () => window.openFullQuestBoard?.();
      list.insertBefore(q, document.getElementById("bridgePrivBtn")?.nextSibling || list.firstChild);
    }

    if (!document.getElementById("bridgeAboutBtn")) {
      const a = document.createElement("button");
      a.id = "bridgeAboutBtn"; a.type = "button"; a.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      a.innerHTML = `<div class="text-left"><div class="text-sm font-bold text-sky-300 skyrim-font">📖 ABOUT SKILL TREE & HOW IT WORKS</div><div class="text-[11px] text-slate-400">Real-Life RPG manifesto, Grand Nebula & tour</div></div><span class="text-sky-400">✦</span>`;
      a.onclick = () => window.openTutorial?.();
      list.appendChild(a);
    }
  }

  function syncWorkspaceAndNodeTags() {
    const addBtn = document.getElementById("addNodeBtn");
    if (addBtn) {
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
          if (typeof userData !== "undefined" && Array.isArray(userData?.trees)) {
            userData.trees = userData.trees.filter(t => t.id !== sel.value && t.title !== title);
          }
          if (typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
            try {
              const uid = firebase.auth().currentUser.uid;
              const doc = await db.collection("users").doc(uid).get();
              if (doc.exists) await db.collection("users").doc(uid).update({ trees: (doc.data()?.trees || []).filter(t => t.id !== sel.value && t.title !== title) });
            } catch {}
          }
          location.reload();
        };
        addBtn.parentElement.appendChild(d);
      }
    }

    // Working #Hashtag input inside Node Editor modal
    const notesBox = document.getElementById("modalNotes");
    if (notesBox && !document.getElementById("nodeHashtagBox")) {
      const wrap = document.createElement("div");
      wrap.id = "nodeHashtagBox"; wrap.className = "space-y-1";
      wrap.innerHTML = `<label class="block text-[10px] font-bold uppercase text-sky-400">#Node Hashtags (press Enter or comma)</label><input id="nodeTagInput" type="text" placeholder="#strength, #mobility, #vocab..." class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-sky-300 outline-none">`;
      notesBox.parentElement.insertBefore(wrap, notesBox);
    }
  }

  async function syncDndSheet() {
    const view = document.getElementById("viewStats"), list = document.getElementById("dndAttributesList");
    if (!view || view.classList.contains("hidden") || !list || view.dataset.loadingStats) return;
    view.dataset.loadingStats = "1";
    let trees = (typeof userData !== "undefined" && Array.isArray(userData?.trees)) ? userData.trees : [];
    if (!trees.length && typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
      try { const doc = await db.collection("users").doc(firebase.auth().currentUser.uid).get(); if (doc.exists) trees = doc.data()?.trees || []; } catch {}
    }
    const attrs = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
    const names = { STR: "Strength", DEX: "Dexterity", CON: "Constitution", INT: "Intelligence", WIS: "Wisdom", CHA: "Charisma" };
    const counts = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    let total = 0;
    trees.forEach(t => { const m = (t.nodes || []).filter(n => n.status === "mastered").length; total += m; counts[attrs.includes(t.attr) ? t.attr : "WIS"] += m; });
    const sorted = [...attrs].sort((a, b) => counts[b] - counts[a]);
    list.innerHTML = attrs.map(a => {
      const sc = Math.min(30, 10 + Math.floor(Math.sqrt(counts[a]) * 2.2));
      const mod = Math.floor((sc - 10) / 2);
      const share = total > 0 ? Math.round((counts[a] / total) * 100) : 0;
      const pct = Math.min(100, Math.round(((sc - 10) / 20) * 100));
      return `<div class="space-y-1"><div class="flex justify-between text-xs"><span class="font-bold text-slate-200">${a} — ${names[a]} <span class="text-[10px] text-sky-400">(${share}% share)</span></span><span class="font-black text-sky-300">${sc} (${mod >= 0 ? "+" + mod : mod})</span></div><div class="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800"><div style="width:${pct}%" class="h-full bg-gradient-to-r from-sky-500 to-emerald-400"></div></div></div>`;
    }).join("") + `<div class="mt-3 pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]"><div class="bg-slate-950/80 p-2 rounded border border-slate-800">Top Affinity:<br><b class="text-emerald-400">${sorted[0]} (${names[sorted[0]]})</b></div><div class="bg-slate-950/80 p-2 rounded border border-slate-800">Growth Focus:<br><b class="text-amber-300">${sorted[5]} (${names[sorted[5]]})</b></div></div>`;
    setTimeout(() => { view.dataset.loadingStats = ""; }, 800);
  }

  function runAll() {
    busy = false; obs.disconnect();
    try { syncMenu(); syncWorkspaceAndNodeTags(); syncDndSheet(); } finally { obs.observe(document.body, { childList: true, subtree: true }); }
  }
  const obs = new MutationObserver(() => { if (!busy) { busy = true; setTimeout(runAll, 150); } });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(runAll, 300);
})();
