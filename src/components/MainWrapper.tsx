'use client';
import { usePathname } from 'next/navigation';

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path?.startsWith('/embed')) return <>{children}</>;
  return <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>;
}
