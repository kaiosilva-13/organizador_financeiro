import type { TransactionCategory } from "../types/transaction";
import { DEFAULT_CATEGORIES } from "./transactions";

/**
 * Persistência temporária das categorias criadas manualmente.
 *
 * TODO [BACKEND]: Substituir por GET/POST /categories. Apenas as categorias
 * personalizadas são salvas; as padrão continuam vindo de `DEFAULT_CATEGORIES`.
 */
const CATEGORIES_STORAGE_KEY = "organizae:custom-categories:v1";

function normalizeCategory(value: unknown): TransactionCategory | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const category = value as Record<string, unknown>;

  if (
    typeof category.id !== "string" ||
    typeof category.name !== "string" ||
    typeof category.color !== "string"
  ) {
    return null;
  }

  return {
    id: category.id,
    name: category.name,
    color: category.color,
  };
}

export function loadStoredCategories(): TransactionCategory[] {
  try {
    const storedValue = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const customCategories = storedValue
      ? (JSON.parse(storedValue) as unknown)
      : [];

    if (!Array.isArray(customCategories)) {
      return [...DEFAULT_CATEGORIES];
    }

    const defaultIds = new Set(
      DEFAULT_CATEGORIES.map((category) => category.id),
    );
    const defaultNames = new Set(
      DEFAULT_CATEGORIES.map((category) =>
        category.name.toLocaleLowerCase("pt-BR"),
      ),
    );

    const validCustomCategories = customCategories
      .map(normalizeCategory)
      .filter(
        (category): category is TransactionCategory =>
          category !== null &&
          !defaultIds.has(category.id) &&
          !defaultNames.has(category.name.toLocaleLowerCase("pt-BR")),
      );

    return [...DEFAULT_CATEGORIES, ...validCustomCategories];
  } catch (error) {
    console.error("Erro ao carregar categorias locais:", error);
    return [...DEFAULT_CATEGORIES];
  }
}

export function saveStoredCustomCategories(
  categories: TransactionCategory[],
): void {
  const defaultIds = new Set(DEFAULT_CATEGORIES.map((category) => category.id));
  const customCategories = categories.filter(
    (category) => !defaultIds.has(category.id),
  );

  try {
    localStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(customCategories),
    );
  } catch (error) {
    console.error("Não foi possível salvar as categorias localmente:", error);
  }
}
