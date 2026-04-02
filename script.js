/* ═══════════════════════════════════════
   BIRTHDAY SURPRISE — script.js
   Enhanced with smooth typing animations
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
let kittyTapCount  = 0;
let kittyTapTimer  = null;

// Wax seal shuffle state
let sealClickCount = 0;
let sealShuffling  = false;

/* ─────────────────────────────────────
   TYPING ANIMATION ENGINE
───────────────────────────────────── */
function typeText(element, text, options = {}) {
  const {
    charDelay = 50,
    wordDelay = 300,
    spaceDelay = 100,
    fadeInDuration = 400,
    callback = null
  } = options;

  if (!element) {
    if (callback) callback();
    return;
  }

  element.textContent = '';
  element.style.opacity = '0';

  setTimeout(() => {
    element.style.transition = `opacity ${fadeInDuration}ms ease`;
    element.style.opacity = '1';
  }, 100);

  let index = 0;

  function typeNextChar() {
    if (index < text.length) {
      const char = text[index];
      element.textContent += char;
      index++;

      let delay = charDelay;
      if (char === ' ') {
        delay = spaceDelay;
        if (index < text.length && text[index] !== ' ') delay = wordDelay;
      } else if (char === '.' || char === '!' || char === '?') {
        delay = wordDelay * 1.5;
      } else if (char === ',') {
        delay = wordDelay * 0.8;
      }

      setTimeout(typeNextChar, delay);
    } else {
      if (callback) setTimeout(callback, 300);
    }
  }

  setTimeout(typeNextChar, fadeInDuration + 200);
}

function fadeOutElement(element, duration = 600, callback) {
  if (!element) {
    if (callback) callback();
    return;
  }
  element.style.transition = `opacity ${duration}ms ease`;
  element.style.opacity = '0';
  setTimeout(() => { if (callback) callback(); }, duration);
}

function fadeInElement(element, duration = 600) {
  if (!element) return;
  element.style.opacity = '0';
  setTimeout(() => {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '1';
  }, 50);
}

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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);
    gain.gain.setValueAtTime(vol || 0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch(e) {}
}

function playSlash() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.25, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1800;
    src.buffer = buf;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    src.start();
  } catch(e) {}
}

function playPop() {
  playTone(520, 'sine', 0.18, 0.4);
  setTimeout(() => playTone(780, 'sine', 0.18, 0.3), 60);
  setTimeout(() => playTone(1040, 'sine', 0.22, 0.25), 130);
}

function playCandlePop() {
  playTone(900, 'triangle', 0.12, 0.35);
}

function playUnlock() {
  playTone(440, 'sine', 0.1, 0.3);
  setTimeout(() => playTone(660, 'sine', 0.12, 0.3), 100);
  setTimeout(() => playTone(880, 'sine', 0.2, 0.4), 220);
}

function playWrong() {
  playTone(300, 'sawtooth', 0.15, 0.35);
  setTimeout(() => playTone(220, 'sawtooth', 0.2, 0.3), 150);
}

function playWoosh() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.5);
    }
    const src = ctx.createBufferSource();
    const gain = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 800;
    src.buffer = buf;
    src.connect(filt);
    filt.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    src.start();
  } catch(e) {}
}

/* ─────────────────────────────────────
   MUSIC
───────────────────────────────────── */
let bgAudio, musicOn = false;
const musicBtn = document.getElementById('musicBtn');

function toggleMusic() {
  if (!bgAudio) {
    bgAudio = new Audio('photos/Urike Urike.m4a');
    bgAudio.loop = true;
    bgAudio.volume = 0.3;
  }
  if (musicOn) {
    bgAudio.pause();
    musicBtn.textContent = '🎵';
  } else {
    bgAudio.play().catch(() => {});
    musicBtn.textContent = '🔇';
  }
  musicOn = !musicOn;
}

/* ─────────────────────────────────────
   SHOW / HIDE WITH FADE
───────────────────────────────────── */
function show(id, callback) {
  const allScreens = document.querySelectorAll('.screen');
  allScreens.forEach(s => {
    if (!s.classList.contains('hidden')) {
      s.style.transition = 'opacity 600ms ease';
      s.style.opacity = '0';
    }
  });

  setTimeout(() => {
    allScreens.forEach(s => s.classList.add('hidden'));
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      el.style.opacity = '0';
      setTimeout(() => {
        el.style.transition = 'opacity 600ms ease';
        el.style.opacity = '1';
        if (callback) setTimeout(callback, 100);
      }, 50);
    }
  }, 650);
}

