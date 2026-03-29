/* ═══════════════════════════════════════
   BIRTHDAY SURPRISE — script.js
═══════════════════════════════════════ */

/* ─────────────────────────────────────
   GLOBAL STATE
───────────────────────────────────── */
let birthdayName   = 'kukkapilla';
let cutCount       = 0;
let galIndex       = 0;
let autoSlide      = null;
let isAnimating    = false;
let cakeZoneEl     = null;
let galStageEl     = null;
let galTouchStartX = 0;
let swipeOnCake    = false;
let swipeMinX      = Infinity;
let swipeMaxX      = -Infinity;
let nameAttempts   = 0;
const CORRECT_NAME = 'kukkapilla';
let dialogPassed   = false;
let ivvanuClicked  = false;
let cryTapped      = false;

/* ─────────────────────────────────────
   AUDIO
───────────────────────────────────── */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, vol) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    gain.gain.setValueAtTime(vol || 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}
function playSlash() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random()*2-1)*Math.pow(1-i/data.length, 2);
    const src = ctx.createBufferSource(), gain = ctx.createGain(), filt = ctx.createBiquadFilter();
    filt.type = 'bandpass'; filt.frequency.value = 1800;
    src.buffer = buf; src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.7, ctx.currentTime); src.start();
  } catch(e) {}
}
function playPop() {
  playTone(520,'sine',0.18,0.4);
  setTimeout(() => playTone(780,'sine',0.18,0.3), 60);
  setTimeout(() => playTone(1040,'sine',0.22,0.25), 130);
}
function playCandlePop() { playTone(900,'triangle',0.12,0.35); }
function playUnlock() {
  playTone(440,'sine',0.1,0.3);
  setTimeout(() => playTone(660,'sine',0.12,0.3), 100);
  setTimeout(() => playTone(880,'sine',0.2,0.4), 220);
}
function playWrong() {
  playTone(300,'sawtooth',0.15,0.35);
  setTimeout(() => playTone(220,'sawtooth',0.2,0.3), 150);
}

/* ─────────────────────────────────────
   MUSIC
───────────────────────────────────── */
let bgAudio, musicOn = false;
const musicBtn = document.getElementById('musicBtn');
function toggleMusic() {
  if (!bgAudio) {
    bgAudio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
    bgAudio.loop = true; bgAudio.volume = 0.3;
  }
  if (musicOn) { bgAudio.pause(); musicBtn.textContent = '🎵'; }
  else { bgAudio.play().catch(() => {}); musicBtn.textContent = '🔇'; }
  musicOn = !musicOn;
}

/* ─────────────────────────────────────
   SHOW / HIDE
───────────────────────────────────── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

/* ─────────────────────────────────────
   FLOATING PETALS
───────────────────────────────────── */
function initPetals() {
  const layer = document.getElementById('petalsLayer');
  const emojis = ['🌸','🌺','💮','🌷','✨','💖','⭐','🌟'];
  for (let i = 0; i < 18; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDelay = (Math.random() * 12) + 's';
    p.style.animationDuration = (10 + Math.random() * 14) + 's';
    p.style.fontSize = (12 + Math.random() * 14) + 'px';
    p.style.opacity = 0.25 + Math.random() * 0.4;
    layer.appendChild(p);
  }
}

/* ─────────────────────────────────────
   UNLOCK SPARKLES
───────────────────────────────────── */
function initUnlockSparkles() {
  const container = document.getElementById('unlockSparkles');
  if (!container) return;
  const glyphs = ['✦','✧','⋆','✶','✸','✺','❋','✿','❀','✽'];
  for (let i = 0; i < 14; i++) {
    const s = document.createElement('span');
    s.className = 'unlock-sparkle';
    s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    const angle = (i / 14) * 360;
    const radius = 28 + Math.random() * 14;
    s.style.left = (50 + radius * Math.cos(angle * Math.PI / 180) * 0.6) + 'vw';
    s.style.top  = (44 + radius * Math.sin(angle * Math.PI / 180) * 0.55) + 'vh';
    s.style.fontSize = (10 + Math.random() * 14) + 'px';
    s.style.color = ['#f4a0c8','#fbbf24','#e040a0','#a78bfa','#f97316'][Math.floor(Math.random() * 5)];
    s.style.animationDelay = (Math.random() * 4) + 's';
    s.style.animationDuration = (3 + Math.random() * 3) + 's';
    container.appendChild(s);
  }
}

/* ─────────────────────────────────────
   EMOJI BURST
───────────────────────────────────── */
function emojiBurst(emojis, count) {
  const wrap = document.getElementById('emojiBurst');
  wrap.innerHTML = ''; wrap.classList.remove('hidden');
  const list = emojis || ['🎉','💖','✨','🌸','🎊','⭐'];
  for (let i = 0; i < (count || 16); i++) {
    const e = document.createElement('span');
    e.textContent = list[Math.floor(Math.random() * list.length)];
    e.style.left = (10 + Math.random() * 80) + 'vw';
    e.style.top  = (20 + Math.random() * 60) + 'vh';
    e.style.fontSize = (18 + Math.random() * 22) + 'px';
    e.style.animationDelay = (Math.random() * 0.4) + 's';
    e.className = 'burst-emoji';
    wrap.appendChild(e);
  }
  setTimeout(() => { wrap.classList.add('hidden'); wrap.innerHTML = ''; }, 1400);
}
function screenShake() {
  document.body.classList.add('shake');
  setTimeout(() => document.body.classList.remove('shake'), 500);
}

