import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
}

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { fontSize: 13, padding: "7px 12px" },
  md: { fontSize: 15, padding: "11px 20px" },
  lg: { fontSize: 16, padding: "14px 28px" },
};

const variantStyles: Record<Variant, CSSProperties> = {
  primary: {
    background: "var(--accent)",
    color: "var(--fg-on-accent)",
    border: "1.5px solid var(--accent)",
  },
  secondary: {
    background: "transparent",
    color: "var(--fg)",
    border: "1.5px solid var(--fg)",
  },
  ghost: {
    background: "transparent",
    color: "var(--fg)",
    border: "1.5px solid transparent",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  },
};

const base: CSSProperties = {
  fontFamily: "var(--font-ui)",
  fontWeight: 600,
  borderRadius: "var(--r-md)",
  transition: "all var(--dur-base) var(--ease)",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  letterSpacing: 0,
  lineHeight: 1,
  whiteSpace: "nowrap",
};

export function Button({
  variant = "primary",
  size = "md",
  type = "button",
  disabled,
  style,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      style={{
        ...base,
        ...sizeStyles[size],
        ...variantStyles[variant],
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
