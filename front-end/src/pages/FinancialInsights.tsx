import { useRef, useState } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import InsightCard from "../components/insights/InsightCard";
import {
  FINANCIAL_INSIGHTS,
  FINANCIAL_INSIGHTS_PER_PAGE,
} from "../data/financialInsights";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";

const TOTAL_PAGES = Math.ceil(
  FINANCIAL_INSIGHTS.length / FINANCIAL_INSIGHTS_PER_PAGE,
);

const paginationButtonClasses =
  "flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4F26E9] disabled:cursor-not-allowed disabled:opacity-40";

function formatDisplayNumber(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Página de Insights Financeiros.
 *
 * Reúne conceitos de educação financeira em cartões que podem ser expandidos
 * em uma modal. O conteúdo é estático e fica em `src/data/financialInsights.ts`;
 * por isso a página não depende do back-end para exibir o catálogo.
 */
function FinancialInsights() {
  const userName = useAuthenticatedUser();
  const [currentPage, setCurrentPage] = useState(1);
  const catalogRef = useRef<HTMLElement | null>(null);

  const pageStart = (currentPage - 1) * FINANCIAL_INSIGHTS_PER_PAGE;
  const pageEnd = Math.min(
    pageStart + FINANCIAL_INSIGHTS_PER_PAGE,
    FINANCIAL_INSIGHTS.length,
  );

  const visibleInsights = FINANCIAL_INSIGHTS.slice(pageStart, pageEnd);
  const pageNumbers = Array.from(
    { length: TOTAL_PAGES },
    (_, index) => index + 1,
  );
  const rangeLabel = `${formatDisplayNumber(pageStart + 1)}–${formatDisplayNumber(pageEnd)} de ${FINANCIAL_INSIGHTS.length} conceitos`;

  function goToPage(page: number) {
    if (page < 1 || page > TOTAL_PAGES || page === currentPage) {
      return;
    }

    setCurrentPage(page);
    catalogRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="min-h-svh bg-[#F8F9FA]">
      <DashboardNavbar
        items={DASHBOARD_NAV_ITEMS}
        activeKey="insights"
        userName={userName}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-[#0B0B45]">
            Insights Financeiros
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
            Explore conceitos essenciais de educação financeira para tomar
            decisões mais inteligentes com o seu dinheiro.
          </p>
        </header>

        <section ref={catalogRef} className="mt-8 scroll-mt-24">
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold text-[#0B0B45]">
              Conhecimento que transforma suas finanças
            </h2>

            <p
              aria-live="polite"
              className="text-xs font-medium text-slate-400 tabular-nums"
            >
              {rangeLabel}
            </p>
          </div>

          <div className="mt-4 lg:min-h-[400px]">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {visibleInsights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  onOpen={() => undefined}
                />
              ))}
            </div>
          </div>

          <nav
            aria-label="Paginação dos insights"
            className="mt-10 flex items-center justify-center gap-2"
          >
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className={`${paginationButtonClasses} bg-white text-slate-500 shadow-sm hover:bg-indigo-50 hover:text-[#4F26E9] disabled:hover:bg-white disabled:hover:text-slate-500`}
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>

            {pageNumbers.map((pageNumber) => {
              const isActive = pageNumber === currentPage;

              return (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => goToPage(pageNumber)}
                  aria-label={`Ir para a página ${pageNumber}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`${paginationButtonClasses} ${
                    isActive
                      ? "bg-[#4F26E9] text-white shadow-sm hover:bg-[#411DCB]"
                      : "bg-white text-slate-600 shadow-sm hover:bg-indigo-50 hover:text-[#4F26E9]"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === TOTAL_PAGES}
              aria-label="Próxima página"
              className={`${paginationButtonClasses} bg-white text-slate-500 shadow-sm hover:bg-indigo-50 hover:text-[#4F26E9] disabled:hover:bg-white disabled:hover:text-slate-500`}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </nav>
        </section>
      </main>
    </div>
  );
}

export default FinancialInsights;
