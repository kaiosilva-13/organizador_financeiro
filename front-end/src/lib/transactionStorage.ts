import type { Transaction, TransactionReceipt } from "../types/transaction";

/**
 * Persistência temporária das movimentações no localStorage.
 *
 * TODO [BACKEND]: Substituir por GET/POST/PUT/DELETE /transactions. O saldo e
 * os comprovantes definitivos devem vir do servidor/S3. Enquanto isso, este
 * módulo mantém o mesmo contrato de `Transaction` para facilitar a troca.
 */
const TRANSACTIONS_STORAGE_KEY = "organizae:transactions:v1";

function normalizeReceipt(value: unknown): TransactionReceipt | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const receipt = value as Record<string, unknown>;

  if (typeof receipt.name !== "string" || typeof receipt.url !== "string") {
    return null;
  }

  // URLs `blob:` só são válidas durante a sessão atual do navegador.
  if (receipt.url.startsWith("blob:")) {
    return null;
  }

  return {
    name: receipt.name,
    url: receipt.url,
    mimeType:
      typeof receipt.mimeType === "string" ? receipt.mimeType : undefined,
    size: typeof receipt.size === "number" ? receipt.size : undefined,
  };
}

function normalizeTransaction(value: unknown): Transaction | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const transaction = value as Record<string, unknown>;

  if (
    typeof transaction.id !== "string" ||
    typeof transaction.accountId !== "string" ||
    typeof transaction.title !== "string" ||
    typeof transaction.categoryId !== "string" ||
    typeof transaction.date !== "string" ||
    typeof transaction.amount !== "number" ||
    !Number.isFinite(transaction.amount) ||
    (transaction.type !== "income" && transaction.type !== "expense")
  ) {
    return null;
  }

  return {
    id: transaction.id,
    accountId: transaction.accountId,
    title: transaction.title,
    description:
      typeof transaction.description === "string"
        ? transaction.description
        : "",
    amount: transaction.amount,
    type: transaction.type,
    categoryId: transaction.categoryId,
    date: transaction.date,
    receipt: normalizeReceipt(transaction.receipt),
  };
}

export function loadStoredTransactions(): Transaction[] {
  try {
    const storedValue = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);

    if (!storedValue) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue
      .map(normalizeTransaction)
      .filter((transaction): transaction is Transaction => transaction !== null);
  } catch (error) {
    console.error("Erro ao carregar movimentações locais:", error);
    return [];
  }
}

function serializeTransaction(transaction: Transaction): Transaction {
  const receipt = transaction.receipt;
  const canPersistReceipt =
    receipt !== null &&
    (receipt.url.startsWith("data:") || /^https?:\/\//.test(receipt.url));

  return {
    ...transaction,
    receipt: canPersistReceipt ? receipt : null,
  };
}

function writeTransactions(transactions: Transaction[]) {
  localStorage.setItem(
    TRANSACTIONS_STORAGE_KEY,
    JSON.stringify(transactions.map(serializeTransaction)),
  );
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    writeTransactions(transactions);
  } catch (error) {
    console.warn(
      "Não foi possível salvar os comprovantes locais. Salvando sem os arquivos.",
      error,
    );

    // Evita perder as movimentações caso os comprovantes excedam a cota do
    // localStorage. O upload definitivo será feito no S3 pelo back-end.
    try {
      writeTransactions(
        transactions.map((transaction) => ({
          ...transaction,
          receipt: null,
        })),
      );
    } catch (fallbackError) {
      console.error(
        "Não foi possível salvar as movimentações localmente:",
        fallbackError,
      );
    }
  }
}