/* ─────────────────────────────────────
   UNLOCK CHEST
───────────────────────────────────── */
let chestOpened = false;
function unlockChest() {
  if (chestOpened) return;
  chestOpened = true;
  playUnlock();
  document.getElementById('chestLock').textContent = '🔓';
  document.getElementById('chestLock').style.transform = 'scale(1.4)';
  document.getElementById('chestLid').classList.add('open');
  document.getElementById('tapHint').textContent = '✨ Opening... ✨';
  emojiBurst(['✨','💖','🌸','⭐','🎀','💫','🌟'], 18);
  setTimeout(() => {
    show('envelopeReveal');
    animateEnvelopeReveal();
  }, 1200);
}

/* ─────────────────────────────────────
   ENVELOPE REVEAL — fade in + letter typewriter
───────────────────────────────────── */
function animateEnvelopeReveal() {
  const emoji = document.getElementById('envEmoji');
  const l1    = document.getElementById('envLine1');
  const l2    = document.getElementById('envLine2');
  const l3    = document.getElementById('envLine3');
  const card  = document.getElementById('envContent');

  /* Reset everything to invisible */
  [emoji, l1, l2, l3].forEach(el => { if (el) { el.style.opacity = '0'; el.textContent = ''; } });
  if (card) card.style.opacity = '0';

  buildEnvSparkles();

  /* 1. Fade in card */
  setTimeout(() => {
    if (card) {
      card.style.transition = 'opacity 0.8s ease';
      card.style.opacity = '1';
    }
  }, 100);

  /* 2. Fade in emoji */
  setTimeout(() => {
    if (emoji) {
      emoji.textContent = '💌';
      emoji.style.transition = 'opacity 1s ease';
      emoji.style.opacity = '1';
      playTone(500, 'sine', 0.15, 0.2);
    }
  }, 600);

  /* 3. Type line 1 */
  setTimeout(() => {
    typewriterEl(l1, 'neeku dabbulu em pampaledhu le kani', 52, () => {
      /* 4. Type line 2 */
      setTimeout(() => {
        typewriterEl(l2, 'pakkana tap chey 👉', 60, () => {
          /* 5. Type line 3 */
          setTimeout(() => {
            typewriterEl(l3, '( screen meeda ekkada tap cheysinaa work avvuthadhi le😄 )', 38, null);
          }, 200);
        });
      }, 200);
    });
  }, 1400);
}

/* Generic letter-by-letter typewriter into an element */
function typewriterEl(el, text, charDelay, onDone) {
  if (!el) { if (onDone) onDone(); return; }
  el.style.transition = 'opacity 0.4s ease';
  el.style.opacity = '1';
  el.textContent = '';
  let i = 0;
  function next() {
    if (i < text.length) {
      el.textContent += text[i];
      i++;
      setTimeout(next, charDelay);
    } else {
      if (onDone) onDone();
    }
  }
  next();
}

function buildEnvSparkles() {
  const ring = document.getElementById('envSparkleRing');
  if (!ring) return;
  ring.innerHTML = '';
  const glyphs = ['✨','💖','🌸','⭐','💫','🌟','💕','🎀','✦','💗'];
  for (let i = 0; i < 12; i++) {
    const s = document.createElement('span');
    s.textContent = glyphs[i % glyphs.length];
    s.className = 'env-sparkle-dot';
    s.style.left              = (5 + Math.random() * 90) + 'vw';
    s.style.bottom            = '-30px';
    s.style.animationDuration = (7 + Math.random() * 8) + 's';
    s.style.animationDelay    = (Math.random() * 5) + 's';
    s.style.fontSize          = (12 + Math.random() * 11) + 'px';
    ring.appendChild(s);
  }
}
function goToNameEntry() {
  playPop();
  emojiBurst(['💌','✨','💖','🎀'], 10);
  nameAttempts = 0;
  document.getElementById('hintBtn').classList.add('hidden');
  document.getElementById('nameError').classList.add('hidden');
  document.getElementById('nameInput').value = '';
  setTimeout(() => { show('nameEntry'); document.getElementById('nameInput').focus(); }, 300);
}

/* ─────────────────────────────────────
   NAME ENTRY
───────────────────────────────────── */
function submitName() {
  const input = document.getElementById('nameInput');
  const err   = document.getElementById('nameError');
  const hint  = document.getElementById('hintBtn');
  const val   = input.value.trim().toLowerCase();

  if (!val) {
    err.textContent = 'musukuni sariga enter chey ledha muthi paguludhi 😤';
    err.classList.remove('hidden');
    input.classList.add('shake-input');
    setTimeout(() => input.classList.remove('shake-input'), 400);
    return;
  }
  if (val === CORRECT_NAME) {
    err.classList.add('hidden');
    playPop();
    emojiBurst(['🎀','💖','✨','🌸','🐾'], 12);
    setTimeout(() => startCountdown(), 600);
    return;
  }
  nameAttempts++;
  playWrong();
  err.textContent = 'musukuni sariga enter chey ledha muthi paguludhi 😤';
  err.classList.remove('hidden');
  input.classList.add('shake-input');
  setTimeout(() => input.classList.remove('shake-input'), 400);
  input.value = '';
  if (nameAttempts >= 3) hint.classList.remove('hidden');
}
document.getElementById('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') submitName(); });

