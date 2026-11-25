import { API_URL } from "../services/api";
import type {
  InstallmentPaymentInput,
  Purchase,
  PurchaseFormInput,
} from "../types/purchase";
export type RegisteredInstallmentPayment = {
  /** Compra já atualizada (valor pago/restante e parcela marcada como paga). */
  purchase: Purchase;
  installmentId: string;
  transactionId: string;
  accountId: string;
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

export function fetchPurchases(): Promise<Purchase[]> {
  return request<Purchase[]>("/purchases");
}

/** O servidor grava em `controle_compras` e devolve o cronograma calculado. */
export function createPurchase(input: PurchaseFormInput): Promise<Purchase> {
  return request<Purchase>("/purchases", {
    method: "POST",
    body: {
      name: input.name,
      description: input.description,
      totalAmount: input.totalAmount,
      startDate: input.startDate,
      endDate: input.endDate,
    },
  });
}

/**
 * Paga a parcela: o servidor atualiza `valor_pago_acumulado`, debita a conta e
 * cria a despesa (categoria "Compra Parcelada") na mesma transação.
 */
export function payPurchaseInstallment(
  purchaseId: string,
  installmentId: string,
  input: InstallmentPaymentInput,
): Promise<RegisteredInstallmentPayment> {
  const formData = new FormData();

  formData.append("accountId", input.accountId);
  formData.append("date", input.paidAt);

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

  return request<RegisteredInstallmentPayment>(
    `/purchases/${purchaseId}/installments/${installmentId}/pay`,
    { method: "POST", body: formData },
  );
}

/** Remove a compra; as movimentações já registradas são mantidas. */
export async function deletePurchase(purchaseId: string): Promise<void> {
  await request<{ message: string }>(`/purchases/${purchaseId}`, {
    method: "DELETE",
  });
}
