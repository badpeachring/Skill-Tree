const firebaseConfig = {
  apiKey: "AIzaSyBaAcBLfnUulVRxlGx8YKyXFQrm-fIYsms",
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
let userTrees = {};
let selectedTree = null;
let activeNode = null;
let serverFilter = "ALL";
let showNsfw = localStorage.getItem("skill_tree_nsfw") === "true";
let userProfile = { name: "Initiate", contact: "" };
let publicTreesCache = [];

// 1. PROCEDURAL STARFIELD & NEBULA
(function initStarfield() {
  const c = document.getElementById("starfieldCanvas");
  const ctx = c.getContext("2d");
  let stars = [];
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.6 + 0.2,
      a: Math.random() * 0.8 + 0.2,
      s: (Math.random() - 0.5) * 0.015,
      tint: Math.random() > 0.8 ? "#7dd3fc" : (Math.random() > 0.9 ? "#fde68a" : "#ffffff")
    }));
  }
  window.addEventListener("resize", resize);
  resize();
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    const grad = ctx.createRadialGradient(c.width * 0.5, c.height * 0.25, 20, c.width * 0.5, c.height * 0.5, c.width * 0.9);
    grad.addColorStop(0, "rgba(14, 116, 144, 0.14)");
    grad.addColorStop(0.5, "rgba(30, 27, 75, 0.12)");
    grad.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, c.width, c.height);
    stars.forEach(st => {
      st.a += st.s;
      if (st.a > 1 || st.a < 0.15) st.s *= -1;
      ctx.globalAlpha = st.a;
      ctx.fillStyle = st.tint;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
})();

// 2. PHILOSOPHY QUOTES
const quotes = [
  { t: "A disciplined mind focuses on what lies within its own control, finding unshakable strength regardless of external chaos.", a: "Stoic Principle" },
  { t: "True mastery begins the moment you examine the hidden patterns of your own habits and consciously shape them.", a: "Depth Psychology" },
  { t: "We are shaped by our repeated actions; excellence is never a single event, but a deliberate daily craft.", a: "Classical Ethics" },
  { t: "He who has a why to live can bear almost any how.", a: "Existential Philosophy" },
  { t: "When you treat real life like an open-world RPG, every hard lesson becomes permanent experience points.", a: "The Grimoire" }
];
let qIdx = 0;
document.getElementById("nextQuoteBtn").onclick = () => {
  qIdx = (qIdx + 1) % quotes.length;
  document.getElementById("quoteText").textContent = `"${quotes[qIdx].t}"`;
  document.getElementById("quoteAuthor").textContent = `— ${quotes[qIdx].a}`;
};

