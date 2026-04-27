'use client';
import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Send, Loader2, Ship, X, MessageCircle, Copy, Pencil, Trash2, Check, Minimize2 } from 'lucide-react';
import { useAuth } from './AuthProvider';

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

const SUGGESTIONS = [
  'What routes does Minoan Lines operate?',
  'Next departure to Heraklion?',
  'Cabin options available?',
  'Port arrival time?',
];

export default function GlobalChatWidget() {
  const path = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "Hello! I'm the Minoan Lines AI assistant. How can I help you today?", id: '0' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Hide on chat page and embed routes
  if (!user || path?.startsWith('/chat') || path?.startsWith('/embed')) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    const userMsg: Msg = { role: 'user', content: msg, id: Date.now().toString() };
    const assistantId = (Date.now() + 1).toString();
    setMessages(m => [...m, userMsg, { role: 'assistant', content: '', id: assistantId }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok || !res.body) throw new Error('Service error');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n'); buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data);
            if (text) setMessages(m => m.map(x => x.id === assistantId ? { ...x, content: x.content + text } : x));
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setMessages(m => m.map(x => x.id === assistantId ? { ...x, content: 'Sorry, service temporarily unavailable.' } : x));
    } finally { setLoading(false); }
  }

  async function copyMsg(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id); setTimeout(() => setCopiedId(null), 2000);
  }

  function editMsg(msg: Msg) {
    const idx = messages.findIndex(m => m.id === msg.id);
    setMessages(prev => prev.slice(0, idx));
    setInput(msg.content);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function deleteMsg(id: string) {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      if (next[idx].role === 'user' && next[idx + 1]?.role === 'assistant') { next.splice(idx, 2); }
      else { next.splice(idx, 1); }
      return next;
    });
  }

  const userCount = messages.filter(m => m.role === 'user').length;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans">
      {open && (
        <div
          className="w-80 sm:w-96 rounded-2xl shadow-2xl border border-white/10 flex flex-col overflow-hidden"
          style={{
            height: 520,
            background: 'linear-gradient(180deg, #ffffff 0%, #f8faff 100%)',
            boxShadow: '0 25px 60px rgba(0,30,87,0.25), 0 8px 20px rgba(0,30,87,0.12)',
          }}
        >
          {/* Header */}
          <div
            className="px-4 py-3 flex items-center justify-between flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #001A4D 0%, #003087 100%)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="bg-[#C9A84C] rounded-full p-1.5 shadow-lg">
                  <Ship className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#001A4D]" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight tracking-wide">Minoan Lines</div>
                <div className="text-blue-300 text-xs tracking-wide">AI Assistant · 24/7 Online</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setOpen(false)} title="Minimise"
                className="text-blue-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setOpen(false)} title="Close"
                className="text-blue-300 hover:text-white transition-colors p-1 rounded hover:bg-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: 'linear-gradient(180deg, #f0f4ff 0%, #f8faff 100%)' }}>
            {messages.map(m => (
              <div key={m.id}
                className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-blue-100/60 rounded-bl-sm'
                }`}
                  style={m.role === 'user' ? {
                    background: 'linear-gradient(135deg, #003087 0%, #0047CC 100%)',
                    boxShadow: '0 2px 8px rgba(0,48,135,0.3)',
                  } : {
                    boxShadow: '0 1px 4px rgba(0,30,87,0.08)',
                  }}>
                  {m.content || (loading && m.role === 'assistant' && (
                    <div className="flex gap-1 items-center py-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ))}
                </div>
                {hoveredId === m.id && !loading && m.content && (
                  <div className={`flex items-center gap-1 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <button onClick={() => copyMsg(m.content, m.id)} title="Copy"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-white transition-colors">
                      {copiedId === m.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    {m.role === 'user' && (
                      <button onClick={() => editMsg(m)} title="Edit"
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-blue-500 hover:bg-white transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => deleteMsg(m.id)} title="Delete"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-red-500 hover:bg-white transition-colors">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs bg-white text-[#003087] border border-blue-200 rounded-full px-2.5 py-1 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-sm">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-blue-100/60 bg-white flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-14 focus:outline-none focus:ring-2 focus:ring-[#003087]/40 bg-gray-50 hover:bg-white transition-colors"
                />
                {input && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                    <button type="button" onClick={() => navigator.clipboard.writeText(input)} title="Copy input"
                      className="p-0.5 text-gray-300 hover:text-gray-500 transition-colors rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                    <button type="button" onClick={() => setInput('')} title="Clear"
                      className="p-0.5 text-gray-300 hover:text-red-400 transition-colors rounded">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" disabled={!input.trim() || loading}
                className="text-white rounded-xl px-3 py-2 transition-all disabled:opacity-40 shadow-sm hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #003087 0%, #0047CC 100%)' }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <div className="text-center mt-1.5">
              <span className="text-xs text-gray-400">Powered by </span>
              <span className="text-xs font-semibold" style={{ color: '#C9A84C' }}>IntegraMind AI</span>
            </div>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        className="relative w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        style={{
          background: open
            ? 'linear-gradient(135deg, #001A4D 0%, #003087 100%)'
            : 'linear-gradient(135deg, #003087 0%, #0047CC 100%)',
          boxShadow: '0 8px 25px rgba(0,48,135,0.45)',
        }}>
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && userCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white shadow-md"
            style={{ background: '#C9A84C' }}>
            {userCount}
          </span>
        )}
        {!open && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: '#003087' }} />
        )}
      </button>
    </div>
  );
}
