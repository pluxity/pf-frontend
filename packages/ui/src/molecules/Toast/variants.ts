import { cva } from "class-variance-authority";

export const toastVariants = cva(
  "relative flex items-center gap-3 rounded-md border p-4 pr-10 shadow-lg",
  {
    variants: {
      variant: {
        default:
          "bg-white border-border-light text-text-primary dark:bg-dark-bg-card dark:border-dark-border-light dark:text-dark-text-primary",
        success:
          "bg-alert-success-bg border-success-brand text-gray-800 dark:bg-success-900 dark:border-success-600 dark:text-success-100",
        error:
          "bg-alert-error-bg border-error-brand text-gray-800 dark:bg-error-900 dark:border-error-600 dark:text-error-100",
        warning:
          "bg-alert-warning-bg border-warning-brand text-gray-800 dark:bg-warning-900 dark:border-warning-600 dark:text-warning-100",
        info: "bg-alert-info-bg border-info-500 text-gray-800 dark:bg-info-900 dark:border-info-600 dark:text-info-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
