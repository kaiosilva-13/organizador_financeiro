import { useId, useState, type InputHTMLAttributes } from "react";

import { Eye, EyeOff } from "lucide-react";

type InputProps = {
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  toggleVisibility?: boolean;
  errorMessage?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "id" | "children"
>;

function Input({
  label,
  type = "text",
  placeholder,
  toggleVisibility = false,
  errorMessage,
  ...inputProps
}: InputProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  const inputType = toggleVisibility && isVisible ? "text" : type;
  const hasError = Boolean(errorMessage);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </label>

      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={inputType}
          placeholder={placeholder}
          aria-invalid={hasError}
          className={`h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:ring-1 ${
            hasError
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-slate-900 focus:border-[#4F26E9] focus:ring-[#4F26E9]"
          }`}
        />

        {toggleVisibility && (
          <button
            type="button"
            onClick={() => setIsVisible((visible) => !visible)}
            aria-label={isVisible ? "Ocultar senha" : "Mostrar senha"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-600 transition hover:text-slate-900"
          >
            {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {hasError && (
        <p role="alert" className="text-xs font-medium text-red-500">
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default Input;
