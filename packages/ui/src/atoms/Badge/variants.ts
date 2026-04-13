import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-50 text-secondary dark:bg-neutral-800 dark:text-dark-text-secondary",
        primary: "bg-brand text-white dark:bg-primary-600",
        success: "bg-success-brand text-white dark:bg-success-600",
        warning: "bg-warning-brand text-white dark:bg-warning-600",
        error: "bg-error-brand text-white dark:bg-error-600",
        outline:
          "border border-border-default bg-transparent text-secondary dark:border-dark-border-default dark:text-dark-text-muted",
        "severity-normal":
          "bg-severity-normal-100 text-severity-normal-700 dark:bg-severity-normal-900 dark:text-severity-normal-300",
        "severity-caution":
          "bg-severity-caution-100 text-severity-caution-700 dark:bg-severity-caution-900 dark:text-severity-caution-300",
        "severity-warning":
          "bg-severity-warning-100 text-severity-warning-700 dark:bg-severity-warning-900 dark:text-severity-warning-300",
        "severity-danger":
          "bg-severity-danger-100 text-severity-danger-700 dark:bg-severity-danger-900 dark:text-severity-danger-300",
        custom: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
