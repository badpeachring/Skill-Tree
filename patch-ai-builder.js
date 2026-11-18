(function installAiTreeBuilderAndBranchExpander() {
  window.buildNodeSvgDiagram = function(pose, title, subtitle) {
    const poses = {
      blueprint: `<rect x="85" y="42" width="150" height="66" rx="6" fill="rgba(56,189,248,0.12)" stroke="#38bdf8" stroke-width="2"/><line x1="85" y1="64" x2="235" y2="64" stroke="#10b981" stroke-width="2" stroke-dasharray="5,4"/><line x1="85" y1="86" x2="235" y2="86" stroke="#f59e0b" stroke-width="2"/><circle cx="160" cy="75" r="10" fill="rgba(16,185,129,0.45)"/>`,
      circuit: `<circle cx="105" cy="75" r="10" fill="#38bdf8"/><circle cx="215" cy="75" r="10" fill="#10b981"/><path d="M115,75 L145,75 L155,55 L165,95 L175,75 L205,75" stroke="#10b981" stroke-width="3" fill="none"/>`
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 150"><rect width="320" height="150" fill="#020617"/>${poses[pose] || poses.blueprint}<text x="12" y="18" fill="#38bdf8" font-family="sans-serif" font-size="10" font-weight="bold">${(title || "").slice(0, 40)}</text><text x="12" y="140" fill="#34d399" font-family="sans-serif" font-size="9">SPEC: ${(subtitle || "Core Skill").slice(0, 48)}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  window.buildAiArchitectPrompt = function({ topic, count, attr, tags, nsfw }) {
    const toneLine = nsfw ? `Tagged 21+ NSFW: be maximally candid, anatomical, and explicit.` : `Be technical, concrete, and actionable.`;
    return `Build a progressive skill tree for "${topic}" with ${count} nodes. ${toneLine}
Structure as clean sequential category spines: only fork from a root or category hub when starting a new sub-discipline.
Include a mix of Reading Nodes (no steps, learn by reading) and Quest Nodes (include 2 practice steps + a prerequisite step like "Prerequisite: Master/Unlock Node #1 first").
Return ONLY raw JSON:
{"title":"${topic}","attr":"${attr}","tag":"Concept","nsfw":${Boolean(nsfw)},"tags":${JSON.stringify(tags)},"nodes":[{"parentIdx":-1,"title":"1. Foundation","tier":"Category I • 📖 Reading Node","icon":"📖","color":"#38bdf8","tags":["core"],"notes":"MECHANICS: ...\\nPREREQUISITE: None","steps":[],"yt":"tutorial query"}]}`;
  };

  window.openAiBuilderModal = function(prefill = {}) {
    let modal = document.getElementById("aiBuilderModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "aiBuilderModal";
      modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
      modal.innerHTML = `
        <div class="w-full max-w-md glass-panel rounded-2xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-3">
          <div class="flex justify-between items-center"><h2 class="text-lg font-black text-emerald-400 skyrim-font">✨ AI Skill Tree Generator</h2><button id="closeAiBuilderBtn" type="button" class="text-slate-400 text-base px-2">✕</button></div>
          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-sky-400">Step 1: Topic, Tags & Node Count</div>
            <input id="aiTopicInput" type="text" placeholder="e.g., Abstract Vocabulary, or Timber Framing" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <input id="aiTagsInput" type="text" placeholder="#hashtags (comma separated): vocabulary, carpentry" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none">
            <div class="grid grid-cols-2 gap-2">
              <select id="aiCountSelect" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"><option value="12">12 Nodes (Fast)</option><option value="15" selected>15 Nodes (Recommended)</option></select>
              <select id="aiAttrSelect" class="bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white"><option value="WIS">WIS (Wisdom / Lexicon)</option><option value="DEX">DEX (Skill / Craft)</option><option value="STR">STR (Strength)</option><option value="INT">INT (Systems)</option><option value="CON">CON (Endurance)</option><option value="CHA">CHA (Rhetoric)</option></select>
            </div>
            <label class="flex items-center space-x-2 text-[11px] text-rose-300 font-bold"><input id="aiNsfwChk" type="checkbox" class="accent-rose-500"><span>🔞 Tag as 21+ / NSFW</span></label>
            <button id="genAiPromptBtn" type="button" class="w-full py-2 bg-sky-500 text-slate-950 rounded-lg font-bold text-xs">1. Generate & Copy Prompt</button>
            <textarea id="aiPromptPreview" rows="3" readonly class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 font-mono"></textarea>
            <a href="https://gemini.google.com/app" target="_blank" class="block text-center py-1.5 bg-slate-800 border border-sky-500/30 rounded-lg text-[11px] font-bold text-sky-300">↗ Open Gemini to Paste Prompt</a>
          </div>
          <div class="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div class="text-[11px] font-bold uppercase text-emerald-400">Step 2: Paste AI JSON Reply</div>
            <textarea id="aiJsonPaste" rows="4" placeholder="Paste JSON reply here..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 font-mono outline-none"></textarea>
            <label class="flex items-center space-x-2 text-[11px] text-slate-300"><input id="aiPublishRealmChk" type="checkbox" checked class="accent-emerald-500"><span>Publish to public Server Realm</span></label>
            <button id="buildTreeFromJsonBtn" type="button" class="w-full py-2.5 bg-emerald-500 text-slate-950 rounded-lg font-black text-xs">🌳 Grow Space-Tree Now</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      document.getElementById("closeAiBuilderBtn").onclick = () => modal.classList.add("hidden");
      document.getElementById("genAiPromptBtn").onclick = async () => {
        const topic = document.getElementById("aiTopicInput").value.trim() || "Skill Mastery";
        const nsfw = document.getElementById("aiNsfwChk").checked;
        const rawTags = document.getElementById("aiTagsInput").value.split(",").map(s => s.replace(/^#/, "").trim().toLowerCase()).filter(Boolean);
        if (nsfw && !rawTags.includes("nsfw")) rawTags.push("nsfw");
        const prompt = window.buildAiArchitectPrompt({ topic, count: document.getElementById("aiCountSelect").value, attr: document.getElementById("aiAttrSelect").value, tags: rawTags, nsfw });
        document.getElementById("aiPromptPreview").value = prompt;
        try { await navigator.clipboard.writeText(prompt); } catch {}
        document.getElementById("genAiPromptBtn").textContent = "✅ Prompt Copied!";
      };
      document.getElementById("buildTreeFromJsonBtn").onclick = async () => {
        const rawText = document.getElementById("aiJsonPaste").value.trim();
        if (!rawText) return alert("Paste the JSON reply first.");
        try {
          const data = JSON.parse(rawText.slice(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1));
          const stamp = Date.now(), ids = data.nodes.map((_, i) => `ai_${stamp}_${i}`);
          const nsfw = Boolean(data.nsfw || document.getElementById("aiNsfwChk").checked);
          const inputTags = document.getElementById("aiTagsInput").value.split(",").map(s => s.replace(/^#/, "").trim().toLowerCase()).filter(Boolean);
          const mergedTags = [...new Set([...(data.tags || []).map(t => String(t).replace(/^#/, "").toLowerCase()), ...inputTags, ...(nsfw ? ["nsfw"] : [])])];
          const layout = data.nodes.map((n, i) => {
            const pIdx = (typeof n.parentIdx === "number" && n.parentIdx >= 0 && n.parentIdx < i) ? n.parentIdx : -1;
            return {
              id: ids[i], parentIdx: pIdx, parentId: pIdx >= 0 ? ids[pIdx] : null,
              title: n.title || `Skill ${i + 1}`, status: pIdx < 0 ? "learning" : "locked",
              tier: n.tier || "Category I", icon: n.icon || "📖", color: n.color || "#38bdf8",
              x: 50, y: 50, tags: n.tags || mergedTags, notes: n.notes || "",
              image: window.buildNodeSvgDiagram("blueprint", n.title, n.tier),
              steps: (n.steps || []).map(s => typeof s === "string" ? { text: s, done: false } : s),
              links: n.yt ? [{ label: `Video: ${n.title}`, url: `https://www.youtube.com/results?search_query=${encodeURIComponent(n.yt)}` }] : []
            };
          });
          window.computeOrganicTreePositions?.(layout, stamp);
          if (document.getElementById("aiPublishRealmChk").checked) {
            const pubObj = { id: `b_ai_${stamp}`, attr: data.attr || "WIS", tag: "Concept", nsfw, tags: mergedTags, title: data.title || "AI Tree", author: "sethmcnab13", likes: 0, nodes: layout };
            if (typeof baseConceptTrees !== "undefined") baseConceptTrees.unshift(pubObj);
            if (typeof db !== "undefined" && db) { try { await db.collection("publicTrees").doc(pubObj.id).set(pubObj); } catch {} }
          }
          await createNewTree(data.title || "AI Tree", data.attr || "WIS", layout);
          modal.classList.add("hidden"); document.getElementById("aiJsonPaste").value = "";
          navigate("viewTrees", "My Constellations");
        } catch (err) { alert("JSON Error: " + err.message); }
      };
    }
    if (prefill.topic) document.getElementById("aiTopicInput").value = prefill.topic;
    modal.classList.remove("hidden");
  };

  window.openBranchExpanderModal = async function() {
    const sel = document.getElementById("treeSelect");
    const curTitle = sel?.options[sel.selectedIndex]?.text?.trim() || "My Tree";
    let modal = document.getElementById("branchGrowerModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "branchGrowerModal";
      modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4";
      modal.innerHTML = `<div class="w-full max-w-md glass-panel rounded-2xl p-5 space-y-3"><div class="flex justify-between items-center"><h2 class="text-base font-black text-emerald-400 skyrim-font">🌿 AI Branch Grower (+10 Nodes)</h2><button id="closeBgBtn" class="text-slate-400">✕</button></div><input id="growFocusIn" type="text" placeholder="Focus or new category branch..." class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"><button id="genBgPromptBtn" class="w-full py-2 bg-sky-500 text-slate-950 font-bold rounded-lg text-xs">1. Generate & Copy Expansion Prompt</button><textarea id="bgPromptBox" rows="3" readonly class="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-[10px] text-slate-300 font-mono"></textarea><textarea id="bgJsonIn" rows="4" placeholder="Paste AI JSON here..." class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"></textarea><button id="mergeBgBtn" class="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs">✨ Merge New Branches</button></div>`;
      document.body.appendChild(modal);
      document.getElementById("closeBgBtn").onclick = () => modal.classList.add("hidden");
    }
    document.getElementById("genBgPromptBtn").onclick = async () => {
      const p = `Extend skill tree "${curTitle}" with 10 sequential nodes focusing on "${document.getElementById("growFocusIn").value || "Advanced mastery"}". Include prerequisite node references in steps. Return ONLY raw JSON: {"newNodes":[{"attachToExistingIdx":0,"title":"Next Node","tier":"Category • ⚔ Quest Node","icon":"⚔","tags":["tag"],"notes":"...","steps":["Step 1","Prerequisite: Unlock previous node"]}]}`;
      document.getElementById("bgPromptBox").value = p;
      try { await navigator.clipboard.writeText(p); } catch {}
    };
    document.getElementById("mergeBgBtn").onclick = async () => {
      try {
        const data = JSON.parse(document.getElementById("bgJsonIn").value.match(/\{[\s\S]*\}/)[0]);
        const t = (typeof userData !== "undefined" && userData?.trees || []).find(x => x.id === sel?.value || x.title === curTitle);
        if (!t) return alert("Open a tree in My Constellations first.");
        (data.newNodes || data.nodes || []).forEach((n, i) => {
          const pIdx = typeof n.attachToExistingIdx === "number" && t.nodes[n.attachToExistingIdx] ? n.attachToExistingIdx : Math.max(0, t.nodes.length - 1);
          t.nodes.push({ id: `g_${Date.now()}_${i}`, parentIdx: pIdx, parentId: t.nodes[pIdx]?.id || null, title: n.title, status: "locked", tier: n.tier || "Tier II", icon: n.icon || "✦", color: "#38bdf8", x: 50, y: 50, tags: n.tags || [], notes: n.notes || "", steps: (n.steps || []).map(s => ({ text: s, done: false })) });
        });
        window.computeOrganicTreePositions?.(t.nodes, Date.now());
        await saveUserData?.(); renderActiveTree?.(); modal.classList.add("hidden");
      } catch (e) { alert("Merge Error: " + e.message); }
    };
    modal.classList.remove("hidden");
  };
})();
