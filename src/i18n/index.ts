import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Locale, defaultLocale } from "./config";

import en from "./messages/en.json";
import es from "./messages/es.json";

const messages: Record<string, typeof en> = { en, es };

interface I18nStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => set({ locale }),
    }),
    { name: "tradevault-locale" }
  )
);

export function useTranslations() {
  const locale = useI18nStore((s) => s.locale);
  const msg = messages[locale] ?? messages.en;

  function t(key: string, params?: Record<string, string | number>): string {
    const keys = key.split(".");
    let value: any = msg;
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    if (typeof value !== "string") return key;
    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? ""));
    }
    return value;
  }

  return t;
}
