import type { DashboardNavItem } from "../components/dashboard/DashboardNavbar";

/**
 * Navegação principal compartilhada entre as páginas internas.
 * Itens com `path` levam a uma rota; os demais seguem como atalhos locais do
 * Dashboard até suas respectivas seções serem implementadas.
 */
export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  { key: "overview", label: "visão geral", path: "/dashboard" },
  { key: "transactions", label: "movimentações", path: "/movimentacoes" },
  { key: "fixed-expenses", label: "gastos fixos" },
  { key: "goals", label: "metas financeiras" },
  { key: "purchases", label: "controle de compras" },
  { key: "simulation", label: "simulação gastos futuros" },
];
