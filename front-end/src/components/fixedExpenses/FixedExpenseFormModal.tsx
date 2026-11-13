import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  AlertCircle,
  CalendarDays,
  ChevronDown,
  Loader2,
  Plus,
  Save,
} from "lucide-react";

import { formatCurrency, parseCurrencyInput } from "../../lib/currency";
import { DUE_DAYS } from "../../lib/fixedExpenses";
import type {
  FixedExpense,
  FixedExpenseFormInput,
} from "../../types/fixedExpense";
import ModalShell from "../modals/ModalShell";

type FixedExpenseFormModalProps = {
  isOpen: boolean;
  /** Gasto em edição. Quando ausente, a modal abre no modo de cadastro. */
  expense?: FixedExpense | null;
  onClose: () => void;
  onSubmit: (input: FixedExpenseFormInput) => void | Promise<void>;
};

type FixedExpenseFormModalContentProps = Omit<
  FixedExpenseFormModalProps,
  "isOpen"
>;

type FormErrors = {
  title?: string;
  amount?: string;
  dueDay?: string;
  form?: string;
};

function fieldClasses(hasError: boolean) {
  return `h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-1 ${
    hasError
      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
      : "border-slate-300 focus:border-[#4F26E9] focus:ring-[#4F26E9]"
  }`;
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-0.5 text-rose-500">
      *
    </span>
  );
}

function FixedExpenseFormModalContent({
  expense,
  onClose,
  onSubmit,
}: FixedExpenseFormModalContentProps) {
  const isEditing = Boolean(expense);

  const formId = useId();
  const titleId = `${formId}-title`;
  const amountId = `${formId}-amount`;
  const dueDayId = `${formId}-due-day`;

  const titleInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(expense?.title ?? "");
  const [amount, setAmount] = useState(expense?.estimatedAmount ?? 0);
  const [dueDay, setDueDay] = useState(expense?.dueDay ?? 15);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, []);

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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Informe o título do gasto fixo.";
    }

    if (amount <= 0) {
      nextErrors.amount = "Informe um valor estimado maior que zero.";
    }

    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      nextErrors.dueDay = "Selecione um dia de vencimento entre 1 e 31.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      if (nextErrors.title) {
        titleInputRef.current?.focus();
      }

      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        title: title.trim(),
        estimatedAmount: amount,
        dueDay,
      });
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o gasto fixo.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell
      isOpen
      size="lg"
      title={isEditing ? "Editar Gasto Fixo" : "Cadastrar Gasto Fixo"}
      description={
        isEditing
          ? "Atualize as informações do gasto fixo selecionado."
          : "Cadastre uma despesa recorrente para acompanhar vencimentos e pagamentos."
      }
      icon={<CalendarDays size={20} aria-hidden="true" />}
      onClose={onClose}
    >
      <form
        className="mt-6 flex flex-col gap-5"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={titleId}
            className="text-sm font-semibold text-slate-900"
          >
            Título
            <RequiredMark />
          </label>

          <input
            ref={titleInputRef}
            id={titleId}
            name="title"
            type="text"
            autoComplete="off"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              clearError("title");
            }}
            placeholder="Ex: Internet residencial, aluguel, academia..."
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? `${titleId}-error` : undefined}
            className={fieldClasses(Boolean(errors.title))}
          />

          {errors.title && (
            <p
              id={`${titleId}-error`}
              role="alert"
              className="text-xs font-medium text-rose-500"
            >
              {errors.title}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={amountId}
              className="text-sm font-semibold text-slate-900"
            >
              Valor estimado
              <RequiredMark />
            </label>

            <input
              id={amountId}
              name="estimatedAmount"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={formatCurrency(amount)}
              onChange={(event) => {
                setAmount(parseCurrencyInput(event.target.value));
                clearError("amount");
              }}
              aria-invalid={Boolean(errors.amount)}
              aria-describedby={
                errors.amount ? `${amountId}-error` : undefined
              }
              className={fieldClasses(Boolean(errors.amount))}
            />

            {errors.amount ? (
              <p
                id={`${amountId}-error`}
                role="alert"
                className="text-xs font-medium text-rose-500"
              >
                {errors.amount}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Informe o valor médio pago por mês.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={dueDayId}
              className="text-sm font-semibold text-slate-900"
            >
              Dia de vencimento
              <RequiredMark />
            </label>

            <div className="relative">
              <select
                id={dueDayId}
                name="dueDay"
                value={dueDay}
                onChange={(event) => {
                  setDueDay(Number(event.target.value));
                  clearError("dueDay");
                }}
                aria-invalid={Boolean(errors.dueDay)}
                aria-describedby={`${dueDayId}-hint`}
                className={`${fieldClasses(Boolean(errors.dueDay))} appearance-none pr-10`}
              >
                {DUE_DAYS.map((day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={18}
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
              />
            </div>

            <p
              id={`${dueDayId}-hint`}
              className={
                errors.dueDay
                  ? "text-xs font-medium text-rose-500"
                  : "text-[11px] leading-relaxed text-slate-400"
              }
            >
              {errors.dueDay ??
                "Informe um dia entre 1 e 31. O gasto se repete mensalmente."}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 px-4 py-3 text-xs leading-relaxed text-indigo-900">
          O gasto ficará ativo assim que for cadastrado. Você poderá inativá-lo
          a qualquer momento sem perder o histórico de pagamentos.
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
          ) : isEditing ? (
            <Save size={17} aria-hidden="true" />
          ) : (
            <Plus size={17} aria-hidden="true" />
          )}
          {isSubmitting
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Cadastrar gasto fixo"}
        </button>
      </form>
    </ModalShell>
  );
}

function FixedExpenseFormModal({
  isOpen,
  expense,
  onClose,
  onSubmit,
}: FixedExpenseFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <FixedExpenseFormModalContent
      // Reinicia o formulário ao alternar entre cadastro e edição.
      key={expense?.id ?? "new-fixed-expense"}
      expense={expense}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default FixedExpenseFormModal;
