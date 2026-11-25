/**
 * Modelos da seção de Controle de Compras.
 *
 * O formato abaixo é o contrato que o front-end espera receber de
 * `GET /api/purchases` (e devolver em `POST /api/purchases`). Datas trafegam
 * como `YYYY-MM-DD` para não sofrerem deslocamento de fuso horário e valores
 * monetários como número (ex.: 4200).
 *
 * ---------------------------------------------------------------------------
 * Pontos de integração com o banco de dados
 * ---------------------------------------------------------------------------
 * Estrutura relacional sugerida:
 *
 * purchases
 * - id                UUID PK
 * - user_id           UUID FK -> users(id) ON DELETE CASCADE
 * - name              VARCHAR(160) NOT NULL
 * - description       VARCHAR(255) NULL
 * - total_amount      NUMERIC(12,2) NOT NULL CHECK (total_amount > 0)
 * - start_date        DATE NOT NULL
 * - end_date          DATE NOT NULL CHECK (end_date >= start_date)
 * - created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *
 * purchase_installments
 * - id                UUID PK
 * - purchase_id       UUID FK -> purchases(id) ON DELETE CASCADE
 * - number            SMALLINT NOT NULL
 * - reference_month   DATE NOT NULL (primeiro dia do mês de referência)
 * - due_date          DATE NOT NULL
 * - amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0)
 * - status            VARCHAR(16) NOT NULL DEFAULT 'PENDING'
 * - paid_at           DATE NULL
 * - account_id        UUID NULL FK -> accounts(id) ON DELETE SET NULL
 * - transaction_id    UUID NULL FK -> movimentacao(id) ON DELETE SET NULL
 * - receipt_name      VARCHAR(255) NULL
 * - created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *
 * TODO [BACKEND]: Criar índice único em (purchase_id, number) e garantir que
 * a soma das parcelas seja exatamente igual a `total_amount` (distribuindo os
 * centavos restantes nas primeiras parcelas).
 */

/** Status possíveis de uma prestação. */
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
  /** Nome do comprovante anexado, quando enviado. */
  receiptName: string | null;
};

/** Compra parcelada cadastrada pelo usuário. */
export type Purchase = {
  id: string;
  name: string;
  description: string;
  totalAmount: number;
  /** Início dos pagamentos (`YYYY-MM-DD`). */
  startDate: string;
  /** Fim previsto (`YYYY-MM-DD`). */
  endDate: string;
  createdAt: string;
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
