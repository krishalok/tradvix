import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════
   TRADVIX — AI STOCK INTELLIGENCE
   The World's First AI Stock Analyst in Your Pocket
   Powered by ARIA (Advanced Risk Intelligence Analyst)
   © 2026 TRADVIX. All rights reserved.
═══════════════════════════════════════════════════════════════ */

// ── STYLES ──────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  :root {
    --black:   #050608;
    --dark:    #080b0f;
    --card:    #0d1117;
    --card2:   #111820;
    --border:  rgba(0,255,102,0.08);
    --border2: rgba(0,255,102,0.16);
    --green:   #00ff66;
    --green2:  #00cc52;
    --glow:    rgba(0,255,102,0.18);
    --red:     #ff2d55;
    --red2:    #cc2444;
    --amber:   #ffbe0b;
    --blue:    #0a84ff;
    --text:    #e8f0e8;
    --muted:   #3d5c3d;
    --muted2:  #6b9b6b;
    --safe-t:  env(safe-area-inset-top, 44px);
    --safe-b:  env(safe-area-inset-bottom, 20px);
  }

  html, body { height: 100%; background: var(--black); overflow: hidden; }
  body { font-family: 'Syne', sans-serif; color: var(--text); height: 100dvh; display: flex; flex-direction: column; padding-top: var(--safe-t); }
  * { scrollbar-width: none; }
  *::-webkit-scrollbar { display: none; }

  /* ── NOISE TEXTURE OVERLAY ── */
  body::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
    background-size: 128px; pointer-events: none; z-index: 0; opacity: 0.4;
  }

  /* ── SCANLINES ── */
  body::after {
    content: ''; position: fixed; inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,102,0.01) 2px, rgba(0,255,102,0.01) 4px);
    pointer-events: none; z-index: 0;
  }

  /* ── HEADER ── */
  .hdr {
    height: 54px; background: rgba(5,6,8,0.95); border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 16px; flex-shrink: 0; position: relative; z-index: 50;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  }

  /* ── LOGO ── */
  .logo-wrap { display: flex; align-items: center; gap: 10px; }
  .logo-mark {
    width: 34px; height: 34px; border-radius: 9px;
    background: linear-gradient(135deg, var(--green), var(--green2));
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px var(--glow);
    font-family: 'IBM Plex Mono', monospace; font-size: 14px; font-weight: 600; color: #000;
  }
  .logo-text {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 18px;
    letter-spacing: 3px; color: var(--text);
  }
  .logo-text span { color: var(--green); }

  /* ── LIVE INDICATOR ── */
  .live-wrap { display: flex; align-items: center; gap: 8px; }
  .live-pill {
    display: flex; align-items: center; gap: 5px;
    background: rgba(0,255,102,0.06); border: 1px solid rgba(0,255,102,0.18);
    border-radius: 20px; padding: 3px 10px;
    font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--green); letter-spacing: 1.5px;
  }
  .live-dot {
    width: 5px; height: 5px; border-radius: 50%; background: var(--green);
    box-shadow: 0 0 8px var(--green); animation: pulse 1.6s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.7)} }

  /* ── PAGES ── */
  .pages { flex: 1; overflow: hidden; position: relative; z-index: 1; }
  .page { position: absolute; inset: 0; overflow-y: auto; padding-bottom: calc(64px + var(--safe-b)); display: none; }
  .page.active { display: block; animation: fadeUp .22s ease; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }

  /* ── TAB BAR ── */
  .tabbar {
    height: calc(64px + var(--safe-b)); background: rgba(5,6,8,0.97);
    border-top: 1px solid var(--border); display: flex; padding-bottom: var(--safe-b);
    flex-shrink: 0; position: relative; z-index: 50;
    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
  }
  .tb { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; cursor:pointer; transition:opacity .15s; }
  .tb:not(.active){opacity:.35}
  .tb-icon { font-size: 20px; line-height: 1; transition: transform .2s; }
  .tb.active .tb-icon { transform: scale(1.12); }
  .tb-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 8px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted2); }
  .tb.active .tb-lbl { color: var(--green); }
  .tb-bar { position:absolute; top:0; left:20%; right:20%; height:2px; background:var(--green); border-radius:0 0 3px 3px; box-shadow: 0 0 8px var(--green); opacity:0; }
  .tb.active .tb-bar { opacity:1; }

  /* ── SECTION LABEL ── */
  .sec-lbl {
    font-family: 'IBM Plex Mono', monospace; font-size: 9px; font-weight: 600;
    letter-spacing: 3px; color: var(--muted2); text-transform: uppercase;
    display: flex; align-items: center; gap: 8px;
  }
  .sec-lbl::before { content:''; width:2px; height:12px; background:var(--green); border-radius:1px; box-shadow:0 0 6px var(--green); flex-shrink:0; }

  /* ── CARD ── */
  .card {
    background: var(--card); border: 1px solid var(--border); border-radius: 16px; overflow: hidden;
  }
  .card-glass {
    background: rgba(13,17,23,0.7); backdrop-filter: blur(20px);
    border: 1px solid var(--border); border-radius: 16px;
  }

  /* ── TRADVIX SCORE RING ── */
  .score-ring { position: relative; display: inline-flex; align-items: center; justify-content: center; }
  .score-val {
    position: absolute; text-align: center;
    font-family: 'IBM Plex Mono', monospace; font-weight: 600;
  }

  /* ── STOCK ROW ── */
  .srow {
    display: flex; align-items: center; padding: 13px 16px;
    border-bottom: 1px solid rgba(0,255,102,0.05); cursor: pointer; gap: 12px;
    transition: background .1s; position: relative; overflow: hidden;
  }
  .srow::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; opacity:0; transition:opacity .2s; }
  .srow:hover, .srow:active { background: rgba(0,255,102,0.03); }
  .srow.bull::before { background: var(--green); opacity:1; }
  .srow.bear::before { background: var(--red); opacity:1; }
  .srow:last-child { border-bottom: none; }

  /* ── ARIA CHAT BUBBLE ── */
  .aria-bubble {
    background: linear-gradient(135deg, rgba(0,255,102,0.06), rgba(0,204,82,0.04));
    border: 1px solid rgba(0,255,102,0.15); border-radius: 0 16px 16px 16px;
    padding: 14px 16px; position: relative;
    font-family: 'Instrument Serif', serif; font-size: 14px; line-height: 1.65; color: var(--text);
  }
  .aria-bubble::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, var(--green), transparent);
    border-radius: 16px 16px 0 0;
  }

  /* ── ARIA AVATAR ── */
  .aria-avatar {
    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
    background: linear-gradient(135deg, var(--green), var(--green2));
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; box-shadow: 0 0 16px var(--glow);
    font-family: 'IBM Plex Mono', monospace; font-weight: 700; color: #000; font-size: 12px;
  }

  /* ── RADAR (SVG based) ── */
  .radar-wrap { display: flex; align-items: center; justify-content: center; }

  /* ── SCORE BADGE ── */
  .score-badge {
    font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700;
    padding: 3px 9px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; flex-shrink: 0;
  }
  .score-sb { background: rgba(0,255,102,0.1); color: var(--green); border: 1px solid rgba(0,255,102,0.25); }
  .score-b  { background: rgba(0,255,102,0.07); color: #66ff99; border: 1px solid rgba(0,255,102,0.15); }
  .score-h  { background: rgba(255,190,11,0.08); color: var(--amber); border: 1px solid rgba(255,190,11,0.2); }
  .score-s  { background: rgba(255,45,85,0.08); color: #ff7088; border: 1px solid rgba(255,45,85,0.15); }
  .score-ss { background: rgba(255,45,85,0.12); color: var(--red); border: 1px solid rgba(255,45,85,0.25); }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: calc(70px + var(--safe-b)); left: 50%; transform: translateX(-50%) translateY(12px);
    background: var(--card2); border: 1px solid var(--border2); border-radius: 24px;
    padding: 10px 20px; font-family: 'IBM Plex Mono', monospace; font-size: 11px;
    color: var(--text); z-index: 700; white-space: nowrap;
    opacity: 0; transition: all .3s ease; pointer-events: none;
  }
  .toast.show { opacity:1; transform:translateX(-50%) translateY(0); }

  /* ── SHEET ── */
  .sheet-ov {
    position: fixed; inset: 0; background: rgba(0,0,0,.85); z-index: 400;
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    display: none; align-items: flex-end;
  }
  .sheet-ov.open { display: flex; }
  .sheet {
    background: var(--dark); border: 1px solid var(--border2);
    border-radius: 26px 26px 0 0; border-bottom: none;
    width: 100%; max-height: 93dvh; overflow-y: auto;
    animation: sheetUp .32s cubic-bezier(.32,1.06,.64,1);
    padding-bottom: calc(var(--safe-b) + 20px);
  }
  @keyframes sheetUp { from{transform:translateY(100%);opacity:0} to{transform:none;opacity:1} }
  .sheet-handle { width: 38px; height: 4px; background: rgba(255,255,255,.15); border-radius: 2px; margin: 13px auto 0; }

  /* ── TYPEWRITER ── */
  @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
  .cursor { display:inline-block; width:2px; height:1em; background:var(--green); vertical-align:text-bottom; animation:blink 1s step-end infinite; margin-left:2px; }

  /* ── FLASH ── */
  @keyframes flashG { 0%{background:rgba(0,255,102,0.12)} 100%{background:transparent} }
  @keyframes flashR { 0%{background:rgba(255,45,85,0.12)} 100%{background:transparent} }
  .flash-g { animation: flashG 1.5s ease; }
  .flash-r { animation: flashR 1.5s ease; }

  /* ── NUMBER TICK ── */
  @keyframes numUp { from{transform:translateY(8px);opacity:0} to{transform:none;opacity:1} }
  .tick { animation: numUp .25s ease; }

  /* ── HIDDEN GEMS CARD ── */
  .gem-card {
    background: linear-gradient(135deg, rgba(13,17,23,.9), rgba(17,24,32,.9));
    border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px;
    position: relative; overflow: hidden; cursor: pointer;
    transition: transform .15s, box-shadow .15s;
  }
  .gem-card:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,255,102,0.08); }
  .gem-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--green),transparent); }

  /* ── PROGRESS BAR ── */
  .prog-bar { height: 4px; background: rgba(0,255,102,0.08); border-radius: 2px; overflow: hidden; }
  .prog-fill { height: 100%; background: linear-gradient(90deg, var(--green), var(--green2)); border-radius: 2px; transition: width .4s ease; }

  /* ── TRADVIX SCORE METER ── */
  .meter-wrap {
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    padding: 10px 14px; display: flex; align-items: center; gap: 10px;
  }
  .meter-bar { flex: 1; height: 6px; background: rgba(255,255,255,.05); border-radius: 3px; overflow: hidden; }

  /* ── GLITCH TITLE ── */
  @keyframes glitch1 { 0%,100%{clip-path:none;transform:none} 33%{clip-path:inset(10% 0 80% 0);transform:translateX(-2px)} 66%{clip-path:inset(60% 0 20% 0);transform:translateX(2px)} }
  @keyframes glitch2 { 0%,100%{clip-path:none;transform:none} 33%{clip-path:inset(60% 0 20% 0);transform:translateX(2px)} 66%{clip-path:inset(10% 0 80% 0);transform:translateX(-2px)} }

  /* ── INDEX CHIP ── */
  .idx-chip {
    background: var(--card); border: 1px solid var(--border); border-radius: 13px;
    padding: 10px 14px; min-width: 100px; flex-shrink: 0; transition: border-color .3s;
  }
  .idx-chip.up { border-color: rgba(0,255,102,0.2); }
  .idx-chip.dn { border-color: rgba(255,45,85,0.2); }
