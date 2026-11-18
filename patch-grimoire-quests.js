(function installGrimoireNebulaAndLexicon150() {
  const GRIM_KEY = "skilltree_grimoire_v1", SCRATCH_KEY = "skilltree_scratch_v1";

  window.getGrimoireSet = () => { try { return new Set(JSON.parse(localStorage.getItem(GRIM_KEY) || "[]")); } catch { return new Set(); } };
  window.markGrimoireUnlocked = (tid, title) => {
    const s = window.getGrimoireSet(); s.add(`${tid}::${title}`); s.add(`*::${title}`);
    localStorage.setItem(GRIM_KEY, JSON.stringify([...s]));
  };
  window.isGrimoireUnlocked = (tid, title) => { const s = window.getGrimoireSet(); return s.has(`${tid}::${title}`) || s.has(`*::${title}`); };

  function ensureGrandNebulaAndLexicon() {
    // 1. Auto-create flagship Grand Nebula in user's constellations if missing
    if (typeof userData !== "undefined" && Array.isArray(userData?.trees)) {
      if (!userData.trees.some(t => t.id === "grand_nebula_master" || t.title.includes("Grand Nebula"))) {
        userData.trees.unshift({
          id: "grand_nebula_master", title: "🌌 The Grand Nebula", attr: "WIS",
          nodes: [{ id: "neb_core_1", parentIdx: -1, parentId: null, title: "Origin Spark: Lifelong Mastery", status: "mastered", tier: "Core • 📖 Reading Node", icon: "🌌", color: "#38bdf8", x: 50, y: 38, notes: "Your unified life constellation. Harvest any skill from The Server Realm or Private Vault into The Grand Nebula to grow category spines across STR, DEX, CON, INT, WIS, and CHA.", steps: [] }]
        });
        if (typeof renderTrees === "function") renderTrees();
      }
    }

    // 2. Inject 150-Node Lexicon & Abstract Vocabulary Atlas into Server Realm
    if (typeof baseConceptTrees !== "undefined" && Array.isArray(baseConceptTrees) && !baseConceptTrees.some(t => t.id === "b_lexicon_150")) {
      const cats = [
        ["Branch I • Everyday Clarity", "WIS", ["Candid","Concise","Prudent","Tenacious","Lucid","Adept","Pragmatic","Resilient","Astute","Diligent","Tangible","Cohesive","Versatile","Methodical","Alacrity","Bolster","Discern","Frugal","Impartial","Mitigate","Nuance","Plausible","Rectify","Scrutinize","Steadfast","Tactful","Unwavering","Viable","Zeal","Zenith"]],
        ["Branch II • Precision & Nuance", "INT", ["Ambiguous","Catalyst","Dichotomy","Empirical","Fastidious","Gregarious","Hegemony","Idiosyncrasy","Juxtapose","Kinetic","Latent","Magnanimous","Nebulous","Ostensible","Paradigm","Quintessential","Reciprocal","Salient","Tacit","Ubiquitous","Vacillate","Wary","Axiomatic","Capricious","Deference","Erudite","Fortuitous","Harbinger","Immutable","Laconic"]],
        ["Branch III • Rhetoric & Persuasion", "CHA", ["Eloquent","Cogent","Conciliatory","Didactic","Emphatic","Facetious","Galvanize","Incisive","Magniloquent","Nonchalant","Orator","Polemic","Rhetoric","Succinct","Trenchant","Urbane","Verbose","Wry","Affable","Bellicose","Circumspect","Disarming","Euphemism","Fervent","Grandiloquent","Insinuate","Jovial","Loquacious","Mollify","Plaudit"]],
        ["Branch IV • Systems & Philosophy", "INT", ["Stoicism","Epistemology","Teleology","Ontology","Heuristic","Entropy","Synergy","Equanimity","Eudaimonia","Dialectic","Autonomy","Catharsis","Determinism","Empiricism","Fallacy","Gestalt","Hegelian","Intrinsic","Logos","Metaphysics","Nihilism","Occam's Razor","Paradox","Praxis","Reductionism","Solipsism","Syllogism","Zeitgeist","Amor Fati","Phronesis"]],
        ["Branch V • Rare & Abstract Mastery", "WIS", ["Ephemeral","Perspicacious","Ineffable","Equivocate","Obfuscate","Panacea","Recondite","Sagacious","Sanguine","Serendipity","Superfluous","Sycophant","Transient","Vicarious","Verisimilitude","Abnegation","Acumen","Anachronism","Apotheosis","Cognizant","Conundrum","Deleterious","Ebullient","Esoteric","Exacerbate","Inexorable","Magnanimity","Mellifluous","Pulchritude","Sesquipedalian"]]
      ];
      const nodes = [];
      cats.forEach(([cat, attr, words]) => {
        let prev = -1;
        words.forEach((w, i) => {
          const idx = nodes.length, num = idx + 1, isQuest = i % 3 === 2;
          nodes.push({
            parentIdx: prev, title: `${num}. ${w}`,
            tier: `${cat} • ${isQuest ? "⚔ Quest Node" : "📖 Reading Node"}`,
            icon: isQuest ? "⚔" : "📖", color: isQuest ? "#f59e0b" : "#38bdf8",
            tags: ["vocabulary", "lexicon", attr.toLowerCase()],
            notes: `LEXICON ENTRY #${num}: "${w}"\nCATEGORY: ${cat}\nMASTERY RULE: ${isQuest ? "Complete the active usage quest below to illuminate this star." : "Read and internalize this concept, then tap Illuminate."}${i > 0 ? `\nPREREQUISITE: Unlock #${num - 1} (${words[i - 1]}) first.` : ""}`,
            steps: isQuest ? [{ text: `Use "${w}" accurately in a real sentence or field note`, done: false }, ...(i > 0 ? [{ text: `Prerequisite: Unlock #${num - 1} (${words[i - 1]})`, done: false }] : [])] : []
          });
          prev = idx;
        });
      });
      baseConceptTrees.unshift({ id: "b_lexicon_150", attr: "WIS", tag: "Concept", nsfw: false, tags: ["vocabulary", "lexicon", "150-atlas"], title: "The Grand Lexicon: 150 Words (Beginner → Abstract)", author: "Architect", likes: 0, nodes });
    }
  }

  window.harvestIntoGrandNebula = async function(nodeObj, catName = "General", attr = "WIS") {
    if (typeof userData === "undefined" || !Array.isArray(userData?.trees)) return;
    let neb = userData.trees.find(t => t.id === "grand_nebula_master" || t.title.includes("Grand Nebula"));
    if (!neb) { neb = { id: "grand_nebula_master", title: "🌌 The Grand Nebula", attr: "WIS", nodes: [] }; userData.trees.unshift(neb); }
    const spine = `${attr} • ${catName}`;
    const same = neb.nodes.map((n, i) => ({ n, i })).filter(x => x.n.tier?.startsWith(spine));
    const pIdx = same.length ? same[same.length - 1].i : (neb.nodes.length ? 0 : -1);
    neb.nodes.push({
      id: `neb_${Date.now()}`, parentIdx: pIdx, parentId: pIdx >= 0 ? neb.nodes[pIdx].id : null,
      title: nodeObj.title, status: "learning", tier: `${spine} • Harvested`, icon: nodeObj.icon || "✦", color: nodeObj.color || "#38bdf8",
      x: 50, y: 50, notes: nodeObj.notes || "", steps: (nodeObj.steps || []).map(s => ({ text: s.text || s, done: false })), links: nodeObj.links || []
    });
    window.computeOrganicTreePositions?.(neb.nodes, Date.now());
    await saveUserData?.();
    renderTrees?.();
    alert(`Added "${nodeObj.title}" to [${spine}] inside 🌌 The Grand Nebula!`);
  };

  window.openFullQuestBoard = function() {
    let m = document.getElementById("questBoardModal");
    if (!m) { m = document.createElement("div"); m.id = "questBoardModal"; m.className = "fixed inset-0 z-50 bg-slate-950 flex flex-col p-4 overflow-y-auto"; document.body.appendChild(m); }
    let scratch = {}; try { scratch = JSON.parse(localStorage.getItem(SCRATCH_KEY) || "{}"); } catch {}
    const trees = (typeof userData !== "undefined" && Array.isArray(userData?.trees)) ? userData.trees : [];
    const quests = [];
    trees.forEach(t => (t.nodes || []).forEach((n, idx) => { if (n.status === "learning") quests.push({ t, n, idx }); }));

    m.innerHTML = `<div class="max-w-md mx-auto w-full space-y-3 pb-8"><div class="flex justify-between items-center border-b border-sky-500/30 pb-2.5"><div><h2 class="text-lg font-black text-sky-400 skyrim-font">🎯 ACTIVE QUEST BOARD</h2><div class="text-[11px] text-slate-400">${quests.length} Active Quests & Reading Nodes</div></div><div class="flex gap-1.5"><button id="qbSparkBtn" class="px-2.5 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">🎲 Next Spark</button><button id="qbCloseBtn" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button></div></div>${quests.length ? quests.map(q => `<div class="glass-panel rounded-xl p-3 space-y-2"><div class="flex justify-between items-start gap-2"><div><div class="text-[10px] font-bold text-amber-300 uppercase">${q.t.title}</div><div class="text-sm font-bold text-white">${q.n.title}</div></div><button data-done="${q.t.id}|${q.idx}" class="px-2.5 py-1 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-black">✨ Complete</button></div><textarea data-sc="${q.t.id}_${q.n.id}" rows="2" placeholder="Private quest scratchpad: jot progress or reminders..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none">${scratch[`${q.t.id}_${q.n.id}`] || ""}</textarea></div>`).join("") : `<div class="glass-panel rounded-xl p-6 text-center text-xs text-slate-400">No active quests yet! Tap <b>🎲 Next Spark</b> to pull your next skill to train.</div>`}</div>`;
    m.classList.remove("hidden");
    document.getElementById("qbCloseBtn").onclick = () => m.classList.add("hidden");
    m.querySelectorAll("textarea[data-sc]").forEach(ta => ta.oninput = () => { scratch[ta.dataset.sc] = ta.value; localStorage.setItem(SCRATCH_KEY, JSON.stringify(scratch)); });
    m.querySelectorAll("button[data-done]").forEach(b => b.onclick = async () => {
      const [tid, idx] = b.dataset.done.split("|"), t = trees.find(x => x.id === tid);
      if (t?.nodes[Number(idx)]) { t.nodes[Number(idx)].status = "mastered"; window.markGrimoireUnlocked(t.id, t.nodes[Number(idx)].title); await saveUserData?.(); window.openFullQuestBoard(); }
    });
    document.getElementById("qbSparkBtn").onclick = async () => {
      for (const t of trees) { const next = (t.nodes || []).find(n => n.status === "locked"); if (next) { next.status = "learning"; await saveUserData?.(); window.openFullQuestBoard(); return; } }
      alert("All nodes are already active or mastered!");
    };
  };

  setInterval(ensureGrandNebulaAndLexicon, 700);
})();
