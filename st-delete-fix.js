(() => {
  if (window.__stDeleteFixLoaded) return;
  window.__stDeleteFixLoaded = true;

  const DEL_C_KEY = "st_deleted_constellations_v1";
  const DEL_N_KEY = "st_deleted_nodes_v1";

  const clone = (v) =>
    typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));

  const idOf = (obj) => {
    if (!obj || typeof obj !== "object") return "";
    return String(obj.id ?? obj.constellationId ?? obj.nodeId ?? obj.key ?? obj.slug ?? "");
  };

  const labelOf = (obj, fallback = "") => {
    if (!obj || typeof obj !== "object") return fallback;
    return String(obj.name ?? obj.title ?? obj.label ?? fallback);
  };

  function getDeletedSet(storageKey) {
    try {
      const raw = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(raw) ? raw.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function saveDeletedSet(storageKey, setObj) {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...setObj]));
    } catch {}
  }

  function scrubObject(data) {
    if (!data || typeof data !== "object") return data;
    const delC = getDeletedSet(DEL_C_KEY);
    const delN = getDeletedSet(DEL_N_KEY);
    const removedNodes = new Set(delN);

    if (Array.isArray(data.constellations)) {
      data.constellations = data.constellations.filter((c) => {
        const cid = idOf(c);
        const cname = labelOf(c);
        const matched = (cid && delC.has(cid)) || (cname && delC.has(cname));
        if (matched && Array.isArray(c?.nodes)) {
          c.nodes.forEach((n) => {
            const nid = idOf(n);
            if (nid) removedNodes.add(nid);
          });
        }
        return !matched;
      });
    } else if (data.constellations && typeof data.constellations === "object") {
      for (const [k, c] of Object.entries(data.constellations)) {
        const cid = idOf(c);
        const cname = labelOf(c);
        const matched =
          delC.has(String(k)) || (cid && delC.has(cid)) || (cname && delC.has(cname));
        if (matched) {
          if (Array.isArray(c?.nodes)) {
            c.nodes.forEach((n) => {
              const nid = idOf(n);
              if (nid) removedNodes.add(nid);
            });
          }
          delete data.constellations[k];
        }
      }
    }

    if (Array.isArray(data.nodes)) {
      data.nodes = data.nodes.filter((n) => {
        const nid = idOf(n);
        const cid = String(n?.constellationId ?? n?.constellation ?? n?.group ?? "");
        return !removedNodes.has(nid) && !delC.has(cid);
      });
    }

    for (const edgeField of ["edges", "links", "connections"]) {
      if (Array.isArray(data[edgeField])) {
        data[edgeField] = data[edgeField].filter((e) => {
          const cid = String(e?.constellationId ?? e?.constellation ?? "");
          const src = String(e?.source ?? e?.from ?? e?.sourceId ?? "");
          const tgt = String(e?.target ?? e?.to ?? e?.targetId ?? "");
          return !delC.has(cid) && !removedNodes.has(src) && !removedNodes.has(tgt);
        });
      }
    }

    const remaining = Array.isArray(data.constellations)
      ? data.constellations
      : data.constellations && typeof data.constellations === "object"
      ? Object.entries(data.constellations).map(([id, val]) => ({ id, ...val }))
      : [];
    const nextActiveId = remaining.length ? idOf(remaining[0]) : null;

    for (const activeField of [
      "activeConstellationId",
      "selectedConstellationId",
      "currentConstellationId"
    ]) {
      if (activeField in data && (!data[activeField] || delC.has(String(data[activeField])))) {
        data[activeField] = nextActiveId;
      }
    }

    return data;
  }

  function scrubStorageNow() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key === DEL_C_KEY || key === DEL_N_KEY) continue;
      try {
        const raw = localStorage.getItem(key);
        if (!raw || (!raw.includes("constellations") && !raw.includes("nodes"))) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const cleaned = scrubObject(clone(parsed));
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      } catch {}
    }
  }

  function readConstellations() {
    const items = [];
    const seen = new Set();
    const delC = getDeletedSet(DEL_C_KEY);

    function addItem(c, index) {
      if (!c || typeof c !== "object") return;
      const id = idOf(c) || `idx_${index}`;
      const name = labelOf(c, `Constellation ${index + 1}`);
      if (delC.has(id) || delC.has(name)) return;
      const key = `${id}::${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      items.push({ id, name });
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key === DEL_C_KEY || key === DEL_N_KEY) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (!parsed || typeof parsed !== "object") continue;
        if (Array.isArray(parsed.constellations)) {
          parsed.constellations.forEach((c, idx) => addItem(c, idx));
        } else if (parsed.constellations && typeof parsed.constellations === "object") {
          Object.entries(parsed.constellations).forEach(([id, c], idx) =>
            addItem({ id, ...c }, idx)
          );
        }
      } catch {}
    }

    return items;
  }

  function readNodes() {
    const items = [];
    const seen = new Set();
    const delN = getDeletedSet(DEL_N_KEY);
    const delC = getDeletedSet(DEL_C_KEY);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || key === DEL_C_KEY || key === DEL_N_KEY) continue;
      try {
        const parsed = JSON.parse(localStorage.getItem(key));
        if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.nodes)) continue;
        parsed.nodes.forEach((n, idx) => {
          const id = idOf(n) || `n_${idx}`;
          const cid = String(n?.constellationId ?? n?.constellation ?? n?.group ?? "");
          const name = labelOf(n, `Node ${idx + 1}`);
          if (delN.has(id) || delN.has(name) || delC.has(cid)) return;
          const keyId = `${id}::${name}`;
          if (seen.has(keyId)) return;
          seen.add(keyId);
          items.push({ id, name });
        });
      } catch {}
    }

    return items;
  }

  function deleteConstellations(targets) {
    const delC = getDeletedSet(DEL_C_KEY);
    targets.forEach((t) => {
      if (t?.id) delC.add(String(t.id));
      if (t?.name) delC.add(String(t.name));
    });
    saveDeletedSet(DEL_C_KEY, delC);
    scrubStorageNow();
    window.dispatchEvent(new CustomEvent("skilltree:updated"));
  }

  function deleteNodes(targets) {
    const delN = getDeletedSet(DEL_N_KEY);
    targets.forEach((t) => {
      if (t?.id) delN.add(String(t.id));
      if (t?.name) delN.add(String(t.name));
    });
    saveDeletedSet(DEL_N_KEY, delN);
    scrubStorageNow();
    window.dispatchEvent(new CustomEvent("skilltree:updated"));
  }

  scrubStorageNow();
  const nativeSetItem = localStorage.setItem.bind(localStorage);
  let isScrubbing = false;
  localStorage.setItem = function (key, value) {
    nativeSetItem(key, value);
    if (isScrubbing || key === DEL_C_KEY || key === DEL_N_KEY) return;
    try {
      if (typeof value === "string" && (value.includes("constellations") || value.includes("nodes"))) {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
          const cleaned = scrubObject(clone(parsed));
          const nextRaw = JSON.stringify(cleaned);
          if (nextRaw !== value) {
            isScrubbing = true;
            nativeSetItem(key, nextRaw);
            isScrubbing = false;
          }
        }
      }
    } catch {
      isScrubbing = false;
    }
  };

  function mountDeleteUI() {
    if (document.getElementById("stFixButton")) return;

    const btn = document.createElement("button");
    btn.id = "stFixButton";
    btn.type = "button";
    btn.textContent = "🗑️ Delete";
    btn.style.cssText =
      "position:fixed;bottom:16px;right:16px;z-index:9998;padding:10px 14px;border-radius:999px;" +
      "background:#1b102e;color:#fda4af;border:1px solid rgba(244,63,94,0.6);font:700 12px/1 system-ui,sans-serif;" +
      "box-shadow:0 8px 24px rgba(0,0,0,0.45);cursor:pointer;";

    const overlay = document.createElement("div");
    overlay.id = "stFixOverlay";
    overlay.style.cssText =
      "display:none;position:fixed;inset:0;z-index:9999;background:rgba(8,4,15,0.82);backdrop-filter:blur(6px);" +
      "align-items:center;justify-content:center;padding:16px;font-family:system-ui,sans-serif;";

    overlay.innerHTML = `
      <div style="width:100%;max-width:440px;max-height:82vh;overflow:auto;background:#160d26;color:#fef3c7;border:1px solid rgba(244,63,94,0.35);border-radius:20px;padding:16px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <strong style="font-size:14px;color:#fda4af;">Delete Constellations & Nodes</strong>
          <button id="stFixClose" type="button" style="background:#2b1a4a;color:#fef3c7;border:none;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;">Close</button>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
          <button id="stFixDeleteChecked" type="button" style="background:#e11d48;color:#fff;border:none;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer;">Delete Checked</button>
          <button id="stFixDeleteAllC" type="button" style="background:#4c0519;color:#fecdd3;border:1px solid rgba(244,63,94,0.5);border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;cursor:pointer;">Delete All Constellations</button>
        </div>
        <div id="stFixConstellations" style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;"></div>
        <div style="font-size:11px;color:#fcd34d;margin-bottom:6px;font-weight:700;">Nodes</div>
        <div id="stFixNodes" style="display:flex;flex-direction:column;gap:6px;max-height:170px;overflow:auto;"></div>
      </div>
    `;

    let cListCache = [];
    let nListCache = [];

    function renderLists() {
      cListCache = readConstellations();
      nListCache = readNodes();

      overlay.querySelector("#stFixConstellations").innerHTML = cListCache.length
        ? cListCache
            .map(
              (c, idx) => `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#0e0819;padding:8px 10px;border-radius:12px;">
            <label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;flex:1;min-width:0;">
              <input type="checkbox" class="stf-c-box" value="${idx}">
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.name}</span>
            </label>
            <button type="button" data-del-one-c="${idx}" style="background:#be123c;color:#fff;border:none;border-radius:8px;padding:5px 9px;font-size:11px;font-weight:700;cursor:pointer;">Delete</button>
          </div>`
            )
            .join("")
        : `<div style="font-size:12px;color:#a1a1aa;">No constellations remaining</div>`;

      overlay.querySelector("#stFixNodes").innerHTML = nListCache.length
        ? nListCache
            .map(
              (n, idx) => `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:#0e0819;padding:6px 10px;border-radius:10px;font-size:11px;">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;flex:1;min-width:0;">
              <input type="checkbox" class="stf-n-box" value="${idx}">
              <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${n.name}</span>
            </label>
            <button type="button" data-del-one-n="${idx}" style="background:#3f3f46;color:#fff;border:none;border-radius:7px;padding:4px 8px;font-size:10px;font-weight:700;cursor:pointer;">Remove</button>
          </div>`
            )
            .join("")
        : `<div style="font-size:11px;color:#a1a1aa;">No nodes remaining</div>`;
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      renderLists();
      overlay.style.display = "flex";
    });

    overlay.querySelector("#stFixClose").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      overlay.style.display = "none";
    });

    overlay.addEventListener("click", (e) => {
      const cBtn = e.target.closest("[data-del-one-c]");
      if (cBtn) {
        e.preventDefault();
        e.stopPropagation();
        const target = cListCache[Number(cBtn.getAttribute("data-del-one-c"))];
        if (target) deleteConstellations([target]);
        renderLists();
        return;
      }

      const nBtn = e.target.closest("[data-del-one-n]");
      if (nBtn) {
        e.preventDefault();
        e.stopPropagation();
        const target = nListCache[Number(nBtn.getAttribute("data-del-one-n"))];
        if (target) deleteNodes([target]);
        renderLists();
      }
    });

    overlay.querySelector("#stFixDeleteChecked").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const checkedC = [...overlay.querySelectorAll(".stf-c-box:checked")]
        .map((el) => cListCache[Number(el.value)])
        .filter(Boolean);
      const checkedN = [...overlay.querySelectorAll(".stf-n-box:checked")]
        .map((el) => nListCache[Number(el.value)])
        .filter(Boolean);
      if (checkedC.length) deleteConstellations(checkedC);
      if (checkedN.length) deleteNodes(checkedN);
      renderLists();
    });

    overlay.querySelector("#stFixDeleteAllC").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (cListCache.length) deleteConstellations(cListCache);
      renderLists();
    });

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountDeleteUI);
  } else {
    mountDeleteUI();
  }
})();
