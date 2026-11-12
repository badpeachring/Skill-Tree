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

let currentUser = null;
let selectedTree = "Culinary Arts";
let activeNode = null;
let currentTheme = localStorage.getItem("skill_tree_theme") || "skyrim";
let quoteIdx = 0;

const philosophyQuotes = [
  { text: "A disciplined mind focuses on what lies within its own control, finding unshakable strength regardless of external chaos.", author: "Stoic Principle" },
  { text: "True mastery begins the moment you examine the hidden patterns of your own habits and consciously shape them.", author: "Depth Psychology" },
  { text: "We are shaped by our repeated actions; excellence is never a single event, but a deliberate daily craft.", author: "Classical Ethics" },
  { text: "The meaning of life is not merely to exist, but to keep pressing forward into higher capability and deeper understanding.", author: "Existential Reflection" },
  { text: "When you treat skill acquisition like an open-world quest, every setback becomes experience points rather than defeat.", author: "The Grimoire" }
];

const defaultTrees = {
  "Culinary Arts": {
    attr: "WIS",
    nodes: [
      { id: "c1", title: "Knife Fundamentals", status: "mastered", icon: "⚔", color: "theme", x: 50, y: 82, media: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=500", notes: "Curl guide fingers inward; use a smooth rocking motion across the board.", parentId: null },
      { id: "c2", title: "Thermal Control", status: "learning", icon: "🔥", color: "theme", x: 30, y: 58, media: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500", notes: "Preheat heavy pans thoroughly; allow proteins to sear and release naturally.", parentId: "c1" },
      { id: "c3", title: "Broths & Reductions", status: "locked", icon: "🌿", color: "theme", x: 70, y: 58, media: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500", notes: "Maintain a gentle bare simmer to extract gelatin without clouding.", parentId: "c1" },
      { id: "c4", title: "Pan Emulsions", status: "locked", icon: "★", color: "theme", x: 50, y: 34, media: "https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=500", notes: "Deglaze browned fond with stock, reduce, and swirl cold fat off direct heat.", parentId: "c2" }
    ]
  },
  "Structural Framing": {
    attr: "STR",
    nodes: [
      { id: "f1", title: "Layout & Square", status: "mastered", icon: "◆", color: "theme", x: 50, y: 82, media: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500", notes: "Pull measurements from a single reference edge; confirm 90-degree corners with 3-4-5.", parentId: null },
      { id: "f2", title: "Precision Sawing", status: "mastered", icon: "⚒", color: "theme", x: 32, y: 58, media: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500", notes: "Account for 1/8-inch blade kerf on the waste side of every mark.", parentId: "f1" },
      { id: "f3", title: "Wall Assemblies", status: "learning", icon: "🛡", color: "theme", x: 68, y: 58, media: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500", notes: "16-inch on-center layout; orient lumber crowns consistently upward.", parentId: "f1" },
      { id: "f4", title: "Compression Bracing", status: "locked", icon: "👑", color: "theme", x: 50, y: 34, media: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500", notes: "Install diagonal bracing at optimal angles to prevent lateral racking.", parentId: "f3" }
    ]
  }
};

let userTreeData = JSON.parse(JSON.stringify(defaultTrees));

const tutorialSteps = [
  { badge: "Step 1 of 4 • The Quest Board", title: "Treat Real Life Like an RPG", body: "Most people spend thousands of hours leveling up video game characters while letting their real-world skills fade from memory. This grimoire turns everything you learn—from trades and athletics to philosophy and cooking—into permanent constellations." },
  { badge: "Step 2 of 4 • Building Constellations", title: "Map Every Skill & Blueprint", body: "Open 'My Constellations' to add trees and skill nodes. Tap any star node to set its rank (Locked, Learning, or Mastered), pick custom icons and colors, and record the exact step-by-step notes so you never forget how you did it." },
  { badge: "Step 3 of 4 • D&D Attributes & Relics", title: "Level Up Your Character Sheet", body: "Every tree feeds into your D&D attributes (STR, DEX, CON, INT, WIS, CHA). Adding 30 nodes completes a constellation and unlocks your first relic, with higher ascensions at 60, 90, 120, and 150 nodes." },
  { badge: "Step 4 of 4 • The Vision & Manifesto", title: "Hold Onto Mastery & Pass It Forward", body: "Knowledge shouldn't be locked away or forgotten. By cataloging your masteries clearly, you build a living manual you can revisit anytime—and effortlessly share with friends, apprentices, or teammates so they can learn directly from your path." }
];
let tutIndex = 0;

const authScreen = document.getElementById("authScreen");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authStatus = document.getElementById("authStatus");
const treeSelect = document.getElementById("treeSelect");
const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");
const nodesContainer = document.getElementById("nodesContainer");
const detailModal = document.getElementById("detailModal");

function setTheme(themeName) {
  currentTheme = themeName;
  localStorage.setItem("skill_tree_theme", themeName);
  document.body.className = `theme-${themeName} h-screen w-screen overflow-hidden flex flex-col select-none`;
  renderTree();
  renderTrophies();
}
setTheme(currentTheme);

function switchView(viewId) {
  ["viewHome", "viewTrees", "viewStats", "viewTrophies", "viewSettings"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(viewId).classList.remove("hidden");
  if (viewId === "viewTrees") setTimeout(resizeCanvas, 30);
  if (viewId === "viewStats") renderStats();
  if (viewId === "viewTrophies") renderTrophies();
}

document.getElementById("homeNavBtn").onclick = () => switchView("viewHome");
document.getElementById("navTreesBtn").onclick = () => switchView("viewTrees");
document.getElementById("navStatsBtn").onclick = () => switchView("viewStats");
document.getElementById("navSettingsBtn").onclick = () => switchView("viewSettings");

document.getElementById("nextQuoteBtn").onclick = () => {
  quoteIdx = (quoteIdx + 1) % philosophyQuotes.length;
  document.getElementById("quoteText").textContent = `"${philosophyQuotes[quoteIdx].text}"`;
  document.getElementById("quoteAuthor").textContent = `— ${philosophyQuotes[quoteIdx].author}`;
};

function openTutorial() {
  tutIndex = 0;
  updateTutorialUI();
  document.getElementById("tutorialModal").classList.remove("hidden");
}

function closeTutorial() {
  document.getElementById("tutorialModal").classList.add("hidden");
  localStorage.setItem("skill_tree_tut_seen", "true");
}

function updateTutorialUI() {
  const step = tutorialSteps[tutIndex];
  document.getElementById("tutStepBadge").textContent = step.badge;
  document.getElementById("tutTitle").textContent = step.title;
  document.getElementById("tutBody").textContent = step.body;
  document.getElementById("tutPrevBtn").classList.toggle("hidden", tutIndex === 0);
  document.getElementById("tutNextBtn").textContent = tutIndex === tutorialSteps.length - 1 ? "Begin Journey" : "Next";
}

document.getElementById("tutPrevBtn").onclick = () => { if (tutIndex > 0) { tutIndex--; updateTutorialUI(); } };
document.getElementById("tutNextBtn").onclick = () => {
  if (tutIndex < tutorialSteps.length - 1) { tutIndex++; updateTutorialUI(); }
  else { closeTutorial(); }
};

function showAuthStatus(msg, isError = true) {
  authStatus.textContent = msg;
  authStatus.className = isError ? "text-xs text-red-400" : "text-xs text-sky-400";
  authStatus.classList.remove("hidden");
}

document.getElementById("signUpBtn").onclick = async () => {
  showAuthStatus("Forging account...", false);
  try {
    await auth.createUserWithEmailAndPassword(authEmail.value.trim(), authPassword.value);
    localStorage.removeItem("skill_tree_tut_seen");
  } catch (err) { showAuthStatus(err.message, true); }
};

document.getElementById("signInBtn").onclick = async () => {
  showAuthStatus("Entering realm...", false);
  try {
    await auth.signInWithEmailAndPassword(authEmail.value.trim(), authPassword.value);
  } catch (err) { showAuthStatus(err.message, true); }
};

document.getElementById("logOutBtn").onclick = () => auth.signOut();

auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    authStatus.classList.add("hidden");
    authScreen.classList.add("hidden");
    await loadUserData();
    if (!localStorage.getItem("skill_tree_tut_seen")) openTutorial();
  } else {
    currentUser = null;
    authScreen.classList.remove("hidden");
  }
});

async function loadUserData() {
  try {
    const doc = await db.collection("user_trees").doc(currentUser.uid).get();
    if (doc.exists && doc.data().rpgTrees) { userTreeData = doc.data().rpgTrees; }
    else { userTreeData = JSON.parse(JSON.stringify(defaultTrees)); await saveUserData(); }
  } catch (e) { console.error(e); }
  updateTreeDropdown();
  renderStats();
  renderTree();
}

async function saveUserData() {
  if (!currentUser) return;
  await db.collection("user_trees").doc(currentUser.uid).set({ rpgTrees: userTreeData }, { merge: true });
  renderStats();
}

function updateTreeDropdown() {
  const keys = Object.keys(userTreeData);
  if (!keys.includes(selectedTree) && keys.length > 0) selectedTree = keys[0];
  treeSelect.innerHTML = keys.map(k => `<option value="${k}" ${k === selectedTree ? "selected" : ""}>${k}</option>`).join("");
  document.getElementById("treeAttrBadge").textContent = userTreeData[selectedTree]?.attr || "WIS";
}

treeSelect.onchange = (e) => { selectedTree = e.target.value; updateTreeDropdown(); renderTree(); };

document.getElementById("newTreeBtn").onclick = async () => {
  const name = prompt("Name of your new Skill Tree:");
  if (!name || userTreeData[name]) return;
  const attrInput = (prompt("Primary D&D Attribute (STR, DEX, CON, INT, WIS, or CHA):", "WIS") || "WIS").toUpperCase();
  const chosenAttr = ["STR", "DEX", "CON", "INT", "WIS", "CHA"].includes(attrInput) ? attrInput : "WIS";
  userTreeData[name] = {
    attr: chosenAttr,
    nodes: [{ id: "n_" + Date.now(), title: "Core Foundation", status: "learning", icon: "★", color: "theme", x: 50, y: 82, media: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500", notes: "Foundational principles for " + name, parentId: null }]
  };
  selectedTree = name;
  updateTreeDropdown();
  renderTree();
  await saveUserData();
};

function getMilestoneLabel(count) {
  if (count >= 150) return "Mythic Ascension (150+)";
  if (count >= 120) return "Grandmaster Saga (120+)";
  if (count >= 90) return "Mastery Forge (90+)";
  if (count >= 60) return "Adept Grimoire (60+)";
  if (count >= 30) return "Constellation Complete (30+)";
  return "Novice Constellation";
}

function resizeCanvas() {
  if (!canvas.parentElement) return;
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  renderTree();
}
window.addEventListener("resize", resizeCanvas);

function renderTree() {
  const treeObj = userTreeData[selectedTree];
  if (!treeObj) return;
  const currentNodes = treeObj.nodes || [];
  document.getElementById("treeNodeCount").textContent = `${currentNodes.length} / 30 Nodes to Complete`;
  document.getElementById("treeMilestoneTag").textContent = getMilestoneLabel(currentNodes.length);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  nodesContainer.innerHTML = "";
  const accentHex = getComputedStyle(document.body).getPropertyValue("--accent").trim() || "#38bdf8";

  currentNodes.forEach(node => {
    if (node.parentId) {
      const parent = currentNodes.find(n => n.id === node.parentId);
      if (parent) {
        ctx.beginPath();
        ctx.moveTo((parent.x / 100) * canvas.width, (parent.y / 100) * canvas.height);
        ctx.lineTo((node.x / 100) * canvas.width, (node.y / 100) * canvas.height);
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.status === "mastered" ? accentHex : (node.status === "learning" ? "#eab308" : "#374151");
        ctx.setLineDash(node.status === "locked" ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }
  });

  currentNodes.forEach(node => {
    const div = document.createElement("div");
    div.className = "absolute pointer-events-auto flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer";
    div.style.left = `${node.x}%`;
    div.style.top = `${node.y}%`;
    const customColor = node.color && node.color !== "theme" ? node.color : accentHex;
    const isMastered = node.status === "mastered";
    const isLearning = node.status === "learning";
    const circleStyle = isMastered
      ? `background-color: ${customColor}; border-color: #ffffff; box-shadow: 0 0 14px ${customColor};`
      : (isLearning ? `background-color: #f59e0b; border-color: #fef3c7;` : `background-color: #1f2937; border-color: #4b5563;`);
    const shapeClass = currentTheme === "minecraft" ? "rounded-none" : "rounded-full";
    div.innerHTML = `
      <div style="${circleStyle}" class="w-8 h-8 ${shapeClass} border-2 ${isMastered ? 'node-pulse' : ''} flex items-center justify-center text-xs font-bold ${isMastered || isLearning ? 'text-gray-950' : 'text-gray-300'}">${node.icon || "★"}</div>
      <span class="text-[11px] font-semibold tracking-wide text-gray-200 mt-1 whitespace-nowrap bg-gray-950/85 px-2 py-0.5 rounded border border-gray-800">${node.title}</span>
    `;
    div.onclick = () => openModal(node);
    nodesContainer.appendChild(div);
  });
}

function openModal(node) {
  activeNode = node;
  document.getElementById("modalTitle").textContent = node.title;
  document.getElementById("modalMedia").src = node.media || "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500";
  document.getElementById("modalMediaUrl").value = node.media || "";
  document.getElementById("modalIcon").value = node.icon || "★";
  document.getElementById("modalColor").value = node.color || "theme";
  document.getElementById("modalNotes").value = node.notes || "";
  updateStatusToggles(node.status);
  detailModal.classList.remove("hidden");
}

function updateStatusToggles(status) {
  document.querySelectorAll(".status-toggle").forEach(btn => {
    btn.className = btn.dataset.status === status
      ? "status-toggle py-1.5 text-xs rounded border border-white rpg-bg-accent font-bold"
      : "status-toggle py-1.5 text-xs rounded border border-gray-800 bg-gray-950 text-gray-400";
  });
}

document.querySelectorAll(".status-toggle").forEach(btn => {
  btn.onclick = () => { if (activeNode) activeNode.status = btn.dataset.status; updateStatusToggles(btn.dataset.status); };
});

document.getElementById("closeModalBtn").onclick = () => detailModal.classList.add("hidden");

document.getElementById("saveSkillBtn").onclick = async () => {
  if (activeNode) {
    activeNode.notes = document.getElementById("modalNotes").value;
    activeNode.icon = document.getElementById("modalIcon").value;
    activeNode.color = document.getElementById("modalColor").value;
    const urlVal = document.getElementById("modalMediaUrl").value.trim();
    if (urlVal) activeNode.media = urlVal;
    detailModal.classList.add("hidden");
    renderTree();
    await saveUserData();
  }
};

document.getElementById("addNodeBtn").onclick = async () => {
  const name = prompt("Name of the new skill node:");
  if (!name) return;
  const currentNodes = userTreeData[selectedTree].nodes;
  const xCols = [50, 28, 72, 50, 22, 78, 50];
  const row = Math.floor(currentNodes.length / 2);
  currentNodes.push({
    id: "s_" + Date.now(), title: name, status: "locked", icon: "★", color: "theme",
    x: xCols[currentNodes.length % xCols.length], y: Math.max(12, 82 - row * 12),
    media: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500",
    notes: "Step-by-step execution notes and key lessons.",
    parentId: currentNodes.length > 0 ? currentNodes[currentNodes.length - 1].id : null
  });
  renderTree();
  await saveUserData();
};

function renderStats() {
  const attrPoints = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
  const attrLabels = { STR: "Strength (Physical & Trades)", DEX: "Dexterity (Precision & Craft)", CON: "Constitution (Health & Grit)", INT: "Intelligence (Systems & Logic)", WIS: "Wisdom (Philosophy & Mastery)", CHA: "Charisma (Leadership & Teaching)" };
  let totalNodes = 0, masteredNodes = 0, completedTrees = 0;

  Object.values(userTreeData).forEach(tree => {
    const nodes = tree.nodes || [];
    const attr = tree.attr || "WIS";
    totalNodes += nodes.length;
    if (nodes.length >= 30) completedTrees++;
    nodes.forEach(n => {
      if (n.status === "mastered") { masteredNodes++; attrPoints[attr] = (attrPoints[attr] || 10) + 1; }
      else if (n.status === "learning") { attrPoints[attr] = (attrPoints[attr] || 10) + 0.5; }
    });
  });

  const charLevel = 1 + Math.floor((totalNodes + masteredNodes * 2) / 5);
  document.getElementById("headerLvlBadge").textContent = `LVL ${charLevel}`;
  document.getElementById("statCharTitle").textContent = `Level ${charLevel} Polymath`;
  document.getElementById("statTotalBreakdown").textContent = `${totalNodes} Total Nodes • ${masteredNodes} Mastered • ${completedTrees} Trees Completed (30+)`;

  document.getElementById("dndAttributesList").innerHTML = Object.keys(attrPoints).map(key => {
    const score = Math.floor(attrPoints[key]);
    const mod = Math.floor((score - 10) / 2);
    const pct = Math.min(100, ((score - 10) / 20) * 100);
    return `
      <div class="space-y-1">
        <div class="flex justify-between text-xs">
          <span class="font-bold text-gray-200">${key} <span class="text-gray-400 font-normal text-[11px]">— ${attrLabels[key]}</span></span>
          <span class="font-black rpg-accent">${score} (${mod >= 0 ? "+" + mod : mod})</span>
        </div>
        <div class="w-full h-2 bg-gray-950 rounded-full overflow-hidden border border-gray-800">
          <div style="width: ${Math.max(8, pct)}%" class="h-full rpg-bg-accent transition-all"></div>
        </div>
      </div>`;
  }).join("");
}

function renderTrophies() {
  const tiers = [
    { count: 30, skyrim: "Dragonborn Constellation Relic", lotr: "Star of the Evenstar", minecraft: "Emerald Beacon", desc: "Complete a skill tree with 30+ nodes." },
    { count: 60, skyrim: "Aetherial Crown", lotr: "Mithril Coat of Moria", minecraft: "Enchanted Golden Apple", desc: "Expand a single tree to 60+ nodes." },
    { count: 90, skyrim: "Elder Scroll of Mastery", lotr: "Phial of Galadriel", minecraft: "Totem of Undying", desc: "Forge a 90+ node master grimoire." },
    { count: 120, skyrim: "Sovngarde Ascendant", lotr: "Crown of Gondor", minecraft: "Dragon Egg Relic", desc: "Reach 120+ nodes in a single discipline." },
    { count: 150, skyrim: "Divine Architect", lotr: "Silmaril of Light", minecraft: "Netherite Command Core", desc: "Achieve 150+ nodes of legendary depth." }
  ];
  let maxNodes = 0;
  Object.values(userTreeData).forEach(t => { if ((t.nodes || []).length > maxNodes) maxNodes = t.nodes.length; });
  document.getElementById("trophyGrid").innerHTML = tiers.map(tier => {
    const unlocked = maxNodes >= tier.count;
    return `
      <div c
