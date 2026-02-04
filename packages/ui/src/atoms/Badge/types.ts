import type { HTMLAttributes, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import type { badgeVariants } from "./variants";

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  ref?: Ref<HTMLSpanElement>;
}
