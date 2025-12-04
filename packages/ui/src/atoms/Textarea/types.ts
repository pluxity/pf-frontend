import type { TextareaHTMLAttributes, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import type { textareaVariants } from "./variants";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}
