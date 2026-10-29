import { ChevronDown, Landmark, Plus } from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import type { Account } from "../../types/account";

type TransactionsAccountBarProps = {
  account: Account;
  accounts: Account[];
  onSelectAccount: (accountId: string) => void;
  onCreateAccount: () => void;
};

function TransactionsAccountBar({
  account,
  accounts,
  onSelectAccount,
  onCreateAccount,
}: TransactionsAccountBarProps) {
  return (
    <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B0B45] text-white">
          <Landmark size={21} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Conta selecionada
          </p>

          <div className="relative mt-1.5">
            <select
              value={account.id}
              onChange={(event) => onSelectAccount(event.target.value)}
              aria-label="Selecionar conta para exibir as movimentações"
              className="h-10 w-full min-w-0 appearance-none rounded-lg border border-slate-300 bg-white py-0 pr-9 pl-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9] sm:min-w-[250px]"
            >
              {accounts.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
            />
          </div>

          <p className="mt-1.5 truncate text-xs text-slate-500">
            {account.type}
            {accounts.length > 1
              ? ` · ${accounts.length} contas cadastradas`
              : " · 1 conta cadastrada"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
            Saldo da conta
          </p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[#0B0B45]">
            {formatCurrency(account.balance)}
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateAccount}
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 text-xs font-semibold text-slate-700 transition hover:border-[#4F26E9] hover:bg-indigo-50 hover:text-[#4F26E9]"
        >
          <Plus size={16} aria-hidden="true" />
          Nova conta
        </button>
      </div>
    </section>
  );
}

export default TransactionsAccountBar;
