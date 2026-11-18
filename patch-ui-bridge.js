(function installUnifiedBridge() {
  const PRIMARY_ADMIN = "sethmcnab13@gmail.com";
  let busy = false;

  const isOwner = () => ((typeof firebase !== "undefined" && firebase.auth?.().currentUser?.email) || "").toLowerCase() === PRIMARY_ADMIN;

  function openDetailedGuideModal() {
    let m = document.getElementById("detailedGuideModal");
    if (!m) { m = document.createElement("div"); m.id = "detailedGuideModal"; m.className = "fixed inset-0 z-50 bg-slate-950 flex flex-col p-4 overflow-y-auto"; document.body.appendChild(m); }
    m.innerHTML = `
      <div class="max-w-md mx-auto w-full space-y-3 pb-10">
        <div class="flex justify-between items-center border-b border-sky-500/30 pb-2.5">
          <h2 class="text-lg font-black text-sky-400 skyrim-font">📖 COMPLETE APP GUIDE</h2>
          <button id="closeGuideBtn" type="button" class="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕ Close</button>
        </div>
        <div class="glass-panel rounded-xl p-3.5 space-y-1.5"><div class="text-xs font-black text-emerald-400 uppercase">1. 🌌 The Grand Nebula</div><p class="text-xs text-slate-300 leading-relaxed">Your flagship constellation in <b>My Constellations</b>. Harvest individual skills from any tree into <b>The Grand Nebula</b> to organize them onto clean category spines across STR, DEX, CON, INT, WIS, and CHA.</p></div>
        <div class="glass-panel rounded-xl p-3.5 space-y-1.5"><div class="text-xs font-black text-amber-400 uppercase">2. 📖 Reading Nodes vs. ⚔ Quest Nodes</div><p class="text-xs text-slate-300 leading-relaxed">Unexplored stars start dim under <b>Fog-of-War</b>. <b>Reading Nodes</b> illuminate after reading; <b>Quest Nodes</b> require completing real-world practice checklists or prerequisites first.</p></div>
        <div class="glass-panel rounded-xl p-3.5 space-y-1.5"><div class="text-xs font-black text-sky-400 uppercase">3. 🎯 Quest Board & Private Scratchpad</div><p class="text-xs text-slate-300 leading-relaxed">Every skill in <b>Training</b> appears on your <b>Quest Board</b> with a private scratchpad box to log progress between sessions, or tap <b>🎲 Next Spark</b> to draw your next skill.</p></div>
        <div class="glass-panel rounded-xl p-3.5 space-y-1.5"><div class="text-xs font-black text-purple-400 uppercase">4. ✨ AI Builder & Branch Grower</div><p class="text-xs text-slate-300 leading-relaxed">Generate 12–15 core nodes from the Main Menu, then tap <b>✨ Grow</b> inside <b>My Constellations</b> to expand branches indefinitely without AI truncation.</p></div>
      </div>`;
    m.classList.remove("hidden");
    document.getElementById("closeGuideBtn").onclick = () => m.classList.add("hidden");
  }

  function syncMenu() {
    if (!isOwner()) { document.getElementById("adminBar")?.classList.add("hidden"); document.getElementById("adminToggleBtn")?.classList.add("hidden"); }
    const list = document.querySelector("#viewMenu .max-w-md");
    if (!list) return;

    const items = [
      { id: "bridgeAiBtn", tag: "AI Architect Engine", color: "text-emerald-400", title: "✨ BUILD SKILL TREE FROM ANY TOPIC", sub: "Generate 12-15 nodes → Expand branches anytime", icon: "🧠", fn: () => window.openAiBuilderModal?.() },
      { id: "bridgePrivBtn", tag: "Encrypted Peer Sharing", color: "text-amber-400", title: "🔒 PRIVATE TREE SHARE & HARVEST", sub: "Share workflows via PIN or harvest to Grand Nebula", icon: "🗝", fn: () => window.openPrivateShareModal?.() },
      { id: "bridgeQuestBtn", tag: "Active Log & Scratchpad", color: "text-sky-400", title: "🎯 QUEST BOARD & FIELD NOTES", sub: "View all active quests, private notes & draw next spark", icon: "⚔", fn: () => window.openFullQuestBoard?.() }
    ];
    items.reverse().forEach(it => {
      let el = document.getElementById(it.id);
      if (!el) {
        el = document.createElement("button"); el.id = it.id; el.type = "button";
        el.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
        el.innerHTML = `<div class="text-left"><div class="text-[10px] font-black uppercase ${it.color}">${it.tag}</div><div class="text-sm font-bold text-white skyrim-font">${it.title}</div><div class="text-[11px] text-slate-400">${it.sub}</div></div><span class="${it.color}">${it.icon}</span>`;
        list.insertBefore(el, list.firstChild);
      }
      el.onclick = it.fn;
    });

    let about = document.getElementById("bridgeAboutBtn");
    if (!about) {
      about = document.createElement("button"); about.id = "bridgeAboutBtn"; about.type = "button";
      about.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
      about.innerHTML = `<div class="text-left"><div class="text-sm font-bold text-sky-300 skyrim-font">📖 COMPLETE APP GUIDE & WALKTHROUGH</div><div class="text-[11px] text-slate-400">Step-by-step guide to Grand Nebula, Quests & AI Builder</div></div><span class="text-sky-400">✦</span>`;
      list.appendChild(about);
    }
    about.onclick = openDetailedGuideModal;
  }

  function syncWorkspace() {
    const addBtn = document.getElementById("addNodeBtn");
    if (!addBtn) return;
    addBtn.parentElement.querySelectorAll("button").forEach(b => { if ((b.textContent || "").includes("🌿")) b.style.display = "none"; });

    if (!document.getElementById("bridgeGrowBtn")) {
      const g = document.createElement("button"); g.id = "bridgeGrowBtn"; g.type = "button"; g.textContent = "✨ Grow";
      g.className = "px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 rounded text-xs font-bold";
      g.onclick = () => window.openBranchExpanderModal?.();
      addBtn.parentElement.insertBefore(g, addBtn);
    }
    if (!document.getElementById("bridgeDelBtn")) {
      const d = document.createElement("button"); d.id = "bridgeDelBtn"; d.type = "button"; d.textContent = "🗑";
      d.className = "px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded text-xs font-bold";
      d.onclick = async () => {
        const sel = document.getElementById("treeSelect");
        const delId = sel?.value;
        const delTitle = sel?.options[sel.selectedIndex]?.text?.trim();
        if (!delTitle || !confirm(`Delete "${delTitle}" permanently?`)) return;
        window.markTreeDeletedPermanently?.(delId, delTitle);

        for (const k of Object.keys(localStorage)) {
          try {
            const v = JSON.parse(localStorage.getItem(k) || "null");
            if (Array.isArray(v?.trees)) {
              v.trees = v.trees.filter(t => t.id !== delId && t.title !== delTitle);
              localStorage.setItem(k, JSON.stringify(v));
            }
          } catch {}
        }
        if (typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
          try {
            const uid = firebase.auth().currentUser.uid;
            const doc = await db.collection("users").doc(uid).get();
            if (doc.exists && Array.isArray(doc.data()?.trees)) {
              await db.collection("users").doc(uid).set({ trees: doc.data().trees.filter(t => t.id !== delId && t.title !== delTitle) }, { merge: true });
            }
          } catch {}
        }
        if (sel && sel.selectedIndex >= 0) {
          sel.remove(sel.selectedIndex);
          sel.dispatchEvent(new Event("change"));
        }
      };
      addBtn.parentElement.appendChild(d);
    }
  }

  function runAll() {
    busy = false; obs.disconnect();
    try { syncMenu(); syncWorkspace(); } finally { obs.observe(document.body, { childList: true, subtree: true }); }
  }
  const obs = new MutationObserver(() => { if (!busy) { busy = true; setTimeout(runAll, 150); } });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(runAll, 300);
})();
