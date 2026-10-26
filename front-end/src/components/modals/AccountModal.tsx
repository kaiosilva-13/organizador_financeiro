import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";

import { X } from "lucide-react";

import AccountTypeSelect from "../accounts/AccountTypeSelect";
import CurrencyInput from "../accounts/CurrencyInput";
import type {
  Account,
  AccountType,
  NewAccountInput,
} from "../../types/account";

type AccountModalProps = {
  isOpen: boolean;
  /**
   * Conta em edição. Quando ausente, a modal entra no modo de cadastro.
   * Este mesmo componente atende os dois fluxos para evitar duplicação.
   */
  account?: Account | null;
  onClose: () => void;
  onSubmit: (account: NewAccountInput) => void | Promise<void>;
};

type AccountModalContentProps = Omit<AccountModalProps, "isOpen">;

/**
 * Conteúdo interno da modal.
 *
 * Ele só é montado quando a modal está aberta. Assim, o formulário sempre
 * começa com os valores corretos ao reabrir e os efeitos de foco/bloqueio de
 * scroll são automaticamente removidos ao fechar.
 */
function AccountModalContent({
  account,
  onClose,
  onSubmit,
}: AccountModalContentProps) {
  const isEditing = Boolean(account);

  const titleId = useId();
  const descriptionId = useId();
  const nameId = useId();
  const nameErrorId = useId();

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Em modo de edição, os campos já começam preenchidos com a conta ativa.
  const [name, setName] = useState(account?.name ?? "");
  const [type, setType] = useState<AccountType>(
    account?.type ?? "Conta Corrente",
  );
  const [balance, setBalance] = useState(account?.balance ?? 0);
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

  
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const trimmedName = name.trim();

  if (!trimmedName) {
    setNameError("Informe o nome da conta.");
    return;
  }

  setNameError("");

  try {
    await onSubmit({
      name: trimmedName,
      type,
      balance,
    });
  } catch (error) {
    console.error("Erro ao enviar conta:", error);
  }
};


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
        aria-describedby={descriptionId}
        className="relative max-h-[calc(100svh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id={titleId}
              className="text-xl font-bold tracking-tight text-[#0B0B45]"
            >
              {isEditing ? "Editar Conta" : "Cadastrar Nova Conta"}
            </h2>

            <p id={descriptionId} className="mt-1 text-sm text-slate-500">
              {isEditing
                ? "Atualize as informações da conta selecionada."
                : "Preencha os dados para adicionar uma nova conta."}
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
            label={isEditing ? "Saldo atual" : "Saldo inicial"}
            value={balance}
            onChange={setBalance}
          />

          <button
            type="submit"
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#4F26E9] px-5 text-sm font-semibold text-white transition hover:bg-[#411DCB] active:scale-[0.99]"
          >
            {isEditing ? "Salvar alterações" : "Cadastrar"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}

function AccountModal({
  isOpen,
  account,
  onClose,
  onSubmit,
}: AccountModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AccountModalContent
      // Garante que o formulário seja reiniciado ao alternar entre contas.
      key={account?.id ?? "new-account"}
      account={account}
      onClose={onClose}
      onSubmit={onSubmit}
    />
  );
}

export default AccountModal;
