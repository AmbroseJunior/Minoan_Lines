import Link from 'next/link';
import { Ship, MessageCircle, FileText, Headphones, BarChart2, Ticket } from 'lucide-react';

const modules = [
  { href: '/book', title: 'Reserve a Ferry', desc: 'Book tickets — confirmation sent to your email', icon: Ticket, color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', featured: true },
  { href: '/vessels', title: 'Vessel Operations', desc: 'Real-time AIS tracking & delay prediction', icon: Ship, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { href: '/chat', title: 'AI Customer Agent', desc: 'Intelligent assistant in any language', icon: MessageCircle, color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
  { href: '/compliance', title: 'EU Compliance', desc: 'EU ETS & FuelEU Maritime reports', icon: FileText, color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { href: '/helpdesk', title: 'IT Helpdesk', desc: 'AI-triaged tickets & SLA tracking', icon: Headphones, color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  { href: '/analytics', title: 'Analytics & Insights', desc: 'Demand forecasting & performance', icon: BarChart2, color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-[#001A4D] dark:text-slate-100">Minoan Lines AI Platform</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">AI-Powered Operations Platform — Powered by IntegraMind AI</p>
      </div>
      {/* Featured booking card */}
      <Link href="/book" className="block card p-5 border-2 border-[#C9A84C]/40 hover:border-[#C9A84C] hover:shadow-md transition-all group bg-gradient-to-r from-white to-amber-50/40 dark:from-slate-800 dark:to-amber-900/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#C9A84C]/15 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-6 h-6 text-[#C9A84C]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-[#003087] dark:group-hover:text-blue-400">Reserve a Ferry</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">Book tickets online — instant confirmation sent to your email</p>
          </div>
          <span className="ml-auto text-xs font-semibold bg-[#C9A84C] text-white px-2.5 py-1 rounded-full flex-shrink-0">Book Now</span>
        </div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.filter(m => !m.featured).map(({ href, title, desc, icon: Icon, color }) => (
          <Link key={href} href={href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-[#003087] dark:group-hover:text-blue-400">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
