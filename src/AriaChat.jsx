import { useState, useRef } from "react";

const BACKEND = 'https://tradvix-backend.onrender.com';

export default function AriaChat({ open, onClose, sheet, token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const send = async () => {
    const msg = inputRef.current?.value?.trim();
    if (!msg || loading) return;
    inputRef.current.value = '';
    inputRef.current.focus();
    const newHistory = [...history, { role: 'user', content: msg }];
    setHistory(newHistory);
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg, symbol: sheet, history: history.slice(-6) })
      });
      const d = await r.json();
      setHistory(h => [...h, { role: 'assistant', content: d.response || 'No response' }]);
    } catch {
      setHistory(h => [...h, { role: 'assistant', content: 'Sorry, could not connect.' }]);
    }
    setLoading(false);
  };

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 500, backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end' }}>
      <div style={{ background: 'white', borderRadius: '24px 24px 0 0', width: '100%', height: '70dvh', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#00e676' }}>AI</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>Ask ARIA</div>
              <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#9ca3af' }}>Llama 3.3 70B · {sheet || 'Market'} context</div>
            </div>
          </div>
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12 }}>✕</div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
              <div style={{ fontWeight: 600, fontSize: 16, color: '#0f172a', marginBottom: 8 }}>Ask me anything about the market</div>
              <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>Try: "What's the outlook for tech stocks?" or "Explain why META is dropping"</div>
            </div>
          )}
          {history.map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '85%', background: m.role === 'user' ? '#0f172a' : 'white', border: m.role === 'user' ? 'none' : '1px solid #f3f4f6', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', padding: '10px 14px', fontSize: 13, color: m.role === 'user' ? 'white' : '#0f172a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 4, padding: '4px 14px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', animation: 'blink 1s .0s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', animation: 'blink 1s .2s infinite' }} />
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#d1d5db', animation: 'blink 1s .4s infinite' }} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8, background: 'white' }}>
          <input
            ref={inputRef}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask about ${sheet || 'the market'}...`}
            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 24, padding: '10px 16px', fontSize: 14, color: '#0f172a', outline: 'none', fontFamily: 'system-ui', background: '#f9fafb' }}
          />
          <button onClick={send} disabled={loading}
            style={{ width: 42, height: 42, borderRadius: '50%', background: '#0f172a', border: 'none', color: 'white', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>↑</button>
        </div>
      </div>
    </div>
  );
}