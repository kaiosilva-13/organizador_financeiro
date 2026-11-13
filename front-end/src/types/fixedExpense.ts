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
 *
 * ---------------------------------------------------------------------------
 * Pontos de integração com o banco de dados
 * ---------------------------------------------------------------------------
 * Estrutura relacional sugerida:
 *
 * fixed_expenses
 * - id                UUID PK
 * - user_id           UUID FK -> users(id) ON DELETE CASCADE
 * - title             VARCHAR(120) NOT NULL
 * - estimated_amount  NUMERIC(12,2) NOT NULL CHECK (estimated_amount > 0)
 * - due_day           SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31)
 * - is_active         BOOLEAN NOT NULL DEFAULT TRUE
 * - category_id       UUID FK -> categories(id) ON DELETE RESTRICT
 * - created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *
 * fixed_expense_payments
 * - id                UUID PK
 * - fixed_expense_id  UUID FK -> fixed_expenses(id) ON DELETE RESTRICT
 * - account_id        UUID FK -> accounts(id) ON DELETE RESTRICT
 * - transaction_id    UUID NULL FK -> movimentacao(id) ON DELETE SET NULL
 * - paid_at           DATE NOT NULL
 * - amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0)
 * - created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
 *
 * O comprovante não deve ser duplicado em `fixed_expense_payments`: ele já é
 * gravado em `movimentacao.comprovante_dados` por `POST /transactions` e lido
 * por `GET /transactions/:id/receipt`. O histórico do gasto fixo deve exibir o
 * comprovante a partir da movimentação vinculada.
 *
 * TODO [BACKEND]:
 * - Em `POST /api/fixed-expenses/:id/payments`, persistir o pagamento,
 *   criar a movimentação de despesa, debitar `amount` do saldo da conta e
 *   gravar o comprovante na mesma transação de banco de dados. O front-end
 *   chama `POST /transactions` nesta primeira versão, mas o endpoint dedicado
 *   deve ser atômico para evitar pagamento sem movimentação (ou vice-versa).
 * - Criar o vínculo `fixed_expense_payments.transaction_id` com
 *   `movimentacao.id`. Ao excluir a movimentação, usar `ON DELETE SET NULL`
 *   para preservar o histórico do gasto fixo sem manter uma referência órfã.
 * - Ao editar um pagamento, atualizar também a movimentação vinculada
 *   (`titulo`, `valor`, `data_transacao`, `id_conta_financeira` e
 *   `comprovante_dados`) e recalcular o saldo da conta antiga e da nova na
 *   mesma transação SQL, para que Movimentações e Gastos Fixos não divirjam.
 * - Ao excluir um pagamento, definir explicitamente se a movimentação será
 *   removida ou estornada; em ambos os casos, recalcular
 *   `conta_financeira.saldo_atual` na mesma transação SQL.
 * - Criar índice único em (fixed_expense_id, DATE_TRUNC('month', paid_at))
 *   para impedir dois pagamentos do mesmo gasto no mesmo mês.
 * - Aplicar `user_id` em todas as consultas para garantir isolamento entre
 *   usuários, inclusive no histórico e nos filtros de data.
 * - Em `GET /api/fixed-expenses/:id/payments`, aceitar `startDate` e `endDate`
 *   (`YYYY-MM-DD`) e filtrar por `paid_at` no banco, não em memória.
 * - Definir a política ao excluir um gasto fixo: recomenda-se preservar as
 *   movimentações financeiras já realizadas e remover apenas os vínculos
 *   (`fixed_expense_id`/`transaction_id`), nunca apagar o histórico financeiro.
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
  /**
   * Identificador da movimentação de despesa criada na conta utilizada.
   *
   * TODO [BACKEND]: Persistir o vínculo no banco (`transaction_id`) para que
   * edição/exclusão da movimentação possa refletir no histórico do gasto fixo.
   */
  transactionId: string | null;
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
