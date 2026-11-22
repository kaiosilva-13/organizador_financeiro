import type { ReactNode } from "react";

import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export type ActionLinkVariant = "primary" | "secondary";

type ActionLinkProps = {
  to: string;
  variant?: ActionLinkVariant;
  showArrow?: boolean;
  className?: string;
  children: ReactNode;
};

const variantClasses: Record<ActionLinkVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700",
  secondary:
    "border border-white/25 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
};

function ActionLink({
  to,
  variant = "primary",
  showArrow = false,
  className = "",
  children,
}: ActionLinkProps) {
  return (
    <Link
      to={to}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-950 focus-visible:outline-none active:scale-[0.99] sm:text-base ${variantClasses[variant]} ${className}`}
    >
      {children}

      {showArrow && (
        <ArrowRight
          size={18}
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      )}
    </Link>
  );
}

export default ActionLink;
