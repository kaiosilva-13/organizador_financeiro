import { useEffect, useId, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, FormEvent } from "react";
import { createPortal } from "react-dom";

import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  Loader2,
  Plus,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";

import { formatCurrency, parseCurrencyInput } from "../../lib/currency";
import { getReceiptOpenUrl } from "../../lib/receipts";
import { CATEGORY_COLORS, formatFileSize } from "../../lib/transactions";
import type {
  Transaction,
  TransactionCategory,
  TransactionFormInput,
  TransactionType,
} from "../../types/transaction";

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];
const ACCEPTED_RECEIPT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"];

type TransactionModalProps = {
  isOpen: boolean;
  transaction?: Transaction | null;
  categories: TransactionCategory[];
  onClose: () => void;
  onSubmit: (input: TransactionFormInput) => void | Promise<void>;
};

type TransactionModalContentProps = Omit<TransactionModalProps, "isOpen">;

type FormErrors = {
  amount?: string;
  title?: string;
  category?: string;
  receipt?: string;
  form?: string;
};

function getTodayISO() {
  const now = new Date();
  const offsetInMilliseconds = now.getTimezoneOffset() * 60 * 1000;

  return new Date(now.getTime() - offsetInMilliseconds)
    .toISOString()
    .slice(0, 10);
}

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

