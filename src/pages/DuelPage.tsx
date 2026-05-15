import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, type Variants } from "framer-motion";
import confetti from "canvas-confetti";
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
const MAX_ROUNDS = 3;

// Timing budget. Tuned so a single throw reads as a slow ritual (~3.4s),
// the round-result lingers long enough to celebrate (~2.6s), and the
// final winner banner stays on screen ~3.5s before the certificate
// covers everything — so the human gets to actually see who won.
const WINDUP_BEATS = 4;
const WINDUP_BEAT_MS = 220; // 880ms total
const STROBE_DURATION_MS = 2500;
const STROBE_START_TICK_MS = 220;
const STROBE_END_TICK_MS = 95;
const FREEZE_MS = 600;
const ROUND_RESULT_HOLD_MS = 2600;
const FINAL_BANNER_MS = 3600;

// Token hexes lifted from tokens.css for the canvas-confetti palette.
// Canvas doesn't read CSS variables, so we mirror the values that matter.
const CONFETTI_COLORS_PRIMARY = ["#C8442A", "#B8884A", "#141110", "#FBF7EF"];
const CONFETTI_COLORS_FINAL = ["#C8442A", "#B33A23", "#B8884A", "#E6D3A8", "#141110"];

function randomHand(): Hand {
  return ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)];
}

function burstFromSide(side: "left" | "right", strength: "round" | "final") {
  const x = side === "left" ? 0.22 : 0.78;
  const baseOptions = {
    origin: { x, y: 0.55 },
    colors: strength === "final" ? CONFETTI_COLORS_FINAL : CONFETTI_COLORS_PRIMARY,
    scalar: strength === "final" ? 1.2 : 1,
  };
  if (strength === "round") {
    confetti({
      ...baseOptions,
      particleCount: 70,
      spread: 60,
      startVelocity: 38,
      ticks: 180,
      angle: side === "left" ? 60 : 120,
    });
    return;
  }
  // Final: three staggered bursts plus a wider rainfall over the winning
  // half of the screen.
  const fire = (delay: number, opts: confetti.Options) => {
    window.setTimeout(() => confetti(opts), delay);
  };
  fire(0, {
    ...baseOptions,
    particleCount: 160,
    spread: 90,
    startVelocity: 52,
    ticks: 320,
    angle: side === "left" ? 55 : 125,
  });
  fire(220, {
    ...baseOptions,
    particleCount: 120,
    spread: 110,
    startVelocity: 44,
    ticks: 280,
    angle: side === "left" ? 70 : 110,
  });
  fire(520, {
    ...baseOptions,
    particleCount: 90,
    spread: 140,
    startVelocity: 36,
    ticks: 260,
    origin: { x, y: 0.4 },
  });
  fire(900, {
    ...baseOptions,
    particleCount: 80,
    spread: 180,
    startVelocity: 28,
    ticks: 240,
    origin: { x, y: 0.35 },
    gravity: 0.7,
  });
}