`;

// ── DATA ────────────────────────────────────────────────────────
const STOCKS = [
  {s:"NVDA", n:"NVIDIA Corp",        sec:"tech",     e:"⚡"},
  {s:"AAPL", n:"Apple Inc",          sec:"tech",     e:"🍎"},
  {s:"MSFT", n:"Microsoft Corp",     sec:"tech",     e:"🪟"},
  {s:"GOOGL",n:"Alphabet Inc",       sec:"tech",     e:"🔍"},
  {s:"AMZN", n:"Amazon.com",         sec:"tech",     e:"📦"},
  {s:"META", n:"Meta Platforms",     sec:"tech",     e:"📘"},
  {s:"TSLA", n:"Tesla Inc",          sec:"tech",     e:"🚗"},
  {s:"AVGO", n:"Broadcom Inc",       sec:"tech",     e:"🔧"},
  {s:"AMD",  n:"Advanced Micro Dev", sec:"tech",     e:"💻"},
  {s:"NFLX", n:"Netflix Inc",        sec:"tech",     e:"🎬"},
  {s:"JPM",  n:"JPMorgan Chase",     sec:"finance",  e:"🏦"},
  {s:"GS",   n:"Goldman Sachs",      sec:"finance",  e:"💼"},
  {s:"V",    n:"Visa Inc",           sec:"finance",  e:"💳"},
  {s:"MA",   n:"Mastercard Inc",     sec:"finance",  e:"🔴"},
  {s:"BAC",  n:"Bank of America",    sec:"finance",  e:"🏛️"},
  {s:"XOM",  n:"Exxon Mobil",        sec:"energy",   e:"🛢️"},
  {s:"CVX",  n:"Chevron Corp",       sec:"energy",   e:"⛽"},
  {s:"LLY",  n:"Eli Lilly",          sec:"health",   e:"🧬"},
  {s:"JNJ",  n:"Johnson & Johnson",  sec:"health",   e:"💊"},
  {s:"UNH",  n:"UnitedHealth",       sec:"health",   e:"🏥"},
  {s:"WMT",  n:"Walmart Inc",        sec:"consumer", e:"🛒"},
  {s:"COST", n:"Costco Wholesale",   sec:"consumer", e:"🏪"},
  {s:"HD",   n:"Home Depot",         sec:"consumer", e:"🔨"},
  {s:"NKE",  n:"Nike Inc",           sec:"consumer", e:"👟"},
  {s:"BA",   n:"Boeing Co",          sec:"industrial",e:"✈️"},
  {s:"CAT",  n:"Caterpillar Inc",    sec:"industrial",e:"🚜"},
  {s:"DIS",  n:"Walt Disney Co",     sec:"consumer", e:"🏰"},
];

const IDXS = [{s:"SPY",n:"S&P 500"},{s:"QQQ",n:"NASDAQ"},{s:"DIA",n:"DOW"}];

// ── SEEDED RNG (consistent per day per stock) ────────────────────
function mkRng(seed){
  let h=0; for(const c of String(seed)) h=(h*31+c.charCodeAt(0))>>>0;
  return()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296;};
}

// ── GENERATE RICH DEMO DATA ──────────────────────────────────────
const BASE_PRICES = {
  NVDA:875,AAPL:185,MSFT:415,GOOGL:178,AMZN:198,META:502,TSLA:248,
  AVGO:1402,AMD:158,NFLX:698,JPM:228,GS:508,V:290,MA:486,BAC:41,
  XOM:118,CVX:157,LLY:875,JNJ:152,UNH:585,WMT:92,COST:895,HD:394,
  NKE:73,BA:168,CAT:857,DIS:108,
  SPY:584,QQQ:492,DIA:432,
};

function generateData(){
  const day=new Date().toDateString();
  const out={};
  [...STOCKS,...IDXS].forEach(st=>{
    const r=mkRng(st.s+day);
    const isIdx=IDXS.some(i=>i.s===st.s);
    const range=isIdx?2.2:8.5;
    const dp=(r()-0.44)*range;
    const base=BASE_PRICES[st.s]||100;
    const pc=base;
    const c=+(pc*(1+dp/100)).toFixed(2);
    const o=+(pc*(1+(r()-0.5)*0.008)).toFixed(2);
    // Build 60-day history
    const hist=[];let cur=pc*0.88;
    for(let i=0;i<60;i++){cur=+(cur*(1+(r()-0.47)*0.025)).toFixed(2);hist.push(cur);}
    hist.push(c);
    out[st.s]={
      c,dp:+dp.toFixed(2),d:+(c-pc).toFixed(2),
      o,h:+(Math.max(o,c)*(1+r()*.007)).toFixed(2),
      l:+(Math.min(o,c)*(1-r()*.007)).toFixed(2),
      pc,v:Math.round((r()*40+3)*1e6),
      hist,name:st.n||st.s,
    };
  });
  return out;
}

// ── TECHNICAL INDICATORS ────────────────────────────────────────
function calcRSI(c,n=14){
  if(!c||c.length<n+1)return null;
  let g=0,l=0;
  for(let i=1;i<=n;i++){const d=c[i]-c[i-1];d>0?g+=d:l+=Math.abs(d);}
  let ag=g/n,al=l/n;
  for(let i=n+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(n-1)+(d>0?d:0))/n;al=(al*(n-1)+(d<0?Math.abs(d):0))/n;}
  return al===0?100:+(100-100/(1+ag/al)).toFixed(1);
}
function calcEMA(a,n){if(!a||a.length<n)return null;const k=2/(n+1);let e=a.slice(0,n).reduce((s,v)=>s+v,0)/n;for(let i=n;i<a.length;i++)e=a[i]*k+e*(1-k);return +e.toFixed(2);}
function calcSMA(a,n){if(!a||a.length<n)return null;return +(a.slice(-n).reduce((s,v)=>s+v,0)/n).toFixed(2);}
function calcBoll(c,n=20){if(!c||c.length<n)return null;const m=calcSMA(c,n),std=Math.sqrt(c.slice(-n).reduce((s,v)=>s+(v-m)**2,0)/n);return{u:+(m+2*std).toFixed(2),l:+(m-2*std).toFixed(2),m};}

// ── TRADVIX SCORE ENGINE ─────────────────────────────────────────
function computeTRADVIXScore(sym, q){
  if(!q)return null;
  const c=q.hist, p=q.c;
  const rsi=calcRSI(c);
  const sma50=calcSMA(c,Math.min(50,c.length));
  const sma20=calcSMA(c,Math.min(20,c.length));
  const ema12=calcEMA(c,Math.min(12,c.length));
  const ema26=calcEMA(c,Math.min(26,c.length));
  const macd=ema12&&ema26?+(ema12-ema26).toFixed(3):null;
  const boll=calcBoll(c);

  // Six dimensions (0-100 each)
  let momentum=50, value=50, growth=50, safety=50, sentiment=50, technical=50;

  if(rsi){
    technical+=rsi<30?30:rsi<40?15:rsi>70?-30:rsi>60?-15:5;
    sentiment+=rsi<35?20:rsi>65?-20:0;
  }
  if(macd){technical+=macd>0?20:-20;momentum+=macd>0?25:-25;}
  if(sma50){
    const diff=((p-sma50)/sma50)*100;
    momentum+=diff>0?Math.min(20,diff*2):-Math.min(20,Math.abs(diff)*2);
    growth+=diff>5?15:diff>0?8:diff>-5?-8:-15;
  }
  if(sma20){momentum+=p>sma20?15:-15;}
  if(boll){
    if(p<boll.l){safety+=20;value+=25;}
    else if(p>boll.u){safety-=20;value-=15;}
    else{safety+=8;}
  }
  // Volatility
  if(c.length>10){
    const vol=Math.abs(c[c.length-1]-c[c.length-10])/c[c.length-10];
    safety-=vol>0.15?20:vol>0.08?10:0;
  }
  // Today's momentum
  sentiment+=q.dp>3?15:q.dp>0?8:q.dp<-3?-15:-8;
  momentum+=q.dp>2?12:q.dp>0?5:q.dp<-2?-12:-5;

  // Clamp all
  const clamp=(v)=>Math.max(10,Math.min(95,Math.round(v)));
  const dims={momentum:clamp(momentum),value:clamp(value),growth:clamp(growth),safety:clamp(safety),sentiment:clamp(sentiment),technical:clamp(technical)};
  const total=Math.round(Object.values(dims).reduce((a,b)=>a+b,0)/6);

  let dec,decClass,emoji,color,brief;
  if(total>=72){dec="STRONG BUY";decClass="score-sb";emoji="🚀";color:"#00ff66";brief=`Exceptional setup across all 6 TRADVIX dimensions. High conviction.`;}
  else if(total>=58){dec="BUY";decClass="score-b";emoji="✅";color="#66ff99";brief=`Above-average signals. Favorable risk/reward. Consider entry.`;}
  else if(total>=44){dec="HOLD";decClass="score-h";emoji="⏸️";color="#ffbe0b";brief=`Balanced signals. No strong edge either way. Hold and monitor.`;}
  else if(total>=30){dec="SELL";decClass="score-s";emoji="⚠️";color="#ff7088";brief=`Below-average setup. Risk outweighs reward at current levels.`;}
  else{dec="STRONG SELL";decClass="score-ss";emoji="🔴";color="#ff2d55";brief=`Multiple dimensions in danger zone. Exit or avoid.`;}

  // AI price targets
  const bias=(total-50)/500;
  const vol2=c.length>5?Math.abs(c[c.length-1]-c[c.length-6])/c[c.length-6]:0.04;
  const targets={"1W":+(p*(1+bias*.1+vol2*.05)).toFixed(2),"1M":+(p*(1+bias*.4+vol2*.1)).toFixed(2),"3M":+(p*(1+bias*1.0+vol2*.2)).toFixed(2),"6M":+(p*(1+bias*1.8+vol2*.3)).toFixed(2),"1Y":+(p*(1+bias*3.0+vol2*.4)).toFixed(2)};

  // ARIA briefing
  const ariaLines=[
    total>=72?`${sym} is firing on all cylinders right now.`:`${sym} is showing ${total>=50?"mixed positive":"concerning"} signals.`,
    rsi&&rsi<35?`RSI at ${rsi} — deeply oversold and historically this is where smart money enters.`:rsi&&rsi>68?`RSI at ${rsi} — elevated. The easy money may already be made.`:`RSI sits at ${rsi||"N/A"} — reasonable territory.`,
    sma50?p>sma50?`Trading ${((p-sma50)/sma50*100).toFixed(1)}% above its 50-day average — trend is your friend here.`:`Trading ${((sma50-p)/sma50*100).toFixed(1)}% below the 50-day average — trend still against it.`:"",
    total>=58?`My call: this is a ${dec}. ${brief}`:`My call: ${dec}. ${brief}`,
  ].filter(Boolean).join(" ");

  return{total,dims,dec,decClass,emoji,color,brief,targets,ariaLines,rsi,sma50,sma20,macd,boll};
}

// ── ARIA MESSAGES ───────────────────────────────────────────────
function getARIAMorningBrief(data, scores){
  const now=new Date();
  const h=now.getHours();
  const greeting=h<12?"Good morning":"Good afternoon";
  const allScores=Object.entries(scores).filter(([,s])=>s).map(([sym,s])=>({sym,score:s.total,dp:data[sym]?.dp||0}));
  const topBuy=allScores.sort((a,b)=>b.score-a.score)[0];
  const topSell=allScores.sort((a,b)=>a.score-b.score)[0];
  const advancing=Object.values(data).filter(q=>q.dp>0).length;
  const mood=advancing>STOCKS.length*0.6?"bullish":advancing<STOCKS.length*0.4?"defensive":"mixed";
  return[
    `${greeting}. I've scanned ${STOCKS.length} major stocks and here's what I see.`,
    `Market mood: **${mood.toUpperCase()}**. ${advancing} of ${STOCKS.length} stocks are advancing today.`,
    topBuy?`Top pick: **${topBuy.sym}** has my highest TRADVIX Score today — worth a close look.`:"",
    topSell?`Watch out: **${topSell.sym}** is showing the weakest signals across my 6 dimensions.`:"",
    `Stay sharp. I'll update as conditions change.`,
  ].filter(Boolean);
}

