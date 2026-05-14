'use client';
import Link from 'next/link';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Ticket, Users, Wrench, LayoutDashboard, Activity, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n';

export default function Home() {
  const { t } = useTranslation();

  const modules = [
    { href: '/vessels',     key: 'vessels',     icon: Ship,            color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    { href: '/chat',        key: 'chat',        icon: MessageCircle,   color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    { href: '/compliance',  key: 'compliance',  icon: FileText,        color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
    { href: '/helpdesk',    key: 'helpdesk',    icon: Headphones,      color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    { href: '/analytics',   key: 'analytics',   icon: BarChart2,       color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
    { href: '/employees',   key: 'crew',        icon: Users,           color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    { href: '/maintenance', key: 'maintenance', icon: Wrench,          color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { href: '/dashboard',   key: 'dashboard',   icon: LayoutDashboard, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    { href: '/health',      key: 'health',      icon: Activity,        color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    { href: '/audit',       key: 'audit',       icon: Shield,          color: 'bg-slate-50 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300' },
  ];

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-[#001A4D] dark:text-slate-100">{t('home.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('home.subtitle')}</p>
      </div>

      {/* Featured booking card */}
      <Link href="/book" className="block card p-5 border-2 border-[#C9A84C]/40 hover:border-[#C9A84C] hover:shadow-md transition-all group bg-gradient-to-r from-white to-amber-50/40 dark:from-slate-800 dark:to-amber-900/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-[#003087] dark:group-hover:text-blue-400">{t('home.modules.book')}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('home.modules.bookDesc')}</p>
          </div>
          <span className="ml-auto text-xs font-semibold bg-[#C9A84C] text-white px-2.5 py-1 rounded-full flex-shrink-0">{t('home.bookNow')}</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(({ href, key, icon: Icon, color }) => (
          <Link key={href} href={href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-[#003087] dark:group-hover:text-blue-400">
              {t(`home.modules.${key}`)}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              {t(`home.modules.${key}Desc`)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}