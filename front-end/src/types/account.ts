/**
 * Tipos de conta aceitos pelo cadastro.
 *
 * Esta lista é a fonte única de verdade para o front-end. Quando o back-end
 * expuser os tipos de conta, basta alimentar este módulo com a resposta da API
 * (ou trocar `ACCOUNT_TYPES` por um enum compartilhado).
 */
export const ACCOUNT_TYPES = [
  "Conta Corrente",
  "Dinheiro (Espécie)",
  "Cartão de Crédito",
  "Conta Poupança",
  "Investimentos / Corretora",
  "Vale-Alimentação / Vale-Refeição (VA/VR)",
  "Outras Contas",
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
};

/** Dados enviados pelo formulário antes da criação do `id`. */
export type NewAccountInput = Omit<Account, "id">;
