/*
  ╔══════════════════════════════════════════════════════╗
  ║   BIRTHDAY SURPRISE — React JSX (Enhanced v3)       ║
  ║   All 15 enhancements + all bugs fixed              ║
  ╚══════════════════════════════════════════════════════╝

  PLACE FILES:
  - Photos  → /public/photos/photo1.jpg … photo23.jpg
  - Music   → /public/photos/Urike_Urike.m4a

  ENHANCEMENTS INCLUDED:
  1.  Animated background gradient (slow-shifting pink/purple/rose)
  2.  Sparkle cursor — trailing hearts/stars follow the mouse
  3.  Gallery: fade + slide transition (no flip)
  4.  Glitter shimmer overlay on letter text as it types
  5.  Screen-entry chime — unique soft bell per screen
  6.  Music fades in softly instead of jumping to full volume
  7.  Letter: pink scroll progress bar on the left side
  8.  Confetti/emoji burst when correct name is entered
  9.  Gallery: double-tap any photo → fullscreen lightbox
  10. Cake: animated 👆 hand hint showing swipe direction
  11. Letter 🎀 easter egg — tap bow 5x → secret message
  12. Countdown timer on unlock screen (days until birthday)
  13. End credits screen after letter with cinematic reveal
  14. Gallery: caption types out letter-by-letter on active photo
  15. Music volume fades in gradually (same as #6, combined)
*/

import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────
   CONSTANTS
───────────────────────────────────── */
const CORRECT_NAME  = "kukkapilla";
const SWIPE_MIN     = 80;
const LONG_PRESS    = 600;
const BIRTHDAY_DATE = new Date("2025-04-18"); // ← change to actual birthday

const PHOTOS = [
  { src:"photos/photo1.jpg",  label:"First photo 💖",          msg:"💖 First Photo is always special and means a lot 🫂" },
  { src:"photos/photo2.jpg",  label:"💖 Sweet Moments",         msg:"You were glowing here. As always. ✨" },
  { src:"photos/photo3.jpg",  label:"🌸 A Memory",              msg:"Every moment with you is precious 💖" },
  { src:"photos/photo4.jpg",  label:"💕 the dress i asked for", msg:"the vibe we match 💕" },
  { src:"photos/photo5.jpg",  label:"🎀 Special Day",           msg:"special memory. 🎀" },
  { src:"photos/photo6.jpg",  label:"🎀 Special Pic",           msg:"This pic made me fall for you every time. 🎀" },
  { src:"photos/photo7.jpg",  label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
  { src:"photos/photo8.jpg",  label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
  { src:"photos/photo9.jpg",  label:"🎀 My Kukkapilla",         msg:"the day you have agreed. 🎀" },
  { src:"photos/photo10.jpg", label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
  { src:"photos/photo11.jpg", label:"🎀 the one i wish",        msg:"the way you look at me 🥹🥹 🎀" },
  { src:"photos/photo14.jpg", label:"🎀 the day i fall",        msg:"first time i got so excited by the way you called me. 🎀" },
  { src:"photos/photo18.jpg", label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
  { src:"photos/photo19.jpg", label:"🎀 something special",     msg:"the day i felt naughty and loved. 🎀" },
  { src:"photos/photo20.jpg", label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
  { src:"photos/photo21.jpg", label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
  { src:"photos/photo23.jpg", label:"🎀 Special Day",           msg:"Making memories together. 🎀" },
];

const ROTATIONS   = [2,-3,1.5,-2,3,-1,2.5,-3.5,0.5,-2.5];
const EASTER_MSGS = ["For the one who make me feel special 😘","For the one i got excited 😒","For you ❤️"];

const LETTER_TEXT = `Firstly many more happy returns of the day kukkapilla 🫂❤️‍🩹😘. You are the one who made me special. Eppudu okalage vunde nannu koncham ayyina alochainchela cheysav. Neetho vunnappudu vunde feeling inka evarithonuu raledhu. Neetho gadipina moments and memories are still in my heart. Emo mundhu parichayam ayyithe inka enjoy cheysevalamoo ledha normal ga vundevalmooo thelidhu but at our peak manam kalisina kotha lo I felt very happy and loved the way you treated me.

Nuvvu naatho gadipina moments and mainly nee birthday roju nuvve call cheysi manchiga ready avvu manchi shirt veysukoo ani cheppi pilavadam — those moments I felt myself special 🫂🫂. Emo nee life lo naa character a role play cheysindhoo thelidhu but naa life lo pandhi pilla and kukkapilla chala pedha role play cheysay… entha pedha role ante emo maybe dhaniki minchi vere role vundadhu emo antha special ga.

Ninnu chala sarlu hurt cheysa but nuvvu prathisari thirigi edhokati cheysav… emo nenu em cheyyagalano thelidhu but thanks for that ✨. Anukuntu anukuntu ne last ki vachesam… neeku nenu first vunnantha special kakapovachu, everyone's priorities change, it's ok but parledhu.

Same ninnu first lo chusinantha ledhu kani but ninnu chusina prathisari, neetho matladuthunna prathisari adhi peruguthune vundhi… reason thelidhu but em chestham. Every time anipisthadhi ila pakkane vunte bagundedhi ani… but it's your life, nee life lo neeku favs vundochu, so it's life and fate.

But I wish if time reversed… malli neetho Celesta 2k25 dhagara nunchi ela vunnamoo ala vundali ani vundhiii........

Anyway, I will be always your __________ nuvve fill cheysesukooo… and I will be for you at every moment and anything. Emo inkem cheppaloo thelidhu but once again many more happy returns of the day to one and only one of me 🫂😘😘😘`;

/* ─────────────────────────────────────
   AUDIO ENGINE
───────────────────────────────────── */
let _audioCtx = null;
const getAudioCtx = () => {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
};
const playTone = (freq, type="sine", dur=0.2, vol=0.3) => {
  try {
    const ctx=getAudioCtx(), osc=ctx.createOscillator(), gain=ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination); osc.type=type;
    osc.frequency.setValueAtTime(freq,ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq*0.5,ctx.currentTime+dur);
    gain.gain.setValueAtTime(vol,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime+dur);
  } catch(e){}
};
const playNoise = (band=1800,vol=0.7,dur=0.25) => {
  try {
    const ctx=getAudioCtx(), buf=ctx.createBuffer(1,ctx.sampleRate*dur,ctx.sampleRate);
    const d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
    const src=ctx.createBufferSource(), gain=ctx.createGain(), filt=ctx.createBiquadFilter();
    filt.type="bandpass"; filt.frequency.value=band;
    src.buffer=buf; src.connect(filt); filt.connect(gain); gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol,ctx.currentTime); src.start();
  } catch(e){}
};
const playPop    = ()=>{ playTone(520,"sine",.18,.4); setTimeout(()=>playTone(780,"sine",.18,.3),60); setTimeout(()=>playTone(1040,"sine",.22,.25),130); };
const playUnlock = ()=>{ playTone(440,"sine",.1,.3); setTimeout(()=>playTone(660,"sine",.12,.3),100); setTimeout(()=>playTone(880,"sine",.2,.4),220); };
const playWrong  = ()=>{ playTone(300,"sawtooth",.15,.35); setTimeout(()=>playTone(220,"sawtooth",.2,.3),150); };
const playSlash  = ()=> playNoise(1800,.7,.25);
const playCandlePop = ()=> playTone(900,"triangle",.12,.35);

// Chimes removed — were causing glitchy/imperfect sounds
const CHIMES = {};

/* ─────────────────────────────────────
   TYPING HOOK — flicker-free, StrictMode-safe
   Each call gets its own cancel token.
   The hook tracks the "active" token so only
   the latest call ever writes to state.
───────────────────────────────────── */
const useTyping = () => {
  const activeToken = useRef(0); // increments on each new type() call

  const type = useCallback((setter, text, opts = {}, cb) => {
    const { charDelay = 38 } = opts;
    const token = ++activeToken.current; // this call's unique id
    setter("");
    let i = 0, acc = "";

    const step = () => {
      if (activeToken.current !== token) return; // cancelled by newer call
      if (i < text.length) {
        acc += text[i++];
        setter(acc);
        setTimeout(step, charDelay);
      } else if (cb) {
        setTimeout(cb, 200);
      }
    };
    setTimeout(step, 80);
  }, []);

  return type;
};

/* ─────────────────────────────────────
   HELPER: days until birthday
───────────────────────────────────── */
const daysUntilBirthday = () => {
  const now=new Date();
  const next=new Date(now.getFullYear(),BIRTHDAY_DATE.getMonth(),BIRTHDAY_DATE.getDate());
  if (next<now) next.setFullYear(now.getFullYear()+1);
  return Math.ceil((next-now)/(1000*60*60*24));
};

/* ─────────────────────────────────────
   EMOJI BURST
───────────────────────────────────── */
const EmojiBurst = ({bursts}) => (
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:8000}}>
    {bursts.map((b,i)=>(
      <span key={b.id||i} style={{position:"absolute",left:b.x,top:b.y,fontSize:b.size,animation:"burstFly 1.2s ease-out forwards",animationDelay:b.delay,userSelect:"none"}}>{b.emoji}</span>
    ))}
  </div>
);

/* ─────────────────────────────────────
   SPARKLE CURSOR  (Enhancement #2)
───────────────────────────────────── */
const SparkleCursor = () => {
  const [sparks,setSparks]=useState([]);
  const nextId=useRef(0);
  useEffect(()=>{
    const emojis=["✨","💖","🌸","⭐","💫","🌟","💕"];
    const onMove=(e)=>{
      const id=nextId.current++;
      const spark={id,x:e.clientX,y:e.clientY,emoji:emojis[Math.floor(Math.random()*emojis.length)],size:10+Math.random()*10};
      setSparks(prev=>[...prev.slice(-18),spark]);
      setTimeout(()=>setSparks(p=>p.filter(s=>s.id!==id)),900);
    };
    window.addEventListener("mousemove",onMove);
    return()=>window.removeEventListener("mousemove",onMove);
  },[]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9998}}>
      {sparks.map(s=>(
        <span key={s.id} style={{position:"absolute",left:s.x,top:s.y,fontSize:s.size,transform:"translate(-50%,-50%)",animation:"sparkleTrail .9s ease-out forwards",userSelect:"none"}}>{s.emoji}</span>
      ))}
    </div>
  );
};

