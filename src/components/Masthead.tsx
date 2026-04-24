import { useTranslation } from "react-i18next";
import { formatCertNumber, useRaffleStore, type Step } from "../store/raffleStore";
import { Wordmark } from "./ui/Wordmark";
import { Eyebrow } from "./ui/Eyebrow";
import { LanguageSwitcher } from "./LanguageSwitcher";

const STEPS: Step[] = [1, 2, 3];

export function Masthead() {
  const { t, i18n } = useTranslation();
  const step = useRaffleStore((s) => s.step);
  const certNumber = useRaffleStore((s) => s.certNumber);
  const resetAll = useRaffleStore((s) => s.resetAll);

  const locale = (i18n.resolvedLanguage ?? i18n.language ?? "es") === "en" ? "en-US" : "es-ES";
  const today = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header style={{ borderBottom: "1px solid var(--ink-900)", background: "var(--bg)" }}>
      <div className="masthead-top">
        <button
          type="button"
          onClick={resetAll}
          className="brand-block"
          aria-label={t("masthead.reset")}
        >
          <Wordmark size={26} />
          <span className="tagline-divider" style={{ width: 1, height: 18, background: "var(--rule-strong)" }} />
          <span className="tagline-eyebrow">
            <Eyebrow>{t("masthead.tagline")}</Eyebrow>
          </span>
        </button>
        <div className="right-meta">
          <span className="date-meta">
            <Eyebrow>{today}</Eyebrow>
          </span>
          <span className="meta-divider" style={{ width: 1, height: 18, background: "var(--rule-strong)" }} />
          <span className="edition-meta">
            <Eyebrow>{t("masthead.edition", { n: formatCertNumber(certNumber) })}</Eyebrow>
          </span>
          <span className="meta-divider" style={{ width: 1, height: 18, background: "var(--rule-strong)" }} />
          <LanguageSwitcher />
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--rule)", background: "var(--paper-50)" }}>
        <div className="masthead-stepper">
          {STEPS.map((n, i) => {
            const isActive = step === n;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 28, flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    opacity: isActive ? 1 : 0.4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      color: isActive ? "var(--accent)" : "var(--fg-muted)",
                    }}
                  >
                    0{n}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--fg)",
                    }}
                  >
                    {t(`masthead.steps.${n}`)}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: 40, height: 1, background: "var(--rule-strong)", flexShrink: 0 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