const handFrameVariants: Variants = {
  idle: { y: 0, x: 0, scale: 1 },
  windup: {
    y: [0, -10, 0, -10, 0, -10, 0, -10, 0],
    transition: { duration: 0.88, ease: "easeInOut" },
  },
  rolling: {
    x: [-2, 2, -2, 2, 0],
    transition: { duration: 0.2, repeat: Infinity, ease: "linear" },
  },
  settling: { y: 0, x: 0, scale: 0.96 },
  reveal: {
    scale: [1, 1.28, 1.08],
    transition: { duration: 0.55, ease: "easeOut" },
  },
  victor: {
    scale: [1, 1.35, 1.18],
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

/**
 * Two-lamb showdown. Best of three rock-paper-scissors. Ties don't score.
 * Each throw is a deliberate ritual: fists bob, hands strobe and slow
 * down, destiny freezes for a beat of silence, then snaps. The round
 * result lingers with confetti from the winner's side and a big
 * announcement. The final winner gets a takeover banner held for
 * several seconds before the certificate covers the screen — that way
 * the human sees who won the duel before the cert lands.
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
  const [revealKey, setRevealKey] = useState(0);

  const rollTimers = useRef<number[]>([]);
  const reducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedMotion.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

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
        playClick(420);
        setPhase("idle");
        return;
      }

      const nextScore = {
        left: score.left + (outcome === "left" ? 1 : 0),
        right: score.right + (outcome === "right" ? 1 : 0),
      };
      setScore(nextScore);

      const winnerSide: "left" | "right" = outcome;
      const winnerName = winnerSide === "left" ? leftName : rightName;
      const winnerScore = winnerSide === "left" ? nextScore.left : nextScore.right;

      // Confetti from the winner's side — small burst per round, big show
      // for the final win.
      burstFromSide(winnerSide, winnerScore >= WINS_TO_WIN ? "final" : "round");

      if (winnerScore >= WINS_TO_WIN) {
        setPhase("final");
        playReveal("yes");
        // Hold the winner takeover for several seconds before triggering
        // the certificate. Pablo's note: "the modal covers everything,
        // give us time to see who won." This is that time.
        schedule(FINAL_BANNER_MS, () => finalizeDuel(winnerName));
      } else {
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
      settleRound(left, right);
      return;
    }

    setPhase("windup");
    setHands({ left: "rock", right: "rock" });
    playRumble();
    for (let i = 0; i < WINDUP_BEATS; i++) {
      schedule(i * WINDUP_BEAT_MS, () => playClick(340));
    }

    const strobeStart = WINDUP_BEATS * WINDUP_BEAT_MS;
    schedule(strobeStart, () => setPhase("rolling"));

    // Strobe with a tick interval that accelerates from slow to fast then
    // slows down again at the end — gives a bell curve of intensity.
    let t = 0;
    while (t < STROBE_DURATION_MS) {
      const progress = t / STROBE_DURATION_MS;
      // Bell-curve: fastest around the middle, slower at the ends.
      const bell = 1 - Math.abs(progress - 0.5) * 2; // 0 at edges, 1 at middle
      const interval =
        STROBE_START_TICK_MS - bell * (STROBE_START_TICK_MS - STROBE_END_TICK_MS);
      const p = progress;
      schedule(strobeStart + t, () => {
        setHands({ left: randomHand(), right: randomHand() });
        playClick(520 + Math.floor(p * 280));
      });
      t += interval;
    }

    const freezeStart = strobeStart + STROBE_DURATION_MS;
    schedule(freezeStart, () => setPhase("settling"));
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

  const winnerSide: "left" | "right" | null =
    phase === "final"
      ? score.left >= WINS_TO_WIN
        ? "left"
        : "right"
      : null;
  const winnerName =
    winnerSide === "left" ? leftName : winnerSide === "right" ? rightName : null;
  const winnerHand =
    winnerSide === "left" ? hands.left : winnerSide === "right" ? hands.right : null;

  const roundsPlayed = Math.min(score.left + score.right, MAX_ROUNDS);

  // The slot under the scoreboard turns into one of three modes depending
  // on phase — quiet narration during the throw, a big "PUNTO PARA X"
  // banner when a round resolves, a full victor takeover on final.
  const showVictorBanner = phase === "final" && winnerName;
  const showRoundBanner =
    phase === "round-result" && (lastRound === "left" || lastRound === "right");

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

        {/* Scoreboard. Two duelists facing each other, score center with the
            round counter. */}
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
          <motion.div
            aria-hidden="true"
            initial={false}
            animate={{
              opacity:
                phase === "windup" || phase === "rolling" || phase === "settling"
                  ? 0.2
                  : 0,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "radial-gradient(circle at center, transparent 30%, var(--ink-900) 100%)",
            }}
          />

          <DuelistColumn
            name={leftName}
            score={score.left}
            hand={hands.left}
            mirrored={false}
            isWinnerSide={winnerSide === "left"}
            roundWinHere={lastRound === "left" && phase === "round-result"}
            phase={phase}
            revealKey={revealKey}
          />
          <ScoreCenter
            roundsPlayed={roundsPlayed}
            phase={phase}
            scoreLabel={t("duel.scoreLabel")}
            roundLabel={t("duel.roundCounter", { played: roundsPlayed, total: MAX_ROUNDS })}
          />
          <DuelistColumn
            name={rightName}
            score={score.right}
            hand={hands.right}
            mirrored={true}
            isWinnerSide={winnerSide === "right"}
            roundWinHere={lastRound === "right" && phase === "round-result"}
            phase={phase}
            revealKey={revealKey}
          />
        </div>

        {/* Status slot — height reserved so layout doesn't jump. */}
        <div
          style={{ minHeight: 120, marginBottom: "var(--sp-5)", textAlign: "center" }}
          aria-live="polite"
        >
          {showVictorBanner ? (
            <VictorBanner
              name={winnerName ?? ""}
              hand={winnerHand}
              mirrored={winnerSide === "right"}
              eyebrow={t("duel.victorEyebrow")}
              tagline={t("duel.victorTagline")}
            />
          ) : showRoundBanner ? (
            <RoundBanner
              eyebrow={t("duel.roundPointEyebrow")}
              text={t("duel.roundWin", {
                name: lastRound === "left" ? leftName : rightName,
              })}
            />
          ) : (
            <QuietMessage
              text={
                phase === "windup"
                  ? t("duel.windup")
                  : phase === "rolling"
                    ? t("duel.rolling")
                    : phase === "settling"
                      ? t("duel.settling")
                      : lastRound === "tie"
                        ? t("duel.tie")
                        : ""
              }
            />
          )}
        </div>

        {/* CTAs — hidden when the victor banner is taking over the screen. */}
        {!showVictorBanner && (
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
                phase === "settling"
              }
              style={{ justifyContent: "center" }}
            >
              ← {t("step2.back")}
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────

interface DuelistColumnProps {
  name: string;
  score: number;
  hand: Hand | null;
  mirrored: boolean;
  isWinnerSide: boolean;
  roundWinHere: boolean;
  phase: Phase;
  revealKey: number;
}

function DuelistColumn({
  name,
  score,
  hand,
  mirrored,
  isWinnerSide,
  roundWinHere,
  phase,
  revealKey,
}: DuelistColumnProps) {
  // Pick the variant matching the current phase. The reveal pulse goes
  // bigger when this side won the round / duel, smaller otherwise.
  const variant =
    phase === "windup"
      ? "windup"
      : phase === "rolling"
        ? "rolling"
        : phase === "settling"
          ? "settling"
          : phase === "final" && isWinnerSide
            ? "victor"
            : (phase === "round-result" && roundWinHere) ||
                (phase === "final" && isWinnerSide)
              ? "reveal"
              : phase === "round-result" || phase === "final"
                ? "idle"
                : "idle";

  const highlight = roundWinHere || isWinnerSide;

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
      <motion.div
        animate={{ scale: highlight ? 1.04 : 1, color: highlight ? "var(--accent)" : "var(--fg)" }}
        transition={{ duration: 0.35 }}
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: 26,
          letterSpacing: "-0.02em",
          textAlign: "center",
        }}
      >
        {name}
      </motion.div>
      <motion.div
        key={
          variant === "reveal" || variant === "victor"
            ? `${variant}-${revealKey}`
            : variant === "windup"
              ? "windup"
              : variant
        }
        variants={handFrameVariants}
        animate={variant}
        initial={false}
        style={{
          width: 144,
          height: 144,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: highlight ? "var(--accent-wash)" : "var(--paper-100)",
          border: highlight ? "2px solid var(--accent)" : "1px solid var(--rule)",
          transition: "border-color var(--dur-base) var(--ease), background var(--dur-base) var(--ease)",
        }}
      >
        {hand ? (
          <HandIcon
            hand={hand}
            mirrored={mirrored}
            size={108}
            color={highlight ? "var(--accent-600)" : "var(--ink-900)"}
          />
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

      {/* Tiny muted label so the human always knows which gesture is which —
          especially helpful when the hands are strobing past too fast to
          parse. Reserves space even when the slot is empty so the layout
          doesn't shift between idle and rolling. */}
      <HandLabel hand={hand} />

      {/* Win pips — two slots, one fills vermillón when this duelist scores. */}
      <WinPips score={score} />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 32,
          fontWeight: 600,
          color: highlight ? "var(--accent)" : "var(--fg)",
          lineHeight: 1,
        }}
      >
        {String(score).padStart(2, "0")}
      </div>
    </div>
  );
}