function showHint() {
  document.getElementById('hintModal').classList.remove('hidden');
  playTone(660,'sine',0.2,0.3);
  emojiBurst(['🤫','💡','✨'], 6);
}
function closeHintModal() {
  document.getElementById('hintModal').classList.add('hidden');
  document.getElementById('nameInput').focus();
}

/* ─────────────────────────────────────
   LOADING MESSAGES
───────────────────────────────────── */
const LOADING_MSGS = [
];
let loadMsgInterval = null, loadMsgIndex = 0;
function startLoadingMessages() {
  loadMsgIndex = 0;
  const el = document.getElementById('loadingText');
  el.textContent = LOADING_MSGS[0];
  loadMsgInterval = setInterval(() => {
    loadMsgIndex = (loadMsgIndex + 1) % LOADING_MSGS.length;
    el.style.opacity = 0;
    setTimeout(() => { el.textContent = LOADING_MSGS[loadMsgIndex]; el.style.opacity = 1; }, 300);
  }, 900);
}
function stopLoadingMessages() { clearInterval(loadMsgInterval); }

/* ─────────────────────────────────────
   COUNTDOWN
───────────────────────────────────── */
let count = 3;
const countdownEl = document.getElementById('countNumber');
let countdownInterval = null;
function startCountdown() {
  clearInterval(countdownInterval);
  count = 3; countdownEl.textContent = count;
  document.getElementById('countSub').textContent = 'Get ready...';
  show('countdown');
  countdownInterval = setInterval(() => {
    count--;
    if (count > 0) { countdownEl.textContent = count; playTone(440 + count*80,'triangle',0.15,0.25); }
    else {
      clearInterval(countdownInterval); playPop();
      show('loading'); startLoadingMessages();
      setTimeout(() => { stopLoadingMessages(); show('message'); }, 4000);
    }
  }, 1000);
}

/* ─────────────────────────────────────
   EASTER EGG
───────────────────────────────────── */
let kittyTapCount = 0, kittyTapTimer = null;
document.getElementById('easterEggKitty').addEventListener('click', () => {
  kittyTapCount++;
  playTone(600 + kittyTapCount*60,'triangle',0.08,0.2);
  const k = document.getElementById('easterEggKitty');
  k.style.transform = 'scale(1.2) rotate(10deg)';
  setTimeout(() => { k.style.transform = ''; }, 200);
  clearTimeout(kittyTapTimer);
  kittyTapTimer = setTimeout(() => { kittyTapCount = 0; }, 2000);
  if (kittyTapCount >= 5) { kittyTapCount = 0; showEasterEgg(); }
});
function showEasterEgg() {
  const msgs = [
  ];
  document.getElementById('easterText').textContent = msgs[Math.floor(Math.random() * msgs.length)];
  document.getElementById('easterEggModal').classList.remove('hidden');
  emojiBurst(['🐾','✨','💖','🌟','😸'], 12); playPop();
}
function closeEasterEgg() { document.getElementById('easterEggModal').classList.add('hidden'); }

/* ═══════════════════════════════════════════════════════════
   MULTI-STEP DIALOG FLOW
   ─────────────────────────────────────────────────────────
   startBirthdayFlow()
     └─ dlg1: "next em vundhoo chudalani vundhaa?"
         ├─ "chudalani vundhu" → dlg2a
         │     ├─ "istha" → dlg3hug (3s) → proceedToCandles()
         │     └─ "ivvanu" → disable btn, show warn (stay on dlg2a)
         └─ "chudanu" → dlg2b
               ├─ "chustha" → dlg2a (same flow)
               └─ "chudanu" → dlg3cry
                     └─ tap anywhere → show prompt
                           └─ "chustha" → dlg2a (same flow)
══════════════════════════════════════════════════════════ */

function showDialog(id) {
  document.querySelectorAll('.dialog-box').forEach(b => b.classList.add('hidden'));
  document.getElementById('dialogOverlay').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
}
function hideAllDialogs() {
  document.getElementById('dialogOverlay').classList.add('hidden');
  document.querySelectorAll('.dialog-box').forEach(b => b.classList.add('hidden'));
}

/* Entry point — called by the main button */
function startBirthdayFlow() {
  if (dialogPassed) { proceedToCandles(); return; }
  ivvanuClicked = false;
  cryTapped = false;
  resetDlg2aBtn();
  document.getElementById('ivvanuWarn').classList.add('hidden');
  document.getElementById('cryTapPrompt').classList.add('hidden');
  document.getElementById('cryTapHint').classList.remove('hidden');
  showDialog('dlg1');
}

/* ── DLG 1 ── */
function dlg1Yes() {
  /* "chudalani vundhu" */
  playPop();
  resetDlg2aBtn();
  document.getElementById('ivvanuWarn').classList.add('hidden');
  showDialog('dlg2a');
}
function dlg1No() {
  /* "chudanu" */
  playTone(300,'sawtooth',0.1,0.2);
  showDialog('dlg2b');
}

