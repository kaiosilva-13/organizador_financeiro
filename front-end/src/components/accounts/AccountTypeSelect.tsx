import { useId } from "react";

import { ChevronDown } from "lucide-react";

import { ACCOUNT_TYPES, type AccountType } from "../../types/account";

type AccountTypeSelectProps = {
  value: AccountType;
  onChange: (value: AccountType) => void;
  label?: string;
  name?: string;
};

/**
 * Select nativo com os tipos de conta pré-definidos.
 * Mantemos um `<select>` nativo para preservar acessibilidade e o
 * comportamento nativo de teclado/mobile.
 */
function AccountTypeSelect({
  value,
  onChange,
  label = "Tipo da conta",
  name = "accountType",
}: AccountTypeSelectProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-900">
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value as AccountType)}
          className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9]"
        >
          {ACCOUNT_TYPES.map((accountType) => (
            <option key={accountType} value={accountType}>
              {accountType}
            </option>
          ))}
        </select>

        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

export default AccountTypeSelect;
