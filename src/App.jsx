import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND = 'https://tradvix-backend.onrender.com';

function getToken(){return localStorage.getItem("tv_token");}
function saveToken(t){localStorage.setItem("tv_token",t);}
function getUser(){
  try{
    const t=getToken();
    if(!t)return null;
    const p=JSON.parse(atob(t.split(".")[1]));
    return p.exp*1000>Date.now()?p:null;
  }catch(e){
    return null;
  }
}
function saveUser(u){}
function logout(){localStorage.removeItem("tv_token");window.location.reload();}




// ── AUTH SCREEN ──────────────────────────────────────────────

function LandingPage({onGetStarted}){
  const calledRef=useRef(false);
  
  useEffect(()=>{
    const handler=(e)=>{
      if(e.data==="fintelquantum_getstarted" && !calledRef.current){
        calledRef.current=true;
        onGetStarted();
      }
    };
    window.addEventListener("message",handler);
    return()=>window.removeEventListener("message",handler);
  },[onGetStarted]);

  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,background:"#0f172a"}}>
      <iframe
        src="/landing.html"
        style={{width:"100%",height:"100%",border:"none"}}
        title="FINTEL QUANTUM"
      />
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your name'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try{
      const endpoint=mode==='signup'?'/auth/signup':'/auth/login';
      const body=mode==='signup'?{name,email,password}:{email,password};
      const res=await fetch('https://tradvix-backend.onrender.com'+endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(body)
      });
      const data=await res.json();
      if(!res.ok){setError(data.error||'Something went wrong');setLoading(false);return;}
      saveToken(data.token);
      onAuth(data.user);
    }catch(e){
      setError('Connection error. Please try again.');
    }
    setLoading(false);
  };

  const N = '#0f172a', G = '#16a34a';

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24,fontFamily:'system-ui,-apple-system,sans-serif'}}>
      <div style={{width:'100%',maxWidth:400}}>
        {/* Logo */}
        <div style={{display:'flex',alignItems:'center',gap:10,justifyContent:'center',marginBottom:40}}>
          <div style={{width:40,height:40,background:N,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'monospace',fontSize:14,fontWeight:800,color:'#22c55e'}}>&lt;FQ&gt;</div>
          <div style={{fontFamily:'system-ui',fontWeight:800,fontSize:22,color:N,letterSpacing:.5}}>FINTEL<span style={{color:G}}>QUANTUM</span></div>
        </div>

        {/* Card */}
        <div style={{background:'white',border:'1px solid #e2e8f0',borderRadius:20,padding:32,boxShadow:'0 4px 24px rgba(0,0,0,.06)'}}>
          <h2 style={{fontSize:22,fontWeight:700,color:N,marginBottom:6,letterSpacing:-.5}}>
            {mode==='signup'?'Create your account':'Welcome back'}
          </h2>
          <p style={{fontSize:14,color:'#64748b',marginBottom:28}}>
            {mode==='signup'?'Start your free FINTEL QUANTUM account today':'Sign in to your FINTEL QUANTUM account'}
          </p>

          {mode==='signup'&&(
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:13,fontWeight:600,color:N,marginBottom:6}}>Full Name</label>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Alok Kumar Jha"
                style={{width:'100%',padding:'11px 14px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,color:N,outline:'none',fontFamily:'system-ui',transition:'border-color .2s'}}
                onFocus={e=>e.target.style.borderColor='#0f172a'}
                onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
            </div>
          )}

          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:N,marginBottom:6}}>Email Address</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" type="email"
              style={{width:'100%',padding:'11px 14px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,color:N,outline:'none',fontFamily:'system-ui',transition:'border-color .2s'}}
              onFocus={e=>e.target.style.borderColor='#0f172a'}
              onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>

          <div style={{marginBottom:24}}>
            <label style={{display:'block',fontSize:13,fontWeight:600,color:N,marginBottom:6}}>Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters" type="password"
              onKeyDown={e=>e.key==='Enter'&&submit()}
              style={{width:'100%',padding:'11px 14px',border:'1.5px solid #e2e8f0',borderRadius:10,fontSize:14,color:N,outline:'none',fontFamily:'system-ui',transition:'border-color .2s'}}
              onFocus={e=>e.target.style.borderColor='#0f172a'}
              onBlur={e=>e.target.style.borderColor='#e2e8f0'}/>
          </div>

          {error&&<div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#dc2626',marginBottom:16}}>{error}</div>}

          <button onClick={submit} disabled={loading}
            style={{width:'100%',padding:13,background:loading?'#94a3b8':N,border:'none',borderRadius:10,fontSize:15,fontWeight:700,color:'white',cursor:loading?'not-allowed':'pointer',transition:'all .2s',marginBottom:16}}>
            {loading?'Please wait...':(mode==='signup'?'Create free account →':'Sign in →')}
          </button>

          {mode==='signup'&&(
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#15803d',marginBottom:16,textAlign:'center'}}>
              ✓ Free forever &nbsp;·&nbsp; No credit card required &nbsp;·&nbsp; Cancel anytime
            </div>
          )}

          <div style={{textAlign:'center',fontSize:13,color:'#64748b'}}>
            {mode==='signup'?'Already have an account? ':"Don't have an account? "}
            <span onClick={()=>{setMode(mode==='signup'?'login':'signup');setError('');}} 
              style={{color:N,fontWeight:700,cursor:'pointer',textDecoration:'underline'}}>
              {mode==='signup'?'Sign in':'Sign up free'}
            </span>
          </div>
        </div>

        <div style={{textAlign:'center',marginTop:20,fontSize:12,color:'#94a3b8'}}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </div>
      </div>
    </div>
  );
}


// ── API ──────────────────────────────────────────────────────────
const api = async (path) => {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const r = await fetch(`${BACKEND}${path}`, { headers });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
};
const apiPost = async (path, body) => {
  const token = getToken();
  const headers = {'Content-Type':'application/json'};
  if(token) headers['Authorization'] = `Bearer ${token}`;
  const r = await fetch(`${BACKEND}${path}`, { method:'POST', headers, body:JSON.stringify(body) });
  return r.json();
};

// ── STOCKS ───────────────────────────────────────────────────────
const STOCKS = [
  {s:"NVDA",n:"NVIDIA Corp",sec:"tech",e:"⚡"},{s:"AAPL",n:"Apple Inc",sec:"tech",e:"🍎"},
  {s:"MSFT",n:"Microsoft",sec:"tech",e:"🪟"},{s:"GOOGL",n:"Alphabet",sec:"tech",e:"🔍"},
  {s:"AMZN",n:"Amazon",sec:"tech",e:"📦"},{s:"META",n:"Meta Platforms",sec:"tech",e:"📘"},
  {s:"TSLA",n:"Tesla",sec:"tech",e:"🚗"},{s:"AVGO",n:"Broadcom",sec:"tech",e:"🔧"},
  {s:"AMD",n:"AMD",sec:"tech",e:"💻"},{s:"NFLX",n:"Netflix",sec:"tech",e:"🎬"},
  {s:"JPM",n:"JPMorgan",sec:"finance",e:"🏦"},{s:"GS",n:"Goldman Sachs",sec:"finance",e:"💼"},
  {s:"V",n:"Visa",sec:"finance",e:"💳"},{s:"MA",n:"Mastercard",sec:"finance",e:"🔴"},
  {s:"BAC",n:"Bank of America",sec:"finance",e:"🏛️"},{s:"XOM",n:"Exxon Mobil",sec:"energy",e:"🛢️"},
  {s:"CVX",n:"Chevron",sec:"energy",e:"⛽"},{s:"LLY",n:"Eli Lilly",sec:"health",e:"🧬"},
  {s:"JNJ",n:"J&J",sec:"health",e:"💊"},{s:"UNH",n:"UnitedHealth",sec:"health",e:"🏥"},
  {s:"WMT",n:"Walmart",sec:"consumer",e:"🛒"},{s:"COST",n:"Costco",sec:"consumer",e:"🏪"},
  {s:"HD",n:"Home Depot",sec:"consumer",e:"🔨"},{s:"NKE",n:"Nike",sec:"consumer",e:"👟"},
  {s:"BA",n:"Boeing",sec:"industrial",e:"✈️"},{s:"CAT",n:"Caterpillar",sec:"industrial",e:"🚜"},
  {s:"DIS",n:"Disney",sec:"consumer",e:"🏰"},
];

const IDXS = [{s:"SPY",n:"S&P 500"},{s:"QQQ",n:"NASDAQ"},{s:"DIA",n:"DOW"}];

const SP500_TOP20 = [
  {s:"AAPL",n:"Apple Inc",e:"🍎"},{s:"MSFT",n:"Microsoft",e:"🪟"},
  {s:"NVDA",n:"NVIDIA",e:"⚡"},{s:"GOOGL",n:"Alphabet",e:"🔍"},
  {s:"AMZN",n:"Amazon",e:"📦"},{s:"META",n:"Meta",e:"📘"},
  {s:"TSLA",n:"Tesla",e:"🚗"},{s:"BRK-B",n:"Berkshire",e:"💰"},
  {s:"LLY",n:"Eli Lilly",e:"🧬"},{s:"AVGO",n:"Broadcom",e:"🔧"},
  {s:"JPM",n:"JPMorgan",e:"🏦"},{s:"V",n:"Visa",e:"💳"},
  {s:"XOM",n:"Exxon Mobil",e:"🛢️"},{s:"UNH",n:"UnitedHealth",e:"🏥"},
  {s:"MA",n:"Mastercard",e:"🔴"},{s:"JNJ",n:"Johnson & Johnson",e:"💊"},
  {s:"WMT",n:"Walmart",e:"🛒"},{s:"PG",n:"Procter & Gamble",e:"🧼"},
  {s:"HD",n:"Home Depot",e:"🔨"},{s:"COST",n:"Costco",e:"🏪"},
];


// ── SEEDED RNG ───────────────────────────────────────────────────
function mkRng(seed){let h=0;for(const c of String(seed))h=(h*31+c.charCodeAt(0))>>>0;return()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296;};}

