'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
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

// Web Speech API type declarations
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  interface SpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((e: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  }
  interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
  }
  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }
  interface SpeechRecognitionResult {
    readonly length: number;
    readonly isFinal: boolean;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }
  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }
  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
  }
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      setVoiceSupported(!!SR);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!ttsEnabled || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = i18n.language || 'en';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled, i18n.language]);

  const toggleRecording = useCallback(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;

    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      setInterimText('');
      return;
    }

    const recognition = new SR();
    recognition.lang = i18n.language || 'en';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < e.results.length; i++) {
        const result = e.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setInterimText(interim);
      if (final) {
        setInput(prev => (prev + ' ' + final).trim());
        setInterimText('');
      }
    };

    recognition.onend = () => {
      setRecording(false);
      setInterimText('');
      inputRef.current?.focus();
    };

    recognition.onerror = () => {
      setRecording(false);
      setInterimText('');
    };

    recognition.start();
    setRecording(true);
  }, [recording, i18n.language]);

  const suggestions: string[] = t('chat.suggestions', { returnObjects: true }) as string[];

  async function send(text?: string) {
    const msg = (text || input).trim();
    if (!msg || streaming) return;
    setInput('');
    setInterimText('');
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
      let buffer = '';
      let fullText = '';

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
            if (text) {
              fullText += text;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: m.content + text } : m
              ));
            }
          } catch {}
        }
      }

      // Speak the response if TTS enabled
      if (fullText) speak(fullText);

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
        <div className="ml-auto flex items-center gap-2">
          {/* TTS toggle */}
          <button
            onClick={() => {
              if (ttsEnabled) window.speechSynthesis?.cancel();
              setTtsEnabled(!ttsEnabled);
            }}
            title={ttsEnabled ? 'Disable voice responses' : 'Enable voice responses'}
            className={clsx('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors',
              ttsEnabled ? 'bg-[#003087] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{ttsEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
          <span className="badge bg-green-100 text-green-700">DeepSeek AI</span>
        </div>
      </div>

      <div className="card flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8 space-y-4">
              <Bot className="w-12 h-12 text-[#C9A84C] mx-auto" />
              <p className="text-gray-500 text-sm">
                Ask me anything about Minoan Lines — in any language!
                {voiceSupported && <span className="text-blue-500"> 🎤 Voice input supported.</span>}
              </p>
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

        {/* Interim voice text */}
        {interimText && (
          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
            <span className="text-xs text-blue-500 italic">🎤 {interimText}</span>
          </div>
        )}

        <div className="border-t p-4">
          <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2">
            {/* Mic button */}
            {voiceSupported && (
              <button type="button" onClick={toggleRecording}
                title={recording ? 'Stop recording' : `Speak in ${i18n.language?.toUpperCase() || 'EN'}`}
                className={clsx('flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-colors',
                  recording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200')}>
                {recording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}

            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={recording ? '🎤 Listening...' : t('chat.placeholder')}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003087]"
              disabled={streaming}
            />
            <button type="submit" disabled={!input.trim() || streaming}
              className="btn-primary flex items-center gap-1 flex-shrink-0">
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          {voiceSupported && (
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              🎤 Voice input active · speaks in <strong>{i18n.language?.toUpperCase() || 'EN'}</strong> · {ttsEnabled ? '🔊 AI will speak responses' : 'click Voice On for spoken responses'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
