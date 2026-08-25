import { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import fr from "./fr.js";

const STORAGE_KEY = "fn_language";
const SUPPORTED = ["en", "fr"];
// Every customer is Paris/France-based - French is the right default for a
// first-time visitor. The toggle still switches to English for anyone who
// prefers it; this only changes what a new visitor sees before choosing.
const DEFAULT_LANGUAGE = "fr";

const LanguageContext = createContext(null);

function readStoredLanguage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return SUPPORTED.includes(stored) ? stored : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

/**
 * App-wide language toggle: English is the source language every string in
 * the codebase is written in, so `t("Some text")` is a no-op when
 * `language === "en"` and a lookup into `fr.js` when `language === "fr"`.
 * Falls back to the original English text for anything not yet translated,
 * so a missing key degrades gracefully instead of showing "undefined" or a
 * raw key. Persisted to localStorage so the choice survives a refresh and
 * stays the same across every page — this is the single source of truth
 * for language everywhere in the app (marketing pages, auth, onboarding,
 * dashboard, protocol, weekly box).
 */
export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Storage unavailable (private browsing, quota) — language still
      // works for the session, it just won't persist across reloads.
    }
    if (typeof document !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = useCallback((next) => {
    setLanguageState(SUPPORTED.includes(next) ? next : DEFAULT_LANGUAGE);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === "en" ? "fr" : "en"));
  }, []);

  // t(text, vars?) — looks up `text` (always written in English at the call
  // site) in the French dictionary when active, then substitutes any
  // {placeholder} tokens with `vars`. Returns `text` unchanged in English,
  // or as a fallback when a French entry doesn't exist yet.
  const t = useCallback(
    (text, vars) => {
      if (!text) return text;
      let out = language === "fr" ? fr[text] ?? text : text;
      if (vars) {
        Object.entries(vars).forEach(([key, value]) => {
          out = out.replaceAll(`{${key}}`, value);
        });
      }
      return out;
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage, t }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
