import type { ComponentPropsWithoutRef } from "react";
import type { VariantProps } from "class-variance-authority";
import type * as ToastPrimitives from "@radix-ui/react-toast";
import type { toastVariants } from "./variants";

export interface ToastProps
  extends ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    VariantProps<typeof toastVariants> {}

export type { ToastData } from "./useToast";
