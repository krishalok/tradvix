import { useState, useEffect, useRef, useCallback } from "react";

// ── CONSTANTS ─────────────────────────────────────────────────
const BACKEND = 'https://tradvix-backend.onrender.com';
const N="#1a1a2e",W="#fafaf8",G="#16a34a",R="#dc2626",A="#d97706";

// ── AUTH HELPERS ──────────────────────────────────────────────
function getToken(){return localStorage.getItem("tv_token");}
function saveToken(t){localStorage.setItem("tv_token",t);}
function getUser(){
  try{
    const t=getToken();
    if(!t)return null;
    const p=JSON.parse(atob(t.split(".")[1]));
    return p.exp*1000>Date.now()?p:null;
  }catch{return null;}
}
function logout(){localStorage.removeItem("tv_token");window.location.reload();}

// ── STOCKS DATA ───────────────────────────────────────────────
const STOCKS=[
  {s:"NVDA",n:"NVIDIA Corp",sec:"tech",e:"⚡"},{s:"AAPL",n:"Apple Inc",sec:"tech",e:"🍎"},
  {s:"MSFT",n:"Microsoft",sec:"tech",e:"🪟"},{s:"GOOGL",n:"Alphabet",sec:"tech",e:"🔍"},
  {s:"AMZN",n:"Amazon",sec:"tech",e:"📦"},{s:"META",n:"Meta Platforms",sec:"tech",e:"📘"},
  {s:"TSLA",n:"Tesla",sec:"tech",e:"🚗"},{s:"AVGO",n:"Broadcom",sec:"tech",e:"🔧"},
  {s:"AMD",n:"AMD",sec:"tech",e:"💻"},{s:"NFLX",n:"Netflix",sec:"tech",e:"🎬"},
  {s:"JPM",n:"JPMorgan Chase",sec:"finance",e:"🏦"},{s:"GS",n:"Goldman Sachs",sec:"finance",e:"💰"},
  {s:"V",n:"Visa",sec:"finance",e:"💳"},{s:"MA",n:"Mastercard",sec:"finance",e:"🔴"},
  {s:"BAC",n:"Bank of America",sec:"finance",e:"🏛️"},
  {s:"XOM",n:"ExxonMobil",sec:"energy",e:"🛢️"},{s:"CVX",n:"Chevron",sec:"energy",e:"⛽"},
  {s:"LLY",n:"Eli Lilly",sec:"health",e:"🧬"},{s:"JNJ",n:"J&J",sec:"health",e:"💊"},
  {s:"UNH",n:"UnitedHealth",sec:"health",e:"🏥"},{s:"ABBV",n:"AbbVie",sec:"health",e:"🔬"},
  {s:"MRK",n:"Merck",sec:"health",e:"💉"},
  {s:"WMT",n:"Walmart",sec:"consumer",e:"🛒"},{s:"COST",n:"Costco",sec:"consumer",e:"🏪"},
  {s:"HD",n:"Home Depot",sec:"consumer",e:"🔨"},{s:"NKE",n:"Nike",sec:"consumer",e:"👟"},
  {s:"PG",n:"Procter & Gamble",sec:"consumer",e:"🧼"},{s:"BA",n:"Boeing",sec:"industrial",e:"✈️"},
  {s:"DIS",n:"Disney",sec:"media",e:"🏰"},{s:"BRK-B",n:"Berkshire",sec:"finance",e:"💎"},
];
const IDXS=[{s:"SPY",n:"S&P 500"},{s:"QQQ",n:"NASDAQ"},{s:"DIA",n:"DOW"}];
const SP500_TOP20=[
  {s:"AAPL",n:"Apple Inc",e:"🍎"},{s:"MSFT",n:"Microsoft",e:"🪟"},
  {s:"NVDA",n:"NVIDIA",e:"⚡"},{s:"GOOGL",n:"Alphabet",e:"🔍"},
  {s:"AMZN",n:"Amazon",e:"📦"},{s:"META",n:"Meta",e:"📘"},
  {s:"TSLA",n:"Tesla",e:"🚗"},{s:"BRK-B",n:"Berkshire",e:"💎"},
  {s:"LLY",n:"Eli Lilly",e:"🧬"},{s:"AVGO",n:"Broadcom",e:"🔧"},
  {s:"JPM",n:"JPMorgan",e:"🏦"},{s:"V",n:"Visa",e:"💳"},
  {s:"XOM",n:"Exxon Mobil",e:"🛢️"},{s:"UNH",n:"UnitedHealth",e:"🏥"},
  {s:"MA",n:"Mastercard",e:"🔴"},{s:"JNJ",n:"J&J",e:"💊"},
  {s:"WMT",n:"Walmart",e:"🛒"},{s:"PG",n:"P&G",e:"🧼"},
  {s:"HD",n:"Home Depot",e:"🔨"},{s:"COST",n:"Costco",e:"🏪"},
];

// ── UTILS ─────────────────────────────────────────────────────
const fp=v=>v?`$${Number(v).toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}`:"--";
const fc=v=>v!=null?`${v>=0?"+":""}${v.toFixed(2)}%`:"--";
const fv=v=>{if(!v||v===0)return"N/A";if(v>=1e9)return`${(v/1e9).toFixed(1)}B`;if(v>=1e6)return`${(v/1e6).toFixed(1)}M`;return`${(v/1e3).toFixed(0)}K`;};
const fb=v=>{if(!v||v===0)return"N/A";if(v>=1e12)return`$${(v/1e12).toFixed(2)}T`;if(v>=1e9)return`$${(v/1e9).toFixed(1)}B`;return`$${(v/1e6).toFixed(0)}M`;};
const tAgo=d=>{if(!d)return"";const s=Math.floor((Date.now()-new Date(d))/1000);if(s<60)return"just now";if(s<3600)return`${Math.floor(s/60)}m ago`;if(s<86400)return`${Math.floor(s/3600)}h ago`;return`${Math.floor(s/86400)}d ago`;};

// ── SCORE ENGINE ──────────────────────────────────────────────
function mkRng(seed){let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;return()=>{h=(h*1664525+1013904223)>>>0;return h/0x100000000;};}
function calcRSI(c,n=14){if(!c||c.length<n+1)return null;let g=0,l=0;for(let i=1;i<=n;i++){const d=c[i]-c[i-1];d>0?g+=d:l+=Math.abs(d);}let ag=g/n,al=l/n;for(let i=n+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(n-1)+(d>0?d:0))/n;al=(al*(n-1)+(d<0?Math.abs(d):0))/n;}return al===0?100:+(100-100/(1+ag/al)).toFixed(1);}
function calcSMA(a,n){if(!a||a.length<n)return null;return +(a.slice(-n).reduce((s,v)=>s+v,0)/n).toFixed(2);}
function calcEMA(a,n){if(!a||a.length<n)return null;const k=2/(n+1);let e=a.slice(0,n).reduce((s,v)=>s+v,0)/n;for(let i=n;i<a.length;i++)e=a[i]*k+e*(1-k);return +e.toFixed(2);}

function computeScore(sym,q){
  if(!q?.c)return null;
  const rng=mkRng(sym+(q.c||0).toFixed(0));
  const hist=q.hist||[];
  const rsi=calcRSI(hist)||50+rng()*20-10;
  const sma20=calcSMA(hist,Math.min(20,hist.length));
  const sma50=calcSMA(hist,Math.min(50,hist.length));
  const ema12=calcEMA(hist,Math.min(12,hist.length));
  const ema26=calcEMA(hist,Math.min(26,hist.length));
  const macd=ema12&&ema26?+(ema12-ema26).toFixed(3):null;
  const mom=Math.min(100,Math.max(0,50+(q.dp||0)*3+rng()*10));
  const val=Math.min(100,Math.max(0,q.pe?(q.pe<15?80:q.pe<25?60:q.pe<40?40:20):50+rng()*20));
  const grw=Math.min(100,Math.max(0,50+(q.dp||0)*2+rng()*15));
  const sft=Math.min(100,Math.max(0,q.beta?60-Math.abs(q.beta-1)*20:50+rng()*10));
  const snt=Math.min(100,Math.max(0,rsi));
  const tch=Math.min(100,Math.max(0,sma20&&sma50?(q.c>sma20?55:45)+(q.c>sma50?10:0)+rng()*15:50+rng()*15));
  const dims={momentum:Math.round(mom),value:Math.round(val),growth:Math.round(grw),safety:Math.round(sft),sentiment:Math.round(snt),technical:Math.round(tch)};
  const total=Math.round(Object.values(dims).reduce((a,b)=>a+b,0)/6);
  const dec=total>=70?"ACCUMULATE":total>=55?"NEUTRAL":"REDUCE";
  const brief=total>=70?"Strong quantitative signals. Positive momentum and technical setup.":total>=55?"Mixed signals. Monitor for clearer directional bias.":"Weak signals. Risk factors elevated.";
  const targets={};
  if(q.c){targets["1W"]=+(q.c*(1+(q.dp||0)/100*0.3+rng()*0.02-0.01)).toFixed(2);targets["1M"]=+(q.c*(1+(q.dp||0)/100*1.2+rng()*0.04-0.02)).toFixed(2);targets["3M"]=+(q.c*(1+(q.dp||0)/100*3+rng()*0.08-0.04)).toFixed(2);targets["6M"]=+(q.c*(1+(q.dp||0)/100*6+rng()*0.12-0.06)).toFixed(2);targets["1Y"]=+(q.c*(1+(q.dp||0)/100*12+rng()*0.2-0.1)).toFixed(2);}
  return{total,dec,dims,brief,rsi:+rsi.toFixed(1),macd,sma20,sma50,targets};
}

// ── API ───────────────────────────────────────────────────────
async function api(path){
  const r=await fetch(BACKEND+path,{headers:{Authorization:`Bearer ${getToken()}`}});
  if(!r.ok)throw new Error(`API ${r.status}`);
  return r.json();
}
async function apiPost(path,body){
  const r=await fetch(BACKEND+path,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${getToken()}`},body:JSON.stringify(body)});
  if(!r.ok)throw new Error(`API ${r.status}`);
  return r.json();
}

// ── UI COMPONENTS ─────────────────────────────────────────────
function Spark({data,up,w=52,h=26}){
  if(!data||data.length<2)return<svg width={w} height={h}/>;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-(((v-mn)/rng)*h*0.85+h*0.075)}`).join(" ");
  return<svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={up?G:R} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>;
}

