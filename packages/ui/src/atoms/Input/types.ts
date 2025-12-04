import type { InputHTMLAttributes, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import type { inputVariants } from "./variants";

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  ref?: Ref<HTMLInputElement>;
}
