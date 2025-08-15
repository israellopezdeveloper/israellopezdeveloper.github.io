'use client';

import * as React from 'react';

import { LANGS, type Lang } from '../../lib/i18n';

type State = { lang: Lang; short: boolean };
type Ctx = State & {
  setLang: (l: Lang) => void;
  setShort: (s: boolean) => void;
};

const LanguageContext = React.createContext<Ctx | null>(null);

const STORAGE_KEY = 'cv_lang';
const STORAGE_SHORT = 'cv_short';

function getInitialLang(): Lang {
  // valor estable para SSR; se corrige en cliente
  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [lang, setLang] = React.useState<Lang>(getInitialLang());
  const [short, setShort] = React.useState<boolean>(false);
  const mounted = React.useRef(false);

  // al montar, lee preferencias reales
  React.useEffect(() => {
    mounted.current = true;
    const saved = (typeof window !== 'undefined' &&
      localStorage.getItem(STORAGE_KEY)) as Lang | null;
    const savedShort = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_SHORT)) as
      | 'true'
      | 'false'
      | null;

    if (saved && LANGS.includes(saved)) setLang(saved);
    else {
      const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
      setLang(LANGS.includes(nav as Lang) ? (nav as Lang) : 'en');
    }
    if (savedShort != null) setShort(savedShort === 'true');
  }, []);

  React.useEffect(() => {
    if (!mounted.current) return;
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  React.useEffect(() => {
    if (!mounted.current) return;
    localStorage.setItem(STORAGE_SHORT, String(short));
  }, [short]);

  const value: Ctx = { lang, short, setLang, setShort };
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
