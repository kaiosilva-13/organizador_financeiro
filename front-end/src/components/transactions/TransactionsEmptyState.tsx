import type { LucideIcon } from "lucide-react";

type TransactionsEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  actionVariant?: "primary" | "outline";
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Versão menor, usada dentro do card da tabela. */
  compact?: boolean;
};

function TransactionsEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  actionVariant = "primary",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
}: TransactionsEmptyStateProps) {
  const actionClasses =
    actionVariant === "primary"
      ? "bg-[#4F26E9] text-white hover:bg-[#411DCB]"
      : "border border-[#4F26E9] bg-white text-[#4F26E9] hover:bg-indigo-50";

  return (
    <div
      className={
        compact
          ? "flex flex-col items-center justify-center px-6 py-14 text-center"
          : "flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"
      }
    >
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-[#4F26E9]">
        <Icon size={30} aria-hidden="true" />
      </span>

      <h2 className="mt-5 max-w-xl text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h2>

      <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-6 flex flex-col items-center gap-2.5 sm:flex-row">
          {actionLabel && (
            <button
              type="button"
              onClick={onAction}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition active:scale-[0.99] ${actionClasses}`}
            >
              {ActionIcon && <ActionIcon size={17} aria-hidden="true" />}
              {actionLabel}
            </button>
          )}

          {secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default TransactionsEmptyState;
