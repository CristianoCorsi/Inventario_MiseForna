// Internationalization utility for the application
// This provides a simple translation service for the app
import React from "react";
import itTranslations from "../locales/it.json";
import enTranslations from "../locales/en.json";

// Usa import.meta.env invece di process.env in Vite
//const FORCE_ITALIAN = import.meta.env.VITE_FORCE_ITALIAN !== 'false';
const FORCE_ITALIAN = false;

// Import translations from JSON files
const it = itTranslations;
const en = enTranslations;

// Available languages
type Language = "en" | "it";
type TranslationsType = Record<string, Record<string, string>>;

// Default language is Italian
let currentLanguage: Language = "it";

// All translations
const translations: TranslationsType = {
  it,
  en,
};

// helper per deep-get
function getNestedTranslation(
  obj: Record<string, any>,
  key: string
): string | undefined {
  return key
    .split(".")
    .reduce<string | Record<string, any> | undefined>(
      (acc, part) =>
        acc && typeof acc === "object" && part in acc
          ? (acc as Record<string, any>)[part]
          : undefined,
      obj
    ) as string | undefined;
}

/**
 * Get a translation for a key in the current language
 * @param key The translation key
 * @param params Optional parameters to interpolate
 * @returns The translated string
 */
export function t(
  key: string,
  params?: Record<string, string | number>
): string {
  // cerca prima nella lingua corrente, poi in fallback italiano
  let translation =
    getNestedTranslation(translations[currentLanguage], key) ??
    getNestedTranslation(translations.it, key);

  if (!translation) {
    // se proprio non lo trovi, torna la chiave
    return key;
  }

  if (params) {
    return Object.entries(params).reduce(
      (str, [k, v]) => str.replace(new RegExp(`{${k}}`, "g"), String(v)),
      translation
    );
  }

  return translation;
}

/**
 * Set the application language
 * @param lang Language code (e.g., 'en', 'it')
 */
export function setLanguage(lang: "en" | "it"): void {
  if (FORCE_ITALIAN) {
    currentLanguage = "it";
    localStorage.setItem("language", "it");
    console.log("[i18n] Lingua forzata a:", "it");
  } else {
    currentLanguage = lang;
    localStorage.setItem("language", lang);
    console.log("[i18n] Lingua impostata:", lang);
  }
  // NOTIFICA tutti gli iscritti
  listeners.forEach((cb) => cb());
}


/**
 * Initialize language from stored preference or browser language
 */
export function initLanguage(): void {
  if (FORCE_ITALIAN) {
    currentLanguage = "it";
    localStorage.setItem("language", "it");
    console.log("[i18n] Lingua forzata a:", "it");
    return;
  }

  const savedLanguage = localStorage.getItem("language") as Language;
  if (savedLanguage && (savedLanguage === "en" || savedLanguage === "it")) {
    currentLanguage = savedLanguage;
  } else {
    // Detect from browser
    const browserLang = navigator.language.split("-")[0];
    currentLanguage = browserLang === "it" ? "it" : "en";
    localStorage.setItem("language", currentLanguage);
  }
  console.log("[i18n] Lingua inizializzata:", currentLanguage);
}

/**
 * Get the current language code
 */
export function getCurrentLanguage(): string {
  return currentLanguage;
}

// Event emitter for language changes
const listeners: Set<() => void> = new Set();

/**
 * Subscribe to language changes
 */
export function onLanguageChange(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Hook to use translations with re-render on language change
 */
export function useTranslation() {
  const [, forceUpdate] = React.useState({});

  React.useEffect(() => {
    const unsubscribe = onLanguageChange(() => forceUpdate({}));
    return unsubscribe;
  }, []);

  return { t, setLanguage, language: currentLanguage };
}

// Initialize language
initLanguage();

export default { t, setLanguage, getCurrentLanguage, useTranslation };