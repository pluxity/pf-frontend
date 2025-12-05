import { cva } from "class-variance-authority";

export const alertVariants = cva("relative w-full rounded-md border p-4", {
  variants: {
    variant: {
      default: "bg-gray-50 border-gray-200 text-gray-900 [&>svg]:text-gray-600",
      info: "bg-alert-info-bg border-info-500 text-gray-800 [&>svg]:text-info-500 [&_.alert-title]:text-info-500",
      success:
        "bg-alert-success-bg border-success-brand text-gray-800 [&>svg]:text-success-brand [&_.alert-title]:text-success-brand",
      warning:
        "bg-alert-warning-bg border-warning-brand text-gray-800 [&>svg]:text-warning-brand [&_.alert-title]:text-warning-brand",
      error:
        "bg-alert-error-bg border-error-brand text-gray-800 [&>svg]:text-error-brand [&_.alert-title]:text-error-brand",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
