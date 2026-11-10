import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertCircle, Plus, Wallet } from "lucide-react";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import AccountModal from "../components/modals/AccountModal";
import TransactionFilters from "../components/transactions/TransactionFilters";
import TransactionModal from "../components/transactions/TransactionModal";
import TransactionsAccountBar from "../components/transactions/TransactionsAccountBar";
import TransactionsEmptyState from "../components/transactions/TransactionsEmptyState";
import TransactionsTable from "../components/transactions/TransactionsTable";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { API_URL } from "../lib/api";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";
import { EMPTY_TRANSACTION_FILTERS } from "../lib/transactions";
import {
  createCategory,
  createTransaction,
  deleteTransaction,
  fetchAccounts,
  fetchCategories,
  fetchTransactions,
  updateTransaction,
} from "../lib/transactionsApi";
import type { TransactionPayload } from "../lib/transactionsApi";
import type { Account, NewAccountInput } from "../types/account";
import type {
  Transaction,
  TransactionCategory,
  TransactionFilterValues,
  TransactionFormInput,
} from "../types/transaction";

/**
 * Página de Movimentações.
 *
 * Os lançamentos, as categorias e os comprovantes são persistidos pelo
 * back-end. Os pontos de integração utilizados são:
 *
 * - `GET /transactions?accountId=&search=&startDate=&endDate=&minAmount=&
 *    maxAmount=&categoryId=&page=&limit=`
 * - `POST /transactions` e `PUT /transactions/:id`
 * - `DELETE /transactions/:id`
 * - `GET /categories` e `POST /categories`
 * - comprovantes enviados junto com a movimentação e salvos no banco
 *
 * O saldo das contas é calculado no servidor (`GET /accounts`). Os filtros e a
 * paginação também são aplicados no servidor.
 */

const PAGE_SIZE = 6;

