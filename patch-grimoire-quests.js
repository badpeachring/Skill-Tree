(function installGrimoireNebulaAndLexicon150() {
  const GRIM_KEY = "skilltree_grimoire_v1", SCRATCH_KEY = "skilltree_scratch_v1", DELETED_IDS_KEY = "skilltree_deleted_trees_v1";

  const getDeletedSet = () => { try { return new Set(JSON.parse(localStorage.getItem(DELETED_IDS_KEY) || "[]")); } catch { return new Set(); } };
  window.markTreeDeletedPermanently = (id, title) => {
    const s = getDeletedSet(); if (id) s.add(id); if (title) s.add(title);
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify([...s]));
  };

  // Intercept Firestore writes so app.js never resurrects deleted trees
  if (typeof firebase !== "undefined" && firebase.firestore?.DocumentReference) {
    const origSet = firebase.firestore.DocumentReference.prototype.set;
    firebase.firestore.DocumentReference.prototype.set = function(data, opts) {
      if (data && Array.isArray(data.trees)) {
        const del = getDeletedSet();
        data.trees = data.trees.filter(t => !del.has(t.id) && !del.has(t.title));
      }
      return origSet.call(this, data, opts);
    };
  }

  window.getGrimoireSet = () => { try { return new Set(JSON.parse(localStorage.getItem(GRIM_KEY) || "[]")); } catch { return new Set(); } };
  window.markGrimoireUnlocked = (tid, title) => {
    const s = window.getGrimoireSet(); s.add(`${tid}::${title}`); s.add(`*::${title}`);
    localStorage.setItem(GRIM_KEY, JSON.stringify([...s]));
  };
  window.isGrimoireUnlocked = (tid, title) => { const s = window.getGrimoireSet(); return s.has(`${tid}::${title}`) || s.has(`*::${title}`); };

  async function initNebulaAndLexicon() {
    // 1. Create Grand Nebula via native createNewTree so app.js renders & syncs it natively
    const sel = document.getElementById("treeSelect");
    const hasNebulaDom = sel && [...sel.options].some(o => (o.text || "").includes("Grand Nebula"));
    if (!hasNebulaDom && typeof createNewTree === "function" && !window._nebulaCreating) {
      window._nebulaCreating = true;
      try {
        await createNewTree("🌌 The Grand Nebula", "WIS", [{
          id: "neb_core_1", parentIdx: -1, parentId: null, title: "Origin Spark: Lifelong Mastery", status: "mastered",
          tier: "Core • 📖 Reading Node", icon: "🌌", color: "#38bdf8", x: 50, y: 38,
          notes: "Your unified life constellation. Harvest any skill from The Server Realm or Private Vault into The Grand Nebula to grow category spines across STR, DEX, CON, INT, WIS, and CHA.",
          steps: [], links: []
        }]);
      } catch {}
      window._nebulaCreating = false;
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
            notes: `LEXICON ENTRY #${num}: "${w}"\nCATEGORY: ${cat}\nMASTERY RULE: ${isQuest ? "Use this word accurately in a sentence or field note to unlock." : "Read and internalize this concept, then tap Illuminate."}${i > 0 ? `\nPREREQUISITE: Unlock #${num - 1} (${words[i - 1]}) first.` : ""}`,
            steps: isQuest ? [{ text: `Use "${w}" in an original sentence or field note`, done: false }] : []
          });
          prev = idx;
        });
      });
      baseConceptTrees.unshift({ id: "b_lexicon_150", attr: "WIS", tag: "Concept", nsfw: false, tags: ["vocabulary", "lexicon", "150-atlas"], title: "The Grand Lexicon: 150 Words (Beginner → Abstract)", author: "Architect", likes: 0, nodes });
    }
  }

  window.harvestIntoGrandNebula = async function(nodeObj, catName = "General", attr = "WIS") {
    if (typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
      const uid = firebase.auth().currentUser.uid;
      const doc = await db.collection("users").doc(uid).get();
      const data = doc.exists ? doc.data() : { trees: [] };
      const trees = data.trees || [];
      let neb = trees.find(t => (t.title || "").includes("Grand Nebula"));
      if (!neb) {
        neb = { id: `neb_${Date.now()}`, title: "🌌 The Grand Nebula", attr: "WIS", nodes: [{ id: "neb_core_1", parentIdx: -1, parentId: null, title: "Origin Spark", status: "mastered", tier: "Core", icon: "🌌", color: "#38bdf8", x: 50, y: 38, notes: "", steps: [], links: [] }] };
        trees.unshift(neb);
      }
      const spine = `${attr} • ${catName}`;
      const same = neb.nodes.map((n, i) => ({ n, i })).filter(x => x.n.tier?.startsWith(spine));
      const pIdx = same.length ? same[same.length - 1].i : 0;
      neb.nodes.push({
        id: `neb_${Date.now()}_${Math.floor(Math.random() * 99)}`, parentIdx: pIdx, parentId: neb.nodes[pIdx]?.id || null,
        title: nodeObj.title, status: "learning", tier: `${spine} • Harvested`, icon: nodeObj.icon || "✦", color: nodeObj.color || "#38bdf8",
        x: 50, y: 50, notes: nodeObj.notes || "", steps: (nodeObj.steps || []).map(s => ({ text: s.text || s, done: false })), links: nodeObj.links || []
      });
      window.computeOrganicTreePositions?.(neb.nodes, Date.now());
      await db.collection("users").doc(uid).set({ trees }, { merge: true });
      alert(`Added "${nodeObj.title}" to [${spine}] inside 🌌 The Grand Nebula!`);
    }
  };

  window.openFullQuestBoard = async function() {
    let m = document.getElementById("questBoardModal");
    if (!m) { m = document.createElement("div"); m.id = "questBoardModal"; m.className = "fixed inset-0 z-50 bg-slate-950 flex flex-col p-4 overflow-y-auto"; document.body.appendChild(m); }
    let scratch = {}; try { scratch = JSON.parse(localStorage.getItem(SCRATCH_KEY) || "{}"); } catch {}
    let trees = [];
    if (typeof firebase !== "undefined" && firebase.auth?.().currentUser && typeof db !== "undefined" && db) {
      try { const doc = await db.collection("users").doc(firebase.auth().currentUser.uid).get(); if (doc.exists) trees = doc.data()?.trees || []; } catch {}
    }
    const quests = [];
    trees.forEach(t => (t.nodes || []).forEach((n, idx) => { if (n.status === "learning") quests.push({ t, n, idx }); }));

    m.innerHTML = `<div class="max-w-md mx-auto w-full space-y-3 pb-8"><div class="flex justify-between items-center border-b border-sky-500/30 pb-2.5"><div><h2 class="text-lg font-black text-sky-400 skyrim-font">🎯 ACTIVE QUEST BOARD</h2><div class="text-[11px] text-slate-400">${quests.length} Active Quests & Reading Nodes</div></div><div class="flex gap-1.5"><button id="qbSparkBtn" type="button" class="px-2.5 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">🎲 Next Spark</button><button id="qbCloseBtn" type="button" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button></div></div>${quests.length ? quests.map(q => `<div class="glass-panel rounded-xl p-3 space-y-2"><div class="flex justify-between items-start gap-2"><div><div class="text-[10px] font-bold text-amber-300 uppercase">${q.t.title}</div><div class="text-sm font-bold text-white">${q.n.title}</div></div><button type="button" data-done="${q.t.id}|${q.idx}" class="px-2.5 py-1 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-black">✨ Complete</button></div><textarea data-sc="${q.t.id}_${q.n.id}" rows="2" placeholder="Private quest scratchpad: jot progress or reminders..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none">${scratch[`${q.t.id}_${q.n.id}`] || ""}</textarea></div>`).join("") : `<div class="glass-panel rounded-xl p-6 text-center text-xs text-slate-400 space-y-2"><p>No active quests yet! Set any node to <b>Training</b> inside My Constellations, or tap <b>🎲 Next Spark</b> above to pull your next skill.</p></div>`}</div>`;
    m.classList.remove("hidden");
    document.getElementById("qbCloseBtn").onclick = () => m.classList.add("hidden");
    m.querySelectorAll("textarea[data-sc]").forEach(ta => ta.oninput = () => { scratch[ta.dataset.sc] = ta.value; localStorage.setItem(SCRATCH_KEY, JSON.stringify(scratch)); });
    m.querySelectorAll("button[data-done]").forEach(b => b.onclick = async () => {
      const [tid, idx] = b.dataset.done.split("|"), t = trees.find(x => x.id === tid);
      if (t?.nodes[Number(idx)] && typeof db !== "undefined" && firebase.auth?.().currentUser) {
        t.nodes[Number(idx)].status = "mastered";
        window.markGrimoireUnlocked(t.id, t.nodes[Number(idx)].title);
        await db.collection("users").doc(firebase.auth().currentUser.uid).set({ trees }, { merge: true });
        window.openFullQuestBoard();
      }
    });
    document.getElementById("qbSparkBtn").onclick = async () => {
      for (const t of trees) {
        const next = (t.nodes || []).find(n => n.status === "locked");
        if (next && typeof db !== "undefined" && firebase.auth?.().currentUser) {
          next.status = "learning";
          await db.collection("users").doc(firebase.auth().currentUser.uid).set({ trees }, { merge: true });
          window.openFullQuestBoard();
          return;
        }
      }
      alert("Create or copy a tree first so you have skills to train!");
    };
  };

  setInterval(initNebulaAndLexicon, 1200);
})();
