import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=on]:bg-brand data-[state=on]:text-white data-[state=on]:hover:bg-brand-hover dark:hover:bg-dark-bg-hover dark:data-[state=on]:bg-primary-600 dark:data-[state=on]:hover:bg-primary-700",
  {
    variants: {
      variant: {
        default: "bg-neutral-50 text-secondary dark:bg-neutral-800 dark:text-dark-text-secondary",
        outline:
          "border border-border-default bg-transparent hover:bg-neutral-50 dark:border-dark-border-default dark:hover:bg-dark-bg-hover",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-9 px-4 text-sm",
        lg: "h-10 px-5 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
