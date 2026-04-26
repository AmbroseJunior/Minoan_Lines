'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX, Copy, Pencil, Trash2, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';

type Message = { role: 'user' | 'assistant'; content: string; id: string };

const getSessionId = () => {
  if (typeof window === 'undefined') return 'default';
  const existing = sessionStorage.getItem('chat_sid');
  if (existing) return existing;
  const id = Math.random().toString(36).slice(2);
  sessionStorage.setItem('chat_sid', id);
  return id;
};

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  interface SpeechRecognition extends EventTarget {
    lang: string; continuous: boolean; interimResults: boolean;
    start(): void; stop(): void; abort(): void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  }
  interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; }
  interface SpeechRecognitionResultList {
    readonly length: number; item(index: number): SpeechRecognitionResult; [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    readonly length: number; readonly isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative; [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative { readonly transcript: string; readonly confidence: number; }
  interface SpeechRecognitionErrorEvent extends Event { readonly error: string; }
}

export default function ChatPage() {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [recording, setRecording] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<'online' | 'checking' | 'limited'>('checking');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef('');

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      setVoiceSupported(!!SR);
    }
    // check service health
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setServiceStatus(d.overall === 'healthy' ? 'online' : 'limited'))
      .catch(() => setServiceStatus('limited'));
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = (i18n.language || 'en').split('-')[0];
    utterance.lang = i18n.language || 'en';
    utterance.rate = 0.95; utterance.pitch = 1.05;
    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const femaleExact = voices.find(v => (v.lang === i18n.language || v.lang.startsWith(langCode)) && /female|woman|zira|samantha|victoria|karen|moira|tessa|fiona|google/i.test(v.name));
      const anyLang = voices.find(v => v.lang.startsWith(langCode));
      const googleFallback = voices.find(v => /google/i.test(v.name));
      const chosen = femaleExact || anyLang || googleFallback;
      if (chosen) utterance.voice = chosen;
    };
    if (window.speechSynthesis.getVoices().length > 0) { selectVoice(); }
    else { window.speechSynthesis.onvoiceschanged = () => { selectVoice(); window.speechSynthesis.onvoiceschanged = null; }; }
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, i18n.language]);

  const sendMessage = useCallback(async (text: string) => {
    const msg = text.trim();
    if (!msg || streaming) return;
    setInput(''); setInterimText('');
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
      if (!res.ok || !res.body) throw new Error(await res.text());
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = ''; let fullText = '';
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
            if (text) { fullText += text; setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: m.content + text } : m)); }
          } catch {}
        }
      }
      if (fullText) speak(fullText);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Error';
      setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `We apologise — ${errMsg}` } : m));
    } finally { setStreaming(false); inputRef.current?.focus(); }
  }, [streaming, speak]);

  const send = useCallback((text?: string) => { sendMessage(text || input); }, [sendMessage, input]);

  async function copyMessage(content: string, id: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function editMessage(msg: Message) {
    const idx = messages.findIndex(m => m.id === msg.id);
    setMessages(prev => prev.slice(0, idx));
    setInput(msg.content);
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function deleteMessage(id: string) {
    setMessages(prev => {
      const idx = prev.findIndex(m => m.id === id);
      if (idx === -1) return prev;
      // if deleting a user msg, also remove the following assistant msg
      const next = [...prev];
      if (next[idx].role === 'user' && next[idx + 1]?.role === 'assistant') {
        next.splice(idx, 2);
      } else {
        next.splice(idx, 1);
      }
      return next;
    });
  }

  const toggleRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recording) { recognitionRef.current?.stop(); setRecording(false); setInterimText(''); return; }
    finalTextRef.current = '';
    const recognition = new SR();
    recognition.lang = i18n.language || 'en';
    recognition.continuous = false; recognition.interimResults = true;
    recognitionRef.current = recognition;
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) { finalTextRef.current = (finalTextRef.current + ' ' + result[0].transcript).trim(); }
        else { interim += result[0].transcript; }
      }
      setInterimText(interim);
      if (finalTextRef.current) setInput(finalTextRef.current);
    };
    recognition.onend = () => {
      setRecording(false); setInterimText('');
      const captured = finalTextRef.current; finalTextRef.current = '';
      if (captured) { sendMessage(captured); } else { inputRef.current?.focus(); }
    };
    recognition.onerror = () => { setRecording(false); setInterimText(''); finalTextRef.current = ''; };
    recognition.start(); setRecording(true);
  }, [recording, i18n.language, sendMessage]);

  const suggestions: string[] = t('chat.suggestions', { returnObjects: true }) as string[];

  const statusDot = serviceStatus === 'online'
    ? 'bg-green-400 shadow-green-400/50'
    : serviceStatus === 'limited'
      ? 'bg-yellow-400 shadow-yellow-400/50'
      : 'bg-gray-400';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-[#003087]" />
        <h1 className="text-xl font-bold text-[#001A4D] dark:text-slate-100">{t('chat.title')}</h1>
        <div className="flex items-center gap-1.5 ml-1">
          <span className={clsx('w-2 h-2 rounded-full shadow-md', statusDot)} />
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {serviceStatus === 'online' ? '24/7 Online' : serviceStatus === 'limited' ? 'Limited' : 'Checking...'}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => { if (ttsEnabled) window.speechSynthesis?.cancel(); setTtsEnabled(!ttsEnabled); }}
            title={ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
              ttsEnabled ? 'bg-[#003087] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600')}>
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
          <span className="badge bg-[#C9A84C]/20 text-[#8B6914] dark:bg-[#C9A84C]/10 dark:text-[#C9A84C]">IntegraMind AI</span>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#003087] to-[#C9A84C] flex items-center justify-center mx-auto shadow-lg">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-gray-800 dark:text-slate-200 font-medium text-base">Hello, I am Sofia.</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
                  Your personal Minoan Lines travel assistant. How may I help you today?
                  {voiceSupported && <span className="text-[#003087] dark:text-blue-400"> You can also speak to me.</span>}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {suggestions.map((s: string) => (
                  <button key={s} onClick={() => send(s)}
                    className="text-xs bg-blue-50 dark:bg-slate-700 text-blue-700 dark:text-blue-300 p-2.5 rounded-lg hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors text-left">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id}
              className={clsx('flex gap-3 group', m.role === 'user' && 'flex-row-reverse')}
              onMouseEnter={() => setHoveredId(m.id)}
              onMouseLeave={() => setHoveredId(null)}>

              <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                m.role === 'user' ? 'bg-[#003087]' : 'bg-gradient-to-br from-[#003087] to-[#C9A84C]')}>
                {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
              </div>

              <div className={clsx('flex flex-col gap-1 max-w-[78%]', m.role === 'user' && 'items-end')}>
                <div className={clsx('rounded-xl px-4 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-[#003087] text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-100 rounded-bl-sm')}>
                  {m.content || (streaming && m.role === 'assistant' && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />)}
                </div>

                {/* Action buttons — show on hover, hide while streaming */}
                {hoveredId === m.id && !streaming && m.content && (
                  <div className={clsx('flex items-center gap-1', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                    <button onClick={() => copyMessage(m.content, m.id)} title="Copy"
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      {copiedId === m.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy'}</span>
                    </button>
                    {m.role === 'user' && (
                      <button onClick={() => editMessage(m)} title="Edit & resend"
                        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                        <Pencil className="w-3 h-3" /><span>Edit</span>
                      </button>
                    )}
                    <button onClick={() => deleteMessage(m.id)} title="Delete"
                      className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                      <Trash2 className="w-3 h-3" /><span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {interimText && (
          <div className="px-4 py-2 bg-blue-50 dark:bg-slate-700/50 border-t border-blue-100 dark:border-slate-600">
            <span className="text-xs text-blue-500 dark:text-blue-400 italic">{interimText}</span>
          </div>
        )}

        <div className="border-t border-gray-200 dark:border-slate-700 p-4">
          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
            {voiceSupported && (
              <button type="button" onClick={toggleRecording}
                title={recording ? 'Stop recording' : `Speak in ${i18n.language?.toUpperCase() || 'EN'}`}
                className={clsx('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  recording ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600')}>
                {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
            <div className="relative flex-1 group/input">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={recording ? 'Listening...' : t('chat.placeholder')}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087] bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 pr-16"
                disabled={streaming}
              />
              {input && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
                  <button type="button" onClick={() => { navigator.clipboard.writeText(input); }}
                    title="Copy input"
                    className="p-1 text-gray-300 hover:text-gray-500 dark:hover:text-slate-300 transition-colors rounded">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => setInput('')}
                    title="Clear input"
                    className="p-1 text-gray-300 hover:text-red-400 transition-colors rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
            <button type="submit" disabled={!input.trim() || streaming}
              className="btn-primary flex items-center gap-1 flex-shrink-0">
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          {voiceSupported && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5 text-center">
              Voice input active in <strong>{i18n.language?.toUpperCase() || 'EN'}</strong>
              {ttsEnabled ? ' · Sofia will speak her responses' : ' · enable Voice On for spoken responses'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
