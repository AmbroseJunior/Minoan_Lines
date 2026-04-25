'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Anchor } from 'lucide-react';

const links = [
  { href: '/vessels', label: 'Vessel Ops', icon: Ship },
  { href: '/chat', label: 'AI Agent', icon: MessageCircle },
  { href: '/compliance', label: 'Compliance', icon: FileText },
  { href: '/helpdesk', label: 'Helpdesk', icon: Headphones },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
];

export default function Nav() {
  const path = usePathname();
  return (
    <nav className="bg-[#001A4D] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-base">
            <Anchor className="w-5 h-5 text-[#C9A84C]" />
            <span className="hidden sm:inline">Minoan Lines AI</span>
            <span className="sm:hidden">ML</span>
          </Link>
          <div className="flex gap-1">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${path?.startsWith(href) ? 'bg-[#003087] text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
