export const REPORT_LANGUAGES = [
  { code: 'en',    label: 'English' },
  { code: 'el',    label: 'Ελληνικά (Greek)' },
  { code: 'it',    label: 'Italiano (Italian)' },
  { code: 'de',    label: 'Deutsch (German)' },
  { code: 'fr',    label: 'Français (French)' },
  { code: 'es',    label: 'Español (Spanish)' },
  { code: 'nl',    label: 'Nederlands (Dutch)' },
  { code: 'sv',    label: 'Svenska (Swedish)' },
  { code: 'ar',    label: 'العربية (Arabic)' },
  { code: 'zh',    label: '中文 (Chinese)' },
  { code: 'ja',    label: '日本語 (Japanese)' },
  { code: 'ru',    label: 'Русский (Russian)' },
];

export function languageLabel(code: string) {
  return REPORT_LANGUAGES.find(l => l.code === code)?.label ?? 'English';
}
