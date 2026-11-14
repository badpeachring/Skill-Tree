(function installArchitectHubAndIsolation() {
  const QUOTES_KEY = "skilltree_custom_quotes_v1";
  const CHANNELS_KEY = "skilltree_town_channels_v1";
  const PRIMARY_ADMIN_EMAIL = "sethmcnab13@gmail.com";
  let activeChannelId = "general";

  const DEFAULT_QUOTES = [
    { text: "A disciplined mind focuses on what lies within its own control, finding unshakable strength regardless of external chaos.", author: "Stoic Principle" },
    { text: "We suffer more often in imagination than in reality.", author: "Seneca" },
    { text: "You have power over your mind — not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
    { text: "Small, daily improvements over time lead to stunning results.", author: "Mastery Axiom" }
  ];

  function enforceAccountIsolation() {
    if (typeof firebase === "undefined" || !firebase.auth) return;
    let lastUid = localStorage.getItem("skilltree_last_uid") || "";
    firebase.auth().onAuthStateChanged(user => {
      const uid = user ? user.uid : "guest";
      if (lastUid && lastUid !== uid) {
        Object.keys(localStorage).forEach(k => {
          if (k.startsWith("skilltree_") && !k.includes(uid) && !k.includes("quotes") && !k.includes("theme") && !k.includes("channels")) {
            localStorage.removeItem(k);
          }
        });
      }
      localStorage.setItem("skilltree_last_uid", uid);

      const email = (user?.email || "").toLowerCase();
      const isOwner = email === PRIMARY_ADMIN_EMAIL || email.startsWith("sethmcnab13");
      const adminBar = document.getElementById("adminBar");
      const adminToggle = document.getElementById("adminToggleBtn");
      if (!isOwner && user) {
        if (adminBar) adminBar.classList.add("hidden");
        if (adminToggle) adminToggle.classList.add("hidden");
      }
    });
  }

  function getQuotesList() {
    try {
      const saved = JSON.parse(localStorage.getItem(QUOTES_KEY) || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [...DEFAULT_QUOTES];
  }

  function saveQuotesList(list) {
    localStorage.setItem(QUOTES_KEY, JSON.stringify(list));
    if (typeof db !== "undefined" && db) {
      try { db.collection("appConfig").doc("quotes").set({ list }); } catch {}
    }
    applyLatestQuote();
  }

  function applyLatestQuote() {
    const list = getQuotesList();
    if (!list.length) return;
    const qEl = document.getElementById("quoteText");
    const aEl = document.getElementById("quoteAuthor");
    const pick = list[Math.floor(Math.random() * list.length)];
    if (qEl && pick.text) qEl.textContent = `"${pick.text}"`;
    if (aEl && pick.author) aEl.textContent = `— ${pick.author}`;
  }

  function getChannels() {
    try {
      const saved = JSON.parse(localStorage.getItem(CHANNELS_KEY) || "null");
      if (Array.isArray(saved) && saved.length) return saved;
    } catch {}
    return [
      { id: "general", name: "#general", locked: false, pinned: "" },
      { id: "tree-requests", name: "#tree-requests", locked: false, pinned: "" },
      { id: "announcements", name: "#announcements", locked: true, pinned: "Welcome to Skill Tree! Build constellations, harvest nodes, and ascend." }
    ];
  }
  function saveChannels(list) {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(list));
    if (typeof db !== "undefined" && db) {
      try { db.collection("appConfig").doc("channels").set({ list }); } catch {}
    }
  }

  function enhanceTownSquare() {
    const view = document.getElementById("viewCommunity");
    if (!view || view.classList.contains("hidden")) return;
    const channels = getChannels();
    const cur = channels.find(c => c.id === activeChannelId) || channels[0];
    activeChannelId = cur.id;

    let bar = document.getElementById("townChannelBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "townChannelBar";
      bar.className = "space-y-2 shrink-0";
      view.insertBefore(bar, view.firstChild);
    }

    bar.innerHTML = `
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
        ${channels.map(ch => `<button type="button" data-ch="${ch.id}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 ${ch.id === cur.id ? "bg-sky-500 text-slate-950" : "bg-slate-900 border border-slate-700 text-slate-300"}">${ch.locked ? "🔒 " : ""}${ch.name}</button>`).join("")}
      </div>
      ${cur.pinned ? `<div class="bg-amber-950/70 border border-amber-500/40 rounded-lg px-3 py-1.5 text-[11px] text-amber-200">📌 <b>Pinned:</b> ${cur.pinned}</div>` : ""}`;

    bar.querySelectorAll("button[data-ch]").forEach(b => b.onclick = () => {
      activeChannelId = b.dataset.ch;
      enhanceTownSquare();
      loadChannelMessages();
    });

    const input = document.getElementById("commentInput");
    const postBtn = view.querySelector('button[onclick*="postComment"]');
    if (input && postBtn) {
      input.placeholder = cur.locked ? "Locked announcement channel (Admin only)" : `Message ${cur.name}...`;
      if (!postBtn.dataset.chHooked) {
        postBtn.dataset.chHooked = "1";
        postBtn.addEventListener("click", async (e) => {
          const text = input.value.trim();
          if (!text) return;
          e.stopImmediatePropagation();
          e.preventDefault();
          const ch = getChannels().find(c => c.id === activeChannelId) || channels[0];
          const isOwner = !document.getElementById("adminBar")?.classList.contains("hidden") || !document.getElementById("adminToggleBtn")?.classList.contains("hidden");
          if (ch.locked && !isOwner) return alert("Only the Architect Admin can post in this channel.");

          const msg = { id: `m_${Date.now()}`, channelId: ch.id, author: "Architect", text, ts: Date.now() };
          const localKey = `skilltree_msgs_${ch.id}`;
          const arr = JSON.parse(localStorage.getItem(localKey) || "[]");
          arr.push(msg);
          localStorage.setItem(localKey, JSON.stringify(arr));
          if (typeof db !== "undefined" && db) { try { await db.collection("townSquareMessages").doc(msg.id).set(msg); } catch {} }
          input.value = "";
          loadChannelMessages();
        }, true);
      }
    }
    loadChannelMessages();
  }

  async function loadChannelMessages() {
    const listEl = document.getElementById("commentsList");
    if (!listEl) return;
    const localKey = `skilltree_msgs_${activeChannelId}`;
    let msgs = JSON.parse(localStorage.getItem(localKey) || "[]");
    if (typeof db !== "undefined" && db) {
      try {
        const snap = await db.collection("townSquareMessages").where("channelId", "==", activeChannelId).limit(40).get();
        if (!snap.empty) {
          msgs = snap.docs.map(d => d.data()).sort((a, b) => (a.ts || 0) - (b.ts || 0));
          localStorage.setItem(localKey, JSON.stringify(msgs));
        }
      } catch {}
    }
    const isOwner = !document.getElementById("adminBar")?.classList.contains("hidden") || !document.getElementById("adminToggleBtn")?.classList.contains("hidden");
    listEl.innerHTML = msgs.length
      ? msgs.map(m => `<div class="glass-panel rounded-lg p-2.5 flex justify-between items-start gap-2"><div><div class="text-[10px] font-bold text-sky-400">${m.author}</div><div class="text-xs text-slate-200 mt-0.5">${m.text}</div></div>${isOwner ? `<button type="button" data-del="${m.id}" class="text-[10px] text-rose-400 px-1.5 py-0.5 bg-rose-950/60 rounded">🗑</button>` : ""}</div>`).join("")
      : `<div class="text-center text-xs text-slate-500 py-6">No messages in this channel yet.</div>`;

    listEl.querySelectorAll("button[data-del]").forEach(b => b.onclick = async () => {
      const next = msgs.filter(x => x.id !== b.dataset.del);
      localStorage.setItem(localKey, JSON.stringify(next));
      if (typeof db !== "undefined" && db) { try { await db.collection("townSquareMessages").doc(b.dataset.del).delete(); } catch {} }
      loadChannelMessages();
    });
  }

  function upgradeAdminBar() {
    const bar = document.getElementById("adminBar");
    if (!bar || bar.dataset.hubUpgraded) return;
    bar.dataset.hubUpgraded = "1";
    bar.innerHTML = `
      <span class="font-black text-amber-300 tracking-wider">⚡ ARCHITECT</span>
      <button id="openArchitectHubBtn" type="button" class="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-full text-[11px]">🛠 Open Command Center</button>`;
    document.getElementById("openArchitectHubBtn").onclick = openArchitectHubModal;
  }

  function openArchitectHubModal() {
    let modal = document.getElementById("architectHubModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "architectHubModal";
      modal.className = "fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 overflow-y-auto";
      document.body.appendChild(modal);
    }
    const theme = typeof window.getCosmosTheme === "function" ? window.getCosmosTheme() : { nebulaAlpha: 0.32, glowColor: "#38bdf8", glowStrength: 18 };
    const quotes = getQuotesList();
    const channels = getChannels();
    let hiddenIds = []; try { hiddenIds = JSON.parse(localStorage.getItem("skilltree_hidden_presets_v1") || "[]"); } catch {}
    const glowSwatches = [
      { name: "Frost Cyan", hex: "#38bdf8" },
      { name: "Emerald", hex: "#10b981" },
      { name: "Solar Gold", hex: "#f59e0b" },
      { name: "Arcane Violet", hex: "#a855f7" },
      { name: "Rose Plasma", hex: "#f43f5e" }
    ];

    modal.innerHTML = `
      <div class="max-w-md mx-auto w-full space-y-4 pb-8">
        <div class="flex justify-between items-center border-b border-amber-500/30 pb-3">
          <h2 class="text-lg font-black text-amber-400 skyrim-font">⚡ ARCHITECT COMMAND CENTER</h2>
          <button id="closeArchHubBtn" type="button" class="px-3 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕ Close</button>
        </div>

        <div class="glass-panel rounded-xl p-3.5 space-y-2">
          <div class="text-xs font-black text-purple-400 uppercase">1. Branch Glow Color & Space Intensity</div>
          <div class="flex flex-wrap gap-1.5">
            ${glowSwatches.map(sw => `<button type="button" data-glow="${sw.hex}" style="border-color:${sw.hex}" class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white border-2">${sw.name}</button>`).join("")}
          </div>
          <label class="flex justify-between text-xs text-slate-300 pt-1"><span>Branch Glow Intensity</span><input id="hubGlowStrength" type="range" min="4" max="32" step="2" value="${theme.glowStrength || 18}"></label>
          <label class="flex justify-between text-xs text-slate-300"><span>Nebula & Galaxy Brightness</span><input id="hubNebulaRange" type="range" min="0.05" max="0.65" step="0.05" value="${theme.nebulaAlpha}"></label>
        </div>

        <div class="glass-panel rounded-xl p-3.5 space-y-2">
          <div class="text-xs font-black text-sky-400 uppercase">2. All Main Menu Quotes (View, Edit & Delete)</div>
          <div class="flex gap-1.5">
            <input id="hubQuoteText" type="text" placeholder="Add new quote..." class="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white">
            <input id="hubQuoteAuthor" type="text" placeholder="Author" class="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white">
            <button id="hubAddQuoteBtn" type="button" class="px-3 py-1.5 bg-sky-500 text-slate-950 font-bold rounded text-xs">+ Add</button>
          </div>
          <div class="max-h-48 overflow-y-auto space-y-1.5">
            ${quotes.map((q, i) => `
              <div class="bg-slate-900/90 p-2 rounded border border-slate-800 space-y-1">
                <div class="text-[11px] text-slate-200">"${q.text}"</div>
                <div class="flex justify-between items-center">
                  <span class="text-[10px] font-bold text-sky-400">— ${q.author}</span>
                  <div class="flex gap-1.5">
                    <button type="button" data-editq="${i}" class="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded font-bold">✏️ Edit</button>
                    <button type="button" data-delq="${i}" class="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 rounded font-bold">🗑</button>
                  </div>
                </div>
              </div>`).join("")}
          </div>
        </div>

        <div class="glass-panel rounded-xl p-3.5 space-y-2">
          <div class="text-xs font-black text-emerald-400 uppercase">3. Town Square Channels & Moderation</div>
          <div class="flex gap-1.5">
            <input id="hubNewChName" type="text" placeholder="#new-channel" class="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white">
            <label class="flex items-center gap-1 text-[11px] text-slate-300"><input id="hubNewChLock" type="checkbox"> 🔒 Lock</label>
            <button id="hubAddChBtn" type="button" class="px-3 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded text-xs">+ Room</button>
          </div>
          <div class="space-y-1.5">
            ${channels.map((ch, i) => `<div class="bg-slate-900/90 p-2 rounded flex justify-between items-center text-xs font-bold text-white"><span>${ch.locked ? "🔒 " : ""}${ch.name}</span><div class="flex gap-1.5"><button type="button" data-pinch="${i}" class="text-[10px] px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded">📌 Pin</button>${i > 0 ? `<button type="button" data-delch="${i}" class="text-[10px] px-2 py-0.5 bg-rose-950 text-rose-300 rounded">Delete</button>` : ""}</div></div>`).join("")}
          </div>
        </div>

        <div class="glass-panel rounded-xl p-3.5 space-y-2">
          <div class="text-xs font-black text-amber-300 uppercase">4. Hidden Presets & Developer Sandbox</div>
          <div class="text-[11px] text-slate-400">Hidden Server Realm presets: <b>${hiddenIds.length}</b> ${hiddenIds.length ? `<button id="hubRestoreHiddenBtn" type="button" class="ml-2 underline text-sky-400">Restore All Hidden</button>` : ""}</div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <button onclick="adminBoostNodes()" class="py-2 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold rounded text-xs">+5 Test Stars</button>
            <button onclick="adminWipeMe()" class="py-2 bg-rose-950/80 border border-rose-700 text-rose-200 font-bold rounded text-xs">Reset My LVL 0</button>
          </div>
        </div>
      </div>`;

    modal.classList.remove("hidden");
    document.getElementById("closeArchHubBtn").onclick = () => modal.classList.add("hidden");

    modal.querySelectorAll("button[data-glow]").forEach(b => b.onclick = () => {
      window.saveCosmosTheme?.({ glowColor: b.dataset.glow, activeGlow: b.dataset.glow });
      if (typeof renderActiveTree === "function") renderActiveTree();
    });
    document.getElementById("hubGlowStrength").oninput = (e) => {
      window.saveCosmosTheme?.({ glowStrength: Number(e.target.value) });
      if (typeof renderActiveTree === "function") renderActiveTree();
    };
    document.getElementById("hubNebulaRange").oninput = (e) => window.saveCosmosTheme?.({ nebulaAlpha: Number(e.target.value) });

    document.getElementById("hubAddQuoteBtn").onclick = () => {
      const text = document.getElementById("hubQuoteText").value.trim();
      const author = document.getElementById("hubQuoteAuthor").value.trim() || "Architect";
      if (!text) return;
      saveQuotesList([...quotes, { text, author }]);
      openArchitectHubModal();
    };
    modal.querySelectorAll("button[data-editq]").forEach(b => b.onclick = () => {
      const idx = Number(b.dataset.editq);
      const nextText = prompt("Edit quote text:", quotes[idx].text);
      if (nextText === null) return;
      const nextAuthor = prompt("Edit author:", quotes[idx].author);
      if (nextAuthor === null) return;
      quotes[idx] = { text: nextText.trim() || quotes[idx].text, author: nextAuthor.trim() || quotes[idx].author };
      saveQuotesList(quotes);
      openArchitectHubModal();
    });
    modal.querySelectorAll("button[data-delq]").forEach(b => b.onclick = () => {
      saveQuotesList(quotes.filter((_, i) => i !== Number(b.dataset.delq)));
      openArchitectHubModal();
    });

    document.getElementById("hubAddChBtn").onclick = () => {
      let name = document.getElementById("hubNewChName").value.trim().toLowerCase().replace(/\s+/g, "-");
      if (!name) return;
      if (!name.startsWith("#")) name = "#" + name;
      const locked = document.getElementById("hubNewChLock").checked;
      saveChannels([...channels, { id: name.slice(1) + "_" + Date.now(), name, locked, pinned: "" }]);
      openArchitectHubModal();
    };
    modal.querySelectorAll("button[data-pinch]").forEach(b => b.onclick = () => {
      const idx = Number(b.dataset.pinch);
      const msg = prompt("Pinned announcement banner:", channels[idx].pinned || "");
      if (msg !== null) { channels[idx].pinned = msg.trim(); saveChannels(channels); openArchitectHubModal(); }
    });
    modal.querySelectorAll("button[data-delch]").forEach(b => b.onclick = () => {
      saveChannels(channels.filter((_, i) => i !== Number(b.dataset.delch)));
      openArchitectHubModal();
    });

    const restBtn = document.getElementById("hubRestoreHiddenBtn");
    if (restBtn) restBtn.onclick = () => { localStorage.removeItem("skilltree_hidden_presets_v1"); openArchitectHubModal(); };
  }

  enforceAccountIsolation();
  setInterval(() => { upgradeAdminBar(); enhanceTownSquare(); }, 500);
  setTimeout(applyLatestQuote, 800);
})();
