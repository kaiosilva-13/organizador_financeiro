import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock3,
  History,
  Info,
  PencilLine,
  Power,
  Trash2,
  Wallet,
} from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import {
  formatDueDay,
  getCurrentMonthLabel,
  isPaidThisMonth,
} from "../../lib/fixedExpenses";
import type { FixedExpense } from "../../types/fixedExpense";
import TransactionsEmptyState from "../transactions/TransactionsEmptyState";

type FixedExpensesTableProps = {
  expenses: FixedExpense[];
  onEdit: (expense: FixedExpense) => void;
  onDelete: (expense: FixedExpense) => void;
  onToggleStatus: (expense: FixedExpense) => void;
  onHistory: (expense: FixedExpense) => void;
  onPay: (expense: FixedExpense) => void;
};

type RowActionsProps = {
  expense: FixedExpense;
  isPaidThisMonth: boolean;
  onEdit: (expense: FixedExpense) => void;
  onDelete: (expense: FixedExpense) => void;
  onToggleStatus: (expense: FixedExpense) => void;
  onHistory: (expense: FixedExpense) => void;
  onPay: (expense: FixedExpense) => void;
};

const actionButtonClasses =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-slate-400 transition focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none";

function PayButton({
  expense,
  isPaid,
  onPay,
}: {
  expense: FixedExpense;
  isPaid: boolean;
  onPay: (expense: FixedExpense) => void;
}) {
  const isDisabled = !expense.isActive || isPaid;
  const disabledReason = !expense.isActive
    ? "Reative o gasto para registrar novos pagamentos."
    : "Este gasto já foi pago no mês atual.";

  return (
    <button
      type="button"
      onClick={() => onPay(expense)}
      disabled={isDisabled}
      title={isDisabled ? disabledReason : "Registrar pagamento mensal"}
      aria-label={
        isDisabled
          ? `${expense.title}: ${disabledReason}`
          : `Pagar gasto fixo ${expense.title}`
      }
      className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#4F26E9] px-3 text-xs font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100"
    >
      <CheckCircle2 size={14} aria-hidden="true" />
      Pagar
    </button>
  );
}

function RowActions({
  expense,
  isPaidThisMonth,
  onEdit,
  onDelete,
  onToggleStatus,
  onHistory,
  onPay,
}: RowActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onHistory(expense)}
        aria-label={`Ver histórico de pagamentos de ${expense.title}`}
        title="Ver histórico de pagamentos"
        className={`${actionButtonClasses} hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F26E9] focus-visible:ring-[#4F26E9]`}
      >
        <History size={16} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onEdit(expense)}
        aria-label={`Editar gasto fixo ${expense.title}`}
        title="Editar gasto fixo"
        className={`${actionButtonClasses} hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F26E9] focus-visible:ring-[#4F26E9]`}
      >
        <PencilLine size={16} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onToggleStatus(expense)}
        aria-label={`${expense.isActive ? "Inativar" : "Ativar"} gasto fixo ${expense.title}`}
        title={expense.isActive ? "Inativar gasto" : "Ativar gasto"}
        className={`${actionButtonClasses} ${
          expense.isActive
            ? "hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600 focus-visible:ring-amber-500"
            : "hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 focus-visible:ring-emerald-500"
        }`}
      >
        <Power size={16} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => onDelete(expense)}
        aria-label={`Excluir gasto fixo ${expense.title}`}
        title="Excluir gasto fixo"
        className={`${actionButtonClasses} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500`}
      >
        <Trash2 size={16} aria-hidden="true" />
      </button>

      <PayButton expense={expense} isPaid={isPaidThisMonth} onPay={onPay} />
    </div>
  );
}

