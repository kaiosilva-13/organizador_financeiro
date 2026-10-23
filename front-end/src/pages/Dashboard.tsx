import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  FileText,
  Plus,
  Scale,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import DashboardNavbar, {
  type DashboardNavItem,
} from "../components/dashboard/DashboardNavbar";
import AccountCard from "../components/dashboard/AccountCard";
import DashboardCard from "../components/dashboard/DashboardCard";
import EmptyStateCard from "../components/dashboard/EmptyStateCard";
import SummaryCard from "../components/dashboard/SummaryCard";
import CreateAccountModal from "../components/modals/CreateAccountModal";
import type { Account, NewAccountInput } from "../types/account";

const API_URL = "http://localhost:3000";

/**
 * Conta de demonstração exibida enquanto o endpoint de contas não está
 * disponível no back-end.
 *
 * Para integrar, substitua este array pela resposta de `GET /accounts`
 * mantendo o formato de `Account`. O restante do Dashboard já consome o estado
 * `accounts`, então a troca do mock pela API fica isolada nesta etapa.
 */
const INITIAL_ACCOUNTS: Account[] = [
  {
    id: "demo-account-nubank",
    name: "Conta Principal - Nubank",
    type: "Conta Corrente",
    balance: 1250,
  },
];

const NAV_ITEMS: DashboardNavItem[] = [
  { key: "overview", label: "visão geral" },
  { key: "transactions", label: "movimentações" },
  { key: "fixed-expenses", label: "gastos fixos" },
  { key: "goals", label: "metas financeiras" },
  { key: "purchases", label: "controle de compras" },
  { key: "simulation", label: "simulação gastos futuros" },
];

export type TransactionType = "income" | "expense";

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
};

export type CategorySummary = {
  name: string;
  amount: number;
};

export type Purchase = {
  id: string;
  name: string;
  total: number;
  installments: number;
  paidInstallments: number;
};

export type Goal = {
  id: string;
  title: string;
  target: number;
  saved: number;
};

function Dashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [userName, setUserName] = useState("Usuário");
  const [isLoading, setIsLoading] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<CategorySummary[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  /**
   * Estado local de contas.
   *
   * `activeAccountIndex` aponta para a conta exibida no card "Dados da conta".
   * Quando a API de contas existir, `accounts` pode ser carregado via fetch e
   * `handleCreateAccount` pode fazer um POST antes de atualizar o estado.
   */
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [activeAccountIndex, setActiveAccountIndex] = useState(0);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAuthenticatedUser() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const user = await response.json();

        if (isMounted) {
          setUserName(user.name || user.nome || "Usuário");
        }
      } catch {
        if (isMounted) {
          setUserName("Usuário");
        }
      }
    }

    loadAuthenticatedUser();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(`${API_URL}/dashboard/overview`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (!isMounted) {
          return;
        }

        setTransactions(data.transactions ?? []);
        setPurchases(data.purchases ?? []);
        setGoals(data.goals ?? []);
      } catch {
        setTransactions([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const { balance, income, expenses, monthResult } = useMemo(() => {
    const totalIncome = transactions
      .filter((item) => item.type === "income")
      .reduce((sum, item) => sum + item.amount, 0);

    const totalExpenses = transactions
      .filter((item) => item.type === "expense")
      .reduce((sum, item) => sum + item.amount, 0);

    return {
      income: transactions.length > 0 ? totalIncome : null,
      expenses: transactions.length > 0 ? totalExpenses : null,
      balance: transactions.length > 0 ? totalIncome - totalExpenses : null,
      monthResult: transactions.length > 0 ? totalIncome - totalExpenses : null,
    };
  }, [transactions]);

  const hasPurchases = purchases.length > 0;
  const hasCategories = categories.length > 0;
  const hasTransactions = transactions.length > 0;
  const hasGoals = goals.length > 0;

  const activeAccount = accounts[activeAccountIndex] ?? accounts[0] ?? null;

  const handleOpenCreateAccountModal = useCallback(() => {
    setIsCreateAccountModalOpen(true);
  }, []);

  const handleCloseCreateAccountModal = useCallback(() => {
    setIsCreateAccountModalOpen(false);
  }, []);

  const handleCreateAccount = useCallback(
    (input: NewAccountInput) => {
      const newAccount: Account = {
        id: crypto.randomUUID(),
        ...input,
      };

      setAccounts((currentAccounts) => [...currentAccounts, newAccount]);
      // Exibe imediatamente a conta recém-cadastrada.
      setActiveAccountIndex(accounts.length);
    },
    [accounts.length],
  );

  const handleSwitchAccount = useCallback(() => {
    if (accounts.length < 2) {
      return;
    }

    setActiveAccountIndex(
      (currentIndex) => (currentIndex + 1) % accounts.length,
    );
  }, [accounts.length]);

  return (
    <div className="min-h-svh bg-slate-50">
      <DashboardNavbar
        items={NAV_ITEMS}
        activeKey={activeNav}
        userName={userName}
        onNavigate={setActiveNav}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Olá, {userName}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Acompanhe suas finanças e planeje seus próximos passos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreateAccountModal}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99] sm:w-auto"
          >
            <Plus size={18} />
            Cadastrar nova conta financeira
          </button>
        </header>

        <section className="mt-8">
          <AccountCard
            account={activeAccount}
            position={activeAccountIndex + 1}
            totalAccounts={accounts.length}
            onSwitch={handleSwitchAccount}
            onCreate={handleOpenCreateAccountModal}
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Saldo disponível"
            icon={Wallet}
            tone="brand"
            value={balance}
            hint="Suas informações aparecerão aqui após o primeiro lançamento."
          />

          <SummaryCard
            label="Receitas"
            icon={TrendingDown}
            tone="positive"
            value={income}
            hint="Registre suas entradas para acompanhar o total recebido."
          />

          <SummaryCard
            label="Despesas"
            icon={TrendingUp}
            tone="negative"
            value={expenses}
            hint="Registre suas saídas para acompanhar o total gasto."
          />

          <SummaryCard
            label="Resultado do mês"
            icon={Scale}
            tone="neutral"
            value={monthResult}
            hint="A diferença entre receitas e despesas do mês aparecerá aqui."
          />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashboardCard title="Controle de compras">
            {hasPurchases ? (
              <ul className="mt-4 flex flex-col gap-3">
                {purchases.map((purchase) => (
                  <li
                    key={purchase.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {purchase.name}
                    </span>

                    <span className="text-slate-500">
                      {purchase.paidInstallments}/{purchase.installments} parcelas
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyStateCard
                icon={CalendarDays}
                title="Cadastre e acompanhe suas compras"
                description="Registre compras parceladas e bens como carro ou casa para ver quanto já foi pago e quanto ainda falta."
              />
            )}
          </DashboardCard>

          <DashboardCard title="Gastos por categoria">
            {hasCategories ? (
              <ul className="mt-4 flex flex-col gap-3">
                {categories.map((category) => (
                  <li
                    key={category.name}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {category.name}
                    </span>

                    <span className="text-slate-500">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(category.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyStateCard
                icon={Tag}
                title="Nenhuma despesa registrada"
                description="Quando você cadastrar despesas, verá aqui como seus gastos se distribuem por categoria."
              />
            )}
          </DashboardCard>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <DashboardCard title="Movimentações recentes">
            {hasTransactions ? (
              <ul className="mt-4 flex flex-col gap-3">
                {transactions.map((transaction) => (
                  <li
                    key={transaction.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <span className="font-medium text-slate-700">
                      {transaction.description}
                    </span>

                    <span
                      className={
                        transaction.type === "income"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }
                    >
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(transaction.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyStateCard
                icon={FileText}
                title="Tudo pronto para o seu primeiro lançamento"
                description="Adicione suas receitas e despesas para começar a acompanhar sua vida financeira em tempo real."
                actionLabel="Adicionar lançamento"
                actionVariant="primary"
              />
            )}
          </DashboardCard>

          <DashboardCard title="Metas financeiras">
            {hasGoals ? (
              <ul className="mt-4 flex flex-col gap-3">
                {goals.map((goal) => (
                  <li key={goal.id} className="flex flex-col gap-1.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-700">
                        {goal.title}
                      </span>

                      <span className="text-slate-500">
                        {Math.round((goal.saved / goal.target) * 100)}%
                      </span>
                    </div>

                    <span className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full bg-[#4F26E9]"
                        style={{
                          width: `${Math.min(
                            (goal.saved / goal.target) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyStateCard
                icon={Target}
                title="Dê um destino aos seus planos"
                description="Crie metas financeiras e acompanhe o quanto falta para conquistar cada objetivo."
                actionLabel="Criar primeira meta"
                actionVariant="outline"
              />
            )}
          </DashboardCard>
        </section>

        {isLoading && (
          <p className="mt-6 text-center text-xs text-slate-400">
            Carregando informações...
          </p>
        )}
      </main>

      <CreateAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={handleCloseCreateAccountModal}
        onCreate={handleCreateAccount}
      />
    </div>
  );
}

export default Dashboard;
