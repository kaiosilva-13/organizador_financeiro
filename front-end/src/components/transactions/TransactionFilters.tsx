import {
  CalendarDays,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import type {
  TransactionCategory,
  TransactionFilterValues,
} from "../../types/transaction";

type TransactionFiltersProps = {
  values: TransactionFilterValues;
  categories: TransactionCategory[];
  hasActiveFilters: boolean;
  onChange: (field: keyof TransactionFilterValues, value: string) => void;
  onClear: () => void;
};

const inputClasses =
  "h-11 w-full rounded-lg border border-slate-300 bg-white text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#4F26E9] focus:ring-1 focus:ring-[#4F26E9]";

const labelClasses = "text-xs font-semibold text-slate-600";

function sanitizeAmount(value: string) {
  return value.replace(/[^\d.,]/g, "");
}

function TransactionFilters({
  values,
  categories,
  hasActiveFilters,
  onChange,
  onClear,
}: TransactionFiltersProps) {
  return (
    <section
      aria-labelledby="transactions-filters-heading"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-[#4F26E9]">
            <SlidersHorizontal size={17} aria-hidden="true" />
          </span>

          <div>
            <h2
              id="transactions-filters-heading"
              className="text-sm font-bold text-slate-900"
            >
              Filtrar movimentações
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Refine a listagem por título, período, valor ou categoria.
            </p>
          </div>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Limpar filtros
          </button>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(2,minmax(0,1fr))_repeat(2,minmax(0,0.9fr))_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
          <label htmlFor="transaction-filter-search" className={labelClasses}>
            Buscar por título
          </label>

          <div className="relative">
            <Search
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />

            <input
              id="transaction-filter-search"
              type="text"
              value={values.search}
              onChange={(event) => onChange("search", event.target.value)}
              placeholder="Digite o título..."
              autoComplete="off"
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="transaction-filter-start" className={labelClasses}>
            Data inicial
          </label>

          <div className="relative">
            <CalendarDays
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />

            <input
              id="transaction-filter-start"
              type="date"
              value={values.startDate}
              max={values.endDate || undefined}
              onChange={(event) => onChange("startDate", event.target.value)}
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="transaction-filter-end" className={labelClasses}>
            Data final
          </label>

          <div className="relative">
            <CalendarDays
              size={16}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400"
            />

            <input
              id="transaction-filter-end"
              type="date"
              value={values.endDate}
              min={values.startDate || undefined}
              onChange={(event) => onChange("endDate", event.target.value)}
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="transaction-filter-min" className={labelClasses}>
            Valor mínimo
          </label>

          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-semibold text-slate-400"
            >
              R$
            </span>

            <input
              id="transaction-filter-min"
              type="text"
              inputMode="decimal"
              value={values.minAmount}
              onChange={(event) =>
                onChange("minAmount", sanitizeAmount(event.target.value))
              }
              placeholder="0,00"
              autoComplete="off"
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="transaction-filter-max" className={labelClasses}>
            Valor máximo
          </label>

          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-xs font-semibold text-slate-400"
            >
              R$
            </span>

            <input
              id="transaction-filter-max"
              type="text"
              inputMode="decimal"
              value={values.maxAmount}
              onChange={(event) =>
                onChange("maxAmount", sanitizeAmount(event.target.value))
              }
              placeholder="0,00"
              autoComplete="off"
              className={`${inputClasses} pl-10`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2 xl:col-span-1">
          <label htmlFor="transaction-filter-category" className={labelClasses}>
            Categoria
          </label>

          <div className="relative">
            <select
              id="transaction-filter-category"
              value={values.categoryId}
              onChange={(event) => onChange("categoryId", event.target.value)}
              className={`${inputClasses} appearance-none pr-9 pl-3.5`}
            >
              <option value="">Todas as categorias</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <ChevronDown
              size={17}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default TransactionFilters;
