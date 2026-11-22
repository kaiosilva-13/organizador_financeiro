import type { ReactNode } from "react";

import { Link } from "react-router-dom";

export type ActionLinkVariant = "primary" | "secondary";

type ActionLinkProps = {
  to: string;
  variant?: ActionLinkVariant;
  /** Cor do texto do botão primário, que varia entre as seções escuras. */
  primaryTextColorClassName?: string;
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<ActionLinkVariant, string> = {
  primary: "bg-white font-bold hover:bg-slate-100",
  secondary:
    "border border-white/35 bg-transparent font-semibold text-white hover:bg-white/5",
};

function ActionLink({
  to,
  variant = "primary",
  primaryTextColorClassName = "text-[#0D065A]",
  className = "",
  children,
}: ActionLinkProps) {
  const textColorClass =
    variant === "primary" ? primaryTextColorClassName : "";

  return (
    <Link
      to={to}
      className={`inline-flex min-h-12 items-center justify-center rounded-md px-6 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#8A85D6] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent focus-visible:outline-none sm:text-base ${variantClasses[variant]} ${textColorClass} ${className}`}
    >
      {children}
    </Link>
  );
}

export default ActionLink;