/* ── DLG 2a ── */
function dlg2aIstha() {
  playPop();
  emojiBurst(['💖','🥰','✨','💕'], 14);
  showDialog('dlg3hug');
  setTimeout(() => {
    hideAllDialogs();
    dialogPassed = true;
    proceedToCandles();
  }, 3200);
}
function dlg2aIvvanu() {
  if (ivvanuClicked) return;
  ivvanuClicked = true;
  playWrong();
  const btn = document.getElementById('ivvanuBtn');
  btn.disabled = true;
  btn.style.opacity = '0.35';
  btn.style.cursor = 'not-allowed';
  btn.style.transform = 'scale(0.93)';
  document.getElementById('ivvanuWarn').classList.remove('hidden');
}

/* ── DLG 2b ── */
function dlg2bChustha() {
  playPop();
  resetDlg2aBtn();
  document.getElementById('ivvanuWarn').classList.add('hidden');
  showDialog('dlg2a');
}
function dlg2bChudanu() {
  playWrong();
  cryTapped = false;
  document.getElementById('cryTapPrompt').classList.add('hidden');
  document.getElementById('cryTapHint').classList.remove('hidden');
  showDialog('dlg3cry');
}

/* ── CRY scene ── */
function dlg3cryTap(e) {
  /* Ignore taps on buttons */
  if (e && e.target) {
    const t = e.target;
    if (t.tagName === 'BUTTON' || t.closest('button')) return;
  }
  if (cryTapped) return;
  cryTapped = true;
  document.getElementById('cryTapHint').classList.add('hidden');
  document.getElementById('cryTapPrompt').classList.remove('hidden');
  playTone(300,'sawtooth',0.1,0.2);
}
function dlg3cryChustha(e) {
  if (e) e.stopPropagation();
  playPop();
  resetDlg2aBtn();
  document.getElementById('ivvanuWarn').classList.add('hidden');
  showDialog('dlg2a');
}

/* Helper: reset the ivvanu button back to enabled */
function resetDlg2aBtn() {
  ivvanuClicked = false;
  const btn = document.getElementById('ivvanuBtn');
  if (btn) { btn.disabled = false; btn.style.opacity = ''; btn.style.cursor = ''; btn.style.transform = ''; }
}

/* Actual navigation to candle screen */
function proceedToCandles() {
  show('candleScreen');
  buildCandles();
}

/* ─────────────────────────────────────
   CANDLE BLOW-OUT
───────────────────────────────────── */
const CANDLE_COUNT = 3;
let candlesBlown = 0;
function buildCandles() {
  candlesBlown = 0;
  const row = document.getElementById('candleRow');
  row.innerHTML = '';
  document.getElementById('candleCount').textContent = CANDLE_COUNT;
  document.getElementById('candleHint').innerHTML =
    `🌬️ Blow out all <span id="candleCount">${CANDLE_COUNT}</span> candles!`;
  for (let i = 0; i < CANDLE_COUNT; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'candle-wrap';
    wrap.innerHTML = `
      <div class="candle-flame" id="flame-${i}"><div class="flame-inner"></div></div>
      <div class="candle-body" style="background:${['#a78bfa','#f080b8','#34d399'][i]}"></div>
      <div class="candle-base"></div>`;
    wrap.addEventListener('click', () => blowCandle(i, wrap));
    row.appendChild(wrap);
  }
}
function blowCandle(index, wrap) {
  const flame = document.getElementById(`flame-${index}`);
  if (!flame || flame.classList.contains('out')) return;
  flame.classList.add('out');
  playCandlePop();
  emojiBurst(['💨','✨','🌬️'], 6);
  const smoke = document.createElement('div');
  smoke.className = 'smoke-puff'; wrap.appendChild(smoke);
  setTimeout(() => smoke.remove(), 800);
  candlesBlown++;
  if (candlesBlown >= CANDLE_COUNT) {
    document.getElementById('candleHint').textContent = '🎉 All candles out! Amazing!';
    playPop(); screenShake();
    emojiBurst(['🎉','✨','💖','🌸','🎊','⭐'], 20);
    setTimeout(() => { show('cake'); resetCake(); }, 1200);
  }
}

