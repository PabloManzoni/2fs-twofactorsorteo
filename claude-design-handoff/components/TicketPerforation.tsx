interface TicketPerforationProps {
  count?: number;
  color?: string;
  top?: number;
}

export function TicketPerforation({ count = 28, color = "var(--bg)", top = 0 }: TicketPerforationProps) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        height: 8,
        display: "flex",
        justifyContent: "space-around",
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            height: 4,
            marginTop: 2,
            borderRadius: "50%",
            background: color,
          }}
        />
      ))}
    </div>
  );
}
