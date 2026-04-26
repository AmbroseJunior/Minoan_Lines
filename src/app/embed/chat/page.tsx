'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Ship, X, MessageCircle } from 'lucide-react';

type Msg = { role: 'user' | 'assistant'; content: string };

const SUGGESTIONS = [
  'What routes does Minoan Lines operate?',
  'Next departure to Heraklion?',
  'Cabin options available?',
  'How early should I arrive at the port?',
];

export default function EmbedChatPage() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: 'Hello! I\'m the Minoan Lines AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(text?: string) {
    const msg = text ?? input.trim();
    if (!msg || loading) return;
    setInput('');
    const next: Msg[] = [...messages, { role: 'user', content: msg }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: next.slice(-8) }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Sorry, I could not process that.' }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 font-sans">

      {/* Chat window */}
      {open && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: 520 }}>

          {/* Header */}
          <div className="bg-[#001A4D] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#C9A84C] rounded-full p-1.5">
                <Ship className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm leading-tight">Minoan Lines</div>
                <div className="text-blue-300 text-xs">AI Assistant · Online</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-blue-300 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#003087] text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#003087]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-3 py-2 flex gap-1.5 flex-wrap border-t border-gray-100 bg-white flex-shrink-0">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-xs bg-blue-50 text-[#003087] border border-blue-100 rounded-full px-2.5 py-1 hover:bg-blue-100 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-100 bg-white flex-shrink-0">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
              <input
                value={input} onChange={e => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#003087] bg-gray-50"
              />
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

      {/* Bubble button */}
      <button onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-[#003087] hover:bg-[#001A4D] text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95">
        {open
          ? <X className="w-6 h-6" />
          : <MessageCircle className="w-6 h-6" />
        }
        {!open && messages.length > 1 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C9A84C] rounded-full text-xs font-bold flex items-center justify-center">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>
    </div>
  );
}
