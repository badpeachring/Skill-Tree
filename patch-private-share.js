(function installPrivateShareAndHarvest() {
  const PREFIX = "STREE1:";
  const encodePayload = obj => PREFIX + btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj))));
  const decodePayload = raw => {
    const idx = (raw || "").indexOf(PREFIX);
    if (idx < 0) throw new Error("Invalid STREE1 code.");
    const bin = atob(raw.slice(idx + PREFIX.length).split(/\s/)[0]);
    return JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
  };
  const xorMask = (str, pin) => !pin ? str : [...str].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ pin.charCodeAt(i % pin.length))).join("");

  async function resolveUserTrees() {
    let list = (typeof userData !== "undefined" && Array.isArray(userData?.trees)) ? userData.trees : [];
    if (!list.length && typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
      try { const doc = await db.collection("users").doc(firebase.auth().currentUser.uid).get(); if (doc.exists) list = doc.data()?.trees || []; } catch {}
    }
    if (!list.length) {
      const opts = [...(document.getElementById("treeSelect")?.options || [])];
      if (opts.length) list = opts.map(o => ({ id: o.value, title: o.text.trim(), attr: "WIS", nodes: [] }));
    }
    return list;
  }

  window.openPrivateShareModal = async function() {
    let modal = document.getElementById("privateShareModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "privateShareModal";
      modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
      modal.innerHTML = `<div class="w-full max-w-md glass-panel rounded-2xl p-5 space-y-3"><div class="flex justify-between items-center"><h2 class="text-lg font-black text-amber-400 skyrim-font">🔒 Private Tree Vault & Share</h2><button id="closePrivBtn" class="text-slate-400">✕</button></div><div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800"><select id="privTreeSel" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"></select><input id="privPinIn" type="text" maxlength="8" placeholder="Optional PIN lock" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"><div class="grid grid-cols-2 gap-2"><button id="copyPrivCode" class="py-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-xs">📋 Copy Code</button><button id="copyPrivUrl" class="py-2 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">🔗 Copy Link</button></div><textarea id="privOut" rows="2" readonly class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-400 font-mono"></textarea></div><div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800"><textarea id="privIn" rows="3" placeholder="Paste STREE1:... code or link..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"></textarea><input id="privUnlockPin" type="text" maxlength="8" placeholder="PIN (if locked)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"><button id="openPrivBtn" class="w-full py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs">🌳 Open Private Tree & Harvest</button></div></div>`;
      document.body.appendChild(modal);
      document.getElementById("closePrivBtn").onclick = () => modal.classList.add("hidden");
      const doExport = async (asUrl) => {
        const trees = await resolveUserTrees();
        const sel = document.getElementById("privTreeSel");
        const t = trees.find(x => x.id === sel.value) || trees[sel.selectedIndex] || trees[0];
        if (!t) return alert("Create or copy a tree first.");
        const pin = document.getElementById("privPinIn").value.trim();
        const code = encodePayload({ v: 1, locked: Boolean(pin), data: xorMask(JSON.stringify({ title: t.title, attr: t.attr, nodes: t.nodes || [] }), pin) });
        const out = asUrl ? `${location.origin}${location.pathname}?stree=${encodeURIComponent(code)}` : code;
        document.getElementById("privOut").value = out;
        try { await navigator.clipboard.writeText(out); } catch {}
        alert("Copied to clipboard!");
      };
      document.getElementById("copyPrivCode").onclick = () => doExport(false);
      document.getElementById("copyPrivUrl").onclick = () => doExport(true);
      document.getElementById("openPrivBtn").onclick = () => {
        try {
          let raw = document.getElementById("privIn").value.trim();
          if (raw.includes("stree=")) raw = decodeURIComponent(new URL(raw).searchParams.get("stree") || "");
          const env = decodePayload(raw);
          let pin = document.getElementById("privUnlockPin").value.trim();
          if (env.locked && !pin) pin = prompt("Enter PIN:") || "";
          const parsed = JSON.parse(xorMask(env.data, pin));
          const id = `priv_${Date.now()}`;
          if (typeof baseConceptTrees !== "undefined") baseConceptTrees.unshift({ id, attr: parsed.attr || "WIS", tag: "Private", title: parsed.title, author: "Private Share", _privateHiddenFromRealm: true, nodes: parsed.nodes || [] });
          modal.classList.add("hidden");
          window.openVisualBlueprint?.(id);
        } catch (e) { alert("Error: " + e.message); }
      };
    }
    const trees = await resolveUserTrees();
    document.getElementById("privTreeSel").innerHTML = trees.map((t, i) => `<option value="${t.id || i}">${t.title} (${(t.nodes || []).length} nodes)</option>`).join("") || `<option value="">No trees yet</option>`;
    modal.classList.remove("hidden");
  };
})();
