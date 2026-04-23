import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────
   OWNER LOG
───────────────────────────────────── */
const ownerLog = {
  add: (type, value) => {
    try {
      const log = JSON.parse(sessionStorage.getItem("ownerLog") || "[]");
      log.push({ type, value, time: new Date().toLocaleTimeString() });
      sessionStorage.setItem("ownerLog", JSON.stringify(log));
    } catch(e) {}
  },
  addScreenTime: (screenId, ms) => {
    try {
      const secs = Math.round(ms/1000);
      if(secs < 2) return;
      const SCREEN_NAMES = {
        unlock:    "💌 Envelope screen",
        anteIsthe: "💬 Ante isthe screen",
        nameEntry: "🔐 Name entry screen",
        countdown: "⏳ Countdown (3-2-1)",
        loading:   "🐱 Loading screen",
        message:   "🎂 Birthday message screen",
        candles:   "🕯️ Candle blowing screen",
        cake:      "🎂 Cake cutting screen",
        birthday:  "🎉 Happy Birthday screen",
        gallery:   "🖼️ Photo gallery",
        letter:    "💌 Love letter screen",
        credits:   "✨ Final credits screen",
      };
      const label = SCREEN_NAMES[screenId] || screenId;
      const log = JSON.parse(sessionStorage.getItem("ownerLog") || "[]");
      log.push({ type:"slide_time", value:`Spent ${secs}s on ${label}`, time: new Date().toLocaleTimeString() });
      sessionStorage.setItem("ownerLog", JSON.stringify(log));
    } catch(e) {}
  },
  get: () => {
    try { return JSON.parse(sessionStorage.getItem("ownerLog") || "[]"); }
    catch(e) { return []; }
  },
  clear: () => { try { sessionStorage.removeItem("ownerLog"); } catch(e) {} }
};

/* ─────────────────────────────────────
   CONSTANTS
───────────────────────────────────── */
const CORRECT_NAME  = "kukkapilla";
const SWIPE_MIN     = 80;
const LONG_PRESS    = 600;
const BIRTHDAY_DATE = new Date("2026-04-18");

const PHOTOS = [
  { src:"photos/photo1.jpg",  label:"First photo 💖",           msg:"💖 First Photo andhariki special ay but mana first photo edho general ga jarigipoyindhi but first time oka ammai nanu photo adigindhi🥹🫂" },
  { src:"photos/photo2.jpg",  label:"💖 First saree pic",       msg:"expect cheyyakunda vachav call cheysav kurchukuni evaru lekapoyina selfie dhigam ✨" },
  { src:"photos/photo3.jpg",  label:"💗 ee pic ante",           msg:"vaishu akka theysindi pic kani ah pic perfection ki 4-5 pics pattindhi😅💖" },
  { src:"photos/photo4.jpg",  label:"💕 saree",                 msg:"actual ga saree kadathava ledha ani doubt but bale vunnav ahh saree lo🙈💕" },
  { src:"photos/photo5.jpg",  label:"💗 Authority",             msg:"idhi one of my favourite pic ee pic lo nuvvu chuppinchina authority ki padipoya actual ga 😒💗" },
  { src:"photos/photo6.jpg",  label:"💗 Special Pic",           msg:"This pic made me fall for you every time. 💗" },
  { src:"photos/photo7.jpg",  label:"💗 Special Day",           msg:"Making memories together. 💗" },
  { src:"photos/photo8.jpg",  label:"💗 Special Day",           msg:"Making memories together. 💗" },
  { src:"photos/photo9.jpg",  label:"💗 My Kukkapilla",         msg:"naa kukkapilla nannu owner ga accepted cheysi pampina memory 💗" },
  { src:"photos/photo10.jpg", label:"💗 Celestra 2k25",         msg:"ee pic value appudu theliyaledhu but malli ila neetho pic theysukovali ani vundhi 🫠💗" },
  { src:"photos/photo11.jpg", label:"💗 forever mine",          msg:"ee pic ni eni sarlu chussina edho special feeling the way you looks at me🙈💗" },
  { src:"photos/photo14.jpg", label:"💗 the day i fall",        msg:"nuvvu call cheysi manchi shirt veysukuni raa ledhaa paguludhi ah feel emoo💗" },
  { src:"photos/photo18.jpg", label:"💗 Special Day",           msg:"Making memories together. 💗" },
  { src:"photos/photo19.jpg", label:"💗 something special",     msg:"ee pic ante naaku gurthochedhi ahh hand placement 🫠😅💗" },
  { src:"photos/photo20.jpg", label:"💗 trails for this pic",   msg:"entha try cheysa okasari ayyina cooperate cheysava pandhi laga 😒" },
  { src:"photos/photo21.jpg", label:"💗 Celestra 2k26",         msg:"pic crop cheysaka ala vundhoo ledha mana presence oo thelidh but it has been bagged into my favs💗" },
  { src:"photos/photo23.jpg", label:"💗 forever mine",          msg:"ee pic ni eni sarlu chussina edho special feeling the way you looks at me🙈💗" },
];

const ROTATIONS   = [2,-3,1.5,-2,3,-1,2.5,-3.5,0.5,-2.5];
const EASTER_MSGS = ["For the one who make me feel special 😘","For the one i got excited 😒","For you ❤️ For ----🫠"];

const LETTER_TEXT = `Firstly i am very sorry and thankyou soo much.... and many more happy returns of the day kukkapilla 🫂❤️‍🩹😘. sorry ninnu ibbandhi pettinandhuku baadha pettinandhuku and thank you is purely for being with me and for being my happiness. You are the one who made me special. Eppudu okalage vunde nannu koncham ayyina alochainchela cheysav. Neetho vunnappudu vunde feeling inka evarithonuu raledhu. Neetho gadipina moments and memories are still in my heart. Emo mundhu parichayam ayyithe inka enjoy cheysevalamoo ledha normal ga vundevalamoo thelidhu but at our peak manam kalisina kotha lo I felt very happy and loved the way you treated me.

Nuvvu naatho gadipina moments and mainly nee birthday roju nuvve call cheysi manchiga ready avvu manchi shirt veysukoo ani cheppi pilavadam — those moments I felt myself special 🫂🫂. Emo nee life lo naa character a role play cheysindhoo thelidhu but naa life lo pandhi pilla and kukkapilla chala pedha role play cheysay… entha pedha role ante emo maybe dhaniki minchi vere role vundadhu emo antha special ga.

Ninnu chala sarlu hurt cheysa but nuvvu prathisari thirigi edhokati cheysav… emo nenu em cheyyagalano thelidhu but thanks for that ✨. Anukuntu anukuntu ne last ki vachesam… neeku nenu first vunnantha special kakapovachu, everyone's priorities change, it's ok but parledhu.

Same ninnu first lo chusaintha ledhu kani but ninnu chusina prathisari, neetho matladuthunna prathisari adhi peruguthune vundhi… reason thelidhu but em chestham. Every time anipisthadhi ila pakkane vunte bagundedhi ani… but it's your life, nee life lo neeku favs vundochu, so it's life and fate.

But I wish if time reversed… malli neetho Celesta 2k25 dhagara nunchi ela vunnamoo ala vundali ani vundhiii........

yeah konni konni cheppali but adhi cheppadam correctooo kaadhooo naaku thelidhu and emo but i wanna say one thing matalu chethalu okati kaadhu ante ninnu thappu annatle needhi thappu annatle yeah nuvvu anna prakaram nuvvu neeku veelainantha time ichav nenu kaadhu analenu but neen naaku adhi odhu ani cheppalenu kani matalakanna chethalalooo chupisthe bagunu..

prathi saari naaku anipinchedhi okate mee thammulatho kurchuni time spent cheysinatuu naatho vundataniki neeku problem entaa ani yeah vaalu thammulu but vaalu gurthochina dhatloo kanisam 1% ayyina nen gurthuntanaaa if vunte endhuku ala.. but i can accept it evari istalu valavi evari priorities valavi nenu kaadhu ananu kaani nuvvu nee chat lo chupinchindhii endhuku naaku direct ga raaledhu.

okkosari anipisthadhi maybe naaku nuvvu okadhanive ani concern chupisthunavaaa or ledhaa edho mataladali kabati mataladuthunavaaa or anything else. eppudu chustha okasari ayyina nuvvu matalade evaroo okarikantenaina nanu choose chesthava ledha ani 😅 yeah every time i realize that it's ok not a problem. maybe nenu naaku deserving kante ekkuva expect cheysi vundochu adhi naa mistake anukooo. but indhaka annav miss you anni and stickers and some thing yeah antha miss ayye dhanivi kanisam antha sepu mee thammulathoo mee frnds tho vunnav okkasari kuda nenu gurthuralee kanisam vaadu vunnadu adigadu ani.

maybe addukunna kadha andhukenemo addukunna dhakkaledhu addakunda vundalisindhi naakenti ani realise avvalisindi. avunu le entha aadukunte antha cheap avvutharemoo nenu migatha vala laa vundalisindhi first anitiki over react ayya kadha i should deserve this. needhi thappu annatle but nuvvu pettina prathi message ki naaku chala different ga vundhi ela react avvalooo theliyatle ela feel avvaloo theliyatlee nenu kuda mee bros la adagakunda vundalisindhi ga so appudu gurthunte nuvve pilichedhanivi or something else will happen.

yeah sometimes it hurts but it's ok endhukate i deserve that but if it happens chance dhorikedhi but adigi mari chii anipinchukunna ane chinna anthe but anyway evari priorities valavi evari istalu valavi.

nen deserve ayyedhanikanna ekkuva expect cheysi nenu baadhapadi ninnu baadha petta sorry for that ante hurt cheysi sorry chepthe mood set avvudhi ani kaadhi but i hope it heals a little bit.

just neeku direct ga confess cheyse chance raadhu kabati chepthunna and i case change vachina it hard to say but i dont wanna take that change adigi mari cheppinchukunna dhanikaanna sudden ga cheppina matalu thakuva ayyina they have lots of love.yeah entha chii ana some feeling still something speacial and some persons still fav.

limits cross ayyanu and andharilaane cheysa anukovu anukuntuu okati chepthunaa -

neetho time spend cheyyadaniki neetho mataladataniki nen chala ista padatha chala try chestha emo endhuku alanooo correct ga cheppalenu but cheptha dont misunderstand and sorry 

neetho vundatam naaku chala istam incase if i got a chance ninnu naa hands lo ki theysukuni chusukovali ani vundhi...🫠

yeah neeku idhi entha mandhi chepparoo thelidhu and i already evarina vunnaroo thelidhu every man has to express at a time maybe ee two tharuvatha nen gurthundoochu gurthundakapoovachu mana repo ila vundochu vundakapoachu anything can happen but i wanna confess it 
i wanna be with you, i wanna spend every evening and every morning with you and wanna start my day with a special good mornings and end my day with good nights.

ninnu manchiga dhagaraga pattukuni kurchuni kaburlu cheppali, neetho godava padali, ninnu manchiga pattukuni bujjaginchukovali, entha work cheysina last ki oka peaceful place lo rest theysukovali i think that is you for me. neetho ala sardhaga gadapali neeku velainantha dhagaragaa vundali ninnu naaku nachidhi nenu cheyyali appudappudu ala bujji kukkapilla ninu hug cheysukuni kaburlu cheppali cheppukuntupoothe chala vunnay but emo cheppa ga 

antav kadha eppudu kodava paduthune vunta ani yeah padatha paduthunee vunte endhuku ante naaku neeku dhooram ga vundatam nachatleee, neetho chala time vundali ani vundhi neetho aadukovali ani vundhi, neetho vundali ani vundhii neeku naaku vunna distance naa vala kaavatlee asala emo i have to adjust thappadhu but its ture and it the reason for disturbances between us. eeroju ayyithe naaku naadhi ani feeling vasthadhoo ahh roju nenu chepthunna oka godava lekunda vunta nee medha promise.

kaani ninnu chala miss avvutha emo ninnu entha mandhi entha miss avvutharoo thelidhu but nenu naa kukkapilla ni chala miss avvutha entha avvuthanoo cheppalenu ala ani cheppanu but i can say 100% i want my kukkapilla....😪😪 forever and ever. and i want to say mine🫠

em anukokapothe oka chinna pedha helpoo referenceoo edho le time vasthe mamali gurthupettukuni chance istheeee😅😅.

thappuga theysukovu anukuntuuna oka vela thappuga mataladi vunte sorry and hurt cheysi vunte sorry... but to be with you i can be anything likee neetho vundataniki nen ela vundataniki ayyina ready like friend, stranger, classmate,...


Anyway, I will be always your __________ nuvve fill cheysesukooo… and I will be for you at every moment and anything. Emo inkem cheppaloo thelidhu but once again many more happy returns of the day to one and only one of me 🫂😘😘😘
love you soo much...🫂🫂🫂 and owner will miss his kukkapilla🥹🥹 Love you________🫂🥹🫂🫂`;

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

