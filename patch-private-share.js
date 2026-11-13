(function installPrivateShareAndHarvest() {
  const PREFIX = "STREE1:";

  function encodePayload(obj) {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json);
    let bin = "";
    bytes.forEach(b => { bin += String.fromCharCode(b); });
    return PREFIX + btoa(bin);
  }

  function decodePayload(raw) {
    const trimmed = (raw || "").trim();
    const idx = trimmed.indexOf(PREFIX);
    if (idx < 0) throw new Error("Invalid share code (must contain STREE1:).");
    const b64 = trimmed.slice(idx + PREFIX.length).split(/\s/)[0];
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  function xorMask(str, pin) {
    if (!pin) return str;
    return [...str].map((ch, i) => String.fromCharCode(ch.charCodeAt(0) ^ pin.charCodeAt(i % pin.length))).join("");
  }

  window.generatePrivateTreeShare = async function(treeObj, pin = "") {
    const cleanNodes = (treeObj.nodes || []).map((n, i) => {
      const pIdx = typeof n.parentIdx === "number"
        ? n.parentIdx
        : (n.parentId ? (treeObj.nodes || []).findIndex(p => p.id === n.parentId) : -1);
      return {
        parentIdx: pIdx,
        title: n.title,
        tier: n.tier || "Tier I • Foundation",
        icon: n.icon || "✦",
        color: n.color || "#38bdf8",
        notes: n.notes || "",
        image: (n.image && !n.image.startsWith("data:image/svg")) ? n.image : "",
        steps: (n.steps || []).map(s => typeof s === "string" ? s : s.text),
        links: n.links || []
      };
    });

    const coreJson = JSON.stringify({
      title: treeObj.title || "Private Skill Tree",
      attr: treeObj.attr || "DEX",
      author: treeObj.author || "Private Architect",
      nodes: cleanNodes
    });

    const code = encodePayload({
      v: 1,
      locked: Boolean(pin),
      data: xorMask(coreJson, pin)
    });
    const url = `${location.origin}${location.pathname}?stree=${encodeURIComponent(code)}`;
    return { code, url };
  };

  window.openPrivateShareModal = function(presetTree = null) {
    let modal = document.getElementById("privateShareModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "privateShareModal";
      modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
      modal.innerHTML = `
        <div class="w-full max-w-md glass-panel rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-3">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-black text-amber-400 skyrim-font">🔒 Private Tree Vault & Share</h2>
            <button id="closePrivShareBtn" type="button" class="text-slate-400 text-base px-2">✕</button>
          </div>

          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-amber-300">Export Any Constellation Privately</div>
            <select id="privTreeSelect" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"></select>
            <input id="privExportPin" type="text" maxlength="8" placeholder="Optional PIN lock (leave blank for none)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <div class="grid grid-cols-2 gap-2">
              <button id="copyPrivCodeBtn" type="button" class="py-2 bg-amber-500 text-slate-950 rounded-lg font-bold text-xs">📋 Copy Share Code</button>
              <button id="copyPrivLinkBtn" type="button" class="py-2 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">🔗 Copy Direct Link</button>
            </div>
            <textarea id="privOutputBox" rows="2" readonly placeholder="Generated private share code appears here..." class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-400 font-mono"></textarea>
          </div>

          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-emerald-400">Open & Harvest Received Private Tree</div>
            <textarea id="privImportBox" rows="3" placeholder="Paste received STREE1:... code or private URL here..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none"></textarea>
            <input id="privImportPin" type="text" maxlength="8" placeholder="PIN (only if sender locked it)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <button id="launchPrivTreeBtn" type="button" class="w-full py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs">🌳 Open Private Tree & Harvest Nodes</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      document.getElementById("closePrivShareBtn").onclick = () => modal.classList.add("hidden");

      const handleExport = async (mode) => {
        const trees = (typeof userData !== "undefined" && userData?.trees) ? userData.trees : [];
        const sel = document.getElementById("privTreeSelect");
        const chosen = trees.find(t => t.id === sel.value) || trees[0];
        if (!chosen) return alert("Create or copy a tree in My Constellations first.");
        const pin = document.getElementById("privExportPin").value.trim();
        const { code, url } = await window.generatePrivateTreeShare(chosen, pin);
        const text = mode === "url" ? url : code;
        document.getElementById("privOutputBox").value = text;
        await navigator.clipboard.writeText(text);
        alert(mode === "url" ? "Private direct link copied to clipboard!" : "Private Share Code copied to clipboard!");
      };

      document.getElementById("copyPrivCodeBtn").onclick = () => handleExport("code");
      document.getElementById("copyPrivLinkBtn").onclick = () => handleExport("url");

      document.getElementById("launchPrivTreeBtn").onclick = () => {
        const raw = document.getElementById("privImportBox").value.trim();
        const pin = document.getElementById("privImportPin").value.trim();
        openPrivateCodeInViewer(raw, pin);
      };
    }

    const sel = document.getElementById("privTreeSelect");
    const trees = (typeof userData !== "undefined" && userData?.trees) ? userData.trees : [];
    sel.innerHTML = trees.map(t => `<option value="${t.id}">${t.title} (${(t.nodes || []).length} nodes)</option>`).join("") || `<option value="">No trees yet</option>`;
    if (presetTree?.id) sel.value = presetTree.id;
    modal.classList.remove("hidden");
  };

  function openPrivateCodeInViewer(rawInput, pin = "") {
    try {
      let codeStr = rawInput;
      if (rawInput.includes("stree=")) {
        const u = new URL(rawInput);
        codeStr = decodeURIComponent(u.searchParams.get("stree") || "");
      }
      const envelope = decodePayload(codeStr);
      if (envelope.locked && !pin) {
        pin = prompt("This private skill tree is PIN-locked. Enter the PIN:") || "";
      }
      const parsed = JSON.parse(xorMask(envelope.data, pin));
      if (!Array.isArray(parsed.nodes)) throw new Error("Invalid PIN or corrupted share code.");

      const tempId = `priv_${Date.now()}`;
      const hydratedNodes = parsed.nodes.map(n => ({
        ...n,
        image: n.image || (typeof window.buildNodeSvgDiagram === "function" ? window.buildNodeSvgDiagram("blueprint", n.title, n.tier) : ""),
        steps: (n.steps || []).map(s => typeof s === "string" ? { text: s, done: false } : s)
      }));

      const privTreeObj = {
        id: tempId,
        attr: parsed.attr || "DEX",
        tag: "Private Share",
        title: parsed.title || "Private Workflow",
        author: parsed.author || "Private Share",
        nodes: hydratedNodes
      };

      // Register in temporary memory ONLY (never saved to public Firestore)
      window._privateVaultTrees = window._privateVaultTrees || [];
      window._privateVaultTrees.unshift(privTreeObj);
      if (typeof baseConceptTrees !== "undefined") {
        baseConceptTrees.unshift({ ...privTreeObj, _privateHiddenFromRealm: true });
      }

      const modal = document.getElementById("privateShareModal");
      if (modal) modal.classList.add("hidden");
      if (typeof window.openVisualBlueprint === "function") {
        window.openVisualBlueprint(tempId);
      }
    } catch (err) {
      alert("Unable to open private tree: " + err.message);
    }
  }

  function injectPrivateVaultButton() {
    const mainMenu = document.getElementById("viewMenu") || document.body;
    const refBtn = document.getElementById("openAiBuilderBtn") || [...mainMenu.querySelectorAll("button")].find(b => /server realm|constellations/i.test(b.textContent || ""));
    if (!refBtn || document.getElementById("openPrivVaultBtn")) return;

    const btn = document.createElement("button");
    btn.id = "openPrivVaultBtn";
    btn.type = "button";
    btn.className = "menu-btn w-full p-4 rounded-xl text-left flex items-center justify-between mb-3";
    btn.innerHTML = `
      <div>
        <div class="text-xs font-black uppercase tracking-wider text-amber-400">Encrypted Peer Sharing</div>
        <div class="text-base font-bold text-white skyrim-font">🔒 Private Tree Share & Harvest</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Share private workflows via PIN code or harvest nodes offline</div>
      </div>
      <span class="text-xl">🗝</span>`;
    btn.onclick = () => window.openPrivateShareModal();
    refBtn.parentElement.insertBefore(btn, refBtn.nextSibling);
  }

  // Auto-detect ?stree= private links on app load
  const urlParams = new URLSearchParams(location.search);
  if (urlParams.has("stree")) {
    setTimeout(() => openPrivateCodeInViewer(location.href), 600);
  }

  injectPrivateVaultButton();
  new MutationObserver(injectPrivateVaultButton).observe(document.body, { childList: true, subtree: true });
})();
