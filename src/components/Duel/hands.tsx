/**
 * Hand glyphs for the duel. Line-art line drawings on paper surface,
 * stroke is ink, no fills. Each viewBox is 96×96 so the props default to
 * a single source of truth for size. Drawing style intentionally hand-cut
 * — chunky strokes, rounded joins — to match the newsprint aesthetic.
 *
 * `mirrored` flips the glyph horizontally so the two contenders can face
 * each other on the page.
 */
import type { CSSProperties } from "react";

export type Hand = "rock" | "paper" | "scissors";

interface HandIconProps {
  size?: number;
  mirrored?: boolean;
  style?: CSSProperties;
}

const baseStyle: CSSProperties = {
  stroke: "var(--ink-900)",
  fill: "none",
  strokeWidth: 3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

function svgProps(size: number, mirrored: boolean, extraStyle?: CSSProperties) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 96 96",
    style: {
      transform: mirrored ? "scaleX(-1)" : undefined,
      transformOrigin: "center",
      ...extraStyle,
    } as CSSProperties,
  };
}

/** Closed fist. */
export function RockIcon({ size = 96, mirrored = false, style }: HandIconProps) {
  return (
    <svg {...svgProps(size, mirrored, style)} aria-hidden="true">
      <g style={baseStyle}>
        {/* wrist */}
        <path d="M30 86 L30 70 Q30 60 38 58 L66 50 Q72 48 72 42 L72 36 Q72 30 66 30 L42 30 Q34 30 30 36 L26 44 Q22 52 26 60 L26 70 Q26 84 30 86 Z" />
        {/* knuckle ridges */}
        <path d="M40 36 L42 30" />
        <path d="M52 32 L54 26" />
        <path d="M62 32 L64 26" />
        {/* thumb tuck */}
        <path d="M50 46 Q60 44 64 38" />
      </g>
    </svg>
  );
}

/** Flat palm, fingers extended. */
export function PaperIcon({ size = 96, mirrored = false, style }: HandIconProps) {
  return (
    <svg {...svgProps(size, mirrored, style)} aria-hidden="true">
      <g style={baseStyle}>
        {/* palm + wrist */}
        <path d="M28 86 L28 60 Q28 52 34 50 L40 48 L40 18 Q40 14 44 14 Q48 14 48 18 L48 44 L52 14 Q52 10 56 10 Q60 10 60 14 L58 44 L64 16 Q64 12 68 12 Q72 12 72 16 L68 46 L74 24 Q74 20 78 20 Q82 20 82 24 L78 56 Q76 70 68 78 L60 86 Z" />
      </g>
    </svg>
  );
}

/** Two-finger V. */
export function ScissorsIcon({ size = 96, mirrored = false, style }: HandIconProps) {
  return (
    <svg {...svgProps(size, mirrored, style)} aria-hidden="true">
      <g style={baseStyle}>
        {/* fist + two fingers up */}
        <path d="M30 86 L30 64 Q30 56 36 54 L40 52 L36 18 Q36 14 40 14 Q44 14 45 18 L50 50 L60 22 Q61 18 65 19 Q69 20 68 24 L60 56 Q66 56 70 60 Q74 64 74 70 L74 78 Q74 86 66 86 Z" />
      </g>
    </svg>
  );
}

export function HandIcon({
  hand,
  size,
  mirrored,
  style,
}: HandIconProps & { hand: Hand }) {
  if (hand === "rock") return <RockIcon size={size} mirrored={mirrored} style={style} />;
  if (hand === "paper") return <PaperIcon size={size} mirrored={mirrored} style={style} />;
  return <ScissorsIcon size={size} mirrored={mirrored} style={style} />;
}
