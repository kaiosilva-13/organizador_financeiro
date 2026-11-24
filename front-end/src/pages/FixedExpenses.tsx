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
import { API_URL } from '../services/api';
import { formatCurrency } from "../lib/currency";
import {
  getTodayISO,
  hasPaymentInMonth,
  sortFixedExpenses,
} from "../lib/fixedExpenses";
import {
  createFixedExpense,
  deleteFixedExpense,
  fetchFixedExpenses,
  registerFixedExpensePayment,
  updateFixedExpense,
  updateFixedExpenseStatus,
} from "../lib/fixedExpensesApi";
import { DASHBOARD_NAV_ITEMS } from "../lib/navigation";
import { fetchAccounts } from "../lib/transactionsApi";
import type { Account, NewAccountInput } from "../types/account";
import type {
  FixedExpense,
  FixedExpenseFormInput,
  FixedExpensePaymentInput,
} from "../types/fixedExpense";

/**
 * Página de Gastos Fixos.
 *
 * Tudo vem do back-end (autenticado):
 * - `GET/POST/PUT/DELETE /fixed-expenses` e `PATCH /fixed-expenses/:id/status`;
 * - `POST /fixed-expenses/:id/payments` registra o pagamento do mês: o
 *   servidor debita a conta e cria a movimentação de despesa (título do gasto
 *   fixo + categoria "Gastos Fixos") na mesma transação;
 * - o histórico de cada gasto é buscado em
 *   `GET /fixed-expenses/:id/payments?startDate=&endDate=`;
 * - as contas continuam vindo de `GET /accounts`.
 *
 * A inativação apenas altera `isActive`, preservando todo o histórico. A
 * exclusão do gasto fixo preserva as movimentações já realizadas.
 */
function FixedExpenses() {
  const userName = useAuthenticatedUser();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState<{
    accountId: string;
    amount: number;
    title: string;
  } | null>(null);

  const [expenses, setExpenses] = useState<FixedExpense[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(true);
  const [expensesError, setExpensesError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [actionError, setActionError] = useState("");

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

    async function loadExpenses() {
      try {
        const data = await fetchFixedExpenses();

        if (isMounted) {
          setExpenses(data);
          setExpensesError("");
        }
      } catch (error) {
        console.error("Erro ao carregar gastos fixos:", error);

        if (isMounted) {
          setExpensesError("Não foi possível carregar seus gastos fixos agora.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingExpenses(false);
        }
      }
    }

    loadExpenses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => setFeedback(""), 4500);

    return () => window.clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!actionError) {
      return;
    }

    const timer = window.setTimeout(() => setActionError(""), 6000);

    return () => window.clearTimeout(timer);
  }, [actionError]);

  const isLoading = isLoadingAccounts || isLoadingExpenses;
  const loadError = accountsError || expensesError;
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

  // Os erros do servidor (ex.: título repetido) sobem para o formulário, que
  // os exibe sem fechar a modal.
  const handleSubmitExpense = useCallback(
    async (input: FixedExpenseFormInput) => {
      if (editingExpense) {
        const updatedExpense = await updateFixedExpense(
          editingExpense.id,
          input,
        );

        setExpenses((currentExpenses) =>
          currentExpenses.map((expense) =>
            expense.id === updatedExpense.id ? updatedExpense : expense,
          ),
        );

        setFeedback(`Gasto fixo "${updatedExpense.title}" atualizado com sucesso.`);
      } else {
        const createdExpense = await createFixedExpense(input);

        setExpenses((currentExpenses) => [...currentExpenses, createdExpense]);
        setFeedback(`Gasto fixo "${createdExpense.title}" cadastrado com sucesso.`);
      }

      setIsFormModalOpen(false);
      setEditingExpense(null);
    },
    [editingExpense],
  );

  const handleToggleStatus = useCallback(async (expense: FixedExpense) => {
    try {
      const updatedExpense = await updateFixedExpenseStatus(
        expense.id,
        !expense.isActive,
      );

      setExpenses((currentExpenses) =>
        currentExpenses.map((currentExpense) =>
          currentExpense.id === updatedExpense.id
            ? updatedExpense
            : currentExpense,
        ),
      );

      setFeedback(
        updatedExpense.isActive
          ? `"${expense.title}" foi reativado com sucesso.`
          : `"${expense.title}" foi inativado. O histórico foi preservado.`,
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o status do gasto fixo.",
      );
    }
  }, []);

  const handleOpenPayment = useCallback((expense: FixedExpense) => {
    setPayingExpense(expense);
  }, []);

  const handleClosePayment = useCallback(() => {
    setPayingExpense(null);
  }, []);

  // Os erros do servidor sobem para a modal de pagamento, que os exibe.
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

      /*
       * `POST /fixed-expenses/:id/payments` cria a movimentação de despesa
       * (título do gasto + categoria "Gastos Fixos"), debita a conta e salva
       * o comprovante na mesma transação do banco de dados.
       */
      const { payment, accountBalance } = await registerFixedExpensePayment(
        payingExpense.id,
        {
          accountId: selectedAccount.id,
          receiptFile: input.receiptFile,
          date: getTodayISO(),
        },
      );

      setAccounts((currentAccounts) =>
        currentAccounts.map((account) =>
          account.id === selectedAccount.id
            ? { ...account, balance: accountBalance }
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
            ? { ...expense, payments: [payment, ...expense.payments] }
            : expense,
        ),
      );

      setPayingExpense(null);

      let updatedBalance = accountBalance;

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
        // O pagamento já foi registrado e debitado no servidor; mantemos o
        // saldo devolvido por ele até a próxima atualização das contas.
        console.error(
          "Pagamento registrado, mas não foi possível recarregar o saldo:",
          error,
        );
      }

      setFeedback(
        `Pagamento de ${formatCurrency(payment.amount)} registrado em Movimentações e debitado da conta ${selectedAccount.name}. Saldo atual: ${formatCurrency(updatedBalance)}.`,
      );
    },
    [accounts, payingExpense],
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

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingExpense) {
      return;
    }

    const expenseToDelete = deletingExpense;

    try {
      // Remove só o gasto fixo; as movimentações já pagas são preservadas.
      await deleteFixedExpense(expenseToDelete.id);

      setExpenses((currentExpenses) =>
        currentExpenses.filter((expense) => expense.id !== expenseToDelete.id),
      );

      setFeedback(`Gasto fixo "${expenseToDelete.title}" excluído.`);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o gasto fixo.",
      );
    } finally {
      setDeletingExpense(null);
    }
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

          {!isLoading && !loadError && activeAccount && (
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

        {actionError && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3.5"
          >
            <AlertCircle
              size={18}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-rose-600"
            />
            <p className="flex-1 text-sm font-medium text-rose-800">
              {actionError}
            </p>
            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Fechar mensagem de erro"
              className="rounded-full p-1 text-rose-600 transition hover:bg-rose-100"
            >
              <X size={15} aria-hidden="true" />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="mt-6 space-y-4" aria-label="Carregando gastos fixos">
            <div className="h-[118px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        )}

        {!isLoading && loadError && (
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
                  {loadError}
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

        {!isLoading && !loadError && !hasAccounts && (
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

        {!isLoading && !loadError && hasAccounts && (
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
