import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRaffleStore } from "../store/raffleStore";
import { Button } from "../components/ui/Button";
import { Eyebrow } from "../components/ui/Eyebrow";
import { Avatar } from "../components/ui/Avatar";
import { HandIcon, type Hand } from "../components/Duel/hands";
import { ALL_HANDS, resolveRound } from "../components/Duel/rules";
import { playClick, playDing, playReveal, warmAudio } from "../lib/audio";

type Phase = "idle" | "rolling" | "round-result" | "final";

const WINS_TO_WIN = 2;
const ROLL_DURATION_MS = 900;
const ROLL_TICK_MS = 110;
const FINAL_DELAY_MS = 600;
const ROUND_RESULT_HOLD_MS = 1100;

function randomHand(): Hand {
  return ALL_HANDS[Math.floor(Math.random() * ALL_HANDS.length)];
}

/**
 * Two-lamb showdown. Best of three rock-paper-scissors. Ties don't score.
 * First to two wins triggers the same certificate the oracle would.
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

  const settleRound = useCallback(
    (left: Hand, right: Hand) => {
      const outcome = resolveRound(left, right);
      setHands({ left, right });
      setLastRound(outcome);

      if (outcome === "tie") {
        // Ties don't score. The throw button becomes available again right
        // away so the duel can resume without ceremony.
        setPhase("idle");
        return;
      }

      const nextScore = {
        left: score.left + (outcome === "left" ? 1 : 0),
        right: score.right + (outcome === "right" ? 1 : 0),
      };
      setScore(nextScore);
      playDing();

      const winnerName = outcome === "left" ? leftName : rightName;
      const winnerScore = outcome === "left" ? nextScore.left : nextScore.right;

      if (winnerScore >= WINS_TO_WIN) {
        // Final round. Play the reveal arpeggio and seal the duel a moment
        // later so the hand stamp has time to land on screen first.
        setPhase("final");
        playReveal("yes");
        const id = window.setTimeout(() => {
          finalizeDuel(winnerName);
        }, FINAL_DELAY_MS);
        rollTimers.current.push(id);
      } else {
        // Mid-duel: hold the result briefly so the human can read it, then
        // unlock the throw button for the next round.
        setPhase("round-result");
        const id = window.setTimeout(() => {
          setPhase("idle");
          setLastRound(null);
        }, ROUND_RESULT_HOLD_MS);
        rollTimers.current.push(id);
      }
    },
    [score, leftName, rightName, finalizeDuel],
  );

  const startRoll = useCallback(() => {
    warmAudio();
    if (phase !== "idle") return;
    setLastRound(null);

    const left = randomHand();
    const right = randomHand();

    if (reducedMotion.current) {
      // Skip the strobe — same outcome, no animation.
      settleRound(left, right);
      return;
    }

    setPhase("rolling");

    // Strobe through random hand combinations so the reveal feels earned.
    const ticks = Math.max(1, Math.floor(ROLL_DURATION_MS / ROLL_TICK_MS));
    for (let i = 0; i < ticks; i++) {
      const id = window.setTimeout(() => {
        setHands({ left: randomHand(), right: randomHand() });
        playClick(560 + (i % 3) * 80);
      }, i * ROLL_TICK_MS);
      rollTimers.current.push(id);
    }
    const settleId = window.setTimeout(() => {
      settleRound(left, right);
    }, ticks * ROLL_TICK_MS);
    rollTimers.current.push(settleId);
  }, [phase, settleRound]);

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
    phase === "rolling"
      ? t("duel.rolling")
      : phase === "final"
        ? t("duel.finalPending")
        : t("duel.throwCta");

  const throwDisabled = phase === "rolling" || phase === "round-result" || phase === "final";

  const winnerName =
    phase === "final"
      ? score.left >= WINS_TO_WIN
        ? leftName
        : rightName
      : null;

  const message =
    phase === "final" && winnerName
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
          }}
        >
          <DuelistColumn
            name={leftName}
            score={score.left}
            hand={hands.left}
            mirrored={false}
            highlight={lastRound === "left" || (phase === "final" && winnerName === leftName)}
          />
          <ScoreCenter t={(k) => t(k)} />
          <DuelistColumn
            name={rightName}
            score={score.right}
            hand={hands.right}
            mirrored={true}
            highlight={lastRound === "right" || (phase === "final" && winnerName === rightName)}
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
          {message ?? " "}
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
            disabled={phase === "rolling" || phase === "final"}
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
}

function DuelistColumn({ name, score, hand, mirrored, highlight }: DuelistColumnProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-3)",
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
      <div
        style={{
          width: 112,
          height: 112,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--paper-100)",
          border: "1px solid var(--rule)",
        }}
      >
        {hand ? (
          <HandIcon hand={hand} mirrored={mirrored} size={88} />
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
      </div>
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
}

function ScoreCenter({ t }: ScoreCenterProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--sp-2)",
        minWidth: 80,
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
    </div>
  );
}