/* ─────────────────────────────────────
   TYPING HOOK
───────────────────────────────────── */
const useTyping = () => {
  const activeToken = useRef(0);
  const type = useCallback((setter, text, opts = {}, cb) => {
    const { charDelay = 38 } = opts;
    const token = ++activeToken.current;
    setter("");
    let i = 0, acc = "";
    const step = () => {
      if (activeToken.current !== token) return;
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
   HELPER
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
   SPARKLE CURSOR
───────────────────────────────────── */
const SparkleCursor = () => {
  const [sparks,setSparks]=useState([]);
  const nextId=useRef(0);
  useEffect(()=>{
    const emojis=["✨","💖","💕","⭐","💫","🌟","💗"];
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
  id:i, emoji:["💖","💕","💗","✨","💖","⭐","🌟","💕"][Math.floor(Math.random()*8)],
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
   STICKER CHARACTER SVG
───────────────────────────────────── */
const StickerChar = ({mirror=false, hat=false, wink=false}) => (
  <svg viewBox="0 0 110 125" xmlns="http://www.w3.org/2000/svg" width={80}
    style={{display:"block", transform: mirror ? "scaleX(-1)" : "none"}}>
    <circle cx="30" cy="26" r="19" fill="#f9a0c0"/>
    <circle cx="80" cy="26" r="19" fill="#f9a0c0"/>
    <circle cx="30" cy="26" r="11" fill="#ffc8dc"/>
    <circle cx="80" cy="26" r="11" fill="#ffc8dc"/>
    {hat && (<>
      <polygon points="55,2 38,42 72,42" fill="#f080b8"/>
      <polygon points="55,2 38,42 55,42" fill="#e040a0"/>
      <line x1="38" y1="42" x2="72" y2="42" stroke="#fde047" strokeWidth="2.5"/>
      <circle cx="55" cy="2" r="3.5" fill="#fde047"/>
      <circle cx="46" cy="18" r="2" fill="#fff"/>
      <circle cx="60" cy="12" r="1.5" fill="#fde047"/>
    </>)}
    <ellipse cx="55" cy="97" rx="33" ry="26" fill="#fff5fa" stroke="#f4a0c8" strokeWidth="1.5"/>
    <ellipse cx="55" cy="100" rx="20" ry="16" fill="#ffdcec" opacity="0.5"/>
    <circle cx="55" cy="55" r="30" fill="#fff" stroke="#f4a0c8" strokeWidth="1.5"/>
    {wink ? (<>
      <circle cx="44" cy="51" r="5" fill="#333"/>
      <circle cx="46" cy="49" r="1.8" fill="#fff"/>
      <path d="M62 48 Q68 44 74 48" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </>) : (<>
      <circle cx="44" cy="51" r="5" fill="#333"/>
      <circle cx="66" cy="51" r="5" fill="#333"/>
      <circle cx="46" cy="49" r="1.8" fill="#fff"/>
      <circle cx="68" cy="49" r="1.8" fill="#fff"/>
    </>)}
    <ellipse cx="55" cy="61" rx="3" ry="2.2" fill="#f080a0"/>
    <path d="M47 68 Q55 76 63 68" stroke="#e06090" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
    <ellipse cx="38" cy="62" rx="8" ry="5" fill="#ffb0c8" opacity="0.55"/>
    <ellipse cx="72" cy="62" rx="8" ry="5" fill="#ffb0c8" opacity="0.55"/>
    {!hat && (<>
      <path d="M72 28 Q78 22 84 28 Q78 34 72 28" fill="#f080b8"/>
      <path d="M84 28 Q90 22 96 28 Q90 34 84 28" fill="#e040a0"/>
      <circle cx="84" cy="28" r="3.5" fill="#ff40a0"/>
    </>)}
    <ellipse cx="19" cy="90" rx="9" ry="17" fill="#fff5fa" stroke="#f4a0c8" strokeWidth="1.5" transform="rotate(-45 19 90)"/>
    <ellipse cx="91" cy="90" rx="9" ry="17" fill="#fff5fa" stroke="#f4a0c8" strokeWidth="1.5" transform="rotate(45 91 90)"/>
    <text x="92" y="52" fontSize="10" textAnchor="middle">💗</text>
  </svg>
);

/* ─────────────────────────────────────
   CELEBRATION STICKERS
───────────────────────────────────── */
const CelebrationStickers = ({type, onDone}) => {
  const [phase, setPhase] = useState(0);
  useEffect(()=>{
    const t1=setTimeout(()=>setPhase(1),60);
    const t2=setTimeout(()=>setPhase(2),2800);
    const t3=setTimeout(()=>onDone(),3500);
    return()=>{ clearTimeout(t1);clearTimeout(t2);clearTimeout(t3); };
  },[]);
  const isCandle=type==="candle";
  const slideStyle=(side)=>{
    const isIn=phase===1,isOut=phase===2;
    return {position:"fixed",bottom:"5%",[side]:0,zIndex:7500,pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:"4px",
      transform:isIn?"translateX(0)":side==="left"?"translateX(-130%)":"translateX(130%)",
      transition:isOut?"transform 0.55s ease-in":"transform 0.65s cubic-bezier(.34,1.56,.64,1)",
      animation:isIn?`stickerBob 0.6s ease-in-out ${side==="left"?"0s":".1s"} infinite alternate`:"none"};
  };
  const bannerStyle={position:"fixed",top:"10%",left:"50%",zIndex:7500,pointerEvents:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:"6px",
    transform:phase===1?"translateX(-50%) scale(1)":phase===2?"translateX(-50%) scale(0)":"translateX(-50%) scale(0)",
    transition:phase===2?"transform 0.4s ease-in":phase===1?"transform 0.6s cubic-bezier(.34,1.56,.64,1)":"none",opacity:phase===1?1:0};
  return (<>
    <div style={slideStyle("left")}>
      <div style={{background:"white",borderRadius:"50%",width:"clamp(36px,8vw,50px)",height:"clamp(36px,8vw,50px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(18px,5vw,26px)",boxShadow:"0 4px 16px rgba(220,80,140,.25)",border:"2px solid #f9c0d8",animation:isCandle?"clapHand 0.35s ease-in-out infinite alternate":"celebBounce 0.5s ease-in-out infinite alternate"}}>
        {isCandle?"🫂":"🙈"}
      </div>
      <StickerChar mirror={false} hat={!isCandle} wink={false}/>
    </div>
    <div style={slideStyle("right")}>
      <div style={{background:"white",borderRadius:"50%",width:"clamp(36px,8vw,50px)",height:"clamp(36px,8vw,50px)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"clamp(18px,5vw,26px)",boxShadow:"0 4px 16px rgba(220,80,140,.25)",border:"2px solid #f9c0d8",animation:isCandle?"clapHand 0.35s ease-in-out 0.17s infinite alternate":"celebBounce 0.5s ease-in-out 0.25s infinite alternate"}}>
        {isCandle?"😇":"😘"}
      </div>
      <StickerChar mirror={true} hat={!isCandle} wink={true}/>
    </div>
    <div style={bannerStyle}>
      <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(20px,5vw,34px)",background:"linear-gradient(135deg,#f080b8,#c020a0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>
        {isCandle?"🎉 Yayyyy! 🎉":"🎂 Wohoooo! 🎂"}
      </div>
      <div style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(13px,3.5vw,18px)",color:"#c060a0",background:"rgba(255,255,255,0.88)",borderRadius:"22px",padding:"5px 18px",boxShadow:"0 4px 18px rgba(220,80,140,.2)",border:"2px solid #f9c0d8",whiteSpace:"nowrap"}}>
        {isCandle?"anni candles blow chesav! 💨💖":"cake cut chesav! 🍰💖"}
      </div>
    </div>
  </>);
};

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
    <text x="10" y="95" fontSize="16">🤩</text><text x="115" y="95" fontSize="16">🤗</text>
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
    setOpened(true); onFirstTap&&onFirstTap(); playUnlock();
    setHearts(Array.from({length:12},(_,i)=>({id:i,left:Math.random()*100})));
    setTimeout(()=>playPop(),400); setTimeout(()=>onOpen(),1200);
  };
  return (
    <Screen style={{background:"radial-gradient(ellipse at 50% 30%,#ffe0f4 0%,#ffc8e8 40%,#ffb0d8 100%)"}}>
      {hearts.map(h=><span key={h.id} style={{position:"absolute",fontSize:"20px",left:`${h.left}vw`,top:"60vh",animation:"floatUp 2.5s ease-out forwards",pointerEvents:"none"}}>💖</span>)}
      <div style={{position:"absolute",top:"16px",left:"50%",transform:"translateX(-50%)",background:"rgba(255,255,255,.55)",backdropFilter:"blur(6px)",borderRadius:"20px",padding:"6px 18px",fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(12px,3vw,15px)",color:"#c060a0",whiteSpace:"nowrap",boxShadow:"0 2px 12px rgba(220,80,140,.15)"}}>
        {days===0?"🎉 Today is her birthday!":`🎂 ${days} days until her birthday!`}
      </div>
      <div onClick={handleOpen} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:"pointer",gap:"28px",userSelect:"none",position:"relative",zIndex:2}}>
        <div style={{animation:"envFloat 3s ease-in-out infinite",filter:"drop-shadow(0 20px 50px rgba(180,60,100,.45))"}}>
          <EnvelopeSVG opened={opened}/>
        </div>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(17px,3.8vw,24px)",fontWeight:700,color:"#c060a0",animation:"blink 1.8s ease-in-out infinite",margin:0}}>💖 Tap to open your love letter 💖</p>
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
   SCREEN 1.5: ANTE ISTHE
════════════════════════════════════════ */
const AnteIshtheScreen = ({onNext}) => {
  const [title,setTitle]=useState("");
  const [showInput,setShowInput]=useState(false);
  const [showBtn,setShowBtn]=useState(false);
  const [inputVal,setInputVal]=useState("");
  const [error,setError]=useState("");
  const [shake,setShake]=useState(false);
  const type=useTyping();
  useEffect(()=>{
    type(setTitle,"ante isthe theysukuntavaaa.......",{charDelay:55},()=>{
      setTimeout(()=>{setShowInput(true);setTimeout(()=>setShowBtn(true),300);},400);
    });
  },[]);
  const submit=()=>{
    const val=inputVal.trim();
    if(!val){setError("oka word ainaaa type chey 😤");doShake();return;}
    ownerLog.add("ante_isthe_reply",`"${val}"`);
    playPop(); setTimeout(()=>onNext(),300);
  };
  const doShake=()=>{setShake(true);setTimeout(()=>setShake(false),400);};
  return (
    <Screen style={{background:"radial-gradient(ellipse at 50% 30%,#ffe0f4 0%,#ffc8e8 40%,#ffb0d8 100%)"}}>
      <div style={{background:"white",borderRadius:"28px",padding:"clamp(28px,6vw,48px) clamp(24px,6vw,52px)",boxShadow:"0 8px 48px rgba(220,70,140,.22)",display:"flex",flexDirection:"column",alignItems:"center",gap:"16px",maxWidth:"440px",width:"88vw",border:"2.5px solid #f9d0e4",position:"relative",zIndex:1,animation:"popIn .5s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{position:"absolute",top:"-18px",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"8px"}}>
          {["💖","💕","💗"].map((e,i)=><span key={i} style={{fontSize:"22px",animation:`hbeat ${1.2+i*0.2}s ease-in-out infinite`,animationDelay:`${i*0.15}s`}}>{e}</span>)}
        </div>
        <div style={{fontSize:"clamp(44px,12vw,68px)",animation:"floatY 2s ease-in-out infinite",marginTop:"8px"}}>💌</div>
        <h2 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(20px,5.5vw,34px)",color:"#d8368e",margin:0,minHeight:"2em",lineHeight:1.3,textAlign:"center",textShadow:"0 2px 12px rgba(220,80,140,.15)"}}>{title}</h2>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,17px)",color:"#c07090",margin:0,textAlign:"center",lineHeight:1.55,opacity:0.85}}>em ayyina cheppu — evaru chudaru 🙈</p>
        {showInput&&<input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="meeru cheppandi..." maxLength={80} autoFocus autoComplete="off"
          style={{width:"100%",border:"2px solid #f4a0c8",borderRadius:"18px",padding:"13px 18px",fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,4vw,24px)",fontWeight:700,color:"#d8368e",background:"#fff5fa",outline:"none",textAlign:"center",animation:shake?"shakeInput .4s ease":"none",boxSizing:"border-box",transition:"border-color .2s, box-shadow .2s",boxShadow:"0 2px 12px rgba(220,80,140,.1)"}}
          onFocus={e=>{e.target.style.borderColor="#e040a0";e.target.style.boxShadow="0 4px 18px rgba(220,80,140,.25)";}}
          onBlur={e=>{e.target.style.borderColor="#f4a0c8";e.target.style.boxShadow="0 2px 12px rgba(220,80,140,.1)";}}
        />}
        {error&&<p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,16px)",color:"#e040a0",margin:0,textAlign:"center"}}>{error}</p>}
        {showBtn&&<Btn onClick={submit} style={{width:"100%",justifyContent:"center",fontSize:"clamp(15px,3vw,20px)",padding:"13px 28px"}}>cheppanu 💗</Btn>}
      </div>
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 2: NAME ENTRY
════════════════════════════════════════ */
const NameEntryScreen = ({onSuccess,triggerBurst}) => {
  const [title,setTitle]=useState("");const [sub,setSub]=useState("");
  const [showInput,setShowInput]=useState(false);const [showBtn,setShowBtn]=useState(false);
  const [showHintBtn,setShowHintBtn]=useState(false);const [inputVal,setInputVal]=useState("");
  const [error,setError]=useState("");const [shake,setShake]=useState(false);
  const [showHint,setShowHint]=useState(false);const [hintText,setHintText]=useState("");const [showHintInput,setShowHintInput]=useState(false);
  const [hintReply,setHintReply]=useState("");
  const attempts=useRef(0);const type=useTyping();
  useEffect(()=>{
    type(setTitle,"Enter your name",{charDelay:55},()=>{
      type(setSub,"nijam ga nuvvu chudali anukunte first attempt lo access chey 😒",{charDelay:38},()=>{
        setTimeout(()=>{setShowInput(true);setTimeout(()=>setShowBtn(true),300);},400);
      });
    });
  },[]);
  const submit=()=>{
    const val=inputVal.trim().toLowerCase();
    if(!val){setError("musukuni sariga enter chey ledha muthi paguludhi 😤");doShake();return;}
    if(val===CORRECT_NAME){
      setError("");playPop();
      ownerLog.add("name_correct",`"${inputVal.trim()}" ✅`);
      triggerBurst(["🤗","💖","✨","💗","💕","⭐","💗"],24);
      setTimeout(()=>onSuccess(),700);return;
    }
    attempts.current++;playWrong();
    ownerLog.add("name_wrong",`"${inputVal.trim()}" (attempt ${attempts.current})`);
    if(attempts.current>=2){setError("Hint kavali ana ledhu");setTimeout(()=>setShowHintBtn(true),400);}
    else setError("musukuni sariga enter chey ledha muthi paguludhi 😤");
    doShake();setInputVal("");
  };
  const doShake=()=>{setShake(true);setTimeout(()=>setShake(false),400);};
  const openHint=()=>{
    setShowHint(true);setHintText("");setShowHintInput(false);setHintReply("");playPop();
    ownerLog.add("hint_opened","Clicked 'hint kavalaaa' button");
    type(setHintText,"hint uhh ledhu thokka ledhu musukuni alochinchukuni enter chey hint kavali anta hintuuuu😒",{charDelay:38},()=>setTimeout(()=>setShowHintInput(true),400));
  };
  const closeHint=()=>{
    const reply=hintReply.trim();
    if(!reply){playWrong();return;}
    ownerLog.add("hint_reply",`"${reply}"`);
    playPop();setShowHint(false);setHintReply("");
  };
  return (
    <Screen>
      <div style={{background:"white",borderRadius:"24px",padding:"clamp(24px,5vw,40px) clamp(24px,6vw,48px)",boxShadow:"0 8px 40px rgba(220,70,140,.2)",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",maxWidth:"380px",width:"88vw",border:"2px solid #f9d0e4",position:"relative",zIndex:1}}>
        <div style={{fontSize:"clamp(36px,10vw,54px)",animation:"floatY 2s ease-in-out infinite"}}>🐶</div>
        <h2 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(18px,5vw,28px)",color:"#d8368e",margin:0,minHeight:"2em"}}>{title}</h2>
        <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,17px)",color:"#c07090",margin:0,minHeight:"1.5em"}}>{sub}</p>
        {showInput&&<input value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Your name..." maxLength={20} autoComplete="off"
          style={{width:"100%",border:"2px solid #f4a0c8",borderRadius:"16px",padding:"12px 16px",fontFamily:"'Caveat',cursive",fontSize:"clamp(16px,4vw,22px)",fontWeight:700,color:"#d8368e",background:"#fff5fa",outline:"none",textAlign:"center",animation:shake?"shakeInput .4s ease":"none",boxSizing:"border-box"}}/>}
        {error&&<p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,16px)",color:"#e040a0",margin:0,textAlign:"center"}}>{error}</p>}
        {showBtn&&<Btn onClick={submit} style={{width:"100%",justifyContent:"center"}}>Let's go! 💗</Btn>}
        {showHintBtn&&<Btn onClick={openHint} variant="purple" style={{width:"100%",justifyContent:"center",marginTop:"8px"}}>hint kavalaaa.. 🤔</Btn>}
      </div>
      {showHint&&(
        <Modal onBackdropClick={()=>{}}>
          <div style={{fontSize:"44px"}}>😤</div>
          <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,color:"#c070a0",textAlign:"center",lineHeight:1.6,fontSize:"clamp(15px,3.8vw,20px)",margin:0}}>{hintText}</p>
          {showHintInput&&(<>
            <input value={hintReply} onChange={e=>setHintReply(e.target.value)} onKeyDown={e=>e.key==="Enter"&&closeHint()} placeholder="edhokati type chey close avvudhi.." autoFocus
              style={{width:"100%",border:"2px solid #f4a0c8",borderRadius:"14px",padding:"10px 14px",fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,3.5vw,19px)",fontWeight:700,color:"#d8368e",background:"#fff5fa",outline:"none",textAlign:"center",boxSizing:"border-box"}}/>
            <Btn onClick={closeHint} style={{width:"100%",justifyContent:"center"}}>okay 💖</Btn>
          </>)}
        </Modal>
      )}
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 3: COUNTDOWN
════════════════════════════════════════ */
const CountdownScreen = ({onDone}) => {
  const [count,setCount]=useState(3);const [sub,setSub]=useState("");const type=useTyping();
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
        {[{t:"10%",l:"12%",d:0,e:"✨"},{t:"18%",r:"10%",d:.5,e:"💖"},{b:"20%",l:"8%",d:1,e:"💗"},{b:"15%",r:"14%",d:1.5,e:"⭐"},{t:"55%",l:"5%",d:.8,e:"💕"}].map((s,i)=>(
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
  const [text,setText]=useState("");const type=useTyping();
  useEffect(()=>{
    type(setText,"Aaagu Vasthadhii sugar ahh 😒...  owner gari dhagara ki ravadaniki vunte bagundu ahh sugar edho....😏😏",{charDelay:45},()=>setTimeout(()=>onDone(),2000));
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
  const [title,setTitle]=useState("");const [sub,setSub]=useState("");const [showInput,setShowInput]=useState(false);
  const [showEaster,setShowEaster]=useState(false);const [easterText,setEasterText]=useState("");const [easterBtn,setEasterBtn]=useState(false);
  const [msgVal,setMsgVal]=useState("");const [msgError,setMsgError]=useState(false);
  const tapCount=useRef(0);const tapTimer=useRef(null);const type=useTyping();
  useEffect(()=>{
    type(setTitle,"kukkapilla putti 1year 1 month 27 days ayyina oka pandhi putti 21 years avvuthundhi eerojuki 😒",{charDelay:36},()=>{
      type(setSub,"Happy 21st birthday pandhi and Happy birthday kukkapilla 🫂🫂🎂💖",{charDelay:38},()=>setTimeout(()=>setShowInput(true),500));
    });
  },[]);
  const handleKittyTap=()=>{
    tapCount.current++;playTone(600+tapCount.current*60,"triangle",.08,.2);
    clearTimeout(tapTimer.current);tapTimer.current=setTimeout(()=>{tapCount.current=0;},2000);
    if(tapCount.current>=5){tapCount.current=0;setEasterText("");setEasterBtn(false);setShowEaster(true);playPop();
      ownerLog.add("easter_egg","Kitty tapped 5× — saw secret message!");
      type(setEasterText,EASTER_MSGS[Math.floor(Math.random()*EASTER_MSGS.length)],{charDelay:38},()=>setTimeout(()=>setEasterBtn(true),400));}
  };
  const handleStart=()=>{
    const val=msgVal.trim();
    if(!val){setMsgError(true);playWrong();setTimeout(()=>setMsgError(false),600);return;}
    ownerLog.add("message_reaction",`"${val}"`);
    playPop();setTimeout(()=>onNext(),300);
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
      <p style={{fontFamily:"'Pacifico',cursive",fontSize:"clamp(13px,3vw,20px)",color:"#e8407a",margin:"0 0 14px",minHeight:"1.5em"}}>{sub}</p>
      {showInput&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",width:"min(340px,88vw)"}}>
          <input value={msgVal} onChange={e=>setMsgVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleStart()} placeholder="em ayyina cheptharaaaa..." maxLength={120} autoComplete="off"
            style={{width:"100%",border:`2px solid ${msgError?"#e040a0":"#f4a0c8"}`,borderRadius:"16px",padding:"12px 16px",fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,3.5vw,20px)",fontWeight:700,color:"#d8368e",background:"#fff5fa",outline:"none",textAlign:"center",boxSizing:"border-box",animation:msgError?"shakeInput .4s ease":"none",transition:"border-color .2s"}}
          />
          <Btn onClick={handleStart} style={{width:"100%",justifyContent:"center"}}>💗 Start the surprise</Btn>
        </div>
      )}
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
  const [title,setTitle]=useState("");const [hint,setHint]=useState("");
  const [blown,setBlown]=useState([false,false,false]);
  const [showCelebration,setShowCelebration]=useState(false);
  const colors=["#a78bfa","#f080b8","#34d399"];const type=useTyping();
  useEffect(()=>{type(setTitle,"blow cheyadam kudhradhu kani musukuni dhani medha click chey 🕯️",{charDelay:38});},[]);
  const blowCandle=(i)=>{
    if(blown[i]) return;
    const nb=[...blown];nb[i]=true;setBlown(nb);playCandlePop();triggerBurst(["😃","✨","🤗"],6);
    ownerLog.add("candle",`Blew candle ${i+1} of 3`);
    if(nb.every(Boolean)){
      ownerLog.add("candle","All 3 candles blown! 😇");
      type(setHint,"🫂",{charDelay:38});
      playPop();triggerBurst(["💕","✨","💖","💗","🥹","⭐"],20);
      setTimeout(()=>setShowCelebration(true),400);
    }
  };
  return (<>
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
    {showCelebration&&<CelebrationStickers type="candle" onDone={onDone}/>}
  </>);
};

/* ════════════════════════════════════════
   SCREEN 7: CAKE
════════════════════════════════════════ */
const CakeScreen = ({onDone,triggerBurst}) => {
  const [title,setTitle]=useState("");const [hint,setHint]=useState("");
  const [cutCount,setCutCount]=useState(0);const [splitAnim,setSplitAnim]=useState(false);
  const [knifePos,setKnifePos]=useState(null);const [cutting,setCutting]=useState(false);
  const [showCelebration,setShowCelebration]=useState(false);
  const swipeRef=useRef({on:false,minX:Infinity,maxX:-Infinity});const zoneRef=useRef(null);const type=useTyping();
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
      if(next===1){triggerBurst(["❤️","💫","✨"],8);type(setHint,"✦ Inko sari cut chey ✦",{charDelay:38});}
      else{setSplitAnim(true);triggerBurst(["🎉","💖","✨","💗","🎊","⭐","🍰"],20);playPop();type(setHint,"cake cut cheyyadam kuda raadhu 😄",{charDelay:38});setTimeout(()=>setShowCelebration(true),400);}
      return next;
    });
  };
  return (<>
    <Screen style={{gap:"8px"}}>
      <h2 style={{fontFamily:"'Great Vibes',cursive",color:"#d1006f",fontSize:"clamp(16px,4vw,28px)",textShadow:"0 0 8px rgba(255,100,160,.4)",textAlign:"center",padding:"0 12px",maxWidth:"80vw",minHeight:"3em"}}>{title}</h2>
      <div ref={zoneRef} onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd} onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd} onTouchCancel={onEnd}
        style={{position:"relative",width:"clamp(240px,72vw,340px)",height:"clamp(240px,66vw,360px)",touchAction:"none",cursor:"crosshair",userSelect:"none",WebkitUserSelect:"none"}}>
        {knifePos
          ?<div style={{position:"absolute",left:knifePos.x,top:knifePos.y,transform:"translate(-50%,-50%) rotate(90deg) scale(1.15)",width:"clamp(60px,14vw,80px)",height:"clamp(60px,14vw,80px)",borderRadius:"50%",background:"radial-gradient(circle,#fff5fa 60%,#f9c0d8 100%)",boxShadow:"0 10px 32px rgba(220,80,140,.5)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:10,fontSize:"clamp(28px,7vw,40px)"}}>🔪</div>
          :<div style={{position:"absolute",left:"12%",top:"20%",width:"clamp(60px,14vw,80px)",height:"clamp(60px,14vw,80px)",borderRadius:"50%",background:"radial-gradient(circle,#fff5fa 60%,#f9c0d8 100%)",boxShadow:"0 6px 24px rgba(220,80,140,.3)",display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none",zIndex:10,animation:"knifeFloat 2s ease-in-out infinite",fontSize:"clamp(28px,7vw,40px)"}}>🔪</div>
        }
        {cutCount===0&&!cutting&&(
          <div style={{position:"absolute",top:"28%",left:0,right:0,display:"flex",alignItems:"center",justifyContent:"center",gap:"4px",pointerEvents:"none",zIndex:5,opacity:.8}}>
            <span style={{fontSize:"26px",animation:"handSwipe 1.4s ease-in-out infinite"}}>👆</span>
            <span style={{display:"inline-block",width:"44px",height:"3px",background:"linear-gradient(90deg,#f080b8,transparent)",borderRadius:"2px",animation:"handSwipe 1.4s ease-in-out infinite",animationDelay:".1s"}}/>
          </div>
        )}
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
    {showCelebration&&<CelebrationStickers type="cake" onDone={onDone}/>}
  </>);
};

/* ════════════════════════════════════════
   SCREEN 8: BIRTHDAY
════════════════════════════════════════ */
const BirthdayScreen = ({onNext}) => {
  const [title,setTitle]=useState("");const [showInput,setShowInput]=useState(false);
  const [bdayVal,setBdayVal]=useState("");const [bdayError,setBdayError]=useState(false);
  const canvasRef=useRef(null);const rafRef=useRef(null);const enterTime=useRef(Date.now());const type=useTyping();
  useEffect(()=>{
    enterTime.current=Date.now();
    rafRef.current=launchConfetti(canvasRef.current);
    type(setTitle,"Happy Birthday, kukkapilla garuuuuu🫂🫂😘😘🙈",{charDelay:42},()=>setTimeout(()=>setShowInput(true),600));
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[]);
  const handleNext=()=>{
    const val=bdayVal.trim();
    if(!val){setBdayError(true);playWrong();setTimeout(()=>setBdayError(false),600);return;}
    const secs=Math.round((Date.now()-enterTime.current)/1000);
    ownerLog.add("birthday_reaction",`"${val}" · spent ${secs}s on this page`);
    playPop();setTimeout(()=>onNext(),300);
  };
  return (
    <Screen style={{position:"fixed",inset:0}}>
      <canvas ref={canvasRef} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}/>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"14px"}}>
        <h1 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontStyle:"italic",fontSize:"clamp(24px,5.5vw,46px)",color:"#d8368e",lineHeight:1.25,margin:0,minHeight:"2em"}}>{title}</h1>
        <div style={{animation:"floatY 2s ease-in-out infinite",filter:"drop-shadow(0 6px 14px rgba(220,80,140,.2))"}}><BirthdayKittySVG/></div>
        {showInput&&(
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"8px",width:"min(320px,88vw)"}}>
            <input value={bdayVal} onChange={e=>setBdayVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleNext()} placeholder="....." maxLength={120} autoComplete="off"
              style={{width:"100%",border:`2px solid ${bdayError?"#e040a0":"#f4a0c8"}`,borderRadius:"16px",padding:"12px 16px",fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,3.5vw,20px)",fontWeight:700,color:"#d8368e",background:"rgba(255,255,255,.85)",outline:"none",textAlign:"center",boxSizing:"border-box",animation:bdayError?"shakeInput .4s ease":"none",transition:"border-color .2s"}}
            />
            <Btn onClick={handleNext} style={{width:"100%",justifyContent:"center"}}>Next →</Btn>
          </div>
        )}
      </div>
    </Screen>
  );
};

function launchConfetti(canvas) {
  if(!canvas) return null;
  const ctx=canvas.getContext("2d");
  canvas.width=window.innerWidth;canvas.height=window.innerHeight;
  const colors=["#ff78b8","#ff3080","#f7c0dc","#ffacdf","#ffd0e8","#e040a0","#fff","#ffa0cc","#a78bfa","#fde047"];
  const pieces=Array.from({length:180},()=>({x:Math.random()*canvas.width,y:Math.random()*canvas.height-canvas.height,r:Math.random()*8+3,d:Math.random()*2.5+1.2,color:colors[Math.floor(Math.random()*colors.length)],tilt:Math.random()*Math.PI*2,ti:(Math.random()-.5)*.1}));
  let frame=0,rafId=null;
  const draw=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pieces.forEach(p=>{p.tilt+=p.ti;p.y+=p.d;if(p.y>canvas.height+20){p.y=-10;p.x=Math.random()*canvas.width;}ctx.beginPath();ctx.fillStyle=p.color;ctx.ellipse(p.x,p.y,p.r,p.r*.45,p.tilt,0,Math.PI*2);ctx.fill();});
    if(++frame<480)rafId=requestAnimationFrame(draw);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  };
  rafId=requestAnimationFrame(draw);
  return rafId;
}

/* ════════════════════════════════════════
   SCREEN 9: GALLERY
   CHANGES:
   - 3-tap on photo → show that photo's secret msg
   - Removed bottom proceed button
   - Proceed button now inline next to the input row
   - Input area moved slightly higher
════════════════════════════════════════ */
const GalleryScreen = ({onNext}) => {
  const [title,setTitle]=useState("");
  const [galIndex,setGalIndex]=useState(0);
  const [isAnimating,setIsAnimating]=useState(false);
  const [lightbox,setLightbox]=useState(null);
  const [caption,setCaption]=useState("");
  const [feelings,setFeelings]=useState(()=>Array(PHOTOS.length).fill(""));
  const [saved,setSaved]=useState(()=>Array(PHOTOS.length).fill(false));
  const [draft,setDraft]=useState("");
  const [inputShake,setInputShake]=useState(false);
  const [isTypingInput,setIsTypingInput]=useState(false);

  // Secret message state — 3 taps on active photo
  const [secretMsg,setSecretMsg]=useState(null); // {msg, label} or null
  const photoTapRef=useRef({count:0,timer:null,lastIndex:-1});

  const typingTimer=useRef(null);
  const autoRef=useRef(null);
  const touchStart=useRef(0);
  const type=useTyping();

  useEffect(()=>{
    type(setTitle,"The moments that makes me one 💖",{charDelay:42},()=>startAuto());
    return()=>clearInterval(autoRef.current);
  },[]);

  useEffect(()=>{
    setDraft(feelings[galIndex]);
    setCaption("");
    type(setCaption,PHOTOS[galIndex].label,{charDelay:35});
  },[galIndex]);

  const startAuto=()=>{clearInterval(autoRef.current);autoRef.current=setInterval(()=>{if(!isTypingInput)next();},3500);};
  const stopAuto=()=>clearInterval(autoRef.current);

  const next=()=>{if(isAnimating)return;setIsAnimating(true);setGalIndex(p=>(p+1)%PHOTOS.length);startAuto();setTimeout(()=>setIsAnimating(false),400);};
  const prev=()=>{if(isAnimating)return;setIsAnimating(true);setGalIndex(p=>(p-1+PHOTOS.length)%PHOTOS.length);startAuto();setTimeout(()=>setIsAnimating(false),400);};

  // 3-tap handler on the active photo
  const handlePhotoTap=(i)=>{
    if(i!==galIndex){next();return;}
    const t=photoTapRef.current;
    // reset count if tapping a different photo
    if(t.lastIndex!==i){t.count=0;t.lastIndex=i;}
    t.count++;
    clearTimeout(t.timer);
    t.timer=setTimeout(()=>{t.count=0;},1200);
    playTone(600+t.count*80,"triangle",.07,.15);
    if(t.count>=3){
      t.count=0;
      setSecretMsg({msg:PHOTOS[i].msg,label:PHOTOS[i].label});
      playPop();
      ownerLog.add("photo_secret",`Tapped photo ${i+1} 3× — saw secret`);
    }
  };

  const cardStyle=(i)=>{
    const total=PHOTOS.length,diff=((i-galIndex)%total+total)%total;
    if(diff===0) return{transform:"translateX(0) scale(1)",opacity:1,zIndex:10,pointerEvents:"all",boxShadow:"0 14px 40px rgba(180,60,120,.32)"};
    if(diff===1) return{transform:`rotate(${ROTATIONS[i%ROTATIONS.length]}deg) scale(.91) translateX(16px) translateY(6px)`,opacity:.6,zIndex:6,pointerEvents:"none"};
    if(diff===total-1) return{transform:`rotate(${-ROTATIONS[i%ROTATIONS.length]}deg) scale(.91) translateX(-16px) translateY(6px)`,opacity:.6,zIndex:6,pointerEvents:"none"};
    if(diff===2) return{transform:"rotate(6deg) scale(.83) translateX(24px) translateY(12px)",opacity:.28,zIndex:3,pointerEvents:"none"};
    if(diff===total-2) return{transform:"rotate(-6deg) scale(.83) translateX(-24px) translateY(12px)",opacity:.28,zIndex:3,pointerEvents:"none"};
    return{opacity:0,zIndex:0,pointerEvents:"none"};
  };

  const handleDraftChange=(val)=>{
    setDraft(val);setIsTypingInput(true);stopAuto();
    clearTimeout(typingTimer.current);
    typingTimer.current=setTimeout(()=>{setIsTypingInput(false);startAuto();},4000);
  };

  const saveCurrent=()=>{
    const val=draft.trim();
    if(!val){setInputShake(true);playWrong();setTimeout(()=>setInputShake(false),500);return;}
    const nf=[...feelings];nf[galIndex]=val;setFeelings(nf);
    const ns=[...saved];ns[galIndex]=true;setSaved(ns);
    ownerLog.add("photo_feeling",`Photo ${galIndex+1} "${PHOTOS[galIndex].label}": "${val}"`);
    playPop();
    setTimeout(()=>{
      const nextUnsaved=ns.findIndex((s,i)=>!s);
      if(nextUnsaved!==-1&&nextUnsaved!==galIndex){setIsAnimating(true);setGalIndex(nextUnsaved);setTimeout(()=>setIsAnimating(false),400);}
      startAuto();
    },600);
  };

  const handleNext=()=>{
    const val=draft.trim();
    if(val&&!saved[galIndex]){
      const nf=[...feelings];nf[galIndex]=val;
      const ns=[...saved];ns[galIndex]=true;
      ownerLog.add("photo_feeling",`Photo ${galIndex+1} "${PHOTOS[galIndex].label}": "${val}"`);
      setFeelings(nf);setSaved(ns);
    }
    playPop();onNext();
  };

  const savedCount=saved.filter(Boolean).length;
  const canProceed=savedCount===PHOTOS.length;

  return (
    <div style={{
      position:"fixed",inset:0,
      display:"flex",flexDirection:"column",alignItems:"center",
      padding:"5px 12px 10px",
      animation:"screenFadeIn .6s ease forwards",
    }}>
      {/* Title */}
      <h2 style={{
        fontFamily:"'Great Vibes',cursive",color:"#d1006f",
        fontSize:"clamp(13px,3.2vw,20px)",
        margin:"0 0 4px",flexShrink:0,lineHeight:1.1,
        textShadow:"0 0 8px rgba(255,100,160,.4)",
      }}>{title}</h2>

      {/* Photo stack — portrait ratio */}
      <div
        style={{
          position:"relative",
          width:"min(190px,48vw)",
          aspectRatio:"3/4",
          flexShrink:0,
          margin:"0 auto 4px",
          perspective:"700px",
        }}
        onTouchStart={e=>{touchStart.current=e.touches[0].clientX;}}
        onTouchEnd={e=>{const dx=e.changedTouches[0].clientX-touchStart.current;if(Math.abs(dx)>40){dx<0?next():prev();}}}
      >
        {PHOTOS.map((photo,i)=>(
          <div key={i}
            style={{
              position:"absolute",inset:0,
              background:"#fff",borderRadius:"10px",
              padding:"5px 5px 24px",
              boxShadow:"0 6px 22px rgba(180,60,120,.18)",
              transition:"transform .42s cubic-bezier(.34,1.5,.64,1),opacity .32s ease",
              willChange:"transform,opacity",
              cursor:i===galIndex?"pointer":"default",
              ...cardStyle(i),
            }}
            onClick={()=>handlePhotoTap(i)}
          >
            {/* checkmark if saved */}
            {saved[i]&&(
              <div style={{position:"absolute",top:"4px",right:"4px",width:"18px",height:"18px",borderRadius:"50%",background:"linear-gradient(135deg,#4caf50,#2e7d32)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:20,fontSize:"10px",boxShadow:"0 2px 5px rgba(0,0,0,.2)"}}>✓</div>
            )}
            {/* tap hint for active photo */}
            {i===galIndex&&(
              <div style={{position:"absolute",top:"4px",left:"4px",zIndex:20,background:"rgba(255,255,255,0.75)",borderRadius:"8px",padding:"2px 5px",fontFamily:"'Caveat',cursive",fontSize:"9px",color:"#c060a0",lineHeight:1.2,pointerEvents:"none"}}>
                3× tap 💗
              </div>
            )}
            <div style={{width:"100%",height:"calc(100% - 24px)",borderRadius:"6px",overflow:"hidden",background:"#fff8fc",position:"relative"}}>
              <img
                src={photo.src} alt={photo.label}
                style={{
                  width:"100%",height:"100%",
                  objectFit:"cover",
                  objectPosition:"center 15%",
                  display:"block",
                  transition:"filter 1.2s",
                  filter:i===galIndex?"saturate(1) brightness(1)":"saturate(.12) brightness(1.4)",
                }}
                onError={e=>{e.target.style.display="none";}}
              />
              <div style={{position:"absolute",inset:0,background:"rgba(255,240,248,.55)",opacity:i===galIndex?0:1,transition:"opacity 1s",pointerEvents:"none"}}/>
            </div>
            <div style={{position:"absolute",bottom:"4px",left:0,right:0,textAlign:"center",fontFamily:"'Caveat',cursive",fontSize:"clamp(9px,1.9vw,12px)",fontWeight:700,color:"#b05070",lineHeight:1,padding:"0 3px"}}>
              {i===galIndex ? caption : photo.label}
            </div>
          </div>
        ))}
      </div>

      {/* Nav dots row */}
      <div style={{display:"flex",alignItems:"center",gap:"5px",marginBottom:"3px",flexShrink:0}}>
        <button onClick={prev} style={{background:"linear-gradient(135deg,#f080b8,#e040a0)",border:"none",width:"26px",height:"26px",borderRadius:"50%",color:"#fff",fontSize:"15px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,boxShadow:"0 3px 10px rgba(220,70,140,.3)",lineHeight:1}}>‹</button>
        <div style={{display:"flex",gap:"2px",alignItems:"center",maxWidth:"52vw",overflow:"hidden"}}>
          {PHOTOS.map((_,i)=>(
            <div key={i}
              onClick={()=>{if(!isAnimating){setIsAnimating(true);setGalIndex(i);startAuto();setTimeout(()=>setIsAnimating(false),400);}}}
              style={{width:i===galIndex?"13px":"4px",height:"4px",borderRadius:"3px",background:saved[i]?"#4caf50":i===galIndex?"#e040a0":"#f4a0c8",transition:"all .3s cubic-bezier(.34,1.5,.64,1)",cursor:"pointer",flexShrink:0}}
            />
          ))}
        </div>
        <button onClick={next} style={{background:"linear-gradient(135deg,#f080b8,#e040a0)",border:"none",width:"26px",height:"26px",borderRadius:"50%",color:"#fff",fontSize:"15px",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,boxShadow:"0 3px 10px rgba(220,70,140,.3)",lineHeight:1}}>›</button>
      </div>

      {/* Status hint */}
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(10px,2.2vw,12px)",color:saved[galIndex]?"#4caf50":"#c07090",margin:"0 0 4px",textAlign:"center",lineHeight:1.2,flexShrink:0,fontWeight:saved[galIndex]?700:400}}>
        {saved[galIndex]?"✓ saved 💖":"tap pic 3× for a secret 💗 · write below to save"}
      </p>

      {/* ── INPUT ROW: [text input] [💖 save] [→ next] ── */}
      <div style={{display:"flex",gap:"5px",alignItems:"center",width:"min(340px,90vw)",flexShrink:0,marginBottom:"4px"}}>
        <input
          key={galIndex}
          value={draft}
          onChange={e=>handleDraftChange(e.target.value)}
          onFocus={()=>{setIsTypingInput(true);stopAuto();}}
          onBlur={()=>{clearTimeout(typingTimer.current);typingTimer.current=setTimeout(()=>{setIsTypingInput(false);startAuto();},3000);}}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();saveCurrent();}}}
          placeholder={saved[galIndex]?"💕 update...":"🙈 ee photo ki em?"}
          maxLength={140} autoComplete="off"
          style={{
            flex:1,
            border:`2px solid ${inputShake?"#e040a0":saved[galIndex]?"#4caf50":"#f4a0c8"}`,
            borderRadius:"14px",padding:"9px 11px",
            fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,3vw,16px)",fontWeight:700,
            color:"#d8368e",background:"#fff5fa",outline:"none",textAlign:"center",
            boxSizing:"border-box",transition:"border-color .25s",
            animation:inputShake?"shakeInput .4s ease":"none",
          }}
        />
        {/* Save button */}
        <button onClick={saveCurrent}
          style={{flexShrink:0,width:"34px",height:"34px",borderRadius:"50%",border:"none",
            background:draft.trim()?"linear-gradient(135deg,#f080b8,#e040a0)":"#f4d0e4",
            cursor:draft.trim()?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:"16px",boxShadow:draft.trim()?"0 3px 10px rgba(220,70,140,.3)":"none",transition:"all .2s"}}
        >{saved[galIndex]?"💾":"💖"}</button>
        {/* Next / proceed button — always visible, right next to save */}
        <button onClick={handleNext}
          style={{
            flexShrink:0,
            height:"34px",
            padding:"0 12px",
            borderRadius:"17px",
            border:"none",
            cursor:"pointer",
            fontFamily:"'Caveat',cursive",
            fontSize:"clamp(12px,2.8vw,15px)",
            fontWeight:800,
            color:"white",
            whiteSpace:"nowrap",
            display:"flex",alignItems:"center",gap:"4px",
            background:canProceed
              ?"linear-gradient(135deg,#f080b8,#e040a0)"
              :"linear-gradient(135deg,#f9c0d8,#f4a8c4)",
            boxShadow:canProceed
              ?"0 4px 14px rgba(220,70,140,.4)"
              :"0 2px 8px rgba(220,70,140,.15)",
            transition:"all .25s",
          }}
        >
          {canProceed ? "✉️ Next →" : `${savedCount}/${PHOTOS.length} →`}
        </button>
      </div>

      {/* Progress info */}
      <p style={{fontFamily:"'Caveat',cursive",fontSize:"10px",color:"#d0a0b8",margin:"0",textAlign:"center",flexShrink:0,opacity:.85}}>
        {savedCount}/{PHOTOS.length} saved {canProceed?"🎉 anni chesav!":"· save all to unlock next"}
      </p>

      {/* Secret message modal — shown on 3-tap */}
      {secretMsg&&(
        <div onClick={()=>setSecretMsg(null)}
          style={{position:"fixed",inset:0,background:"rgba(240,80,160,.22)",backdropFilter:"blur(10px)",zIndex:9100,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:"white",borderRadius:"28px",padding:"28px 24px",maxWidth:"340px",width:"88vw",boxShadow:"0 10px 48px rgba(220,70,140,.35)",border:"2.5px solid #f9c0d8",display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",animation:"popIn .4s cubic-bezier(.34,1.56,.64,1)"}}>
            <div style={{fontSize:"36px",animation:"hbeat 1.2s ease-in-out infinite"}}>💗</div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(13px,3vw,16px)",color:"#d8368e",textAlign:"center",opacity:.8}}>{secretMsg.label}</div>
            <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(15px,4vw,20px)",color:"#c060a0",textAlign:"center",lineHeight:1.6,margin:0}}>{secretMsg.msg}</p>
            <button onClick={()=>setSecretMsg(null)}
              style={{background:"linear-gradient(135deg,#f080b8,#e040a0)",border:"none",borderRadius:"20px",padding:"10px 24px",color:"white",fontFamily:"'Caveat',cursive",fontSize:"16px",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(220,70,140,.35)"}}>
              💖 Aww!
            </button>
          </div>
        </div>
      )}

      {/* Lightbox (double-click still works via photo element) */}
      {lightbox&&(
        <div onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.9)",zIndex:9500,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",cursor:"zoom-out"}}>
          <img src={lightbox} style={{maxWidth:"95vw",maxHeight:"92vh",objectFit:"contain",borderRadius:"8px"}} onClick={e=>e.stopPropagation()} alt="fullscreen"/>
          <div onClick={()=>setLightbox(null)} style={{position:"absolute",top:"16px",right:"20px",color:"white",fontSize:"32px",cursor:"pointer",background:"rgba(255,255,255,.15)",width:"40px",height:"40px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════
   SCREEN 10: LETTER
════════════════════════════════════════ */
const LetterScreen = ({onNext}) => {
  const [sealBroken,setSealBroken]=useState(false);
  const [letterTitle,setLetterTitle]=useState("");const [letterTyped,setLetterTyped]=useState("");
  const [showEnd,setShowEnd]=useState(false);const [showNextBtn,setShowNextBtn]=useState(false);
  const [scrollPct,setScrollPct]=useState(0);
  const [bowTaps,setBowTaps]=useState(0);
  const [bowEaster,setBowEaster]=useState(false);const [bowText,setBowText]=useState("");const [bowBtn,setBowBtn]=useState(false);
  const pressTimer=useRef(null);const type=useTyping();const boxRef=useRef(null);
  const startBreak=()=>{pressTimer.current=setTimeout(doBreak,LONG_PRESS);};
  const cancelBreak=()=>clearTimeout(pressTimer.current);
  const doBreak=()=>{
    setSealBroken(true);playPop();
    setTimeout(()=>{type(setLetterTitle,"Edho cheppa ante cheppali ante em ravatlee koni manchivi koni neeku nachanivi 💌",{charDelay:50},()=>startLetterType());},700);
  };
  const startLetterType=()=>{
    setLetterTyped("");setShowEnd(false);
    if(boxRef.current)boxRef.current.scrollTop=0;
    let i=0,acc="";
    const iv=setInterval(()=>{
      for(let c=0;c<4&&i<LETTER_TEXT.length;c++){acc+=LETTER_TEXT[i++];}
      setLetterTyped(acc);
      if(i>=LETTER_TEXT.length){clearInterval(iv);setShowEnd(true);setTimeout(()=>setShowNextBtn(true),600);}
    },30);
  };
  const onScroll=()=>{
    if(!boxRef.current)return;
    const{scrollTop,scrollHeight,clientHeight}=boxRef.current;
    setScrollPct(scrollHeight>clientHeight?scrollTop/(scrollHeight-clientHeight)*100:100);
  };
  const handleBowTap=()=>{
    const n=bowTaps+1;setBowTaps(n);playTone(600+n*40,"triangle",.08,.15);
    if(n>=5){setBowTaps(0);setBowEaster(true);setBowText("");setBowBtn(false);playPop();
      type(setBowText,"Oka secret- Idhi kanipettev ante emo max kani pettev ane anukuntunna I wanna say you as mine 🫂💖",{charDelay:38},()=>setTimeout(()=>setBowBtn(true),400));}
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
          <div onClick={handleBowTap} style={{fontSize:"20px",margin:"2px 0 6px",flexShrink:0,cursor:"pointer",userSelect:"none",transition:"transform .15s"}} title="Tap 5x for a secret 💗">💗</div>
          <div style={{position:"relative",width:"94vw",maxWidth:"680px",flex:1,minHeight:0,display:"flex"}}>
            <div style={{position:"absolute",left:0,top:0,bottom:0,width:"4px",borderRadius:"4px",background:"#f9d0e4",zIndex:2,flexShrink:0}}>
              <div style={{width:"100%",height:`${scrollPct}%`,background:"linear-gradient(180deg,#f080b8,#e040a0)",borderRadius:"4px",transition:"height .1s"}}/>
            </div>
            <div ref={boxRef} onScroll={onScroll} className="letter-scroll"
              style={{background:"#fff",borderRadius:"16px",padding:"clamp(16px,4vw,28px) clamp(18px,5vw,36px)",width:"100%",flex:1,minHeight:0,overflowY:"auto",overflowX:"hidden",boxShadow:"0 4px 24px rgba(200,70,130,.15)",fontFamily:"'Caveat',cursive",fontStyle:"italic",fontSize:"clamp(17px,3.2vw,22px)",color:"#d1006f",lineHeight:2,textAlign:"center",border:"2px solid #f9d0e4",position:"relative",marginLeft:"8px"}}>
              <p style={{margin:0,whiteSpace:"pre-wrap",position:"relative",zIndex:2}}>{letterTyped}</p>
              {showEnd&&<div style={{fontSize:"22px",margin:"6px 0",position:"relative",zIndex:2}}>💖</div>}
            </div>
          </div>
          {showNextBtn&&<Btn onClick={onNext} style={{marginTop:"10px",flexShrink:0}}>Continue ✨</Btn>}
        </div>
      )}
      {bowEaster&&(
        <Modal onBackdropClick={()=>setBowEaster(false)}>
          <div style={{fontSize:"40px"}}>💗✨</div>
          <h3 style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,color:"#d8368e",margin:0,fontSize:"20px"}}>A Hidden Note 💌</h3>
          <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,color:"#c070a0",textAlign:"center",lineHeight:1.6,fontSize:"clamp(15px,3.8vw,18px)",margin:0}}>{bowText}</p>
          {bowBtn&&<Btn onClick={()=>setBowEaster(false)}>💖</Btn>}
        </Modal>
      )}
    </Screen>
  );
};

/* ════════════════════════════════════════
   SCREEN 11: END CREDITS
════════════════════════════════════════ */
const CreditsScreen = ({onRestart}) => {
  const [phase,setPhase]=useState(0);
  const [feelingVal,setFeelingVal]=useState("");
  const [feelingSaved,setFeelingsSaved]=useState(false);
  const [feelingShake,setFeelingShake]=useState(false);
  const lines=[
    {text:"edho try cheysa nachithe ok ledha em cheyyalenu",size:"clamp(28px,6vw,52px)",font:"'Great Vibes',cursive",color:"#d1006f"},
    {text:"for the one and only my",size:"clamp(16px,3vw,24px)",font:"'Caveat',cursive",color:"#c070a0"},
    {text:"kukkapilla 🐾",size:"clamp(24px,5vw,42px)",font:"'Dancing Script',cursive",color:"#e040a0"},
    {text:"Happy 21st Birthday 🫂",size:"clamp(18px,4vw,32px)",font:"'Pacifico',cursive",color:"#f080b8"},
    {text:"- from you owner garuuu",size:"clamp(14px,2.8vw,20px)",font:"'Caveat',cursive",color:"#b05070"},
  ];
  useEffect(()=>{
    const timers=lines.map((_,i)=>setTimeout(()=>setPhase(p=>Math.max(p,i+1)),600+i*1100));
    const btnTimer=setTimeout(()=>setPhase(lines.length+1),600+lines.length*1100+800);
    return()=>{timers.forEach(clearTimeout);clearTimeout(btnTimer);};
  },[]);
  const saveFeeling=()=>{
    const val=feelingVal.trim();
    if(!val){setFeelingShake(true);playWrong();setTimeout(()=>setFeelingShake(false),500);return;}
    ownerLog.add("credits_feeling",`"${val}"`);
    playPop();setFeelingsSaved(true);
  };
  return (
    <Screen style={{background:"radial-gradient(ellipse at 50% 40%,#fff0f8,#ffd0ec 60%,#ffb8e0 100%)",overflowY:"auto",justifyContent:"flex-start",paddingTop:"clamp(20px,5vh,40px)",paddingBottom:"24px"}}>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"18px",width:"100%",maxWidth:"440px",margin:"0 auto"}}>
        {lines.map((l,i)=>(
          <div key={i} style={{opacity:phase>i?1:0,transform:phase>i?"translateY(0)":"translateY(24px)",transition:"opacity .9s ease,transform .9s ease",fontFamily:l.font,fontSize:l.size,color:l.color,textAlign:"center",textShadow:"0 2px 12px rgba(220,80,140,.2)"}}>
            {l.text}
          </div>
        ))}
        <div style={{opacity:phase>lines.length?1:0,transform:phase>lines.length?"translateY(0)":"translateY(30px)",transition:"opacity 1s ease .3s,transform 1s ease .3s",width:"100%",display:"flex",flexDirection:"column",alignItems:"center",gap:"10px",marginTop:"8px",padding:"0 8px"}}>
          {!feelingSaved ? (<>
            <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(14px,3.5vw,18px)",color:"#b05070",margin:0,textAlign:"center",lineHeight:1.4}}>
              em ayyina vunte cheppu i mean motham chadhivaka nee abhiprayam 💖<br/>
              <span style={{fontSize:"clamp(12px,2.8vw,14px)",opacity:.7}}>manditory em kaadhu but cheppali anipisthe cheppu endhuku ante idhi evaru chudaru kabati</span>
            </p>
            <textarea value={feelingVal} onChange={e=>setFeelingVal(e.target.value)} placeholder="" maxLength={300} rows={3}
              style={{width:"100%",border:`2px solid ${feelingShake?"#e040a0":"#f4a0c8"}`,borderRadius:"16px",padding:"12px 14px",fontFamily:"'Caveat',cursive",fontSize:"clamp(15px,3.5vw,19px)",fontWeight:700,color:"#d8368e",background:"rgba(255,255,255,.85)",outline:"none",resize:"none",boxSizing:"border-box",lineHeight:1.5,animation:feelingShake?"shakeInput .4s ease":"none",transition:"border-color .25s",boxShadow:"0 4px 20px rgba(220,80,140,.15)"}}
            />
            <Btn onClick={saveFeeling} style={{width:"100%",justifyContent:"center"}}>💖</Btn>
          </>) : (
            <div style={{background:"rgba(255,255,255,.7)",backdropFilter:"blur(8px)",borderRadius:"18px",padding:"16px 20px",textAlign:"center",border:"2px solid #f4a0c8",boxShadow:"0 4px 20px rgba(220,80,140,.15)"}}>
              <div style={{fontSize:"28px",marginBottom:"6px"}}>💖</div>
              <p style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(14px,3.5vw,18px)",color:"#d8368e",margin:"0 0 4px"}}>{feelingVal}</p>
              <p style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(12px,2.8vw,14px)",color:"#c07090",margin:0,opacity:.8}}>saved 💖 thank you for telling me</p>
            </div>
          )}
        </div>
        <div style={{opacity:phase>lines.length?1:0,transition:"opacity .9s ease",display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center",marginTop:"4px"}}>
          <Btn onClick={onRestart} variant="purple">malli chudali anipisthe chudochuuu..😒</Btn>
        </div>
      </div>
    </Screen>
  );
};

/* ════════════════════════════════════════
   OWNER PANEL
════════════════════════════════════════ */
const OwnerPanel = ({onClose}) => {
  const [log,setLog]=useState(ownerLog.get());
  const [activeTab,setActiveTab]=useState("story");
  useEffect(()=>{const iv=setInterval(()=>setLog(ownerLog.get()),2000);return()=>clearInterval(iv);},[]);
  const toSentence=(entry)=>{
    const v=entry.value;
    switch(entry.type){
      case "name_correct":      return{icon:"✅",color:"#2e7d32",bg:"#e8f5e9",sentence:`She got the name right! Typed ${v}`};
      case "name_wrong":        return{icon:"❌",color:"#c62828",bg:"#ffebee",sentence:`Wrong name attempt — she typed ${v}`};
      case "hint_opened":       return{icon:"💡",color:"#e65100",bg:"#fff3e0",sentence:"She clicked the hint button 😏"};
      case "hint_reply":        return{icon:"💬",color:"#ad1457",bg:"#fce4ec",sentence:`After seeing the hint: ${v}`};
      case "ante_isthe_reply":  return{icon:"💕",color:"#880e4f",bg:"#fce4ec",sentence:`Ante isthe reply: ${v}`};
      case "message_reaction":  return{icon:"💌",color:"#6a1b9a",bg:"#f3e5f5",sentence:`Birthday message reaction: ${v}`};
      case "birthday_reaction": return{icon:"🎂",color:"#bf360c",bg:"#fbe9e7",sentence:`Happy Birthday screen feeling: ${v}`};
      case "credits_feeling":   return{icon:"💖",color:"#880e4f",bg:"#fce4ec",sentence:`Final feeling at the end: ${v}`};
      case "easter_egg":        return{icon:"🐾",color:"#4527a0",bg:"#ede7f6",sentence:`Found a secret! ${v}`};
      case "photo_secret":      return{icon:"💗",color:"#c2185b",bg:"#fce4ec",sentence:`Saw photo secret: ${v}`};
      case "slide_time":        return{icon:"⏱️",color:"#0277bd",bg:"#e1f5fe",sentence:v};
      case "photo_feeling":     return{icon:"📸",color:"#880e4f",bg:"#fce4ec",sentence:v};
      case "bow_easter":        return{icon:"💗",color:"#c2185b",bg:"#fce4ec",sentence:"Tapped the bow 5 times!"};
      default:                  return{icon:"🔹",color:"#78909c",bg:"#f5f5f5",sentence:v};
    }
  };
  const SHOWN=new Set(["name_correct","name_wrong","hint_opened","hint_reply","ante_isthe_reply","message_reaction","birthday_reaction","credits_feeling","easter_egg","slide_time","photo_feeling","photo_secret","bow_easter"]);
  const filtered=log.filter(e=>SHOWN.has(e.type));
  const feelingsOnly=log.filter(e=>["hint_reply","ante_isthe_reply","message_reaction","birthday_reaction","credits_feeling","photo_feeling"].includes(e.type));
  const timelineOnly=log.filter(e=>e.type==="slide_time");
  const nameAttempts=log.filter(e=>e.type==="name_wrong").length;
  const gotItRight=log.some(e=>e.type==="name_correct");
  const photosDone=log.filter(e=>e.type==="photo_feeling").length;
  const secretsFound=log.filter(e=>e.type==="easter_egg"||e.type==="photo_secret").length;
  const TAB=(id,label,active)=>(<button onClick={()=>setActiveTab(id)} style={{flex:1,padding:"9px 4px",border:"none",borderRadius:"20px",fontFamily:"'Caveat',cursive",fontSize:"clamp(13px,2.8vw,16px)",fontWeight:700,cursor:"pointer",transition:"all .25s",background:active?"linear-gradient(135deg,#f080b8,#e040a0)":"transparent",color:active?"#fff":"#c070a0",boxShadow:active?"0 4px 14px rgba(220,70,140,.3)":"none"}}>{label}</button>);
  const STAT=({icon,label,value,color,bg})=>(<div style={{background:bg||"#fff5fa",borderRadius:"16px",padding:"10px 8px",flex:"1",textAlign:"center",border:`2px solid ${color}33`,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}}><div style={{fontSize:"18px",lineHeight:1}}>{icon}</div><div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(16px,4vw,22px)",color:color,lineHeight:1.1}}>{value}</div><div style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(10px,2vw,12px)",color:"#c090a0",fontWeight:700,lineHeight:1}}>{label}</div></div>);
  const CARD=({entry})=>{const{icon,color,bg,sentence}=toSentence(entry);return(<div style={{background:bg,borderRadius:"16px",padding:"10px 14px",display:"flex",gap:"10px",alignItems:"flex-start",border:`1.5px solid ${color}28`,animation:"screenFadeIn .4s ease"}}><span style={{fontSize:"18px",flexShrink:0,marginTop:"2px",lineHeight:1}}>{icon}</span><div style={{flex:1,minWidth:0}}><div style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(14px,3vw,17px)",color:color,wordBreak:"break-word",lineHeight:1.4}}>{sentence}</div></div><span style={{fontFamily:"'Caveat',cursive",fontSize:"11px",color:"#c0a0b0",flexShrink:0,marginTop:"3px",whiteSpace:"nowrap"}}>{entry.time}</span></div>);};
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(255,200,230,0.35)",backdropFilter:"blur(12px)",zIndex:99999,display:"flex",alignItems:"center",justifyContent:"center",padding:"14px"}}>
      <div style={{background:"linear-gradient(160deg,#fff5fb,#ffe8f4)",border:"2.5px solid #f4a0c8",borderRadius:"28px",padding:"20px",maxWidth:"500px",width:"96vw",maxHeight:"90vh",display:"flex",flexDirection:"column",gap:"12px",boxShadow:"0 12px 56px rgba(220,70,140,.22)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
          <div>
            <div style={{fontFamily:"'Baloo 2',cursive",fontWeight:800,fontSize:"clamp(18px,4vw,26px)",background:"linear-gradient(135deg,#f080b8,#c020a0)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",lineHeight:1.1}}>🔐 Owner's View</div>
            <div style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(11px,2.5vw,13px)",color:"#c090a0",marginTop:"2px"}}>🎵×5 to open · auto-refreshes every 2s</div>
          </div>
          <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
            <button onClick={()=>{ownerLog.clear();setLog([]);}} style={{background:"linear-gradient(135deg,#ff8a80,#e53935)",border:"none",color:"white",borderRadius:"14px",padding:"7px 12px",cursor:"pointer",fontFamily:"'Caveat',cursive",fontSize:"clamp(12px,2.5vw,14px)",fontWeight:700,boxShadow:"0 3px 10px rgba(229,57,53,.3)"}}>🗑 clear</button>
            <button onClick={onClose} style={{background:"linear-gradient(135deg,#f4a0c8,#e040a0)",border:"none",color:"white",borderRadius:"14px",padding:"7px 12px",cursor:"pointer",fontFamily:"'Caveat',cursive",fontSize:"clamp(12px,2.5vw,14px)",fontWeight:700,boxShadow:"0 3px 10px rgba(220,70,140,.3)"}}>✕ close</button>
          </div>
        </div>
        <div style={{height:"2px",borderRadius:"2px",background:"linear-gradient(90deg,#f4a0c8,#f080b8,#f4a0c8)",flexShrink:0}}/>
        <div style={{display:"flex",gap:"8px",flexShrink:0}}>
          <STAT icon="✍️" label="Name tries"  value={nameAttempts}                color="#c62828" bg="#ffebee"/>
          <STAT icon="✅" label="Got it right" value={gotItRight?"Yes!":"Not yet"} color={gotItRight?"#2e7d32":"#c62828"} bg={gotItRight?"#e8f5e9":"#ffebee"}/>
          <STAT icon="📸" label="Photos done" value={`${photosDone}/${PHOTOS.length}`} color="#ad1457" bg="#fce4ec"/>
          <STAT icon="🐾" label="Secrets"     value={secretsFound}                color="#4527a0" bg="#ede7f6"/>
        </div>
        <div style={{display:"flex",gap:"4px",background:"rgba(244,160,200,0.15)",borderRadius:"24px",padding:"4px",flexShrink:0}}>
          {TAB("story","📖 Story",activeTab==="story")}
          {TAB("feelings","💬 Her words",activeTab==="feelings")}
          {TAB("timeline","⏱ Time",activeTab==="timeline")}
        </div>
        {activeTab==="story"&&(
          <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:"8px",paddingRight:"2px"}}>
            {filtered.length===0
              ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",padding:"32px 16px"}}><div style={{fontSize:"48px",animation:"floatY 2s ease-in-out infinite"}}>💗</div><p style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"18px",color:"#c070a0",textAlign:"center",margin:0}}>Nothing yet!<br/>She hasn't started 💖</p></div>
              :[...filtered].reverse().map((entry,i)=><CARD key={i} entry={entry}/>)
            }
          </div>
        )}
        {activeTab==="feelings"&&(
          <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:"8px",paddingRight:"2px"}}>
            {feelingsOnly.length===0
              ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",padding:"32px 16px"}}><div style={{fontSize:"48px",animation:"floatY 2s ease-in-out infinite"}}>💬</div><p style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"18px",color:"#c070a0",textAlign:"center",margin:0}}>She hasn't typed anything yet 😊</p></div>
              :feelingsOnly.map((entry,i)=>{
                  const{icon,color,bg}=toSentence(entry);
                  const typeLabels={hint_reply:"Hint reply",ante_isthe_reply:"Ante isthe reply",message_reaction:"Birthday message",birthday_reaction:"Happy Birthday screen",credits_feeling:"Final feeling",photo_feeling:"Photo feeling"};
                  return(<div key={i} style={{background:bg,borderRadius:"18px",padding:"12px 16px",border:`1.5px solid ${color}33`}}><div style={{display:"flex",gap:"6px",alignItems:"center",marginBottom:"6px"}}><span style={{fontSize:"15px",lineHeight:1}}>{icon}</span><span style={{fontFamily:"'Caveat',cursive",fontSize:"clamp(11px,2.5vw,13px)",color:color,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.05em"}}>{typeLabels[entry.type]||""}</span><span style={{fontFamily:"'Caveat',cursive",fontSize:"11px",color:"#c0a0b0",marginLeft:"auto",whiteSpace:"nowrap"}}>{entry.time}</span></div><div style={{fontFamily:"'Dancing Script',cursive",fontWeight:700,fontSize:"clamp(16px,4vw,21px)",color:color,lineHeight:1.45,wordBreak:"break-word"}}>{entry.value}</div></div>);
                })
            }
          </div>
        )}
        {activeTab==="timeline"&&(
          <div style={{overflowY:"auto",flex:1,display:"flex",flexDirection:"column",gap:"8px",paddingRight:"2px"}}>
            {timelineOnly.length===0
              ?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"12px",padding:"32px 16px"}}><div style={{fontSize:"48px",animation:"floatY 2s ease-in-out infinite"}}>⏳</div><p style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"18px",color:"#c070a0",textAlign:"center",margin:0}}>No timing data yet!</p></div>
              :timelineOnly.map((entry,i)=>(<div key={i} style={{background:"#e1f5fe",borderRadius:"16px",padding:"10px 14px",display:"flex",gap:"10px",alignItems:"center",border:"1.5px solid #0277bd22"}}><span style={{fontSize:"18px",lineHeight:1,flexShrink:0}}>⏱️</span><span style={{fontFamily:"'Caveat',cursive",fontWeight:700,fontSize:"clamp(14px,3vw,17px)",color:"#0277bd",flex:1,lineHeight:1.3}}>{entry.value}</span><span style={{fontFamily:"'Caveat',cursive",fontSize:"11px",color:"#90caf9",flexShrink:0,whiteSpace:"nowrap"}}>{entry.time}</span></div>))
            }
          </div>
        )}
        <div style={{fontFamily:"'Caveat',cursive",fontSize:"12px",color:"#d4a0b8",textAlign:"center",flexShrink:0,opacity:.6}}>made with 💖 · secret panel</div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════
   MAIN APP
════════════════════════════════════════ */
export default function BirthdaySurprise() {
  const [screen,setScreen]=useState("unlock");
  const [bursts,setBursts]=useState([]);
  const [musicOn,setMusicOn]=useState(false);
  const [showOwner,setShowOwner]=useState(false);
  const audioRef=useRef(null);
  const musicTapRef=useRef({count:0,timer:null});

  const triggerBurst=useCallback((emojis=["🎉","💖","✨","💗","🎊","⭐"],count=16)=>{
    const nb=Array.from({length:count},(_,i)=>({id:Date.now()+i,emoji:emojis[Math.floor(Math.random()*emojis.length)],x:(10+Math.random()*80)+"vw",y:(20+Math.random()*60)+"vh",size:(18+Math.random()*22)+"px",delay:(Math.random()*.4)+"s"}));
    setBursts(nb);setTimeout(()=>setBursts([]),1400);
  },[]);

  const screenEnterTime=useRef(Date.now());
  const screenNameRef=useRef("unlock");

  const go=useCallback((s)=>{
    const elapsed=Date.now()-screenEnterTime.current;
    ownerLog.addScreenTime(screenNameRef.current,elapsed);
    screenEnterTime.current=Date.now();
    screenNameRef.current=s;
    setScreen(s);
    ownerLog.add("screen_visit",s);
  },[]);

  const startMusic=useCallback(()=>{
    if(audioRef.current){audioRef.current.play().catch(()=>{});setMusicOn(true);return;}
    const a=new Audio("photos/Urike_Urike.m4a");
    a.loop=true;a.volume=0;a.play().catch(()=>{});
    audioRef.current=a;setMusicOn(true);
    let v=0;const fade=setInterval(()=>{v=Math.min(v+0.015,0.3);a.volume=v;if(v>=0.3)clearInterval(fade);},150);
  },[]);

  const handleMusicBtn=()=>{
    const t=musicTapRef.current;t.count++;clearTimeout(t.timer);
    if(t.count>=5){t.count=0;setShowOwner(true);return;}
    t.timer=setTimeout(()=>{t.count=0;},2000);
    toggleMusic();
  };

  const toggleMusic=()=>{
    if(!audioRef.current){startMusic();return;}
    if(musicOn){audioRef.current.pause();setMusicOn(false);}
    else{audioRef.current.play().catch(()=>{});setMusicOn(true);}
  };

  const restart=()=>{
    if(audioRef.current){audioRef.current.pause();audioRef.current.currentTime=0;}
    setMusicOn(false);go("unlock");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Caveat:wght@600;700&family=Nunito:ital,wght@1,400;1,600&family=Dancing+Script:wght@600;700&family=Pacifico&family=Great+Vibes&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body,#root{height:100%;width:100%;overflow:hidden;}
        body{font-family:'Baloo 2',cursive;text-align:center;}
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
        @keyframes sparkleTrail   {0%{transform:translate(-50%,-50%) scale(1);opacity:1;}100%{transform:translate(-50%,-50%) scale(0) translateY(-20px);opacity:0;}}
        @keyframes handSwipe      {0%,100%{transform:translateX(-10px);opacity:.5;}50%{transform:translateX(16px);opacity:1;}}
        @keyframes shimmer        {0%{background-position:200% center;}100%{background-position:-200% center;}}
        @keyframes stickerBob     {0%{transform:translateX(0) translateY(0) rotate(-3deg);}100%{transform:translateX(0) translateY(-14px) rotate(3deg);}}
        @keyframes clapHand       {0%{transform:rotate(-20deg) scale(1);}100%{transform:rotate(20deg) scale(1.2) translateY(-6px);}}
        @keyframes celebBounce    {0%{transform:translateY(0) scale(1);}100%{transform:translateY(-14px) scale(1.2);}}

        .letter-scroll::-webkit-scrollbar{width:6px;}
        .letter-scroll::-webkit-scrollbar-track{background:#f9d0e4;border-radius:4px;}
        .letter-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#f080b8,#e040a0);border-radius:4px;}
        .letter-scroll{scrollbar-color:#f080b8 #f9d0e4;scrollbar-width:thin;}
      `}</style>

      <Petals/>
      <EmojiBurst bursts={bursts}/>
      <SparkleCursor/>

      <button onClick={handleMusicBtn} style={{position:"fixed",top:"12px",right:"12px",zIndex:9999,width:"42px",height:"42px",borderRadius:"50%",background:"linear-gradient(135deg,#f4a0c8,#e040a0)",border:"none",cursor:"pointer",fontSize:"17px",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 16px rgba(220,70,140,.35)",padding:0,transition:"transform .2s"}}>
        {musicOn?"🔇":"🎵"}
      </button>

      {showOwner&&<OwnerPanel onClose={()=>setShowOwner(false)}/>}

      {screen==="unlock"    &&<UnlockScreen    onOpen={()=>go("anteIsthe")} onFirstTap={startMusic}/>}
      {screen==="anteIsthe" &&<AnteIshtheScreen onNext={()=>go("nameEntry")}/>}
      {screen==="nameEntry" &&<NameEntryScreen  onSuccess={()=>go("countdown")} triggerBurst={triggerBurst}/>}
      {screen==="countdown" &&<CountdownScreen  onDone={()=>go("loading")}/>}
      {screen==="loading"   &&<LoadingScreen    onDone={()=>go("message")}/>}
      {screen==="message"   &&<MessageScreen    onNext={()=>go("candles")}/>}
      {screen==="candles"   &&<CandleScreen     onDone={()=>go("cake")} triggerBurst={triggerBurst}/>}
      {screen==="cake"      &&<CakeScreen       onDone={()=>go("birthday")} triggerBurst={triggerBurst}/>}
      {screen==="birthday"  &&<BirthdayScreen   onNext={()=>go("gallery")}/>}
      {screen==="gallery"   &&<GalleryScreen    onNext={()=>go("letter")}/>}
      {screen==="letter"    &&<LetterScreen     onNext={()=>go("credits")}/>}
      {screen==="credits"   &&<CreditsScreen    onRestart={restart}/>}
    </>
  );
}