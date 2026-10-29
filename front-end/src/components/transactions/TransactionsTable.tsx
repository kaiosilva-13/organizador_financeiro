import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  PencilLine,
  Plus,
  ReceiptText,
  RotateCcw,
  SearchX,
  Trash2,
} from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import { getReceiptOpenUrl } from "../../lib/receipts";
import {
  formatTransactionDate,
  getReceiptLabel,
} from "../../lib/transactions";
import type {
  Transaction,
  TransactionCategory,
  TransactionReceipt,
} from "../../types/transaction";
import TransactionsEmptyState from "./TransactionsEmptyState";

type TransactionsTableProps = {
  transactions: Transaction[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  categoriesById: Map<string, TransactionCategory>;
  hasAnyTransactions: boolean;
  hasActiveFilters: boolean;
  onPageChange: (page: number) => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onClearFilters: () => void;
  onCreate?: () => void;
};

type PaginationItem = number | "ellipsis";

function getPaginationItems(
  currentPage: number,
  totalPages: number,
): PaginationItem[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      "ellipsis",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "ellipsis",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "ellipsis",
    totalPages,
  ];
}

function CategoryBadge({ category }: { category: TransactionCategory }) {
  return (
    <span
      className="inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
      style={{
        color: category.color,
        backgroundColor: `${category.color}12`,
        borderColor: `${category.color}30`,
      }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <span className="truncate">{category.name}</span>
    </span>
  );
}

function ReceiptLink({ receipt }: { receipt: TransactionReceipt | null }) {
  if (!receipt) {
    return (
      <span
        className="text-sm text-slate-400"
        title="Nenhum comprovante anexado"
      >
        —
      </span>
    );
  }

  return (
    <a
      href={getReceiptOpenUrl(receipt)}
      target="_blank"
      rel="noreferrer"
      title={`Abrir ${receipt.name}`}
      className="inline-flex items-center gap-1.5 rounded-md text-xs font-semibold text-[#4F26E9] transition hover:text-[#411DCB] hover:underline"
    >
      <FileText size={15} aria-hidden="true" />
      {getReceiptLabel(receipt)}
      <ExternalLink size={12} aria-hidden="true" />
    </a>
  );
}

const actionButtonClasses =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none";

function RowActions({
  transaction,
  onEdit,
  onDelete,
}: {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(transaction)}
          aria-label={`Editar movimentação ${transaction.title}`}
          title="Editar movimentação"
          className={`${actionButtonClasses} hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F26E9] focus-visible:ring-[#4F26E9]`}
        >
          <PencilLine size={16} aria-hidden="true" />
        </button>
      )}

      <button
        type="button"
        onClick={() => onDelete(transaction)}
        aria-label={`Excluir movimentação ${transaction.title}`}
        title="Excluir movimentação"
        className={`${actionButtonClasses} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

function TransactionsTable({
  transactions,
  totalItems,
  currentPage,
  totalPages,
  pageSize,
  categoriesById,
  hasAnyTransactions,
  hasActiveFilters,
  onPageChange,
  onEdit,
  onDelete,
  onClearFilters,
  onCreate,
}: TransactionsTableProps) {
  const paginationItems = getPaginationItems(currentPage, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  const noun = totalItems === 1 ? "movimentação" : "movimentações";
  const countLabel =
    totalPages <= 1
      ? `Exibindo ${totalItems} de ${totalItems} ${noun}`
      : startItem === endItem
        ? `Exibindo ${startItem} de ${totalItems} ${noun}`
        : `Exibindo ${startItem}–${endItem} de ${totalItems} ${noun}`;

  const getCategory = (transaction: Transaction) =>
    categoriesById.get(transaction.categoryId) ?? {
      id: transaction.categoryId,
      name: "Sem categoria",
      color: "#64748B",
    };

  const showNoResults = totalItems === 0 && hasAnyTransactions;
  const showEmptyState = totalItems === 0 && !showNoResults;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Histórico de movimentações
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {hasActiveFilters
              ? "Resultados conforme os filtros aplicados"
              : "Todas as receitas e despesas da conta selecionada"}
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4F26E9]">
          {totalItems} {noun}
        </span>
      </header>

      {showNoResults && (
        <TransactionsEmptyState
          compact
          icon={SearchX}
          title="Nenhuma movimentação encontrada para os filtros aplicados."
          description="Tente ajustar a busca, o período, os valores ou a categoria para encontrar o lançamento desejado."
          actionLabel="Limpar filtros"
          actionIcon={RotateCcw}
          actionVariant="outline"
          onAction={onClearFilters}
        />
      )}

      {showEmptyState && (
        <TransactionsEmptyState
          compact
          icon={ReceiptText}
          title="Nenhuma movimentação cadastrada"
          description="Registre sua primeira receita ou despesa para começar a acompanhar o fluxo financeiro desta conta."
          actionLabel={onCreate ? "Cadastrar primeira movimentação" : undefined}
          actionIcon={Plus}
          onAction={onCreate}
        />
      )}

      {totalItems > 0 && (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[980px] border-collapse text-left">
              <caption className="sr-only">
                Lista de movimentações da conta selecionada
              </caption>

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th
                    scope="col"
                    className="px-5 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Título
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Descrição
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Valor
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Categoria
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Data de transação
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Comprovante
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-3 text-right text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {transactions.map((transaction) => {
                  const isIncome = transaction.type === "income";

                  return (
                    <tr
                      key={transaction.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-rose-50 text-rose-600"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft
                                size={16}
                                aria-hidden="true"
                              />
                            ) : (
                              <ArrowUpRight size={16} aria-hidden="true" />
                            )}
                          </span>

                          <span
                            className="max-w-[180px] truncate text-sm font-semibold text-slate-900"
                            title={transaction.title}
                          >
                            {transaction.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="block max-w-[200px] truncate text-sm text-slate-500"
                          title={transaction.description || undefined}
                        >
                          {transaction.description || "—"}
                        </span>
                      </td>

                      <td
                        className={`px-4 py-4 text-right text-sm font-bold whitespace-nowrap ${
                          isIncome ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                      </td>

                      <td className="px-4 py-4">
                        <CategoryBadge category={getCategory(transaction)} />
                      </td>

                      <td className="px-4 py-4 text-sm whitespace-nowrap text-slate-600">
                        {formatTransactionDate(transaction.date)}
                      </td>

                      <td className="px-4 py-4">
                        <ReceiptLink receipt={transaction.receipt} />
                      </td>

                      <td className="px-5 py-4">
                        <RowActions
                          transaction={transaction}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 md:hidden">
            {transactions.map((transaction) => {
              const isIncome = transaction.type === "income";

              return (
                <li key={transaction.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft size={16} aria-hidden="true" />
                        ) : (
                          <ArrowUpRight size={16} aria-hidden="true" />
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {transaction.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                          {transaction.description || "Sem descrição"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-sm font-bold whitespace-nowrap ${
                        isIncome ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 pl-11">
                    <CategoryBadge category={getCategory(transaction)} />

                    <span className="text-xs whitespace-nowrap text-slate-500">
                      {formatTransactionDate(transaction.date)}
                    </span>

                    <ReceiptLink receipt={transaction.receipt} />
                  </div>

                  <div className="mt-2 flex justify-end">
                    <RowActions
                      transaction={transaction}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      {totalItems > 0 && (
        <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">{countLabel}</p>

          <nav
            aria-label="Paginação das movimentações"
            className="flex flex-wrap items-center justify-center gap-1"
          >
            <button
              type="button"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Página anterior"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition hover:border-[#4F26E9] hover:text-[#4F26E9] disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:hover:border-slate-100 disabled:hover:text-slate-300"
            >
              <ChevronLeft size={15} aria-hidden="true" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {paginationItems.map((item, index) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  aria-hidden="true"
                  className="flex h-8 w-7 items-center justify-center text-xs text-slate-400"
                >
                  …
                </span>
              ) : (
                <button
                  key={item}
                  type="button"
                  onClick={() => onPageChange(item)}
                  aria-label={`Ir para a página ${item}`}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-md border px-2 text-xs font-semibold transition ${
                    item === currentPage
                      ? "border-[#4F26E9] bg-[#4F26E9] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-[#4F26E9] hover:text-[#4F26E9]"
                  }`}
                >
                  {item}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Próxima página"
              className="inline-flex h-8 items-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 transition hover:border-[#4F26E9] hover:text-[#4F26E9] disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:hover:border-slate-100 disabled:hover:text-slate-300"
            >
              <span className="hidden sm:inline">Próxima</span>
              <ChevronRight size={15} aria-hidden="true" />
            </button>
          </nav>
        </footer>
      )}
    </section>
  );
}

export default TransactionsTable;
