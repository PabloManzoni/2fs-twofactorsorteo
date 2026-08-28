import { useTranslation } from "react-i18next";
import { useRaffleStore } from "../store/raffleStore";
import { Button } from "./ui/Button";

/**
 * Control strip for the hands-off run. It floats over whatever screen the
 * machine happens to be on — including the certificate, which is why it sits
 * above that modal's z-index — and narrates the step so the run never looks
 * like the app froze. The only control is the way out.
 */
export function FullAutoOverlay() {
  const { t } = useTranslation();
  const fullAuto = useRaffleStore((s) => s.fullAuto);
  const stopFullAuto = useRaffleStore((s) => s.stopFullAuto);
  const step = useRaffleStore((s) => s.step);
  const mode = useRaffleStore((s) => s.mode);
  const winner = useRaffleStore((s) => s.winner);
  const verdict = useRaffleStore((s) => s.verdict);

  if (!fullAuto) return null;

  const firstName = winner?.split(" ")[0] ?? "";
  // A sealed verdict wins over everything else: the certificate is on screen,
  // so the strip should be talking about that and not the step underneath.
  const status =
    verdict === "no"
      ? t("fullAuto.rejected", { name: firstName })
      : verdict === "yes"
        ? t("fullAuto.done")
        : mode === "duel"
          ? t("fullAuto.duel")
          : step === 3 && winner
            ? t("fullAuto.asking", { name: firstName })
            : t("fullAuto.spinning");

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        left: "50%",
        bottom: "var(--sp-5)",
        transform: "translateX(-50%)",
        zIndex: 120,
        display: "flex",
        alignItems: "center",
        gap: "var(--sp-4)",
        padding: "var(--sp-3) var(--sp-3) var(--sp-3) var(--sp-5)",
        background: "var(--ink-900)",
        border: "var(--bw-2) solid var(--ink-900)",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--shadow-3)",
        maxWidth: "calc(100vw - var(--sp-6))",
        animation: "fadeIn var(--dur-slow) var(--ease)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--sp-2)",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "var(--tr-eyebrow)",
            color: "var(--accent-300)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: "var(--r-pill)",
              background: "var(--accent-500)",
              animation: "pulse 700ms var(--ease) infinite alternate",
              flexShrink: 0,
            }}
          />
          {t("fullAuto.label")}
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 17,
            lineHeight: 1.2,
            color: "var(--paper-50)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {status}
        </div>
      </div>

      <Button variant="primary" size="md" onClick={stopFullAuto} style={{ flexShrink: 0 }}>
        {t("fullAuto.stop")}
      </Button>
    </div>
  );
}
