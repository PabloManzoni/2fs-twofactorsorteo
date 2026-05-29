import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n";

const FLAG_LABEL: Record<SupportedLanguage, string> = {
  es: "Español",
  en: "English",
};

function FlagES() {
  return (
    <svg viewBox="0 0 12 8" width="20" height="14" aria-hidden="true" focusable="false">
      <rect width="12" height="8" fill="#F1BF00" />
      <rect width="12" height="2" fill="#AA151B" />
      <rect y="6" width="12" height="2" fill="#AA151B" />
    </svg>
  );
}

function FlagEN() {
  return (
    <svg viewBox="0 0 12 8" width="20" height="14" aria-hidden="true" focusable="false">
      <rect width="12" height="8" fill="#012169" />
      <path d="M0 0 L12 8 M12 0 L0 8" stroke="#FFFFFF" strokeWidth="1.6" />
      <path d="M0 0 L12 8 M12 0 L0 8" stroke="#C8102E" strokeWidth="0.8" />
      <path d="M6 0 V8 M0 4 H12" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M6 0 V8 M0 4 H12" stroke="#C8102E" strokeWidth="1.1" />
    </svg>
  );
}

const FLAGS: Record<SupportedLanguage, () => JSX.Element> = {
  es: FlagES,
  en: FlagEN,
};

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "es").slice(0, 2) as SupportedLanguage;

  return (
    <div className="language-switcher" role="group" aria-label={t("common.language")}>
      {SUPPORTED_LANGUAGES.map((lng) => {
        const Flag = FLAGS[lng];
        const isActive = lng === current;
        return (
          <button
            key={lng}
            type="button"
            className={`language-switcher__flag${isActive ? " is-active" : ""}`}
            onClick={() => void i18n.changeLanguage(lng)}
            aria-pressed={isActive}
            aria-label={FLAG_LABEL[lng]}
            title={FLAG_LABEL[lng]}
          >
            <Flag />
            <span className="language-switcher__code">{lng.toUpperCase()}</span>
          </button>
        );
      })}
    </div>
  );
}
