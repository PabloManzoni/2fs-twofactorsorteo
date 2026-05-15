/**
 * Hand glyphs for the duel. We delegate the actual drawings to Phosphor
 * Icons (line-art weight) — they ship a clean closed fist (HandFist),
 * open palm (Hand), and scissors that match the editorial line-drawing
 * aesthetic of the rest of the product. Stroke / fill / size are all
 * controlled by props so the icons inherit the ink token like the rest
 * of the UI.
 */
import type { CSSProperties } from "react";
import { Hand as PhHand, HandFist as PhHandFist, Scissors as PhScissors } from "@phosphor-icons/react";

export type Hand = "rock" | "paper" | "scissors";

interface HandIconProps {
  size?: number;
  mirrored?: boolean;
  style?: CSSProperties;
  color?: string;
}

interface HandIconKindProps extends HandIconProps {
  hand: Hand;
}

function frameStyle(size: number, mirrored: boolean, extraStyle?: CSSProperties): CSSProperties {
  return {
    width: size,
    height: size,
    transform: mirrored ? "scaleX(-1)" : undefined,
    transformOrigin: "center",
    display: "block",
    ...extraStyle,
  };
}

const phosphorIconProps = (
  size: number,
  mirrored: boolean,
  color: string,
  style?: CSSProperties,
) => ({
  size,
  weight: "regular" as const,
  color,
  style: frameStyle(size, mirrored, style),
  "aria-hidden": true,
});

/** Closed fist — Phosphor HandFist. */
export function RockIcon({
  size = 96,
  mirrored = false,
  style,
  color = "var(--ink-900)",
}: HandIconProps) {
  return <PhHandFist {...phosphorIconProps(size, mirrored, color, style)} />;
}

/** Open palm — Phosphor Hand. */
export function PaperIcon({
  size = 96,
  mirrored = false,
  style,
  color = "var(--ink-900)",
}: HandIconProps) {
  return <PhHand {...phosphorIconProps(size, mirrored, color, style)} />;
}

/** Scissors — Phosphor Scissors (the tool — readable enough as the RPS sign). */
export function ScissorsIcon({
  size = 96,
  mirrored = false,
  style,
  color = "var(--ink-900)",
}: HandIconProps) {
  return <PhScissors {...phosphorIconProps(size, mirrored, color, style)} />;
}

export function HandIcon({ hand, size, mirrored, style, color }: HandIconKindProps) {
  if (hand === "rock")
    return <RockIcon size={size} mirrored={mirrored} style={style} color={color} />;
  if (hand === "paper")
    return <PaperIcon size={size} mirrored={mirrored} style={style} color={color} />;
  return <ScissorsIcon size={size} mirrored={mirrored} style={style} color={color} />;
}
