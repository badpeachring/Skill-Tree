(function installUnifiedUiBridge() {
  const LIKED_KEY = "skilltree_liked_v1";
  const OVERRIDE_KEY = "skilltree_preset_overrides_v1";
  const HIDDEN_KEY = "skilltree_hidden_presets_v1";
  let realmQuery = "";
  let scheduled = false;

  const isArchitectOn = () => {
    const bar = document.getElementById("adminBar");
    const btn = document.getElementById("adminToggleBtn");
    return Boolean((bar && !bar.classList.contains("hidden")) || (btn && !btn.classList.contains("hidden")));
  };
  const isNsfwAllowed = () => Boolean(document.getElementById("nsfwToggle")?.checked);

  // Zero out hardcoded fake likes on Base Concept trees once
  function zeroBaseConceptLikes() {
    if (typeof baseConceptTrees !== "undefined" && Array.isArray(baseConceptTrees)) {
      baseConceptTrees.forEach(t => { if (t && !t._likesZeroed) { t.likes = 0; t._likesZeroed = true; } });
    }
  }

  function injectMainMenuAiButton() {
    const menuList = document.querySelector("#viewMenu .max-w-md");
    if (!menuList || document.getElementById("bridgeAiBtn")) return;
    const btn = document.createElement("button");
    btn.id = "bridgeAiBtn";
    btn.type = "button";
    btn.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
    btn.innerHTML = `<div class="text-left"><div class="text-[10px] font-black uppercase tracking-wider text-emerald-400">AI Architect Engine</div><div class="text-sm font-bold text-white skyrim-font">✨ BUILD SKILL TREE FROM ANY TOPIC</div><div class="text-[11px] text-slate-400">Generate prompt → Paste AI reply → Grow 360° Space-Tree</div></div><span class="text-emerald-400 text-base">🧠</span>`;
    btn.onclick = () => typeof window.openAiBuilderModal === "function" && window.openAiBuilderModal();
    menuList.insertBefore(btn, menuList.firstChild);
  }

  // Add Delete Tree button in My Constellations workspace
  function injectDeleteTreeButton() {
    const addBtn = document.getElementById("addNodeBtn");
    if (!addBtn || document.getElementById("bridgeDeleteTreeBtn")) return;
    const del = document.createElement("button");
    del.id = "bridgeDeleteTreeBtn";
    del.type = "button";
    del.textContent = "🗑";
    del.title = "Delete Current Skill Tree";
    del.className = "px-2 py-1 bg-rose-950/80 border border-rose-700/60 text-rose-300 rounded text-xs font-bold";
    del.onclick = async () => {
      if (typeof userData === "undefined" || !Array.isArray(userData?.trees) || !userData.trees.length) return;
      const curIdx = userData.trees.findIndex(t => t.id === activeTreeId);
      const target = userData.trees[curIdx >= 0 ? curIdx : 0];
      if (!target || !confirm(`Delete "${target.title}" permanently?`)) return;
      userData.trees.splice(curIdx >= 0 ? curIdx : 0, 1);
      if (typeof saveUserData === "function") await saveUserData();
      if (typeof renderTreeSelector === "function") renderTreeSelector();
      if (typeof renderActiveTree === "function") renderActiveTree();
    };
    addBtn.parentElement.appendChild(del);
  }

  function enhanceServerRealm() {
    zeroBaseConceptLikes();
    const serverView = document.getElementById("viewServer");
    if (!serverView || serverView.classList.contains("hidden")) return;

    const filterBtns = [...serverView.querySelectorAll(".srv-filter")];
    filterBtns.forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => { b.classList.remove("bg-sky-500", "text-slate-950", "font-bold"); b.classList.add("bg-slate-800", "text-slate-300"); });
        btn.classList.remove("bg-slate-800", "text-slate-300");
        btn.classList.add("bg-sky-500", "text-slate-950", "font-bold");
        setTimeout(filterAndEnhanceCards, 60);
      });
    });

    const headerPanel = serverView.querySelector(".glass-panel");
    if (headerPanel && !document.getElementById("bridgeRealmSearch")) {
      const box = document.createElement("div");
      box.id = "bridgeRealmSearch";
      box.className = "pt-2 border-t border-slate-800 space-y-2";
      box.innerHTML = `<div class="flex items-center gap-2"><input id="bridgeSearchInput" type="search" placeholder="Search trees, #tags, or inner nodes..." class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"><button id="bridgeNsfwBtn" type="button" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400 shrink-0">🔞 21+: OFF</button></div><div id="bridgeQuickTags" class="flex flex-wrap gap-1.5"></div>`;
      headerPanel.appendChild(box);
      document.getElementById("bridgeSearchInput").oninput = (e) => { realmQuery = e.target.value; filterAndEnhanceCards(); };
      document.getElementById("bridgeNsfwBtn").onclick = () => {
        const chk = document.getElementById("nsfwToggle");
        if (chk) { chk.checked = !chk.checked; if (typeof toggleNsfw === "function") toggleNsfw(); }
        filterAndEnhanceCards();
      };
    }

    const nsfwBtn = document.getElementById("bridgeNsfwBtn");
    if (nsfwBtn) {
      const on = isNsfwAllowed();
      nsfwBtn.textContent = on ? "🔞 21+: ON" : "🔞 21+: OFF";
      nsfwBtn.className = on ? "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-rose-500 bg-rose-500/20 text-rose-300 shrink-0" : "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400 shrink-0";
    }
    filterAndEnhanceCards();
  }

  function filterAndEnhanceCards() {
    const serverList = document.getElementById("serverList");
    if (!serverList) return;
    const pool = [...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []), ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])];
    const admin = isArchitectOn();
    const allowNsfw = isNsfwAllowed();
    let hiddenSet; try { hiddenSet = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]")); } catch { hiddenSet = new Set(); }
    let likedMap; try { likedMap = JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"); } catch { likedMap = {}; }

    [...serverList.children].forEach(card => {
      const titleEl = card.querySelector("h2, h3, h4, .skyrim-font");
      if (!titleEl) return;
      const tree = pool.find(x => x.title === titleEl.textContent.trim());
      if (!tree) return;

      const isNsfw = tree.nsfw === true || (tree.tags || []).includes("nsfw");
      const isHidden = hiddenSet.has(tree.id);
      if (tree._privateHiddenFromRealm || (!admin && isHidden) || (!allowNsfw && isNsfw)) {
        card.style.display = "none";
        return;
      }
      card.style.opacity = isHidden ? "0.55" : "1";

      const q = realmQuery.trim().toLowerCase();
      let nodeHits = [];
      let matched = true;
      if (q) {
        const term = q.startsWith("#") ? q.slice(1) : q;
        const tags = (tree.tags || []).map(x => String(x).toLowerCase());
        if (q.startsWith("#")) matched = tags.some(tg => tg.includes(term));
        else {
          const headOk = `${tree.title} ${tree.author || ""} ${tags.join(" ")}`.toLowerCase().includes(term);
          nodeHits = (tree.nodes || []).filter(n => `${n.title || ""} ${n.notes || ""}`.toLowerCase().includes(term));
          matched = headOk || nodeHits.length > 0;
        }
      }
      card.style.display = matched ? "" : "none";

      // 0-Based Real Hearts (1 toggle per user)
      const heartBtn = [...card.querySelectorAll("button")].find(b => (b.textContent || "").includes("♥"));
      if (heartBtn) {
        const realBase = (tree.id && tree.id.startsWith("b_") && !tree._realLikes) ? 0 : (Number(tree.likes) || 0);
        const renderHeart = () => {
          const liked = Boolean(likedMap[tree.id]);
          heartBtn.innerHTML = `<div class="text-rose-400 text-xs">♥</div><div class="text-rose-300 text-xs font-bold">${realBase + (liked ? 1 : 0)}</div>`;
          heartBtn.style.borderColor = liked ? "#f43f5e" : "";
        };
        renderHeart();
        if (!heartBtn.dataset.heartFixed) {
          heartBtn.dataset.heartFixed = "1";
          heartBtn.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            e.preventDefault();
            likedMap[tree.id] = !likedMap[tree.id];
            localStorage.setItem(LIKED_KEY, JSON.stringify(likedMap));
            renderHeart();
          }, true);
        }
      }

      // Two-Way Admin Controls (Edit Preset / Toggle 21+ NSFW ON-OFF / Hide-Unhide)
      let adminRow = card.querySelector(".bridge-admin-bar");
      if (admin) {
        if (!adminRow) {
          adminRow = document.createElement("div");
          adminRow.className = "bridge-admin-bar flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800";
          card.appendChild(adminRow);
        }
        adminRow.innerHTML = `
          <button type="button" data-a="edit" class="flex-1 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold">✏️ Edit Preset</button>
          <button type="button" data-a="nsfw" class="px-2 py-1 rounded text-[10px] font-bold border ${isNsfw ? "bg-rose-500 text-slate-950 border-rose-400" : "bg-rose-500/15 border-rose-500/40 text-rose-300"}">${isNsfw ? "🔞 21+: ON" : "🔞 Tag 21+"}</button>
          <button type="button" data-a="hide" class="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">${isHidden ? "👁 Unhide" : "🗑 Hide"}</button>`;

        adminRow.querySelector('[data-a="edit"]').onclick = async (e) => {
          e.stopPropagation();
          if (typeof window.copyPresetTreeToUser === "function") {
            await window.copyPresetTreeToUser(tree.id);
            window._pendingPresetOverwriteId = tree.id;
            alert(`Cloned "${tree.title}" into My Constellations! Edit nodes there, then tap "💾 Save Over Preset".`);
          }
        };
        adminRow.querySelector('[data-a="nsfw"]').onclick = async (e) => {
          e.stopPropagation();
          let ov; try { ov = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}"); } catch { ov = {}; }
          const nextNsfw = !isNsfw;
          const nextTags = nextNsfw ? [...new Set([...(tree.tags || []), "nsfw"])] : (tree.tags || []).filter(t => t !== "nsfw");
          tree.nsfw = nextNsfw; tree.tags = nextTags;
          ov[tree.id] = { ...tree };
          localStorage.setItem(OVERRIDE_KEY, JSON.stringify(ov));
          if (typeof db !== "undefined" && db) { try { await db.collection("publicTrees").doc(tree.id).set({ nsfw: nextNsfw, tags: nextTags }, { merge: true }); } catch {} }
          filterAndEnhanceCards();
        };
        adminRow.querySelector('[data-a="hide"]').onclick = (e) => {
          e.stopPropagation();
          if (hiddenSet.has(tree.id)) hiddenSet.delete(tree.id); else hiddenSet.add(tree.id);
          localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hiddenSet]));
          filterAndEnhanceCards();
        };
      } else if (adminRow) {
        adminRow.remove();
      }
    });
  }

  function runBridge() {
    scheduled = false;
    obs.disconnect();
    try {
      injectMainMenuAiButton();
      injectDeleteTreeButton();
      enhanceServerRealm();
    } finally {
      obs.observe(document.body, { childList: true, subtree: true });
    }
  }
  const obs = new MutationObserver(() => { if (!scheduled) { scheduled = true; setTimeout(runBridge, 120); } });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(runBridge, 350);
})();
