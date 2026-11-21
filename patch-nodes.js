(function installSuperNodes() {
  const modalBox = document.querySelector("#detailModal > div");
  if (!modalBox) return;

  modalBox.innerHTML = `
    <div class="flex justify-between items-center border-b border-slate-800 pb-2">
      <div>
        <span id="modRankTag" class="text-[10px] font-black uppercase tracking-widest text-sky-400">Skill Node</span>
        <h2 id="modalTitle" class="text-base font-bold text-white skyrim-font">Skill Details</h2>
      </div>
      <button id="closeModalBtn" class="text-slate-400 text-lg px-2">✕</button>
    </div>

    <div class="grid grid-cols-3 gap-1.5">
      <button data-status="locked" class="status-toggle py-1.5 text-xs rounded border border-slate-800 bg-slate-950 text-slate-400">Locked</button>
      <button data-status="learning" class="status-toggle py-1.5 text-xs rounded border border-slate-800 bg-slate-950 text-slate-400">Training</button>
      <button data-status="mastered" class="status-toggle py-1.5 text-xs rounded border border-slate-800 bg-slate-950 text-slate-400">Mastered</button>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="block text-[10px] uppercase text-slate-400 mb-0.5">Skill Title</label>
        <input id="modEditTitle" type="text" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none">
      </div>
      <div>
        <label class="block text-[10px] uppercase text-slate-400 mb-0.5">Grows From Branch</label>
        <select id="modParentSelect" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"></select>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2">
      <div>
        <label class="block text-[10px] uppercase text-slate-400 mb-0.5">Sigil Icon</label>
        <select id="modalIcon" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white">
          <option value="✦">✦ Star</option><option value="★">★ Gold Star</option><option value="◆">◆ Diamond</option>
          <option value="⚔">⚔ Blade</option><option value="🛡">🛡 Shield</option><option value="👑">👑 Crown</option>
          <option value="🔥">🔥 Flame</option><option value="⚡">⚡ Bolt</option><option value="🌿">🌿 Leaf</option>
          <option value="⚒">⚒ Anvil</option><option value="⚙">⚙ Gear</option><option value="🧭">🧭 Compass</option>
          <option value="📖">📖 Tome</option><option value="🧪">🧪 Alchemy</option><option value="🎯">🎯 Target</option>
          <option value="🧠">🧠 Mind</option><option value="💪">💪 Power</option><option value="🏆">🏆 Relic</option>
        </select>
      </div>
      <div>
        <label class="block text-[10px] uppercase text-slate-400 mb-0.5">Aura Color</label>
        <select id="modalColor" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white">
          <option value="#38bdf8">Frost Cyan</option><option value="#f59e0b">Solar Gold</option>
          <option value="#22c55e">Emerald</option><option value="#ef4444">Crimson</option>
          <option value="#a855f7">Arcane Violet</option><option value="#ec4899">Plasma Pink</option>
          <option value="#14b8a6">Teal Jade</option><option value="#f8fafc">Pure Starlight</option>
        </select>
      </div>
      <div>
        <label class="block text-[10px] uppercase text-slate-400 mb-0.5">Mastery Tier</label>
        <select id="modTierSelect" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-1.5 py-1.5 text-xs text-white">
          <option value="Tier I • Foundation">Tier I (Base)</option>
          <option value="Tier II • Practitioner">Tier II (Adept)</option>
          <option value="Tier III • Specialist">Tier III (Pro)</option>
          <option value="Tier IV • Grandmaster">Tier IV (Master)</option>
        </select>
      </div>
    </div>
        <div>
      <div class="flex justify-between items-center mb-1">
        <label class="text-[10px] uppercase tracking-wider text-slate-400">Practice Steps / Mastery Checklist</label>
        <button type="button" id="modAddStepBtn" class="text-[11px] font-bold text-emerald-400">+ Add Step</button>
      </div>
      <div id="modStepsList" class="space-y-1 max-h-28 overflow-y-auto"></div>
    </div>

    <div>
      <div class="flex justify-between items-center mb-1">
        <label class="text-[10px] uppercase tracking-wider text-slate-400">Reference Links, Videos & Docs</label>
        <button type="button" id="modAddLinkBtn" class="text-[11px] font-bold text-sky-400">+ Add Link</button>
      </div>
      <div id="modLinksList" class="space-y-1 max-h-24 overflow-y-auto"></div>
    </div>

    <div>
      <label class="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Execution Blueprint & Field Notes</label>
      <textarea id="modalNotes" rows="3" placeholder="Key cues, metrics, tool specs, or lessons learned..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none"></textarea>
    </div>

    <div class="grid grid-cols-3 gap-2 pt-1">
      <button type="button" id="modCloneNodeBtn" class="py-2 bg-slate-800 text-slate-200 rounded-lg font-bold text-xs">Duplicate</button>
      <button type="button" id="modDeleteNodeBtn" class="py-2 bg-red-950/80 border border-red-800 text-red-300 rounded-lg font-bold text-xs">Delete</button>
      <button type="button" id="saveSkillBtn" class="py-2 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">Save Node</button>
    </div>
  `;
    let tempLinks = [], tempSteps = [];
  function renderSteps() {
    const box = document.getElementById("modStepsList");
    if (!tempSteps.length) { box.innerHTML = `<div class="text-[11px] text-slate-500 italic">No drill steps yet — tap + Add Step.</div>`; return; }
    box.innerHTML = tempSteps.map((st, i) => `<div class="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs"><label class="flex items-center space-x-2 flex-1 mr-2 cursor-pointer"><input type="checkbox" data-idx="${i}" class="chk-step accent-emerald-400" ${st.done ? "checked" : ""}><span class="${st.done ? "line-through text-slate-500" : "text-slate-200"}">${st.text}</span></label><button type="button" data-idx="${i}" class="del-step text-red-400 font-bold px-1">✕</button></div>`).join("");
    box.querySelectorAll(".chk-step").forEach(c => c.onchange = () => { tempSteps[Number(c.dataset.idx)].done = c.checked; renderSteps(); });
    box.querySelectorAll(".del-step").forEach(b => b.onclick = () => { tempSteps.splice(Number(b.dataset.idx), 1); renderSteps(); });
  }
  function renderLinks() {
    const box = document.getElementById("modLinksList");
    if (!tempLinks.length) { box.innerHTML = `<div class="text-[11px] text-slate-500 italic">No links attached yet.</div>`; return; }
    box.innerHTML = tempLinks.map((lk, i) => `<div class="flex items-center justify-between bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs"><a href="${lk.url}" target="_blank" rel="noopener" class="text-sky-400 underline truncate mr-2">🔗 ${lk.label || lk.url}</a><button type="button" data-idx="${i}" class="del-lk text-red-400 font-bold px-1">✕</button></div>`).join("");
    box.querySelectorAll(".del-lk").forEach(b => b.onclick = () => { tempLinks.splice(Number(b.dataset.idx), 1); renderLinks(); });
  }

  document.getElementById("modAddStepBtn").onclick = () => { const text = prompt("Drill or requirement to master this skill:"); if (text && text.trim()) { tempSteps.push({ text: text.trim(), done: false }); renderSteps(); } };
  document.getElementById("modAddLinkBtn").onclick = () => { const raw = prompt("Paste URL (YouTube, article, PDF, manual):"); if (!raw) return; const url = /^https?:\/\//i.test(raw.trim()) ? raw.trim() : "https://" + raw.trim(); const label = prompt("Link label (e.g., Video Tutorial):", "Reference Guide") || "Reference Guide"; tempLinks.push({ label: label.trim(), url }); renderLinks(); };
  document.querySelectorAll(".status-toggle").forEach(b => b.onclick = () => { if (activeNode) activeNode.status = b.dataset.status; updateStatusToggles(b.dataset.status); });
  document.getElementById("closeModalBtn").onclick = () => document.getElementById("detailModal").classList.add("hidden");

  window.openSkillModal = function(n) {
    activeNode = n; window.history.pushState({ modal: "skill" }, "");
    document.getElementById("modRankTag").textContent = n.tier || "Tier I • Foundation";
    document.getElementById("modalTitle").textContent = n.title;
    document.getElementById("modEditTitle").value = n.title || "";
    document.getElementById("modalIcon").value = n.icon || "✦";
    document.getElementById("modalColor").value = n.color || "#38bdf8";
    document.getElementById("modTierSelect").value = n.tier || "Tier I • Foundation";
    document.getElementById("modalNotes").value = n.notes || "";
    tempSteps = Array.isArray(n.steps) ? JSON.parse(JSON.stringify(n.steps)) : [];
    tempLinks = Array.isArray(n.links) ? JSON.parse(JSON.stringify(n.links)) : [];
    renderSteps(); renderLinks();
    const others = (userTrees[selectedTree]?.nodes || []).filter(x => x.id !== n.id);
    document.getElementById("modParentSelect").innerHTML = `<option value="">Root Trunk (Base)</option>` + others.map(x => `<option value="${x.id}" ${x.id === n.parentId ? "selected" : ""}>↳ ${x.title}</option>`).join("");
    updateStatusToggles(n.status);
    document.getElementById("detailModal").classList.remove("hidden");
  };

  document.getElementById("saveSkillBtn").onclick = async () => { if (!activeNode) return; const t = document.getElementById("modEditTitle").value.trim(); if (t) activeNode.title = t; activeNode.parentId = document.getElementById("modParentSelect").value || null; activeNode.icon = document.getElementById("modalIcon").value; activeNode.color = document.getElementById("modalColor").value; activeNode.tier = document.getElementById("modTierSelect").value; activeNode.notes = document.getElementById("modalNotes").value; activeNode.steps = tempSteps; activeNode.links = tempLinks; document.getElementById("detailModal").classList.add("hidden"); drawConstellation(); await saveUserData(); };
  document.getElementById("modCloneNodeBtn").onclick = async () => { if (!activeNode) return; const copy = JSON.parse(JSON.stringify(activeNode)); copy.id = "n_" + Date.now(); copy.title = activeNode.title + " (Copy)"; copy.x = Math.min(88, activeNode.x + 8); copy.y = Math.max(12, activeNode.y - 8); copy.parentId = activeNode.id; userTrees[selectedTree].nodes.push(copy); document.getElementById("detailModal").classList.add("hidden"); drawConstellation(); await saveUserData(); };
  document.getElementById("modDeleteNodeBtn").onclick = async () => { if (!activeNode || !confirm(`Delete "${activeNode.title}"?`)) return; userTrees[selectedTree].nodes = userTrees[selectedTree].nodes.filter(x => x.id !== activeNode.id).map(x => x.parentId === activeNode.id ? { ...x, parentId: activeNode.parentId || null } : x); document.getElementById("detailModal").classList.add("hidden"); drawConstellation(); await saveUserData(); };
})();
      
