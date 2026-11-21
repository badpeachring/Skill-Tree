(() => {
  if (window.__skillTreeDiagLoaded) return;
  window.__skillTreeDiagLoaded = true;

  const runtimeErrors = [];
  window.addEventListener("error", (e) => {
    runtimeErrors.push(`${e.message} (${e.filename?.split("/").pop() || "inline"}:${e.lineno || 0})`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    runtimeErrors.push(`Promise rejection: ${e.reason?.message || String(e.reason)}`);
  });

  async function runDiagnostics() {
    const lines = [];
    lines.push(`=== SKILL-TREE DIAGNOSTIC (${new Date().toLocaleTimeString()}) ===`);
    lines.push(`URL: ${location.href}`);

    // 1. Check loaded scripts & 404s
    const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src"));
    lines.push(`\n[1] SCRIPTS (${scripts.length}):`);
    for (const src of scripts) {
      try {
        const res = await fetch(src, { cache: "no-store" });
        lines.push(`  - ${src} -> HTTP ${res.status}`);
      } catch (err) {
        lines.push(`  - ${src} -> FETCH ERROR (${err.message})`);
      }
    }

    // 2. Check Service Workers
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      lines.push(`\n[2] SERVICE WORKERS: ${regs.length}`);
      regs.forEach((r) => lines.push(`  - scope: ${r.scope} | active: ${Boolean(r.active)}`));
    }

    // 3. Check localStorage keys & structure
    lines.push(`\n[3] LOCALSTORAGE KEYS (${localStorage.length}):`);
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const raw = localStorage.getItem(k) || "";
      let summary = `len=${raw.length}`;
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const keys = Object.keys(parsed).slice(0, 8);
          summary += ` | keys=[${keys.join(", ")}]`;
          if (Array.isArray(parsed.constellations)) summary += ` | constellations=${parsed.constellations.length}`;
          if (Array.isArray(parsed.trees)) summary += ` | trees=${parsed.trees.length}`;
          if (Array.isArray(parsed.nodes)) summary += ` | nodes=${parsed.nodes.length}`;
        }
      } catch {}
      lines.push(`  - "${k}": ${summary}`);
    }

    // 4. Inspect candidate Delete buttons in DOM
    const buttons = [...document.querySelectorAll("button")].filter((b) => {
      const txt = (b.textContent || "").trim().toLowerCase();
      const title = (b.getAttribute("title") || b.getAttribute("aria-label") || "").toLowerCase();
      return txt.includes("delete") || title.includes("delete") || b.className.toLowerCase().includes("delete");
    });
    lines.push(`\n[4] DELETE BUTTONS FOUND (${buttons.length}):`);
    buttons.forEach((b, idx) => {
      const parentForm = b.closest("form");
      lines.push(
        `  - #${idx + 1}: id="${b.id || "none"}" type="${b.type}" text="${(b.textContent || "").trim()}" ` +
        `inForm=${Boolean(parentForm)} onclick=${Boolean(b.onclick)} class="${String(b.className).slice(0, 60)}"`
      );
    });

    // 5. Runtime errors captured
    lines.push(`\n[5] RUNTIME ERRORS (${runtimeErrors.length}):`);
    if (!runtimeErrors.length) lines.push("  - None captured");
    else runtimeErrors.forEach((err) => lines.push(`  - ${err}`));

    return lines.join("\n");
  }

  function mountDiagChip() {
    if (document.getElementById("stDiagChip")) return;
    const chip = document.createElement("button");
    chip.id = "stDiagChip";
    chip.type = "button";
    chip.textContent = "🩺 Run Test";
    chip.style.cssText =
      "position:fixed;bottom:16px;left:16px;z-index:9998;padding:8px 12px;border-radius:999px;" +
      "background:#0f172a;color:#38bdf8;border:1px solid rgba(56,189,248,0.55);font:700 11px/1 system-ui,sans-serif;" +
      "box-shadow:0 6px 20px rgba(0,0,0,0.45);cursor:pointer;";

    const box = document.createElement("div");
    box.id = "stDiagModal";
    box.style.cssText =
      "display:none;position:fixed;inset:0;z-index:9999;background:rgba(5,8,18,0.85);backdrop-filter:blur(6px);" +
      "align-items:center;justify-content:center;padding:16px;font-family:monospace;";
    box.innerHTML = `
      <div style="width:100%;max-width:460px;background:#0b1120;color:#e2e8f0;border:1px solid rgba(56,189,248,0.4);border-radius:16px;padding:14px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:12px;color:#38bdf8;">Skill-Tree Code Health Check</strong>
          <div style="display:flex;gap:6px;">
            <button id="stDiagCopy" type="button" style="background:#0284c7;color:#fff;border:none;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;">Copy Report</button>
            <button id="stDiagClose" type="button" style="background:#1e293b;color:#cbd5e1;border:none;border-radius:6px;padding:4px 8px;font-size:11px;cursor:pointer;">Close</button>
          </div>
        </div>
        <textarea id="stDiagOut" readonly rows="14" style="width:100%;background:#020617;color:#a5f3fc;border:1px solid #1e293b;border-radius:10px;padding:8px;font-size:10px;line-height:1.4;"></textarea>
      </div>
    `;

    chip.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      box.style.display = "flex";
      const out = box.querySelector("#stDiagOut");
      out.value = "Running checks...";
      out.value = await runDiagnostics();
    });

    box.querySelector("#stDiagClose").addEventListener("click", () => {
      box.style.display = "none";
    });
    box.querySelector("#stDiagCopy").addEventListener("click", async () => {
      const text = box.querySelector("#stDiagOut").value;
      await navigator.clipboard.writeText(text);
      box.querySelector("#stDiagCopy").textContent = "Copied!";
    });

    document.body.appendChild(chip);
    document.body.appendChild(box);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountDiagChip);
  } else {
    mountDiagChip();
  }
})();
