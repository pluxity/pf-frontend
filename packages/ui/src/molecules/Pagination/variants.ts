import { cva } from "class-variance-authority";

export const paginationItemVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 disabled:pointer-events-none disabled:opacity-50 dark:text-dark-text-secondary",
  {
    variants: {
      variant: {
        default: "hover:bg-neutral-100 dark:hover:bg-dark-bg-hover",
        outline:
          "border border-border-default hover:bg-neutral-100 dark:border-dark-border-default dark:hover:bg-dark-bg-hover",
      },
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