/* ─────────────────────────────────────
   CAKE SWIPE
───────────────────────────────────── */
const SWIPE_MIN_DISTANCE = 80;
function onSwipeStart(e) {
  if (cutCount >= 2) return; e.preventDefault();
  const pos = getEventPos(e); swipeOnCake = true; swipeMinX = pos.x; swipeMaxX = pos.x;
  moveKnifeTo(pos.x, pos.y);
  const knife = document.getElementById('knifeWrap'); if (knife) knife.classList.add('cutting');
}
function onSwipeMove(e) {
  if (!swipeOnCake || cutCount >= 2) return; e.preventDefault();
  const pos = getEventPos(e);
  swipeMinX = Math.min(swipeMinX, pos.x); swipeMaxX = Math.max(swipeMaxX, pos.x);
  moveKnifeTo(pos.x, pos.y);
}
function onSwipeEnd(e) {
  if (!swipeOnCake) return; swipeOnCake = false;
  const knife = document.getElementById('knifeWrap'); if (knife) knife.classList.remove('cutting');
  if ((swipeMaxX - swipeMinX) >= SWIPE_MIN_DISTANCE && cutCount < 2) registerCut();
  else resetKnifePosition();
}
function getEventPos(e) {
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}
function resetKnifePosition() {
  const knife = document.getElementById('knifeWrap'); if (!knife) return;
  knife.style.left = knife.style.top = knife.style.transform = knife.style.position = '';
}
function moveKnifeTo(clientX, clientY) {
  const knife = document.getElementById('knifeWrap'), zone = document.getElementById('cakeZone');
  if (!knife || !zone) return;
  const rect = zone.getBoundingClientRect();
  knife.style.position = 'absolute';
  knife.style.left = (clientX - rect.left) + 'px';
  knife.style.top  = (clientY - rect.top)  + 'px';
  knife.style.transform = 'translate(-50%,-50%) rotate(90deg) scale(1.15)';
}
function registerCut() {
  cutCount++; playSlash();
  const hint  = document.getElementById('slashHint');
  const knife = document.getElementById('knifeWrap');
  const arrow = document.getElementById('swipeArrow');
  if (arrow) arrow.classList.add('hide');
  if (knife) { knife.classList.add('slash-anim'); setTimeout(() => { knife.classList.remove('slash-anim'); resetKnifePosition(); }, 450); }
  if (cutCount === 1) {
    document.getElementById('dot1').classList.add('done');
    hint.textContent = '✦ Great! One more swipe! ✦';
    document.getElementById('cutLine1').setAttribute('stroke','rgba(220,50,130,0.6)');
    emojiBurst(['✂️','💫','✨'], 8);
  } else {
    document.getElementById('dot2').classList.add('done');
    hint.textContent = '🎂 The cake is cut! 🎉';
    const left = document.getElementById('cakeLeft'), right = document.getElementById('cakeRight');
    if (left)  left.style.animation  = 'splitLeft 0.6s ease forwards';
    if (right) right.style.animation = 'splitRight 0.6s ease forwards';
    setTimeout(() => emojiBurst(['🎉','💖','✨','🌸','🎊','⭐','🍰'], 20), 200);
    screenShake(); playPop();
    setTimeout(() => { document.getElementById('bdayName').textContent = 'kukkapilla'; show('birthday'); launchConfetti(); }, 900);
  }
}
function resetCake() {
  cutCount = 0; swipeOnCake = false; swipeMinX = Infinity; swipeMaxX = -Infinity;
  document.getElementById('slashHint').textContent = '✦ Swipe across the cake to cut it ✦';
  ['dot1','dot2'].forEach(id => { const el = document.getElementById(id); if (el) el.classList.remove('done'); });
  const c1 = document.getElementById('cutLine1'); if (c1) c1.setAttribute('stroke','rgba(220,50,130,0)');
  const ar = document.getElementById('swipeArrow'); if (ar) ar.classList.remove('hide');
  const cl = document.getElementById('cakeLeft'); if (cl) cl.style.animation = '';
  const cr = document.getElementById('cakeRight'); if (cr) cr.style.animation = '';
  resetKnifePosition(); setupCakeSwipe();
}
function setupCakeSwipe() {
  if (cakeZoneEl) {
    cakeZoneEl.removeEventListener('touchstart',  onSwipeStart);
    cakeZoneEl.removeEventListener('touchmove',   onSwipeMove);
    cakeZoneEl.removeEventListener('touchend',    onSwipeEnd);
    cakeZoneEl.removeEventListener('touchcancel', onSwipeEnd);
    cakeZoneEl.removeEventListener('mousedown',   onSwipeStart);
    cakeZoneEl.removeEventListener('mousemove',   onSwipeMove);
    cakeZoneEl.removeEventListener('mouseup',     onSwipeEnd);
    cakeZoneEl.removeEventListener('mouseleave',  onSwipeEnd);
  }
  cakeZoneEl = document.getElementById('cakeZone'); if (!cakeZoneEl) return;
  cakeZoneEl.addEventListener('touchstart',  onSwipeStart, { passive: false });
  cakeZoneEl.addEventListener('touchmove',   onSwipeMove,  { passive: false });
  cakeZoneEl.addEventListener('touchend',    onSwipeEnd,   { passive: false });
  cakeZoneEl.addEventListener('touchcancel', onSwipeEnd,   { passive: false });
  cakeZoneEl.addEventListener('mousedown',   onSwipeStart);
  cakeZoneEl.addEventListener('mousemove',   onSwipeMove);
  cakeZoneEl.addEventListener('mouseup',     onSwipeEnd);
  cakeZoneEl.addEventListener('mouseleave',  onSwipeEnd);
}

