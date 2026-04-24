import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "../i18n";

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = (i18n.resolvedLanguage ?? i18n.language ?? "es").slice(0, 2) as SupportedLanguage;

  return (
    <label className="language-switcher">
      <span className="visually-hidden">{t("common.language")}</span>
      <select
        value={current}
        onChange={(e) => void i18n.changeLanguage(e.target.value)}
        aria-label={t("common.language")}
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <option key={lng} value={lng}>
            {lng.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
