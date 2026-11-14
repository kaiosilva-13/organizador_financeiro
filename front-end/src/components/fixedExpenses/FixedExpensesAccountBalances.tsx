import { ArrowDownRight, Landmark, Wallet } from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import type { Account } from "../../types/account";

type LastPayment = {
  accountId: string;
  amount: number;
  title: string;
};

type FixedExpensesAccountBalancesProps = {
  accounts: Account[];
  lastPayment?: LastPayment | null;
};

/**
 * Faixa de saldos das contas financeiras.
 *
 * Cada pagamento de gasto fixo cria uma despesa na movimentação da conta e é
 * debitado pelo servidor. Depois de registrar o pagamento, a página recarrega
 * `GET /accounts` e este componente exibe o saldo já atualizado. O último
 * pagamento é destacado para o usuário identificar qual conta foi debitada.
 */
function FixedExpensesAccountBalances({
  accounts,
  lastPayment,
}: FixedExpensesAccountBalancesProps) {
  const accountNoun = accounts.length === 1 ? "conta" : "contas";

  return (
    <section
      aria-labelledby="fixed-expenses-account-balances-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Wallet size={18} aria-hidden="true" />
          </span>

          <div>
            <h2
              id="fixed-expenses-account-balances-heading"
              className="text-sm font-bold text-slate-900"
            >
              Saldo das contas
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Atualizado automaticamente após cada pagamento de gasto fixo.
            </p>
          </div>
        </div>

        <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {accounts.length} {accountNoun}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {accounts.map((account) => {
          const isLastPaidAccount = lastPayment?.accountId === account.id;

          return (
            <article
              key={account.id}
              aria-live={isLastPaidAccount ? "polite" : undefined}
              className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 transition ${
                isLastPaidAccount
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-slate-100 bg-slate-50/70"
              }`}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isLastPaidAccount
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-indigo-50 text-[#4F26E9]"
                  }`}
                >
                  <Landmark size={16} aria-hidden="true" />
                </span>

                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-semibold text-slate-900"
                    title={account.name}
                  >
                    {account.name}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-slate-500">
                    {account.type}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
                  Saldo
                </p>
                <p className="mt-0.5 text-sm font-bold whitespace-nowrap text-[#0B0B45]">
                  {formatCurrency(account.balance)}
                </p>

                {isLastPaidAccount && lastPayment && (
                  <p className="mt-1 flex items-center justify-end gap-0.5 text-[10px] font-semibold text-emerald-700">
                    <ArrowDownRight size={11} aria-hidden="true" />-
                    {formatCurrency(lastPayment.amount)} ·{" "}
                    <span className="max-w-[90px] truncate">
                      {lastPayment.title}
                    </span>
                  </p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default FixedExpensesAccountBalances;
