import { Info, Trash2 } from "lucide-react";

import type { FixedExpense } from "../../types/fixedExpense";
import ModalShell from "../modals/ModalShell";

type DeleteFixedExpenseModalProps = {
  isOpen: boolean;
  expense: FixedExpense | null;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteFixedExpenseModal({
  isOpen,
  expense,
  onClose,
  onConfirm,
}: DeleteFixedExpenseModalProps) {
  if (!isOpen || !expense) {
    return null;
  }

  return (
    <ModalShell
      isOpen
      size="sm"
      title="Excluir gasto fixo"
      description="Esta ação não pode ser desfeita."
      icon={<Trash2 size={20} aria-hidden="true" />}
      onClose={onClose}
    >
      <div className="mt-6">
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <Trash2 size={19} aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-semibold text-rose-900">
              Remover permanentemente "{expense.title}"?
            </p>
            <p className="mt-1 text-sm leading-relaxed text-rose-700">
              Todos os dados do gasto fixo e o histórico de pagamentos
              registrados serão removidos. Não será possível recuperá-los.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
          <Info
            size={17}
            aria-hidden="true"
            className="mt-0.5 shrink-0 text-[#4F26E9]"
          />

          <p className="text-xs leading-relaxed text-indigo-900">
            Quer apenas deixar de pagar? Cancele e altere o status para Não
            Ativo. Assim, seu histórico de pagamentos será preservado.
          </p>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.99]"
          >
            <Trash2 size={16} aria-hidden="true" />
            Excluir gasto fixo
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default DeleteFixedExpenseModal;
