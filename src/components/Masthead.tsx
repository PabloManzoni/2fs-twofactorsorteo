import { useTranslation } from "react-i18next";
import { useRaffleStore, type Step } from "../store/raffleStore";
import { Wordmark } from "./ui/Wordmark";
import { Eyebrow } from "./ui/Eyebrow";
import { LanguageSwitcher } from "./LanguageSwitcher";

const STEPS: Step[] = [1, 2, 3];

export function Masthead() {
  const { t, i18n } = useTranslation();
  const step = useRaffleStore((s) => s.step);
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
      <div
        style={{
          maxWidth: "var(--col-app)",
          margin: "0 auto",
          padding: "14px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          type="button"
          onClick={resetAll}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            cursor: "pointer",
            padding: 0,
            background: "transparent",
            border: "none",
            color: "inherit",
          }}
          aria-label={t("masthead.reset")}
        >
          <Wordmark size={26} />
          <div style={{ width: 1, height: 18, background: "var(--rule-strong)" }} />
          <Eyebrow>{t("masthead.tagline")}</Eyebrow>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Eyebrow>{today}</Eyebrow>
          <div style={{ width: 1, height: 18, background: "var(--rule-strong)" }} />
          <Eyebrow>{t("masthead.edition", { n: "042" })}</Eyebrow>
          <div style={{ width: 1, height: 18, background: "var(--rule-strong)" }} />
          <LanguageSwitcher />
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--rule)", background: "var(--paper-50)" }}>
        <div
          style={{
            maxWidth: "var(--col-app)",
            margin: "0 auto",
            padding: "10px 32px",
            display: "flex",
            gap: 28,
            alignItems: "center",
          }}
        >
          {STEPS.map((n, i) => {
            const isActive = step === n;
            return (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 28 }}>
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
                  <div style={{ width: 40, height: 1, background: "var(--rule-strong)" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
