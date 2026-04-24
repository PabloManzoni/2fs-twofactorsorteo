import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import es from "./es.json";
import en from "./en.json";

export const SUPPORTED_LANGUAGES = ["es", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: "es",
    fallbackLng: "es",
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    interpolation: { escapeValue: false },
    detection: {
      // Only honor an explicit user choice cached in localStorage.
      // No navigator detection — Spanish is the product default.
      order: ["localStorage"],
      caches: ["localStorage"],
      lookupLocalStorage: "2fs.lang",
    },
  });

export default i18n;
