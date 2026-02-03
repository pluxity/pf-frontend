import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "flex w-full rounded-md border border-border-default bg-white px-3 text-text-primary transition-colors placeholder:text-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-text-disabled dark:border-dark-border-default dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:placeholder:text-dark-text-placeholder dark:focus:border-dark-border-focus dark:focus:ring-primary-500/20 dark:disabled:bg-dark-bg-tertiary dark:disabled:text-dark-text-muted",
  {
    variants: {
      inputSize: {
        sm: "h-8 text-xs",
        md: "h-10 text-sm",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: {
      inputSize: "md",
    },
  }
);
