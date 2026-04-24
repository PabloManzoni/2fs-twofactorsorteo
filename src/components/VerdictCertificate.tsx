import { useTranslation } from "react-i18next";
import { useRaffleStore } from "../store/raffleStore";
import { Button } from "./ui/Button";
import { Eyebrow } from "./ui/Eyebrow";
import { Stamp } from "./ui/Stamp";

function CornerDiamond({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  const offsets: Record<typeof position, { top?: number; bottom?: number; left?: number; right?: number }> = {
    tl: { top: 10, left: 10 },
    tr: { top: 10, right: 10 },
    bl: { bottom: 10, left: 10 },
    br: { bottom: 10, right: 10 },
  };
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        ...offsets[position],
        width: 8,
        height: 8,
        background: "var(--ink-900)",
        transform: "rotate(45deg)",
      }}
    />
  );
}

function Flourish() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        margin: "var(--sp-4) 0 var(--sp-3)",
        color: "var(--accent)",
      }}
    >
      <span
        style={{
          flex: 1,
          height: 0,
          borderTop: "1px solid var(--rule-strong)",
          borderBottom: "1px solid var(--rule-strong)",
          boxSizing: "border-box",
          paddingBottom: 2,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 18,
          lineHeight: 1,
          transform: "translateY(-1px)",
        }}
      >
        ❦
      </span>
      <span
        style={{
          flex: 1,
          height: 0,
          borderTop: "1px solid var(--rule-strong)",
          borderBottom: "1px solid var(--rule-strong)",
          boxSizing: "border-box",
          paddingBottom: 2,
        }}
      />
    </div>
  );
}

export function VerdictCertificate() {
  const { t, i18n } = useTranslation();
  const verdict = useRaffleStore((s) => s.verdict);
  const winner = useRaffleStore((s) => s.winner);
  const resetAll = useRaffleStore((s) => s.resetAll);

  if (!verdict || !winner) return null;

  const [first, ...rest] = winner.split(" ");
  const surname = rest.join(" ");
  const locale = (i18n.resolvedLanguage ?? "es") === "en" ? "en-US" : "es-ES";
  const today = new Date().toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const isChosen = verdict === "yes";
  const bodyKey = isChosen ? "confirmed.bodyYes" : "confirmed.bodyNo";
  const stampLabel = isChosen
    ? t("confirmed.stampLabel.yes")
    : t("confirmed.stampLabel.no");
  const verdictEyebrow = isChosen
    ? t("confirmed.verdictBadge.yes")
    : t("confirmed.verdictBadge.no");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(20, 17, 16, 0.78)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "var(--sp-5) var(--sp-4)",
        animation: "fadeIn 320ms var(--ease)",
        overflowY: "auto",
      }}
    >
      <div role="dialog" aria-modal="true" className="certificate-outer" style={{ marginTop: "auto", marginBottom: "auto" }}>
        <div className="certificate-inner">
          <CornerDiamond position="tl" />
          <CornerDiamond position="tr" />
          <CornerDiamond position="bl" />
          <CornerDiamond position="br" />

          <Eyebrow color="var(--accent)" style={{ letterSpacing: "0.24em" }}>
            {t("confirmed.title")}
          </Eyebrow>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-muted)",
              letterSpacing: "0.14em",
              marginTop: 6,
            }}
          >
            {t("confirmed.sorteoLine")}
          </div>

          <Flourish />

          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 20,
              color: "var(--fg)",
              margin: "0 0 var(--sp-3)",
              letterSpacing: "-0.01em",
            }}
          >
            {t("confirmed.thisIsToCertify")}
          </p>

          <Eyebrow color={isChosen ? "var(--success-500)" : "var(--accent)"} style={{ marginBottom: 6 }}>
            {verdictEyebrow}
          </Eyebrow>
          <div
            className="cert-name"
            style={{
              textDecoration: isChosen ? "none" : "line-through",
              textDecorationColor: "var(--accent)",
              textDecorationThickness: "2px",
            }}
          >
            {first}
          </div>
          {surname && (
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: "clamp(1.125rem, 4.5vw, 1.75rem)",
                lineHeight: 1,
                letterSpacing: "-0.02em",
                color: "var(--fg-muted)",
                marginTop: 4,
                textDecoration: isChosen ? "none" : "line-through",
                textDecorationColor: "var(--accent)",
                overflowWrap: "anywhere",
              }}
            >
              {surname}.
            </div>
          )}

          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 19,
              lineHeight: 1.4,
              color: "var(--fg)",
              margin: "var(--sp-5) auto 0",
              maxWidth: 460,
              textWrap: "balance",
            }}
          >
            {t(bodyKey)}
          </p>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 15,
              lineHeight: 1.5,
              color: "var(--fg-muted)",
              margin: "var(--sp-2) auto 0",
              maxWidth: 420,
              textWrap: "balance",
            }}
          >
            {t("confirmed.coda")}
          </p>

          <div
            aria-hidden="true"
            style={{
              borderTop: "1px solid var(--rule)",
              margin: "var(--sp-5) auto 0",
              width: "min(240px, 100%)",
            }}
          />

          <div className="cert-footer-row" style={{ alignItems: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--fg-muted)",
                textAlign: "left",
              }}
            >
              {today}
            </div>
            <Stamp number="042" label={stampLabel} size={80} rotate={8} />
          </div>

          <div style={{ marginTop: "var(--sp-6)" }}>
            <Button variant="primary" size="lg" onClick={resetAll}>
              {t("confirmed.startOver")} ↻
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
