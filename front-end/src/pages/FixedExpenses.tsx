import { useCallback, useEffect, useMemo, useState } from "react";

import { AlertCircle, CheckCircle2, Plus, Wallet, X } from "lucide-react";

import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import FixedExpenseFormModal from "../components/fixedExpenses/FixedExpenseFormModal";
import FixedExpenseHistoryModal from "../components/fixedExpenses/FixedExpenseHistoryModal";
import FixedExpensePaymentModal from "../components/fixedExpenses/FixedExpensePaymentModal";
import DeleteFixedExpenseModal from "../components/fixedExpenses/DeleteFixedExpenseModal";
import FixedExpensesAccountBalances from "../components/fixedExpenses/FixedExpensesAccountBalances";
import FixedExpensesTable from "../components/fixedExpenses/FixedExpensesTable";
import AccountModal from "../components/modals/AccountModal";
import TransactionsEmptyState from "../components/transactions/TransactionsEmptyState";
import { useAuthenticatedUser } from "../hooks/useAuthenticatedUser";
import { API_URL } from "../lib/api";
import { formatCurrency } from "../lib/currency";
import {
  FIXED_EXPENSE_CATEGORY,
  FIXED_EXPENSE_CATEGORY_COLOR,
  getTodayISO,
  hasPaymentInMonth,
  loadFixedExpenses,
  saveFixedExpenses,
  sortFixedExpenses,
} from "../lib/fixedExpenses";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";
import {
  createId,
  normalizeSearchText,
  roundCurrency,
} from "../lib/transactions";
import {
  createCategory,
  createTransaction,
  fetchAccounts,
  fetchCategories,
} from "../lib/transactionsApi";
import type { Account, NewAccountInput } from "../types/account";
import type {
  FixedExpense,
  FixedExpenseFormInput,
  FixedExpensePayment,
  FixedExpensePaymentInput,
} from "../types/fixedExpense";
import type { TransactionCategory } from "../types/transaction";

/**
 * Página de Gastos Fixos.
 *
 * O fluxo completo (cadastro, edição, status, pagamento, histórico, filtros e
 * exclusão) funciona localmente nesta primeira versão. Os gastos são mantidos
 * em `localStorage` por `lib/fixedExpenses.ts`; as contas continuam vindo de
 * `GET /accounts`.
 *
 * Cada pagamento mensal também cria uma despesa em `POST /transactions`,
 * usando a conta selecionada e a categoria padrão "Gastos Fixos". A API de
 * movimentações já atualiza o saldo da conta de forma atômica, e a página
 * recarrega `GET /accounts` para renderizar o novo saldo.
 *
 * TODO [BACKEND]: Substituir a persistência local pelas rotas autenticadas:
 * - GET    /api/fixed-expenses
 * - POST   /api/fixed-expenses
 * - PUT    /api/fixed-expenses/:id
 * - PATCH  /api/fixed-expenses/:id/status
 * - DELETE /api/fixed-expenses/:id
 * - POST   /api/fixed-expenses/:id/payments
 * - GET    /api/fixed-expenses/:id/payments?startDate=&endDate=
 * - upload do comprovante em multipart/form-data (PDF/JPG/PNG até 10 MB)
 *
 * TODO [BACKEND]: O endpoint de pagamento deve ser atômico: criar
 * `fixed_expense_payments`, criar a movimentação, debitar a conta e salvar o
 * comprovante na mesma transação SQL. Nesta versão o front-end cria a
 * movimentação via `POST /transactions` antes de registrar o pagamento local.
 *
 * A inativação deve apenas alterar `isActive`, preservando todo o histórico.
 * A exclusão do gasto fixo deve preservar as movimentações financeiras já
 * realizadas; o vínculo deve ser tratado no banco com `ON DELETE SET NULL`.
 */