interface HandLabelProps {
  hand: Hand | null;
}

function HandLabel({ hand }: HandLabelProps) {
  const { t } = useTranslation();
  const text = hand ? t(`hands.${hand}`) : "";
  return (
    <div
      style={{
        height: 14,
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--fg-subtle)",
        lineHeight: 1,
        marginTop: -2,
      }}
      aria-hidden="true"
    >
      {text}
    </div>
  );
}

interface WinPipsProps {
  score: number;
}

function WinPips({ score }: WinPipsProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--sp-2)",
        alignItems: "center",
        height: 18,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: WINS_TO_WIN }).map((_, i) => {
        const filled = i < score;
        return (
          <motion.span
            key={i}
            initial={false}
            animate={{
              scale: filled ? 1 : 0.6,
              backgroundColor: filled ? "#C8442A" : "transparent",
              borderColor: filled ? "#C8442A" : "#A09890",
            }}
            transition={{ type: "spring", stiffness: 360, damping: 18 }}
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              border: "1.5px solid var(--ink-300)",
              display: "inline-block",
            }}
          />
        );
      })}
    </div>
  );
}

interface ScoreCenterProps {
  roundsPlayed: number;
  phase: Phase;
  scoreLabel: string;
  roundLabel: string;
}

function ScoreCenter({ roundsPlayed, phase, scoreLabel, roundLabel }: ScoreCenterProps) {
  const breathing = phase === "windup" || phase === "rolling" || phase === "settling";
  return (
    <motion.div
      animate={
        breathing
          ? { scale: [1, 1.06, 1], opacity: [0.75, 1, 0.75] }
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
        minWidth: 96,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Eyebrow>{scoreLabel}</Eyebrow>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 40,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--fg)",
          lineHeight: 1,
        }}
      >
        {roundsPlayed}
        <span style={{ color: "var(--fg-subtle)" }}> / {MAX_ROUNDS}</span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--fg-muted)",
        }}
      >
        {roundLabel}
      </div>
    </motion.div>
  );
}

