'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Sun, Moon, Ticket, LayoutDashboard, Activity, LogOut, Menu, X, Shield, Presentation } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';

export default function Nav() {
  const path = usePathname();
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  if (path?.startsWith('/embed')) return null;

  const links = [
    { href: '/vessels', label: t('nav.vessels'), icon: Ship },
    { href: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { href: '/compliance', label: t('nav.compliance'), icon: FileText },
    { href: '/helpdesk', label: t('nav.helpdesk'), icon: Headphones },
    { href: '/analytics', label: t('nav.analytics'), icon: BarChart2 },
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/health', label: 'Health', icon: Activity },
    { href: '/audit', label: 'Audit', icon: Shield },
    { href: '/demo', label: 'Pitch', icon: Presentation },
    { href: '/pricing', label: 'Pricing', icon: Ticket },
  ];

  const linkClass = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all
    ${path?.startsWith(href)
      ? 'text-white shadow-inner'
      : 'text-blue-200 hover:text-white hover:bg-white/10'}`;

  const activeLinkStyle = (href: string): React.CSSProperties =>
    path?.startsWith(href)
      ? { background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)', border: '1px solid rgba(255,255,255,0.15)' }
      : {};

  return (
    <nav className="text-white relative z-50"
      style={{
        background: 'linear-gradient(135deg, #001A4D 0%, #002a70 100%)',
        boxShadow: '0 2px 20px rgba(0,26,77,0.35), 0 1px 0 rgba(201,168,76,0.2)',
      }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" onClick={() => setOpen(false)}>
            <Image src="/minoan-logo.svg" alt="Minoan Lines" width={140} height={35} className="h-9 w-auto" priority />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className={linkClass(href)} style={activeLinkStyle(href)}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}

            <Link href="/book"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ml-1
                ${path?.startsWith('/book') ? 'bg-[#C9A84C] text-white' : 'bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white border border-[#C9A84C]/40'}`}>
              <Ticket className="w-4 h-4" />
              <span className="hidden xl:inline">Book</span>
            </Link>

            <div className="ml-1 border-l border-white/20 pl-2 flex items-center gap-1">
              <button onClick={toggle} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <LanguageSwitcher />
              {user && (
                <button onClick={signOut} title={`Sign out (${user.email})`}
                  className="p-1.5 rounded-lg text-blue-200 hover:text-red-300 hover:bg-white/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile right side: theme + hamburger */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={toggle}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <LanguageSwitcher />
            <button onClick={() => setOpen(o => !o)} aria-label="Toggle menu"
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 space-y-1 nav-dropdown"
          style={{ background: 'linear-gradient(180deg, #001A4D 0%, #002060 100%)' }}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${path?.startsWith(href) ? 'bg-[#003087] text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}

          <Link href="/book" onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors
              ${path?.startsWith('/book') ? 'bg-[#C9A84C] text-white' : 'bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white border border-[#C9A84C]/40'}`}>
            <Ticket className="w-4 h-4" />
            Book a Ferry
          </Link>

          {user && (
            <button onClick={() => { signOut(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-white/10 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out ({user.email})
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
