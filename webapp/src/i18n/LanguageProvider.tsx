import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type SupportedLocale } from "./translations";

interface LanguageContextType {
  locale: SupportedLocale;
  setLocale: (newLocale: SupportedLocale) => void;
  t: (key: string) => string;
}

const LOCAL_STORAGE_KEY = "yovi-locale";
const defaultLocale: SupportedLocale = "es";

const LanguageContext = createContext<LanguageContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key: string) => key,
});

function getInitialLocale(): SupportedLocale {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved === "es" || saved === "en") return saved;

  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith("en")) return "en";
  return "es";
}

function translate(locale: SupportedLocale, key: string): string {
  const parts = key.split(".");
  let current: any = translations[locale];
  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return key;
    }
  }
  return typeof current === "string" ? current : key;
}

export function LanguageProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [locale, setLocale] = useState<SupportedLocale>(getInitialLocale);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, locale);
  }, [locale]);

  const t = useMemo(() => (key: string) => translate(locale, key), [locale]);
  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguageContext() {
  return useContext(LanguageContext);
}

export type { SupportedLocale };
