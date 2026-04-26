'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Anchor, Sun, Moon, Ticket, LayoutDashboard, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import { useTheme } from './ThemeProvider';

export default function Nav() {
  const path = usePathname();
  const { t } = useTranslation();
  const { theme, toggle } = useTheme();

  const links = [
    { href: '/vessels', label: t('nav.vessels'), icon: Ship },
    { href: '/chat', label: t('nav.chat'), icon: MessageCircle },
    { href: '/compliance', label: t('nav.compliance'), icon: FileText },
    { href: '/helpdesk', label: t('nav.helpdesk'), icon: Headphones },
    { href: '/analytics', label: t('nav.analytics'), icon: BarChart2 },
  ];

  return (
    <nav className="bg-[#001A4D] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base flex-shrink-0">
            <Anchor className="w-5 h-5 text-[#C9A84C]" />
            <span className="hidden sm:inline">Minoan Lines AI</span>
            <span className="sm:hidden">ML</span>
          </Link>
          <div className="flex items-center gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${path?.startsWith(href) ? 'bg-[#003087] text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}

            {/* Dashboard */}
            <Link href="/dashboard"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${path?.startsWith('/dashboard') ? 'bg-[#003087] text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden xl:inline">Dashboard</span>
            </Link>

            {/* Health */}
            <Link href="/health"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${path?.startsWith('/health') ? 'bg-[#003087] text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}>
              <Activity className="w-4 h-4" />
              <span className="hidden xl:inline">Health</span>
            </Link>

            {/* Book CTA */}
            <Link href="/book"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ml-0.5
                ${path?.startsWith('/book') ? 'bg-[#C9A84C] text-white' : 'bg-[#C9A84C]/20 text-[#C9A84C] hover:bg-[#C9A84C] hover:text-white border border-[#C9A84C]/40'}`}>
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Book</span>
            </Link>

            <div className="ml-1 border-l border-white/20 pl-2 flex items-center gap-1">
              <button onClick={toggle}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors">
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
