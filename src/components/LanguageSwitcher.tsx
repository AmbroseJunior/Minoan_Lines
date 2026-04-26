'use client';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES[i18n.language] || LANGUAGES[i18n.language?.split('-')[0]] || 'EN';
  const shortCode = (i18n.language || 'en').split('-')[0].toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors text-sm"
        aria-label="Change language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline font-medium">{shortCode}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-20 bg-white rounded-xl shadow-xl border border-gray-100 w-48 max-h-80 overflow-y-auto py-1">
            {Object.entries(LANGUAGES).map(([code, label]) => (
              <button
                key={code}
                onClick={() => { i18n.changeLanguage(code); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center justify-between
                  ${i18n.language?.startsWith(code) ? 'text-[#003087] font-semibold bg-blue-50' : 'text-gray-700'}`}
              >
                <span>{label}</span>
                {i18n.language?.startsWith(code) && <span className="w-2 h-2 rounded-full bg-[#003087]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
