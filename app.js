const firebaseConfig = {
  apiKey: "AIzaSyBaAcBLfnUulVRxlGx8YKyXFQrm-fIYsns",
  authDomain: "skill-tree-4cffd.firebaseapp.com",
  projectId: "skill-tree-4cffd",
  storageBucket: "skill-tree-4cffd.firebasestorage.app",
  messagingSenderId: "482405207638",
  appId: "1:482405207638:web:1a2a944ab4d8036e1ab5f7"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null, selectedTree = "Culinary Arts", activeNode = null, quoteIdx = 0;
let currentTheme = localStorage.getItem("skill_tree_theme") || "skyrim";

const quotes = [
  { t: "A disciplined mind focuses on what lies within its own control, finding unshakable strength regardless of external chaos.", a: "Stoic Principle" },
  { t: "True mastery begins the moment you examine the hidden patterns of your own habits and consciously shape them.", a: "Depth Psychology" },
  { t: "We are shaped by our repeated actions; excellence is never a single event, but a deliberate daily craft.", a: "Classical Ethics" },
  { t: "When you treat skill acquisition like an open-world quest, every setback becomes experience points rather than defeat.", a: "The Grimoire" }
];

const defaultTrees = {
  "Culinary Arts": {
    attr: "WIS",
    nodes: [
      { id: "c1", title: "Knife Fundamentals", status: "mastered", icon: "⚔", color: "theme", x: 50, y: 82, media: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500", notes: "Curl guide fingers inward; use a smooth rocking motion.", parentId: null },
      { id: "c2", title: "Thermal Control", status: "learning", icon: "🔥", color: "theme", x: 30, y: 58, media: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500", notes: "Preheat heavy pans thoroughly; let proteins release naturally.", parentId: "c1" },
      { id: "c3", title: "Broths & Reductions", status: "locked", icon: "🌿", color: "theme", x: 70, y: 58, media: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500", notes: "Bare simmer to extract gelatin without clouding.", parentId: "c1" }
    ]
  },
  "Structural Framing": {
    attr: "STR",
    nodes: [
      { id: "f1", title: "Layout & Square", status: "mastered", icon: "◆", color: "theme", x: 50, y: 82, media: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500", notes: "Pull from one reference edge; confirm square with 3-4-5.", parentId: null },
      { id: "f2", title: "Precision Sawing", status: "mastered", icon: "⚒", color: "theme", x: 32, y: 58, media: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500", notes: "Account for 1/8-inch blade kerf on the waste side.", parentId: "f1" },
      { id: "f3", title: "Wall Assemblies", status: "learning", icon: "🛡", color: "theme", x: 68, y: 58, media: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500", notes: "16-inch on-center layout; orient lumber crowns upward.", parentId: "f1" }
    ]
  }
};

let userTreeData = JSON.parse(JSON.stringify(defaultTrees));

const tutSteps = [
  { b: "Step 1 of 4 • The Quest Board", t: "Treat Real Life Like an RPG", d: "Most people spend thousands of hours leveling up video game characters while letting real-world skills fade. This grimoire turns everything you learn into permanent constellations." },
  { b: "Step 2 of 4 • Building Constellations", t: "Map Every Skill & Blueprint", d: "Tap any star node to set its rank (Locked, Learning, Mastered), pick custom icons and colors, and record step-by-step notes so you never forget." },
  { b: "Step 3 of 4 • D&D Attributes & Relics", t: "Level Up Your Character Sheet", d: "Every tree feeds into STR, DEX, CON, INT, WIS, and CHA. Adding 30 nodes completes a constellation and unlocks relics at 30, 60, 90, 120, and 150 nodes." },
  { b: "Step 4 of 4 • The Manifesto", t: "Hold Onto Mastery & Pass It Forward", d: "Catalog your masteries clearly so you build a living manual you can revisit anytime and effortlessly share with friends or apprentices." }
];
let tutIdx = 0;

function setTheme(t) {
  currentTheme = t;
  localStorage.setItem("skill_tree_theme", t);
  document.body.className = `theme-${t} h-screen w-screen overflow-hidden flex flex-col select-none`;
  renderTree(); renderTrophies();
}
setTheme(currentTheme);

function switchView(id) {
  ["viewHome", "viewTrees", "viewStats", "viewTrophies", "viewSettings"].forEach(v => document.getElementById(v).classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  if (id === "viewTrees") setTimeout(resizeCanvas, 30);
  if (id === "viewStats") renderStats();
  if (id === "viewTrophies") renderTrophies();
}

document.getElementById("homeNavBtn").onclick = () => switchView("viewHome");
document.getElementById("navTreesBtn").onclick = () => switchView("viewTrees");
document.getElementById("navStatsBtn").onclick = () => switchView("viewStats");
document.getElementById("navSettingsBtn").onclick = () => switchView("viewSettings");
document.getElementById("nextQuoteBtn").onclick = () => {
  quoteIdx = (quoteIdx + 1) % quotes.length;
  document.getElementById("quoteText").textContent = `"${quotes[quoteIdx].t}"`;
  document.getElementById("quoteAuthor").textContent = `— ${quotes[quoteIdx].a}`;
};

function openTutorial() { tutIdx = 0; updateTut(); document.getElementById("tutorialModal").classList.remove("hidden"); }
function closeTutorial() { document.getElementById("tutorialModal").classList.add("hidden"); localStorage.setItem("skill_tree_tut_seen", "true"); }
function updateTut() {
  const s = tutSteps[tutIdx];
  document.getElementById("tutStepBadge").textContent = s.b;
  document.getElementById("tutTitle").textContent = s.t;
  document.getElementById("tutBody").textContent = s.d;
  document.getElementById("tutPrevBtn").classList.toggle("hidden", tutIdx === 0);
  document.getElementById("tutNextBtn").textContent = tutIdx === tutSteps.length - 1 ? "Begin Journey" : "Next";
}
document.getElementById("tutPrevBtn").onclick = () => { if (tutIdx > 0) { tutIdx--; updateTut(); } };
document.getElementById("tutNextBtn").onclick = () => { tutIdx < tutSteps.length - 1 ? (tutIdx++, updateTut()) : closeTutorial(); };

function showAuth(msg, err = true) {
  const el = document.getElementById("authStatus");
  el.textContent = msg;
  el.className = err ? "text-xs text-red-400" : "text-xs text-sky-400";
  el.classList.remove("hidden");
}

document.getElementById("signUpBtn").onclick = async () => {
  showAuth("Forging account...", false);
  try { await auth.createUserWithEmailAndPassword(document.getElementById("authEmail").value.trim(), document.getElementById("authPassword").value); localStorage.removeItem("skill_tree_tut_seen"); }
  catch (e) { showAuth(e.message, true); }
};
document.getElementById("signInBtn").onclick = async () => {
  showAuth("Entering realm...", false);
  try { await auth.signInWithEmailAndPassword(document.getElementById("authEmail").value.trim(), document.getElementById("authPassword").value); }
  catch (e) { showAuth(e.message, true); }
};
document.getElementById("logOutBtn").onclick = () => auth.signOut();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    document.getElementById("authStatus").classList.add("hidden");
    document.getElementById("authScreen").classList.add("hidden");
    await loadUserData();
    if (!localStorage.getItem("skill_tree_tut_seen")) openTutorial();
  } else {
    currentUser = null;
    document.getElementById("authScreen").classList.remove("hidden");
  }
});

async function loadUserData() {
  try {
    const doc = await db.collection("user_trees").doc(currentUser.uid).get();
    if (doc.exists && doc.data().rpgTrees) userTreeData = doc.data().rpgTrees;
    else { userTreeData = JSON.parse(JSON.stringify(defaultTrees)); await saveUserData(); }
  } catch (e) { console.error(e); }
  updateTreeDropdown(); renderStats(); renderTree();
}

async function saveUserData() {
  if (!currentUser) return;
  await db.collection("user_trees").doc(currentUser.uid).set({ rpgTrees: userTreeData }, { merge: true });
  renderStats();
}

function updateTreeDropdown() {
  const keys = Object.keys(userTreeData);
  if (!keys.includes(selectedTree) && keys.length) selectedTree = keys[0];
  document.getElementById("treeSelect").innerHTML = keys.map(k => `<option value="${k}" ${k === selectedTree ? "selected" : ""}>${k}</option>`).join("");
  document.getElementById("treeAttrBadge").textContent = userTreeData[selectedTree]?.attr || "WIS";
}
document.getElementById("treeSelect").onchange = (e) => { selectedTree = e.target.value; updateTreeDropdown(); renderTree(); };

document.getElementById("newTreeBtn").onclick = async () => {
  const name = prompt("Name of your new Skill Tree:");
  if (!name || userTreeData[name]) return;
  const a = (prompt("Primary D&D Attribute (STR, DEX, CON, INT, WIS, or CHA):", "WIS") || "WIS").toUpperCase();
  userTreeData[name] = {
    attr: ["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(a) ? a : "WIS",
    nodes: [{ id: "n_" + Date.now(), title: "Core Foundation", status: "learning", icon: "★", color: "theme", x: 50, y: 82, media: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500", notes: "Foundational principles for " + name, parentId: null }]
  };
  selectedTree = name; updateTreeDropdown(); renderTree(); await saveUserData();
};

function resizeCanvas() {
  const c = document.getElementById("treeCanvas");
  if (!c.parentElement) return;
  c.width = c.parentElement.clientWidth; c.height = c.parentElement.clientHeight;
  renderTree();
}
window.addEventListener("resize", resizeCanvas);

function renderTree() {
  const treeObj = userTreeData[selectedTree];
  if (!treeObj) return;
  const nodes = treeObj.nodes || [], c = document.getElementById("treeCanvas"), ctx = c.getContext("2d"), box = document.getElementById("nodesContainer");
  document.getElementById("treeNodeCount").textContent = `${nodes.length} / 30 Nodes to Complete`;
  document.getElementById("treeMilestoneTag").textContent = nodes.length >= 150 ? "Mythic (150+)" : nodes.length >= 120 ? "Grandmaster (120+)" : nodes.length >= 90 ? "Mastery (90+)" : nodes.length >= 60 ? "Adept (60+)" : nodes.length >= 30 ? "Complete (30+)" : "Novice Constellation";
  ctx.clearRect(0, 0, c.width, c.height); box.innerHTML = "";
  const accent = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#38bdf8";

  nodes.forEach(n => {
    const p = nodes.find(x => x.id === n.parentId);
    if (p) {
      ctx.beginPath(); ctx.moveTo((p.x / 100) * c.width, (p.y / 100) * c.height); ctx.lineTo((n.x / 100) * c.width, (n.y / 100) * c.height);
      ctx.lineWidth = 2; ctx.strokeStyle = n.status === "mastered" ? accent : n.status === "learning" ? "#eab308" : "#374151";
      ctx.setLineDash(n.status === "locked" ? [4, 4] : []); ctx.stroke(); ctx.setLineDash([]);
    }
  });

  nodes.forEach(n => {
    const div = document.createElement("div");
    div.className = "absolute pointer-events-auto flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer";
    div.style.left = `${n.x}%`; div.style.top = `${n.y}%`;
    const col = n.color && n.color !== "theme" ? n.color : accent;
    const m = n.status === "mastered", l = n.status === "learning";
    const style = m ? `background-color:${col};border-color:#fff;box-shadow:0 0 14px ${col};` : l ? `background-color:#f59e0b;border-color:#fef3c7;` : `background-color:#1f2937;border-color:#4b5563;`;
    div.innerHTML = `<div style="${style}" class="w-8 h-8 ${currentTheme === "minecraft" ? "rounded-none" : "rounded-full"} border-2 ${m ? "node-pulse" : ""} flex items-center justify-center text-xs font-bold ${m || l ? "text-gray-950" : "text-gray-300"}">${n.icon || "★"}</div><span class="text-[11px] font-semibold text-gray-200 mt-1 whitespace-nowrap bg-gray-950/85 px-2 py-0.5 rounded border border-gray-800">${n.title}</span>`;
    div.onclick = () => openModal(n);
    box.appendChild(div);
  });
}

function openModal(n) {
  activeNode = n;
  document.getElementById("modalTitle").textContent = n.title;
  document.getElementById("modalMedia").src = n.media || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500";
  document.getElementById("modalMediaUrl").value = n.media || "";
  document.getElementById("modalIcon").value = n.icon || "★";
  document.getElementById("modalColor").value = n.color || "theme";
  document.getElementById("modalNotes").value = n.notes || "";
  updateStatusToggles(n.status);
  document.getElementById("detailModal").classList.remove("hidden");
}

function updateStatusToggles(st) {
  document.querySelectorAll(".status-toggle").forEach(b => {
    b.className = b.dataset.status === st ? "status-toggle py-1.5 text-xs rounded border border-white rpg-bg-accent font-bold" : "status-toggle py-1.5 text-xs rounded border border-gray-800 bg-gray-950 text-gray-400";
  });
}
document.querySelectorAll(".status-toggle").forEach(b => b.onclick = () => { if (activeNode) activeNode.status = b.dataset.status; updateStatusToggles(b.dataset.status); });
document.getElementById("closeModalBtn").onclick = () => document.getElementById("detailModal").classList.add("hidden");

document.getElementById("saveSkillBtn").onclick = async () => {
  if (!activeNode) return;
  activeNode.notes = document.getElementById("modalNotes").value;
  activeNode.icon = document.getElementById("modalIcon").value;
  activeNode.color = document.getElementById("modalColor").value;
  const u = document.getElementById("modalMediaUrl").value.trim();
  if (u) activeNode.media = u;
  document.getElementById("detailModal").classList.add("hidden");
  renderTree(); await saveUserData();
};

document.getElementById("addNodeBtn").onclick = async () => {
  const name = prompt("Name of the new skill node:");
  if (!name) return;
  const nodes = userTreeData[selectedTree].nodes, cols = [50, 28, 72, 50, 22, 78, 50];
  nodes.push({
    id: "s_" + Date.now(), title: name, status: "locked", icon: "★", color: "theme",
    x: cols[nodes.length % cols.length], y: Math.max(12, 82 - Math.floor(nodes.length / 2) * 12),
    media: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500", notes: "Step-by-step execution notes.",
    parentId: nodes.length ? nodes[nodes.length - 1].id : null
  });
  renderTree(); await saveUserData();
};

function renderStats() {
  const pts = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
  const lbl = { STR: "Strength (Trades/Physical)", DEX: "Dexterity (Craft/Precision)", CON: "Constitution (Health/Grit)", INT: "Intelligence (Systems/Logic)", WIS: "Wisdom (Philosophy/Mastery)", CHA: "Charisma (Leadership/Teaching)" };
  let tot = 0, mas = 0, comp = 0;
  Object.values(userTreeData).forEach(t => {
    const ns = t.nodes || [], a = t.attr || "WIS"; tot += ns.length; if (ns.length >= 30) comp++;
    ns.forEach(n => { if (n.status === "mastered") { mas++; pts[a] += 1; } else if (n.status === "learning") pts[a] += 0.5; });
  });
  const lvl = 1 + Math.floor((tot + mas * 2) / 5);
  document.getElementById("headerLvlBadge").textContent = `LVL ${lvl}`;
  document.getElementById("statCharTitle").textContent = `Level ${lvl} Polymath`;
  document.getElementById("statTotalBreakdown").textContent = `${tot} Total Nodes • ${mas} Mastered • ${comp} Trees Completed (30+)`;
  document.getElementById("dndAttributesList").innerHTML = Object.keys(pts).map(k => {
    const s = Math.floor(pts[k]), mod = Math.floor((s - 10) / 2);
    return `<div class="space-y-1"><div class="flex justify-between text-xs"><span class="font-bold text-gray-200">${k} <span class="text-gray-400 font-normal text-[11px]">— ${lbl[k]}</span></span><span class="font-black rpg-accent">${s} (${mod >= 0 ? "+" + mod : mod})</span></div><div class="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800"><div style="width:${Math.max(8, Math.min(100, ((s - 10) / 20) * 100))}%" class="h-full rpg-bg-accent"></div></div></div>`;
  }).join("");
}

function renderTrophies() {
  const tiers = [
    { c: 30, skyrim: "Dragonborn Constellation Relic", lotr: "Star of the Evenstar", minecraft: "Emerald Beacon", d: "Complete a tree with 30+ nodes." },
    { c: 60, skyrim: "Aetherial Crown", lotr: "Mithril Coat of Moria", minecraft: "Enchanted Golden Apple", d: "Expand a tree to 60+ nodes." },
    { c: 90, skyrim: "Elder Scroll of Mastery", lotr: "Phial of Galadriel", minecraft: "Totem of Undying", d: "Forge a 90+ node grimoire." },
    { c: 120, skyrim: "Sovngarde Ascendant", lotr: "Crown of Gondor", minecraft: "Dragon Egg Relic", d: "Reach 120+ nodes in one discipline." },
    { c: 150, skyrim: "Divine Architect", lotr: "Silmaril of Light", minecraft: "Netherite Command Core", d: "Achieve 150+ nodes of depth." }
  ];
  let max = 0; Object.values(userTreeData).forEach(t => { if ((t.nodes || []).length > max) max = t.nodes.length; });
  document.getElementById("trophyGrid").innerHTML = tiers.map(t => `<div class="rpg-card border rounded-xl p-4 flex items-center justify-between ${max >= t.c ? "opacity-100" : "opacity-45"}"><div><div class="text-[10px] uppercase tracking-wider rpg-accent font-bold">${t.c} Node Milestone</div><div class="text-sm font-bold text-white rpg-title">${t[currentTheme] || t.skyrim}</div><div class="text-[11px] text-gray-400">${t.d}</div></div><div class="text-2xl">${max >= t.c ? "🏆" : "🔒"}</div></div>`).join("");
}
