import { cva } from "class-variance-authority";

export const toastVariants = cva(
  "relative flex items-center gap-3 rounded-md border p-4 pr-10 shadow-lg",
  {
    variants: {
      variant: {
        default:
          "bg-white border-border-light text-primary dark:bg-dark-bg-card dark:border-dark-border-light dark:text-dark-text-primary",
        success:
          "bg-alert-success-bg border-success-brand text-primary dark:bg-success-900 dark:border-success-600 dark:text-success-100",
        error:
          "bg-alert-error-bg border-error-brand text-primary dark:bg-error-900 dark:border-error-600 dark:text-error-100",
        warning:
          "bg-alert-warning-bg border-warning-brand text-primary dark:bg-warning-900 dark:border-warning-600 dark:text-warning-100",
        info: "bg-alert-info-bg border-info-500 text-primary dark:bg-info-900 dark:border-info-600 dark:text-info-100",
        "severity-normal":
          "bg-severity-normal-50 border-severity-normal-500 text-primary dark:bg-severity-normal-900 dark:border-severity-normal-600 dark:text-severity-normal-100",
        "severity-caution":
          "bg-severity-caution-50 border-severity-caution-500 text-primary dark:bg-severity-caution-900 dark:border-severity-caution-600 dark:text-severity-caution-100",
        "severity-warning":
          "bg-severity-warning-50 border-severity-warning-500 text-primary dark:bg-severity-warning-900 dark:border-severity-warning-600 dark:text-severity-warning-100",
        "severity-danger":
          "bg-severity-danger-50 border-severity-danger-500 text-primary dark:bg-severity-danger-900 dark:border-severity-danger-600 dark:text-severity-danger-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
