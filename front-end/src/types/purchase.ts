
export type PurchaseInstallmentStatus = "pending" | "paid";

/** Uma prestação mensal do cronograma da compra. */
export type PurchaseInstallment = {
  id: string;
  /** Número sequencial da parcela (1, 2, 3...). */
  number: number;
  /** Mês de referência no formato `YYYY-MM` (ex.: `2026-12`). */
  referenceMonth: string;
  /** Vencimento da parcela no formato `YYYY-MM-DD`. */
  dueDate: string;
  amount: number;
  status: PurchaseInstallmentStatus;
  /**
   * Data em que o pagamento foi registrado (`YYYY-MM-DD`), quando pago.
   * Corresponde ao dia atual no momento do pagamento, não ao vencimento.
   */
  paidAt: string | null;
  /** Conta usada no pagamento, quando pago. */
  accountId: string | null;
  /** Nome da conta no momento do pagamento (snapshot do histórico). */
  accountName: string | null;
  /** Movimentação (despesa) gerada pelo pagamento, quando pago. */
  transactionId?: string | null;
  /** Nome do comprovante anexado, quando enviado. */
  receiptName: string | null;
  /** Rota (relativa à API) para baixar o comprovante, quando existir. */
  receipt?: { url: string } | null;
};

/** Compra parcelada cadastrada pelo usuário. */
export type Purchase = {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  /** Soma das parcelas já pagas (`valor_pago_acumulado`). */
  paidAmount: number;
  /** Valor que falta pagar (`valor_restante`). */
  remainingAmount: number;
  /** Início dos pagamentos (`YYYY-MM-DD`). */
  startDate: string;
  /** Fim previsto (`YYYY-MM-DD`). */
  endDate: string;
  installments: PurchaseInstallment[];
};

/** Dados editáveis no cadastro de uma nova compra. */
export type PurchaseFormInput = {
  name: string;
  description: string;
  totalAmount: number;
  startDate: string;
  endDate: string;
};

/** Conta, comprovante e data efetiva do pagamento de uma parcela. */
export type InstallmentPaymentInput = {
  accountId: string;
  receiptFile: File | null;
  /** Data atual em que o pagamento foi confirmado (`YYYY-MM-DD`). */
  paidAt: string;
};
