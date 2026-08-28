import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRaffleStore, type Verdict } from "../store/raffleStore";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { MagicBall, type MagicBallAnswer } from "../components/MagicBall/MagicBall";
import { buildQuestion, pickAnswer } from "../lib/phrases";
import { playReveal } from "../lib/audio";
import { AUTO_BALL_HOLD_MS, AUTO_BALL_START_MS } from "../lib/fullAuto";

type Phase = "ready" | "shaking" | "revealing" | "revealed";

const SHAKE_THRESHOLD = 30;

export function MagicBallPage() {
  const { t } = useTranslation();
  const winner = useRaffleStore((s) => s.winner);
  const goStep = useRaffleStore((s) => s.goStep);
  const acceptVerdict = useRaffleStore((s) => s.acceptVerdict);
  const fullAuto = useRaffleStore((s) => s.fullAuto);

  const [phase, setPhase] = useState<Phase>("ready");
  const [answer, setAnswer] = useState<MagicBallAnswer | null>(null);
  const [triangleOpacity, setTriangleOpacity] = useState(0);
  const [autoShakeTick, setAutoShakeTick] = useState(0);
  const revealTimeoutRef = useRef<number | null>(null);
  const autoTimersRef = useRef<number[]>([]);

  const question = useMemo(() => buildQuestion(t, winner ?? ""), [t, winner]);

  // Only one question now, so the ball's raw tone IS the verdict — no
  // inversion to reason about.
  const finalVerdict: Verdict | null = answer ? answer.tone : null;

  useEffect(() => {
    const body = document.body;
    if (phase === "revealed") body.setAttribute("data-theme", "ink");
    else body.removeAttribute("data-theme");
    return () => body.removeAttribute("data-theme");
  }, [phase]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) window.clearTimeout(revealTimeoutRef.current);
      for (const id of autoTimersRef.current) window.clearTimeout(id);
      autoTimersRef.current = [];
      document.body.removeAttribute("data-theme");
    };
  }, []);

  // Hands-off run: shake on arrival, then seal the verdict once the answer
  // has had a moment on screen.
  useEffect(() => {
    if (!fullAuto) return;
    if (phase === "ready") {
      const id = window.setTimeout(() => setAutoShakeTick((n) => n + 1), AUTO_BALL_START_MS);
      autoTimersRef.current.push(id);
      return () => window.clearTimeout(id);
    }
    if (phase === "revealed" && finalVerdict) {
      const id = window.setTimeout(() => acceptVerdict(finalVerdict), AUTO_BALL_HOLD_MS);
      autoTimersRef.current.push(id);
      return () => window.clearTimeout(id);
    }
  }, [fullAuto, phase, finalVerdict, acceptVerdict]);

  const doReveal = useCallback(() => {
    setPhase("revealing");
    const chosen = pickAnswer(t);
    setAnswer(chosen);
    setTriangleOpacity(0);
    playReveal(chosen.tone);
    let op = 0;
    const fade = () => {
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

  if (!winner) {
    goStep(1);
    return null;
  }

  const revealed = phase === "revealed";
  const toneColor = finalVerdict === "yes" ? "var(--success-500)" : "var(--accent-500)";
  const toneLabel = finalVerdict === "yes" ? t("step3.verdict.yes") : t("step3.verdict.no");

  return (
    <main
      className="page"
      style={{
        paddingTop: 40,
        background: "var(--bg)",
        color: "var(--fg)",
        transition: "background 600ms var(--ease), color 600ms var(--ease)",
        overflow: "hidden",
      }}
    >
      <div className="page__inner">
        <Eyebrow style={{ marginBottom: 12 }}>{t("step3.eyebrow")}</Eyebrow>

        <div className="page-header-row">
          <h1 className="display-lg">
            <span
              dangerouslySetInnerHTML={{
                __html: revealed ? t("step3.headingRevealed") : t("step3.heading"),
              }}
            />
          </h1>
          <div style={{ textAlign: "right" }}>
            <Eyebrow>{t("step3.provisional")}</Eyebrow>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: 28,
                lineHeight: 1,
                marginTop: 4,
                letterSpacing: "-0.02em",
              }}
            >
              {winner}
            </div>
          </div>
        </div>

        {/* One column, everything stacked under the question. The ball is the
            subject of the screen, so it sits in the middle rather than beside
            a panel of options. */}
        <div
          style={{
            maxWidth: 620,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <Eyebrow style={{ marginBottom: 10 }}>{t("step3.questionEyebrow")}</Eyebrow>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: "clamp(1.5rem, 4vw, 2.25rem)",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              margin: "0 0 var(--sp-5)",
              textWrap: "balance",
            }}
          >
            {question}
          </p>

          <MagicBall
            size={340}
            answer={answer}
            triangleOpacity={triangleOpacity}
            interactive={!revealed && phase !== "revealing"}
            onShakeStart={onShakeStart}
            onShakeEnd={onShakeEnd}
            autoShakeTick={autoShakeTick}
          />

          <div style={{ marginTop: "var(--sp-6)", width: "100%", maxWidth: 380 }}>
            {/* During a hands-off run the overlay narrates and drives, so the
                manual controls would just be dead buttons. */}
            {phase === "ready" && !fullAuto && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
                  {t("step3.shakeHint")}
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setAutoShakeTick((n) => n + 1)}
                  style={{ justifyContent: "center" }}
                >
                  {t("step3.autoShakeCta")}
                </Button>
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
                  {toneLabel}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "clamp(2rem, 6vw, 3.25rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    color: "var(--fg-strong)",
                    marginBottom: 28,
                    textWrap: "balance",
                  }}
                >
                  {answer.text}
                </div>

                {!fullAuto && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => finalVerdict && acceptVerdict(finalVerdict)}
                    style={{ justifyContent: "center" }}
                  >
                    {finalVerdict === "yes"
                      ? t("step3.cta.acceptYes")
                      : t("step3.cta.acceptNo")}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
