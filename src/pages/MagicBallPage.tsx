import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRaffleStore } from "../store/raffleStore";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { MagicBall, type MagicBallAnswer } from "../components/MagicBall/MagicBall";
import { buildQuestions, pickAnswer } from "../lib/phrases";
import { playReveal } from "../lib/audio";

type Phase = "ready" | "shaking" | "revealing" | "revealed";

const SHAKE_THRESHOLD = 30;

export function MagicBallPage() {
  const { t } = useTranslation();
  const winner = useRaffleStore((s) => s.winner);
  const goStep = useRaffleStore((s) => s.goStep);
  const rejectWinner = useRaffleStore((s) => s.rejectWinner);
  const acceptWinner = useRaffleStore((s) => s.acceptWinner);

  const [phase, setPhase] = useState<Phase>("ready");
  const [selectedQ, setSelectedQ] = useState(0);
  const [answer, setAnswer] = useState<MagicBallAnswer | null>(null);
  const [triangleOpacity, setTriangleOpacity] = useState(0);
  const revealTimeoutRef = useRef<number | null>(null);

  const questions = useMemo(() => buildQuestions(t, winner ?? ""), [t, winner]);

  useEffect(() => {
    const body = document.body;
    if (phase === "revealed") body.setAttribute("data-theme", "ink");
    else body.removeAttribute("data-theme");
    return () => body.removeAttribute("data-theme");
  }, [phase]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) window.clearTimeout(revealTimeoutRef.current);
      document.body.removeAttribute("data-theme");
    };
  }, []);

  const doReveal = useCallback(() => {
    setPhase("revealing");
    const chosen = pickAnswer(t);
    setAnswer(chosen);
    setTriangleOpacity(0);
    // Start the dark drone immediately; it swells for ~1.2s before the chime,
    // then decays — total audio ~3s.
    playReveal(chosen.tone);
    let op = 0;
    const fade = () => {
      // Slower rise — ~1.6s at 60fps.
      op += 0.01;
      setTriangleOpacity(Math.min(1, op));
      if (op < 1) {
        requestAnimationFrame(fade);
      } else {
        setPhase("revealed");
      }
    };
    revealTimeoutRef.current = window.setTimeout(() => {
      requestAnimationFrame(fade);
    }, 1200);
  }, [t]);

  const onShakeStart = useCallback(() => {
    setPhase("shaking");
  }, []);

  const onShakeEnd = useCallback(
    (energy: number) => {
      if (energy > SHAKE_THRESHOLD) doReveal();
      else setPhase("ready");
    },
    [doReveal],
  );

  const reset = () => {
    setPhase("ready");
    setAnswer(null);
    setTriangleOpacity(0);
  };

  if (!winner) {
    goStep(1);
    return null;
  }

  const toneColor =
    answer?.tone === "yes"
      ? "var(--success-500)"
      : answer?.tone === "no"
        ? "var(--accent-500)"
        : "var(--gold-500)";
  const toneLabel =
    answer?.tone === "yes"
      ? t("step3.verdict.yes")
      : answer?.tone === "no"
        ? t("step3.verdict.no")
        : t("step3.verdict.maybe");

  const revealed = phase === "revealed";

  return (
    <main
      className="page"
      style={{
        paddingTop: 40,
        background: revealed ? "#141110" : "var(--bg)",
        color: revealed ? "var(--paper-100)" : "var(--fg)",
        transition: "background 600ms var(--ease), color 600ms var(--ease)",
        overflow: "hidden",
      }}
    >
      <div className="page__inner">
        <Eyebrow
          color={revealed ? "var(--accent-300)" : undefined}
          style={{ marginBottom: 12 }}
        >
          {t("step3.eyebrow")}
        </Eyebrow>

        <div className="page-header-row">
          <h1
            className="display-lg"
            style={{
              fontSize: 56,
              color: revealed ? "var(--paper-50)" : "var(--fg)",
            }}
          >
            {revealed ? (
              <span dangerouslySetInnerHTML={{ __html: t("step3.headingRevealed") }} />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: t("step3.heading") }} />
            )}
          </h1>
          <div style={{ textAlign: "right" }}>
            <Eyebrow color={revealed ? "var(--accent-300)" : undefined}>
              {t("step3.provisional")}
            </Eyebrow>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1,
                marginTop: 4,
                letterSpacing: "-0.02em",
                color: revealed ? "var(--paper-50)" : "var(--fg)",
              }}
            >
              {winner}
            </div>
          </div>
        </div>

        <div
          className="grid-wheel"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Ball */}
          <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
            <MagicBall
              answer={answer}
              triangleOpacity={triangleOpacity}
              interactive={!revealed && phase !== "revealing"}
              onShakeStart={onShakeStart}
              onShakeEnd={onShakeEnd}
            />
          </div>

          {/* Right — question + controls */}
          <div>
            <Eyebrow
              color={revealed ? "var(--accent-300)" : undefined}
              style={{ marginBottom: 12 }}
            >
              {t("step3.questionEyebrow")}
            </Eyebrow>

            {!revealed ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  marginBottom: 32,
                }}
              >
                {questions.map((q, i) => (
                  <label
                    key={q.key}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "16px 18px",
                      border:
                        selectedQ === i
                          ? "1.5px solid var(--accent)"
                          : "1px solid var(--rule)",
                      background:
                        selectedQ === i ? "var(--accent-wash)" : "var(--surface)",
                      cursor: "pointer",
                      transition: "all var(--dur-base) var(--ease)",
                    }}
                  >
                    <input
                      type="radio"
                      name="q"
                      checked={selectedQ === i}
                      onChange={() => setSelectedQ(i)}
                      style={{ marginTop: 4, accentColor: "var(--accent)" }}
                    />
                    <div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          color: "var(--fg-muted)",
                          marginBottom: 4,
                        }}
                      >
                        {t("step3.optionLabel", { n: `0${i + 1}` })}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-display)",
                          fontStyle: "italic",
                          fontSize: 20,
                          lineHeight: 1.3,
                          color: "var(--fg)",
                        }}
                      >
                        {q.text}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <blockquote
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  fontSize: 26,
                  lineHeight: 1.3,
                  color: "var(--paper-100)",
                  borderLeft: "3px solid var(--accent)",
                  padding: "4px 20px",
                  margin: "0 0 32px",
                }}
              >
                "{questions[selectedQ]?.text}"
              </blockquote>
            )}

            {phase === "ready" && (
              <div
                style={{
                  border: "1px dashed var(--rule-strong)",
                  padding: "14px 18px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--fg-muted)",
                }}
              >
                ↖ {t("step3.shakeHint")}
              </div>
            )}

            {phase === "shaking" && (
              <div
                style={{
                  border: "1.5px solid var(--accent)",
                  padding: "14px 18px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  animation: "pulse 600ms var(--ease) infinite alternate",
                }}
              >
                ⁓ {t("step3.shaking")} ⁓
              </div>
            )}

            {phase === "revealing" && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--fg-muted)",
                }}
              >
                {t("step3.revealing")}
              </div>
            )}

            {phase === "revealed" && answer && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    color: toneColor,
                    marginBottom: 10,
                  }}
                >
                  {toneLabel} ·
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: 64,
                    lineHeight: 1,
                    letterSpacing: "-0.03em",
                    color: "var(--paper-50)",
                    marginBottom: 36,
                    textWrap: "balance",
                  }}
                >
                  {answer.text}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  {answer.tone === "yes" && (
                    <Button variant="primary" size="lg" onClick={acceptWinner}>
                      {t("step3.cta.accept", { name: winner.split(" ")[0] })} ✓
                    </Button>
                  )}
                  {answer.tone === "no" && (
                    <Button variant="primary" size="lg" onClick={rejectWinner}>
                      {t("step3.cta.reject")} →
                    </Button>
                  )}
                  {answer.tone === "maybe" && (
                    <Button variant="primary" size="lg" onClick={reset}>
                      {t("step3.cta.askAgain")}
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={reset}
                    style={{ color: "var(--paper-100)", borderColor: "var(--paper-100)" }}
                  >
                    {t("step3.cta.shakeAgain")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {!revealed && (
          <div style={{ marginTop: 48, display: "flex", justifyContent: "space-between" }}>
            <button
              type="button"
              onClick={() => goStep(2)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-ui)",
                fontSize: 14,
                color: "var(--fg-muted)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              ← {t("step3.back")}
            </button>

            {(phase === "ready" || phase === "shaking") && (
              <button
                type="button"
                onClick={doReveal}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  color: "var(--fg-subtle)",
                  textTransform: "uppercase",
                }}
              >
                {t("step3.skip")} ↗
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
