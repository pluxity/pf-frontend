import type { HTMLAttributes, Ref } from "react";
import type { VariantProps } from "class-variance-authority";
import { skeletonVariants } from "./variants";

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
  ref?: Ref<HTMLDivElement>;
}