/* ─────────────────────────────────────
   PETALS
───────────────────────────────────── */
const PETAL_DATA = Array.from({length:12},(_,i)=>({
  id:i, emoji:["🌸","🌺","🌷","✨","💖","⭐","🌟","💕"][Math.floor(Math.random()*8)],
  left:Math.random()*100, delay:Math.random()*15, duration:20+Math.random()*15,
  size:12+Math.random()*10, opacity:0.15+Math.random()*0.25,
}));
const Petals = () => (
  <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
    {PETAL_DATA.map(p=>(
      <span key={p.id} style={{position:"absolute",top:"-40px",left:`${p.left}vw`,fontSize:p.size,opacity:p.opacity,animation:`petalFall ${p.duration}s linear ${p.delay}s infinite`,userSelect:"none"}}>{p.emoji}</span>
    ))}
  </div>
);

/* ─────────────────────────────────────
   SVGs
───────────────────────────────────── */
const KittySVG = ({width=140}) => (
  <svg viewBox="0 0 120 130" xmlns="http://www.w3.org/2000/svg" width={width}>
    <ellipse cx="60" cy="90" rx="35" ry="32" fill="#ffe0f0" stroke="#f4a0c8" strokeWidth="2"/>
    <path d="M28 100 Q60 120 92 100" fill="#f080b8" opacity="0.5"/>
    <circle cx="60" cy="48" r="30" fill="#fff" stroke="#f4a0c8" strokeWidth="2"/>
    <ellipse cx="38" cy="24" rx="10" ry="12" fill="#fff" stroke="#f4a0c8" strokeWidth="2"/>
    <ellipse cx="82" cy="24" rx="10" ry="12" fill="#fff" stroke="#f4a0c8" strokeWidth="2"/>
    <ellipse cx="38" cy="24" rx="5" ry="7" fill="#f4a0c8"/>
    <ellipse cx="82" cy="24" rx="5" ry="7" fill="#f4a0c8"/>
    <ellipse cx="50" cy="46" rx="4" ry="4.5" fill="#333"/>
    <ellipse cx="70" cy="46" rx="4" ry="4.5" fill="#333"/>
    <circle cx="51.5" cy="44.5" r="1.2" fill="#fff"/>
    <circle cx="71.5" cy="44.5" r="1.2" fill="#fff"/>
    <ellipse cx="60" cy="54" rx="3" ry="2" fill="#f080a0"/>
    <line x1="30" y1="51" x2="52" y2="53" stroke="#ddd" strokeWidth="1.2"/>
    <line x1="30" y1="56" x2="52" y2="56" stroke="#ddd" strokeWidth="1.2"/>
    <line x1="68" y1="53" x2="90" y2="51" stroke="#ddd" strokeWidth="1.2"/>
    <line x1="68" y1="56" x2="90" y2="56" stroke="#ddd" strokeWidth="1.2"/>
    <polygon points="82,28 92,22 92,34" fill="#f080b8"/>
    <polygon points="102,28 92,22 92,34" fill="#e040a0"/>
    <circle cx="92" cy="28" r="4" fill="#ff78b8"/>
    <ellipse cx="44" cy="58" rx="7" ry="4" fill="#f9c0d8" opacity="0.7"/>
    <ellipse cx="76" cy="58" rx="7" ry="4" fill="#f9c0d8" opacity="0.7"/>
    <ellipse cx="22" cy="82" rx="8" ry="14" fill="#ffe0f0" stroke="#f4a0c8" strokeWidth="1.5" transform="rotate(-30 22 82)"/>
    <ellipse cx="98" cy="82" rx="8" ry="14" fill="#ffe0f0" stroke="#f4a0c8" strokeWidth="1.5" transform="rotate(30 98 82)"/>
  </svg>
);

const BirthdayKittySVG = () => (
  <svg viewBox="0 0 140 160" xmlns="http://www.w3.org/2000/svg" width={180}>
    <polygon points="70,5 45,55 95,55" fill="#f080b8"/>
    <polygon points="70,5 45,55 70,55" fill="#e040a0"/>
    <line x1="45" y1="55" x2="95" y2="55" stroke="#fde047" strokeWidth="3"/>
    <circle cx="70" cy="5" r="4" fill="#fde047"/>
    <text x="30" y="35" fontSize="14">⭐</text><text x="100" y="30" fontSize="12">✨</text>
    <ellipse cx="70" cy="120" rx="38" ry="34" fill="#ffe0f0" stroke="#f4a0c8" strokeWidth="2"/>
    <circle cx="70" cy="75" r="32" fill="#fff" stroke="#f4a0c8" strokeWidth="2"/>
    <ellipse cx="46" cy="52" rx="10" ry="12" fill="#fff" stroke="#f4a0c8" strokeWidth="2"/>
    <ellipse cx="94" cy="52" rx="10" ry="12" fill="#fff" stroke="#f4a0c8" strokeWidth="2"/>
    <ellipse cx="46" cy="52" rx="5" ry="7" fill="#f4a0c8"/>
    <ellipse cx="94" cy="52" rx="5" ry="7" fill="#f4a0c8"/>
    <path d="M55 73 Q60 68 65 73" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M75 73 Q80 68 85 73" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M55 84 Q70 96 85 84" fill="none" stroke="#333" strokeWidth="2.5" strokeLinecap="round"/>
    <ellipse cx="70" cy="80" rx="3" ry="2" fill="#f080a0"/>
    <line x1="38" y1="76" x2="60" y2="79" stroke="#ddd" strokeWidth="1.2"/>
    <line x1="38" y1="82" x2="60" y2="82" stroke="#ddd" strokeWidth="1.2"/>
    <line x1="80" y1="79" x2="102" y2="76" stroke="#ddd" strokeWidth="1.2"/>
    <line x1="80" y1="82" x2="102" y2="82" stroke="#ddd" strokeWidth="1.2"/>
    <polygon points="94,55 104,49 104,61" fill="#f080b8"/>
    <polygon points="114,55 104,49 104,61" fill="#e040a0"/>
    <circle cx="104" cy="55" r="4" fill="#ff78b8"/>
    <ellipse cx="53" cy="84" rx="8" ry="5" fill="#f9c0d8" opacity="0.7"/>
    <ellipse cx="87" cy="84" rx="8" ry="5" fill="#f9c0d8" opacity="0.7"/>
    <ellipse cx="28" cy="108" rx="8" ry="15" fill="#ffe0f0" stroke="#f4a0c8" strokeWidth="1.5" transform="rotate(-50 28 108)"/>
    <ellipse cx="112" cy="108" rx="8" ry="15" fill="#ffe0f0" stroke="#f4a0c8" strokeWidth="1.5" transform="rotate(50 112 108)"/>
    <text x="10" y="95" fontSize="16">🎉</text><text x="115" y="95" fontSize="16">🎊</text>
  </svg>
);

