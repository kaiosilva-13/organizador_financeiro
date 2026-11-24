import type {
  FixedExpense,
  FixedExpenseFormInput,
  FixedExpenseHistoryFilters,
  FixedExpensePayment,
} from "../types/fixedExpense";
import { API_URL } from '../services/api';

/**
 * Chamadas do módulo de Gastos Fixos ao back-end (todas autenticadas).
 *
 * - `GET    /fixed-expenses`
 * - `POST   /fixed-expenses`
 * - `PUT    /fixed-expenses/:id`
 * - `PATCH  /fixed-expenses/:id/status`
 * - `DELETE /fixed-expenses/:id`
 * - `POST   /fixed-expenses/:id/payments` (multipart/form-data)
 * - `GET    /fixed-expenses/:id/payments?startDate=&endDate=`
 */

export type FixedExpensePaymentRequest = {
  accountId: string;
  receiptFile: File | null;
  /** `YYYY-MM-DD`. Se omitida, o servidor usa a data de hoje. */
  date?: string;
};

export type RegisteredFixedExpensePayment = {
  payment: FixedExpensePayment;
  /** Saldo da conta já com o débito do pagamento. */
  accountBalance: number;
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

export function fetchFixedExpenses(): Promise<FixedExpense[]> {
  return request<FixedExpense[]>("/fixed-expenses");
}

export function createFixedExpense(
  input: FixedExpenseFormInput,
): Promise<FixedExpense> {
  return request<FixedExpense>("/fixed-expenses", {
    method: "POST",
    body: input,
  });
}

export function updateFixedExpense(
  expenseId: string,
  input: FixedExpenseFormInput,
): Promise<FixedExpense> {
  return request<FixedExpense>(`/fixed-expenses/${expenseId}`, {
    method: "PUT",
    body: input,
  });
}

/** Ativar/desativar não apaga nada: só troca o status no banco. */
export function updateFixedExpenseStatus(
  expenseId: string,
  isActive: boolean,
): Promise<FixedExpense> {
  return request<FixedExpense>(`/fixed-expenses/${expenseId}/status`, {
    method: "PATCH",
    body: { isActive },
  });
}

export async function deleteFixedExpense(expenseId: string): Promise<void> {
  await request<{ message: string }>(`/fixed-expenses/${expenseId}`, {
    method: "DELETE",
  });
}

/**
 * Registra o pagamento do mês: o servidor debita a conta e cria a movimentação
 * de despesa (título do gasto + categoria "Gastos Fixos") na mesma transação.
 */
export function registerFixedExpensePayment(
  expenseId: string,
  input: FixedExpensePaymentRequest,
): Promise<RegisteredFixedExpensePayment> {
  const formData = new FormData();

  formData.append("accountId", input.accountId);

  if (input.date) {
    formData.append("date", input.date);
  }

  if (input.receiptFile) {
    const file = input.receiptFile;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const mimeType = file.type || RECEIPT_MIME_BY_EXTENSION[extension] || "";

    // Alguns navegadores deixam o `type` vazio; o servidor confere o MIME type.
    formData.append(
      "receipt",
      file.type || !mimeType
        ? file
        : new File([file], file.name, { type: mimeType }),
      file.name,
    );
  }

  return request<RegisteredFixedExpensePayment>(
    `/fixed-expenses/${expenseId}/payments`,
    { method: "POST", body: formData },
  );
}

/** Histórico do gasto fixo; o filtro de datas é aplicado no banco de dados. */
export function fetchFixedExpensePayments(
  expenseId: string,
  filters: FixedExpenseHistoryFilters,
): Promise<FixedExpensePayment[]> {
  const query = new URLSearchParams();

  if (filters.startDate) {
    query.set("startDate", filters.startDate);
  }

  if (filters.endDate) {
    query.set("endDate", filters.endDate);
  }

  const queryString = query.toString();

  return request<FixedExpensePayment[]>(
    `/fixed-expenses/${expenseId}/payments${queryString ? `?${queryString}` : ""}`,
  );
}
