import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
import { useRaffleStore } from "../store/raffleStore";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Avatar } from "../components/ui/Avatar";
import { HandIcon, type Hand } from "../components/Duel/hands";
import { ALL_HANDS, resolveRound } from "../components/Duel/rules";
import { playClick, playDing, playReveal, playRumble, warmAudio } from "../lib/audio";

type Phase =
  | "idle"
  | "windup"
  | "rolling"
  | "settling"
  | "round-result"
  | "final";

const WINS_TO_WIN = 2;

// Timing budget for one throw — totals ~2.6s when motion is enabled.
// The numbers are tuned to read as a deliberate ritual rather than a roll:
// fists bob in unison, then the hands strobe and accelerate, then freeze for
// a beat of silence before the destiny snaps into place.
const WINDUP_BEATS = 4;
const WINDUP_BEAT_MS = 175; // 700ms windup
const STROBE_DURATION_MS = 1500;
const STROBE_START_TICK_MS = 135;
const STROBE_END_TICK_MS = 55;
const FREEZE_MS = 320;
const ROUND_RESULT_HOLD_MS = 1200;
const FINAL_DELAY_MS = 700;

function randomHand(): Hand {
  return ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)];
}

const handFrameVariants: Variants = {
  idle: { y: 0, x: 0, scale: 1 },
  windup: {
    y: [0, -8, 0, -8, 0, -8, 0, -8, 0],
    transition: { duration: 0.7, ease: "easeInOut", times: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1] },
  },
  rolling: {
    x: [-1.5, 1.5, -1.5, 1.5, 0],
    transition: { duration: 0.16, repeat: Infinity, ease: "linear" },
  },
  settling: { y: 0, x: 0, scale: 0.97 },
  reveal: {
    scale: [1, 1.18, 1],
    transition: { duration: 0.38, ease: "easeOut" },
  },
};

/**
 * Two-lamb showdown. Best of three rock-paper-scissors. Ties don't score.
 * The throw is a deliberate ~2.6s ritual: fists bob, hands strobe, the
 * destiny freezes for a beat of silence, then snaps. First to two wins
 * triggers the same certificate the oracle would.
 */
