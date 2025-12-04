import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "flex w-full rounded-md border border-border-default bg-white px-3 text-text-primary transition-colors placeholder:text-text-placeholder focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-text-disabled",
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
