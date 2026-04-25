import Link from 'next/link';
import { Ship, MessageCircle, FileText, Headphones, BarChart2 } from 'lucide-react';

const modules = [
  { href: '/vessels', title: 'Vessel Ops', desc: 'Real-time AIS tracking & delay prediction', icon: Ship, color: 'bg-blue-50 text-blue-700' },
  { href: '/chat', title: 'AI Customer Agent', desc: 'DeepSeek AI chat in Greek & English', icon: MessageCircle, color: 'bg-purple-50 text-purple-700' },
  { href: '/compliance', title: 'EU Compliance', desc: 'EU ETS & FuelEU Maritime reports', icon: FileText, color: 'bg-green-50 text-green-700' },
  { href: '/helpdesk', title: 'IT Helpdesk', desc: 'AI-triaged tickets & SLA tracking', icon: Headphones, color: 'bg-orange-50 text-orange-700' },
  { href: '/analytics', title: 'Analytics', desc: 'Demand forecasting & performance', icon: BarChart2, color: 'bg-rose-50 text-rose-700' },
];

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-[#001A4D]">Minoan Lines AI Platform</h1>
        <p className="text-gray-500 mt-1">AI-Powered Operations Platform — Powered by IntegraMind AI × DeepSeek</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(({ href, title, desc, icon: Icon, color }) => (
          <Link key={href} href={href} className="card p-5 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-900 group-hover:text-[#003087]">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
