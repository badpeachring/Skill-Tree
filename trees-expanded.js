(function installDeepConceptTrees() {
  if (typeof baseConceptTrees === "undefined") return;

  const deepTrees = [
    {
      id: "b1", attr: "STR", tag: "Concept", title: "Calisthenics & Bodyweight Mastery", author: "Architect Blueprint", likes: 48,
      nodes: [
        { title: "Scapular Control & Hollow Body", tier: "Tier I • Foundation", icon: "💪", color: "#38bdf8", notes: "Lock posterior pelvic tilt and scapular depression before loading leverage.", steps: [{ text: "60s hollow body hold (lower back glued to floor)", done: false }, { text: "3x12 scapular pull-ups with 2s pause", done: false }], links: [{ label: "Hollow Body Mechanics", url: "https://www.youtube.com/results?search_query=hollow+body+hold+calisthenics+form" }] },
        { title: "Strict Pull-Up & Dip Base", tier: "Tier I • Foundation", icon: "⚔", color: "#38bdf8", notes: "Full dead-hang to chest-to-bar pull-ups and 90-degree parallel bar dips.", steps: [{ text: "12 strict dead-hang pull-ups", done: false }, { text: "15 full-ROM parallel bar dips", done: false }], links: [] },
        { title: "L-Sit & Compression Strength", tier: "Tier II • Practitioner", icon: "⚡", color: "#f59e0b", notes: "Active hip-flexor compression and straight-arm scapular depression.", steps: [{ text: "20s floor L-sit with pointed toes", done: false }, { text: "3x10 seated pike leg lifts", done: false }], links: [] },
        { title: "Handstand Wall Alignment", tier: "Tier II • Practitioner", icon: "🧭", color: "#f59e0b", notes: "Chest-to-wall stacked line: wrists, shoulders, hips, and ankles aligned.", steps: [{ text: "45s chest-to-wall handstand hold", done: false }, { text: "Finger-tip heel-pull balance drills", done: false }], links: [] },
        { title: "Freestanding Handstand (30s)", tier: "Tier III • Specialist", icon: "★", color: "#22c55e", notes: "Consistent kick-up and micro-adjustments through the palms.", steps: [{ text: "3x30s freestanding handstand", done: false }], links: [] },
        { title: "Strict Muscle-Up Transition", tier: "Tier III • Specialist", icon: "🔥", color: "#22c55e", notes: "False-grip pull to sternum and fast forward chest turnover.", steps: [{ text: "5 strict bar or ring muscle-ups", done: false }], links: [] },
        { title: "Seated Press to Handstand", tier: "Tier IV • Grandmaster", icon: "👑", color: "#a855f7", notes: "Straddle or cross-legged compression lift into full vertical lockout without momentum.", steps: [{ text: "3 controlled straddle press reps", done: false }, { text: "1 seated press to freestanding hold", done: false }], links: [] },
        { title: "Front Lever & Planche Hold", tier: "Tier IV • Grandmaster", icon: "🏆", color: "#a855f7", notes: "Full horizontal straight-arm static mastery.", steps: [{ text: "10s full front lever", done: false }, { text: "8s straddle or full planche", done: false }], links: [] }
      ]
    },
    {
      id: "b2", attr: "INT", tag: "Concept", title: "Industrial Concrete & Coating Systems", author: "Architect Blueprint", likes: 39,
      nodes: [
        { title: "Moisture Vapor & Substrate Testing", tier: "Tier I • Foundation", icon: "🧭", color: "#38bdf8", notes: "Verify slab RH and surface profile before any primer touches concrete.", steps: [{ text: "Run non-destructive impedance & ASTM F2170 RH check", done: false }, { text: "Confirm ICRI CSP 2-3 mechanical profile", done: false }], links: [] },
        { title: "Diamond Grinding & HEPA Dust Control", tier: "Tier I • Foundation", icon: "⚙", color: "#38bdf8", notes: "Remove laitance, sealers, and high spots with matched diamond bond hardness.", steps: [{ text: "Match soft/hard metal bond to slab Mohs hardness", done: false }, { text: "Edge-grind perimeter with diamond cup wheel & shroud", done: false }], links: [] },
        { title: "Moisture-Mitigating Epoxy Primer", tier: "Tier II • Practitioner", icon: "🧪", color: "#f59e0b", notes: "Apply 100%-solids vapor barrier primer within recoat window.", steps: [{ text: "Mix A/B components at exact ratio & induction time", done: false }, { text: "Back-roll for uniform mil thickness without pinholes", done: false }], links: [] },
        { title: "Resilient Rubber & Seam Grouting", tier: "Tier III • Specialist", icon: "⚒", color: "#22c55e", notes: "Bond resilient matting and pack seams with granule-thickened polyurethane.", steps: [{ text: "Solvent-wipe contact surfaces & verify wet transfer", done: false }, { text: "Trowel-flush seams for seamless monolithic finish", done: false }], links: [] },
        { title: "Aliphatic Topcoat & Rebound QA", tier: "Tier IV • Grandmaster", icon: "🏆", color: "#a855f7", notes: "Spray UV-stable aliphatic wear coat and log impact rebound metrics.", steps: [{ text: "Apply uniform airless spray coats at target WFT", done: false }, { text: "Verify cure hardness and impact rebound consistency", done: false }], links: [] }
      ]
    }
  ];
    const moreTrees = [
    {
      id: "b3", attr: "WIS", tag: "Concept", title: "Culinary Arts: Smoke, Braise & Emulsion", author: "Architect Blueprint", likes: 44,
      nodes: [
        { title: "Knife Geometry & Mise en Place", tier: "Tier I • Foundation", icon: "⚔", color: "#38bdf8", notes: "Pinch grip, claw guide, uniform dice for even thermal transfer.", steps: [{ text: "15-degree honing & whetstone maintenance", done: false }, { text: "Consistent brunoise & mirepoix prep", done: false }], links: [] },
        { title: "Thermal Control & Maillard Sear", tier: "Tier I • Foundation", icon: "🔥", color: "#38bdf8", notes: "Dry surface proteins, high-smoke-point fat, fond development.", steps: [{ text: "Build pan sauce by deglazing fond", done: false }], links: [] },
        { title: "Stable Cold & Warm Emulsions", tier: "Tier II • Practitioner", icon: "🧪", color: "#f59e0b", notes: "Control shear rate and fat-to-liquid ratio for velvety dressings and sauces.", steps: [{ text: "Dial viscosity without breaking emulsion", done: false }], links: [] },
        { title: "Low-and-Slow Collagen Rendering", tier: "Tier III • Specialist", icon: "⚒", color: "#22c55e", notes: "Hold 225-250 F smoker/braise window until tough connective tissue converts to gelatin.", steps: [{ text: "Navigate the evaporative stall cleanly", done: false }, { text: "Rest in insulated cambro to redistribute juices", done: false }], links: [] },
        { title: "Curing, Brining & Fermentation", tier: "Tier IV • Grandmaster", icon: "👑", color: "#a855f7", notes: "Equilibrium salt percentages (2.25%-2.5%) for safe, repeatable charcuterie and cured fish.", steps: [{ text: "Calculate equilibrium cure by gram weight", done: false }], links: [] }
      ]
    },
    {
      id: "b4", attr: "CHA", tag: "Business", title: "Commercial Contracting & Proposal Mastery", author: "Architect Blueprint", likes: 51,
      nodes: [
        { title: "Site Walk & Scope Discovery", tier: "Tier I • Foundation", icon: "🧭", color: "#38bdf8", notes: "Measure exact square footage, access constraints, moisture, and client downtime windows.", steps: [{ text: "Document site photos, dimensions & substrate notes", done: false }], links: [] },
        { title: "True Cost & Margin Modeling", tier: "Tier II • Practitioner", icon: "🧠", color: "#f59e0b", notes: "Account for materials, freight, mobilization, crew hours, contingency, and target net margin.", steps: [{ text: "Verify material price lock window (30-60 days)", done: false }], links: [] },
        { title: "Turnkey Executive Proposal Writing", tier: "Tier III • Specialist", icon: "📖", color: "#22c55e", notes: "Present clear scope phases, warranty terms, and single turnkey investment figure.", steps: [{ text: "Eliminate ambiguity on prep responsibilities", done: false }], links: [] },
        { title: "Multi-Site Logistics & Client Retention", tier: "Tier IV • Grandmaster", icon: "🏆", color: "#a855f7", notes: "Sequence regional route jobs and convert one-off repairs into multi-year facility contracts.", steps: [{ text: "Deliver post-install QA report & maintenance schedule", done: false }], links: [] }
      ]
    }
  ];

  [...deepTrees, ...moreTrees].forEach(up => {
    const idx = baseConceptTrees.findIndex(x => x.id === up.id);
    if (idx >= 0) baseConceptTrees[idx] = up; else baseConceptTrees.unshift(up);
  });

  window.harvestSingleNode = async function(tid, idx) {
    const src = publicTreesCache.find(x => x.id === tid); if (!src) return;
    const sn = src.nodes[idx], keys = Object.keys(userTrees);
    let target = !keys.length ? await createNewTree(src.title, src.attr, []) : prompt(`Target tree (${keys.join(", ")}):`, keys[0]);
    if (!target) return;
    if (!userTrees[target]) await createNewTree(target, src.attr, []);
    const tn = userTrees[target].nodes, sx = [50, 26, 74, 34, 66, 18, 82, 42, 58];
    tn.push({ id: "h_" + Date.now(), title: sn.title, status: "locked", tier: sn.tier || "Tier I • Foundation", icon: sn.icon || "✦", color: sn.color || "#38bdf8", x: sx[tn.length % sx.length], y: Math.max(14, 62 - Math.floor(tn.length / 3) * 14), notes: sn.notes || "", steps: Array.isArray(sn.steps) ? JSON.parse(JSON.stringify(sn.steps)) : [], links: Array.isArray(sn.links) ? JSON.parse(JSON.stringify(sn.links)) : [], parentId: tn.length ? tn[tn.length - 1].id : null });
    await saveUserData();
    alert(`Harvested "${sn.title}" (with steps & links) onto "${target}"!`);
  };
})();