function Transactions() {
  const userName = useAuthenticatedUser();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [accountTotal, setAccountTotal] = useState(0);
  const [loadedAccountId, setLoadedAccountId] = useState("");
  const [transactionsError, setTransactionsError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [filters, setFilters] = useState<TransactionFilterValues>({
    ...EMPTY_TRANSACTION_FILTERS,
  });
  const [debouncedFilters, setDebouncedFilters] =
    useState<TransactionFilterValues>({ ...EMPTY_TRANSACTION_FILTERS });
  const [page, setPage] = useState(1);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  // Evita uma requisição a cada tecla digitada nos filtros.
  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedFilters(filters), 300);

    return () => window.clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

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
  const activeAccountId = activeAccount?.id;

  const categoriesById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim().length > 0),
    [filters],
  );

  // Os filtros (título, período, faixa de valor e categoria) e a paginação são
  // aplicados no banco de dados via query params de GET /transactions.
  useEffect(() => {
    if (!activeAccountId) {
      return;
    }

    const accountId = activeAccountId;
    let isCurrent = true;

    async function loadTransactions() {
      try {
        const result = await fetchTransactions({
          accountId,
          filters: debouncedFilters,
          page,
          limit: PAGE_SIZE,
        });

        if (!isCurrent) {
          return;
        }

        setTransactions(result.items);
        setTotalItems(result.total);
        setTotalPages(result.totalPages);
        setAccountTotal(result.accountTotal);
        setTransactionsError("");
        setLoadedAccountId(accountId);

        // Ex.: a última movimentação da última página foi excluída.
        if (result.page > result.totalPages) {
          setPage(result.totalPages);
        }
      } catch (error) {
        console.error("Erro ao carregar movimentações:", error);

        if (isCurrent) {
          setTransactionsError(
            "Não foi possível carregar suas movimentações agora.",
          );
          setLoadedAccountId(accountId);
        }
      }
    }

    loadTransactions();

    return () => {
      isCurrent = false;
    };
  }, [activeAccountId, debouncedFilters, page, reloadKey]);

  const isLoadingTransactions = loadedAccountId !== activeAccountId;
  const currentPage = Math.min(page, totalPages);

  // O saldo vem calculado do servidor: recarregamos as contas após cada
  // criação, edição ou exclusão de movimentação.
  const refreshAccounts = useCallback(async () => {
    try {
      setAccounts(await fetchAccounts());
    } catch (error) {
      console.error("Erro ao atualizar o saldo das contas:", error);
    }
  }, []);

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

  const handleFilterChange = useCallback(
    (field: keyof TransactionFilterValues, value: string) => {
      setFilters((currentFilters) => ({
        ...currentFilters,
        [field]: value,
      }));
      setPage(1);
    },
    [],
  );

  const handleClearFilters = useCallback(() => {
    setFilters({ ...EMPTY_TRANSACTION_FILTERS });
    setPage(1);
  }, []);

  const handleCloseAccountModal = useCallback(() => {
    setIsAccountModalOpen(false);
  }, []);

  const handleOpenNewTransaction = useCallback(() => {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  }, []);

  const handleOpenEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  }, []);

  const handleCloseTransactionModal = useCallback(() => {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleSubmitTransaction = useCallback(
    async (input: TransactionFormInput) => {
      if (!activeAccount) {
        throw new Error("Selecione uma conta financeira para continuar.");
      }

      let resolvedCategory =
        categories.find((category) => category.id === input.categoryId) ??
        null;

      if (input.newCategory) {
        const newCategoryName = input.newCategory.name.trim();
        const existingCategory = categories.find(
          (category) =>
            category.name.toLocaleLowerCase("pt-BR") ===
            newCategoryName.toLocaleLowerCase("pt-BR"),
        );

        if (existingCategory) {
          resolvedCategory = existingCategory;
        } else {
          // A categoria é salva antes da movimentação para usar o `id` real.
          const newCategory = await createCategory({
            name: newCategoryName,
            color: input.newCategory.color,
          });

          resolvedCategory = newCategory;
          setCategories((currentCategories) =>
            currentCategories.some((category) => category.id === newCategory.id)
              ? currentCategories
              : [...currentCategories, newCategory],
          );
        }
      }

      if (!resolvedCategory) {
        throw new Error("Selecione uma categoria para a movimentação.");
      }

      const payload: TransactionPayload = {
        title: input.title,
        description: input.description,
        amount: input.amount,
        type: input.type,
        categoryId: resolvedCategory.id,
        date: input.date || undefined,
        receiptFile: input.receiptFile ?? undefined,
        removeReceipt:
          input.removeReceipt && !input.receiptFile ? true : undefined,
      };

      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, payload);
      } else {
        await createTransaction(activeAccount.id, payload);
        setPage(1);
      }

      setReloadKey((currentKey) => currentKey + 1);
      void refreshAccounts();
      setEditingTransaction(null);
      setIsTransactionModalOpen(false);
    },
    [activeAccount, categories, editingTransaction, refreshAccounts],
  );

  const handleDeleteTransaction = useCallback(
    async (transaction: Transaction) => {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir a movimentação "${transaction.title}"? Essa ação não pode ser desfeita.`,
      );

      if (!confirmed) {
        return;
      }

      try {
        // O comprovante é removido junto, pois fica salvo na movimentação.
        await deleteTransaction(transaction.id);
        setReloadKey((currentKey) => currentKey + 1);
        void refreshAccounts();
      } catch (error) {
        console.error("Erro ao excluir movimentação:", error);

        window.alert(
          error instanceof Error
            ? error.message
            : "Ocorreu um erro ao excluir a movimentação.",
        );
      }
    },
    [refreshAccounts],
  );

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

          {!isLoadingAccounts && activeAccount && (
            <button
              type="button"
              onClick={handleOpenNewTransaction}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99]"
            >
              <Plus size={18} aria-hidden="true" />
              Nova Movimentação
            </button>
          )}
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
              <TransactionFilters
                values={filters}
                categories={categories}
                hasActiveFilters={hasActiveFilters}
                onChange={handleFilterChange}
                onClear={handleClearFilters}
              />
            </div>

            <div className="mt-6">
              {isLoadingTransactions ? (
                <div
                  className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
                  aria-label="Carregando movimentações"
                />
              ) : (
                <>
                  {transactionsError && (
                    <div
                      role="alert"
                      className="mb-4 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5"
                    >
                      <AlertCircle
                        size={20}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-rose-600"
                      />
                      <p className="text-sm font-semibold text-rose-800">
                        {transactionsError}
                      </p>
                    </div>
                  )}

                  <TransactionsTable
                    transactions={transactions}
                    totalItems={totalItems}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pageSize={PAGE_SIZE}
                    categoriesById={categoriesById}
                    hasAnyTransactions={accountTotal > 0}
                    hasActiveFilters={hasActiveFilters}
                    onPageChange={handlePageChange}
                    onEdit={handleOpenEditTransaction}
                    onDelete={handleDeleteTransaction}
                    onClearFilters={handleClearFilters}
                    onCreate={handleOpenNewTransaction}
                  />
                </>
              )}
            </div>
          </>
        )}
      </main>

      <AccountModal
        isOpen={isAccountModalOpen}
        account={null}
        onClose={handleCloseAccountModal}
        onSubmit={handleCreateAccount}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        transaction={editingTransaction}
        categories={categories}
        onClose={handleCloseTransactionModal}
        onSubmit={handleSubmitTransaction}
      />
    </div>
  );
}

export default Transactions;
