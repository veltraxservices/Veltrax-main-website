import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext(null);

const detectLang = () => {
  if (typeof window === "undefined") return "el";
  const stored = window.localStorage.getItem("vx_lang");
  if (stored === "el" || stored === "en") return stored;
  const browser = (window.navigator.language || "el").toLowerCase();
  return browser.startsWith("el") ? "el" : browser.startsWith("en") ? "en" : "el";
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState("el");

  useEffect(() => {
    setLangState(detectLang());
  }, []);

  const setLang = useCallback((next) => {
    setLangState(next);
    try {
      window.localStorage.setItem("vx_lang", next);
    } catch (_) {}
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (path) => {
      const keys = path.split(".");
      let cur = translations[lang];
      for (const k of keys) {
        if (cur == null) return path;
        cur = cur[k];
      }
      return cur ?? path;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
};
