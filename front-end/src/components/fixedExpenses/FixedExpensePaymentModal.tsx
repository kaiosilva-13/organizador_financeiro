import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";

import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Tag,
  UploadCloud,
  Wallet,
  X,
} from "lucide-react";

import { formatCurrency } from "../../lib/currency";
import {
  formatFixedExpenseDate,
  getTodayISO,
} from "../../lib/fixedExpenses";
import { formatFileSize } from "../../lib/transactions";
import type { Account } from "../../types/account";
import type {
  FixedExpense,
  FixedExpensePaymentInput,
} from "../../types/fixedExpense";
import ModalShell from "../modals/ModalShell";

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];
const ACCEPTED_RECEIPT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

type FixedExpensePaymentModalProps = {
  isOpen: boolean;
  expense: FixedExpense | null;
  accounts: Account[];
  onClose: () => void;
  onSubmit: (input: FixedExpensePaymentInput) => void | Promise<void>;
};

type FixedExpensePaymentModalContentProps = Omit<
  FixedExpensePaymentModalProps,
  "isOpen"
>;

type FormErrors = {
  account?: string;
  receipt?: string;
  form?: string;
};

function fieldClasses(hasError: boolean) {
  return `h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-1 ${
    hasError
      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
      : "border-slate-300 focus:border-[#4F26E9] focus:ring-[#4F26E9]"
  }`;
}

function SummaryItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof CalendarDays;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#4F26E9] ring-1 ring-slate-200">
        <Icon size={15} aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