export function DuelPage() {
  const { t } = useTranslation();
  const names = useRaffleStore((s) => s.names);
  const outNames = useRaffleStore((s) => s.outNames);
  const goStep = useRaffleStore((s) => s.goStep);
  const finalizeDuel = useRaffleStore((s) => s.finalizeDuel);

  const activeNames = useMemo(
    () => names.filter((n) => !outNames.includes(n)),
    [names, outNames],
  );

  // The duel is only meaningful with exactly two contenders. If we ended up
  // here with a different count (manual store edit, stale persisted state),
  // fall back to a back button rather than rendering garbage.
  const guardOk = activeNames.length === 2;
  const leftName = activeNames[0] ?? "";
  const rightName = activeNames[1] ?? "";

  const [phase, setPhase] = useState<Phase>("idle");
  const [hands, setHands] = useState<{ left: Hand | null; right: Hand | null }>({
    left: null,
    right: null,
  });
  const [score, setScore] = useState<{ left: number; right: number }>({ left: 0, right: 0 });
  const [lastRound, setLastRound] = useState<"left" | "right" | "tie" | null>(null);
  // Bump on each settle so the reveal pulse variant retriggers even when the
  // hand value is identical to the previous round.
  const [revealKey, setRevealKey] = useState(0);

  const rollTimers = useRef<number[]>([]);
  const reducedMotion = useRef(false);

  useEffect(() => {
    // Match the rest of the app: respect the user's reduce-motion setting so
    // we don't strobe hand icons at people who opted out of animations.
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Clean up any pending timers if the page unmounts mid-roll.
  useEffect(() => {
    return () => {
      for (const id of rollTimers.current) window.clearTimeout(id);
      rollTimers.current = [];
    };
  }, []);

  const schedule = useCallback((delayMs: number, fn: () => void) => {
    const id = window.setTimeout(fn, delayMs);
    rollTimers.current.push(id);
  }, []);

  const settleRound = useCallback(
    (left: Hand, right: Hand) => {
      const outcome = resolveRound(left, right);
      setHands({ left, right });
      setLastRound(outcome);
      setRevealKey((k) => k + 1);

      if (outcome === "tie") {
        // Ties don't score. The throw button becomes available again right
        // away so the duel can resume without ceremony.
        playClick(420);
        setPhase("idle");
        return;
      }

      const nextScore = {
        left: score.left + (outcome === "left" ? 1 : 0),
        right: score.right + (outcome === "right" ? 1 : 0),
      };
      setScore(nextScore);

      const winnerName = outcome === "left" ? leftName : rightName;
      const winnerScore = outcome === "left" ? nextScore.left : nextScore.right;

      if (winnerScore >= WINS_TO_WIN) {
        // Final round. Play the reveal arpeggio and seal the duel a moment
        // later so the hand stamp has time to land on screen first.
        setPhase("final");
        playReveal("yes");
        schedule(FINAL_DELAY_MS, () => finalizeDuel(winnerName));
      } else {
        // Mid-duel: hold the result briefly so the human can read it, then
        // unlock the throw button for the next round.
        setPhase("round-result");
        playDing();
        schedule(ROUND_RESULT_HOLD_MS, () => {
          setPhase("idle");
          setLastRound(null);
        });
      }
    },
    [score, leftName, rightName, finalizeDuel, schedule],
  );

  const startRoll = useCallback(() => {
    warmAudio();
    if (phase !== "idle") return;
    setLastRound(null);

    const left = randomHand();
    const right = randomHand();

    if (reducedMotion.current) {
      // Skip the strobe — same outcome, no animation, no audio drama.
      settleRound(left, right);
      return;
    }

    // ── Windup ───────────────────────────────────────────────────────────
    // Both fists. Four bobs in unison with a low rumble underneath and a
    // soft tick on each beat — feels like the destiny is winding up.
    setPhase("windup");
    setHands({ left: "rock", right: "rock" });
    playRumble();
    for (let i = 0; i < WINDUP_BEATS; i++) {
      schedule(i * WINDUP_BEAT_MS, () => playClick(360));
    }

    const strobeStart = WINDUP_BEATS * WINDUP_BEAT_MS;
    schedule(strobeStart, () => setPhase("rolling"));

    // ── Strobe ───────────────────────────────────────────────────────────
    // Cycling hands with a tick interval that interpolates from slow to
    // fast — sense of acceleration, like the choice is being shaken loose.
    let t = 0;
    while (t < STROBE_DURATION_MS) {
      const progress = t / STROBE_DURATION_MS;
      const interval =
        STROBE_START_TICK_MS - progress * (STROBE_START_TICK_MS - STROBE_END_TICK_MS);
      // Capture per-iteration so the closure doesn't read the loop end value.
      const p = progress;
      schedule(strobeStart + t, () => {
        setHands({ left: randomHand(), right: randomHand() });
        playClick(540 + Math.floor(p * 320));
      });
      t += interval;
    }

    // ── Freeze ───────────────────────────────────────────────────────────
    // A beat of silence at the end. The hands hold the last random combo,
    // the audio drops, and then the destiny snaps. This pause is what
    // makes the reveal feel earned.
    const freezeStart = strobeStart + STROBE_DURATION_MS;
    schedule(freezeStart, () => setPhase("settling"));

    // ── Snap ─────────────────────────────────────────────────────────────
    schedule(freezeStart + FREEZE_MS, () => settleRound(left, right));
  }, [phase, settleRound, schedule]);

  if (!guardOk) {
    return (
      <main className="page" style={{ paddingTop: 40 }}>
        <div className="page__inner">
          <Eyebrow style={{ marginBottom: 12 }}>{t("duel.eyebrow")}</Eyebrow>
          <h1 className="display-lg" style={{ fontSize: 48, marginBottom: 16 }}>
            {t("duel.unavailable")}
          </h1>
          <Button variant="secondary" size="md" onClick={() => goStep(2)}>
            ← {t("step2.back")}
          </Button>
        </div>
      </main>
    );
  }

  const throwLabel =
    phase === "windup"
      ? t("duel.windup")
      : phase === "rolling"
        ? t("duel.rolling")
        : phase === "settling"
          ? t("duel.settling")
          : phase === "final"
            ? t("duel.finalPending")
            : t("duel.throwCta");

  const throwDisabled =
    phase === "windup" ||
    phase === "rolling" ||
    phase === "settling" ||
    phase === "round-result" ||
    phase === "final";

  const winnerName =
    phase === "final"
      ? score.left >= WINS_TO_WIN
        ? leftName
        : rightName
      : null;

  const message =
    phase === "windup"
      ? t("duel.windup")
      : phase === "rolling"
        ? t("duel.rolling")
        : phase === "settling"
          ? t("duel.settling")
          : phase === "final" && winnerName
            ? t("duel.finalPending")
            : lastRound === "tie"
              ? t("duel.tie")
              : lastRound === "left"
                ? t("duel.roundWin", { name: leftName })
                : lastRound === "right"
                  ? t("duel.roundWin", { name: rightName })
                  : null;

  return (
    <main className="page" style={{ paddingTop: 40, overflow: "hidden" }}>
      <div className="paper-texture" />
      <div className="page__inner">
        <Eyebrow style={{ marginBottom: 12 }}>{t("duel.eyebrow")}</Eyebrow>

        <h1
          className="display-lg"
          style={{ fontSize: 56, marginBottom: 12 }}
          dangerouslySetInnerHTML={{ __html: t("duel.heading") }}
        />

        <p
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 22,
            color: "var(--fg-muted)",
            maxWidth: 560,
            marginBottom: 40,
          }}
        >
          {t("duel.subtitle")}
        </p>

        {/* Scoreboard row — two avatars facing each other with score between. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "var(--sp-5)",
            border: "1px solid var(--ink-900)",
            background: "var(--surface)",
            padding: "var(--sp-6)",
            marginBottom: "var(--sp-6)",
            position: "relative",
          }}
        >
          {/* Vignette during the throw — fades a soft ink wash over the
              board so the hands feel like they're emerging from somewhere. */}
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              opacity:
                phase === "windup" || phase === "rolling" || phase === "settling"
                  ? 0.18
                  : 0,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at center, transparent 35%, var(--ink-900) 100%)",
            }}
          />

          <DuelistColumn
            name={leftName}
            score={score.left}
            hand={hands.left}
            mirrored={false}
            highlight={lastRound === "left" || (phase === "final" && winnerName === leftName)}
            phase={phase}
            revealKey={revealKey}
          />
          <ScoreCenter t={(k) => t(k)} phase={phase} />
          <DuelistColumn
            name={rightName}
            score={score.right}
            hand={hands.right}
            mirrored={true}
            highlight={lastRound === "right" || (phase === "final" && winnerName === rightName)}
            phase={phase}
            revealKey={revealKey}
          />
        </div>

        {/* Round message — reserves space so the layout doesn't jump. */}
        <div
          style={{
            minHeight: 28,
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontSize: 18,
            color: "var(--fg-muted)",
            textAlign: "center",
            marginBottom: "var(--sp-5)",
          }}
          aria-live="polite"
        >
          {message ?? " "}
        </div>

        {/* Single CTA + back. */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "var(--sp-3)",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="primary"
            size="lg"
            onClick={startRoll}
            disabled={throwDisabled}
            style={{ justifyContent: "center", minWidth: 220 }}
          >
            {throwLabel} →
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => goStep(2)}
            disabled={
              phase === "windup" ||
              phase === "rolling" ||
              phase === "settling" ||
              phase === "final"
            }
            style={{ justifyContent: "center" }}
          >
            ← {t("step2.back")}
          </Button>
        </div>
      </div>
    </main>
  );
}

