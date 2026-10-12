import type { LucideIcon } from "lucide-react";

type EmptyStateCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionVariant?: "primary" | "outline";
  onAction?: () => void;
};

function EmptyStateCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionVariant = "primary",
  onAction,
}: EmptyStateCardProps) {
  const actionClasses =
    actionVariant === "primary"
      ? "bg-[#4F26E9] text-white hover:bg-[#411DCB]"
      : "border border-[#4F26E9] bg-white text-[#4F26E9] hover:bg-indigo-50";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-[#4F26E9]">
          <Icon size={26} />
        </span>

        <h4 className="mt-4 text-base font-bold text-black">{title}</h4>

        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className={`mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold transition active:scale-[0.99] ${actionClasses}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyStateCard;
