// Internationalization utility for the application
// This provides a simple translation service for the app
import React from "react";
import itTranslations from "../locales/it.json";
import enTranslations from "../locales/en.json";

const FORCE_ITALIAN = true;

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

/**
 * Get a translation for a key in the current language
 * @param key The translation key
 * @param params Optional parameters to interpolate
 * @returns The translated string
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const translation =
    translations[currentLanguage][key] || translations.it[key] || key;

  if (!params) {
    return translation;
  }

  // Simple interpolation
  return Object.entries(params).reduce(
    (str, [key, value]) =>
      str.replace(new RegExp(`{${key}}`, "g"), String(value)),
    translation,
  );
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
    return;
  }

  currentLanguage = lang;
  localStorage.setItem("language", lang);
  console.log("[i18n] Lingua impostata:", lang);
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