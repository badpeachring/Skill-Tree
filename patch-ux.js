(function installNodePhotoAndUsernameUX() {
  const menuLvl = document.getElementById("menuLvlText");
  if (menuLvl && menuLvl.parentElement) {
    const pill = menuLvl.parentElement;
    pill.style.cursor = "pointer";
    pill.title = "Tap to change your Guild Username";
    pill.onclick = () => window.promptSetUsername();
  }

  window.promptSetUsername = async function() {
    const cur = (userProfile && userProfile.name && userProfile.name !== "Initiate") ? userProfile.name : "";
    const next = prompt("Enter your Guild Username / Display Name:", cur);
    if (!next || !next.trim()) return;
    userProfile.name = next.trim();
    const inp = document.getElementById("profileNameInput");
    if (inp) inp.value = userProfile.name;
    await saveUserData();
    updateGlobalUI();
  };

  const origUpdateUI = window.updateGlobalUI;
  window.updateGlobalUI = function() {
    origUpdateUI();
    const st = calculateCharacterStats();
    const handle = (userProfile && userProfile.name && userProfile.name !== "Initiate")
      ? userProfile.name
      : (currentUser && currentUser.email ? currentUser.email.split("@")[0] : "Set Username ✎");
    document.getElementById("menuLvlText").textContent = `${handle} • LVL ${st.level}`;
    const pInp = document.getElementById("profileNameInput");
    const cInp = document.getElementById("profileContactInput");
    if (pInp && !pInp.value && userProfile.name !== "Initiate") pInp.value = userProfile.name;
    if (cInp && !cInp.value && userProfile.contact) cInp.value = userProfile.contact;
  };
    const modalBox = document.querySelector("#detailModal > div");
  if (modalBox && !document.getElementById("modPhotoWrap")) {
    const wrap = document.createElement("div");
    wrap.id = "modPhotoWrap";
    wrap.className = "flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-2 gap-2";
    wrap.innerHTML = `
      <div class="flex items-center space-x-2.5">
        <img id="modPhotoPreview" class="w-10 h-10 rounded-full object-cover border border-sky-400 hidden" alt="Node">
        <div>
          <div class="text-[11px] font-bold text-slate-200">Custom Node Image</div>
          <div class="text-[10px] text-slate-400">Upload photo or clear to use sigil</div>
        </div>
      </div>
      <div class="flex items-center space-x-1.5">
        <label class="px-2.5 py-1.5 bg-sky-500/20 border border-sky-400/50 text-sky-300 rounded text-[11px] font-bold cursor-pointer">
          📷 Photo
          <input id="modPhotoInput" type="file" accept="image/*" class="hidden">
        </label>
        <button type="button" id="modClearPhotoBtn" class="hidden px-2 py-1.5 bg-slate-800 text-slate-300 rounded text-[11px] font-bold">✕</button>
      </div>
    `;
    const titleRow = modalBox.children[2];
    if (titleRow) modalBox.insertBefore(wrap, titleRow);
  }

  let tempImage = null;
  function syncPhotoPreview(src) {
    tempImage = src || null;
    const img = document.getElementById("modPhotoPreview"), clr = document.getElementById("modClearPhotoBtn");
    if (!img || !clr) return;
    if (tempImage) { img.src = tempImage; img.classList.remove("hidden"); clr.classList.remove("hidden"); }
    else { img.src = ""; img.classList.add("hidden"); clr.classList.add("hidden"); }
  }
    const photoInp = document.getElementById("modPhotoInput");
  if (photoInp) {
    photoInp.onchange = (e) => {
      const file = e.target.files && e.target.files[0]; if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const im = new Image();
        im.onload = () => {
          const cv = document.createElement("canvas"); cv.width = 140; cv.height = 140;
          const ctx = cv.getContext("2d"), s = Math.min(im.width, im.height);
          ctx.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 140, 140);
          syncPhotoPreview(cv.toDataURL("image/jpeg", 0.78));
        };
        im.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
  }
  const clrBtn = document.getElementById("modClearPhotoBtn");
  if (clrBtn) clrBtn.onclick = () => syncPhotoPreview(null);

  const prevOpenModal = window.openSkillModal;
  window.openSkillModal = function(n) { prevOpenModal(n); syncPhotoPreview(n.image || null); };

  const prevSaveClick = document.getElementById("saveSkillBtn").onclick;
  document.getElementById("saveSkillBtn").onclick = async () => {
    if (activeNode) activeNode.image = tempImage;
    await prevSaveClick();
  };

  window.drawConstellation = function() {
    const tree = userTrees[selectedTree]; if (!tree) return;
    const nodes = tree.nodes || [], c = document.getElementById("treeCanvas"), box = document.getElementById("nodesContainer");
    document.getElementById("treeNodeCount").textContent = `${nodes.length} / 30 Fruit Nodes • Tap to edit • Drag to move`;
    document.getElementById("treeMilestoneTag").textContent = nodes.length >= 150 ? "World Tree (150+)" : nodes.length >= 30 ? "Full Canopy (30+)" : nodes.length ? "Growing Tree" : "Seedling";
    box.innerHTML = ""; drawBranchesOnly();
    if (!nodes.length) { box.innerHTML = `<div class="h-full flex items-center justify-center pb-24 text-xs text-slate-400">Tap <strong class="text-sky-400 mx-1">+ Node</strong> above to sprout your first branch</div>`; return; }
    nodes.forEach(n => {
      const div = document.createElement("div"); div.className = "absolute pointer-events-auto flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none";
      div.style.left = `${n.x}%`; div.style.top = `${n.y}%`;
      const col = n.color || "#38bdf8", m = n.status === "mastered", l = n.status === "learning";
      const style = m ? `background-color:${col};border-color:#fff;box-shadow:0 0 16px ${col};` : l ? `background-color:#f59e0b;border-color:#fef3c7;` : `background-color:#0f172a;border-color:#475569;`;
      const inner = n.image ? `<img src="${n.image}" class="w-full h-full rounded-full object-cover" alt="">` : (n.icon || "✦");
      const steps = Array.isArray(n.steps) ? n.steps : [], links = Array.isArray(n.links) ? n.links : [];
      const badge = (steps.length || links.length) ? `<span class="text-[9px] text-sky-300/90 bg-slate-900/90 px-1.5 rounded mt-0.5 border border-slate-800">${steps.length ? `☑ ${steps.filter(s => s.done).length}/${steps.length}` : ""}${steps.length && links.length ? " • " : ""}${links.length ? `🔗 ${links.length}` : ""}</span>` : "";
      div.innerHTML = `<div style="${style}" class="w-9 h-9 rounded-full border-2 overflow-hidden ${m ? "node-glow" : ""} flex items-center justify-center text-xs font-bold ${m || l ? "text-slate-950" : "text-slate-300"}">${inner}</div><span class="text-[11px] font-semibold text-slate-200 mt-1 whitespace-nowrap bg-slate-950/85 px-2 py-0.5 rounded border border-slate-800">${n.title}</span>${badge}`;
      let sx = 0, sy = 0;
      div.onpointerdown = (e) => { e.stopPropagation(); draggingNode = n; dragMoved = false; sx = e.clientX; sy = e.clientY; div.setPointerCapture(e.pointerId); };
      div.onpointermove = (e) => { if (!draggingNode || draggingNode.id !== n.id) return; if (!dragMoved && Math.hypot(e.clientX - sx, e.clientY - sy) < 10) return; dragMoved = true; const r = c.getBoundingClientRect(); n.x = Math.min(92, Math.max(8, ((e.clientX - r.left) / r.width) * 100)); n.y = Math.min(82, Math.max(10, ((e.clientY - r.top) / r.height) * 100)); div.style.left = `${n.x}%`; div.style.top = `${n.y}%`; drawBranchesOnly(); };
      div.onpointerup = async (e) => { if (!draggingNode || draggingNode.id !== n.id) return; div.releasePointerCapture(e.pointerId); draggingNode = null; if (dragMoved) { drawConstellation(); await saveUserData(); } else window.openSkillModal(n); };
      box.appendChild(div);
    });
  };
  window.updateGlobalUI();
})();
