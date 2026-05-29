import type { CSSProperties, ReactNode } from "react";

interface EyebrowProps {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}

export function Eyebrow({ children, color, style }: EyebrowProps) {
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: color ?? "var(--fg-muted)",
        display: "inline-block",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
