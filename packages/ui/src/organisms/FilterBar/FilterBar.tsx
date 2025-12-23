import { createContext, useCallback, useContext, useMemo, useState, type JSX } from "react";
import { Search } from "../../atoms/Icon";
import { FilterChip, FilterChipGroup } from "../../molecules/FilterChip";
import { cn } from "../../utils";
import type {
  FilterBarClearProps,
  FilterBarContextValue,
  FilterBarProps,
  FilterBarSearchProps,
  FilterChipsProps,
  FilterGroupProps,
  FilterState,
} from "./types";

const FilterBarContext = createContext<FilterBarContextValue<unknown> | null>(null);

function useFilterBar<TValue = string>() {
  const context = useContext(FilterBarContext);
  if (!context) {
    throw new Error("FilterBar components must be used within a FilterBar");
  }
  return context as FilterBarContextValue<TValue>;
}

function FilterBarRoot<TValue = string>({
  filters,
  filterState,
  onFilterStateChange,
  disabled,
  className,
  children,
  ref,
  ...props
}: FilterBarProps<TValue>) {
  const [search, setSearch] = useState("");

  const onFilterChange = useCallback(
    (key: string, values: TValue[]) => {
      onFilterStateChange({
        ...filterState,
        [key]: values,
      } as FilterState<TValue>);
    },
    [filterState, onFilterStateChange]
  );

  const onRemove = useCallback(
    (key: string, value: TValue) => {
      const current = filterState[key] || [];
      onFilterStateChange({
        ...filterState,
        [key]: current.filter((v) => v !== value),
      } as FilterState<TValue>);
    },
    [filterState, onFilterStateChange]
  );

  const onClear = useCallback(() => {
    const emptyState = Object.keys(filterState).reduce(
      (acc, key) => ({ ...acc, [key]: [] }),
      {} as FilterState<TValue>
    );
    onFilterStateChange(emptyState);
  }, [filterState, onFilterStateChange]);

  const contextValue = useMemo(
    () => ({
      filters,
      filterState,
      onFilterChange: onFilterChange as (key: string, values: unknown[]) => void,
      onRemove: onRemove as (key: string, value: unknown) => void,
      onClear,
      search,
      onSearchChange: setSearch,
      disabled,
    }),
    [filters, filterState, onFilterChange, onRemove, onClear, search, disabled]
  );

  return (
    <FilterBarContext.Provider value={contextValue}>
      <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props}>
        {children}
      </div>
    </FilterBarContext.Provider>
  );
}

function FilterBarSearch({
  className,
  placeholder = "Search...",
  ref,
  ...props
}: FilterBarSearchProps) {
  const { search, onSearchChange, disabled } = useFilterBar();

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3",
        disabled && "opacity-50",
        className
      )}
    >
      <Search size="sm" className="text-gray-400" />
      <input
        ref={ref}
        type="text"
        className="flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed"
        placeholder={placeholder}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}

function FilterGroup({ className, children, ref, ...props }: FilterGroupProps) {
  return (
    <div ref={ref} className={cn("flex flex-wrap items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
}

function FilterChips({ className, showCategory = true, ref, ...props }: FilterChipsProps) {
  const { filters, filterState, onRemove, disabled } = useFilterBar();

  const selectedItems = useMemo(() => {
    const items: { key: string; value: unknown; label: string; category: string }[] = [];

    filters.forEach((filter) => {
      const values = filterState[filter.key] || [];
      values.forEach((value) => {
        const option = filter.options.find((opt) => opt.value === value);
        if (option) {
          items.push({
            key: filter.key,
            value,
            label: option.label,
            category: filter.label,
          });
        }
      });
    });

    return items;
  }, [filters, filterState]);

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <FilterChipGroup ref={ref} className={className} {...props}>
      {selectedItems.map((item) => (
        <FilterChip
          key={`${item.key}-${String(item.value)}`}
          selected
          removable
          category={showCategory ? item.category : undefined}
          disabled={disabled}
          onRemove={() => onRemove(item.key, item.value)}
        >
          {item.label}
        </FilterChip>
      ))}
    </FilterChipGroup>
  );
}

function FilterBarClear({ className, children = "Clear all", ref, ...props }: FilterBarClearProps) {
  const { filterState, onClear, disabled } = useFilterBar();

  const hasFilters = Object.values(filterState).some((values) => values.length > 0);

  if (!hasFilters) {
    return null;
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClear}
      disabled={disabled}
      className={cn(
        "cursor-pointer text-sm text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const FilterBar = FilterBarRoot as <TValue = string>(props: FilterBarProps<TValue>) => JSX.Element;

export { FilterBar, FilterBarSearch, FilterGroup, FilterChips, FilterBarClear, useFilterBar };