interface QuietMessageProps {
  text: string;
}

function QuietMessage({ text }: QuietMessageProps) {
  return (
    <div
      style={{
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontSize: 20,
        color: "var(--fg-muted)",
        paddingTop: 24,
      }}
    >
      {text || " "}
    </div>
  );
}

interface RoundBannerProps {
  eyebrow: string;
  text: string;
}

function RoundBanner({ eyebrow, text }: RoundBannerProps) {
  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Eyebrow color="var(--accent)">{eyebrow}</Eyebrow>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 48,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--fg)",
          lineHeight: 1.05,
        }}
      >
        {text}
      </div>
    </motion.div>
  );
}

interface VictorBannerProps {
  name: string;
  hand: Hand | null;
  mirrored: boolean;
  eyebrow: string;
  tagline: string;
}

function VictorBanner({ name, hand, mirrored, eyebrow, tagline }: VictorBannerProps) {
  return (
    <motion.div
      initial={{ y: 14, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        paddingTop: 4,
      }}
    >
      <Eyebrow color="var(--accent)">{eyebrow}</Eyebrow>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 76,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: "var(--fg)",
          lineHeight: 1,
        }}
      >
        {name}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: 22,
          color: "var(--fg-muted)",
        }}
      >
        {tagline}
      </div>
      {hand && (
        <div style={{ marginTop: 8 }}>
          <HandIcon hand={hand} mirrored={mirrored} size={56} color="var(--accent-600)" />
        </div>
      )}
    </motion.div>
  );
}