/* ─────────────────────────────────────
   FLOATING PETALS - REDUCED ANIMATION
───────────────────────────────────── */
function initPetals() {
  const layer = document.getElementById('petalsLayer');
  const emojis = ['🌸','🌺','🫂','🌷','✨','💖','⭐','🌟'];
  // Reduced from 18 to 10 petals for less movement
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('span');
    p.className = 'petal';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.animationDelay = (Math.random() * 15) + 's';
    // Slower animation - increased from 10-24s to 20-35s
    p.style.animationDuration = (20 + Math.random() * 15) + 's';
    p.style.fontSize = (12 + Math.random() * 10) + 'px';
    // Lower opacity for less distraction
    p.style.opacity = 0.15 + Math.random() * 0.25;
    layer.appendChild(p);
  }
}

/* ─────────────────────────────────────
   EMOJI BURST
───────────────────────────────────── */
function emojiBurst(emojis, count) {
  const wrap = document.getElementById('emojiBurst');
  wrap.innerHTML = '';
  wrap.classList.remove('hidden');
  const list = emojis || ['🎉','💖','✨','🌸','🎊','⭐'];
  for (let i = 0; i < (count || 16); i++) {
    const e = document.createElement('span');
    e.textContent = list[Math.floor(Math.random() * list.length)];
    e.style.left = (10 + Math.random() * 80) + 'vw';
    e.style.top = (20 + Math.random() * 60) + 'vh';
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

  const lock = document.getElementById('chestLock');
  const lid = document.getElementById('chestLid');
  const hint = document.getElementById('tapHint');

  lock.textContent = '🔓';
  lock.style.transform = 'scale(1.4)';
  lid.classList.add('open');

  fadeOutElement(hint, 400, () => {
    hint.textContent = '✨ Opening... ✨';
    fadeInElement(hint, 300);
  });

  emojiBurst(['✨','💖','🌸','⭐','🎀','💫','🌟'], 18);

  setTimeout(() => {
    fadeOutElement(document.getElementById('unlock'), 600, () => {
      show('nameEntry', () => {
        startNameEntry();
      });
    });
  }, 1200);
}

/* ─────────────────────────────────────
   NAME ENTRY - UPDATED WITH HINT LOGIC
───────────────────────────────────── */
function startNameEntry() {
  const titleEl = document.getElementById('nameTitle');
  const subEl = document.getElementById('nameSub');
  const inputEl = document.getElementById('nameInput');
  const btnEl = document.getElementById('nameBtn');

  typeText(titleEl, 'Enter your name', {
    charDelay: 60,
    wordDelay: 250,
    callback: () => {
      typeText(subEl, 'nijam ga nuvvu chudali anukunte first attempt lo access chey😒', {
        charDelay: 45,
        wordDelay: 200,
        callback: () => {
          setTimeout(() => {
            inputEl.classList.remove('hidden');
            fadeInElement(inputEl, 400);
            setTimeout(() => {
              btnEl.classList.remove('hidden');
              fadeInElement(btnEl, 400);
              inputEl.focus();
            }, 300);
          }, 400);
        }
      });
    }
  });
}

function submitName() {
  const input = document.getElementById('nameInput');
  const err = document.getElementById('nameError');
  const hintBtn = document.getElementById('hintBtn');
  const val = input.value.trim().toLowerCase();

  if (!val) {
    err.textContent = 'musukuni sariga enter chey ledha muthi paguludhi 😤';
    err.classList.remove('hidden');
    fadeInElement(err, 300);
    input.classList.add('shake-input');
    setTimeout(() => input.classList.remove('shake-input'), 400);
    return;
  }

  if (val === CORRECT_NAME) {
    err.classList.add('hidden');
    hintBtn.classList.add('hidden');
    playPop();
    emojiBurst(['🎀','💖','✨','🌸','🐾'], 12);

    fadeOutElement(document.getElementById('nameEntry'), 600, () => {
      setTimeout(() => startCountdown(), 200);
    });
    return;
  }

  // Wrong name logic
  nameAttempts++;
  playWrong();
  
  if (nameAttempts >= 2) {
    // Show hint button after 2 attempts
    err.textContent = 'Hint kavali ana ledhu';
    err.classList.remove('hidden');
    fadeInElement(err, 300);
    
    // Show hint button
    setTimeout(() => {
      hintBtn.classList.remove('hidden');
      fadeInElement(hintBtn, 400);
    }, 400);
  } else {
    err.textContent = 'musukuni sariga enter chey ledha muthi paguludhi 😤';
    err.classList.remove('hidden');
    fadeInElement(err, 300);
  }
  
  input.classList.add('shake-input');
  setTimeout(() => input.classList.remove('shake-input'), 400);
  input.value = '';
}

// Hint modal functions
function showHint() {
  const modal = document.getElementById('hintModal');
  const textEl = document.getElementById('hintText');
  const btnEl = document.getElementById('hintCloseBtn');

  // Reset state
  textEl.textContent = '';
  btnEl.classList.add('hidden');

  modal.classList.remove('hidden');
  fadeInElement(modal, 400);
  playPop();

  typeText(textEl, 'hint uhh ledhu thokka ledhu musukuni alochinchukuni enter chey 😤', {
    charDelay: 45,
    wordDelay: 180,
    callback: () => {
      setTimeout(() => {
        btnEl.classList.remove('hidden');
        fadeInElement(btnEl, 400);
      }, 400);
    }
  });
}

function closeHint() {
  const modal = document.getElementById('hintModal');
  fadeOutElement(modal, 400, () => {
    modal.classList.add('hidden');
    // Focus the input so user can type immediately
    const input = document.getElementById('nameInput');
    if (input) input.focus();
  });
}

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitName();
});

