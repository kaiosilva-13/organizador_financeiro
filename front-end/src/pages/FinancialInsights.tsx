import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";

/**
 * Página de Insights Financeiros.
 *
 * Reúne conceitos de educação financeira em cartões que podem ser expandidos
 * em uma modal. O conteúdo é estático e fica em `src/data/financialInsights.ts`;
 * por isso a página não depende do back-end para exibir o catálogo.
 */
function FinancialInsights() {
  const userName = useAuthenticatedUser();

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
      </main>
    </div>
  );
}

export default FinancialInsights;
