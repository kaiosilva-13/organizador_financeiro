const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata um valor numérico para o padrão monetário brasileiro (R$). */
export function formatCurrency(value: number): string {
  return brlFormatter.format(Number.isFinite(value) ? value : 0);
}

/**
 * Converte o texto de um input monetário em número.
 *
 * O campo trabalha com centavos: "R$ 1.250,00" vira 1250. Dessa forma o
 * usuário digita apenas números e a máscara é aplicada automaticamente.
 */
export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/\D/g, "");

  return digits ? Number(digits) / 100 : 0;
}