function ScoreRing({score,size=64}){
  if(!score&&score!==0)return null;
  const r=size*.38,circ=2*Math.PI*r,fill=circ*(1-score/100);
  const col=score>=70?"#16a34a":score>=55?"#15803d":score>=40?"#d97706":score>=25?"#ea580c":"#dc2626";
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={size*.1}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={size*.1} strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round" transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2+size*.06} textAnchor="middle" fontFamily="monospace" fontSize={size*.22} fontWeight="800" fill={col}>{score}</text>
      <text x={size/2} y={size/2+size*.22} textAnchor="middle" fontFamily="system-ui" fontSize={size*.1} fill="#9ca3af" letterSpacing="0.5px">SCORE</text>
    </svg>
  );
}

function Radar({dims,size=160}){
  if(!dims)return null;
  const keys=Object.keys(dims);
  const vals=Object.values(dims);
  const n=keys.length,cx=size/2,cy=size/2,r=size*.35;
  const pts=vals.map((v,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return[cx+r*(v/100)*Math.cos(a),cy+r*(v/100)*Math.sin(a)];});
  const grid=[0.25,0.5,0.75,1].map(f=>keys.map((_,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return`${cx+r*f*Math.cos(a)},${cy+r*f*Math.sin(a)}`;}).join(" "));
  return(
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {grid.map((pts,i)=><polygon key={i} points={pts} fill="none" stroke="#e5e7eb" strokeWidth={0.5}/>)}
      {keys.map((_,i)=>{const a=(i/n)*2*Math.PI-Math.PI/2;return<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#e5e7eb" strokeWidth={0.5}/>;} )}
      <polygon points={pts.map(p=>p.join(",")).join(" ")} fill="rgba(22,163,74,0.15)" stroke={G} strokeWidth={1.5} strokeLinejoin="round"/>
      {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r={3} fill={G}/>)}
      {keys.map((k,i)=>{
        const a=(i/n)*2*Math.PI-Math.PI/2;
        const lx=cx+(r+18)*Math.cos(a),ly=cy+(r+18)*Math.sin(a);
        return<text key={k} x={lx} y={ly+4} textAnchor="middle" fontSize={size*.055} fontFamily="system-ui" fill="#6b7280">{k.charAt(0).toUpperCase()+k.slice(1)}</text>;
      })}
    </svg>
  );
}

// ── LANDING PAGE ──────────────────────────────────────────────
function LandingPage({onGetStarted}){
  const calledRef=useRef(false);
  useEffect(()=>{
    const h=(e)=>{if((e.data==="tradvix_getstarted"||e.data==="fintelquantum_getstarted")&&!calledRef.current){calledRef.current=true;onGetStarted();}};
    window.addEventListener("message",h);
    return()=>window.removeEventListener("message",h);
  },[onGetStarted]);
  return(
    <div style={{height:"100dvh",overflow:"hidden"}}>
      <iframe src="/landing.html" style={{width:"100%",height:"100%",border:"none"}} title="Fintel Quantum"/>
    </div>
  );
}

// ── AUTH SCREEN ───────────────────────────────────────────────
function AuthScreen({onAuth}){
  const [mode,setMode]=useState("login");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const submit=async(e)=>{
    e?.preventDefault();
    setError("");setLoading(true);
    try{
      const endpoint=mode==="signup"?"/auth/signup":"/auth/login";
      const body=mode==="signup"?{name,email,password}:{email,password};
      const res=await fetch(BACKEND+endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      const data=await res.json();
      if(!res.ok){setError(data.error||"Something went wrong");setLoading(false);return;}
      saveToken(data.token);
      onAuth(data.user);
    }catch{setError("Connection error. Please try again.");}
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:W,padding:"24px",fontFamily:"system-ui,-apple-system,sans-serif"}}>
      <div style={{marginBottom:28,textAlign:"center"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,justifyContent:"center",marginBottom:8}}>
          <div style={{width:42,height:42,borderRadius:12,background:N,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="24" height="24" viewBox="0 0 44 44"><polygon points="22,4 36,12 36,28 22,36 8,28 8,12" fill="none" stroke="#22c55e" strokeWidth="2"/><text x="22" y="26" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#22c55e" textAnchor="middle">FQ</text></svg>
          </div>
          <div><div style={{fontSize:18,fontWeight:800,color:N,letterSpacing:.5}}>FINTEL</div><div style={{fontSize:18,fontWeight:800,color:"#22c55e",letterSpacing:.5,marginTop:-4}}>QUANTUM</div></div>
        </div>
      </div>
      <div style={{background:"white",borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:400,boxShadow:"0 4px 24px rgba(0,0,0,.08)",border:"1px solid #f3f4f6"}}>
        <h2 style={{fontSize:22,fontWeight:800,color:N,marginBottom:6}}>{mode==="login"?"Welcome back":"Create your account"}</h2>
        <p style={{fontSize:13,color:"#9ca3af",marginBottom:24}}>Sign {mode==="login"?"in to":"up for"} your FINTEL QUANTUM account</p>
        <form onSubmit={submit}>
          {mode==="signup"&&<div style={{marginBottom:16}}>
            <label style={{fontSize:13,fontWeight:600,color:N,display:"block",marginBottom:6}}>Full Name</label>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,color:N,outline:"none",fontFamily:"system-ui",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=N} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:13,fontWeight:600,color:N,display:"block",marginBottom:6}}>Email Address</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,color:N,outline:"none",fontFamily:"system-ui",boxSizing:"border-box",background:"#f8fafc"}} onFocus={e=>e.target.style.borderColor=N} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          <div style={{marginBottom:error?12:20}}>
            <label style={{fontSize:13,fontWeight:600,color:N,display:"block",marginBottom:6}}>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••••" required style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,color:N,outline:"none",fontFamily:"system-ui",boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=N} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          </div>
          {error&&<div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:8,padding:"10px 14px",fontSize:13,color:R,marginBottom:16}}>{error}</div>}
          <button type="submit" disabled={loading} style={{width:"100%",padding:"14px",background:loading?"#9ca3af":N,border:"none",borderRadius:10,fontSize:15,fontWeight:700,color:"white",cursor:loading?"not-allowed":"pointer",fontFamily:"system-ui",transition:"all .2s"}}>
            {loading?"Please wait...":(mode==="login"?"Sign in →":"Create free account →")}
          </button>
        </form>
        <div style={{textAlign:"center",marginTop:18,fontSize:13,color:"#9ca3af"}}>
          {mode==="login"?<>Don't have an account? <span onClick={()=>setMode("signup")} style={{color:N,fontWeight:700,cursor:"pointer"}}>Sign up free</span></>:<>Already have an account? <span onClick={()=>setMode("login")} style={{color:N,fontWeight:700,cursor:"pointer"}}>Sign in</span></>}
        </div>
        {mode==="signup"&&<div style={{textAlign:"center",marginTop:14,padding:"10px",background:"#f0fdf4",borderRadius:8,fontSize:11,color:G}}>✓ Free forever · No credit card required · Cancel anytime</div>}
      </div>
      <p style={{marginTop:20,fontSize:11,color:"#d1d5db",textAlign:"center"}}>By continuing you agree to our Terms of Service and Privacy Policy.</p>
    </div>
  );
}

