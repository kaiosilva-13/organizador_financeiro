import type {
  FixedExpense,
  FixedExpenseHistoryFilters,
  FixedExpensePayment,
} from "../types/fixedExpense";

/**
 * Categoria única usada ao registrar o pagamento de um gasto fixo.
 *
 * TODO [BACKEND]: Reaproveitar a categoria "Gastos Fixos" já criada no módulo
 * de categorias ao persistir o pagamento, em vez de enviar este texto livre.
 */
export const FIXED_EXPENSE_CATEGORY = "Gastos Fixos";

/** Cor usada caso a categoria padrão precise ser criada pelo front-end. */
export const FIXED_EXPENSE_CATEGORY_COLOR = "#030862";

/**
 * Chave usada para manter os gastos fixos no navegador durante o
 * desenvolvimento do front-end.
 *
 * TODO [BACKEND]: Remover a persistência local assim que `GET /api/fixed-expenses`
 * estiver disponível. Os dados devem ser sempre carregados da API autenticada.
 */
const FIXED_EXPENSES_STORAGE_KEY = "organizae:fixed-expenses";

/** Quantidade de dias disponível no select de vencimento. */
export const DUE_DAYS = Array.from({ length: 31 }, (_, index) => index + 1);

/** Data de hoje no formato `YYYY-MM-DD`, sem deslocamento de fuso horário. */
export function getTodayISO(): string {
  const now = new Date();
  const offsetInMilliseconds = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offsetInMilliseconds)
    .toISOString()
    .slice(0, 10);
}

/** Chave do mês atual no formato `YYYY-MM`. */
export function getMonthKey(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

/** Nome do mês atual em português, usado no status da listagem. */
export function getCurrentMonthLabel(date = new Date()): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long" }).format(date);
}

/** Verifica se o gasto já teve um pagamento no mês informado. */
export function hasPaymentInMonth(
  expense: FixedExpense,
  monthKey = getMonthKey(),
): boolean {
  return expense.payments.some((payment) =>
    payment.paidAt.startsWith(monthKey),
  );
}

/** Verifica se o gasto já foi pago no mês corrente. */
export function isPaidThisMonth(expense: FixedExpense): boolean {
  return hasPaymentInMonth(expense, getMonthKey());
}

/** Texto amigável exibido na coluna de vencimento. */
export function formatDueDay(dueDay: number): string {
  return `Todo dia ${dueDay}`;
}

/** Ordena os gastos fixos pelo dia de vencimento. */
export function sortFixedExpenses(expenses: FixedExpense[]): FixedExpense[] {
  return [...expenses].sort(
    (first, second) =>
      first.dueDay - second.dueDay ||
      first.title.localeCompare(second.title, "pt-BR"),
  );
}

/** Ordena os pagamentos do mais recente para o mais antigo. */
export function sortPaymentsByDate(
  payments: FixedExpensePayment[],
): FixedExpensePayment[] {
  return [...payments].sort((first, second) =>
    second.paidAt.localeCompare(first.paidAt),
  );
}

/**
 * Aplica o filtro de período ao histórico de pagamentos.
 *
 * TODO [BACKEND]: Implementar filtros de data no banco de dados. A consulta
 * deve receber `startDate` e `endDate` e retornar somente os pagamentos do
 * gasto fixo selecionado:
 * `GET /api/fixed-expenses/:id/payments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`.
 */
export function filterPaymentsByDate(
  payments: FixedExpensePayment[],
  filters: FixedExpenseHistoryFilters,
): FixedExpensePayment[] {
  return payments.filter((payment) => {
    if (filters.startDate && payment.paidAt < filters.startDate) {
      return false;
    }

    if (filters.endDate && payment.paidAt > filters.endDate) {
      return false;
    }

    return true;
  });
}

function normalizePayment(value: unknown): FixedExpensePayment | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const payment = value as Partial<FixedExpensePayment>;

  if (typeof payment.id !== "string" || typeof payment.paidAt !== "string") {
    return null;
  }

  const amount = Number(payment.amount);

  return {
    id: payment.id,
    // Pagamentos antigos, anteriores à integração com movimentações, não
    // possuem vínculo com a tabela `movimentacao`.
    transactionId:
      typeof payment.transactionId === "string"
        ? payment.transactionId
        : null,
    paidAt: payment.paidAt,
    amount: Number.isFinite(amount) ? amount : 0,
    accountId: String(payment.accountId ?? ""),
    accountName:
      typeof payment.accountName === "string"
        ? payment.accountName
        : "Conta removida",
    receiptName:
      typeof payment.receiptName === "string" ? payment.receiptName : null,
  };
}

function normalizeExpense(value: unknown): FixedExpense | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const expense = value as Partial<FixedExpense>;

  if (typeof expense.id !== "string" || typeof expense.title !== "string") {
    return null;
  }

  const estimatedAmount = Number(expense.estimatedAmount);
  const dueDay = Number(expense.dueDay);
  const payments = Array.isArray(expense.payments)
    ? expense.payments
        .map(normalizePayment)
        .filter((payment): payment is FixedExpensePayment => payment !== null)
    : [];

  return {
    id: expense.id,
    title: expense.title,
    estimatedAmount: Number.isFinite(estimatedAmount) ? estimatedAmount : 0,
    dueDay:
      Number.isInteger(dueDay) && dueDay >= 1 && dueDay <= 31 ? dueDay : 1,
    isActive: expense.isActive !== false,
    category:
      typeof expense.category === "string" && expense.category.trim()
        ? expense.category
        : FIXED_EXPENSE_CATEGORY,
    createdAt:
      typeof expense.createdAt === "string"
        ? expense.createdAt
        : new Date().toISOString(),
    payments,
  };
}

/**
 * Carrega os gastos fixos persistidos localmente.
 *
 * A lista começa vazia para todo usuário novo — nenhum gasto de exemplo é
 * criado. Dados inválidos são ignorados em vez de quebrar a página.
 */
export function loadFixedExpenses(): FixedExpense[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const rawValue = window.localStorage.getItem(FIXED_EXPENSES_STORAGE_KEY);

    if (!rawValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(rawValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeExpense)
      .filter((expense): expense is FixedExpense => expense !== null);
  } catch (error) {
    console.warn("Não foi possível carregar os gastos fixos locais:", error);
    return [];
  }
}

/** Salva os gastos fixos no navegador enquanto a API não está disponível. */
export function saveFixedExpenses(expenses: FixedExpense[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      FIXED_EXPENSES_STORAGE_KEY,
      JSON.stringify(expenses),
    );
  } catch (error) {
    console.warn("Não foi possível salvar os gastos fixos locais:", error);
  }
}

export { formatTransactionDate as formatFixedExpenseDate } from "./transactions";
