// Main script: scroll-driven heart magnet, IntersectionObserver reveals, and final countdown
(function(){
  // Elements
  const stage = document.getElementById('stage');
  const leftLover = document.querySelector('.lover.left');
  const rightLover = document.querySelector('.lover.right');
  const root = document.documentElement;
  const hintBtn = document.getElementById('hintBtn');
  const loveStronger = document.getElementById('loveStronger');

  // Countdown outputs in final section
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minsEl = document.getElementById('minutes');
  const secsEl = document.getElementById('seconds');

  // Helper: clamp number
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Compute a scroll progress value (0..1) for the stage area
  let stageStart = 0;
  let stageEnd = 0;
  function recalcStage() {
    const rect = stage.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    stageStart = scrollY + rect.top - window.innerHeight * 0.4; // start a bit before
    stageEnd = scrollY + rect.bottom - window.innerHeight * 0.4;  // end when bottom reaches similar point
  }

  // Update visual progress by setting CSS var --p
  let lastP = -1;
  function updateProgress() {
    const scrollY = window.scrollY || window.pageYOffset;
    const raw = (scrollY - stageStart) / (stageEnd - stageStart || 1);
    const p = clamp(raw, 0, 1);
    if (Math.abs(p - lastP) > 0.001) {
      root.style.setProperty('--p', p.toFixed(3));
      lastP = p;
      // when p reaches 1, trigger final meet actions once
      if (p >= 0.995 && !root._met) {
        root._met = true;
        onHeartsMeet();
      }
    }
  }

  // IntersectionObserver: reveal elements when they enter viewport
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if (ent.isIntersecting) ent.target.classList.add('in-view');
    });
  },{threshold:0.2});

  // Observe all reveal-trigger elements
  document.querySelectorAll('.reveal, .reveal-trigger').forEach(el=> io.observe(el));

  // When hearts meet: burst hearts and reveal countdown
  function onHeartsMeet(){
    popHearts(window.innerWidth/2, window.innerHeight/2);
    // reveal countdown container (they are observed with 'reveal' class, but ensure visible)
    document.querySelectorAll('#finalCountdown, .reveal-title, .reveal-sub').forEach(el=> el.classList.add('in-view'));
    // start countdown
    startCountdown();
  }

  // confetti hearts
  function popHearts(x = window.innerWidth / 2, y = window.innerHeight / 2) {
    const count = 36;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-heart';
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      const size = Math.random() * 18 + 8;
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      const tx = (Math.random() * 600 - 300) + 'px';
      el.style.setProperty('--tx', tx);
      const duration = Math.random() * 1500 + 1200;
      el.style.animation = `confettiPop ${duration}ms cubic-bezier(.22,.9,.2,1) forwards`;
      document.body.appendChild(el);
      setTimeout(()=> el.remove(), duration + 50);
    }
  }

  // Button: drop hearts near button
  hintBtn.addEventListener('click', (e)=>{
    const r = e.currentTarget.getBoundingClientRect();
    popHearts(r.left + r.width/2, r.top + r.height/2);
  });

  // Countdown logic to Feb 14 (midnight) — similar to earlier implementation but triggered when hearts meet
  function getTarget() {
    const now = new Date();
    const year = now.getFullYear();
    let target = new Date(year, 1, 14, 0, 0, 0, 0);
    if (now > target) target = new Date(year+1,1,14,0,0,0,0);
    return target;
  }

  let countdownTimer = null;
  function startCountdown(){
    if (countdownTimer) return;
    function tick(){
      const now = new Date();
      const target = getTarget();
      const diff = Math.max(0, Math.floor((target - now)/1000));
      const days = Math.floor(diff/86400);
      const hours = Math.floor((diff%86400)/3600);
      const minutes = Math.floor((diff%3600)/60);
      const seconds = diff%60;
      daysEl.textContent = String(days).padStart(2,'0');
      hoursEl.textContent = String(hours).padStart(2,'0');
      minsEl.textContent = String(minutes).padStart(2,'0');
      secsEl.textContent = String(seconds).padStart(2,'0');
    }
    tick();
    countdownTimer = setInterval(tick,1000);
  }

  // Recalculate stage bounds on load/resize
  window.addEventListener('resize', ()=>{ recalcStage(); updateProgress(); });

  // Update on scroll using requestAnimationFrame for smoothness
  let raf = null;
  function onScroll(){
    if (raf) return;
    raf = requestAnimationFrame(()=>{ updateProgress(); raf = null; });
  }
  window.addEventListener('scroll', onScroll, {passive:true});

  // initial compute
  recalcStage(); updateProgress();
  // also recalc after a short delay in case fonts/layout change
  setTimeout(()=>{ recalcStage(); updateProgress(); }, 600);

})();
