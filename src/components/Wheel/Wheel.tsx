import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { playClick, playDing, warmAudio } from "../../lib/audio";

interface WheelProps {
  participants: string[];
  onWinner: (name: string, index: number) => void;
  onVelocity?: (v: number) => void;
  onPhase?: (phase: WheelPhase) => void;
}

export type WheelPhase = "idle" | "spinning" | "done";

const R = 260;
const INNER_R = 70;
const LABEL_R = R * 0.62;
const NUM_LIGHTS = 32;
const FRAME_MS = 16;
const FRICTION = 0.985;
const MIN_V = 0.15;

function polar(r: number, deg: number): [number, number] {
  const rad = ((deg - 90) * Math.PI) / 180;
  return [r * Math.cos(rad), r * Math.sin(rad)];
}

function segmentColor(i: number, total: number): string {
  if (total % 2 === 1 && i === total - 1) return "var(--gold-500)";
  return i % 2 === 0 ? "var(--accent-500)" : "var(--ink-900)";
}

export function Wheel({ participants, onWinner, onVelocity, onPhase }: WheelProps) {
  const [angle, setAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [phase, setPhase] = useState<WheelPhase>("idle");
  const [lightPulse, setLightPulse] = useState(0);

  const wheelRef = useRef<HTMLDivElement | null>(null);
  const lastPointerRef = useRef<{ a: number; t: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTickSectorRef = useRef(-1);

  const N = participants.length;
  const segAngle = N > 0 ? 360 / N : 360;

  const updateAngle = useCallback((next: number) => {
    angleRef.current = next;
    setAngle(next);
  }, []);

  const updateVelocity = useCallback(
    (v: number) => {
      velocityRef.current = v;
      onVelocity?.(v);
    },
    [onVelocity],
  );

  const changePhase = useCallback(
    (p: WheelPhase) => {
      setPhase(p);
      onPhase?.(p);
    },
    [onPhase],
  );

  const pointerAngle = useCallback((e: ReactPointerEvent | PointerEvent): number => {
    const el = wheelRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI;
  }, []);

  const landAngleToIndex = (finalAngle: number): number => {
    // Segments are drawn starting at drawing-deg 0 (top), going clockwise.
    // A CSS rotate of `angle` puts the point that was at drawing-deg `-angle`
    // under the top pointer. Find the segment whose [start, end) contains it.
    const atPointer = (((-finalAngle) % 360) + 360) % 360;
    const idx = Math.floor(atPointer / segAngle);
    return ((idx % N) + N) % N;
  };

  const startSpin = useCallback(
    (initialV: number) => {
      let v = initialV;
      lastTickSectorRef.current = -1;

      const tick = () => {
        const next = angleRef.current + v;
        v *= FRICTION;
        updateAngle(next);
        setLightPulse((p) => p + 1);
        const sector = Math.floor((((-next % 360) + 360) % 360) / segAngle);
        if (sector !== lastTickSectorRef.current) {
          lastTickSectorRef.current = sector;
          const pitch = 500 + Math.min(400, Math.abs(v) * 20);
          playClick(pitch);
        }
        if (Math.abs(v) <= MIN_V) {
          const idx = landAngleToIndex(next);
          changePhase("done");
          playDing();
          window.setTimeout(() => onWinner(participants[idx], idx), 450);
          return;
        }
        animRef.current = requestAnimationFrame(tick);
      };
      animRef.current = requestAnimationFrame(tick);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [participants, segAngle, changePhase, onWinner, updateAngle],
  );

  useEffect(() => {
    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (phase === "done") return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    changePhase("idle");
    updateVelocity(0);
    if (animRef.current !== null) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    lastPointerRef.current = { a: pointerAngle(e), t: performance.now() };
    warmAudio();
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!isDragging || !lastPointerRef.current) return;
    const a = pointerAngle(e);
    const prev = lastPointerRef.current;
    let delta = a - prev.a;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const now = performance.now();
    const dt = Math.max(1, now - prev.t);
    const next = angleRef.current + delta;
    updateAngle(next);
    const v = (delta / dt) * FRAME_MS;
    updateVelocity(v);
    lastPointerRef.current = { a, t: now };
    const sector = Math.floor((((-next % 360) + 360) % 360) / segAngle);
    if (sector !== lastTickSectorRef.current && Math.abs(v) > 0.3) {
      lastTickSectorRef.current = sector;
      playClick(600 + sector * 20);
    }
  };

  const onPointerUp = (_e: ReactPointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    lastPointerRef.current = null;
    const v = velocityRef.current;
    if (Math.abs(v) < 1.2) return;
    let kick = v * 2.5;
    if (Math.abs(kick) > 45) kick = 45 * Math.sign(kick);
    if (Math.abs(kick) < 8) kick = 8 * Math.sign(kick);
    changePhase("spinning");
    startSpin(kick);
  };

  const arcPath = (i: number): string => {
    const start = i * segAngle;
    const end = (i + 1) * segAngle;
    const [x1, y1] = polar(R, start);
    const [x2, y2] = polar(R, end);
    const large = segAngle > 180 ? 1 : 0;
    return `M 0 0 L ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  // Percent offsets keep the wheel, pointer, and light ring aligned when the
  // outer container is scaled down for mobile. 40/540 ≈ 7.4%, 460/540 ≈ 85.2%.
  const wheelStyle: CSSProperties = {
    position: "absolute",
    left: "7.407%",
    top: "7.407%",
    width: "85.185%",
    height: "85.185%",
    touchAction: "none",
    cursor: isDragging ? "grabbing" : phase === "done" ? "default" : "grab",
    transform: `rotate(${angle}deg)`,
    transformOrigin: "center",
    willChange: "transform",
    userSelect: "none",
    zIndex: 2,
  };

  if (N === 0) return null;

  return (
    <div className="wheel-wrap">
      <svg
        viewBox={`-${R + 40} -${R + 40} ${R * 2 + 80} ${R * 2 + 80}`}
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0 }}
      >
        <circle cx="0" cy="0" r={R + 30} fill="var(--ink-900)" />
        <circle cx="0" cy="0" r={R + 22} fill="var(--paper-50)" stroke="var(--ink-900)" strokeWidth="1" />
        {Array.from({ length: NUM_LIGHTS }).map((_, i) => {
          const a = (i / NUM_LIGHTS) * 360;
          const [x, y] = polar(R + 26, a);
          const on =
            phase === "spinning"
              ? (i + lightPulse) % 2 === 0
              : phase === "done"
                ? (Math.floor(lightPulse / 6) + i) % 3 === 0
                : i % 4 === 0;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={4}
              fill={on ? "var(--accent-500)" : "var(--paper-300)"}
              stroke="var(--ink-900)"
              strokeWidth="0.8"
            />
          );
        })}
      </svg>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: 12,
          transform: "translateX(-50%)",
          width: 0,
          height: 0,
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderTop: "28px solid var(--ink-900)",
          zIndex: 4,
          filter: "drop-shadow(0 2px 0 var(--paper-50))",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: 2,
          transform: "translateX(-50%)",
          width: 22,
          height: 14,
          background: "var(--ink-900)",
          borderRadius: 2,
          zIndex: 3,
        }}
      />

      <div
        ref={wheelRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={wheelStyle}
        data-nograb
      >
        <svg viewBox={`-${R} -${R} ${R * 2} ${R * 2}`} width="100%" height="100%" style={{ display: "block" }}>
          {participants.map((_, i) => (
            <path key={`seg-${i}`} d={arcPath(i)} fill={segmentColor(i, N)} stroke="var(--ink-900)" strokeWidth="1.5" />
          ))}
          {participants.map((p, i) => {
            const mid = i * segAngle + segAngle / 2;
            const [lx, ly] = polar(LABEL_R, mid);
            return (
              <g key={`label-${i}`} transform={`translate(${lx} ${ly}) rotate(${mid})`}>
                <text
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontFamily="Fraunces, serif"
                  fontSize={N > 7 ? 18 : 22}
                  fontWeight={600}
                  fill="var(--paper-50)"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {p.length > 14 ? `${p.slice(0, 13)}…` : p}
                </text>
              </g>
            );
          })}
          <circle cx="0" cy="0" r={INNER_R} fill="var(--paper-50)" stroke="var(--ink-900)" strokeWidth="1.5" />
          <circle cx="0" cy="0" r={INNER_R - 8} fill="none" stroke="var(--accent)" strokeWidth="1" />
          <text
            x="0"
            y="-4"
            textAnchor="middle"
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontWeight={700}
            fontSize="18"
            fill="var(--ink-900)"
          >
            2fs
          </text>
          <text
            x="0"
            y="14"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
            fontWeight={600}
            fontSize="8"
            letterSpacing="2"
            fill="var(--accent)"
          >
            SORTEO
          </text>
        </svg>
      </div>
    </div>
  );
}
