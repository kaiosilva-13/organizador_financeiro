import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { AlertCircle, CalendarDays, Loader2, Plus } from "lucide-react";

import { formatCurrency, parseCurrencyInput } from "../../lib/currency";
import {
  countInstallmentMonths,
  formatPurchaseMonthYearLong,
  getInstallmentAmount,
} from "../../lib/purchases";
import type { PurchaseFormInput } from "../../types/purchase";
import ModalShell from "../modals/ModalShell";

type PurchaseFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: PurchaseFormInput) => void | Promise<void>;
};

type FormErrors = {
  name?: string;
  totalAmount?: string;
  startDate?: string;
  endDate?: string;
  form?: string;
};

function fieldClasses(hasError: boolean) {
  return `h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-1 [color-scheme:light] ${
    hasError
      ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500"
      : "border-slate-300 focus:border-[#4F26E9] focus:ring-[#4F26E9]"
  }`;
}

function RequiredMark() {
  return (
    <span aria-hidden="true" className="ml-1 text-rose-500">
      *
    </span>
  );
}

function PurchaseFormModalContent({
  onClose,
  onSubmit,
}: Omit<PurchaseFormModalProps, "isOpen">) {
  const formId = useId();
  const nameId = `${formId}-name`;
  const descriptionId = `${formId}-description`;
  const totalAmountId = `${formId}-total`;
  const startDateId = `${formId}-start`;
  const endDateId = `${formId}-end`;

  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const focusTimer = window.setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(focusTimer);
  }, []);

  const preview = useMemo(() => {
    if (
      totalAmount <= 0 ||
      !startDate ||
      !endDate ||
      endDate < startDate
    ) {
      return null;
    }

    const count = countInstallmentMonths(startDate, endDate);

    if (count < 1) {
      return null;
    }

    return {
      count,
      amount: getInstallmentAmount(totalAmount, count),
    };
  }, [totalAmount, startDate, endDate]);

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

    if (!name.trim()) {
      nextErrors.name = "Informe o nome da compra.";
    }

    if (totalAmount <= 0) {
      nextErrors.totalAmount = "Informe um valor total maior que zero.";
    }

    if (!startDate) {
      nextErrors.startDate = "Informe a data de início dos pagamentos.";
    }

    if (!endDate) {
      nextErrors.endDate = "Informe a data de fim prevista.";
    } else if (startDate && endDate < startDate) {
      nextErrors.endDate =
        "A data de fim deve ser igual ou posterior à data de início.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      if (nextErrors.name) {
        nameInputRef.current?.focus();
      }

      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        totalAmount,
        startDate,
        endDate,
      });
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a compra.",
      });
      setIsSubmitting(false);
    }
  }

  return (
    <ModalShell
      isOpen
      size="md"
      title="Cadastrar nova compra"
      description="Preencha os dados da compra parcelada para gerar o cronograma de pagamentos."
      icon={<CalendarDays size={20} aria-hidden="true" />}
      onClose={onClose}
    >
      <form
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={nameId}
            className="text-sm font-semibold text-slate-900"
          >
            Nome da compra
            <RequiredMark />
          </label>

          <input
            ref={nameInputRef}
            id={nameId}
            name="name"
            type="text"
            autoComplete="off"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearError("name");
            }}
            placeholder="Ex: Notebook Dell Inspiron"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${nameId}-error` : undefined}
            className={fieldClasses(Boolean(errors.name))}
          />

          {errors.name && (
            <p
              id={`${nameId}-error`}
              role="alert"
              className="text-xs font-medium text-rose-500"
            >
              {errors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={descriptionId}
            className="text-sm font-semibold text-slate-900"
          >
            Descrição
            <span className="ml-1 text-xs font-normal text-slate-400">
              (opcional)
            </span>
          </label>

          <input
            id={descriptionId}
            name="description"
            type="text"
            autoComplete="off"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex: Compra parcelada para trabalho e estudos"
            className={fieldClasses(false)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={totalAmountId}
            className="text-sm font-semibold text-slate-900"
          >
            Valor total da compra
            <RequiredMark />
          </label>

          <input
            id={totalAmountId}
            name="totalAmount"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={formatCurrency(totalAmount)}
            onChange={(event) => {
              setTotalAmount(parseCurrencyInput(event.target.value));
              clearError("totalAmount");
            }}
            aria-invalid={Boolean(errors.totalAmount)}
            aria-describedby={
              errors.totalAmount ? `${totalAmountId}-error` : undefined
            }
            className={fieldClasses(Boolean(errors.totalAmount))}
          />

          {errors.totalAmount && (
            <p
              id={`${totalAmountId}-error`}
              role="alert"
              className="text-xs font-medium text-rose-500"
            >
              {errors.totalAmount}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={startDateId}
              className="text-sm font-semibold text-slate-900"
            >
              Data de início dos pagamentos
              <RequiredMark />
            </label>

            <input
              id={startDateId}
              name="startDate"
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                clearError("startDate");
                clearError("endDate");
              }}
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={
                errors.startDate ? `${startDateId}-error` : undefined
              }
              className={fieldClasses(Boolean(errors.startDate))}
            />

            {errors.startDate && (
              <p
                id={`${startDateId}-error`}
                role="alert"
                className="text-xs font-medium text-rose-500"
              >
                {errors.startDate}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={endDateId}
              className="text-sm font-semibold text-slate-900"
            >
              Data de fim prevista
              <RequiredMark />
            </label>

            <input
              id={endDateId}
              name="endDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(event) => {
                setEndDate(event.target.value);
                clearError("endDate");
              }}
              aria-invalid={Boolean(errors.endDate)}
              aria-describedby={
                errors.endDate ? `${endDateId}-error` : undefined
              }
              className={fieldClasses(Boolean(errors.endDate))}
            />

            {errors.endDate && (
              <p
                id={`${endDateId}-error`}
                role="alert"
                className="text-xs font-medium text-rose-500"
              >
                {errors.endDate}
              </p>
            )}
          </div>
        </div>

        {preview ? (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#4F26E9] ring-1 ring-indigo-100">
              <CalendarDays size={17} aria-hidden="true" />
            </span>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-indigo-950">
                {preview.count}{" "}
                {preview.count === 1 ? "parcela mensal" : "parcelas mensais"}{" "}
                de {formatCurrency(preview.amount)}
              </p>

              <p className="mt-0.5 text-xs leading-relaxed text-indigo-700/80">
                {preview.count === 1
                  ? `Referente a ${formatPurchaseMonthYearLong(startDate)}.`
                  : `De ${formatPurchaseMonthYearLong(startDate)} a ${formatPurchaseMonthYearLong(endDate)}, incluindo os dois meses.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#4F26E9] ring-1 ring-indigo-100">
              <CalendarDays size={17} aria-hidden="true" />
            </span>

            <p className="text-xs leading-relaxed text-indigo-700/80">
              Preencha o valor total e o período de pagamentos para visualizar
              automaticamente o cálculo das parcelas.
            </p>
          </div>
        )}

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

        <p className="mt-1 text-[11px] text-slate-400">* Campos obrigatórios</p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 size={17} aria-hidden="true" className="animate-spin" />
          ) : (
            <Plus size={17} aria-hidden="true" />
          )}
          {isSubmitting ? "Cadastrando..." : "Cadastrar compra"}
        </button>
      </form>
    </ModalShell>
  );
}

function PurchaseFormModal({
  isOpen,
  onClose,
  onSubmit,
}: PurchaseFormModalProps) {
  if (!isOpen) {
    return null;
  }

  return <PurchaseFormModalContent onClose={onClose} onSubmit={onSubmit} />;
}

export default PurchaseFormModal;
