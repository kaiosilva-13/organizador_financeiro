import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
import {
  DEFAULT_CATEGORIES,
  EMPTY_TRANSACTION_FILTERS,
  buildDemoTransactions,
  createId,
  parseFilterAmount,
  sortTransactionsByDate,
} from "../lib/transactions";
import type { Account, NewAccountInput } from "../types/account";
import type {
  Transaction,
  TransactionCategory,
  TransactionFilterValues,
  TransactionFormInput,
  TransactionReceipt,
} from "../types/transaction";

/**
 * Página de Movimentações.
 *
 * O front-end mantém os lançamentos em memória enquanto o módulo de
 * movimentações não existe no back-end. Os pontos de integração previstos são:
 *
 * - `GET /transactions?accountId=&search=&startDate=&endDate=&minAmount=&
 *    maxAmount=&categoryId=&page=&limit=`
 * - `POST /transactions` e `PUT /transactions/:id`
 * - `DELETE /transactions/:id`
 * - `GET /categories` e `POST /categories`
 * - upload de comprovantes via URL pré-assinada do S3
 *
 * TODO [BACKEND]: Substituir os dados de demonstração, a paginação local e as
 * mutações em memória pelas chamadas acima. O componente já separa os dados
 * por `accountId`, então a troca de conta deve refletir a query da API.
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
  // TODO [BACKEND]: Substituir as categorias padrão por GET /categories.
  const [categories, setCategories] =
    useState<TransactionCategory[]>(DEFAULT_CATEGORIES);
  const [filters, setFilters] = useState<TransactionFilterValues>({
    ...EMPTY_TRANSACTION_FILTERS,
  });
  const [page, setPage] = useState(1);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const hasSeededDemoRef = useRef(false);
  const createdReceiptUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const createdReceiptUrls = createdReceiptUrlsRef.current;

    return () => {
      createdReceiptUrls.forEach((url) => URL.revokeObjectURL(url));
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

        // TODO [BACKEND]: Remover o seed de demonstração e carregar os
        // lançamentos reais com GET /transactions?accountId=<id>.
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

  const hasActiveFilters = useMemo(
    () => Object.values(filters).some((value) => value.trim().length > 0),
    [filters],
  );

  // TODO [BACKEND]: Implementar estes filtros como query params no banco de
  // dados (título, período, faixa de valor e categoria). A filtragem local
  // abaixo é apenas o fallback funcional do protótipo.
  const filteredTransactions = useMemo(() => {
    const normalizedSearch = filters.search
      .trim()
      .toLocaleLowerCase("pt-BR");
    const minAmount = parseFilterAmount(filters.minAmount);
    const maxAmount = parseFilterAmount(filters.maxAmount);

    return accountTransactions.filter((transaction) => {
      if (
        normalizedSearch &&
        !transaction.title
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedSearch)
      ) {
        return false;
      }

      if (
        filters.startDate &&
        (!transaction.date || transaction.date < filters.startDate)
      ) {
        return false;
      }

      if (
        filters.endDate &&
        (!transaction.date || transaction.date > filters.endDate)
      ) {
        return false;
      }

      if (minAmount !== null && transaction.amount < minAmount) {
        return false;
      }

      if (maxAmount !== null && transaction.amount > maxAmount) {
        return false;
      }

      if (
        filters.categoryId &&
        transaction.categoryId !== filters.categoryId
      ) {
        return false;
      }

      return true;
    });
  }, [accountTransactions, filters]);

  // TODO [BACKEND]: Migrar para paginação server-side (`page`/`limit`) para
  // não transferir todo o histórico do usuário em cada consulta.
  const totalPages = Math.max(
    1,
    Math.ceil(filteredTransactions.length / PAGE_SIZE),
  );
  const currentPage = Math.min(page, totalPages);
  const visibleTransactions = filteredTransactions.slice(
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

  const releaseReceiptUrl = useCallback((url?: string) => {
    if (!url?.startsWith("blob:")) {
      return;
    }

    URL.revokeObjectURL(url);
    createdReceiptUrlsRef.current.delete(url);
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
        // TODO [BACKEND]: Persistir a nova categoria com POST /categories e
        // usar o `id` retornado pela API antes de salvar a movimentação.
        const newCategoryName = input.newCategory.name.trim();
        const existingCategory = categories.find(
          (category) =>
            category.name.toLocaleLowerCase("pt-BR") ===
            newCategoryName.toLocaleLowerCase("pt-BR"),
        );

        if (existingCategory) {
          resolvedCategory = existingCategory;
        } else {
          const newCategory: TransactionCategory = {
            id: createId("category"),
            name: newCategoryName,
            color: input.newCategory.color,
          };

          resolvedCategory = newCategory;
          setCategories((currentCategories) => [
            ...currentCategories,
            newCategory,
          ]);
        }
      }

      if (!resolvedCategory) {
        throw new Error("Selecione uma categoria para a movimentação.");
      }

      let receipt: TransactionReceipt | null =
        editingTransaction?.receipt ?? null;

      if (input.receiptFile) {
        // TODO [BACKEND]: Conectar endpoint de upload de comprovantes S3.
        // O fluxo ideal é solicitar uma URL pré-assinada, enviar o arquivo
        // diretamente ao bucket e persistir apenas a chave/URL no banco.
        const receiptUrl = URL.createObjectURL(input.receiptFile);
        createdReceiptUrlsRef.current.add(receiptUrl);

        receipt = {
          name: input.receiptFile.name,
          url: receiptUrl,
          mimeType: input.receiptFile.type || undefined,
          size: input.receiptFile.size,
        };
      } else if (input.removeReceipt) {
        receipt = null;
      }

      // TODO [BACKEND]: Trocar as mutações locais abaixo por chamadas reais:
      // PUT /transactions/:id para edição e POST /transactions para criação.
      if (editingTransaction) {
        if (editingTransaction.receipt?.url !== receipt?.url) {
          releaseReceiptUrl(editingTransaction.receipt?.url);
        }

        setTransactions((currentTransactions) =>
          currentTransactions.map((item) =>
            item.id === editingTransaction.id
              ? {
                  ...item,
                  title: input.title,
                  description: input.description,
                  amount: input.amount,
                  type: input.type,
                  categoryId: resolvedCategory.id,
                  date: input.date,
                  receipt,
                }
              : item,
          ),
        );
      } else {
        const newTransaction: Transaction = {
          id: createId("transaction"),
          accountId: activeAccount.id,
          title: input.title,
          description: input.description,
          amount: input.amount,
          type: input.type,
          categoryId: resolvedCategory.id,
          date: input.date,
          receipt,
        };

        setTransactions((currentTransactions) => [
          newTransaction,
          ...currentTransactions,
        ]);
        setPage(1);
      }

      setEditingTransaction(null);
      setIsTransactionModalOpen(false);
    },
    [activeAccount, categories, editingTransaction, releaseReceiptUrl],
  );

  const handleDeleteTransaction = useCallback(
    (transaction: Transaction) => {
      const confirmed = window.confirm(
        `Tem certeza que deseja excluir a movimentação "${transaction.title}"? Essa ação não pode ser desfeita.`,
      );

      if (!confirmed) {
        return;
      }

      releaseReceiptUrl(transaction.receipt?.url);

      // TODO [BACKEND]: Substituir a remoção local por DELETE
      // /transactions/:id e tratar o comprovante no S3.
      setTransactions((currentTransactions) =>
        currentTransactions.filter((item) => item.id !== transaction.id),
      );
    },
    [releaseReceiptUrl],
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
              <TransactionsTable
                transactions={visibleTransactions}
                totalItems={filteredTransactions.length}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                categoriesById={categoriesById}
                hasAnyTransactions={accountTransactions.length > 0}
                hasActiveFilters={hasActiveFilters}
                onPageChange={handlePageChange}
                onEdit={handleOpenEditTransaction}
                onDelete={handleDeleteTransaction}
                onClearFilters={handleClearFilters}
                onCreate={handleOpenNewTransaction}
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
