import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { playRumble, warmAudio } from "../../lib/audio";

export interface MagicBallAnswer {
  text: string;
  tone: "yes" | "no" | "maybe";
}

interface MagicBallProps {
  size?: number;
  answer: MagicBallAnswer | null;
  triangleOpacity: number;
  interactive: boolean;
  onShakeStart: () => void;
  onShakeEnd: (energy: number) => void;
}

export function MagicBall({
  size = 380,
  answer,
  triangleOpacity,
  interactive,
  onShakeStart,
  onShakeEnd,
}: MagicBallProps) {
  const ballRef = useRef<HTMLDivElement | null>(null);
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [isDown, setIsDown] = useState(false);

  const lastMoveRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const energyRef = useRef(0);
  const triggeredRef = useRef(false);
  const phaseRef = useRef<"ready" | "shaking">("ready");

  useEffect(() => {
    const onUp = () => {
      if (!isDown) return;
      setIsDown(false);
      setShakeOffset({ x: 0, y: 0 });
      lastMoveRef.current = null;
      if (phaseRef.current === "shaking" && !triggeredRef.current) {
        triggeredRef.current = true;
        onShakeEnd(energyRef.current);
      }
      energyRef.current = 0;
      phaseRef.current = "ready";
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [isDown, onShakeEnd]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (!interactive) return;
    setIsDown(true);
    triggeredRef.current = false;
    warmAudio();
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    energyRef.current = 0;
    phaseRef.current = "ready";
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!isDown || !interactive) return;
    const prev = lastMoveRef.current;
    if (!prev) return;
    const dx = e.clientX - prev.x;
    const dy = e.clientY - prev.y;
    const dist = Math.hypot(dx, dy);
    const now = performance.now();
    const dt = Math.max(1, now - prev.t);
    const speed = dist / dt;
    setShakeOffset({
      x: Math.max(-16, Math.min(16, dx * 0.6 + (Math.random() - 0.5) * 6)),
      y: Math.max(-16, Math.min(16, dy * 0.6 + (Math.random() - 0.5) * 6)),
    });
    energyRef.current += speed * dt * 0.5;
    if (speed > 0.3 && phaseRef.current !== "shaking") {
      phaseRef.current = "shaking";
      onShakeStart();
    }
    if (Math.random() < 0.15 && speed > 0.5) playRumble();
    lastMoveRef.current = { x: e.clientX, y: e.clientY, t: now };
  };

  return (
    <div
      ref={ballRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      data-nograb
      style={{
        width: size,
        height: size,
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px) rotate(${shakeOffset.x * 0.3}deg)`,
        transition: isDown ? "none" : "transform 280ms var(--ease)",
        cursor: !interactive ? "default" : isDown ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        position: "relative",
      }}
    >
      <svg viewBox="0 0 400 400" width={size} height={size} style={{ display: "block" }}>
        <defs>
          <radialGradient id="ballGrad" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#3A3330" />
            <stop offset="55%" stopColor="#1E1A18" />
            <stop offset="100%" stopColor="#050404" />
          </radialGradient>
          <radialGradient id="ballHighlight" cx="35%" cy="28%" r="22%">
            <stop offset="0%" stopColor="rgba(244,239,230,0.55)" />
            <stop offset="70%" stopColor="rgba(244,239,230,0.08)" />
            <stop offset="100%" stopColor="rgba(244,239,230,0)" />
          </radialGradient>
          <radialGradient id="ballWindow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E3A5F" />
            <stop offset="70%" stopColor="#0A1828" />
            <stop offset="100%" stopColor="#050A12" />
          </radialGradient>
        </defs>
        <ellipse cx="200" cy="385" rx="140" ry="10" fill="rgba(20,17,16,0.22)" />
        <circle cx="200" cy="200" r="180" fill="url(#ballGrad)" />
        <circle cx="200" cy="108" r="52" fill="var(--paper-50)" />
        <text
          x="200"
          y="108"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Inter, sans-serif"
          fontWeight="800"
          fontSize="64"
          fill="#141110"
        >
          8
        </text>
        <circle cx="200" cy="240" r="82" fill="url(#ballWindow)" stroke="#050404" strokeWidth="3" />
        <g opacity={triangleOpacity}>
          <polygon points="200,185 258,285 142,285" fill="#2B4A7A" stroke="#4A6B9A" strokeWidth="1" />
          <foreignObject x="135" y="200" width="130" height="75">
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontFamily: "Inter, sans-serif",
                fontSize: answer && answer.text.length > 20 ? 10 : 12,
                fontWeight: 700,
                color: "#F4EFE6",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                lineHeight: 1.15,
                padding: "0 4px",
                boxSizing: "border-box",
              }}
            >
              {answer?.text ?? ""}
            </div>
          </foreignObject>
        </g>
        <circle cx="200" cy="200" r="180" fill="url(#ballHighlight)" pointerEvents="none" />
      </svg>
    </div>
  );
}
