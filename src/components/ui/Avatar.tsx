interface AvatarProps {
  name: string;
  size?: number;
  highlight?: boolean;
}

export function Avatar({ name, size = 32, highlight = false }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((part) => part[0] ?? "")
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: highlight ? "var(--accent)" : "var(--paper-300)",
        color: highlight ? "var(--paper-50)" : "var(--fg)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-ui)",
        fontWeight: 600,
        fontSize: Math.round(size * 0.38),
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}
