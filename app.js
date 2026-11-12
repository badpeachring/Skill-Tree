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
let selectedTree = null;
let activeNode = null;
let quoteIdx = 0;
let userTreeData = {};
let userProfile = { name: "", contact: "", show21: false };
let cloudTrees = [];
let serverFilter = "ALL";

// 1. PROCEDURAL NIGHT SKY STARFIELD
(function initStarfield() {
  const c = document.getElementById("starfieldCanvas");
  const ctx = c.getContext("2d");
  let stars = [];
  function resize() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    stars = Array.from({ length: 160 }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      r: Math.random() * 1.5 + 0.3,
      a: Math.random() * 0.8 + 0.2,
      s: Math.random() * 0.015 + 0.005,
      hue: Math.random() > 0.8 ? "#7dd3fc" : (Math.random() > 0.9 ? "#c084fc" : "#ffffff")
    }));
  }
  window.addEventListener("resize", resize);
  resize();
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    const neb = ctx.createRadialGradient(c.width * 0.5, c.height * 0.3, 20, c.width * 0.5, c.height * 0.3, c.width * 0.8);
    neb.addColorStop(0, "rgba(14, 165, 233, 0.09)");
    neb.addColorStop(0.5, "rgba(88, 28, 135, 0.05)");
    neb.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, c.width, c.height);
    stars.forEach(st => {
      st.a += st.s;
      if (st.a > 1 || st.a < 0.15) st.s *= -1;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fillStyle = st.hue;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, st.a));
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    
