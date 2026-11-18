(function installGrimoireNebulaAndLexicon150() {
  const GRIMOIRE_KEY = "skilltree_grimoire_unlocked_v1";
  const SCRATCH_KEY = "skilltree_quest_scratchpad_v1";

  window.getGrimoireSet = function() {
    try { return new Set(JSON.parse(localStorage.getItem(GRIMOIRE_KEY) || "[]")); } catch { return new Set(); }
  };
  window.markGrimoireUnlocked = function(treeId, title) {
    const s = window.getGrimoireSet();
    s.add(`${treeId}::${title}`);
    s.add(`*::${title}`);
    localStorage.setItem(GRIMOIRE_KEY, JSON.stringify([...s]));
  };
  window.isGrimoireUnlocked = function(treeId, title) {
    const s = window.getGrimoireSet();
    return s.has(`${treeId}::${title}`) || s.has(`*::${title}`);
  };

  // 150-Node Dictionary & Abstract Lexicon Atlas (5 Semantic Branches, 30 Words Each)
  function injectLexicon150Tree() {
    if (typeof baseConceptTrees === "undefined" || !Array.isArray(baseConceptTrees)) return;
    if (baseConceptTrees.some(t => t.id === "b_lexicon_150")) return;

    const branches = [
      {
        cat: "Branch I • Everyday Clarity", attr: "WIS", words: [
          ["1. Candid", "Truthful and straightforward; frank.", "She gave a candid assessment of the project timeline."],
          ["2. Concise", "Giving a lot of information clearly in a few words.", "Keep your field report concise and actionable."],
          ["3. Prudent", "Acting with or showing care and thought for the future.", "It is prudent to inspect the subfloor before coating."],
          ["4. Tenacious", "Tending to keep a firm hold; persistent.", "A tenacious builder solves every bottleneck."],
          ["5. Lucid", "Expressed clearly; easy to understand.", "His explanation of binary logic was remarkably lucid."],
          ["6. Adept", "Very skilled or proficient at something.", "She became adept at reading moisture meters."],
          ["7. Pragmatic", "Dealing with things sensibly and realistically.", "Take a pragmatic approach to material logistics."],
          ["8. Resilient", "Able to withstand or recover quickly from difficulty.", "Resilient flooring absorbs heavy impact without cracking."],
          ["9. Astute", "Having an ability to accurately assess situations.", "An astute negotiator spots hidden costs early."],
          ["10. Diligent", "Having or showing care and conscientiousness in work.", "Diligent prep work prevents coating failure."],
          ["11. Tangible", "Perceptible by touch; clear and definite.", "Focus on tangible milestones every week."],
          ["12. Cohesive", "Forming a united, logical whole.", "A cohesive plan aligns crew, tools, and schedule."],
          ["13. Versatile", "Able to adapt to many different functions or activities.", "A versatile rotary hammer handles drilling and chiseling."],
          ["14. Methodical", "Done according to a systematic or established procedure.", "Follow a methodical diagnostic checklist."],
          ["15. Alacrity", "Brisk and cheerful readiness.", "They accepted the cross-country challenge with alacrity."],
          ["16. Bolster", "Support or strengthen; prop up.", "Steel gussets bolster the modular frame."],
          ["17. Discern", "Perceive or recognize clearly.", "Learn to discern subtle shifts in air pressure."],
          ["18. Frugal", "Sparing or economical with regard to resources.", "Frugal prototyping saves capital for scaling."],
          ["19. Impartial", "Treating all rivals or disputants equally; fair.", "An impartial audit reveals true margins."],
          ["20. Mitigate", "Make less severe, serious, or painful.", "Dust extractors mitigate airborne silica hazards."],
          ["21. Nuance", "A subtle difference in meaning, expression, or sound.", "Mastering nuance separates novices from experts."],
          ["22. Plausible", "Seeming reasonable or probable.", "Test every plausible hypothesis systematically."],
          ["23. Rectify", "Put right; correct.", "Grind high spots flat to rectify slab variance."],
          ["24. Scrutinize", "Examine or inspect closely and thoroughly.", "Scrutinize every contract clause before signing."],
          ["25. Steadfast", "Resolutely or dutifully firm and unwavering.", "Remain steadfast when unexpected delays hit."],
          ["26. Tactful", "Having skill and sensitivity in dealing with others.", "A tactful reply de-escalates client tension."],
          ["27. Unwavering", "Steady or resolute; not hesitating.", "Maintain unwavering focus during complex installs."],
          ["28. Viable", "Capable of working successfully; feasible.", "Validate whether the duplex layout is financially viable."],
          ["29. Zeal", "Great energy or enthusiasm in pursuit of a cause.", "Approach new crafts with disciplined zeal."],
          ["30. Zenith", "The time at which something is most powerful or successful.", "At its zenith, the constellation spans the entire sky."]
        ]
      },
      {
        cat: "Branch II • Precision & Nuance", attr: "INT", words: [
          ["31. Ambiguous", "Open to more than one interpretation.", "Eliminate ambiguous instructions from crew SOPs."],
          ["32. Catalyst", "A person or thing that precipitates an event or change.", "One breakthrough insight acted as a catalyst."],
          ["33. Dichotomy", "A division or contrast between two opposed things.", "Avoid a false dichotomy between speed and quality."],
          ["34. Empirical", "Based on observation or experience rather than theory.", "Rely on empirical test patches over guesswork."],
          ["35. Fastidious", "Very attentive to accuracy and detail.", "Fastidious surface prep guarantees adhesion."],
          ["36. Gregarious", "Fond of company; sociable.", "Gregarious hosts turn customers into advocates."],
          ["37. Hegemony", "Leadership or dominance by one group over others.", "Build category hegemony through superior craft."],
          ["38. Idiosyncrasy", "A mode of behavior or way of thought peculiar to an individual.", "Every 100-year-old building has structural idiosyncrasies."],
          ["39. Juxtapose", "Place close together for contrasting effect.", "Juxtapose raw concrete against warm timber."],
          ["40. Kinetic", "Relating to or resulting from motion.", "Kinetic chains transfer force from floor to hands."],
          ["41. Latent", "Existing but not yet developed or manifest; hidden.", "Unlock latent potential in underused assets."],
          ["42. Magnanimous", "Generous or forgiving, especially toward a rival.", "A magnanimous leader shares credit freely."],
          ["43. Nebulous", "In the form of a cloud or haze; vague or ill-defined.", "Turn nebulous ideas into concrete blueprints."],
          ["44. Ostensible", "Stated or appearing to be true, but not necessarily so.", "Look past the ostensible reason to the root cause."],
          ["45. Paradigm", "A typical example or pattern of something; a model.", "Shift the paradigm from passive checklists to active discovery."],
          ["46. Quintessential", "Representing the most perfect or typical example.", "The handstand press is a quintessential calisthenics feat."],
          ["47. Reciprocal", "Given, felt, or done in return.", "Strong partnerships thrive on reciprocal trust."],
          ["48. Salient", "Most noticeable or important.", "Highlight the three most salient metrics first."],
          ["49. Tacit", "Understood or implied without being stated.", "Experienced crews operate with tacit coordination."],
          ["50. Ubiquitous", "Present, appearing, or found everywhere.", "Smartphones made offline PWAs ubiquitous."],
          ["51. Vacillate", "Alternate or waver between different opinions or actions.", "Decide firmly rather than vacillating under pressure."],
          ["52. Wary", "Feeling or showing caution about possible dangers.", "Be wary of curing urethane in high humidity."],
          ["53. Axiomatic", "Self-evident or unquestionable.", "In structural engineering, load paths are axiomatic."],
          ["54. Capricious", "Given to sudden and unaccountable changes of mood or behavior.", "Plan around capricious spring weather."],
          ["55. Deference", "Humble submission and respect.", "Listen with deference to seasoned mentors."],
          ["56. Erudite", "Having or showing great knowledge or learning.", "An erudite craftsman understands both theory and field work."],
          ["57. Fortuitous", "Happening by a lucky chance; fortunate.", "A fortuitous detour uncovered a better supplier."],
          ["58. Harbinger", "A person or thing that announces the approach of another.", "Micro-cracking is an early harbinger of moisture vapor."],
          ["59. Immutable", "Unchanging over time or unable to be changed.", "Physics and curing chemistry follow immutable laws."],
          ["60. Laconic", "Using very few words.", "His laconic nod meant the pour was ready."]
        ]
      },
      {
        cat: "Branch III • Rhetoric & Persuasion", attr: "CHA", words: [
          ["61. Eloquent", "Fluent or persuasive in speaking or writing.", "An eloquent proposal wins executive buy-in."],
          ["62. Cogent", "Clear, logical, and convincing.", "Present a cogent case backed by hard numbers."],
          ["63. Conciliatory", "Intended or likely to placate or pacify.", "Use a conciliatory tone to resolve disputes."],
          ["64. Didactic", "Intended to teach, particularly in having moral instruction.", "Keep field guides practical rather than overly didactic."],
          ["65. Emphatic", "Showing or giving emphasis; expressing something forcibly.", "She gave an emphatic endorsement of the system."],
          ["66. Facetious", "Treating serious issues with deliberately inappropriate humor.", "Avoid facetious remarks during safety briefings."],
          ["67. Galvanize", "Shock or excite someone into taking action.", "A clear vision can galvanize an entire crew."],
          ["68. Incisive", "Intelligently analytical and clear-thinking.", "Ask incisive questions during site inspections."],
          ["69. Magniloquent", "Using high-flown or bombastic language.", "Plain specifics beat magniloquent fluff every time."],
          ["70. Nonchalant", "Feeling or appearing casually calm and relaxed.", "Stay nonchalant when demo equipment arrives late."],
          ["71. Orator", "A public speaker, especially one who is eloquent or skilled.", "A great orator reads the energy of the room."],
          ["72. Polemic", "A strong verbal or written attack on someone or something.", "Skip polemics and focus on constructive solutions."],
          ["73. Rhetoric", "The art of effective or persuasive speaking or writing.", "Pair strong rhetoric with undeniable proof."],
          ["74. Succinct", "Briefly and clearly expressed.", "Summarize the bid in three succinct bullet points."],
          ["75. Trenchant", "Vigorous or incisive in expression or style.", "Her trenchant critique improved the product immediately."],
          ["76. Urbane", "Suave, courteous, and refined in manner.", "An urbane host puts every guest at ease."],
          ["77. Verbose", "Using or expressed in more words than are needed.", "Trim verbose paragraphs down to crisp steps."],
          ["78. Wry", "Using or expressing dry, especially mocking, humor.", "He offered a wry smile after the third rain delay."],
          ["79. Affable", "Friendly, good-natured, and easy to talk to.", "An affable demeanor builds instant rapport."],
          ["80. Bellicose", "Demonstrating aggression and willingness to fight.", "De-escalate bellicose clients with calm facts."],
          ["81. Circumspect", "Wary and unwilling to take risks.", "Be circumspect when quoting unfamiliar substrates."],
          ["82. Disarming", "Having the effect of allaying suspicion or hostility.", "Honesty about trade-offs is remarkably disarming."],
          ["83. Euphemism", "A mild or indirect word substituted for a harsh one.", "Speak plainly without hiding behind euphemisms."],
          ["84. Fervent", "Having or displaying a passionate intensity.", "Fervent craftsmanship shows in every finished corner."],
          ["85. Grandiloquent", "Pompous or extravagant in language, style, or manner.", "Avoid grandiloquent claims you cannot verify."],
          ["86. Insinuate", "Suggest or hint something bad in an indirect way.", "State concerns directly rather than insinuating."],
          ["87. Jovial", "Cheerful and friendly.", "A jovial crew keeps morale high on long installs."],
          ["88. Loquacious", "Tending to talk a great deal; talkative.", "Balance a loquacious pitch with active listening."],
          ["89. Mollify", "Appease the anger or anxiety of someone.", "A clear schedule update helped mollify the client."],
          ["90. Plaudit", "An expression of praise or approval.", "The finished exhibit earned plaudits from visitors."]
        ]
      },
      {
        cat: "Branch IV • Systems & Philosophy", attr: "INT", words: [
          ["91. Stoicism", "Endurance of pain or hardship without complaint.", "Stoicism trains focus on what lies within your control."],
          ["92. Epistemology", "The theory of knowledge, especially regarding its methods.", "Epistemology asks how we verify what we truly know."],
          ["93. Teleology", "Explanation of phenomena by the purpose they serve.", "Design every tool with clear teleology in mind."],
          ["94. Ontology", "The branch of metaphysics dealing with the nature of being.", "Define a clean ontology for nodes, branches, and trees."],
          ["95. Heuristic", "Enabling a person to discover or learn something themselves.", "A good rule of thumb is a practical heuristic."],
          ["96. Entropy", "Lack of order or predictability; gradual decline into disorder.", "Maintenance reverses physical entropy on job sites."],
          ["97. Synergy", "Interaction of elements that produces a combined effect greater than the sum.", "Pairing mechanical grinding with primer creates chemical synergy."],
          ["98. Equanimity", "Mental calmness, composure, and evenness of temper.", "Handle equipment breakdowns with equanimity."],
          ["99. Eudaimonia", "Human flourishing or living well through virtue and mastery.", "Real-world skill mastery leads toward eudaimonia."],
          ["100. Dialectic", "The art of investigating or discussing the truth of opinions.", "Use dialectic debate to stress-test business plans."],
          ["101. Autonomy", "The right or condition of self-government.", "Modular systems give operators full autonomy."],
          ["102. Catharsis", "The process of releasing strong or repressed emotions.", "Completing a 150-node atlas brings creative catharsis."],
          ["103. Determinism", "The doctrine that all events are determined by causes.", "Balance determinism with personal agency."],
          ["104. Empiricism", "The theory that all knowledge is derived from sense-experience.", "Field testing is pure hands-on empiricism."],
          ["105. Fallacy", "A mistaken belief, especially one based on unsound argument.", "Avoid the sunk-cost fallacy on bad prototypes."],
          ["106. Gestalt", "An organized whole perceived as more than the sum of its parts.", "Zooming out reveals the gestalt of your entire galaxy."],
          ["107. Hegelian", "Relating to synthesis arising from thesis and antithesis.", "Merge two opposing designs into a Hegelian synthesis."],
          ["108. Intrinsic", "Belonging naturally; essential.", "Focus on intrinsic curiosity rather than fake points."],
          ["109. Logos", "The principle of reason and judgment.", "Ground every architectural decision in clear logos."],
          ["110. Metaphysics", "The branch of philosophy dealing with first principles.", "Explore first principles before optimizing details."],
          ["111. Nihilism", "The rejection of all religious and moral principles.", "Counter passive nihilism by building meaningful things."],
          ["112. Occam's Razor", "The simplest explanation with fewest assumptions is usually best.", "Apply Occam's Razor when debugging code."],
          ["113. Paradox", "A seemingly absurd statement that may nonetheless be true.", "Slowing down to prep faster is a classic trade paradox."],
          ["114. Praxis", "Practice, as distinguished from theory.", "Turn book knowledge into daily physical praxis."],
          ["115. Reductionism", "Analyzing complex things in terms of simple constituents.", "Use reductionism to break huge goals into 15 nodes."],
          ["116. Solipsism", "The view that only one's own mind is sure to exist.", "Collaborative networks break creative solipsism."],
          ["117. Syllogism", "A deductive reasoning form with major and minor premises.", "Check your bid logic like a clean syllogism."],
          ["118. Zeitgeist", "The defining spirit or mood of a particular period.", "Capture the zeitgeist of gamified self-mastery."],
          ["119. Amor Fati", "Love of one's fate; embracing everything that happens.", "Treat every setback as fuel through Amor Fati."],
          ["120. Phronesis", "Practical wisdom and sound judgment in action.", "Years in the field forge true phronesis."]
        ]
      },
      {
        cat: "Branch V • Rare & Abstract Mastery", attr: "WIS", words: [
          ["121. Ephemeral", "Lasting for a very short time.", "Social trends are ephemeral; real skills endure."],
          ["122. Perspicacious", "Having a ready insight into and understanding of things.", "A perspicacious architect anticipates edge cases."],
          ["123. Ineffable", "Too great or extreme to be expressed or described in words.", "Standing at the summit brings an ineffable calm."],
          ["124. Equivocate", "Use ambiguous language so as to conceal the truth.", "Never equivocate when clients ask for timelines."],
          ["125. Obfuscate", "Render obscure, unclear, or unintelligible.", "Clean UI removes clutter rather than obfuscating it."],
          ["126. Panacea", "A solution or remedy for all difficulties or diseases.", "No single tool is a panacea for every substrate."],
          ["127. Recondite", "Little known; abstruse.", "Master recondite details others overlook."],
          ["128. Sagacious", "Having or showing keen mental discernment and good judgment.", "Seek sagacious counsel before major acquisitions."],
          ["129. Sanguine", "Optimistic or positive, especially in a bad situation.", "Stay sanguine while troubleshooting complex builds."],
          ["130. Serendipity", "The occurrence of events by chance in a happy way.", "Prepared minds turn accidents into serendipity."],
          ["131. Superfluous", "Unnecessary, especially through being more than enough.", "Strip out every superfluous button from the HUD."],
          ["132. Sycophant", "A person who acts obsequiously toward someone important.", "Value candid peers over flattering sycophants."],
          ["133. Transient", "Lasting only for a short time; impermanent.", "Treat transient frustration as background noise."],
          ["134. Vicarious", "Experienced in the imagination through another person.", "Reading guides gives vicarious insight; practice makes it real."],
          ["135. Verisimilitude", "The appearance of being true or real.", "Deep space physics gives the tree vivid verisimilitude."],
          ["136. Abnegation", "The act of renouncing or rejecting something.", "Mastery requires abnegation of cheap distractions."],
          ["137. Acumen", "The ability to make good judgments and quick decisions.", "Operational acumen compounds over every project."],
          ["138. Anachronism", "A thing belonging to a period other than that in which it exists.", "Paper ledgers feel like an anachronism beside cloud sync."],
          ["139. Apotheosis", "The highest point in the development of something; culmination.", "A 1,000-node Grand Nebula is the apotheosis of lifelong learning."],
          ["140. Cognizant", "Having knowledge or being aware 
           ["141. Conundrum", "A confusing and difficult problem or question.", "Solve the scaling conundrum with dynamic sky expansion."],
          ["142. Deleterious", "Causing harm or damage.", "Improper curing has a deleterious effect on bond strength."],
          ["143. Ebullient", "Cheerful and full of energy.", "An ebullient team tackles tough installations effortlessly."],
          ["144. Esoteric", "Intended for or likely to be understood by only a small number.", "Translate esoteric engineering into plain English."],
          ["145. Exacerbate", "Make a problem, bad situation, or negative feeling worse.", "Skipping primer will exacerbate slab outgassing."],
          ["146. Inexorable", "Impossible to stop or prevent.", "Consistent daily effort builds inexorable momentum."],
          ["147. Magnanimity", "The fact or condition of being magnanimous; generosity.", "Lead crews with strength and magnanimity."],
          ["148. Mellifluous", "Sweet or musical; pleasant to hear.", "A mellifluous cadence makes spoken prose effortless."],
          ["149. Pulchritude", "Physical beauty.", "The bioluminescent galaxy radiates cosmic pulchritude."],
          ["150. Sesquipedalian", "Characterized by long words; long-winded.", "Use sesquipedalian vocabulary sparingly and with precision."]
        ]
      }
    ];

    const nodes = [];
    branches.forEach((b, bIdx) => {
      let prevIdx = -1;
      b.words.forEach(([word, def, ex], wIdx) => {
        const idx = nodes.length;
        const isQuest = (wIdx % 3 === 2); // Every 3rd word is a Quest Node requiring active sentence usage
        const prereqNote = wIdx > 0 ? `\nPREREQUISITE: Unlock "${b.words[wIdx - 1][0]}" first.` : "";
        nodes.push({
          parentIdx: prevIdx,
          title: word,
          tier: `${b.cat} • ${isQuest ? "⚔ Quest Node" : "📖 Reading Node"}`,
          icon: isQuest ? "⚔" : "📖",
          color: isQuest ? "#f59e0b" : "#38bdf8",
          tags: ["vocabulary", "lexicon", b.attr.toLowerCase()],
          notes: `DEFINITION: ${def}\nEXAMPLE: "${ex}"${prereqNote}`,
          steps: isQuest ? [
            { text: `Write an original sentence using "${word.replace(/^\d+\.\s*/, "")}" in your notes`, done: false },
            ...(wIdx > 0 ? [{ text: `Prerequisite: Master/Unlock ${b.words[wIdx - 1][0]}`, done: false }] : [])
          ] : []
        });
        prevIdx = idx;
      });
    });

    baseConceptTrees.unshift({
      id: "b_lexicon_150", attr: "WIS", tag: "Concept", nsfw: false,
      tags: ["vocabulary", "lexicon", "words", "150-atlas"],
      title: "The Grand Lexicon: 150 Words (Beginner → Abstract)",
      author: "Architect", likes: 0, nodes
    });
  }

  // Grand Nebula Auto-Router: harvests any single skill onto a clean sub-category spine
  window.harvestIntoGrandNebula = async function(nodeObj, categoryName = "General", attr = "WIS") {
    let trees = [];
    if (typeof userData !== "undefined" && Array.isArray(userData?.trees)) trees = userData.trees;
    let nebula = trees.find(t => t.id === "grand_nebula_master" || t.title === "🌌 The Grand Nebula");
    if (!nebula) {
      nebula = { id: "grand_nebula_master", title: "🌌 The Grand Nebula", attr: "WIS", nodes: [] };
      trees.unshift(nebula);
    }
    const spineTag = `${attr} • ${categoryName}`;
    const sameCat = nebula.nodes.map((n, i) => ({ n, i })).filter(x => x.n.tier?.startsWith(spineTag));
    const parentIdx = sameCat.length ? sameCat[sameCat.length - 1].i : -1;
    const parentId = parentIdx >= 0 ? nebula.nodes[parentIdx].id : null;

    nebula.nodes.push({
      id: `neb_${Date.now()}_${Math.floor(Math.random() * 999)}`,
      parentIdx, parentId,
      title: nodeObj.title,
      status: "learning",
      tier: `${spineTag} • Harvested`,
      icon: nodeObj.icon || "✦",
      color: nodeObj.color || "#38bdf8",
      x: 50, y: 50,
      tags: nodeObj.tags || [categoryName.toLowerCase()],
      notes: nodeObj.notes || "",
      image: nodeObj.image || "",
      steps: (nodeObj.steps || []).map(s => typeof s === "string" ? { text: s, done: false } : { ...s }),
      links: nodeObj.links || []
    });

    if (typeof window.computeOrganicTreePositions === "function") window.computeOrganicTreePositions(nebula.nodes, Date.now());
    if (typeof saveUserData === "function") await saveUserData();
    alert(`Harvested "${nodeObj.title}" onto spine [${spineTag}] in 🌌 The Grand Nebula!`);
  };

  // Full Quest Board + Private Scratchpad
  window.openFullQuestBoard = function() {
    let modal = document.getElementById("questBoardModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "questBoardModal";
      modal.className = "fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col p-4 overflow-y-auto";
      document.body.appendChild(modal);
    }
    let scratch = {}; try { scratch = JSON.parse(localStorage.getItem(SCRATCH_KEY) || "{}"); } catch {}
    let trees = [];
    if (typeof userData !== "undefined" && Array.isArray(userData?.trees)) trees = userData.trees;

    const quests = [];
    trees.forEach(t => (t.nodes || []).forEach((n, idx) => {
      if (n.status === "learning") quests.push({ tree: t, node: n, idx });
    }));

    modal.innerHTML = `
      <div class="max-w-md mx-auto w-full space-y-3 pb-8">
        <div class="flex justify-between items-center border-b border-sky-500/30 pb-2.5">
          <div><h2 class="text-lg font-black text-sky-400 skyrim-font">🎯 ACTIVE QUEST BOARD</h2><div class="text-[11px] text-slate-400">${quests.length} Active Quests & Reading Nodes</div></div>
          <div class="flex gap-1.5">
            <button id="drawSparkBtn" type="button" class="px-2.5 py-1.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">🎲 Next Spark</button>
            <button id="closeQuestModalBtn" type="button" class="px-2.5 py-1.5 bg-slate-800 text-slate-200 rounded-lg text-xs font-bold">✕</button>
          </div>
        </div>
        ${quests.length ? quests.map(q => {
          const key = `${q.tree.id}_${q.node.id}`;
          return `
            <div class="glass-panel rounded-xl p-3 space-y-2">
              <div class="flex justify-between items-start gap-2">
                <div><div class="text-[10px] font-bold text-amber-300 uppercase">${q.tree.title}</div><div class="text-sm font-bold text-white">${q.node.title}</div></div>
                <button type="button" data-illuminate="${q.tree.id}|${q.idx}" class="px-2.5 py-1 bg-sky-500 text-slate-950 rounded-lg text-[11px] font-black shrink-0">✨ Unlock</button>
              </div>
              <textarea data-scratch="${key}" rows="2" placeholder="Private quest scratchpad: jot progress, cues, or where you left off..." class="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none">${scratch[key] || ""}</textarea>
            </div>`;
        }).join("") : `<div class="glass-panel rounded-xl p-6 text-center text-xs text-slate-400">No active quests yet! Tap <b>🎲 Next Spark</b> above or mark any node as <b>Training</b> to pin it here.</div>`}
      </div>`;

    modal.classList.remove("hidden");
    document.getElementById("closeQuestModalBtn").onclick = () => modal.classList.add("hidden");
    modal.querySelectorAll("textarea[data-scratch]").forEach(ta => ta.oninput = () => {
      scratch[ta.dataset.scratch] = ta.value;
      localStorage.setItem(SCRATCH_KEY, JSON.stringify(scratch));
    });
    modal.querySelectorAll("button[data-illuminate]").forEach(b => b.onclick = async () => {
      const [tid, idxStr] = b.dataset.illuminate.split("|");
      const t = trees.find(x => x.id === tid);
      if (t && t.nodes[Number(idxStr)]) {
        t.nodes[Number(idxStr)].status = "mastered";
        window.markGrimoireUnlocked(t.id, t.nodes[Number(idxStr)].title);
        if (typeof saveUserData === "function") await saveUserData();
        window.openFullQuestBoard();
      }
    });
    document.getElementById("drawSparkBtn").onclick = async () => {
      for (const t of trees) {
        const next = (t.nodes || []).find(n => n.status === "locked");
        if (next) {
          next.status = "learning";
          if (typeof saveUserData === "function") await saveUserData();
          window.openFullQuestBoard();
          return;
        }
      }
      alert("Every node in your constellations is already active or mastered!");
    };
  };

  setInterval(injectLexicon150Tree, 800);
})();
