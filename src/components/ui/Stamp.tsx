interface StampProps {
  number?: string;
  label?: string;
  size?: number;
  rotate?: number;
}

export function Stamp({
  number = "042",
  label = "SORTEO · OFICIAL · 2FS",
  size = 140,
  rotate = -6,
}: StampProps) {
  const pathId = `stamp-circ-${number}`;
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, position: "relative", transform: `rotate(${rotate}deg)`, flexShrink: 0 }}
    >
      <svg viewBox="0 0 140 140" width={size} height={size} style={{ display: "block" }}>
        <defs>
          <path id={pathId} d="M 70,70 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0" />
        </defs>
        <g fill="none" stroke="var(--accent)" strokeWidth="1.5">
          <circle cx="70" cy="70" r="64" />
          <circle cx="70" cy="70" r="60" />
          <circle cx="70" cy="70" r="42" />
        </g>
        <text fontFamily="Inter, sans-serif" fontWeight="700" fontSize="9" letterSpacing="3.5" fill="var(--accent)">
          <textPath href={`#${pathId}`} startOffset="0%">
            {`${label} · ${label} · `}
          </textPath>
        </text>
        <text
          x="70"
          y="64"
          textAnchor="middle"
          fontFamily="Fraunces, serif"
          fontStyle="italic"
          fontWeight="700"
          fontSize="16"
          fill="var(--accent)"
        >
          Nº
        </text>
        <text
          x="70"
          y="92"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontWeight="700"
          fontSize="24"
          fill="var(--accent)"
        >
          {number}
        </text>
      </svg>
    </div>
  );
}