/* ─────────────────────────────────────
   COUNTDOWN
───────────────────────────────────── */
let count = 3;
let countdownInterval = null;

function startCountdown() {
  show('countdown', () => {
    const countEl = document.getElementById('countNumber');
    const subEl = document.getElementById('countSub');

    typeText(subEl, 'Get ready...', {
      charDelay: 70,
      wordDelay: 250,
      callback: () => {
        count = 3;
        countEl.textContent = count;

        countdownInterval = setInterval(() => {
          count--;
          if (count > 0) {
            countEl.textContent = count;
            playTone(440 + count * 80, 'triangle', 0.15, 0.25);
          } else {
            clearInterval(countdownInterval);
            playPop();

            fadeOutElement(document.getElementById('countdown'), 600, () => {
              show('loading', () => {
                startLoading();
              });
            });
          }
        }, 1000);
      }
    });
  });
}

/* ─────────────────────────────────────
   LOADING
───────────────────────────────────── */
function startLoading() {
  const loadingTextEl = document.getElementById('loadingText');

  typeText(loadingTextEl, 'Aaagu Vasthadhii sugar ahh😒...', {
    charDelay: 55,
    wordDelay: 220,
    callback: () => {
      setTimeout(() => {
        fadeOutElement(document.getElementById('loading'), 600, () => {
          show('message', () => {
            startMessageScreen();
          });
        });
      }, 2000);
    }
  });
}

/* ─────────────────────────────────────
   MESSAGE SCREEN
───────────────────────────────────── */
function startMessageScreen() {
  const titleEl = document.getElementById('messageTitle');
  const subEl = document.getElementById('messageSub');
  const btnEl = document.getElementById('messageBtn');

  typeText(titleEl, 'kukkapilla putti 1year 1 month 27 days ayyina oka pandhi putti 21 years avvuthundhi eerojuki 😒', {
    charDelay: 45,
    wordDelay: 180,
    callback: () => {
      typeText(subEl, 'Happy 21st birthday pandhi and Happy birthday kukkapilla 🫂🫂🎂💖', {
        charDelay: 50,
        wordDelay: 200,
        callback: () => {
          setTimeout(() => {
            btnEl.classList.remove('hidden');
            fadeInElement(btnEl, 500);
          }, 500);
        }
      });
    }
  });
}

function startBirthday() {
  fadeOutElement(document.getElementById('message'), 600, () => {
    show('candleScreen', () => {
      buildCandles();
      const titleEl = document.getElementById('candleTitle');
      const hintEl = document.getElementById('candleHint');

      typeText(titleEl, 'blow cheyadam kudhradhu kani musukuni dhani medha click chey 🕯️', {
        charDelay: 45,
        wordDelay: 180,
        callback: () => {
          typeText(hintEl, '', {
            charDelay: 50,
            wordDelay: 200
          });
        }
      });
    });
  });
}

/* ─────────────────────────────────────
   EASTER EGG
───────────────────────────────────── */
document.getElementById('easterEggKitty').addEventListener('click', () => {
  kittyTapCount++;
  playTone(600 + kittyTapCount * 60, 'triangle', 0.08, 0.2);

  const k = document.getElementById('easterEggKitty');
  k.style.transform = 'scale(1.2) rotate(10deg)';
  setTimeout(() => { k.style.transform = ''; }, 200);

  clearTimeout(kittyTapTimer);
  kittyTapTimer = setTimeout(() => { kittyTapCount = 0; }, 2000);

  if (kittyTapCount >= 5) {
    kittyTapCount = 0;
    showEasterEgg();
  }
});

