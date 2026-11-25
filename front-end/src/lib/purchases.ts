import type {
  Purchase,
  PurchaseFormInput,
  PurchaseInstallment,
} from "../types/purchase";

const MONTH_NAMES = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
] as const;

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function isValidISODate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseISODate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Formata `YYYY-MM-DD` como `dd/mm/aaaa`. */
export function formatPurchaseDate(value: string): string {
  if (!isValidISODate(value)) {
    return "";
  }

  const { year, month, day } = parseISODate(value);

  return `${pad(day)}/${pad(month)}/${year}`;
}

/** Formata `YYYY-MM-DD` como `Dezembro/2026` (usado na tabela). */
export function formatPurchaseMonthYear(value: string): string {
  if (!isValidISODate(value)) {
    return "";
  }

  const { year, month } = parseISODate(value);
  const monthName = MONTH_NAMES[month - 1] ?? "";

  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}/${year}`;
}

/** Formata `YYYY-MM-DD` como `dezembro de 2026` (usado na prévia). */
export function formatPurchaseMonthYearLong(value: string): string {
  if (!isValidISODate(value)) {
    return "";
  }

  const { year, month } = parseISODate(value);

  return `${MONTH_NAMES[month - 1] ?? ""} de ${year}`;
}

/**
 * Conta os meses incluídos no intervalo, contando o mês inicial e o final.
 * Ex.: 01/12/2026 até 01/06/2027 => 7 meses.
 */
export function countInstallmentMonths(
  startDate: string,
  endDate: string,
): number {
  if (!isValidISODate(startDate) || !isValidISODate(endDate)) {
    return 0;
  }

  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  const months =
    (end.year - start.year) * 12 + (end.month - start.month) + 1;

  return months > 0 ? months : 0;
}

/**
 * Avança uma data em N meses mantendo o dia original. Quando o mês de destino
 * é mais curto (ex.: 31/01 -> fevereiro), o dia é ajustado para o último dia
 * do mês.
 */
export function addMonthsClamped(value: string, months: number): string {
  const { year, month, day } = parseISODate(value);
  const absoluteMonth = year * 12 + (month - 1) + months;
  const nextYear = Math.floor(absoluteMonth / 12);
  const nextMonth = (absoluteMonth % 12) + 1;
  const nextDay = Math.min(day, daysInMonth(nextYear, nextMonth));

  return `${nextYear}-${pad(nextMonth)}-${pad(nextDay)}`;
}

/**
 * Divide o valor total em parcelas iguais, distribuindo os centavos restantes
 * nas primeiras parcelas para que a soma seja exatamente o valor total.
 */
export function splitInstallmentAmounts(
  totalAmount: number,
  count: number,
): number[] {
  if (count <= 0) {
    return [];
  }

  const totalCents = Math.max(0, Math.round(totalAmount * 100));
  const baseCents = Math.floor(totalCents / count);
  const remainder = totalCents - baseCents * count;

  return Array.from(
    { length: count },
    (_, index) => (baseCents + (index < remainder ? 1 : 0)) / 100,
  );
}

/** Valor médio de cada parcela (usado nos textos de resumo). */
export function getInstallmentAmount(
  totalAmount: number,
  count: number,
): number {
  return count > 0 ? totalAmount / count : 0;
}

/** Rótulo `1 parcela` / `N parcelas`. */
export function formatInstallmentCount(count: number): string {
  return `${count} ${count === 1 ? "parcela" : "parcelas"}`;
}

/** Total já pago considerando as prestações com status `paid`. */
export function getPaidAmount(purchase: Purchase): number {
  return purchase.installments
    .filter((installment) => installment.status === "paid")
    .reduce((sum, installment) => sum + installment.amount, 0);
}

/** Total restante a pagar. Nunca fica negativo por arredondamento. */
export function getRemainingAmount(purchase: Purchase): number {
  return Math.max(purchase.totalAmount - getPaidAmount(purchase), 0);
}

function createId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Monta a compra e o cronograma de parcelas a partir dos dados do formulário.
 *
 * TODO [BACKEND]: Esta mesma regra (contagem inclusiva de meses, divisão dos
 * centavos e geração dos vencimentos) deve ser reproduzida no servidor ao
 * processar `POST /api/purchases`, garantindo que o cronograma persistido seja
 * idêntico ao exibido no front-end.
 */
export function buildPurchase(input: PurchaseFormInput): Purchase {
  const count = countInstallmentMonths(input.startDate, input.endDate);

  if (count < 1) {
    throw new Error(
      "O período informado deve incluir pelo menos um mês de pagamento.",
    );
  }

  const purchaseId = createId("purchase");
  const amounts = splitInstallmentAmounts(input.totalAmount, count);

  const installments: PurchaseInstallment[] = Array.from(
    { length: count },
    (_, index) => {
      const isLast = index === count - 1;
      const dueDate = isLast
        ? input.endDate
        : addMonthsClamped(input.startDate, index);

      return {
        id: `${purchaseId}-installment-${index + 1}`,
        number: index + 1,
        referenceMonth: dueDate.slice(0, 7),
        dueDate,
        amount: amounts[index] ?? 0,
        status: "pending",
        paidAt: null,
        accountId: null,
        accountName: null,
        receiptName: null,
      };
    },
  );

  return {
    id: purchaseId,
    name: input.name.trim(),
    description: input.description.trim(),
    totalAmount: input.totalAmount,
    startDate: input.startDate,
    endDate: input.endDate,
    createdAt: new Date().toISOString(),
    installments,
  };
}
