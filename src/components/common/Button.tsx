import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className = "",
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const variants: Record<Variant, string> = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
    secondary: "bg-section text-foreground hover:bg-border",
    ghost: "text-foreground hover:bg-section",
  };
  const sizes: Record<Size, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-5 text-sm",
    lg: "h-14 px-8 text-base",
  };
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