function TransactionModalContent({
  transaction,
  categories,
  onClose,
  onSubmit,
}: TransactionModalContentProps) {
  const isEditing = Boolean(transaction);

  const formId = useId();
  const titleId = `${formId}-title`;
  const amountId = `${formId}-amount`;
  const descriptionId = `${formId}-description`;
  const categoryId = `${formId}-category`;
  const newCategoryNameId = `${formId}-new-category-name`;
  const newCategoryColorId = `${formId}-new-category-color`;
  const dateId = `${formId}-date`;
  const receiptId = `${formId}-receipt`;

  const amountInputRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TransactionType>(
    transaction?.type ?? "expense",
  );
  const [amount, setAmount] = useState(transaction?.amount ?? 0);
  const [title, setTitle] = useState(transaction?.title ?? "");
  const [description, setDescription] = useState(
    transaction?.description ?? "",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    transaction?.categoryId ?? "",
  );
  const [date, setDate] = useState(transaction?.date ?? getTodayISO());
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState(
    CATEGORY_COLORS[0],
  );
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingReceipt =
    transaction?.receipt && !removeReceipt ? transaction.receipt : null;
  const displayedReceipt = receiptFile ?? existingReceipt;
  const displayedReceiptSize = receiptFile?.size ?? existingReceipt?.size;

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      amountInputRef.current?.focus();
    }, 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [onClose]);

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

  // TODO [BACKEND]: Repetir esta validação no servidor. O upload do
  // comprovante deve usar URL pré-assinada do S3, com limite de 10 MB,
  // allowlist de MIME types e varredura de segurança no bucket.
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
    setRemoveReceipt(false);
    clearError("receipt");
  }

  function handleReceiptInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleReceiptSelection(event.target.files?.[0]);
    // Permite selecionar o mesmo arquivo novamente após um erro.
    event.target.value = "";
  }

  function handleReceiptDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    handleReceiptSelection(event.dataTransfer.files?.[0]);
  }

  function handleRemoveReceipt() {
    setReceiptFile(null);
    setRemoveReceipt(Boolean(transaction?.receipt));
    clearError("receipt");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};

    if (amount <= 0) {
      nextErrors.amount = "Informe um valor maior que zero.";
    }

    if (!title.trim()) {
      nextErrors.title = "Informe o título da movimentação.";
    }

    if (isCreatingCategory) {
      if (!newCategoryName.trim()) {
        nextErrors.category = "Informe o nome da nova categoria.";
      }
    } else if (!selectedCategoryId) {
      nextErrors.category = "Selecione uma categoria.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      if (nextErrors.amount) {
        amountInputRef.current?.focus();
      }

      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        amount,
        type,
        categoryId: isCreatingCategory ? "" : selectedCategoryId,
        newCategory: isCreatingCategory
          ? {
              name: newCategoryName.trim(),
              color: newCategoryColor,
            }
          : null,
        date,
        receiptFile,
        removeReceipt,
      });
    } catch (error) {
      setErrors({
        form:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar a movimentação.",
      });
      setIsSubmitting(false);
    }
  }

  const categoryPreviewName =
    newCategoryName.trim() || "Prévia da categoria";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-[#0B0B45]/60 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${formId}-heading`}
        aria-describedby={`${formId}-description-modal`}
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={`${formId}-heading`}
              className="text-xl font-bold tracking-tight text-[#0B0B45]"
            >
              {isEditing ? "Editar Movimentação" : "Nova Movimentação"}
            </h2>

            <p
              id={`${formId}-description-modal`}
              className="mt-1 text-sm text-slate-500"
            >
              {isEditing
                ? "Atualize as informações do lançamento selecionado."
                : "Registre uma receita ou despesa e mantenha seu histórico em dia."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="-mt-1 -mr-1 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend className="sr-only">Tipo de movimentação</legend>

            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                aria-pressed={type === "income"}
                onClick={() => setType("income")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  type === "income"
                    ? "bg-white text-emerald-700 shadow-sm ring-1 ring-emerald-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    type === "income"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-white text-slate-400"
                  }`}
                >
                  <ArrowDownLeft size={17} aria-hidden="true" />
                </span>

                <span className="text-left">
                  <span className="block">Receita</span>
                  <span className="block text-[11px] font-normal opacity-70">
                    Entrada de dinheiro
                  </span>
                </span>
              </button>

              <button
                type="button"
                aria-pressed={type === "expense"}
                onClick={() => setType("expense")}
                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  type === "expense"
                    ? "bg-white text-rose-700 shadow-sm ring-1 ring-rose-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    type === "expense"
                      ? "bg-rose-100 text-rose-600"
                      : "bg-white text-slate-400"
                  }`}
                >
                  <ArrowUpRight size={17} aria-hidden="true" />
                </span>

                <span className="text-left">
                  <span className="block">Despesa</span>
                  <span className="block text-[11px] font-normal opacity-70">
                    Saída de dinheiro
                  </span>
                </span>
              </button>
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={amountId}
                className="text-sm font-semibold text-slate-900"
              >
                Valor
                <RequiredMark />
              </label>

              <input
                ref={amountInputRef}
                id={amountId}
                name="amount"
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

              {errors.amount && (
                <p
                  id={`${amountId}-error`}
                  role="alert"
                  className="text-xs font-medium text-rose-500"
                >
                  {errors.amount}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={dateId}
                className="text-sm font-semibold text-slate-900"
              >
                Data de transação
              </label>

              <div className="relative">
                <CalendarDays
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
                />

                <input
                  id={dateId}
                  name="date"
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className={`${fieldClasses(false)} pl-10`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor={titleId}
              className="text-sm font-semibold text-slate-900"
            >
              Título
              <RequiredMark />
            </label>

            <input
              id={titleId}
              name="title"
              type="text"
              autoComplete="off"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                clearError("title");
              }}
              placeholder="Ex: Salário, aluguel, supermercado..."
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

            <textarea
              id={descriptionId}
              name="description"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Adicione detalhes sobre esta movimentação..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor={isCreatingCategory ? newCategoryNameId : categoryId}
                className="text-sm font-semibold text-slate-900"
              >
                {isCreatingCategory ? "Nova categoria" : "Categoria"}
                <RequiredMark />
              </label>

              {!isCreatingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategory(true);
                    clearError("category");
                  }}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-semibold text-[#4F26E9] transition hover:bg-indigo-50"
                >
                  <Plus size={14} aria-hidden="true" />
                  Nova categoria
                </button>
              )}
            </div>

            {isCreatingCategory ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <label
                      htmlFor={newCategoryNameId}
                      className="text-xs font-semibold text-slate-600"
                    >
                      Nome da categoria
                    </label>

                    <input
                      id={newCategoryNameId}
                      name="newCategoryName"
                      type="text"
                      autoComplete="off"
                      value={newCategoryName}
                      onChange={(event) => {
                        setNewCategoryName(event.target.value);
                        clearError("category");
                      }}
                      placeholder="Ex: Assinaturas"
                      aria-invalid={Boolean(errors.category)}
                      aria-describedby={
                        errors.category ? `${newCategoryNameId}-error` : undefined
                      }
                      className={`${fieldClasses(Boolean(errors.category))} mt-1`}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      clearError("category");
                    }}
                    className="mt-1 shrink-0 text-xs font-semibold text-slate-500 transition hover:text-slate-800"
                  >
                    Usar categoria existente
                  </button>
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-600">
                    Cor da categoria
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {CATEGORY_COLORS.map((color) => {
                      const isSelected = newCategoryColor === color;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewCategoryColor(color)}
                          aria-label={`Selecionar a cor ${color}`}
                          aria-pressed={isSelected}
                          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition ${
                            isSelected
                              ? "scale-110 border-[#0B0B45]"
                              : "border-transparent hover:scale-105"
                          }`}
                          style={{ backgroundColor: color }}
                        >
                          {isSelected && (
                            <Check
                              size={14}
                              aria-hidden="true"
                              className="text-white"
                            />
                          )}
                        </button>
                      );
                    })}

                    <label
                      htmlFor={newCategoryColorId}
                      title="Escolher uma cor personalizada"
                      className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-slate-400 bg-white transition hover:border-[#4F26E9]"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute inset-1 rounded-full"
                        style={{ backgroundColor: newCategoryColor }}
                      />
                      <Plus
                        size={12}
                        aria-hidden="true"
                        className="relative z-10 text-white drop-shadow"
                      />
                      <input
                        id={newCategoryColorId}
                        type="color"
                        value={newCategoryColor}
                        aria-label="Escolher uma cor personalizada"
                        onChange={(event) =>
                          setNewCategoryColor(event.target.value)
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                    </label>

                    <span
                      className="ml-1 inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                      style={{
                        color: newCategoryColor,
                        backgroundColor: `${newCategoryColor}12`,
                        borderColor: `${newCategoryColor}30`,
                      }}
                    >
                      <Tag size={12} aria-hidden="true" />
                      <span className="truncate">{categoryPreviewName}</span>
                    </span>
                  </div>
                </div>

                {errors.category && (
                  <p
                    id={`${newCategoryNameId}-error`}
                    role="alert"
                    className="mt-2 text-xs font-medium text-rose-500"
                  >
                    {errors.category}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="relative">
                  <select
                    id={categoryId}
                    name="category"
                    value={selectedCategoryId}
                    onChange={(event) => {
                      setSelectedCategoryId(event.target.value);
                      clearError("category");
                    }}
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={
                      errors.category ? `${categoryId}-error` : undefined
                    }
                    className={`${fieldClasses(Boolean(errors.category))} appearance-none pr-10`}
                  >
                    <option value="">Selecione uma categoria</option>

                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={18}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {errors.category && (
                  <p
                    id={`${categoryId}-error`}
                    role="alert"
                    className="text-xs font-medium text-rose-500"
                  >
                    {errors.category}
                  </p>
                )}
              </>
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

            {displayedReceipt ? (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[#4F26E9]">
                  <FileText size={19} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-semibold text-slate-800"
                    title={displayedReceipt.name}
                  >
                    {displayedReceipt.name}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatFileSize(displayedReceiptSize)}
                    {displayedReceiptSize ? " · " : ""}
                    {receiptFile ? "Pronto para enviar" : "Comprovante atual"}
                  </p>
                </div>

                {existingReceipt && !receiptFile && (
                  <a
                    href={getReceiptOpenUrl(existingReceipt)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-xs font-semibold text-[#4F26E9] transition hover:underline"
                  >
                    Abrir
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleRemoveReceipt}
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

            {removeReceipt && transaction?.receipt && (
              <button
                type="button"
                onClick={() => setRemoveReceipt(false)}
                className="w-fit text-xs font-semibold text-[#4F26E9] transition hover:underline"
              >
                Restaurar comprovante atual
              </button>
            )}

            {errors.receipt && (
              <p role="alert" className="text-xs font-medium text-rose-500">
                {errors.receipt}
              </p>
            )}
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
              <Loader2
                size={17}
                aria-hidden="true"
                className="animate-spin"
              />
            ) : (
              <Plus size={17} aria-hidden="true" />
            )}
            {isSubmitting
              ? "Salvando..."
              : isEditing
                ? "Salvar alterações"
                : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function TransactionModal({
  isOpen,
  transaction,
  categories,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <TransactionModalContent
      key={transaction?.id ?? "new-transaction"}
      transaction={transaction}
      categories={categories}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default TransactionModal;
