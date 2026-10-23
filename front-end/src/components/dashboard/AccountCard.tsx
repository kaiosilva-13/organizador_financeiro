import {
  ArrowLeftRight,
  Banknote,
  CircleDollarSign,
  CreditCard,
  Landmark,
  PiggyBank,
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

type AccountCardProps = {
  account: Account | null;
  position: number;
  totalAccounts: number;
  onSwitch: () => void;
  onCreate: () => void;
};

/**
 * Card "Dados da conta".
 *
 * A troca de conta é feita de forma cíclica pelo botão de alternância. Toda a
 * fonte de dados vem do Dashboard, então a futura integração com a API não
 * exige mudanças neste componente.
 */
function AccountCard({
  account,
  position,
  totalAccounts,
  onSwitch,
  onCreate,
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
        <button
          type="button"
          onClick={onSwitch}
          disabled={!canSwitch}
          aria-label={switchLabel}
          title={switchLabel}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-[#4F26E9] transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:bg-transparent"
        >
          <ArrowLeftRight size={17} />
        </button>
      }
    >
      {account ? (
        <>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B0B45] text-white">
                <AccountIcon size={20} />
              </span>

              <div>
                <p className="font-semibold text-slate-900">{account.name}</p>
                <p className="text-xs text-slate-500">{account.type}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">Saldo</p>
              <p className="text-xl font-bold text-[#0B0B45]">
                {formatCurrency(account.balance)}
              </p>
            </div>
          </div>

          {canSwitch && (
            <p className="mt-3 text-xs text-slate-400">
              Conta {position} de {totalAccounts}
            </p>
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-[#4F26E9]">
            <Wallet size={22} />
          </span>

          <p className="mt-3 text-sm font-semibold text-slate-900">
            Nenhuma conta cadastrada
          </p>

          <button
            type="button"
            onClick={onCreate}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-[#4F26E9] px-4 text-xs font-semibold text-white transition hover:bg-[#411DCB]"
          >
            Cadastrar conta
          </button>
        </div>
      )}
    </DashboardCard>
  );
}

export default AccountCard;
