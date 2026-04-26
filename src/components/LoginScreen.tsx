'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Loader2, Mail, Lock, UserPlus, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { getSupabaseBrowser } from '@/lib/supabaseClient';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const [mode, setMode]           = useState<Mode>('login');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const db = getSupabaseBrowser();

    try {
      if (mode === 'login') {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await db.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created. Please check your email to confirm your address, then log in.');
        setMode('login');
        setPassword('');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #001A4D 0%, #003087 50%, #001A4D 100%)' }}>

      {/* Decorative wave */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#C9A84C" d="M0,192L48,176C96,160,192,128,288,133.3C384,139,480,181,576,186.7C672,192,768,160,864,138.7C960,117,1056,107,1152,117.3C1248,128,1344,160,1392,176L1440,192L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full opacity-5" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="#fff" d="M0,256L60,240C120,224,240,192,360,197.3C480,203,600,245,720,245.3C840,245,960,203,1080,186.7C1200,171,1320,181,1380,186.7L1440,192L1440,320L0,320Z" />
        </svg>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">

        {/* Logo block */}
        <div className="flex flex-col items-center mb-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 border border-white/20 shadow-2xl mb-4">
            <Image src="/minoan-logo.svg" alt="Minoan Lines" width={240} height={60} className="h-14 w-auto" priority />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-px w-12 bg-[#C9A84C]/50" />
            <span className="text-[#C9A84C] text-xs font-semibold uppercase tracking-widest">AI Operations Platform</span>
            <div className="h-px w-12 bg-[#C9A84C]/50" />
          </div>
          <p className="text-blue-200 text-sm mt-2">Secure access for authorised personnel only</p>
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">

            {/* Tabs */}
            <div className="flex">
              {(['login', 'register'] as Mode[]).map(m => (
                <button key={m} onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                    mode === m
                      ? 'bg-white/15 text-white border-b-2 border-[#C9A84C]'
                      : 'text-blue-300 hover:text-white hover:bg-white/5'
                  }`}>
                  {m === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@minoan.gr" required autoComplete="email"
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-blue-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-200 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
                  <input
                    type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'} required
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-11 py-3 text-white placeholder-blue-300/60 text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition-all"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-red-200 text-sm">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-500/20 border border-green-400/30 rounded-xl px-4 py-3 text-green-200 text-sm">
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading || !email || !password}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all
                  bg-[#C9A84C] hover:bg-amber-500 text-white shadow-lg shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed">
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Authenticating...</>
                  : mode === 'login'
                    ? <><LogIn className="w-4 h-4" /> Sign In to Platform</>
                    : <><UserPlus className="w-4 h-4" /> Create Account</>
                }
              </button>
            </form>
          </div>

          {/* Security notice */}
          <div className="flex items-center justify-center gap-2 mt-5 text-blue-300/70 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secured by Supabase · TLS encrypted · Authorised access only</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6 text-blue-300/50 text-xs">
        © {new Date().getFullYear()} Minoan Lines S.A. · a Grimaldi Group company · Powered by IntegraMind AI
      </div>
    </div>
  );
}