function showEasterEgg() {
  const modal = document.getElementById('easterEggModal');
  const textEl = document.getElementById('easterText');
  const btnEl = document.getElementById('easterBtn');

  const msgs = [
    'For the one who make me feel special😘',
    'For the one i got exicted😒',
    'For you❤️'
  ];

  modal.classList.remove('hidden');
  fadeInElement(modal, 400);
  emojiBurst(['🐾','✨','💖','🌟','😸'], 12);
  playPop();

  typeText(textEl, msgs[Math.floor(Math.random() * msgs.length)], {
    charDelay: 45,
    wordDelay: 180,
    callback: () => {
      setTimeout(() => {
        btnEl.classList.remove('hidden');
        fadeInElement(btnEl, 400);
      }, 400);
    }
  });
}

function closeEasterEgg() {
  fadeOutElement(document.getElementById('easterEggModal'), 400, () => {
    document.getElementById('easterEggModal').classList.add('hidden');
  });
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

  for (let i = 0; i < CANDLE_COUNT; i++) {
    const wrap = document.createElement('div');
    wrap.className = 'candle-wrap';
    wrap.innerHTML = `
      <div class="candle-flame" id="flame-${i}">
        <div class="flame-inner"></div>
      </div>
      <div class="candle-body" style="background:${['#a78bfa','#f080b8','#34d399'][i]}"></div>
      <div class="candle-base"></div>
    `;
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
  smoke.className = 'smoke-puff';
  wrap.appendChild(smoke);
  setTimeout(() => smoke.remove(), 800);

  candlesBlown++;

  if (candlesBlown >= CANDLE_COUNT) {
    const hintEl = document.getElementById('candleHint');
    fadeOutElement(hintEl, 400, () => {
      hintEl.textContent = '';
      typeText(hintEl, '🎉 Chal chaleee', {
        charDelay: 50,
        wordDelay: 200
      });
    });

    playPop();
    screenShake();
    emojiBurst(['🎉','✨','💖','🌸','🎊','⭐'], 20);

    setTimeout(() => {
      fadeOutElement(document.getElementById('candleScreen'), 600, () => {
        show('cake', () => {
          resetCake();
          const titleEl = document.getElementById('cakeTitle');
          const hintEl = document.getElementById('slashHint');

          typeText(titleEl, 'elago maaku direct ga cut cheyyinche aadhrustam ledhu kani ikkade cut cheyse 🎂', {
            charDelay: 45,
            wordDelay: 180,
            callback: () => {
              typeText(hintEl, '✦ Ahh knife pattukuni drag chey 😒 cake cut cheyyadam kuda raadhu malli mamalni antaru ✦', {
                charDelay: 40,
                wordDelay: 160
              });
            }
          });
        });
      });
    }, 1200);
  }
}

/* ─────────────────────────────────────
   CAKE SWIPE
───────────────────────────────────── */
const SWIPE_MIN_DISTANCE = 80;

function onSwipeStart(e) {
  if (cutCount >= 2) return;
  e.preventDefault();
  const pos = getEventPos(e);
  swipeOnCake = true;
  swipeMinX = pos.x;
  swipeMaxX = pos.x;
  moveKnifeTo(pos.x, pos.y);
  const knife = document.getElementById('knifeWrap');
  if (knife) knife.classList.add('cutting');
}

function onSwipeMove(e) {
  if (!swipeOnCake || cutCount >= 2) return;
  e.preventDefault();
  const pos = getEventPos(e);
  swipeMinX = Math.min(swipeMinX, pos.x);
  swipeMaxX = Math.max(swipeMaxX, pos.x);
  moveKnifeTo(pos.x, pos.y);
}

function onSwipeEnd(e) {
  if (!swipeOnCake) return;
  swipeOnCake = false;
  const knife = document.getElementById('knifeWrap');
  if (knife) knife.classList.remove('cutting');

  if ((swipeMaxX - swipeMinX) >= SWIPE_MIN_DISTANCE && cutCount < 2) {
    registerCut();
  } else {
    resetKnifePosition();
  }
}

function getEventPos(e) {
  if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches.length > 0) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function resetKnifePosition() {
  const knife = document.getElementById('knifeWrap');
  if (!knife) return;
  knife.style.left = '';
  knife.style.top = '';
  knife.style.transform = '';
  knife.style.position = '';
}

function moveKnifeTo(clientX, clientY) {
  const knife = document.getElementById('knifeWrap');
  const zone = document.getElementById('cakeZone');
  if (!knife || !zone) return;

  const rect = zone.getBoundingClientRect();
  knife.style.position = 'absolute';
  knife.style.left = (clientX - rect.left) + 'px';
  knife.style.top = (clientY - rect.top) + 'px';
  knife.style.transform = 'translate(-50%,-50%) rotate(90deg) scale(1.15)';
}

function registerCut() {
  cutCount++;
  playSlash();

  const hint = document.getElementById('slashHint');
  const knife = document.getElementById('knifeWrap');
  const arrow = document.getElementById('swipeArrow');

  if (arrow) arrow.classList.add('hide');
  if (knife) {
    knife.classList.add('slash-anim');
    setTimeout(() => {
      knife.classList.remove('slash-anim');
      resetKnifePosition();
    }, 450);
  }

  if (cutCount === 1) {
    document.getElementById('dot1').classList.add('done');
    document.getElementById('cutLine1').setAttribute('stroke', 'rgba(220,50,130,0.6)');
    emojiBurst(['❤️','💫','✨'], 8);

    fadeOutElement(hint, 400, () => {
      hint.textContent = '';
      typeText(hint, '✦ Great! One more swipe! ✦', { charDelay: 50, wordDelay: 200 });
    });
  } else {
    document.getElementById('dot2').classList.add('done');

    fadeOutElement(hint, 400, () => {
      hint.textContent = '';
      typeText(hint, 'cake cut cheyyadam kuda raadhu malli mamalni antaru ', { charDelay: 50, wordDelay: 200 });
    });

    const left = document.getElementById('cakeLeft');
    const right = document.getElementById('cakeRight');
    if (left) left.style.animation = 'splitLeft 0.6s ease forwards';
    if (right) right.style.animation = 'splitRight 0.6s ease forwards';

    setTimeout(() => emojiBurst(['🎉','💖','✨','🌸','🎊','⭐','🍰'], 20), 200);
    screenShake();
    playPop();

    setTimeout(() => {
      fadeOutElement(document.getElementById('cake'), 600, () => {
        show('birthday', () => {
          launchConfetti();
          const titleEl = document.getElementById('bdayTitle');
          const btnEl = document.getElementById('bdayBtn');

          typeText(titleEl, 'Happy Birthday, kukkapilla garuuuuu😘😘! 💙', {
            charDelay: 55,
            wordDelay: 220,
            callback: () => {
              setTimeout(() => {
                btnEl.classList.remove('hidden');
                fadeInElement(btnEl, 500);
              }, 600);
            }
          });
        });
      });
    }, 900);
  }
}

function resetCake() {
  cutCount = 0;
  swipeOnCake = false;
  swipeMinX = Infinity;
  swipeMaxX = -Infinity;

  ['dot1','dot2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('done');
  });

  const c1 = document.getElementById('cutLine1');
  if (c1) c1.setAttribute('stroke', 'rgba(220,50,130,0)');

  const ar = document.getElementById('swipeArrow');
  if (ar) ar.classList.remove('hide');

  const cl = document.getElementById('cakeLeft');
  const cr = document.getElementById('cakeRight');
  if (cl) cl.style.animation = '';
  if (cr) cr.style.animation = '';

  resetKnifePosition();
  setupCakeSwipe();
}

