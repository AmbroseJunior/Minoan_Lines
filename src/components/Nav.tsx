'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Anchor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

export default function Nav() {
  const path = usePathname();
  const { t } = useTranslation();

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
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${path?.startsWith(href) ? 'bg-[#003087] text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
            <div className="ml-1 border-l border-white/20 pl-1">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
