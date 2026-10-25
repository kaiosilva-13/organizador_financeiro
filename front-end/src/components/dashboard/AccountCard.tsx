import {
  ArrowLeftRight,
  Banknote,
  CircleDollarSign,
  CreditCard,
  FilePenLine,
  Landmark,
  PiggyBank,
  Trash2,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import DashboardCard from "./DashboardCard";
import { formatCurrency } from "../../lib/currency";
import type { Account, AccountType } from "../../types/account";

/** Ícone exibido para cada tipo de conta cadastrado. */
const accountTypeIcons: Record<AccountType, LucideIcon> = {
  "Conta Corrente": Landmark,
  "Dinheiro (Espécie)": Banknote,
  "Cartão de Crédito": CreditCard,
  "Conta Poupança": PiggyBank,
  "Investimentos / Corretora": TrendingUp,
  "Vale-Alimentação / Vale-Refeição (VA/VR)": UtensilsCrossed,
  "Outras Contas": CircleDollarSign,
};

const actionButtonClasses =
  "flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:border-slate-100 disabled:text-slate-300 disabled:hover:bg-transparent";

type AccountCardProps = {
  account: Account | null;
  position: number;
  totalAccounts: number;
  onSwitch: () => void;
  onCreate: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Card "Dados da conta".
 *
 * Exibe a conta ativa e delega ao Dashboard as ações de editar, excluir e
 * alternar. Toda a fonte de dados vem do Dashboard, então a futura integração
 * com a API não exige mudanças neste componente.
 */
function AccountCard({
  account,
  position,
  totalAccounts,
  onSwitch,
  onCreate,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const canSwitch = totalAccounts > 1;
  const AccountIcon = account ? accountTypeIcons[account.type] : Wallet;
  const switchLabel = canSwitch
    ? "Alternar conta exibida"
    : "Cadastre outra conta para alternar";

  return (
    <DashboardCard
      title="Dados da conta"
      action={
        <div className="flex items-center gap-1.5">
          {/* Ações da conta selecionada: editar, excluir e alternar. */}
          <button
            type="button"
            onClick={onEdit}
            disabled={!account}
            aria-label="Editar conta selecionada"
            title="Editar conta selecionada"
            className={`${actionButtonClasses} text-slate-500 hover:border-[#4F26E9] hover:bg-indigo-50 hover:text-[#4F26E9] focus-visible:ring-[#4F26E9]`}
          >
            <FilePenLine size={17} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={!account}
            aria-label="Excluir conta selecionada"
            title="Excluir conta selecionada"
            className={`${actionButtonClasses} text-slate-500 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-rose-500`}
          >
            <Trash2 size={17} />
          </button>

          <span
            aria-hidden="true"
            className="mx-0.5 h-6 w-px bg-slate-200"
          />

          <button
            type="button"
            onClick={onSwitch}
            disabled={!canSwitch}
            aria-label={switchLabel}
            title={switchLabel}
            className={`${actionButtonClasses} text-[#4F26E9] hover:border-[#4F26E9] hover:bg-indigo-50 focus-visible:ring-[#4F26E9]`}
          >
            <ArrowLeftRight size={17} />
          </button>
        </div>
      }
    >
      {account ? (
        <div aria-live="polite">
          <div className="mt-4 flex flex-col gap-5 rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B0B45] text-white">
                <AccountIcon size={21} />
              </span>

              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-900">
                  {account.name}
                </p>

                <span className="mt-1.5 inline-flex max-w-full items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-[#4F26E9]">
                  <span className="truncate">{account.type}</span>
                </span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6 sm:text-right">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                Saldo da conta
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-[#0B0B45]">
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>

          {canSwitch && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-xs font-medium text-slate-500">
                Conta {position} de {totalAccounts}
              </p>

              <p className="text-xs text-slate-400">
                Use as setas para alternar entre as contas
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#4F26E9]">
            <Wallet size={22} />
          </span>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            Nenhuma conta cadastrada
          </p>

          <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
            Cadastre uma conta e veja suas informações de forma rápida e
            eficiente.
          </p>

          <button
            type="button"
            onClick={onCreate}
            className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-[#4F26E9] px-4 text-xs font-semibold text-white transition hover:bg-[#411DCB]"
          >
            Cadastrar conta
          </button>
        </div>
      )}
    </DashboardCard>
  );
}

export default AccountCard;
