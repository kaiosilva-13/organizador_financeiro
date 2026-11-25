import { Check } from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import {
  formatInstallmentCount,
  formatPurchaseDate,
  formatPurchaseMonthYear,
  getInstallmentAmount,
} from "../../lib/purchases";
import type {
  Purchase,
  PurchaseInstallment,
  PurchaseInstallmentStatus,
} from "../../types/purchase";

type PurchaseInstallmentsTableProps = {
  purchase: Purchase;
  onPay: (installment: PurchaseInstallment) => void;
};

function StatusBadge({ status }: { status: PurchaseInstallmentStatus }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <Check size={12} aria-hidden="true" />
        Pago
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
      Pendente
    </span>
  );
}

function InstallmentAction({
  installment,
  onPay,
}: {
  installment: PurchaseInstallment;
  onPay: (installment: PurchaseInstallment) => void;
}) {
  if (installment.status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
        <Check size={14} aria-hidden="true" />
        Parcela paga
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onPay(installment)}
      className="inline-flex h-8 items-center justify-center rounded-lg border border-[#4F26E9] bg-white px-3 text-xs font-semibold whitespace-nowrap text-[#4F26E9] transition hover:bg-indigo-50 active:scale-[0.99]"
    >
      Realizar pagamento
    </button>
  );
}

/**
 * Tabela com o cronograma de prestações da compra selecionada.
 *
 * Em telas menores a tabela vira uma lista de cartões para preservar a
 * legibilidade dos mesmos dados.
 */
function PurchaseInstallmentsTable({
  purchase,
  onPay,
}: PurchaseInstallmentsTableProps) {
  const count = purchase.installments.length;
  const installmentAmount = getInstallmentAmount(
    purchase.totalAmount,
    count,
  );

  return (
    <section
      aria-labelledby="purchase-installments-heading"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="purchase-installments-heading"
            className="text-base font-bold text-slate-900"
          >
            Prestações da compra
          </h2>

          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            Valor total dividido pelo número de meses:{" "}
            {formatCurrency(purchase.totalAmount)} ÷ {count} ={" "}
            {formatCurrency(installmentAmount)} por parcela.
          </p>
        </div>

        <span className="inline-flex w-fit shrink-0 items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-[#4F26E9]">
          {formatInstallmentCount(count)}
        </span>
      </header>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <caption className="sr-only">
            Prestações da compra {purchase.name}
          </caption>

          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70">
              <th
                scope="col"
                className="px-5 py-3 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase"
              >
                Mês referente
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase"
              >
                Nome da prestação
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase"
              >
                Valor da prestação
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-5 py-3 text-[11px] font-semibold tracking-[0.08em] text-slate-500 uppercase"
              >
                Ação
              </th>
            </tr>
          </thead>

          <tbody>
            {purchase.installments.map((installment) => (
              <tr
                key={installment.id}
                className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/50"
              >
                <td className="px-5 py-3.5">
                  <p className="text-sm font-semibold whitespace-nowrap text-slate-900">
                    {formatPurchaseMonthYear(installment.dueDate)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatPurchaseDate(installment.dueDate)}
                  </p>
                </td>

                <td className="px-4 py-3.5 text-sm text-slate-600">
                  Pagamento de {purchase.name}
                </td>

                <td className="px-4 py-3.5 text-sm font-bold whitespace-nowrap text-slate-900">
                  {formatCurrency(installment.amount)}
                </td>

                <td className="px-4 py-3.5">
                  <StatusBadge status={installment.status} />
                </td>

                <td className="px-5 py-3.5">
                  <InstallmentAction installment={installment} onPay={onPay} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="divide-y divide-slate-100 lg:hidden">
        {purchase.installments.map((installment) => (
          <li key={installment.id} className="px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {formatPurchaseMonthYear(installment.dueDate)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatPurchaseDate(installment.dueDate)}
                </p>
              </div>

              <StatusBadge status={installment.status} />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Pagamento de {purchase.name}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-900">
                {formatCurrency(installment.amount)}
              </span>

              <InstallmentAction installment={installment} onPay={onPay} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PurchaseInstallmentsTable;
