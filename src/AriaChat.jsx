import { useState, useRef, useEffect } from "react";

const BACKEND = 'https://tradvix-backend.onrender.com';

export default function AriaChat({ open, onClose, sheet, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const endRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  useEffect(() => {
    historyRef.current = history;
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const send = async () => {
    const inp = inputRef.current;
    if (!inp || loading) return;
    const msg = inp.value.trim();
    if (!msg) return;
    inp.value = '';
    inp.focus();
    const newHistory = [...historyRef.current, { role: 'user', content: msg }];
    historyRef.current = newHistory;
    setHistory([...newHistory]);
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: msg,
          symbol: sheet,
          history: historyRef.current.slice(-6)
        })
      });
      const d = await r.json();
      const reply = { role: 'assistant', content: d.response || 'No response' };
      historyRef.current = [...historyRef.current, reply];
      setHistory([...historyRef.current]);
    } catch {
      const err = { role: 'assistant', content: 'Sorry, could not connect.' };
      historyRef.current = [...historyRef.current, err];
      setHistory([...historyRef.current]);
    }
    setLoading(false);
    inp.focus();
  };

  if (!open) return null;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.5)', zIndex:500, backdropFilter:'blur(8px)', display:'flex', alignItems:'flex-end' }}>
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', width:'100%', height:'75dvh', display:'flex', flexDirection:'column', boxShadow:'0 -8px 40px rgba(0,0,0,.15)' }}>

        {/* Header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid #f3f4f6', display:'flex', justifyContent:'space-between', alignItems:'center', borderRadius:'24px 24px 0 0', background:'white' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'monospace', fontSize:11, fontWeight:700, color:'#00e676' }}>AI</div>
            <div>
              <div style={{ fontWeight:700, fontSize:15, color:'#0f172a' }}>ARIA — AI Research Analyst</div>
              <div style={{ fontFamily:'monospace', fontSize:9, color:'#9ca3af', marginTop:2 }}>Llama 3.3 70B · {sheet ? `Analyzing ${sheet}` : 'Market Intelligence'}</div>
            </div>
          </div>
          <div onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:13, color:'#6b7280' }}>✕</div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:14 }}>
          {history.length === 0 && (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:40, marginBottom:14 }}>🧠</div>
              <div style={{ fontWeight:700, fontSize:17, color:'#0f172a', marginBottom:10 }}>Ask ARIA anything</div>
              <div style={{ fontSize:13, color:'#9ca3af', lineHeight:1.7, maxWidth:280, margin:'0 auto' }}>
                "What is the outlook for tech stocks?"<br/>
                "Why is NVDA up today?"<br/>
                "Compare AAPL vs MSFT"
              </div>
            </div>
          )}
          {history.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.role==='user'?'flex-end':'flex-start' }}>
              {m.role === 'assistant' && (
                <div style={{ width:28, height:28, borderRadius:'50%', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#00e676', fontFamily:'monospace', flexShrink:0, marginRight:8, marginTop:4 }}>AI</div>
              )}
              <div style={{
                maxWidth:'80%',
                background: m.role==='user' ? '#0f172a' : '#f8fafc',
                border: m.role==='user' ? 'none' : '1px solid #e5e7eb',
                borderRadius: m.role==='user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                padding:'12px 16px',
                fontSize:14,
                color: m.role==='user' ? 'white' : '#0f172a',
                lineHeight:1.75,
                whiteSpace:'pre-wrap'
              }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#00e676', fontFamily:'monospace', flexShrink:0 }}>AI</div>
              <div style={{ display:'flex', gap:5, padding:'12px 16px', background:'#f8fafc', border:'1px solid #e5e7eb', borderRadius:'20px 20px 20px 4px' }}>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#94a3b8', animation:'blink 1s 0s infinite' }}/>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#94a3b8', animation:'blink 1s .2s infinite' }}/>
                <div style={{ width:7, height:7, borderRadius:'50%', background:'#94a3b8', animation:'blink 1s .4s infinite' }}/>
              </div>
            </div>
          )}
          <div ref={endRef}/>
        </div>

        {/* Input */}
        <div style={{ padding:'14px 16px', borderTop:'1px solid #f3f4f6', display:'flex', gap:10, background:'white' }}>
          <input
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                e.stopPropagation();
                send();
              }
            }}
            placeholder={`Ask about ${sheet || 'the market'}...`}
            style={{
              flex:1,
              border:'1.5px solid #e2e8f0',
              borderRadius:28,
              padding:'13px 20px',
              fontSize:14,
              color:'#0f172a',
              outline:'none',
              fontFamily:'system-ui',
              background:'#f8fafc',
              transition:'border-color .2s'
            }}
            onFocus={e => e.target.style.borderColor='#0f172a'}
            onBlur={e => e.target.style.borderColor='#e2e8f0'}
          />
          <button
            onClick={send}
            style={{
              width:46,
              height:46,
              borderRadius:'50%',
              background:'#0f172a',
              border:'none',
              color:'white',
              fontSize:20,
              cursor:'pointer',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              flexShrink:0,
              transition:'transform .15s'
            }}
            onMouseEnter={e => e.target.style.transform='scale(1.08)'}
            onMouseLeave={e => e.target.style.transform='scale(1)'}
          >↑</button>
        </div>

      </div>
    </div>
  );
}