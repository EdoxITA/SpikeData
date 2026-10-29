import type { AnchorHTMLAttributes } from "react";

export function ButtonLink({
  className = "",
  variant = "gold",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: "gold" | "ghost" }) {
  const styles =
    variant === "gold"
      ? "bg-gold text-ink hover:bg-gold-light"
      : "border border-white/25 text-white hover:bg-white/10";
  return (
    <a
      className={`inline-flex items-center justify-center rounded-full px-7 py-3.5 text-base font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${styles} ${className}`}
      {...props}
    />
  );
}
