(() => {
  if (window.__stDeleteFixV4) return;
  window.__stDeleteFixV4 = true;

  const DEL_C_KEY = "st_deleted_constellations_v1";
  const DEL_N_KEY = "st_deleted_nodes_v1";

  const clone = (v) => {
    try {
      return typeof structuredClone === "function" ? structuredClone(v) : JSON.parse(JSON.stringify(v));
    } catch {
      return v;
    }
  };

  const getId = (o) =>
    o && typeof o === "object"
      ? String(o.id ?? o.constellationId ?? o.nodeId ?? o.key ?? o.slug ?? "")
      : "";

  const getName = (o) =>
    o && typeof o === "object" ? String(o.name ?? o.title ?? o.label ?? "") : "";

  function readSet(key) {
    try {
      const arr = JSON.parse(localStorage.getItem(key) || "[]");
      return new Set(Array.isArray(arr) ? arr.map(String) : []);
    } catch {
      return new Set();
    }
  }

  function writeSet(key, setObj) {
    try {
      localStorage.setItem(key, JSON.stringify([...setObj]));
    } catch {}
  }

  function cleanStoreObject(obj) {
    if (!obj || typeof obj !== "object") return obj;
    const delC = readSet(DEL_C_KEY);
    const delN = readSet(DEL_N_KEY);
    const removedNodeIds = new Set(delN);

    const matchesConstellation = (c, mapKey = "") => {
      const id = getId(c);
      const name = getName(c);
      return (
        (mapKey && delC.has(String(mapKey))) ||
        (id && delC.has(id)) ||
        (name && delC.has(name))
      );
    };

    if (Array.isArray(obj.constellations)) {
      obj.constellations = obj.constellations.filter((c) => {
        const hit = matchesConstellation(c);
        if (hit && Array.isArray(c?.nodes)) {
          c.nodes.forEach((n) => {
            const nid = getId(n);
            if (nid) removedNodeIds.add(nid);
          });
        }
        return !hit;
      });
    } else if (obj.constellations && typeof obj.constellations === "object") {
      for (const [k, c] of Object.entries(obj.constellations)) {
        if (matchesConstellation(c, k)) {
          if (Array.isArray(c?.nodes)) {
            c.nodes.forEach((n) => {
              const nid = getId(n);
              if (nid) removedNodeIds.add(nid);
            });
          }
          delete obj.constellations[k];
        }
      }
    }

    if (Array.isArray(obj.nodes)) {
      obj.nodes = obj.nodes.filter((n) => {
        const nid = getId(n);
        const nname = getName(n);
        const cid = String(n?.constellationId ?? n?.constellation ?? n?.group ?? "");
        return !removedNodeIds.has(nid) && !delN.has(nname) && !delC.has(cid);
      });
    }

    for (const ek of ["edges", "links", "connections"]) {
      if (Array.isArray(obj[ek])) {
        obj[ek] = obj[ek].filter((e) => {
          const cid = String(e?.constellationId ?? e?.constellation ?? "");
          const s = String(e?.source ?? e?.from ?? e?.sourceId ?? "");
          const t = String(e?.target ?? e?.to ?? e?.targetId ?? "");
          return !delC.has(cid) && !removedNodeIds.has(s) && !removedNodeIds.has(t);
        });
      }
    }

    const remaining = Array.isArray(obj.constellations)
      ? obj.constellations
      : obj.constellations && typeof obj.constellations === "object"
      ? Object.entries(obj.constellations).map(([id, v]) => ({ id, ...v }))
      : [];
    const fallbackId = remaining.length ? getId(remaining[0]) : null;

    for (const ak of ["activeConstellationId", "selectedConstellationId", "currentConstellationId"]) {
      if (ak in obj && (!obj[ak] || delC.has(String(obj[ak])))) {
        obj[ak] = fallbackId;
      }
    }

    return obj;
  }

  function scrubEverything() {
    // 1. Clean localStorage entries
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === DEL_C_KEY || k === DEL_N_KEY) continue;
      try {
        const raw = localStorage.getItem(k);
        if (!raw || (!raw.includes("constellations") && !raw.includes("nodes"))) continue;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const next = cleanStoreObject(clone(parsed));
          const serialized = JSON.stringify(next);
          if (serialized !== raw) {
            writeWithoutGuard(k, serialized);
          }
        }
      } catch {}
    }

    // 2. Clean any state objects attached to window
    for (const prop of ["appState", "skillTreeState", "state", "treeState"]) {
      if (window[prop] && typeof window[prop] === "object") {
        cleanStoreObject(window[prop]);
      }
    }
  }

  const nativeSetItem = localStorage.setItem.bind(localStorage);
  let guarding = false;

  function writeWithoutGuard(key, val) {
    guarding = true;
    try {
      nativeSetItem(key, val);
    } finally {
      guarding = false;
    }
  }

  localStorage.setItem = function (key, value) {
    nativeSetItem(key, value);
    if (guarding || key === DEL_C_KEY || key === DEL_N_KEY) return;
    try {
      if (typeof value === "string" && (value.includes("constellations") || value.includes("nodes"))) {
        const parsed = JSON.parse(value);
        if (parsed && typeof parsed === "object") {
          const cleaned = cleanStoreObject(clone(parsed));
          const out = JSON.stringify(cleaned);
          if (out !== value) writeWithoutGuard(key, out);
        }
      }
    } catch {}
  };

  function collectConstellations() {
    const out = [];
    const seen = new Set();
    const delC = readSet(DEL_C_KEY);

    const pushItem = (c, idx) => {
      if (!c || typeof c !== "object") return;
      const id = getId(c) || `c_${idx}`;
      const name = getName(c) || `Constellation ${idx + 1}`;
      if (delC.has(id) || delC.has(name)) return;
      const key = `${id}::${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ id, name });
    };

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === DEL_C_KEY || k === DEL_N_KEY) continue;
      try {
        const p = JSON.parse(localStorage.getItem(k));
        if (!p || typeof p !== "object") continue;
        if (Array.isArray(p.constellations)) p.constellations.forEach(pushItem);
        else if (p.constellations && typeof p.constellations === "object") {
          Object.entries(p.constellations).forEach(([id, v], idx) => pushItem({ id, ...v }, idx));
        }
      } catch {}
    }

    for (const prop of ["appState", "skillTreeState", "state", "treeState"]) {
      const p = window[prop];
      if (!p || typeof p !== "object") continue;
      if (Array.isArray(p.constellations)) p.constellations.forEach(pushItem);
      else if (p.constellations && typeof p.constellations === "object") {
        Object.entries(p.constellations).forEach(([id, v], idx) => pushItem({ id, ...v }, idx));
      }
    }

    return out;
  }

  function collectNodes() {
    const out = [];
    const seen = new Set();
    const delN = readSet(DEL_N_KEY);
    const delC = readSet(DEL_C_KEY);

    const pushNode = (n, idx) => {
      if (!n || typeof n !== "object") return;
      const id = getId(n) || `n_${idx}`;
      const name = getName(n) || `Node ${idx + 1}`;
      const cid = String(n?.constellationId ?? n?.constellation ?? n?.group ?? "");
      if (delN.has(id) || delN.has(name) || delC.has(cid)) return;
      const key = `${id}::${name}`;
      if (seen.has(key)) return;
      seen.add(key);
      out.push({ id, name });
    };

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || k === DEL_C_KEY || k === DEL_N_KEY) continue;
      try {
        const p = JSON.parse(localStorage.getItem(k));
        if (p && typeof p === "object" && Array.isArray(p.nodes)) p.nodes.forEach(pushNode);
      } catch {}
    }

    for (const prop of ["appState", "skillTreeState", "state", "treeState"]) {
      const p = window[prop];
      if (p && typeof p === "object" && Array.isArray(p.nodes)) p.nodes.forEach(pushNode);
    }

    return out;
  }

  function removeConstellationTargets(targets) {
    const delC = readSet(DEL_C_KEY);
    targets.forEach((t) => {
      if (t?.id) delC.add(String(t.id));
      if (t?.name) delC.add(String(t.name));
    });
    writeSet(DEL_C_KEY, delC);
    scrubEverything();
    window.dispatchEvent(new CustomEvent("skilltree:updated"));
  }

  function removeNodeTargets(targets) {
    const delN = readSet(DEL_N_KEY);
    targets.forEach((t) => {
      if (t?.id) delN.add(String(t.id));
      if (t?.name) delN.add(String(t.name));
    });
    writeSet(DEL_N_KEY, delN);
    scrubEverything();
    window.dispatchEvent(new CustomEvent("skilltree:updated"));
  }

  function mountUI() {
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

    let cCache = [];
    let nCache = [];

    function draw() {
      cCache = collectConstellations();
      nCache = collectNodes();

      overlay.querySelector("#stFixConstellations").innerHTML = cCache.length
        ? cCache
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

      overlay.querySelector("#stFixNodes").innerHTML = nCache.length
        ? nCache
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
      draw();
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
        const item = cCache[Number(cBtn.getAttribute("data-del-one-c"))];
        if (item) removeConstellationTargets([item]);
        draw();
        return;
      }

      const nBtn = e.target.closest("[data-del-one-n]");
      if (nBtn) {
        e.preventDefault();
        e.stopPropagation();
        const item = nCache[Number(nBtn.getAttribute("data-del-one-n"))];
        if (item) removeNodeTargets([item]);
        draw();
      }
    });

    overlay.querySelector("#stFixDeleteChecked").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const cSel = [...overlay.querySelectorAll(".stf-c-box:checked")]
        .map((el) => cCache[Number(el.value)])
        .filter(Boolean);
      const nSel = [...overlay.querySelectorAll(".stf-n-box:checked")]
        .map((el) => nCache[Number(el.value)])
        .filter(Boolean);
      if (cSel.length) removeConstellationTargets(cSel);
      if (nSel.length) removeNodeTargets(nSel);
      draw();
    });

    overlay.querySelector("#stFixDeleteAllC").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (cCache.length) removeConstellationTargets(cCache);
      draw();
    });

    document.body.appendChild(btn);
    document.body.appendChild(overlay);
  }

  scrubEverything();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountUI);
  } else {
    mountUI();
  }
})();