// 3. 25 BASE CONCEPT TREES (VIEWABLE WITHOUT AUTO-ASSIGNING)
const baseConceptTrees = [
  { id: "b1", title: "Carpentry & Structural Framing", attr: "STR", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 42, nodes: [
    { title: "3-4-5 Square & Reference Edge", notes: "Always pull tape from one primary edge; verify 90-degree corners with 3-4-5 triangles." },
    { title: "Saw Kerf & Blade Control", notes: "Account for 1/8-inch kerf on the waste side of every layout line." },
    { title: "16-Inch O.C. Wall Framing", notes: "Crown all studs upward; align top and bottom plates before nailing." },
    { title: "Diagonal Compression Bracing", notes: "Install diagonal braces to transfer lateral loads directly into the frame." }
  ]},
  { id: "b2", title: "Surface Prep & Protective Coatings", attr: "STR", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 38, nodes: [
    { title: "Concrete Diamond Grinding", notes: "Achieve proper Concrete Surface Profile (CSP) using planetary diamond tooling and HEPA extraction." },
    { title: "Moisture Vapor Impedance Testing", notes: "Test substrate moisture levels before sealing to prevent osmotic blistering." },
    { title: "Moisture-Barrier Epoxy Priming", notes: "Apply vapor-retarding primer within exact pot-life and recoat windows." },
    { title: "Aliphatic Topcoat Application", notes: "Spray or back-roll UV-stable aliphatic coatings at uniform mil thickness." }
  ]},
  { id: "b3", title: "Welding & Metal Fabrication", attr: "DEX", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 31, nodes: [
    { title: "Base Metal Prep & Mill Scale Removal", notes: "Grind bright clean steel 1 inch back from every joint." },
    { title: "MIG Voltage & Wire Feed Tuning", notes: "Dial in steady bacon-sizzle arc sound with 10–15 degree push/drag angle." },
    { title: "Tack Sequencing & Heat Control", notes: "Alternate tack welds across opposite corners to prevent warping." }
  ]},
  { id: "b4", title: "Electrical Systems & Diagnostics", attr: "INT", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 29, nodes: [
    { title: "Lockout/Tagout & Multimeter Verification", notes: "Verify zero potential across hot-neutral and hot-ground before touching conductors." },
    { title: "Load Calculation & Wire Gauge Sizing", notes: "Match breaker amperage to conductor gauge and continuous 80% load rules." },
    { title: "Clean Panel Termination", notes: "Torque lugs to spec and maintain neat service loops." }
  ]},
  { id: "b5", title: "Diesel & Mechanical Diagnostics", attr: "INT", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 35, nodes: [
    { title: "Air, Fuel & Compression Triad", notes: "Isolate fuel rail pressure, boost leaks, and cranking compression systematically." },
    { title: "Fluid Analysis & Preventive Intervals", notes: "Track oil viscosity, coolant pH, and fuel-water separator drains." },
    { title: "Torque Specs & Thread Locker", notes: "Follow factory torque sequences on suspension and drivetrain fasteners." }
  ]},
  { id: "b6", title: "Plumbing & Hydronics", attr: "DEX", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 22, nodes: [
    { title: "DWV Slope & Venting", notes: "Maintain 1/4-inch per foot fall on drain lines and proper air admittance." },
    { title: "PEX & Copper Sweating", notes: "Ream cut ends cleanly and pressure-test manifolds before closing walls." }
  ]},
  { id: "b7", title: "CAD & Systems Engineering", attr: "INT", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 27, nodes: [
    { title: "Parametric Sketch Constraints", notes: "Fully constrain 2D geometry before extruding solid bodies." },
    { title: "Tolerance Stack-Up Analysis", notes: "Account for real-world manufacturing clearances across mating parts." }
  ]},
  { id: "b8", title: "Hypertrophy & Strength Lifting", attr: "STR", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 48, nodes: [
    { title: "Compound Hinge & Squat Mechanics", notes: "Brace intra-abdominal pressure before initiating descent." },
    { title: "Progressive Overload Tracking", notes: "Add reps, load, or controlled tempo week over week." },
    { title: "Deload & CNS Recovery", notes: "Reduce volume every 6–8 weeks to dissipate cumulative fatigue." }
  ]},
  { id: "b9", title: "Calisthenics & Handstand Balance", attr: "DEX", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 44, nodes: [
    { title: "Scapular Protraction & Hollow Body", notes: "Lock ribs down and push tall through the shoulders." },
    { title: "Finger-Pressure Balance Corrections", notes: "Press through fingertips to stop over-balance; heel of palm to stop under-balance." },
    { title: "L-Sit to Bent-Arm Press", notes: "Build compression strength and anterior deltoid lean." }
  ]},
  { id: "b10", title: "Mobility, Acrobatic & Flip Mechanics", attr: "DEX", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 33, nodes: [
    { title: "Thoracic & Hip Capsule Opening", notes: "Active end-range isometric holds for overhead and squat depth." },
    { title: "Set, Tuck & Spotting Rotation", notes: "Drive hips upward before initiating tight rotational tuck." }
  ]},
  { id: "b11", title: "Endurance & Zone 2 Conditioning", attr: "CON", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 26, nodes: [
    { title: "Nasal-Breathing Aerobic Base", notes: "Sustain conversational heart rate for 45+ minutes to build mitochondrial density." },
    { title: "VO2 Max Intervals", notes: "4x4 minute high-output efforts with active recovery." }
  ]},
  { id: "b12", title: "Combat Arts & Striking Footwork", attr: "DEX", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 39, nodes: [
    { title: "Stance, Guard & Weight Distribution", notes: "Keep center of gravity balanced on the balls of the feet." },
    { title: "Distance Management & Angles", notes: "Step off the centerline while countering." }
  ]},
  { id: "b13", title: "Low-and-Slow Smoking & Butchery", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 51, nodes: [
    { title: "Trimming & Aerodynamic Fat Cap", notes: "Remove hard silver skin and shape edges so smoke flows cleanly." },
    { title: "Clean Blue Smoke & Fire Management", notes: "Burn seasoned splits with unobstructed exhaust airflow." },
    { title: "The Stall, Wrap & Rest", notes: "Wrap in butcher paper once bark sets; rest until internal temp drops to 145°F." }
  ]},
  { id: "b14", title: "Culinary Knife Work & Emulsions", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 34, nodes: [
    { title: "Claw Grip & Pinch Control", notes: "Pinch blade heel between thumb and index finger for maximum control." },
    { title: "Pan Deglazing & Cold Fat Mounting", notes: "Reduce aromatics and swirl cold fat off heat for glossy sauces." }
  ]},
  { id: "b15", title: "Hydroponics & Indoor Crop Systems", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 41, nodes: [
    { title: "EC / PPM & pH Nutrient Balancing", notes: "Maintain 5.6–6.0 pH so roots absorb macro and micronutrients." },
    { title: "DLI & Full-Spectrum LED Positioning", notes: "Measure Daily Light Integral at canopy height to prevent stretch or burn." },
    { title: "Dissolved Oxygen & Root Hygiene", notes: "Keep reservoir temperatures cool and oxygenated." }
  ]},
  { id: "b16", title: "Fermentation & Food Preservation", attr: "CON", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 25, nodes: [
    { title: "2.5% Salinity Lacto-Fermentation", notes: "Weigh vegetables + water to calculate exact non-iodized salt ratio." },
    { title: "Curing & Moisture Control", notes: "Balance salt, time, and airflow for safe shelf-stable proteins." }
  ]},
  { id: "b17", title: "Stoic & Existential Philosophy", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 62, nodes: [
    { title: "Dichotomy of Control", notes: "Separate internal intent and character from external outcomes." },
    { title: "Amor Fati & Voluntary Discomfort", notes: "Embrace obstacles as raw fuel for resilience." },
    { title: "Memento Mori & Intentional Living", notes: "Use awareness of finite time to prioritize meaningful action." }
  ]},
  { id: "b18", title: "Human Psychology & Behavioral Mastery", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 55, nodes: [
    { title: "Cognitive Biases & First Principles", notes: "Identify confirmation bias and reason from fundamental truths." },
    { title: "Shadow Integration & Emotional Regulation", notes: "Observe triggers objectively before reacting." },
    { title: "Habit Loops (Cue, Craving, Response, Reward)", notes: "Redesign environment friction to automate discipline." }
  ]},
  { id: "b19", title: "Political Systems, Governance & Civics", attr: "INT", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 30, nodes: [
    { title: "Constitutional Republic vs. Direct Democracy", notes: "Understand separation of powers, federalism, and checks and balances." },
    { title: "Economic Models & Monetary Policy", notes: "Compare free-market price signals, fiscal spending, and central banking." },
    { title: "Media Literacy & Primary Source Verification", notes: "Trace claims back to actual legislation, court rulings, and raw data." }
  ]},
  { id: "b20", title: "Business Operations & Negotiation", attr: "CHA", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 47, nodes: [
    { title: "Unit Economics & True Job Costing", notes: "Factor labor, mobilization, overhead, and contingency into every bid." },
    { title: "Clear Scope & Change-Order Protection", notes: "Define deliverables in writing before mobilizing." },
    { title: "High-Trust Client Communication", notes: "Set proactive expectations early and document every milestone." }
  ]},
  { id: "b21", title: "Mentorship & Teaching Systems", attr: "CHA", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 36, nodes: [
    { title: "Show, Guide, Verify", notes: "Demonstrate at full standard, coach the first attempt, then verify independence." },
    { title: "Chunking Complex Procedures", notes: "Break intimidating jobs into 3-step repeatable checklists." }
  ]},
  { id: "b22", title: "Wilderness Survival & Bushcraft", attr: "CON", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 43, nodes: [
    { title: "Rule of 3s Prioritization", notes: "Shelter, water, fire, and signaling in order of immediate threat." },
    { title: "Ferro Rod & Feather-Stick Ignition", notes: "Process dry inner heartwood into fine curls." }
  ]},
  { id: "b23", title: "Daily Home & Estate Stewardship", attr: "CON", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 21, nodes: [
    { title: "15-Minute Evening Reset", notes: "Clear surfaces, prep tools/gear for morning, and maintain order." },
    { title: "Seasonal HVAC, Water & Roof Checks", notes: "Inspect filters, drainage, and seals before extreme weather." }
  ]},
  { id: "b24", title: "Botanical Cannabis Cultivation (21+)", attr: "WIS", tag: "Concept", nsfw: true, author: "Guild Architect", likes: 68, nodes: [
    { title: "VPD (Vapor Pressure Deficit) Control", notes: "Balance canopy temperature and relative humidity across seedling, veg, and flower." },
    { title: "Living Soil vs. Coco/Hydro Feeding", notes: "Manage microbial biology or precise EC runoff and calcium-magnesium ratios." },
    { title: "Low-Stress Training & Canopy Defoliation", notes: "Open lower bud sites to even light penetration and airflow." },
    { title: "Trichome Harvest & 60/60 Slow Cure", notes: "Dry at 60°F / 60% RH for 10–14 days before curing in glass." }
  ]},
  { id: "b25", title: "Craft Brewing & Distillation Science (21+)", attr: "INT", tag: "Concept", nsfw: true, author: "Guild Architect", likes: 37, nodes: [
    { title: "Sanitation & Mash Temperature Enzymes", notes: "Convert starches cleanly at 148–156°F; sanitize all cold-side gear." },
    { title: "Yeast Pitch Rate & Fermentation Temp", notes: "Control esters and fusel alcohols with steady temperature control." }
  ]}
];