/* ─────────────────────────────────────
   CONFETTI
───────────────────────────────────── */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas'), ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const colors = ['#ff78b8','#ff3080','#f7c0dc','#ffacdf','#ffd0e8','#e040a0','#fff','#ffa0cc','#a78bfa','#fde047'];
  const pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width, y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 8 + 3, d: Math.random() * 2.5 + 1.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * Math.PI * 2, ti: (Math.random() - 0.5) * 0.1
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tilt += p.ti; p.y += p.d;
      if (p.y > canvas.height + 20) { p.y = -10; p.x = Math.random() * canvas.width; }
      ctx.beginPath(); ctx.fillStyle = p.color;
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.45, p.tilt, 0, Math.PI * 2); ctx.fill();
    });
    if (++frame < 480) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  draw();
}

/* ─────────────────────────────────────
   GALLERY — photo quote screen first
───────────────────────────────────── */
function goGallery() {
  show('photoQuote');
  playPop();
  emojiBurst(['📸','💖','🌸','✨'], 8);
  animatePhotoQuote();
}

function showGalleryNow() {
  show('gallery');
  buildGallery();
  startAutoSlide();
  msgBtnClicks = 0;
  resetMsgBtn();
}

/* ── PHOTO QUOTE — emoji fade in then letter-by-letter typewriter ── */
function animatePhotoQuote() {
  const textEl = document.getElementById('pqText');
  const tapEl  = document.getElementById('pqTap');
  const emoji  = document.getElementById('pqEmoji');
  const card   = document.getElementById('pqContent');
  if (!textEl || !tapEl) return;

  /* Reset */
  textEl.innerHTML = '';
  tapEl.classList.add('hidden');
  if (emoji)  { emoji.style.opacity = '0'; emoji.style.transition = ''; }
  if (card)   { card.style.opacity = '0'; card.style.transition = ''; }

  /*
    The full text as segments:
    each segment has { text, highlight } — highlight=true → pink bold
  */
  const segments = [
    { t: 'naaku photos theysukovadam raadhu in case theysukunna naaku nene nachanu nee baasha lo ', h: false },
    { t: '"selflove ledhu"', h: true },
    { t: ' but neetho theysukunna prathi pic naako special moment naaku nene kothaga vunna neetho photo ante adhoka happiness at that time i became a ', h: false },
    { t: 'photoholic', h: true },
    { t: ' emo ento thelidhu kani neetho pics ante baguntadhi naaku ', h: false },
    { t: 'chala istam', h: true },
    { t: ' 🥺💖', h: false },
    { t: ' i enjoy a lot by taking pics with you only you and you are the one why i like taking pics', h: false },
    { t: ' Love you and Many more happy returns of the day my kukkapilla garu.....', h: true },
  ];

  /* 1. Fade in card */
  setTimeout(() => {
    if (card) { card.style.transition = 'opacity 0.7s ease'; card.style.opacity = '1'; }
  }, 80);

  /* 2. Fade in emoji */
  setTimeout(() => {
    if (emoji) {
      emoji.style.transition = 'opacity 0.9s ease';
      emoji.style.opacity = '1';
      playTone(550, 'sine', 0.12, 0.2);
    }
  }, 500);

  /* 3. Type all segments letter by letter after emoji settles */
  setTimeout(() => {
    typeSegments(textEl, segments, 0, 0, () => {
      /* Done — show tap hint */
      setTimeout(() => {
        tapEl.classList.remove('hidden');
        tapEl.style.opacity = '0';
        tapEl.style.transition = 'opacity 0.8s ease';
        void tapEl.offsetWidth;
        tapEl.style.opacity = '1';
        playTone(700, 'sine', 0.12, 0.2);
      }, 300);
    });
  }, 1300);
}

/*
  Recursively types segments one character at a time.
  When a segment has h=true, characters go into a <span class="pq-hl">.
  segIdx = current segment index, charIdx = current char in that segment.
*/
function typeSegments(container, segs, segIdx, charIdx, onDone) {
  if (segIdx >= segs.length) { if (onDone) onDone(); return; }

  const seg = segs[segIdx];

  if (charIdx === 0) {
    /* Start a new span for this segment */
    const span = document.createElement('span');
    span.className = seg.h ? 'pq-hl' : 'pq-normal';
    span.id = 'pq-seg-' + segIdx;
    container.appendChild(span);
  }

  const span = document.getElementById('pq-seg-' + segIdx);
  if (!span) { typeSegments(container, segs, segIdx + 1, 0, onDone); return; }

  if (charIdx < seg.t.length) {
    span.textContent += seg.t[charIdx];
    const delay = seg.t[charIdx] === ' ' ? 18 : 38;
    setTimeout(() => typeSegments(container, segs, segIdx, charIdx + 1, onDone), delay);
  } else {
    /* Move to next segment */
    setTimeout(() => typeSegments(container, segs, segIdx + 1, 0, onDone), 10);
  }
}

/* ── MSG BUTTON SHUFFLE LOGIC ──
   Clicks 1-6: button shuffles to a random position.
   Click 7: show "chupinchalaaaa" modal.
   "avasaram ledhu" → shuffle again indefinitely.
   "chupinchali" → open the letter.
────────────────────────────────── */
let msgBtnClicks = 0;
let msgBtnShuffling = false;  /* prevents double-fire during animation */

