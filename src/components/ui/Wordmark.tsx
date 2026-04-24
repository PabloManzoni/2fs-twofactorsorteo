interface WordmarkProps {
  size?: number;
}

export function Wordmark({ size = 22 }: WordmarkProps) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontStyle: "italic",
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        color: "var(--fg)",
        whiteSpace: "nowrap",
      }}
    >
      2fs
      <span
        style={{
          color: "var(--accent)",
          fontSize: size * 0.6,
          verticalAlign: "super",
          marginLeft: 1,
        }}
      >
        º
      </span>
    </span>
  );
}