// ── TECHNICALS ───────────────────────────────────────────────────
function calcRSI(c,n=14){if(!c||c.length<n+1)return null;let g=0,l=0;for(let i=1;i<=n;i++){const d=c[i]-c[i-1];d>0?g+=d:l+=Math.abs(d);}let ag=g/n,al=l/n;for(let i=n+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(n-1)+(d>0?d:0))/n;al=(al*(n-1)+(d<0?Math.abs(d):0))/n;}return al===0?100:+(100-100/(1+ag/al)).toFixed(1);}
function calcSMA(a,n){if(!a||a.length<n)return null;return +(a.slice(-n).reduce((s,v)=>s+v,0)/n).toFixed(2);}
function calcEMA(a,n){if(!a||a.length<n)return null;const k=2/(n+1);let e=a.slice(0,n).reduce((s,v)=>s+v,0)/n;for(let i=n;i<a.length;i++)e=a[i]*k+e*(1-k);return +e.toFixed(2);}
function calcBoll(c,n=20){if(!c||c.length<n)return null;const m=calcSMA(c,n),std=Math.sqrt(c.slice(-n).reduce((s,v)=>s+(v-m)**2,0)/n);return{u:+(m+2*std).toFixed(2),l:+(m-2*std).toFixed(2),m};}

// ── FINTEL QUANTUM SCORE ────────────────────────────────────────────────
function computeScore(sym,q){
  if(!q)return null;
  const c=q.hist,p=q.c;
  const rsi=calcRSI(c),sma50=calcSMA(c,Math.min(50,c.length)),sma20=calcSMA(c,Math.min(20,c.length));
  const ema12=calcEMA(c,Math.min(12,c.length)),ema26=calcEMA(c,Math.min(26,c.length));
  const macd=ema12&&ema26?+(ema12-ema26).toFixed(3):null,boll=calcBoll(c);
  let momentum=50,value=50,growth=50,safety=50,sentiment=50,technical=50;
  if(rsi){technical+=rsi<30?30:rsi<40?15:rsi>70?-30:rsi>60?-15:5;sentiment+=rsi<35?20:rsi>65?-20:0;}
  if(macd){technical+=macd>0?20:-20;momentum+=macd>0?25:-25;}
  if(sma50){const d=((p-sma50)/sma50)*100;momentum+=d>0?Math.min(20,d*2):-Math.min(20,Math.abs(d)*2);growth+=d>5?15:d>0?8:d>-5?-8:-15;}
  if(sma20){momentum+=p>sma20?15:-15;}
  if(boll){if(p<boll.l){safety+=20;value+=25;}else if(p>boll.u){safety-=20;value-=15;}else{safety+=8;}}
  if(c&&c.length>10){const vol=Math.abs(c[c.length-1]-c[c.length-10])/c[c.length-10];safety-=vol>0.15?20:vol>0.08?10:0;}
  sentiment+=q.dp>3?15:q.dp>0?8:q.dp<-3?-15:-8;momentum+=q.dp>2?12:q.dp>0?5:q.dp<-2?-12:-5;
  const clamp=v=>Math.max(10,Math.min(95,Math.round(v)));
  const dims={momentum:clamp(momentum),value:clamp(value),growth:clamp(growth),safety:clamp(safety),sentiment:clamp(sentiment),technical:clamp(technical)};
  const total=Math.round(Object.values(dims).reduce((a,b)=>a+b,0)/6);
  let dec,cls,emoji,brief;
  if(total>=72){dec="STRONG BUY";cls="sb";emoji="🚀";brief="Exceptional setup. High conviction.";}
  else if(total>=58){dec="BUY";cls="b";emoji="✅";brief="Favorable risk/reward. Consider entry.";}
  else if(total>=44){dec="HOLD";cls="h";emoji="⏸️";brief="Mixed signals. Hold and monitor.";}
  else if(total>=30){dec="SELL";cls="s";emoji="⚠️";brief="Risk outweighs reward.";}
  else{dec="STRONG SELL";cls="ss";emoji="🔴";brief="Multiple danger signals. Exit or avoid.";}
  const bias=(total-50)/500;
  const vol2=c&&c.length>5?Math.abs(c[c.length-1]-c[c.length-6])/c[c.length-6]:0.04;
  const targets={"1W":+(p*(1+bias*.1+vol2*.05)).toFixed(2),"1M":+(p*(1+bias*.4+vol2*.1)).toFixed(2),"3M":+(p*(1+bias*1.0+vol2*.2)).toFixed(2),"6M":+(p*(1+bias*1.8+vol2*.3)).toFixed(2),"1Y":+(p*(1+bias*3.0+vol2*.4)).toFixed(2)};
  return{total,dims,dec,cls,emoji,brief,targets,rsi,sma50,sma20,macd,boll};
}

// ── FORMATTERS ───────────────────────────────────────────────────
const fp=p=>!p&&p!==0?"--":p>=1000?"$"+p.toLocaleString("en",{minimumFractionDigits:2,maximumFractionDigits:2}):"$"+p.toFixed(2);
const fc=dp=>dp==null?"--":(dp>=0?"+":"")+dp.toFixed(2)+"%";
const fv=v=>!v?"N/A":v>=1e9?(v/1e9).toFixed(1)+"B":v>=1e6?(v/1e6).toFixed(1)+"M":(v/1e3).toFixed(0)+"K";
const fb=n=>!n?"N/A":n>=1e12?"$"+(n/1e12).toFixed(2)+"T":n>=1e9?"$"+(n/1e9).toFixed(1)+"B":"$"+(n/1e6).toFixed(0)+"M";
const tAgo=t=>{if(!t)return"";const s=Math.floor((Date.now()-new Date(t).getTime())/1000);return s<60?"just now":s<3600?Math.floor(s/60)+"m ago":s<86400?Math.floor(s/3600)+"h ago":Math.floor(s/86400)+"d ago";};

