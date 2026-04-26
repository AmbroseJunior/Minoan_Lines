'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowser } from '@/lib/supabaseClient';
import LoginScreen from './LoginScreen';

type AuthCtx = { user: User | null; signOut: () => Promise<void> };
const AuthContext = createContext<AuthCtx>({ user: null, signOut: async () => {} });

export function useAuth() { return useContext(AuthContext); }

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const db = getSupabaseBrowser();
    db.auth.getSession().then(({ data }: { data: { session: { user: import('@supabase/supabase-js').User } | null } }) => {
      setUser(data.session?.user ?? null);
      setChecking(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function signOut() {
    await getSupabaseBrowser().auth.signOut();
    setUser(null);
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #001A4D 0%, #003087 50%, #001A4D 100%)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
          <span className="text-blue-200 text-sm">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!user) return <LoginScreen />;

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