interface DuelistColumnProps {
  name: string;
  score: number;
  hand: Hand | null;
  mirrored: boolean;
  highlight: boolean;
  phase: Phase;
  revealKey: number;
}

function DuelistColumn({
  name,
  score,
  hand,
  mirrored,
  highlight,
  phase,
  revealKey,
}: DuelistColumnProps) {
  // Pick the framer-motion variant matching the current phase so the hand
  // bobs, strobes-vibrates, holds still, or pulses depending on where we
  // are in the ritual. The revealKey forces remount on round-result/final
  // so the scale pulse retriggers even if the hand value didn't change.
  const variant =
    phase === "windup"
      ? "windup"
      : phase === "rolling"
        ? "rolling"
        : phase === "settling"
          ? "settling"
          : phase === "round-result" || phase === "final"
            ? "reveal"
            : "idle";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-3)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <Avatar name={name} size={56} highlight={highlight} />
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 24,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: "var(--fg)",
        }}
      >
        {name}
      </div>
      <motion.div
        key={
          variant === "reveal"
            ? `reveal-${revealKey}`
            : variant === "windup"
              ? "windup"
              : variant
        }
        variants={handFrameVariants}
        animate={variant}
        initial={false}
        style={{
          width: 128,
          height: 128,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper-100)",
          border: highlight ? "1.5px solid var(--accent)" : "1px solid var(--rule)",
          transition: "border-color var(--dur-base) var(--ease)",
        }}
      >
        {hand ? (
          <HandIcon hand={hand} mirrored={mirrored} size={92} />
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.14em",
              color: "var(--fg-subtle)",
            }}
          >
            —
          </span>
        )}
      </motion.div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 28,
          fontWeight: 600,
          color: highlight ? "var(--accent)" : "var(--fg)",
        }}
      >
        {String(score).padStart(2, "0")}
      </div>
    </div>
  );
}

interface ScoreCenterProps {
  t: (key: string) => string;
  phase: Phase;
}

function ScoreCenter({ t, phase }: ScoreCenterProps) {
  const breathing = phase === "windup" || phase === "rolling" || phase === "settling";
  return (
    <motion.div
      animate={
        breathing
          ? { scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }
          : { scale: 1, opacity: 1 }
      }
      transition={
        breathing
          ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.3 }
      }
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-2)",
        minWidth: 80,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Eyebrow>{t("duel.scoreLabel")}</Eyebrow>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 28,
          color: "var(--fg-muted)",
        }}
      >
        —
      </div>
    </motion.div>
  );
}
