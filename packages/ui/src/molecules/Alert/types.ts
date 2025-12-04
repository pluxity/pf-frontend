import type { HTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import type { alertVariants } from "./variants";

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: boolean;
}

export type AlertTitleProps = HTMLAttributes<HTMLHeadingElement>;
export type AlertDescriptionProps = HTMLAttributes<HTMLParagraphElement>;
