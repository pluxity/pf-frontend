import type { HTMLAttributes, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import { spinnerVariants } from "./variants";

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof spinnerVariants> {
  ref?: Ref<HTMLDivElement>;
}
