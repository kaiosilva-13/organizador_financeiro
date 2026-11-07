import type { Account } from "../types/account";
import type {
  Transaction,
  TransactionCategory,
  TransactionReceipt,
  TransactionFilterValues,
  TransactionType,
} from "../types/transaction";
import { API_URL } from "./api";
import { parseFilterAmount } from "./transactions";

/**
 * Chamadas do módulo de Movimentações ao back-end.
 *
 * - `GET /transactions` (filtros e paginação no servidor)
 * - `POST /transactions` e `PUT /transactions/:id`
 * - `DELETE /transactions/:id`
 * - `GET /categories` e `POST /categories`
 * - `GET /transactions/:id/receipt` (comprovante salvo no banco de dados)
 */

export type TransactionsPageResult = {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  /** Total de movimentações da conta, ignorando os filtros. */
  accountTotal: number;
};

export type TransactionPayload = {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  /** `YYYY-MM-DD`. */
  date?: string;
  /** Comprovante (PDF, JPG ou PNG) enviado junto com a movimentação. */
  receiptFile?: File;
  removeReceipt?: boolean;
};

const RECEIPT_MIME_BY_EXTENSION: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

async function request<T>(
  path: string,
  init: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.replace("/login");
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  const hasBody = init.body !== undefined;
  const isFormData = init.body instanceof FormData;

  const response = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: {
      // Com FormData o navegador define o Content-Type (com o boundary).
      ...(hasBody && !isFormData ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
    },
    body: !hasBody
      ? undefined
      : isFormData
        ? (init.body as FormData)
        : JSON.stringify(init.body),
  });

  if (response.status === 401) {
    localStorage.removeItem("access_token");
    window.location.replace("/login");
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = Array.isArray(errorData?.message)
      ? errorData.message.join(" ")
      : errorData?.message;

    throw new Error(message || "Não foi possível concluir a operação.");
  }

  return response.json() as Promise<T>;
}

/** O saldo é calculado no servidor; recarregue após criar, editar ou excluir. */
export async function fetchAccounts(): Promise<Account[]> {
  const data = await request<Account[]>("/accounts");

  return data.map((account) => ({
    ...account,
    id: String(account.id),
    balance: Number(account.balance),
  }));
}

export function fetchCategories(): Promise<TransactionCategory[]> {
  return request<TransactionCategory[]>("/categories");
}

export function createCategory(input: {
  name: string;
  color: string;
}): Promise<TransactionCategory> {
  return request<TransactionCategory>("/categories", {
    method: "POST",
    body: input,
  });
}

export function fetchTransactions(params: {
  accountId: string;
  filters: TransactionFilterValues;
  page: number;
  limit: number;
}): Promise<TransactionsPageResult> {
  const { accountId, filters, page, limit } = params;
  const query = new URLSearchParams({
    accountId,
    page: String(page),
    limit: String(limit),
  });

  const search = filters.search.trim();
  const minAmount = parseFilterAmount(filters.minAmount);
  const maxAmount = parseFilterAmount(filters.maxAmount);

  if (search) {
    query.set("search", search);
  }

  if (filters.startDate) {
    query.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    query.set("endDate", filters.endDate);
  }

  if (minAmount !== null) {
    query.set("minAmount", String(minAmount));
  }

  if (maxAmount !== null) {
    query.set("maxAmount", String(maxAmount));
  }

  if (filters.categoryId) {
    query.set("categoryId", filters.categoryId);
  }

  return request<TransactionsPageResult>(`/transactions?${query.toString()}`);
}

/** Monta o `multipart/form-data` da movimentação (com o comprovante, se houver). */
function buildTransactionFormData(
  payload: TransactionPayload,
  accountId?: string,
): FormData {
  const formData = new FormData();

  if (accountId) {
    formData.append("accountId", accountId);
  }

  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("amount", String(payload.amount));
  formData.append("type", payload.type);
  formData.append("categoryId", payload.categoryId);

  if (payload.date) {
    formData.append("date", payload.date);
  }

  if (payload.removeReceipt) {
    formData.append("removeReceipt", "true");
  }

  if (payload.receiptFile) {
    const file = payload.receiptFile;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = file.type || RECEIPT_MIME_BY_EXTENSION[extension] || "";

    // Alguns navegadores deixam o `type` vazio; o servidor confere o MIME type.
    formData.append(
      "receipt",
      file.type || !mimeType ? file : new File([file], file.name, { type: mimeType }),
      file.name,
    );
  }

  return formData;
}

export function createTransaction(
  accountId: string,
  payload: TransactionPayload,
): Promise<Transaction> {
  return request<Transaction>("/transactions", {
    method: "POST",
    body: buildTransactionFormData(payload, accountId),
  });
}

export function updateTransaction(
  transactionId: string,
  payload: TransactionPayload,
): Promise<Transaction> {
  return request<Transaction>(`/transactions/${transactionId}`, {
    method: "PUT",
    body: buildTransactionFormData(payload),
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  await request<{ message: string }>(`/transactions/${transactionId}`, {
    method: "DELETE",
  });
}

/**
 * Abre o comprovante em uma nova aba. O arquivo fica no banco e a rota exige o
 * token JWT, então ele é baixado com `Authorization` e aberto como blob (um
 * link simples não enviaria o token).
 */
export async function openReceipt(receipt: TransactionReceipt): Promise<void> {
  const token = localStorage.getItem("access_token");

  if (!token) {
    window.location.replace("/login");
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  // A aba é aberta já no clique para não ser bloqueada como pop-up.
  const receiptWindow = window.open("", "_blank");

  try {
    const response = await fetch(`${API_URL}${receipt.url}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.location.replace("/login");
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    if (!response.ok) {
      throw new Error("Não foi possível abrir o comprovante.");
    }

    const blobUrl = URL.createObjectURL(await response.blob());

    if (receiptWindow) {
      receiptWindow.location.href = blobUrl;
    } else {
      window.location.href = blobUrl;
    }

    // Libera a memória depois que a aba já carregou o arquivo.
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
  } catch (error) {
    receiptWindow?.close();
    throw error;
  }
}
