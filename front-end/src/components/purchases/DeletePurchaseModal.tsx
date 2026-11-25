import { useState } from "react";

import { AlertCircle, CalendarDays, Loader2, Trash2 } from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import { formatInstallmentCount } from "../../lib/purchases";
import type { Purchase } from "../../types/purchase";
import ModalShell from "../modals/ModalShell";

type DeletePurchaseModalProps = {
  isOpen: boolean;
  purchase: Purchase | null;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

function DeletePurchaseModalContent({
  purchase,
  onClose,
  onConfirm,
}: Omit<DeletePurchaseModalProps, "isOpen"> & { purchase: Purchase }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleConfirm() {
    setIsDeleting(true);
    setError("");

    try {
      // DELETE /api/purchases/:id remove a compra de `controle_compras`.
      await onConfirm();
    } catch (confirmError) {
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : "Não foi possível excluir a compra.",
      );
      setIsDeleting(false);
    }
  }

  return (
    <ModalShell
      isOpen
      size="sm"
      title="Excluir compra?"
      description="Tem certeza de que deseja excluir esta compra e seu cronograma de parcelas?"
      icon={<Trash2 size={20} aria-hidden="true" />}
      iconClassName="bg-rose-50 text-rose-600"
      onClose={onClose}
    >
      <div className="mt-5">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#4F26E9] ring-1 ring-slate-200">
            <CalendarDays size={18} aria-hidden="true" />
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {purchase.name}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatCurrency(purchase.totalAmount)} ·{" "}
              {formatInstallmentCount(purchase.installments.length)}
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs font-medium text-rose-600">
          Esta ação não pode ser desfeita. As movimentações de parcelas já pagas
          continuam registradas.
        </p>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
          >
            <AlertCircle
              size={17}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? (
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Trash2 size={16} aria-hidden="true" />
            )}
            {isDeleting ? "Excluindo..." : "Excluir compra"}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function DeletePurchaseModal({
  isOpen,
  purchase,
  onClose,
  onConfirm,
}: DeletePurchaseModalProps) {
  if (!isOpen || !purchase) {
    return null;
  }

  return (
    <DeletePurchaseModalContent
      key={purchase.id}
      purchase={purchase}
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
}

export default DeletePurchaseModal;
