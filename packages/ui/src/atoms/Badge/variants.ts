import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full px-3 py-0.5 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-50 text-text-secondary dark:bg-gray-800 dark:text-gray-100",
        primary: "bg-brand text-white dark:bg-primary-600",
        success: "bg-success-brand text-white dark:bg-success-600",
        warning: "bg-warning-brand text-white dark:bg-warning-600",
        error: "bg-error-brand text-white dark:bg-error-600",
        outline:
          "border border-border-default bg-transparent text-text-secondary dark:border-dark-border-default dark:text-dark-text-secondary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);
