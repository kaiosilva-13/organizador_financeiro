/**
 * Modelos da seção de Gastos Fixos.
 *
 * O formato abaixo é o contrato que o front-end espera receber do back-end.
 * Enquanto as rotas de gastos fixos não existem, os dados são mantidos no
 * `localStorage` por `lib/fixedExpenses.ts` para permitir testar o fluxo
 * completo no navegador.
 *
 * TODO [BACKEND]: Padronizar a resposta de `/api/fixed-expenses` neste formato.
 * `dueDay` deve ser um inteiro entre 1 e 31 e `payments[].paidAt` deve trafegar
 * como `YYYY-MM-DD` para não sofrer deslocamento de fuso horário.
 */

/** Dados editáveis no cadastro de um gasto fixo. */
export type FixedExpenseFormInput = {
  title: string;
  estimatedAmount: number;
  /** Dia do mês em que o gasto vence (1 a 31). */
  dueDay: number;
};

/** Conta e comprovante escolhidos ao registrar o pagamento mensal. */
export type FixedExpensePaymentInput = {
  accountId: string;
  receiptFile: File | null;
};

/** Filtro aplicado ao histórico de pagamentos. */
export type FixedExpenseHistoryFilters = {
  startDate: string;
  endDate: string;
};

/** Um pagamento mensal já realizado para o gasto fixo. */
export type FixedExpensePayment = {
  id: string;
  /** Data do pagamento no formato ISO `YYYY-MM-DD`. */
  paidAt: string;
  amount: number;
  accountId: string;
  /**
   * Nome da conta no momento do pagamento. O snapshot preserva o histórico
   * mesmo se a conta for renomeada ou removida futuramente.
   */
  accountName: string;
  /** Nome do arquivo de comprovante, quando enviado. */
  receiptName: string | null;
};

/** Gasto fixo recorrente cadastrado pelo usuário. */
export type FixedExpense = {
  id: string;
  title: string;
  estimatedAmount: number;
  dueDay: number;
  isActive: boolean;
  /**
   * Categoria usada no registro do pagamento. Gastos fixos usam uma categoria
   * própria, mas o campo já existe para permitir categorias personalizadas no
   * futuro sem quebrar o contrato atual.
   */
  category: string;
  createdAt: string;
  payments: FixedExpensePayment[];
};
