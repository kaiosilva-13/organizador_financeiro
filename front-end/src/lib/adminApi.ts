import { API_URL } from '../services/api';
import type {
  AdminMetrics,
  AdminUser,
  AdminUsersResponse,
} from "../types/admin";

/**
 * Camada de acesso aos endpoints administrativos.
 *
 * Os endpoints abaixo ainda serão disponibilizados pelo back-end. A
 * normalização dos campos aceita tanto respostas em inglês (`name`,
 * `createdAt`) quanto em português (`nome`, `criadoEm`), reduzindo o
 * acoplamento com o formato final da API.
 */

const ADMIN_USERS_PATH = "/api/admin/users";
const ADMIN_METRICS_PATH = "/api/admin/metrics";

type UnknownRecord = Record<string, unknown>;

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  const data = (await response.json().catch(() => null)) as UnknownRecord | null;
  const message = data?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return typeof message === "string" ? message : fallbackMessage;
}

function toRecord(value: unknown): UnknownRecord {
  return value !== null && typeof value === "object"
    ? (value as UnknownRecord)
    : {};
}

function normalizeAdminUser(rawValue: unknown): AdminUser {
  const raw = toRecord(rawValue);

  return {
    id: String(raw.id ?? raw.userId ?? ""),
    name: String(raw.name ?? raw.nome ?? "Usuário sem nome"),
    email: String(raw.email ?? ""),
    createdAt: String(
      raw.createdAt ?? raw.criadoEm ?? raw.created_at ?? raw.created_em ?? "",
    ),
  };
}

function normalizeMetric(
  raw: UnknownRecord,
  keys: string[],
): number {
  for (const key of keys) {
    const value = raw[key];

    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim() !== "") {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

/**
 * GET /api/admin/users?page=&limit=
 *
 * O back-end deve retornar a lista paginada de usuários. Formatos aceitos:
 * - `{ items: [...], total: 6, page: 1, totalPages: 1 }`
 * - `{ users: [...], total: 6 }`
 * - `[...]` (lista simples, sem paginação)
 */
export async function fetchAdminUsers({
  page = 1,
  limit = 6,
}: {
  page?: number;
  limit?: number;
} = {}): Promise<AdminUsersResponse> {
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await fetch(`${API_URL}${ADMIN_USERS_PATH}?${query}`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Não foi possível carregar os usuários cadastrados.",
      ),
    );
  }

  const data: unknown = await response.json();
  const payload = Array.isArray(data) ? {} : toRecord(data);
  const rawItems = Array.isArray(data)
    ? data
    : Array.isArray(payload.items)
      ? payload.items
      : Array.isArray(payload.users)
        ? payload.users
        : [];

  const items = rawItems.map(normalizeAdminUser);
  const total = normalizeMetric(payload, ["total", "count", "totalItems"]);
  const resolvedTotal = total > 0 ? total : items.length;
  const serverTotalPages = normalizeMetric(payload, ["totalPages", "pages"]);

  return {
    items,
    total: resolvedTotal,
    page,
    totalPages:
      serverTotalPages > 0
        ? serverTotalPages
        : Math.max(1, Math.ceil(resolvedTotal / limit)),
  };
}

/**
 * GET /api/admin/metrics
 *
 * O back-end deve devolver as contagens reais do banco de dados. Formatos
 * aceitos: `{ users, accounts, transactions, fixedExpenses }` ou os mesmos
 * nomes em português (`usuarios`, `contas`, `movimentacoes`, `gastosFixos`).
 */
export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const response = await fetch(`${API_URL}${ADMIN_METRICS_PATH}`, {
    headers: {
      Accept: "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Não foi possível carregar os indicadores do sistema.",
      ),
    );
  }

  const data = toRecord(await response.json());

  return {
    users: normalizeMetric(data, ["users", "usuarios", "totalUsers"]),
    accounts: normalizeMetric(data, [
      "accounts",
      "contas",
      "totalAccounts",
      "financialAccounts",
    ]),
    transactions: normalizeMetric(data, [
      "transactions",
      "movimentacoes",
      "movimentações",
      "totalTransactions",
    ]),
    fixedExpenses: normalizeMetric(data, [
      "fixedExpenses",
      "gastosFixos",
      "fixed_expenses",
      "totalFixedExpenses",
    ]),
  };
}

/**
 * DELETE /api/admin/users/:id
 *
 * Remove definitivamente a conta do usuário. O back-end deve tratar em
 * cascata (ou anonimizar) os dados financeiros vinculados ao usuário e
 * invalidar sessões/tokens ativos.
 */
export async function deleteAdminUser(userId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}${ADMIN_USERS_PATH}/${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        ...getAuthHeaders(),
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Não foi possível excluir a conta do usuário.",
      ),
    );
  }
}
