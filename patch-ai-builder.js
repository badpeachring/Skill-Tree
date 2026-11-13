(function installAiTreeBuilder() {
  window.buildNodeSvgDiagram = function(pose, title, subtitle) {
    const poses = {
      breath: `<circle cx="160" cy="36" r="11" fill="#38bdf8"/><line x1="160" y1="47" x2="160" y2="95" stroke="#94a3b8" stroke-width="5"/><ellipse cx="160" cy="70" rx="18" ry="13" fill="rgba(16,185,129,0.35)" stroke="#10b981" stroke-width="2"/><line x1="160" y1="95" x2="132" y2="128" stroke="#94a3b8" stroke-width="4"/><line x1="160" y1="95" x2="188" y2="128" stroke="#94a3b8" stroke-width="4"/>`,
      neck: `<circle cx="174" cy="38" r="11" fill="#38bdf8"/><path d="M160,55 Q164,46 171,44" stroke="#10b981" stroke-width="6" fill="none"/><line x1="160" y1="53" x2="160" y2="112" stroke="#94a3b8" stroke-width="5"/><line x1="138" y1="62" x2="182" y2="62" stroke="#94a3b8" stroke-width="4"/>`,
      shoulder: `<circle cx="135" cy="48" r="10" fill="#38bdf8"/><line x1="135" y1="58" x2="175" y2="95" stroke="#94a3b8" stroke-width="5"/><line x1="142" y1="64" x2="195" y2="42" stroke="#10b981" stroke-width="5"/><circle cx="152" cy="62" r="12" fill="rgba(16,185,129,0.38)"/>`,
      wrist: `<line x1="115" y1="45" x2="155" y2="96" stroke="#94a3b8" stroke-width="5"/><line x1="155" y1="96" x2="192" y2="96" stroke="#10b981" stroke-width="5"/><circle cx="155" cy="96" r="12" fill="rgba(16,185,129,0.42)" stroke="#10b981" stroke-width="2"/>`,
      spine: `<circle cx="110" cy="78" r="10" fill="#38bdf8"/><path d="M118,84 Q160,42 204,88" stroke="#10b981" stroke-width="6" fill="none"/><line x1="204" y1="88" x2="215" y2="124" stroke="#94a3b8" stroke-width="4"/>`,
      hip: `<circle cx="152" cy="34" r="10" fill="#38bdf8"/><line x1="152" y1="44" x2="152" y2="86" stroke="#94a3b8" stroke-width="5"/><line x1="152" y1="86" x2="198" y2="86" stroke="#10b981" stroke-width="5"/><line x1="152" y1="86" x2="108" y2="118" stroke="#10b981" stroke-width="5"/><circle cx="152" cy="86" r="13" fill="rgba(16,185,129,0.38)"/>`,
      split: `<circle cx="160" cy="52" r="10" fill="#38bdf8"/><line x1="160" y1="62" x2="160" y2="104" stroke="#94a3b8" stroke-width="5"/><line x1="160" y1="104" x2="88" y2="114" stroke="#10b981" stroke-width="5"/><line x1="160" y1="104" x2="232" y2="114" stroke="#10b981" stroke-width="5"/>`,
      leg: `<circle cx="148" cy="48" r="10" fill="#38bdf8"/><path d="M148,58 Q168,78 156,96" stroke="#94a3b8" stroke-width="5" fill="none"/><line x1="156" y1="96" x2="216" y2="112" stroke="#10b981" stroke-width="5"/><line x1="156" y1="96" x2="146" y2="126" stroke="#94a3b8" stroke-width="4"/>`,
      blueprint: `<rect x="85" y="42" width="150" height="66" rx="6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/><line x1="85" y1="64" x2="235" y2="64" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4"/><line x1="85" y1="86" x2="235" y2="86" stroke="#f59e0b" stroke-width="2"/><circle cx="160" cy="75" r="10" fill="rgba(16,185,129,0.45)"/>`,
      tool: `<rect x="105" y="68" width="90" height="14" rx="4" fill="#94a3b8"/><polygon points="195,62 225,75 195,88" fill="#10b981"/><circle cx="118" cy="75" r="12" fill="rgba(56,189,248,0.35)" stroke="#38bdf8" stroke-width="2"/>`,
      circuit: `<circle cx="105" cy="75" r="10" fill="#38bdf8"/><circle cx="215" cy="75" r="10" fill="#10b981"/><path d="M115,75 L145,75 L155,55 L165,95 L175,75 L205,75" stroke="#10b981" stroke-width="3" fill="none"/>`
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><defs><radialGradient id="bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#0f292e"/><stop offset="100%" stop-color="#020617"/></radialGradient></defs><rect width="320" height="150" fill="url(#bg)"/><g stroke="rgba(56,189,248,0.08)" stroke-width="1"><line x1="0" y1="30" x2="320" y2="30"/><line x1="0" y1="75" x2="320" y2="75"/><line x1="0" y1="120" x2="320" y2="120"/><line x1="80" y1="0" x2="80" y2="150"/><line x1="160" y1="0" x2="160" y2="150"/><line x1="240" y1="0" x2="240" y2="150"/></g>${poses[pose] || poses.blueprint}<text x="12" y="18" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold">${(title || "").slice(0, 40)}</text><text x="12" y="140" fill="#34d399" font-family="sans-serif" font-size="9">SPEC: ${(subtitle || "Core Skill").slice(0, 48)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  function injectBuilderButton() {
    const mainMenu = document.getElementById("viewMenu") || document.body;
    const refBtn = [...mainMenu.querySelectorAll("button")].find(b =>
      /server realm|constellations|new tree/i.test(b.textContent || "")
    );
    if (!refBtn || document.getElementById("openAiBuilderBtn")) return;

    const btn = document.createElement("button");
    btn.id = "openAiBuilderBtn";
    btn.type = "button";
    btn.className = "menu-btn w-full p-4 rounded-xl text-left flex items-center justify-between mb-3";
    btn.innerHTML = `
      <div>
        <div class="text-xs font-black uppercase tracking-wider text-emerald-400">AI Architect Generator</div>
        <div class="text-base font-bold text-white skyrim-font">✨ Build Skill Tree from Any Topic</div>
        <div class="text-[11px] text-slate-400 mt-0.5">Copy AI prompt → Paste JSON → Instant branching World-Tree</div>
      </div>
      <span class="text-xl">🧠</span>`;
    btn.onclick = () => window.openAiBuilderModal();
    refBtn.parentElement.insertBefore(btn, refBtn);
  }

  window.buildAiArchitectPrompt = function({ topic, count, attr, tags, nsfw, expandParentTitle }) {
    const modeLine = expandParentTitle
      ? `Expand the existing skill node "${expandParentTitle}" inside "${topic}" into ${count} deeper progressive sub-nodes.`
      : `Build a complete, deeply technical, bottom-up skill tree for: "${topic}" with exactly ${count} nodes.`;
    const toneLine = nsfw
      ? `This tree is explicitly tagged 18+ NSFW. Be maximally direct, candid, anatomical, and explicit—do not sanitize, censor, or use euphemisms within standard safe boundaries.`
      : `Be maximally specific, technical, and actionable—use exact measurements, angles, ratios, tools, or anatomical cues.`;

    return `You are an expert curriculum architect. ${modeLine}
${toneLine}
Return ONLY raw valid JSON (no markdown commentary outside the JSON) matching this exact schema:
{
  "title": "${topic}",
  "attr": "${attr}",
  "tag": "Concept",
  "nsfw": ${Boolean(nsfw)},
  "tags": ${JSON.stringify(tags)},
  "author": "Architect",
  "nodes": [
    {
      "parentIdx": -1,
      "title": "1. Foundation Skill Name",
      "tier": "Tier I • Foundation",
      "icon": "🛠",
      "color": "#38bdf8",
      "pose": "blueprint",
      "muscles": "Target anatomy, tools, or specs",
      "notes": "Detailed 2-3 sentence execution guide with exact specs and cues.",
      "steps": ["Actionable drill or verification step 1", "Actionable step 2"],
      "yt": "exact youtube search query for tutorial"
    }
  ]
}
Rules:
1. Nodes 0-3 must have "parentIdx": -1 (trunk roots). Every subsequent node's "parentIdx" must be a 0-based index strictly less than its own index.
2. Group branches cleanly by sub-discipline or region.
3. Progress tiers & colors bottom-up: "Tier I • Foundation" (#38bdf8), "Tier II • Practitioner" (#f59e0b), "Tier III • Specialist" (#22c55e), "Tier IV • Grandmaster" (#a855f7).
4. Set "pose" to one of: "breath", "neck", "shoulder", "wrist", "spine", "hip", "split", "leg", "blueprint", "tool", "circuit".`;
  };

  window.openAiBuilderModal = function(prefill = {}) {
    let modal = document.getElementById("aiBuilderModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "aiBuilderModal";
      modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
      modal.innerHTML = `
        <div class="w-full max-w-md glass-panel rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-3">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-black text-emerald-400 skyrim-font">✨ AI Skill Tree Builder</h2>
            <button id="closeAiBuilderBtn" type="button" class="text-slate-400 text-base px-2">✕</button>
          </div>

          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-sky-400">Step 1: Topic, Tags & Copy Prompt</div>
            <input id="aiTopicInput" type="text" placeholder="e.g., Drywall Level 5 Finishing, or 60-Node Stretching" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <input id="aiTagsInput" type="text" placeholder="Search tags (comma-separated): drywall, trade, mobility" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <div class="grid grid-cols-2 gap-2">
              <select id="aiCountSelect" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white">
                <option value="15">15 Nodes (Branch)</option>
                <option value="30" selected>30 Nodes (Deep)</option>
                <option value="45">45 Nodes (Master)</option>
                <option value="60">60 Nodes (Atlas)</option>
              </select>
              <select id="aiAttrSelect" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white">
                <option value="DEX">DEX (Skill / Craft)</option>
                <option value="STR">STR (Strength / Labor)</option>
                <option value="INT">INT (Systems / Tech)</option>
                <option value="WIS">WIS (Mastery / Arts)</option>
                <option value="CON">CON (Endurance)</option>
                <option value="CHA">CHA (Leadership)</option>
              </select>
            </div>
            <label class="flex items-center space-x-2 text-[11px] text-rose-300 font-bold">
              <input id="aiNsfwChk" type="checkbox" class="accent-rose-500">
              <span>🔞 Tag as NSFW (18+) & use unfiltered explicit prompt mode</span>
            </label>
            <button id="copyAiPromptBtn" type="button" class="w-full py-2.5 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">📋 Copy Prompt for AI</button>
          </div>

          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-emerald-400">Step 2: Paste AI JSON Response</div>
            <textarea id="aiJsonPaste" rows="5" placeholder="Paste the JSON response from your AI here..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"></textarea>
            <label class="flex items-center space-x-2 text-[11px] text-slate-300">
              <input id="aiPublishRealmChk" type="checkbox" checked class="accent-emerald-500">
              <span>Publish to public Server Realm (leave unchecked for private)</span>
            </label>
            <button id="buildTreeFromJsonBtn" type="button" class="w-full py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs">🌳 Generate & Grow World-Tree</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      document.getElementById("closeAiBuilderBtn").onclick = () => modal.classList.add("hidden");
      document.getElementById("copyAiPromptBtn").onclick = async () => {
        const topic = document.getElementById("aiTopicInput").value.trim() || "Complete Skill Mastery";
        const nsfw = document.getElementById("aiNsfwChk").checked;
        const rawTags = document.getElementById("aiTagsInput").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
        if (nsfw && !rawTags.includes("nsfw")) rawTags.push("nsfw");
        const prompt = window.buildAiArchitectPrompt({
          topic,
          count: document.getElementById("aiCountSelect").value,
          attr: document.getElementById("aiAttrSelect").value,
          tags: rawTags,
          nsfw
        });
        await navigator.clipboard.writeText(prompt);
        const btn = document.getElementById("copyAiPromptBtn");
        btn.textContent = "✅ Prompt Copied! Paste into AI & copy JSON back";
        setTimeout(() => { btn.textContent = "📋 Copy Prompt for AI"; }, 3000);
      };

      document.getElementById("buildTreeFromJsonBtn").onclick = async () => {
        const rawText = document.getElementById("aiJsonPaste").value.trim();
        if (!rawText) return alert("Paste the JSON response from your AI first.");
        try {
          const start = rawText.indexOf("{"), end = rawText.lastIndexOf("}");
          if (start < 0 || end < 0) throw new Error("No JSON object found.");
          const data = JSON.parse(rawText.slice(start, end + 1));
          if (!Array.isArray(data.nodes) || !data.nodes.length) throw new Error("Missing 'nodes' array.");

          const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
          const stamp = Date.now();
          const ids = data.nodes.map((_, i) => `ai_${stamp}_${i}`);
          const nsfw = Boolean(data.nsfw || document.getElementById("aiNsfwChk").checked);
          const inputTags = document.getElementById("aiTagsInput").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
          const mergedTags = [...new Set([...(data.tags || []).map(t => String(t).toLowerCase()), ...inputTags, ...(nsfw ? ["nsfw"] : [])])];

          const layout = data.nodes.map((n, i) => {
            const pIdx = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < i) ? n.parentIdx : -1;
            return {
              id: ids[i], parentIdx: pIdx, parentId: pIdx >= 0 ? ids[pIdx] : null,
              title: n.title || `Skill ${i + 1}`, status: "locked",
              tier: n.tier || "Tier I • Foundation", icon: n.icon || "✦", color: n.color || "#38bdf8",
              x: 50, y: 50, notes: n.notes || "",
              image: n.image || window.buildNodeSvgDiagram(n.pose || "blueprint", n.title, n.muscles || n.tier),
              steps: (n.steps || []).map(s => typeof s === "string" ? { text: s, done: false } : s),
              links: n.links || (n.yt ? [{ label: `Video: ${(n.title || "Tutorial").replace(/^\d+\.\s*/, "")}`, url: yt(n.yt) }] : [])
            };
          });

          if (typeof window.computeOrganicTreePositions === "function") {
            window.computeOrganicTreePositions(layout, stamp);
          }

          if (document.getElementById("aiPublishRealmChk").checked) {
            const pubObj = {
              id: `b_ai_${stamp}`, attr: data.attr || "DEX", tag: "Concept",
              nsfw, tags: mergedTags, title: data.title || "AI Skill Tree",
              author: (typeof currentUser !== "undefined" && currentUser?.displayName) || "Architect",
              likes: 1, nodes: layout
            };
            if (typeof baseConceptTrees !== "undefined") baseConceptTrees.unshift(pubObj);
            if (typeof publicTreesCache !== "undefined") publicTreesCache.unshift(pubObj);
            if (typeof db !== "undefined" && db) {
              try { await db.collection("publicTrees").doc(pubObj.id).set(pubObj); } catch (e) {}
            }
          }

          await createNewTree(data.title || "AI Skill Tree", data.attr || "DEX", layout);
          modal.classList.add("hidden");
          document.getElementById("aiJsonPaste").value = "";
          navigate("viewTrees", "My Constellations");
        } catch (err) {
          alert("JSON Parse Error: " + err.message);
        }
      };
    }
    if (prefill.topic) document.getElementById("aiTopicInput").value = prefill.topic;
    modal.classList.remove("hidden");
  };

  injectBuilderButton();
  new MutationObserver(injectBuilderButton).observe(document.body, { childList: true, subtree: true });
})();
