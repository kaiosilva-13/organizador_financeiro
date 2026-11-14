import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { X } from "lucide-react";

type ModalShellProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  onClose: () => void;
  children: ReactNode;
};

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
} as const;

/**
 * Estrutura compartilhada das modais do módulo de Gastos Fixos.
 *
 * Centraliza o portal, o bloqueio do scroll, o fechamento por Escape, a
 * restauração de foco e os estilos de cabeçalho/backdrop. Os formulários e
 * tabelas específicos ficam nos componentes que utilizam este shell.
 */
function ModalShell({
  isOpen,
  title,
  description,
  icon,
  size = "md",
  onClose,
  children,
}: ModalShellProps) {
  const titleId = useId();
  const descriptionId = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousBodyOverflow;
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
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
        aria-describedby={description ? descriptionId : undefined}
        className={`relative max-h-[calc(100svh-2rem)] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-7 ${sizeClasses[size]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            {icon && (
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-[#4F26E9]">
                {icon}
              </span>
            )}

            <div className="min-w-0">
              <h2
                id={titleId}
                className="text-xl font-bold tracking-tight text-[#0B0B45]"
              >
                {title}
              </h2>

              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                  {description}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="-mt-1 -mr-1 shrink-0 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}

export default ModalShell;
