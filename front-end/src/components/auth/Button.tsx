import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "outline";

type ButtonProps = {
  variant?: ButtonVariant;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    className?: string;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#4F26E9] text-white hover:bg-[#411DCB]",
  outline:
    "border border-slate-900 bg-white text-slate-900 hover:bg-slate-50",
};

function Button({
  variant = "primary",
  className = "",
  children,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition active:scale-[0.99] ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;
