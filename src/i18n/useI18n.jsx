import { createContext, useContext, useState, useCallback } from "react";
import en from "./en.json";
import lg from "./lg.json";
import sw from "./sw.json";
import nyn from "./nyn.json";
import ach from "./ach.json";
import lso from "./lso.json";
import lumasaba from "./lumasaba.json";
import lunyoro from "./lunyoro.json";
import luruuli from "./luruuli.json";

const TRANSLATIONS = { en, lg, sw, nyn, ach, lso, lumasaba, lunyoro, luruuli };

const LANGUAGE_NAMES = {
  en: "English",
  lg: "Luganda",
  sw: "Kiswahili",
  nyn: "Runyankole",
  ach: "Acholi",
  lso: "Lusoga",
  lumasaba: "Lumasaba",
  lunyoro: "Lunyoro",
  luruuli: "Luruuli",
};

const STORAGE_KEY = "rc_language";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored && TRANSLATIONS[stored] ? stored : "en";
    } catch {
      return "en";
    }
  });

  const setLang = useCallback((code) => {
    if (!TRANSLATIONS[code]) return;
    setLangState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      /* ignore */
    }
  }, []);

  /**
   * Resolve a dot-separated key like "auth.login" against the active translation,
   * falling back to English, then to the key itself.
   * Supports simple {{placeholder}} interpolation.
   */
  const t = useCallback(
    (key, vars) => {
      const resolve = (obj, k) => {
        const parts = k.split(".");
        let cur = obj;
        for (const part of parts) {
          if (cur == null || typeof cur !== "object") return undefined;
          cur = cur[part];
        }
        return typeof cur === "string" ? cur : undefined;
      };

      let text =
        resolve(TRANSLATIONS[lang], key) ??
        resolve(TRANSLATIONS["en"], key) ??
        key;

      if (vars && typeof vars === "object") {
        text = text.replace(/\{\{(\w+)\}\}/g, (_, name) =>
          vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`,
        );
      }

      return text;
    },
    [lang],
  );

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        languages: LANGUAGE_NAMES,
        availableLangs: Object.keys(TRANSLATIONS),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook – must be used inside <LanguageProvider>
 * Returns { lang, setLang, t, languages, availableLangs }
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
