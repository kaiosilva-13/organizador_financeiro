import type { LucideIcon } from "lucide-react";

type SummaryCardTone = "brand" | "positive" | "negative" | "neutral";

type SummaryCardProps = {
  label: string;
  icon: LucideIcon;
  value?: number | null;
  placeholder?: string;
  hint: string;
  tone?: SummaryCardTone;
};

const toneClasses: Record<SummaryCardTone, string> = {
  brand: "bg-indigo-50 text-[#4F26E9]",
  positive: "bg-emerald-50 text-emerald-600",
  negative: "bg-rose-50 text-rose-600",
  neutral: "bg-slate-100 text-slate-600",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

function SummaryCard({
  label,
  icon: Icon,
  value,
  placeholder = "Sem lançamentos",
  hint,
  tone = "brand",
}: SummaryCardProps) {
  const hasValue = typeof value === "number";

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-black">{label}</span>

        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon size={20} />
        </span>
      </div>

      <p
        className={`mt-4 text-2xl font-bold ${
          hasValue ? "text-slate-900" : "text-slate-400"
        }`}
      >
        {hasValue ? formatCurrency(value) : placeholder}
      </p>

      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>
    </article>
  );
}

export default SummaryCard;
