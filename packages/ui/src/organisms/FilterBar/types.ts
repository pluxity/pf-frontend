import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export interface FilterConfig<TValue = string> {
  key: string;
  label: string;
  options: { value: TValue; label: string }[];
}

export interface FilterState<TValue = string> {
  [key: string]: TValue[];
}

export interface FilterBarContextValue<TValue = string> {
  filters: FilterConfig<TValue>[];
  filterState: FilterState<TValue>;
  onFilterChange: (key: string, values: TValue[]) => void;
  onRemove: (key: string, value: TValue) => void;
  onClear: () => void;
  search: string;
  onSearchChange: (search: string) => void;
  disabled?: boolean;
}

export interface FilterBarProps<TValue = string> extends ComponentPropsWithoutRef<"div"> {
  filters: FilterConfig<TValue>[];
  filterState: FilterState<TValue>;
  onFilterStateChange: (state: FilterState<TValue>) => void;
  disabled?: boolean;
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarSearchProps extends ComponentPropsWithoutRef<"input"> {
  ref?: Ref<HTMLInputElement>;
}

export interface FilterGroupProps extends ComponentPropsWithoutRef<"div"> {
  ref?: Ref<HTMLDivElement>;
}

export interface FilterChipsProps extends ComponentPropsWithoutRef<"div"> {
  showCategory?: boolean;
  ref?: Ref<HTMLDivElement>;
}

export interface FilterBarClearProps extends ComponentPropsWithoutRef<"button"> {
  ref?: Ref<HTMLButtonElement>;
}
