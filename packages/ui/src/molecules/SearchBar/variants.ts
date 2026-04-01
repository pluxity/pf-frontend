import { cva } from "class-variance-authority";

export const searchBarVariants = cva(
  "flex items-center gap-2 rounded-lg border border-border-default bg-white transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 dark:border-dark-border-default dark:bg-dark-bg-secondary dark:text-dark-text-primary dark:placeholder:text-dark-text-placeholder dark:focus-within:border-dark-border-focus dark:focus-within:ring-primary-500/20",
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-base",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
