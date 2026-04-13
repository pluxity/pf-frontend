import { cva } from "class-variance-authority";

export const alertVariants = cva("relative w-full rounded-md border p-4", {
  variants: {
    variant: {
      default:
        "bg-neutral-50 border-neutral-200 text-primary [&>svg]:text-neutral-600 dark:bg-dark-bg-tertiary dark:border-dark-border-default dark:text-dark-text-primary [&>svg]:dark:text-neutral-400",
      info: "bg-alert-info-bg border-info-500 text-primary [&>svg]:text-info-500 [&_.alert-title]:text-info-500 dark:bg-info-900 dark:border-info-600 dark:text-info-100 [&>svg]:dark:text-info-400 [&_.alert-title]:dark:text-info-400",
      success:
        "bg-alert-success-bg border-success-brand text-primary [&>svg]:text-success-brand [&_.alert-title]:text-success-brand dark:bg-success-900 dark:border-success-600 dark:text-success-100 [&>svg]:dark:text-success-400 [&_.alert-title]:dark:text-success-400",
      warning:
        "bg-alert-warning-bg border-warning-brand text-primary [&>svg]:text-warning-brand [&_.alert-title]:text-warning-brand dark:bg-warning-900 dark:border-warning-600 dark:text-warning-100 [&>svg]:dark:text-warning-400 [&_.alert-title]:dark:text-warning-400",
      error:
        "bg-alert-error-bg border-error-brand text-primary [&>svg]:text-error-brand [&_.alert-title]:text-error-brand dark:bg-error-900 dark:border-error-600 dark:text-error-100 [&>svg]:dark:text-error-400 [&_.alert-title]:dark:text-error-400",
      "severity-normal":
        "bg-severity-normal-50 border-severity-normal-500 text-primary [&>svg]:text-severity-normal-500 [&_.alert-title]:text-severity-normal-700 dark:bg-severity-normal-900 dark:border-severity-normal-600 dark:text-severity-normal-100 [&>svg]:dark:text-severity-normal-400 [&_.alert-title]:dark:text-severity-normal-400",
      "severity-caution":
        "bg-severity-caution-50 border-severity-caution-500 text-primary [&>svg]:text-severity-caution-500 [&_.alert-title]:text-severity-caution-700 dark:bg-severity-caution-900 dark:border-severity-caution-600 dark:text-severity-caution-100 [&>svg]:dark:text-severity-caution-400 [&_.alert-title]:dark:text-severity-caution-400",
      "severity-warning":
        "bg-severity-warning-50 border-severity-warning-500 text-primary [&>svg]:text-severity-warning-500 [&_.alert-title]:text-severity-warning-700 dark:bg-severity-warning-900 dark:border-severity-warning-600 dark:text-severity-warning-100 [&>svg]:dark:text-severity-warning-400 [&_.alert-title]:dark:text-severity-warning-400",
      "severity-danger":
        "bg-severity-danger-50 border-severity-danger-500 text-primary [&>svg]:text-severity-danger-500 [&_.alert-title]:text-severity-danger-700 dark:bg-severity-danger-900 dark:border-severity-danger-600 dark:text-severity-danger-100 [&>svg]:dark:text-severity-danger-400 [&_.alert-title]:dark:text-severity-danger-400",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});
