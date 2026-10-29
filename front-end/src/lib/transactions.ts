import type { Account } from "../types/account";
import type {
  Transaction,
  TransactionCategory,
  TransactionFilterValues,
  TransactionReceipt,
} from "../types/transaction";

/** Categorias iniciais exibidas enquanto a API de categorias não está disponível. */
export const DEFAULT_CATEGORIES: TransactionCategory[] = [
  { id: "category-salary", name: "Salário", color: "#16A34A" },
  { id: "category-freelance", name: "Freelance", color: "#0891B2" },
  { id: "category-housing", name: "Moradia", color: "#2563EB" },
  { id: "category-food", name: "Alimentação", color: "#EA580C" },
  { id: "category-transport", name: "Transporte", color: "#7C3AED" },
  { id: "category-health", name: "Saúde", color: "#0D9488" },
  { id: "category-leisure", name: "Lazer", color: "#DB2777" },
  { id: "category-education", name: "Educação", color: "#CA8A04" },
  { id: "category-other", name: "Outros", color: "#475569" },
];

/** Paleta usada no cadastro de uma nova categoria. */
export const CATEGORY_COLORS = [
  "#4F26E9",
  "#2563EB",
  "#0891B2",
  "#0D9488",
  "#16A34A",
  "#CA8A04",
  "#EA580C",
  "#DB2777",
  "#7C3AED",
  "#475569",
];

export const EMPTY_TRANSACTION_FILTERS: TransactionFilterValues = {
  search: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  categoryId: "",
};

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Converte um arquivo para data URL. Isso permite manter o comprovante após o
 * recarregamento da página enquanto o upload definitivo não existe.
 */
export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Não foi possível ler o comprovante selecionado."));
    };

    reader.onerror = () => {
      reject(
        reader.error ??
          new Error("Não foi possível ler o comprovante selecionado."),
      );
    };

    reader.readAsDataURL(file);
  });
}

/** Converte `YYYY-MM-DD` para o formato brasileiro `DD/MM/YYYY`. */
export function formatTransactionDate(date: string): string {
  if (!date) {
    return "—";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Normaliza texto para busca: remove acentos, ignora caixa e espaços nas
 * extremidades. Assim "salario" encontra "Salário".
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

/**
 * Interpreta o valor digitado nos filtros aceitando vírgula ou ponto decimal,
 * além de separador de milhar (ex.: "1.000,00" ou "1.000").
 * Retorna `null` quando o campo está vazio para não restringir a busca.
 */
export function parseFilterAmount(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  let normalized = trimmed;

  if (trimmed.includes(",")) {
    normalized = trimmed.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) {
    normalized = trimmed.replace(/\./g, "");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Rótulo curto do tipo de comprovante exibido na tabela. */
export function getReceiptLabel(receipt: TransactionReceipt): string {
  if (receipt.mimeType === "application/pdf") {
    return "PDF";
  }

  if (receipt.mimeType === "image/jpeg") {
    return "JPG";
  }

  if (receipt.mimeType === "image/png") {
    return "PNG";
  }

  return "Arquivo";
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) {
    return "";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Ordena da movimentação mais recente para a mais antiga. */
export function sortTransactionsByDate(
  transactions: Transaction[],
): Transaction[] {
  return [...transactions].sort((first, second) =>
    second.date.localeCompare(first.date),
  );
}

/** Arredonda valores monetários para evitar resíduos de ponto flutuante. */
export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/** Retorna quanto as movimentações de uma conta alteram o saldo base. */
export function getAccountBalanceDelta(
  transactions: Transaction[],
  accountId: string,
): number {
  return roundCurrency(
    transactions
      .filter((transaction) => transaction.accountId === accountId)
      .reduce(
        (total, transaction) =>
          transaction.type === "income"
            ? total + transaction.amount
            : total - transaction.amount,
        0,
      ),
  );
}

/**
 * Aplica o efeito das movimentações locais ao saldo de cada conta.
 *
 * TODO [BACKEND]: Persistir as movimentações e calcular o saldo no servidor,
 * para que GET /accounts já devolva o valor atualizado. Esta função existe
 * apenas para demonstrar o fluxo completo enquanto a API não está disponível.
 */
export function applyTransactionBalances(
  accounts: Account[],
  transactions: Transaction[],
): Account[] {
  return accounts.map((account) => ({
    ...account,
    balance: roundCurrency(
      account.balance + getAccountBalanceDelta(transactions, account.id),
    ),
  }));
}