function FixedExpensePaymentModalContent({
  expense,
  accounts,
  onClose,
  onSubmit,
}: FixedExpensePaymentModalContentProps) {
  const formId = useId();
  const accountId = `${formId}-account`;
  const receiptId = `${formId}-receipt`;

  const accountSelectRef = useRef<HTMLSelectElement>(null);

  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts[0]?.id ?? "",
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedAccount =
    accounts.find((account) => account.id === selectedAccountId) ?? null;
  const paymentDate = getTodayISO();

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      accountSelectRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, []);

  if (!expense) {
    return null;
  }

  function clearError(field: keyof FormErrors) {
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[field];

      return nextErrors;
    });
  }

  // A validação é repetida no servidor. O upload definitivo deve ser enviado
  // em multipart/form-data com limite de 10 MB e allowlist de MIME types.
  function validateReceipt(file: File): string | null {
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    const hasAcceptedType = ACCEPTED_RECEIPT_TYPES.includes(file.type);
    const hasAcceptedExtension =
      ACCEPTED_RECEIPT_EXTENSIONS.includes(extension);

    if (!hasAcceptedType && !hasAcceptedExtension) {
      return "Formato inválido. Envie um arquivo PDF, JPG ou PNG.";
    }

    if (file.size > MAX_RECEIPT_SIZE) {
      return "O comprovante deve ter no máximo 10 MB.";
    }

    return null;
  }

  function handleReceiptSelection(file?: File) {
    if (!file) {
      return;
    }

    const validationError = validateReceipt(file);

    if (validationError) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        receipt: validationError,
      }));
      return;
    }

    setReceiptFile(file);
    clearError("receipt");
  }

  function handleReceiptInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleReceiptSelection(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleReceiptDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    handleReceiptSelection(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedAccountId) {
      setErrors({ account: "Selecione a conta financeira utilizada." });
      accountSelectRef.current?.focus();
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // A página cria a movimentação de despesa em `POST /transactions` e
      // atualiza o saldo da conta antes de fechar esta modal.
      // TODO [BACKEND]: Consolidar em POST /api/fixed-expenses/:id/payments,
      // que deve criar pagamento + movimentação + débito do saldo + upload do
      // comprovante em uma única transação SQL (multipart/form-data).
      await onSubmit({
        accountId: selectedAccountId,
        receiptFile,
      });
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível registrar o pagamento.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell
      isOpen
      size="lg"
      title="Registrar pagamento mensal"
      description="Confira os dados do gasto e escolha a conta utilizada no pagamento."
      icon={<Wallet size={20} aria-hidden="true" />}
      onClose={onClose}
    >
      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SummaryItem
            label="Data do pagamento"
            value={formatFixedExpenseDate(paymentDate)}
            icon={CalendarDays}
          />
          <SummaryItem label="Título" value={expense.title} icon={FileText} />
          <SummaryItem
            label="Valor"
            value={formatCurrency(expense.estimatedAmount)}
            icon={Wallet}
          />
          <SummaryItem
            label="Categoria"
            value={expense.category}
            icon={Tag}
          />
        </dl>
      </div>

      <form
        className="mt-5 flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={accountId}
            className="text-sm font-semibold text-slate-900"
          >
            Conta utilizada
            <span aria-hidden="true" className="ml-0.5 text-rose-500">
              *
            </span>
          </label>

          <div className="relative">
            <select
              ref={accountSelectRef}
              id={accountId}
              name="accountId"
              value={selectedAccountId}
              onChange={(event) => {
                setSelectedAccountId(event.target.value);
                clearError("account");
              }}
              aria-invalid={Boolean(errors.account)}
              aria-describedby={
                errors.account ? `${accountId}-error` : `${accountId}-hint`
              }
              className={`${fieldClasses(Boolean(errors.account))} appearance-none pr-10`}
            >
              <option value="">Selecione uma conta financeira</option>

              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} · {account.type}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
            />
          </div>

          {errors.account ? (
            <p
              id={`${accountId}-error`}
              role="alert"
              className="text-xs font-medium text-rose-500"
            >
              {errors.account}
            </p>
          ) : selectedAccount ? (
            <p id={`${accountId}-hint`} className="text-[11px] text-slate-400">
              Saldo disponível na conta:{" "}
              <span className="font-semibold text-slate-600">
                {formatCurrency(selectedAccount.balance)}
              </span>
            </p>
          ) : (
            <p id={`${accountId}-hint`} className="text-[11px] text-slate-400">
              O pagamento será vinculado à conta selecionada.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
            <label
              htmlFor={receiptId}
              className="text-sm font-semibold text-slate-900"
            >
              Comprovante
              <span className="ml-1 text-xs font-normal text-slate-400">
                (opcional)
              </span>
            </label>

            <span className="text-[11px] text-slate-400">
              PDF, JPG ou PNG · até 10 MB
            </span>
          </div>

          {receiptFile ? (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F26E9]">
                <FileText size={19} aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-semibold text-slate-800"
                  title={receiptFile.name}
                >
                  {receiptFile.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {formatFileSize(receiptFile.size)} · Pronto para enviar
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setReceiptFile(null);
                  clearError("receipt");
                }}
                aria-label="Remover comprovante"
                title="Remover comprovante"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <X size={17} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <label
              htmlFor={receiptId}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleReceiptDrop}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-5 text-center transition focus-within:ring-2 focus-within:ring-[#4F26E9] focus-within:ring-offset-2 ${
                isDraggingFile
                  ? "border-[#4F26E9] bg-indigo-50"
                  : "border-slate-300 bg-slate-50/60 hover:border-[#4F26E9] hover:bg-indigo-50/40"
              }`}
            >
              <UploadCloud
                size={22}
                aria-hidden="true"
                className="text-[#4F26E9]"
              />
              <span className="mt-1.5 text-sm font-semibold text-slate-700">
                {isDraggingFile
                  ? "Solte o arquivo aqui"
                  : "Clique para anexar ou arraste o arquivo"}
              </span>
              <span className="mt-0.5 text-[11px] text-slate-400">
                PDF, JPG ou PNG · limite de 10 MB
              </span>

              <input
                id={receiptId}
                name="receipt"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleReceiptInputChange}
                className="sr-only"
              />
            </label>
          )}

          {errors.receipt && (
            <p role="alert" className="text-xs font-medium text-rose-500">
              {errors.receipt}
            </p>
          )}
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs leading-relaxed text-indigo-900">
          O pagamento será registrado no histórico mensal e também como uma
          despesa em <strong>Movimentações</strong>, vinculado à conta escolhida
          acima. O valor será debitado do saldo dessa conta.
        </div>

        {errors.form && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700"
          >
            <AlertCircle
              size={17}
              aria-hidden="true"
              className="mt-0.5 shrink-0"
            />
            <span>{errors.form}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 size={17} aria-hidden="true" className="animate-spin" />
          ) : (
            <Check size={17} aria-hidden="true" />
          )}
          {isSubmitting ? "Registrando..." : "Confirmar pagamento"}
        </button>
      </form>
    </ModalShell>
  );
}

function FixedExpensePaymentModal({
  isOpen,
  expense,
  accounts,
  onClose,
  onSubmit,
}: FixedExpensePaymentModalProps) {
  if (!isOpen || !expense) {
    return null;
  }

  return (
    <FixedExpensePaymentModalContent
      key={expense.id}
      expense={expense}
      accounts={accounts}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default FixedExpensePaymentModal;
