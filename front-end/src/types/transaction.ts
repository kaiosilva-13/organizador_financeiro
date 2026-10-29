/**
 * Modelos da seção de Movimentações.
 *
 * Os nomes abaixo seguem o contrato que o front-end espera receber da API.
 * No back-end, `categoryId` deve referenciar a tabela de categorias e
 * `accountId` a conta financeira selecionada pelo usuário.
 *
 * TODO [BACKEND]: Padronizar a resposta das movimentações no formato abaixo.
 * `receipt.url` deve ser uma URL assinada do S3 (ou uma rota autenticada de
 * download), nunca o binário do arquivo. `date` deve trafegar como
 * `YYYY-MM-DD` para evitar deslocamento de fuso horário nos filtros.
 */

export type TransactionType = "income" | "expense";

export type TransactionCategory = {
  id: string;
  name: string;
  /** Cor em hexadecimal usada no badge da categoria. */
  color: string;
};

export type TransactionReceipt = {
  name: string;
  url: string;
  mimeType?: string;
  size?: number;
};

export type Transaction = {
  id: string;
  accountId: string;
  title: string;
  description: string;
  /** Valor sempre positivo. O sinal visual é definido por `type`. */
  amount: number;
  type: TransactionType;
  categoryId: string;
  /** Data no formato ISO `YYYY-MM-DD`. */
  date: string;
  receipt: TransactionReceipt | null;
};

export type TransactionFormInput = {
  title: string;
  description: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  newCategory?: {
    name: string;
    color: string;
  } | null;
  date: string;
  receiptFile?: File | null;
  removeReceipt?: boolean;
};

export type TransactionFilterValues = {
  search: string;
  startDate: string;
  endDate: string;
  minAmount: string;
  maxAmount: string;
  categoryId: string;
};