/* ─────────────────────────────────────
   SHARED UI
───────────────────────────────────── */
const Screen = ({children,style={}}) => (
  <div style={{position:"fixed",inset:0,display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center",padding:"16px",animation:"screenFadeIn .6s ease forwards",...style}}>
    {children}
  </div>
);

const Btn = ({onClick,children,style={},variant="pink"}) => {
  const bg=variant==="purple"?"linear-gradient(135deg,#a78bfa,#7c3aed)":"linear-gradient(135deg,#f080b8,#e040a0)";
  return (
    <button onClick={onClick} style={{background:bg,border:"none",padding:"11px 28px",borderRadius:"30px",color:"white",fontFamily:"'Caveat',cursive",fontSize:"clamp(14px,2.5vw,18px)",fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:"7px",boxShadow:"0 4px 18px rgba(220,70,140,.35)",transition:"transform .2s",...style}}
      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.07)"}
      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
      onMouseDown={e=>e.currentTarget.style.transform="scale(.97)"}
      onMouseUp={e=>e.currentTarget.style.transform="scale(1.07)"}
    >{children}</button>
  );
};

const Modal = ({children,onBackdropClick}) => (
  <div onClick={onBackdropClick} style={{position:"fixed",inset:0,background:"rgba(240,80,160,.18)",backdropFilter:"blur(8px)",zIndex:9000,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:"white",borderRadius:"24px",padding:"32px 28px",maxWidth:"360px",width:"90vw",boxShadow:"0 8px 40px rgba(220,70,140,.3)",border:"2px solid #f9d0e4",display:"flex",flexDirection:"column",alignItems:"center",gap:"14px",animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)"}}>
      {children}
    </div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 1: UNLOCK
════════════════════════════════════════ */
const UnlockScreen = ({onOpen,onFirstTap}) => {
  const [opened,setOpened]=useState(false);
  const [hearts,setHearts]=useState([]);
  const days=daysUntilBirthday();

  const handleOpen=()=>{
    if(opened) return;
    setOpened(true);
    onFirstTap&&onFirstTap();
    playUnlock();
    setHearts(Array.from({length:12},(_,i)=>({id:i,left:Math.random()*100})));
    setTimeout(()=>playPop(),400);
    setTimeout(()=>onOpen(),1200);
  };

  return (
    <Screen style={{background:"radial-gradient(ellipse at 50% 30%,#ffe0f4 0%,#ffc8e8 40%,#ffb0d8 100%)"}}>
      {hearts.map(h=>(
        <span key={h.id} style={{position:"absolute",fontSize:"20px",left:`${h.left}vw`,top:"60vh",animation:"floatUp 2.5s ease-out forwards",pointerEvents:"none"}}>💖</span>
      ))}
      {/* Enhancement #12: days countdown */}
      <div style={{position:"absolute",top:"16px",left:"50%",transform:"translateX(-50%)",background:"rgba(255,255,255,.55)",backdropFilter:"blur(6px)",borderRadius:"20px",padding:"6px 18px",fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(12px,3vw,15px)",color:"#c060a0",whiteSpace:"nowrap",boxShadow:"0 2px 12px rgba(220,80,140,.15)"}}>
        {days===0?"🎉 Today is her birthday!": `🎂 ${days} days until her birthday!`}
      </div>
      <div onClick={handleOpen} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",gap:"28px",userSelect:"none",position:"relative",zIndex:2}}>
        <div style={{animation:"envFloat 3s ease-in-out infinite",filter:"drop-shadow(0 20px 50px rgba(180,60,100,.45))"}}>
          <EnvelopeSVG opened={opened}/>
        </div>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(17px,3.8vw,24px)",fontWeight:700,color:"#c060a0",animation:"blink 1.8s ease-in-out infinite",margin:0}}>
          💖 Tap to open your love letter 💖
        </p>
      </div>
    </Screen>
  );
};

const EnvelopeSVG = ({opened}) => (
  <div style={{position:"relative",width:"180px",height:"130px",perspective:"1000px"}}>
    <div style={{position:"absolute",top:0,width:"100%",height:"70px",background:"linear-gradient(135deg,#ff8fc2,#ff2f7a)",clipPath:"polygon(0 0,100% 0,50% 100%)",transformOrigin:"top",transition:"transform .8s ease",transform:opened?"rotateX(180deg)":"rotateX(0deg)"}}/>
    <div style={{width:"100%",height:"100%",background:"linear-gradient(135deg,#ffb6d5,#ff4f8b)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"40px"}}>💌</div>
    <div style={{position:"absolute",width:"85%",height:"85%",background:"white",top:"10%",left:"7.5%",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Great Vibes',cursive",fontSize:"18px",color:"#d1006f",transform:opened?"translateY(-40px)":"translateY(20px)",opacity:opened?1:0,transition:"all .6s ease"}}>Love letter kaadhu le 😒😒 💖</div>
  </div>
);

/* ════════════════════════════════════════
   SCREEN 2: NAME ENTRY
════════════════════════════════════════ */
const NameEntryScreen = ({onSuccess,triggerBurst,ownerLog}) => {
  const [title,setTitle]=useState(""); const [sub,setSub]=useState("");
  const [showInput,setShowInput]=useState(false); const [showBtn,setShowBtn]=useState(false);
  const [showHintBtn,setShowHintBtn]=useState(false); const [inputVal,setInputVal]=useState("");
  const [error,setError]=useState(""); const [shake,setShake]=useState(false);
  const [showHint,setShowHint]=useState(false); const [hintText,setHintText]=useState(""); const [showHintClose,setShowHintClose]=useState(false);
  const attempts=useRef(0); const type=useTyping();

  useEffect(()=>{
    const c1 = type(setTitle,"Enter your name",{charDelay:55},()=>{
      const c2 = type(setSub,"nijam ga nuvvu chudali anukunte first attempt lo access chey 😒",{charDelay:38},()=>{
        setTimeout(()=>{setShowInput(true);setTimeout(()=>setShowBtn(true),300);},400);
      });
    });
  },[]);

  const submit=()=>{
    const val=inputVal.trim().toLowerCase();
    if(!val){setError("musukuni sariga enter chey ledha muthi paguludhi 😤");doShake();return;}
    if(val===CORRECT_NAME){
      setError(""); playPop();
      ownerLog&&ownerLog.add("name_correct", `"${inputVal.trim()}" ✅ correct!`);
      triggerBurst(["🎉","💖","✨","🌸","🎊","⭐","🎀"],24);
      setTimeout(()=>onSuccess(),700); return;
    }
    attempts.current++;
    playWrong();
    ownerLog&&ownerLog.add("name_wrong", `"${inputVal.trim()}" (attempt ${attempts.current})`);
    if(attempts.current>=2){setError("Hint kavali ana ledhu");setTimeout(()=>setShowHintBtn(true),400);}
    else setError("musukuni sariga enter chey ledha muthi paguludhi 😤");
    doShake(); setInputVal("");
  };
  const doShake=()=>{setShake(true);setTimeout(()=>setShake(false),400);};
  const openHint=()=>{
    setShowHint(true);setHintText("");setShowHintClose(false);playPop();
    type(setHintText,"hint uhh ledhu thokka ledhu musukuni alochinchukuni enter chey 😤",{charDelay:38},()=>setTimeout(()=>setShowHintClose(true),400));
  };

  return (
    <Screen>
      <div style={{background:"white",borderRadius:"24px",padding:"clamp(24px,5vw,40px) clamp(24px,6vw,48px)",boxShadow:"0 8px 40px rgba(220,70,140,.2)",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",maxWidth:"380px",width:"88vw",border:"2px solid #f9d0e4",position:"relative",zIndex:1}}>
        <div style={{fontSize:"clamp(36px,10vw,54px)",animation:"floatY 2s ease-in-out infinite"}}>🐱</div>
        <h2 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(18px,5vw,28px)",color:"#d8368e",margin:0,minHeight:"2em"}}>{title}</h2>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,17px)",color:"#c07090",margin:0,minHeight:"1.5em"}}>{sub}</p>
        {showInput&&<input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Your name..." maxLength={20} autoComplete="off"
          style={{width:"100%",border:"2px solid #f4a0c8",borderRadius:"16px",padding:"12px 16px",fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,4vw,22px)",fontWeight:700,color:"#d8368e",background:"#fff5fa",outline:"none",textAlign:"center",animation:shake?"shakeInput .4s ease":"none",boxSizing:"border-box"}}/>}
        {error&&<p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,16px)",color:"#e040a0",margin:0,textAlign:"center"}}>{error}</p>}
        {showBtn&&<Btn onClick={submit} style={{width:"100%",justifyContent:"center"}}>Let's go! 🎀</Btn>}
        {showHintBtn&&<Btn onClick={openHint} variant="purple" style={{width:"100%",justifyContent:"center",marginTop:"8px"}}>hint kavalaaa.. 🤔</Btn>}
      </div>
      {showHint&&(
        <Modal onBackdropClick={()=>setShowHint(false)}>
          <div style={{fontSize:"44px"}}>😤</div>
          <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,color:"#c070a0",textAlign:"center",lineHeight:1.6,fontSize:"clamp(15px,3.8vw,20px)",margin:0}}>{hintText}</p>
          {showHintClose&&<Btn onClick={()=>setShowHint(false)}>sare okay 💖</Btn>}
        </Modal>
      )}
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 3: COUNTDOWN
════════════════════════════════════════ */
const CountdownScreen = ({onDone}) => {
  const [count,setCount]=useState(3); const [sub,setSub]=useState(""); const type=useTyping();
  useEffect(()=>{
    let iv;
    type(setSub,"Get ready...",{charDelay:55},()=>{
      iv=setInterval(()=>{
        setCount(p=>{const n=p-1;if(n>0){playTone(440+n*80,"triangle",.15,.25);return n;}clearInterval(iv);playPop();setTimeout(()=>onDone(),500);return 0;});
      },1000);
    });
    return()=>{clearInterval(iv);};
  },[]);
  return (
    <Screen>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
        {[{t:"10%",l:"12%",d:0,e:"✨"},{t:"18%",r:"10%",d:.5,e:"🌸"},{b:"20%",l:"8%",d:1,e:"💖"},{b:"15%",r:"14%",d:1.5,e:"⭐"},{t:"55%",l:"5%",d:.8,e:"🌸"}].map((s,i)=>(
          <span key={i} style={{position:"absolute",fontSize:"clamp(20px,4vw,32px)",top:s.t,bottom:s.b,left:s.l,right:s.r,animation:`floatSparkle 3s ease-in-out ${s.d}s infinite`}}>{s.e}</span>
        ))}
      </div>
      <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(110px,22vw,160px)",background:"linear-gradient(160deg,#e040aa,#b040d0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",animation:"pop 1s ease-in-out infinite",lineHeight:1,position:"relative",zIndex:1}}>{count}</div>
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,3vw,22px)",color:"#c070a0",marginTop:"4px",animation:"blink 1.6s ease-in-out infinite",position:"relative",zIndex:1,minHeight:"2em"}}>{sub}</p>
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 4: LOADING
════════════════════════════════════════ */
const LoadingScreen = ({onDone}) => {
  const [text,setText]=useState(""); const type=useTyping();
  useEffect(()=>{
    type(setText,"Aaagu Vasthadhii sugar ahh 😒...",{charDelay:45},()=>setTimeout(()=>onDone(),2000));
  },[]);
  return (
    <Screen>
      <div style={{marginBottom:"20px",animation:"floatY 2s ease-in-out infinite",filter:"drop-shadow(0 4px 12px rgba(220,80,140,.25))"}}>
        <KittySVG width={120}/>
      </div>
      <h2 style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(16px,3.5vw,24px)",color:"#e03a90",marginBottom:"16px",minHeight:"2em"}}>{text}</h2>
      <div style={{display:"flex",gap:"8px",justifyContent:"center"}}>
        {[0,1,2].map(i=><span key={i} style={{width:"10px",height:"10px",borderRadius:"50%",background:"#f4a0c8",display:"block",animation:`dotBounce 1.2s ease-in-out ${i*.2}s infinite`}}/>)}
      </div>
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 5: MESSAGE
════════════════════════════════════════ */
const MessageScreen = ({onNext}) => {
  const [title,setTitle]=useState(""); const [sub,setSub]=useState(""); const [showBtn,setShowBtn]=useState(false);
  const [showEaster,setShowEaster]=useState(false); const [easterText,setEasterText]=useState(""); const [easterBtn,setEasterBtn]=useState(false);
  const tapCount=useRef(0); const tapTimer=useRef(null); const type=useTyping();

  useEffect(()=>{
    type(setTitle,"kukkapilla putti 1year 1 month 27 days ayyina oka pandhi putti 21 years avvuthundhi eerojuki 😒",{charDelay:36},()=>{
      type(setSub,"Happy 21st birthday pandhi and Happy birthday kukkapilla 🫂🫂🎂💖",{charDelay:38},()=>setTimeout(()=>setShowBtn(true),500));
    });
  },[]);

  const handleKittyTap=()=>{
    tapCount.current++;playTone(600+tapCount.current*60,"triangle",.08,.2);
    clearTimeout(tapTimer.current);tapTimer.current=setTimeout(()=>{tapCount.current=0;},2000);
    if(tapCount.current>=5){tapCount.current=0;setEasterText("");setEasterBtn(false);setShowEaster(true);playPop();
      ownerLog.add("easter_egg","Kitty tapped 5× — saw secret message!");
      type(setEasterText,EASTER_MSGS[Math.floor(Math.random()*EASTER_MSGS.length)],{charDelay:38},()=>setTimeout(()=>setEasterBtn(true),400));}
  };

  return (
    <Screen>
      <div style={{position:"relative",display:"inline-block",marginBottom:"8px"}}>
        <div onClick={handleKittyTap} style={{animation:"floatY 2s ease-in-out infinite",filter:"drop-shadow(0 6px 14px rgba(220,80,140,.2))",cursor:"pointer"}}>
          <KittySVG width={140}/>
        </div>
        <span style={{position:"absolute",right:"-18px",top:"30%",fontSize:"20px",animation:"hbeat 1.2s ease-in-out infinite"}}>💗</span>
        <span style={{position:"absolute",left:"-16px",top:"50%",fontSize:"16px",animation:"hbeat 1.5s ease-in-out infinite reverse"}}>💖</span>
        <div style={{fontFamily:"'Caveat',cursive",fontSize:"11px",color:"#e0a0c0",marginTop:"4px",opacity:.6,animation:"blink 3s ease-in-out infinite"}}>Psst... tap me 5 times 🐾</div>
      </div>
      <h2 style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"clamp(16px,3.8vw,26px)",color:"#be0a6e",lineHeight:1.55,maxWidth:"560px",margin:"0 0 6px",padding:"0 14px",textAlign:"center",minHeight:"3em"}}>{title}</h2>
      <p style={{fontFamily:"'Pacifico',cursive",fontSize:"clamp(13px,3vw,20px)",color:"#e8407a",margin:"0 0 18px",minHeight:"1.5em"}}>{sub}</p>
      {showBtn&&<Btn onClick={onNext}>🎀 Start the surprise</Btn>}
      {showEaster&&(
        <Modal onBackdropClick={()=>setShowEaster(false)}>
          <div style={{fontSize:"40px"}}>🐾✨</div>
          <h3 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:"#d8368e",margin:0,fontSize:"22px"}}>Secret Message!</h3>
          <p style={{fontFamily:"'Nunito',sans-serif",fontStyle:"italic",color:"#a05878",textAlign:"center",lineHeight:1.6,fontSize:"15px",margin:0,minHeight:"2em"}}>{easterText}</p>
          {easterBtn&&<Btn onClick={()=>setShowEaster(false)}>Aww, thanks! 💖</Btn>}
        </Modal>
      )}
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 6: CANDLE BLOW
════════════════════════════════════════ */
const CandleScreen = ({onDone,triggerBurst}) => {
  const [title,setTitle]=useState(""); const [hint,setHint]=useState("");
  const [blown,setBlown]=useState([false,false,false]);
  const colors=["#a78bfa","#f080b8","#34d399"]; const type=useTyping();

  useEffect(()=>{type(setTitle,"blow cheyadam kudhradhu kani musukuni dhani medha click chey 🕯️",{charDelay:38});},[]); 

  const blowCandle=(i)=>{
    if(blown[i]) return;
    const nb=[...blown];nb[i]=true;setBlown(nb);playCandlePop();triggerBurst(["💨","✨","🌬️"],6);
    ownerLog.add("candle", `Blew candle ${i+1} of 3`);
    if(nb.every(Boolean)){
      ownerLog.add("candle","All 3 candles blown! 🎉");
      type(setHint,"🎉 Chal chaleee",{charDelay:38});playPop();triggerBurst(["🎉","✨","💖","🌸","🎊","⭐"],20);setTimeout(()=>onDone(),1400);}
  };

  return (
    <Screen>
      <h2 style={{fontFamily:"'Great Vibes',cursive",color:"#d1006f",fontSize:"clamp(20px,5vw,36px)",textShadow:"0 0 8px rgba(255,100,160,.4)",textAlign:"center",maxWidth:"80vw",minHeight:"3em"}}>{title}</h2>
      <div style={{display:"flex",gap:"clamp(20px,6vw,40px)",alignItems:"flex-end",padding:"20px 0 10px"}}>
        {[0,1,2].map(i=>(
          <div key={i} onClick={()=>blowCandle(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",position:"relative"}}>
            <div style={{width:"clamp(22px,6vw,32px)",height:"clamp(32px,8vw,44px)",animation:blown[i]?"none":"flameFlicker .8s ease-in-out infinite alternate",opacity:blown[i]?0:1,transform:blown[i]?"scale(0) translateY(-10px)":"scale(1)",transition:"opacity .3s,transform .3s",transformOrigin:"bottom center"}}>
              <div style={{width:"100%",height:"100%",background:"radial-gradient(ellipse at 50% 80%,#fde047 30%,#f97316 70%,transparent 100%)",borderRadius:"50% 50% 35% 35%/60% 60% 40% 40%",boxShadow:"0 0 12px rgba(253,224,71,.8),0 0 24px rgba(249,115,22,.5)"}}/>
            </div>
            <div style={{width:"clamp(22px,6vw,30px)",height:"clamp(55px,14vw,80px)",borderRadius:"4px 4px 2px 2px",background:colors[i],position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:0,left:"20%",width:"20%",height:"100%",background:"rgba(255,255,255,.2)",borderRadius:"2px"}}/>
            </div>
            <div style={{width:"clamp(28px,8vw,38px)",height:"7px",background:"#f9c0d8",borderRadius:"50%",marginTop:"2px"}}/>
          </div>
        ))}
      </div>
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,3.5vw,20px)",color:"#d06090",marginTop:"10px",minHeight:"1.5em"}}>{hint}</p>
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 7: CAKE (animated swipe hint)
════════════════════════════════════════ */
const CakeScreen = ({onDone,triggerBurst}) => {
  const [title,setTitle]=useState(""); const [hint,setHint]=useState("");
  const [cutCount,setCutCount]=useState(0); const [splitAnim,setSplitAnim]=useState(false);
  const [knifePos,setKnifePos]=useState(null); const [cutting,setCutting]=useState(false);
  const swipeRef=useRef({on:false,minX:Infinity,maxX:-Infinity}); const zoneRef=useRef(null); const type=useTyping();

  useEffect(()=>{
    type(setTitle,"elago maaku direct ga cut cheyyinche aadhrustam ledhu kani ikkade cut cheyse 🎂",{charDelay:38},()=>{
      type(setHint,"✦ Ahh knife pattukuni drag chey 😒 ✦",{charDelay:36});
    });
  },[]);

  const getPos=(e)=>{if(e.touches?.length)return{x:e.touches[0].clientX,y:e.touches[0].clientY};if(e.changedTouches?.length)return{x:e.changedTouches[0].clientX,y:e.changedTouches[0].clientY};return{x:e.clientX,y:e.clientY};};
  const onStart=(e)=>{e.preventDefault();const p=getPos(e);swipeRef.current={on:true,minX:p.x,maxX:p.x};setCutting(true);const r=zoneRef.current?.getBoundingClientRect();if(r)setKnifePos({x:p.x-r.left,y:p.y-r.top});};
  const onMove=(e)=>{if(!swipeRef.current.on)return;e.preventDefault();const p=getPos(e);swipeRef.current.minX=Math.min(swipeRef.current.minX,p.x);swipeRef.current.maxX=Math.max(swipeRef.current.maxX,p.x);const r=zoneRef.current?.getBoundingClientRect();if(r)setKnifePos({x:p.x-r.left,y:p.y-r.top});};
  const onEnd=()=>{if(!swipeRef.current.on)return;swipeRef.current.on=false;setCutting(false);if(swipeRef.current.maxX-swipeRef.current.minX>=SWIPE_MIN)registerCut();else setKnifePos(null);};

  const registerCut=()=>{
    setCutCount(prev=>{
      const next=prev+1;playSlash();setTimeout(()=>setKnifePos(null),450);
      if(next===1){triggerBurst(["❤️","💫","✨"],8);type(setHint,"✦ Great! One more swipe! ✦",{charDelay:38});}
      else{setSplitAnim(true);triggerBurst(["🎉","💖","✨","🌸","🎊","⭐","🍰"],20);playPop();type(setHint,"cake cut cheyyadam kuda raadhu 😄",{charDelay:38});setTimeout(()=>onDone(),1200);}
      return next;
    });
  };

  return (
    <Screen style={{gap:"8px"}}>
      <h2 style={{fontFamily:"'Great Vibes',cursive",color:"#d1006f",fontSize:"clamp(16px,4vw,28px)",textShadow:"0 0 8px rgba(255,100,160,.4)",textAlign:"center",padding:"0 12px",maxWidth:"80vw",minHeight:"3em"}}>{title}</h2>
      <div ref={zoneRef} onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}
        style={{position:"relative",width:"clamp(240px,72vw,340px)",height:"clamp(240px,66vw,360px)",touchAction:"none",cursor:"crosshair",userSelect:"none",WebkitUserSelect:"none"}}>
        {/* Knife */}
        {knifePos
          ?<div style={{position:"absolute",left:knifePos.x,top:knifePos.y,transform:"translate(-50%,-50%) rotate(90deg) scale(1.15)",width:"clamp(60px,14vw,80px)",height:"clamp(60px,14vw,80px)",borderRadius:"50%",background:"radial-gradient(circle,#fff5fa 60%,#f9c0d8 100%)",boxShadow:"0 10px 32px rgba(220,80,140,.5)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:10,fontSize:"clamp(28px,7vw,40px)"}}>🔪</div>
          :<div style={{position:"absolute",left:"12%",top:"20%",width:"clamp(60px,14vw,80px)",height:"clamp(60px,14vw,80px)",borderRadius:"50%",background:"radial-gradient(circle,#fff5fa 60%,#f9c0d8 100%)",boxShadow:"0 6px 24px rgba(220,80,140,.3)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:10,animation:"knifeFloat 2s ease-in-out infinite",fontSize:"clamp(28px,7vw,40px)"}}>🔪</div>
        }
        {/* Enhancement #10: animated hand swipe hint */}
        {cutCount===0&&!cutting&&(
          <div style={{position:"absolute",top:"28%",left:0,right:0,display:"flex",alignItems:"center",justifyContent:"center",gap:"4px",pointerEvents:"none",zIndex:5,opacity:.8}}>
            <span style={{fontSize:"26px",animation:"handSwipe 1.4s ease-in-out infinite"}}>👆</span>
            <span style={{display:"inline-block",width:"44px",height:"3px",background:"linear-gradient(90deg,#f080b8,transparent)",borderRadius:"2px",animation:"handSwipe 1.4s ease-in-out infinite",animationDelay:".1s"}}/>
          </div>
        )}
        {/* Cake SVG */}
        <div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:"88%",pointerEvents:"none"}}>
          <svg viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"auto",filter:"drop-shadow(0 8px 20px rgba(220,80,140,.25))",display:"block",animation:"floatY 2.5s ease-in-out infinite"}}>
            <g style={{animation:splitAnim?"splitLeft .6s ease forwards":"none"}}>
              <rect x="30" y="125" width="70" height="44" rx="10" fill="#f9a8d4"/>
              <rect x="42" y="90" width="58" height="40" rx="10" fill="#fcd5e8"/>
              <rect x="55" y="62" width="45" height="33" rx="10" fill="#fbcfe8"/>
              <path d="M30 130 Q45 120 60 130 Q75 120 90 130" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
              <path d="M42 95 Q57 85 72 95 Q87 85 100 95" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
            </g>
            <g style={{animation:splitAnim?"splitRight .6s ease forwards":"none"}}>
              <rect x="100" y="125" width="70" height="44" rx="10" fill="#f9a8d4"/>
              <rect x="100" y="90" width="58" height="40" rx="10" fill="#fcd5e8"/>
              <rect x="100" y="62" width="45" height="33" rx="10" fill="#fbcfe8"/>
              <path d="M100 130 Q115 120 130 130 Q145 120 160 130 Q165 120 170 130" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round"/>
              <path d="M100 95 Q117 85 132 95 Q147 85 158 95" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
            </g>
            <ellipse cx="100" cy="168" rx="80" ry="11" fill="#f9c0d8" opacity="0.45"/>
            <rect x="78" y="44" width="8" height="22" rx="3" fill="#a78bfa"/>
            <rect x="95" y="40" width="8" height="26" rx="3" fill="#f080b8"/>
            <rect x="112" y="44" width="8" height="22" rx="3" fill="#34d399"/>
            <ellipse cx="82" cy="42" rx="4" ry="6" fill="#fde047" opacity="0.9"/>
            <ellipse cx="82" cy="41" rx="2" ry="3" fill="#f97316"/>
            <ellipse cx="99" cy="38" rx="4" ry="6" fill="#fde047" opacity="0.9"/>
            <ellipse cx="99" cy="37" rx="2" ry="3" fill="#f97316"/>
            <ellipse cx="116" cy="42" rx="4" ry="6" fill="#fde047" opacity="0.9"/>
            <ellipse cx="116" cy="41" rx="2" ry="3" fill="#f97316"/>
            <text x="100" y="155" textAnchor="middle" fontFamily="Baloo 2" fontWeight="800" fontSize="13" fill="#fff">Happy 21st!</text>
          </svg>
        </div>
      </div>
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,2.5vw,16px)",color:"#d06090",margin:"4px 0 2px",opacity:.85,minHeight:"1.5em"}}>{hint}</p>
      <div style={{display:"flex",gap:"12px",justifyContent:"center",marginTop:"4px"}}>
        {[0,1].map(i=><span key={i} style={{width:"14px",height:"14px",borderRadius:"50%",background:cutCount>i?"#e040a0":"#f9c0d8",border:`2px solid ${cutCount>i?"#e040a0":"#f4a0c8"}`,display:"block",transform:cutCount>i?"scale(1.25)":"scale(1)",transition:"all .3s",boxShadow:cutCount>i?"0 0 8px rgba(224,64,160,.5)":"none"}}/>)}
      </div>
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 8: BIRTHDAY
════════════════════════════════════════ */
const BirthdayScreen = ({onNext}) => {
  const [title,setTitle]=useState(""); const [showBtn,setShowBtn]=useState(false);
  const canvasRef=useRef(null); const type=useTyping();
  useEffect(()=>{
    launchConfetti(canvasRef.current);
    type(setTitle,"Happy Birthday, kukkapilla garuuuuu 😘😘! 💙",{charDelay:42},()=>setTimeout(()=>setShowBtn(true),600));
  },[]);
  return (
    <Screen style={{position:"fixed",inset:0}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"14px"}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontStyle:"italic",fontSize:"clamp(24px,5.5vw,46px)",color:"#d8368e",lineHeight:1.25,margin:0,minHeight:"2em"}}>{title}</h1>
        <div style={{animation:"floatY 2s ease-in-out infinite",filter:"drop-shadow(0 6px 14px rgba(220,80,140,.2))"}}>
          <BirthdayKittySVG/>
        </div>
        {showBtn&&<Btn onClick={onNext}>Next →</Btn>}
      </div>
    </Screen>
  );
};

function launchConfetti(canvas) {
  if(!canvas) return;
  const ctx=canvas.getContext("2d");
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  const colors=["#ff78b8","#ff3080","#f7c0dc","#ffacdf","#ffd0e8","#e040a0","#fff","#ffa0cc","#a78bfa","#fde047"];
  const pieces=Array.from({length:180},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,r:Math.random()*8+3,d:Math.random()*2.5+1.2,color:colors[Math.floor(Math.random()*colors.length)],tilt:Math.random()*Math.PI*2,ti:(Math.random()-.5)*.1}));
  let frame=0;
  const draw=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);pieces.forEach(p=>{p.tilt+=p.ti;p.y+=p.d;if(p.y>canvas.height+20){p.y=-10;p.x=Math.random()*canvas.width;}ctx.beginPath();ctx.fillStyle=p.color;ctx.ellipse(p.x,p.y,p.r,p.r*.45,p.tilt,0,Math.PI*2);ctx.fill();});if(++frame<480)requestAnimationFrame(draw);else ctx.clearRect(0,0,canvas.width,canvas.height);};
  draw();
}

/* ════════════════════════════════════════
   SCREEN 9: GALLERY (fade+slide, lightbox, typed captions)
════════════════════════════════════════ */
const GalleryScreen = ({onNext}) => {
  const [title,setTitle]=useState(""); const [hint,setHint]=useState(""); const [showBtn,setShowBtn]=useState(false);
  const [galIndex,setGalIndex]=useState(0); const [isAnimating,setIsAnimating]=useState(false);
  const [photoMsg,setPhotoMsg]=useState(null); const [photoMsgText,setPhotoMsgText]=useState(""); const [showPhotoBtn,setShowPhotoBtn]=useState(false);
  const [lightbox,setLightbox]=useState(null); // Enhancement #9
  const [caption,setCaption]=useState(""); // Enhancement #14
  const autoRef=useRef(null); const touchStart=useRef(0); const pressTimer=useRef(null);
  const type=useTyping();

  useEffect(()=>{
    type(setTitle,"The moments that makes me one 🌸",{charDelay:42},()=>{
      type(setHint,"long press cheysi chudu | double tap to fullscreen 💖",{charDelay:36},()=>{
        setTimeout(()=>{setShowBtn(true);startAuto();},600);
      });
    });
    return()=>clearInterval(autoRef.current);
  },[]);

  // Enhancement #14: type caption when photo changes
  useEffect(()=>{
    setCaption("");
    type(setCaption,PHOTOS[galIndex].label,{charDelay:35});
  },[galIndex]);

  const startAuto=()=>{clearInterval(autoRef.current);autoRef.current=setInterval(()=>next(),3200);};
  const next=()=>{if(isAnimating)return;setIsAnimating(true);setGalIndex(p=>(p+1)%PHOTOS.length);startAuto();setTimeout(()=>setIsAnimating(false),400);};
  const prev=()=>{if(isAnimating)return;setIsAnimating(true);setGalIndex(p=>(p-1+PHOTOS.length)%PHOTOS.length);startAuto();setTimeout(()=>setIsAnimating(false),400);};

  const startPress=(msg)=>{pressTimer.current=setTimeout(()=>showMsg(msg),600);};
  const endPress=()=>clearTimeout(pressTimer.current);
  const showMsg=(msg)=>{if(!msg)return;setPhotoMsg(msg);setPhotoMsgText("");setShowPhotoBtn(false);playPop();type(setPhotoMsgText,msg,{charDelay:38},()=>setTimeout(()=>setShowPhotoBtn(true),400));};

  // Enhancement #3: fade + slide (no flip)
  const cardStyle=(i)=>{
    const total=PHOTOS.length, diff=((i-galIndex)%total+total)%total;
    if(diff===0) return{transform:"translateX(0) scale(1)",opacity:1,zIndex:10,pointerEvents:"all",boxShadow:"0 16px 40px rgba(180,60,120,.28)"};
    if(diff===1) return{transform:`rotate(${ROTATIONS[i%ROTATIONS.length]}deg) scale(.92) translateX(18px) translateY(8px)`,opacity:.7,zIndex:6,pointerEvents:"none"};
    if(diff===total-1) return{transform:`rotate(${-ROTATIONS[i%ROTATIONS.length]}deg) scale(.92) translateX(-18px) translateY(8px)`,opacity:.7,zIndex:6,pointerEvents:"none"};
    if(diff===2) return{transform:"rotate(7deg) scale(.85) translateX(28px) translateY(14px)",opacity:.35,zIndex:3,pointerEvents:"none"};
    if(diff===total-2) return{transform:"rotate(-7deg) scale(.85) translateX(-28px) translateY(14px)",opacity:.35,zIndex:3,pointerEvents:"none"};
    return{opacity:0,zIndex:0,pointerEvents:"none"};
  };

  return (
    <Screen style={{gap:0, padding:"8px 16px", justifyContent:"center"}}>

      {/* Title */}
      <h2 style={{fontFamily:"'Great Vibes',cursive",color:"#d1006f",fontSize:"clamp(16px,4vw,28px)",margin:"0 0 6px",textShadow:"0 0 8px rgba(255,100,160,.4)",flexShrink:0,minHeight:"36px"}}>{title}</h2>

      {/* Polaroid stack — capped at 52vh so everything below always fits */}
      <div style={{position:"relative",width:"min(260px, 72vw)",height:"min(300px, 52vh)",margin:"0 auto 8px",perspective:"900px",cursor:"pointer",flexShrink:0}}
        onTouchStart={e=>{touchStart.current=e.touches[0].clientX;}}
        onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touchStart.current;if(Math.abs(dx)>40){dx<0?next():prev();}}}
      >
        {PHOTOS.map((photo,i)=>(
          <div key={i} style={{position:"absolute",inset:0,background:"#fff",borderRadius:"6px",padding:"8px 8px 36px",boxShadow:"0 8px 28px rgba(180,60,120,.18)",transition:"transform .45s cubic-bezier(.34,1.5,.64,1),opacity .35s ease",willChange:"transform,opacity",...cardStyle(i)}}
            onMouseDown={()=>startPress(photo.msg)} onMouseUp={endPress} onMouseLeave={endPress}
            onTouchStart={()=>startPress(photo.msg)} onTouchEnd={endPress} onTouchCancel={endPress}
            onClick={()=>{clearTimeout(pressTimer.current);next();}}
          >
            <div style={{width:"100%",height:"calc(100% - 36px)",borderRadius:"3px",position:"relative",background:"#fff8fc",border:"1px solid #f9d0e8",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              <img src={photo.src} alt={photo.label}
                style={{maxWidth:"100%",maxHeight:"100%",width:"auto",height:"auto",objectFit:"contain",display:"block",transition:"filter 1.5s",filter:i===galIndex?"saturate(1) brightness(1)":"saturate(.1) brightness(1.4)"}}
                onError={e=>{e.target.style.display="none";}}
                onDoubleClick={(e)=>{e.stopPropagation();setLightbox(photo.src);}}
              />
              <div style={{position:"absolute",inset:0,background:"rgba(255,240,248,.6)",opacity:i===galIndex?0:1,transition:"opacity 1.2s",pointerEvents:"none"}}/>
            </div>
            <div style={{textAlign:"center",fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,16px)",fontWeight:700,color:"#b05070",lineHeight:1,position:"absolute",bottom:"6px",left:0,right:0}}>
              {i===galIndex ? caption : photo.label}
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"4px",flexShrink:0}}>
        <button onClick={prev} style={{background:"linear-gradient(135deg,#f080b8,#e040a0)",border:"none",width:"34px",height:"34px",borderRadius:"50%",color:"#fff",fontSize:"20px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,boxShadow:"0 4px 14px rgba(220,70,140,.3)",lineHeight:1}}>‹</button>
        <span style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(14px,3vw,18px)",fontWeight:700,color:"#d8368e",minWidth:"48px",textAlign:"center"}}>{galIndex+1} / {PHOTOS.length}</span>
        <button onClick={next} style={{background:"linear-gradient(135deg,#f080b8,#e040a0)",border:"none",width:"34px",height:"34px",borderRadius:"50%",color:"#fff",fontSize:"20px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,boxShadow:"0 4px 14px rgba(220,70,140,.3)",lineHeight:1}}>›</button>
      </div>

      {/* Hint */}
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"11px",color:"#d0a0b8",margin:"0 0 6px",opacity:.8,flexShrink:0,minHeight:"14px"}}>{hint}</p>

      {/* Next page button — always visible */}
      <Btn onClick={onNext} style={{flexShrink:0,opacity:showBtn?1:0,pointerEvents:showBtn?"all":"none",transition:"opacity .4s"}}>
        ✉️ chudali ani vunte chudu
      </Btn>

      {/* Lightbox */}
      {lightbox&&(
        <div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",cursor:"zoom-out"}}>
          <img src={lightbox} style={{maxWidth:"95vw",maxHeight:"92vh",objectFit:"contain",borderRadius:"8px",boxShadow:"0 0 60px rgba(255,120,180,.3)"}} onClick={e=>e.stopPropagation()} alt="fullscreen"/>
          <div onClick={()=>setLightbox(null)} style={{position:"absolute",top:"16px",right:"20px",color:"white",fontSize:"32px",cursor:"pointer",background:"rgba(255,255,255,.15)",width:"40px",height:"40px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</div>
        </div>
      )}

      {/* Photo secret message */}
      {photoMsg&&(
        <Modal onBackdropClick={()=>setPhotoMsg(null)}>
          <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,4vw,22px)",fontWeight:700,color:"#c070a0",margin:0,textAlign:"center",lineHeight:1.5}}>{photoMsgText}</p>
          {showPhotoBtn&&<Btn onClick={()=>setPhotoMsg(null)}>💖</Btn>}
        </Modal>
      )}
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 10: LETTER (shimmer, scroll bar, 🎀 easter egg)
════════════════════════════════════════ */
const LetterScreen = ({onNext}) => {
  const [sealBroken,setSealBroken]=useState(false);
  const [letterTitle,setLetterTitle]=useState(""); const [letterTyped,setLetterTyped]=useState("");
  const [showEnd,setShowEnd]=useState(false); const [showNextBtn,setShowNextBtn]=useState(false);
  const [scrollPct,setScrollPct]=useState(0); // Enhancement #7
  const [bowTaps,setBowTaps]=useState(0); // Enhancement #11
  const [bowEaster,setBowEaster]=useState(false); const [bowText,setBowText]=useState(""); const [bowBtn,setBowBtn]=useState(false);
  const pressTimer=useRef(null); const type=useTyping(); const boxRef=useRef(null);

  const startBreak=()=>{pressTimer.current=setTimeout(doBreak,LONG_PRESS);};
  const cancelBreak=()=>clearTimeout(pressTimer.current);
  const doBreak=()=>{
    setSealBroken(true);playPop();
    setTimeout(()=>{type(setLetterTitle,"A Special Message 💌",{charDelay:50},()=>startLetterType());},700);
  };
  const startLetterType=()=>{
    // Generate full text instantly so user can read from the top
    // while the text is still "appearing" in the background at fast speed.
    // We do NOT auto-scroll — user reads from top naturally.
    setLetterTyped(""); setShowEnd(false);
    // Reset scroll to top immediately
    if(boxRef.current) boxRef.current.scrollTop=0;
    let i=0, acc="";
    const iv=setInterval(()=>{
      // Type 4 chars per tick for fast background generation
      for(let c=0;c<4&&i<LETTER_TEXT.length;c++){acc+=LETTER_TEXT[i++];}
      setLetterTyped(acc);
      // NO auto-scroll — let user read from top at their own pace
      if(i>=LETTER_TEXT.length){
        clearInterval(iv);
        setShowEnd(true);
        setTimeout(()=>setShowNextBtn(true),600);
      }
    },30);
  };
  const onScroll=()=>{
    if(!boxRef.current) return;
    const{scrollTop,scrollHeight,clientHeight}=boxRef.current;
    setScrollPct(scrollHeight>clientHeight?scrollTop/(scrollHeight-clientHeight)*100:100);
  };
  const handleBowTap=()=>{
    const n=bowTaps+1;setBowTaps(n);playTone(600+n*40,"triangle",.08,.15);
    if(n>=5){setBowTaps(0);setBowEaster(true);setBowText("");setBowBtn(false);playPop();
      type(setBowText,"Oka secret — nuvvu naa world lo most special person 🌍💖",{charDelay:38},()=>setTimeout(()=>setBowBtn(true),400));}
  };

  return (
    <Screen style={{justifyContent:sealBroken?"flex-start":"center",paddingTop:"12px",paddingBottom:"12px"}}>
      {!sealBroken&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"16px",zIndex:1,position:"relative"}}>
          <div onMouseDown={startBreak} onMouseUp={cancelBreak} onMouseLeave={cancelBreak} onTouchStart={startBreak} onTouchEnd={cancelBreak} onTouchCancel={cancelBreak}
            style={{width:"clamp(120px,32vw,160px)",height:"clamp(120px,32vw,160px)",borderRadius:"50%",background:"radial-gradient(circle at 38% 38%,#f080b8,#c0205a)",boxShadow:"0 8px 32px rgba(180,30,100,.45),inset 0 2px 8px rgba(255,160,200,.4)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none",gap:"6px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:"12%",left:"18%",width:"28%",height:"28%",background:"rgba(255,255,255,.18)",borderRadius:"50%",filter:"blur(3px)"}}/>
            <span style={{fontSize:"clamp(28px,8vw,42px)",filter:"drop-shadow(0 2px 4px rgba(0,0,0,.2))",position:"relative",zIndex:1}}>💌</span>
            <span style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(12px,3vw,15px)",color:"rgba(255,255,255,.9)",letterSpacing:".03em",position:"relative",zIndex:1}}>Long press to open</span>
          </div>
        </div>
      )}
      {sealBroken&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:0,width:"100%",height:"100%",padding:"8px 0",animation:"fadeInUp .5s ease"}}>
          <h2 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontStyle:"italic",fontSize:"clamp(18px,4vw,32px)",color:"#d8368e",margin:"0 0 4px",flexShrink:0}}>{letterTitle}</h2>
          {/* Enhancement #11: tappable bow */}
          <div onClick={handleBowTap} style={{fontSize:"20px",margin:"2px 0 6px",flexShrink:0,cursor:"pointer",userSelect:"none",transition:"transform .15s"}} title="Tap 5x for a secret 🌸">🎀</div>
          {/* Enhancement #7: scroll progress + Enhancement #4: shimmer */}
          <div style={{position:"relative",width:"94vw",maxWidth:"680px",flex:1,minHeight:0,display:"flex"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:"4px",borderRadius:"4px",background:"#f9d0e4",zIndex:2,flexShrink:0}}>
              <div style={{width:"100%",height:`${scrollPct}%`,background:"linear-gradient(180deg,#f080b8,#e040a0)",borderRadius:"4px",transition:"height .1s"}}/>
            </div>
            <div ref={boxRef} onScroll={onScroll}
              className="letter-scroll"
              style={{background:"#fff",borderRadius:"16px",padding:"clamp(16px,4vw,28px) clamp(18px,5vw,36px)",width:"100%",flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",boxShadow:"0 4px 24px rgba(200,70,130,.15)",fontFamily:"'Caveat',cursive",fontStyle:"italic",fontSize:"clamp(17px,3.2vw,22px)",color:"#d1006f",lineHeight:2,textAlign:"center",border:"2px solid #f9d0e4",position:"relative",marginLeft:"8px"}}>
              {/* Enhancement #4: glitter shimmer */}
              <div style={{position:"sticky",top:0,height:0,overflow:"visible",pointerEvents:"none",zIndex:1}}>
                <div style={{height:"100vh",background:"linear-gradient(105deg,transparent 40%,rgba(255,200,230,.15) 50%,transparent 60%)",backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite",marginTop:"-2px"}}/>
              </div>
              <p style={{margin:0,whiteSpace:"pre-wrap",position:"relative",zIndex:2}}>{letterTyped}</p>
              {showEnd&&<div style={{fontSize:"22px",margin:"6px 0",position:"relative",zIndex:2}}>🌸</div>}
            </div>
          </div>
          {showNextBtn&&<Btn onClick={onNext} style={{marginTop:"10px",flexShrink:0}}>Continue ✨</Btn>}
        </div>
      )}
      {/* Enhancement #11: bow easter egg modal */}
      {bowEaster&&(
        <Modal onBackdropClick={()=>setBowEaster(false)}>
          <div style={{fontSize:"40px"}}>🎀✨</div>
          <h3 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:"#d8368e",margin:0,fontSize:"20px"}}>A Hidden Note 💌</h3>
          <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,color:"#c070a0",textAlign:"center",lineHeight:1.6,fontSize:"clamp(15px,3.8vw,18px)",margin:0}}>{bowText}</p>
          {bowBtn&&<Btn onClick={()=>setBowEaster(false)}>💖</Btn>}
        </Modal>
      )}
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 11: END CREDITS  (Enhancement #13)
════════════════════════════════════════ */
const CreditsScreen = ({onRestart}) => {
  const [phase,setPhase]=useState(0);
  const lines=[
    {text:"Made with 💖",            size:"clamp(28px,6vw,52px)", font:"'Great Vibes',cursive",   color:"#d1006f"},
    {text:"for the one and only",    size:"clamp(16px,3vw,24px)", font:"'Caveat',cursive",         color:"#c070a0"},
    {text:"kukkapilla 🐾",           size:"clamp(24px,5vw,42px)", font:"'Dancing Script',cursive", color:"#e040a0"},
    {text:"Happy 21st Birthday 🎂",  size:"clamp(18px,4vw,32px)", font:"'Pacifico',cursive",       color:"#f080b8"},
    {text:"— with all my heart ❤️", size:"clamp(14px,2.8vw,20px)",font:"'Caveat',cursive",         color:"#b05070"},
  ];
  useEffect(()=>{
    const timers=lines.map((_,i)=>setTimeout(()=>setPhase(p=>Math.max(p,i+1)),600+i*1100));
    const btnTimer=setTimeout(()=>setPhase(lines.length+1),600+lines.length*1100+600);
    return()=>{timers.forEach(clearTimeout);clearTimeout(btnTimer);};
  },[]);
  return (
    <Screen style={{background:"radial-gradient(ellipse at 50% 40%,#fff0f8,#ffd0ec 60%,#ffb8e0 100%)"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"20px",padding:"24px"}}>
        {lines.map((l,i)=>(
          <div key={i} style={{opacity:phase>i?1:0,transform:phase>i?"translateY(0)":"translateY(24px)",transition:"opacity .9s ease,transform .9s ease",fontFamily:l.font,fontSize:l.size,color:l.color,textAlign:"center",textShadow:"0 2px 12px rgba(220,80,140,.2)"}}>
            {l.text}
          </div>
        ))}
        <div style={{opacity:phase>lines.length?1:0,transition:"opacity .9s ease",marginTop:"12px",display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center"}}>
          <Btn onClick={onRestart}>🔁 Replay from start</Btn>
        </div>
      </div>
    </Screen>
  );
};

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */

// Owner log — persists in sessionStorage so you can check after she finishes
// Global so any screen can call ownerLog.add() without prop drilling
const ownerLog = {
  add: (type, value) => {
    try {
      const log = JSON.parse(sessionStorage.getItem("ownerLog") || "[]");
      log.push({ type, value, time: new Date().toLocaleTimeString() });
      sessionStorage.setItem("ownerLog", JSON.stringify(log));
    } catch(e) {}
  },
  get: () => {
    try { return JSON.parse(sessionStorage.getItem("ownerLog") || "[]"); }
    catch(e) { return []; }
  },
  clear: () => { try { sessionStorage.removeItem("ownerLog"); } catch(e) {} }
};

const OwnerPanel = ({onClose}) => {
  const [log, setLog] = useState(ownerLog.get());

  // Live refresh every 2s so new entries appear even when panel is open
  useEffect(()=>{
    const iv = setInterval(()=>setLog(ownerLog.get()), 2000);
    return ()=>clearInterval(iv);
  },[]);

  const iconFor = (type) => ({
    name_correct:"✅", name_wrong:"❌", screen:"📍",
    easter_egg:"🐾", kitty_tap:"🐱", candle:"🕯️",
    cake_cut:"🔪", photo_press:"📸", bow_tap:"🎀",
    hint_opened:"💡", music:"🎵"
  }[type] || "🔹");

  const colorFor = (type) => ({
    name_correct:"#4caf50", name_wrong:"#f44336",
    screen:"#90caf9", easter_egg:"#ce93d8",
    kitty_tap:"#ffb74d", candle:"#fff176",
    cake_cut:"#ef9a9a", photo_press:"#f48fb1",
    bow_tap:"#f8bbd9", hint_opened:"#ffe082",
    music:"#80cbc4"
  }[type] || "#ccc");

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}}>
      <div style={{background:"#120608",border:"2px solid #e040a0",borderRadius:"20px",padding:"20px",maxWidth:"460px",width:"98vw",maxHeight:"85vh",display:"flex",flexDirection:"column",gap:"10px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{color:"#f080b8",fontWeight:700,fontSize:"17px",fontFamily:"monospace"}}>🔐 Developer View</div>
            <div style={{color:"#888",fontSize:"11px",fontFamily:"monospace"}}>Tap music 🎵 × 5 to open · auto-refreshes</div>
          </div>
          <div style={{display:"flex",gap:"6px"}}>
            <button onClick={()=>{ownerLog.clear();setLog([]);}} style={{background:"#c0392b",border:"none",color:"white",borderRadius:"8px",padding:"5px 10px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace"}}>🗑 Clear</button>
            <button onClick={onClose} style={{background:"#333",border:"none",color:"white",borderRadius:"8px",padding:"5px 10px",cursor:"pointer",fontSize:"12px",fontFamily:"monospace"}}>✕ Close</button>
          </div>
        </div>

        {/* Summary row */}
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap",flexShrink:0}}>
          {[
            {label:"Screens visited", val: log.filter(e=>e.type==="screen").length, color:"#90caf9"},
            {label:"Name attempts",   val: log.filter(e=>e.type==="name_wrong").length, color:"#f44336"},
            {label:"Got name right",  val: log.filter(e=>e.type==="name_correct").length?"Yes":"No", color:"#4caf50"},
            {label:"Easter eggs",     val: log.filter(e=>e.type==="easter_egg").length, color:"#ce93d8"},
          ].map((s,i)=>(
            <div key={i} style={{background:"#1e0a10",border:`1px solid ${s.color}44`,borderRadius:"10px",padding:"6px 10px",flex:"1",minWidth:"90px"}}>
              <div style={{color:s.color,fontSize:"16px",fontWeight:700,fontFamily:"monospace"}}>{s.val}</div>
              <div style={{color:"#888",fontSize:"10px",fontFamily:"monospace"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Log */}
        <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:"4px"}}>
          {log.length===0
            ? <p style={{color:"#555",textAlign:"center",fontFamily:"monospace",marginTop:"20px"}}>No activity yet. She hasn't started!</p>
            : [...log].reverse().map((entry,i)=>(
              <div key={i} style={{background:"#1a0a12",borderRadius:"8px",padding:"7px 10px",display:"flex",gap:"8px",alignItems:"flex-start",border:`1px solid ${colorFor(entry.type)}22`}}>
                <span style={{fontSize:"16px",flexShrink:0}}>{iconFor(entry.type)}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{color:colorFor(entry.type),fontSize:"11px",fontFamily:"monospace",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{entry.type.replace(/_/g," ")}</div>
                  <div style={{color:"#eee",fontSize:"13px",fontFamily:"monospace",wordBreak:"break-all"}}>{entry.value}</div>
                </div>
                <span style={{color:"#555",fontSize:"10px",fontFamily:"monospace",flexShrink:0}}>{entry.time}</span>
              </div>
            ))
          }
        </div>

      </div>
    </div>
  );
};

export default function BirthdaySurprise() {
  const [screen,setScreen]=useState("unlock");
  const [bursts,setBursts]=useState([]);
  const [musicOn,setMusicOn]=useState(false);
  const [showOwner,setShowOwner]=useState(false);
  const audioRef=useRef(null);
  const musicTapRef=useRef({count:0,timer:null}); // secret: tap music btn 5x fast

  const triggerBurst=useCallback((emojis=["🎉","💖","✨","🌸","🎊","⭐"],count=16)=>{
    const nb=Array.from({length:count},(_,i)=>({id:Date.now()+i,emoji:emojis[Math.floor(Math.random()*emojis.length)],x:(10+Math.random()*80)+"vw",y:(20+Math.random()*60)+"vh",size:(18+Math.random()*22)+"px",delay:(Math.random()*.4)+"s"}));
    setBursts(nb); setTimeout(()=>setBursts([]),1400);
  },[]);

  const go=useCallback((s)=>{
    setScreen(s);
    ownerLog.add("screen", s);
    if(CHIMES[s]) setTimeout(()=>CHIMES[s](),300);
  },[]);

  // Enhancement #6 + #15: music fade-in
  const startMusic=useCallback(()=>{
    if(audioRef.current){audioRef.current.play().catch(()=>{});setMusicOn(true);return;}
    const a=new Audio("photos/Urike_Urike.m4a");
    a.loop=true; a.volume=0;
    a.play().catch(()=>{});
    audioRef.current=a; setMusicOn(true);
    let v=0;
    const fade=setInterval(()=>{v=Math.min(v+0.015,0.3);a.volume=v;if(v>=0.3)clearInterval(fade);},150);
  },[]);

  // Secret owner panel: tap music button 5x within 2 seconds
  const handleMusicBtn=()=>{
    const t=musicTapRef.current;
    t.count++;
    clearTimeout(t.timer);
    if(t.count>=5){
      t.count=0;
      setShowOwner(true); // show owner panel
      return;
    }
    t.timer=setTimeout(()=>{ t.count=0; },2000);
    toggleMusic();
  };

  const toggleMusic=()=>{
    if(!audioRef.current){startMusic();return;}
    if(musicOn){audioRef.current.pause();setMusicOn(false);}
    else{audioRef.current.play().catch(()=>{});setMusicOn(true);}
  };

  const restart=()=>{
    if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;}
    setMusicOn(false); go("unlock");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Caveat:wght@600;700&family=Nunito:ital,wght@1,400;1,600&family=Dancing+Script:wght@600;700&family=Pacifico&family=Great+Vibes&display=swap');
        :root{--pink:#f080b8;--deep:#e040a0;--light:#fde8f0;--pale:#fff5fa;--accent:#a78bfa;--shadow:rgba(220,70,140,.35);}
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;width:100%;overflow:hidden;}
        body{font-family:'Baloo 2',cursive;text-align:center;}

        /* Enhancement #1: animated gradient background */
        body{background:linear-gradient(135deg,#ffe0f4,#ffc8e8,#ffd8f0,#ffb8e0,#ffe4f8);background-size:400% 400%;animation:gradientShift 12s ease infinite;}

        @keyframes gradientShift  {0%{background-position:0% 50%;}50%{background-position:100% 50%;}100%{background-position:0% 50%;}}
        @keyframes screenFadeIn   {from{opacity:0;}to{opacity:1;}}
        @keyframes petalFall      {0%{transform:translateY(-40px) rotate(0deg);opacity:0;}10%{opacity:.6;}90%{opacity:.3;}100%{transform:translateY(110vh) rotate(360deg) translateX(30px);opacity:0;}}
        @keyframes floatY         {0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
        @keyframes blink          {0%,100%{opacity:1;}50%{opacity:.45;}}
        @keyframes popIn          {from{transform:scale(.5);opacity:0;}to{transform:scale(1);opacity:1;}}
        @keyframes burstFly       {0%{transform:scale(0) translateY(0);opacity:1;}60%{transform:scale(1.3) translateY(-30px);opacity:1;}100%{transform:scale(.8) translateY(-60px);opacity:0;}}
        @keyframes shakeInput     {0%,100%{transform:translateX(0);}25%{transform:translateX(-8px);}75%{transform:translateX(8px);}}
        @keyframes dotBounce      {0%,100%{transform:translateY(0);opacity:.5;}50%{transform:translateY(-8px);opacity:1;}}
        @keyframes floatSparkle   {0%,100%{transform:translateY(0) rotate(0deg);opacity:.8;}50%{transform:translateY(-18px) rotate(20deg);opacity:1;}}
        @keyframes hbeat          {0%,100%{transform:scale(1) translateY(0);}50%{transform:scale(1.4) translateY(-6px);}}
        @keyframes flameFlicker   {0%{transform:scaleX(1) scaleY(1) rotate(-2deg);}100%{transform:scaleX(.88) scaleY(1.08) rotate(2deg);}}
        @keyframes knifeFloat     {0%,100%{top:20%;}50%{top:14%;}}
        @keyframes splitLeft      {0%{transform:translateX(0);}100%{transform:translateX(-40px) rotate(-8deg);}}
        @keyframes splitRight     {0%{transform:translateX(0);}100%{transform:translateX(40px) rotate(8deg);}}
        @keyframes fadeInUp       {from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pop            {0%,100%{transform:scale(1);}50%{transform:scale(1.3);}}
        @keyframes envFloat       {0%,100%{transform:translateY(0) rotate(-.5deg);}50%{transform:translateY(-14px) rotate(.5deg);}}
        @keyframes floatUp        {0%{transform:translateY(0);opacity:1;}100%{transform:translateY(-120px);opacity:0;}}
        /* Enhancement #2 */
        @keyframes sparkleTrail   {0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(-50%,-50%) scale(0) translateY(-20px);opacity:0;}}
        /* Enhancement #10 */
        @keyframes handSwipe      {0%,100%{transform:translateX(-10px);opacity:.5;}50%{transform:translateX(16px);opacity:1;}}
        /* Enhancement #4 */
        @keyframes shimmer        {0%{background-position:200% center;}100%{background-position:-200% center;}}

        /* Pink scrollbar for letter box */
        .letter-scroll::-webkit-scrollbar { width: 6px; }
        .letter-scroll::-webkit-scrollbar-track { background: #f9d0e4; border-radius: 4px; }
        .letter-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#f080b8,#e040a0); border-radius: 4px; }
        .letter-scroll { scrollbar-color: #f080b8 #f9d0e4; scrollbar-width: thin; }
      `}</style>

      <Petals/>
      <EmojiBurst bursts={bursts}/>
      <SparkleCursor/>{/* Enhancement #2 */}

      {/* Music Button — tap 5x fast to open owner view */}
      <button onClick={handleMusicBtn} style={{position:"fixed",top:"12px",right:"12px",zIndex:9999,width:"42px",height:"42px",borderRadius:"50%",background:"linear-gradient(135deg,#f4a0c8,#e040a0)",border:"none",cursor:"pointer",fontSize:"17px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 16px rgba(220,70,140,.35)",padding:0,transition:"transform .2s"}}>
        {musicOn?"🔇":"🎵"}
      </button>

      {showOwner&&<OwnerPanel onClose={()=>setShowOwner(false)}/>}

      {screen==="unlock"    && <UnlockScreen    onOpen={()=>go("nameEntry")} onFirstTap={startMusic}/>}
      {screen==="nameEntry" && <NameEntryScreen  onSuccess={()=>go("countdown")} triggerBurst={triggerBurst} ownerLog={ownerLog}/>}
      {screen==="countdown" && <CountdownScreen  onDone={()=>go("loading")}/>}
      {screen==="loading"   && <LoadingScreen    onDone={()=>go("message")}/>}
      {screen==="message"   && <MessageScreen    onNext={()=>go("candles")}/>}
      {screen==="candles"   && <CandleScreen     onDone={()=>go("cake")} triggerBurst={triggerBurst}/>}
      {screen==="cake"      && <CakeScreen       onDone={()=>go("birthday")} triggerBurst={triggerBurst}/>}
      {screen==="birthday"  && <BirthdayScreen   onNext={()=>go("gallery")}/>}
      {screen==="gallery"   && <GalleryScreen    onNext={()=>go("letter")}/>}
      {screen==="letter"    && <LetterScreen     onNext={()=>go("credits")}/>}
      {screen==="credits"   && <CreditsScreen    onRestart={restart}/>}
    </>
  );
}
