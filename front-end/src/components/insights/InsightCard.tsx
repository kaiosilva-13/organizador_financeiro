import { Eye } from "lucide-react";

import logoIcon from "../../assets/logo_projeto_icone.png";
import type { FinancialInsight } from "../../data/financialInsights";

type InsightCardProps = {
  insight: FinancialInsight;
  onOpen: (insight: FinancialInsight) => void;
};

/**
 * Cartão fechado de um insight financeiro.
 *
 * O cartão inteiro abre os detalhes, e o ícone de olho funciona como ação
 * visual explícita para a mesma modal.
 */
function InsightCard({ insight, onOpen }: InsightCardProps) {
  const formattedId = String(insight.id).padStart(2, "0");

  return (
    <article
      role="button"
      tabIndex={0}
      aria-label={`Abrir insight ${formattedId}: ${insight.title}`}
      onClick={() => onOpen(insight)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(insight);
        }
      }}
      className="group relative flex min-h-[190px] cursor-pointer flex-col overflow-hidden rounded-2xl bg-[#4F26E9] p-6 text-white shadow-lg shadow-slate-900/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F26E9]"
    >
      <div className="flex items-center justify-between gap-3">
        <img
          src={logoIcon}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-5 w-5 shrink-0 select-none object-contain"
        />

        <span className="text-[11px] font-medium tracking-wide text-white/70 tabular-nums">
          {formattedId} / 20
        </span>
      </div>

      <h3 className="mt-5 text-[17px] leading-snug font-bold tracking-tight">
        {insight.title}
      </h3>

      <p className="mt-2 text-[13px] leading-relaxed text-white/80">
        {insight.summary}
      </p>

      <div className="mt-auto flex justify-end pt-4">
        <button
          type="button"
          aria-label={`Ver detalhes do insight ${formattedId}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpen(insight);
          }}
          className="rounded-full p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Eye size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default InsightCard;