// ── SPARK ────────────────────────────────────────────────────────
function Spark({data,up,w=52,h=26}){
  if(!data||data.length<2)return<div style={{width:w,height:h}}/>;
  const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1)*w).toFixed(1)},${(h-((v-mn)/rng)*h*.82-h*.09).toFixed(1)}`).join(" ");
  const col=up?"#16a34a":"#dc2626";
  return(<svg width={w} height={h} style={{display:"block"}}>
    <defs><linearGradient id={`sg${w}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={col} stopOpacity=".2"/><stop offset="100%" stopColor={col} stopOpacity="0"/></linearGradient></defs>
    <polygon points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg${w})`}/>
    <polyline points={pts} fill="none" stroke={col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>);
}

// ── SCORE RING ───────────────────────────────────────────────────
function ScoreRing({score,size=64}){
  if(!score&&score!==0)return null;
  const r=size*.38,circ=2*Math.PI*r,fill=circ*(1-score/100);
  const col=score>=72?"#16a34a":score>=58?"#15803d":score>=44?"#d97706":score>=30?"#ea580c":"#dc2626";
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{flexShrink:0}}>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={size*.1}/>
    <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={size*.1}
      strokeDasharray={circ} strokeDashoffset={fill} strokeLinecap="round"
      transform={`rotate(-90 ${size/2} ${size/2})`}/>
    <text x={size/2} y={size/2-2} textAnchor="middle" dominantBaseline="auto"
      style={{fontFamily:"system-ui",fontWeight:700,fontSize:size*.22,fill:col}}>{score}</text>
    <text x={size/2} y={size/2+size*.16} textAnchor="middle" dominantBaseline="auto"
      style={{fontFamily:"system-ui",fontSize:size*.1,fill:"#9ca3af",letterSpacing:"0.5px"}}>SCORE</text>
  </svg>);
}

// ── RADAR ────────────────────────────────────────────────────────
function Radar({dims,size=140}){
  if(!dims)return null;
  const labels=["Momentum","Value","Growth","Safety","Sentiment","Technical"];
  const vals=[dims.momentum,dims.value,dims.growth,dims.safety,dims.sentiment,dims.technical];
  const n=6,cx=size/2,cy=size/2,r=size*.35;
  const ang=i=>-Math.PI/2+i*2*Math.PI/n;
  const pt=(i,v)=>{const a=ang(i),rr=r*v/100;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a)};};
  const gpts=l=>Array.from({length:n},(_,i)=>{const a=ang(i),rr=r*l/100;return`${cx+rr*Math.cos(a)},${cy+rr*Math.sin(a)}`;}).join(" ");
  const dpts=vals.map((v,i)=>{const p=pt(i,v);return`${p.x},${p.y}`;}).join(" ");
  const lpts=Array.from({length:n},(_,i)=>{const a=ang(i),rr=r*1.32;return{x:cx+rr*Math.cos(a),y:cy+rr*Math.sin(a),l:labels[i]};});
  return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
    {[25,50,75,100].map(l=><polygon key={l} points={gpts(l)} fill="none" stroke="#e5e7eb" strokeWidth=".8"/>)}
    {Array.from({length:n},(_,i)=>{const a=ang(i);return<line key={i} x1={cx} y1={cy} x2={cx+r*Math.cos(a)} y2={cy+r*Math.sin(a)} stroke="#e5e7eb" strokeWidth=".8"/>;})}
    <polygon points={dpts} fill="rgba(22,163,74,0.15)" stroke="#16a34a" strokeWidth="1.5" strokeLinejoin="round"/>
    {vals.map((v,i)=>{const p=pt(i,v);return<circle key={i} cx={p.x} cy={p.y} r="3" fill="#16a34a" stroke="white" strokeWidth="1.5"/>;}).filter(Boolean)}
    {lpts.map((l,i)=>(<text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
      style={{fontFamily:"system-ui",fontSize:"8px",fill:"#6b7280",letterSpacing:"0.3px"}}>{l.l}</text>))}
  </svg>);
}

// ── ARIA TYPEWRITER ───────────────────────────────────────────────
function TypeText({text,speed=18}){
  const [shown,setShown]=useState("");
  const [done,setDone]=useState(false);
  useEffect(()=>{
    setShown("");setDone(false);
    if(!text)return;
    let i=0;const id=setInterval(()=>{if(i<=text.length){setShown(text.slice(0,i));i++;}else{clearInterval(id);setDone(true);}},speed);
    return()=>clearInterval(id);
  },[text]);
  return<span>{shown}{!done&&<span style={{display:"inline-block",width:2,height:"1em",background:"#16a34a",verticalAlign:"text-bottom",marginLeft:1,animation:"blink 1s step-end infinite"}}/>}</span>;
}

// ══════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════
export default function App(){
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
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
  const [chatHistory,setChatHistory]=useState([]);
  const [chatInput,setChatInput]=useState("");
  const [chatLoading,setChatLoading]=useState(false);
  const [stockNews,setStockNews]=useState({});
  const [research,setResearch]=useState({});
  const clockRef=useRef(null);
  const toastT=useRef(null);
  const sheetOpen=useRef(false);

  const showToast=useCallback(m=>{setToast(m);clearTimeout(toastT.current);toastT.current=setTimeout(()=>setToast(null),2600);},[]);

  // ── BOOT ──────────────────────────────────────────────────────
  useEffect(()=>{
    (async()=>{
      const steps=[
        [10,"Connecting to FINTEL QUANTUM backend..."],
        [25,"Fetching live market prices..."],
        [40,"Loading sector data..."],
        [55,"Getting earnings calendar..."],
        [65,"Fetching macro indicators..."],
        [75,"Computing FINTEL QUANTUM Scores..."],
        [85,"Briefing ARIA..."],
        [95,"Finalizing..."],
      ];
      let si=0;
      const iv=setInterval(()=>{if(si<steps.length){setProg(steps[si][0]);setProgMsg(steps[si][1]);si++;}},400);
      try{
        const [qData,gData,lData,secData,earnData,macroData,newsData]=await Promise.all([
          api('/api/quotes'),api('/api/gainers'),api('/api/losers'),
          api('/api/sectors'),api('/api/earnings'),api('/api/macro'),api('/api/news'),
        ]);
        // Build data with history
        const d={};
        Object.entries(qData).forEach(([sym,q])=>{
          const r=mkRng(sym+new Date().toDateString());
          const hist=[];let cur=q.pc*0.88;
          for(let i=0;i<60;i++){cur=+(cur*(1+(r()-0.47)*0.025)).toFixed(2);hist.push(cur);}
          hist.push(q.c);
          d[sym]={...q,hist};
        });
        setData(d);
        setGainers(gData||[]);
        setLosers(lData||[]);
        setSectors(secData||{});
        setEarnings(earnData||[]);
        setMacro(macroData||{});
        setNews(newsData||[]);
        // Compute scores
        const sc={};
        Object.keys(d).forEach(sym=>{sc[sym]=computeScore(sym,d[sym]);});
        setScores(sc);
        // ARIA brief
        const allQ=Object.entries(d);
        const adv=allQ.filter(([,q])=>q.dp>=0).length;
        const upPct=Math.round(adv/allQ.length*100);
        const topBuy=Object.entries(sc).filter(([,s])=>s).sort(([,a],[,b])=>b.total-a.total)[0];
        const h=new Date().getHours();
        const greet=h<12?"Good morning":h<17?"Good afternoon":"Good evening";
        const mood=upPct>60?"bullish":upPct<40?"defensive":"mixed";
        setAriaLines([
          `${greet}. I've scanned ${Object.keys(d).length} stocks across all major sectors.`,
          `Market sentiment is **${mood.toUpperCase()}** today — ${upPct}% of stocks are advancing.`,
          topBuy?`My top pick today is **${topBuy[0]}** with a FINTEL QUANTUM Score of ${topBuy[1].total} — ${topBuy[1].brief}`:"",
          earnData?.length?`Earnings watch: **${earnData[0]?.symbol}** reports ${new Date(earnData[0]?.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}. Revenue est: ${(earnData[0]?.revenueEstimate/1e9).toFixed(1)}B.`:"",
          `Stay sharp. I update every 60 seconds with live market data.`,
        ].filter(Boolean));
      }catch(e){console.error("Boot error:",e);setProgMsg("Error loading data. Check backend.");}
      clearInterval(iv);setProg(100);setProgMsg("FINTEL QUANTUM ready ✓");
      await new Promise(r=>setTimeout(r,300));
      setLoading(false);
    })();
  },[]);

  // ── CLOCK (DOM ref — no re-render) ───────────────────────────
  useEffect(()=>{
    const t=()=>{try{if(clockRef.current)clockRef.current.textContent=new Intl.DateTimeFormat("en-US",{timeZone:"America/New_York",hour:"2-digit",minute:"2-digit",second:"2-digit"}).format(new Date())+" ET";}catch{}};
    t();const id=setInterval(t,1000);return()=>clearInterval(id);
  },[]);

  // ── ARIA CYCLE ───────────────────────────────────────────────
  useEffect(()=>{if(!ariaLines.length)return;const id=setInterval(()=>setAriaIdx(i=>(i+1)%ariaLines.length),8000);return()=>clearInterval(id);},[ariaLines]);

  // ── AUTO REFRESH ─────────────────────────────────────────────
  useEffect(()=>{
    if(loading)return;
    const id=setInterval(async()=>{
      if(sheetOpen.current)return;
      try{
        const [qData,gData,lData]=await Promise.all([api('/api/quotes'),api('/api/gainers'),api('/api/losers')]);
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
      }catch(e){}
    },60000);
    return()=>clearInterval(id);
  },[loading]);

  // ── OPEN SHEET (snapshot) ────────────────────────────────────
  const openSheet=sym=>{
    sheetOpen.current=true;
    setSheet(sym);
    setSheetSnap({...data[sym]});
    // Load stock-specific data
    if(!stockNews[sym])api(`/api/news/${sym}`).then(d=>setStockNews(p=>({...p,[sym]:d}))).catch(()=>{});
    if(!research[sym]){
      const stk=STOCKS.find(s=>s.s===sym);
      api(`/api/research/${sym}?name=${encodeURIComponent(stk?.n||sym)}`).then(d=>setResearch(p=>({...p,[sym]:d}))).catch(()=>{});
    }
  };
  const closeSheet=()=>{sheetOpen.current=false;setSheet(null);setSheetSnap(null);};

  // ── WATCHLIST ────────────────────────────────────────────────
  const toggleWL=sym=>{setWl(prev=>{const n=new Set(prev);n.has(sym)?(n.delete(sym),showToast("Removed")):( n.add(sym),showToast("Added ⭐"));try{localStorage.setItem("tv6",JSON.stringify([...n]));}catch{}return n;});};

  // ── AI ANALYSIS ──────────────────────────────────────────────
  const loadAnalysis=async(sym,level)=>{
    const key=`${sym}_${level}`;
    if(aiAnalysis[key])return;
    setAiLoading(true);
    try{const r=await api(`/api/analyze/${sym}?level=${level}`);setAiAnalysis(p=>({...p,[key]:r.analysis}));}
    catch(e){}
    setAiLoading(false);
  };

  // ── CHAT ─────────────────────────────────────────────────────
  const sendChat=async()=>{
    if(!chatInput.trim())return;
    const msg=chatInput.trim();setChatInput("");
    const newHistory=[...chatHistory,{role:"user",content:msg}];
    setChatHistory(newHistory);setChatLoading(true);
    try{
      const r=await apiPost('/api/chat',{message:msg,symbol:sheet,history:chatHistory.slice(-6)});
      setChatHistory(h=>[...h,{role:"assistant",content:r.response}]);
    }catch(e){setChatHistory(h=>[...h,{role:"assistant",content:"Sorry, I couldn't process that. Please try again."}]);}
    setChatLoading(false);
  };

  // ── COMPUTED ─────────────────────────────────────────────────
  const allQ=STOCKS.map(s=>({...s,q:data[s.s],sc:scores[s.s]})).filter(x=>x.q);
  const adv=allQ.filter(x=>x.q.dp>=0).length,dec=allQ.filter(x=>x.q.dp<0).length;
  const upPct=Math.round(adv/(adv+dec||1)*100);
  const buyCnt=Object.values(scores).filter(s=>s?.dec?.includes("BUY")).length;
  const gems=allQ.filter(x=>x.sc&&x.sc.total>=65&&Math.abs(x.q.dp)<1.5).sort((a,b)=>b.sc.total-a.sc.total).slice(0,4);

  // ── STYLES ───────────────────────────────────────────────────
  const N="#1a1a2e",W="#fafaf8",G="#16a34a",R="#dc2626",A="#d97706";
  const card={background:"white",border:"1px solid #e5e7eb",borderRadius:14,overflow:"hidden"};
  const rowS={display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"1px solid #f3f4f6",cursor:"pointer",gap:12,transition:"background .1s"};
  const scoreColors={sb:{bg:"#dcfce7",text:"#15803d",border:"#86efac"},b:{bg:"#f0fdf4",text:"#16a34a",border:"#bbf7d0"},h:{bg:"#fffbeb",text:"#d97706",border:"#fde68a"},s:{bg:"#fff7ed",text:"#ea580c",border:"#fed7aa"},ss:{bg:"#fef2f2",text:"#dc2626",border:"#fecaca"}};

  const Badge=({sc,big})=>{
    if(!sc)return<div style={{fontSize:9,color:"#9ca3af",fontFamily:"monospace"}}>LOADING...</div>;
    const c=scoreColors[sc.cls]||scoreColors.h;
    return<div style={{background:c.bg,border:`1px solid ${c.border}`,borderRadius:big?10:6,padding:big?"7px 14px":"3px 8px",display:"flex",alignItems:"center",gap:big?8:4,flexShrink:0}}>
      <span style={{fontSize:big?18:11}}>{sc.emoji}</span>
      <div>
        <div style={{fontFamily:"monospace",fontSize:big?12:9,fontWeight:700,color:c.text,letterSpacing:big?1:.5}}>{sc.dec}</div>
        {big&&<div style={{fontFamily:"monospace",fontSize:9,color:c.text+"99",marginTop:1}}>FINTEL QUANTUM Score: {sc.total}</div>}
      </div>
    </div>;
  };

  const SRow=({sym,name,q,sc,rank,gain,emoji})=>(
    <div style={{...rowS}} onClick={()=>openSheet(sym)}
      onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      {rank&&<div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18,textAlign:"center",flexShrink:0}}>{rank}</div>}
      <div style={{fontSize:18,flexShrink:0}}>{emoji||"📈"}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:15,color:N,letterSpacing:.3}}>{sym}</div>
        <div style={{fontSize:10,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{name}</div>
      </div>
      {sc&&<Badge sc={sc}/>}
      <Spark data={q.hist?.slice(-20)} up={q.dp>=0}/>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N,letterSpacing:-.3}}>{fp(q.c)}</div>
        <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,padding:"2px 6px",borderRadius:5,display:"inline-block",background:gain?"#dcfce7":"#fee2e2",color:gain?G:R,marginTop:2}}>{fc(q.dp)}</div>
      </div>
    </div>
  );

  const MRow=({item,rank,gain})=>{
    const sym=item.symbol||item.ticker||"";
    const stk=STOCKS.find(s=>s.s===sym);
    const q=data[sym];
    const dp=item.changesPercentage||0;
    return<div style={rowS} onClick={()=>openSheet(sym)}
      onMouseEnter={e=>e.currentTarget.style.background="#f9fafb"}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
      <div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18,flexShrink:0}}>{rank}</div>
      <div style={{fontSize:18,flexShrink:0}}>{stk?.e||(gain?"📈":"📉")}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:15,color:N}}>{sym}</div>
        <div style={{fontSize:10,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{item.name||item.companyName||""}</div>
      </div>
      {scores[sym]&&<Badge sc={scores[sym]}/>}
      <Spark data={q?.hist?.slice(-20)} up={gain}/>
      <div style={{textAlign:"right",flexShrink:0}}>
        <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{fp(item.price)}</div>
        <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,padding:"2px 6px",borderRadius:5,display:"inline-block",background:gain?"#dcfce7":"#fee2e2",color:gain?G:R,marginTop:2}}>{gain?"+":" "}{(+dp).toFixed(2)}%</div>
      </div>
    </div>;
  };

  // ── SPLASH ───────────────────────────────────────────────────
  // Auth gate
  if(!user){
    if(!showAuth) return <LandingPage onGetStarted={()=>{
      window.history.pushState({page:'auth'},'','/?auth=1');
      setShowAuth(true);
    }}/>;
    return <AuthScreen onAuth={u=>{localStorage.setItem('tv_user',JSON.stringify(u));setUser(u);}}/>;
  }

  if(loading)return(
    <div style={{background:W,height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:24,padding:24}}>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:52,height:52,borderRadius:14,background:N,display:"flex",alignItems:"center",justifyContent:"center",color:"#00e676",fontWeight:800,fontSize:18,fontFamily:"monospace"}}>&lt;FQ&gt;</div>
        <div>
          <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:28,color:N,letterSpacing:2}}>FINTEL QUANTUM</div>
          <div style={{fontFamily:"monospace",fontSize:10,color:"#9ca3af",letterSpacing:3}}>AI STOCK INTELLIGENCE</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10,alignItems:"flex-start",maxWidth:300}}>
        <div style={{width:32,height:32,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:700,color:"#00e676",flexShrink:0}}>AI</div>
        <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"0 12px 12px 12px",padding:"10px 14px",fontSize:12,color:N,lineHeight:1.6}}>
          <span style={{display:"block",fontSize:8,fontWeight:600,color:G,letterSpacing:1.5,marginBottom:4}}>ARIA · AI ANALYST</span>
          {progMsg}<span style={{display:"inline-block",width:2,height:"1em",background:G,verticalAlign:"text-bottom",marginLeft:2,animation:"blink 1s step-end infinite"}}/>
        </div>
      </div>
      <div style={{width:260,height:3,background:"#e5e7eb",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:prog+"%",background:`linear-gradient(90deg,${N},${G})`,transition:"width .4s ease",borderRadius:2}}/>
      </div>
    </div>
  );

  // ── SHEET ────────────────────────────────────────────────────
  const Sheet=()=>{
    if(!sheet||!sheetSnap)return null;
    const stk=STOCKS.find(s=>s.s===sheet);
    const q=sheetSnap;
    const sc=scores[sheet];
    const up=q.dp>=0;
    const sNews=stockNews[sheet]||[];
    const sResearch=research[sheet]||[];
    const aiKey=`${sheet}_${aiLevel}`;

    return<div onClick={e=>{if(e.target===e.currentTarget)closeSheet();}}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:400,backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:W,borderRadius:"24px 24px 0 0",border:"1px solid #e5e7eb",borderBottom:"none",width:"100%",maxHeight:"93dvh",overflowY:"auto"}}>
        <div style={{width:36,height:4,background:"#e5e7eb",borderRadius:2,margin:"12px auto 0"}}/>

        {/* Head */}
        <div style={{padding:"16px 20px 14px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative",background:"white"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:12,background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{stk?.e||"📈"}</div>
            <div>
              <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:22,color:N,letterSpacing:.5,marginBottom:2}}>{sheet}</div>
              <div style={{fontSize:11,color:"#6b7280"}}>{q.name||stk?.n} · {stk?.sec}</div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"monospace",fontSize:22,fontWeight:700,color:up?G:R,marginBottom:4}}>{fp(q.c)}</div>
            <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,padding:"3px 10px",borderRadius:7,display:"inline-block",background:up?"#dcfce7":"#fee2e2",color:up?G:R}}>{fc(q.dp)} ({q.d>=0?"+":""}{q.d?.toFixed(2)})</div>
          </div>
          <div onClick={closeSheet} style={{position:"absolute",top:14,right:14,width:28,height:28,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"#6b7280"}}>✕</div>
        </div>

        <div style={{padding:"16px 20px",display:"flex",flexDirection:"column",gap:20}}>

          {/* FINTEL QUANTUM Score + Radar */}
          {sc&&<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:16}}>
            <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>FINTEL QUANTUM SCORE™ — PROPRIETARY AI RATING</div>
            <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap",marginBottom:14}}>
              <ScoreRing score={sc.total} size={72}/>
              <div style={{flex:1,minWidth:120}}>
                <Badge sc={sc} big={true}/>
                <div style={{fontSize:12,color:"#6b7280",lineHeight:1.5,marginTop:8}}>{sc.brief}</div>
              </div>
              <Radar dims={sc.dims} size={130}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>
              {Object.entries(sc.dims).map(([k,v])=>{
                const col=v>=65?G:v>=45?A:R;
                return<div key={k}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:1,textTransform:"uppercase"}}>{k}</span>
                    <span style={{fontFamily:"monospace",fontSize:8,color:col,fontWeight:700}}>{v}</span>
                  </div>
                  <div style={{height:4,background:"#f3f4f6",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:v+"%",background:col,borderRadius:2}}/>
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
                <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:2,marginBottom:8}}>ARIA — LLAMA 3.3 70B · LIVE AI ANALYSIS</div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                  {["novice","intermediate","expert","deep"].map(l=>(
                    <button key={l} onClick={async()=>{setAiLevel(l);await loadAnalysis(sheet,l);}} style={{
                      padding:"5px 12px",borderRadius:20,border:`1px solid ${aiLevel===l?N:"#e5e7eb"}`,cursor:"pointer",
                      fontFamily:"monospace",fontSize:9,textTransform:"uppercase",letterSpacing:.5,
                      background:aiLevel===l?N:"white",color:aiLevel===l?"white":"#6b7280",fontWeight:aiLevel===l?700:400,
                    }}>{l}</button>
                  ))}
                </div>
                <div style={{background:"#f9fafb",borderRadius:10,padding:"12px 14px",fontSize:12,color:N,lineHeight:1.7,minHeight:80,fontFamily:"system-ui",whiteSpace:"pre-wrap"}}>
                  {aiLoading?<span style={{color:"#9ca3af"}}>ARIA is analyzing {sheet}...<span style={{display:"inline-block",width:2,height:"1em",background:G,verticalAlign:"text-bottom",marginLeft:2,animation:"blink 1s step-end infinite"}}/></span>
                  :aiAnalysis[aiKey]?aiAnalysis[aiKey]
                  :<span style={{color:"#9ca3af"}}>Tap a level above to get AI analysis powered by Llama 3.3 70B</span>}
                </div>
                <div style={{fontFamily:"monospace",fontSize:8,color:"#d1d5db",marginTop:6}}>Llama 3.3 70B via Groq · Cached 1hr · Not financial advice</div>
              </div>
            </div>
          </div>

          {/* Price Targets */}
          {sc?.targets&&<div>
            <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>🎯 AI PRICE TARGETS</div>
            <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:3}}>
              {Object.entries(sc.targets).map(([p,t])=>{
                const ret=((t-q.c)/q.c*100),col=ret>=0?G:R;
                return<div key={p} style={{background:"white",border:`1px solid ${col}33`,borderRadius:12,padding:"11px 12px",flexShrink:0,minWidth:76,textAlign:"center",boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                  <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:.5,marginBottom:5}}>{p}</div>
                  <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:15,color:col,marginBottom:2}}>{fp(t)}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,fontWeight:700,color:col}}>{ret>=0?"+":""}{ret.toFixed(1)}%</div>
                </div>;
              })}
            </div>
          </div>}

          {/* Key Metrics */}
          <div>
            <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>📊 LIVE MARKET DATA</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[
                {l:"OPEN",v:fp(q.o)},{l:"HIGH",v:fp(q.h),c:G},{l:"LOW",v:fp(q.l),c:R},
                {l:"PREV CLOSE",v:fp(q.pc)},{l:"VOLUME",v:fv(q.v)},{l:"MKT CAP",v:fb(q.mkt)},
                {l:"P/E RATIO",v:q.pe?q.pe.toFixed(1)+"x":"N/A"},{l:"52W HIGH",v:fp(q.fiftyTwoWeekHigh)},{l:"52W LOW",v:fp(q.fiftyTwoWeekLow),c:R},
                {l:"RSI (14)",v:sc?.rsi?sc.rsi+"":"--",c:sc?.rsi?sc.rsi<30?G:sc.rsi>70?R:A:undefined},
                {l:"MACD",v:sc?.macd?sc.macd+"":"--",c:sc?.macd?sc.macd>0?G:R:undefined},
                {l:"BETA",v:q.beta?q.beta.toFixed(2):"N/A"},
              ].map(m=>(
                <div key={m.l} style={{background:"white",border:"1px solid #f3f4f6",borderRadius:11,padding:"9px 11px",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                  <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:1.2,marginBottom:5}}>{m.l}</div>
                  <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:m.c||N}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Stock News */}
          {sNews.length>0&&<div>
            <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>📰 LATEST NEWS</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {sNews.slice(0,4).map((n,i)=>(
                <div key={i} onClick={()=>window.open(n.url,"_blank")} style={{background:"white",border:"1px solid #f3f4f6",borderRadius:12,padding:"11px 13px",cursor:"pointer",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                  <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:1.5,marginBottom:4}}>{(n.source||"NEWS").toUpperCase()} · {tAgo(n.date)}</div>
                  <div style={{fontSize:12,fontWeight:600,color:N,lineHeight:1.45}}>{n.title}</div>
                </div>
              ))}
            </div>
          </div>}

          {/* Research Papers */}
          {sResearch.length>0&&<div>
            <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:10}}>🔬 ACADEMIC RESEARCH (arxiv)</div>
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

          {/* Spark Chart */}
          <div style={{background:"white",border:"1px solid #f3f4f6",borderRadius:14,padding:"14px 16px",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
            <div style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>📈 60-DAY PRICE HISTORY</div>
            <Spark data={q.hist} up={up} w={300} h={80}/>
          </div>

          {/* WL + Chat buttons */}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>toggleWL(sheet)} style={{flex:1,background:wl.has(sheet)?"#f0fdf4":"white",border:`1px solid ${wl.has(sheet)?G:"#e5e7eb"}`,borderRadius:12,padding:13,fontSize:13,fontWeight:600,color:wl.has(sheet)?G:N,cursor:"pointer",fontFamily:"system-ui"}}>
              {wl.has(sheet)?"✓ In Watchlist":"⭐ Add to Watchlist"}
            </button>
            <button onClick={()=>setChatOpen(true)} style={{flex:1,background:N,border:"none",borderRadius:12,padding:13,fontSize:13,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"system-ui"}}>
              🧠 Ask ARIA
            </button>
          </div>

        </div>
      </div>
    </div>;
  };

  // ── ARIA CHAT ─────────────────────────────────────────────────
  const Chat=()=>{
    if(!chatOpen)return null;
    return<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end"}}>
      <div style={{background:W,borderRadius:"24px 24px 0 0",border:"1px solid #e5e7eb",width:"100%",height:"70dvh",display:"flex",flexDirection:"column"}}>
        <div style={{padding:"12px 20px",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between",alignItems:"center",background:"white",borderRadius:"24px 24px 0 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:32,height:32,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:700,color:"#00e676"}}>AI</div>
            <div>
              <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:14,color:N}}>Ask ARIA</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af"}}>Llama 3.3 70B · {sheet||"Market"} context</div>
            </div>
          </div>
          <div onClick={()=>setChatOpen(false)} style={{width:28,height:28,borderRadius:"50%",background:"#f3f4f6",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12,color:"#6b7280"}}>✕</div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
          {chatHistory.length===0&&<div style={{textAlign:"center",padding:32}}>
            <div style={{fontSize:32,marginBottom:12}}>🧠</div>
            <div style={{fontFamily:"system-ui",fontWeight:600,fontSize:16,color:N,marginBottom:8}}>Ask me anything about the market</div>
            <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.6}}>Try: "Should I buy NVDA now?" or "What's the outlook for tech stocks?" or "Explain why META is dropping"</div>
          </div>}
          {chatHistory.map((m,i)=>(
            <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
              <div style={{maxWidth:"85%",background:m.role==="user"?N:"white",border:m.role==="user"?"none":"1px solid #f3f4f6",borderRadius:m.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",padding:"10px 14px",fontSize:12,color:m.role==="user"?"white":N,lineHeight:1.6,whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          ))}
          {chatLoading&&<div style={{display:"flex",gap:4,padding:"4px 14px"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#d1d5db",animation:"blink 1s .0s infinite"}}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#d1d5db",animation:"blink 1s .2s infinite"}}/>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#d1d5db",animation:"blink 1s .4s infinite"}}/>
          </div>}
        </div>
        <div style={{padding:"12px 16px",borderTop:"1px solid #f3f4f6",display:"flex",gap:8,background:"white"}}>
          <input value={chatInput} onChange={e=>{e.stopPropagation();setChatInput(e.target.value);}}
            onKeyDown={e=>{e.stopPropagation();if(e.key==="Enter"&&!e.shiftKey)sendChat();}}
            placeholder={`Ask about ${sheet||"the market"}...`}
            style={{flex:1,border:"1px solid #e5e7eb",borderRadius:24,padding:"10px 16px",fontSize:13,color:N,outline:"none",fontFamily:"system-ui",background:"#f9fafb"}}/>
          <button onClick={sendChat} disabled={!chatInput.trim()||chatLoading}
            style={{width:42,height:42,borderRadius:"50%",background:N,border:"none",color:"white",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>↑</button>
        </div>
      </div>
    </div>;
  };

  // ── MAIN RENDER ───────────────────────────────────────────────
  return(
    <>
    <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}} *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent} html,body{height:100%;background:${W}} *{scrollbar-width:none} *::-webkit-scrollbar{display:none}`}</style>
    <div style={{background:W,color:N,fontFamily:"system-ui,-apple-system,sans-serif",height:"100dvh",display:"flex",flexDirection:"column",overflow:"hidden",paddingTop:"env(safe-area-inset-top,44px)"}}>

      {/* HEADER */}
      <div style={{background:N,padding:"0 16px",height:54,display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:"#00e676",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:13,fontWeight:800,color:N}}>&lt;FQ&gt;</div>
          <div>
            <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:15,color:"white",letterSpacing:1,lineHeight:1.1}}>FINTEL</div>
            <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:15,color:"#22c55e",letterSpacing:1,lineHeight:1.1}}>QUANTUM</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div ref={clockRef} style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,.4)"}}/>
          <div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(0,230,118,.12)",border:"1px solid rgba(0,230,118,.25)",borderRadius:20,padding:"3px 9px",fontFamily:"monospace",fontSize:9,color:"#00e676",letterSpacing:1}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#00e676",animation:"blink 1.6s infinite"}}/>
            LIVE
          </div>
          <button onClick={()=>setChatOpen(true)} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:20,padding:"4px 12px",color:"white",fontSize:11,cursor:"pointer",fontFamily:"monospace",letterSpacing:.5}}>
            🧠 ARIA
          </button>
          <button onClick={logout} style={{background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.12)",borderRadius:20,padding:"4px 10px",color:"rgba(255,255,255,.5)",fontSize:10,cursor:"pointer",fontFamily:"monospace"}}>
            {user?.name?.split(' ')[0]||'Account'} ↗
          </button>
        </div>
      </div>

      {/* PAGES */}
      <div style={{flex:1,overflow:"hidden",position:"relative",background:W}}>

        {/* HOME */}
        {tab==="home"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70}}>

          {/* ARIA Brief */}
          <div style={{padding:"14px 16px 0"}}>
            <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:34,height:34,borderRadius:"50%",background:N,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"monospace",fontSize:10,fontWeight:700,color:"#00e676",flexShrink:0}}>AI</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:2,marginBottom:5}}>ARIA · AI ANALYST · DAILY BRIEF</div>
                <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:"0 14px 14px 14px",padding:"11px 14px",fontSize:12,color:N,lineHeight:1.65,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
                  {ariaLines[ariaIdx]&&<TypeText text={ariaLines[ariaIdx].replace(/\*\*(.*?)\*\*/g,'$1')} speed={20}/>}
                </div>
                {ariaLines.length>1&&<div style={{display:"flex",gap:4,marginTop:7}}>
                  {ariaLines.map((_,i)=><div key={i} style={{width:i===ariaIdx?14:4,height:3,borderRadius:2,background:i===ariaIdx?N:"#e5e7eb",transition:"width .3s"}}/>)}
                </div>}
              </div>
            </div>
          </div>

          {/* Index Strip */}
          <div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>MARKET PULSE</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af"}}>{new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}).toUpperCase()}</div>
            </div>
            <div style={{display:"flex",gap:10,overflowX:"auto"}}>
              {[...IDXS,{s:"BREADTH",n:"BREADTH",isBreadth:true}].map(ix=>{
                if(ix.isBreadth)return<div key="b" style={{background:"white",border:"1px solid #e5e7eb",borderRadius:12,padding:"10px 14px",minWidth:100,flexShrink:0,boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:9,color:"#9ca3af",fontWeight:600,letterSpacing:.5,marginBottom:4}}>BREADTH</div>
                  <div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:upPct>55?G:upPct<45?R:A,marginBottom:4}}>{upPct}%</div>
                  <div style={{height:4,background:"#f3f4f6",borderRadius:2,overflow:"hidden",display:"flex"}}>
                    <div style={{width:upPct+"%",background:G,borderRadius:"2px 0 0 2px"}}/>
                    <div style={{flex:1,background:R,borderRadius:"0 2px 2px 0"}}/>
                  </div>
                </div>;
                const q=data[ix.s],up=q&&q.dp>=0;
                return<div key={ix.s} style={{background:"white",border:`1px solid ${q?(up?"#bbf7d0":"#fecaca"):"#e5e7eb"}`,borderRadius:12,padding:"10px 14px",minWidth:100,flexShrink:0,boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
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
              <div style={{fontSize:12,color:N,fontWeight:500}}>
                {earnings.slice(0,3).map(e=>`${e.symbol} ${new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}`).join(" · ")}
              </div>
            </div>
          </div>}

          {/* Macro Strip */}
          {Object.keys(macro).length>0&&<div style={{padding:"12px 16px 0"}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:8}}>🌍 MACRO INDICATORS</div>
            <div style={{display:"flex",gap:8,overflowX:"auto"}}>
              {Object.entries(macro).filter(([,v])=>v.value).map(([k,v])=>(
                <div key={k} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:10,padding:"8px 12px",flexShrink:0,minWidth:90,boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                  <div style={{fontSize:8,color:"#9ca3af",fontWeight:600,letterSpacing:.5,marginBottom:3}}>{k.toUpperCase()}</div>
                  <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:N}}>{v.value?.toFixed(1)}%</div>
                  {v.prev&&<div style={{fontFamily:"monospace",fontSize:9,color:v.value>v.prev?R:G}}>
                    {v.value>v.prev?"▲":"▼"} from {v.prev?.toFixed(1)}%
                  </div>}
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
                    <div>
                      <div style={{fontFamily:"system-ui",fontWeight:800,fontSize:16,color:"white",letterSpacing:.5}}>{x.s}</div>
                      <div style={{fontSize:9,color:"rgba(255,255,255,.4)",marginTop:1}}>{x.n}</div>
                    </div>
                    <ScoreRing score={x.sc?.total||0} size={40}/>
                  </div>
                  <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:"#00e676",marginBottom:2}}>{fp(x.q.c)}</div>
                  <div style={{fontFamily:"monospace",fontSize:10,color:x.q.dp>=0?"#00e676":"#ff6b6b"}}>{fc(x.q.dp)}</div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,.3)",marginTop:5,lineHeight:1.4}}>Low noise · Strong signal</div>
                </div>
              ))}
            </div>
          </div>}

          {/* Gainers */}
          <div style={{padding:"12px 16px 0"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>▲ TOP GAINERS</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",background:"#f3f4f6",borderRadius:20,padding:"2px 8px"}}>{buyCnt} BUY SIGNALS</div>
            </div>
            <div style={{...card}}>
              <div style={{padding:"10px 16px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"system-ui",fontWeight:700,fontSize:12,color:G}}>▲ GAINERS · FINTEL QUANTUM SCORE™</span>
                <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af"}}>TAP FOR AI ANALYSIS</span>
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
                <span style={{fontFamily:"system-ui",fontWeight:700,fontSize:12,color:R}}>▼ LOSERS · FINTEL QUANTUM SCORE™</span>
                <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af"}}>ARIA MONITORS THESE</span>
              </div>
              {losers.length===0?<div style={{padding:32,textAlign:"center",fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>Loading...</div>
              :losers.map((x,i)=><MRow key={i} item={x} rank={i+1} gain={false}/>)}
            </div>
          </div>

          {/* Fortune 500 Top 20 */}
          <div style={{padding:"12px 16px 14px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,fontWeight:600}}>🏆 S&P 500 — TOP 20</div>
              <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",background:"#f3f4f6",borderRadius:20,padding:"2px 8px"}}>FORTUNE 500</div>
            </div>
            <div style={{...card}}>
              <div style={{padding:"10px 16px",background:"#f9fafb",borderBottom:"1px solid #f3f4f6",display:"flex",justifyContent:"space-between"}}>
                <span style={{fontFamily:"system-ui",fontWeight:700,fontSize:12,color:N}}>🏆 TOP 20 S&P 500 · FINTEL QUANTUM SCORE™</span>
                <span style={{fontFamily:"monospace",fontSize:8,color:"#9ca3af"}}>LARGEST US COMPANIES</span>
              </div>
              {SP500_TOP20.map((s,i)=>{
                const q=data[s.s];
                const sc=scores[s.s];
                if(!q)return(
                  <div key={s.s} style={{padding:"12px 16px",borderBottom:"1px solid #f3f4f6",display:"flex",alignItems:"center",gap:12,opacity:.4}}>
                    <div style={{fontFamily:"monospace",fontSize:10,color:"#d1d5db",width:18}}>{i+1}</div>
                    <div style={{fontSize:18}}>{s.e}</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:15}}>{s.s}</div>
                      <div style={{fontSize:10,color:"#9ca3af"}}>{s.n}</div>
                    </div>
                    <div style={{fontFamily:"monospace",fontSize:11,color:"#9ca3af"}}>Loading...</div>
                  </div>
                );
                return<SRow key={s.s} sym={s.s} name={s.n} q={q} sc={sc} rank={i+1} gain={q.dp>=0} emoji={s.e}/>;
              })}
            </div>
          </div>

        </div>}

        {/* SECTORS */}
        {tab==="sectors"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>🏭 SECTOR HEATMAP</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {Object.entries(sectors).sort(([,a],[,b])=>b.change-a.change).map(([name,s])=>{
              const up=s.change>=0;
              const abs=Math.abs(s.change);
              const intensity=Math.min(abs/5,1);
              const bg=up?`rgba(22,163,74,${0.05+intensity*.2})`:`rgba(220,38,38,${0.05+intensity*.2})`;
              const border=up?`rgba(22,163,74,${0.2+intensity*.3})`:`rgba(220,38,38,${0.2+intensity*.3})`;
              return<div key={name} style={{background:bg,border:`1px solid ${border}`,borderRadius:14,padding:"13px 14px",cursor:"pointer"}} onClick={()=>openSheet(s.etf)}>
                <div style={{fontSize:10,fontWeight:700,color:N,marginBottom:2}}>{name}</div>
                <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",marginBottom:8}}>{s.etf}</div>
                <div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:up?G:R}}>{fc(s.change)}</div>
                <div style={{fontFamily:"monospace",fontSize:11,color:"#9ca3af",marginTop:2}}>{fp(s.price)}</div>
              </div>;
            })}
          </div>

          {/* Earnings */}
          {earnings.length>0&&<div style={{marginTop:20}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>📅 UPCOMING EARNINGS</div>
            <div style={{...card}}>
              {earnings.map((e,i)=>(
                <div key={i} style={{...rowS}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:15,color:N}}>{e.symbol}</div>
                    <div style={{fontSize:10,color:"#9ca3af"}}>{new Date(e.date).toLocaleDateString("en-US",{weekday:"short",month:"long",day:"numeric"})}</div>
                  </div>
                  {e.revenueEstimate&&<div style={{textAlign:"right"}}>
                    <div style={{fontFamily:"monospace",fontSize:10,color:"#9ca3af"}}>Est. Revenue</div>
                    <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:N}}>{fb(e.revenueEstimate)}</div>
                  </div>}
                </div>
              ))}
            </div>
          </div>}
        </div>}

        {/* AI BOARD */}
        {tab==="signals"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>🤖 AI SIGNAL BOARD</div>
          <div style={{display:"flex",gap:8,marginBottom:12,overflowX:"auto"}}>
            {["ALL","🚀 BUY","⏸️ HOLD","🔴 SELL"].map(f=>(
              <button key={f} onClick={()=>setSigFilter(f)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${sigFilter===f?N:"#e5e7eb"}`,cursor:"pointer",fontFamily:"monospace",fontSize:10,flexShrink:0,background:sigFilter===f?N:"white",color:sigFilter===f?"white":"#6b7280",fontWeight:sigFilter===f?700:400}}>{f}</button>
            ))}
          </div>
          <div style={{...card}}>
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
        </div>}

        {/* SEARCH */}
        {tab==="search"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.04)"}}>
            <span style={{fontSize:15,color:"#9ca3af"}}>⌕</span>
            <input value={srch} onChange={e=>setSrch(e.target.value)} placeholder="Search any stock..."
              style={{flex:1,border:"none",outline:"none",fontFamily:"system-ui",fontSize:14,color:N,background:"none"}}/>
            {srch&&<span onClick={()=>setSrch("")} style={{fontSize:13,color:"#9ca3af",cursor:"pointer"}}>✕</span>}
          </div>
          <div style={{...card}}>
            {STOCKS.filter(s=>!srch||(s.s+s.n).toLowerCase().includes(srch.toLowerCase())).map(x=>{
              const q=data[x.s],sc=scores[x.s];
              return q?<SRow key={x.s} sym={x.s} name={x.n} q={q} sc={sc} gain={q.dp>=0} emoji={x.e}/>:null;
            })}
          </div>
        </div>}

        {/* NEWS */}
        {tab==="news"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2,marginBottom:12}}>📰 MARKET NEWS</div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {news.map((n,i)=>(
              <div key={i} onClick={()=>window.open(n.url,"_blank")} style={{background:"white",border:"1px solid #e5e7eb",borderRadius:14,padding:"13px 15px",display:"flex",gap:12,cursor:"pointer",boxShadow:"0 1px 2px rgba(0,0,0,.04)"}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:"monospace",fontSize:8,color:G,letterSpacing:1.5,marginBottom:4}}>{(n.source||"NEWS").toUpperCase()} · {tAgo(n.date)}</div>
                  <div style={{fontSize:13,fontWeight:600,color:N,lineHeight:1.45,marginBottom:3}}>{n.title}</div>
                </div>
                <div style={{fontSize:24,flexShrink:0}}>{["📈","💰","🏦","📊","🌍","⚡","🚀","💹","🔬","📉","💼","📡","🤖","💎","📰"][i%15]}</div>
              </div>
            ))}
          </div>
        </div>}

        {/* WATCHLIST */}
        {tab==="watch"&&<div style={{position:"absolute",inset:0,overflowY:"auto",paddingBottom:70,padding:"14px 16px 70px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",letterSpacing:2}}>⭐ MY WATCHLIST</div>
            <div style={{fontFamily:"monospace",fontSize:9,color:"#9ca3af",background:"#f3f4f6",borderRadius:20,padding:"2px 8px"}}>{wl.size} STOCKS</div>
          </div>
          {wl.size===0?<div style={{background:"white",border:"1px solid #e5e7eb",borderRadius:16,padding:"48px 24px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>⭐</div>
            <div style={{fontFamily:"system-ui",fontWeight:700,fontSize:20,color:N,marginBottom:8}}>Nothing here yet</div>
            <div style={{fontSize:13,color:"#9ca3af",lineHeight:1.6}}>Open any stock and tap<br/>⭐ Add to Watchlist</div>
          </div>:<div style={{...card}}>
            {STOCKS.filter(s=>wl.has(s.s)).map(x=>{const q=data[x.s],sc=scores[x.s];return q?<SRow key={x.s} sym={x.s} name={x.n} q={q} sc={sc} gain={q.dp>=0} emoji={x.e}/>:null;})}
          </div>}
        </div>}

      </div>

      {/* TAB BAR */}
      <div style={{height:"calc(58px + env(safe-area-inset-bottom,20px))",background:"white",borderTop:"1px solid #e5e7eb",display:"flex",paddingBottom:"env(safe-area-inset-bottom,20px)",flexShrink:0,boxShadow:"0 -1px 0 rgba(0,0,0,.06)"}}>
        {[{id:"home",icon:"📊",lbl:"Markets"},{id:"sectors",icon:"🏭",lbl:"Sectors"},{id:"signals",icon:"🤖",lbl:"AI Board"},{id:"search",icon:"🔍",lbl:"Search"},{id:"news",icon:"📰",lbl:"News"},{id:"watch",icon:"⭐",lbl:"Watch"}].map(t=>(
          <div key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer",position:"relative",opacity:tab===t.id?1:.45,transition:"opacity .15s"}}>
            {tab===t.id&&<div style={{position:"absolute",top:0,left:"20%",right:"20%",height:2,background:N,borderRadius:"0 0 2px 2px"}}/>}
            <div style={{fontSize:18,lineHeight:1}}>{t.icon}</div>
            <div style={{fontFamily:"monospace",fontSize:8,letterSpacing:.5,textTransform:"uppercase",color:tab===t.id?N:"#9ca3af",fontWeight:tab===t.id?700:400}}>{t.lbl}</div>
          </div>
        ))}
      </div>

      <Sheet/>
      <Chat/>

      {toast&&<div style={{position:"fixed",bottom:"calc(68px + env(safe-area-inset-bottom,20px))",left:"50%",transform:"translateX(-50%)",background:N,borderRadius:22,padding:"9px 18px",fontFamily:"monospace",fontSize:11,color:"white",zIndex:600,whiteSpace:"nowrap",boxShadow:"0 4px 12px rgba(0,0,0,.15)"}}>{toast}</div>}

    </div>
    </>
  );
}
// Sun Apr 26 01:35:31 EDT 2026
