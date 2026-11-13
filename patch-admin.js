(function installArchitectAdmin() {
  const bar = document.getElementById("adminBar");
  if (bar) {
    bar.innerHTML = `
      <div class="flex items-center justify-between w-full gap-1 overflow-x-auto">
        <span class="font-black text-amber-300 tracking-wider shrink-0">⚡ ARCHITECT</span>
        <div class="flex items-center space-x-1 shrink-0">
          <button onclick="adminBoostNodes()" class="px-2 py-0.5 bg-amber-500 text-slate-950 font-bold rounded">+5 Stars</button>
          <button onclick="adminExportJSON()" class="px-2 py-0.5 bg-sky-500 text-slate-950 font-bold rounded">Export</button>
          <button onclick="adminImportJSON()" class="px-2 py-0.5 bg-emerald-500 text-slate-950 font-bold rounded">Import</button>
          <button onclick="adminWipeMe()" class="px-2 py-0.5 bg-red-900 text-red-200 font-bold rounded">Reset 0</button>
          <button onclick="document.getElementById('adminBar').classList.add('hidden')" class="px-1.5 text-amber-300 font-bold">✕</button>
        </div>
      </div>`;
  }

  window.isArchitectActive = () => (currentUser && currentUser.email && currentUser.email.toLowerCase() === "sethmcnab13@gmail.com") || (bar && !bar.classList.contains("hidden"));

  window.adminExportJSON = function() {
    const blob = JSON.stringify({ userTrees, userProfile }, null, 2);
    prompt("Copy your full Skill Tree JSON backup:", blob);
  };

  window.adminImportJSON = async function() {
    const raw = prompt("Paste exported Skill Tree JSON:"); if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed.userTrees) userTrees = parsed.userTrees;
      if (parsed.userProfile) userProfile = parsed.userProfile;
      await saveUserData();
      alert("Backup restored!");
      if (!document.getElementById("viewTrees").classList.contains("hidden")) renderMyTreesView();
    } catch (e) { alert("Invalid JSON: " + e.message); }
  };
    const origRenderServer = window.renderServerList;
  window.renderServerList = function() {
    origRenderServer();
    if (!window.isArchitectActive()) return;
    const list = document.getElementById("serverList");
    const filtered = publicTreesCache.filter(t => (!t.nsfw || showNsfw) && (serverFilter === "ALL" || (serverFilter === "Concept" && t.tag === "Concept") || (serverFilter === "Community" && t.isCloud) || (serverFilter === "Business" && (t.tag || "").toLowerCase().includes("business"))));
    Array.from(list.children).forEach((card, i) => {
      const t = filtered[i]; if (!t || !t.isCloud) return;
      const row = document.createElement("div");
      row.className = "flex gap-2 pt-1";
      row.innerHTML = `<button class="adm-ed flex-1 py-1 bg-amber-950/80 border border-amber-500/50 text-amber-300 rounded text-[11px] font-bold">Admin Edit</button><button class="adm-del flex-1 py-1 bg-red-950/80 border border-red-700 text-red-300 rounded text-[11px] font-bold">Admin Delete</button>`;
      row.querySelector(".adm-ed").onclick = async () => {
        const title = prompt("New tree title:", t.title); if (!title) return;
        const tag = prompt("Tag (Mentorship, Business, Hobby, 21+):", t.tag) || t.tag;
        await db.collection("public_trees").doc(t.id).update({ title: title.trim(), tag: tag.trim(), nsfw: tag.includes("21") });
        loadServerRealm();
      };
      row.querySelector(".adm-del").onclick = async () => { if (confirm(`Delete cloud tree "${t.title}"?`)) { await db.collection("public_trees").doc(t.id).delete(); loadServerRealm(); } };
      card.appendChild(row);
    });
  };

  window.loadComments = async function() {
    const list = document.getElementById("commentsList"); if (!db) return;
    try {
      const snap = await db.collection("community_comments").orderBy("createdAt", "desc").limit(30).get();
      let h = "";
      snap.forEach(d => {
        const c = d.data(), delBtn = window.isArchitectActive() ? `<button onclick="adminDelComment('${d.id}')" class="text-red-400 text-xs font-bold px-1.5">✕</button>` : "";
        h += `<div class="glass-panel rounded-lg p-3 flex justify-between items-start gap-2"><div><div class="text-[11px] font-bold text-sky-400">${c.author}</div><p class="text-xs text-slate-200 mt-0.5">${c.text}</p></div>${delBtn}</div>`;
      });
      list.innerHTML = h || `<div class="text-xs text-slate-400 text-center py-6">Be the first to post!</div>`;
    } catch (e) { console.error(e); }
  };
  window.adminDelComment = async (id) => { if (confirm("Delete this post?")) { await db.collection("community_comments").doc(id).delete(); loadComments(); } };
})();
