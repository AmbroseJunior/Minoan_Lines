'use client';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Bot, User, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type Message = { role: 'user' | 'assistant'; content: string; id: string };

const getSessionId = () => {
  if (typeof window === 'undefined') return 'default';
  const key = 'chat_sid';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = Math.random().toString(36).slice(2);
  sessionStorage.setItem(key, id);
  return id;
};

export default function ChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const suggestions: string[] = t('chat.suggestions', { returnObjects: true }) as string[];

  async function send(text?: string) {
    const msg = text || input.trim();
    if (!msg || streaming) return;
    setInput('');
    const userMsg: Message = { role: 'user', content: msg, id: Date.now().toString() };
    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '', id: assistantId }]);
    setStreaming(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, session_id: getSessionId() }),
      });

      if (!res.ok || !res.body) {
        const err = await res.text();
        throw new Error(err);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text } = JSON.parse(data);
            if (text) setMessages(prev => prev.map(m =>
              m.id === assistantId ? { ...m, content: m.content + text } : m
            ));
          } catch {}
        }
      }
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Error';
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: `⚠️ ${errMsg}` } : m
      ));
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-[#003087]" />
        <h1 className="text-xl font-bold text-[#001A4D]">{t('chat.title')}</h1>
        <span className="badge bg-green-100 text-green-700 ml-auto">DeepSeek AI</span>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <Bot className="w-12 h-12 text-[#C9A84C] mx-auto" />
              <p className="text-gray-500 text-sm">Ask me anything about Minoan Lines — in any language!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {suggestions.map((s: string) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs bg-blue-50 text-blue-700 p-2.5 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={clsx('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
              <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                m.role === 'user' ? 'bg-[#003087]' : 'bg-[#C9A84C]')}>
                {m.role === 'user'
                  ? <User className="w-4 h-4 text-white" />
                  : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={clsx('max-w-[80%] rounded-xl px-4 py-2.5 text-sm',
                m.role === 'user' ? 'bg-[#003087] text-white' : 'bg-gray-100 text-gray-800')}>
                {m.content || (streaming && m.role === 'assistant' && (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ))}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="border-t p-4">
          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              placeholder={t('chat.placeholder')}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              disabled={streaming} />
            <button type="submit" disabled={!input.trim() || streaming} className="btn-primary flex items-center gap-1">
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
