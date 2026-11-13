(function installUnifiedUiBridge() {
  const LIKED_KEY = "skilltree_liked_v1";
  const OVERRIDE_KEY = "skilltree_preset_overrides_v1";
  const HIDDEN_KEY = "skilltree_hidden_presets_v1";
  let realmQuery = "";

  const isArchitectOn = () => {
    const bar = document.getElementById("adminBar");
    const btn = document.getElementById("adminToggleBtn");
    return Boolean((bar && !bar.classList.contains("hidden")) || (btn && !btn.classList.contains("hidden")));
  };

  const isNsfwAllowed = () => Boolean(document.getElementById("nsfwToggle")?.checked);

  // 1. Inject AI Builder button right above Private Share in #viewMenu
  function injectMainMenuAiButton() {
    const menuList = document.querySelector("#viewMenu .max-w-md");
    if (!menuList || document.getElementById("bridgeAiBtn")) return;

    const btn = document.createElement("button");
    btn.id = "bridgeAiBtn";
    btn.type = "button";
    btn.className = "menu-btn w-full py-3 px-4 rounded-r-xl flex items-center justify-between";
    btn.innerHTML = `
      <div class="text-left">
        <div class="text-[10px] font-black uppercase tracking-wider text-emerald-400">AI Architect Engine</div>
        <div class="text-sm font-bold text-white skyrim-font">✨ BUILD SKILL TREE FROM ANY TOPIC</div>
        <div class="text-[11px] text-slate-400">Copy AI prompt → Paste JSON → Instant branching World-Tree</div>
      </div>
      <span class="text-emerald-400 text-base">🧠</span>`;
    btn.onclick = () => typeof window.openAiBuilderModal === "function" ? window.openAiBuilderModal() : alert("AI Builder loading...");
    menuList.insertBefore(btn, menuList.children[1] || menuList.firstChild);
  }

  // 2. Fix .srv-filter active blue highlight + inject Deep Search & 21+/NSFW sync in #viewServer
  function enhanceServerRealm() {
    const serverView = document.getElementById("viewServer");
    const serverList = document.getElementById("serverList");
    if (!serverView || !serverList) return;

    const filterBtns = [...serverView.querySelectorAll(".srv-filter")];
    filterBtns.forEach(btn => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => {
        filterBtns.forEach(b => {
          b.classList.remove("bg-sky-500", "text-slate-950", "font-bold");
          b.classList.add("bg-slate-800", "text-slate-300");
        });
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
      box.innerHTML = `
        <div class="flex items-center gap-2">
          <input id="bridgeSearchInput" type="search" placeholder="Search trees, #tags, or inner nodes..." class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none">
          <button id="bridgeNsfwBtn" type="button" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400 shrink-0">🔞 21+: OFF</button>
        </div>
        <div id="bridgeQuickTags" class="flex flex-wrap gap-1.5"></div>`;
      headerPanel.appendChild(box);

      document.getElementById("bridgeSearchInput").oninput = (e) => {
        realmQuery = e.target.value;
        filterAndEnhanceCards();
      };
      document.getElementById("bridgeNsfwBtn").onclick = () => {
        const chk = document.getElementById("nsfwToggle");
        if (chk) {
          chk.checked = !chk.checked;
          if (typeof toggleNsfw === "function") toggleNsfw();
        }
        filterAndEnhanceCards();
      };
    }

    const nsfwBtn = document.getElementById("bridgeNsfwBtn");
    if (nsfwBtn) {
      const on = isNsfwAllowed();
      nsfwBtn.textContent = on ? "🔞 21+: ON" : "🔞 21+: OFF";
      nsfwBtn.className = on
        ? "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-rose-500 bg-rose-500/20 text-rose-300 shrink-0"
        : "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400 shrink-0";
    }

    filterAndEnhanceCards();
  }

  // 3. Apply Search, 21+/NSFW Gate, Heart Lock, and Admin Preset Editing on #serverList cards
  function filterAndEnhanceCards() {
    const serverList = document.getElementById("serverList");
    if (!serverList) return;

    const pool = [
      ...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []),
      ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])
    ];
    const admin = isArchitectOn();
    const allowNsfw = isNsfwAllowed();
    let hiddenSet; try { hiddenSet = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]")); } catch { hiddenSet = new Set(); }
    let likedMap; try { likedMap = JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"); } catch { likedMap = {}; }

    const tagBar = document.getElementById("bridgeQuickTags");
    if (tagBar) {
      const tags = [...new Set(pool.flatMap(t => t.tags || []))].filter(tg => allowNsfw || tg !== "nsfw").slice(0, 8);
      tagBar.innerHTML = tags.map(tg => `<button type="button" data-t="#${tg}" class="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-[10px] text-sky-300">#${tg}</button>`).join("");
      tagBar.querySelectorAll("button").forEach(b => b.onclick = () => {
        const inp = document.getElementById("bridgeSearchInput");
        inp.value = inp.value === b.dataset.t ? "" : b.dataset.t;
        realmQuery = inp.value;
        filterAndEnhanceCards();
      });
    }

    [...serverList.children].forEach(card => {
      const titleEl = card.querySelector("h2, h3, h4, .skyrim-font");
      if (!titleEl) return;
      const title = titleEl.textContent.trim();
      const tree = pool.find(x => x.title === title);
      if (!tree) return;

      const isNsfw = tree.nsfw === true || (tree.tags || []).includes("nsfw");
      if (tree._privateHiddenFromRealm || (!admin && hiddenSet.has(tree.id)) || (!allowNsfw && isNsfw)) {
        card.style.display = "none";
        return;
      }

      const q = realmQuery.trim().toLowerCase();
      let nodeHits = [];
      let matched = true;
      if (q) {
        const term = q.startsWith("#") ? q.slice(1) : q;
        const tags = (tree.tags || []).map(x => String(x).toLowerCase());
        if (q.startsWith("#")) {
          matched = tags.some(tg => tg.includes(term));
        } else {
          const headOk = `${tree.title} ${tree.author || ""} ${tags.join(" ")}`.toLowerCase().includes(term);
          nodeHits = (tree.nodes || []).filter(n => `${n.title || ""} ${n.notes || ""}`.toLowerCase().includes(term));
          matched = headOk || nodeHits.length > 0;
        }
      }
      card.style.display = matched ? "" : "none";

      let badgeBox = card.querySelector(".bridge-node-hits");
      if (!badgeBox) {
        badgeBox = document.createElement("div");
        badgeBox.className = "bridge-node-hits mt-1.5 space-y-1";
        titleEl.parentElement.appendChild(badgeBox);
      }
      const tagsHtml = (tree.tags || []).map(tg => `<span class="inline-block text-[10px] px-1.5 py-0.5 mr-1 rounded ${tg === "nsfw" ? "bg-rose-500/20 text-rose-300" : "bg-slate-800 text-sky-300"}">#${tg}</span>`).join("");
      const hitsHtml = (q && nodeHits.length) ? `<div class="text-[11px] text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 rounded px-2 py-1">🎯 ${nodeHits.length} matching node(s): <b>${nodeHits.slice(0, 3).map(n => n.title).join(", ")}</b></div>` : "";
      badgeBox.innerHTML = `${tagsHtml}${hitsHtml}`;

      // Fix Heart Counter (1 toggle per user, saved in localStorage)
      const heartBtn = [...card.querySelectorAll("button")].find(b => (b.textContent || "").includes("♥"));
      if (heartBtn && !heartBtn.dataset.heartFixed) {
        heartBtn.dataset.heartFixed = "1";
        const baseLikes = Number(tree.likes) || 0;
        const renderHeart = () => {
          const liked = Boolean(likedMap[tree.id]);
          heartBtn.innerHTML = `<div class="text-rose-400 text-xs">♥</div><div class="text-rose-300 text-xs font-bold">${baseLikes + (liked ? 1 : 0)}</div>`;
          heartBtn.style.borderColor = liked ? "#f43f5e" : "";
        };
        renderHeart();
        heartBtn.addEventListener("click", (e) => {
          e.stopImmediatePropagation();
          e.preventDefault();
          likedMap[tree.id] = !likedMap[tree.id];
          localStorage.setItem(LIKED_KEY, JSON.stringify(likedMap));
          renderHeart();
        }, true);
      }

      // Admin Edit / Tag NSFW / Hide Controls
      let adminRow = card.querySelector(".bridge-admin-bar");
      if (admin && !adminRow) {
        adminRow = document.createElement("div");
        adminRow.className = "bridge-admin-bar flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-800";
        adminRow.innerHTML = `
          <button type="button" data-a="edit" class="flex-1 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold">✏️ Edit Preset</button>
          <button type="button" data-a="nsfw" class="px-2 py-1 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded text-[10px] font-bold">🔞 21+/NSFW</button>
          <button type="button" data-a="hide" class="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">${hiddenSet.has(tree.id) ? "👁 Unhide" : "🗑 Hide"}</button>`;
        card.appendChild(adminRow);

        adminRow.querySelector('[data-a="edit"]').onclick = async (e) => {
          e.stopPropagation();
          if (typeof window.copyPresetTreeToUser === "function") {
            await window.copyPresetTreeToUser(tree.id);
            window._pendingPresetOverwriteId = tree.id;
            alert(`Cloned "${tree.title}" into My Constellations! Edit or expand nodes, then tap "💾 Save Over Preset" next to Publish.`);
          }
        };
        adminRow.querySelector('[data-a="nsfw"]').onclick = async (e) => {
          e.stopPropagation();
          let ov; try { ov = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || "{}"); } catch { ov = {}; }
          const nextTags = isNsfw ? (tree.tags || []).filter(t => t !== "nsfw") : [...new Set([...(tree.tags || []), "nsfw"])];
          const updated = { ...tree, nsfw: !isNsfw, tags: nextTags };
          ov[tree.id] = updated;
          localStorage.setItem(OVERRIDE_KEY, JSON.stringify(ov));
          tree.nsfw = updated.nsfw; tree.tags = updated.tags;
          if (typeof db !== "undefined" && db) { try { await db.collection("publicTrees").doc(tree.id).set(updated, { merge: true }); } catch (err) {} }
          filterAndEnhanceCards();
        };
        adminRow.querySelector('[data-a="hide"]').onclick = (e) => {
          e.stopPropagation();
          if (hiddenSet.has(tree.id)) hiddenSet.delete(tree.id); else hiddenSet.add(tree.id);
          localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hiddenSet]));
          filterAndEnhanceCards();
        };
      } else if (!admin && adminRow) {
        adminRow.remove();
      }
    });

    // Show "💾 Save Over Preset" button next to Publish in #activeTreeWorkspace when editing a preset
    const pubBtn = document.querySelector('#activeTreeWorkspace button[onclick*="publishCurrentTree"]');
    if (admin && window._pendingPresetOverwriteId && pubBtn && !document.getElementById("bridgeSavePresetBtn")) {
      const sb = document.createElement("button");
      sb.id = "bridgeSavePresetBtn";
      sb.type = "button";
      sb.textContent = "💾 Save Over Preset";
      sb.className = "px-2 py-1 bg-amber-500 text-slate-950 rounded text-xs font-black";
      sb.onclick = async () => {
        const cur = (userData?.trees || []).find(x => x.id === activeTreeId);
        if (cur && typeof window.adminPublishTreeAsPreset === "function") {
          await window.adminPublishTreeAsPreset(window._pendingPresetOverwriteId, cur);
          window._pendingPresetOverwriteId = null;
          sb.remove();
        }
      };
      pubBtn.parentElement.insertBefore(sb, pubBtn);
    }
  }

  new MutationObserver(() => {
    injectMainMenuAiButton();
    enhanceServerRealm();
  }).observe(document.body, { childList: true, subtree: true });

  setTimeout(() => { injectMainMenuAiButton(); enhanceServerRealm(); }, 350);
})();
                                        
