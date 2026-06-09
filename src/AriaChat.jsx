import { useState, useRef, useEffect } from "react";

const BACKEND = 'https://tradvix-backend.onrender.com';
const N = '#0f172a';
const G = '#16a34a';

export default function AriaChat({ open, onClose, sheet, token }) {
  const [msgs, setMsgs] = useState([]);
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const submit = async (e) => {
    e?.preventDefault();
    const form = e?.target || document.getElementById('aria-form');
    const input = form?.querySelector('input');
    if (!input) return;
    const msg = input.value.trim();
    if (!msg || busy) return;
    input.value = '';
    input.focus();
    const updated = [...msgs, { r: 'u', t: msg }];
    setMsgs(updated);
    setBusy(true);
    try {
      const res = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg, symbol: sheet, history: updated.slice(-6).map(m => ({ role: m.r === 'u' ? 'user' : 'assistant', content: m.t })) })
      });
      const data = await res.json();
      setMsgs(h => [...h, { r: 'a', t: data.response || 'No response' }]);
    } catch {
      setMsgs(h => [...h, { r: 'a', t: 'Could not connect. Please try again.' }]);
    }
    setBusy(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.5)' }}>
      <div style={{ background: 'white', borderRadius: '20px 20px 0 0', height: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 -4px 32px rgba(0,0,0,0.15)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: N, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e676', fontSize: 11, fontWeight: 800, fontFamily: 'monospace' }}>AI</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: N }}>ARIA Research Analyst</div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>Llama 3.3 70B · {sheet ? `${sheet} context` : 'Market Intelligence'}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {msgs.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: 60 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: N, marginBottom: 10 }}>Ask ARIA anything</div>
              <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.8 }}>
                "What is the outlook for tech stocks?"<br />
                "Why is NVDA moving today?"<br />
                "Compare AAPL and MSFT"
              </div>
            </div>
          )}
          {msgs.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.r === 'u' ? 'flex-end' : 'flex-start', gap: 10, alignItems: 'flex-start' }}>
              {m.r === 'a' && (
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: N, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e676', fontSize: 9, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0, marginTop: 4 }}>AI</div>
              )}
              <div style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: m.r === 'u' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: m.r === 'u' ? N : '#f8fafc',
                color: m.r === 'u' ? 'white' : N,
                fontSize: 14,
                lineHeight: 1.75,
                whiteSpace: 'pre-wrap',
                border: m.r === 'u' ? 'none' : '1px solid #e5e7eb'
              }}>
                {m.t}
              </div>
            </div>
          ))}
          {busy && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: N, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00e676', fontSize: 9, fontWeight: 800, fontFamily: 'monospace', flexShrink: 0 }}>AI</div>
              <div style={{ padding: '12px 18px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '20px 20px 20px 4px', display: 'flex', gap: 6 }}>
                {[0, 200, 400].map(d => (
                  <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', animation: `pulse 1.2s ${d}ms infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input - using native form to prevent React interference */}
        <form id="aria-form" onSubmit={submit} style={{ padding: '14px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 10, background: 'white', flexShrink: 0 }}>
          <input
            type="text"
            placeholder={`Ask about ${sheet || 'the market'}...`}
            style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 28, padding: '13px 20px', fontSize: 14, color: N, outline: 'none', fontFamily: 'system-ui', background: '#f8fafc' }}
            onFocus={e => e.target.style.borderColor = N}
            onBlur={e => e.target.style.borderColor = '#e2e8f0'}
          />
          <button type="submit" style={{ width: 46, height: 46, borderRadius: '50%', background: N, border: 'none', color: 'white', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↑</button>
        </form>

      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.3}50%{opacity:1}}`}</style>
    </div>
  );
}