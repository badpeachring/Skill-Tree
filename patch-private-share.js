(function installAiTreeBuilderAndBranchExpander() {
  window.buildNodeSvgDiagram = function(pose, title, subtitle) {
    const poses = {
      breath: `<circle cx="160" cy="36" r="11" fill="#38bdf8"/><line x1="160" y1="47" x2="160" y2="95" stroke="#94a3b8" stroke-width="5"/><ellipse cx="160" cy="70" rx="18" ry="13" fill="rgba(16,185,129,0.35)" stroke="#10b981" stroke-width="2"/><line x1="160" y1="95" x2="132" y2="128" stroke="#94a3b8" stroke-width="4"/><line x1="160" y1="95" x2="188" y2="128" stroke="#94a3b8" stroke-width="4"/>`,
      shoulder: `<circle cx="135" cy="48" r="10" fill="#38bdf8"/><line x1="135" y1="58" x2="175" y2="95" stroke="#94a3b8" stroke-width="5"/><line x1="142" y1="64" x2="195" y2="42" stroke="#10b981" stroke-width="5"/><circle cx="152" cy="62" r="12" fill="rgba(16,185,129,0.38)"/>`,
      spine: `<circle cx="110" cy="78" r="10" fill="#38bdf8"/><path d="M118,84 Q160,42 204,88" stroke="#10b981" stroke-width="6" fill="none"/><line x1="204" y1="88" x2="215" y2="124" stroke="#94a3b8" stroke-width="4"/>`,
      hip: `<circle cx="152" cy="34" r="10" fill="#38bdf8"/><line x1="152" y1="44" x2="152" y2="86" stroke="#94a3b8" stroke-width="5"/><line x1="152" y1="86" x2="198" y2="86" stroke="#10b981" stroke-width="5"/><line x1="152" y1="86" x2="108" y2="118" stroke="#10b981" stroke-width="5"/>`,
      blueprint: `<rect x="85" y="42" width="150" height="66" rx="6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/><line x1="85" y1="64" x2="235" y2="64" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4"/><line x1="85" y1="86" x2="235" y2="86" stroke="#f59e0b" stroke-width="2"/><circle cx="160" cy="75" r="10" fill="rgba(16,185,129,0.45)"/>`,
      tool: `<rect x="105" y="68" width="90" height="14" rx="4" fill="#94a3b8"/><polygon points="195,62 225,75 195,88" fill="#10b981"/><circle cx="118" cy="75" r="12" fill="rgba(56,189,248,0.35)" stroke="#38bdf8" stroke-width="2"/>`,
      circuit: `<circle cx="105" cy="75" r="10" fill="#38bdf8"/><circle cx="215" cy="75" r="10" fill="#10b981"/><path d="M115,75 L145,75 L155,55 L165,95 L175,75 L205,75" stroke="#10b981" stroke-width="3" fill="none"/>`
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><defs><radialGradient id="bg" cx="50%" cy="45%" r="65%"><stop offset="0%" stop-color="#0f292e"/><stop offset="100%" stop-color="#020617"/></radialGradient></defs><rect width="320" height="150" fill="url(#bg)"/><g stroke="rgba(56,189,248,0.08)" stroke-width="1"><line x1="0" y1="30" x2="320" y2="30"/><line x1="0" y1="75" x2="320" y2="75"/><line x1="0" y1="120" x2="320" y2="120"/><line x1="80" y1="0" x2="80" y2="150"/><line x1="160" y1="0" x2="160" y2="150"/><line x1="240" y1="0" x2="240" y2="150"/></g>${poses[pose] || poses.blueprint}<text x="12" y="18" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold">${(title || "").slice(0, 40)}</text><text x="12" y="140" fill="#34d399" font-family="sans-serif" font-size="9">SPEC: ${(subtitle || "Core Skill").slice(0, 48)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  window.buildAiArchitectPrompt = function({ topic, count, attr, tags, nsfw }) {
    const toneLine = nsfw
      ? `This tree is tagged 21+ NSFW. Be maximally direct, candid, anatomical, and explicit—no euphemisms.`
      : `Be maximally specific, technical, and actionable with exact specs, angles, ratios, or anatomical cues.`;
    return `Build a foundational bottom-up skill tree for "${topic}" with ${count} progressive nodes.
${toneLine}
Return ONLY raw valid JSON matching this schema:
{
  "title": "${topic}",
  "attr": "${attr}",
  "tag": "Concept",
  "nsfw": ${Boolean(nsfw)},
  "tags": ${JSON.stringify(tags)},
  "nodes": [
    {
      "parentIdx": -1,
      "title": "1. Foundation Skill",
      "tier": "Tier I • Foundation",
      "icon": "✦",
      "color": "#38bdf8",
      "pose": "blueprint",
      "muscles": "Target specs or tools",
      "notes": "MECHANICS: Exact step-by-step execution.\\nPRO CUES: Key feedback.\\nMISTAKES: What to avoid.",
      "steps": ["Verification drill 1", "Verification drill 2"],
      "yt": "youtube tutorial search query"
    }
  ]
}
Rules: Nodes 0-2 have "parentIdx": -1; every other node's "parentIdx" is < its own index. Keep notes concise (2-3 sentences per node) so the JSON never truncates.`;
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
            <h2 class="text-lg font-black text-emerald-400 skyrim-font">✨ AI Skill Tree Generator</h2>
            <button id="closeAiBuilderBtn" type="button" class="text-slate-400 text-base px-2">✕</button>
          </div>
          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-sky-400">Step 1: Start with 10–15 Core Nodes (Expand Anytime Inside Tree!)</div>
            <input id="aiTopicInput" type="text" placeholder="e.g., Drywall Level 5 Finishing, or Full-Body Splits" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <input id="aiTagsInput" type="text" placeholder="Tags: drywall, trade, mobility" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <div class="grid grid-cols-2 gap-2">
              <select id="aiCountSelect" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white">
                <option value="10">10 Nodes (Fast & Clean)</option>
                <option value="15" selected>15 Nodes (Recommended)</option>
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
              <span>🔞 Tag as 21+ / NSFW (explicit direct prompt mode)</span>
            </label>
            <button id="genAiPromptBtn" type="button" class="w-full py-2 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">1. Generate & Copy Prompt</button>
            <textarea id="aiPromptPreview" rows="3" readonly placeholder="Generated AI prompt appears here..." class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 font-mono"></textarea>
            <a href="https://gemini.google.com/app" target="_blank" class="block text-center py-1.5 bg-slate-800 border border-sky-500/30 rounded-lg text-[11px] font-bold text-sky-300">↗ Open Gemini in New Tab to Paste Prompt</a>
          </div>
          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-emerald-400">Step 2: Paste AI JSON Reply</div>
            <textarea id="aiJsonPaste" rows="4" placeholder="Paste the JSON reply from your AI here..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"></textarea>
            <label class="flex items-center space-x-2 text-[11px] text-slate-300">
              <input id="aiPublishRealmChk" type="checkbox" checked class="accent-emerald-500">
              <span>Share to public Server Realm (uncheck to keep private)</span>
            </label>
            <button id="buildTreeFromJsonBtn" type="button" class="w-full py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs">🌳 Grow 360° Space-Tree Now</button>
          </div>
        </div>`;
      document.body.appendChild(modal);

      document.getElementById("closeAiBuilderBtn").onclick = () => modal.classList.add("hidden");
      document.getElementById("genAiPromptBtn").onclick = async () => {
        const topic = document.getElementById("aiTopicInput").value.trim() || "Complete Skill Mastery";
        const nsfw = document.getElementById("aiNsfwChk").checked;
        const rawTags = document.getElementById("aiTagsInput").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
        if (nsfw && !rawTags.includes("nsfw")) rawTags.push("nsfw");
        const prompt = window.buildAiArchitectPrompt({
          topic, count: document.getElementById("aiCountSelect").value, attr: document.getElementById("aiAttrSelect").value, tags: rawTags, nsfw
        });
        document.getElementById("aiPromptPreview").value = prompt;
        try { await navigator.clipboard.writeText(prompt); } catch {}
        document.getElementById("genAiPromptBtn").textContent = "✅ Prompt Copied!";
      };

      document.getElementById("buildTreeFromJsonBtn").onclick = async () => {
        const rawText = document.getElementById("aiJsonPaste").value.trim();
        if (!rawText) return alert("Paste the JSON reply from your AI first.");
        try {
          const start = rawText.indexOf("{"), end = rawText.lastIndexOf("}");
          const data = JSON.parse(rawText.slice(start, end + 1));
          const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
          const stamp = Date.now();
          const ids = data.nodes.map((_, i) => `ai_${stamp}_${i}`);
          const nsfw = Boolean(data.nsfw || document.getElementById("aiNsfwChk").checked);
          const inputTags = document.getElementById("aiTagsInput").value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
          const mergedTags = [...new Set([...(data.tags || []).map(t => String(t).toLowerCase()), ...inputTags, ...(nsfw ? ["nsfw"] : [])])];

          const layout = data.nodes.map((n, i) => {
            const pIdx = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < i) ? n.parentIdx : -1;
            const validImg = (n.image && (n.image.startsWith("data:image") || n.image.startsWith("https://"))) ? n.image : "";
            return {
              id: ids[i], parentIdx: pIdx, parentId: pIdx >= 0 ? ids[pIdx] : null,
              title: n.title || `Skill ${i + 1}`, status: "locked",
              tier: n.tier || "Tier I • Foundation", icon: n.icon || "✦", color: n.color || "#38bdf8",
              x: 50, y: 50, notes: n.notes || "",
              image: validImg || window.buildNodeSvgDiagram(n.pose || "blueprint", n.title, n.muscles || n.tier),
              steps: (n.steps || []).map(s => typeof s === "string" ? { text: s, done: false } : s),
              links: n.links || (n.yt ? [{ label: `Video: ${(n.title || "Tutorial").replace(/^\d+\.\s*/, "")}`, url: yt(n.yt) }] : [])
            };
          });

          if (typeof window.computeOrganicTreePositions === "function") window.computeOrganicTreePositions(layout, stamp);

          if (document.getElementById("aiPublishRealmChk").checked) {
            const pubObj = {
              id: `b_ai_${stamp}`, attr: data.attr || "DEX", tag: "Concept",
              nsfw, tags: mergedTags, title: data.title || "AI Skill Tree",
              author: "Architect", likes: 0, nodes: layout
            };
            if (typeof baseConceptTrees !== "undefined") baseConceptTrees.unshift(pubObj);
            if (typeof publicTreesCache !== "undefined") publicTreesCache.unshift(pubObj);
            if (typeof db !== "undefined" && db) { try { await db.collection("publicTrees").doc(pubObj.id).set(pubObj); } catch {} }
          }

          await createNewTree(data.title || "AI Skill Tree", data.attr || "DEX", layout);
          modal.classList.add("hidden");
          document.getElementById("aiJsonPaste").value = "";
          navigate("viewTrees", "My Constellations");
        } catch (err) {
          alert("JSON Error (try generating 10-15 nodes so it doesn't cut off): " + err.message);
        }
      };
    }
    if (prefill.topic) document.getElementById("aiTopicInput").value = prefill.topic;
    modal.classList.remove("hidden");
  };

  // Iterative Branch Expander inside My Constellations (grows 10 new nodes onto an existing tree without truncation)
  window.openBranchExpanderModal = async function() {
    const sel = document.getElementById("treeSelect");
    const curTitle = sel && sel.selectedIndex >= 0 ? sel.options[sel.selectedIndex].text.trim() : "My Skill Tree";
    let existingNodes = [];
    if (typeof userData !== "undefined" && Array.isArray(userData?.trees)) {
      const t = userData.trees.find(x => x.id === sel?.value || x.title === curTitle) || userData.trees[0];
      if (t) existingNodes = t.nodes || [];
    }

    let modal = document.getElementById("branchGrowerModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "branchGrowerModal";
      modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
      modal.innerHTML = `
        <div class="w-full max-w-md glass-panel rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-3">
          <div class="flex justify-between items-center">
            <h2 class="text-base font-black text-emerald-400 skyrim-font">🌿 AI Branch Grower (+10 Nodes)</h2>
            <button id="closeBranchGrowBtn" type="button" class="text-slate-400 text-base px-2">✕</button>
          </div>
          <p class="text-[11px] text-slate-300">Safely grow 10 deeper progression nodes attached directly to your existing branches without truncating.</p>
          <input id="growFocusInput" type="text" placeholder="Optional focus (e.g., Advanced Variations, Troubleshooting)" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
          <button id="genGrowPromptBtn" type="button" class="w-full py-2 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">1. Generate & Copy Expansion Prompt</button>
          <textarea id="growPromptBox" rows="3" readonly class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 font-mono"></textarea>
          <textarea id="growJsonPaste" rows="4" placeholder="Paste the AI's JSON expansion reply here..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono outline-none"></textarea>
          <button id="mergeBranchBtn" type="button" class="w-full py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs">✨ Merge New Branches Into Tree</button>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById("closeBranchGrowBtn").onclick = () => modal.classList.add("hidden");
    }

    document.getElementById("genGrowPromptBtn").onclick = async () => {
      const focus = document.getElementById("growFocusInput").value.trim() || "Next-tier advanced progressions";
      const summary = existingNodes.map((n, i) => `${i}: ${n.title}`).join("\n");
      const prompt = `Here is my existing skill tree "${curTitle}" (0-based node indices):\n${summary || "0: Core Foundation"}\n\nGenerate 10 NEW advanced child nodes focusing on: "${focus}".\nReturn ONLY raw JSON:\n{"newNodes":[{"attachToExistingIdx":0,"title":"Next Skill","tier":"Tier III • Specialist","icon":"✦","color":"#38bdf8","pose":"blueprint","notes":"MECHANICS: ...\\nPRO CUES: ...","steps":["Step 1"],"yt":"tutorial search"}]}\nRule: "attachToExistingIdx" must be one of the existing node indices listed above so the new branches flow naturally from the existing tree.`;
      document.getElementById("growPromptBox").value = prompt;
      try { await navigator.clipboard.writeText(prompt); } catch {}
      document.getElementById("genGrowPromptBtn").textContent = "✅ Expansion Prompt Copied!";
    };

    document.getElementById("mergeBranchBtn").onclick = async () => {
      const raw = document.getElementById("growJsonPaste").value.trim();
      if (!raw) return alert("Paste the AI JSON first.");
      try {
        const data = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
        const additions = data.newNodes || data.nodes || [];
        const stamp = Date.now();
        const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

        let targetTree = null;
        if (typeof userData !== "undefined" && Array.isArray(userData?.trees)) {
          targetTree = userData.trees.find(x => x.id === sel?.value || x.title === curTitle) || userData.trees[0];
        }
        if (!targetTree) throw new Error("Open a tree in My Constellations first.");

        additions.forEach((n, i) => {
          const pIdx = typeof n.attachToExistingIdx === "number" && targetTree.nodes[n.attachToExistingIdx] ? n.attachToExistingIdx : Math.max(0, targetTree.nodes.length - 1);
          const parentNode = targetTree.nodes[pIdx];
          targetTree.nodes.push({
            id: `grow_${stamp}_${i}`,
            parentIdx: pIdx,
            parentId: parentNode ? parentNode.id : null,
            title: n.title || `Expanded Skill ${i + 1}`,
            status: "locked",
            tier: n.tier || "Tier III • Specialist",
            icon: n.icon || "✦",
            color: n.color || "#38bdf8",
            x: 50, y: 50,
            notes: n.notes || "",
            image: window.buildNodeSvgDiagram(n.pose || "blueprint", n.title, n.tier),
            steps: (n.steps || []).map(s => typeof s === "string" ? { text: s, done: false } : s),
            links: n.yt ? [{ label: `Video: ${n.title}`, url: yt(n.yt) }] : []
          });
        });

        if (typeof window.computeOrganicTreePositions === "function") window.computeOrganicTreePositions(targetTree.nodes, stamp);
        if (typeof saveUserData === "function") await saveUserData();
        if (typeof renderActiveTree === "function") renderActiveTree();
        modal.classList.add("hidden");
        document.getElementById("growJsonPaste").value = "";
      } catch (err) {
        alert("Merge Error: " + err.message);
      }
    };

    modal.classList.remove("hidden");
  };
})();
