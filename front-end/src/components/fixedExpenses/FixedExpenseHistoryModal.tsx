import { useId, useMemo, useState } from "react";

import {
  CalendarDays,
  Filter,
  History,
  Landmark,
  RotateCcw,
  SearchX,
} from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import {
  filterPaymentsByDate,
  formatFixedExpenseDate,
  sortPaymentsByDate,
} from "../../lib/fixedExpenses";
import type {
  FixedExpense,
  FixedExpenseHistoryFilters,
} from "../../types/fixedExpense";
import ModalShell from "../modals/ModalShell";
import TransactionsEmptyState from "../transactions/TransactionsEmptyState";

type FixedExpenseHistoryModalProps = {
  isOpen: boolean;
  expense: FixedExpense | null;
  onClose: () => void;
};

type FixedExpenseHistoryModalContentProps = Omit<
  FixedExpenseHistoryModalProps,
  "isOpen"
>;

const EMPTY_FILTERS: FixedExpenseHistoryFilters = {
  startDate: "",
  endDate: "",
};

const inputClasses =
  "h-11 w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9]";

function FixedExpenseHistoryModalContent({
  expense,
  onClose,
}: FixedExpenseHistoryModalContentProps) {
  const filterId = useId();
  const startDateId = `${filterId}-start`;
  const endDateId = `${filterId}-end`;

  const [draftFilters, setDraftFilters] =
    useState<FixedExpenseHistoryFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FixedExpenseHistoryFilters>(EMPTY_FILTERS);
  const [filterError, setFilterError] = useState("");

  const filteredPayments = useMemo(
    () =>
      sortPaymentsByDate(
        filterPaymentsByDate(expense?.payments ?? [], appliedFilters),
      ),
    [appliedFilters, expense?.payments],
  );

  const hasActiveFilters = Boolean(
    appliedFilters.startDate || appliedFilters.endDate,
  );
  const totalPaid = filteredPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );
  const paymentNoun = filteredPayments.length === 1 ? "pagamento" : "pagamentos";

  if (!expense) {
    return null;
  }

  function handleFilter() {
    if (
      draftFilters.startDate &&
      draftFilters.endDate &&
      draftFilters.startDate > draftFilters.endDate
    ) {
      setFilterError("A data inicial não pode ser posterior à data final.");
      return;
    }

    setFilterError("");

    // TODO [BACKEND]: Implementar filtros de data no banco de dados. Enviar
    // `startDate` e `endDate` em GET /api/fixed-expenses/:id/payments para que
    // a paginação e a soma do histórico sejam calculadas no servidor.
    setAppliedFilters({ ...draftFilters });
  }

  function handleClearFilter() {
    setDraftFilters({ ...EMPTY_FILTERS });
    setAppliedFilters({ ...EMPTY_FILTERS });
    setFilterError("");
  }

  return (
    <ModalShell
      isOpen
      size="xl"
      title="Histórico de pagamentos"
      description={`Pagamentos registrados para "${expense.title}".`}
      icon={<History size={20} aria-hidden="true" />}
      onClose={onClose}
    >
      <section
        aria-labelledby={`${filterId}-heading`}
        className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
      >
        <div className="flex items-center gap-2">
          <Filter
            size={15}
            aria-hidden="true"
            className="text-[#4F26E9]"
          />
          <h3
            id={`${filterId}-heading`}
            className="text-sm font-bold text-slate-900"
          >
            Filtrar por período
          </h3>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={startDateId}
              className="text-xs font-semibold text-slate-600"
            >
              Data inicial
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              />

              <input
                id={startDateId}
                type="date"
                value={draftFilters.startDate}
                max={draftFilters.endDate || undefined}
                onChange={(event) => {
                  setDraftFilters((currentFilters) => ({
                    ...currentFilters,
                    startDate: event.target.value,
                  }));
                  setFilterError("");
                }}
                className={`${inputClasses} pl-10`}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={endDateId}
              className="text-xs font-semibold text-slate-600"
            >
              Data final
            </label>

            <div className="relative">
              <CalendarDays
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
              />

              <input
                id={endDateId}
                type="date"
                value={draftFilters.endDate}
                min={draftFilters.startDate || undefined}
                onChange={(event) => {
                  setDraftFilters((currentFilters) => ({
                    ...currentFilters,
                    endDate: event.target.value,
                  }));
                  setFilterError("");
                }}
                className={`${inputClasses} pl-10`}
              />
            </div>
          </div>
        </div>

        {filterError && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-500">
            {filterError}
          </p>
        )}

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleClearFilter}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
          >
            <RotateCcw size={15} aria-hidden="true" />
            Limpar filtro
          </button>

          <button
            type="button"
            onClick={handleFilter}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-5 text-xs font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99]"
          >
            <Filter size={15} aria-hidden="true" />
            Filtrar
          </button>
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pagamentos registrados
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {hasActiveFilters
                ? "Resultados conforme o período selecionado"
                : "Histórico completo deste gasto fixo"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex w-fit items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4F26E9]">
              {filteredPayments.length} {paymentNoun}
            </span>

            {filteredPayments.length > 0 && (
              <span className="inline-flex w-fit items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Total: {formatCurrency(totalPaid)}
              </span>
            )}
          </div>
        </header>

        {filteredPayments.length === 0 ? (
          <TransactionsEmptyState
            compact
            icon={hasActiveFilters ? SearchX : History}
            title={
              hasActiveFilters
                ? "Nenhum pagamento encontrado no período informado."
                : "Nenhum pagamento registrado até o momento."
            }
            description={
              hasActiveFilters
                ? "Ajuste as datas inicial e final e clique em Filtrar para consultar outro período."
                : "Use o botão Pagar na listagem de gastos fixos para registrar o primeiro pagamento mensal."
            }
            actionLabel={hasActiveFilters ? "Limpar filtro" : undefined}
            actionIcon={hasActiveFilters ? RotateCcw : undefined}
            actionVariant="outline"
            onAction={hasActiveFilters ? handleClearFilter : undefined}
          />
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <caption className="sr-only">
                  Histórico de pagamentos do gasto fixo {expense.title}
                </caption>

                <thead className="bg-slate-50/80">
                  <tr className="border-b border-slate-100">
                    <th
                      scope="col"
                      className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                    >
                      Data do pagamento
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                    >
                      Valor pago
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-[11px] font-semibold tracking-[0.1em] text-slate-500 uppercase"
                    >
                      Conta utilizada
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-4 py-3.5 text-sm whitespace-nowrap text-slate-600">
                        {formatFixedExpenseDate(payment.paidAt)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-bold whitespace-nowrap text-slate-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F26E9]">
                            <Landmark size={14} aria-hidden="true" />
                          </span>
                          <span className="truncate text-sm text-slate-700">
                            {payment.accountName}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-slate-100 md:hidden">
              {filteredPayments.map((payment) => (
                <li key={payment.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                      {formatFixedExpenseDate(payment.paidAt)}
                    </span>

                    <span className="text-sm font-bold whitespace-nowrap text-slate-900">
                      {formatCurrency(payment.amount)}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
                    <Landmark
                      size={14}
                      aria-hidden="true"
                      className="text-[#4F26E9]"
                    />
                    <span className="truncate">{payment.accountName}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
        O histórico é preservado mesmo quando o gasto é inativado. A exclusão
        permanente do gasto também remove os pagamentos associados.
      </p>
    </ModalShell>
  );
}

function FixedExpenseHistoryModal({
  isOpen,
  expense,
  onClose,
}: FixedExpenseHistoryModalProps) {
  if (!isOpen || !expense) {
    return null;
  }

  return (
    <FixedExpenseHistoryModalContent
      key={expense.id}
      expense={expense}
      onClose={onClose}
    />
  );
}

export default FixedExpenseHistoryModal;
