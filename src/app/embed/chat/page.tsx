'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Ship, X, MessageCircle, Copy, Pencil, Trash2, Check } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string; id: string };

const SUGGESTIONS = [
  'What routes does Minoan Lines operate?',
  'Next departure to Heraklion?',
  'Cabin options available?',
  'How early should I arrive at the port?',
];

export default function EmbedChatPage() {
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
          } catch {}
        }
      }
    } catch {
      setMessages(m => m.map(x => x.id === assistantId ? { ...x, content: 'Sorry, service temporarily unavailable. Please try again.' } : x));
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
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: 520 }}>

          <div className="bg-[#001A4D] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#C9A84C] rounded-full p-1.5">
                <Ship className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">Minoan Lines</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow shadow-green-400/50" />
                  <span className="text-blue-300 text-xs">AI Assistant · 24/7 Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-300 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(m => (
              <div key={m.id}
                className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoveredId(m.id)}
                onMouseLeave={() => setHoveredId(null)}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#003087] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                }`}>
                  {m.content || (loading && m.role === 'assistant' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />)}
                </div>

                {hoveredId === m.id && !loading && m.content && (
                  <div className={`flex items-center gap-1 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <button onClick={() => copyMsg(m.content, m.id)} title="Copy"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                      {copiedId === m.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    </button>
                    {m.role === 'user' && (
                      <button onClick={() => editMsg(m)} title="Edit"
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-blue-500 hover:bg-gray-100 transition-colors">
                        <Pencil className="w-3 h-3" />
                      </button>
                    )}
                    <button onClick={() => deleteMsg(m.id)} title="Delete"
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-colors">
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
                    className="text-xs bg-blue-50 text-[#003087] border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  value={input} onChange={e => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 pr-14 focus:outline-none focus:ring-2 focus:ring-[#003087] bg-gray-50"
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
                className="bg-[#003087] text-white rounded-xl px-3 py-2 hover:bg-[#001A4D] disabled:opacity-40 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-center mt-1.5">
              <span className="text-xs text-gray-400">Powered by </span>
              <span className="text-xs text-[#C9A84C] font-medium">IntegraMind AI</span>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)}
        className="relative w-14 h-14 bg-[#003087] hover:bg-[#001A4D] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95">
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        {!open && userCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A84C] rounded-full text-xs font-bold flex items-center justify-center">
            {userCount}
          </span>
        )}
      </button>
    </div>
  );
}
