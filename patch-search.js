(function installRealmSearchAndAdminCards() {
  const LIKED_KEY = "skilltree_liked_v1", HIDDEN_KEY = "skilltree_hidden_presets_v1", OVERRIDE_KEY = "skilltree_preset_overrides_v1";
  const PRIMARY_ADMIN = "sethmcnab13@gmail.com";
  let query = "", busy = false;

  const isAdmin = () => ((typeof firebase !== "undefined" && firebase.auth?.().currentUser?.email) || "").toLowerCase() === PRIMARY_ADMIN && !document.getElementById("adminBar")?.classList.contains("hidden");
  const allowNsfw = () => Boolean(document.getElementById("nsfwToggle")?.checked);

  function renderRealm() {
    const view = document.getElementById("viewServer"), list = document.getElementById("serverList");
    if (!view || view.classList.contains("hidden") || !list) return;

    const panel = view.querySelector(".glass-panel");
    if (panel && !document.getElementById("realmSearchBar")) {
      const box = document.createElement("div");
      box.id = "realmSearchBar"; box.className = "pt-2 border-t border-slate-800 flex items-center gap-2";
      box.innerHTML = `<input id="realmQ" type="search" placeholder="Search trees, #tags, or inner nodes..." class="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none"><button id="realmNsfw" type="button" class="px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400">🔞 21+: OFF</button>`;
      panel.appendChild(box);
      document.getElementById("realmQ").oninput = e => { query = e.target.value; renderRealm(); };
      document.getElementById("realmNsfw").onclick = () => {
        const c = document.getElementById("nsfwToggle");
        if (c) { c.checked = !c.checked; if (typeof toggleNsfw === "function") toggleNsfw(); }
        renderRealm();
      };
    }

    const nb = document.getElementById("realmNsfw");
    if (nb) {
      const on = allowNsfw();
      nb.textContent = on ? "🔞 21+: ON" : "🔞 21+: OFF";
      nb.className = on ? "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-rose-500 bg-rose-500/20 text-rose-300" : "px-2.5 py-1.5 rounded-lg text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-400";
    }

    const pool = [...(typeof publicTreesCache !== "undefined" ? publicTreesCache : []), ...(typeof baseConceptTrees !== "undefined" ? baseConceptTrees : [])];
    const admin = isAdmin(), nsfwOk = allowNsfw();
    let hidden; try { hidden = new Set(JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]")); } catch { hidden = new Set(); }
    let liked; try { liked = JSON.parse(localStorage.getItem(LIKED_KEY) || "{}"); } catch { liked = {}; }

    [...list.children].forEach(card => {
      const title = card.querySelector("h2, h3, h4, .skyrim-font")?.textContent?.trim();
      const tree = pool.find(x => x.title === title);
      if (!tree) return;
      if (tree.id?.startsWith("b_") && !tree._zeroed) { tree.likes = 0; tree._zeroed = true; }

      const isNsfw = tree.nsfw === true || (tree.tags || []).includes("nsfw");
      const isHid = hidden.has(tree.id);
      if (tree._privateHiddenFromRealm || (!admin && isHid) || (!nsfwOk && isNsfw)) { card.style.display = "none"; return; }
      card.style.opacity = isHid ? "0.55" : "1";

      const q = query.trim().toLowerCase();
      card.style.display = (!q || `${tree.title} ${tree.author || ""} ${(tree.tags || []).join(" ")} ${(tree.nodes || []).map(n => n.title + " " + (n.notes || "")).join(" ")}`.toLowerCase().includes(q.replace(/^#/, ""))) ? "" : "none";

      const hb = [...card.querySelectorAll("button")].find(b => (b.textContent || "").includes("♥"));
      if (hb) {
        const base = Number(tree.likes) || 0;
        hb.innerHTML = `<div class="text-rose-400 text-xs">♥</div><div class="text-rose-300 text-xs font-bold">${Math.max(0, base + (liked[tree.id] ? 1 : 0))}</div>`;
        if (!hb.dataset.wired) {
          hb.dataset.wired = "1";
          hb.addEventListener("click", async e => {
            e.stopImmediatePropagation(); e.preventDefault();
            liked[tree.id] = !liked[tree.id];
            localStorage.setItem(LIKED_KEY, JSON.stringify(liked));
            renderRealm();
            if (typeof db !== "undefined" && db && typeof firebase !== "undefined") {
              try { await db.collection("publicTrees").doc(tree.id).set({ likes: firebase.firestore.FieldValue.increment(liked[tree.id] ? 1 : -1) }, { merge: true }); } catch {}
            }
          }, true);
        }
      }

      let bar = card.querySelector(".adm-card-bar");
      if (admin) {
        if (!bar) { bar = document.createElement("div"); bar.className = "adm-card-bar flex gap-1.5 mt-2 pt-2 border-t border-slate-800"; card.appendChild(bar); }
        bar.innerHTML = `<button data-a="edit" class="flex-1 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[10px] font-bold">✏️ Edit</button><button data-a="nsfw" class="px-2 py-1 rounded text-[10px] font-bold border ${isNsfw ? "bg-rose-500 text-slate-950" : "bg-rose-500/15 text-rose-300 border-rose-500/40"}">${isNsfw ? "🔞 21+: ON" : "🔞 21+"}</button><button data-a="hide" class="px-2 py-1 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">${isHid ? "👁 Unhide" : "Hide"}</button><button data-a="del" class="px-2 py-1 bg-rose-950 border border-rose-700 text-rose-300 rounded text-[10px] font-bold">🔥 Del</button>`;
        bar.querySelector('[data-a="edit"]').onclick = e => { e.stopPropagation(); window.copyPresetTreeToUser?.(tree.id); };
        bar.querySelector('[data-a="nsfw"]').onclick = async e => {
          e.stopPropagation(); tree.nsfw = !isNsfw; tree.tags = tree.nsfw ? [...new Set([...(tree.tags || []), "nsfw"])] : (tree.tags || []).filter(t => t !== "nsfw");
          if (typeof db !== "undefined" && db) { try { await db.collection("publicTrees").doc(tree.id).set({ nsfw: tree.nsfw, tags: tree.tags }, { merge: true }); } catch {} }
          renderRealm();
        };
        bar.querySelector('[data-a="hide"]').onclick = e => { e.stopPropagation(); if (hidden.has(tree.id)) hidden.delete(tree.id); else hidden.add(tree.id); localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden])); renderRealm(); };
        bar.querySelector('[data-a="del"]').onclick = async e => { e.stopPropagation(); if (!confirm(`Delete "${tree.title}" from cloud?`)) return; if (typeof db !== "undefined" && db) { try { await db.collection("publicTrees").doc(tree.id).delete(); } catch {} } card.remove(); };
      } else if (bar) bar.remove();
    });
  }

  const obs = new MutationObserver(() => { if (!busy) { busy = true; setTimeout(() => { busy = false; obs.disconnect(); try { renderRealm(); } finally { obs.observe(document.body, { childList: true, subtree: true }); } }, 150); } });
  obs.observe(document.body, { childList: true, subtree: true });
  setTimeout(renderRealm, 350);
})();
