import type { ButtonHTMLAttributes, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./variants";

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  ref?: Ref<HTMLButtonElement>;
}
