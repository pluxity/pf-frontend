import { cva } from "class-variance-authority";

export const textareaVariants = cva(
  "flex w-full rounded-md border border-border-default bg-white px-3 py-2 text-primary transition-colors placeholder:text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-disabled resize-none dark:border-dark-border-default dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:placeholder:text-dark-text-placeholder dark:focus:border-dark-border-focus dark:focus:ring-primary-500/20 dark:disabled:bg-dark-bg-tertiary dark:disabled:text-dark-text-muted",
  {
    variants: {
      textareaSize: {
        sm: "min-h-20 text-xs",
        md: "min-h-32 text-sm",
        lg: "min-h-40 text-base",
      },
    },
    defaultVariants: {
      textareaSize: "md",
    },
  }
);