// 4. NAVIGATION & TUTORIAL
function openMainMenu() {
  ["viewTrees", "viewServer", "viewStats", "viewLeaderboard", "viewTrophies", "viewCommunity", "viewSettings"].forEach(id => document.getElementById(id).classList.add("hidden"));
  document.getElementById("topBar").classList.add("hidden");
  document.getElementById("viewMenu").classList.remove("hidden");
  updateGlobalUI();
}

function navigate(viewId, title) {
  document.getElementById("viewMenu").classList.add("hidden");
  ["viewTrees", "viewServer", "viewStats", "viewLeaderboard", "viewTrophies", "viewCommunity", "viewSettings"].forEach(id => document.getElementById(id).classList.add("hidden"));
  document.getElementById("topBar").classList.remove("hidden");
  document.getElementById("headerTitle").textContent = title;
  document.getElementById(viewId).classList.remove("hidden");

  if (viewId === "viewTrees") renderMyTreesView();
  if (viewId === "viewServer") loadServerRealm();
  if (viewId === "viewStats") renderStats();
  if (viewId === "viewLeaderboard") loadLeaderboard();
  if (viewId === "viewTrophies") renderTrophies();
  if (viewId === "viewCommunity") loadComments();
}

const tutSteps = [
  { b: "Step 1 of 4 • The Vision", t: "Frame Life Like an Open-World RPG", d: "People spend thousands of hours leveling up game characters while letting real-world skills slip away. This app turns everything you master into permanent constellations." },
  { b: "Step 2 of 4 • Level 0 Blank Slate", t: "Build or Harvest Your Path", d: "You begin at Level 0 with an empty sky. Forge your own trees from scratch, or open The Server Realm to inspect 25+ concept blueprints and harvest single skills into your trees." },
  { b: "Step 3 of 4 • D&D Attributes & Relics", t: "Ascend Your Character Sheet", d: "Every mastered skill boosts your D&D attributes (STR, DEX, CON, INT, WIS, CHA). Reach 30 nodes to complete a tree, and unlock relics at 30, 60, 90, 120, and 150 nodes." },
  { b: "Step 4 of 4 • Mentorship & Guilds", t: "Share Blueprints & Prove Mastery", d: "Publish your trees to the public cloud, tag them for Mentorship or Business/Pro portfolios, earn hearts on the World Leaderboard, and pass your exact blueprints down." }
];
let tutIdx = 0;
function openTutorial() { tutIdx = 0; renderTut(); document.getElementById("tutorialModal").classList.remove("hidden"); }
function closeTutorial() { document.getElementById("tutorialModal").classList.add("hidden"); localStorage.setItem("skill_tree_tut_v2", "true"); }
function renderTut() {
  const s = tutSteps[tutIdx];
  document.getElementById("tutStepBadge").textContent = s.b;
  document.getElementById("tutTitle").textContent = s.t;
  document.getElementById("tutBody").textContent = s.d;
  document.getElementById("tutPrevBtn").classList.toggle("hidden", tutIdx === 0);
  document.getElementById("tutNextBtn").textContent = tutIdx === tutSteps.length - 1 ? "Enter Main Menu" : "Next";
}
document.getElementById("tutPrevBtn").onclick = () => { if (tutIdx > 0) { tutIdx--; renderTut(); } };
document.getElementById("tutNextBtn").onclick = () => { tutIdx < tutSteps.length - 1 ? (tutIdx++, renderTut()) : closeTutorial(); };

// 5. FIREBASE AUTH & LEVEL 0 INITIALIZATION
function showAuth(msg, err = true) {
  const el = document.getElementById("authStatus");
  el.textContent = msg;
  el.className = err ? "text-xs text-red-400" : "text-xs text-sky-400";
  el.classList.remove("hidden");
}
document.getElementById("signUpBtn").onclick = async () => {
  showAuth("Creating character...", false);
  try {
    await auth.createUserWithEmailAndPassword(document.getElementById("authEmail").value.trim(), document.getElementById("authPassword").value);
    localStorage.removeItem("skill_tree_tut_v2");
  } catch (e) { showAuth(e.message, true); }
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
    document.getElementById("nsfwToggle").checked = showNsfw;
    await loadUserData();
    openMainMenu();
    if (!localStorage.getItem("skill_tree_tut_v2")) openTutorial();
  } else {
    currentUser = null;
    document.getElementById("authScreen").classList.remove("hidden");
  }
});

async function loadUserData(
