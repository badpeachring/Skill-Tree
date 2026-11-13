(function installDeepActionableConceptTrees() {
  if (typeof baseConceptTrees === "undefined") return;

  const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

  const richTrees = [
    {
      id: "b1", attr: "STR", tag: "Concept", title: "Calisthenics: Planche, Lever & Press", author: "Architect Blueprint", likes: 64,
      nodes: [
        {
          title: "Scapular Protraction & Hollow Body", tier: "Tier I • Foundation", icon: "💪", color: "#38bdf8",
          notes: "Lock posterior pelvic tilt (ribs pulled down, glutes squeezed) and push the floor away so shoulder blades spread apart (protraction) with locked elbows.",
          steps: [
            { text: "60s hollow body hold with lower back pressed flat into floor", done: false },
            { text: "3x15 scapular push-ups holding 2s peak protraction at top", done: false },
            { text: "3x12 dead-hang scapular pulls without bending elbows", done: false }
          ],
          links: [
            { label: "YouTube: Hollow Body & Scapular Protraction Form", url: yt("calisthenics hollow body hold scapular protraction tutorial") }
          ]
        },
        {
          title: "Planche Lean & Wrist Conditioning", tier: "Tier II • Practitioner", icon: "⚡", color: "#f59e0b",
          notes: "Turn wrists out 30-45 degrees to protect tendons. Protract shoulders hard, lock elbows completely straight, and lean shoulders forward past wrists until feet feel light. Hold hips at shoulder height—never let lower back sag.",
          steps: [
            { text: "4x20s Planche Lean with shoulders 4+ inches past wrists", done: false },
            { text: "3x10 pseudo-planche push-ups (hands by waist)", done: false }
          ],
          links: [
            { label: "YouTube: Planche Lean Biomechanics & Wrist Prep", url: yt("planche lean form tutorial wrist conditioning calisthenics") }
          ]
        },
        {
          title: "Tuck & Advanced Tuck Planche", tier: "Tier III • Specialist", icon: "🔥", color: "#22c55e",
          notes: "From a deep planche lean, lift knees tight to chest (Tuck), then push hips back so your back flattens parallel to the floor (Adv. Tuck). Keep elbows 100% locked—any bend shifts load from front delts to biceps.",
          steps: [
            { text: "20s clean Tuck Planche with rounded upper back", done: false },
            { text: "12s Advanced Tuck Planche with flat horizontal back", done: false }
          ],
          links: [
            { label: "YouTube: Tuck to Advanced Tuck Planche Progression", url: yt("tuck planche to advanced tuck planche progression tutorial") }
          ]
        },
        {
          title: "Straddle & Full Planche", tier: "Tier IV • Grandmaster", icon: "👑", color: "#a855f7",
          notes: "Extend legs wide into Straddle first to shorten the lever arm, squeezing glutes and pointing toes. To transition to Full Planche, bring legs together slowly while leaning an extra 2 inches forward to keep center of mass over hands.",
          steps: [
            { text: "8s Straddle Planche with hips level with shoulders", done: false },
            { text: "5s Full Planche with locked knees and pointed toes", done: false }
          ],
          links: [
            { label: "YouTube: Full Planche Complete Step-by-Step Guide", url: yt("full planche tutorial step by step progression calisthenics") }
          ]
        },
        {
          title: "Chest-to-Wall Stacked Handstand", tier: "Tier II • Practitioner", icon: "🧭", color: "#f59e0b",
          notes: "Walk up chest-to-wall until only toes touch. Push tall through shoulders (elevation), tuck ribs, and grip floor with fingertips to pull heels 1 inch off the wall.",
          steps: [
            { text: "60s chest-to-wall stacked line hold", done: false },
            { text: "10 controlled finger-press heel pulls off wall", done: false }
          ],
          links: [
            { label: "YouTube: Perfect Handstand Line & Finger Balance", url: yt("chest to wall handstand alignment finger balance tutorial") }
          ]
        },
        {
          title: "Seated Press to Handstand", tier: "Tier IV • Grandmaster", icon: "🏆", color: "#a855f7",
          notes: "Start seated cross-legged or in pancake straddle. Lean shoulders forward over hands as you compress thighs tightly to ribs, floating hips vertically over wrists before unfolding legs upward without jumping.",
          steps: [
            { text: "5x8s seated pike/straddle compression lifts (hands by knees)", done: false },
            { text: "3 slow eccentrics from handstand down to seated hover", done: false },
            { text: "1 strict seated press to freestanding handstand", done: false }
          ],
          links: [
            { label: "YouTube: Seated Press to Handstand Drills", url: yt("seated press to handstand tutorial compression drills") }
          ]
        },
        {
          title: "Front Lever & Strict Muscle-Up", tier: "Tier III • Specialist", icon: "★", color: "#22c55e",
          notes: "Depress scapulae hard and pull bar toward hips with straight arms for Front Lever. For Muscle-Up, use false grip, pull explosively to lower sternum, and drive chest fast over the bar.",
          steps: [
            { text: "10s Full Front Lever with horizontal body line", done: false },
            { text: "5 strict no-kip bar or ring muscle-ups", done: false }
          ],
          links: [
            { label: "YouTube: Front Lever & Strict Muscle-Up Form", url: yt("front lever tutorial straight arm pull calisthenics") }
          ]
        }
      ]
    },
    {
      id: "b2", attr: "INT", tag: "Concept", title: "Industrial Concrete & Coating Systems", author: "Architect Blueprint", likes: 49,
      nodes: [
        {
          title: "Substrate Moisture & CSP Testing", tier: "Tier I • Foundation", icon: "🧭", color: "#38bdf8",
          notes: "Map slab moisture impedance and verify concrete hardness (Mohs scratch kit) so you select the right diamond matrix and moisture vapor barrier.",
          steps: [
            { text: "Log grid readings with non-destructive impedance meter", done: false },
            { text: "Verify ICRI CSP 2-3 profile before primer application", done: false }
          ],
          links: [
            { label: "YouTube: Concrete Moisture Testing & CSP Profile Guide", url: yt("concrete moisture testing ASTM F2170 CSP profile") }
          ]
        },
        {
          title: "Diamond Grinding & HEPA Extraction", tier: "Tier II • Practitioner", icon: "⚙", color: "#f59e0b",
          notes: "Hard concrete requires soft-bond diamonds so fresh diamonds expose continuously; soft concrete requires hard-bond segments. Overlap passes 50% in a north-south/east-west crosshatch.",
          steps: [
            { text: "Match diamond bond hardness to slab Mohs test", done: false },
            { text: "Detail all edges & drains with cup wheel + HEPA shroud", done: false }
          ],
          links: [
            { label: "YouTube: Planetary Concrete Grinder Bond Selection", url: yt("concrete diamond grinding bond selection hard soft concrete") }
          ]
        },
        {
          title: "100%-Solids Vapor Barrier Epoxy", tier: "Tier III • Specialist", icon: "🧪", color: "#22c55e",
          notes: "Mix Part A and Part B mechanically for 3 full minutes, scrape bucket walls, ribbon-pour immediately (never leave mixed epoxy sitting in the bucket to exotherm), and back-roll uniformly.",
          steps: [
            { text: "Check dew point & slab temp (must be 5°F above dew point)", done: false },
            { text: "Apply uniform 12-16 mil coat within pot-life window", done: false }
          ],
          links: [
            { label: "YouTube: Mixing & Back-Rolling 100% Solids Epoxy", url: yt("how to apply 100 solids moisture barrier epoxy primer") }
          ]
        },
        {
          title: "Seamless Rubber & Aliphatic Topcoat", tier: "Tier IV • Grandmaster", icon: "🏆", color: "#a855f7",
          notes: "Solvent-wipe contact surfaces, trowel-pack seams flush with rubber-thickened polyurethane, and spray UV-stable aliphatic topcoat at consistent wet film thickness.",
          steps: [
            { text: "Verify full wet adhesive transfer on mat edges", done: false },
            { text: "Spray uniform cross-coat aliphatic finish & log rebound QA", done: false }
          ],
          links: [
            { label: "YouTube: Airless Sprayer Tip Selection & Mil Control", url: yt("airless paint sprayer tip size wet film thickness guide") }
          ]
        }
      ]
    },
    {
      id: "b3", attr: "WIS", tag: "Concept", title: "Culinary Arts: Smoke, Braise & Emulsion", author: "Architect Blueprint", likes: 54,
      nodes: [
        {
          title: "Knife Geometry & Mise en Place", tier: "Tier I • Foundation", icon: "⚔", color: "#38bdf8",
          notes: "Grip the blade pinch-style ahead of the bolster with thumb and index finger, curl guide-hand knuckles forward, and slice with a forward-downward push cut rather than crushing.",
          steps: [
            { text: "Hone at 15-degree bevel & maintain on 1000/6000 whetstone", done: false },
            { text: "Cut uniform 1/4-inch mirepoix for even thermal transfer", done: false }
          ],
          links: [
            { label: "YouTube: Chef Pinch Grip & Rolling Slice Technique", url: yt("knife skills pinch grip claw technique chef tutorial") }
          ]
        },
        {
          title: "Maillard Sear & Pan Fond Deglazing", tier: "Tier II • Practitioner", icon: "🔥", color: "#f59e0b",
          notes: "Pat proteins bone-dry with paper towels, preheat heavy stainless or cast iron until oil shimmers, lay food away from you, and do not flip until the crust naturally releases.",
          steps: [
            { text: "Sear protein without steaming or gray banding", done: false },
            { text: "Deglaze browned fond with stock/acid & mount with cold fat", done: false }
          ],
          links: [
            { label: "YouTube: Maillard Reaction & Pan Sauce Science", url: yt("maillard reaction searing pan sauce deglazing tutorial") }
          ]
        },
        {
          title: "Stable Emulsions & Dairy-Free Creaminess", tier: "Tier II • Practitioner", icon: "🧪", color: "#f59e0b",
          notes: "Disperse fat droplets into water-phase acid using lecithin (egg yolk/mustard) and gradual shear so dressings stay velvety and never split.",
          steps: [
            { text: "Emulsify oil slowly at constant shear rate", done: false },
            { text: "Balance acid, salt, aromatics & viscosity", done: false }
          ],
          links: [
            { label: "YouTube: Science of Stable Kitchen Emulsions", url: yt("how emulsions work mayo vinaigrette culinary science") }
          ]
        },
        {
          title: "Low-and-Slow Collagen Rendering", tier: "Tier III • Specialist", icon: "⚒", color: "#22c55e",
          notes: "Hold 225-250°F smoker or covered braise until intramuscular collagen hydrolyzes into rich gelatin around 200-205°F internal probe-tender feel.",
          steps: [
            { text: "Wrap in butcher paper once bark sets through the stall", done: false },
            { text: "Rest 1-2 hours in insulated cambro down to 145°F before slicing", done: false }
          ],
          links: [
            { label: "YouTube: Brisket & Pork Butt Collagen Rendering Guide", url: yt("low and slow brisket collagen rendering stall wrap rest") }
          ]
        },
        {
          title: "Equilibrium Curing & Cold Smoke", tier: "Tier IV • Grandmaster", icon: "👑", color: "#a855f7",
          notes: "Weigh protein in grams and calculate exact 2.25% kosher salt + 1.0% sugar equilibrium cure sealed in vacuum bag so over-salting is mathematically impossible.",
          steps: [
            { text: "Calculate equilibrium cure weights to the tenth of a gram", done: false },
            { text: "Form pellicle in fridge 12h before cold-smoking under 80°F", done: false }
          ],
          links: [
            { label: "YouTube: Equilibrium Cured Salmon (Gravlax) & Cold Smoke", url: yt("equilibrium cure salmon gravlax cold smoke pellicle") }
          ]
        }
      ]
    },
    {
      id: "b4", attr: "CHA", tag: "Business", title: "Commercial Contracting & Proposal Mastery", author: "Architect Blueprint", likes: 58,
      nodes: [
        {
          title: "Site Walk & Risk Discovery", tier: "Tier I • Foundation", icon: "🧭", color: "#38bdf8",
          notes: "Measure exact square footage, doorways, slope/drains, moisture levels, and facility animal/staff containment schedules before quoting a single dollar.",
          steps: [
            { text: "Capture photos, room dimensions, access & power specs", done: false },
            { text: "Identify hidden prep exclusions (demolition, subfloor repairs)", done: false }
          ],
          links: [
            { label: "YouTube: Commercial Construction Site Walk Checklist", url: yt("commercial construction site walk estimating checklist") }
          ]
        },
        {
          title: "True Cost, Freight & Margin Modeling", tier: "Tier II • Practitioner", icon: "🧠", color: "#f59e0b",
          notes: "Build bottom-up pricing: raw materials + freight/pallet fees + consumables + mobilization mileage/hotel + crew labor hours + contingency buffer + target net profit.",
          steps: [
            { text: "Lock supplier material quotes & enforce 30-60 day expiration", done: false },
            { text: "Stress-test gross margin against 15% labor overrun", done: false }
          ],
          links: [
            { label: "YouTube: Construction Job Costing & Markup vs Margin", url: yt("construction estimating markup vs margin job costing") }
          ]
        },
        {
          title: "Turnkey Executive Proposal Writing", tier: "Tier III • Specialist", icon: "📖", color: "#22c55e",
          notes: "Present a clean, phased scope of work, clear client preparation duties, payment milestones, and a single turnkey investment figure that eliminates procurement friction.",
          steps: [
            { text: "Separate base scope from optional add-alternates", done: false },
            { text: "Include clear validity window & deposit terms", done: false }
          ],
          links: [
            { label: "YouTube: How to Write Winning Commercial Proposals", url: yt("how to write a commercial construction proposal that wins") }
          ]
        },
        {
          title: "Multi-Site Route Logistics & Retention", tier: "Tier IV • Grandmaster", icon: "🏆", color: "#a855f7",
          notes: "Sequence regional installations along single road-trip corridors to slash deadhead fuel/hotel overhead, and deliver post-install QA reports that convert into recurring annual maintenance.",
          steps: [
            { text: "Batch regional client site visits on single mobilization", done: false },
            { text: "Deliver post-install QA & maintenance guide within 48h", done: false }
          ],
          links: [
            { label: "YouTube: Scaling Specialty Contracting & Repeat Clients", url: yt("scaling specialty trade contracting business repeat clients") }
          ]
        }
      ]
    }
  ];

  richTrees.forEach(up => {
    const idx = baseConceptTrees.findIndex(x => x.id === up.id);
    if (idx >= 0) baseConceptTrees[idx] = up; else baseConceptTrees.unshift(up);
  });
})();
