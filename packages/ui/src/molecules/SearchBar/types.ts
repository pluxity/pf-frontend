import type { InputHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { searchBarVariants } from "./variants";

export interface SearchBarProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof searchBarVariants> {
  onSearch?: (value: string) => void;
  onClear?: () => void;
  loading?: boolean;
}