function FixedExpensesTable({
  expenses,
  onEdit,
  onDelete,
  onToggleStatus,
  onHistory,
  onPay,
}: FixedExpensesTableProps) {
  const noun = expenses.length === 1 ? "gasto fixo" : "gastos fixos";
  const monthLabel = getCurrentMonthLabel();

  return (
    <section
      aria-labelledby="fixed-expenses-table-heading"
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F26E9]">
            <CalendarClock size={18} aria-hidden="true" />
          </span>

          <div>
            <h2
              id="fixed-expenses-table-heading"
              className="text-base font-bold text-slate-900"
            >
              Gastos fixos cadastrados
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Acompanhe vencimentos, status e pagamentos mensais.
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4F26E9]">
          {expenses.length} {noun}
        </span>
      </header>

      {expenses.length === 0 ? (
        <TransactionsEmptyState
          compact
          icon={CalendarDays}
          title="Nenhum gasto fixo adicionado até o momento"
          description="Cadastre suas despesas recorrentes para acompanhar os vencimentos e registrar os pagamentos de cada mês."
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <caption className="sr-only">
                Lista de gastos fixos cadastrados
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
                    className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Valor estimado
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Vencimento
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                  >
                    Status
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
                {expenses.map((expense) => {
                  const isPaid = isPaidThisMonth(expense);
                  const isActive = expense.isActive;

                  return (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              !isActive
                                ? "bg-slate-100 text-slate-400"
                                : isPaid
                                  ? "bg-emerald-50 text-emerald-600"
                                  : "bg-indigo-50 text-[#4F26E9]"
                            }`}
                          >
                            <Wallet size={17} aria-hidden="true" />
                          </span>

                          <div className="min-w-0">
                            <p
                              className="max-w-[240px] truncate text-sm font-semibold text-slate-900"
                              title={expense.title}
                            >
                              {expense.title}
                            </p>

                            {!isActive ? (
                              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                                <Clock3 size={12} aria-hidden="true" />
                                Gasto inativo
                              </p>
                            ) : isPaid ? (
                              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                                <CheckCircle2 size={12} aria-hidden="true" />
                                Pago em {monthLabel}
                              </p>
                            ) : (
                              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-600">
                                <Clock3 size={12} aria-hidden="true" />
                                Pagamento de {monthLabel} pendente
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-right text-sm font-bold whitespace-nowrap text-slate-900">
                        {formatCurrency(expense.estimatedAmount)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm whitespace-nowrap text-slate-600">
                          <CalendarDays
                            size={14}
                            aria-hidden="true"
                            className="text-slate-400"
                          />
                          {formatDueDay(expense.dueDay)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            isActive
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-slate-400"
                            }`}
                          />
                          {isActive ? "Ativo" : "Não Ativo"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <RowActions
                          expense={expense}
                          isPaidThisMonth={isPaid}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onToggleStatus={onToggleStatus}
                          onHistory={onHistory}
                          onPay={onPay}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-slate-100 lg:hidden">
            {expenses.map((expense) => {
              const isPaid = isPaidThisMonth(expense);

              return (
                <li key={expense.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          !expense.isActive
                            ? "bg-slate-100 text-slate-400"
                            : isPaid
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-indigo-50 text-[#4F26E9]"
                        }`}
                      >
                        <Wallet size={17} aria-hidden="true" />
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {expense.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatDueDay(expense.dueDay)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="text-sm font-bold whitespace-nowrap text-slate-900">
                        {formatCurrency(expense.estimatedAmount)}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                          expense.isActive
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full ${
                            expense.isActive ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {expense.isActive ? "Ativo" : "Não Ativo"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 pl-12">
                    {!expense.isActive ? (
                      <p className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock3 size={12} aria-hidden="true" />
                        Gasto inativo
                      </p>
                    ) : isPaid ? (
                      <p className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle2 size={12} aria-hidden="true" />
                        Pago em {monthLabel}
                      </p>
                    ) : (
                      <p className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Clock3 size={12} aria-hidden="true" />
                        Pagamento de {monthLabel} pendente
                      </p>
                    )}
                  </div>

                  <div className="mt-3">
                    <RowActions
                      expense={expense}
                      isPaidThisMonth={isPaid}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggleStatus={onToggleStatus}
                      onHistory={onHistory}
                      onPay={onPay}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <footer className="flex items-start gap-2 border-t border-slate-100 bg-slate-50/40 px-5 py-3.5">
        <Info
          size={15}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-slate-400"
        />
        <p className="text-xs leading-relaxed text-slate-500">
          Desative gastos que não são mais pagos para manter o histórico sem
          excluir o registro.
        </p>
      </footer>
    </section>
  );
}

export default FixedExpensesTable;
