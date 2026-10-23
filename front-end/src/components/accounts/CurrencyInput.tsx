import { useId } from "react";

import { formatCurrency, parseCurrencyInput } from "../../lib/currency";

type CurrencyInputProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  name?: string;
  errorMessage?: string;
};

/**
 * Input monetário controlado.
 *
 * O valor é armazenado como número (ex.: 1250) e exibido no formato brasileiro
 * (ex.: "R$ 1.250,00"). A cada digitação, apenas os dígitos são considerados e
 * a máscara é reaplicada.
 */
function CurrencyInput({
  label,
  value,
  onChange,
  name = "balance",
  errorMessage,
}: CurrencyInputProps) {
  const id = useId();
  const hasError = Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </label>

      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatCurrency(value)}
        onChange={(event) => onChange(parseCurrencyInput(event.target.value))}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-1 ${
          hasError
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-[#4F26E9] focus:ring-[#4F26E9]"
        }`}
      />

      {hasError && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default CurrencyInput;
