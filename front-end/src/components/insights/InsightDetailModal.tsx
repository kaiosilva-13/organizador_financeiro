import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

import { X } from "lucide-react";

import logoIcon from "../../assets/logo_projeto_icone.png";
import type { FinancialInsight } from "../../data/financialInsights";

type InsightDetailModalProps = {
  insight: FinancialInsight | null;
  onClose: () => void;
};

/**
 * Modal de detalhes de um insight financeiro.
 *
 * O cartão é expandido mantendo a identidade visual da grade. A modal usa
 * portal, bloqueia o scroll da página, fecha com Escape ou clique no backdrop
 * e devolve o foco ao elemento que a abriu.
 */
function InsightDetailModal({ insight, onClose }: InsightDetailModalProps) {
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!insight) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [insight]);

  if (!insight) {
    return null;
  }

  const formattedId = String(insight.id).padStart(2, "0");

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[#0B0B45]/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-[460px] overflow-hidden rounded-2xl bg-[#4F26E9] text-white shadow-2xl"
      >
        <div className="max-h-[calc(100svh-2rem)] overflow-y-auto p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <img
                src={logoIcon}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="h-5 w-5 shrink-0 select-none object-contain"
              />

              <span className="text-[11px] font-medium tracking-wide text-white/75 tabular-nums">
                {formattedId} / 20
              </span>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Fechar detalhes do insight"
              className="-mt-1.5 -mr-1.5 rounded-full bg-white/15 p-2 text-white transition hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <h2
            id={titleId}
            className="mt-7 text-2xl leading-tight font-bold tracking-tight sm:text-[26px]"
          >
            {insight.title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/90">
            {insight.description}
          </p>

          <div className="mt-6 border-t border-white/20 pt-5">
            <h3 className="text-sm font-bold text-white">Na prática</h3>

            <p className="mt-2 text-sm leading-relaxed text-white/85">
              {insight.practice}
            </p>
          </div>

          <footer className="mt-7 flex items-center justify-between gap-4 text-[11px] font-medium text-white/70">
            <span>Organizaê</span>
            <span>Educação financeira</span>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default InsightDetailModal;
