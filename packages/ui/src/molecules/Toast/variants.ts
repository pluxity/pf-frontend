import { cva } from "class-variance-authority";

export const toastVariants = cva(
  "relative flex items-center gap-3 rounded-md border p-4 pr-10 shadow-lg",
  {
    variants: {
      variant: {
        default: "bg-white border-border-light text-text-primary",
        success: "bg-alert-success-bg border-success-brand text-gray-800",
        error: "bg-alert-error-bg border-error-brand text-gray-800",
        warning: "bg-alert-warning-bg border-warning-brand text-gray-800",
        info: "bg-alert-info-bg border-info-500 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
