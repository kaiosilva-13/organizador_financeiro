import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";

import { X } from "lucide-react";

import AccountTypeSelect from "../accounts/AccountTypeSelect";
import CurrencyInput from "../accounts/CurrencyInput";
import type { AccountType, NewAccountInput } from "../../types/account";

type CreateAccountModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (account: NewAccountInput) => void;
};

type CreateAccountModalContentProps = Omit<CreateAccountModalProps, "isOpen">;

/**
 * Conteúdo interno da modal.
 *
 * Ele só é montado quando a modal está aberta. Assim, o formulário sempre
 * começa limpo ao reabrir e os efeitos de foco/bloqueio de scroll são
 * automaticamente removidos ao fechar.
 */
function CreateAccountModalContent({
  onClose,
  onCreate,
}: CreateAccountModalContentProps) {
  const titleId = useId();
  const nameId = useId();
  const nameErrorId = useId();

  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Conta Corrente");
  const [balance, setBalance] = useState(0);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    // Aguarda a montagem do portal antes de mover o foco para o formulário.
    const focusTimer = window.setTimeout(() => {
      nameInputRef.current?.focus();
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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Informe um nome para a conta.");
      nameInputRef.current?.focus();
      return;
    }

    onCreate({
      name: trimmedName,
      type,
      balance,
    });

    onClose();
  }

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
        aria-labelledby={titleId}
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className="text-xl font-bold tracking-tight text-[#0B0B45]"
            >
              Cadastrar Nova Conta
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Preencha os dados para adicionar uma nova conta.
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
              Nome da conta
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

                if (nameError) {
                  setNameError("");
                }
              }}
              placeholder="Ex: Conta Corrente Itaú"
              aria-invalid={Boolean(nameError)}
              aria-describedby={nameError ? nameErrorId : undefined}
              className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-1 ${
                nameError
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-300 focus:border-[#4F26E9] focus:ring-[#4F26E9]"
              }`}
            />

            {nameError && (
              <p
                id={nameErrorId}
                role="alert"
                className="text-xs font-medium text-red-500"
              >
                {nameError}
              </p>
            )}
          </div>

          <AccountTypeSelect value={type} onChange={setType} />

          <CurrencyInput
            label="Saldo inicial"
            value={balance}
            onChange={setBalance}
          />

          <button
            type="submit"
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99]"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function CreateAccountModal({
  isOpen,
  onClose,
  onCreate,
}: CreateAccountModalProps) {
  if (!isOpen) {
    return null;
  }

  return <CreateAccountModalContent onClose={onClose} onCreate={onCreate} />;
}

export default CreateAccountModal;
