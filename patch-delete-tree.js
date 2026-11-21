(function installTreeDelete() {
  function mountDeleteBtn() {
    const addNodeBtn = document.getElementById("addNodeBtn");
    const toolbarGroup = addNodeBtn?.parentElement;
    if (!toolbarGroup || document.getElementById("deleteTreeBtn")) return;

    const delBtn = document.createElement("button");
    delBtn.id = "deleteTreeBtn";
    delBtn.type = "button";
    delBtn.textContent = "🗑️";
    delBtn.title = "Delete Active Constellation";
    delBtn.className = "px-2 py-1 bg-rose-950/90 border border-rose-500/50 text-rose-200 rounded text-xs font-bold";

    delBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (typeof userTrees === "undefined" || !Array.isArray(userTrees) || !userTrees.length) return;
      const idx = typeof selectedTree === "number" ? selectedTree : 0;
      const target = userTrees[idx];
      if (!target) return;

      const name = target.name || target.title || `Constellation #${idx + 1}`;
      if (!confirm(`Delete "${name}" permanently?`)) return;

      userTrees.splice(idx, 1);

      if (typeof selectedTree !== "undefined") {
        selectedTree = Math.max(0, Math.min(idx, userTrees.length - 1));
      }

      if (typeof saveUserData === "function") {
        await saveUserData();
      } else {
        try {
          localStorage.setItem("skillTreeUserTrees", JSON.stringify(userTrees));
        } catch {}
      }

      if (typeof renderTreeSelector === "function") renderTreeSelector();
      if (typeof updateHeaderStats === "function") updateHeaderStats();

      if (!userTrees.length) {
        document.getElementById("activeTreeWorkspace")?.classList.add("hidden");
        document.getElementById("emptyTreeBanner")?.classList.remove("hidden");
      } else if (typeof drawConstellation === "function") {
        drawConstellation();
      }
    });

    toolbarGroup.appendChild(delBtn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountDeleteBtn);
  } else {
    mountDeleteBtn();
  }
  setTimeout(mountDeleteBtn, 800);
})();