function setupCakeSwipe() {
  if (cakeZoneEl) {
    cakeZoneEl.removeEventListener('touchstart', onSwipeStart);
    cakeZoneEl.removeEventListener('touchmove', onSwipeMove);
    cakeZoneEl.removeEventListener('touchend', onSwipeEnd);
    cakeZoneEl.removeEventListener('touchcancel', onSwipeEnd);
    cakeZoneEl.removeEventListener('mousedown', onSwipeStart);
    cakeZoneEl.removeEventListener('mousemove', onSwipeMove);
    cakeZoneEl.removeEventListener('mouseup', onSwipeEnd);
    cakeZoneEl.removeEventListener('mouseleave', onSwipeEnd);
  }

  cakeZoneEl = document.getElementById('cakeZone');
  if (!cakeZoneEl) return;

  cakeZoneEl.addEventListener('touchstart', onSwipeStart, { passive: false });
  cakeZoneEl.addEventListener('touchmove', onSwipeMove, { passive: false });
  cakeZoneEl.addEventListener('touchend', onSwipeEnd, { passive: false });
  cakeZoneEl.addEventListener('touchcancel', onSwipeEnd, { passive: false });
  cakeZoneEl.addEventListener('mousedown', onSwipeStart);
  cakeZoneEl.addEventListener('mousemove', onSwipeMove);
  cakeZoneEl.addEventListener('mouseup', onSwipeEnd);
  cakeZoneEl.addEventListener('mouseleave', onSwipeEnd);
}