function handleMsgBtnClick() {
  if (msgBtnShuffling) return;
  msgBtnClicks++;

  if (msgBtnClicks < 7) {
    /* Shuffle the button to a random spot */
    shuffleMsgBtn();
    playTone(400 + msgBtnClicks * 30, 'triangle', 0.1, 0.2);
  } else {
    /* 7th click: stop shuffling, show modal */
    resetMsgBtn();
    document.getElementById('chupinchaModal').classList.remove('hidden');
    playPop();
    emojiBurst(['🥺','💖','✨'], 8);
  }
}

function shuffleMsgBtn() {
  const btn = document.getElementById('msgBtn');
  const wrap = document.getElementById('msgBtnWrap');
  if (!btn || !wrap) return;

  msgBtnShuffling = true;

  /* Calculate safe area inside gallery screen */
  const sw = window.innerWidth;
  const sh = window.innerHeight;
  const bw = btn.offsetWidth  || 200;
  const bh = btn.offsetHeight || 46;

  /* Keep button within viewport with some padding */
  const pad = 20;
  const maxX = sw - bw - pad;
  const maxY = sh - bh - pad;
  const randX = pad + Math.random() * (maxX - pad);
  const randY = pad + Math.random() * (maxY - pad * 3);

  /* Make the wrap position:fixed and move it */
  wrap.style.position = 'fixed';
  wrap.style.left = randX + 'px';
  wrap.style.top  = randY + 'px';
  wrap.style.zIndex = '8900';
  wrap.style.transition = 'left 0.25s cubic-bezier(.34,1.56,.64,1), top 0.25s cubic-bezier(.34,1.56,.64,1)';

  /* Wiggle animation on button */
  btn.style.animation = 'btnWiggle 0.3s ease';
  setTimeout(() => {
    if (btn) btn.style.animation = '';
    msgBtnShuffling = false;
  }, 320);
}

function resetMsgBtn() {
  const wrap = document.getElementById('msgBtnWrap');
  if (!wrap) return;
  wrap.style.position = '';
  wrap.style.left = '';
  wrap.style.top  = '';
  wrap.style.zIndex = '';
  wrap.style.transition = '';
}

function chupinchaNo() {
  /* "avasaram ledhu" — close modal, reset counter, let it shuffle again */
  document.getElementById('chupinchaModal').classList.add('hidden');
  msgBtnClicks = 0;
  resetMsgBtn();
  playTone(300, 'sawtooth', 0.12, 0.2);
}

function chupinchaYes() {
  /* "chupinchali" — open the letter */
  document.getElementById('chupinchaModal').classList.add('hidden');
  openMessage();
}

