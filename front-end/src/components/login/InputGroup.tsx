import { useId, useState, type InputHTMLAttributes } from "react";

import { Eye, EyeOff } from "lucide-react";

type InputGroupProps = {
  label: string;
  type?: InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  toggleVisibility?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "className" | "id" | "children"
>;

function InputGroup({
  label,
  type = "text",
  placeholder,
  toggleVisibility = false,
  ...inputProps
}: InputGroupProps) {
  const id = useId();
  const [isVisible, setIsVisible] = useState(false);

  const inputType = toggleVisibility && isVisible ? "text" : type;

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
          className="h-11 w-full rounded-lg border border-slate-900 bg-white px-3.5 text-sm text-slate-900 transition outline-none placeholder:text-slate-400 focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9]"
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
    </div>
  );
}

export default InputGroup;