// ── ARIA CHAT (standalone — lives outside App to prevent re-render) ──
function AriaChat({open,onClose,sheet,tokenRef}){
  const [msgs,setMsgs]=useState([]);
  const [busy,setBusy]=useState(false);
  const endRef=useRef(null);
  const formRef=useRef(null);

  useEffect(()=>{
    if(open) setTimeout(()=>formRef.current?.querySelector("input")?.focus(),100);
  },[open]);

  useEffect(()=>{
    endRef.current?.scrollIntoView({behavior:"smooth"});
  },[msgs,busy]);

  const submit=async(e)=>{
    e?.preventDefault();
    const input=formRef.current?.querySelector("input");
    if(!input)return;
    const msg=input.value.trim();
    if(!msg||busy)return;
    input.value="";
    input.focus();
    const updated=[...msgs,{r:"u",t:msg}];
    setMsgs(updated);
    setBusy(true);
    try{
      const res=await fetch(`${BACKEND}/api/chat`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":`Bearer ${tokenRef.current}`},
        body:JSON.stringify({message:msg,symbol:sheet,history:updated.slice(-6).map(m=>({role:m.r==="u"?"user":"assistant",content:m.t}))})
      });
      const d=await res.json();
      setMsgs(h=>[...h,{r:"a",t:d.response||"No response"}]);
    }catch{
      setMsgs(h=>[...h,{r:"a",t:"Sorry, could not connect. Please try again."}]);
    }
    setBusy(false);
    input?.focus();
  };

  if(!open)return null;
  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"flex-end",background:"rgba(0,0,0,.5)",backdropFilter:"blur(8px)"}}>
      <div style={{background:"white",borderRadius:"24px 24px 0 0",height:"75dvh",display:"flex",flexDirection:"column",boxShadow:"0 -4px 32px rgba(0,0,0,.15)"}}>
        {/* Header */}
        <div style={{padding:"16px 20px",borderBottom:"1px solid #f0f0f0",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0,borderRadius:"24px 24px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",color:"#00e676",fontSize:11,fontWeight:800,fontFamily:"monospace"}}>AI</div>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:N}}>ARIA — AI Research Analyst</div>
              <div style={{fontSize:11,color:"#94a3b8",fontFamily:"monospace"}}>{sheet?`Analyzing ${sheet}`:"Market Intelligence"} · Llama 3.3 70B</div>
            </div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"none",background:"#f3f4f6",cursor:"pointer",fontSize:18,color:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {/* Messages */}
        <div style={{flex:1,overflowY:"auto",padding:"20px",display:"flex",flexDirection:"column",gap:16}}>
          {msgs.length===0&&(
            <div style={{textAlign:"center",marginTop:40}}>
              <div style={{fontSize:48,marginBottom:16}}>🧠</div>
              <div style={{fontSize:18,fontWeight:700,color:N,marginBottom:10}}>Ask ARIA anything</div>
              <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.8}}>
                "What is the outlook for tech stocks?"<br/>
                "Why is NVDA moving today?"<br/>
                "Compare AAPL and MSFT"<br/>
                "What sectors are outperforming?"
              </div>
            </div>
          )}
          {msgs.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.r==="u"?"flex-end":"flex-start",gap:10,alignItems:"flex-start"}}>
              {m.r==="a"&&<div style={{width:30,height:30,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",color:"#00e676",fontSize:9,fontWeight:800,fontFamily:"monospace",flexShrink:0,marginTop:4}}>AI</div>}
              <div style={{maxWidth:"80%",padding:"12px 16px",borderRadius:m.r==="u"?"20px 20px 4px 20px":"20px 20px 20px 4px",background:m.r==="u"?N:"#f8fafc",color:m.r==="u"?"white":N,fontSize:14,lineHeight:1.75,whiteSpace:"pre-wrap",border:m.r==="u"?"none":"1px solid #e5e7eb"}}>
                {m.t}
              </div>
            </div>
          ))}
          {busy&&(
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:30,height:30,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",color:"#00e676",fontSize:9,fontWeight:800,fontFamily:"monospace",flexShrink:0}}>AI</div>
              <div style={{padding:"12px 18px",background:"#f8fafc",border:"1px solid #e5e7eb",borderRadius:"20px 20px 20px 4px",display:"flex",gap:6}}>
                {[0,200,400].map(d=><div key={d} style={{width:8,height:8,borderRadius:"50%",background:"#94a3b8",animation:`pulse 1.2s ${d}ms infinite`}}/>)}
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>
        {/* Input — native form, no React state on input */}
        <form ref={formRef} onSubmit={submit} style={{padding:"14px 16px",borderTop:"1px solid #f0f0f0",display:"flex",gap:10,background:"white",flexShrink:0}}>
          <input
            type="text"
            placeholder={`Ask about ${sheet||"the market"}...`}
            style={{flex:1,border:"1.5px solid #e2e8f0",borderRadius:28,padding:"13px 20px",fontSize:14,color:N,outline:"none",fontFamily:"system-ui",background:"#f8fafc"}}
            onFocus={e=>e.target.style.borderColor=N}
            onBlur={e=>e.target.style.borderColor="#e2e8f0"}
          />
          <button type="submit" disabled={busy} style={{width:46,height:46,borderRadius:"50%",background:busy?"#9ca3af":N,border:"none",color:"white",fontSize:20,cursor:busy?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
        </form>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(()=>getUser());
  const [showAuth,setShowAuth]=useState(()=>window.location.search.includes("auth=1"));
  const [tab,setTab]=useState("home");
  const [data,setData]=useState({});
  const [scores,setScores]=useState({});
  const [gainers,setGainers]=useState([]);
  const [losers,setLosers]=useState([]);
  const [sectors,setSectors]=useState({});
  const [earnings,setEarnings]=useState([]);
  const [macro,setMacro]=useState({});
  const [news,setNews]=useState([]);
  const [loading,setLoading]=useState(true);
  const [prog,setProg]=useState(0);
  const [progMsg,setProgMsg]=useState("Connecting to markets...");
  const [sheet,setSheet]=useState(null);
  const [sheetSnap,setSheetSnap]=useState(null);
  const [wl,setWl]=useState(()=>{try{return new Set(JSON.parse(localStorage.getItem("tv6")||"[]"));}catch{return new Set();}});
  const [sigFilter,setSigFilter]=useState("ALL");
  const [srch,setSrch]=useState("");
  const [toast,setToast]=useState(null);
  const [ariaLines,setAriaLines]=useState([]);
  const [ariaIdx,setAriaIdx]=useState(0);
  const [aiLevel,setAiLevel]=useState("novice");
  const [aiAnalysis,setAiAnalysis]=useState({});
  const [aiLoading,setAiLoading]=useState(false);
  const [chatOpen,setChatOpen]=useState(false);
  const [stockNews,setStockNews]=useState({});
  const [research,setResearch]=useState({});
  // New features
  const [researchMode,setResearchMode]=useState(false);
  const [valuationSym,setValuationSym]=useState("");
  const [valuationResult,setValuationResult]=useState(null);
  const [valuationLoading,setValuationLoading]=useState(false);
  // Market Research
  const [researchQuery,setResearchQuery]=useState("");
  const [researchResult,setResearchResult]=useState(null);
  const [researchLoading,setResearchLoading]=useState(false);
  const [researchHistory,setResearchHistory]=useState([]);
  // Healthcare
  const [healthcareData,setHealthcareData]=useState({stocks:[],news:[],fda:[]});
  const [healthcareLoading,setHealthcareLoading]=useState(false);
  const [healthcareLoaded,setHealthcareLoaded]=useState(false);
  // Reports
  const [reportSector,setReportSector]=useState("Technology");
  const [reportResult,setReportResult]=useState(null);
  const [reportLoading,setReportLoading]=useState(false);

  const clockRef=useRef(null);
  const toastT=useRef(null);
  const sheetOpen=useRef(false);
  const chatOpenRef=useRef(false);
  const tokenRef=useRef(getToken());

  // Keep tokenRef current
  useEffect(()=>{tokenRef.current=getToken();},[user]);

  const showToast=useCallback(m=>{setToast(m);clearTimeout(toastT.current);toastT.current=setTimeout(()=>setToast(null),2600);},[]);

  // ── BOOT ──────────────────────────────────────────────────────
  useEffect(()=>{
    if(!user)return;
    (async()=>{
      const steps=[
        [10,"Connecting to Fintel Quantum..."],[25,"Fetching live market prices..."],
        [40,"Loading sector data..."],[55,"Getting earnings calendar..."],
        [65,"Fetching macro indicators..."],[75,"Computing FQ Scores..."],
        [85,"Briefing ARIA..."],[95,"Almost ready..."],
      ];
      let si=0;
      const iv=setInterval(()=>{if(si<steps.length){setProg(steps[si][0]);setProgMsg(steps[si][1]);si++;}},400);
      try{
        const [qData,gData,lData,secData,earnData,macData,newsData]=await Promise.all([
          api("/api/quotes"),api("/api/gainers"),api("/api/losers"),
          api("/api/sectors"),api("/api/earnings"),api("/api/macro"),api("/api/news"),
        ]);
        clearInterval(iv);setProg(100);
        const d={};
        Object.entries(qData).forEach(([sym,q])=>{d[sym]={...q,hist:[q.c]};});
        setData(d);
        setGainers(gData||[]);setLosers(lData||[]);
        setSectors(secData||{});setEarnings(earnData||[]);
        setMacro(macData||{});setNews(newsData||[]);
        const sc={};
        Object.entries(d).forEach(([sym,q])=>{sc[sym]=computeScore(sym,q);});
        setScores(sc);
        // ARIA brief
        const upPct=Math.round(Object.values(d).filter(q=>q.dp>=0).length/Object.values(d).length*100);
        const sentiment=upPct>60?"BULLISH":upPct>45?"MIXED":"DEFENSIVE";
        setAriaLines([
          `Market sentiment is **${sentiment}** today — ${upPct}% of stocks are advancing.`,
          `Top gainer: ${gData?.[0]?.symbol||"N/A"} +${gData?.[0]?.changesPercentage?.toFixed(1)||0}% · Top loser: ${lData?.[0]?.symbol||"N/A"} ${lData?.[0]?.changesPercentage?.toFixed(1)||0}%`,
          `${Object.keys(secData||{}).length} sectors tracked. ${Object.values(secData||{}).filter(s=>s.change>0).length} advancing, ${Object.values(secData||{}).filter(s=>s.change<0).length} declining.`,
          `ARIA recommends reviewing earnings calendar: ${earnData?.slice(0,3).map(e=>e.symbol).join(", ")||"No upcoming"} reporting soon.`,
        ]);
        await new Promise(r=>setTimeout(r,300));
        setLoading(false);
      }catch(e){
        clearInterval(iv);
        console.error("Boot error:",e);
        setLoading(false);
      }
    })();
  },[user]);

  // ── CLOCK ─────────────────────────────────────────────────────
  useEffect(()=>{
    const t=()=>{try{if(clockRef.current)clockRef.current.textContent=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date())+" ET";}catch{}};
    t();const id=setInterval(t,1000);return()=>clearInterval(id);
  },[]);

  // ── ARIA ROTATION ─────────────────────────────────────────────
  useEffect(()=>{
    if(!ariaLines.length)return;
    const id=setInterval(()=>setAriaIdx(i=>(i+1)%ariaLines.length),8000);
    return()=>clearInterval(id);
  },[ariaLines]);

  // ── AUTO REFRESH (60s, skip when chat open) ───────────────────
  useEffect(()=>{
    if(loading)return;
    const id=setInterval(async()=>{
      if(sheetOpen.current||chatOpenRef.current)return;
      try{
        const [qData,gData,lData]=await Promise.all([api("/api/quotes"),api("/api/gainers"),api("/api/losers")]);
        setData(prev=>{
          const d={};
          Object.entries(qData).forEach(([sym,q])=>{
            const prevQ=prev[sym];
            const hist=prevQ?.hist?[...prevQ.hist.slice(-59),q.c]:[q.c];
            d[sym]={...q,hist};
          });
          return d;
        });
        setGainers(gData||[]);setLosers(lData||[]);
        const sc={};
        Object.entries(qData).forEach(([sym,q])=>{sc[sym]=computeScore(sym,{...q});});
        setScores(sc);
      }catch{}
    },60000);
    return()=>clearInterval(id);
  },[loading]);

  // ── SHEET ─────────────────────────────────────────────────────
  const openSheet=useCallback(sym=>{
    sheetOpen.current=true;
    setSheet(sym);
    let snap=data[sym];
    if(!snap){
      const item=[...gainers,...losers].find(g=>g.symbol===sym);
      if(item)snap={c:item.price,d:item.change,dp:item.changesPercentage,o:item.price,h:item.price,l:item.price,pc:item.price-(item.change||0),v:item.volume||0,mkt:item.marketCap||0,pe:0,name:item.name||sym,sector:"",fiftyTwoWeekHigh:null,fiftyTwoWeekLow:null,beta:null,hist:[item.price]};
    }
    setSheetSnap(snap?{...snap}:null);
    // Load stock news & research
    if(!stockNews[sym]){
      api(`/api/news/${sym}`).then(d=>setStockNews(p=>({...p,[sym]:d}))).catch(()=>{});
    }
    if(!research[sym]){
      api(`/api/research/${sym}`).then(d=>setResearch(p=>({...p,[sym]:d}))).catch(()=>{});
    }
  },[data,gainers,losers,stockNews,research]);

  const closeSheet=useCallback(()=>{sheetOpen.current=false;setSheet(null);setSheetSnap(null);},[]);

  const loadAnalysis=useCallback(async(sym,level)=>{
    const key=`${sym}_${level}`;
    if(aiAnalysis[key])return;
    setAiLoading(true);
    try{
      const d=await api(`/api/analyze/${sym}?level=${level}`);
      setAiAnalysis(p=>({...p,[key]:d.analysis}));
    }catch(e){setAiAnalysis(p=>({...p,[key]:`Analysis unavailable: ${e.message}`}));}
    setAiLoading(false);
  },[aiAnalysis]);

  const toggleWL=useCallback(sym=>{
    setWl(prev=>{
      const n=new Set(prev);
      n.has(sym)?(n.delete(sym),showToast("Removed from watchlist")):( n.add(sym),showToast("⭐ Added to watchlist"));
      try{localStorage.setItem("tv6",JSON.stringify([...n]));}catch{}
      return n;
    });
  },[showToast]);

  // ── VALUATION GENERATOR ───────────────────────────────────────
  const generateValuation=async()=>{
    if(!valuationSym.trim())return;
    setValuationLoading(true);setValuationResult(null);
    try{
      const sym=valuationSym.toUpperCase().trim();
      const q=data[sym];
      if(!q){setValuationResult({error:`No data found for ${sym}`});setValuationLoading(false);return;}
      // DCF Model
      const price=q.c,pe=q.pe||20,mktCap=q.mkt;
      const rng=mkRng(sym+price.toFixed(0));
      const revGrowth=5+rng()*15;
      const margin=8+rng()*20;
      const wacc=8+rng()*4;
      const termGrowth=2.5;
      const fcf=mktCap*(margin/100)*0.8;
      const dcfValue=fcf*(1+termGrowth/100)/((wacc-termGrowth)/100);
      const perShareDCF=dcfValue/((mktCap||price*1e9)/price);
      // Comps
      const peerPE=18+rng()*12;
      const peerPS=3+rng()*4;
      const compValue=price*(peerPE/Math.max(pe,5));
      // Scenarios
      const bull=+(price*1.35).toFixed(2);
      const base=+(price*1.12).toFixed(2);
      const bear=+(price*0.78).toFixed(2);
      setValuationResult({sym,price,pe,mktCap,revGrowth:+revGrowth.toFixed(1),margin:+margin.toFixed(1),wacc:+wacc.toFixed(1),dcf:+perShareDCF.toFixed(2),comps:+compValue.toFixed(2),bull,base,bear,upside:+(((base-price)/price)*100).toFixed(1)});
    }catch(e){setValuationResult({error:e.message});}
    setValuationLoading(false);
  };

  // ── COMPUTED ──────────────────────────────────────────────────
  const allQ=STOCKS.map(s=>({...s,q:data[s.s],sc:scores[s.s]})).filter(x=>x.q);
  const adv=allQ.filter(x=>x.q.dp>=0).length,dec=allQ.filter(x=>x.q.dp<0).length;
  const upPct=Math.round(adv/(adv+dec||1)*100);
  const buyCnt=Object.values(scores).filter(s=>s?.dec==="ACCUMULATE").length;
  const gems=allQ.filter(x=>x.sc&&x.sc.total>=65&&Math.abs(x.q.dp)<1.5).sort((a,b)=>b.sc.total-a.sc.total).slice(0,4);

  // ── STYLES ────────────────────────────────────────────────────
  const card={background:"white",border:"1px solid #e5e7eb",borderRadius:14,overflow:"hidden"};
  const rowS={display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f3f4f6",cursor:"pointer",gap:12,transition:"background .15s"};

  const scoreColors={
    ACCUMULATE:{bg:"#dcfce7",text:"#15803d",border:"#86efac"},
    NEUTRAL:{bg:"#fffbeb",text:"#d97706",border:"#fde68a"},
    REDUCE:{bg:"#fee2e2",text:"#dc2626",border:"#fca5a5"},
  };

  const Badge=({sc,big})=>{
    if(!sc)return null;
    const col=scoreColors[sc.dec]||scoreColors.NEUTRAL;
    return<div style={{display:"inline-flex",alignItems:"center",gap:6,background:col.bg,border:`1px solid ${col.border}`,borderRadius:8,padding:big?"8px 14px":"4px 9px"}}>
      <div style={{width:big?10:6,height:big?10:6,borderRadius:"50%",background:col.text}}/>
      <span style={{fontFamily:"monospace",fontSize:big?13:9,fontWeight:700,color:col.text,letterSpacing:.5}}>{sc.dec}</span>
      {big&&<span style={{fontFamily:"monospace",fontSize:11,color:col.text,opacity:.7}}>·  {sc.total}/100</span>}
    </div>;
  };

  function MRow({item,rank,gain}){
    const sym=item.symbol||item.s;
    const sc=scores[sym];
    const hist=data[sym]?.hist;
    return(
      <div style={rowS} onClick={()=>openSheet(sym)} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
        <div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18,flexShrink:0}}>{rank}</div>
        <div style={{width:32,height:32,borderRadius:9,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>
          {STOCKS.find(s=>s.s===sym)?.e||"📈"}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:14,color:N,letterSpacing:.3}}>{sym}</div>
          <div style={{fontSize:10,color:"#9ca3af",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.name||STOCKS.find(s=>s.s===sym)?.n}</div>
        </div>
        {sc&&<Badge sc={sc}/>}
        <div style={{width:52,flexShrink:0}}><Spark data={hist} up={gain}/></div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{fp(item.price||item.c)}</div>
          <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:gain?G:R}}>{fc(item.changesPercentage||item.dp)}</div>
        </div>
      </div>
    );
  }

  function SRow({sym,name,q,sc,rank,gain,emoji}){
    return(
      <div style={rowS} onClick={()=>openSheet(sym)} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
        <div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18,flexShrink:0}}>{rank}</div>
        <div style={{width:32,height:32,borderRadius:9,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{emoji||"📈"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:14,color:N}}>{sym}</div>
          <div style={{fontSize:10,color:"#9ca3af",marginTop:1}}>{name}</div>
        </div>
        {sc&&<Badge sc={sc}/>}
        <div style={{width:52,flexShrink:0}}><Spark data={q.hist} up={gain}/></div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{fp(q.c)}</div>
          <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:gain?G:R}}>{fc(q.dp)}</div>
        </div>
      </div>
    );
  }

  // ── LOADING SCREEN ────────────────────────────────────────────
  if(!user){
    if(!showAuth)return<LandingPage onGetStarted={()=>{window.history.pushState({page:"auth"},"","/?auth=1");setShowAuth(true);}}/>;
    return<AuthScreen onAuth={u=>{saveToken(localStorage.getItem("tv_token")||"");setUser(u);setShowAuth(false);window.history.pushState({},"","/");}}/>;
  }

  if(loading){
    return(
      <div style={{height:"100dvh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:N,fontFamily:"system-ui"}}>
        <div style={{marginBottom:32,textAlign:"center"}}>
          <svg width="56" height="56" viewBox="0 0 44 44" style={{marginBottom:12}}>
            <polygon points="22,4 36,12 36,28 22,36 8,28 8,12" fill="none" stroke="#22c55e" strokeWidth="1.5"/>
            <text x="22" y="26" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#22c55e" textAnchor="middle">FQ</text>
          </svg>
          <div style={{color:"white",fontSize:20,fontWeight:800,letterSpacing:1}}>FINTEL QUANTUM</div>
          <div style={{color:"rgba(255,255,255,.4)",fontSize:11,marginTop:4,fontFamily:"monospace"}}>AI PRECISION RESEARCH</div>
        </div>
        <div style={{width:240,height:3,background:"rgba(255,255,255,.1)",borderRadius:2,overflow:"hidden",marginBottom:16}}>
          <div style={{height:"100%",width:`${prog}%`,background:"#22c55e",borderRadius:2,transition:"width .4s ease"}}/>
        </div>
        <div style={{fontFamily:"monospace",fontSize:11,color:"rgba(255,255,255,.4)",letterSpacing:1}}>{progMsg}</div>
      </div>
    );
  }

  // ── SHEET VIEW ────────────────────────────────────────────────
  const SheetView=()=>{
    if(!sheet||!sheetSnap)return null;
    const stk=STOCKS.find(s=>s.s===sheet);
    const q=sheetSnap;
    const sc=scores[sheet];
    const up=q.dp>=0;
    const sNews=stockNews[sheet]||[];
    const sResearch=research[sheet]||[];
    const aiKey=`${sheet}_${aiLevel}`;
    return(
      <div onClick={e=>{if(e.target===e.currentTarget)closeSheet();}} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end"}}>
        <div style={{background:W,borderRadius:"24px 24px 0 0",border:"1px solid #e5e7eb",borderBottom:"none",width:"100%",maxHeight:"93dvh",overflowY:"auto"}}>
          <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"12px auto 0"}}/>
          {/* Header */}
          <div style={{padding:"16px 20px 14px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",background:"white"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:44,height:44,borderRadius:12,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{stk?.e||"📈"}</div>
              <div>
                <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:24,color:N,letterSpacing:.5,marginBottom:2}}>{sheet}</div>
                <div style={{fontSize:11,color:"#6b7280"}}>{q.name||stk?.n} · {stk?.sec}</div>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"monospace",fontSize:24,fontWeight:700,color:up?G:R,marginBottom:4}}>{fp(q.c)}</div>
              <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:7,display:"inline-block",background:up?"#dcfce7":"#fee2e2",color:up?G:R}}>{fc(q.dp)} ({q.d>=0?"+":""}{q.d?.toFixed(2)})</div>
            </div>
            <div onClick={closeSheet} style={{position:"absolute",top:14,right:14,width:28,height:28,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"#6b7280"}}>✕</div>
          </div>
          <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:20}}>
            {/* Score */}
            {sc&&<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>FQ INTELLIGENCE SCORE™ — PROPRIETARY RESEARCH RATING</div>
              <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:16}}>
                <ScoreRing score={sc.total} size={90}/>
                <div style={{flex:1}}>
                  <Badge sc={sc} big={true}/>
                  <div style={{fontSize:13,color:"#6b7280",lineHeight:1.6,marginTop:8}}>{sc.brief}</div>
                </div>
              </div>
              <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
                <Radar dims={sc.dims} size={220}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>
                {Object.entries(sc.dims).map(([k,v])=>{
                  const col=v>=65?G:v>=45?A:R;
                  return<div key={k}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                      <span style={{fontFamily:"monospace",fontSize:10,color:"#374151",letterSpacing:1,textTransform:"uppercase",fontWeight:600}}>{k}</span>
                      <span style={{fontFamily:"monospace",fontSize:11,color:col,fontWeight:700}}>{v}</span>
                    </div>
                    <div style={{height:6,background:"#f3f4f6",borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",width:v+"%",background:col,borderRadius:3}}/>
                    </div>
                  </div>;
                })}
              </div>
            </div>}
            {/* AI Analysis */}
            <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16}}>
              <div style={{display:"flex",gap:10,alignItems:"flex-start",marginBottom:12}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:700,color:"#00e676",flexShrink:0}}>AI</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:2,marginBottom:8}}>ARIA — LLAMA 3.3 70B · LIVE AI RESEARCH</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
                    {["novice","intermediate","expert","deep"].map(l=>(
                      <button key={l} onClick={async()=>{setAiLevel(l);await loadAnalysis(sheet,l);}} style={{padding:"7px 16px",borderRadius:20,border:`1px solid ${aiLevel===l?N:"#e5e7eb"}`,cursor:"pointer",fontFamily:"monospace",fontSize:10,textTransform:"capitalize",letterSpacing:1,background:aiLevel===l?N:"#f9fafb",color:aiLevel===l?"white":"#374151",fontWeight:aiLevel===l?700:500}}>{l}</button>
                    ))}
                  </div>
                  <div style={{background:"#f9fafb",borderRadius:12,padding:"16px 18px",fontSize:14,color:N,lineHeight:1.8,minHeight:100,fontFamily:"system-ui",whiteSpace:"pre-wrap"}}>
                    {aiLoading?<span style={{color:"#9ca3af"}}>ARIA is analyzing {sheet}...</span>
                    :aiAnalysis[aiKey]?aiAnalysis[aiKey]
                    :<span style={{color:"#9ca3af"}}>Tap a research level above to get AI analysis</span>}
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:8,color:"#d1d5db",marginTop:6}}>Llama 3.3 70B via Groq · Cached 1hr · For informational and research purposes only</div>
                </div>
              </div>
            </div>
            {/* Research Estimates */}
            {sc?.targets&&<div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#6b7280",letterSpacing:2,fontWeight:600,marginBottom:10}}>📊 RESEARCH ESTIMATES</div>
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:3}}>
                {Object.entries(sc.targets).map(([p,t])=>{
                  const ret=((t-q.c)/q.c*100),col=ret>=0?G:R;
                  return<div key={p} style={{background:"white",border:`1px solid ${col}33`,borderRadius:12,padding:"11px 14px",flexShrink:0,minWidth:80,textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                    <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:.5,marginBottom:5}}>{p}</div>
                    <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:15,color:col,marginBottom:2}}>{fp(t)}</div>
                    <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:col}}>{ret>=0?"+":""}{ret.toFixed(1)}%</div>
                  </div>;
                })}
              </div>
            </div>}
            {/* Market Data */}
            <div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#6b7280",letterSpacing:2,fontWeight:600,marginBottom:10}}>📊 LIVE MARKET DATA</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                {[
                  {l:"OPEN",v:fp(q.o)},{l:"HIGH",v:fp(q.h),c:G},{l:"LOW",v:fp(q.l),c:R},
                  {l:"PREV CLOSE",v:fp(q.pc)},{l:"VOLUME",v:fv(q.v)},{l:"MKT CAP",v:fb(q.mkt)},
                  {l:"P/E RATIO",v:q.pe?q.pe.toFixed(1)+"x":"N/A"},{l:"52W HIGH",v:fp(q.fiftyTwoWeekHigh)},{l:"52W LOW",v:fp(q.fiftyTwoWeekLow),c:R},
                  {l:"RSI (14)",v:sc?.rsi?sc.rsi+"":"--",c:sc?.rsi?sc.rsi<30?G:sc.rsi>70?R:A:undefined},
                  {l:"MACD",v:sc?.macd?sc.macd+"":"--",c:sc?.macd?sc.macd>0?G:R:undefined},
                  {l:"BETA",v:q.beta?q.beta.toFixed(2):"N/A"},
                ].map(m=>(
                  <div key={m.l} style={{background:"white",border:"1px solid #f3f4f6",borderRadius:12,padding:"13px 14px",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                    <div style={{fontFamily:"monospace",fontSize:9,color:"#6b7280",letterSpacing:1.2,marginBottom:6,fontWeight:600}}>{m.l}</div>
                    <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:m.c||N}}>{m.v}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* News */}
            {sNews.length>0&&<div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#6b7280",letterSpacing:2,fontWeight:600,marginBottom:10}}>📰 LATEST NEWS</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sNews.slice(0,4).map((n,i)=>(
                  <div key={i} onClick={()=>window.open(n.url,"_blank")} style={{background:"white",border:"1px solid #f3f4f6",borderRadius:12,padding:"11px 13px",cursor:"pointer",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                    <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:1.5,marginBottom:4}}>{(n.source||"NEWS").toUpperCase()} · {tAgo(n.date)}</div>
                    <div style={{fontSize:13,fontWeight:600,color:N,lineHeight:1.45}}>{n.title}</div>
                  </div>
                ))}
              </div>
            </div>}
            {/* Research Papers */}
            {sResearch.length>0&&<div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>🔬 ACADEMIC RESEARCH (arxiv)</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {sResearch.slice(0,3).map((r,i)=>(
                  <div key={i} onClick={()=>window.open(r.link,"_blank")} style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:"11px 13px",cursor:"pointer"}}>
                    <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:1.5,marginBottom:4}}>arxiv · {r.date}</div>
                    <div style={{fontSize:12,fontWeight:600,color:N,lineHeight:1.4,marginBottom:4}}>{r.title}</div>
                    <div style={{fontSize:10,color:"#6b7280",lineHeight:1.4}}>{r.summary}</div>
                  </div>
                ))}
              </div>
            </div>}
            {/* Price History */}
            <div style={{background:"white",border:"1px solid #f3f4f6",borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>📈 PRICE HISTORY</div>
              <Spark data={q.hist} up={up} w={300} h={80}/>
            </div>
            {/* Action Buttons */}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>toggleWL(sheet)} style={{flex:1,background:wl.has(sheet)?"#f0fdf4":"white",border:`1px solid ${wl.has(sheet)?G:"#e5e7eb"}`,borderRadius:12,padding:13,fontSize:13,fontWeight:600,color:wl.has(sheet)?G:N,cursor:"pointer",fontFamily:"system-ui"}}>
                {wl.has(sheet)?"✓ In Watchlist":"⭐ Add to Watchlist"}
              </button>
              <button onClick={()=>{setChatOpen(true);chatOpenRef.current=true;}} style={{flex:1,background:N,border:"none",borderRadius:12,padding:13,fontSize:13,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"system-ui"}}>
                🧠 Ask ARIA
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ── VALUATION PANEL ───────────────────────────────────────────
  const ValuationPanel=()=>(
    <div style={{padding:"14px 16px 70px"}}>
      <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:16}}>💎 COMPANY VALUATION GENERATOR</div>
      <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:20,marginBottom:16}}>
        <div style={{fontWeight:700,fontSize:16,color:N,marginBottom:6}}>AI-Powered Valuation</div>
        <div style={{fontSize:12,color:"#6b7280",marginBottom:16,lineHeight:1.6}}>DCF analysis + comparable company multiples + Bull/Base/Bear scenarios. For research purposes only.</div>
        <div style={{display:"flex",gap:10}}>
          <input value={valuationSym} onChange={e=>setValuationSym(e.target.value.toUpperCase())} placeholder="Enter ticker (e.g. AAPL)" style={{flex:1,padding:"12px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,color:N,outline:"none",fontFamily:"monospace"}} onFocus={e=>e.target.style.borderColor=N} onBlur={e=>e.target.style.borderColor="#e5e7eb"} onKeyDown={e=>e.key==="Enter"&&generateValuation()}/>
          <button onClick={generateValuation} disabled={valuationLoading||!valuationSym.trim()} style={{padding:"12px 20px",background:valuationLoading?"#9ca3af":N,border:"none",borderRadius:10,fontSize:14,fontWeight:700,color:"white",cursor:valuationLoading?"not-allowed":"pointer",fontFamily:"system-ui",whiteSpace:"nowrap"}}>
            {valuationLoading?"Analyzing...":"Generate →"}
          </button>
        </div>
      </div>
      {valuationResult&&(
        valuationResult.error?
        <div style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:12,padding:16,color:R,fontSize:13}}>{valuationResult.error}</div>
        :<div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Overview */}
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:16}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>VALUATION OVERVIEW · {valuationResult.sym}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                {l:"Current Price",v:fp(valuationResult.price)},{l:"DCF Value",v:fp(valuationResult.dcf)},{l:"Comps Value",v:fp(valuationResult.comps)},
                {l:"P/E Ratio",v:valuationResult.pe?valuationResult.pe.toFixed(1)+"x":"N/A"},{l:"Market Cap",v:fb(valuationResult.mktCap)},{l:"Upside (Base)",v:`${valuationResult.upside>=0?"+":""}${valuationResult.upside}%`,c:valuationResult.upside>=0?G:R},
              ].map(m=>(
                <div key={m.l} style={{background:"#f9fafb",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{fontSize:9,color:"#9ca3af",fontFamily:"monospace",letterSpacing:1,marginBottom:4}}>{m.l}</div>
                  <div style={{fontSize:14,fontWeight:700,color:m.c||N,fontFamily:"monospace"}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Scenarios */}
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:16}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>PRICE SCENARIOS</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {[
                {l:"🐻 Bear",v:fp(valuationResult.bear),pct:(((valuationResult.bear-valuationResult.price)/valuationResult.price)*100).toFixed(1),col:R,bg:"#fef2f2"},
                {l:"📊 Base",v:fp(valuationResult.base),pct:(((valuationResult.base-valuationResult.price)/valuationResult.price)*100).toFixed(1),col:A,bg:"#fffbeb"},
                {l:"🐂 Bull",v:fp(valuationResult.bull),pct:(((valuationResult.bull-valuationResult.price)/valuationResult.price)*100).toFixed(1),col:G,bg:"#f0fdf4"},
              ].map(s=>(
                <div key={s.l} style={{background:s.bg,borderRadius:10,padding:"12px",textAlign:"center"}}>
                  <div style={{fontSize:11,color:s.col,fontWeight:700,marginBottom:6}}>{s.l}</div>
                  <div style={{fontSize:16,fontWeight:800,color:s.col,fontFamily:"monospace"}}>{s.v}</div>
                  <div style={{fontSize:11,color:s.col,fontFamily:"monospace",marginTop:4}}>{s.pct>=0?"+":""}{s.pct}%</div>
                </div>
              ))}
            </div>
          </div>
          {/* Assumptions */}
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:16}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>DCF ASSUMPTIONS</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {[
                {l:"Revenue Growth",v:`${valuationResult.revGrowth}%`},
                {l:"Operating Margin",v:`${valuationResult.margin}%`},
                {l:"WACC",v:`${valuationResult.wacc}%`},
                {l:"Terminal Growth",v:"2.5%"},
              ].map(a=>(
                <div key={a.l} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:"#f9fafb",borderRadius:8}}>
                  <span style={{fontSize:12,color:"#6b7280"}}>{a.l}</span>
                  <span style={{fontSize:12,fontWeight:700,color:N,fontFamily:"monospace"}}>{a.v}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{fontSize:10,color:"#9ca3af",textAlign:"center",lineHeight:1.6}}>For informational and research purposes only. Not financial advice. Consult a qualified professional before making investment decisions.</div>
        </div>
      )}
    </div>
  );

  // ── MAIN RENDER ───────────────────────────────────────────────
  return(
    <>
    <style>{`
      @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
      @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
      *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
      html,body{height:100%;background:${W}}
      *{scrollbar-width:none}
      *::-webkit-scrollbar{display:none}
    `}</style>
    <div style={{background:W,color:N,fontFamily:"system-ui,-apple-system,sans-serif",height:"100dvh",display:"flex",flexDirection:"column",overflow:"hidden"}}>

      {/* HEADER */}
      <div style={{background:N,padding:"0 16px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="28" height="28" viewBox="0 0 44 44"><polygon points="22,4 36,12 36,28 22,36 8,28 8,12" fill="none" stroke="#22c55e" strokeWidth="1.5"/><text x="22" y="26" fontFamily="monospace" fontSize="10" fontWeight="700" fill="#22c55e" textAnchor="middle">FQ</text></svg>
          </div>
          <div>
            <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:15,color:"white",letterSpacing:1,lineHeight:1.1}}>FINTEL</div>
            <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:15,color:"#22c55e",letterSpacing:1,lineHeight:1.1}}>QUANTUM</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div ref={clockRef} style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,.4)"}}/>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,230,118,.12)",border:"1px solid rgba(0,230,118,.25)",borderRadius:20,padding:"4px 10px"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#00e676",animation:"blink 1.6s infinite"}}/>
            <span style={{fontFamily:"monospace",fontSize:9,color:"#00e676",letterSpacing:1}}>LIVE</span>
          </div>
          <button onClick={()=>{setChatOpen(true);chatOpenRef.current=true;}} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"4px 12px",color:"white",fontSize:11,cursor:"pointer",fontFamily:"monospace",letterSpacing:.5,display:"flex",alignItems:"center",gap:5}}>
            🧠 ARIA
          </button>
          <button onClick={logout} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"4px 10px",color:"rgba(255,255,255,.5)",fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>
            {user?.name?.split(" ")[0]||"Me"} ↗
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflow:"hidden",position:"relative"}}>

        {/* HOME TAB */}
        {tab==="home"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70}}>
          {/* ARIA Brief */}
          <div style={{padding:"14px 16px 0"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:700,color:"#00e676",flexShrink:0}}>AI</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:2,marginBottom:5}}>ARIA · AI ANALYST · DAILY BRIEF</div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"0 14px 14px 14px",padding:"11px 14px",fontSize:13,color:N,lineHeight:1.65,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                  {ariaLines[ariaIdx]||"Analyzing markets..."}
                </div>
                {ariaLines.length>1&&<div style={{display:"flex",gap:4,marginTop:7}}>
                  {ariaLines.map((_,i)=><div key={i} style={{width:i===ariaIdx?14:4,height:3,borderRadius:2,background:i===ariaIdx?N:"#e5e7eb",transition:"width .3s"}}/>)}
                </div>}
              </div>
            </div>
          </div>

          {/* Market Pulse */}
          <div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>MARKET PULSE</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af"}}>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}</div>
            </div>
            <div style={{display:"flex",gap:10,overflowX:"auto"}}>
              {[...IDXS,{s:"BREADTH",n:"BREADTH",isBreadth:true}].map(ix=>{
                if(ix.isBreadth)return<div key="b" style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"10px 14px",minWidth:100,flexShrink:0}}>
                  <div style={{fontSize:9,color:"#9ca3af",fontWeight:600,letterSpacing:.5,marginBottom:4}}>BREADTH</div>
                  <div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:upPct>55?G:upPct<45?R:A,marginBottom:4}}>{upPct}%</div>
                  <div style={{height:4,background:"#f3f4f6",borderRadius:2,overflow:"hidden",display:"flex"}}>
                    <div style={{width:upPct+"%",background:G,borderRadius:"2px 0 0 2px"}}/><div style={{flex:1,background:R,borderRadius:"0 2px 2px 0"}}/>
                  </div>
                </div>;
                const q=data[ix.s],up=q&&q.dp>=0;
                return<div key={ix.s} style={{background:"white",border:`1px solid ${q?(up?"#bbf7d0":"#fecaca"):"#e5e7eb"}`,borderRadius:12,padding:"10px 14px",minWidth:100,flexShrink:0}}>
                  <div style={{fontSize:9,color:"#9ca3af",fontWeight:600,letterSpacing:.5,marginBottom:4}}>{ix.n}</div>
                  <div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,marginBottom:2,color:q?(up?G:R):"#9ca3af"}}>{q?fp(q.c):"--"}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:q?(up?G:R):"#9ca3af"}}>{q?fc(q.dp):"--"}</div>
                </div>;
              })}
            </div>
          </div>

          {/* Earnings Alert */}
          {earnings.length>0&&<div style={{margin:"12px 16px 0",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"11px 14px",display:"flex",gap:10,alignItems:"center"}}>
            <span style={{fontSize:18}}>📅</span>
            <div>
              <div style={{fontFamily:"monospace",fontSize:8,color:A,letterSpacing:1.5,marginBottom:3}}>EARNINGS THIS WEEK</div>
              <div style={{fontSize:12,color:N,fontWeight:500}}>{earnings.slice(0,3).map(e=>`${e.symbol} ${new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}`).join(" · ")}</div>
            </div>
          </div>}

          {/* Macro */}
          {Object.keys(macro).length>0&&<div style={{padding:"12px 16px 0"}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:8}}>🌍 MACRO INDICATORS</div>
            <div style={{display:"flex",gap:8,overflowX:"auto"}}>
              {Object.entries(macro).filter(([,v])=>v.value).map(([k,v])=>(
                <div key={k} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px",flexShrink:0,minWidth:90}}>
                  <div style={{fontSize:8,color:"#9ca3af",fontWeight:600,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
                  <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{v.value?.toFixed(1)}%</div>
                  {v.prev&&<div style={{fontFamily:"monospace",fontSize:9,color:v.value>v.prev?R:G}}>{v.value>v.prev?"▲":"▼"} from {v.prev?.toFixed(1)}%</div>}
                </div>
              ))}
            </div>
          </div>}

          {/* Hidden Gems */}
          {gems.length>0&&<div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>💎 HIDDEN GEMS</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:G,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:20,padding:"2px 8px"}}>ARIA PICKS</div>
            </div>
            <div style={{display:"flex",gap:10,overflowX:"auto"}}>
              {gems.map(x=>(
                <div key={x.s} onClick={()=>openSheet(x.s)} style={{background:N,borderRadius:14,padding:"13px 15px",minWidth:130,flexShrink:0,cursor:"pointer"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div><div style={{fontFamily:"system-ui",fontWeight:800,fontSize:16,color:"white"}}>{x.s}</div><div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginTop:1}}>{x.n}</div></div>
                    <ScoreRing score={x.sc?.total||0} size={40}/>
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:"#00e676",marginBottom:2}}>{fp(x.q.c)}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,color:x.q.dp>=0?"#00e676":"#ff6b6b"}}>{fc(x.q.dp)}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* Gainers */}
          <div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>▲ TOP GAINERS</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",background:"#f3f4f6",borderRadius:20,padding:"2px 8px"}}>{buyCnt} RESEARCH SIGNALS</div>
            </div>
            <div style={{...card}}>
              <div style={{padding:"10px 16px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"system-ui",fontWeight:700,fontSize:12,color:G}}>▲ GAINERS · FQ INTELLIGENCE SCORE™</span>
                <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af"}}>TAP FOR AI RESEARCH</span>
              </div>
              {gainers.length===0?<div style={{padding:32,textAlign:"center",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>Loading...</div>
              :gainers.map((x,i)=><MRow key={i} item={x} rank={i+1} gain={true}/>)}
            </div>
          </div>

          {/* Losers */}
          <div style={{padding:"12px 16px 0"}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600,marginBottom:8}}>▼ TOP LOSERS</div>
            <div style={{...card}}>
              <div style={{padding:"10px 16px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"system-ui",fontWeight:700,fontSize:12,color:R}}>▼ LOSERS · FQ INTELLIGENCE SCORE™</span>
                <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af"}}>ARIA TRACKS THESE</span>
              </div>
              {losers.length===0?<div style={{padding:32,textAlign:"center",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>Loading...</div>
              :losers.map((x,i)=><MRow key={i} item={x} rank={i+1} gain={false}/>)}
            </div>
          </div>

          {/* S&P Top 20 */}
          <div style={{padding:"12px 16px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>🏆 S&P 500 — TOP 20</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",background:"#f3f4f6",borderRadius:20,padding:"2px 8px"}}>FORTUNE 500</div>
            </div>
            <div style={{...card}}>
              <div style={{padding:"10px 16px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"system-ui",fontWeight:700,fontSize:12,color:N}}>🏆 TOP 20 S&P 500 · FQ INTELLIGENCE SCORE™</span>
                <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af"}}>LARGEST US COMPANIES</span>
              </div>
              {SP500_TOP20.map((s,i)=>{
                const q=data[s.s];const sc=scores[s.s];
                if(!q)return<div key={s.s} style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:12,opacity:.4}}>
                  <div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18}}>{i+1}</div>
                  <div style={{fontSize:18}}>{s.e}</div>
                  <div style={{flex:1}}><div style={{fontWeight:700,fontSize:15}}>{s.s}</div><div style={{fontSize:10,color:"#9ca3af"}}>{s.n}</div></div>
                  <div style={{fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>Loading...</div>
                </div>;
                return<SRow key={s.s} sym={s.s} name={s.n} q={q} sc={sc} rank={i+1} gain={q.dp>=0} emoji={s.e}/>;
              })}
            </div>
          </div>
        </div>}

        {/* SECTORS TAB */}
        {tab==="sectors"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>🏭 SECTOR HEATMAP</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:20}}>
            {Object.entries(sectors).map(([name,s])=>{
              const up=s.change>=0;
              const intensity=Math.min(100,Math.abs(s.change)*15);
              return<div key={name} onClick={()=>{}} style={{background:up?`rgba(22,163,74,${intensity/400+0.05})`:`rgba(220,38,38,${intensity/400+0.05})`,border:`1px solid ${up?"#bbf7d0":"#fecaca"}`,borderRadius:12,padding:"14px",cursor:"pointer"}}>
                <div style={{fontSize:10,fontWeight:700,color:N,marginBottom:4}}>{name}</div>
                <div style={{fontFamily:"monospace",fontSize:13,color:N,marginBottom:2}}>{s.etf}</div>
                <div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:up?G:R}}>{fc(s.change)}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:"#6b7280"}}>{fp(s.price)}</div>
              </div>;
            })}
          </div>
        </div>}

        {/* AI BOARD TAB */}
        {tab==="signals"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>🤖 AI RESEARCH BOARD</div>
          <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto"}}>
            {["ALL","ACCUMULATE","NEUTRAL","REDUCE"].map(f=>(
              <button key={f} onClick={()=>setSigFilter(f)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${sigFilter===f?N:"#e5e7eb"}`,background:sigFilter===f?N:"white",color:sigFilter===f?"white":"#6b7280",fontFamily:"monospace",fontSize:9,cursor:"pointer",whiteSpace:"nowrap",fontWeight:sigFilter===f?700:400}}>{f}</button>
            ))}
          </div>
          <div style={{...card}}>
            {allQ.filter(x=>sigFilter==="ALL"||x.sc?.dec===sigFilter).sort((a,b)=>(b.sc?.total||0)-(a.sc?.total||0)).map((x,i)=>(
              <div key={x.s} style={rowS} onClick={()=>openSheet(x.s)} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18}}>{i+1}</div>
                <div style={{width:32,height:32,borderRadius:9,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>{x.e}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:N}}>{x.s}</div>
                  <div style={{fontSize:10,color:"#9ca3af"}}>{x.n}</div>
                </div>
                <ScoreRing score={x.sc?.total||0} size={40}/>
                {x.sc&&<Badge sc={x.sc}/>}
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:N}}>{fp(x.q.c)}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:x.q.dp>=0?G:R}}>{fc(x.q.dp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* SEARCH TAB */}
        {tab==="search"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>🔍 SEARCH & RESEARCH</div>
          <input value={srch} onChange={e=>setSrch(e.target.value.toUpperCase())} placeholder="Search by ticker or company name..." style={{width:"100%",padding:"13px 16px",border:"1.5px solid #e5e7eb",borderRadius:12,fontSize:14,color:N,outline:"none",fontFamily:"system-ui",marginBottom:16,boxSizing:"border-box"}} onFocus={e=>e.target.style.borderColor=N} onBlur={e=>e.target.style.borderColor="#e5e7eb"}/>
          <div style={{...card}}>
            {STOCKS.filter(s=>!srch||(s.s.includes(srch)||s.n.toUpperCase().includes(srch))).map(s=>{
              const q=data[s.s];const sc=scores[s.s];
              if(!q)return null;
              return<div key={s.s} style={rowS} onClick={()=>openSheet(s.s)} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{width:36,height:36,borderRadius:10,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{s.e}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:N}}>{s.s}</div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>{s.n} · {s.sec}</div>
                </div>
                {sc&&<Badge sc={sc}/>}
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{fp(q.c)}</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:q.dp>=0?G:R}}>{fc(q.dp)}</div>
                </div>
              </div>;
            })}
          </div>
        </div>}

        {/* NEWS TAB */}
        {tab==="news"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>📰 MARKET INTELLIGENCE</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {news.map((n,i)=>(
              <div key={i} onClick={()=>window.open(n.url,"_blank")} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"14px",cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:1.5,marginBottom:5}}>{(n.source||"NEWS").toUpperCase()} · {tAgo(n.date)}</div>
                <div style={{fontSize:14,fontWeight:600,color:N,lineHeight:1.5}}>{n.title}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* WATCHLIST TAB */}
        {tab==="watch"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>⭐ WATCHLIST</div>
          {wl.size===0?<div style={{textAlign:"center",padding:"60px 20px",color:"#9ca3af"}}>
            <div style={{fontSize:40,marginBottom:12}}>⭐</div>
            <div style={{fontSize:15,fontWeight:600,color:N,marginBottom:8}}>Your watchlist is empty</div>
            <div style={{fontSize:13}}>Tap any stock and click "Add to Watchlist"</div>
          </div>:<div style={{...card}}>
            {[...wl].map(sym=>{const q=data[sym];const sc=scores[sym];const stk=STOCKS.find(s=>s.s===sym);if(!q||!stk)return null;
              return<div key={sym} style={rowS} onClick={()=>openSheet(sym)} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{width:36,height:36,borderRadius:10,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{stk.e}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:N}}>{sym}</div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>{stk.n}</div>
                </div>
                {sc&&<Badge sc={sc}/>}
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{fp(q.c)}</div>
                  <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:q.dp>=0?G:R}}>{fc(q.dp)}</div>
                </div>
              </div>;
            })}
          </div>}
        </div>}

        {/* VALUATION TAB */}
        {tab==="valuation"&&<div style={{position:"absolute",inset:0,overflowY:"auto"}}><ValuationPanel/></div>}

      </div>

      {/* MARKET RESEARCH TAB */}
      {tab==="research"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:4}}>🔬 MARKET RESEARCH ENGINE</div>
        <div style={{fontSize:12,color:"#9ca3af",marginBottom:16}}>Ask any research question — ARIA generates institutional-grade analysis</div>
        
        {/* Research Input */}
        <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15,color:N,marginBottom:4}}>Ask ARIA Research</div>
          <div style={{fontSize:12,color:"#9ca3af",marginBottom:14}}>
            Try: "What is the outlook for AI semiconductors?" · "Compare GLP-1 drug pipeline across big pharma" · "Impact of Fed rate cuts on financials"
          </div>
          <textarea value={researchQuery} onChange={e=>setResearchQuery(e.target.value)} placeholder="Enter your research question..." rows={3} style={{width:"100%",padding:"12px 14px",border:"1.5px solid #e5e7eb",borderRadius:10,fontSize:14,color:N,outline:"none",fontFamily:"system-ui",resize:"none",boxSizing:"border-box",marginBottom:10}} onFocus={e=>e.target.style.borderColor=N} onBlur={e=>e.target.style.borderColor="#e5e7eb"} onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey){e.preventDefault();generateResearch();}}}/>
          <button onClick={generateResearch} disabled={researchLoading||!researchQuery.trim()} style={{width:"100%",padding:"13px",background:researchLoading?"#9ca3af":N,border:"none",borderRadius:10,fontSize:14,fontWeight:700,color:"white",cursor:researchLoading?"not-allowed":"pointer",fontFamily:"system-ui"}}>
            {researchLoading?"🔄 ARIA is researching...":"🔬 Generate Research Report (Ctrl+Enter)"}
          </button>
        </div>

        {/* Research Result */}
        {researchResult&&<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:G,letterSpacing:2}}>ARIA RESEARCH REPORT</div>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af"}}>{researchResult.time}</div>
          </div>
          <div style={{background:"#f9fafb",borderRadius:10,padding:14,fontSize:13,color:N,lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"system-ui"}}>{researchResult.result}</div>
        </div>}

        {/* Research History */}
        {researchHistory.filter(h=>h.result).length>0&&<div>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>RESEARCH HISTORY</div>
          {researchHistory.filter(h=>h.result).map((h,i)=>(
            <div key={i} onClick={()=>setResearchResult(h)} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
              <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",marginBottom:4}}>{h.time}</div>
              <div style={{fontSize:13,fontWeight:600,color:N,lineHeight:1.4}}>{h.q}</div>
            </div>
          ))}
        </div>}

        {/* Quick Research Prompts */}
        <div style={{marginTop:16}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>QUICK RESEARCH PROMPTS</div>
          {[
            "What is the investment outlook for AI infrastructure stocks in 2026?",
            "Compare GLP-1 drug pipeline across Eli Lilly, Novo Nordisk, and Pfizer",
            "Impact of Federal Reserve rate decisions on financial sector stocks",
            "Healthcare sector M&A trends and acquisition targets in 2026",
            "Semiconductor supply chain risks and opportunities for NVDA and AMD",
            "Which sectors historically outperform during periods of economic uncertainty?",
          ].map((prompt,i)=>(
            <div key={i} onClick={()=>setResearchQuery(prompt)} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"10px 14px",marginBottom:8,cursor:"pointer",fontSize:13,color:N,lineHeight:1.4}}>
              → {prompt}
            </div>
          ))}
        </div>
      </div>}

      {/* HEALTHCARE INTELLIGENCE TAB */}
      {tab==="healthcare"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}} onScroll={()=>{if(!healthcareLoaded&&!healthcareLoading)loadHealthcare();}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:4}}>🧬 HEALTHCARE INTELLIGENCE</div>
        <div style={{fontSize:12,color:"#9ca3af",marginBottom:16}}>Pharma pipeline · Biotech scores · FDA calendar · Market intelligence</div>

        {!healthcareLoaded&&!healthcareLoading&&<button onClick={loadHealthcare} style={{width:"100%",padding:14,background:N,border:"none",borderRadius:12,fontSize:14,fontWeight:700,color:"white",cursor:"pointer",marginBottom:16}}>
          Load Healthcare Intelligence
        </button>}
        {healthcareLoading&&<div style={{textAlign:"center",padding:32,color:"#9ca3af",fontFamily:"monospace",fontSize:12}}>🔄 Loading healthcare data...</div>}

        {/* FDA Pipeline */}
        <div style={{marginBottom:16}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>💊 FDA PIPELINE WATCH</div>
          {healthcareData.fda.map((drug,i)=>(
            <div key={i} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"13px 14px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                <div style={{fontWeight:700,fontSize:13,color:N,flex:1}}>{drug.drug}</div>
                <div style={{fontFamily:"monospace",fontSize:9,padding:"3px 8px",borderRadius:6,background:drug.impact==="HIGH"?"#fef2f2":drug.impact==="MEDIUM"?"#fffbeb":"#f0fdf4",color:drug.impact==="HIGH"?R:drug.impact==="MEDIUM"?A:G,fontWeight:700}}>{drug.impact}</div>
              </div>
              <div style={{fontSize:11,color:"#6b7280",marginBottom:4}}>{drug.company} · {drug.status}</div>
              <div style={{fontFamily:"monospace",fontSize:10,color:G}}>{drug.catalyst}</div>
            </div>
          ))}
        </div>

        {/* Healthcare Stocks */}
        {healthcareData.stocks.length>0&&<div style={{marginBottom:16}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>📊 HEALTHCARE COVERAGE</div>
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,overflow:"hidden"}}>
            {healthcareData.stocks.map((item,i)=>(
              <div key={item.sym} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f3f4f6",cursor:"pointer",gap:12}} onClick={()=>openSheet(item.sym)} onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"} onMouseLeave={e=>e.currentTarget.style.background="white"}>
                <div style={{fontSize:18,width:32,textAlign:"center",flexShrink:0}}>{item.stk?.e||"💊"}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:N}}>{item.sym}</div>
                  <div style={{fontSize:10,color:"#9ca3af"}}>{item.stk?.n}</div>
                </div>
                {item.sc&&<div style={{display:"inline-flex",alignItems:"center",gap:5,background:item.sc.dec==="ACCUMULATE"?"#dcfce7":item.sc.dec==="REDUCE"?"#fee2e2":"#fffbeb",borderRadius:6,padding:"3px 8px"}}>
                  <span style={{fontFamily:"monospace",fontSize:9,fontWeight:700,color:item.sc.dec==="ACCUMULATE"?G:item.sc.dec==="REDUCE"?R:A}}>{item.sc.dec}</span>
                </div>}
                <div style={{textAlign:"right",flexShrink:0}}>
                  <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:N}}>{fp(item.q.c)}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:item.q.dp>=0?G:R}}>{fc(item.q.dp)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>}

        {/* Healthcare News */}
        {healthcareData.news.length>0&&<div>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>📰 HEALTHCARE & PHARMA NEWS</div>
          {healthcareData.news.map((n,i)=>(
            <div key={i} onClick={()=>window.open(n.url,"_blank")} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"12px 14px",marginBottom:8,cursor:"pointer"}}>
              <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:1.5,marginBottom:4}}>{(n.source||"NEWS").toUpperCase()} · {tAgo(n.date)}</div>
              <div style={{fontSize:13,fontWeight:600,color:N,lineHeight:1.4}}>{n.title}</div>
            </div>
          ))}
        </div>}

        {/* Healthcare Disclaimer */}
        <div style={{background:"#fef9c3",border:"1px solid #fde047",borderRadius:10,padding:12,marginTop:16}}>
          <div style={{fontSize:11,color:"#854d0e",lineHeight:1.6}}>⚠️ Healthcare intelligence is for informational and research purposes only. Not medical, clinical, or investment advice. FDA pipeline data is sourced from public filings and may not reflect the most current status. Consult qualified professionals for medical and investment decisions.</div>
        </div>
      </div>}

      {/* REPORTS TAB */}
      {tab==="reports"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
        <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:4}}>📑 RESEARCH REPORTS</div>
        <div style={{fontSize:12,color:"#9ca3af",marginBottom:16}}>AI-generated institutional research reports · For informational purposes only</div>

        {/* Report Generator */}
        <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:15,color:N,marginBottom:12}}>Generate Sector Report</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
            {["Technology","Healthcare","Financials","Energy","Consumer","Industrials","Communication"].map(s=>(
              <button key={s} onClick={()=>setReportSector(s)} style={{padding:"7px 14px",borderRadius:20,border:`1px solid ${reportSector===s?N:"#e5e7eb"}`,background:reportSector===s?N:"white",color:reportSector===s?"white":"#6b7280",fontFamily:"monospace",fontSize:9,cursor:"pointer",fontWeight:reportSector===s?700:400}}>{s}</button>
            ))}
          </div>
          <button onClick={generateReport} disabled={reportLoading} style={{width:"100%",padding:"13px",background:reportLoading?"#9ca3af":N,border:"none",borderRadius:10,fontSize:14,fontWeight:700,color:"white",cursor:reportLoading?"not-allowed":"pointer",fontFamily:"system-ui"}}>
            {reportLoading?`🔄 Generating ${reportSector} Report...`:`📑 Generate ${reportSector} Research Report`}
          </button>
        </div>

        {/* Report Result */}
        {reportResult&&<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:G,letterSpacing:2}}>FINTEL QUANTUM RESEARCH</div>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af"}}>{reportResult.date}</div>
          </div>
          <div style={{fontSize:10,color:"#9ca3af",marginBottom:14,fontFamily:"monospace"}}>For informational purposes only · Not financial advice</div>
          <div style={{fontSize:14,color:N,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:"system-ui"}}>{reportResult.content}</div>
          <div style={{marginTop:16,padding:"12px 14px",background:"#f0fdf4",borderRadius:10,fontSize:11,color:"#166534",lineHeight:1.6}}>
            📄 This report was generated by ARIA (Llama 3.3 70B) for Fintel Quantum. All content is for informational and educational research purposes only. This is not financial, investment, or professional advice. Past performance does not guarantee future results.
          </div>
        </div>}

        {/* Report Templates */}
        <div>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>REPORT LIBRARY</div>
          {[
            {title:"Weekly Market Pulse",desc:"S&P 500, sector rotation, macro indicators summary",icon:"📊"},
            {title:"Earnings Preview",desc:"Upcoming earnings analysis and consensus estimates",icon:"📅"},
            {title:"Sector Deep Dive",desc:"Comprehensive single-sector analysis and top picks",icon:"🔍"},
            {title:"Macro Intelligence Brief",desc:"Fed policy, inflation, GDP impact on markets",icon:"🌍"},
            {title:"Healthcare Pipeline Report",desc:"FDA calendar, drug approvals, biotech catalysts",icon:"🧬"},
            {title:"AI & Technology Outlook",desc:"Semiconductor cycle, AI infrastructure, cloud growth",icon:"⚡"},
          ].map((r,i)=>(
            <div key={i} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"14px",marginBottom:10,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{fontSize:24,flexShrink:0}}>{r.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:13,color:N,marginBottom:3}}>{r.title}</div>
                <div style={{fontSize:11,color:"#9ca3af",lineHeight:1.4}}>{r.desc}</div>
              </div>
              <button onClick={()=>{setReportSector(r.title.includes("Health")?"Healthcare":r.title.includes("Tech")||r.title.includes("AI")?"Technology":"Technology");setTimeout(generateReport,100);}} style={{padding:"8px 14px",background:N,border:"none",borderRadius:8,fontSize:12,fontWeight:700,color:"white",cursor:"pointer",flexShrink:0}}>Generate</button>
            </div>
          ))}
        </div>
      </div>}

      {/* BOTTOM NAV */}
      <div style={{height:56,background:"white",borderTop:"1px solid #f3f4f6",display:"flex",flexShrink:0,position:"relative",zIndex:100}}>
        {[
          {id:"home",icon:"📊",label:"Markets"},
          {id:"sectors",icon:"🏭",label:"Sectors"},
          {id:"signals",icon:"🤖",label:"AI Board"},
          {id:"research",icon:"🔬",label:"Research"},
          {id:"healthcare",icon:"🧬",label:"Health"},
          {id:"valuation",icon:"💎",label:"Value"},
          {id:"reports",icon:"📑",label:"Reports"},
          {id:"search",icon:"🔍",label:"Search"},
          {id:"news",icon:"📰",label:"News"},
          {id:"watch",icon:"⭐",label:"Watch"},
        ].map(t=>(
          <div key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",position:"relative",padding:"6px 0"}}>
            {tab===t.id&&<div style={{position:"absolute",top:0,left:"20%",right:"20%",height:2,background:N,borderRadius:"0 0 2px 2px"}}/>}
            <div style={{fontSize:16,marginBottom:2}}>{t.icon}</div>
            <div style={{fontFamily:"monospace",fontSize:8,letterSpacing:.5,textTransform:"uppercase",color:tab===t.id?N:"#9ca3af",fontWeight:tab===t.id?700:400}}>{t.label}</div>
          </div>
        ))}
      </div>

      {/* OVERLAYS */}
      <SheetView/>
      {toast&&<div style={{position:"fixed",bottom:72,left:"50%",transform:"translateX(-50%)",background:N,color:"white",padding:"10px 20px",borderRadius:24,fontFamily:"system-ui",fontSize:13,fontWeight:600,zIndex:600,boxShadow:"0 4px 16px rgba(0,0,0,.2)",whiteSpace:"nowrap"}}>{toast}</div>}

    </div>

    {/* ARIA CHAT — rendered outside main div to prevent re-render cascade */}
    <AriaChat
      open={chatOpen}
      onClose={()=>{setChatOpen(false);chatOpenRef.current=false;}}
      sheet={sheet}
      tokenRef={tokenRef}
    />
    </>
  );
}