const PHOTOS = [
  { src: 'photos/photo1.jpg', label: '🌸 Best Friends',  msg: 'This moment? Absolutely iconic. 💖' },
  { src: 'photos/photo2.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo3.jpg', label: '✨ Pure Joy',       msg: 'This smile can light up the whole world. 🌟' },
  { src: 'photos/photo4.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo5.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo6.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo7.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo8.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo9.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo10.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo11.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo12.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo13.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo14.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo14.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },

];
const ROTATIONS = [2, -3, 1.5, -2, 3, -1, 2.5, -3.5, 0.5, -2.5];

function buildGallery() {
  galIndex = 0;
  const stage = document.getElementById('polaroidStage');
  const counter = document.getElementById('galCounter');
  stage.innerHTML = '';
  PHOTOS.forEach((photo, i) => {
    const card = document.createElement('div');
    card.className = 'polaroid' + (i === 0 ? ' active' : '') + (i === 1 ? ' next' : '');
    card.style.setProperty('--rot', ROTATIONS[i % ROTATIONS.length] + 'deg');
    card.innerHTML = `<div class="polaroid-img-wrap">
      <img src="${photo.src}" alt="${photo.label}" class="polaroid-img"
           onerror="this.parentElement.style.background='linear-gradient(135deg,#f9c0d8,#e040a0)';this.style.display='none'">
      <div class="develop-overlay"></div></div>
      <div class="polaroid-label">${photo.label}</div>`;
    let pressTimer = null;
    const sp = () => { pressTimer = setTimeout(() => showPhotoMsg(photo.msg || '💖'), 600); };
    const ep = () => clearTimeout(pressTimer);
    card.addEventListener('mousedown', sp); card.addEventListener('mouseup', ep); card.addEventListener('mouseleave', ep);
    card.addEventListener('touchstart', sp, { passive: true }); card.addEventListener('touchend', ep, { passive: true }); card.addEventListener('touchcancel', ep, { passive: true });
    card.addEventListener('click', () => galleryNext());
    stage.appendChild(card);
  });
  counter.textContent = `1 / ${PHOTOS.length}`; setupGallerySwipe();
}
function showPhotoMsg(msg) {
  document.getElementById('photoMsgText').textContent = msg;
  document.getElementById('photoMsg').classList.remove('hidden');
  playPop(); emojiBurst(['💖','✨','🌸'], 8);
}
function closePhotoMsg() { document.getElementById('photoMsg').classList.add('hidden'); }
function updateCards() {
  const cards = document.querySelectorAll('.polaroid'), total = PHOTOS.length;
  cards.forEach((card, i) => {
    card.classList.remove('active','next','prev','far-next','far-prev');
    const diff = ((i - galIndex) % total + total) % total;
    if (diff === 0) card.classList.add('active');
    else if (diff === 1) card.classList.add('next');
    else if (diff === total - 1) card.classList.add('prev');
    else if (diff === 2) card.classList.add('far-next');
    else if (diff === total - 2) card.classList.add('far-prev');
  });
  document.getElementById('galCounter').textContent = `${galIndex + 1} / ${total}`;
}
function galleryNext() { if (isAnimating) return; isAnimating = true; galIndex = (galIndex + 1) % PHOTOS.length; updateCards(); resetAutoSlide(); setTimeout(() => { isAnimating = false; }, 400); }
function galleryPrev() { if (isAnimating) return; isAnimating = true; galIndex = (galIndex - 1 + PHOTOS.length) % PHOTOS.length; updateCards(); resetAutoSlide(); setTimeout(() => { isAnimating = false; }, 400); }
function startAutoSlide() { clearInterval(autoSlide); autoSlide = setInterval(galleryNext, 3200); }
function resetAutoSlide() { clearInterval(autoSlide); autoSlide = setInterval(galleryNext, 3200); }
function setupGallerySwipe() {
  if (galStageEl) { galStageEl.removeEventListener('touchstart', onGalTouchStart); galStageEl.removeEventListener('touchend', onGalTouchEnd); }
  galStageEl = document.getElementById('polaroidStage'); if (!galStageEl) return;
  galStageEl.addEventListener('touchstart', onGalTouchStart, { passive: true });
  galStageEl.addEventListener('touchend',   onGalTouchEnd,   { passive: true });
}
function onGalTouchStart(e) { galTouchStartX = e.touches[0].clientX; }
function onGalTouchEnd(e) { const dx = e.changedTouches[0].clientX - galTouchStartX; if (Math.abs(dx) > 40) dx < 0 ? galleryNext() : galleryPrev(); }

let lastShake = 0;
window.addEventListener('devicemotion', e => {
  const a = e.accelerationIncludingGravity; if (!a) return;
  const total = Math.abs(a.x) + Math.abs(a.y) + Math.abs(a.z), now = Date.now();
  if (total > 28 && now - lastShake > 1000) { lastShake = now; const s = document.getElementById('gallery'); if (!s.classList.contains('hidden')) { galleryNext(); emojiBurst(['🌸','✨','💫'], 6); } }
});

/* ─────────────────────────────────────
   LETTER
───────────────────────────────────── */
function openMessage() {
  clearInterval(autoSlide); show('letter');
  document.getElementById('waxSealWrap').classList.remove('hidden');
  document.getElementById('waxSeal').classList.remove('broken');
  document.getElementById('letterContent').classList.add('hidden');
  document.getElementById('letterTyped').textContent = '';
  document.getElementById('letterEndDeco').style.display = 'none';
}
function getLetterText() {
  return 'Happy Birthday, kukkapilla! 🎀 You deserve all the happiness, love, and smiles in the world today and always. You have this special way of making everything around you brighter — your smile, your kindness, and the way you make people feel truly cared for.\n\nI hope your day is filled with laughter, surprises, and moments that make your heart happy. You\'re truly one of a kind, and I just want you to know how special you are.\n\nKeep being the amazing person you are, spreading joy wherever you go. Wishing you endless happiness, success, and all the sweet things life has to offer. ❤️';
}
function breakSeal() {
  const seal = document.getElementById('waxSeal');
  if (seal.classList.contains('broken')) return;
  seal.classList.add('broken'); playPop();
  emojiBurst(['💌','💖','✨','🎀'], 12);
  setTimeout(() => {
    document.getElementById('waxSealWrap').classList.add('hidden');
    document.getElementById('letterContent').classList.remove('hidden');
    startTypewriter(getLetterText());
  }, 700);
}
function startTypewriter(text) {
  const el = document.getElementById('letterTyped'), end = document.getElementById('letterEndDeco');
  el.textContent = ''; end.style.display = 'none'; let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      if (text[i] === '\n') el.innerHTML += '<br><br>'; else el.textContent += text[i];
      i++; el.parentElement.scrollTop = el.parentElement.scrollHeight;
    } else { clearInterval(interval); end.style.display = 'block'; emojiBurst(['💖','🌸','✨','🎀'], 10); }
  }, 28);
}

/* ─────────────────────────────────────
   RESTART
───────────────────────────────────── */
function restartAll() {
  cutCount = 0; galIndex = 0; chestOpened = false; kittyTapCount = 0;
  nameAttempts = 0; dialogPassed = false; ivvanuClicked = false; cryTapped = false;
  msgBtnClicks = 0;
  clearInterval(autoSlide); clearInterval(countdownInterval);
  hideAllDialogs();
  document.getElementById('chupinchaModal').classList.add('hidden');
  document.getElementById('chestLock').textContent = '🔒';
  document.getElementById('chestLock').style.transform = '';
  document.getElementById('chestLid').classList.remove('open');
  document.getElementById('tapHint').textContent = '✨ Tap to unlock your surprise ✨';
  document.getElementById('nameInput').value = '';
  document.getElementById('hintBtn').classList.add('hidden');
  document.getElementById('nameError').classList.add('hidden');
  resetDlg2aBtn();
  resetMsgBtn();
  show('unlock');
}

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
initPetals();
initUnlockSparkles();