function FixedExpenses() {
  const userName = useAuthenticatedUser();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [lastPayment, setLastPayment] = useState<{
    accountId: string;
    amount: number;
    title: string;
  } | null>(null);

  /**
   * Lista de gastos fixos do usuário.
   *
   * Começa vazia: nenhum registro de exemplo é criado. O carregamento local
   * existe apenas para preservar o fluxo durante o desenvolvimento do
   * front-end; a fonte definitiva deve ser a API.
   */
  const [expenses, setExpenses] = useState<FixedExpense[]>(loadFixedExpenses);
  const [feedback, setFeedback] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(
    null,
  );
  const [payingExpense, setPayingExpense] = useState<FixedExpense | null>(null);
  const [historyExpense, setHistoryExpense] = useState<FixedExpense | null>(
    null,
  );
  const [deletingExpense, setDeletingExpense] = useState<FixedExpense | null>(
    null,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadAccounts() {
      try {
        const data = await fetchAccounts();

        if (isMounted) {
          setAccounts(data);
          setAccountsError("");
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

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();

        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        // Não bloqueia a listagem: a categoria é resolvida novamente no
        // momento do pagamento.
        console.error("Erro ao carregar categorias:", error);
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  // Mantém o fluxo local disponível após recarregar a página.
  // TODO [BACKEND]: Remover ao integrar GET/POST/PUT/DELETE /api/fixed-expenses.
  useEffect(() => {
    saveFixedExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(""), 4500);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  const sortedExpenses = useMemo(() => sortFixedExpenses(expenses), [expenses]);
  const hasAccounts = accounts.length > 0;
  const activeAccount = accounts[0] ?? null;

  const handleOpenCreateExpense = useCallback(() => {
    setEditingExpense(null);
    setIsFormModalOpen(true);
  }, []);

  const handleOpenEditExpense = useCallback((expense: FixedExpense) => {
    setEditingExpense(expense);
    setIsFormModalOpen(true);
  }, []);

  const handleCloseExpenseForm = useCallback(() => {
    setIsFormModalOpen(false);
    setEditingExpense(null);
  }, []);

  const handleSubmitExpense = useCallback(
    async (input: FixedExpenseFormInput) => {
      if (editingExpense) {
        // TODO [BACKEND]: Conectar PUT /api/fixed-expenses/:id.
        // Enviar título, valor estimado e dia de vencimento.
        setExpenses((currentExpenses) =>
          currentExpenses.map((expense) =>
            expense.id === editingExpense.id
              ? {
                  ...expense,
                  title: input.title,
                  estimatedAmount: input.estimatedAmount,
                  dueDay: input.dueDay,
                }
              : expense,
          ),
        );

        setFeedback(`Gasto fixo "${input.title}" atualizado com sucesso.`);
      } else {
        // TODO [BACKEND]: Conectar POST /api/fixed-expenses.
        // O servidor deve devolver o `id` e `createdAt` definitivos.
        const newExpense: FixedExpense = {
          id: createId("fixed-expense"),
          title: input.title,
          estimatedAmount: input.estimatedAmount,
          dueDay: input.dueDay,
          isActive: true,
          category: FIXED_EXPENSE_CATEGORY,
          createdAt: new Date().toISOString(),
          payments: [],
        };

        setExpenses((currentExpenses) => [...currentExpenses, newExpense]);
        setFeedback(`Gasto fixo "${input.title}" cadastrado com sucesso.`);
      }

      setIsFormModalOpen(false);
      setEditingExpense(null);
    },
    [editingExpense],
  );

  const handleToggleStatus = useCallback((expense: FixedExpense) => {
    // TODO [BACKEND]: Chamar PATCH /api/fixed-expenses/:id/status.
    // A inativação não deve excluir o gasto nem o histórico de pagamentos.
    setExpenses((currentExpenses) =>
      currentExpenses.map((currentExpense) =>
        currentExpense.id === expense.id
          ? { ...currentExpense, isActive: !currentExpense.isActive }
          : currentExpense,
      ),
    );

    setFeedback(
      expense.isActive
        ? `"${expense.title}" foi inativado. O histórico foi preservado.`
        : `"${expense.title}" foi reativado com sucesso.`,
    );
  }, []);

  const handleOpenPayment = useCallback((expense: FixedExpense) => {
    setPayingExpense(expense);
  }, []);

  const handleClosePayment = useCallback(() => {
    setPayingExpense(null);
  }, []);

  /**
   * Busca a categoria padrão "Gastos Fixos" usada na movimentação.
   *
   * A categoria já é criada pelo back-end em `categories.service.ts`. Caso a
   * listagem esteja desatualizada, tentamos recarregar e, em último caso,
   * `POST /categories` reaproveita a categoria existente pelo nome.
   */
  const resolveFixedExpenseCategory =
    useCallback(async (): Promise<TransactionCategory> => {
      const findCategory = (items: TransactionCategory[]) =>
        items.find(
          (category) =>
            normalizeSearchText(category.name) ===
            normalizeSearchText(FIXED_EXPENSE_CATEGORY),
        );

      const cachedCategory = findCategory(categories);

      if (cachedCategory) {
        return cachedCategory;
      }

      const latestCategories = await fetchCategories();
      setCategories(latestCategories);

      const fetchedCategory = findCategory(latestCategories);

      if (fetchedCategory) {
        return fetchedCategory;
      }

      // TODO [BACKEND]: A categoria padrão deve existir via seed/migração.
      // O fallback abaixo evita bloquear o pagamento caso a carga inicial
      // ainda não tenha sido executada.
      const createdCategory = await createCategory({
        name: FIXED_EXPENSE_CATEGORY,
        color: FIXED_EXPENSE_CATEGORY_COLOR,
      });

      setCategories((currentCategories) =>
        currentCategories.some(
          (category) => category.id === createdCategory.id,
        )
          ? currentCategories
          : [...currentCategories, createdCategory],
      );

      return createdCategory;
    }, [categories]);

  const handleSubmitPayment = useCallback(
    async (input: FixedExpensePaymentInput) => {
      if (!payingExpense) {
        throw new Error("Selecione um gasto fixo para registrar o pagamento.");
      }

      const selectedAccount = accounts.find(
        (account) => account.id === input.accountId,
      );

      if (!selectedAccount) {
        throw new Error("Selecione uma conta financeira válida.");
      }

      if (!payingExpense.isActive) {
        throw new Error(
          "Reative o gasto fixo antes de registrar um novo pagamento.",
        );
      }

      if (hasPaymentInMonth(payingExpense)) {
        throw new Error("Este gasto fixo já foi pago no mês atual.");
      }

      const fixedExpenseCategory = await resolveFixedExpenseCategory();
      const paymentDate = getTodayISO();

      /*
       * Cada pagamento de gasto fixo também é uma despesa real da conta
       * utilizada. `POST /transactions` salva a movimentação, o comprovante e
       * atualiza o saldo no servidor dentro da mesma transação.
       *
       * TODO [BACKEND]: Unificar as operações no endpoint dedicado
       * `POST /api/fixed-expenses/:id/payments`, criando na mesma transação
       * SQL:
       * 1. o registro em `fixed_expense_payments`;
       * 2. a movimentação de despesa em `movimentacao`;
       * 3. o débito em `conta_financeira.saldo_atual`;
       * 4. o comprovante em BYTEA;
       * 5. o vínculo `fixed_expense_payments.transaction_id`.
       */
      const transaction = await createTransaction(selectedAccount.id, {
        title: payingExpense.title,
        description: `Pagamento mensal do gasto fixo "${payingExpense.title}".`,
        amount: payingExpense.estimatedAmount,
        type: "expense",
        categoryId: fixedExpenseCategory.id,
        date: paymentDate,
        receiptFile: input.receiptFile ?? undefined,
      });

      const payment: FixedExpensePayment = {
        id: createId("fixed-expense-payment"),
        transactionId: transaction.id,
        paidAt: transaction.date || paymentDate,
        amount: transaction.amount,
        accountId: selectedAccount.id,
        accountName: selectedAccount.name,
        receiptName: input.receiptFile?.name ?? null,
      };

      // O saldo exibido é atualizado de forma otimista para refletir o débito
      // imediatamente; em seguida `GET /accounts` confirma o valor do servidor.
      const optimisticBalance = roundCurrency(
        selectedAccount.balance - payment.amount,
      );

      setAccounts((currentAccounts) =>
        currentAccounts.map((account) =>
          account.id === selectedAccount.id
            ? { ...account, balance: optimisticBalance }
            : account,
        ),
      );
      setLastPayment({
        accountId: selectedAccount.id,
        amount: payment.amount,
        title: payingExpense.title,
      });

      setExpenses((currentExpenses) =>
        currentExpenses.map((expense) =>
          expense.id === payingExpense.id
            ? { ...expense, payments: [...expense.payments, payment] }
            : expense,
        ),
      );

      setPayingExpense(null);

      let updatedBalance = optimisticBalance;

      try {
        const refreshedAccounts = await fetchAccounts();
        setAccounts(refreshedAccounts);

        const refreshedAccount = refreshedAccounts.find(
          (account) => account.id === selectedAccount.id,
        );

        if (refreshedAccount) {
          updatedBalance = refreshedAccount.balance;
        }
      } catch (error) {
        // A movimentação já foi criada e debitada no servidor. Mantemos o
        // valor otimista até a próxima atualização da lista de contas.
        console.error(
          "Pagamento registrado, mas não foi possível recarregar o saldo:",
          error,
        );
      }

      setFeedback(
        `Pagamento de ${formatCurrency(payment.amount)} registrado em Movimentações e debitado da conta ${selectedAccount.name}. Saldo atual: ${formatCurrency(updatedBalance)}.`,
      );
    },
    [accounts, payingExpense, resolveFixedExpenseCategory],
  );

  const handleOpenHistory = useCallback((expense: FixedExpense) => {
    setHistoryExpense(expense);
  }, []);

  const handleCloseHistory = useCallback(() => {
    setHistoryExpense(null);
  }, []);

  const handleOpenDelete = useCallback((expense: FixedExpense) => {
    setDeletingExpense(expense);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeletingExpense(null);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingExpense) {
      return;
    }

    // TODO [BACKEND]: Chamar DELETE /api/fixed-expenses/:id.
    // Os pagamentos devem ser removidos em cascata no banco de dados.
    setExpenses((currentExpenses) =>
      currentExpenses.filter((expense) => expense.id !== deletingExpense.id),
    );

    setFeedback(`Gasto fixo "${deletingExpense.title}" excluído.`);
    setDeletingExpense(null);
  }, [deletingExpense]);

  const handleCloseAccountModal = useCallback(() => {
    setIsAccountModalOpen(false);
  }, []);

  const handleCreateAccount = useCallback(async (input: NewAccountInput) => {
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
      setIsAccountModalOpen(false);
      setFeedback("Conta financeira cadastrada com sucesso.");
    } catch (error) {
      console.error("Erro ao cadastrar conta:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Ocorreu um erro ao cadastrar a conta.",
      );
    }
  }, []);

  return (
    <div className="min-h-svh bg-slate-50">
      <DashboardNavbar
        items={DASHBOARD_NAV_ITEMS}
        activeKey="fixed-expenses"
        userName={userName}
      />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Gastos Fixos
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Gerencie suas despesas recorrentes, acompanhe os vencimentos e
              registre os pagamentos de cada mês.
            </p>
          </div>

          {!isLoadingAccounts && !accountsError && activeAccount && (
            <button
              type="button"
              onClick={handleOpenCreateExpense}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99]"
            >
              <Plus size={18} aria-hidden="true" />
              Cadastrar Gasto Fixo
            </button>
          )}
        </header>

        {feedback && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3.5"
          >
            <CheckCircle2
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-emerald-600"
            />
            <p className="flex-1 text-sm font-medium text-emerald-800">
              {feedback}
            </p>
            <button
              type="button"
              onClick={() => setFeedback("")}
              aria-label="Fechar mensagem de sucesso"
              className="rounded-full p-1 text-emerald-600 transition hover:bg-emerald-100"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        {isLoadingAccounts && (
          <div className="mt-6 space-y-4" aria-label="Carregando gastos fixos">
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

        {!isLoadingAccounts && !accountsError && !hasAccounts && (
          <div className="mt-8">
            <TransactionsEmptyState
              icon={Wallet}
              title="Você precisa de uma conta cadastrada antes de gerenciar e pagar seus gastos fixos"
              description="Cadastre sua conta financeira para começar. Depois, você poderá adicionar gastos recorrentes e vincular cada pagamento à conta usada."
              actionLabel="Cadastrar conta financeira"
              actionIcon={Plus}
              onAction={() => setIsAccountModalOpen(true)}
            />
          </div>
        )}

        {!isLoadingAccounts && !accountsError && hasAccounts && (
          <div className="mt-6 flex flex-col gap-4">
            <FixedExpensesAccountBalances
              accounts={accounts}
              lastPayment={lastPayment}
            />

            <FixedExpensesTable
              expenses={sortedExpenses}
              onEdit={handleOpenEditExpense}
              onDelete={handleOpenDelete}
              onToggleStatus={handleToggleStatus}
              onHistory={handleOpenHistory}
              onPay={handleOpenPayment}
            />
          </div>
        )}
      </main>

      <AccountModal
        isOpen={isAccountModalOpen}
        account={null}
        onClose={handleCloseAccountModal}
        onSubmit={handleCreateAccount}
      />

      <FixedExpenseFormModal
        isOpen={isFormModalOpen}
        expense={editingExpense}
        onClose={handleCloseExpenseForm}
        onSubmit={handleSubmitExpense}
      />

      <FixedExpensePaymentModal
        isOpen={Boolean(payingExpense)}
        expense={payingExpense}
        accounts={accounts}
        onClose={handleClosePayment}
        onSubmit={handleSubmitPayment}
      />

      <FixedExpenseHistoryModal
        isOpen={Boolean(historyExpense)}
        expense={historyExpense}
        onClose={handleCloseHistory}
      />

      <DeleteFixedExpenseModal
        isOpen={Boolean(deletingExpense)}
        expense={deletingExpense}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}

export default FixedExpenses;
