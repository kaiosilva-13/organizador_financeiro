import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AlertCircle, Plus, Wallet } from "lucide-react";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import AccountModal from "../components/modals/AccountModal";
import TransactionsAccountBar from "../components/transactions/TransactionsAccountBar";
import TransactionsEmptyState from "../components/transactions/TransactionsEmptyState";
import TransactionsTable from "../components/transactions/TransactionsTable";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { API_URL } from "../lib/api";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";
import {
  DEFAULT_CATEGORIES,
  buildDemoTransactions,
  sortTransactionsByDate,
} from "../lib/transactions";
import type { Account, NewAccountInput } from "../types/account";
import type {
  Transaction,
  TransactionCategory,
} from "../types/transaction";

const PAGE_SIZE = 6;

function Transactions() {
  const userName = useAuthenticatedUser();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<TransactionCategory[]>(DEFAULT_CATEGORIES);
  const [page, setPage] = useState(1);

  const hasSeededDemoRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/accounts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar as contas.");
        }

        const data: Account[] = await response.json();
        const normalizedAccounts = data.map((account) => ({
          ...account,
          id: String(account.id),
          balance: Number(account.balance),
        }));

        if (!isMounted) {
          return;
        }

        setAccounts(normalizedAccounts);
        setAccountsError("");

        if (normalizedAccounts.length > 0 && !hasSeededDemoRef.current) {
          hasSeededDemoRef.current = true;
          setTransactions(buildDemoTransactions(normalizedAccounts[0].id));
        }
      } catch (error) {
        console.error("Erro ao carregar contas:", error);

        if (isMounted) {
          setAccountsError(
            "Não foi possível carregar suas contas financeiras agora.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoadingAccounts(false);
        }
      }
    }

    loadAccounts();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeAccount = useMemo(
    () =>
      accounts.find((account) => account.id === selectedAccountId) ??
      accounts[0] ??
      null,
    [accounts, selectedAccountId],
  );

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const accountTransactions = useMemo(
    () =>
      sortTransactionsByDate(
        transactions.filter(
          (transaction) => transaction.accountId === activeAccount?.id,
        ),
      ),
    [activeAccount?.id, transactions],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(accountTransactions.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleTransactions = accountTransactions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleSelectAccount = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
    setPage(1);
  }, []);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(Math.min(Math.max(nextPage, 1), totalPages));
    },
    [totalPages],
  );

  const handleDeleteTransaction = useCallback((transaction: Transaction) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a movimentação "${transaction.title}"? Essa ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      return;
    }

    if (transaction.receipt?.url.startsWith("blob:")) {
      URL.revokeObjectURL(transaction.receipt.url);
    }

    setTransactions((currentTransactions) =>
      currentTransactions.filter((item) => item.id !== transaction.id),
    );
  }, []);

  const handleCreateAccount = useCallback(
    async (input: NewAccountInput) => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/accounts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);

          throw new Error(
            errorData?.message || "Não foi possível cadastrar a conta.",
          );
        }

        const data = await response.json();
        const savedAccount: Account = {
          id: String(data.id),
          name: data.name ?? input.name,
          type: data.type ?? input.type,
          balance: Number(data.balance ?? input.balance),
        };

        setAccounts((currentAccounts) => [...currentAccounts, savedAccount]);
        setSelectedAccountId(savedAccount.id);
        setPage(1);
        setIsAccountModalOpen(false);
      } catch (error) {
        console.error("Erro ao cadastrar conta:", error);

        window.alert(
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao cadastrar a conta.",
        );
      }
    },
    [],
  );

  return (
    <div className="min-h-svh bg-slate-50">
      <DashboardNavbar
        items={DASHBOARD_NAV_ITEMS}
        activeKey="transactions"
        userName={userName}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Movimentações
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Organize suas receitas e despesas, acompanhe o histórico e mantenha
              suas finanças sob controle.
            </p>
          </div>
        </header>

        {isLoadingAccounts && (
          <div className="mt-6 space-y-4" aria-label="Carregando contas">
            <div className="h-[118px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        )}

        {!isLoadingAccounts && accountsError && (
          <div
            role="alert"
            className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-rose-600"
              />
              <div>
                <p className="text-sm font-semibold text-rose-800">
                  {accountsError}
                </p>
                <p className="mt-0.5 text-xs text-rose-600">
                  Verifique sua conexão e tente novamente.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-300 bg-white px-4 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!isLoadingAccounts && !accountsError && !activeAccount && (
          <div className="mt-8">
            <TransactionsEmptyState
              icon={Wallet}
              title="Você precisa criar uma conta financeira para poder cadastrar suas movimentações."
              description="Comece pela sua conta. Depois, organize suas receitas e despesas em um só lugar."
              actionLabel="Cadastrar nova conta financeira"
              actionIcon={Plus}
              onAction={() => setIsAccountModalOpen(true)}
            />
          </div>
        )}

        {!isLoadingAccounts && !accountsError && activeAccount && (
          <>
            <TransactionsAccountBar
              account={activeAccount}
              accounts={accounts}
              onSelectAccount={handleSelectAccount}
              onCreateAccount={() => setIsAccountModalOpen(true)}
            />

            <div className="mt-6">
              <TransactionsTable
                transactions={visibleTransactions}
                totalItems={accountTransactions.length}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                categoriesById={categoriesById}
                hasAnyTransactions={accountTransactions.length > 0}
                hasActiveFilters={false}
                onPageChange={handlePageChange}
                onDelete={handleDeleteTransaction}
                onClearFilters={() => undefined}
              />
            </div>
          </>
        )}
      </main>

      <AccountModal
        isOpen={isAccountModalOpen}
        account={null}
        onClose={() => setIsAccountModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
}

export default Transactions;