/* ─────────────────────────────────────
   CONFETTI
───────────────────────────────────── */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const colors = ['#ff78b8','#ff3080','#f7c0dc','#ffacdf','#ffd0e8','#e040a0','#fff','#ffa0cc','#a78bfa','#fde047'];
  const pieces = Array.from({ length: 180 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 8 + 3,
    d: Math.random() * 2.5 + 1.2,
    color: colors[Math.floor(Math.random() * colors.length)],
    tilt: Math.random() * Math.PI * 2,
    ti: (Math.random() - 0.5) * 0.1
  }));

  let frame = 0;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.tilt += p.ti;
      p.y += p.d;
      if (p.y > canvas.height + 20) { p.y = -10; p.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.ellipse(p.x, p.y, p.r, p.r * 0.45, p.tilt, 0, Math.PI * 2);
      ctx.fill();
    });

    if (++frame < 480) requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  draw();
}

/* ─────────────────────────────────────
   GALLERY
───────────────────────────────────── */
const PHOTOS = [
  { src: 'photos/photo1.jpg', label: 'First photo', msg:'💖First Photo is always special and means a lot🫂' },
  { src: 'photos/photo2.jpg', label: '💖 Sweet Moments', msg: 'You were glowing here. As always. ✨' },
  { src: 'photos/photo3.jpg',  },
  { src: 'photos/photo4.jpg', label: '💕 the dress i have asked for', msg: 'the vibe we match 💕' },
  { src: 'photos/photo5.jpg', label: '🎀 Special Day', msg: 'special memory. 🎀' },
  { src: 'photos/photo6.jpg', label: '🎀 Special Pic', msg: 'This pic made to fall for you every time. 🎀' },
  { src: 'photos/photo7.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },
  { src: 'photos/photo8.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },
  { src: 'photos/photo9.jpg', label: '🎀 My Kukkapilla', msg: 'the day you have agreed. 🎀' },
  { src: 'photos/photo10.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },
  { src: 'photos/photo11.jpg', label: '🎀 the one i wish', msg: 'the way you look at me🥹🥹. 🎀' },
  { src: 'photos/photo14.jpg', label: '🎀 the day i fall', msg: 'first time i got so excited by the way you called me. 🎀' },
  { src: 'photos/photo18.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },
  { src: 'photos/photo19.jpg', label: '🎀 something special', msg: 'the day i felt naughty and loved. 🎀' },
  { src: 'photos/photo20.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },
  { src: 'photos/photo21.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },
  { src: 'photos/photo23.jpg', label: '🎀 Special Day', msg: 'Making memories together. 🎀' },

];

const ROTATIONS = [2, -3, 1.5, -2, 3, -1, 2.5, -3.5, 0.5, -2.5];

function goGallery() {
  fadeOutElement(document.getElementById('birthday'), 600, () => {
    show('gallery', () => {
      buildGallery();
      const titleEl = document.getElementById('galleryTitle');
      const hintEl = document.getElementById('longPressHint');
      const btnEl = document.getElementById('galleryMsgBtn');

      typeText(titleEl, 'The moments that makes me one 🌸', {
        charDelay: 60,
        wordDelay: 250,
        callback: () => {
          typeText(hintEl, 'press cheysi chudu', {
            charDelay: 45,
            wordDelay: 180,
            callback: () => {
              setTimeout(() => {
                btnEl.classList.remove('hidden');
                fadeInElement(btnEl, 500);
                startAutoSlide();
              }, 600);
            }
          });
        }
      });
    });
  });
}

function buildGallery() {
  galIndex = 0;
  const stage = document.getElementById('polaroidStage');
  const counter = document.getElementById('galCounter');
  stage.innerHTML = '';

  PHOTOS.forEach((photo, i) => {
    const card = document.createElement('div');
    card.className = 'polaroid' + (i === 0 ? ' active' : '') + (i === 1 ? ' next' : '');
    card.style.setProperty('--rot', ROTATIONS[i % ROTATIONS.length] + 'deg');
    card.innerHTML = `
      <div class="polaroid-img-wrap">
        <img src="${photo.src}" alt="${photo.label}" class="polaroid-img"
             onerror="this.parentElement.classList.add('img-error');this.style.display='none'">
        <div class="develop-overlay"></div>
      </div>
      <div class="polaroid-label">${photo.label}</div>
    `;

    let pressTimer = null;
    const sp = () => { pressTimer = setTimeout(() => showPhotoMsg(photo.msg || '💖'), 600); };
    const ep = () => clearTimeout(pressTimer);

    card.addEventListener('mousedown', sp);
    card.addEventListener('mouseup', ep);
    card.addEventListener('mouseleave', ep);
    card.addEventListener('touchstart', sp, { passive: true });
    card.addEventListener('touchend', ep, { passive: true });
    card.addEventListener('touchcancel', ep, { passive: true });
    card.addEventListener('click', () => galleryNext());

    stage.appendChild(card);
  });

  counter.textContent = `1 / ${PHOTOS.length}`;
  setupGallerySwipe();
}

function showPhotoMsg(msg) {
  const modal = document.getElementById('photoMsg');
  const textEl = document.getElementById('photoMsgText');
  const btnEl = document.getElementById('photoMsgBtn');

  modal.classList.remove('hidden');
  fadeInElement(modal, 400);
  playPop();
  emojiBurst(['💖','✨','🌸'], 8);

  typeText(textEl, msg, {
    charDelay: 45,
    wordDelay: 180,
    callback: () => {
      setTimeout(() => {
        btnEl.classList.remove('hidden');
        fadeInElement(btnEl, 400);
      }, 400);
    }
  });
}

function closePhotoMsg() {
  fadeOutElement(document.getElementById('photoMsg'), 400, () => {
    document.getElementById('photoMsg').classList.add('hidden');
  });
}

function updateCards() {
  const cards = document.querySelectorAll('.polaroid');
  const total = PHOTOS.length;

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

function galleryNext() {
  if (isAnimating) return;
  isAnimating = true;
  galIndex = (galIndex + 1) % PHOTOS.length;
  updateCards();
  resetAutoSlide();
  setTimeout(() => { isAnimating = false; }, 400);
}

function galleryPrev() {
  if (isAnimating) return;
  isAnimating = true;
  galIndex = (galIndex - 1 + PHOTOS.length) % PHOTOS.length;
  updateCards();
  resetAutoSlide();
  setTimeout(() => { isAnimating = false; }, 400);
}

function startAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(galleryNext, 3200);
}

function resetAutoSlide() {
  clearInterval(autoSlide);
  autoSlide = setInterval(galleryNext, 3200);
}

function setupGallerySwipe() {
  if (galStageEl) {
    galStageEl.removeEventListener('touchstart', onGalTouchStart);
    galStageEl.removeEventListener('touchend', onGalTouchEnd);
  }

  galStageEl = document.getElementById('polaroidStage');
  if (!galStageEl) return;

  galStageEl.addEventListener('touchstart', onGalTouchStart, { passive: true });
  galStageEl.addEventListener('touchend', onGalTouchEnd, { passive: true });
}

function onGalTouchStart(e) {
  galTouchStartX = e.touches[0].clientX;
}

function onGalTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - galTouchStartX;
  if (Math.abs(dx) > 40) {
    dx < 0 ? galleryNext() : galleryPrev();
  }
}

/* ─────────────────────────────────────
   LETTER / WAX SEAL
───────────────────────────────────── */
function openMessage() {
  clearInterval(autoSlide);

  fadeOutElement(document.getElementById('gallery'), 600, () => {
    show('letter', () => {
      sealClickCount = 0;
      sealShuffling = false;
      document.getElementById('waxSealWrap').classList.remove('hidden');
      const seal = document.getElementById('waxSeal');
      seal.classList.remove('broken');
      seal.style.transform = '';
      seal.style.transition = '';
      document.getElementById('letterContent').classList.add('hidden');
      document.getElementById('letterTyped').textContent = '';
      document.getElementById('letterEndDeco').style.display = 'none';

      const sealText = seal.querySelector('.seal-text');
      if (sealText) sealText.textContent = 'Long press to open';
    });
  });
}

function doBreakSeal() {
  const seal = document.getElementById('waxSeal');
  if (!seal || seal.classList.contains('broken')) return;

  seal.style.transition = 'transform 0.3s ease, opacity 0.5s ease';
  seal.style.transform = 'translate(0,0) rotate(0deg) scale(1)';

  setTimeout(() => {
    seal.classList.add('broken');
    playPop();
    emojiBurst(['💌','💖','✨','🎀'], 12);

    setTimeout(() => {
      document.getElementById('waxSealWrap').classList.add('hidden');
      document.getElementById('letterContent').classList.remove('hidden');

      const titleEl = document.getElementById('letterTitleText');
      typeText(titleEl, 'A Special Message 💌', {
        charDelay: 60,
        wordDelay: 250,
        callback: () => {
          startLetterTypewriter();
        }
      });
    }, 700);
  }, 320);
}

function startLetterTypewriter() {
  const el = document.getElementById('letterTyped');
  const end = document.getElementById('letterEndDeco');
  const btnEl = document.getElementById('restartBtn');

  const text = 'Firstly many more happy returns of the day kukkapilla🫂❤️‍🩹😘. You are the one who made me special. Eppudu okalage vunde nannu koncham ayyina alochainchela cheysav. Neetho vunnappudu vunde feeling inka evarithonuu raledhu. Neetho gadipina moments and memories are still in my heart. Emo mundhu parichayam ayyithe inka enjoy cheysevalamoo ledha normal ga vundevalmooo thelidhu but at our peak manam kalisina kotha lo I felt very happy and loved the way you treated me.\n\nNuvvu naatho gadipina moments and mainly nee birthday roju nuvve call cheysi manchiga ready avvu manchi shirt veysukoo ani cheppi pilavadam — those moments I felt myself special 🫂🫂. Emo nee life lo naa character a role play cheysindhoo thelidhu but naa life lo pandhi pilla and kukkapilla chala pedha role play cheysay… entha pedha role ante emo maybe dhaniki minchi vere role vundadhu emo antha special ga.\n\nNinnu chala sarlu hurt cheysa but nuvvu prathisari thirigi edhokati cheysav… emo nenu em cheyyagalano thelidhu but thanks for that ✨. Anukuntu anukuntu ne last ki vachesam… neeku nenu first vunnantha special kakapovachu, everyone\'s priorities change, it\'s ok but parledhu.\n\nSame ninnu first lo chusinantha ledhu kani but ninnu chusina prathisari, neetho matladuthunna prathisari adhi peruguthune vundhi… reason thelidhu but em chestham. Every time anipisthadhi ila pakkane vunte bagundedhi ani… but it\'s your life, nee life lo neeku favs vundochu, so it\'s life and fate.\n\nBut I wish if time reversed… malli neetho Celesta 2k25 dhagara nunchi ela vunnamoo ala vundali ani vundhiii........\n\nAnyway, I will be always your __________ nuvve fill cheysesukooo… and I will be for you at every moment and anything. Emo inkem cheppaloo thelidhu but once again many more happy returns of the day to one and only one of me 🫂😘😘😘';

  el.textContent = '';
  end.style.display = 'none';

  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      if (text[i] === '\n') {
        el.innerHTML += '<br><br>';
      } else {
        el.textContent += text[i];
      }
      i++;
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    } else {
      clearInterval(interval);
      end.style.display = 'block';
      fadeInElement(end, 500);
      emojiBurst(['💖','🌸','✨','🎀'], 10);

      setTimeout(() => {
        btnEl.classList.remove('hidden');
        fadeInElement(btnEl, 500);
      }, 600);
    }
  }, 35);
}

/* ─────────────────────────────────────
   RESTART
───────────────────────────────────── */
function restartAll() {
  cutCount = 0;
  galIndex = 0;
  chestOpened = false;
  kittyTapCount = 0;
  nameAttempts = 0;
  sealClickCount = 0;
  sealShuffling = false;

  clearInterval(autoSlide);
  clearInterval(countdownInterval);

  document.getElementById('hintBtn').classList.add('hidden');
  document.getElementById('tapHint').textContent = '💖 Tap to open your love letter 💖';
  document.getElementById('nameInput').value = '';
  document.getElementById('nameError').classList.add('hidden');

  fadeOutElement(document.getElementById('letter'), 600, () => {
    show('unlock');
  });
}

function openLetter() {
  const env = document.getElementById('envelope');

  env.classList.add('open');

  playUnlock();
  floatingHearts();

  setTimeout(() => playPop(), 400);

  setTimeout(() => {
    show('nameEntry', startNameEntry);
  }, 1200);
}

function floatingHearts() {
  const container = document.getElementById('unlock');

  for (let i = 0; i < 12; i++) {
    const heart = document.createElement('span');
    heart.className = 'floating-heart';
    heart.textContent = '💖';

    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.top = '60vh';

    container.appendChild(heart);

    setTimeout(() => heart.remove(), 2500);
  }
}

/* ─────────────────────────────────────
   INIT
───────────────────────────────────── */
initPetals();

/* 💡 TAP OUTSIDE HINT MODAL TO CLOSE */
document.getElementById('hintModal').addEventListener('click', function(e) {
  if (e.target === this) closeHint();
});
document.querySelector('.hint-inner') && document.querySelector('.hint-inner').addEventListener('click', function(e) {
  e.stopPropagation();
});

/* 💖 LONG PRESS FOR SEAL */
const seal = document.getElementById('waxSeal');

if (seal) {
  let sealPressTimer = null;
  const LONG_PRESS_TIME = 600;

  const startPress = () => {
    sealPressTimer = setTimeout(() => {
      doBreakSeal();
    }, LONG_PRESS_TIME);
  };

  const cancelPress = () => {
    clearTimeout(sealPressTimer);
    sealPressTimer = null;
  };

  seal.addEventListener('mousedown', startPress);
  seal.addEventListener('mouseup', cancelPress);
  seal.addEventListener('mouseleave', cancelPress);
  seal.addEventListener('touchstart', startPress, { passive: true });
  seal.addEventListener('touchend', cancelPress);
  seal.addEventListener('touchcancel', cancelPress);
}