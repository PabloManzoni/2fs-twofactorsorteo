import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRaffleStore } from "../store/raffleStore";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Wheel, type WheelPhase } from "../components/Wheel/Wheel";

export function WheelPage() {
  const { t } = useTranslation();
  const names = useRaffleStore((s) => s.names);
  const outNames = useRaffleStore((s) => s.outNames);
  const winner = useRaffleStore((s) => s.winner);
  const setWinner = useRaffleStore((s) => s.setWinner);
  const goStep = useRaffleStore((s) => s.goStep);
  // Struck-out names stay in the urn but not in the wheel.
  const activeNames = names.filter((n) => !outNames.includes(n));

  const [phase, setPhase] = useState<WheelPhase>("idle");
  const [velocity, setVelocity] = useState(0);

  // Dramatic shake: tag the body while the wheel spins so CSS can rattle the
  // whole viewport. Removed on unmount so it never leaks into other screens.
  useEffect(() => {
    if (phase === "spinning") document.body.setAttribute("data-spinning", "true");
    else document.body.removeAttribute("data-spinning");
    return () => document.body.removeAttribute("data-spinning");
  }, [phase]);

  const statusFirstName = winner?.split(" ")[0] ?? "";
  const statusRest = winner?.split(" ").slice(1).join(" ") ?? "";

  return (
    <main className="page" style={{ paddingTop: 40, overflow: "hidden" }}>
      <div className="paper-texture" />
      <div className="page__inner">
        <Eyebrow style={{ marginBottom: 12 }}>{t("step2.eyebrow")}</Eyebrow>

        <div className="page-header-row">
          <h1 className="display-lg" style={{ fontSize: 56 }}>
            {phase === "done" ? (
              <span
                dangerouslySetInnerHTML={{ __html: t("step2.headingDone") }}
              />
            ) : (
              t("step2.heading")
            )}
          </h1>
          <div style={{ textAlign: "right" }}>
            <Eyebrow>{t("step2.instructionEyebrow")}</Eyebrow>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "italic",
                fontSize: 18,
                color: "var(--fg-muted)",
                maxWidth: 280,
                marginTop: 4,
              }}
            >
              {t("step2.instruction")}
            </div>
          </div>
        </div>

        <div
          className="grid-wheel"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <Wheel
              participants={activeNames}
              onWinner={(name) => setWinner(name)}
              onVelocity={setVelocity}
              onPhase={setPhase}
            />
          </div>

          <aside>
            <div
              style={{
                border: "1px solid var(--ink-900)",
                background: "var(--surface)",
                padding: "24px",
              }}
            >
              <Eyebrow style={{ marginBottom: 10 }}>{t("step2.statusEyebrow")}</Eyebrow>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 36,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                {phase === "idle" && t("step2.idle")}
                {phase === "spinning" && (
                  <em style={{ fontWeight: 500 }}>{t("step2.spinning")}</em>
                )}
                {phase === "done" && winner && statusFirstName}
              </div>
              {phase === "done" && winner && statusRest && (
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontStyle: "italic",
                    fontSize: 22,
                    color: "var(--fg-muted)",
                    fontWeight: 500,
                  }}
                >
                  {statusRest}
                </div>
              )}

              <div style={{ borderTop: "1px solid var(--rule)", margin: "20px 0 16px" }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  {
                    label: t("step2.statParticipants"),
                    value:
                      outNames.length > 0
                        ? `${String(activeNames.length).padStart(2, "0")} / ${String(names.length).padStart(2, "0")}`
                        : String(activeNames.length).padStart(2, "0"),
                  },
                  {
                    label: t("step2.statSorteo"),
                    value: "Nº 042",
                  },
                  {
                    label: t("step2.statVelocity"),
                    value: `${Math.abs(velocity).toFixed(1).padStart(5, "0")}°`,
                  },
                ].map((row) => (
                  <div
                    key={row.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span style={{ color: "var(--fg-muted)" }}>{row.label}</span>
                    <span className="num">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
              {phase === "done" && winner ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => goStep(3)}
                  style={{ justifyContent: "center" }}
                >
                  {t("step2.cta")} →
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => goStep(1)}
                  style={{ justifyContent: "center" }}
                >
                  ← {t("step2.back")}
                </Button>
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
