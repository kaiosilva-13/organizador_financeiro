import { ArrowLeftRight, CalendarDays, Trash2 } from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import {
  formatPurchaseDate,
  getPaidAmount,
  getRemainingAmount,
} from "../../lib/purchases";
import type { Purchase } from "../../types/purchase";

type PurchaseSummaryCardProps = {
  purchase: Purchase;
  onDelete: () => void;
  onSwitch: () => void;
};

type MetricProps = {
  label: string;
  value: string;
  valueClassName?: string;
  withCalendar?: boolean;
};

function Metric({
  label,
  value,
  valueClassName = "text-slate-900",
  withCalendar = false,
}: MetricProps) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>

      {withCalendar ? (
        <dd className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-slate-800">
          <CalendarDays
            size={14}
            aria-hidden="true"
            className="shrink-0 text-slate-400"
          />
          {value}
        </dd>
      ) : (
        <dd
          className={`mt-1.5 text-lg font-bold tracking-tight whitespace-nowrap ${valueClassName}`}
        >
          {value}
        </dd>
      )}
    </div>
  );
}

/**
 * Card superior com os dados da compra selecionada, os indicadores financeiros
 * e as ações de alternância entre compras e exclusão.
 */
function PurchaseSummaryCard({
  purchase,
  onDelete,
  onSwitch,
}: PurchaseSummaryCardProps) {
  const paidAmount = getPaidAmount(purchase);
  const remainingAmount = getRemainingAmount(purchase);

  return (
    <section
      aria-labelledby="purchase-summary-heading"
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2
              id="purchase-summary-heading"
              className="text-lg font-bold tracking-tight text-slate-900"
            >
              {purchase.name}
            </h2>

            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-slate-500">
              <CalendarDays size={13} aria-hidden="true" />
              {formatPurchaseDate(purchase.startDate)} até{" "}
              {formatPurchaseDate(purchase.endDate)}
            </span>
          </div>

          {purchase.description && (
            <p className="mt-1.5 text-sm text-slate-500">
              {purchase.description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={onDelete}
            aria-label="Excluir compra"
            title="Excluir compra"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-1 focus-visible:outline-none"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onSwitch}
            aria-label="Alternar entre compras cadastradas"
            title="Alternar entre compras cadastradas"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-[#4F26E9] focus-visible:ring-2 focus-visible:ring-[#4F26E9] focus-visible:ring-offset-1 focus-visible:outline-none"
          >
            <ArrowLeftRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-3 lg:grid-cols-5">
        <Metric
          label="Valor total"
          value={formatCurrency(purchase.totalAmount)}
        />

        <Metric
          label="Valor já pago"
          value={formatCurrency(paidAmount)}
          valueClassName="text-emerald-600"
        />

        <Metric
          label="Valor restante a pagar"
          value={formatCurrency(remainingAmount)}
          valueClassName="text-[#4F26E9]"
        />

        <Metric
          label="Data de início"
          value={formatPurchaseDate(purchase.startDate)}
          withCalendar
        />

        <Metric
          label="Data de fim"
          value={formatPurchaseDate(purchase.endDate)}
          withCalendar
        />
      </dl>
    </section>
  );
}

export default PurchaseSummaryCard;