// ── FORMAT HELPERS ──────────────────────────────────────────────
const fp=p=>!p&&p!==0?"--":p>=1000?"$"+p.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}):"$"+p.toFixed(2);
const fc=dp=>dp==null?"--":(dp>=0?"+":"")+dp.toFixed(2)+"%";
const fv=v=>!v?"N/A":v>=1e9?(v/1e9).toFixed(1)+"B":v>=1e6?(v/1e6).toFixed(1)+"M":(v/1e3).toFixed(0)+"K";

// ── SPARKLINE ───────────────────────────────────────────────────
function Spark({data,color="#00ff66",w=54,h=28}){
  if(!data||data.length<2)return<div style={{width:w,height:h}}/>;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1)*w).toFixed(1)},${(h-((v-mn)/rng)*h*.84-h*.08).toFixed(1)}`).join(" ");
  return(<svg width={w} height={h} style={{display:"block",overflow:"visible"}}>
    <defs><linearGradient id={`sg${w}${h}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${w}${h})`}/>
    <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);
}

// ── RADAR CHART ─────────────────────────────────────────────────
function RadarChart({dims,size=160}){
  if(!dims)return null;
  const labels=["Momentum","Value","Growth","Safety","Sentiment","Technical"];
  const values=[dims.momentum,dims.value,dims.growth,dims.safety,dims.sentiment,dims.technical];
  const n=6,cx=size/2,cy=size/2,r=size*0.38;
  const angle=(i)=>(-Math.PI/2+i*2*Math.PI/n);
  const pt=(i,val)=>{const a=angle(i),rr=r*val/100;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};};
  const gridPts=(level)=>Array.from({length:n},(_,i)=>{const a=angle(i),rr=r*level/100;return`${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`;}).join(" ");
  const dataPts=values.map((v,i)=>{const p=pt(i,v);return`${p.x},${p.y}`;}).join(" ");
  const labelPts=Array.from({length:n},(_,i)=>{const a=angle(i),rr=r*1.28;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a),label:labels[i]};});
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <linearGradient id="rgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00ff66" stopOpacity=".4"/>
          <stop offset="100%" stopColor="#00cc52" stopOpacity=".15"/>
        </linearGradient>
      </defs>
      {[20,40,60,80,100].map(l=><polygon key={l} points={gridPts(l)} fill="none" stroke="rgba(0,255,102,0.08)" strokeWidth="1"/>)}
      {Array.from({length:n},(_,i)=>{const a=angle(i);return<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="rgba(0,255,102,0.1)" strokeWidth="1"/>;}).filter(Boolean)}
      <polygon points={dataPts} fill="url(#rgrad)" stroke="#00ff66" strokeWidth="1.5" strokeLinejoin="round"/>
      {values.map((v,i)=>{const p=pt(i,v);return<circle key={i} cx={p.x} cy={p.y} r="3" fill="#00ff66" stroke="#050608" strokeWidth="1.5"/>;}).filter(Boolean)}
      {labelPts.map((l,i)=>(
        <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
          style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:"8px",fill:"rgba(107,155,107,0.8)",letterSpacing:"0.5px"}}>
          {l.label}
        </text>
      ))}
    </svg>
  );
}

// ── TRADVIX SCORE RING ───────────────────────────────────────────
function ScoreRing({score,size=72}){
  if(!score&&score!==0)return null;
  const r=size*.38,circ=2*Math.PI*r;
  const pct=score/100,fill=circ*(1-pct);
  const col=score>=72?"#00ff66":score>=58?"#66ff99":score>=44?"#ffbe0b":score>=30?"#ff7088":"#ff2d55";
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={size*.1}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={size*.1}
        strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} filter={`drop-shadow(0 0 4px ${col}88)`}/>
      <text x={size/2} y={size/2-3} textAnchor="middle" dominantBaseline="auto"
        style={{fontFamily:"'IBM Plex Mono',monospace",fontWeight:600,fontSize:size*.22,fill:col}}>{score}</text>
      <text x={size/2} y={size/2+size*.14} textAnchor="middle" dominantBaseline="auto"
        style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:size*.1,fill:"rgba(107,155,107,0.6)",letterSpacing:"0.5px"}}>SCORE</text>
    </svg>
  );
}

// ── TYPEWRITER HOOK ─────────────────────────────────────────────
function useTypewriter(text, speed=28, active=true){
  const [displayed, setDisplayed]=useState("");
  const [done, setDone]=useState(false);
  useEffect(()=>{
    if(!active||!text){setDisplayed("");setDone(false);return;}
    setDisplayed("");setDone(false);
    let i=0;
    const id=setInterval(()=>{
      if(i<=text.length){setDisplayed(text.slice(0,i));i++;}
      else{clearInterval(id);setDone(true);}
    },speed);
    return()=>clearInterval(id);
  },[text,speed,active]);
  return{displayed,done};
}

// ── ARIA COMPONENT ───────────────────────────────────────────────
function ARIAMessage({text,active=true}){
  const{displayed,done}=useTypewriter(text,22,active);
  const parts=displayed.split(/(\*\*[^*]+\*\*)/g);
  return(
    <div className="aria-bubble">
      {parts.map((p,i)=>p.startsWith("**")&&p.endsWith("**")
        ?<strong key={i} style={{color:"var(--green)",fontWeight:700}}>{p.slice(2,-2)}</strong>
        :<span key={i}>{p}</span>
      )}
      {!done&&<span className="cursor"/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [tab,       setTab]      = useState("home");
  const [data,      setData]     = useState({});
  const [scores,    setScores]   = useState({});
  const [loading,   setLoading]  = useState(true);
  const [prog,      setProg]     = useState(0);
  const [progMsg,   setProgMsg]  = useState("Initializing ARIA...");
  const [sheet,     setSheet]    = useState(null);
  const [wl,        setWl]       = useState(()=>{try{return new Set(JSON.parse(localStorage.getItem("tv5")||"[]"));}catch{return new Set();}});
  const [sigFilter, setSigFilter]= useState("ALL");
  const [srch,      setSrch]     = useState("");
  const [toast,     setToast]    = useState(null);
  const [time,      setTime]     = useState("");
  const [ariaLines, setAriaLines]= useState([]);
  const [ariaIdx,   setAriaIdx]  = useState(0);
  const [flash,     setFlash]    = useState({});
  const toastT=useRef(null);

  const showToast=useCallback(m=>{setToast(m);clearTimeout(toastT.current);toastT.current=setTimeout(()=>setToast(null),2600);},[]);

  // ── BOOT ──────────────────────────────────────────────────────
  useEffect(()=>{
    const msgs=["Initializing ARIA...","Scanning 27 major stocks...","Computing TRADVIX Scores...","Running 6-dimension analysis...","Generating AI price targets...","Briefing ARIA...","Ready."];
    let mi=0;
    const iv=setInterval(()=>{if(mi<msgs.length){setProgMsg(msgs[mi++]);setProg(Math.round(mi/msgs.length*100));}else clearInterval(iv);},320);
    setTimeout(()=>{
      clearInterval(iv);
      const d=generateData();
      setData(d);
      const sc={};
      [...STOCKS,...IDXS].forEach(st=>{sc[st.s]=computeTRADVIXScore(st.s,d[st.s]);});
      setScores(sc);
      setAriaLines(getARIAMorningBrief(d,sc));
      setProg(100);setProgMsg("Ready.");
      setTimeout(()=>setLoading(false),300);
    },2200);
    return()=>clearInterval(iv);
  },[]);

  // ── CLOCK ─────────────────────────────────────────────────────
  useEffect(()=>{
    const t=()=>{try{setTime(new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date())+" ET");}catch{}};
    t();const id=setInterval(t,1000);return()=>clearInterval(id);
  },[]);

  // ── ARIA CYCLING ───────────────────────────────────────────────
  useEffect(()=>{
    if(!ariaLines.length)return;
    const id=setInterval(()=>setAriaIdx(i=>(i+1)%ariaLines.length),8000);
    return()=>clearInterval(id);
  },[ariaLines]);

  // ── SIMULATE LIVE PRICE TICKS ──────────────────────────────────
  useEffect(()=>{
    if(loading)return;
    const id=setInterval(()=>{
      const sym=STOCKS[Math.floor(Math.random()*STOCKS.length)].s;
      setData(prev=>{
        if(!prev[sym])return prev;
        const tick=(Math.random()-0.5)*0.08*prev[sym].c/100;
        const nc=+(prev[sym].c+tick).toFixed(2);
        const ndp=+((nc-prev[sym].pc)/prev[sym].pc*100).toFixed(2);
        const newHist=[...prev[sym].hist.slice(-59),nc];
        return{...prev,[sym]:{...prev[sym],c:nc,dp:ndp,d:+(nc-prev[sym].pc).toFixed(2),hist:newHist}};
      });
      setFlash(p=>({...p,[sym]:Date.now()}));
    },1800);
    return()=>clearInterval(id);
  },[loading]);

  // ── WATCHLIST ──────────────────────────────────────────────────
  const toggleWL=sym=>{setWl(prev=>{const n=new Set(prev);n.has(sym)?(n.delete(sym),showToast("Removed")):( n.add(sym),showToast("Added to watchlist ⭐"));try{localStorage.setItem("tv5",JSON.stringify([...n]));}catch{}return n;});};

  // ── COMPUTED ──────────────────────────────────────────────────
  const allQ=STOCKS.map(s=>({...s,q:data[s.s],sc:scores[s.s]})).filter(x=>x.q);
  const sorted=[...allQ].sort((a,b)=>b.q.dp-a.q.dp);
  const gainers=sorted.slice(0,10),losers=sorted.slice(-10).reverse();
  const adv=allQ.filter(x=>x.q.dp>=0).length,dec=allQ.filter(x=>x.q.dp<0).length;
  const upPct=Math.round(adv/(adv+dec||1)*100);
  const buyCnt=Object.values(scores).filter(s=>s?.dec?.includes("BUY")).length;
  const now=new Date();
  const etH=parseInt(new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"numeric",hour12:false}).format(now));
  const etM=parseInt(new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",minute:"numeric"}).format(now));
  const etD=now.getDay();
  const mktOpen=etD>0&&etD<6&&(etH>9||(etH===9&&etM>=30))&&etH<16;

  // Hidden Gems: high score + low absolute % change (under-the-radar)
  const gems=allQ.filter(x=>x.sc&&x.sc.total>=65&&Math.abs(x.q.dp)<1.5).sort((a,b)=>b.sc.total-a.sc.total).slice(0,4);

  // ── HELPERS ────────────────────────────────────────────────────
  const G="var(--green)",R="var(--red)";
  const scoreColor=s=>s>=72?"#00ff66":s>=58?"#66ff99":s>=44?"#ffbe0b":s>=30?"#ff7088":"#ff2d55";

  const SRow=({sym,name,q,sc,rank,gain,emoji})=>{
    const isNew=flash[sym]&&Date.now()-flash[sym]<1800;
    return(
      <div className={`srow ${gain?"bull":"bear"} ${isNew?(gain?"flash-g":"flash-r"):""}`} onClick={()=>setSheet(sym)}>
        {rank&&<div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--muted2)",width:18,flexShrink:0,textAlign:"center"}}>{rank}</div>}
        <div style={{fontSize:18,flexShrink:0}}>{emoji||"📈"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:15,letterSpacing:.5}}>{sym}</div>
          <div style={{fontSize:10,color:"var(--muted2)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:100}}>{name}</div>
        </div>
        {sc&&<div className={`score-badge ${sc.decClass}`}>{sc.emoji} {sc.dec}</div>}
        <Spark data={q.hist?.slice(-20)} color={gain?"#00ff66":"#ff2d55"}/>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div className={isNew?"tick":""} style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:13,fontWeight:600,color:isNew?(gain?"#00ff66":"#ff2d55"):"var(--text)",transition:"color .5s"}}>{fp(q.c)}</div>
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:5,display:"inline-block",background:gain?"rgba(0,255,102,0.08)":"rgba(255,45,85,0.08)",color:gain?"#00ff66":"#ff2d55"}}>{fc(q.dp)}</div>
        </div>
      </div>
    );
  };

  // ── SPLASH ─────────────────────────────────────────────────────
  if(loading)return(
    <div style={{background:"var(--black)",color:"var(--text)",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,padding:24,position:"relative",overflow:"hidden"}}>
      <style>{CSS}</style>
      {/* Background grid animation */}
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(ellipse at 50% 50%, rgba(0,255,102,0.04) 0%, transparent 70%)",pointerEvents:"none"}}/>
      {/* Logo */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
        <div style={{width:72,height:72,borderRadius:18,background:"linear-gradient(135deg,#00ff66,#00cc52)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 40px rgba(0,255,102,0.3)",fontSize:32}}>⚡</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:36,letterSpacing:6,color:"var(--text)"}}>TRAD<span style={{color:"var(--green)"}}>VIX</span></div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,letterSpacing:4,color:"var(--muted2)"}}>AI STOCK INTELLIGENCE</div>
      </div>
      {/* ARIA intro */}
      <div style={{display:"flex",gap:10,alignItems:"flex-start",maxWidth:300}}>
        <div className="aria-avatar">AI</div>
        <div className="aria-bubble" style={{fontSize:13}}>
          Initializing ARIA — your personal AI stock analyst...
          <span className="cursor"/>
        </div>
      </div>
      {/* Progress */}
      <div style={{width:260}}>
        <div className="prog-bar"><div className="prog-fill" style={{width:prog+"%"}}/></div>
        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:"var(--muted2)",marginTop:8,textAlign:"center",letterSpacing:.5}}>{progMsg}</div>
      </div>
    </div>
  );

  // ── SHEET ──────────────────────────────────────────────────────
  const Sheet=()=>{
    if(!sheet)return null;
    const stk=STOCKS.find(s=>s.s===sheet);
    const q=data[sheet];const sc=scores[sheet];
    if(!q)return null;
    const up=q.dp>=0;
    const{displayed:ariaText}=useTypewriter(sc?.ariaLines||"",20,true);
    const ariaParts=ariaText.split(/(\*\*[^*]+\*\*)/g);
    return(
      <div className="sheet-ov open" onClick={e=>{if(e.target===e.currentTarget)setSheet(null);}}>
        <div className="sheet">
          <div className="sheet-handle"/>
          {/* ── SHEET HEADER ── */}
          <div style={{padding:"18px 20px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"flex-start",justifyContent:"space-between",position:"relative"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:48,height:48,borderRadius:13,background:"var(--card2)",border:"1px solid var(--border2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{stk?.e||"📈"}</div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,letterSpacing:1,marginBottom:2}}>{sheet}</div>
                <div style={{fontSize:11,color:"var(--muted2)"}}>{q.name} · {stk?.sec}</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:22,fontWeight:600,color:up?"#00ff66":"#ff2d55",marginBottom:4}}>{fp(q.c)}</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:7,display:"inline-block",background:up?"rgba(0,255,102,0.08)":"rgba(255,45,85,0.08)",color:up?"#00ff66":"#ff2d55"}}>{fc(q.dp)}</div>
            </div>
            <div onClick={()=>setSheet(null)} style={{position:"absolute",top:16,right:16,width:28,height:28,borderRadius:"50%",background:"var(--card2)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"var(--muted2)"}}>✕</div>
          </div>

          <div style={{padding:"18px 20px",display:"flex",flexDirection:"column",gap:20}}>

            {/* ── TRADVIX SCORE + RADAR ── */}
            {sc&&(
              <div style={{...{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16},padding:16}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:2,marginBottom:14}}>TRADVIX SCORE™ — PROPRIETARY AI RATING</div>
                <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                  <ScoreRing score={sc.total} size={80}/>
                  <div style={{flex:1,minWidth:120}}>
                    <div className={`score-badge ${sc.decClass}`} style={{fontSize:12,padding:"6px 14px",marginBottom:8,display:"inline-flex"}}>{sc.emoji} {sc.dec}</div>
                    <div style={{fontSize:11,color:"var(--muted2)",lineHeight:1.5}}>{sc.brief}</div>
                  </div>
                  <div className="radar-wrap"><RadarChart dims={sc.dims} size={150}/></div>
                </div>
                {/* 6 dimension meters */}
                <div style={{marginTop:14,display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 14px"}}>
                  {Object.entries(sc.dims).map(([k,v])=>(
                    <div key={k}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:1,textTransform:"uppercase"}}>{k}</span>
                        <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:scoreColor(v),fontWeight:700}}>{v}</span>
                      </div>
                      <div className="prog-bar"><div className="prog-fill" style={{width:v+"%",background:`linear-gradient(90deg,${scoreColor(v)},${scoreColor(v)}88)`}}/></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ARIA ANALYSIS ── */}
            <div>
              <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                <div className="aria-avatar">AI</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--green)",letterSpacing:2,marginBottom:6}}>ARIA — AI ANALYST</div>
                  <div className="aria-bubble" style={{fontSize:12}}>
                    {ariaParts.map((p,i)=>p.startsWith("**")&&p.endsWith("**")
                      ?<strong key={i} style={{color:"var(--green)"}}>{p.slice(2,-2)}</strong>
                      :<span key={i}>{p}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── AI PRICE TARGETS ── */}
            {sc?.targets&&(
              <div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:2,marginBottom:10}}>🎯 AI PRICE TARGETS</div>
                <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:3}}>
                  {Object.entries(sc.targets).map(([p,t])=>{
                    const ret=((t-q.c)/q.c*100),col=ret>=0?"#00ff66":"#ff2d55";
                    return(
                      <div key={p} style={{background:"var(--card)",border:`1px solid ${col}22`,borderRadius:12,padding:"11px 12px",flexShrink:0,minWidth:76,textAlign:"center"}}>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:.5,marginBottom:5}}>{p}</div>
                        <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:16,color:col,marginBottom:2}}>{fp(t)}</div>
                        <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:col}}>{ret>=0?"+":""}{ret.toFixed(1)}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 60-DAY CHART ── */}
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:2,marginBottom:12}}>60-DAY PRICE ACTION</div>
              <Spark data={q.hist} color={up?"#00ff66":"#ff2d55"} w={320} h={90}/>
            </div>

            {/* ── KEY METRICS ── */}
            <div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:2,marginBottom:10}}>KEY METRICS</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[{l:"OPEN",v:fp(q.o)},{l:"HIGH",v:fp(q.h),c:"#00ff66"},{l:"LOW",v:fp(q.l),c:"#ff2d55"},{l:"PREV",v:fp(q.pc)},{l:"VOLUME",v:fv(q.v)},{l:"RSI",v:sc?.rsi?sc.rsi+"":"--",c:sc?.rsi?sc.rsi<30?"#00ff66":sc.rsi>70?"#ff2d55":"#ffbe0b":undefined},{l:"MACD",v:sc?.macd?sc.macd+"":"--",c:sc?.macd?sc.macd>0?"#00ff66":"#ff2d55":undefined},{l:"MA 50",v:sc?.sma50?"$"+sc.sma50:"--"},{l:"MA 20",v:sc?.sma20?"$"+sc.sma20:"--"}].map(m=>(
                  <div key={m.l} style={{background:"var(--card2)",border:"1px solid var(--border)",borderRadius:11,padding:"9px 11px"}}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:1.2,marginBottom:5}}>{m.l}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:12,fontWeight:600,color:m.c||"var(--text)"}}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WL button */}
            <button onClick={()=>toggleWL(sheet)} style={{background:wl.has(sheet)?"rgba(0,255,102,0.08)":"var(--card)",border:`1px solid ${wl.has(sheet)?"var(--green)":"rgba(255,255,255,.1)"}`,borderRadius:13,padding:14,fontSize:13,fontWeight:600,color:wl.has(sheet)?"var(--green)":"var(--text)",width:"100%",cursor:"pointer",fontFamily:"'Syne',sans-serif",boxShadow:wl.has(sheet)?"0 0 20px rgba(0,255,102,0.08)":"none"}}>
              {wl.has(sheet)?"✓ In Watchlist (tap to remove)":"⭐ Add to Watchlist"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return(
    <>
    <style>{CSS}</style>
    <div style={{background:"var(--black)",color:"var(--text)",height:"100dvh",display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Syne',sans-serif"}}>

      {/* ── HEADER ── */}
      <div className="hdr">
        <div className="logo-wrap">
          <div className="logo-mark">TX</div>
          <div className="logo-text">TRAD<span>VIX</span></div>
        </div>
        <div className="live-wrap">
          <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--muted2)"}}>{time}</div>
          <div className="live-pill">
            <div className="live-dot"/>
            {mktOpen?"LIVE":"CLOSED"}
          </div>
        </div>
      </div>

      {/* ── PAGES ── */}
      <div className="pages">

        {/* ══ HOME ══ */}
        <div className={`page ${tab==="home"?"active":""}`}>

          {/* ARIA DAILY BRIEF */}
          <div style={{padding:"16px 16px 0"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div className="aria-avatar">AI</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--green)",letterSpacing:2,marginBottom:6}}>ARIA · AI ANALYST · DAILY BRIEF</div>
                <ARIAMessage text={ariaLines[ariaIdx]||""} active={tab==="home"}/>
                {ariaLines.length>1&&(
                  <div style={{display:"flex",gap:4,marginTop:8}}>
                    {ariaLines.map((_,i)=><div key={i} style={{width:i===ariaIdx?16:4,height:4,borderRadius:2,background:i===ariaIdx?"var(--green)":"rgba(0,255,102,0.2)",transition:"width .3s"}}/>)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MARKET PULSE STRIP */}
          <div style={{padding:"14px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div className="sec-lbl">MARKET PULSE</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--muted2)"}}>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}</div>
            </div>
            <div style={{display:"flex",gap:10,overflowX:"auto"}}>
              {IDXS.map(ix=>{
                const q=data[ix.s],up=q&&q.dp>=0;
                return(
                  <div key={ix.s} className={`idx-chip ${up?"up":"dn"}`}>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:.5,marginBottom:5}}>{ix.n}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:600,marginBottom:2,color:q?(up?"#00ff66":"#ff2d55"):"var(--muted2)"}}>{q?fp(q.c):"--"}</div>
                    <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,fontWeight:700,color:q?(up?"#00ff66":"#ff2d55"):"var(--muted2)"}}>{q?fc(q.dp):"--"}</div>
                  </div>
                );
              })}
              {/* Breadth chip */}
              <div className="idx-chip" style={{minWidth:110}}>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)",letterSpacing:.5,marginBottom:5}}>BREADTH</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:16,fontWeight:600,marginBottom:4,color:upPct>55?"#00ff66":upPct<45?"#ff2d55":"#ffbe0b"}}>{upPct}%</div>
                <div style={{height:4,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden",display:"flex"}}>
                  <div style={{width:upPct+"%",background:"#00ff66",borderRadius:"2px 0 0 2px"}}/>
                  <div style={{flex:1,background:"#ff2d55",borderRadius:"0 2px 2px 0"}}/>
                </div>
              </div>
            </div>
          </div>

          {/* HIDDEN GEMS */}
          {gems.length>0&&(
            <div style={{padding:"16px 16px 0"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div className="sec-lbl">💎 HIDDEN GEMS</div>
                <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--green)",border:"1px solid rgba(0,255,102,0.15)",borderRadius:20,padding:"2px 8px"}}>ARIA PICKS</div>
              </div>
              <div style={{display:"flex",gap:10,overflowX:"auto"}}>
                {gems.map(x=>{
                  const sc=x.sc;
                  return(
                    <div key={x.s} className="gem-card" style={{minWidth:140}} onClick={()=>setSheet(x.s)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div>
                          <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:16,letterSpacing:.5}}>{x.s}</div>
                          <div style={{fontSize:9,color:"var(--muted2)",marginTop:1}}>{x.n}</div>
                        </div>
                        <ScoreRing score={sc?.total||0} size={44}/>
                      </div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:14,fontWeight:600,color:"#00ff66",marginBottom:3}}>{fp(x.q.c)}</div>
                      <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:10,color:x.q.dp>=0?"#00ff66":"#ff2d55"}}>{fc(x.q.dp)}</div>
                      <div style={{fontSize:10,color:"var(--muted2)",marginTop:6,lineHeight:1.4}}>Strong signal, low noise. Under-the-radar.</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* GAINERS */}
          <div style={{padding:"16px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <div className="sec-lbl">TOP 10 GAINERS</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--muted2)",border:"1px solid var(--border)",borderRadius:20,padding:"2px 8px"}}>{buyCnt} BUY SIGNALS</div>
            </div>
            <div className="card">
              <div style={{padding:"10px 16px",background:"rgba(0,0,0,.3)",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1.5,color:"#00ff66"}}>▲ GAINERS · TRADVIX SCORE™</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)"}}>TAP FOR FULL AI ANALYSIS</span>
              </div>
              {gainers.map((x,i)=><SRow key={x.s} sym={x.s} name={x.n} q={x.q} sc={x.sc} rank={i+1} gain={true} emoji={x.e}/>)}
            </div>
          </div>

          {/* LOSERS */}
          <div style={{padding:"16px 16px 0",paddingBottom:20}}>
            <div style={{marginBottom:10}}>
              <div className="sec-lbl">TOP 10 LOSERS</div>
            </div>
            <div className="card">
              <div style={{padding:"10px 16px",background:"rgba(0,0,0,.3)",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:12,letterSpacing:1.5,color:"#ff2d55"}}>▼ LOSERS · TRADVIX SCORE™</span>
                <span style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:8,color:"var(--muted2)"}}>ARIA WATCHES THESE</span>
              </div>
              {losers.map((x,i)=><SRow key={x.s} sym={x.s} name={x.n} q={x.q} sc={x.sc} rank={i+1} gain={false} emoji={x.e}/>)}
            </div>
          </div>

        </div>

        {/* ══ AI BOARD ══ */}
        <div className={`page ${tab==="signals"?"active":""}`}>
          <div style={{padding:"16px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div className="sec-lbl">AI SIGNAL BOARD</div>
            </div>

            {/* Legend */}
            <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,padding:"10px 14px",marginBottom:12,display:"flex",gap:6,flexWrap:"wrap"}}>
              {[{d:"STRONG BUY",c:"score-sb",e:"🚀"},{d:"BUY",c:"score-b",e:"✅"},{d:"HOLD",c:"score-h",e:"⏸️"},{d:"SELL",c:"score-s",e:"⚠️"},{d:"STRONG SELL",c:"score-ss",e:"🔴"}].map(x=>(
                <div key={x.d} className={`score-badge ${x.c}`} style={{fontSize:8}}>{x.e} {x.d}</div>
              ))}
            </div>

            {/* Filter */}
            <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto"}}>
              {["ALL","🚀 BUY","⏸️ HOLD","🔴 SELL"].map(f=>(
                <button key={f} onClick={()=>setSigFilter(f)} style={{padding:"6px 14px",borderRadius:20,border:"1px solid",cursor:"pointer",fontFamily:"'IBM Plex Mono',monospace",fontSize:10,flexShrink:0,background:sigFilter===f?"var(--green)":"transparent",color:sigFilter===f?"#000":"var(--green)",borderColor:sigFilter===f?"var(--green)":"rgba(0,255,102,0.2)",fontWeight:sigFilter===f?700:400}}>{f}</button>
              ))}
            </div>

            <div className="card">
              {allQ.filter(x=>x.sc).filter(x=>{
                if(sigFilter==="ALL")return true;
                if(sigFilter.includes("BUY"))return x.sc.dec.includes("BUY");
                if(sigFilter.includes("HOLD"))return x.sc.dec==="HOLD";
                if(sigFilter.includes("SELL"))return x.sc.dec.includes("SELL");
                return true;
              }).sort((a,b)=>b.sc.total-a.sc.total)
                .map(x=><SRow key={x.s} sym={x.s} name={x.n} q={x.q} sc={x.sc} gain={x.q.dp>=0} emoji={x.e}/>)
              }
            </div>
          </div>
        </div>

        {/* ══ SEARCH ══ */}
        <div className={`page ${tab==="search"?"active":""}`}>
          <div style={{padding:"16px 16px 0"}}>
            <div style={{background:"var(--card)",border:"1px solid var(--border2)",borderRadius:13,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <span style={{fontSize:16,color:"var(--muted2)"}}>⌕</span>
              <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search symbol or company..."
                style={{flex:1,background:"none",border:"none",outline:"none",fontFamily:"'Syne',sans-serif",fontSize:14,color:"var(--text)"}}/>
              {srch&&<span onClick={()=>setSrch("")} style={{fontSize:14,color:"var(--muted2)",cursor:"pointer"}}>✕</span>}
            </div>
            <div className="card">
              {STOCKS.filter(s=>!srch||(s.s+s.n).toLowerCase().includes(srch.toLowerCase())).map(x=>{
                const q=data[x.s],sc=scores[x.s];
                return q?<SRow key={x.s} sym={x.s} name={x.n} q={q} sc={sc} gain={q.dp>=0} emoji={x.e}/>:null;
              })}
            </div>
          </div>
        </div>

        {/* ══ WATCHLIST ══ */}
        <div className={`page ${tab==="watch"?"active":""}`}>
          <div style={{padding:"16px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div className="sec-lbl">MY WATCHLIST</div>
              <div style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:9,color:"var(--muted2)",border:"1px solid var(--border)",borderRadius:20,padding:"2px 8px"}}>{wl.size} STOCKS</div>
            </div>
            {wl.size===0?(
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"48px 24px",textAlign:"center"}}>
                <div style={{fontSize:48,marginBottom:16}}>⭐</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:20,marginBottom:8}}>Nothing here yet</div>
                <div style={{fontSize:13,color:"var(--muted2)",lineHeight:1.6}}>Open any stock and tap<br/>⭐ Add to Watchlist</div>
              </div>
            ):(
              <div className="card">
                {STOCKS.filter(s=>wl.has(s.s)).map(x=>{const q=data[x.s],sc=scores[x.s];return q?<SRow key={x.s} sym={x.s} name={x.n} q={q} sc={sc} gain={q.dp>=0} emoji={x.e}/>:null;})}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── TAB BAR ── */}
      <div className="tabbar">
        {[{id:"home",icon:"📊",lbl:"Markets"},{id:"signals",icon:"🤖",lbl:"AI Board"},{id:"search",icon:"🔍",lbl:"Search"},{id:"watch",icon:"⭐",lbl:"Watch"}].map(t=>(
          <div key={t.id} className={`tb ${tab===t.id?"active":""}`} onClick={()=>setTab(t.id)}>
            <div className="tb-bar"/>
            <div className="tb-icon">{t.icon}</div>
            <div className="tb-lbl">{t.lbl}</div>
          </div>
        ))}
      </div>

      <Sheet/>

      {toast&&<div className={`toast show`}>{toast}</div>}

    </div>
    </>
  );
}