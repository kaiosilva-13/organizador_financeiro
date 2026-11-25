import { CalendarDays, Plus } from "lucide-react";

import TransactionsEmptyState from "../transactions/TransactionsEmptyState";

type PurchaseEmptyStateProps = {
  onCreate: () => void;
};

/**
 * Estado vazio da seção de Controle de Compras.
 *
 * Reaproveita a estrutura de estado vazio já usada em Movimentações e Gastos
 * Fixos para manter a mesma linguagem visual da aplicação.
 */
function PurchaseEmptyState({ onCreate }: PurchaseEmptyStateProps) {
  return (
    <TransactionsEmptyState
      icon={CalendarDays}
      title="Nenhuma compra cadastrada"
      description="Você ainda não possui compras parceladas registradas. Cadastre sua primeira compra para acompanhar os valores pagos, parcelas restantes e vencimentos."
      actionLabel="Cadastrar primeira compra"
      actionIcon={Plus}
      onAction={onCreate}
    />
  );
}

export default PurchaseEmptyState;
