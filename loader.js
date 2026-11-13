(function loadSkillTreeModules() {
  const v = Date.now();
  const files = [
    "trees.js",
    "app.js",
    "trees-expanded.js",
    "tree-stretching.js.",
    "patch-nodes.js",
    "patch-tree-render.js",
    "patch-admin.js",
    "patch-ux.js",
    "patch-zoom.js",
    "patch-blueprint-viewer.js",
    "patch-ai-builder.js",
    "patch-search.js",
    "patch-private-share.js",
    "patch-cosmos-tree.js",
    "patch-architect-hub.js",
    "patch-ui-bridge.js"
  ];
  function next(i) {
    if (i >= files.length) return;
    const s = document.createElement("script");
    s.src = `${files[i]}?v=${v}`;
    s.onload = () => next(i + 1);
    s.onerror = () => next(i + 1);
    document.body.appendChild(s);
  }
  next(0);
})();
