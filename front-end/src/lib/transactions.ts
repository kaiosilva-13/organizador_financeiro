import type {
  Transaction,
  TransactionCategory,
  TransactionFilterValues,
  TransactionReceipt,
} from "../types/transaction";

/** Categorias iniciais exibidas enquanto a API de categorias não está disponível. */
export const DEFAULT_CATEGORIES: TransactionCategory[] = [
  { id: "category-salary", name: "Salário", color: "#16A34A" },
  { id: "category-freelance", name: "Freelance", color: "#0891B2" },
  { id: "category-housing", name: "Moradia", color: "#2563EB" },
  { id: "category-food", name: "Alimentação", color: "#EA580C" },
  { id: "category-transport", name: "Transporte", color: "#7C3AED" },
  { id: "category-health", name: "Saúde", color: "#0D9488" },
  { id: "category-leisure", name: "Lazer", color: "#DB2777" },
  { id: "category-education", name: "Educação", color: "#CA8A04" },
  { id: "category-other", name: "Outros", color: "#475569" },
];

/** Paleta usada no cadastro de uma nova categoria. */
export const CATEGORY_COLORS = [
  "#4F26E9",
  "#2563EB",
  "#0891B2",
  "#0D9488",
  "#16A34A",
  "#CA8A04",
  "#EA580C",
  "#DB2777",
  "#7C3AED",
  "#475569",
];

export const EMPTY_TRANSACTION_FILTERS: TransactionFilterValues = {
  search: "",
  startDate: "",
  endDate: "",
  minAmount: "",
  maxAmount: "",
  categoryId: "",
};

/**
 * PDF mínimo usado apenas para demonstrar o link de comprovante no protótipo.
 * A URL em `data:` não depende de rede e pode ser aberta em outra aba.
 */
const DEMO_RECEIPT_BASE64 =
  "JVBERi0xLjQKMSAwIG9iago8PCAvVHlwZSAvQ2F0YWxvZyAvUGFnZXMgMiAwIFIgPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL1BhZ2VzIC9LaWRzIFszIDAgUl0gL0NvdW50IDEgPj4KZW5kb2JqCjMgMCBvYmoKPDwgL1R5cGUgL1BhZ2UgL1BhcmVudCAyIDAgUiAvTWVkaWFCb3ggWzAgMCA1OTUgODQyXSAvUmVzb3VyY2VzIDw8IC9Gb250IDw8IC9GMSA1IDAgUiA+PiA+PiAvQ29udGVudHMgNCAwIFIgPj4KZW5kb2JqCjQgMCBvYmoKPDwgL0xlbmd0aCAxNDMgPj4Kc3RyZWFtCkJUCi9GMSAyMCBUZgo3MiA3NjAgVGQKKENvbXByb3ZhbnRlIGRlbW9uc3RyYXRpdm8gLSBPcmdhbml6YWUpIFRqCi9GMSAxMSBUZgowIC0yOCBUZAooRG9jdW1lbnRvIGdlcmFkbyBhcGVuYXMgcGFyYSBmaW5zIGRlIGRlbW9uc3RyYWNhby4pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKNSAwIG9iago8PCAvVHlwZSAvRm9udCAvU3VidHlwZSAvVHlwZTEgL0Jhc2VGb250IC9IZWx2ZXRpY2EgPj4KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0MSAwMDAwMCBuIAowMDAwMDAwNDM1IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgNiAvUm9vdCAxIDAgUiA+PgpzdGFydHhyZWYKNTA1CiUlRU9GCg==";

export const DEMO_RECEIPT: TransactionReceipt = {
  name: "comprovante-demonstracao.pdf",
  url: `data:application/pdf;base64,${DEMO_RECEIPT_BASE64}`,
  mimeType: "application/pdf",
  size: 681,
};

/**
 * Registros de demonstração usados enquanto o endpoint de movimentações não
 * existe. São vinculados à primeira conta carregada e podem ser removidos
 * normalmente pelo usuário.
 */
export function buildDemoTransactions(accountId: string): Transaction[] {
  return [
    {
      id: "demo-salary",
      accountId,
      title: "Salário",
      description: "Pagamento mensal da empresa",
      amount: 5850,
      type: "income",
      categoryId: "category-salary",
      date: "2026-10-05",
      receipt: DEMO_RECEIPT,
    },
    {
      id: "demo-rent",
      accountId,
      title: "Aluguel",
      description: "Aluguel do apartamento",
      amount: 1500,
      type: "expense",
      categoryId: "category-housing",
      date: "2026-10-07",
      receipt: null,
    },
    {
      id: "demo-market",
      accountId,
      title: "Supermercado",
      description: "Compras do mês",
      amount: 742.35,
      type: "expense",
      categoryId: "category-food",
      date: "2026-10-12",
      receipt: DEMO_RECEIPT,
    },
    {
      id: "demo-freelance",
      accountId,
      title: "Freelance",
      description: "Projeto de design",
      amount: 1800,
      type: "income",
      categoryId: "category-freelance",
      date: "2026-10-16",
      receipt: null,
    },
    {
      id: "demo-fuel",
      accountId,
      title: "Combustível",
      description: "Abastecimento do carro",
      amount: 230,
      type: "expense",
      categoryId: "category-transport",
      date: "2026-10-21",
      receipt: null,
    },
    {
      id: "demo-cinema",
      accountId,
      title: "Cinema",
      description: "Sessão de domingo",
      amount: 78.9,
      type: "expense",
      categoryId: "category-leisure",
      date: "2026-10-25",
      receipt: null,
    },
  ];
}

export function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Converte `YYYY-MM-DD` para o formato brasileiro `DD/MM/YYYY`. */
export function formatTransactionDate(date: string): string {
  if (!date) {
    return "—";
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

/**
 * Interpreta o valor digitado nos filtros aceitando vírgula ou ponto decimal.
 * Retorna `null` quando o campo está vazio para não restringir a busca.
 */
export function parseFilterAmount(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/** Rótulo curto do tipo de comprovante exibido na tabela. */
export function getReceiptLabel(receipt: TransactionReceipt): string {
  if (receipt.mimeType === "application/pdf") {
    return "PDF";
  }

  if (receipt.mimeType === "image/jpeg") {
    return "JPG";
  }

  if (receipt.mimeType === "image/png") {
    return "PNG";
  }

  return "Arquivo";
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) {
    return "";
  }

  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Ordena da movimentação mais recente para a mais antiga. */
export function sortTransactionsByDate(
  transactions: Transaction[],
): Transaction[] {
  return [...transactions].sort((first, second) =>
    second.date.localeCompare(first.date),
  );
}
