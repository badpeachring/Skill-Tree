const baseConceptTrees = [
  { id: "b1", title: "Carpentry & Structural Framing", attr: "STR", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 42, nodes: [
    { title: "3-4-5 Square & Reference Edge", notes: "Pull tape from one primary edge; verify 90-degree corners with 3-4-5 triangles." },
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
    { title: "MIG Voltage & Wire Feed Tuning", notes: "Dial in steady arc sound with 10-15 degree push/drag angle." },
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
    { title: "Deload & CNS Recovery", notes: "Reduce volume every 6-8 weeks to dissipate cumulative fatigue." }
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
    { title: "The Stall, Wrap & Rest", notes: "Wrap in butcher paper once bark sets; rest until internal temp drops to 145F." }
  ]},
  { id: "b14", title: "Culinary Knife Work & Emulsions", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 34, nodes: [
    { title: "Claw Grip & Pinch Control", notes: "Pinch blade heel between thumb and index finger for maximum control." },
    { title: "Pan Deglazing & Cold Fat Mounting", notes: "Reduce aromatics and swirl cold fat off heat for glossy sauces." }
  ]},
  { id: "b15", title: "Hydroponics & Indoor Crop Systems", attr: "WIS", tag: "Concept", nsfw: false, author: "Guild Architect", likes: 41, nodes: [
    { title: "EC / PPM & pH Nutrient Balancing", notes: "Maintain 5.6-6.0 pH so roots absorb macro and micronutrients." },
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
    { title: "Trichome Harvest & 60/60 Slow Cure", notes: "Dry at 60F / 60% RH for 10-14 days before curing in glass." }
  ]},
  { id: "b25", title: "Craft Brewing & Distillation Science (21+)", attr: "INT", tag: "Concept", nsfw: true, author: "Guild Architect", likes: 37, nodes: [
    { title: "Sanitation & Mash Temperature Enzymes", notes: "Convert starches cleanly at 148-156F; sanitize all cold-side gear." },
    { title: "Yeast Pitch Rate & Fermentation Temp", notes: "Control esters and fusel alcohols with steady temperature control." }
  ]}
];
